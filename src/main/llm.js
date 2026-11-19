const { normalizeUsage } = require('./pricing');
const { t } = require('../shared/i18n');

const endpoint = (baseUrl, route) => `${baseUrl.replace(/\/+$/, '')}${route}`;

function headers(apiKey) {
  const h = { 'Content-Type': 'application/json' };
  if (apiKey) h.Authorization = `Bearer ${apiKey}`;
  return h;
}

function parseExtra(extra) {
  if (!extra || !extra.trim()) return {};
  try {
    return JSON.parse(extra);
  } catch {
    throw new Error(t('err.badExtra'));
  }
}

async function errorMessage(res) {
  const text = await res.text().catch(() => '');
  let detail = text.slice(0, 300);
  try { detail = JSON.parse(text).error?.message ?? detail; } catch { /* plain text body */ }
  return t('err.api', { status: res.status, detail });
}

// Streams an OpenAI-compatible chat completion. Resolves to { text, usage,
// reasoning, toolCalls, toolsRejected }. usage is null if the server never
// reported any; toolsRejected means the model cannot use tools at all.
async function streamChat({ profile, apiKey, messages, tools, toolChoice, signal, onDelta }) {
  const body = {
    model: profile.model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    ...parseExtra(profile.extra),
  };
  if (tools) body.tools = tools;
  if (tools && toolChoice) body.tool_choice = toolChoice;
  const url = endpoint(profile.baseUrl, '/chat/completions');
  let res = await fetch(url, { method: 'POST', headers: headers(apiKey), body: JSON.stringify(body), signal });
  let toolsRejected = false;
  if (res.status === 400 || res.status === 422) {
    // Some compatible servers reject stream_options or tools outright.
    const message = await errorMessage(res);
    if (/stream_options/i.test(message)) delete body.stream_options;
    else if (body.tool_choice && /tool_choice|thinking/i.test(message)) delete body.tool_choice; // refused in thinking mode
    else if (body.reasoning_effort && /reasoning/i.test(message)) delete body.reasoning_effort; // other providers
    else if (tools && /tool|function/i.test(message)) {
      delete body.tools;
      toolsRejected = true;
    } else throw new Error(message);
    res = await fetch(url, { method: 'POST', headers: headers(apiKey), body: JSON.stringify(body), signal });
  }
  if (!res.ok) throw new Error(await errorMessage(res));

  let text = '';
  let reasoning = '';
  let usage = null;
  const calls = [];
  let buffer = '';
  const decoder = new TextDecoder();

  const handleLine = (line) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return;
    let chunk;
    try { chunk = JSON.parse(data); } catch { return; }
    if (chunk.error) throw new Error(chunk.error.message || t('err.stream'));
    if (chunk.usage) usage = normalizeUsage(chunk.usage);
    const delta = chunk.choices?.[0]?.delta;
    if (delta?.reasoning_content) reasoning += delta.reasoning_content;
    if (delta?.content) {
      text += delta.content;
      onDelta(delta.content);
    }
    // Tool calls arrive in pieces, keyed by index.
    for (const part of delta?.tool_calls ?? []) {
      const call = (calls[part.index ?? 0] ??= { id: '', name: '', arguments: '' });
      if (part.id) call.id = part.id;
      if (part.function?.name) call.name += part.function.name;
      if (part.function?.arguments) call.arguments += part.function.arguments;
    }
  };

  for await (const part of res.body) {
    buffer += decoder.decode(part, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    lines.forEach((line) => handleLine(line.trim()));
  }
  handleLine(buffer.trim());
  return { text, usage, reasoning, toolCalls: calls.filter(Boolean), toolsRejected };
}

async function listModels(profile, apiKey) {
  const res = await fetch(endpoint(profile.baseUrl, '/models'), {
    headers: headers(apiKey),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  const json = await res.json();
  return (json.data ?? []).map((m) => m.id).sort();
}

module.exports = { streamChat, listModels, endpoint, headers };
