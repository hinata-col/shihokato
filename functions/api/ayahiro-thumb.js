// 暫時用：把舊 Google 協作平台「彩弘祭典」頁上的花絮封面搬到 R2（hinata-collection）。
// 只接受 sites.google.com 的圖片來源，只寫入 ayahiro2/huaxu/ 底下、而且不覆蓋已存在的檔案。
// 搬完就會刪掉這支檔案。
const KEY_RE = /^ayahiro2\/huaxu\/\d{8}-\d\.jpg$/;
const SRC_RE = /^https:\/\/sites\.google\.com\/sitesv-images-rt\/[\w-]+$/;

const CORS = { 'Access-Control-Allow-Origin': 'https://sites.google.com' };
const J = (o, s = 200) => Response.json(o, { status: s, headers: CORS });

export async function onRequestPost({ request, env }) {
  let body;
  try { body = JSON.parse(await request.text()); } catch (e) { return J({ ok: false, error: 'bad json' }, 400); }
  const { src, key } = body || {};
  if (!env.OUTFIT_BUCKET) return J({ ok: false, error: 'no bucket' }, 503);
  if (!KEY_RE.test(key || '')) return J({ ok: false, error: 'bad key' }, 400);
  if (!SRC_RE.test(src || '')) return J({ ok: false, error: 'bad src' }, 400);
  if (await env.OUTFIT_BUCKET.head(key)) return J({ ok: true, key, skipped: true });
  const r = await fetch(src + '=w720-rj', { redirect: 'follow' });
  if (!r.ok) return J({ ok: false, error: 'fetch ' + r.status }, 502);
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 1000 || buf.byteLength > 5 * 1024 * 1024) return J({ ok: false, error: 'size ' + buf.byteLength }, 502);
  await env.OUTFIT_BUCKET.put(key, buf, { httpMetadata: { contentType: 'image/jpeg' } });
  return J({ ok: true, key, bytes: buf.byteLength, type: r.headers.get('content-type') });
}
