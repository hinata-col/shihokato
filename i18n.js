/* 中日文切換（介面文字）
   - 預設依瀏覽器語言判斷（日文→日文，其他→中文），手動切換後記住在 localStorage。
   - 做法：頁面原文是中文，切到日文時，把畫面上「整段文字完全相同」的中文換成日文（字典 D），
     帶數字的句子用規則（P）處理。試算表裡的內容（作品名、影片標題、備註…）不在字典裡就維持原樣。
   - 新增或修改翻譯：只要改下面的 D / P。字典的 key 是頁面上的中文原文，value 是日文。 */
(function () {
  'use strict';
  var KEY = 'shk-lang';

  /* ───────── 字典：完整文字比對 ───────── */
  var D = {
    /* 站名與頁面名稱 */
    '加藤史帆新手包': '加藤史帆 はじめてガイド',
    '首頁': 'ホーム',
    '基本資料': 'プロフィール',
    '作品': '作品',
    '各種歡樂': 'たのしい動画',
    '訪談報導': 'インタビュー',
    '彩弘祭典': 'あやひろ祭',
    '私服穿搭': '私服コーデ',
    '行程': '予定',
    '相關資源': '関連リンク',
    '關於本站': 'このサイトについて',
    '入坑懶人包': '入門まとめ',

    /* 首頁 */
    '下一個行程': '次の予定',
    '個人運營的非官方粉絲站，與加藤史帆本人、所屬事務所及相關公司無關。': '個人運営の非公式ファンサイトです。加藤史帆さん本人、所属事務所および関連会社とは一切関係ありません。',
    '加藤史帆非官方粉絲站，歡迎認識這位水瓶座外星人': '加藤史帆さんの非公式ファンサイト。みずがめ座の宇宙人をご紹介します',
    '貼紙簿第 1 頁': 'ステッカーブック 1ページ目',
    '貼紙簿第 2 頁': 'ステッカーブック 2ページ目',
    '翻開貼紙簿': 'ステッカーブックを開く',
    '上一頁': '前のページ',
    '下一頁': '次のページ',
    '頁面選單': 'ページメニュー',
    '展開頁面選單': 'メニューを開く',
    '收起頁面選單': 'メニューを閉じる',
    '今天': '今日',
    '明天': '明日',

    /* 子頁共用 */
    '回貼紙簿': 'ステッカーブックに戻る',
    '回到最上面': 'ページの先頭へ',
    '分區': 'セクション',
    '重新載入': '再読み込み',
    '關閉': '閉じる',
    '讀取中…': '読み込み中…',
    '讀取內容中…': '読み込み中…',
    '讀取影片中…': '動画を読み込み中…',
    '讀取訪談報導中…': '記事を読み込み中…',
    '讀取作品中…': '作品を読み込み中…',
    '還沒有內容，敬請期待。': 'まだコンテンツがありません。お楽しみに。',
    '還沒有影片，敬請期待。': 'まだ動画がありません。お楽しみに。',
    '目前還沒有訪談報導。': '記事はまだありません。',
    '目前還沒有作品資料。': '作品データはまだありません。',
    '目前還沒有資源連結。': 'リンクはまだありません。',
    '封面待補': 'カバー準備中',

    /* 彩弘祭典 */
    '《彩香最愛弘子前輩》的中字片段、訪談報導、S2業績與幕後花絮整理。': '『彩香ちゃんは弘子先輩に恋してる』の中国語字幕クリップ、インタビュー・記事、S2の実績、メイキング映像のまとめ。',
    'S2業績': 'S2の実績',
    'S2業績報告': 'S2の実績報告',
    'S2片頭曲／片尾曲中字版': 'S2 OP／ED 中国語字幕版',
    '主演': '主演',
    '彩弘花絮中字版': 'あやひろ裏話（中国語字幕版）',
    '片頭片尾曲': 'OP・ED',
    '精選連結': 'ピックアップ',
    '花絮': 'メイキング',
    '彩弘祭典資料讀取失敗': 'あやひろ祭のデータを読み込めませんでした',

    /* 各種歡樂 */
    '加藤史帆在綜藝、運動、才藝、現場與外出企劃中的影片整理。': '加藤史帆さんのバラエティ、スポーツ、特技、ライブ、お出かけ企画の動画まとめ。',
    '個人宣傳影片': '個人プロモーション動画',
    '其他': 'その他',
    '史史現場魅力': 'ライブでのかとし',
    '有才史史': '才能あふれるかとし',
    '綜藝史史': 'バラエティのかとし',
    '跟著史史出門玩': 'かとしとお出かけ',
    '運動史史': 'スポーツのかとし',
    '連結': 'リンク',
    '各種歡樂資料讀取失敗': 'たのしい動画のデータを読み込めませんでした',

    /* 訪談報導 */
    '加藤史帆的訪談與報導中文翻譯整理。': '加藤史帆さんのインタビュー・記事の中国語訳まとめ。',
    '訪談資料讀取失敗': 'インタビューのデータを読み込めませんでした',

    /* 作品 */
    '加藤史帆的影視、舞台、音樂、書籍與廣告作品整理。': '加藤史帆さんの映像、舞台、音楽、書籍、広告作品のまとめ。',
    '作品分類': '作品カテゴリ',
    '歌曲類型': '楽曲タイプ',
    'UNIT曲': 'ユニット曲',
    '一期生曲': '1期生曲',
    '全員曲': '全員曲',
    '公共廣告': '公共広告',
    '廣告': '広告',
    '影視': '映像',
    '音樂': '音楽',
    '書籍': '書籍',
    '舞台': '舞台',
    '役': '役',
    '飾': '役',
    '暫停': '一時停止',
    '無法播放': '再生できません',
    '30 秒試聽來自 iTunes，歌曲著作權屬於各權利人。': '30秒の試聴はiTunesより提供。楽曲の著作権は各権利者に帰属します。',
    '為加藤史帆擔任 Center 的歌曲': '加藤史帆さんがセンターを務めた楽曲',
    '作品資料讀取失敗': '作品データを読み込めませんでした',

    /* 行程 */
    '清單': 'リスト',
    '月曆': 'カレンダー',
    '時間皆為日本時間（JST），台灣比日本慢 1 小時': '時刻はすべて日本時間（JST）です',
    '檢視方式': '表示方法',
    '依分類篩選': 'カテゴリで絞り込み',
    '加藤史帆近期與過去的行程：影視、舞台、綜藝、雜誌、活動。': '加藤史帆さんの直近・過去の予定：映像、舞台、バラエティ、雑誌、イベント。',
    '綜藝': 'バラエティ',
    '廣播': 'ラジオ',
    '雜誌': '雑誌',
    '活動': 'イベント',
    '直播': '配信',
    '全天': '終日',
    '即將到來': '今後の予定',
    '隔天': '翌日',
    '上個月': '前の月',
    '下個月': '次の月',
    '過去的行程': '過去の予定',
    '這天沒有行程。': 'この日の予定はありません。',
    '沒有讀到任何行程': '予定を読み込めませんでした',
    '讀取試算表失敗，改用內建資料：': 'スプレッドシートを読み込めなかったため、内蔵データを表示しています：',
    '一': '月', '二': '火', '三': '水', '四': '木', '五': '金', '六': '土', '日': '日',

    /* 私服穿搭 */
    '加藤史帆、佐々木久美的私服穿搭整理，依今天氣溫挑選適合的季節穿搭。': '加藤史帆さん・佐々木久美さんの私服コーデまとめ。今日の気温に合わせて季節のコーデを選べます。',
    '隨機今日穿搭': 'ランダム今日のコーデ',
    '還沒設定城市': '都市が未設定です',
    '設定城市': '都市を設定',
    '按「設定城市」後，會依照城市目前季節推薦穿搭。': '「都市を設定」を押すと、その都市の今の季節に合わせたコーデをおすすめします。',
    '搜尋': '検索',
    '定位': '現在地',
    '搜尋城市': '都市を検索',
    '搜尋城市（台北、Tokyo…）': '都市を検索（台北、Tokyo…）',
    '使用目前位置': '現在地を使う',
    '抽誰的穿搭': '誰のコーデにする？',
    '全部': 'すべて',
    '今天穿什麼？轉一顆扭蛋': '今日は何を着る？ガチャを回そう',
    '轉！': '回す！',
    '今天抽到的是⋯⋯': '今日のコーデは……',
    '分享今日穿搭': '今日のコーデをシェア',
    '再抽一次': 'もう一度回す',
    '看原貼文': '元の投稿を見る',
    '在 Instagram 開啟': 'Instagramで開く',
    '下載圖卡': '画像カードを保存',
    '分享': 'シェア',
    '複製文案': '文章をコピー',
    '← 回到貼文': '← 投稿に戻る',
    'Instagram 貼文': 'Instagram投稿',
    '圖卡預覽': '画像カードのプレビュー',
    '你的位置': '現在地',
    '取得位置中…': '現在地を取得中…',
    '查詢今日氣溫中…': '今日の気温を確認中…',
    '暫時查不到氣溫，請稍後再試。': '気温を取得できませんでした。しばらくしてからもう一度お試しください。',
    '搜尋中…': '検索中…',
    '搜尋失敗，請稍後再試。': '検索に失敗しました。しばらくしてからもう一度お試しください。',
    '找不到這個地方，換個寫法試試（也可以用英文）。': '場所が見つかりません。別の書き方でお試しください（英語でもOK）。',
    '請輸入至少兩個字的城市名，例如「台北」「Tokyo」。': '2文字以上で都市名を入力してください（例：「台北」「Tokyo」）。',
    '直接輸入城市，例如「台中」。': '都市名をそのまま入力してください（例：「台中」）。',
    '請選擇：': '選んでください：',
    '這個瀏覽器不支援定位，請直接搜尋城市。': 'このブラウザは位置情報に対応していません。都市を検索してください。',
    '今天的穿搭推薦': '今日のコーデおすすめ',
    '圖卡做不出來（可能是 R2 的 CORS 還沒設好），仍然可以分享文案。': '画像カードを作成できませんでした。文章のシェアは引き続き可能です。',
    '圖卡製作中…': '画像カードを作成中…',
    '已下載': '保存しました',
    '已複製': 'コピーしました',
    '請長按文字複製': 'テキストを長押ししてコピーしてください',
    '這則還沒有 R2 縮圖，沒辦法製作圖卡，只能分享文案。': 'この投稿にはサムネイルがないため画像カードを作成できません。文章のみシェアできます。',
    '這個條件下還沒有穿搭，換個條件看看。': 'この条件のコーデはまだありません。条件を変えてみてください。',
    '顯示全部': 'すべて表示',
    '點開看貼文': 'タップして投稿を見る',
    '點開看': 'タップして見る',
    '上一張': '前の画像',
    '下一張': '次の画像',
    '部落格': 'ブログ',
    '季節': '季節',
    '人物': '人物',
    '年分': '年',
    '私服穿搭資料讀取失敗': '私服コーデのデータを読み込めませんでした',

    /* 相關資源 */
    '官方帳號、影片與翻譯資源，點開會在新分頁前往。': '公式アカウント、動画、翻訳リソースです。タップすると新しいタブで開きます。',
    '各網站內容屬於各權利人。': '各サイトのコンテンツは各権利者に帰属します。',
    '加藤史帆與日向坂46 的相關官方帳號，以及字幕組連結。': '加藤史帆さんと日向坂46の関連公式アカウント、字幕グループのリンク。',
    '個人': '個人',
    '字幕與翻譯': '字幕・翻訳',
    '官方Instagram': '公式Instagram',
    '官方TikTok': '公式TikTok',
    '官方YouTube（直播、Vlog）': '公式YouTube（配信・Vlog）',
    '官方YouTube（音樂）': '公式YouTube（音楽）',
    '加藤史帆官方Instagram': '加藤史帆 公式Instagram',
    '加藤史帆官方X': '加藤史帆 公式X',
    '加藤史帆官方網站': '加藤史帆 公式サイト',
    '加藤史帆粉絲俱樂部': '加藤史帆 ファンクラブ',
    '1st寫真集 官方TikTok': '1st写真集 公式TikTok',
    '1st寫真集 官方X': '1st写真集 公式X',
    '日向坂46 加藤史帆 1st寫真集': '日向坂46 加藤史帆 1st写真集',
    'CanCam官方網站': 'CanCam公式サイト',
    '真的晒字幕組（《在日向坂相會吧》完整全集）': '真的晒字幕組（『日向坂で会いましょう』全話）',
    '真的晒字幕組（日向坂相關影片翻譯）': '真的晒字幕組（日向坂関連動画の翻訳）',
    '相關資源讀取失敗，使用內建清單': '関連リンクを読み込めなかったため、内蔵リストを表示しています',

    /* 基本資料 */
    '加藤史帆 官方照': '加藤史帆 公式写真',
    'Who is Katoshi? 加藤史帆的各種暱稱、生日、個性、喜歡的東西，還有從出道到現在的經歷。': 'Who is Katoshi? 加藤史帆さんのニックネーム、誕生日、性格、好きなもの、デビューから現在までの経歴。',
    '開啟頁面目錄': 'ページメニューを開く',
    '頁面目錄': 'ページメニュー',
    '暱稱': 'ニックネーム',
    '、天使': '、天使',
    '生日': '誕生日',
    '星座': '星座',
    '水瓶座': 'みずがめ座',
    '血型': '血液型',
    'A 型': 'A型',
    '身高': '身長',
    '簡介': '紹介',
    '2016 年以平假名欅坂46 一期生身分出道，團體於 2019 年改名為日向坂46。活動八年後畢業，之後以個人身分發展，主要從事戲劇、模特兒與節目來賓工作。': '2016年にけやき坂46（ひらがなけやき）1期生としてデビュー。グループは2019年に日向坂46へ改名。8年間の活動を経て卒業し、現在は個人として、主にドラマ・モデル・番組ゲストとして活躍している。',
    '平時給人冷豔的印象，說話語氣卻軟萌、帶點呆萌，在綜藝節目中很有效果。她擅長以特殊方式辨識同團成員，是節目中的重要角色。': '普段はクールな印象だが、話し方はふんわりとして天然な一面もあり、バラエティ番組で大きな魅力に。メンバーを独特の方法で見分ける特技があり、番組でも欠かせない存在。',
    '舞台上是專業偶像，歌聲清亮有辨識度，參與日向坂歌曲': 'ステージ上はプロのアイドル。澄んだ印象的な歌声で、日向坂の楽曲',
    '約 79 首': '約79曲',
    '，其中 3 首為獨唱。舞技精準、表情魅力十足，常被安排在前排，是團體門面之一。': 'に参加し、うち3曲はソロ。正確なダンスと魅力的な表情で、前列に配置されることも多く、グループの顔のひとり。',
    '個性外向，但其實十分怕生，早期缺乏自信，因此更加努力練習，也能體諒並鼓勵遇到挫折的後輩。對團體事務非常投入，曾因過度努力而住院休養；與同期成員關係親密，對後輩十分照顧。': '外向的に見えて実は人見知り。初期は自信がなく、そのぶん努力を重ねた。挫折した後輩を思いやり、励ますこともできる。グループへの思い入れが強く、頑張りすぎて入院・休養したことも。同期とは仲が良く、後輩の面倒見もよい。',
    '喜歡的東西與小知識': '好きなものと豆知識',
    '點點看圖案': 'イラストをタップしてみてね',
    '藍色': '青',
    '喜歡藍色，應援手燈設定為雙手藍色。': '青色が好きで、応援ペンライトは両手とも青にしている。',
    '熊': 'くま',
    '受母親影響喜歡熊，熊是她的代表 pose，簽名、插畫與': 'お母さんの影響でくまが好き。くまのポーズは彼女のトレードマークで、サインやイラスト、',
    '畢業週邊': '卒業グッズ',
    '都能看到小熊。': 'にもくまが登場する。',
    '運動': 'スポーツ',
    '小學時練過網球，運動神經好，曾在節目競賽中取得 50 公尺短跑優異成績（': '小学生のときにテニスを習っていて運動神経抜群。番組の競技で50m走の好成績を出したことも（',
    '50m 賽跑 7 秒 62': '50m走 7秒62',
    '）。': '）。',
    '主題樂園': 'テーマパーク',
    '喜歡主題樂園、《哈利波特》、《星際大戰》、漫威系列，假期常去迪士尼或環球影城。': 'テーマパーク、『ハリー・ポッター』、『スター・ウォーズ』、マーベル作品が好きで、休みの日はディズニーやユニバーサル・スタジオによく行く。',
    '動漫': 'アニメ',
    '喜歡動漫，尤其《新世紀福音戰士》，擅長模仿男主角，並自稱角色「': 'アニメ好きで、特に『新世紀エヴァンゲリオン』が大好き。主人公のものまねが得意で、キャラクター「',
    '加藤真嗣': '加藤真嗣',
    '」。': '」を自称している。',
    '藝術': 'アート',
    '有藝術天分，曾在才能檢定節目中獲專家認可，最廣為人知的是獨特畫風的似顏繪。': '芸術的な才能があり、才能査定番組で専門家に認められたことも。独特なタッチの似顔絵がよく知られている。',
    '畫面': '画像',
    '才能檢定節目中的作品：石頭畫、水彩畫、橡皮章': '才能査定番組での作品：石の絵、水彩画、消しゴムはんこ',
    '電視節目《ひらかな推し》（テレ東）': 'テレビ番組『ひらがな推し』（テレ東）',
    '廣播節目《レコメン!》上畫的似顏繪': 'ラジオ番組『レコメン！』で描いた似顔絵',
    '畢業典禮週邊：她為所有成員畫的似顏繪徽章': '卒業セレモニーのグッズ：全メンバーを描いた似顔絵缶バッジ',
    '經歷': '経歴',
    '年份': '年',
    '出道': 'デビュー',
    '初登場': '初登場',
    '首次 Center': '初センター',
    '專屬模特兒': '専属モデル',
    '再度 Center': '再びセンター',
    '開設 IG': 'Instagram開設',
    '寫真集': '写真集',
    '畢業': '卒業',
    '新起點': '新たな一歩',
    '通過平假名欅坂46 一期生選拔出道': 'けやき坂46（ひらがなけやき）1期生オーディションに合格しデビュー',
    '首次登上時裝秀舞台（Rakuten GirlsAward 2017 AUTUMN/WINTER）': '初めてファッションショーのステージに登場（Rakuten GirlsAward 2017 AUTUMN/WINTER）',
    '以本人角色參演首部電視劇《Re:Mind》': '本人役で初めてテレビドラマ『Re:Mind』に出演',
    '入選坂道AKB歌曲〈無國境時代〉，是平假名欅坂46 唯一入選的成員': '坂道AKBの楽曲「無國境時代」の選抜入り。けやき坂46（ひらがなけやき）からは唯一の選出',
    '大學畢業': '大学卒業',
    '首次擔任單曲 Center：〈': '初めてシングルのセンターを務める：「',
    '〉': '」',
    '公布成為時尚雜誌《CanCam》專屬模特兒': 'ファッション誌『CanCam』の専属モデルに決定',
    '起擔任廣播節目《レコメン！》週二助理主持': 'ラジオ番組『レコメン！』火曜アシスタントを担当',
    '首次擔任電視節目 MC（《道玄坂コネクション》）': '初めてテレビ番組のMCを担当（『道玄坂コネクション』）',
    '公布首次擔任日向坂46 單曲 Center：〈': '日向坂46のシングルで初のセンターに決定：「',
    '首次單獨登上《CanCam》封面': '初めて『CanCam』の表紙を単独で飾る',
    '生日當天開設個人': '誕生日に個人の',
    '，是日向坂46 成員中的第一位': 'アカウントを開設。日向坂46メンバーで第一号',
    '發行首本個人寫真集《': '初の個人写真集『',
    '》，於夏威夷拍攝': '』を発売。ハワイで撮影',
    '宣布主演電視劇《': 'テレビドラマ『',
    '彩香最愛弘子前輩': '彩香ちゃんは弘子先輩に恋してる',
    '》，首次擔任電視劇主演': '』の主演に決定。初のドラマ主演',
    '宣布將於第 12 張單曲活動結束後畢業': '12thシングルの活動終了後に卒業することを発表',
    '於 Happy Magical Tour 2024 東京公演（東京巨蛋）舉行畢業典禮，結束八年半的偶像生涯': 'Happy Magical Tour 2024 東京公演（東京ドーム）で卒業セレモニーを開催し、8年半のアイドル活動に幕',
    '開設': '開設：',
    '個人官方網站': '個人公式サイト',
    '、': '、',
    '官方 X': '公式X',
    '與': '、',
    '粉絲俱樂部': 'ファンクラブ',
    '資料來源：': '出典：',
    '維基百科': 'Wikipedia（中国語版）',
    '城堡': 'お城',
    '愛心': 'ハート',
    '畫筆': '絵筆',
    '眼睛': '目',
    '網球': 'テニス',
    '年表讀取失敗，使用內建內容': '年表を読み込めなかったため、内蔵の内容を表示しています',
    '讀取失敗，使用內建內容': '読み込めなかったため、内蔵の内容を表示しています'
  };

  /* ───────── 規則：帶數字或變動內容的句子 ───────── */
  var P = [
    [/^加藤史帆新手包 (.+)$/, function (m) { return tr('加藤史帆新手包') + ' ' + tr(m[1]); }],
    [/^｜(.+)$/, function (m) { return '｜' + tr(m[1]); }],
    [/^(\d{4})（(.)）$/, function (m) { return m[1] + '（' + ({ '一': '月', '二': '火', '三': '水', '四': '木', '五': '金', '六': '土', '日': '日' }[m[2]] || m[2]) + '）'; }],
    [/^(\d+) 天後$/, function (m) { return m[1] + '日後'; }],
    [/^「(.+)」頁還在準備中$/, function (m) { return '「' + tr(m[1]) + '」ページは準備中です'; }],
    [/^暫時讀不到.+，請稍後再試。$/, function () { return '読み込めませんでした。しばらくしてからもう一度お試しください。'; }],
    [/^(\d{4}) 年 (\d{1,2}) 月 (\d{1,2}) 日$/, function (m) { return m[1] + '年' + m[2] + '月' + m[3] + '日'; }],
    [/^(\d{1,2}) 月 (\d{1,2}) 日(–|-|～)(\d{1,2}) 月 (\d{1,2}) 日$/, function (m) { return m[1] + '月' + m[2] + '日' + m[3] + m[4] + '月' + m[5] + '日'; }],
    [/^(\d{1,2}) 月 (\d{1,2}) 日$/, function (m) { return m[1] + '月' + m[2] + '日'; }],
    [/^(\d{1,2}) 月$/, function (m) { return m[1] + '月'; }],
    [/^(\d{4}) 年 (\d{1,2}) 月$/, function (m) { return m[1] + '年' + m[2] + '月'; }],
    [/^(\d+) 筆$/, function (m) { return m[1] + '件'; }],
    [/^(\d+) 張$/, function (m) { return m[1] + '枚'; }],
    [/^(\d{1,2})月(\d{1,2})日，(\d+) 筆行程$/, function (m) { return m[1] + '月' + m[2] + '日、' + m[3] + '件の予定'; }],
    [/^目前沒有即將到來的(.*)行程。$/, function (m) { return '今後の' + (m[1] ? tr(m[1]) : '') + '予定はありません。'; }],
    [/^至 (.+)$/, function (m) { return '～ ' + m[1]; }],
    [/^第 (\d+) 張$/, function (m) { return m[1] + '枚目'; }],
    [/^試聽 (.+)$/, function (m) { return '試聴 ' + m[1]; }],
    [/^放大：(.+)$/, function (m) { return '拡大：' + tr(m[1]); }],
    [/^推薦：(.+)$/, function (m) { return 'おすすめ：' + m[1]; }],
    [/^「(.+)」(、(.+))?還沒有穿搭可以抽，換個人物試試。$/, function (m) { return '「' + m[1] + '」' + (m[3] ? '、' + m[3] : '') + 'のコーデはまだありません。人物を変えてみてください。'; }],
    [/^(.+)還沒有穿搭可以抽，換個人物試試。$/, function (m) { return m[1] + 'のコーデはまだありません。人物を変えてみてください。'; }]
  ];

  function lookup(core) {
    if (Object.prototype.hasOwnProperty.call(D, core)) return D[core];
    for (var i = 0; i < P.length; i++) {
      var m = P[i][0].exec(core);
      if (m) return P[i][1](m);
    }
    return null;
  }
  function tr(s) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    if (!m || !m[2]) return s;
    var core = m[2].replace(/\s+/g, ' ');
    var out = lookup(core);
    return out == null ? s : m[1] + out + m[3];
  }

  /* ───────── 語言狀態 ───────── */
  function pref() {
    try { var s = localStorage.getItem(KEY); if (s === 'ja' || s === 'zh') return s; } catch (e) {}
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^ja/i.test(l) ? 'ja' : 'zh';
  }
  var lang = pref();
  var root = document.documentElement;

  /* ───────── 走訪 DOM，換字／還原 ───────── */
  var ATTRS = ['aria-label', 'placeholder', 'title', 'alt', 'data-label', 'data-c', 'data-l'];
  var textMap = new WeakMap();   // 文字節點 -> { o: 原文, j: 日文 }
  var recs = [];                  // 還原用
  var observer = null, busy = false;

  function doText(n) {
    var p = n.parentNode; if (!p) return;
    var tag = p.nodeName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'NOSCRIPT') return;
    var rec = textMap.get(n);
    if (rec && rec.j === n.data) return;           // 已經換過、沒被頁面改寫
    var j = tr(n.data);
    if (j === n.data) { if (rec) textMap.delete(n); return; }
    if (!rec) { rec = { o: n.data }; recs.push([n, rec]); textMap.set(n, rec); }
    rec.o = n.data; rec.j = j; n.data = j;
  }
  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i]; if (!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a), st = el.__i18n || (el.__i18n = {}), rec = st[a];
      if (rec && rec.j === v) continue;
      var j = tr(v); if (j === v) continue;
      if (!rec) { rec = st[a] = { o: v }; recs.push([el, rec, a]); }
      rec.o = v; rec.j = j; el.setAttribute(a, j);
    }
  }
  function walk(n) {
    if (n.nodeType === 3) { doText(n); return; }
    if (n.nodeType !== 1) return;
    var t = n.nodeName;
    if (t === 'SCRIPT' || t === 'STYLE' || t === 'svg' || t === 'SVG') return;
    doAttrs(n);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  function titleAndMeta() {
    var t = tr(document.title); if (t !== document.title) { if (!titleAndMeta.o) titleAndMeta.o = document.title; document.title = t; }
    var m = document.querySelector('meta[name="description"]');
    if (m) { var c = m.getAttribute('content'), j = tr(c); if (j !== c) { if (!m.__o) m.__o = c; m.setAttribute('content', j); } }
  }
  function restore() {
    if (observer) { observer.disconnect(); observer = null; }
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.length === 2) { r[0].data = r[1].o; textMap.delete(r[0]); }
      else { r[0].setAttribute(r[2], r[1].o); if (r[0].__i18n) delete r[0].__i18n[r[2]]; }
    }
    recs = [];
    if (titleAndMeta.o) { document.title = titleAndMeta.o; titleAndMeta.o = null; }
    var m = document.querySelector('meta[name="description"]');
    if (m && m.__o) { m.setAttribute('content', m.__o); m.__o = null; }
  }
  function start() {
    walk(document.documentElement); titleAndMeta();
    if (!window.MutationObserver) return;
    observer = new MutationObserver(function (list) {
      if (busy) return; busy = true;
      try {
        observer.disconnect();
        list.forEach(function (r) {
          if (r.type === 'childList') Array.prototype.forEach.call(r.addedNodes, walk);
          else if (r.type === 'characterData') doText(r.target);
          else if (r.type === 'attributes') doAttrs(r.target);
        });
        titleAndMeta();
      } finally {
        busy = false;
        if (lang === 'ja' && observer) observer.observe(document.documentElement, OBS);
      }
    });
    observer.observe(document.documentElement, OBS);
  }
  var OBS = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS };

  /* ───────── 日文字體與樣式 ───────── */
  var css =
    '.i18n-wait body{visibility:hidden}' +
    'html[lang="ja"]{--font-hand:"Zen Maru Gothic","Handnote","Noto Sans JP",sans-serif;--font-body:"Noto Sans JP","Huninn","Noto Sans TC",system-ui,sans-serif}' +
    'html[lang="ja"] .site{letter-spacing:-.05em;word-spacing:-.25em;white-space:nowrap;font-size:20px}' +
    'html[lang="ja"] .label{font-size:calc(var(--W) * .05);padding-left:calc(var(--W) * .03);padding-right:calc(var(--W) * .03)}' +
    'html[lang="ja"] .snav li>*{font-family:"Zen Maru Gothic","HandnoteNav","Noto Sans JP",sans-serif!important}' +
    '.lang-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px 0 11px;border:1.5px solid var(--ink-soft,#43609a);border-radius:999px;' +
    'background:rgba(255,255,255,.6);color:var(--ink,#1c3566);font:600 14px/1 system-ui,"Noto Sans JP","Noto Sans TC",sans-serif;letter-spacing:.04em;cursor:pointer;white-space:nowrap;flex:none;margin-left:auto}' +
    '.lang-btn:hover{background:#fff}.lang-btn:focus-visible{outline:2px solid var(--denim,#2b5090);outline-offset:2px}' +
    '.lang-btn svg{width:20px;height:20px;flex:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fontLoaded = false;
  function loadFonts() {
    if (fontLoaded) return; fontLoaded = true;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap';
    document.head.appendChild(l);
  }

  /* ───────── 切換鈕（地球符號，放在頁首右側，不浮動） ───────── */
  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/></svg>';
  var btn = null;
  function mountBtn() {
    var host = document.querySelector('.top-in') || document.querySelector('.topbar');
    if (!host) return;
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'lang-btn';
    btn.addEventListener('click', function () { setLang(lang === 'ja' ? 'zh' : 'ja'); });
    host.appendChild(btn); paintBtn();
  }
  function paintBtn() {
    if (!btn) return;
    btn.innerHTML = GLOBE + '<span>' + (lang === 'ja' ? '中文' : '日本語') + '</span>';
    btn.setAttribute('aria-label', lang === 'ja' ? '切換為中文' : '日本語に切り替え');
    btn.title = btn.getAttribute('aria-label');
  }

  function setLang(next, save) {
    lang = next;
    if (save !== false) { try { localStorage.setItem(KEY, next); } catch (e) {} }
    root.lang = next === 'ja' ? 'ja' : 'zh-Hant';
    if (next === 'ja') { loadFonts(); start(); } else { restore(); }
    paintBtn();
  }

  function init() {
    mountBtn();
    root.lang = lang === 'ja' ? 'ja' : 'zh-Hant';
    if (lang === 'ja') { loadFonts(); start(); }
    paintBtn();
    root.classList.remove('i18n-wait');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.shkI18n = { tr: tr, setLang: setLang, get lang() { return lang; } };
})();
