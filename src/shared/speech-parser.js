// Turns a token stream like "[happy][nod] 네! 알겠어요." into spoken segments:
// { text, tags: ['happy', 'nod'] }, cut at sentence ends, safe for tags or
// sentences split across chunks.
const knownTags = (typeof module !== 'undefined' ? require('./motions') : window.Motions).KNOWN_TAGS;

const MAX_TAG = 24;
const SENTENCE_END = /[.!?。！？…~\n]+["'”’)）]*\s*/;
const SENTENCE_TAIL = new RegExp(`${SENTENCE_END.source}$`);
// The voice waits for its whole first piece to be synthesized, which on a CPU takes
// longer than saying it. So until something has been said, a comma ends a piece too,
// once a few words precede it; not one between digits, as in 1,000.
const CLAUSE_END = /(?<!\d)[,，、](?!\d)\s*/g;
const MIN_CLAUSE = 6;

class SpeechParser {
  constructor(onSegment) {
    this.onSegment = onSegment;
    this.pending = '';
    this.text = '';
    this.tags = [];
  }

  push(chunk) {
    this.pending += chunk;
    for (;;) {
      const open = this.pending.indexOf('[');
      if (open === -1) {
        this.addText(this.pending);
        this.pending = '';
        return;
      }
      this.addText(this.pending.slice(0, open));
      this.pending = this.pending.slice(open);
      const close = this.pending.indexOf(']');
      if (close === -1) {
        if (this.pending.length <= MAX_TAG) return; // wait for the rest of the tag
        this.addText(this.pending[0]);
        this.pending = this.pending.slice(1);
        continue;
      }
      const [name, level] = this.pending.slice(1, close).trim().toLowerCase().split(':');
      if (knownTags.has(name)) {
        // A tag after a finished sentence belongs to the next one.
        if (SENTENCE_TAIL.test(this.text)) {
          this.emit(this.text);
          this.text = '';
        }
        this.tags.push(name);
        if (level) this.level = Number(level);
      }
      else if (!/^[a-z_-]+$/.test(name)) this.addText(this.pending.slice(0, close + 1));
      this.pending = this.pending.slice(close + 1);
    }
  }

  nextCut() {
    const end = SENTENCE_END.exec(this.text);
    if (this.spoke) return end;
    CLAUSE_END.lastIndex = MIN_CLAUSE;
    const clause = CLAUSE_END.exec(this.text);
    return clause && (!end || clause.index < end.index) ? clause : end;
  }

  addText(text) {
    this.text += text;
    for (;;) {
      const match = this.nextCut();
      // Keep a trailing end mark buffered: more punctuation may follow.
      if (!match || match.index + match[0].length === this.text.length) return;
      const cut = match.index + match[0].length;
      this.emit(this.text.slice(0, cut));
      this.text = this.text.slice(cut);
    }
  }

  emit(raw) {
    const text = unemphasize(raw).trimStart();
    if (!text && !this.tags.length) return;
    if (text.trim()) this.spoke = true;
    this.onSegment({ text, tags: this.tags, level: this.level });
    this.tags = [];
    this.level = undefined;
  }

  flush() {
    this.addText(this.pending);
    this.pending = '';
    this.emit(this.text);
    this.text = '';
  }
}

// Bold and underline marks the model sometimes adds anyway; the bubble is plain text.
// Each mark is removed on its own, so one cut by a sentence end still goes.
const unemphasize = (text) => text.replace(/\*\*|__/g, '');

// What the voice should read: no markdown, code, links or emoji.
function speakable(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[*_#>|~]/g, ' ')
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

if (typeof module !== 'undefined') module.exports = { SpeechParser, speakable, unemphasize };
else Object.assign(window, { SpeechParser, speakable, unemphasize });
