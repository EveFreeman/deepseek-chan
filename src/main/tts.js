const { endpoint, headers } = require('./llm');

async function openaiCompatible(text, openai, apiKey) {
  const res = await fetch(endpoint(openai.baseUrl, '/audio/speech'), {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ model: openai.model, voice: openai.voice, input: text, response_format: 'mp3' }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`TTS 오류 ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { audio: Buffer.from(await res.arrayBuffer()), mime: 'audio/mpeg' };
}

// GPT-SoVITS needs the language up front, for replies and for the reference text alike.
// Japanese is told apart from Chinese by its kana.
function detectLang(text) {
  if (/[\uAC00-\uD7A3]/.test(text)) return 'ko';
  if (/[\u3040-\u30FF]/.test(text)) return 'ja';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  return 'en';
}

module.exports = { openaiCompatible, detectLang };
