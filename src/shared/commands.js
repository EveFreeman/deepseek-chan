// Slash commands. Text starting with / is handled here and never sent to the model;
// // sends a literal slash. Pure parsing, so it can be unit tested.
// Each command has an internal id (its Korean name, which the handlers use). What is
// shown comes from the current language; what is typed may be the name in any of the
// languages or an alias.
(() => {
const I18n = typeof module !== 'undefined' ? require('./i18n') : window.I18n;

const COMMANDS = [
  { name: '웹검색', aliases: ['search', '검색모드'] },
  { name: '검색', aliases: ['s'] },
  { name: '읽기', aliases: ['read'] },
  { name: '첨부파일', aliases: ['attach', '첨부'] },
  { name: '첨부해제', aliases: ['detach'] },
  { name: '알림', aliases: ['remind'] },
  { name: '알림취소', aliases: ['unremind'] },
  { name: '음성', aliases: ['voice', 'mic'] },
  { name: '기억해', aliases: ['remember'] },
  { name: '기억목록', aliases: ['memories'] },
  { name: '잊어', aliases: ['forget'] },
  { name: '문서', aliases: ['docs'] },
  { name: '문서갱신', aliases: ['reindex'] },
  { name: '깊게', aliases: ['deep'] },
  { name: '강행', aliases: ['force'] },
  { name: '밥', aliases: ['feed', 'rice'] },
  { name: '쓰다듬기', aliases: ['pat'] },
  { name: '상태', aliases: ['status'] },
  { name: '브리핑', aliases: ['briefing'] },
  { name: '화면공유', aliases: ['screen', '화면'] },
  { name: '클립보드', aliases: ['clip'] },
  { name: '다시', aliases: ['retry'] },
  { name: '복사', aliases: ['copy'] },
  { name: '요약', aliases: ['tldr'] },
  { name: '번역', aliases: ['tr'] },
  { name: '모델', aliases: ['model'], options: 'profiles' },
  { name: '새대화', aliases: ['new', 'clear', '기억삭제'] },
  { name: '기록', aliases: ['log', 'history'] },
  { name: '사용량', aliases: ['usage'] },
  { name: '표정', aliases: ['face'], options: 'emotions' },
  { name: '동작', aliases: ['act'], options: 'clips' },
  { name: '음소거', aliases: ['mute'] },
  { name: 'SD', aliases: ['치비'] },
  { name: '상반신', aliases: ['bust'] },
  { name: '대시보드', aliases: ['dash'] },
  { name: '설정', aliases: ['settings'] },
  { name: '숨기기', aliases: ['hide'] },
  { name: '도움말', aliases: ['help', '?'] },
];

// The command's text in the current language: name, args and hint.
const label = (command) => I18n.t(`cmd.${command.name}.name`);
const args = (command) => {
  const value = I18n.raw(`cmd.${command.name}.args`);
  return typeof value === 'string' ? value : '';
};
const hint = (command) => I18n.t(`cmd.${command.name}.hint`);

// Every word that calls a command: its id, aliases, and its name in each language.
const words = (command) => [
  command.name, ...command.aliases,
  ...Object.keys(I18n.LANGS).map((l) => I18n.raw(`cmd.${command.name}.name`, l)).filter(Boolean),
];

// Lists for /도움말 and for commands that do not exist.
const GROUPS = [
  ['find', ['웹검색', '검색', '읽기', '문서', '문서갱신', '브리핑']],
  ['attach', ['첨부파일', '클립보드', '화면공유', '첨부해제']],
  ['chat', ['음성', '다시', '복사', '요약', '번역', '깊게', '강행', '모델', '기록', '새대화']],
  ['memory', ['기억해', '기억목록', '잊어', '알림', '알림취소']],
  ['character', ['밥', '쓰다듬기', '상태', '표정', '동작', 'SD', '상반신', '음소거', '숨기기', '사용량']],
  ['window', ['대시보드', '설정', '도움말']],
];
const byId = (id) => COMMANDS.find((c) => c.name === id);
const helpText = () => GROUPS
  .map(([group, ids]) => `${I18n.t(`cmdGroups.${group}`)}: ${ids.map((id) => `/${label(byId(id))}`).join(' ')}`)
  .join('\n');
const unknownText = (word) => I18n.t('said.unknown', { word, help: helpText() });
// "/{name}" of a command by id, for messages that point at another command.
const slash = (id) => label(byId(id));

const matches = (command, word) => {
  const lower = word.toLowerCase();
  return words(command).some((name) => name.toLowerCase().startsWith(lower));
};

const exact = (word) => {
  const lower = word.toLowerCase();
  return COMMANDS.find((c) => words(c).some((name) => name.toLowerCase() === lower));
};

// "/검색 내일 날씨" -> { word: '검색', arg: '내일 날씨', typingArg: true }. null when not a command.
function parse(text) {
  if (!text.startsWith('/') || text.startsWith('//')) return null;
  const space = text.search(/\s/);
  if (space === -1) return { word: text.slice(1), arg: '', typingArg: false };
  return { word: text.slice(1, space), arg: text.slice(space + 1).trim(), typingArg: true };
}

// Commands to list for what has been typed so far.
function suggest(text) {
  const parsed = parse(text);
  if (!parsed || parsed.typingArg) return [];
  return COMMANDS.filter((c) => matches(c, parsed.word));
}

// The command to run: an exact name, or the only one left that fits.
function resolve(word) {
  const found = exact(word);
  if (found) return found;
  const fits = COMMANDS.filter((c) => matches(c, word));
  return word && fits.length === 1 ? fits[0] : null;
}

const API = { COMMANDS, label, args, hint, helpText, unknownText, slash, parse, suggest, resolve };
if (typeof module !== 'undefined') module.exports = API;
else window.Commands = API;
})();
