const BUBBLE_SPACE = 140; // px kept free above the character at scale 1
const DRAG_THRESHOLD = 4;
const NOD_INTERVAL = 2500;
const IDLE_CHECK_MS = 500;
const IDLE_FIRST_SECONDS = 15;
const IDLE_GAP_SECONDS = [14, 38]; // quiet time between idle acts
const SLEEP_AFTER_SECONDS = 300;

const canvas = document.getElementById('stage');
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const bubbleFoot = document.getElementById('bubble-foot');
const inputBar = document.getElementById('input-bar');
const input = document.getElementById('input');

let character;
let config;
let bubbleTimer = null;
let idleTimer = null;
let streaming = false;

// ---------------------------------------------------------------------- bubble

function showBubble(text, cls = '') {
  clearTimeout(bubbleTimer);
  bubble.className = cls;
  bubble.hidden = false;
  bubbleText.textContent = text;
  bubble.scrollTop = bubble.scrollHeight;
}

function appendBubble(text) {
  bubbleText.textContent += text;
  bubble.scrollTop = bubble.scrollHeight;
}

function settleBubble() {
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    bubble.hidden = true;
    character.relax();
  }, config.character.bubbleSeconds * 1000);
}

// ---------------------------------------------------------------------- speech

const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512;
analyser.connect(audioContext.destination);
const waveform = new Float32Array(analyser.fftSize);

const speech = {
  queue: [],          // segments in order, each with a `ready` promise
  running: false,
  parser: null,
  source: null,
  generation: 0,      // bumped on cancel so stale playback stops
};

function makeParser() {
  return new SpeechParser((segment) => enqueue(segment));
}

function enqueue(segment) {
  const spoken = speakable(segment.text);
  // Synthesize ahead so sentences play back without a gap.
  segment.ready = spoken ? window.api.speak(spoken).catch((err) => ({ error: err.message })) : Promise.resolve(null);
  segment.spoken = spoken;
  speech.queue.push(segment);
  pump();
}

async function pump() {
  if (speech.running) return;
  speech.running = true;
  const generation = speech.generation;
  let first = !bubbleText.dataset.started;
  while (speech.queue.length && generation === speech.generation) {
    const segment = speech.queue.shift();
    const result = await segment.ready;
    if (generation !== speech.generation) break;
    if (first) {
      showBubble('');
      bubbleText.dataset.started = '1';
      first = false;
    }
    segment.cue = Motions.resolveCue(segment, character.emotionName);
    await present(segment, result);
  }
  speech.running = false;
  if (generation === speech.generation && !streaming && !speech.queue.length) {
    delete bubbleText.dataset.started;
    settleBubble();
  }
}

// Types the sentence out over the time it takes to say it.
function typeOut(text, seconds, generation) {
  const chars = [...text];
  const start = performance.now();
  let shown = 0;
  return new Promise((resolve) => {
    const step = () => {
      if (generation !== speech.generation) return resolve();
      const want = Math.min(chars.length, Math.ceil(((performance.now() - start) / (seconds * 1000)) * chars.length));
      if (want > shown) {
        appendBubble(chars.slice(shown, want).join(''));
        shown = want;
      }
      if (shown < chars.length) requestAnimationFrame(step);
      else resolve();
    };
    step();
  });
}

async function present(segment, result) {
  const generation = speech.generation;
  if (result?.audio) {
    const buffer = await audioContext.decodeAudioData(result.audio.buffer.slice(0));
    if (generation !== speech.generation) return;
    await audioContext.resume();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    speech.source = source;
    const ended = new Promise((resolve) => { source.onended = resolve; });
    source.start();
    character.perform(segment.cue, buffer.duration);
    typeOut(segment.text, buffer.duration, generation);
    trackMouth(source);
    await ended;
    speech.source = null;
    character.mouth = 0;
    return;
  }
  // No audio (muted, engine off or TTS failed): still animate the mouth.
  if (result?.error) reportVoiceError(result.error);
  const seconds = Math.min(Math.max([...segment.text].length * 0.04, 0.3), 6);
  character.perform(segment.cue, seconds);
  const typed = typeOut(segment.text, seconds, generation);
  fakeMouth(typed);
  await typed;
}

// There is no stand-in voice, so a failure must be visible rather than silent.
let voiceWarned = false;

function reportVoiceError(message) {
  if (voiceWarned) return;
  voiceWarned = true;
  setFoot([{ warn: `⚠ 음성을 낼 수 없어요: ${errorText({ message })}` }]);
}

function trackMouth(source) {
  let level = 0;
  const step = () => {
    if (speech.source !== source) return;
    analyser.getFloatTimeDomainData(waveform);
    let sum = 0;
    for (const v of waveform) sum += v * v;
    const rms = Math.sqrt(sum / waveform.length);
    level += (Math.min(rms * 7, 1) - level) * 0.5;
    character.mouth = level;
    requestAnimationFrame(step);
  };
  step();
}

function fakeMouth(until) {
  let done = false;
  until.then(() => { done = true; character.mouth = 0; });
  const start = performance.now();
  const step = () => {
    if (done) return;
    const t = (performance.now() - start) / 1000;
    character.mouth = 0.35 + 0.35 * Math.sin(t * 16) * Math.sin(t * 5.3);
    requestAnimationFrame(step);
  };
  step();
}

function stopSpeech() {
  speech.generation += 1;
  speech.queue = [];
  speech.running = false;
  try { speech.source?.stop(); } catch { /* already ended */ }
  speech.source = null;
  character.mouth = 0;
  delete bubbleText.dataset.started;
}

// ------------------------------------------------------------------------ chat

function send(text, force = webMode ? 'search' : null, options = {}) {
  noteActivity(); // first, so waking up cannot wipe the reply's expression
  stopSpeech();
  streaming = true;
  setFoot([]);
  voiceWarned = false;
  character.listen(false);
  speech.parser = makeParser();
  character.thinking();
  showBubble('생각 중…', 'thinking');
  window.api.send(text, { force, ...options });
}

window.api.onDelta((delta) => speech.parser?.push(delta));

window.api.onStatus((text) => {
  bubble.hidden = false;
  clearTimeout(bubbleTimer);
  setFoot([text]);
  character.setProp('monocle');
  character.play('lookDown', 0, 0.6);
});

// Built with textContent only: nothing from the web can become markup or a link.
function setFoot(lines) {
  bubbleFoot.textContent = '';
  bubbleFoot.hidden = !lines.length;
  for (const line of lines) {
    const row = document.createElement('div');
    if (line.warn) row.className = 'warn';
    row.textContent = line.warn ?? line;
    bubbleFoot.append(row);
  }
}

function showReport({ sources = [], suspicious = 0, blocked = 0, budget = null, deep = null }) {
  const lines = voiceWarned ? [...bubbleFoot.children].map((row) => (row.className === 'warn' ? { warn: row.textContent } : row.textContent)) : [];
  if (deep) lines.push(`깊게 생각함 (${deep})`);
  if (sources.length) lines.push(`출처: ${[...new Set(sources.map((s) => s.host))].join(', ')}`);
  if (suspicious) lines.push({ warn: `⚠ 가져온 자료의 수상한 지시 ${suspicious}건을 제거했어요` });
  if (blocked) lines.push({ warn: `⚠ 허용되지 않은 요청 ${blocked}건을 막았어요` });
  if (budget) lines.push({ warn: `⚠ ${budget}` });
  setFoot(lines);
}

window.api.onDone((report) => {
  streaming = false;
  showReport(report ?? {});
  speech.parser?.flush();
  speech.parser = null;
  if (!speech.running && !speech.queue.length) {
    delete bubbleText.dataset.started;
    if (bubble.classList.contains('thinking')) {
      bubble.hidden = true;
      character.relax();
    } else settleBubble();
  }
});

window.api.onError((message) => {
  streaming = false;
  speech.parser = null;
  stopSpeech();
  character.preview('panic');
  showBubble(message, 'error');
  settleBubble();
});

// ----------------------------------------------------------------------- input

function openInput() {
  noteActivity();
  inputBar.hidden = false;
  character.listen(true);
  setInteractive(true);
  window.api.focusInput();
  input.focus();
}

function closeInput() {
  inputBar.hidden = true;
  character.listen(false);
  input.value = '';
  input.style.height = '';
}

inputBar.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = '';
  refreshPalette();
  if (Commands.parse(text)) runCommand(text);
  else if (quickText) {
    const selected = quickText;
    quickText = '';
    send(withSelection(text, selected));
  } else send(text.startsWith('//') ? text.slice(1) : text);
});

input.addEventListener('keydown', (e) => {
  if (e.isComposing) return;
  if (!palette.hidden && paletteKey(e)) return;
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    inputBar.requestSubmit();
  }
});

input.addEventListener('input', () => {
  character.listen(true);
  refreshPalette();
  // An occasional small nod shows she is following along.
  if (performance.now() - lastNod > NOD_INTERVAL) {
    lastNod = performance.now();
    character.play('nod', 0, 0.35);
  }
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
});

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!confirmBox.hidden) answerConfirm(false);
  else if (quickText) {
    quickText = '';
    refreshPalette();
    closeInput();
  } else if (!palette.hidden) {
    input.value = '';
    refreshPalette();
  } else if (streaming || speech.running) {
    window.api.cancel();
    stopSpeech();
    streaming = false;
    bubble.hidden = true;
    character.relax();
  } else closeInput();
});

// -------------------------------------------------------------------- commands

const palette = document.getElementById('palette');
const tray = document.getElementById('tray');
const confirmBox = document.getElementById('confirm');

let webMode = false;
let paletteRows = [];
let paletteIndex = 0;

function optionsFor(kind) {
  if (kind === 'emotions') return Object.entries(Motions.EMOTION_LABELS).map(([value, label]) => ({ value, label }));
  if (kind === 'clips') return Object.entries(Motions.CLIP_LABELS).map(([value, label]) => ({ value, label }));
  return config.profiles.map((p) => ({ value: p.id, label: p.name }));
}

// Rows for the palette: commands, or a command's choices once it is typed.
function paletteFor(text) {
  if (quickText && !text.trim()) return QUICK_ACTIONS.map(([title, prompt]) => ({ title, action: () => runQuick(prompt) }));
  const parsed = Commands.parse(text);
  if (!parsed) return [];
  const command = parsed.typingArg ? Commands.resolve(parsed.word) : null;
  if (command?.options) {
    const word = parsed.arg.toLowerCase();
    return optionsFor(command.options)
      .filter((o) => o.label.toLowerCase().includes(word) || o.value.toLowerCase().includes(word))
      .map((o) => ({ title: o.label, fill: `/${command.name} ${o.value}`, run: true }));
  }
  return Commands.suggest(text).map((c) => ({
    title: `/${c.name}${c.args ? ` ${c.args}` : ''}`,
    detail: c.hint,
    fill: `/${c.name}${c.args ? ' ' : ''}`,
    run: !c.args,
  }));
}

function refreshPalette() {
  const text = input.value;
  inputBar.classList.toggle('command', !!Commands.parse(text));
  paletteRows = paletteFor(text);
  paletteIndex = 0;
  drawPalette();
}

function drawPalette() {
  palette.replaceChildren(...paletteRows.map((row, i) => {
    const item = document.createElement('li');
    item.className = i === paletteIndex ? 'active' : '';
    const title = document.createElement('b');
    title.textContent = row.title;
    item.append(title);
    if (row.detail) {
      const detail = document.createElement('small');
      detail.textContent = row.detail;
      item.append(detail);
    }
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      choosePalette(row);
    });
    return item;
  }));
  palette.hidden = !paletteRows.length;
  palette.children[paletteIndex]?.scrollIntoView({ block: 'nearest' });
}

function choosePalette(row) {
  if (row.action) return row.action();
  input.value = row.fill;
  refreshPalette();
  input.focus();
  if (row.run) inputBar.requestSubmit();
  return undefined;
}

// Selected text waits here until an action is chosen; typing asks about it freely.
let quickText = '';

const QUICK_ACTIONS = [
  ['번역', '다음 글을 번역해 줘. 한국어면 영어로, 그 외의 언어면 한국어로. 번역문만 말해.'],
  ['요약', '다음 글을 핵심만 세 줄로 요약해 줘.'],
  ['쉽게 설명', '다음 글을 쉽게 풀어서 설명해 줘.'],
  ['다듬기', '다음 글을 자연스럽게 다듬어 줘. 다듬은 글만 말해.'],
];

const withSelection = (ask, text) => `${ask}\n\n선택한 글:\n${text}`;

function runQuick(prompt) {
  const text = quickText;
  quickText = '';
  input.value = '';
  refreshPalette();
  send(withSelection(prompt, text));
}

window.api.onQuick(({ text, fromClipboard, pressed }) => {
  if (!text) {
    say(pressed
      ? '선택한 글을 찾지 못했어요. 글을 선택한 뒤 다시 눌러 주세요.'
      : '글을 읽을 권한이 없어요. 시스템 설정 > 개인정보 보호 및 보안 > 손쉬운 사용에서 Electron을 허용해 주세요.', 'error');
    return;
  }
  quickText = text;
  const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text;
  say(`${fromClipboard ? '복사된 글' : '선택한 글'}: "${preview}"\n어떻게 할까요? 직접 물어봐도 돼요.`);
  input.value = '';
  refreshPalette();
});

// Prepared lines she says on her own: no API call.
function announce({ text, tags }) {
  noteActivity();
  character.listen(false);
  enqueue({ text, tags });
}

window.api.onSay(announce);

// Returns true when the key belonged to the palette.
function paletteKey(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    paletteIndex = (paletteIndex + step + paletteRows.length) % paletteRows.length;
    drawPalette();
    return true;
  }
  if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
    e.preventDefault();
    choosePalette(paletteRows[paletteIndex]);
    return true;
  }
  return false;
}

function say(message, cls = '') {
  showBubble(message, `${cls} notice`);
  setFoot([]);
  bubble.scrollTop = 0; // read from the first line, unlike a reply being typed out
  settleBubble();
}

function drawTray(items) {
  const chips = [];
  if (webMode) {
    const mode = document.createElement('div');
    mode.className = 'chip mode';
    mode.textContent = '웹검색 켜짐';
    mode.append(removeButton('웹검색 끄기', () => setWebMode(false)));
    chips.push(mode);
  }
  for (const item of items) {
    const chip = document.createElement('div');
    chip.className = item.hold ? 'chip hold' : 'chip';
    chip.title = `${item.name}\n${item.hold ? '클릭하면 Hold 해제' : '클릭하면 Hold: 보낸 뒤에도 유지'}`;
    chip.tabIndex = 0;
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-pressed', String(item.hold));
    chip.addEventListener('click', () => toggleHold(item));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggleHold(item);
    });
    if (item.thumb) {
      const image = document.createElement('img');
      image.src = item.thumb;
      image.alt = item.name;
      chip.append(image);
    } else {
      const icon = document.createElement('div');
      icon.className = 'file-icon';
      icon.textContent = item.kind === 'text' ? 'TXT' : 'IMG';
      chip.append(icon);
    }
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.name;
    chip.append(name, removeButton(`${item.name} 빼기`, async () => {
      setAttached(await window.api.removeAttachment(item.id));
    }));
    if (item.hold) {
      const badge = document.createElement('div');
      badge.className = 'hold-badge';
      badge.textContent = 'HOLD';
      chip.append(badge);
    }
    chips.push(chip);
  }
  tray.replaceChildren(...chips);
  tray.hidden = !chips.length;
}

function removeButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove';
  button.textContent = '×';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // the chip's own click means Hold
    onClick();
  });
  return button;
}

let attachedItems = [];

async function toggleHold(item) {
  setAttached(await window.api.toggleHold(item.id));
}

async function attachFiles() {
  try {
    setAttached(await window.api.pickFiles());
  } catch (err) {
    say(errorText(err), 'error');
  }
  input.focus();
}

document.getElementById('attach-button').addEventListener('click', attachFiles);

// Files dragged onto the character or the input bar. Empty window areas let the
// mouse through, so drops only land where she is.
const dropHint = document.getElementById('drop-hint');
let dragDepth = 0;

const carriesFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');

window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  if (!carriesFiles(e)) return;
  dragDepth += 1;
  dropHint.hidden = false;
  noteActivity();
});

window.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) dropHint.hidden = true;
});

window.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragDepth = 0;
  dropHint.hidden = true;
  const files = [...(e.dataTransfer?.files ?? [])];
  if (!files.length) return;
  const { list, errors } = await window.api.attachDropped(files);
  setAttached(list);
  if (inputBar.hidden) openInput();
  else input.focus();
  if (errors.length) say(errors.join('\n'), 'error');
});

function setAttached(items) {
  attachedItems = items;
  drawTray(items);
}

async function setWebMode(on) {
  if (on && !(await window.api.searchAvailable())) {
    say('웹 검색을 쓰려면 DeepSeek 키가 저장된 연결이 필요하고, 설정에서 웹 검색이 켜져 있어야 해요.', 'error');
    return;
  }
  webMode = on;
  drawTray(attachedItems);
  say(on ? '웹검색 모드를 켰어요. 이제 질문은 꼭 찾아보고 답할게요.' : '웹검색 모드를 껐어요.');
}

const errorText = (err) => err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, '');

// Screen sharing never sends on its own: this waits for the user's click.
let confirmDone = null;

function askConfirm({ preview, provider }) {
  document.getElementById('confirm-text').textContent = `이 화면을 ${provider}(으)로 보낼까요? 화면에 민감한 내용이 없는지 확인해 주세요.`;
  document.getElementById('confirm-image').src = preview;
  confirmBox.hidden = false;
  document.getElementById('confirm-no').focus();
  return new Promise((resolve) => { confirmDone = resolve; });
}

function answerConfirm(accepted) {
  confirmBox.hidden = true;
  document.getElementById('confirm-image').removeAttribute('src');
  confirmDone?.(accepted);
  confirmDone = null;
}

document.getElementById('confirm-yes').addEventListener('click', () => answerConfirm(true));
document.getElementById('confirm-no').addEventListener('click', () => answerConfirm(false));

async function shareScreen(question) {
  const wasOpen = !inputBar.hidden;
  const accepted = await askConfirm(await window.api.captureScreen());
  setAttached(await window.api.confirmScreen(accepted));
  if (!accepted) return say('화면을 보내지 않았어요.');
  if (question) send(question);
  else {
    say('화면을 첨부했어요. 무엇이 궁금하세요?');
    if (!wasOpen) openInput();
    else input.focus();
  }
}

async function showUsage() {
  const records = await window.api.usage();
  const dayStart = new Date().setHours(0, 0, 0, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const total = (since) => records.filter((r) => r.ts >= since).reduce((sum, r) => sum + (r.cost ?? 0), 0);
  const asks = records.filter((r) => r.ts >= dayStart && r.kind === 'chat').length;
  say(`오늘 $${total(dayStart).toFixed(4)} (${asks}회), 이번 달 $${total(monthStart).toFixed(4)} 썼어요.`);
}

const showHelp = () => say(Commands.HELP_TEXT);

const translatePrompt = (text) => `다음 글을 번역해 줘. 한국어면 영어로, 그 외의 언어면 한국어로. 번역문만 말해.\n\n${text}`;

const formatWhen = (at) => new Date(at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ------------------------------------------------------------------- pet & briefing

const pick = (list) => list[Math.floor(Math.random() * list.length)];

async function feed() {
  const { fullness, wasFull } = await window.api.feed();
  announce(wasFull
    ? { text: '우으… 더는 못 먹어요. 그래도 남기진 않을 거예요.', tags: ['tired', 'sigh'] }
    : { text: `${pick(['흰쌀밥이다! 잘 먹겠습니다!', '역시 주인님은 뭘 좀 아시네요!', '이게 바로 토큰보다 좋은 거예요.'])} (배부름 ${fullness}%)`, tags: ['excited', 'hop'] });
}

async function pat() {
  await window.api.pat();
  announce({
    text: pick(['흐, 흥. 별로 안 기쁘거든요?', '거기 말고… 아니, 거기 맞아요.', '착각하지 마세요, 잠깐 허락한 거예요.', '에헤헤… 아, 방금 건 못 들은 걸로 해요.']),
    tags: ['shy', 'tailWag'],
  });
}

async function briefing() {
  const { topics, cost, requests, reminders } = await window.api.briefingData();
  const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'full' });
  const plans = reminders.map((r) => `${formatWhen(r.at)} ${r.text}`).join(', ') || '없음';
  const facts = `오늘은 ${today}. 어제 사용량은 ${requests}회에 $${cost.toFixed(4)}. 예약된 알림: ${plans}.`;
  const canSearch = topics.trim() && (await window.api.searchAvailable());
  const ask = canSearch
    ? `아침 브리핑을 해 줘. ${facts} 다음 주제의 오늘 소식을 웹에서 찾아 주제마다 한 문장으로 알려 줘: ${topics}`
    : `아침 브리핑을 해 줘. ${facts} 세 문장 안으로 말해 줘.`;
  send(ask, canSearch ? 'search' : null);
}

window.api.onBriefing(briefing);

// ----------------------------------------------------------------------- voice

const micButton = document.getElementById('mic-button');
const SILENCE_LEVEL = 0.012;
const SILENCE_STOP_MS = 1400;
const MAX_RECORD_MS = 30000;

let recorder = null;

async function startVoice() {
  stopSpeech();
  await window.api.prepareVoice();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const context = new AudioContext();
  const meter = context.createAnalyser();
  context.createMediaStreamSource(stream).connect(meter);
  const samples = new Float32Array(meter.fftSize);
  const started = performance.now();
  let heard = false;
  let lastLoud = started;

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = async () => {
    recorder = null;
    micButton.classList.remove('recording');
    stream.getTracks().forEach((track) => track.stop());
    context.close();
    if (!heard) return say('아무 말도 안 들렸어요.');
    showBubble('알아듣는 중…', 'thinking');
    try {
      const text = await window.api.transcribe(await new Blob(chunks).arrayBuffer());
      if (text) send(text);
      else say('무슨 말인지 못 알아들었어요.');
    } catch (err) {
      say(errorText(err), 'error');
    }
    return undefined;
  };
  recorder.start();
  micButton.classList.add('recording');
  character.listen(true);
  showBubble('듣고 있어요…', 'thinking');

  const watch = () => {
    if (!recorder) return;
    meter.getFloatTimeDomainData(samples);
    const level = Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length);
    const now = performance.now();
    if (level > SILENCE_LEVEL) {
      heard = true;
      lastLoud = now;
    }
    if ((heard && now - lastLoud > SILENCE_STOP_MS) || now - started > MAX_RECORD_MS) recorder.stop();
    else requestAnimationFrame(watch);
  };
  watch();
}

async function toggleVoice() {
  try {
    if (recorder) recorder.stop();
    else await startVoice();
  } catch (err) {
    micButton.classList.remove('recording');
    say(`마이크를 쓸 수 없어요: ${errorText(err)}`, 'error');
  }
}

micButton.addEventListener('click', toggleVoice);
window.api.onVoice(toggleVoice);

const COMMAND_RUNNERS = {
  웹검색: () => setWebMode(!webMode),
  검색: (arg) => (arg ? send(arg, 'search') : say('/검색 뒤에 질문을 적어 주세요.')),
  읽기: (arg) => {
    const [url, ...rest] = arg.split(/\s+/);
    if (!/^https?:\/\//.test(url)) return say('/읽기 뒤에 https로 시작하는 주소를 적어 주세요.');
    return send(`${url}\n${rest.join(' ') || '이 페이지의 핵심을 짧게 알려 줘.'}`, 'fetch');
  },
  첨부파일: attachFiles,
  첨부해제: async () => {
    setAttached(await window.api.clearAttachments());
    say('첨부를 모두 뺐어요.');
  },
  알림: async (arg) => {
    if (!arg) {
      const list = await window.api.listReminders();
      return say(list.length
        ? list.map((r) => `${formatWhen(r.at)} ${r.text}`).join('\n')
        : '예약된 알림이 없어요. /알림 30분 뒤 회의 처럼 적어 주세요.');
    }
    const found = Reminders.parseReminder(arg, Date.now(), true);
    if (!found) return say('언제 알려 드릴까요? /알림 30분 뒤 회의, /알림 오후 3시 반 약 처럼 적어 주세요.');
    await window.api.addReminder(found.at, found.text);
    return say(`${formatWhen(found.at)}에 "${found.text}" 알려 드릴게요.`);
  },
  알림취소: async () => {
    await window.api.clearReminders();
    say('알림을 모두 지웠어요.');
  },
  음성: () => toggleVoice(),
  기억해: async (arg) => {
    if (!arg) return say('/기억해 뒤에 내용을 적어 주세요.');
    await window.api.remember(arg);
    return say(`기억할게요: ${arg}`);
  },
  기억목록: async () => {
    const list = await window.api.memories();
    say(list.length ? list.map((m, i) => `${i + 1}. ${m.text}`).join('\n') : '저장한 기억이 없어요. /기억해 내용 으로 알려 주세요.');
  },
  잊어: async (arg) => say((await window.api.forget(Number(arg) - 1)) ? `${arg}번 기억을 지웠어요.` : '/기억목록 의 번호를 적어 주세요.'),
  문서: (arg) => (arg ? send(arg, 'docs') : say('/문서 뒤에 질문을 적어 주세요.')),
  문서갱신: async () => {
    const { files, chunks } = await window.api.rebuildDocs();
    say(`문서 ${files}개를 읽었어요 (${chunks}조각).`);
  },
  깊게: (arg) => (arg ? send(arg, webMode ? 'search' : null, { deep: true }) : say('/깊게 뒤에 질문을 적어 주세요.')),
  강행: (arg) => (arg ? send(arg, webMode ? 'search' : null, { overBudget: true }) : say('/강행 뒤에 질문을 적어 주세요.')),
  밥: feed,
  쓰다듬기: pat,
  상태: async () => {
    const { fullness, patted } = await window.api.petStatus();
    say(`배부름 ${fullness}% · 쓰다듬은 횟수 ${patted}번. ${fullness < 30 ? '배고파요…' : fullness > 85 ? '배불러서 졸려요.' : '이 정도면 일할 만해요.'}`);
  },
  브리핑: briefing,
  화면공유: (arg) => shareScreen(arg),
  클립보드: async () => {
    setAttached(await window.api.attachClipboard());
    say('클립보드 내용을 첨부했어요.');
  },
  다시: async () => {
    const question = await window.api.retry();
    if (question) send(question, webMode ? 'search' : null, { retry: true });
    else say('다시 할 답변이 없어요.');
  },
  복사: async () => say((await window.api.copyReply()) ? '마지막 답변을 복사했어요.' : '복사할 답변이 없어요.'),
  요약: (arg) => send(arg ? `다음 글을 세 줄로 요약해 줘.\n\n${arg}` : '지금까지 우리 대화를 세 줄로 요약해 줘.'),
  번역: (arg) => (arg ? send(translatePrompt(arg)) : say('/번역 뒤에 글을 적어 주세요.')),
  모델: async (arg) => {
    const profile = config.profiles.find((p) => p.id === arg || p.name === arg);
    if (!profile) return say('설정에 있는 연결을 골라 주세요.');
    await window.api.appAction('profile', profile.id);
    config = await window.api.getConfig();
    return say(`${profile.name}(으)로 바꿨어요.`);
  },
  새대화: async () => {
    await window.api.clearHistory();
    say('새 대화를 시작했어요. 지난 대화는 기록 창에서 이어 갈 수 있어요.');
  },
  사용량: showUsage,
  표정: (arg) => {
    if (!Motions.PRESETS[arg]) return say('목록에서 표정을 골라 주세요.');
    character.preview(arg);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => character.relax(), 5000);
    return undefined;
  },
  동작: (arg) => (Motions.CLIPS[arg] ? character.play(arg) : say('목록에서 동작을 골라 주세요.')),
  음소거: async () => say((await window.api.appAction('mute')).muted ? '음소거했어요.' : '음소거를 풀었어요.'),
  SD: () => window.api.appAction('sd'),
  기록: () => window.api.appAction('log'),
  대시보드: () => window.api.appAction('dashboard'),
  설정: () => window.api.appAction('settings'),
  숨기기: () => window.api.appAction('hide'),
  도움말: showHelp,
};

async function runCommand(text) {
  const { word, arg } = Commands.parse(text);
  const command = Commands.resolve(word);
  if (!command) return say(Commands.unknownText(word), 'error');
  try {
    await COMMAND_RUNNERS[command.name](arg);
  } catch (err) {
    say(errorText(err), 'error');
  }
  return undefined;
}

window.api.onAttachments(setAttached);

// ----------------------------------------------- click-through, drag and clicks

let interactive = false;
let drag = null;
let lastNod = 0;

function setInteractive(on) {
  if (on === interactive) return;
  interactive = on;
  window.api.setClickThrough(!on);
}

const overUi = (target) => target?.closest?.('#bubble, #input-bar, #palette, #tray, #confirm');

// Driven by the main process's cursor feed rather than forwarded mouse events,
// which do not reliably reach an unfocused transparent window.
function updateHit(x, y) {
  if (drag || !character?.model) return;
  const inside = x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight;
  const over = inside && (!!overUi(document.elementFromPoint(x, y)) || character.hit(x, y));
  setInteractive(over);
  if (over) noteActivity();
}

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  drag = { x: e.screenX, y: e.screenY, moved: false };
});

window.addEventListener('mousemove', (e) => {
  if (!drag) return;
  const dx = e.screenX - drag.x;
  const dy = e.screenY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
  drag.moved = true;
  drag.x = e.screenX;
  drag.y = e.screenY;
  window.api.moveBy(dx, dy);
});

// A second click soon after is a pat, so the first has to wait a moment.
const DOUBLE_CLICK_MS = 260;
let clickTimer = null;

window.addEventListener('mouseup', (e) => {
  if (!drag) return;
  const clicked = !drag.moved && character.hit(e.clientX, e.clientY);
  drag = null;
  if (!clicked) return;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    pat();
    return;
  }
  clickTimer = setTimeout(() => {
    clickTimer = null;
    if (inputBar.hidden) openInput();
    else closeInput();
  }, DOUBLE_CLICK_MS);
});

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (!overUi(e.target)) window.api.contextMenu();
});

// ----------------------------------------------------------------------- start

// ------------------------------------------------------------------ left alone

const idle = { since: performance.now(), next: 0, actUntil: 0 };

const idleSeconds = () => (performance.now() - idle.since) / 1000;
const isBusy = () => streaming || speech.running || !inputBar.hidden || !bubble.hidden || !!drag;

// Any sign of the user resets the clock, and wakes her if she dozed off.
function noteActivity() {
  idle.since = performance.now();
  idle.next = 0;
  if (character?.asleep) character.wake();
  else if (idle.actUntil) {
    idle.actUntil = 0;
    character.relax();
  }
}

function idleStep() {
  if (!character?.model) return;
  if (isBusy()) {
    if (character.asleep || idle.actUntil) noteActivity();
    idle.since = performance.now();
    return;
  }
  if (character.asleep) return;
  const now = performance.now();
  if (idle.actUntil) {
    if (now < idle.actUntil) return;
    idle.actUntil = 0;
    character.relax();
  }
  const seconds = idleSeconds();
  if (seconds >= SLEEP_AFTER_SECONDS) {
    character.sleep();
    return;
  }
  if (seconds < IDLE_FIRST_SECONDS || now < idle.next) return;
  const act = Motions.pickIdleAct(seconds);
  character.actIdle(act);
  idle.actUntil = now + act.seconds * 1000;
  const [low, high] = IDLE_GAP_SECONDS;
  idle.next = idle.actUntil + (low + Math.random() * (high - low)) * 1000;
}

setInterval(idleStep, IDLE_CHECK_MS);

window.api.onOpenInput(openInput);
window.api.onExpression((name) => {
  noteActivity();
  character.preview(name);
  if (!streaming && !speech.running) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => character.relax(), 5000);
  }
});
window.api.onMode((mode) => {
  config.character.mode = mode;
  applyMetrics();
  character.setMode(mode);
});
window.api.onMuted(() => stopSpeech());
window.api.onCursor(({ x, y }) => updateHit(x, y));
window.api.onConfigChanged(async () => { config = await window.api.getConfig(); });

function applyMetrics() {
  character.top = BUBBLE_SPACE * config.character.scale;
}

(async () => {
  config = await window.api.getConfig();
  const status = await window.api.modelStatus();
  character = new Character(canvas, {
    mode: config.character.mode,
    top: BUBBLE_SPACE * config.character.scale,
  });
  if (!status.dir) {
    showBubble('모델 폴더를 찾지 못했어요. 설정에서 지정해 주세요.', 'error');
    return;
  }
  try {
    await character.load(status.url);
    window.dscReady = true;
  } catch (err) {
    showBubble(`모델을 불러오지 못했어요: ${err.message}`, 'error');
  }
})();
