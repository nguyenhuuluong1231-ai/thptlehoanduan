// Kiểm tra kết nối AI thật ngay trên máy của bạn (không cần mở web).
//   node scripts/test-ai.js                      → dùng cấu hình AI đã lưu trên web (data/db.json) hoặc tệp .env
//   node scripts/test-ai.js sk-xxxx              → thử MiraiAPI với khóa này
//   node scripts/test-ai.js sk-xxxx claude-opus-4.8 https://api.miraiapi.com/v1
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLlm } from '../shared/ai/providers.js';
import { scamCheckWithAi } from '../shared/ai/llm.js';
import { scanMessage } from '../shared/ai/scam.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) { const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(line); if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); }

const [key, model, base] = process.argv.slice(2);
let llm, source;
if (key) { llm = createLlm({ AI_PROVIDER: 'mirai', AI_API_KEY: key, AI_MODEL: model || '', AI_BASE_URL: base || '' }); source = 'khóa nhập trên dòng lệnh'; }
else {
  const dbFile = path.join(ROOT, env.DATA_DIR || 'data', 'db.json');
  const c = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')).aiConfig : null;
  if (c?.provider && c.provider !== 'off') { llm = createLlm({ AI_PROVIDER: c.provider === 'custom' ? 'openai' : c.provider, AI_API_KEY: c.apiKey || '', AI_MODEL: c.model || '', AI_BASE_URL: c.baseUrl || '' }); source = 'cấu hình đã lưu trên web'; }
  else { llm = createLlm(env); source = 'tệp .env'; }
}
if (!llm) { console.log('\n✗ Chưa có cấu hình AI. Chạy: node scripts/test-ai.js <khóa API MiraiAPI>\n'); process.exit(1); }

const mask = (s) => (s ? '••••' + String(s).slice(-4) : '');
console.log(`\nĐang thử: ${llm.label}  (nguồn: ${source}${key ? ', khóa ' + mask(key) : ''})\n`);

let ok = true;
try {
  const t0 = Date.now();
  const text = await llm({ system: 'Bạn là trợ lý kiểm tra kết nối. Trả lời đúng một câu tiếng Việt thật ngắn.', messages: [{ role: 'user', content: 'Chào bạn, hãy xác nhận bạn đang hoạt động.' }], maxTokens: 80, temperature: 0 });
  console.log(`✓ 1/2 Trò chuyện: ${Date.now() - t0} ms`);
  console.log(`  “${String(text).trim().slice(0, 200)}”\n`);
} catch (e) { ok = false; console.log(`✗ 1/2 Trò chuyện lỗi: ${e.message}\n`); }

if (ok) {
  try {
    const input = 'Chúc mừng bạn trúng thưởng xe SH! Chuyển khoản 2.000.000đ phí nhận quà và gửi mã OTP trong 24h.';
    const t0 = Date.now();
    const r = await scamCheckWithAi(llm, { kind: 'message', input, rule: scanMessage(input) });
    console.log(`✓ 2/2 Phân tích lừa đảo: ${Date.now() - t0} ms · ${r.label} (${r.score}/100) · ${r.ai?.scamType || ''}`);
    if (r.ai?.summary) console.log(`  ${r.ai.summary}`);
  } catch (e) { ok = false; console.log(`✗ 2/2 Phân tích lừa đảo lỗi: ${e.message}`); }
}
console.log(ok ? '\nKết nối AI hoạt động tốt. Vào Cổng Giáo Viên → AI Guard → Kết nối AI để lưu (nếu chưa lưu).\n' : '\nKiểm tra lại khóa API, tên mô hình và kết nối Internet. Gửi nội dung lỗi ở trên (không gửi khóa) để được hỗ trợ.\n');
process.exit(ok ? 0 : 1);
