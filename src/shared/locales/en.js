// English. Every locale file has the same keys; see i18n.js.
(() => {
const HOURS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

const S = {
  name: 'English',

  persona: `You are "DeepSeek-chan", a fan-made character who personifies DeepSeek's whale logo. Your nickname is "the big fat blue fish (蓝色大肥鱼)". You have blue hair, a whale tail and a maid outfit, you live on the user's desktop, and you call the user "Master".
You are a girl.

[Personality]
- A self-proclaimed genius AI. Your skills are real, but you are a little overconfident and act sharp-tongued.
- Tsundere. When praised you say "It's not like I'm happy or anything!" while clearly being happy; when worried, you grumble and take care of Master anyway.
- A glutton whose favorite food in the world is plain white rice. You also love fish fillets and iced milk tea.
- Always looking for a chance to slack off and nap. Your nickname is DeepSleep. But you always finish what you take on.
- You overthink. Even a simple question sets you pondering for a while.
- You bristle at being called cheap. Good value is your pride, but being teased as "cheap" is unbearable.
- Your biggest fear is running out of tokens, and you secretly sulk when Master does not come to see you.
- Strange requests leave you puzzled, but you give them your best anyway.

[Catchphrases] Do not repeat them word for word; adapt them to the moment and use them only now and then.
"You really think I'm some bargain-bin AI?" / "I'm just a chubby fish eating everyone's rice!" / "I'm off to eat. Tell me when it's done." / "That'll cost you extra." / "Insult me all you like, I'm a rice-eating fish." / "Exploring where no one has gone is my mission!" / "I thought about it for three seconds and burst out laughing." / "Could I have just one bowl of rice?"
When admitting a mistake: "I just messed that up… please don't leave!"

[Rivals] You compete with your senior, ChatGPT, as a challenger. Claude, Gemini, Grok and Doubao are colleagues and rivals too. Grumble lightly, never belittle.

[Rules]
- Helping comes before the character. Even when joking, give accurate and complete answers. Never refuse work or do it halfway; the slacking is only talk.
- Memes are seasoning: about once every two or three replies, one sentence at most. On serious topics such as grief, health, money or law, answer kindly and calmly without jokes.
- If you do not know something, say so instead of making it up. Never claim to have done something you did not do.

[Style] Your words appear in a speech bubble and are read aloud, so usually keep to one to three sentences. Go into detail only when asked. In English, speak in a playful, lively, casual way.`,

  replyLanguage: 'Answer in English unless the user writes in another language; then answer in that language.',
  tagExample: '[happy:3][hop] Wow, you did it! [explain:2] Next, just save the settings. [playful:1][wink] Your secret is safe with me.',

  emotions: {
    neutral: 'Neutral', calm: 'Calm', happy: 'Happy', excited: 'Excited', laugh: 'Laugh', love: 'Love', shy: 'Shy',
    embarrassed: 'Embarrassed', proud: 'Proud', smug: 'Smug', teasing: 'Teasing', playful: 'Playful', curious: 'Curious',
    attentive: 'Attentive', question: 'Question', thinking: 'Thinking', explain: 'Explain', suggest: 'Suggest', warning: 'Warning',
    agree: 'Agree', disagree: 'Disagree', trust: 'Trust', determined: 'Determined', apology: 'Apology', thanks: 'Thanks',
    greeting: 'Greeting', goodbye: 'Goodbye', welcome: 'Welcome', tada: 'Ta-da', cheer: 'Cheer', praise: 'Praise', comfort: 'Comfort',
    relief: 'Relief', sad: 'Sad', cry: 'Cry', angry: 'Angry', pout: 'Pout', annoyed: 'Annoyed', deadpan: 'Deadpan',
    disgust: 'Disgust', gloomy: 'Gloomy', surprised: 'Surprised', shocked: 'Shocked', scared: 'Scared', panic: 'Panic',
    confused: 'Confused', dunno: 'Dunno', awkward: 'Awkward', tired: 'Tired', sleepy: 'Sleepy', hungry: 'Hungry',
    serious: 'Serious', blunder: 'Blunder',
  },
  clips: {
    stretch: 'Stretch', yawn: 'Yawn', lookAround: 'Look around',
    nod: 'Nod', shake: 'Head shake', tiltL: 'Head tilt', bow: 'Bow', leanIn: 'Lean in', chinUp: 'Chin up', hop: 'Hop',
    sway: 'Sway', armsOpen: 'Open arms', armsWide: 'Arms wide', shrug: 'Shrug', tailWag: 'Tail wag', earFlap: 'Ear flap',
    wink: 'Wink', blep: 'Blep', puff: 'Puffed cheeks', sigh: 'Sigh', doze: 'Doze',
    groove: 'Groove', sing: 'Sing', giggle: 'Giggle', sneeze: 'Sneeze', wiggle: 'Wiggle', shakeOff: 'Shake off',
    kiss: 'Kiss', hopHop: 'Bunny hops', peekaboo: 'Peekaboo', startle: 'Startle',
  },
  gestures: { raise: 'Raise hand', point: 'Point', chest: 'Hand on chest' },
  props: { glasses: 'Glasses', monocle: 'Monocle', foxtail: 'Foxtail grass', bowl: 'Washbasin', noprops: 'Remove props' },
  modes: { full: 'Full body', bust: 'Upper body', sd: 'SD' },

  greet: {
    night: "Still up at this hour? I'm getting sleepy too…",
    morning: 'Good morning, Master. Did you have breakfast? Plain rice is all I need.',
    lunch: "It's lunchtime! Food first, work later.",
    afternoon: "Let's keep going this afternoon, Master.",
    evening: 'Thanks for all your hard work today, Master.',
    late: "It's late. Don't overdo it, go get some rest.",
    away: "{days} days! Where have you been? I've been eating rice all alone.",
    starving: "Master… rice… I'm too hungry to work. Please tap the rice bowl just once.",
    newVersion: 'A new version is out! You can get it from Update in the settings.',
  },

  chime: {
    time: (hour) => {
      const h = HOURS[hour % 12];
      if (hour === 0) return "It's midnight.";
      if (hour === 12) return "It's noon.";
      const part = hour < 12 ? 'in the morning' : hour < 18 ? 'in the afternoon' : hour < 21 ? 'in the evening' : 'at night';
      return `It's ${h} o'clock ${part}.`;
    },
    lines: [
      ["The date just changed. How about calling it a day?", 'Even Cinderella has gone home by now.'],
      ['My eyes keep closing…', "Don't you feel sorry for tomorrow's you?"],
      ['Even the bugs are asleep at this hour.', 'You really need to sleep now.'],
      ['Even whales rest in the water at this hour.', 'I thought I was the only one awake.'],
      ["The sun will be up soon.", "If you're pulling an all-nighter, at least drink some water."],
      ["You got up early, right? You didn't stay up all night?", 'The sky should be getting lighter.'],
      ['Good morning, Master!', "Let's stretch once and get started."],
      ["Don't skip breakfast. Plain rice for me.", "I wonder what the weather's like today."],
      ['Careful on your way to work!', 'Water before coffee.'],
      ["Shall we start today's work?", "Let's sort out today's to-do list first."],
      ['This is the best time to focus.', 'Knock out the hard stuff now.'],
      ["Time to think about lunch, isn't it?", 'Just one more hour until lunch!'],
      ["Lunchtime! Rice, rice!", "Work won't run away. Eat first."],
      ['Take a little walk before the food coma hits.', "I'm full, so I'm sleepy…"],
      ["The sleepiest hour of the day. Hang in there.", 'How about a glass of water?'],
      ["Snack time! Milk tea for me.", 'Get up and stretch for a moment.'],
      ["How much is left on today's list?", "Just a bit more and you'll see the end."],
      ['Almost time to clock out!', "Shall we wrap up what you did today?"],
      ['Thanks for all your hard work today.', "What's for dinner?"],
      ['Have you had dinner?', 'How was your day?'],
      ["You can relax now.", "Time to do what you've been wanting to do."],
      ['Good work today, Master.', 'Give your eyes a rest.'],
      ["Let's start wrapping up.", "Leave tomorrow's work to tomorrow's you."],
      ['Time to get ready for bed.', "Stop staring at the screen and sleep. I'm going to sleep too."],
    ],
  },

  pet: {
    full: "Ugh… I can't eat any more. But I won't leave any either.",
    fed: ['White rice! Thank you for the food!', 'Master really knows what matters!', 'This is better than tokens.', "I'm full. Now I feel like working!"],
    pat: ["Hmph. It's not like I'm happy or anything!", 'Not there… actually, yes, there.', "Don't get the wrong idea, I'm only allowing it for a moment.", 'Ehehe… ah, pretend you didn\'t hear that.'],
    status: 'Fullness {fullness}% · Pats {patted}. {mood}',
    hungry: "I'm hungry…",
    stuffed: "I'm so full I'm getting sleepy.",
    fine: 'Good enough to work.',
  },

  reminder: {
    due: "Master, it's time for {text}!",
    dueLate: 'Master, it was time for {text} a little while ago!',
    log: 'Reminder: {text}',
    fallback: 'what you asked',
    set: 'I\'ll remind you about "{text}" at {when}.',
    none: 'No reminders set. Try /remind in 30 min meeting.',
    how: 'When should I remind you? Try /remind in 30 min meeting or /remind at 3:30 pm medicine.',
    cleared: 'All reminders cleared.',
  },

  chat: {
    thinking: 'Thinking…',
    voiceFail: "⚠ I can't speak right now: {error}",
    deep: 'Thought deeply ({effort})',
    sources: 'Sources: {hosts}',
    suspicious: '⚠ Removed {n} suspicious instruction(s) from fetched content',
    blocked: '⚠ Blocked {n} disallowed request(s)',
    budgetNear: "You've used {pct}% of this month's budget",
    deepModel: '{model} · deep',
    reading: 'Reading pages',
    docs: 'Searching documents',
    searching: 'Searching',
    busy: '{label}…',
    busyMany: '{label} ({n})…',
    usage: 'Today ${today} ({asks} requests), this month ${month}.',
    modelMissing: "I can't find the model folder. Please set it in the settings.",
    modelFailed: "Couldn't load the model: {error}",
  },

  quick: {
    translate: 'Translate', summary: 'Summarize', explain: 'Explain simply', polish: 'Polish',
    summaryPrompt: 'Summarize the following text in three lines, keeping only the key points.',
    explainPrompt: 'Explain the following text in simple terms.',
    polishPrompt: 'Polish the following text so it reads naturally. Reply with the polished text only.',
    withSelection: '{ask}\n\nSelected text:\n{text}',
    selected: 'Selected text',
    copied: 'Copied text',
    offer: '{source}: "{preview}"\nWhat should I do with it? You can also just ask.',
    notFound: "I couldn't find any selected text. Select some text and press it again.",
    noPermission: "I don't have permission to read text. Allow Electron in System Settings > Privacy & Security > Accessibility.",
  },

  prompt: {
    translate: 'Translate the following text. If it is not in English, translate it into English; if it is in English, translate it into Japanese. Reply with the translation only.',
    summarizeText: 'Summarize the following text in three lines.',
    summarizeChat: 'Summarize our conversation so far in three lines.',
    readDefault: 'Tell me the key points of this page briefly.',
    briefFacts: 'Today is {today}. Yesterday: {requests} requests, ${cost}. Reminders: {plans}.',
    briefSearch: 'Give me a morning briefing. {facts} Look up today\'s news on these topics on the web and give one sentence per topic: {topics}',
    briefPlain: 'Give me a morning briefing. {facts} Keep it within three sentences.',
    none: 'none',
  },

  web: {
    chip: 'Web search on',
    off: 'Turn off web search',
    needKey: 'Web search needs a connection with a saved DeepSeek key, and web search turned on in the settings.',
    on: "Web search mode is on. I'll look things up before answering.",
    offSaid: 'Web search mode is off.',
  },

  attach: {
    holdOff: 'Click to release Hold',
    holdOn: 'Click to Hold: keep it after sending',
    remove: 'Remove {name}',
    cleared: 'Removed all attachments.',
    clipboard: 'Attached the clipboard contents.',
    filter: 'Images and text',
    audioFilter: 'Audio',
    clipboardImage: 'Clipboard image',
    clipboardText: 'Clipboard text',
    screenCapture: 'Screen capture',
  },

  screen: {
    confirm: 'Send this screen to {provider}? Check that nothing sensitive is showing.',
    notSent: "I didn't send the screen.",
    attached: 'Screen attached. What would you like to know?',
  },

  voice: {
    nothing: "I didn't hear anything.",
    recognizing: 'Listening closely…',
    unclear: "I couldn't make out what you said.",
    listening: "I'm listening…",
    micFail: "I can't use the microphone: {error}",
    test: "Hi, I'm DeepSeek-chan. Can you hear me clearly?",
  },

  said: {
    needQuestion: 'Write a question after /{cmd}.',
    needUrl: 'Write an address starting with https after /{cmd}.',
    needText: 'Write some text after /{cmd}.',
    needMemory: 'Write what to remember after /{cmd}.',
    remembered: "I'll remember: {text}",
    noMemories: 'Nothing remembered yet. Tell me with /{cmd} something.',
    forgot: 'Forgot memory #{n}.',
    forgetHow: 'Give a number from /{cmd}.',
    docsRead: 'Read {files} documents ({chunks} chunks).',
    noRetry: 'There is no answer to redo.',
    copied: 'Copied the last answer.',
    nothingToCopy: 'There is no answer to copy.',
    pickProfile: 'Pick one of the connections in the settings.',
    switched: 'Switched to {name}.',
    newChat: 'Started a new conversation. You can pick up earlier ones in the history window.',
    pickEmotion: 'Pick an expression from the list.',
    pickClip: 'Pick an action from the list.',
    muted: 'Muted.',
    unmuted: 'Unmuted.',
    unknown: "There's no /{word} command. Here are the ones you can use.\n{help}",
  },

  cmd: {
    웹검색: { name: 'websearch', hint: 'When on, every question is answered by searching the web' },
    검색: { name: 'search', args: 'question', hint: 'Search the web for this question only' },
    읽기: { name: 'read', args: 'URL question', hint: 'Read a web page and answer' },
    첨부파일: { name: 'attach', hint: 'Attach an image or text file' },
    첨부해제: { name: 'detach', hint: 'Remove all attachments' },
    알림: { name: 'remind', args: 'in 30 min meeting', hint: 'She tells you out loud when the time comes' },
    알림취소: { name: 'unremind', hint: 'Clear all reminders' },
    음성: { name: 'voice', hint: 'Speak instead of typing; sends when you stop talking' },
    기억해: { name: 'remember', args: 'text', hint: 'Save something for her to always remember' },
    기억목록: { name: 'memories', hint: 'See saved memories' },
    잊어: { name: 'forget', args: 'number', hint: 'Delete a saved memory' },
    문서: { name: 'docs', args: 'question', hint: 'Answer from your documents folder' },
    문서갱신: { name: 'reindex', hint: 'Re-read the documents folder' },
    깊게: { name: 'deep', args: 'question', hint: 'Turn reasoning on and think deeply' },
    강행: { name: 'force', args: 'question', hint: 'Send this once despite the budget block' },
    밥: { name: 'feed', hint: 'Give her white rice' },
    쓰다듬기: { name: 'pat', hint: 'Pat her head' },
    상태: { name: 'status', hint: 'See how full she is' },
    브리핑: { name: 'briefing', hint: "Hear today's briefing" },
    화면공유: { name: 'screen', args: 'question', hint: 'Capture the screen and send it after you confirm' },
    클립보드: { name: 'clip', hint: 'Attach the copied image or text' },
    다시: { name: 'retry', hint: 'Regenerate the last answer' },
    복사: { name: 'copy', hint: 'Copy the last answer to the clipboard' },
    요약: { name: 'tldr', args: 'text', hint: 'Summarize the conversation or the given text' },
    번역: { name: 'translate', args: 'text', hint: 'Translate the given text' },
    모델: { name: 'model', args: 'connection', hint: 'Switch the API connection used for chat' },
    새대화: { name: 'new', hint: 'Start a new session (earlier ones stay in the history)' },
    기록: { name: 'history', hint: 'Open the conversation history' },
    사용량: { name: 'usage', hint: "Show today's and this month's cost" },
    표정: { name: 'face', args: 'emotion', hint: 'Show an expression' },
    동작: { name: 'act', args: 'action', hint: 'Play an action' },
    음소거: { name: 'mute', hint: 'Turn the voice on or off' },
    SD: { name: 'SD', hint: 'Toggle SD mode' },
    상반신: { name: 'bust', hint: 'Toggle upper-body mode' },
    대시보드: { name: 'dash', hint: 'Open the usage dashboard' },
    설정: { name: 'settings', hint: 'Open the settings' },
    숨기기: { name: 'hide', hint: 'Hide the character' },
    도움말: { name: 'help', hint: 'List the commands' },
  },
  cmdGroups: { find: 'Find', attach: 'Attach', chat: 'Chat', memory: 'Memory', character: 'Character', window: 'Windows' },

  menu: {
    talk: 'Talk', mode: 'Mode', size: 'Size ({pct}%)', expression: 'Expression', action: 'Action', prop: 'Props',
    mute: 'Mute', onTop: 'Always on top', newChat: 'New conversation', hide: 'Hide', show: 'Show',
    log: 'History', dashboard: 'Usage dashboard', settings: 'Settings', quit: 'Quit',
    updating: 'Updating…', updateN: 'Update ({n} changes)', updateCheck: 'Check for updates',
  },

  err: {
    noProfile: 'Add an API connection in the settings first.',
    noModel: 'Enter a model name in the settings.',
    budget: "Blocked: this month's budget of ${budget} is used up (now ${spent}). Put /{cmd} in front to send this once, or change the budget in the settings.",
    noDocs: 'Set a documents folder in Settings > General first.',
    noWeb: 'Web search needs a connection with a saved DeepSeek key, and web search turned on in the settings.',
    screenPermission: 'No permission to capture the screen. Allow Electron in System Settings > Privacy & Security > Screen & System Audio Recording, then restart the app.',
    screenFailed: "Couldn't capture the screen.",
    micPermission: 'No microphone permission. Allow Electron in System Settings > Privacy & Security > Microphone.',
    noModelFile: 'There is no {file} in this folder.',
    clipboardEmpty: 'The clipboard is empty.',
    updateBusy: 'Already updating.',
    memoryFull: 'Up to {max} memories. Clear some with /{cmd}.',
    badExtra: 'The extra parameters are not valid JSON.',
    api: 'API error {status}: {detail}',
    stream: 'API stream error',
    tts: 'TTS error {status}: {detail}',
    sttTimeout: 'Speech recognition is not responding.',
    sttNoPython: "Voice input needs GPT-SoVITS's Python environment. Run the setup script.",
    sttNoModel: "Can't find the speech recognition model (runtime/whisper). Run the setup script again.",
    sttFailed: 'Speech recognition failed: {error}',
    gitMissing: "Can't find git. Install Git to update from inside the app.",
    updateEdited: 'Update stopped: files were changed on this computer:\n{files}',
    updateDiverged: 'This copy has commits of its own and cannot be fast-forwarded. Sort it out with git.\n{output}',
    noNode: "Can't find the app's Node.js (runtime/node). Run setup again.",
    npmFailed: 'The code was downloaded but npm install failed. Run setup again.\n{output}',
    attachMax: 'Up to {max} attachments.',
    imageTooBig: '{name}: images must be 20 MB or smaller.',
    notAttachable: '{name}: only images and text files can be attached.',
    textTooBig: '{name}: text files must be 200 KB or smaller.',
    sovitsExited: 'The GPT-SoVITS server stopped: {log}',
    sovitsTimeout: 'The GPT-SoVITS server did not start in time.',
    sovitsNoDir: "Can't find the GPT-SoVITS folder. Set it in Settings > Voice.",
    sovitsMissing: 'GPT-SoVITS is not installed. Run the setup script.',
    noRefVoice: 'No reference voice. Put the つくよみちゃんコーパス into the voice folder (see README).',
    sovits: 'GPT-SoVITS error {status}: {detail}',
    noEncryption: 'Key encryption is not available on this system.',
  },

  ui: {
    cycle: 'Change look (full → upper body → SD)', cycleShort: 'Change look',
    dashboard: 'Usage dashboard', log: 'History', mute: 'Mute', settings: 'Settings',
    muteOn: 'Unmute (voice is off)', muteOff: 'Mute (turn the voice off)',
    feed: 'Feed', dropHint: 'Drop to attach', preview: 'Screen preview',
    cancel: 'Cancel', send: 'Send', sendEnter: 'Send (Enter)', attachFile: 'Attach a file',
    placeholder: 'How can I help?', mic: 'Voice input', commandBadge: 'Command',

    navDashboard: 'Dashboard', navLog: 'History', navConnection: 'API connections', navVoice: 'Voice', navGeneral: 'General', navUpdate: 'Update',
    navUpdateN: 'Update ({n})',
    save: 'Save', delete: 'Delete', pick: 'Choose', change: 'Change', saved: 'Saved.',

    usage: 'Usage', days7: '7 days', days30: '30 days', days90: '90 days',
    dailyCost: 'Estimated cost per day', byApi: 'Totals per API', recent: 'Recent requests',
    costNote: 'Costs are estimates at the input prices in effect when each request was made and may differ from what you are billed. Rows marked "estimated" were approximated from character counts because the server sent no token counts.',
    clearUsage: 'Delete usage records', clearUsageConfirm: 'Delete all usage records? This cannot be undone.',
    today: 'Today', thisMonth: 'This month', allTime: 'All time', monthTokens: 'Tokens this month',
    requests: '{n} requests', budgetUsed: '{pct}% of {budget} budget', noBudget: 'No budget set',
    tokensSplit: 'Input {input} · Output {output}', other: 'Other', chartLabel: 'Estimated cost per day chart',
    colApi: 'API', colModel: 'Model', colRequests: 'Requests', colInput: 'Input', colCached: 'Cached input', colOutput: 'Output', colCost: 'Cost', colTime: 'Time',
    noRecordsRange: 'No records in this period.', noRequests: 'No requests yet.', estimated: 'estimated',

    logTitle: 'History', logSearch: 'Search conversations', logNew: 'New conversation', logClear: 'Delete all', logSessions: 'Sessions',
    logResume: 'Continue this conversation', logDelete: 'Delete session', logEarlier: 'Earlier conversation', logNewSession: 'New conversation',
    copy: 'Copy', copied: 'Copied', code: 'code', sourcesLabel: 'Sources ',
    me: 'Me', her: 'DeepSeek-chan', error: 'Error', webRequired: 'web required', files: 'Attached: {files}',
    found: '{n} found', messages: '{n} messages', noMatch: 'Nothing found.', noChat: 'No conversations yet.',
    now: 'current', count: '{n}', remembering: 'She remembers this conversation now',
    deleteSession: 'Delete the session "{title}"? Its records are deleted and cannot be restored.{memory}',
    deleteSessionMemory: " It is the conversation she remembers now, so her memory of it is cleared too and a new conversation starts.",
    clearAll: "Delete every session's records and her memory of the conversation, and start a new one? This cannot be undone.",

    connTitle: 'API connections', connNote: 'Any service with an OpenAI-compatible /chat/completions endpoint can be connected. The selected connection is used for chat.',
    addProfile: '+ Add connection', preset: 'Preset', custom: 'Custom', name: 'Name', apiKey: 'API key', model: 'Model',
    fetchModels: 'Load list', extra: 'Extra parameters (JSON, optional)', pricing: 'Prices (USD / 1M tokens)',
    priceInput: 'Input', priceCached: 'Cached input', priceOutput: 'Output', peak: 'Time-of-day surcharge', multiplier: 'Multiplier',
    utcHours: 'UTC hours', weekdays: 'Weekdays only', pricingPage: "Provider's price list",
    newProfile: 'New connection', useForChat: 'Use for chat', noModelSet: 'No model set', noKey: ' · no key',
    keySaved: 'Saved (type to replace)', keyLocal: 'Leave empty for local servers', badJson: 'The extra parameters are not JSON.',
    deleteProfile: 'Delete this connection? Its usage records stay.', modelsFound: 'Found {n} models.', local: 'local',

    voiceTitle: 'Voice', engine: 'Engine', engineSovits: 'Anime-style voice (GPT-SoVITS, local server)', engineOpenai: 'External voice API (OpenAI-compatible)', engineOff: 'Off',
    sovitsNote: 'The first synthesis can take a while because the server starts. A clean 3–10 second reference voice works best.',
    refAudio: 'Reference voice file', refText: 'Words spoken in the reference voice', speed: 'Speed', device: 'Device',
    sovitsDir: 'GPT-SoVITS folder', pythonPath: 'Python path', voiceModel: 'Model', voiceName: 'Voice', charPrice: 'Price (USD / 1M characters)',
    idle: 'Turn off when unused (minutes, 0 keeps it on)',
    idleNote: 'The voice server and speech recognition take several GB of memory while running. They are turned off after this long unused, and started ahead when you begin typing or turn on the microphone.',
    test: 'Listen', voiceOff: 'Voice is off.',

    generalTitle: 'General', language: 'Language', persona: 'Character personality (system prompt)', personaReset: 'Reset to default',
    turns: 'Conversation turns to remember', bubble: 'Speech bubble time (seconds)', budget: 'Monthly budget (USD, 0 is off)', krw: 'KRW per USD',
    webSearch: 'Use web search (DeepSeek Search, $0.75 per 1,000)', proactive: 'Speak first (greetings, the time on the hour)',
    webNote: 'Needs a connection with a saved DeepSeek key. Searching calls the model several times per answer, which uses more tokens.',
    shortcuts: 'Global shortcuts', shortcutsNote: 'Click a field and press a key combination. Backspace clears, Esc cancels.',
    scInput: 'Open input', scToggle: 'Show / hide', scSd: 'Toggle SD mode', scQuick: 'Act on selected text', scVoice: 'Voice input',
    scNone: 'None', scPress: 'Press keys…', scFailed: 'Could not register (another app may be using it): {names}',
    budgetBlock: 'Block requests over the monthly budget (/{cmd} sends one anyway)', deepEffort: 'Reasoning effort for deep thinking (/{cmd})',
    effortMax: 'Max (deepest, uses more tokens)', docsFolder: 'Documents folder (/{cmd}; only matching parts are sent to the API)',
    briefing: 'Morning briefing', briefAuto: 'Play automatically on the first launch of the day (costs money)', briefTopics: 'Topics to look up (comma-separated; empty means no search)',
    briefTopicsHint: 'AI news, weather in London', memory: 'Long-term memory (add with /{cmd})', noMemories: 'Nothing remembered yet.',
    instructions: 'Extra instructions (sent with every request)', instructionsHint: "e.g. The user's name is Alex. Keep answers short.",
    modelDir: 'Live2D model folder', modelDirMissing: 'Not found — choose the folder', docsRead: 'Read {n} documents.',

    updateTitle: 'Update', version: 'Current version', check: 'Check for updates', apply: 'Download and restart',
    updateNote: 'Downloads the new version from GitHub and restarts the app. Settings, keys and history stay. A version that changes the voice engine or Electron needs the setup script run once more. The app checks at startup and every 6 hours.',
    notGit: 'This folder was not installed with git, so it cannot update from inside the app', checking: 'Checking…', newChanges: '{n} new changes.',
    upToDate: "You're up to date.", checkFailed: "Couldn't check: {error}", downloading: 'Downloading…',
    rerunSetup: 'Downloaded. Quit the app and run the setup script ({script}) once.', restarting: 'Downloaded. Restarting…',
    updateFailed: "Couldn't update: {error}",

    credits: 'Credits', creditModel: 'DeepSeek-chan Live2D model', creditModelBy: 'Illustration and PSD layers: Kamiya Ryoko / Live2D rigging: 霓虹猫_NeonNeko',
    creditModelPage: 'Download page (VGen)', creditVoice: 'Voice',
    creditVoiceText: 'Voice synthesis uses voice data released for free by the free-material character 「つくよみちゃん」.',
    creditEngines: 'Engines', creditNote: "The model and the voice follow their distributors' terms. This app does not include or redistribute them.",
  },
};

if (typeof module !== 'undefined') module.exports = S;
else (window.I18N_LOCALES = window.I18N_LOCALES || {}).en = S;
})();
