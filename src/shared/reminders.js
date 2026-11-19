// Finds a reminder in plain words, in Korean, English, Japanese or Chinese:
// "30분 뒤에 회의 알려 줘", "remind me in 30 minutes to call mom", "午後3時半に薬を教えて",
// "下午3点半提醒我吃药". Pure, so it can be unit tested.
(() => {
const SECOND = 1000;
const MINUTE = 60000;
const HOUR = 3600000;

// Words that ask for a reminder. Without one, a sentence that only mentions a time is
// not a reminder.
const ASKS_TO_REMIND = /알려\s*줘|알려\s*주세요|알려\s*줄래|깨워|리마인드|알람|알림|教えて|知らせて|リマインド|起こして|アラーム|提醒|叫我|闹钟|\bremind\b|\bwake me\b|\balarm\b/i;

// Ask words and particles left around the memo.
const TRAILING = [
  /\s*(을|를|이라고|라고)?\s*(꼭\s*)?(알려\s*(줘|주세요|줄래|주라|줘요)?|깨워\s*(줘|주세요)?|리마인드(\s*해\s*(줘|주세요))?|알람(\s*맞춰\s*(줘|주세요))?|알림(\s*해\s*(줘|주세요))?)[.!?~\s]*$/,
  /\s*(を|って|と)?\s*(教えて|知らせて|リマインドして|起こして)(ください|ね|くれる)?[。．.!！?？\s]*$/,
  /\s*(提醒我|提醒一下|叫我|提醒)[。．.!！?？\s]*$/,
  /\s*,?\s*please[.!?\s]*$/i,
];
const LEADING = [
  /^\s*(에|쯤|에는|에서)\s+/,
  /^\s*(に|ごろ|ごろに)\s*/,
  /^\s*(后|以后|之后)?\s*(提醒我|提醒一下|叫我|提醒)?\s*/,
  /^\s*(please\s+)?(remind|wake)\s+me\s*(to|about|that|of)?\s+/i,
  /^\s*(to|about|for|that)\s+/i,
];

function clean(text) {
  let out = text;
  for (const re of TRAILING) out = out.replace(re, '');
  for (const re of LEADING) out = out.replace(re, '');
  return out.replace(/[、，,]\s*$/, '').trim();
}

// The memo is what follows the time, or else what came before it.
const memo = (before, after) => clean(after) || clean(before);

function clockTime(period, hour, minute, now) {
  let hours = hour;
  const p = (period ?? '').toLowerCase().replace(/\./g, '');
  const pm = ['오후', '저녁', '밤', '午後', '夜', '夕方', '下午', '晚上', '傍晚', 'pm'].includes(p);
  const am = ['오전', '아침', '새벽', '午前', '朝', '上午', '早上', '凌晨', 'am'].includes(p);
  if (pm && hours < 12) hours += 12;
  if (am && hours === 12) hours = 0;
  if (p === '中午' && hours < 6) hours += 12;
  const at = new Date(now);
  at.setHours(hours, minute, 0, 0);
  if (at <= new Date(now)) at.setDate(at.getDate() + 1);
  // "3시" with no period means the next 3 o'clock, whichever half of the day.
  if (!pm && !am && hours < 12) {
    const sameDayLater = new Date(now);
    sameDayLater.setHours(hours + 12, minute, 0, 0);
    if (sameDayLater > new Date(now) && sameDayLater < at) return sameDayLater.getTime();
  }
  return at.getTime();
}

const unitMs = (unit) => {
  const u = unit.toLowerCase();
  if (/^(시간|時間|个?小时|h|hr|hrs|hour|hours)$/.test(u)) return HOUR;
  if (/^(분|分|分钟|m|min|mins|minute|minutes)$/.test(u)) return MINUTE;
  return SECOND;
};

// [regex, index of amount, unit, extra minutes, whether the "after" word is required]
const RELATIVE = [
  /(\d+)\s*(시간|분|초)(?:\s*(\d+)\s*분)?\s*(뒤|후|있다가)?(?:에)?/,
  /(\d+)\s*(時間|分(?!钟)|秒(?!钟))(?:\s*(\d+)\s*分(?!钟))?\s*(後|たったら|経ったら)?(?:に)?/,
  /(\d+)\s*(个?小时|分钟|分(?![後間])|秒钟?)(?:\s*(\d+)\s*分钟?)?\s*(后|以后|之后)?/,
  /(?:\b(in|after)\s+)?(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b(?:\s*(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m)\b)?/i,
];

function relative(text, now, command) {
  for (const [i, re] of RELATIVE.entries()) {
    const m = text.match(re);
    if (!m) continue;
    // English puts the "after" word first ("in 30 minutes"); the others put it last.
    const [amount, unit, extra, after] = i === 3 ? [m[2], m[3], m[4], m[1]] : [m[1], m[2], m[3], m[4]];
    if (!after && !command) continue;
    const delay = Number(amount) * unitMs(unit) + Number(extra ?? 0) * MINUTE;
    if (delay <= 0) continue;
    return { at: now + delay, text: memo(text.slice(0, m.index), text.slice(m.index + m[0].length)) };
  }
  return null;
}

const CLOCK = [
  // [regex, groups: period, hour, minute, half]
  [/(오전|오후|아침|저녁|밤|새벽)?\s*(\d{1,2})시(?:\s*(\d{1,2})분|\s*(반))?(?:에|쯤)?/, (m) => [m[1], m[2], m[3], m[4]]],
  [/(午前|午後|朝|夜|夕方)?\s*(\d{1,2})時(?:\s*(\d{1,2})分|(半))?(?:に|ごろ)?/, (m) => [m[1], m[2], m[3], m[4]]],
  [/(上午|下午|早上|晚上|中午|凌晨|傍晚)?\s*(\d{1,2})[点點](?:\s*(\d{1,2})分?|(半))?/, (m) => [m[1], m[2], m[3], m[4]]],
  [/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i, (m) => [m[3], m[1], m[2], null]],
  [/\bat\s+(\d{1,2})(?::(\d{2}))?\b/i, (m) => [null, m[1], m[2], null]],
];

function clock(text, now) {
  for (const [re, groups] of CLOCK) {
    const m = text.match(re);
    if (!m) continue;
    const [period, hour, minute, half] = groups(m);
    if (Number(hour) > 24 || Number(minute ?? 0) > 59) continue;
    const at = clockTime(period, Number(hour), half ? 30 : Number(minute ?? 0), now);
    return { at, text: memo(text.slice(0, m.index), text.slice(m.index + m[0].length)) };
  }
  return null;
}

// Returns { at, text } or null; `text` is '' when nothing but the time was given.
// `command` is true for /알림, where no ask is needed.
function parseReminder(text, now = Date.now(), command = false) {
  if (!command && !ASKS_TO_REMIND.test(text)) return null;
  return relative(text, now, command) ?? clock(text, now);
}

const API = { parseReminder };
if (typeof module !== 'undefined') module.exports = API;
else window.Reminders = API;
})();
