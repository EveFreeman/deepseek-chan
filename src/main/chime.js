// What she says on the hour: the time, then a line that suits it. Hours are written
// out in words so the voice reads them the way people say them.
const HOURS = ['열두', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한'];

function timeLabel(hour) {
  const name = `${HOURS[hour % 12]} 시`;
  if (hour === 0) return `밤 ${name}`;
  if (hour < 6) return `새벽 ${name}`;
  if (hour < 12) return `오전 ${name}`;
  if (hour === 12) return `낮 ${name}`;
  if (hour < 18) return `오후 ${name}`;
  if (hour < 21) return `저녁 ${name}`;
  return `밤 ${name}`;
}

// [line, tags] per hour, after "<time>예요."
const LINES = [
  [['날짜가 바뀌었어요. 오늘은 여기까지 하는 거 어때요?', ['sleepy']], ['신데렐라도 집에 갈 시간인데요.', ['teasing']]],
  [['저 눈이 자꾸 감겨요…', ['sleepy']], ['내일의 주인님한테 미안하지 않아요?', ['annoyed']]],
  [['이 시간엔 버그도 자요.', ['deadpan']], ['이제 진짜 자야 해요.', ['tired']]],
  [['고래도 이 시간엔 물속에서 쉬어요.', ['sleepy']], ['저 혼자 깨어 있는 줄 알았어요.', ['surprised']]],
  [['곧 해가 뜨겠어요.', ['tired']], ['밤새우는 거면 물이라도 한 잔 마셔요.', ['comfort']]],
  [['일찍 일어난 거죠? 밤새운 거 아니죠?', ['question']], ['하늘이 조금씩 밝아지고 있을 거예요.', ['calm']]],
  [['좋은 아침이에요, 주인님!', ['greeting']], ['기지개 한 번 켜고 시작해요.', ['happy', 'stretch']]],
  [['아침밥 챙겨 드세요. 저는 흰밥이요.', ['hungry']], ['오늘 날씨는 어떨까요?', ['curious']]],
  [['출근길 조심하세요!', ['warning']], ['커피보다 물 먼저요.', ['suggest']]],
  [['자, 오늘 일 시작해 볼까요?', ['determined']], ['오늘 할 일부터 정리해 봐요.', ['suggest']]],
  [['집중이 제일 잘 되는 시간이에요.', ['cheer']], ['어려운 일은 지금 해치워요.', ['determined']]],
  [['점심 메뉴 고민할 시간이죠.', ['hungry']], ['한 시간만 더 힘내면 점심이에요!', ['cheer']]],
  [['점심시간이에요! 밥이요, 밥!', ['excited']], ['일은 도망 안 가요. 밥 먹고 해요.', ['hungry']]],
  [['식곤증 오기 전에 조금 걸어요.', ['suggest']], ['배부르니까 졸려요…', ['sleepy']]],
  [['제일 졸린 시간이죠. 조금만 버텨요.', ['tired']], ['물 한 잔 어때요?', ['suggest']]],
  [['간식 시간이에요. 저는 밀크티요.', ['happy']], ['잠깐 일어나서 몸 좀 풀어요.', ['suggest', 'stretch']]],
  [['오늘 할 일, 얼마나 남았어요?', ['curious']], ['조금만 더 하면 끝이 보여요.', ['cheer']]],
  [['퇴근이 코앞이에요!', ['excited']], ['오늘 한 일 정리해 둘까요?', ['suggest']]],
  [['오늘도 수고 많으셨어요.', ['comfort']], ['저녁은 뭐 먹어요?', ['hungry']]],
  [['저녁밥은 드셨어요?', ['question']], ['오늘 하루 어땠어요?', ['attentive']]],
  [['이제 좀 쉬어도 돼요.', ['calm']], ['하고 싶었던 거 할 시간이에요.', ['playful']]],
  [['오늘도 고생했어요, 주인님.', ['comfort']], ['눈 좀 쉬게 해 줘요.', ['comfort']]],
  [['슬슬 마무리해요.', ['calm']], ['내일 할 일은 내일의 주인님한테 맡겨요.', ['teasing']]],
  [['이제 자러 갈 준비해요.', ['sleepy']], ['화면 그만 보고 자요. 저도 잘 거예요.', ['sleepy']]],
];

function chimeLine(hour, random = Math.random) {
  const options = LINES[hour];
  const [line, tags] = options[Math.floor(random() * options.length)];
  return [`${timeLabel(hour)}예요. ${line}`, tags];
}

module.exports = { chimeLine, timeLabel };
