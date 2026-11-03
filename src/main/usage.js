const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// One JSON object per line. Cost is computed when the request happens, so a
// later price edit never rewrites history.
const file = () => path.join(app.getPath('userData'), 'usage.jsonl');

function add(record) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.appendFileSync(file(), `${JSON.stringify(record)}\n`);
}

function all() {
  let text;
  try { text = fs.readFileSync(file(), 'utf8'); } catch { return []; }
  const out = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip a torn line */ }
  }
  return out;
}

function clear() {
  fs.rmSync(file(), { force: true });
}

module.exports = { add, all, clear };
