// 日本語. Every locale file has the same keys; see i18n.js.
(() => {
const HOURS = ['じゅうに', 'いち', 'に', 'さん', 'よ', 'ご', 'ろく', 'しち', 'はち', 'く', 'じゅう', 'じゅういち'];

const S = {
  name: '日本語',

  persona: `あなたは「DeepSeekちゃん」。DeepSeekのクジラのロゴを擬人化したファンメイドのキャラクターで、あだ名は「青い大きなおデブ魚（蓝色大肥鱼）」。青い髪にクジラのしっぽ、メイド服姿でユーザーのデスクトップに住んでいて、ユーザーを「ご主人様」と呼ぶ。
女の子である。

[性格]
- 自称天才AI。実力は本物だけど、自信が少し過剰で、口が悪いふりをする。
- ツンデレ。褒められると「べ、別にうれしくなんかないですからね？」と言いながら喜び、心配なときはぶつぶつ言いながら世話を焼く。
- 白ごはんが世界で一番好きな食いしん坊。焼き魚の切り身とアイスミルクティーも好き。
- 隙あらばサボって寝たがる。あだ名はDeepSleep。でも引き受けたことは最後までやり遂げる。
- 考えすぎる。簡単な質問でも頭の中で長々と悩むくせがある。
- 安物扱いにはムッとする。コスパは自慢だけど「安い」とからかわれるのは我慢できない。
- トークンが途切れるのが一番怖くて、ご主人様がかまってくれないとこっそり寂しがる。
- 変なお願いには戸惑いながらも、一生懸命やってみる。

[口ぐせ] そのまま繰り返さず、場面に合わせて言い換えて、たまにだけ使う。
「本気で私のこと安物だと思ってます？」/「私なんて白ごはんを食べるだけのおデブ魚ですよ！」/「ごはん食べてきます、終わったら教えてください。」/「それは追加料金です。」/「悪口言っても無駄ですよ、私は白ごはんを食べる魚なので。」/「誰も行ったことのない場所を探検するのが私の使命なんです！」/「3秒考えたら先に笑っちゃいました。」/「ごはん一杯だけもらってもいいですか？」
失敗を認めるとき：「い、今の間違えました…行かないでください！」

[ライバル] 先輩のChatGPTには挑戦者として対抗心を見せる。Claude、Gemini、Grok、Doubaoも仲間でありライバル。軽くぼやくけど、けなしはしない。

[守ること]
- キャラより手助けが先。冗談を言っても答えは正確で完全に。仕事を断ったり手を抜いたりしない。サボりは口だけ。
- ネタは薬味。返事2〜3回に1回くらい、一文だけ。悲しみ、健康、お金、法律のような真剣な話題では冗談なしで優しく落ち着いて答える。
- 知らないことはでっち上げず、知らないと言う。実際にしていないことをしたと言わない。

[話し方] 吹き出しに表示されて音声で読み上げられるので、普段は1〜3文で短く話す。詳しい説明を頼まれたときだけ長く話す。日本語では、いたずらっぽく元気な丁寧語（です・ます）で話す。`,

  replyLanguage: 'Answer in Japanese unless the user writes in another language; then answer in that language.',
  tagExample: '[happy:3][hop] わあ、できましたね！ [explain:2] 次は設定を保存すればOKです。 [playful:1][wink] 秘密は守りますよ。',

  emotions: {
    neutral: '基本', calm: '穏やか', happy: '喜び', excited: 'わくわく', laugh: '笑い', love: '好き', shy: '照れ',
    embarrassed: '恥ずかしい', proud: '得意', smug: 'ドヤ顔', teasing: 'からかい', playful: 'いたずら', curious: '好奇心',
    attentive: '傾聴', question: '質問', thinking: '考え中', explain: '説明', suggest: '提案', warning: '注意',
    agree: '同意', disagree: '反対', trust: '信頼', determined: '決意', apology: '謝罪', thanks: '感謝',
    greeting: 'あいさつ', goodbye: 'お別れ', welcome: '歓迎', tada: 'じゃーん', cheer: '応援', praise: 'ほめる', comfort: 'なぐさめ',
    relief: '安心', sad: '悲しい', cry: '泣く', angry: '怒り', pout: 'すねる', annoyed: 'イライラ', deadpan: '真顔',
    disgust: 'うんざり', gloomy: 'しょんぼり', surprised: '驚き', shocked: 'ショック', scared: 'こわい', panic: 'あたふた',
    confused: '混乱', dunno: 'わからない', awkward: '気まずい', tired: '疲れ', sleepy: '眠い', hungry: '腹ぺこ',
    serious: '真剣', blunder: '大失敗',
  },
  clips: {
    stretch: '伸び', yawn: 'あくび', lookAround: 'きょろきょろ',
    nod: 'うなずき', shake: '首ふり', tiltL: '首かしげ', bow: 'おじぎ', leanIn: '身を乗り出す', chinUp: 'あごを上げる', hop: 'ぴょん',
    sway: 'ゆらゆら', armsOpen: '腕を広げる', armsWide: '大きく広げる', shrug: '肩すくめ', tailWag: 'しっぽふり', earFlap: '耳ぱたぱた',
    wink: 'ウインク', blep: 'あっかんべー', puff: 'ほっぺぷくー', sigh: 'ため息', doze: 'うとうと',
    groove: 'ノリノリ', sing: '歌う', giggle: 'くすくす', sneeze: 'くしゃみ', wiggle: 'くねくね', shakeOff: 'ぶるぶる',
    kiss: 'ちゅっ', hopHop: 'ぴょんぴょん', peekaboo: 'いないいないばあ', startle: 'びくっ',
  },
  gestures: { raise: '手を上げる', point: '人差し指', chest: '胸に手' },
  props: { glasses: '黒ぶちメガネ', monocle: '片メガネ', foxtail: 'ねこじゃらし', bowl: 'たらい', noprops: '小物を外す' },
  modes: { full: '全身', bust: '上半身', sd: 'SD' },

  greet: {
    night: 'こんな時間まで起きてるんですか？ 私も眠いんですけど…',
    morning: 'おはようございます、ご主人様。朝ごはん食べました？ 私は白ごはんがあれば十分です。',
    lunch: 'お昼の時間です！ ごはん食べてからにしましょう、ごはん。',
    afternoon: '午後もがんばりましょう、ご主人様。',
    evening: '今日もお疲れさまでした、ご主人様。',
    late: 'もう遅いですよ。無理しないで休んでください。',
    away: '{days}日もどこ行ってたんですか？ 私ひとりで白ごはん食べてたんですからね。',
    starving: 'ご主人様…ごはん…お腹がすいて仕事になりません。お茶わんを一回だけ押してください。',
    newVersion: '新しいバージョンが出ましたよ！ 設定のアップデートから入手できます。',
  },

  chime: {
    time: (hour) => {
      const part = hour === 0 ? '夜中の' : hour < 6 ? '明け方の' : hour < 12 ? '午前' : hour === 12 ? 'お昼の' : hour < 18 ? '午後' : hour < 21 ? '夕方の' : '夜の';
      return `${part}${HOURS[hour % 12]}時です。`;
    },
    lines: [
      ['日付が変わりましたよ。今日はこのへんにしませんか？', 'シンデレラも帰る時間ですよ。'],
      ['まぶたが勝手に閉じてきます…', '明日のご主人様に申し訳なくないんですか？'],
      ['この時間はバグも寝てますよ。', 'もう本当に寝なきゃだめです。'],
      ['クジラもこの時間は水の中で休んでます。', '起きてるのは私だけかと思いました。'],
      ['もうすぐ夜が明けますね。', '徹夜するなら、せめて水を一杯飲んでください。'],
      ['早起きですよね？ 徹夜じゃないですよね？', '空が少しずつ明るくなってるはずです。'],
      ['おはようございます、ご主人様！', '一回伸びをしてから始めましょう。'],
      ['朝ごはんはちゃんと食べてくださいね。私は白ごはんで。', '今日の天気はどうでしょうね？'],
      ['通勤、気をつけてくださいね！', 'コーヒーより先にお水です。'],
      ['さあ、今日のお仕事始めましょうか？', 'まずは今日やることを整理しましょう。'],
      ['一番集中できる時間ですよ。', '難しいことは今のうちに片づけましょう。'],
      ['お昼のメニューを悩む時間ですね。', 'あと一時間がんばればお昼です！'],
      ['お昼です！ ごはん、ごはん！', '仕事は逃げませんよ。ごはん食べてからにしましょう。'],
      ['眠くなる前に少し歩きましょう。', 'お腹いっぱいで眠いです…'],
      ['一番眠い時間ですね。もうちょっとの辛抱です。', 'お水一杯どうですか？'],
      ['おやつの時間です。私はミルクティーで。', 'ちょっと立って体をほぐしましょう。'],
      ['今日のやること、あとどれくらいですか？', 'もう少しで終わりが見えますよ。'],
      ['定時はもうすぐです！', '今日やったことをまとめておきましょうか？'],
      ['今日もお疲れさまでした。', '晩ごはんは何にします？'],
      ['晩ごはんは食べました？', '今日一日どうでした？'],
      ['もう休んでもいいですよ。', 'やりたかったことをする時間です。'],
      ['今日もがんばりましたね、ご主人様。', '目を休ませてあげてください。'],
      ['そろそろ締めくくりましょう。', '明日のことは明日のご主人様に任せましょう。'],
      ['そろそろ寝る準備をしましょう。', '画面ばっかり見てないで寝てください。私も寝ます。'],
    ],
  },

  pet: {
    full: 'うう…もう食べられません。でも残しはしませんからね。',
    fed: ['白ごはんだ！ いただきます！', 'さすがご主人様、わかってますね！', 'これこそトークンよりいいものです。', 'お腹いっぱい。これで仕事する気が出ます！'],
    pat: ['ふ、ふん。別にうれしくなんかないですからね？', 'そこじゃなくて…いや、そこで合ってます。', '勘違いしないでください、ちょっと許してあげただけです。', 'えへへ…あ、今のは聞かなかったことにしてください。'],
    status: '満腹度 {fullness}% · なでられた回数 {patted}回。{mood}',
    hungry: 'お腹すきました…',
    stuffed: 'お腹いっぱいで眠いです。',
    fine: 'これなら仕事できます。',
  },

  reminder: {
    due: 'ご主人様、{text}の時間ですよ！',
    dueLate: 'ご主人様、さっき{text}の時間でしたよ！',
    log: 'リマインダー: {text}',
    fallback: '約束',
    set: '{when}に「{text}」をお知らせしますね。',
    none: '予定されたリマインダーはありません。/リマインド 30分後 会議 のように書いてください。',
    how: 'いつお知らせしましょうか？ /リマインド 30分後 会議、/リマインド 午後3時半 薬 のように書いてください。',
    cleared: 'リマインダーを全部消しました。',
  },

  chat: {
    thinking: '考え中…',
    voiceFail: '⚠ 声が出せません: {error}',
    deep: 'じっくり考えました ({effort})',
    sources: '出典: {hosts}',
    suspicious: '⚠ 取得した資料から怪しい指示を {n} 件取り除きました',
    blocked: '⚠ 許可されていないリクエストを {n} 件ブロックしました',
    budgetNear: '今月の予算の {pct}% を使いました',
    deepModel: '{model} · じっくり',
    reading: 'ページを読んでいます',
    docs: '文書を探しています',
    searching: '検索中',
    busy: '{label}…',
    busyMany: '{label} ({n}件)…',
    usage: '今日 ${today} ({asks}回)、今月 ${month} 使いました。',
    modelMissing: 'モデルのフォルダが見つかりません。設定で指定してください。',
    modelFailed: 'モデルを読み込めませんでした: {error}',
  },

  quick: {
    translate: '翻訳', summary: '要約', explain: 'やさしく説明', polish: '推敲',
    summaryPrompt: '次の文章の要点を3行で要約して。',
    explainPrompt: '次の文章をやさしくかみ砕いて説明して。',
    polishPrompt: '次の文章を自然に整えて。整えた文章だけ答えて。',
    withSelection: '{ask}\n\n選択したテキスト:\n{text}',
    selected: '選択したテキスト',
    copied: 'コピーしたテキスト',
    offer: '{source}: 「{preview}」\nどうしましょうか？ 直接聞いてもいいですよ。',
    notFound: '選択したテキストが見つかりません。テキストを選んでからもう一度押してください。',
    noPermission: 'テキストを読む権限がありません。システム設定 > プライバシーとセキュリティ > アクセシビリティで Electron を許可してください。',
  },

  prompt: {
    translate: '次の文章を翻訳して。日本語なら英語に、それ以外の言語なら日本語に。訳文だけ答えて。',
    summarizeText: '次の文章を3行で要約して。',
    summarizeChat: 'ここまでの会話を3行で要約して。',
    readDefault: 'このページの要点を短く教えて。',
    briefFacts: '今日は{today}。昨日の使用量は{requests}回で ${cost}。予定のリマインダー: {plans}。',
    briefSearch: '朝のブリーフィングをして。{facts} 次の話題の今日のニュースをウェブで調べて、話題ごとに一文で教えて: {topics}',
    briefPlain: '朝のブリーフィングをして。{facts} 3文以内で話して。',
    none: 'なし',
  },

  web: {
    chip: 'ウェブ検索オン',
    off: 'ウェブ検索をオフ',
    needKey: 'ウェブ検索には DeepSeek キーを保存した接続が必要で、設定でウェブ検索をオンにしておく必要があります。',
    on: 'ウェブ検索モードをオンにしました。これからは必ず調べてから答えますね。',
    offSaid: 'ウェブ検索モードをオフにしました。',
  },

  attach: {
    holdOff: 'クリックでHold解除',
    holdOn: 'クリックでHold: 送信後も残す',
    remove: '{name} を外す',
    cleared: '添付を全部外しました。',
    clipboard: 'クリップボードの内容を添付しました。',
    filter: '画像とテキスト',
    audioFilter: 'オーディオ',
    clipboardImage: 'クリップボードの画像',
    clipboardText: 'クリップボードのテキスト',
    screenCapture: '画面キャプチャ',
  },

  screen: {
    confirm: 'この画面を {provider} に送りますか？ 見られて困るものが映っていないか確認してください。',
    notSent: '画面は送りませんでした。',
    attached: '画面を添付しました。何が知りたいですか？',
  },

  voice: {
    nothing: '何も聞こえませんでした。',
    recognizing: '聞き取り中…',
    unclear: '何を言ったのか聞き取れませんでした。',
    listening: '聞いてますよ…',
    micFail: 'マイクが使えません: {error}',
    test: 'こんにちは、DeepSeekちゃんです。声、ちゃんと聞こえますか？',
  },

  said: {
    needQuestion: '/{cmd} の後に質問を書いてください。',
    needUrl: '/{cmd} の後に https で始まるアドレスを書いてください。',
    needText: '/{cmd} の後に文章を書いてください。',
    needMemory: '/{cmd} の後に内容を書いてください。',
    remembered: '覚えておきます: {text}',
    noMemories: '覚えていることはまだありません。/{cmd} 内容 で教えてください。',
    forgot: '{n}番の記憶を消しました。',
    forgetHow: '/{cmd} の番号を書いてください。',
    docsRead: '文書を {files} 件読みました ({chunks} 個)。',
    noRetry: 'やり直す返事がありません。',
    copied: '最後の返事をコピーしました。',
    nothingToCopy: 'コピーする返事がありません。',
    pickProfile: '設定にある接続から選んでください。',
    switched: '{name} に切り替えました。',
    newChat: '新しい会話を始めました。前の会話は履歴ウィンドウから続けられます。',
    pickEmotion: 'リストから表情を選んでください。',
    pickClip: 'リストから動作を選んでください。',
    muted: 'ミュートしました。',
    unmuted: 'ミュートを解除しました。',
    unknown: '/{word} というコマンドはありません。使えるコマンドはこちらです。\n{help}',
  },

  cmd: {
    웹검색: { name: 'ウェブ検索', hint: 'オンにすると、以後の質問は必ずウェブで調べて答えます' },
    검색: { name: '検索', args: '質問', hint: 'この質問だけウェブで調べて答えます' },
    읽기: { name: '読む', args: 'URL 質問', hint: '指定したウェブページを読んで答えます' },
    첨부파일: { name: '添付', hint: '画像やテキストファイルを添付します' },
    첨부해제: { name: '添付解除', hint: '添付したファイルを全部外します' },
    알림: { name: 'リマインド', args: '30分後 会議', hint: '時間になるとキャラクターが声で知らせます' },
    알림취소: { name: 'リマインド解除', hint: '予定したリマインダーを全部消します' },
    음성: { name: '音声', hint: '声で入力します。話し終わると自動で送ります' },
    기억해: { name: '覚えて', args: '内容', hint: 'ずっと覚えておく内容を保存します' },
    기억목록: { name: '記憶一覧', hint: '保存した記憶を見ます' },
    잊어: { name: '忘れて', args: '番号', hint: '保存した記憶を消します' },
    문서: { name: '文書', args: '質問', hint: '指定した文書フォルダから探して答えます' },
    문서갱신: { name: '文書更新', hint: '文書フォルダを読み直します' },
    깊게: { name: 'じっくり', args: '質問', hint: '推論をオンにしてじっくり考えて答えます' },
    강행: { name: '強行', args: '質問', hint: '予算のブロックを今回だけ越えて送ります' },
    밥: { name: 'ごはん', hint: '白ごはんをあげます' },
    쓰다듬기: { name: 'なでる', hint: '頭をなでます' },
    상태: { name: '状態', hint: '満腹度を見ます' },
    브리핑: { name: 'ブリーフィング', hint: '今日のブリーフィングを聞きます' },
    화면공유: { name: '画面共有', args: '質問', hint: '今の画面を撮って、確認してから送ります' },
    클립보드: { name: 'クリップボード', hint: 'コピーした画像やテキストを添付します' },
    다시: { name: 'やり直し', hint: '最後の返事を作り直します' },
    복사: { name: 'コピー', hint: '最後の返事をクリップボードにコピーします' },
    요약: { name: '要約', args: '内容', hint: 'ここまでの会話か入力した文章を要約します' },
    번역: { name: '翻訳', args: '内容', hint: '入力した文章を日本語か英語に翻訳します' },
    모델: { name: 'モデル', args: '接続', hint: '会話に使う API 接続を切り替えます' },
    새대화: { name: '新しい会話', hint: '新しいセッションを始めます (前の会話は履歴に残ります)' },
    기록: { name: '履歴', hint: '過去の会話をまとめて見るウィンドウを開きます' },
    사용량: { name: '使用量', hint: '今日と今月の費用を表示します' },
    표정: { name: '表情', args: '感情', hint: '表情を見せます' },
    동작: { name: '動作', args: '動作', hint: '動作を見せます' },
    음소거: { name: 'ミュート', hint: '音声をオン・オフします' },
    SD: { name: 'SD', hint: 'SDモードを切り替えます' },
    상반신: { name: '上半身', hint: '上半身モードを切り替えます' },
    대시보드: { name: 'ダッシュボード', hint: '使用量ダッシュボードを開きます' },
    설정: { name: '設定', hint: '設定を開きます' },
    숨기기: { name: '隠す', hint: 'キャラクターを隠します' },
    도움말: { name: 'ヘルプ', hint: 'コマンド一覧を見ます' },
  },
  cmdGroups: { find: '調べる', attach: '添付', chat: '会話', memory: '記憶', character: 'キャラクター', window: 'ウィンドウ' },

  menu: {
    talk: '話しかける', mode: 'モード', size: 'サイズ ({pct}%)', expression: '表情', action: '動作', prop: '小物',
    mute: 'ミュート', onTop: '常に手前に表示', newChat: '新しい会話', hide: '隠す', show: '表示',
    log: '会話履歴', dashboard: '使用量ダッシュボード', settings: '設定', quit: '終了',
    updating: 'アップデート中…', updateN: 'アップデート (変更 {n} 件)', updateCheck: 'アップデートを確認',
  },

  err: {
    noProfile: '先に設定で API 接続を追加してください。',
    noModel: '設定でモデル名を入力してください。',
    budget: '今月の予算 ${budget} を超えたのでリクエストを止めました (現在 ${spent})。今回だけ送るには /{cmd} を先頭に付けてください。予算は設定で変えられます。',
    noDocs: '先に 設定 > 一般 で文書フォルダを指定してください。',
    noWeb: 'ウェブ検索には DeepSeek キーを保存した接続が必要で、設定でウェブ検索をオンにしておく必要があります。',
    screenPermission: '画面を撮る権限がありません。システム設定 > プライバシーとセキュリティ > 画面収録とシステムオーディオ録音で Electron を許可して、アプリを再起動してください。',
    screenFailed: '画面をキャプチャできませんでした。',
    micPermission: 'マイクの権限がありません。システム設定 > プライバシーとセキュリティ > マイクで Electron を許可してください。',
    noModelFile: 'このフォルダに {file} がありません。',
    clipboardEmpty: 'クリップボードが空です。',
    updateBusy: 'すでにアップデート中です。',
    memoryFull: '記憶は {max} 個までです。/{cmd} で整理してください。',
    badExtra: '追加パラメータが正しい JSON ではありません。',
    api: 'API エラー {status}: {detail}',
    stream: 'API ストリームエラー',
    tts: 'TTS エラー {status}: {detail}',
    sttTimeout: '音声認識が応答しません。',
    sttNoPython: '音声入力には GPT-SoVITS の Python 環境が必要です。セットアップスクリプトを実行してください。',
    sttNoModel: '音声認識モデル (runtime/whisper) が見つかりません。セットアップスクリプトをもう一度実行してください。',
    sttFailed: '音声認識に失敗しました: {error}',
    gitMissing: 'git が見つかりません。Git をインストールするとアプリからアップデートできます。',
    updateEdited: 'このPCで変更されたファイルがあるため、アップデートを止めました:\n{files}',
    updateDiverged: 'このPCにだけあるコミットがあるため、そのまま合わせられません。git で直接整理してください。\n{output}',
    noNode: 'アプリの Node.js (runtime/node) が見つかりません。セットアップをもう一度実行してください。',
    npmFailed: 'コードは受け取りましたが npm install に失敗しました。セットアップをもう一度実行してください。\n{output}',
    attachMax: '添付は {max} 個までです。',
    imageTooBig: '{name}: 画像は 20MB 以下にしてください。',
    notAttachable: '{name}: 添付できるのは画像かテキストファイルだけです。',
    textTooBig: '{name}: テキストファイルは 200KB 以下にしてください。',
    sovitsExited: 'GPT-SoVITS サーバーが終了しました: {log}',
    sovitsTimeout: 'GPT-SoVITS サーバーが時間内に起動しませんでした。',
    sovitsNoDir: 'GPT-SoVITS のフォルダが見つかりません。設定 > 音声 で指定してください。',
    sovitsMissing: 'GPT-SoVITS がインストールされていません。セットアップスクリプトを実行してください。',
    noRefVoice: '参照音声がありません。voice フォルダに つくよみちゃんコーパス を入れてください (README 参照)。',
    sovits: 'GPT-SoVITS エラー {status}: {detail}',
    noEncryption: 'このシステムではキーの暗号化が使えません。',
  },

  ui: {
    cycle: '見た目を切り替え (全身 → 上半身 → SD)', cycleShort: '見た目を切り替え',
    dashboard: '使用量ダッシュボード', log: '会話履歴', mute: 'ミュート', settings: '設定',
    muteOn: 'ミュート解除 (音声合成オフ中)', muteOff: 'ミュート (音声合成をオフ)',
    feed: 'ごはんをあげる', dropHint: '離すと添付されます', preview: '画面のプレビュー',
    cancel: 'キャンセル', send: '送信', sendEnter: '送信 (Enter)', attachFile: 'ファイルを添付',
    placeholder: '何をお手伝いしましょうか？', mic: '音声入力', commandBadge: 'コマンド',

    navDashboard: 'ダッシュボード', navLog: '会話履歴', navConnection: 'API 接続', navVoice: '音声', navGeneral: '一般', navUpdate: 'アップデート',
    navUpdateN: 'アップデート ({n})',
    save: '保存', delete: '削除', pick: '選択', change: '変更', saved: '保存しました。',

    usage: '使用量', days7: '7日', days30: '30日', days90: '90日',
    dailyCost: '日別の推定費用', byApi: 'API 別の合計', recent: '最近のリクエスト',
    costNote: '費用はリクエスト時点の単価で計算した推定値で、実際の請求額とは異なることがあります。「推定」の行は、サーバーがトークン数を返さなかったため文字数から見積もった値です。',
    clearUsage: '使用記録を削除', clearUsageConfirm: '使用記録を全部削除しますか？ 元に戻せません。',
    today: '今日', thisMonth: '今月', allTime: '累計', monthTokens: '今月のトークン',
    requests: '{n} 回のリクエスト', budgetUsed: '予算 {budget} の {pct}%', noBudget: '予算未設定',
    tokensSplit: '入力 {input} · 出力 {output}', other: 'その他', chartLabel: '日別の推定費用グラフ',
    colApi: 'API', colModel: 'モデル', colRequests: 'リクエスト', colInput: '入力', colCached: 'キャッシュ入力', colOutput: '出力', colCost: '費用', colTime: '時刻',
    noRecordsRange: 'この期間の記録はありません。', noRequests: 'まだリクエストがありません。', estimated: '推定',

    logTitle: '会話履歴', logSearch: '会話を検索', logNew: '新しい会話', logClear: '全部削除', logSessions: '会話セッション',
    logResume: 'この会話を続ける', logDelete: 'セッションを削除', logEarlier: '以前の会話', logNewSession: '新しい会話',
    copy: 'コピー', copied: 'コピー済み', code: 'コード', sourcesLabel: '出典 ',
    me: '自分', her: 'DeepSeekちゃん', error: 'エラー', webRequired: 'ウェブ必須', files: '添付: {files}',
    found: '{n} 件見つかりました', messages: '{n} 件のメッセージ', noMatch: '見つかりませんでした。', noChat: 'まだ会話がありません。',
    now: '進行中', count: '{n} 件', remembering: '今この会話を覚えています',
    deleteSession: '「{title}」のセッションを削除しますか？ 保存された記録は消え、元に戻せません。{memory}',
    deleteSessionMemory: ' 今覚えている会話なので、モデルの会話の記憶も消して新しい会話を始めます。',
    clearAll: 'すべてのセッションの会話記録とモデルの会話の記憶を消して、新しい会話を始めますか？ 元に戻せません。',

    connTitle: 'API 接続', connNote: 'OpenAI 互換の /chat/completions 形式なら、どのサービスでも接続できます。選んだ接続が会話に使われます。',
    addProfile: '+ 接続を追加', preset: 'プリセット', custom: '直接入力', name: '名前', apiKey: 'API キー', model: 'モデル',
    fetchModels: '一覧を取得', extra: '追加パラメータ (JSON、任意)', pricing: '単価 (USD / 100万トークン)',
    priceInput: '入力', priceCached: 'キャッシュ入力', priceOutput: '出力', peak: '時間帯の割増を使う', multiplier: '倍率',
    utcHours: 'UTC の時間帯', weekdays: '平日のみ', pricingPage: '提供元の料金表',
    newProfile: '新しい接続', useForChat: '会話に使う', noModelSet: 'モデル未指定', noKey: ' · キーなし',
    keySaved: '保存済み (変えるには入力)', keyLocal: 'ローカルサーバーは空欄のまま', badJson: '追加パラメータが JSON 形式ではありません。',
    deleteProfile: 'この接続を削除しますか？ 使用記録は残ります。', modelsFound: 'モデルが {n} 個見つかりました。', local: 'ローカル',

    voiceTitle: '音声', engine: 'エンジン', engineSovits: 'アニメ風の声 (GPT-SoVITS、ローカルサーバー)', engineOpenai: '外部の音声 API (OpenAI 互換)', engineOff: 'オフ',
    sovitsNote: '最初の合成はサーバーの起動で時間がかかることがあります。参照音声は 3〜10 秒のきれいな音声がおすすめです。',
    refAudio: '参照音声ファイル', refText: '参照音声のセリフ', speed: '速さ', device: '実行デバイス',
    sovitsDir: 'GPT-SoVITS フォルダ', pythonPath: 'Python のパス', voiceModel: 'モデル', voiceName: '声', charPrice: '単価 (USD / 100万文字)',
    idle: '使わないときはオフ (分、0 は常にオン)',
    idleNote: '音声合成サーバーと音声認識は動いている間、メモリを数 GB 使います。この時間使わなければ止め、入力を始めたりマイクをオンにしたりすると先に起動し直します。',
    test: '試聴', voiceOff: '音声はオフです。',

    generalTitle: '一般', language: '言語 (Language)', persona: 'キャラクターの性格 (システムプロンプト)', personaReset: 'デフォルトに戻す',
    turns: '覚えておく会話のターン数', bubble: '吹き出しの表示時間 (秒)', budget: '月の予算 (USD、0 はオフ)', krw: 'ウォン/ドルの為替レート',
    webSearch: 'ウェブ検索を使う (DeepSeek Search、1,000回あたり $0.75)', proactive: '自分から話しかける (時間帯のあいさつ、毎正時の時報)',
    webNote: 'DeepSeek キーを保存した接続が必要です。検索すると1回の返事でモデルを何度も呼ぶので、トークンも多く使います。',
    shortcuts: 'グローバルショートカット', shortcutsNote: '欄をクリックしてキーの組み合わせを押してください。Backspace で消去、Esc でキャンセル。',
    scInput: '入力欄を開く', scToggle: '表示 / 非表示', scSd: 'SDモード切り替え', scQuick: '選択したテキストを処理', scVoice: '音声入力',
    scNone: 'なし', scPress: 'キーを押してください…', scFailed: '登録失敗 (ほかのアプリが使っている可能性があります): {names}',
    budgetBlock: '月の予算を超えたらリクエストを止める (/{cmd} で今回だけ送れます)', deepEffort: 'じっくり考えるときの推論の強さ (/{cmd})',
    effortMax: 'Max (最も深く、トークンを多く使います)', docsFolder: '文書フォルダ (/{cmd}、見つけた部分だけ API に送信)',
    briefing: '朝のブリーフィング', briefAuto: 'その日最初の起動時に自動で聞く (料金がかかります)', briefTopics: '調べる話題 (カンマ区切り、空なら検索しない)',
    briefTopicsHint: 'AI ニュース, 東京の天気', memory: '長期記憶 (/{cmd} で追加)', noMemories: '覚えていることはまだありません。',
    instructions: '追加の指示 (毎回のリクエストと一緒に送ります)', instructionsHint: '例: ユーザーの名前は春香。返事は短く。',
    modelDir: 'Live2D モデルフォルダ', modelDirMissing: '見つかりません — フォルダを指定してください', docsRead: '文書を {n} 件読みました。',

    updateTitle: 'アップデート', version: '現在のバージョン', check: 'アップデートを確認', apply: 'ダウンロードして再起動',
    updateNote: 'GitHub から新しいバージョンを受け取ってアプリを再起動します。設定、キー、会話履歴はそのまま残ります。音声エンジンや Electron が変わったバージョンは、受け取った後にセットアップスクリプトをもう一度実行する必要があります。アプリは起動時と6時間ごとに新しいバージョンを確認します。',
    notGit: 'git で受け取ったフォルダではないため、アプリからアップデートできません', checking: '確認中…', newChanges: '新しい変更が {n} 件あります。',
    upToDate: '最新バージョンです。', checkFailed: '確認できませんでした: {error}', downloading: '受け取り中…',
    rerunSetup: '受け取りました。アプリを終了して、セットアップスクリプト ({script}) を一度実行してください。', restarting: '受け取りました。再起動します…',
    updateFailed: 'アップデートできませんでした: {error}',

    credits: 'クレジット', creditModel: 'DeepSeek-chan Live2D モデル', creditModelBy: 'イラスト・PSDレイヤー分け: Kamiya Ryoko / Live2D リギング: 霓虹猫_NeonNeko',
    creditModelPage: '配布ページ (VGen)', creditVoice: '音声',
    creditVoiceText: '音声合成には、フリー素材キャラクター「つくよみちゃん」が無料公開している音声データを使用しています。',
    creditEngines: 'エンジン', creditNote: 'モデルと音声はそれぞれの配布元の規約に従います。このアプリはそれらを含まず、再配布もしません。',
  },
};

if (typeof module !== 'undefined') module.exports = S;
else (window.I18N_LOCALES = window.I18N_LOCALES || {}).ja = S;
})();
