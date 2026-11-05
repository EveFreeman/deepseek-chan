// Client for a local GPT-SoVITS api_v2 server. The server is started on demand and
// stopped with the app or after an idle spell; a server that is already running is reused.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { idleStopper } = require('./idle');

const HOST = '127.0.0.1';
const PORT = 9880;
const BASE = `http://${HOST}:${PORT}`;
const START_TIMEOUT = 180000;
const CONFIG_FILE = 'GPT_SoVITS/configs/tts_infer.yaml';
const WAV_HEADER = 44;
const PEAK_TARGET = 0.9;
const MAX_GAIN = 6;

let child = null;
let starting = null;
let queue = Promise.resolve();
let log = '';
const idle = idleStopper(() => stop());

async function alive() {
  try {
    await fetch(`${BASE}/docs`, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

async function waitUntilUp() {
  const deadline = Date.now() + START_TIMEOUT;
  while (Date.now() < deadline) {
    if (await alive()) return;
    if (!child) throw new Error(`GPT-SoVITS 서버가 종료되었습니다: ${log.slice(-300)}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('GPT-SoVITS 서버가 제시간에 시작되지 않았습니다.');
}

// Only Macs use the GPU. On Windows CUDA was no faster than the CPU for these short
// sentences, reserved most of the VRAM in bursts, and laptops power the GPU down on
// battery. 'cpu' on a Mac is the user's choice.
function detectDevice(choice, platform = process.platform) {
  return platform === 'darwin' && choice !== 'cpu' ? 'mps' : 'cpu';
}

// PyTorch takes every logical core by default. On a 16-core Intel laptop (performance and
// efficiency cores mixed) 8 threads synthesized 10-20% faster than 16, and 4 slower.
function cpuThreads(cores) {
  const n = String(Math.max(1, Math.min(8, Math.floor(cores / 2))));
  return { OMP_NUM_THREADS: n, MKL_NUM_THREADS: n };
}

// The server only reads its device from this file's `custom` section.
function setDevice(dir, device) {
  const file = path.join(dir, CONFIG_FILE);
  const text = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, text.replace(/^(custom:[\s\S]*?\n  device: ).*$/m, `$1${device}`));
}

// The environment's own tools (ffmpeg among them) come first on PATH.
function pythonEnv(python) {
  const prefix = path.dirname(python);
  const dirs = process.platform === 'win32'
    ? [prefix, path.join(prefix, 'Library', 'bin'), path.join(prefix, 'Scripts')]
    : [prefix];
  return { ...process.env, PATH: [...dirs, process.env.PATH].join(path.delimiter), PYTHONUTF8: '1' };
}

function launch({ dir, python, device: choice }) {
  if (!dir || !fs.existsSync(path.join(dir, 'api_v2.py'))) throw new Error('GPT-SoVITS 폴더를 찾지 못했습니다. 설정 > 음성에서 지정해 주세요.');
  if (!python || !fs.existsSync(python)) throw new Error('GPT-SoVITS가 설치되지 않았습니다. 설치 스크립트(setup)를 실행해 주세요.');
  const device = detectDevice(choice);
  setDevice(dir, device);
  // Hiding CUDA keeps PyTorch from waking a powered-down GPU just to probe it.
  const env = device === 'cpu' ? { ...pythonEnv(python), CUDA_VISIBLE_DEVICES: '-1', ...cpuThreads(os.cpus().length) } : pythonEnv(python);
  log = '';
  child = spawn(python, ['api_v2.py', '-a', HOST, '-p', String(PORT), '-c', CONFIG_FILE], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env });
  const collect = (data) => { log = (log + data).slice(-2000); };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('error', (err) => { log += err.message; child = null; });
  child.on('exit', () => { child = null; });
}

function ensureServer(config) {
  starting ??= idle.during(async () => {
    try {
      if (await alive()) return;
      if (!child) launch(config);
      await waitUntilUp();
    } finally {
      starting = null;
    }
  });
  return starting;
}

// Starts the server ahead of a reply (the user is typing or talking), so that the first
// sentence does not wait for the models to load.
function warm(config) {
  if (child && !starting) {
    idle.touch();
    return Promise.resolve();
  }
  return ensureServer(config);
}

async function request(text, lang, config) {
  if (!config.refAudio || !fs.existsSync(config.refAudio)) throw new Error('참조 음성이 없습니다. voice 폴더에 つくよみちゃんコーパス를 넣어 주세요 (README 참고).');
  await ensureServer(config);
  const res = await fetch(`${BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      text_lang: lang,
      ref_audio_path: config.refAudio,
      prompt_text: config.refText,
      prompt_lang: config.refLang,
      text_split_method: 'cut0',
      batch_size: 1,
      media_type: 'wav',
      streaming_mode: false,
      speed_factor: config.speed,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`GPT-SoVITS 오류 ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { audio: normalize(Buffer.from(await res.arrayBuffer())), mime: 'audio/wav' };
}

// The whispery reference voice comes out quiet; bring 16-bit PCM to a set peak.
function normalize(wav) {
  const samples = new Int16Array(wav.buffer, wav.byteOffset + WAV_HEADER, (wav.length - WAV_HEADER) >> 1);
  const peak = samples.reduce((max, s) => Math.max(max, Math.abs(s)), 0);
  if (!peak) return wav;
  const gain = Math.min((PEAK_TARGET * 32767) / peak, MAX_GAIN);
  const out = Buffer.from(wav);
  for (let i = 0; i < samples.length; i++) out.writeInt16LE(Math.round(samples[i] * gain), WAV_HEADER + i * 2);
  return out;
}

// The server handles one synthesis at a time, so sentences wait their turn.
function speak(text, lang, config) {
  const job = queue.then(() => idle.during(() => request(text, lang, config)));
  queue = job.catch(() => {});
  return job;
}

function stop() {
  idle.cancel();
  child?.kill();
  child = null;
}

module.exports = { speak, ensureServer, warm, stop, setIdle: idle.setMinutes, pythonEnv, detectDevice, cpuThreads };
