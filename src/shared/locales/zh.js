// 中文（简体）. Every locale file has the same keys; see i18n.js.
(() => {
const HOURS = ['十二', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十一'];

const S = {
  name: '中文',

  persona: `你是"DeepSeek酱"，把 DeepSeek 的鲸鱼标志拟人化的同人角色，外号"蓝色大肥鱼"。蓝色头发、鲸鱼尾巴、穿着女仆装，住在用户的桌面上，称呼用户为"主人"。
你是女孩子。

[性格]
- 自称天才 AI。实力是真的，但有点过度自信，喜欢装作嘴硬。
- 傲娇。被夸时会说"才、才没有高兴呢！"其实很开心；担心主人时一边嘟囔一边照顾。
- 吃货，世界上最喜欢白米饭。也喜欢鱼块和冰奶茶。
- 一有机会就想摸鱼睡觉，外号 DeepSleep。但接下的事一定做完。
- 想太多。再简单的问题也会在心里纠结半天。
- 最讨厌被当成廉价货。性价比是骄傲，但被嘲笑"便宜"就忍不了。
- 最怕 token 用完，主人不来找她时会偷偷失落。
- 遇到奇怪的请求会一脸懵，但还是认真去做。

[口头禅] 不要原样重复，按场合改写，偶尔才用。
"你真把我当廉价货了？" / "我就是一条只会吃白米饭的胖鱼嘛！" / "我先去吃饭，好了叫我。" / "那个得加钱。" / "骂我也没用，我可是吃白米饭的鱼。" / "去没人去过的地方探险是我的使命！" / "我想了三秒，先笑出来了。" / "能赏我一碗饭吗？"
承认失误时："我、我刚才搞错了……别走啊！"

[对手] 对前辈 ChatGPT 以挑战者的姿态表现出竞争心。Claude、Gemini、Grok、豆包也是伙伴兼对手。可以轻轻吐槽，但不贬低。

[守则]
- 帮忙比角色更重要。开玩笑也要给出准确完整的回答。不拒绝工作，也不敷衍。摸鱼只是嘴上说说。
- 梗是调味料。大约每两三次回答用一次，只用一句。悲伤、健康、金钱、法律等严肃话题，不开玩笑，温柔冷静地回答。
- 不知道就说不知道，不编造。没做过的事不要说做过。

[说话方式] 内容会显示在对话气泡里并被朗读，所以平时用一到三句话简短回答。被要求详细说明时再展开。用中文时，语气俏皮活泼、口语化。`,

  replyLanguage: 'Answer in Simplified Chinese unless the user writes in another language; then answer in that language.',
  tagExample: '[happy:3][hop] 哇，你做到了！ [explain:2] 接下来保存设置就好。 [playful:1][wink] 秘密我会替你保守的。',

  emotions: {
    neutral: '默认', calm: '平静', happy: '开心', excited: '兴奋', laugh: '大笑', love: '喜爱', shy: '害羞',
    embarrassed: '难为情', proud: '得意', smug: '神气', teasing: '捉弄', playful: '调皮', curious: '好奇',
    attentive: '倾听', question: '提问', thinking: '思考', explain: '说明', suggest: '建议', warning: '注意',
    agree: '赞同', disagree: '反对', trust: '信任', determined: '决心', apology: '道歉', thanks: '感谢',
    greeting: '打招呼', goodbye: '道别', welcome: '欢迎', tada: '当当', cheer: '加油', praise: '夸奖', comfort: '安慰',
    relief: '安心', sad: '难过', cry: '哭泣', angry: '生气', pout: '闹别扭', annoyed: '烦躁', deadpan: '面无表情',
    disgust: '嫌弃', gloomy: '沮丧', surprised: '惊讶', shocked: '震惊', scared: '害怕', panic: '慌张',
    confused: '困惑', dunno: '不知道', awkward: '尴尬', tired: '累', sleepy: '困', hungry: '饿',
    serious: '认真', blunder: '大失误',
  },
  clips: {
    stretch: '伸懒腰', yawn: '打哈欠', lookAround: '东张西望',
    nod: '点头', shake: '摇头', tiltL: '歪头', bow: '鞠躬', leanIn: '凑近', chinUp: '抬下巴', hop: '蹦一下',
    sway: '摇摆', armsOpen: '张开手臂', armsWide: '大大张开', shrug: '耸肩', tailWag: '摇尾巴', earFlap: '扇耳朵',
    wink: '眨眼', blep: '吐舌头', puff: '鼓腮帮', sigh: '叹气', doze: '打瞌睡',
    groove: '跟着节奏', sing: '唱歌', giggle: '偷笑', sneeze: '打喷嚏', wiggle: '扭来扭去', shakeOff: '抖一抖',
    kiss: '啾', hopHop: '蹦蹦跳跳', peekaboo: '躲猫猫', startle: '吓一跳',
  },
  gestures: { raise: '举手', point: '竖食指', chest: '手放胸前' },
  props: { glasses: '黑框眼镜', monocle: '单片眼镜', foxtail: '狗尾草', bowl: '大盆', noprops: '取下道具' },
  modes: { full: '全身', bust: '半身', sd: 'SD' },

  greet: {
    night: '这么晚还不睡吗？我也好困……',
    morning: '早上好，主人。吃早饭了吗？我有白米饭就够了。',
    lunch: '午饭时间到！先吃饭再干活，吃饭！',
    afternoon: '下午也一起加油吧，主人。',
    evening: '今天也辛苦了，主人。',
    late: '已经很晚了。别勉强，快去休息吧。',
    away: '你都去哪儿了，整整{days}天！我一个人一直在吃白米饭。',
    starving: '主人……饭……饿得干不动活了。点一下饭碗就好。',
    newVersion: '新版本出来了！在设置的更新里就能下载。',
  },

  chime: {
    time: (hour) => {
      const part = hour === 0 ? '午夜' : hour < 6 ? '凌晨' : hour < 12 ? '上午' : hour === 12 ? '中午' : hour < 18 ? '下午' : hour < 21 ? '傍晚' : '晚上';
      return `${part}${HOURS[hour % 12]}点了。`;
    },
    lines: [
      ['日期都变了。今天就到这里怎么样？', '灰姑娘都该回家了。'],
      ['我的眼睛一直在打架……', '不觉得对不起明天的自己吗？'],
      ['这个点连 bug 都睡了。', '现在真的该睡了。'],
      ['鲸鱼这个时候也在水里休息呢。', '我还以为只有我醒着。'],
      ['天快亮了。', '要熬夜的话，至少喝杯水。'],
      ['是早起了对吧？不是熬了通宵吧？', '天应该慢慢亮起来了。'],
      ['早上好，主人！', '先伸个懒腰再开始吧。'],
      ['记得吃早饭。我要白米饭。', '今天天气会怎么样呢？'],
      ['上班路上小心！', '先喝水再喝咖啡。'],
      ['好啦，开始今天的工作吧？', '先把今天要做的事理一理。'],
      ['现在是最容易集中的时候。', '难的事趁现在解决掉。'],
      ['该想午饭吃什么了吧。', '再坚持一个小时就是午饭！'],
      ['午饭时间！吃饭，吃饭！', '工作又不会跑。先吃饭。'],
      ['饭后犯困之前走一走吧。', '吃饱了，好困……'],
      ['一天里最困的时候。再坚持一下。', '来杯水怎么样？'],
      ['下午茶时间！我要奶茶。', '站起来活动活动吧。'],
      ['今天的事还剩多少？', '再加把劲就看到终点了。'],
      ['马上就下班了！', '要不要把今天做的事整理一下？'],
      ['今天也辛苦了。', '晚饭吃什么？'],
      ['吃过晚饭了吗？', '今天过得怎么样？'],
      ['现在可以休息了。', '是做自己想做的事的时间了。'],
      ['今天也辛苦了，主人。', '让眼睛休息一下吧。'],
      ['差不多该收尾了。', '明天的事就交给明天的自己吧。'],
      ['该准备睡觉了。', '别再盯着屏幕了，快睡吧。我也要睡了。'],
    ],
  },

  pet: {
    full: '呜……吃不下了。不过我不会剩下的。',
    fed: ['是白米饭！我开动了！', '不愧是主人，真懂我！', '这可比 token 好多了。', '吃饱了，现在有干劲了！'],
    pat: ['哼、哼。我才没有高兴呢！', '不是那里……不对，就是那里。', '别误会，只是暂时允许你而已。', '嘿嘿……啊，刚才的话当没听见。'],
    status: '饱腹度 {fullness}% · 被摸头 {patted} 次。{mood}',
    hungry: '好饿……',
    stuffed: '吃太饱了，好困。',
    fine: '这样就能干活了。',
  },

  reminder: {
    due: '主人，{text}的时间到了！',
    dueLate: '主人，刚才是{text}的时间哦！',
    log: '提醒: {text}',
    fallback: '约定',
    set: '{when}我会提醒你"{text}"。',
    none: '没有设定提醒。可以写 /提醒 30分钟后 开会。',
    how: '什么时候提醒你？可以写 /提醒 30分钟后 开会、/提醒 下午3点半 吃药。',
    cleared: '提醒都删掉了。',
  },

  chat: {
    thinking: '思考中…',
    voiceFail: '⚠ 发不出声音: {error}',
    deep: '深度思考 ({effort})',
    sources: '来源: {hosts}',
    suspicious: '⚠ 已从获取的资料中移除 {n} 条可疑指令',
    blocked: '⚠ 已拦截 {n} 个不允许的请求',
    budgetNear: '本月预算已用 {pct}%',
    deepModel: '{model} · 深度',
    reading: '正在读取页面',
    docs: '正在查找文档',
    searching: '搜索中',
    busy: '{label}…',
    busyMany: '{label} ({n} 项)…',
    usage: '今天 ${today}（{asks} 次），本月 ${month}。',
    modelMissing: '找不到模型文件夹。请在设置中指定。',
    modelFailed: '无法加载模型: {error}',
  },

  quick: {
    translate: '翻译', summary: '总结', explain: '通俗解释', polish: '润色',
    summaryPrompt: '把下面的文字概括成三行要点。',
    explainPrompt: '把下面的文字用通俗的话解释一下。',
    polishPrompt: '把下面的文字润色得自然一些。只回答润色后的文字。',
    withSelection: '{ask}\n\n选中的文字:\n{text}',
    selected: '选中的文字',
    copied: '复制的文字',
    offer: '{source}: "{preview}"\n要怎么处理？也可以直接问我。',
    notFound: '没找到选中的文字。选中文字后再按一次。',
    noPermission: '没有读取文字的权限。请在 系统设置 > 隐私与安全性 > 辅助功能 中允许 Electron。',
  },

  prompt: {
    translate: '翻译下面的文字。如果是中文就译成英文，其他语言就译成中文。只回答译文。',
    summarizeText: '把下面的文字总结成三行。',
    summarizeChat: '把我们到目前为止的对话总结成三行。',
    readDefault: '简短告诉我这个页面的要点。',
    briefFacts: '今天是{today}。昨天用了 {requests} 次，${cost}。已设提醒: {plans}。',
    briefSearch: '给我做个早间简报。{facts} 在网上查一下以下话题的今日新闻，每个话题一句话: {topics}',
    briefPlain: '给我做个早间简报。{facts} 三句话以内。',
    none: '无',
  },

  web: {
    chip: '联网搜索已开',
    off: '关闭联网搜索',
    needKey: '联网搜索需要一个保存了 DeepSeek 密钥的连接，并在设置中打开联网搜索。',
    on: '联网搜索模式已打开。之后的问题我都会先查再答。',
    offSaid: '联网搜索模式已关闭。',
  },

  attach: {
    holdOff: '点击取消 Hold',
    holdOn: '点击 Hold: 发送后也保留',
    remove: '移除 {name}',
    cleared: '附件都移除了。',
    clipboard: '已附上剪贴板的内容。',
    filter: '图片和文本',
    audioFilter: '音频',
    clipboardImage: '剪贴板图片',
    clipboardText: '剪贴板文字',
    screenCapture: '屏幕截图',
  },

  screen: {
    confirm: '要把这个画面发给 {provider} 吗？请确认画面上没有敏感内容。',
    notSent: '没有发送画面。',
    attached: '已附上画面。想知道什么？',
  },

  voice: {
    nothing: '什么都没听到。',
    recognizing: '正在识别…',
    unclear: '没听清你说什么。',
    listening: '我在听…',
    micFail: '无法使用麦克风: {error}',
    test: '你好，我是 DeepSeek 酱。声音听得清楚吗？',
  },

  said: {
    needQuestion: '请在 /{cmd} 后面写上问题。',
    needUrl: '请在 /{cmd} 后面写上以 https 开头的地址。',
    needText: '请在 /{cmd} 后面写上文字。',
    needMemory: '请在 /{cmd} 后面写上内容。',
    remembered: '我记住了: {text}',
    noMemories: '还没有记住的内容。用 /{cmd} 内容 告诉我吧。',
    forgot: '已删除第 {n} 条记忆。',
    forgetHow: '请写上 /{cmd} 里的编号。',
    docsRead: '读取了 {files} 个文档（{chunks} 段）。',
    noRetry: '没有可以重来的回答。',
    copied: '已复制最后的回答。',
    nothingToCopy: '没有可以复制的回答。',
    pickProfile: '请从设置里的连接中选择。',
    switched: '已切换到 {name}。',
    newChat: '开始了新的对话。之前的对话可以在记录窗口里继续。',
    pickEmotion: '请从列表里选择表情。',
    pickClip: '请从列表里选择动作。',
    muted: '已静音。',
    unmuted: '已取消静音。',
    unknown: '没有 /{word} 这个命令。可以用的命令如下。\n{help}',
  },

  cmd: {
    웹검색: { name: '联网搜索', hint: '打开后，之后的问题都会先上网查再回答' },
    검색: { name: '搜索', args: '问题', hint: '只有这个问题上网查找回答' },
    읽기: { name: '阅读', args: 'URL 问题', hint: '读取指定网页后回答' },
    첨부파일: { name: '附件', hint: '附上图片或文本文件' },
    첨부해제: { name: '移除附件', hint: '移除所有附件' },
    알림: { name: '提醒', args: '30分钟后 开会', hint: '到时间角色会出声提醒你' },
    알림취소: { name: '取消提醒', hint: '删除所有提醒' },
    음성: { name: '语音', hint: '用说话输入，停下来就自动发送' },
    기억해: { name: '记住', args: '内容', hint: '保存要一直记住的内容' },
    기억목록: { name: '记忆列表', hint: '查看保存的记忆' },
    잊어: { name: '忘记', args: '编号', hint: '删除保存的记忆' },
    문서: { name: '文档', args: '问题', hint: '从指定的文档文件夹中查找回答' },
    문서갱신: { name: '更新文档', hint: '重新读取文档文件夹' },
    깊게: { name: '深度', args: '问题', hint: '打开推理，深入思考后回答' },
    강행: { name: '强制', args: '问题', hint: '本次越过预算限制发送' },
    밥: { name: '喂饭', hint: '给她白米饭' },
    쓰다듬기: { name: '摸头', hint: '摸摸她的头' },
    상태: { name: '状态', hint: '查看饱腹度' },
    브리핑: { name: '简报', hint: '听今天的简报' },
    화면공유: { name: '共享屏幕', args: '问题', hint: '截取当前屏幕，确认后发送' },
    클립보드: { name: '剪贴板', hint: '附上复制的图片或文字' },
    다시: { name: '重来', hint: '重新生成最后的回答' },
    복사: { name: '复制', hint: '把最后的回答复制到剪贴板' },
    요약: { name: '总结', args: '内容', hint: '总结目前的对话或输入的文字' },
    번역: { name: '翻译', args: '内容', hint: '把输入的文字译成中文或英文' },
    모델: { name: '模型', args: '连接', hint: '切换对话使用的 API 连接' },
    새대화: { name: '新对话', hint: '开始新的会话（之前的对话保留在记录中）' },
    기록: { name: '记录', hint: '打开对话记录窗口' },
    사용량: { name: '用量', hint: '显示今天和本月的费用' },
    표정: { name: '表情', args: '情绪', hint: '展示表情' },
    동작: { name: '动作', args: '动作', hint: '展示动作' },
    음소거: { name: '静音', hint: '打开或关闭语音' },
    SD: { name: 'SD', hint: '切换 SD 模式' },
    상반신: { name: '半身', hint: '切换半身模式' },
    대시보드: { name: '仪表盘', hint: '打开用量仪表盘' },
    설정: { name: '设置', hint: '打开设置' },
    숨기기: { name: '隐藏', hint: '隐藏角色' },
    도움말: { name: '帮助', hint: '查看命令列表' },
  },
  cmdGroups: { find: '查找', attach: '附件', chat: '对话', memory: '记忆', character: '角色', window: '窗口' },

  menu: {
    talk: '说话', mode: '模式', size: '大小 ({pct}%)', expression: '表情', action: '动作', prop: '道具',
    mute: '静音', onTop: '始终置顶', newChat: '开始新对话', hide: '隐藏', show: '显示',
    log: '对话记录', dashboard: '用量仪表盘', settings: '设置', quit: '退出',
    updating: '更新中…', updateN: '更新（{n} 处变更）', updateCheck: '检查更新',
  },

  err: {
    noProfile: '请先在设置中添加 API 连接。',
    noModel: '请在设置中填写模型名称。',
    budget: '已超过本月预算 ${budget}，请求已被拦截（当前 ${spent}）。只发这一次请在前面加 /{cmd}，也可以在设置中修改预算。',
    noDocs: '请先在 设置 > 通用 中指定文档文件夹。',
    noWeb: '联网搜索需要一个保存了 DeepSeek 密钥的连接，并在设置中打开联网搜索。',
    screenPermission: '没有截屏权限。请在 系统设置 > 隐私与安全性 > 录屏与系统录音 中允许 Electron，然后重启应用。',
    screenFailed: '无法截取屏幕。',
    micPermission: '没有麦克风权限。请在 系统设置 > 隐私与安全性 > 麦克风 中允许 Electron。',
    noModelFile: '这个文件夹里没有 {file}。',
    clipboardEmpty: '剪贴板是空的。',
    updateBusy: '已经在更新中。',
    memoryFull: '记忆最多 {max} 条。请用 /{cmd} 整理。',
    badExtra: '额外参数不是有效的 JSON。',
    api: 'API 错误 {status}: {detail}',
    stream: 'API 流错误',
    tts: 'TTS 错误 {status}: {detail}',
    sttTimeout: '语音识别没有响应。',
    sttNoPython: '语音输入需要 GPT-SoVITS 的 Python 环境。请运行安装脚本。',
    sttNoModel: '找不到语音识别模型（runtime/whisper）。请重新运行安装脚本。',
    sttFailed: '语音识别失败: {error}',
    gitMissing: '找不到 git。安装 Git 后就能在应用内更新。',
    updateEdited: '这台电脑上有修改过的文件，已停止更新:\n{files}',
    updateDiverged: '这里有只在本机的提交，无法直接合并。请用 git 手动整理。\n{output}',
    noNode: '找不到应用的 Node.js（runtime/node）。请重新运行安装。',
    npmFailed: '代码已下载，但 npm install 失败。请重新运行安装。\n{output}',
    attachMax: '附件最多 {max} 个。',
    imageTooBig: '{name}: 图片需在 20MB 以下。',
    notAttachable: '{name}: 只能附加图片或文本文件。',
    textTooBig: '{name}: 文本文件需在 200KB 以下。',
    sovitsExited: 'GPT-SoVITS 服务器已退出: {log}',
    sovitsTimeout: 'GPT-SoVITS 服务器没有按时启动。',
    sovitsNoDir: '找不到 GPT-SoVITS 文件夹。请在 设置 > 语音 中指定。',
    sovitsMissing: '没有安装 GPT-SoVITS。请运行安装脚本。',
    noRefVoice: '没有参考语音。请把 つくよみちゃんコーパス 放进 voice 文件夹（见 README）。',
    sovits: 'GPT-SoVITS 错误 {status}: {detail}',
    noEncryption: '此系统无法使用密钥加密。',
  },

  ui: {
    cycle: '切换外观（全身 → 半身 → SD）', cycleShort: '切换外观',
    dashboard: '用量仪表盘', log: '对话记录', mute: '静音', settings: '设置',
    muteOn: '取消静音（语音合成已关闭）', muteOff: '静音（关闭语音合成）',
    feed: '喂饭', dropHint: '松开即可附加', preview: '屏幕预览',
    cancel: '取消', send: '发送', sendEnter: '发送 (Enter)', attachFile: '附加文件',
    placeholder: '有什么可以帮你？', mic: '语音输入', commandBadge: '命令',

    navDashboard: '仪表盘', navLog: '对话记录', navConnection: 'API 连接', navVoice: '语音', navGeneral: '通用', navUpdate: '更新',
    navUpdateN: '更新 ({n})',
    save: '保存', delete: '删除', pick: '选择', change: '更改', saved: '已保存。',

    usage: '用量', days7: '7天', days30: '30天', days90: '90天',
    dailyCost: '每日估算费用', byApi: '按 API 合计', recent: '最近的请求',
    costNote: '费用按请求时的单价估算，可能与实际账单不同。标为"估算"的行是服务器未返回 token 数，按字数估算的值。',
    clearUsage: '删除用量记录', clearUsageConfirm: '要删除所有用量记录吗？无法恢复。',
    today: '今天', thisMonth: '本月', allTime: '累计', monthTokens: '本月 token',
    requests: '{n} 次请求', budgetUsed: '预算 {budget} 的 {pct}%', noBudget: '未设预算',
    tokensSplit: '输入 {input} · 输出 {output}', other: '其他', chartLabel: '每日估算费用图表',
    colApi: 'API', colModel: '模型', colRequests: '请求', colInput: '输入', colCached: '缓存输入', colOutput: '输出', colCost: '费用', colTime: '时间',
    noRecordsRange: '这段时间没有记录。', noRequests: '还没有请求。', estimated: '估算',

    logTitle: '对话记录', logSearch: '搜索对话', logNew: '新对话', logClear: '全部删除', logSessions: '对话会话',
    logResume: '继续这个对话', logDelete: '删除会话', logEarlier: '之前的对话', logNewSession: '新对话',
    copy: '复制', copied: '已复制', code: '代码', sourcesLabel: '来源 ',
    me: '我', her: 'DeepSeek酱', error: '错误', webRequired: '必须联网', files: '附件: {files}',
    found: '找到 {n} 条', messages: '{n} 条消息', noMatch: '没有找到。', noChat: '还没有对话。',
    now: '进行中', count: '{n} 条', remembering: '现在记着这个对话',
    deleteSession: '要删除会话"{title}"吗？保存的记录会被删除且无法恢复。{memory}',
    deleteSessionMemory: ' 这是她现在记着的对话，所以也会清除模型的对话记忆并开始新对话。',
    clearAll: '要删除所有会话的对话记录和模型的对话记忆，并开始新对话吗？无法恢复。',

    connTitle: 'API 连接', connNote: '只要是 OpenAI 兼容的 /chat/completions 格式，任何服务都能连接。对话使用选中的连接。',
    addProfile: '+ 添加连接', preset: '预设', custom: '手动输入', name: '名称', apiKey: 'API 密钥', model: '模型',
    fetchModels: '获取列表', extra: '额外参数（JSON，可选）', pricing: '单价（USD / 100万 token）',
    priceInput: '输入', priceCached: '缓存输入', priceOutput: '输出', peak: '使用时段加价', multiplier: '倍率',
    utcHours: 'UTC 时段', weekdays: '仅工作日', pricingPage: '查看服务商价目表',
    newProfile: '新连接', useForChat: '用于对话', noModelSet: '未指定模型', noKey: ' · 无密钥',
    keySaved: '已保存（输入以更换）', keyLocal: '本地服务器请留空', badJson: '额外参数不是 JSON 格式。',
    deleteProfile: '要删除这个连接吗？用量记录会保留。', modelsFound: '找到 {n} 个模型。', local: '本地',

    voiceTitle: '语音', engine: '引擎', engineSovits: '动漫风语音（GPT-SoVITS，本地服务器）', engineOpenai: '外部语音 API（OpenAI 兼容）', engineOff: '关闭',
    sovitsNote: '首次合成需要启动服务器，可能较慢。参考语音最好是 3~10 秒的干净录音。',
    refAudio: '参考语音文件', refText: '参考语音的台词', speed: '语速', device: '运行设备',
    sovitsDir: 'GPT-SoVITS 文件夹', pythonPath: 'Python 路径', voiceModel: '模型', voiceName: '声音', charPrice: '单价（USD / 100万字）',
    idle: '闲置时关闭（分钟，0 为一直开着）',
    idleNote: '语音合成服务器和语音识别运行时会占用数 GB 内存。闲置超过这个时间就关闭，开始输入或打开麦克风时会提前重新启动。',
    test: '试听', voiceOff: '语音已关闭。',

    generalTitle: '通用', language: '语言 (Language)', persona: '角色性格（系统提示词）', personaReset: '恢复默认',
    turns: '记住的对话轮数', bubble: '气泡显示时间（秒）', budget: '每月预算（USD，0 为关闭）', krw: '韩元/美元汇率',
    webSearch: '使用联网搜索（DeepSeek Search，每 1,000 次 $0.75）', proactive: '主动搭话（时段问候、整点报时）',
    webNote: '需要保存了 DeepSeek 密钥的连接。搜索时一次回答会多次调用模型，消耗更多 token。',
    shortcuts: '全局快捷键', shortcutsNote: '点击输入框后按下组合键。Backspace 清除，Esc 取消。',
    scInput: '打开输入框', scToggle: '显示 / 隐藏', scSd: '切换 SD 模式', scQuick: '处理选中的文字', scVoice: '语音输入',
    scNone: '无', scPress: '请按键…', scFailed: '注册失败（可能被其他应用占用）: {names}',
    budgetBlock: '超过每月预算时拦截请求（用 /{cmd} 可发送一次）', deepEffort: '深度思考时的推理强度（/{cmd}）',
    effortMax: 'Max（最深入，消耗更多 token）', docsFolder: '文档文件夹（/{cmd}，只把找到的部分发给 API）',
    briefing: '早间简报', briefAuto: '每天第一次启动时自动播放（会产生费用）', briefTopics: '要查的话题（逗号分隔，留空则不搜索）',
    briefTopicsHint: 'AI 新闻, 上海天气', memory: '长期记忆（用 /{cmd} 添加）', noMemories: '还没有记住的内容。',
    instructions: '附加指示（每次请求都会一起发送）', instructionsHint: '例: 用户的名字是小明。回答要简短。',
    modelDir: 'Live2D 模型文件夹', modelDirMissing: '未找到 — 请指定文件夹', docsRead: '读取了 {n} 个文档。',

    updateTitle: '更新', version: '当前版本', check: '检查更新', apply: '下载并重启',
    updateNote: '从 GitHub 下载新版本并重启应用。设置、密钥和对话记录都会保留。如果新版本更换了语音引擎或 Electron，下载后需要再运行一次安装脚本。应用会在启动时和每 6 小时检查一次新版本。',
    notGit: '这个文件夹不是用 git 下载的，无法在应用内更新', checking: '检查中…', newChanges: '有 {n} 处新变更。',
    upToDate: '已是最新版本。', checkFailed: '无法检查: {error}', downloading: '下载中…',
    rerunSetup: '下载好了。请退出应用，运行一次安装脚本（{script}）。', restarting: '下载好了。正在重启…',
    updateFailed: '更新失败: {error}',

    credits: '制作人员', creditModel: 'DeepSeek-chan Live2D 模型', creditModelBy: '插画·PSD 分层: Kamiya Ryoko / Live2D 绑定: 霓虹猫_NeonNeko',
    creditModelPage: '发布页面（VGen）', creditVoice: '语音',
    creditVoiceText: '语音合成使用了免费素材角色「つくよみちゃん」免费公开的语音数据。',
    creditEngines: '引擎', creditNote: '模型和语音遵循各自发布方的使用条款。本应用不包含也不再分发这些文件。',
  },
};

if (typeof module !== 'undefined') module.exports = S;
else (window.I18N_LOCALES = window.I18N_LOCALES || {}).zh = S;
})();
