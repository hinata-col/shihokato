// 暫時用：把舊 Google 協作平台「彩弘祭典」頁上的花絮封面搬到 R2（hinata-collection）。
// 只接受 sites.google.com 的圖片來源，只寫入 ayahiro2/huaxu/ 底下、而且不覆蓋已存在的檔案。
// 搬完就會刪掉這支檔案。
const KEY_RE = /^ayahiro2\/huaxu\/\d{8}-\d\.jpg$/;
const SRC_RE = /^https:\/\/sites\.google\.com\/sitesv-images-rt\/[\w-]+$/;

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ ok: false, error: 'bad json' }, { status: 400 }); }
  const { src, key } = body || {};
  if (!env.OUTFIT_BUCKET) return Response.json({ ok: false, error: 'no bucket' }, { status: 503 });
  if (!KEY_RE.test(key || '')) return Response.json({ ok: false, error: 'bad key' }, { status: 400 });
  if (!SRC_RE.test(src || '')) return Response.json({ ok: false, error: 'bad src' }, { status: 400 });
  if (await env.OUTFIT_BUCKET.head(key)) return Response.json({ ok: true, key, skipped: true });
  const r = await fetch(src + '=w720-rj', { redirect: 'follow' });
  if (!r.ok) return Response.json({ ok: false, error: 'fetch ' + r.status }, { status: 502 });
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 1000 || buf.byteLength > 5 * 1024 * 1024) return Response.json({ ok: false, error: 'size ' + buf.byteLength }, { status: 502 });
  await env.OUTFIT_BUCKET.put(key, buf, { httpMetadata: { contentType: 'image/jpeg' } });
  return Response.json({ ok: true, key, bytes: buf.byteLength, type: r.headers.get('content-type') });
}
