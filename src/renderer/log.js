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
  ? new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  : '이전 대화');
const timeLabel = (ts) => new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

function copyButton(getText, label = '복사') {
  const button = element('button', 'ghost copy', label);
  button.type = 'button';
  button.addEventListener('click', async () => {
    await window.api.copyText(getText());
    button.textContent = '복사됨';
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
    head.append(element('span', '', parts[i + 1] || '코드'), copyButton(() => code));
    block.append(head, element('pre', '', code));
    body.append(block);
  }
  return body;
}

function renderSources(sources) {
  const row = element('div', 'log-sources', '출처 ');
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
  const who = { user: '나', assistant: '딥시크쨩', error: '오류' }[entry.role];
  meta.append(element('b', '', who));
  if (entry.ts) meta.append(element('span', '', timeLabel(entry.ts)));
  if (entry.model) meta.append(element('span', '', entry.model));
  if (entry.force) meta.append(element('span', 'log-tag', '웹 필수'));
  meta.append(copyButton(() => entry.text));
  row.append(meta, renderBody(entry.text));
  if (entry.files?.length) row.append(element('div', 'log-files', `첨부: ${entry.files.join(', ')}`));
  if (entry.sources?.length) row.append(renderSources(entry.sources));
  return row;
}

function renderLog() {
  const list = $('log-list');
  const query = logView.query.trim().toLowerCase();
  const shown = query
    ? logView.entries.filter((e) => e.text.toLowerCase().includes(query) || e.files?.join(' ').toLowerCase().includes(query))
    : logView.entries;
  $('log-count').textContent = query ? `${shown.length}건 찾음` : `${logView.entries.length}개 메시지`;
  if (!shown.length) {
    list.replaceChildren(element('p', 'empty', query ? '찾는 내용이 없습니다.' : '아직 대화가 없습니다.'));
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

const sessionTitle = (s) => s.title || (s.legacy ? '이전 대화' : '새 대화');
const sessionDate = (s) => (s.end
  ? new Date(s.end).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '');

function renderSessions() {
  const items = logView.sessions.map((s) => {
    const button = element('button', s.id === logView.selected ? 'selected' : '');
    button.type = 'button';
    const meta = element('span', 'session-meta');
    if (s.current) meta.append(element('span', 'session-now', '진행 중'));
    meta.append(element('span', '', [sessionDate(s), `${s.count}개`].filter(Boolean).join(' · ')));
    button.append(element('span', 'session-title', sessionTitle(s)), meta);
    button.addEventListener('click', () => selectSession(s.id));
    const item = element('li');
    item.append(button);
    return item;
  });
  $('log-sessions').replaceChildren(...items);
  const s = logView.sessions.find((x) => x.id === logView.selected);
  $('log-title').textContent = s ? sessionTitle(s) : '';
  $('log-session-meta').textContent = s?.current ? '지금 이 대화를 기억하고 있어요' : '';
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
  const memory = s.current ? ' 지금 기억하고 있는 대화라서 모델의 대화 기억도 함께 지우고 새 대화를 시작합니다.' : '';
  if (!confirm(`"${sessionTitle(s)}" 세션을 지울까요? 저장된 기록이 삭제되며 되돌릴 수 없습니다.${memory}`)) return;
  await window.api.deleteSession(s.id);
});

$('log-clear').addEventListener('click', async () => {
  if (!confirm('모든 세션의 대화 기록과 모델의 대화 기억을 지우고 새 대화를 시작할까요? 되돌릴 수 없습니다.')) return;
  await window.api.clearTranscript();
});

window.api.onTranscriptChanged(refreshLog);
