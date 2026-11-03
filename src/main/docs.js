// Keyword search over a folder of the user's text documents. Read-only, and nothing
// outside the chosen folder is touched. Scoring is plain term counting: no index files
// and no embedding service, so documents only leave the PC when a match is sent to the model.
const fs = require('fs');
const path = require('path');

const EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.csv', '.json', '.yaml', '.yml', '.log', '.html', '.py', '.js', '.ts', '.java', '.go', '.rs', '.c', '.cpp', '.sql']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv']);
const MAX_FILES = 3000;
const MAX_FILE_BYTES = 1024 * 1024;
const CHUNK_CHARS = 900;
const CHUNK_STEP = 700;

let index = { folder: null, chunks: [], files: 0 };

function walk(folder, found = []) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (found.length >= MAX_FILES) break;
    // Symlinks are skipped so a link cannot lead outside the chosen folder.
    if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, found);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) found.push(full);
  }
  return found;
}

function build(folder) {
  const chunks = [];
  const files = walk(folder);
  for (const file of files) {
    if (fs.statSync(file).size > MAX_FILE_BYTES) continue;
    const text = fs.readFileSync(file, 'utf8');
    const name = path.relative(folder, file);
    for (let at = 0; at < text.length; at += CHUNK_STEP) {
      chunks.push({ name, text: text.slice(at, at + CHUNK_CHARS), lower: text.slice(at, at + CHUNK_CHARS).toLowerCase() });
      if (at + CHUNK_CHARS >= text.length) break;
    }
  }
  index = { folder, chunks, files: files.length };
  return { files: files.length, chunks: chunks.length };
}

const terms = (query) => [...new Set(query.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [])];

function search(folder, query, limit = 5) {
  if (index.folder !== folder) build(folder);
  const words = terms(query);
  const scored = [];
  for (const chunk of index.chunks) {
    let score = 0;
    let hits = 0;
    for (const word of words) {
      const count = chunk.lower.split(word).length - 1;
      if (count) hits += 1;
      score += Math.min(count, 5);
    }
    if (score) scored.push({ chunk, score: score + hits * 5 });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ chunk }) => ({ name: chunk.name, text: chunk.text }));
}

module.exports = { build, search };
