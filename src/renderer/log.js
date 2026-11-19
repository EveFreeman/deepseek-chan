// Conversation history tab. Everything is built with textContent: replies can quote
// web pages, so nothing in them may become markup.
const logView = { entries: [], sessions: [], selected: null, query: '', scrolled: false };

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const dayLabel = (ts) => (ts
  ? new Date(ts).toLocaleDateString(I18n.dateLocale(), { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  : I18n.t('ui.logEarlier'));
const timeLabel = (ts) => new Date(ts).toLocaleTimeString(I18n.dateLocale(), { hour: '2-digit', minute: '2-digit' });

function copyButton(getText, label = I18n.t('ui.copy')) {
  const button = element('button', 'ghost copy', label);
  button.type = 'button';
  button.addEventListener('click', async () => {
    await window.api.copyText(getText());
    button.textContent = I18n.t('ui.copied');
    setTimeout(() => { button.textContent = label; }, 1200);
  });
  return button;
}

// Text with ``` fences split into prose and code blocks.
function renderBody(text) {
  const body = element('div', 'log-body');
  const parts = text.split(/```([^\n`]*)\n([\s\S]*?)```/g);
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i].trim()) body.append(element('p', 'log-text', parts[i].trim()));
    if (parts[i + 2] === undefined) continue;
    const code = parts[i + 2].replace(/\n$/, '');
    const block = element('div', 'log-code');
    const head = element('div', 'log-code-head');
    head.append(element('span', '', parts[i + 1] || I18n.t('ui.code')), copyButton(() => code));
    block.append(head, element('pre', '', code));
    body.append(block);
  }
  return body;
}

function renderSources(sources) {
  const row = element('div', 'log-sources', I18n.t('ui.sourcesLabel'));
  for (const source of sources) {
    if (/^https:\/\//.test(source.url)) {
      const link = element('a', '', source.host);
      link.href = source.url;
      link.target = '_blank';
      link.title = source.title || source.url;
      row.append(link);
    } else row.append(element('span', '', source.host));
  }
  return row;
}

function renderEntry(entry) {
  const row = element('article', `log-entry ${entry.role}`);
  const meta = element('div', 'log-meta');
  const who = I18n.t({ user: 'ui.me', assistant: 'ui.her', error: 'ui.error' }[entry.role]);
  meta.append(element('b', '', who));
  if (entry.ts) meta.append(element('span', '', timeLabel(entry.ts)));
  if (entry.model) meta.append(element('span', '', entry.model));
  if (entry.force) meta.append(element('span', 'log-tag', I18n.t('ui.webRequired')));
  meta.append(copyButton(() => entry.text));
  row.append(meta, renderBody(entry.text));
  if (entry.files?.length) row.append(element('div', 'log-files', I18n.t('ui.files', { files: entry.files.join(', ') })));
  if (entry.sources?.length) row.append(renderSources(entry.sources));
  return row;
}

function renderLog() {
  const list = $('log-list');
  const query = logView.query.trim().toLowerCase();
  const shown = query
    ? logView.entries.filter((e) => e.text.toLowerCase().includes(query) || e.files?.join(' ').toLowerCase().includes(query))
    : logView.entries;
  $('log-count').textContent = query ? I18n.t('ui.found', { n: shown.length }) : I18n.t('ui.messages', { n: logView.entries.length });
  if (!shown.length) {
    list.replaceChildren(element('p', 'empty', I18n.t(query ? 'ui.noMatch' : 'ui.noChat')));
    return;
  }
  let lastDay = null;
  const nodes = [];
  for (const entry of shown) {
    const day = dayLabel(entry.ts);
    if (day !== lastDay) {
      nodes.push(element('div', 'log-day', day));
      lastDay = day;
    }
    nodes.push(renderEntry(entry));
  }
  list.replaceChildren(...nodes);
  if (!query) $('log').closest('main').scrollTop = 1e9;
}

const sessionTitle = (s) => s.title || I18n.t(s.legacy ? 'ui.logEarlier' : 'ui.logNewSession');
const sessionDate = (s) => (s.end
  ? new Date(s.end).toLocaleString(I18n.dateLocale(), { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '');

function renderSessions() {
  const items = logView.sessions.map((s) => {
    const button = element('button', s.id === logView.selected ? 'selected' : '');
    button.type = 'button';
    const meta = element('span', 'session-meta');
    if (s.current) meta.append(element('span', 'session-now', I18n.t('ui.now')));
    meta.append(element('span', '', [sessionDate(s), I18n.t('ui.count', { n: s.count })].filter(Boolean).join(' · ')));
    button.append(element('span', 'session-title', sessionTitle(s)), meta);
    button.addEventListener('click', () => selectSession(s.id));
    const item = element('li');
    item.append(button);
    return item;
  });
  $('log-sessions').replaceChildren(...items);
  const s = logView.sessions.find((x) => x.id === logView.selected);
  $('log-title').textContent = s ? sessionTitle(s) : '';
  $('log-session-meta').textContent = s?.current ? I18n.t('ui.remembering') : '';
  $('log-resume').hidden = !s || s.current || !s.count;
  $('log-delete').hidden = !s || (s.current && !s.count);
}

async function selectSession(id) {
  logView.selected = id;
  logView.entries = await window.api.transcript(id);
  renderSessions();
  renderLog();
}

async function refreshLog() {
  logView.sessions = await window.api.sessions();
  if (!logView.sessions.some((s) => s.id === logView.selected)) {
    logView.selected = logView.sessions.find((s) => s.current)?.id ?? null;
  }
  logView.entries = logView.selected ? await window.api.transcript(logView.selected) : [];
  if (!$('log').hidden) {
    renderSessions();
    renderLog();
  }
}

$('log-search').addEventListener('input', (e) => {
  logView.query = e.target.value;
  renderLog();
});

$('log-new').addEventListener('click', async () => {
  logView.selected = null; // the refresh that follows picks the new session
  await window.api.newSession();
});

$('log-resume').addEventListener('click', () => window.api.resumeSession(logView.selected));

$('log-delete').addEventListener('click', async () => {
  const s = logView.sessions.find((x) => x.id === logView.selected);
  if (!s) return;
  const memory = s.current ? I18n.t('ui.deleteSessionMemory') : '';
  if (!confirm(I18n.t('ui.deleteSession', { title: sessionTitle(s), memory }))) return;
  await window.api.deleteSession(s.id);
});

$('log-clear').addEventListener('click', async () => {
  if (!confirm(I18n.t('ui.clearAll'))) return;
  await window.api.clearTranscript();
});

window.api.onTranscriptChanged(refreshLog);
