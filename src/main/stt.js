// Runs scripts/python/stt_worker.py in the GPT-SoVITS environment, which has faster-whisper.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { pythonEnv } = require('./gptsovits');
const { idleStopper } = require('./idle');
const { t } = require('../shared/i18n');

const TIMEOUT = 60000;

let child = null;
let lines = null;
let ready = null;
let queue = Promise.resolve();
const idle = idleStopper(() => stop());

function nextLine() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(t('err.sttTimeout'))), TIMEOUT * 2);
    lines.once('line', (line) => {
      clearTimeout(timer);
      resolve(JSON.parse(line));
    });
  });
}

function start({ python, script, modelDir }) {
  if (ready) return ready;
  if (!python) return Promise.reject(new Error(t('err.sttNoPython')));
  if (!fs.existsSync(modelDir)) return Promise.reject(new Error(t('err.sttNoModel')));
  child = spawn(python, [script, modelDir], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, env: pythonEnv(python) });
  child.on('exit', () => { child = null; ready = null; });
  child.on('error', () => { child = null; ready = null; });
  lines = readline.createInterface({ input: child.stdout });
  ready = nextLine();
  return ready;
}

async function recognize(audio, paths) {
  await start(paths);
  const file = path.join(os.tmpdir(), `dsc-voice-${Date.now()}.webm`);
  fs.writeFileSync(file, Buffer.from(audio));
  try {
    child.stdin.write(`${file}\n`);
    const result = await nextLine();
    if (result.error) throw new Error(t('err.sttFailed', { error: result.error }));
    return result.text;
  } finally {
    fs.rmSync(file, { force: true });
  }
}

// One at a time: the worker answers in order.
function transcribe(audio, paths) {
  const job = queue.then(() => idle.during(() => recognize(audio, paths)));
  queue = job.catch(() => {});
  return job;
}

// Loads the model while the user is still speaking.
function warm(paths) {
  return idle.during(() => start(paths));
}

function stop() {
  idle.cancel();
  child?.kill();
  child = null;
  ready = null;
}

module.exports = { transcribe, warm, stop, setIdle: idle.setMinutes };
