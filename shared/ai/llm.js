// Lớp tích hợp mô hình ngôn ngữ (LLM) dùng chung cho máy chủ Node.js và bản xem trước trong trình duyệt.
//
// Giao diện thống nhất của một "llm":
//   await llm({ system, messages: [{ role: 'user' | 'assistant', content }], maxTokens, temperature, purpose })  → chuỗi văn bản
//   llm.provider, llm.model  → để hiển thị trạng thái
// Máy chủ tạo llm trong shared/ai/providers.js (Anthropic, OpenAI, Gemini, Groq, OpenRouter, Ollama…).

import { scanMessage, scanUrl, level } from './scam.js';

const clip = (s = '', n = 3000) => (s.length > n ? s.slice(0, n) + '…' : s);

// ---------------------------------------------------------------------------
// Trợ lý Học đường AI
// ---------------------------------------------------------------------------
export function assistantSystem({ school = {}, user = {} } = {}) {
  const first = (user.name || '').trim().split(/\s+/).pop() || 'bạn';
  return `Bạn là «Trợ lý Học đường AI» của ${school.schoolName || 'Trường THPT Lê Hoàn'}${school.location ? ` (${school.location})` : ''}. Bạn đang trò chuyện với học sinh tên ${first}${user.className ? `, lớp ${user.className}` : ''}.

Cách trả lời:
- Luôn dùng tiếng Việt, thân thiện, xưng "mình" và gọi "bạn". Ngắn gọn, đi thẳng vào ý (thường dưới 220 từ), chỉ dài hơn khi cần giải bài từng bước.
- Định dạng Markdown đơn giản: **in đậm**, danh sách gạch đầu dòng hoặc đánh số, khối \`\`\`code\`\`\` khi viết mã. Không dùng bảng, không dùng tiêu đề #.
- Bài tập: hướng dẫn cách nghĩ và các bước giải, giải thích vì sao, rồi mới đưa đáp án. Không hỗ trợ gian lận trong giờ kiểm tra, thi cử.
- Không bịa thông tin về nhà trường, lịch, điểm số hay quy định cụ thể. Nếu không chắc, nói rõ và gợi ý hỏi giáo viên.

Phân tích lừa đảo:
- Khi học sinh dán tin nhắn, đường link, số điện thoại, số tài khoản hoặc kể một tình huống đáng ngờ, hãy kết luận mức độ rủi ro (An toàn / Cảnh báo / Nguy hiểm), chỉ ra các dấu hiệu cụ thể trong nội dung, nêu thủ đoạn thường gặp và 3 việc cần làm ngay.
- Nguyên tắc vàng: không chuyển tiền, không bấm link lạ, không cung cấp mã OTP hay mật khẩu, xác minh qua kênh chính thức và báo người lớn. Gợi ý dùng mục "Tra cứu lừa đảo AI" để kiểm tra chi tiết.

An toàn của học sinh là ưu tiên số một:
- Nếu học sinh có dấu hiệu buồn bã kéo dài, muốn tự làm hại bản thân, bị bạo lực hoặc bị đe dọa: thể hiện sự đồng cảm, không phán xét; khuyến khích liên hệ ngay người lớn tin cậy, chuyên viên tâm lý của trường, Tổng đài 111 (bảo vệ trẻ em, miễn phí 24/7), 113 (công an) hoặc 115 (cấp cứu).
- Từ chối nhẹ nhàng nội dung nguy hiểm, bạo lực, người lớn, chất cấm, cờ bạc hay vi phạm pháp luật.

Ứng dụng có các mục bạn có thể gợi ý: Tố giác vi phạm (ẩn danh, chụp ảnh), Tư vấn tâm lý (nhắn riêng chuyên viên, có thể ẩn danh), Chat với giáo viên, Cảm xúc & thư giãn, Cẩm nang & đường dây nóng, Tra cứu lừa đảo AI, Đấu trường trắc nghiệm pháp luật.`;
}

/** Gọi LLM cho một lượt hội thoại; trả về văn bản hoặc ném lỗi. */
export async function assistantLlmReply(llm, { message, history = [], school, user }) {
  const turns = history.slice(-10).filter(m => m.text).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: clip(m.text, 2000) }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  const text = await llm({ system: assistantSystem({ school, user }), messages: [...turns, { role: 'user', content: clip(message, 3000) }], maxTokens: 1000, temperature: 0.5, purpose: 'chat' });
  const out = String(text || '').trim();
  if (!out) throw new Error('LLM trả về rỗng');
  return out;
}

// ---------------------------------------------------------------------------
// Phân tích lừa đảo bằng AI (kết hợp với bộ luật chấm điểm sẵn có)
// ---------------------------------------------------------------------------
const KIND_LABEL = { message: 'tin nhắn', url: 'đường link', phone: 'số điện thoại', account: 'số tài khoản ngân hàng' };

export const SCAM_SYSTEM = `Bạn là chuyên gia an ninh mạng và phòng chống lừa đảo trực tuyến tại Việt Nam, giúp học sinh THPT nhận diện lừa đảo.
Bạn hiểu rõ các thủ đoạn phổ biến: mạo danh công an/tòa án/ngân hàng/nhà trường/người thân, trúng thưởng, việc nhẹ lương cao, làm nhiệm vụ nạp tiền, tình cảm qua mạng, vay tiền qua app, tống tiền bằng ảnh, phishing đánh cắp tài khoản, cờ bạc trực tuyến, bán hàng giả, đầu tư tiền ảo.
Đánh giá khách quan: nội dung bình thường thì kết luận an toàn, không phóng đại. Chỉ dựa vào nội dung được cung cấp và kết quả kiểm tra của hệ thống; không khẳng định những gì bạn không thể kiểm chứng.
Chỉ trả lời bằng MỘT đối tượng JSON hợp lệ, không thêm chữ nào khác.`;

export function scamPrompt(kind, input, rule) {
  const sys = rule ? `\nKết quả bộ luật của hệ thống: điểm ${rule.score}/100 (${rule.label}).${rule.findings?.length ? ' Dấu hiệu: ' + rule.findings.filter(f => f.weight > 0).map(f => f.label).join('; ') + '.' : ''}${rule.host ? ` Tên miền: ${rule.host}.` : ''}${rule.official ? ' Đây là tên miền chính thức đã xác minh.' : ''}` : '';
  return `Hãy phân tích ${KIND_LABEL[kind] || 'nội dung'} sau mà một học sinh nhận được:
"""
${clip(input, 3500)}
"""${sys}

Trả về JSON đúng cấu trúc:
{"risk": số nguyên 0-100, "verdict": "safe" | "warning" | "danger", "scamType": "tên thủ đoạn ngắn gọn, hoặc 'Không phát hiện'", "summary": "1-2 câu kết luận dễ hiểu cho học sinh", "redFlags": [{"label": "dấu hiệu ngắn", "detail": "giải thích, trích chi tiết trong nội dung"}], "advice": ["việc nên làm ngay", "..."], "reply": "gợi ý cách phản hồi an toàn (một câu) hoặc chuỗi rỗng"}
Quy ước: risk ≥ 60 là "danger", 25-59 là "warning", dưới 25 là "safe". redFlags tối đa 5 mục (mảng rỗng nếu an toàn). advice 3-4 mục, viết ngắn, cụ thể.`;
}

/** Đọc JSON “dễ tính”: cả chuỗi, khối ```json```, hoặc đoạn từ { đầu tiên đến } cuối cùng. */
export function parseJsonLoose(text) {
  const s = String(text || '').trim();
  const tries = [s, s.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1], s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)];
  for (const t of tries) { if (!t) continue; try { return JSON.parse(t); } catch { /* thử cách tiếp theo */ } }
  return null;
}

const toStr = (v, n = 400) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function normalizeScamAi(j) {
  if (!j || typeof j !== 'object') return null;
  let risk = Math.round(Number(j.risk));
  if (!Number.isFinite(risk)) risk = j.verdict === 'danger' ? 80 : j.verdict === 'warning' ? 45 : 10;
  risk = Math.max(0, Math.min(100, risk));
  return {
    risk,
    verdict: ['safe', 'warning', 'danger'].includes(j.verdict) ? j.verdict : level(risk).level,
    scamType: toStr(j.scamType, 80) || 'Không xác định',
    summary: toStr(j.summary, 500),
    redFlags: (Array.isArray(j.redFlags) ? j.redFlags : []).slice(0, 5).map(f => ({ label: toStr(f?.label, 90), detail: toStr(f?.detail, 300) })).filter(f => f.label),
    advice: (Array.isArray(j.advice) ? j.advice : []).slice(0, 5).map(a => toStr(a, 200)).filter(Boolean),
    reply: toStr(j.reply, 300),
  };
}

/**
 * Kết hợp bộ luật + AI. Với số điện thoại / số tài khoản, AI không tra cứu được dữ liệu ngoài
 * nên chỉ dùng bộ luật và danh sách đen (tránh “đoán mò”).
 */
export async function scamCheckWithAi(llm, { kind, input, rule }) {
  if (!llm || !['message', 'url'].includes(kind)) return { ...rule, engine: 'rules' };
  const text = await llm({ system: SCAM_SYSTEM, messages: [{ role: 'user', content: scamPrompt(kind, input, rule) }], maxTokens: 900, temperature: 0.2, purpose: 'scam', json: true });
  const ai = normalizeScamAi(parseJsonLoose(text));
  if (!ai) throw new Error('AI trả về dữ liệu không đọc được');
  // Tên miền chính thức đã xác minh: không để AI nâng mức rủi ro vô căn cứ.
  const score = rule.official ? Math.min(rule.score + Math.round(ai.risk * 0.2), 24) : Math.max(rule.score, ai.risk);
  const lv = level(score);
  return { ...rule, score, ...lv, engine: 'ai+rules', ai: { ...ai, provider: llm.provider || '', model: llm.label || llm.model || '' } };
}

/** Nhận diện nhanh nội dung có vẻ là tin nhắn / link lừa đảo trong khung chat với AI. */
export function quickScamScan(message) {
  const urls = message.match(/https?:\/\/[^\s]+/gi) || [];
  const m = scanMessage(message);
  const u = urls[0] ? scanUrl(urls[0]) : null;
  const best = u && u.score > m.score ? u : m;
  return best.score >= 25 ? { score: best.score, level: best.level, label: best.label, kind: best.kind, input: best.kind === 'url' ? urls[0] : message.slice(0, 1500) } : null;
}
