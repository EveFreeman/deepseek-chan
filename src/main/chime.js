// What she says on the hour: the time, then a line that suits it. Hours are written
// out in words so the voice reads them the way people say them.
const I18n = require('../shared/i18n');

// The tags for each hour's two lines; the lines themselves are in the locale files.
const TAGS = [
  [['sleepy'], ['teasing']], [['sleepy'], ['annoyed']], [['deadpan'], ['tired']], [['sleepy'], ['surprised']],
  [['tired'], ['comfort']], [['question'], ['calm']], [['greeting'], ['happy', 'stretch']], [['hungry'], ['curious']],
  [['warning'], ['suggest']], [['determined'], ['suggest']], [['cheer'], ['determined']], [['hungry'], ['cheer']],
  [['excited'], ['hungry']], [['suggest'], ['sleepy']], [['tired'], ['suggest']], [['happy'], ['suggest', 'stretch']],
  [['curious'], ['cheer']], [['excited'], ['suggest']], [['comfort'], ['hungry']], [['question'], ['attentive']],
  [['calm'], ['playful']], [['comfort'], ['comfort']], [['calm'], ['teasing']], [['sleepy'], ['sleepy']],
];

const timeLabel = (hour) => I18n.raw('chime.time')(hour);

function chimeLine(hour, random = Math.random) {
  const lines = I18n.raw('chime.lines')[hour];
  const i = Math.floor(random() * lines.length);
  return [`${timeLabel(hour)} ${lines[i]}`, TAGS[hour][i]];
}

module.exports = { chimeLine, timeLabel };
