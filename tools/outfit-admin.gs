/**
 * 私服穿搭後台用的 Apps Script（貼在「行程」那份試算表的 擴充功能 → Apps Script）
 * 部署成「網頁應用程式」：執行身分＝我、存取權＝所有人。
 * SECRET 換成一串只有妳知道的亂碼，並把同一串填進 Cloudflare Pages 的環境變數 APPS_SCRIPT_SECRET。
 */
const SECRET = '把這裡換成一串亂碼';
const SHEET_NAME = '私服穿搭';

const COLS = {
  who: /^人物/, date: /^日期/, link: /^IG|^連結/, seasons: /^季節/, note: /^備註/, thumb: /^縮圖/,
  src: /^來源/, caption: /^貼文文字/, n: /^張數/, folder: /^備份資料夾/, blink: /^備份來源/, show: /^顯示/
};

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet_() { return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME); }
function colMap_(header) {
  const m = {};
  Object.keys(COLS).forEach(function (k) {
    m[k] = header.findIndex(function (h) { return COLS[k].test(String(h).trim()); });
  });
  return m;
}
function igCode_(u) {
  const r = /instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i.exec(String(u || ''));
  return r ? r[1] : '';
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.secret !== SECRET) return out_({ ok: false, error: 'unauthorized' });
  const v = sheet_().getDataRange().getDisplayValues();
  return out_({ ok: true, header: v[0], rows: v.slice(1) });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (d.secret !== SECRET) return out_({ ok: false, error: 'unauthorized' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const all = sh.getDataRange().getDisplayValues();
    const m = colMap_(all[0]);
    const f = d.fields || {};

    // 找既有的列：先用指定列號，其次用 IG 貼文代碼，再來用備份資料夾
    let row = -1;
    if (d.row && d.row >= 2 && d.row <= all.length) row = d.row;
    const code = igCode_(f.link);
    for (let i = 1; row < 0 && i < all.length; i++) {
      if (code && m.link >= 0 && igCode_(all[i][m.link]) === code) row = i + 1;
      else if (f.folder && m.folder >= 0 && all[i][m.folder] === f.folder) row = i + 1;
    }
    if (row < 0) row = sh.getLastRow() + 1;

    Object.keys(f).forEach(function (k) {
      if (m[k] === undefined || m[k] < 0) return;
      const cell = sh.getRange(row, m[k] + 1);
      cell.setNumberFormat('@');
      cell.setValue(String(f[k] == null ? '' : f[k]));
    });
    return out_({ ok: true, row: row });
  } finally {
    lock.releaseLock();
  }
}
