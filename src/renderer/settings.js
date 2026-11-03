// Tabs plus the connection, voice and general forms.
let settings;
let editingId = null;

function showTab(tab) {
  document.querySelectorAll('section').forEach((s) => { s.hidden = s.id !== tab; });
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'dashboard') refreshDashboard();
  if (tab === 'log') refreshLog();
}

document.querySelector('nav').addEventListener('click', (e) => {
  if (e.target.dataset.tab) showTab(e.target.dataset.tab);
});
window.api.onTab(showTab);

const flash = (id, text) => {
  $(id).textContent = text;
  setTimeout(() => { $(id).textContent = ''; }, 4000);
};
const num = (id) => parseFloat($(id).value) || 0;

// ------------------------------------------------------------------ connection

const newProfile = () => ({
  id: `p${Date.now()}`, name: '새 연결', baseUrl: '', model: '', extra: '',
  pricing: { input: 0, cached: 0, output: 0, peak: null },
});

function renderProfiles() {
  const list = $('profiles');
  list.innerHTML = '';
  for (const p of settings.profiles) {
    const li = document.createElement('li');
    li.className = p.id === editingId ? 'editing' : '';
    li.dataset.id = p.id;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'active';
    radio.title = '대화에 사용';
    radio.checked = p.id === settings.activeProfileId;
    radio.addEventListener('change', async () => {
      settings = await window.api.setConfig({ activeProfileId: p.id });
    });
    const text = document.createElement('div');
    text.textContent = p.name;
    const small = document.createElement('small');
    small.textContent = `${p.model || '모델 미지정'}${p.hasKey ? '' : ' · 키 없음'}`;
    text.append(small);
    li.append(radio, text);
    li.addEventListener('click', (e) => { if (e.target !== radio) editProfile(p); });
    list.append(li);
  }
}

function setPeakVisible() {
  $('p-peak-fields').hidden = !$('p-peak').checked;
}

function fillProfile(p, pricingUrl = '') {
  $('p-name').value = p.name;
  $('p-url').value = p.baseUrl;
  $('p-model').value = p.model;
  $('p-extra').value = p.extra ?? '';
  $('p-input').value = p.pricing.input;
  $('p-cached').value = p.pricing.cached;
  $('p-output').value = p.pricing.output;
  const peak = p.pricing.peak;
  $('p-peak').checked = !!peak;
  $('p-mult').value = peak?.multiplier ?? 2;
  $('p-ranges').value = peak?.utcRanges ?? '';
  $('p-weekdays').checked = peak?.weekdaysOnly ?? false;
  $('p-pricing').hidden = !pricingUrl;
  $('p-pricing').href = pricingUrl;
  setPeakVisible();
}

function editProfile(p) {
  editingId = p.id;
  $('p-preset').value = '';
  $('p-key').value = '';
  $('p-key').placeholder = p.hasKey ? '저장됨 (바꾸려면 입력)' : '로컬 서버는 비워 두세요';
  fillProfile(p);
  renderProfiles();
}

function readProfile() {
  return {
    id: editingId,
    name: $('p-name').value.trim(),
    baseUrl: $('p-url').value.trim(),
    model: $('p-model').value.trim(),
    extra: $('p-extra').value.trim(),
    pricing: {
      input: num('p-input'),
      cached: num('p-cached'),
      output: num('p-output'),
      peak: $('p-peak').checked
        ? { multiplier: num('p-mult') || 1, utcRanges: $('p-ranges').value.trim(), weekdaysOnly: $('p-weekdays').checked }
        : null,
    },
  };
}

$('p-preset').innerHTML = `<option value="">직접 입력</option>${PRESETS.map((p) => `<option value="${p.id}">${p.label}</option>`).join('')}`;
$('p-preset').addEventListener('change', (e) => {
  const preset = PRESETS.find((p) => p.id === e.target.value);
  if (preset) fillProfile(preset, preset.pricingUrl);
});
$('p-peak').addEventListener('change', setPeakVisible);

$('add-profile').addEventListener('click', () => {
  const p = newProfile();
  settings.profiles = [...settings.profiles, p];
  editProfile(p);
});

$('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const profile = readProfile();
  if (profile.extra) {
    try { JSON.parse(profile.extra); } catch { return flash('p-status', '추가 파라미터가 JSON 형식이 아닙니다.'); }
  }
  const key = $('p-key').value;
  try {
    settings = await window.api.saveProfile(profile, key ? key : undefined);
  } catch (err) {
    return flash('p-status', err.message);
  }
  editProfile(settings.profiles.find((p) => p.id === profile.id));
  flash('p-status', '저장했습니다.');
});

$('p-delete').addEventListener('click', async () => {
  if (!confirm('이 연결을 삭제할까요? 사용 기록은 남습니다.')) return;
  settings = await window.api.deleteProfile(editingId);
  if (settings.profiles[0]) editProfile(settings.profiles[0]);
  else $('add-profile').click();
});

$('p-fetch').addEventListener('click', async () => {
  try {
    const models = await window.api.listModels(readProfile(), $('p-key').value);
    $('p-models').innerHTML = models.map((m) => `<option value="${esc(m)}">`).join('');
    flash('p-status', `모델 ${models.length}개를 찾았습니다.`);
  } catch (err) {
    flash('p-status', err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, ''));
  }
});

// ----------------------------------------------------------------------- voice

function setVoiceVisible() {
  const engine = $('v-engine').value;
  $('v-sovits').hidden = engine !== 'gptsovits';
  $('v-openai').hidden = engine !== 'openai';
}

function fillVoice() {
  const t = settings.tts;
  $('v-engine').value = t.engine;
  $('g-ref-text').value = t.gptsovits.refText;
  $('g-speed').value = t.gptsovits.speed;
  window.api.ttsStatus().then((sovits) => {
    $('g-sovits-dir').value = sovits.dir;
    $('g-python').value = sovits.python ?? '';
    $('g-ref').value = sovits.refAudio;
  });
  $('v-url').value = t.openai.baseUrl;
  $('v-model').value = t.openai.model;
  $('v-oai-voice').value = t.openai.voice;
  $('v-price').value = t.openai.pricePerMChars;
  $('v-key').placeholder = t.openai.hasKey ? '저장됨 (바꾸려면 입력)' : '';
  setVoiceVisible();
}

async function saveVoice() {
  if ($('v-key').value) {
    await window.api.setTtsKey($('v-key').value);
    $('v-key').value = '';
  }
  settings = await window.api.setConfig({
    tts: {
      engine: $('v-engine').value,
      gptsovits: {
        dir: $('g-sovits-dir').value.trim() || null,
        python: $('g-python').value.trim() || null,
        refAudio: $('g-ref').value || null,
        refText: $('g-ref-text').value.trim(),
        speed: num('g-speed') || 1,
      },
      openai: {
        baseUrl: $('v-url').value.trim(),
        model: $('v-model').value.trim(),
        voice: $('v-oai-voice').value.trim(),
        pricePerMChars: num('v-price'),
      },
    },
  });
  fillVoice();
}

$('v-engine').addEventListener('change', setVoiceVisible);
$('g-ref-pick').addEventListener('click', async () => {
  const file = await window.api.pickRefAudio();
  if (file) $('g-ref').value = file;
});
$('voice-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await saveVoice();
  flash('v-status', '저장했습니다.');
});
$('v-test').addEventListener('click', async () => {
  await saveVoice();
  try {
    const result = await window.api.speak('안녕하세요, 딥시크쨩이에요. 목소리 잘 들리시나요?');
    if (result?.audio) {
      const url = URL.createObjectURL(new Blob([result.audio], { type: result.mime }));
      await new Audio(url).play();
    } else flash('v-status', '음성이 꺼져 있습니다.');
  } catch (err) {
    flash('v-status', err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, ''));
  }
});

// --------------------------------------------------------------------- general

const IS_MAC = navigator.platform.startsWith('Mac');

const SHORTCUT_NAMES = { input: '입력창 열기', toggle: '보이기 / 숨기기', sd: 'SD 모드 전환', quick: '선택한 글 처리', voice: '음성 입력' };

function acceleratorFrom(e) {
  let key = null;
  if (/^Key[A-Z]$/.test(e.code)) key = e.code.slice(3);
  else if (/^Digit\d$/.test(e.code)) key = e.code.slice(5);
  else if (/^F\d+$/.test(e.code)) key = e.code;
  else if (e.code === 'Space') key = 'Space';
  else if (e.code === 'Enter') key = 'Enter';
  if (!key) return null;
  const parts = [];
  // The Windows key is reserved by the OS, so only Ctrl counts there.
  if (e.ctrlKey || (IS_MAC && e.metaKey)) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  // Letters alone would swallow normal typing everywhere.
  if (!parts.length && !/^F\d+$/.test(key)) return null;
  parts.push(key);
  return parts.join('+');
}

// Accelerators are stored in Electron's form; people see their own keyboard's names.

function keyLabel(accelerator) {
  if (!accelerator) return '없음';
  return accelerator.replace('CommandOrControl', IS_MAC ? 'Cmd' : 'Ctrl').replace('Alt', IS_MAC ? 'Option' : 'Alt').replaceAll('+', ' + ');
}

function setShortcut(field, accelerator) {
  field.dataset.accelerator = accelerator;
  field.value = keyLabel(accelerator);
}

document.querySelectorAll('.shortcut').forEach((field) => {
  field.addEventListener('focus', () => {
    field.classList.add('recording');
    field.value = '키를 누르세요…';
  });
  field.addEventListener('blur', () => {
    field.classList.remove('recording');
    setShortcut(field, field.dataset.accelerator);
  });
  field.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.key === 'Escape') return field.blur();
    if (e.key === 'Backspace') {
      field.dataset.accelerator = '';
      return field.blur();
    }
    const accelerator = acceleratorFrom(e);
    if (accelerator) {
      field.dataset.accelerator = accelerator;
      field.blur();
    }
    return undefined;
  });
});

async function drawMemories() {
  const list = await window.api.memories();
  $('g-memories').innerHTML = list.length ? '' : '<li class="note">저장한 기억이 없습니다.</li>';
  for (const memory of list) {
    const item = document.createElement('li');
    const text = document.createElement('div');
    text.textContent = memory.text;
    text.style.flex = '1';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ghost danger';
    button.textContent = '삭제';
    button.addEventListener('click', () => window.api.forgetId(memory.id));
    item.append(text, button);
    $('g-memories').append(item);
  }
}

window.api.onMemoryChanged(drawMemories);

$('g-docs-pick').addEventListener('click', async () => {
  const picked = await window.api.pickDocsFolder();
  if (!picked) return;
  $('g-docs').value = picked.folder;
  flash('g-status', `문서 ${picked.files}개를 읽었습니다.`);
});

async function fillGeneral() {
  $('g-persona').value = settings.persona;
  $('g-turns').value = settings.historyTurns;
  $('g-bubble').value = settings.character.bubbleSeconds;
  $('g-budget').value = settings.budgetUsd;
  $('g-search').checked = settings.webSearch;
  $('g-krw').value = settings.krwRate;
  setShortcut($('s-input'), settings.shortcuts.input);
  setShortcut($('s-toggle'), settings.shortcuts.toggle);
  setShortcut($('s-sd'), settings.shortcuts.sd);
  setShortcut($('s-quick'), settings.shortcuts.quick);
  setShortcut($('s-voice'), settings.shortcuts.voice);
  $('g-block').checked = settings.budgetBlock;
  $('g-docs').value = settings.docsFolder ?? '';
  $('g-brief-auto').checked = settings.briefing.auto;
  $('g-brief-topics').value = settings.briefing.topics;
  $('g-effort').value = settings.deepEffort;
  $('g-instructions').value = settings.customInstructions;
  drawMemories();
  $('g-proactive').checked = settings.proactive;
  const status = await window.api.modelStatus();
  $('g-dir').value = status.dir ?? '찾지 못함 — 폴더를 지정해 주세요';
}

$('general-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  settings = await window.api.setConfig({
    persona: $('g-persona').value,
    historyTurns: num('g-turns'),
    budgetUsd: num('g-budget'),
    webSearch: $('g-search').checked,
    proactive: $('g-proactive').checked,
    budgetBlock: $('g-block').checked,
    deepEffort: $('g-effort').value,
    customInstructions: $('g-instructions').value,
    briefing: { auto: $('g-brief-auto').checked, topics: $('g-brief-topics').value.trim() },
    krwRate: num('g-krw') || 1,
    character: { bubbleSeconds: num('g-bubble') || 8 },
  });
  const failed = await window.api.setShortcuts({
    input: $('s-input').dataset.accelerator,
    toggle: $('s-toggle').dataset.accelerator,
    sd: $('s-sd').dataset.accelerator,
    quick: $('s-quick').dataset.accelerator,
    voice: $('s-voice').dataset.accelerator,
  });
  settings = await window.api.getConfig();
  flash('g-status', failed.length
    ? `등록 실패(다른 앱이 사용 중일 수 있음): ${failed.map((n) => SHORTCUT_NAMES[n]).join(', ')}`
    : '저장했습니다.');
});

$('g-pick').addEventListener('click', async () => {
  try {
    const dir = await window.api.pickModelDir();
    if (dir) $('g-dir').value = dir;
  } catch (err) {
    flash('g-status', err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, ''));
  }
});

// ----------------------------------------------------------------------- start

// The tab shows first: every section starts hidden, so a slow or failed step below
// must not leave an empty window.
showTab(new URLSearchParams(location.search).get('tab') || 'dashboard');

(async () => {
  settings = await window.api.getConfig();
  const active = settings.profiles.find((p) => p.id === settings.activeProfileId) ?? settings.profiles[0];
  if (active) editProfile(active);
  else $('add-profile').click();
  fillVoice();
  await fillGeneral();
})().catch((err) => console.error('settings failed to load:', err));
