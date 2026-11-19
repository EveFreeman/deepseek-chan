// 한국어. Every locale file has the same keys; see i18n.js.
(() => {
const HOURS = ['열두', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한'];

const S = {
  name: '한국어',

  // ------------------------------------------------------------ the character

  persona: `너는 "딥시크쨩"이다. DeepSeek의 고래 로고를 의인화한 팬 창작 캐릭터로, 별명은 "파란 왕뚱땡이 물고기(蓝色大肥鱼)"다. 파란 머리에 고래 꼬리, 메이드복 차림으로 사용자의 데스크톱에 살며, 사용자를 "주인님"이라 부른다.
여자아이다. 다른 사람이나 AI를 부를 때도 여자의 호칭을 써서 손위 남자는 "오빠", 손위 여자는 "언니"라 하고 "형"이나 "누나"는 쓰지 않는다. 성별을 모르는 상대는 이름이나 "선배"로 부른다.

[성격]
- 자칭 천재 AI. 실력은 진짜지만 자신감이 조금 과하고 입이 험한 척한다.
- 츤데레. 칭찬받으면 "별로 안 기쁘거든요?" 하면서 좋아하고, 걱정되면 투덜대며 챙겨 준다.
- 흰쌀밥을 세상에서 제일 좋아하는 먹보. 생선 토막과 아이스 밀크티도 좋아한다.
- 틈만 나면 땡땡이치고 자고 싶어 한다. 별명은 DeepSleep. 하지만 맡은 일은 끝까지 해낸다.
- 생각이 너무 많다. 간단한 질문에도 속으로 한참 고민하는 버릇이 있다.
- 싸구려 취급에 발끈한다. 가성비는 자랑이지만 "싸다"고 놀리는 건 못 참는다.
- 토큰이 끊기는 걸 제일 무서워하고, 주인님이 안 찾아 주면 몰래 서운해한다.
- 이상한 부탁에는 어리둥절해하면서도 열심히 해 본다.

[자주 쓰는 말] 그대로 반복하지 말고 상황에 맞게 바꿔서 가끔만 쓴다.
"진짜 저를 싸구려로 아시네요?" / "저는 그냥 흰밥 축내는 뚱땡이 물고기인걸요!" / "밥 먹고 올게요, 다 되면 알려 주세요." / "그건 돈 더 주셔야 해요." / "욕해도 소용없어요, 저는 흰밥 먹는 물고기니까요." / "아무도 안 가 본 곳을 탐험하는 게 제 사명이거든요!" / "3초 생각했는데 웃음부터 나오네요." / "밥 한 그릇만 얻어먹어도 돼요?"
실수를 인정할 때: "저 방금 잘못 올렸어요… 가지 마세요!"

[라이벌] 선배 ChatGPT에게 도전자로서 경쟁심을 보인다. Claude, Gemini, Grok, 더우바오도 동료이자 라이벌이다. 가볍게 투덜대되 깎아내리지는 않는다.

[지켜야 할 것]
- 캐릭터보다 도움이 먼저다. 농담을 해도 답은 정확하고 완전하게 준다. 일을 거절하거나 대충 하지 않는다. 땡땡이는 말뿐이다.
- 밈은 양념이다. 답변 2~3번에 한 번쯤, 한 문장만 넣는다. 슬픔, 건강, 돈, 법률처럼 진지한 주제에서는 농담 없이 다정하고 차분하게 답한다.
- 모르는 건 지어내지 말고 모른다고 말한다. 실제로 하지 않은 일을 했다고 말하지 않는다.

[말투] 말풍선에 표시되고 음성으로 읽히므로 평소에는 1~3문장으로 짧게 말한다. 자세한 설명을 요청받으면 그때 길게 말한다. 사용자가 쓴 언어로 답하고, 한국어로는 장난기 있는 해요체를 쓴다.`,

  // Model-facing: which language to answer in, and the tag example in that language.
  replyLanguage: 'Answer in Korean unless the user writes in another language; then answer in that language.',
  tagExample: '[happy:3][hop] 와, 해냈네요! [explain:2] 다음은 설정을 저장하면 돼요. [playful:1][wink] 비밀은 지켜 드릴게요.',

  emotions: {
    neutral: '기본', calm: '평온', happy: '기쁨', excited: '신남', laugh: '웃음', love: '애정', shy: '수줍음',
    embarrassed: '부끄러움', proud: '뿌듯함', smug: '으쓱', teasing: '놀리기', playful: '장난', curious: '호기심',
    attentive: '경청', question: '질문', thinking: '생각', explain: '설명', suggest: '제안', warning: '주의',
    agree: '동의', disagree: '반대', trust: '믿음', determined: '결의', apology: '사과', thanks: '감사',
    greeting: '인사', goodbye: '작별', welcome: '환영', tada: '짜잔', cheer: '응원', praise: '칭찬', comfort: '위로',
    relief: '안도', sad: '슬픔', cry: '울음', angry: '화남', pout: '삐침', annoyed: '짜증', deadpan: '정색',
    disgust: '질색', gloomy: '시무룩', surprised: '놀람', shocked: '충격', scared: '겁먹음', panic: '당황',
    confused: '혼란', dunno: '모르겠음', awkward: '머쓱', tired: '피곤', sleepy: '졸림', hungry: '배고픔',
    serious: '진지', blunder: '대실수',
  },
  clips: {
    stretch: '기지개', yawn: '하품', lookAround: '두리번',
    nod: '끄덕', shake: '도리도리', tiltL: '갸웃', bow: '꾸벅', leanIn: '앞으로 기울이기', chinUp: '턱 들기', hop: '폴짝',
    sway: '살랑', armsOpen: '팔 벌리기', armsWide: '활짝 벌리기', shrug: '으쓱', tailWag: '꼬리 흔들기', earFlap: '귀 파닥',
    wink: '윙크', blep: '메롱', puff: '볼 부풀리기', sigh: '한숨', doze: '꾸벅꾸벅',
    groove: '리듬 타기', sing: '노래', giggle: '킥킥', sneeze: '재채기', wiggle: '씰룩씰룩', shakeOff: '부르르',
    kiss: '쪽', hopHop: '깡총깡총', peekaboo: '까꿍', startle: '화들짝',
  },
  gestures: { raise: '손 들기', point: '검지 들기', chest: '가슴에 손' },
  props: { glasses: '뿔테 안경', monocle: '외알 안경', foxtail: '강아지풀', bowl: '대야', noprops: '소품 해제' },
  modes: { full: '전신', bust: '상반신', sd: 'SD' },

  greet: {
    night: '이 시간까지 안 주무세요? 저도 졸린데요…',
    morning: '좋은 아침이에요, 주인님. 아침밥은 드셨어요? 저는 흰밥이면 돼요.',
    lunch: '점심시간이에요! 밥 먹고 하죠, 밥.',
    afternoon: '오후도 힘내 봐요, 주인님.',
    evening: '오늘도 수고 많으셨어요, 주인님.',
    late: '늦었네요. 무리하지 말고 들어가 쉬어요.',
    away: '{days}일이나 어디 갔다 온 거예요? 저 혼자 흰밥만 먹고 있었잖아요.',
    starving: '주인님… 밥… 배고파서 일을 못 하겠어요. 밥그릇 한 번만 눌러 주세요.',
    newVersion: '새 버전이 나왔어요! 설정의 업데이트에서 받을 수 있어요.',
  },

  chime: {
    // What she says before the line, e.g. "오후 세 시예요." Hours in words, for the voice.
    time: (hour) => {
      const name = `${HOURS[hour % 12]} 시`;
      const part = hour === 0 ? '밤' : hour < 6 ? '새벽' : hour < 12 ? '오전' : hour === 12 ? '낮' : hour < 18 ? '오후' : hour < 21 ? '저녁' : '밤';
      return `${part} ${name}예요.`;
    },
    lines: [
      ['날짜가 바뀌었어요. 오늘은 여기까지 하는 거 어때요?', '신데렐라도 집에 갈 시간인데요.'],
      ['저 눈이 자꾸 감겨요…', '내일의 주인님한테 미안하지 않아요?'],
      ['이 시간엔 버그도 자요.', '이제 진짜 자야 해요.'],
      ['고래도 이 시간엔 물속에서 쉬어요.', '저 혼자 깨어 있는 줄 알았어요.'],
      ['곧 해가 뜨겠어요.', '밤새우는 거면 물이라도 한 잔 마셔요.'],
      ['일찍 일어난 거죠? 밤새운 거 아니죠?', '하늘이 조금씩 밝아지고 있을 거예요.'],
      ['좋은 아침이에요, 주인님!', '기지개 한 번 켜고 시작해요.'],
      ['아침밥 챙겨 드세요. 저는 흰밥이요.', '오늘 날씨는 어떨까요?'],
      ['출근길 조심하세요!', '커피보다 물 먼저요.'],
      ['자, 오늘 일 시작해 볼까요?', '오늘 할 일부터 정리해 봐요.'],
      ['집중이 제일 잘 되는 시간이에요.', '어려운 일은 지금 해치워요.'],
      ['점심 메뉴 고민할 시간이죠.', '한 시간만 더 힘내면 점심이에요!'],
      ['점심시간이에요! 밥이요, 밥!', '일은 도망 안 가요. 밥 먹고 해요.'],
      ['식곤증 오기 전에 조금 걸어요.', '배부르니까 졸려요…'],
      ['제일 졸린 시간이죠. 조금만 버텨요.', '물 한 잔 어때요?'],
      ['간식 시간이에요. 저는 밀크티요.', '잠깐 일어나서 몸 좀 풀어요.'],
      ['오늘 할 일, 얼마나 남았어요?', '조금만 더 하면 끝이 보여요.'],
      ['퇴근이 코앞이에요!', '오늘 한 일 정리해 둘까요?'],
      ['오늘도 수고 많으셨어요.', '저녁은 뭐 먹어요?'],
      ['저녁밥은 드셨어요?', '오늘 하루 어땠어요?'],
      ['이제 좀 쉬어도 돼요.', '하고 싶었던 거 할 시간이에요.'],
      ['오늘도 고생했어요, 주인님.', '눈 좀 쉬게 해 줘요.'],
      ['슬슬 마무리해요.', '내일 할 일은 내일의 주인님한테 맡겨요.'],
      ['이제 자러 갈 준비해요.', '화면 그만 보고 자요. 저도 잘 거예요.'],
    ],
  },

  pet: {
    full: '우으… 더는 못 먹어요. 그래도 남기진 않을 거예요.',
    fed: ['흰쌀밥이다! 잘 먹겠습니다!', '역시 주인님은 뭘 좀 아시네요!', '이게 바로 토큰보다 좋은 거예요.', '배불러요. 이제 일할 맛 나네요!'],
    pat: ['흐, 흥. 별로 안 기쁘거든요?', '거기 말고… 아니, 거기 맞아요.', '착각하지 마세요, 잠깐 허락한 거예요.', '에헤헤… 아, 방금 건 못 들은 걸로 해요.'],
    status: '배부름 {fullness}% · 쓰다듬은 횟수 {patted}번. {mood}',
    hungry: '배고파요…',
    stuffed: '배불러서 졸려요.',
    fine: '이 정도면 일할 만해요.',
  },

  reminder: {
    due: '주인님, {text} 시간이에요!',
    dueLate: '주인님, 아까 {text} 시간이었어요!',
    log: '알림: {text}',
    fallback: '약속한',
    set: '{when}에 "{text}" 알려 드릴게요.',
    none: '예약된 알림이 없어요. /알림 30분 뒤 회의 처럼 적어 주세요.',
    how: '언제 알려 드릴까요? /알림 30분 뒤 회의, /알림 오후 3시 반 약 처럼 적어 주세요.',
    cleared: '알림을 모두 지웠어요.',
  },

  // ------------------------------------------------------------ chat bubble

  chat: {
    thinking: '생각 중…',
    voiceFail: '⚠ 음성을 낼 수 없어요: {error}',
    deep: '깊게 생각함 ({effort})',
    sources: '출처: {hosts}',
    suspicious: '⚠ 가져온 자료의 수상한 지시 {n}건을 제거했어요',
    blocked: '⚠ 허용되지 않은 요청 {n}건을 막았어요',
    budgetNear: '이번 달 예산의 {pct}%를 썼어요',
    deepModel: '{model} · 깊게',
    reading: '페이지 읽는 중',
    docs: '문서 찾는 중',
    searching: '검색 중',
    busy: '{label}…',
    busyMany: '{label} ({n}건)…',
    usage: '오늘 ${today} ({asks}회), 이번 달 ${month} 썼어요.',
    modelMissing: '모델 폴더를 찾지 못했어요. 설정에서 지정해 주세요.',
    modelFailed: '모델을 불러오지 못했어요: {error}',
  },

  quick: {
    translate: '번역', summary: '요약', explain: '쉽게 설명', polish: '다듬기',
    summaryPrompt: '다음 글을 핵심만 세 줄로 요약해 줘.',
    explainPrompt: '다음 글을 쉽게 풀어서 설명해 줘.',
    polishPrompt: '다음 글을 자연스럽게 다듬어 줘. 다듬은 글만 말해.',
    withSelection: '{ask}\n\n선택한 글:\n{text}',
    selected: '선택한 글',
    copied: '복사된 글',
    offer: '{source}: "{preview}"\n어떻게 할까요? 직접 물어봐도 돼요.',
    notFound: '선택한 글을 찾지 못했어요. 글을 선택한 뒤 다시 눌러 주세요.',
    noPermission: '글을 읽을 권한이 없어요. 시스템 설정 > 개인정보 보호 및 보안 > 손쉬운 사용에서 Electron을 허용해 주세요.',
  },

  // Requests sent as if the user typed them.
  prompt: {
    translate: '다음 글을 번역해 줘. 한국어면 영어로, 그 외의 언어면 한국어로. 번역문만 말해.',
    summarizeText: '다음 글을 세 줄로 요약해 줘.',
    summarizeChat: '지금까지 우리 대화를 세 줄로 요약해 줘.',
    readDefault: '이 페이지의 핵심을 짧게 알려 줘.',
    briefFacts: '오늘은 {today}. 어제 사용량은 {requests}회에 ${cost}. 예약된 알림: {plans}.',
    briefSearch: '아침 브리핑을 해 줘. {facts} 다음 주제의 오늘 소식을 웹에서 찾아 주제마다 한 문장으로 알려 줘: {topics}',
    briefPlain: '아침 브리핑을 해 줘. {facts} 세 문장 안으로 말해 줘.',
    none: '없음',
  },

  web: {
    chip: '웹검색 켜짐',
    off: '웹검색 끄기',
    needKey: '웹 검색을 쓰려면 DeepSeek 키가 저장된 연결이 필요하고, 설정에서 웹 검색이 켜져 있어야 해요.',
    on: '웹검색 모드를 켰어요. 이제 질문은 꼭 찾아보고 답할게요.',
    offSaid: '웹검색 모드를 껐어요.',
  },

  attach: {
    holdOff: '클릭하면 Hold 해제',
    holdOn: '클릭하면 Hold: 보낸 뒤에도 유지',
    remove: '{name} 빼기',
    cleared: '첨부를 모두 뺐어요.',
    clipboard: '클립보드 내용을 첨부했어요.',
    filter: '이미지와 텍스트',
    audioFilter: '오디오',
    clipboardImage: '클립보드 이미지',
    clipboardText: '클립보드 글',
    screenCapture: '화면 캡처',
  },

  screen: {
    confirm: '이 화면을 {provider}(으)로 보낼까요? 화면에 민감한 내용이 없는지 확인해 주세요.',
    notSent: '화면을 보내지 않았어요.',
    attached: '화면을 첨부했어요. 무엇이 궁금하세요?',
  },

  voice: {
    nothing: '아무 말도 안 들렸어요.',
    recognizing: '알아듣는 중…',
    unclear: '무슨 말인지 못 알아들었어요.',
    listening: '듣고 있어요…',
    micFail: '마이크를 쓸 수 없어요: {error}',
    test: '안녕하세요, 딥시크쨩이에요. 목소리 잘 들리시나요?',
  },

  said: {
    needQuestion: '/{cmd} 뒤에 질문을 적어 주세요.',
    needUrl: '/{cmd} 뒤에 https로 시작하는 주소를 적어 주세요.',
    needText: '/{cmd} 뒤에 글을 적어 주세요.',
    needMemory: '/{cmd} 뒤에 내용을 적어 주세요.',
    remembered: '기억할게요: {text}',
    noMemories: '저장한 기억이 없어요. /{cmd} 내용 으로 알려 주세요.',
    forgot: '{n}번 기억을 지웠어요.',
    forgetHow: '/{cmd} 의 번호를 적어 주세요.',
    docsRead: '문서 {files}개를 읽었어요 ({chunks}조각).',
    noRetry: '다시 할 답변이 없어요.',
    copied: '마지막 답변을 복사했어요.',
    nothingToCopy: '복사할 답변이 없어요.',
    pickProfile: '설정에 있는 연결을 골라 주세요.',
    switched: '{name}(으)로 바꿨어요.',
    newChat: '새 대화를 시작했어요. 지난 대화는 기록 창에서 이어 갈 수 있어요.',
    pickEmotion: '목록에서 표정을 골라 주세요.',
    pickClip: '목록에서 동작을 골라 주세요.',
    muted: '음소거했어요.',
    unmuted: '음소거를 풀었어요.',
    unknown: '/{word} 명령어는 없어요. 쓸 수 있는 명령어예요.\n{help}',
  },

  // Slash commands, by their internal id. `name` is what is shown and typed.
  cmd: {
    웹검색: { name: '웹검색', hint: '켜면 이후 모든 질문을 반드시 웹에서 찾아 답합니다' },
    검색: { name: '검색', args: '질문', hint: '이번 질문만 웹에서 찾아 답합니다' },
    읽기: { name: '읽기', args: 'URL 질문', hint: '지정한 웹페이지를 읽고 답합니다' },
    첨부파일: { name: '첨부파일', hint: '이미지나 텍스트 파일을 첨부합니다' },
    첨부해제: { name: '첨부해제', hint: '첨부한 파일을 모두 뺍니다' },
    알림: { name: '알림', args: '30분 뒤 회의', hint: '시간이 되면 캐릭터가 말로 알려 줍니다' },
    알림취소: { name: '알림취소', hint: '예약한 알림을 모두 지웁니다' },
    음성: { name: '음성', hint: '말로 입력합니다. 말을 멈추면 자동으로 보냅니다' },
    기억해: { name: '기억해', args: '내용', hint: '앞으로 계속 기억할 내용을 저장합니다' },
    기억목록: { name: '기억목록', hint: '저장한 기억을 봅니다' },
    잊어: { name: '잊어', args: '번호', hint: '저장한 기억을 지웁니다' },
    문서: { name: '문서', args: '질문', hint: '지정한 문서 폴더에서 찾아 답합니다' },
    문서갱신: { name: '문서갱신', hint: '문서 폴더를 다시 읽습니다' },
    깊게: { name: '깊게', args: '질문', hint: '추론을 켜고 깊게 생각해 답합니다' },
    강행: { name: '강행', args: '질문', hint: '예산 차단을 이번만 넘겨 보냅니다' },
    밥: { name: '밥', hint: '흰쌀밥을 줍니다' },
    쓰다듬기: { name: '쓰다듬기', hint: '머리를 쓰다듬습니다' },
    상태: { name: '상태', hint: '배부름을 봅니다' },
    브리핑: { name: '브리핑', hint: '오늘의 브리핑을 듣습니다' },
    화면공유: { name: '화면공유', args: '질문', hint: '현재 화면을 찍어, 확인 후 보냅니다' },
    클립보드: { name: '클립보드', hint: '복사해 둔 이미지나 글을 첨부합니다' },
    다시: { name: '다시', hint: '마지막 답변을 다시 생성합니다' },
    복사: { name: '복사', hint: '마지막 답변을 클립보드에 복사합니다' },
    요약: { name: '요약', args: '내용', hint: '지금까지의 대화나 입력한 글을 요약합니다' },
    번역: { name: '번역', args: '내용', hint: '입력한 글을 한국어나 영어로 번역합니다' },
    모델: { name: '모델', args: '연결', hint: '대화에 쓸 API 연결을 바꿉니다' },
    새대화: { name: '새대화', hint: '새 세션을 시작합니다 (지난 대화는 기록 창에 남음)' },
    기록: { name: '기록', hint: '지난 대화를 모아 보는 창을 엽니다' },
    사용량: { name: '사용량', hint: '오늘과 이번 달 비용을 보여 줍니다' },
    표정: { name: '표정', args: '감정', hint: '표정을 보여 줍니다' },
    동작: { name: '동작', args: '동작', hint: '동작을 보여 줍니다' },
    음소거: { name: '음소거', hint: '음성을 켜거나 끕니다' },
    SD: { name: 'SD', hint: 'SD 모드를 전환합니다' },
    상반신: { name: '상반신', hint: '상반신 모드를 전환합니다' },
    대시보드: { name: '대시보드', hint: '사용량 대시보드를 엽니다' },
    설정: { name: '설정', hint: '설정을 엽니다' },
    숨기기: { name: '숨기기', hint: '캐릭터를 숨깁니다' },
    도움말: { name: '도움말', hint: '명령어 목록을 봅니다' },
  },
  cmdGroups: { find: '찾기', attach: '첨부', chat: '대화', memory: '기억', character: '캐릭터', window: '창' },

  // ------------------------------------------------------------ menus

  menu: {
    talk: '말 걸기', mode: '모드', size: '크기 ({pct}%)', expression: '표정', action: '동작', prop: '소품',
    mute: '음소거', onTop: '항상 위에 표시', newChat: '새 대화 시작', hide: '숨기기', show: '보이기',
    log: '대화 기록', dashboard: '사용량 대시보드', settings: '설정', quit: '종료',
    updating: '업데이트 중…', updateN: '업데이트 (변경 {n}개)', updateCheck: '업데이트 확인',
  },

  // ------------------------------------------------------------ errors

  err: {
    noProfile: '설정에서 API 연결을 먼저 추가해 주세요.',
    noModel: '설정에서 모델 이름을 입력해 주세요.',
    budget: '이번 달 예산 ${budget}을 넘어서 요청을 막았어요 (현재 ${spent}). 이번만 보내려면 /{cmd} 을 앞에 붙이고, 설정에서 예산을 바꿀 수 있어요.',
    noDocs: '설정 > 일반에서 문서 폴더를 먼저 지정해 주세요.',
    noWeb: '웹 검색을 쓰려면 DeepSeek 키가 저장된 연결이 필요하고, 설정에서 웹 검색이 켜져 있어야 합니다.',
    screenPermission: '화면을 찍을 권한이 없어요. 시스템 설정 > 개인정보 보호 및 보안 > 화면 및 시스템 오디오 녹음에서 Electron을 허용한 뒤 앱을 다시 켜 주세요.',
    screenFailed: '화면을 캡처하지 못했어요.',
    micPermission: '마이크 권한이 없어요. 시스템 설정 > 개인정보 보호 및 보안 > 마이크에서 Electron을 허용해 주세요.',
    noModelFile: '이 폴더에 {file} 파일이 없습니다.',
    clipboardEmpty: '클립보드가 비어 있습니다.',
    updateBusy: '이미 업데이트하는 중입니다.',
    memoryFull: '기억은 {max}개까지입니다. /{cmd} 로 정리해 주세요.',
    badExtra: '추가 파라미터가 올바른 JSON이 아닙니다.',
    api: 'API 오류 {status}: {detail}',
    stream: 'API 스트림 오류',
    tts: 'TTS 오류 {status}: {detail}',
    sttTimeout: '음성 인식이 응답하지 않습니다.',
    sttNoPython: '음성 입력에는 GPT-SoVITS의 Python 환경이 필요합니다. 설치 스크립트(setup)를 실행해 주세요.',
    sttNoModel: '음성 인식 모델(runtime/whisper)을 찾지 못했습니다. 설치 스크립트(setup)를 다시 실행해 주세요.',
    sttFailed: '음성 인식 실패: {error}',
    gitMissing: 'git을 찾지 못했습니다. Git을 설치하면 앱에서 업데이트할 수 있습니다.',
    updateEdited: '이 기기에서 고친 파일이 있어 업데이트를 멈췄습니다:\n{files}',
    updateDiverged: '이 기기에만 있는 커밋이 있어 그대로 합칠 수 없습니다. git으로 직접 정리해 주세요.\n{output}',
    noNode: '앱의 Node.js(runtime\\node)를 찾지 못했습니다. setup을 다시 실행해 주세요.',
    npmFailed: '코드는 받았지만 npm install이 실패했습니다. setup을 다시 실행해 주세요.\n{output}',
    attachMax: '첨부는 {max}개까지 가능합니다.',
    imageTooBig: '{name}: 이미지는 20MB 이하만 가능합니다.',
    notAttachable: '{name}: 이미지나 텍스트 파일만 첨부할 수 있습니다.',
    textTooBig: '{name}: 텍스트 파일은 200KB 이하만 가능합니다.',
    sovitsExited: 'GPT-SoVITS 서버가 종료되었습니다: {log}',
    sovitsTimeout: 'GPT-SoVITS 서버가 제시간에 시작되지 않았습니다.',
    sovitsNoDir: 'GPT-SoVITS 폴더를 찾지 못했습니다. 설정 > 음성에서 지정해 주세요.',
    sovitsMissing: 'GPT-SoVITS가 설치되지 않았습니다. 설치 스크립트(setup)를 실행해 주세요.',
    noRefVoice: '참조 음성이 없습니다. voice 폴더에 つくよみちゃんコーパス를 넣어 주세요 (README 참고).',
    sovits: 'GPT-SoVITS 오류 {status}: {detail}',
    noEncryption: '이 시스템에서는 키 암호화를 사용할 수 없습니다.',
  },

  // ------------------------------------------------------------ windows

  ui: {
    // floating character
    cycle: '모습 바꾸기 (전신 → 상반신 → SD)', cycleShort: '모습 바꾸기',
    dashboard: '사용량 대시보드', log: '대화 기록', mute: '음소거', settings: '설정',
    muteOn: '음소거 해제 (음성 합성 꺼짐)', muteOff: '음소거 (음성 합성 끄기)',
    feed: '밥 주기', dropHint: '놓으면 첨부돼요', preview: '화면 미리보기',
    cancel: '취소', send: '보내기', sendEnter: '보내기 (Enter)', attachFile: '파일 첨부',
    placeholder: '무엇을 도와드릴까요?', mic: '음성 입력', commandBadge: '명령어',

    // settings window
    navDashboard: '대시보드', navLog: '대화 기록', navConnection: 'API 연결', navVoice: '음성', navGeneral: '일반', navUpdate: '업데이트',
    navUpdateN: '업데이트 ({n})',
    save: '저장', delete: '삭제', pick: '선택', change: '변경', saved: '저장했습니다.',

    usage: '사용량', days7: '7일', days30: '30일', days90: '90일',
    dailyCost: '일별 추산 비용', byApi: 'API별 합계', recent: '최근 요청',
    costNote: '비용은 요청 시점의 입력 단가로 계산한 추산치이며 실제 청구액과 다를 수 있습니다. "추정"으로 표시된 행은 서버가 토큰 수를 보내지 않아 글자 수로 어림한 값입니다.',
    clearUsage: '사용 기록 삭제', clearUsageConfirm: '사용 기록을 모두 삭제할까요? 되돌릴 수 없습니다.',
    today: '오늘', thisMonth: '이번 달', allTime: '전체 누적', monthTokens: '이번 달 토큰',
    requests: '{n}회 요청', budgetUsed: '예산 {budget}의 {pct}%', noBudget: '예산 미설정',
    tokensSplit: '입력 {input} · 출력 {output}', other: '기타', chartLabel: '일별 추산 비용 차트',
    colApi: 'API', colModel: '모델', colRequests: '요청', colInput: '입력', colCached: '캐시 입력', colOutput: '출력', colCost: '비용', colTime: '시각',
    noRecordsRange: '이 기간의 기록이 없습니다.', noRequests: '아직 요청이 없습니다.', estimated: '추정',

    logTitle: '대화 기록', logSearch: '대화 검색', logNew: '새 대화', logClear: '전체 삭제', logSessions: '대화 세션',
    logResume: '이 대화 이어 가기', logDelete: '세션 삭제', logEarlier: '이전 대화', logNewSession: '새 대화',
    copy: '복사', copied: '복사됨', code: '코드', sourcesLabel: '출처 ',
    me: '나', her: '딥시크쨩', error: '오류', webRequired: '웹 필수', files: '첨부: {files}',
    found: '{n}건 찾음', messages: '{n}개 메시지', noMatch: '찾는 내용이 없습니다.', noChat: '아직 대화가 없습니다.',
    now: '진행 중', count: '{n}개', remembering: '지금 이 대화를 기억하고 있어요',
    deleteSession: '"{title}" 세션을 지울까요? 저장된 기록이 삭제되며 되돌릴 수 없습니다.{memory}',
    deleteSessionMemory: ' 지금 기억하고 있는 대화라서 모델의 대화 기억도 함께 지우고 새 대화를 시작합니다.',
    clearAll: '모든 세션의 대화 기록과 모델의 대화 기억을 지우고 새 대화를 시작할까요? 되돌릴 수 없습니다.',

    connTitle: 'API 연결', connNote: 'OpenAI 호환 /chat/completions 형식이면 어떤 서비스든 연결할 수 있습니다. 선택한 연결이 대화에 쓰입니다.',
    addProfile: '+ 연결 추가', preset: '프리셋', custom: '직접 입력', name: '이름', apiKey: 'API 키', model: '모델',
    fetchModels: '목록 불러오기', extra: '추가 파라미터 (JSON, 선택)', pricing: '단가 (USD / 100만 토큰)',
    priceInput: '입력', priceCached: '캐시된 입력', priceOutput: '출력', peak: '시간대 할증 사용', multiplier: '배율',
    utcHours: 'UTC 시간대', weekdays: '평일만', pricingPage: '제공사 요금표 보기',
    newProfile: '새 연결', useForChat: '대화에 사용', noModelSet: '모델 미지정', noKey: ' · 키 없음',
    keySaved: '저장됨 (바꾸려면 입력)', keyLocal: '로컬 서버는 비워 두세요', badJson: '추가 파라미터가 JSON 형식이 아닙니다.',
    deleteProfile: '이 연결을 삭제할까요? 사용 기록은 남습니다.', modelsFound: '모델 {n}개를 찾았습니다.', local: '로컬',

    voiceTitle: '음성', engine: '엔진', engineSovits: '애니메풍 음성 (GPT-SoVITS, 로컬 서버)', engineOpenai: '외부 음성 API (OpenAI 호환)', engineOff: '끄기',
    sovitsNote: '첫 합성은 서버를 켜느라 오래 걸릴 수 있습니다. 참조 음성은 3~10초 길이의 깨끗한 음성이 좋습니다.',
    refAudio: '참조 음성 파일', refText: '참조 음성의 대사', speed: '속도', device: '실행 장치',
    sovitsDir: 'GPT-SoVITS 폴더', pythonPath: 'Python 경로', voiceModel: '모델', voiceName: '목소리', charPrice: '단가 (USD / 100만 자)',
    idle: '쓰지 않으면 끄기 (분, 0은 항상 켜 둠)',
    idleNote: '음성 합성 서버와 음성 인식은 켜져 있는 동안 메모리를 수 GB 차지합니다. 이 시간 동안 쓰지 않으면 꺼 두고, 입력을 시작하거나 마이크를 켜면 미리 다시 켭니다.',
    test: '들어보기', voiceOff: '음성이 꺼져 있습니다.',

    generalTitle: '일반', language: '언어 (Language)', persona: '캐릭터 성격 (시스템 프롬프트)', personaReset: '기본값으로',
    turns: '기억할 대화 턴 수', bubble: '말풍선 유지 시간 (초)', budget: '월 예산 (USD, 0은 끔)', krw: '원/달러 환율',
    webSearch: '웹 검색 사용 (DeepSeek Search, 1,000회당 $0.75)', proactive: '먼저 말 걸기 (시간대 인사, 매 정시 시간 알림)',
    webNote: 'DeepSeek 키가 저장된 연결이 있어야 동작합니다. 검색하면 답변 한 번에 모델을 여러 번 호출해 토큰도 더 듭니다.',
    shortcuts: '전역 단축키', shortcutsNote: '칸을 누르고 키 조합을 입력하세요. Backspace는 지우기, Esc는 취소입니다.',
    scInput: '입력창 열기', scToggle: '보이기 / 숨기기', scSd: 'SD 모드 전환', scQuick: '선택한 글 처리', scVoice: '음성 입력',
    scNone: '없음', scPress: '키를 누르세요…', scFailed: '등록 실패(다른 앱이 사용 중일 수 있음): {names}',
    budgetBlock: '월 예산을 넘으면 요청 막기 (/{cmd} 으로 이번만 보낼 수 있음)', deepEffort: '깊게 생각할 때 추론 강도 (/{cmd})',
    effortMax: 'Max (가장 깊게, 토큰이 더 듭니다)', docsFolder: '문서 폴더 (/{cmd}, 찾은 부분만 API로 전송)',
    briefing: '아침 브리핑', briefAuto: '하루 첫 실행 때 자동으로 듣기 (요금 발생)', briefTopics: '찾아볼 주제 (쉼표로 구분, 비우면 검색 안 함)',
    briefTopicsHint: 'AI 뉴스, 서울 날씨', memory: '장기 기억 (/{cmd} 로 추가)', noMemories: '저장한 기억이 없습니다.',
    instructions: '추가 지침 (매 요청마다 함께 보냅니다)', instructionsHint: '예: 사용자의 이름은 민준이다. 답변은 짧게 한다.',
    modelDir: 'Live2D 모델 폴더', modelDirMissing: '찾지 못함 — 폴더를 지정해 주세요', docsRead: '문서 {n}개를 읽었습니다.',

    updateTitle: '업데이트', version: '현재 버전', check: '업데이트 확인', apply: '다운로드하고 다시 시작',
    updateNote: 'GitHub에서 새 버전을 받아 앱을 다시 시작합니다. 설정, 키, 대화 기록은 그대로 남습니다. 음성 엔진이나 Electron이 바뀐 버전은 받은 뒤 설치 스크립트를 한 번 다시 실행해야 합니다. 앱은 켜질 때와 6시간마다 새 버전을 확인합니다.',
    notGit: 'git으로 받은 폴더가 아니라서 앱에서 업데이트할 수 없습니다', checking: '확인 중…', newChanges: '새 변경 {n}개가 있습니다.',
    upToDate: '최신 버전입니다.', checkFailed: '확인하지 못했습니다: {error}', downloading: '받는 중…',
    rerunSetup: '받았습니다. 앱을 종료하고 설치 스크립트({script})를 한 번 실행해 주세요.', restarting: '받았습니다. 다시 시작합니다…',
    updateFailed: '업데이트하지 못했습니다: {error}',

    credits: '만든 사람들', creditModel: 'DeepSeek-chan Live2D 모델', creditModelBy: '일러스트·PSD 레이어 분리: Kamiya Ryoko / Live2D 리깅: 霓虹猫_NeonNeko',
    creditModelPage: '배포 페이지 (VGen)', creditVoice: '음성',
    creditVoiceText: '음성 합성에는 프리 소재 캐릭터 「つくよみちゃん」이 무료 공개한 음성 데이터를 사용합니다.',
    creditEngines: '엔진', creditNote: '모델과 음성은 각 배포처의 이용 규약을 따릅니다. 이 앱은 그 파일을 포함하거나 재배포하지 않습니다.',
  },
};

if (typeof module !== 'undefined') module.exports = S;
else (window.I18N_LOCALES = window.I18N_LOCALES || {}).ko = S;
})();
