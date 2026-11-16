// 上傳／刪除 R2 上的私服備份圖。需要 R2 綁定：OUTFIT_BUCKET（指向 hinata-collection）
const KEY_RE = /^outfit\/(ig|blog)\/(kato|kumi)\/\d{4}\/[\w-]+\/\d{2}\.jpg$/;
const PREFIX_RE = /^outfit\/(ig|blog)\/(kato|kumi)\/\d{4}\/[\w-]+\/$/;

export async function onRequestPut({ request, env }) {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!KEY_RE.test(key)) return Response.json({ ok: false, error: '檔名格式不對' }, { status: 400 });
  const len = +request.headers.get('content-length') || 0;
  if (len > 15 * 1024 * 1024) return Response.json({ ok: false, error: '檔案太大' }, { status: 413 });
  await env.OUTFIT_BUCKET.put(key, request.body, { httpMetadata: { contentType: 'image/jpeg' } });
  return Response.json({ ok: true, key });
}

// 刪掉一整個資料夾裡的圖（重新放入整組圖之前用）
export async function onRequestDelete({ request, env }) {
  const prefix = new URL(request.url).searchParams.get('prefix') || '';
  if (!PREFIX_RE.test(prefix)) return Response.json({ ok: false, error: '資料夾格式不對' }, { status: 400 });
  let cursor, n = 0;
  do {
    const list = await env.OUTFIT_BUCKET.list({ prefix, cursor });
    const keys = list.objects.map((o) => o.key);
    if (keys.length) { await env.OUTFIT_BUCKET.delete(keys); n += keys.length; }
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);
  return Response.json({ ok: true, deleted: n });
}
