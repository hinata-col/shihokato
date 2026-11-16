// 只讓通過 Cloudflare Access 登入的人呼叫後台 API。
// 需要環境變數：ACCESS_TEAM_DOMAIN（例：xxx.cloudflareaccess.com）、ACCESS_AUD（Access 應用程式的 AUD 標籤）
let certCache = { at: 0, keys: null };

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function getKeys(team) {
  if (certCache.keys && Date.now() - certCache.at < 3600e3) return certCache.keys;
  const r = await fetch('https://' + team + '/cdn-cgi/access/certs');
  const j = await r.json();
  certCache = { at: Date.now(), keys: j.keys || [] };
  return certCache.keys;
}
async function verify(token, env) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const head = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const body = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  const jwk = (await getKeys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === head.kid);
  if (!jwk) return false;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) return false;
  const aud = Array.isArray(body.aud) ? body.aud : [body.aud];
  if (!aud.includes(env.ACCESS_AUD)) return false;
  if (body.exp && body.exp * 1000 < Date.now()) return false;
  return true;
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return Response.json({ ok: false, error: '後台還沒設定登入鎖（ACCESS_TEAM_DOMAIN / ACCESS_AUD）' }, { status: 503 });
  }
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
  let ok = false;
  try { ok = token && (await verify(token, env)); } catch (e) { ok = false; }
  if (!ok) return Response.json({ ok: false, error: '沒有權限' }, { status: 403 });
  return ctx.next();
}
