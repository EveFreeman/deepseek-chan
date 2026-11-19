// Things the app keeps for the user: reminders, long-term memory and the pet state.
// All of it is created by the user's own commands, never by the model or web text.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');
const { t } = require('../shared/i18n');

const HOUR = 3600000;
const FULLNESS_LOSS_PER_HOUR = 3;

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
  if (list.length >= MAX_MEMORY) throw new Error(t('err.memoryFull', { max: MAX_MEMORY, cmd: require('../shared/commands').slash('잊어') }));
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
  return `\n\n[Things the user asked you to remember]\n${list.map((m) => `- ${m.text}`).join('\n')}\nRefer to them naturally when relevant; do not bring them up every time.`;
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
  p.fullness = 100; // one bowl fills her up
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
