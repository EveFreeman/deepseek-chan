// Full conversation log for the history tab, split into sessions. Separate from chat
// memory, which is short and meant for the model; this one is for reading and is never
// sent anywhere. Deleting a session rewrites the file without it, so nothing of it stays.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { stripTags } = require('../shared/motions');

const SHOWN = 2000; // newest entries of a session handed to the window
const LEGACY = 'legacy'; // entries written before sessions existed
const TITLE_CHARS = 40;

const file = () => path.join(app.getPath('userData'), 'transcript.jsonl');
const stateFile = () => path.join(app.getPath('userData'), 'session.json');

let current = null;

function currentSession() {
  if (current) return current;
  try { current = JSON.parse(fs.readFileSync(stateFile(), 'utf8')).id; } catch { /* first run */ }
  if (current) return current;
  // Chat memory from before sessions belongs to the old log, so that log carries on.
  return all().some((e) => e.session === LEGACY) ? setSession(LEGACY) : startSession();
}

function setSession(id) {
  current = id;
  fs.mkdirSync(path.dirname(stateFile()), { recursive: true });
  fs.writeFileSync(stateFile(), JSON.stringify({ id }));
  return id;
}

const startSession = () => setSession(`s${Date.now()}`);

function add(entry) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.appendFileSync(file(), `${JSON.stringify({ ts: Date.now(), session: currentSession(), ...entry })}\n`);
}

function all() {
  let text;
  try { text = fs.readFileSync(file(), 'utf8'); } catch { return []; }
  const entries = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    try {
      const entry = JSON.parse(line);
      entries.push({ ...entry, session: entry.session ?? LEGACY });
    } catch { /* skip a torn line */ }
  }
  return entries;
}

function read(session = currentSession()) {
  return all().filter((e) => e.session === session).slice(-SHOWN);
}

// Newest first. The current session is listed even before its first message.
function sessions() {
  const found = new Map();
  for (const entry of all()) {
    const s = found.get(entry.session) ?? { id: entry.session, title: '', start: entry.ts, end: entry.ts, count: 0 };
    s.count += 1;
    s.start ??= entry.ts;
    if (entry.ts) s.end = entry.ts;
    if (!s.title && entry.role === 'user') s.title = entry.text.replace(/\s+/g, ' ').trim().slice(0, TITLE_CHARS);
    found.set(entry.session, s);
  }
  const id = currentSession();
  if (!found.has(id)) found.set(id, { id, title: '', start: null, end: null, count: 0 });
  return [...found.values()]
    .map((s) => ({ ...s, current: s.id === id, legacy: s.id === LEGACY }))
    .sort((a, b) => (b.current - a.current) || ((b.end ?? 0) - (a.end ?? 0)));
}

function write(entries) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), entries.map((e) => `${JSON.stringify(e)}\n`).join(''));
}

function removeSession(id) {
  write(all().filter((e) => e.session !== id));
}

function clear() {
  write([]);
}

// The first run brings over what chat memory still holds. Those have no times.
function seedFrom(history) {
  if (fs.existsSync(file()) || !history.length) return;
  write(history.map((m) => ({ ts: null, session: currentSession(), role: m.role, text: stripTags(m.content) })));
}

module.exports = { add, read, sessions, currentSession, setSession, startSession, removeSession, clear, seedFrom };
