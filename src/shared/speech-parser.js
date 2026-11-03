// Turns a token stream like "[happy][nod] 네! 알겠어요." into spoken segments:
// { text, tags: ['happy', 'nod'] }, cut at sentence ends, safe for tags or
// sentences split across chunks.
const knownTags = (typeof module !== 'undefined' ? require('./motions') : window.Motions).KNOWN_TAGS;

const MAX_TAG = 24;
const SENTENCE_END = /[.!?。！？…~\n]+["'”’)）]*\s*/;
const SENTENCE_TAIL = new RegExp(`${SENTENCE_END.source}$`);

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

  addText(text) {
    this.text += text;
    for (;;) {
      const match = SENTENCE_END.exec(this.text);
      // Keep a trailing end mark buffered: more punctuation may follow.
      if (!match || match.index + match[0].length === this.text.length) return;
      const cut = match.index + match[0].length;
      this.emit(this.text.slice(0, cut));
      this.text = this.text.slice(cut);
    }
  }

  emit(raw) {
    const text = raw.trimStart();
    if (!text && !this.tags.length) return;
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

if (typeof module !== 'undefined') module.exports = { SpeechParser, speakable };
else Object.assign(window, { SpeechParser, speakable });
