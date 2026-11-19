// Interface language. The strings live in locales/<lang>.js, one file per language, all
// with the same keys; a key missing from one falls back to English, then to the key.
// Shared by the main process (require) and the windows (<script> after the locales).
(() => {
const LANGS = { en: 'English', ko: '한국어', ja: '日本語', zh: '中文' };
const DATE_LOCALES = { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP', zh: 'zh-CN' };

const TABLES = typeof module !== 'undefined'
  ? Object.fromEntries(Object.keys(LANGS).map((l) => [l, require(`./locales/${l}`)]))
  : window.I18N_LOCALES;

let lang = 'en';

// 'ko-KR', 'zh_CN', 'ja' ... -> a supported code, else English.
const normalize = (code) => {
  const short = String(code ?? '').toLowerCase().slice(0, 2);
  return LANGS[short] ? short : 'en';
};

const setLang = (code) => { lang = normalize(code); return lang; };
const getLang = () => lang;
const dateLocale = () => DATE_LOCALES[lang];

const lookup = (table, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), table);

// The raw value for `key`: a string, an array of lines or an object.
function raw(key, language = lang) {
  const found = lookup(TABLES[language], key);
  return found !== undefined ? found : lookup(TABLES.en, key);
}

// The string for `key` with {name} placeholders filled from `vars`.
function t(key, vars = {}, language = lang) {
  const value = raw(key, language);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (whole, name) => (vars[name] !== undefined ? String(vars[name]) : whole));
}

// One of the lines under `key`, picked at random.
function pick(key, random = Math.random) {
  const list = raw(key);
  return Array.isArray(list) ? list[Math.floor(random() * list.length)] : list;
}

// Fills a page: data-i18n sets the text; data-i18n-title, -placeholder and -aria set
// those attributes. data-i18n-cmd names a command whose current name fills {cmd}.
// Text with markup is never taken from the tables.
function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const cmd = el.dataset.i18nCmd;
    el.textContent = t(el.dataset.i18n, cmd ? { cmd: t(`cmd.${cmd}.name`) } : {});
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  if (root.documentElement) root.documentElement.lang = lang;
}

const API = { LANGS, normalize, setLang, getLang, dateLocale, raw, t, pick, apply, TABLES };
if (typeof module !== 'undefined') module.exports = API;
else window.I18n = API;
})();
