// Things the app keeps for the user: reminders, long-term memory and the pet state.
// All of it is created by the user's own commands, never by the model or web text.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

const HOUR = 3600000;
const FULLNESS_LOSS_PER_HOUR = 3;
const FEED_AMOUNT = 35;

const file = () => path.join(app.getPath('userData'), 'assist.json');
let state = null;

function load() {
  if (state) return state;
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { /* first run */ }
  state = {
    reminders: [], memories: [],
    pet: { fullness: 70, updated: Date.now(), lastSeen: Date.now(), fedToday: 0, patted: 0 },
    lastGreeting: null, lastBriefing: null,
    ...saved,
  };
  return state;
}

function save() {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(load(), null, 1));
}

// ------------------------------------------------------------------- reminders

function addReminder(at, text) {
  load().reminders.push({ id: crypto.randomUUID(), at, text });
  state.reminders.sort((a, b) => a.at - b.at);
  save();
}

const reminders = () => load().reminders;

function clearReminders() {
  load().reminders = [];
  save();
}

// Removes and returns whatever has come due.
function takeDue(now = Date.now()) {
  const due = load().reminders.filter((r) => r.at <= now);
  if (due.length) {
    state.reminders = state.reminders.filter((r) => r.at > now);
    save();
  }
  return due;
}

// ---------------------------------------------------------------------- memory

const MAX_MEMORY = 50;

function remember(text) {
  const list = load().memories;
  if (list.length >= MAX_MEMORY) throw new Error(`기억은 ${MAX_MEMORY}개까지입니다. /잊어 로 정리해 주세요.`);
  list.push({ id: crypto.randomUUID(), text, ts: Date.now() });
  save();
}

const memories = () => load().memories;

function forget(index) {
  const list = load().memories;
  if (!list[index]) return false;
  list.splice(index, 1);
  save();
  return true;
}

function forgetById(id) {
  load().memories = state.memories.filter((m) => m.id !== id);
  save();
}

function memoryPrompt() {
  const list = memories();
  if (!list.length) return '';
  return `\n\n[주인님이 기억해 달라고 한 것]\n${list.map((m) => `- ${m.text}`).join('\n')}\n필요할 때 자연스럽게 참고하고, 매번 언급하지는 않는다.`;
}

// ------------------------------------------------------------------------- pet

function pet() {
  const p = load().pet;
  const now = Date.now();
  p.fullness = Math.max(0, p.fullness - ((now - p.updated) / HOUR) * FULLNESS_LOSS_PER_HOUR);
  p.updated = now;
  return p;
}

function feed() {
  const p = pet();
  const wasFull = p.fullness >= 90;
  p.fullness = Math.min(100, p.fullness + FEED_AMOUNT);
  save();
  return { fullness: Math.round(p.fullness), wasFull };
}

function patted() {
  const p = pet();
  p.patted += 1;
  save();
  return p.patted;
}

// Hours since she last saw the user; updates the stamp.
function markSeen() {
  const p = pet();
  const hours = (Date.now() - p.lastSeen) / HOUR;
  p.lastSeen = Date.now();
  save();
  return hours;
}

const mark = (key, value) => {
  load()[key] = value;
  save();
};
const get = (key) => load()[key];

module.exports = {
  addReminder, reminders, clearReminders, takeDue,
  remember, memories, forget, forgetById, memoryPrompt,
  pet, feed, patted, markSeen, mark, get,
};
