// Puts the Live2D model into live2d/ and the voice corpus into voice/. Neither may be
// redistributed, so both come from their official pages, on this PC, after the user has
// seen the terms:
//   voice  The corpus page links the zip directly. After the user agrees to the terms,
//          it is downloaded from there.
//   model  VGen hands out the free model only to a signed-in visitor. The page is opened
//          in the browser, and the zip the user downloads is picked up from Downloads.
// A zip already in this folder or in Downloads is used as is. Safe to run again.
// Flags: --yes agrees to the voice terms without asking, --skip-model, --skip-voice.
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const CACHE = path.join(ROOT, 'runtime', 'cache', 'assets');
const args = new Set(process.argv.slice(2));

const MODEL = {
  dir: path.join(ROOT, 'live2d'),
  file: '大肥鱼.model3.json',
  page: 'https://vgen.co/KAMIYA/product/deepseek-chan-deepseek-free-live2d-model-layered-psd-psd/1c55a71a-2747-4616-819d-2dc0a934089d',
  name: /deepseek/i,
};
const VOICE = {
  dir: path.join(ROOT, 'voice'),
  file: 'VOICEACTRESS100_011.wav',
  page: 'https://tyc.rei-yumesaki.net/material/corpus/',
  url: 'https://tyc.rei-yumesaki.net/files/voice/tyc-corpus1.zip',
  name: /^tyc-corpus1.*\.zip$/i,
};
const WAIT_FOR_MODEL = 30 * 60000;

// ------------------------------------------------------------------------ zip

// A small reader for the two archives: stored or deflated entries, no zip64. Names
// without the UTF-8 flag are Shift_JIS, as both archives were made on Japanese PCs;
// the system unzip tools would turn them into mojibake.
const SJIS = new TextDecoder('shift_jis');
const UTF8 = new TextDecoder('utf-8');

function zipEntries(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const tailLen = Math.min(size, 0xffff + 22);
    const tail = Buffer.alloc(tailLen);
    fs.readSync(fd, tail, 0, tailLen, size - tailLen);
    const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd < 0) throw new Error(`not a zip file: ${file}`);
    const count = tail.readUInt16LE(eocd + 10);
    const cdSize = tail.readUInt32LE(eocd + 12);
    const cdOffset = tail.readUInt32LE(eocd + 16);
    if (cdOffset === 0xffffffff || count === 0xffff) throw new Error('zip64 archives are not supported');
    const cd = Buffer.alloc(cdSize);
    fs.readSync(fd, cd, 0, cdSize, cdOffset);
    const entries = [];
    for (let p = 0; p < cdSize;) {
      if (cd.readUInt32LE(p) !== 0x02014b50) throw new Error('broken zip directory');
      const flags = cd.readUInt16LE(p + 8);
      const nameLen = cd.readUInt16LE(p + 28);
      const raw = cd.subarray(p + 46, p + 46 + nameLen);
      entries.push({
        name: (flags & 0x800 ? UTF8 : SJIS).decode(raw).replace(/\\/g, '/'),
        method: cd.readUInt16LE(p + 10),
        compressed: cd.readUInt32LE(p + 20),
        size: cd.readUInt32LE(p + 24),
        offset: cd.readUInt32LE(p + 42),
      });
      p += 46 + nameLen + cd.readUInt16LE(p + 30) + cd.readUInt16LE(p + 32);
    }
    return entries;
  } finally {
    fs.closeSync(fd);
  }
}

const zipHas = (file, name) => {
  try {
    return zipEntries(file).some((e) => e.name === name || e.name.endsWith(`/${name}`));
  } catch {
    return false;
  }
};

function unzip(file, dest) {
  const entries = zipEntries(file);
  const fd = fs.openSync(file, 'r');
  const root = path.resolve(dest);
  try {
    for (const e of entries) {
      // Refuse names that would land outside dest.
      const target = path.resolve(root, e.name);
      if (target !== root && !target.startsWith(root + path.sep)) throw new Error(`unsafe path in zip: ${e.name}`);
      if (e.name.endsWith('/')) { fs.mkdirSync(target, { recursive: true }); continue; }
      if (path.basename(e.name) === '.DS_Store' || e.name.startsWith('__MACOSX/')) continue;
      const head = Buffer.alloc(30);
      fs.readSync(fd, head, 0, 30, e.offset);
      const start = e.offset + 30 + head.readUInt16LE(26) + head.readUInt16LE(28);
      const data = Buffer.alloc(e.compressed);
      fs.readSync(fd, data, 0, e.compressed, start);
      let out;
      if (e.method === 0) out = data;
      else if (e.method === 8) out = zlib.inflateRawSync(data);
      else throw new Error(`unsupported compression in ${e.name}`);
      if (out.length !== e.size) throw new Error(`size mismatch in ${e.name}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, out);
    }
  } finally {
    fs.closeSync(fd);
  }
}

// ---------------------------------------------------------------------- helpers

function hasFile(dir, name, depth = 4) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return false; }
  return entries.some((e) => (e.isFile() && e.name === name) || (e.isDirectory() && depth && hasFile(path.join(dir, e.name), name, depth - 1)));
}

const zipsIn = (dir) => {
  try {
    return fs.readdirSync(dir).filter((n) => /\.zip$/i.test(n)).map((n) => path.join(dir, n));
  } catch {
    return [];
  }
};

// A zip in this folder, the cache or Downloads whose name fits and which holds `file`.
const findZip = (asset) => [ROOT, CACHE, DOWNLOADS].flatMap(zipsIn)
  .find((zip) => asset.name.test(path.basename(zip)) && zipHas(zip, asset.file));

function openBrowser(url) {
  if (process.platform === 'win32') execFile('rundll32', ['url.dll,FileProtocolHandler', url]);
  else if (process.platform === 'darwin') execFile('open', [url]);
  else execFile('xdg-open', [url]);
}

function ask(question) {
  if (!process.stdin.isTTY) return Promise.resolve('');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const part = `${file}.part`;
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`download failed (${res.status}): ${url}`);
  const total = Number(res.headers.get('content-length')) || 0;
  const out = fs.createWriteStream(part);
  let got = 0;
  let shown = -1;
  for await (const chunk of res.body) {
    got += chunk.length;
    if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
    const pct = total ? Math.floor((got / total) * 100) : -1;
    if (pct !== shown && pct % 5 === 0) { shown = pct; process.stdout.write(`\r  ${pct}% of ${(total / 1e6).toFixed(0)} MB`); }
  }
  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));
  process.stdout.write('\n');
  if (total && got !== total) throw new Error('download was cut short; run setup again');
  fs.renameSync(part, file);
}

// ----------------------------------------------------------------------- steps

async function voice() {
  if (hasFile(VOICE.dir, VOICE.file)) { console.log('Voice: already in voice/'); return true; }
  let zip = findZip(VOICE);
  if (!zip) {
    console.log(`
Voice: つくよみちゃんコーパス Vol.1 (about 520 MB) from its official page.
  ${VOICE.page}
  Terms, in short: the corpus itself may not be redistributed; voice synthesis software
  that uses it must credit it where its users see it (this app does, in Settings).
  Read the full terms on the page before agreeing.`);
    let ok = args.has('--yes');
    if (!ok) {
      const a = await ask('  Agree to the terms and download it now? [y/N/o=open the page] ');
      if (/^o/i.test(a)) { openBrowser(VOICE.page); ok = /^y/i.test(await ask('  Agree and download? [y/N] ')); } else ok = /^y/i.test(a);
    }
    if (!ok) { console.log('  Skipped. Put the corpus into voice/ yourself, or run setup again.'); return false; }
    zip = path.join(CACHE, 'tyc-corpus1.zip');
    await download(VOICE.url, zip);
    if (!zipHas(zip, VOICE.file)) throw new Error('the corpus download does not hold the expected files');
  }
  console.log(`  Unpacking ${path.basename(zip)} into voice/`);
  unzip(zip, VOICE.dir);
  return true;
}

async function model() {
  if (hasFile(MODEL.dir, MODEL.file)) { console.log('Model: already in live2d/'); return true; }
  let zip = findZip(MODEL);
  if (!zip) {
    console.log(`
Model: DeepSeek-chan free Live2D model by Kamiya Ryoko, from VGen.
  ${MODEL.page}
  VGen gives the free model to signed-in visitors, so the page opens in your browser.
  Download it there (sign in to VGen if asked) and leave the zip in Downloads:
  setup picks it up from there. Its terms of use come inside the zip.`);
    if (!process.stdin.isTTY) { console.log('  Skipped: no console to wait in.'); return false; }
    openBrowser(MODEL.page);
    console.log(`  Waiting for the zip in ${DOWNLOADS} (Ctrl+C to stop; up to 30 min)...`);
    const until = Date.now() + WAIT_FOR_MODEL;
    while (!zip && Date.now() < until) {
      await sleep(3000);
      // Skips half-written files: a zip only reads as one once its directory is there.
      zip = findZip(MODEL);
    }
    if (!zip) { console.log('  Not found. Put the model into live2d/ yourself, or run setup again.'); return false; }
  }
  console.log(`  Unpacking ${path.basename(zip)} into live2d/`);
  unzip(zip, MODEL.dir);
  return true;
}

module.exports = { zipEntries, unzip };

if (require.main === module) (async () => {
  const done = [];
  if (!args.has('--skip-voice')) done.push(await voice());
  if (!args.has('--skip-model')) done.push(await model());
  if (done.includes(false)) console.log('\nSome files are still missing. See README.md, section 3.');
})().catch((err) => {
  console.error(`\nfetch-assets: ${err.message}`);
  process.exit(1);
});
