// Asks which language the app should use and saves it as the default in
// data/config.json. The app can switch later in Settings > General.
// Without a console, or with --default, it takes the system language.
// Flags: --lang=<en|ko|ja|zh> sets it without asking.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const CONFIG = path.join(ROOT, 'data', 'config.json');
const LANGS = [['en', 'English'], ['ko', '한국어'], ['ja', '日本語'], ['zh', '中文']];
const PROMPT = {
  en: 'Language for DeepSeek-chan',
  ko: '딥시크쨩이 쓸 언어',
  ja: 'DeepSeekちゃんの言語',
  zh: 'DeepSeek酱使用的语言',
};

const supported = (code) => {
  const short = String(code ?? '').toLowerCase().slice(0, 2);
  return LANGS.some(([c]) => c === short) ? short : null;
};

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  } catch {
    return {};
  }
}

function save(lang) {
  const config = readConfig();
  config.language = lang;
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2));
  console.log(`Language: ${LANGS.find(([c]) => c === lang)[1]} (${lang})`);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}

(async () => {
  const flag = process.argv.find((a) => a.startsWith('--lang='));
  if (flag) {
    const lang = supported(flag.slice(7));
    if (!lang) throw new Error(`unsupported language: ${flag.slice(7)}`);
    return save(lang);
  }
  const current = supported(readConfig().language);
  const system = supported(Intl.DateTimeFormat().resolvedOptions().locale) ?? 'en';
  const suggested = current ?? system;
  if (!process.stdin.isTTY || process.argv.includes('--default')) return save(suggested);

  console.log('');
  LANGS.forEach(([code, name], i) => console.log(`  ${i + 1}) ${name}${code === suggested ? '  *' : ''}`));
  const answer = await ask(`${LANGS.map(([c]) => PROMPT[c]).join(' / ')} [1-4, Enter = *]: `);
  const picked = LANGS[Number(answer) - 1]?.[0] ?? supported(answer) ?? suggested;
  return save(picked);
})().catch((err) => {
  console.error(`choose-language: ${err.message}`);
  process.exit(1);
});
