// Connection presets. Prices are USD per 1M tokens and only pre-fill the form;
// check the provider's pricing page, since they change.
const DEEPSEEK_PEAK = { multiplier: 2, utcRanges: '01-04,06-10', weekdaysOnly: true };

const PRESETS = [
  {
    id: 'deepseek-flash',
    label: 'DeepSeek · Flash',
    name: 'DeepSeek Flash',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-flash',
    extra: '{"thinking":{"type":"disabled"}}',
    pricing: { input: 0.15, cached: 0.003, output: 0.6, peak: DEEPSEEK_PEAK },
    pricingUrl: 'https://api-docs.deepseek.com/quick_start/pricing',
  },
  {
    id: 'deepseek-pro',
    label: 'DeepSeek · V4 Pro',
    name: 'DeepSeek V4 Pro',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro',
    extra: '{"thinking":{"type":"disabled"}}',
    pricing: { input: 0.66, cached: 0.022, output: 1.98, peak: DEEPSEEK_PEAK },
    pricingUrl: 'https://api-docs.deepseek.com/quick_start/pricing',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: '',
    extra: '',
    pricing: { input: 0, cached: 0, output: 0, peak: null },
    pricingUrl: 'https://openai.com/api/pricing/',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: '',
    extra: '',
    pricing: { input: 0, cached: 0, output: 0, peak: null },
    pricingUrl: 'https://openrouter.ai/models',
  },
  {
    id: 'ollama',
    label: 'Ollama (로컬)',
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: '',
    extra: '',
    pricing: { input: 0, cached: 0, output: 0, peak: null },
    pricingUrl: '',
  },
  {
    id: 'lmstudio',
    label: 'LM Studio (로컬)',
    name: 'LM Studio',
    baseUrl: 'http://localhost:1234/v1',
    model: '',
    extra: '',
    pricing: { input: 0, cached: 0, output: 0, peak: null },
    pricingUrl: '',
  },
];

if (typeof module !== 'undefined') module.exports = { PRESETS };
else window.PRESETS = PRESETS;
