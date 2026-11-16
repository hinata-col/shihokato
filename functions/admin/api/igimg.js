// 後台用：代抓 IG 圖片（只接受 Instagram 的圖片 CDN），讓後台可以直接從 IG 原圖備份到 R2。
// 跟其他 /admin/api 一樣受 Cloudflare Access 保護（_middleware.js）。
const HOST_RE = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/i;

export async function onRequestGet({ request }) {
  const u = new URL(request.url).searchParams.get('u') || '';
  let t;
  try { t = new URL(u); } catch (e) { return Response.json({ ok: false, error: '網址不對' }, { status: 400 }); }
  if (t.protocol !== 'https:' || !HOST_RE.test(t.hostname)) return Response.json({ ok: false, error: '只接受 IG 圖片網址' }, { status: 400 });
  const r = await fetch(t.toString(), { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/jpeg,image/*' } });
  if (!r.ok) return Response.json({ ok: false, error: 'IG 回應 ' + r.status }, { status: 502 });
  return new Response(r.body, { headers: { 'Content-Type': r.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'no-store' } });
}
