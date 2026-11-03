// Slash commands. Text starting with / is handled here and never sent to the model;
// // sends a literal slash. Pure parsing, so it can be unit tested.
(() => {
const COMMANDS = [
  { name: '웹검색', aliases: ['search', '검색모드'], hint: '켜면 이후 모든 질문을 반드시 웹에서 찾아 답합니다' },
  { name: '검색', aliases: ['s'], args: '질문', hint: '이번 질문만 웹에서 찾아 답합니다' },
  { name: '읽기', aliases: ['read'], args: 'URL 질문', hint: '지정한 웹페이지를 읽고 답합니다' },
  { name: '첨부파일', aliases: ['attach', '첨부'], hint: '이미지나 텍스트 파일을 첨부합니다' },
  { name: '첨부해제', aliases: ['detach'], hint: '첨부한 파일을 모두 뺍니다' },
  { name: '알림', aliases: ['remind'], args: '30분 뒤 회의', hint: '시간이 되면 캐릭터가 말로 알려 줍니다' },
  { name: '알림취소', aliases: ['unremind'], hint: '예약한 알림을 모두 지웁니다' },
  { name: '음성', aliases: ['voice', 'mic'], hint: '말로 입력합니다. 말을 멈추면 자동으로 보냅니다' },
  { name: '기억해', aliases: ['remember'], args: '내용', hint: '앞으로 계속 기억할 내용을 저장합니다' },
  { name: '기억목록', aliases: ['memories'], hint: '저장한 기억을 봅니다' },
  { name: '잊어', aliases: ['forget'], args: '번호', hint: '저장한 기억을 지웁니다' },
  { name: '문서', aliases: ['docs'], args: '질문', hint: '지정한 문서 폴더에서 찾아 답합니다' },
  { name: '문서갱신', aliases: ['reindex'], hint: '문서 폴더를 다시 읽습니다' },
  { name: '깊게', aliases: ['deep'], args: '질문', hint: '추론을 켜고 깊게 생각해 답합니다' },
  { name: '강행', aliases: ['force'], args: '질문', hint: '예산 차단을 이번만 넘겨 보냅니다' },
  { name: '밥', aliases: ['feed', 'rice'], hint: '흰쌀밥을 줍니다' },
  { name: '쓰다듬기', aliases: ['pat'], hint: '머리를 쓰다듬습니다' },
  { name: '상태', aliases: ['status'], hint: '배부름을 봅니다' },
  { name: '브리핑', aliases: ['briefing'], hint: '오늘의 브리핑을 듣습니다' },
  { name: '화면공유', aliases: ['screen', '화면'], args: '질문', hint: '현재 화면을 찍어, 확인 후 보냅니다' },
  { name: '클립보드', aliases: ['clip'], hint: '복사해 둔 이미지나 글을 첨부합니다' },
  { name: '다시', aliases: ['retry'], hint: '마지막 답변을 다시 생성합니다' },
  { name: '복사', aliases: ['copy'], hint: '마지막 답변을 클립보드에 복사합니다' },
  { name: '요약', aliases: ['tldr'], args: '내용', hint: '지금까지의 대화나 입력한 글을 요약합니다' },
  { name: '번역', aliases: ['tr'], args: '내용', hint: '입력한 글을 한국어나 영어로 번역합니다' },
  { name: '모델', aliases: ['model'], args: '연결', options: 'profiles', hint: '대화에 쓸 API 연결을 바꿉니다' },
  { name: '새대화', aliases: ['new', 'clear', '기억삭제'], hint: '새 세션을 시작합니다 (지난 대화는 기록 창에 남음)' },
  { name: '기록', aliases: ['log', 'history'], hint: '지난 대화를 모아 보는 창을 엽니다' },
  { name: '사용량', aliases: ['usage'], hint: '오늘과 이번 달 비용을 보여 줍니다' },
  { name: '표정', aliases: ['face'], args: '감정', options: 'emotions', hint: '표정을 보여 줍니다' },
  { name: '동작', aliases: ['act'], args: '동작', options: 'clips', hint: '동작을 보여 줍니다' },
  { name: '음소거', aliases: ['mute'], hint: '음성을 켜거나 끕니다' },
  { name: 'SD', aliases: ['치비'], hint: 'SD 모드를 전환합니다' },
  { name: '대시보드', aliases: ['dash'], hint: '사용량 대시보드를 엽니다' },
  { name: '설정', aliases: ['settings'], hint: '설정을 엽니다' },
  { name: '숨기기', aliases: ['hide'], hint: '캐릭터를 숨깁니다' },
  { name: '도움말', aliases: ['help', '?'], hint: '명령어 목록을 봅니다' },
];

// Prepared text for /도움말 and for commands that do not exist.
const GROUPS = [
  ['찾기', ['웹검색', '검색', '읽기', '문서', '문서갱신', '브리핑']],
  ['첨부', ['첨부파일', '클립보드', '화면공유', '첨부해제']],
  ['대화', ['음성', '다시', '복사', '요약', '번역', '깊게', '강행', '모델', '기록', '새대화']],
  ['기억', ['기억해', '기억목록', '잊어', '알림', '알림취소']],
  ['캐릭터', ['밥', '쓰다듬기', '상태', '표정', '동작', 'SD', '음소거', '숨기기', '사용량']],
  ['창', ['대시보드', '설정', '도움말']],
];
const HELP_TEXT = GROUPS.map(([title, names]) => `${title}: ${names.map((n) => `/${n}`).join(' ')}`).join('\n');
const unknownText = (word) => `/${word} 명령어는 없어요. 쓸 수 있는 명령어예요.\n${HELP_TEXT}`;

const matches = (command, word) => {
  const lower = word.toLowerCase();
  return [command.name, ...command.aliases].some((name) => name.toLowerCase().startsWith(lower));
};

const exact = (word) => {
  const lower = word.toLowerCase();
  return COMMANDS.find((c) => [c.name, ...c.aliases].some((name) => name.toLowerCase() === lower));
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

const API = { COMMANDS, HELP_TEXT, unknownText, parse, suggest, resolve };
if (typeof module !== 'undefined') module.exports = API;
else window.Commands = API;
})();
