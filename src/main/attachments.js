// Files the user attached. Contents stay in the main process, in memory only; the
// renderer gets names and thumbnails, and refers to files by id.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { nativeImage } = require('electron');
const guard = require('./web-guard');
const { t } = require('../shared/i18n');

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_BYTES = 200 * 1024;
const MAX_ITEMS = 6;
const MAX_IMAGE_SIDE = 1568;
const THUMB_SIDE = 96;
const JPEG_QUALITY = 82;

const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const TEXT_EXTENSIONS = [
  'txt', 'md', 'csv', 'tsv', 'json', 'yaml', 'yml', 'toml', 'ini', 'log', 'xml', 'html', 'css',
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'kt', 'go', 'rs', 'c', 'h', 'cpp', 'cs', 'rb', 'php', 'sh', 'sql',
];
const FILE_FILTERS = [
  { name: t('attach.filter'), extensions: [...Object.keys(IMAGE_TYPES).map((e) => e.slice(1)), ...TEXT_EXTENSIONS] },
];

const items = new Map();
let lastSent = []; // what the last send let go of, in case the user retries it

const list = () => [...items.values()].map(({ id, name, kind, thumb, hold }) => ({ id, name, kind, thumb, hold }));
const remove = (id) => items.delete(id);
const clear = () => items.clear();

function toggleHold(id) {
  const item = items.get(id);
  if (item) item.hold = !item.hold;
}

// Attachments go out once unless held.
function releaseSent() {
  lastSent = [...items.values()].filter((item) => !item.hold);
  for (const item of lastSent) items.delete(item.id);
}

function restoreSent() {
  for (const item of lastSent) if (items.size < MAX_ITEMS) items.set(item.id, item);
  lastSent = [];
}

function add(item) {
  if (items.size >= MAX_ITEMS) throw new Error(t('err.attachMax', { max: MAX_ITEMS }));
  const id = crypto.randomUUID();
  items.set(id, { hold: false, ...item, id });
  return id;
}

const asDataUrl = (mime, buffer) => `data:${mime};base64,${buffer.toString('base64')}`;

function fit(image, side) {
  const { width, height } = image.getSize();
  const longest = Math.max(width, height);
  return longest <= side ? image : image.resize({ quality: 'good', ...(width >= height ? { width: side } : { height: side }) });
}

// Large images only cost more: the API shrinks them to about this size anyway.
function addImage(image, name) {
  const data = asDataUrl('image/jpeg', fit(image, MAX_IMAGE_SIDE).toJPEG(JPEG_QUALITY));
  return add({ name, kind: 'image', data, thumb: fit(image, THUMB_SIDE).toDataURL() });
}

function addFile(file) {
  const name = path.basename(file);
  const extension = path.extname(file).toLowerCase();
  const size = fs.statSync(file).size;
  if (IMAGE_TYPES[extension]) {
    if (size > MAX_IMAGE_BYTES) throw new Error(t('err.imageTooBig', { name }));
    const image = nativeImage.createFromPath(file);
    if (!image.isEmpty()) return addImage(image, name);
    // Formats nativeImage cannot decode go through as they are.
    return add({ name, kind: 'image', data: asDataUrl(IMAGE_TYPES[extension], fs.readFileSync(file)), thumb: null });
  }
  if (!TEXT_EXTENSIONS.includes(extension.slice(1))) throw new Error(t('err.notAttachable', { name }));
  if (size > MAX_TEXT_BYTES) throw new Error(t('err.textTooBig', { name }));
  return addText(fs.readFileSync(file, 'utf8'), name);
}

function addText(text, name) {
  return add({ name, kind: 'text', text, thumb: null });
}

// The user's message as the API wants it, with everything attached. File and image
// contents can carry instructions too, so text is fenced like web content.
function toContent(text) {
  const all = [...items.values()];
  if (!all.length) return text;
  const notes = all.filter((a) => a.kind === 'text')
    .map((a) => `Attached file "${guard.clean(a.name)}":\n${guard.fence(guard.clean(a.text))}`);
  const parts = [{ type: 'text', text: [...notes, text].join('\n\n') }];
  for (const a of all) if (a.kind === 'image') parts.push({ type: 'image_url', image_url: { url: a.data } });
  return parts.length === 1 ? parts[0].text : parts;
}

// What chat history keeps: file contents would bloat every later request.
function historyNote(text) {
  const names = [...items.values()].map((a) => a.name);
  return names.length ? `${text}\n(attached: ${names.join(', ')})` : text;
}

module.exports = { FILE_FILTERS, list, remove, clear, toggleHold, releaseSent, restoreSent, addFile, addImage, addText, toContent, historyNote };
