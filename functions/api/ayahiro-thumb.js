// 暫時用：把舊 Google 協作平台「彩弘祭典」頁上的花絮封面搬到 R2（hinata-collection）。
// 只寫入 ayahiro2/huaxu/ 底下的 jpg、而且不覆蓋已存在的檔案。搬完就會刪掉這支檔案。
const KEY_RE = /^ayahiro2\/huaxu\/\d{8}-\d\.jpg$/;
const CORS = { 'Access-Control-Allow-Origin': 'https://sites.google.com' };
const J = (o, s = 200) => Response.json(o, { status: s, headers: CORS });

export async function onRequestPost({ request, env }) {
  const buf = await request.arrayBuffer();
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!env.OUTFIT_BUCKET) return J({ ok: false, error: 'no bucket' }, 503);
  if (!KEY_RE.test(key)) return J({ ok: false, error: 'bad key' }, 400);
  const b = new Uint8Array(buf);
  if (b.length < 1000 || b.length > 5 * 1024 * 1024 || b[0] !== 0xff || b[1] !== 0xd8) return J({ ok: false, error: 'not jpeg' }, 400);
  if (await env.OUTFIT_BUCKET.head(key)) return J({ ok: true, key, skipped: true });
  await env.OUTFIT_BUCKET.put(key, buf, { httpMetadata: { contentType: 'image/jpeg' } });
  return J({ ok: true, key, bytes: b.length });
}
