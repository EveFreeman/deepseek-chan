// Reads a web page directly from this PC, for when the Fetch API cannot: some sites
// refuse it or time out. No third-party service is involved. Because the app itself
// connects, every hop is checked: the name must resolve to public addresses only, each
// redirect is checked again, and the body is size-capped.
const dns = require('dns').promises;
const guard = require('./web-guard');

const TIMEOUT = 15000;
const MAX_REDIRECTS = 5;
const MAX_BYTES = 3 * 1024 * 1024;
const TEXT_TYPES = /^(text\/html|application\/xhtml\+xml|text\/plain|application\/json)/i;
// A browser-like request; many sites answer bare clients with an error page.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8,ja;q=0.7',
};

async function assertPublic(url) {
  const { hostname, protocol, username, password } = new URL(url);
  if (protocol !== 'https:' && protocol !== 'http:') throw new Error('허용되지 않는 프로토콜입니다.');
  if (username || password) throw new Error('URL에 계정 정보를 넣을 수 없습니다.');
  if (guard.PRIVATE_HOST.test(hostname)) throw new Error('내부 주소는 읽을 수 없습니다.');
  const host = hostname.replace(/^\[|\]$/g, '');
  const addresses = await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => guard.isPrivateAddress(a.address))) throw new Error('내부 주소는 읽을 수 없습니다.');
}

async function readCapped(res) {
  const reader = res.body.getReader();
  const parts = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    parts.push(value);
  }
  return Buffer.concat(parts);
}

// The header's charset, else a <meta> one near the top, else UTF-8. Korean and
// Japanese sites still often use EUC-KR or Shift_JIS.
function decode(bytes, contentType) {
  const head = bytes.subarray(0, 4096).toString('latin1');
  const charset = /charset=["']?([\w-]+)/i.exec(contentType ?? '')?.[1] ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ?? 'utf-8';
  try {
    return new TextDecoder(charset.toLowerCase()).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decodeEntities = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
  if (name[0] === '#') {
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
    return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : ' ';
  }
  return ENTITIES[name.toLowerCase()] ?? whole;
});

const BLOCK = /<\/?(p|div|section|article|main|br|hr|h[1-6]|li|ul|ol|tr|table|blockquote|pre|dd|dt|figcaption)\b[^>]*>/gi;
const DROP = /<(script|style|noscript|svg|template|iframe|nav|header|footer|aside|form|button|select)\b[\s\S]*?<\/\1>/gi;

const strip = (html) => decodeEntities(html
  .replace(/<li\b[^>]*>/gi, '\n- ')
  .replace(BLOCK, '\n')
  .replace(/<[^>]+>/g, ' '))
  .replace(/[ \t ]+/g, ' ')
  .replace(/ *\n */g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

// Readable text of an HTML page: the <article> or <main> part when it holds the bulk
// of the text, else the whole body without menus, headers, footers and scripts.
function htmlToText(html) {
  const title = strip(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '');
  const body = (/<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html).replace(/<!--[\s\S]*?-->/g, ' ').replace(DROP, ' ');
  const text = strip(body);
  for (const tag of ['article', 'main']) {
    const part = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(body)?.[1];
    const partText = part ? strip(part) : '';
    if (partText.length > 500 && partText.length > text.length * 0.4) return { title, content: partText };
  }
  return { title, content: text };
}

async function fetchPage(url) {
  let href = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(href);
    const res = await fetch(href, { headers: HEADERS, redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      href = new URL(res.headers.get('location'), href).href;
      continue;
    }
    if (!res.ok) throw new Error(`사이트가 ${res.status} 오류로 응답했습니다.`);
    const type = res.headers.get('content-type') ?? '';
    if (type && !TEXT_TYPES.test(type)) throw new Error(`글로 된 페이지가 아닙니다 (${type.split(';')[0]}).`);
    const text = decode(await readCapped(res), type);
    const page = /html/i.test(type) || /^\s*</.test(text) ? htmlToText(text) : { title: '', content: text };
    return { ...page, url: href };
  }
  throw new Error('리다이렉트가 너무 많습니다.');
}

module.exports = { fetchPage, htmlToText, decode };
