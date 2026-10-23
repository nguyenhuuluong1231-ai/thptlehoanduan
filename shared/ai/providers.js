// Kết nối mô hình ngôn ngữ (LLM) phía máy chủ. Chỉ cần điền khóa API trong tệp .env:
//
//   ANTHROPIC_API_KEY=sk-ant-...            → Claude (mặc định claude-haiku-5-5)
//   OPENAI_API_KEY=sk-...                   → OpenAI (mặc định gpt-4o-mini)
//   GEMINI_API_KEY=AIza...                  → Google Gemini (mặc định gemini-2.5-flash)
//   MIRAI_API_KEY=sk-...                    → MiraiAPI (https://api.miraiapi.com/v1, mặc định claude-opus-4.8)
//
// Hoặc khai báo tường minh một dịch vụ tương thích OpenAI (Groq, OpenRouter, DeepSeek, Ollama, LM Studio…):
//   AI_PROVIDER=openai  AI_BASE_URL=https://api.groq.com/openai/v1  AI_API_KEY=...  AI_MODEL=llama-3.3-70b-versatile
//   AI_PROVIDER=openai  AI_BASE_URL=http://localhost:11434/v1  AI_MODEL=qwen2.5:7b      (Ollama chạy trên máy, không cần khóa)
// Tắt hẳn AI: AI_PROVIDER=off

const DEFAULTS = {
  anthropic: { base: 'https://api.anthropic.com/v1', model: 'claude-haiku-5-5', name: 'Claude' },
  openai: { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', name: 'OpenAI' },
  gemini: { base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', name: 'Gemini' },
  mirai: { base: 'https://api.miraiapi.com/v1', model: 'claude-opus-4.8', name: 'MiraiAPI' }, // cổng API tương thích OpenAI
};

function pickProvider(env) {
  const p = String(env.AI_PROVIDER || '').trim().toLowerCase();
  if (['off', 'none', 'false', '0'].includes(p)) return null;
  if (p) return p === 'claude' ? 'anthropic' : p === 'google' ? 'gemini' : p;
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.OPENAI_API_KEY) return 'openai';
  if (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) return 'gemini';
  if (env.MIRAI_API_KEY) return 'mirai';
  if (env.AI_BASE_URL) return 'openai';
  return null;
}

// fetch có thông báo lỗi mạng dễ hiểu (sai địa chỉ, mất mạng, hết thời gian chờ…)
async function post(url, opts) {
  try { return await fetch(url, opts); } catch (e) {
    const code = e?.cause?.code || e?.name || '';
    const why = code === 'TimeoutError' || code === 'UND_ERR_CONNECT_TIMEOUT' ? 'hết thời gian chờ (AI phản hồi quá chậm hoặc mạng yếu)' : code === 'ENOTFOUND' ? 'không tìm thấy tên miền (kiểm tra Base URL hoặc kết nối Internet)' : code === 'ECONNREFUSED' ? 'máy chủ AI từ chối kết nối' : /CERT|SSL|TLS/.test(code) ? 'lỗi chứng chỉ HTTPS' : code || e?.message;
    throw new Error(`Không kết nối được tới ${new URL(url).host}: ${why}`);
  }
}

async function readError(res) {
  let detail = '';
  try { const j = await res.json(); detail = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 200); } catch { /* bỏ qua */ }
  const hint = res.status === 401 || res.status === 403 ? ' (khóa API sai hoặc chưa được cấp quyền)' : res.status === 404 ? ' (tên mô hình AI_MODEL hoặc AI_BASE_URL không đúng)' : res.status === 429 ? ' (vượt hạn mức sử dụng, thử lại sau)' : '';
  return new Error(`AI ${res.status}${hint}${detail ? ': ' + detail : ''}`);
}

/**
 * Tạo hàm llm({ system, messages, maxTokens, temperature }) → Promise<string>, hoặc null nếu chưa cấu hình.
 * @param {Record<string,string|undefined>} env
 */
export function createLlm(env = {}) {
  const provider = pickProvider(env);
  if (!provider) return null;
  const isAnthropic = provider === 'anthropic';
  const def = DEFAULTS[provider] || DEFAULTS.openai;
  const key = env.AI_API_KEY || (isAnthropic ? env.ANTHROPIC_API_KEY : provider === 'gemini' ? (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) : provider === 'mirai' ? env.MIRAI_API_KEY : env.OPENAI_API_KEY) || '';
  const base = String(env.AI_BASE_URL || def.base).replace(/\/+$/, '');
  const model = env.AI_MODEL || def.model;
  const timeout = Number(env.AI_TIMEOUT_MS) || 60000; // mô hình lớn (Opus…) qua cổng trung gian có thể trả lời chậm
  const isLocal = /\/\/(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.)/.test(base);
  if (!key && !isLocal) return null; // dịch vụ đám mây bắt buộc có khóa

  let fn;
  if (isAnthropic) {
    fn = async ({ system, messages, maxTokens = 900, temperature = 0.5 }) => {
      const res = await post(`${base}/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature, system, messages }),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw await readError(res);
      const j = await res.json();
      return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    };
  } else {
    fn = async ({ system, messages, maxTokens = 900, temperature = 0.5 }) => {
      const res = await post(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature, messages: [{ role: 'system', content: system }, ...messages] }),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw await readError(res);
      const j = await res.json();
      const c = j.choices?.[0]?.message?.content;
      return (Array.isArray(c) ? c.map(x => x.text || '').join('') : String(c || '')).trim();
    };
  }
  const custom = env.AI_BASE_URL && base !== def.base;
  const hostName = /miraiapi/.test(base) ? 'MiraiAPI' : /groq/.test(base) ? 'Groq' : /openrouter/.test(base) ? 'OpenRouter' : /deepseek/.test(base) ? 'DeepSeek' : /:11434/.test(base) ? 'Ollama' : /:1234/.test(base) ? 'LM Studio' : isLocal ? 'Máy chủ AI nội bộ' : 'Máy chủ AI';
  const name = custom && !isAnthropic ? hostName : DEFAULTS[provider]?.name || hostName;
  return Object.assign(fn, { provider, model, label: `${name} · ${model}` });
}
