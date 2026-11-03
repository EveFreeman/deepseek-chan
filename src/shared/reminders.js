// Finds a reminder in plain Korean: "30분 뒤에 회의 알려 줘", "오후 3시 반에 약 먹기".
// Pure, so it can be unit tested.
const UNITS = { 초: 1000, 분: 60000, 시간: 3600000 };
const ASKS_TO_REMIND = /알려\s*줘|알려\s*주세요|알려\s*줄래|깨워|리마인드|알람|알림/;
const TRAILING = /\s*(을|를|이라고|라고)?\s*(꼭\s*)?(알려\s*(줘|주세요|줄래|주라|줘요)?|깨워\s*(줘|주세요)?|리마인드(\s*해\s*(줘|주세요))?|알람(\s*맞춰\s*(줘|주세요))?|알림(\s*해\s*(줘|주세요))?)[.!?~\s]*$/;

function memo(text) {
  const cleaned = text.replace(TRAILING, '').replace(/^\s*(에|쯤|에는|에서)\s+/, '').trim();
  return cleaned || '약속한';
}

function clockTime(period, hour, minute, now) {
  let hours = hour;
  if (['오후', '저녁', '밤'].includes(period) && hours < 12) hours += 12;
  if (['오전', '아침', '새벽'].includes(period) && hours === 12) hours = 0;
  const at = new Date(now);
  at.setHours(hours, minute, 0, 0);
  if (at <= new Date(now)) at.setDate(at.getDate() + 1);
  // "3시" with no period means the next 3 o'clock, whichever half of the day.
  if (!period && hours < 12) {
    const later = new Date(at);
    later.setHours(hours + 12);
    later.setDate(at.getDate());
    const sameDayLater = new Date(now);
    sameDayLater.setHours(hours + 12, minute, 0, 0);
    if (sameDayLater > new Date(now) && sameDayLater < at) return sameDayLater.getTime();
  }
  return at.getTime();
}

// Returns { at, text } or null. `command` is true for /알림, where no ask is needed.
function parseReminder(text, now = Date.now(), command = false) {
  if (!command && !ASKS_TO_REMIND.test(text)) return null;
  const relative = text.match(/(\d+)\s*(시간|분|초)(?:\s*(\d+)\s*분)?\s*(?:뒤|후|있다가)?(?:에)?\s*(.*)$/s);
  if (relative && (command || /(뒤|후|있다가)/.test(relative[0]))) {
    const delay = Number(relative[1]) * UNITS[relative[2]] + Number(relative[3] ?? 0) * UNITS.분;
    if (delay > 0) return { at: now + delay, text: memo(relative[4]) };
  }
  const clock = text.match(/(오전|오후|아침|저녁|밤|새벽)?\s*(\d{1,2})시(?:\s*(\d{1,2})분|\s*(반))?(?:에|쯤)?\s*(.*)$/s);
  if (clock && Number(clock[2]) <= 24) {
    const minute = clock[4] ? 30 : Number(clock[3] ?? 0);
    return { at: clockTime(clock[1], Number(clock[2]), minute, now), text: memo(clock[5]) };
  }
  return null;
}

const API = { parseReminder };
if (typeof module !== 'undefined') module.exports = API;
else window.Reminders = API;
