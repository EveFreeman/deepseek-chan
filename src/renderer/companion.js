const BUBBLE_SPACE = 140; // px kept free above the character at scale 1
const DRAG_THRESHOLD = 4;
const NOD_INTERVAL = 2500;
const WARM_INTERVAL = 30000; // how often typing tells the voice server it will be needed
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
const { t } = I18n;
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
  setFoot([{ warn: t('chat.voiceFail', { error: errorText({ message }) }) }]);
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
  showBubble(t('chat.thinking'), 'thinking');
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
  if (deep) lines.push(t('chat.deep', { effort: deep }));
  if (sources.length) lines.push(t('chat.sources', { hosts: [...new Set(sources.map((s) => s.host))].join(', ') }));
  if (suspicious) lines.push({ warn: t('chat.suspicious', { n: suspicious }) });
  if (blocked) lines.push({ warn: t('chat.blocked', { n: blocked }) });
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
  // A reply is coming: have the voice server up before its first sentence.
  if (performance.now() - lastWarm > WARM_INTERVAL) {
    lastWarm = performance.now();
    window.api.warmSpeech();
  }
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
  if (kind === 'emotions') return Object.entries(I18n.raw('emotions')).map(([value, label]) => ({ value, label }));
  if (kind === 'clips') return Object.entries(I18n.raw('clips')).map(([value, label]) => ({ value, label }));
  return config.profiles.map((p) => ({ value: p.id, label: p.name }));
}

// Rows for the palette: commands, or a command's choices once it is typed.
function paletteFor(text) {
  if (quickText && !text.trim()) return QUICK_ACTIONS.map(([title, prompt]) => ({ title: t(title), action: () => runQuick(t(prompt)) }));
  const parsed = Commands.parse(text);
  if (!parsed) return [];
  const command = parsed.typingArg ? Commands.resolve(parsed.word) : null;
  if (command?.options) {
    const word = parsed.arg.toLowerCase();
    return optionsFor(command.options)
      .filter((o) => o.label.toLowerCase().includes(word) || o.value.toLowerCase().includes(word))
      .map((o) => ({ title: o.label, fill: `/${Commands.label(command)} ${o.value}`, run: true }));
  }
  return Commands.suggest(text).map((c) => {
    const name = Commands.label(c);
    const args = Commands.args(c);
    return { title: `/${name}${args ? ` ${args}` : ''}`, detail: Commands.hint(c), fill: `/${name}${args ? ' ' : ''}`, run: !args };
  });
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

// [label key, prompt key] for selected text.
const QUICK_ACTIONS = [
  ['quick.translate', 'prompt.translate'],
  ['quick.summary', 'quick.summaryPrompt'],
  ['quick.explain', 'quick.explainPrompt'],
  ['quick.polish', 'quick.polishPrompt'],
];

const withSelection = (ask, text) => t('quick.withSelection', { ask, text });

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
      ? t('quick.notFound')
      : t('quick.noPermission'), 'error');
    return;
  }
  quickText = text;
  const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text;
  say(t('quick.offer', { source: t(fromClipboard ? 'quick.copied' : 'quick.selected'), preview }));
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
    mode.textContent = t('web.chip');
    mode.append(removeButton(t('web.off'), () => setWebMode(false)));
    chips.push(mode);
  }
  for (const item of items) {
    const chip = document.createElement('div');
    chip.className = item.hold ? 'chip hold' : 'chip';
    chip.title = `${item.name}\n${t(item.hold ? 'attach.holdOff' : 'attach.holdOn')}`;
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
    chip.append(name, removeButton(t('attach.remove', { name: item.name }), async () => {
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
    say(t('web.needKey'), 'error');
    return;
  }
  webMode = on;
  drawTray(attachedItems);
  say(t(on ? 'web.on' : 'web.offSaid'));
}

const errorText = (err) => err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, '');

// Screen sharing never sends on its own: this waits for the user's click.
let confirmDone = null;

function askConfirm({ preview, provider }) {
  document.getElementById('confirm-text').textContent = t('screen.confirm', { provider });
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
  if (!accepted) return say(t('screen.notSent'));
  if (question) send(question);
  else {
    say(t('screen.attached'));
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
  say(t('chat.usage', { today: total(dayStart).toFixed(4), asks, month: total(monthStart).toFixed(4) }));
}

const showHelp = () => say(Commands.helpText());

const translatePrompt = (text) => `${t('prompt.translate')}\n\n${text}`;

const formatWhen = (at) => new Date(at).toLocaleString(I18n.dateLocale(), { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ------------------------------------------------------------------- pet & briefing


async function feed() {
  const { wasFull } = await window.api.feed();
  hungry = false;
  placeFood();
  announce(wasFull
    ? { text: t('pet.full'), tags: ['tired', 'sigh'] }
    : { text: I18n.pick('pet.fed'), tags: ['excited', 'hop'] });
}

// The rice-bowl bubble: shown beside her head while she is hungry and nothing else is
// on screen above her.
const foodEl = document.getElementById('food');
const HUNGRY_BELOW = 50;
const FOOD_CHECK_MS = 60000;
let hungry = false;

async function checkHunger() {
  hungry = (await window.api.petStatus()).fullness < HUNGRY_BELOW;
  placeFood();
}

function placeFood() {
  const box = hungry && bubble.hidden && character?.model ? character.bounds() : null;
  foodEl.hidden = !box;
  if (!box) return;
  const w = foodEl.offsetWidth;
  const h = foodEl.offsetHeight;
  // Up and to the right of her face, the tail pointing back at her.
  const x = Math.min(window.innerWidth - w - 4, box.x + box.w * 0.62);
  const y = Math.max(4, box.y + Math.min(box.h * 0.12, 60) - h * 0.75);
  Object.assign(foodEl.style, { left: `${x}px`, top: `${y}px` });
}

foodEl.addEventListener('click', feed);
setInterval(checkHunger, FOOD_CHECK_MS);
// Out of the way while she talks; back when the speech bubble closes.
new MutationObserver(() => placeFood()).observe(bubble, { attributes: true, attributeFilter: ['hidden'] });

async function pat() {
  await window.api.pat();
  announce({
    text: I18n.pick('pet.pat'),
    tags: ['shy', 'tailWag'],
  });
}

async function briefing() {
  const { topics, cost, requests, reminders } = await window.api.briefingData();
  const today = new Date().toLocaleDateString(I18n.dateLocale(), { dateStyle: 'full' });
  const plans = reminders.map((r) => `${formatWhen(r.at)} ${r.text || t('reminder.fallback')}`).join(', ') || t('prompt.none');
  const facts = t('prompt.briefFacts', { today, requests, cost: cost.toFixed(4), plans });
  const canSearch = topics.trim() && (await window.api.searchAvailable());
  const ask = canSearch
    ? t('prompt.briefSearch', { facts, topics })
    : t('prompt.briefPlain', { facts });
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
    if (!heard) return say(t('voice.nothing'));
    showBubble(t('voice.recognizing'), 'thinking');
    try {
      const text = await window.api.transcribe(await new Blob(chunks).arrayBuffer());
      if (text) send(text);
      else say(t('voice.unclear'));
    } catch (err) {
      say(errorText(err), 'error');
    }
    return undefined;
  };
  recorder.start();
  window.api.warmVoice();
  micButton.classList.add('recording');
  character.listen(true);
  showBubble(t('voice.listening'), 'thinking');

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
    say(t('voice.micFail', { error: errorText(err) }), 'error');
  }
}

micButton.addEventListener('click', toggleVoice);
window.api.onVoice(toggleVoice);

const COMMAND_RUNNERS = {
  웹검색: () => setWebMode(!webMode),
  검색: (arg) => (arg ? send(arg, 'search') : say(t('said.needQuestion', { cmd: Commands.slash('검색') }))),
  읽기: (arg) => {
    const [url, ...rest] = arg.split(/\s+/);
    if (!/^https?:\/\//.test(url)) return say(t('said.needUrl', { cmd: Commands.slash('읽기') }));
    return send(`${url}\n${rest.join(' ') || t('prompt.readDefault')}`, 'fetch');
  },
  첨부파일: attachFiles,
  첨부해제: async () => {
    setAttached(await window.api.clearAttachments());
    say(t('attach.cleared'));
  },
  알림: async (arg) => {
    if (!arg) {
      const list = await window.api.listReminders();
      return say(list.length
        ? list.map((r) => `${formatWhen(r.at)} ${r.text || t('reminder.fallback')}`).join('\n')
        : t('reminder.none'));
    }
    const found = Reminders.parseReminder(arg, Date.now(), true);
    if (!found) return say(t('reminder.how'));
    await window.api.addReminder(found.at, found.text);
    return say(t('reminder.set', { when: formatWhen(found.at), text: found.text || t('reminder.fallback') }));
  },
  알림취소: async () => {
    await window.api.clearReminders();
    say(t('reminder.cleared'));
  },
  음성: () => toggleVoice(),
  기억해: async (arg) => {
    if (!arg) return say(t('said.needMemory', { cmd: Commands.slash('기억해') }));
    await window.api.remember(arg);
    return say(t('said.remembered', { text: arg }));
  },
  기억목록: async () => {
    const list = await window.api.memories();
    say(list.length ? list.map((m, i) => `${i + 1}. ${m.text}`).join('\n') : t('said.noMemories', { cmd: Commands.slash('기억해') }));
  },
  잊어: async (arg) => say((await window.api.forget(Number(arg) - 1)) ? t('said.forgot', { n: arg }) : t('said.forgetHow', { cmd: Commands.slash('기억목록') })),
  문서: (arg) => (arg ? send(arg, 'docs') : say(t('said.needQuestion', { cmd: Commands.slash('문서') }))),
  문서갱신: async () => {
    const { files, chunks } = await window.api.rebuildDocs();
    say(t('said.docsRead', { files, chunks }));
  },
  깊게: (arg) => (arg ? send(arg, webMode ? 'search' : null, { deep: true }) : say(t('said.needQuestion', { cmd: Commands.slash('깊게') }))),
  강행: (arg) => (arg ? send(arg, webMode ? 'search' : null, { overBudget: true }) : say(t('said.needQuestion', { cmd: Commands.slash('강행') }))),
  밥: feed,
  쓰다듬기: pat,
  상태: async () => {
    const { fullness, patted } = await window.api.petStatus();
    say(t('pet.status', { fullness, patted, mood: t(fullness < 30 ? 'pet.hungry' : fullness > 85 ? 'pet.stuffed' : 'pet.fine') }));
  },
  브리핑: briefing,
  화면공유: (arg) => shareScreen(arg),
  클립보드: async () => {
    setAttached(await window.api.attachClipboard());
    say(t('attach.clipboard'));
  },
  다시: async () => {
    const question = await window.api.retry();
    if (question) send(question, webMode ? 'search' : null, { retry: true });
    else say(t('said.noRetry'));
  },
  복사: async () => say(t((await window.api.copyReply()) ? 'said.copied' : 'said.nothingToCopy')),
  요약: (arg) => send(arg ? `${t('prompt.summarizeText')}\n\n${arg}` : t('prompt.summarizeChat')),
  번역: (arg) => (arg ? send(translatePrompt(arg)) : say(t('said.needText', { cmd: Commands.slash('번역') }))),
  모델: async (arg) => {
    const profile = config.profiles.find((p) => p.id === arg || p.name === arg);
    if (!profile) return say(t('said.pickProfile'));
    await window.api.appAction('profile', profile.id);
    config = await window.api.getConfig();
    return say(t('said.switched', { name: profile.name }));
  },
  새대화: async () => {
    await window.api.clearHistory();
    say(t('said.newChat'));
  },
  사용량: showUsage,
  표정: (arg) => {
    if (!Motions.PRESETS[arg]) return say(t('said.pickEmotion'));
    character.preview(arg);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => character.relax(), 5000);
    return undefined;
  },
  동작: (arg) => (Motions.CLIPS[arg] ? character.play(arg) : say(t('said.pickClip'))),
  음소거: async () => say(t((await window.api.appAction('mute')).muted ? 'said.muted' : 'said.unmuted')),
  SD: () => window.api.appAction('sd'),
  상반신: () => window.api.appAction('bust'),
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
let lastWarm = -Infinity;

function setInteractive(on) {
  if (on === interactive) return;
  interactive = on;
  window.api.setClickThrough(!on);
}

const overUi = (target) => target?.closest?.('#bubble, #input-bar, #palette, #tray, #confirm, #quick, #food, .grip');

// Driven by the main process's cursor feed rather than forwarded mouse events,
// which do not reliably reach an unfocused transparent window.
function updateHit(x, y) {
  if (drag || resize || !character?.model) return;
  const inside = x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight;
  const onCharacter = inside && character.hit(x, y);
  const over = inside && (!!overUi(document.elementFromPoint(x, y)) || onCharacter);
  setInteractive(over);
  updateHover(x, y, onCharacter);
  if (over) noteActivity();
}

// The main process moves the window with the cursor, at the offset it was grabbed at.
function startDrag(e) {
  if (e.button !== 0) return;
  drag = { x: e.screenX, y: e.screenY, moved: false };
  window.api.dragStart();
}

canvas.addEventListener('mousedown', (e) => startDrag(e));

window.addEventListener('mousemove', (e) => {
  if (resize) return resizeTo(e);
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.screenX - drag.x, e.screenY - drag.y) < DRAG_THRESHOLD) return;
  drag.moved = true;
  window.api.dragMove();
});

// --------------------------------------------- hover frame and quick menu

const frameEl = document.getElementById('frame');
const quickEl = document.getElementById('quick');
const muteButton = quickEl.querySelector('[data-act="mute"]');
const HOVER_PAD = 6; // frame distance from her outline
const HOVER_LINGER_MS = 500; // how long the frame stays after the cursor leaves
const hover = { on: false, box: null, leftAt: 0, measureTimer: null };
let resize = null;

function measureHover() {
  hover.box = character.bounds() ?? hover.box;
  if (hover.box) placeHover();
}

// Frame around her outline; buttons beside it, or inside the window's edge when there is no room.
function placeHover() {
  const b = hover.box;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const left = Math.max(9, b.x - HOVER_PAD);
  const top = Math.max(9, b.y - HOVER_PAD);
  const right = Math.min(W - 9, b.x + b.w + HOVER_PAD);
  const bottom = Math.min(H - 9, b.y + b.h + HOVER_PAD);
  Object.assign(frameEl.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
  const qw = quickEl.offsetWidth || 42;
  const qh = quickEl.offsetHeight || 180;
  const qx = right + 6 + qw <= W - 2 ? right + 6 : W - qw - 4;
  const qy = Math.min(Math.max(4, top + 18), H - qh - 4);
  Object.assign(quickEl.style, { left: `${qx}px`, top: `${qy}px` });
}

function showHover(on) {
  if (on === hover.on) return;
  hover.on = on;
  frameEl.hidden = !on;
  quickEl.hidden = !on;
  if (on) measureHover();
}

function updateHover(x, y, onCharacter) {
  if (onCharacter && !hover.on) showHover(true);
  if (!hover.on) return;
  const near = (r, pad) => x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  const keep = onCharacter || near(frameEl.getBoundingClientRect(), 10) || near(quickEl.getBoundingClientRect(), 10);
  if (keep) hover.leftAt = 0;
  else if (!hover.leftAt) hover.leftAt = performance.now();
  else if (performance.now() - hover.leftAt > HOVER_LINGER_MS) showHover(false);
}

// Measured again once she has settled into a new size or mode.
function remeasureSoon(ms = 700) {
  clearTimeout(hover.measureTimer);
  hover.measureTimer = setTimeout(() => { if (hover.on && !resize) measureHover(); }, ms);
}

// Sizes scale about the window's bottom centre, which stays put, so a grip
// follows the cursor when the scale is the cursor's distance from that point
// over the grip's distance when it was grabbed.
frameEl.addEventListener('mousedown', (e) => {
  const dir = e.target.dataset?.dir;
  if (!dir || e.button !== 0 || !hover.box) return;
  e.preventDefault();
  const anchor = { x: window.screenX + window.innerWidth / 2, y: window.screenY + window.innerHeight };
  resize = { dir, anchor, grab: { x: e.screenX, y: e.screenY }, scale: config.character.scale, h: hover.box.h, want: null, busy: false };
  character.snap = true;
  frameEl.classList.add('active');
});

function resizeTo(e) {
  const { dir, anchor, grab, h } = resize;
  const ratios = [];
  if (/[ew]/.test(dir) && Math.abs(grab.x - anchor.x) > 20) ratios.push((e.screenX - anchor.x) / (grab.x - anchor.x));
  if (dir.includes('n') && anchor.y - grab.y > 40) ratios.push((anchor.y - e.screenY) / (anchor.y - grab.y));
  if (dir === 's') ratios.push((h + e.screenY - grab.y) / h);
  if (!ratios.length) return;
  const ratio = ratios.reduce((a, b) => (Math.abs(b - 1) > Math.abs(a - 1) ? b : a));
  resize.want = resize.scale * Math.max(0.1, ratio);
  sendScale();
}

// One resize in flight at a time; the newest wanted size goes next.
async function sendScale() {
  if (resize.busy || resize.want === null) return;
  const want = resize.want;
  resize.want = null;
  resize.busy = true;
  await window.api.setScale(want, false);
  if (!resize) return;
  resize.busy = false;
  sendScale();
}

async function endResize() {
  const { scale } = config.character;
  resize = null;
  frameEl.classList.remove('active');
  await window.api.setScale(scale, true);
  character.snap = false;
  measureHover();
}

window.api.onScale((scale) => {
  const k = scale / config.character.scale;
  config.character.scale = scale;
  applyMetrics();
  character.layout(character.snap);
  if (hover.on && hover.box) {
    hover.box = { x: hover.box.x * k, y: hover.box.y * k, w: hover.box.w * k, h: hover.box.h * k };
    placeHover();
    if (!resize) remeasureSoon();
  }
  setTimeout(placeFood, 700);
});

quickEl.addEventListener('click', async (e) => {
  const act = e.target.closest('button')?.dataset.act;
  if (!act) return;
  const state = await window.api.appAction(act);
  if (act === 'mute') setMuteButton(state.muted);
});

function setMuteButton(muted) {
  muteButton.setAttribute('aria-pressed', String(muted));
  muteButton.title = t(muted ? 'ui.muteOn' : 'ui.muteOff');
}

// A second click soon after is a pat, so the first has to wait a moment.
const DOUBLE_CLICK_MS = 260;
let clickTimer = null;

window.addEventListener('mouseup', (e) => {
  if (resize) return endResize();
  if (!drag) return;
  const clicked = !drag.moved && character.hit(e.clientX, e.clientY);
  drag = null;
  window.api.dragEnd();
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
const isBusy = () => streaming || speech.running || !inputBar.hidden || !bubble.hidden || !!drag || !!resize;

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
  remeasureSoon();
  setTimeout(placeFood, 700); // once she has settled into the new look
});
window.api.onMuted((muted) => {
  setMuteButton(muted);
  stopSpeech();
});
window.api.onCursor(({ x, y }) => updateHit(x, y));
function applyLanguage() {
  I18n.setLang(config.language);
  I18n.apply();
  inputBar.dataset.badge = t('ui.commandBadge');
  document.getElementById('confirm-image').alt = t('ui.preview');
  setMuteButton(muteButton.getAttribute('aria-pressed') === 'true');
}

window.api.onConfigChanged(async () => {
  config = await window.api.getConfig();
  applyLanguage();
});

function applyMetrics() {
  character.top = BUBBLE_SPACE * config.character.scale;
  document.body.dataset.mode = config.character.mode;
}

(async () => {
  config = await window.api.getConfig();
  applyLanguage();
  const status = await window.api.modelStatus();
  character = new Character(canvas, {
    mode: config.character.mode,
    top: BUBBLE_SPACE * config.character.scale,
  });
  document.body.dataset.mode = config.character.mode;
  setMuteButton((await window.api.appAction('state')).muted);
  if (!status.dir) {
    showBubble(t('chat.modelMissing'), 'error');
    return;
  }
  try {
    await character.load(status.url);
    window.dscReady = true;
    setTimeout(checkHunger, 1500);
  } catch (err) {
    showBubble(t('chat.modelFailed', { error: err.message }), 'error');
  }
})();
