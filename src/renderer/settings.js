// Tabs plus the connection, voice and general forms.
let settings;
let editingId = null;

function showTab(tab) {
  document.querySelectorAll('section').forEach((s) => { s.hidden = s.id !== tab; });
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'dashboard') refreshDashboard();
  if (tab === 'log') refreshLog();
  if (tab === 'update') checkUpdate();
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
  id: `p${Date.now()}`, name: I18n.t('ui.newProfile'), baseUrl: '', model: '', extra: '',
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
    radio.title = I18n.t('ui.useForChat');
    radio.checked = p.id === settings.activeProfileId;
    radio.addEventListener('change', async () => {
      settings = await window.api.setConfig({ activeProfileId: p.id });
    });
    const text = document.createElement('div');
    text.textContent = p.name;
    const small = document.createElement('small');
    small.textContent = `${p.model || I18n.t('ui.noModelSet')}${p.hasKey ? '' : I18n.t('ui.noKey')}`;
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
  $('p-key').placeholder = I18n.t(p.hasKey ? 'ui.keySaved' : 'ui.keyLocal');
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

function drawPresets() {
  const value = $('p-preset').value;
  $('p-preset').innerHTML = `<option value="">${esc(I18n.t('ui.custom'))}</option>${PRESETS.map((p) => `<option value="${p.id}">${esc(p.label)}${p.local ? ` (${esc(I18n.t('ui.local'))})` : ''}</option>`).join('')}`;
  $('p-preset').value = value;
}
drawPresets();
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
    try { JSON.parse(profile.extra); } catch { return flash('p-status', I18n.t('ui.badJson')); }
  }
  const key = $('p-key').value;
  try {
    settings = await window.api.saveProfile(profile, key ? key : undefined);
  } catch (err) {
    return flash('p-status', err.message);
  }
  editProfile(settings.profiles.find((p) => p.id === profile.id));
  flash('p-status', I18n.t('ui.saved'));
});

$('p-delete').addEventListener('click', async () => {
  if (!confirm(I18n.t('ui.deleteProfile'))) return;
  settings = await window.api.deleteProfile(editingId);
  if (settings.profiles[0]) editProfile(settings.profiles[0]);
  else $('add-profile').click();
});

$('p-fetch').addEventListener('click', async () => {
  try {
    const models = await window.api.listModels(readProfile(), $('p-key').value);
    $('p-models').innerHTML = models.map((m) => `<option value="${esc(m)}">`).join('');
    flash('p-status', I18n.t('ui.modelsFound', { n: models.length }));
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
  $('g-device').value = t.gptsovits.device;
  $('g-device-row').hidden = !IS_MAC; // Windows always synthesizes on the CPU
  $('v-idle').value = t.idleMinutes;
  window.api.ttsStatus().then((sovits) => {
    $('g-sovits-dir').value = sovits.dir;
    $('g-python').value = sovits.python ?? '';
    $('g-ref').value = sovits.refAudio;
  });
  $('v-url').value = t.openai.baseUrl;
  $('v-model').value = t.openai.model;
  $('v-oai-voice').value = t.openai.voice;
  $('v-price').value = t.openai.pricePerMChars;
  $('v-key').placeholder = t.openai.hasKey ? I18n.t('ui.keySaved') : '';
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
      idleMinutes: Math.max(0, Math.round(num('v-idle'))),
      gptsovits: {
        dir: $('g-sovits-dir').value.trim() || null,
        python: $('g-python').value.trim() || null,
        refAudio: $('g-ref').value || null,
        refText: $('g-ref-text').value.trim(),
        speed: num('g-speed') || 1,
        device: $('g-device').value,
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
  flash('v-status', I18n.t('ui.saved'));
});
$('v-test').addEventListener('click', async () => {
  await saveVoice();
  try {
    const result = await window.api.speak(I18n.t('voice.test'));
    if (result?.audio) {
      const url = URL.createObjectURL(new Blob([result.audio], { type: result.mime }));
      await new Audio(url).play();
    } else flash('v-status', I18n.t('ui.voiceOff'));
  } catch (err) {
    flash('v-status', err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, ''));
  }
});

// --------------------------------------------------------------------- general

const IS_MAC = navigator.platform.startsWith('Mac');

const SHORTCUT_KEYS = { input: 'ui.scInput', toggle: 'ui.scToggle', sd: 'ui.scSd', quick: 'ui.scQuick', voice: 'ui.scVoice' };

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
  if (!accelerator) return I18n.t('ui.scNone');
  return accelerator.replace('CommandOrControl', IS_MAC ? 'Cmd' : 'Ctrl').replace('Alt', IS_MAC ? 'Option' : 'Alt').replaceAll('+', ' + ');
}

function setShortcut(field, accelerator) {
  field.dataset.accelerator = accelerator;
  field.value = keyLabel(accelerator);
}

document.querySelectorAll('.shortcut').forEach((field) => {
  field.addEventListener('focus', () => {
    field.classList.add('recording');
    field.value = I18n.t('ui.scPress');
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
  $('g-memories').innerHTML = list.length ? '' : `<li class="note">${esc(I18n.t('ui.noMemories'))}</li>`;
  for (const memory of list) {
    const item = document.createElement('li');
    const text = document.createElement('div');
    text.textContent = memory.text;
    text.style.flex = '1';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ghost danger';
    button.textContent = I18n.t('ui.delete');
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
  flash('g-status', I18n.t('ui.docsRead', { n: picked.files }));
});

async function fillGeneral() {
  $('g-language').value = settings.language;
  $('g-persona').value = settings.persona || settings.defaultPersona;
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
  $('g-dir').value = status.dir ?? I18n.t('ui.modelDirMissing');
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
    ? I18n.t('ui.scFailed', { names: failed.map((n) => I18n.t(SHORTCUT_KEYS[n])).join(', ') })
    : I18n.t('ui.saved'));
});

$('g-pick').addEventListener('click', async () => {
  try {
    const dir = await window.api.pickModelDir();
    if (dir) $('g-dir').value = dir;
  } catch (err) {
    flash('g-status', err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, ''));
  }
});

// ---------------------------------------------------------------------- update

const remoteError = (err) => err.message.replace(/^Error invoking remote method '.*?': (Error: )?/, '');
let updateBusy = false;

async function fillUpdate() {
  const info = await window.api.updateInfo();
  $('u-version').textContent = info.version ?? '';
  $('u-commit').textContent = info.commit ? `${info.commit} · ${info.date}` : I18n.t('ui.notGit');
  const pending = info.pending ?? [];
  $('u-list').replaceChildren(...pending.map((c) => {
    const li = document.createElement('li');
    li.textContent = c.subject;
    return li;
  }));
  $('u-check').disabled = !info.installed || info.updating || updateBusy;
  $('u-apply').disabled = !pending.length || info.updating || updateBusy;
  $('nav-update').textContent = pending.length ? I18n.t('ui.navUpdateN', { n: pending.length }) : I18n.t('ui.navUpdate');
}

async function checkUpdate() {
  if (updateBusy) return;
  updateBusy = true;
  $('u-status').textContent = I18n.t('ui.checking');
  try {
    await fillUpdate();
    const { installed, commits } = await window.api.checkUpdate();
    $('u-status').textContent = !installed ? '' : commits.length ? I18n.t('ui.newChanges', { n: commits.length }) : I18n.t('ui.upToDate');
  } catch (err) {
    $('u-status').textContent = I18n.t('ui.checkFailed', { error: remoteError(err) });
  } finally {
    updateBusy = false;
    await fillUpdate();
  }
}

$('u-check').addEventListener('click', checkUpdate);
$('u-apply').addEventListener('click', async () => {
  updateBusy = true;
  $('u-status').textContent = I18n.t('ui.downloading');
  await fillUpdate();
  try {
    const { setup } = await window.api.applyUpdate();
    $('u-status').textContent = setup
      ? I18n.t('ui.rerunSetup', { script: IS_MAC ? 'setup-mac.command' : 'setup-windows.bat' })
      : I18n.t('ui.restarting');
  } catch (err) {
    $('u-status').textContent = I18n.t('ui.updateFailed', { error: remoteError(err) });
  } finally {
    updateBusy = false;
    await fillUpdate();
  }
});
window.api.onUpdateChanged(() => fillUpdate());

// -------------------------------------------------------------------- language

$('g-language').innerHTML = Object.entries(I18n.LANGS).map(([code, name]) => `<option value="${code}">${esc(name)}</option>`).join('');

// Switches at once, without Save. A persona still at its default follows the language.
$('g-language').addEventListener('change', async () => {
  const atDefault = $('g-persona').value === settings.defaultPersona;
  settings = await window.api.setConfig({ language: $('g-language').value });
  if (atDefault) $('g-persona').value = settings.defaultPersona;
  if (settings.language !== shownLanguage) applyLanguage();
});

$('g-persona-reset').addEventListener('click', () => { $('g-persona').value = settings.defaultPersona; });

// Redraws everything with text: the static page and the parts drawn from data.
// The language the page is drawn in; the change event and the broadcast may come in
// either order, so both compare against this.
let shownLanguage = null;

function applyLanguage() {
  shownLanguage = settings.language;
  I18n.setLang(settings.language);
  I18n.apply();
  drawPresets();
  renderProfiles();
  const editing = settings.profiles.find((p) => p.id === editingId);
  if (editing) $('p-key').placeholder = I18n.t(editing.hasKey ? 'ui.keySaved' : 'ui.keyLocal');
  ['s-input', 's-toggle', 's-sd', 's-quick', 's-voice'].forEach((id) => setShortcut($(id), $(id).dataset.accelerator));
  drawMemories();
  fillUpdate();
  if (!$('dashboard').hidden) renderDashboard();
  if (!$('log').hidden) refreshLog();
}

window.api.onConfigChanged(async () => {
  settings = await window.api.getConfig();
  if (settings.language !== shownLanguage) applyLanguage();
});

// ----------------------------------------------------------------------- start

// The tab shows first: every section starts hidden, so a slow or failed step below
// must not leave an empty window.
showTab(new URLSearchParams(location.search).get('tab') || 'dashboard');

(async () => {
  settings = await window.api.getConfig();
  applyLanguage();
  const active = settings.profiles.find((p) => p.id === settings.activeProfileId) ?? settings.profiles[0];
  if (active) editProfile(active);
  else $('add-profile').click();
  fillVoice();
  await fillGeneral();
})().catch((err) => console.error('settings failed to load:', err));
