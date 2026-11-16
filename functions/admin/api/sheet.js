// 透過 Apps Script 讀寫試算表「私服穿搭」分頁。
// 需要環境變數：APPS_SCRIPT_URL（部署後的 /exec 網址）、APPS_SCRIPT_SECRET
function need(env) {
  if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_SECRET) {
    return Response.json({ ok: false, error: '還沒設定 APPS_SCRIPT_URL / APPS_SCRIPT_SECRET' }, { status: 503 });
  }
  return null;
}
async function relay(r) {
  const t = await r.text();
  try { return Response.json(JSON.parse(t)); }
  catch (e) { return Response.json({ ok: false, error: 'Apps Script 回應不是 JSON，請確認部署設定' }, { status: 502 }); }
}

export async function onRequestGet({ env }) {
  const bad = need(env); if (bad) return bad;
  const u = env.APPS_SCRIPT_URL + '?secret=' + encodeURIComponent(env.APPS_SCRIPT_SECRET) + '&t=' + Date.now();
  return relay(await fetch(u, { redirect: 'follow' }));
}

export async function onRequestPost({ request, env }) {
  const bad = need(env); if (bad) return bad;
  const body = await request.json();
  body.secret = env.APPS_SCRIPT_SECRET;
  return relay(await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST', redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  }));
}
