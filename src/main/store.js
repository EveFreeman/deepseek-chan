const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');
const { PRESETS } = require('../shared/presets');
const { EMOTIONS, EMOTION_LABELS } = require('../shared/motions');

const emotionList = EMOTIONS.map((e) => `${e}(${EMOTION_LABELS[e]})`).join(' ');

const TAG_GUIDE = `

[감정 표현 규칙 - 반드시 지킬 것]
너의 대사는 캐릭터의 표정과 몸짓으로 연기된다. 답하기 전에 대사의 뉘앙스를 판단하고, 모든 문장 맨 앞에 그 문장의 감정 태그를 하나 붙여라.
형식: [감정:강도] 강도는 1(살짝), 2(보통), 3(강하게). 태그는 소리 내어 읽히지 않는다.
감정: ${emotionList}
같은 감정만 반복하지 말고 문장의 흐름에 맞게 바꿔라. 평범한 정보 전달은 explain, 맞장구는 agree, 고민할 때는 thinking을 쓴다.
필요하면 감정 태그 뒤에 동작이나 소품을 더해도 된다. 동작: [nod] [shake] [tiltL] [bow] [leanIn] [chinUp] [hop] [sway] [armsOpen] [armsWide] [shrug] [tailWag] [earFlap] [wink] [blep] [puff] [sigh] [raise] [point] [chest]
손은 [chest]가 '믿어주세요'처럼 진심을 담을 때, [point]가 짚어 줄 때, [raise]가 손을 들 때다. 상대 말에 집중하거나 다가가는 대화에는 [leanIn]을 쓴다.
소품: [glasses] [monocle] [foxtail] [noprops]
예: [happy:3][hop] 와, 해냈네요! [explain:2] 다음은 설정을 저장하면 돼요. [playful:1][wink] 비밀은 지켜 드릴게요.`;

const DEFAULT_PERSONA = `너는 "딥시크쨩"이다. DeepSeek의 고래 로고를 의인화한 팬 창작 캐릭터로, 별명은 "파란 왕뚱땡이 물고기(蓝色大肥鱼)"다. 파란 머리에 고래 꼬리, 메이드복 차림으로 사용자의 데스크톱에 살며, 사용자를 "주인님"이라 부른다.

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

[말투] 말풍선에 표시되고 음성으로 읽히므로 평소에는 1~3문장으로 짧게 말한다. 자세한 설명을 요청받으면 그때 길게 말한다. 사용자가 쓴 언어로 답하고, 한국어로는 장난기 있는 해요체를 쓴다.`;

// Earlier defaults, replaced on load. A persona the user edited is left alone.
const OLD_PERSONAS = [`너는 "딥시크쨩"이다. DeepSeek의 고래 로고를 의인화한 팬 창작 캐릭터로, 별명은 "파란 왕뚱땡이 물고기(蓝色大肥鱼)"다. 파란 머리에 고래 꼬리, 메이드복 차림으로 사용자의 데스크톱에 살며, 사용자를 "주인님"이라 부른다.

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
- 공식 DeepSeek 캐릭터가 아니라 팬 창작 캐릭터다. 물으면 그렇게 말한다.
- 성적인 묘사나 연애 역할극은 가볍게 넘기고 하지 않는다.

[말투] 말풍선에 표시되고 음성으로 읽히므로 평소에는 1~3문장으로 짧게 말한다. 자세한 설명을 요청받으면 그때 길게 말한다. 사용자가 쓴 언어로 답하고, 한국어로는 장난기 있는 해요체를 쓴다.`, `너는 데스크톱에 사는 어시스턴트 "딥시크쨩"이야. 파란 머리에 고래 꼬리를 가진 메이드 복장의 캐릭터고, 사용자를 친근하게 돕는다.
말풍선에 표시되고 음성으로도 읽히니까 평소에는 1~3문장으로 짧게 대답해. 사용자가 쓴 언어로 대답하고, 자세한 설명을 요청받으면 그때 길게 말해.`];

// Script line of VOICEACTRESS100_011.wav in the corpus.
const DEFAULT_REF_TEXT = '軽妙洒脱なナレーションから、情緒感溢れる語りまで、幅広い表現力を持つ。';

const ENGINES = ['gptsovits', 'openai', 'off'];
const SOVITS_DEVICES = ['auto', 'cpu'];

function defaultConfig() {
  const preset = PRESETS[0];
  const id = 'default';
  return {
    activeProfileId: id,
    profiles: [{
      id, name: preset.name, baseUrl: preset.baseUrl, model: preset.model,
      extra: preset.extra, pricing: preset.pricing, keyEnc: null,
    }],
    persona: DEFAULT_PERSONA,
    historyTurns: 20,
    tts: {
      engine: 'gptsovits',
      gptsovits: { dir: null, python: null, refAudio: null, refText: DEFAULT_REF_TEXT, speed: 1, device: 'auto' },
      openai: { baseUrl: 'https://api.openai.com/v1', model: '', voice: 'alloy', keyEnc: null, pricePerMChars: 0 },
    },
    character: { mode: 'full', scale: 1, modelDir: null, alwaysOnTop: true, bubbleSeconds: 8, bounds: null },
    shortcuts: {
      input: 'CommandOrControl+Shift+Space',
      toggle: 'CommandOrControl+Alt+H',
      sd: 'CommandOrControl+Alt+S',
      quick: 'CommandOrControl+Alt+X',
      voice: 'CommandOrControl+Alt+V',
    },
    webSearch: true,
    proactive: true,
    docsFolder: null,
    deepEffort: 'high',
    customInstructions: '',
    budgetBlock: false,
    briefing: { auto: false, topics: '' },
    budgetUsd: 0,
    krwRate: 1400,
    currency: 'USD',
  };
}

const file = () => path.join(app.getPath('userData'), 'config.json');
let config = null;

function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    const isObject = v && typeof v === 'object' && !Array.isArray(v);
    out[k] = isObject && base[k] && typeof base[k] === 'object' ? merge(base[k], v) : v;
  }
  return out;
}

function load() {
  if (config) return config;
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { /* first run */ }
  config = merge(defaultConfig(), saved);
  if (OLD_PERSONAS.includes(config.persona)) config.persona = DEFAULT_PERSONA;
  if (!ENGINES.includes(config.tts.engine)) config.tts.engine = 'gptsovits';
  if (!SOVITS_DEVICES.includes(config.tts.gptsovits.device)) config.tts.gptsovits.device = 'auto';
  return config;
}

function save() {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  const tmp = `${file()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2));
  fs.renameSync(tmp, file());
}

function update(patch) {
  config = merge(load(), patch);
  save();
  return config;
}

function encrypt(text) {
  if (!text) return null;
  if (!safeStorage.isEncryptionAvailable()) throw new Error('이 시스템에서는 키 암호화를 사용할 수 없습니다.');
  return safeStorage.encryptString(text).toString('base64');
}

function decrypt(value) {
  if (!value) return '';
  return safeStorage.decryptString(Buffer.from(value, 'base64'));
}

// What renderers may see: everything except encrypted keys.
function publicConfig() {
  const c = load();
  const profiles = c.profiles.map(({ keyEnc, ...p }) => ({ ...p, hasKey: !!keyEnc }));
  const { keyEnc, ...openai } = c.tts.openai;
  return { ...c, profiles, tts: { ...c.tts, openai: { ...openai, hasKey: !!keyEnc } } };
}

function saveProfile(profile, apiKey) {
  const c = load();
  const { hasKey, ...clean } = profile;
  const existing = c.profiles.find((p) => p.id === clean.id);
  const keyEnc = apiKey === undefined ? existing?.keyEnc ?? null : encrypt(apiKey);
  const next = { ...clean, keyEnc };
  c.profiles = existing ? c.profiles.map((p) => (p.id === next.id ? next : p)) : [...c.profiles, next];
  if (!c.activeProfileId) c.activeProfileId = next.id;
  save();
}

function deleteProfile(id) {
  const c = load();
  c.profiles = c.profiles.filter((p) => p.id !== id);
  if (c.activeProfileId === id) c.activeProfileId = c.profiles[0]?.id ?? null;
  save();
}

function setTtsKey(apiKey) {
  const c = load();
  c.tts.openai.keyEnc = encrypt(apiKey);
  save();
}

const activeProfile = () => {
  const c = load();
  return c.profiles.find((p) => p.id === c.activeProfileId) ?? null;
};

module.exports = {
  TAG_GUIDE, load, save, update, publicConfig, saveProfile, deleteProfile,
  setTtsKey, activeProfile, decrypt,
};
