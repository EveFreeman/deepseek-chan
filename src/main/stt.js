// Runs scripts/python/stt_worker.py in the GPT-SoVITS environment, which has faster-whisper.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { pythonEnv } = require('./gptsovits');
const { idleStopper } = require('./idle');

const TIMEOUT = 60000;

let child = null;
let lines = null;
let ready = null;
let queue = Promise.resolve();
const idle = idleStopper(() => stop());

function nextLine() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('음성 인식이 응답하지 않습니다.')), TIMEOUT * 2);
    lines.once('line', (line) => {
      clearTimeout(timer);
      resolve(JSON.parse(line));
    });
  });
}

function start({ python, script, modelDir }) {
  if (ready) return ready;
  if (!python) return Promise.reject(new Error('음성 입력에는 GPT-SoVITS의 Python 환경이 필요합니다. 설치 스크립트(setup)를 실행해 주세요.'));
  if (!fs.existsSync(modelDir)) return Promise.reject(new Error('음성 인식 모델(runtime/whisper)을 찾지 못했습니다. 설치 스크립트(setup)를 다시 실행해 주세요.'));
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
    if (result.error) throw new Error(`음성 인식 실패: ${result.error}`);
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
