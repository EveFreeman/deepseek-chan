// Pure cost helpers (no Electron imports, so they can be unit tested).

function inPeak(peak, date) {
  if (!peak || !peak.utcRanges) return false;
  const day = date.getUTCDay();
  if (peak.weekdaysOnly && (day === 0 || day === 6)) return false;
  const hour = date.getUTCHours();
  return peak.utcRanges.split(',').some((range) => {
    const [from, to] = range.split('-').map(Number);
    return hour >= from && hour < to;
  });
}

// Prices are USD per 1M tokens. `peak.multiplier` applies during peak windows.
function chatCost(pricing, { cacheHit, cacheMiss, output }, date = new Date()) {
  if (!pricing) return 0;
  const multiplier = inPeak(pricing.peak, date) ? pricing.peak.multiplier || 1 : 1;
  const raw = (cacheHit * (pricing.cached || 0) + cacheMiss * (pricing.input || 0) + output * (pricing.output || 0)) / 1e6;
  return raw * multiplier;
}

function normalizeUsage(u) {
  const prompt = u.prompt_tokens ?? 0;
  const cacheHit = u.prompt_cache_hit_tokens ?? u.prompt_tokens_details?.cached_tokens ?? 0;
  return {
    cacheHit,
    cacheMiss: u.prompt_cache_miss_tokens ?? Math.max(prompt - cacheHit, 0),
    output: u.completion_tokens ?? 0,
    reasoning: u.completion_tokens_details?.reasoning_tokens ?? 0,
  };
}

// Fallback for servers that do not report usage. CJK text runs near one token
// per character, Latin text near four characters per token.
function estimateTokens(text) {
  let ascii = 0;
  let wide = 0;
  for (const ch of text) (ch.codePointAt(0) < 128 ? ascii++ : wide++);
  return Math.ceil(ascii / 4 + wide);
}

module.exports = { inPeak, chatCost, normalizeUsage, estimateTokens };
