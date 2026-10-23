// Trợ lý Học đường AI 24/7.
// - Khi đã cấu hình mô hình ngôn ngữ (LLM): mọi câu hỏi do AI trả lời, có ngữ cảnh hội thoại; ứng dụng gắn thêm nút chức năng phù hợp.
// - Tình huống khủng hoảng / bạo lực (AI Guard phát hiện): luôn dùng câu trả lời an toàn soạn sẵn kèm đường dây nóng.
// - Chưa có LLM hoặc LLM lỗi: dùng bộ trả lời theo ý định (intent) tích hợp sẵn.
import { strip } from './guard.js';
import { scanMessage } from './scam.js';
import { assistantLlmReply, quickScamScan } from './llm.js';

const has = (t, ...words) => words.some(w => t.includes(w));

const KNOWLEDGE = [
  { keys: ['dao ham'], title: 'Đạo hàm — công thức cần nhớ', body: `**Công thức cơ bản**\n- (xⁿ)′ = n·xⁿ⁻¹\n- (sin x)′ = cos x · (cos x)′ = −sin x\n- (eˣ)′ = eˣ · (ln x)′ = 1/x\n\n**Quy tắc tính**\n- (u·v)′ = u′v + uv′\n- (u/v)′ = (u′v − uv′)/v²\n- Hàm hợp: [f(g(x))]′ = f′(g(x))·g′(x)\n\nMẹo: khi gặp hàm hợp, đặt u = phần bên trong rồi nhân thêm u′ ở cuối.` },
  { keys: ['tich phan', 'nguyen ham'], title: 'Nguyên hàm & tích phân', body: `**Nguyên hàm cơ bản**\n- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)\n- ∫1/x dx = ln|x| + C\n- ∫eˣ dx = eˣ + C\n- ∫sin x dx = −cos x + C · ∫cos x dx = sin x + C\n\n**Công thức Newton – Leibniz**: ∫ₐᵇ f(x)dx = F(b) − F(a), với F là một nguyên hàm của f.` },
  { keys: ['luong giac', 'sin x', 'cos x', 'sin2x', 'cos2x'], title: 'Công thức lượng giác', body: `- sin²x + cos²x = 1\n- sin 2x = 2 sin x cos x\n- cos 2x = cos²x − sin²x = 2cos²x − 1 = 1 − 2sin²x\n- tan x = sin x / cos x (cos x ≠ 0)\n\nMẹo nhớ giá trị đặc biệt: sin 0°, 30°, 45°, 60°, 90° lần lượt là √0/2, √1/2, √2/2, √3/2, √4/2.` },
  { keys: ['nghi luan xa hoi', 'nghi luan', 'viet doan van', '200 chu'], title: 'Dàn ý nghị luận xã hội', body: `**Mở đoạn/mở bài**: dẫn dắt và nêu vấn đề cần bàn.\n\n**Thân bài**\n1. Giải thích từ khóa, vấn đề là gì.\n2. Phân tích, chứng minh: vì sao? biểu hiện? kèm 1–2 dẫn chứng thực tế, tiêu biểu.\n3. Bàn luận mở rộng: phê phán biểu hiện trái chiều.\n4. Bài học nhận thức và hành động của bản thân.\n\n**Kết**: khẳng định lại ý nghĩa vấn đề.\n\nVới đoạn văn khoảng 200 chữ, mỗi phần chỉ cần 1–3 câu súc tích.` },
  { keys: ['hien tai hoan thanh', 'present perfect'], title: 'Thì hiện tại hoàn thành (Present Perfect)', body: `**Cấu trúc**: S + have/has + V3/-ed\n\n**Dùng khi**: hành động bắt đầu trong quá khứ, còn kéo dài hoặc còn ảnh hưởng đến hiện tại; nói về trải nghiệm.\n\n**Dấu hiệu**: since, for, already, yet, ever, never, just, recently, so far.\n\nVí dụ: *I have studied English for five years.*\nPhân biệt: quá khứ đơn dùng khi có thời điểm xác định (*yesterday, in 2020*).` },
  { keys: ['cach mang thang tam', '1945'], title: 'Cách mạng tháng Tám năm 1945', body: `- 19/8/1945: khởi nghĩa giành chính quyền thắng lợi ở Hà Nội.\n- 23/8 ở Huế, 25/8 ở Sài Gòn.\n- 2/9/1945: Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.\n\nÝ nghĩa: lật đổ ách thống trị thực dân – phát xít và chế độ phong kiến, mở ra kỷ nguyên độc lập, tự do.` },
  { keys: ['python', 'vong lap', 'lap trinh'], title: 'Vòng lặp trong Python', body: "**for** lặp qua một dãy:\n```\nfor i in range(1, 6):\n    print(i)   # in 1 đến 5\n```\n**while** lặp khi điều kiện còn đúng:\n```\nn = 10\nwhile n > 0:\n    n -= 3\n```\nMẹo: `range(a, b)` chạy từ a đến b − 1." },
  { keys: ['on thi', 'thi tot nghiep', 'thpt quoc gia', 'on tap'], title: 'Kế hoạch ôn thi tốt nghiệp THPT', body: `Từ năm 2025, thí sinh thi **4 môn**: Toán, Ngữ văn (bắt buộc) và 2 môn tự chọn.\n\n**Gợi ý lộ trình**\n1. Hệ thống kiến thức theo chuyên đề, làm sơ đồ tư duy.\n2. Mỗi tuần làm ít nhất 1 đề thử, bấm giờ như thi thật.\n3. Ghi “sổ lỗi sai” và ôn lại sau 1, 3, 7 ngày.\n4. Ngủ đủ 7–8 tiếng; học theo khung Pomodoro 25 phút học – 5 phút nghỉ.` },
  { keys: ['pomodoro', 'quan ly thoi gian', 'tap trung', 'luoi hoc', 'xao nhang'], title: 'Học tập trung với Pomodoro', body: `1. Chọn **một** nhiệm vụ cụ thể.\n2. Học 25 phút, tắt thông báo điện thoại.\n3. Nghỉ 5 phút: đứng dậy, uống nước.\n4. Sau 4 lượt, nghỉ dài 15–30 phút.\n\nMẹo: viết sẵn 3 việc quan trọng nhất của ngày vào buổi tối hôm trước.` },
];

const HOTLINES = `- **111** · Tổng đài Quốc gia Bảo vệ Trẻ em (miễn phí, 24/7)\n- **113** · Công an · **115** · Cấp cứu y tế · **114** · Cứu hỏa\n- Phòng Tham vấn Tâm lý của trường (trong giờ hành chính)`;

/**
 * @param {string} message
 * @param {{user:object, guard:object|null, llm?:Function, history?:Array}} opts
 */
export async function assistantReply(message, { user, guard, llm, history = [], school }) {
  const t = strip(message);
  const name = (user?.name || '').split(' ').pop();

  // 1) Ưu tiên an toàn: AI Guard phát hiện dấu hiệu khủng hoảng
  if (guard?.primary === 'mental') {
    return {
      intent: 'crisis', guard,
      reply: `${name ? name + ' ơi, ' : ''}mình rất trân trọng vì bạn đã chia sẻ. Những gì bạn đang cảm thấy là thật và bạn **không phải trải qua một mình**.\n\nNgay lúc này, hãy liên hệ một người có thể ở bên bạn:\n${HOTLINES}\n\nBạn cũng có thể nhắn cho **Chuyên viên Tâm lý của trường** ngay trong mục *Tư vấn tâm lý* (có thể ẩn danh). Nếu bạn đang gặp nguy hiểm, hãy gọi **115** hoặc nhờ người lớn gần nhất giúp đỡ ngay.\n\nMình vẫn ở đây nếu bạn muốn kể thêm.`,
      actions: [{ label: 'Nhắn chuyên viên tâm lý', page: 'counseling' }, { label: 'Bài tập thở 4-7-8', page: 'mood' }],
      suggestions: ['Mình muốn nói chuyện với thầy cô', 'Hướng dẫn bài tập thở'],
    };
  }
  if (guard && (guard.primary === 'violence' || guard.primary === 'weapons')) {
    return {
      intent: 'violence', guard,
      reply: `Mình rất lo cho sự an toàn của bạn. Hãy làm theo các bước sau:\n1. **Rời khỏi nơi nguy hiểm**, di chuyển tới chỗ đông người hoặc phòng bảo vệ, phòng giám thị.\n2. **Báo ngay** cho GVCN, Ban Giám thị hoặc cha mẹ. Không tự giải quyết bằng bạo lực.\n3. Nếu khẩn cấp, gọi **113** (Công an) hoặc **111** (Bảo vệ trẻ em).\n4. Khi đã an toàn, bạn có thể gửi **tố giác ẩn danh** kèm hình ảnh để nhà trường xử lý.\n\nDanh tính người tố giác được bảo mật tuyệt đối.`,
      actions: [{ label: 'Gửi tố giác ẩn danh', page: 'report' }, { label: 'Kỹ năng ứng phó', page: 'handbook' }],
      suggestions: ['Cách thoát khỏi nhóm bắt nạt', 'Số điện thoại khẩn cấp'],
    };
  }

  // 2) Câu hỏi thường: ưu tiên AI (LLM), bộ luật làm phương án dự phòng
  const rule = ruleReply(t, name);
  const scan = quickScamScan(message);
  if (llm) {
    try {
      const reply = await assistantLlmReply(llm, { message, history, school, user });
      const actions = scan ? [{ label: 'Phân tích chi tiết bằng Tra cứu lừa đảo AI', page: 'scam' }] : (rule.actions || []);
      return { intent: rule.intent === 'fallback' ? 'llm' : rule.intent, engine: 'llm', reply, actions, suggestions: rule.suggestions || ['Giải thích dễ hiểu hơn', 'Cho mình ví dụ', 'Kiểm tra tin nhắn lừa đảo'], scan };
    } catch (e) { rule.llmError = String(e?.message || e).slice(0, 160); }
  }
  if (scan && rule.intent !== 'scam-detail') {
    const r = scanMessage(message);
    const flags = r.findings.filter(f => f.weight > 0).slice(0, 4);
    if (flags.length) {
      return { intent: 'scam', engine: 'rules', scan, llmError: rule.llmError, reply: `Mình đã quét nhanh nội dung bạn gửi: **${r.label}** (${r.score}/100).\n\nCác dấu hiệu đáng ngờ:\n${flags.map(f => `- **${f.label}**: ${f.detail}`).join('\n')}\n\n${r.advice}`, actions: [{ label: 'Phân tích chi tiết bằng Tra cứu lừa đảo AI', page: 'scam' }], suggestions: ['Đã lỡ chuyển tiền thì làm gì?', 'Cách báo cáo số lừa đảo'] };
    }
  }
  return { ...rule, engine: 'rules' };
}

function ruleReply(t, name) {
  // Tâm lý, an toàn, lừa đảo
  if (has(t, 'ap luc', 'cang thang', 'stress', 'met moi', 'lo lang', 'so thi', 'buon', 'chan nan', 'kiet suc', 'mat ngu')) {
    return { intent: 'stress', reply: `Cảm giác áp lực trước học tập và thi cử là điều rất nhiều bạn gặp phải. Thử ngay **bài thở 4-7-8**:\n1. Hít vào bằng mũi trong 4 giây\n2. Giữ hơi 7 giây\n3. Thở ra chậm bằng miệng 8 giây\nLặp lại 4 lần.\n\nThêm vài gợi ý:\n- Chia nhỏ việc học, mỗi lần chỉ tập trung một nhiệm vụ.\n- Ngủ đủ giấc, vận động nhẹ 15 phút mỗi ngày.\n- Chia sẻ với người bạn tin tưởng hoặc chuyên viên tâm lý của trường.`, actions: [{ label: 'Ghi lại cảm xúc', page: 'mood' }, { label: 'Tâm sự ẩn danh', page: 'counseling' }], suggestions: ['Cách học tập trung', 'Kế hoạch ôn thi'] };
  }
  if (has(t, 'bat nat', 'co lap', 'tay chay', 'bao luc', 'treu choc', 'de doa')) {
    return { intent: 'bullying', reply: `Nếu bạn hoặc bạn bè đang bị bắt nạt, hãy nhớ quy tắc **3 KHÔNG – 3 NÊN**:\n- Không im lặng chịu đựng · Không trả đũa bằng bạo lực · Không xóa bằng chứng\n- Nên báo ngay thầy cô/cha mẹ · Nên gọi 111 khi cần · Nên tìm đến phòng tham vấn tâm lý\n\nBạn có thể gửi **tố giác ẩn danh** — danh tính được bảo mật tuyệt đối.`, actions: [{ label: 'Gửi tố giác', page: 'report' }, { label: 'Đọc cẩm nang', page: 'handbook' }] };
  }
  if (has(t, 'lua dao', 'scam', 'trung thuong', 'otp', 'link la', 'chuyen khoan', 'viec nhe luong cao')) {
    return { intent: 'scam', reply: `Dấu hiệu lừa đảo thường gặp: **hối thúc gấp**, **đòi chuyển tiền trước**, **xin mã OTP**, **trúng thưởng bất ngờ**, **mạo danh công an/nhà trường**.\n\nNguyên tắc vàng: không chuyển tiền, không bấm link lạ, không đọc OTP cho bất kỳ ai. Hãy dán tin nhắn, đường link, số điện thoại hoặc số tài khoản vào **Tra cứu lừa đảo AI** để kiểm tra ngay.`, actions: [{ label: 'Mở Tra cứu lừa đảo', page: 'scam' }] };
  }
  if (has(t, 'hotline', 'so khan cap', 'goi ai', 'duong day nong', 'so dien thoai khan')) {
    return { intent: 'hotline', reply: 'Các số điện thoại hỗ trợ khẩn cấp:\n' + HOTLINES, actions: [{ label: 'Mở cẩm nang', page: 'handbook' }] };
  }

  // Kiến thức học tập
  const k = KNOWLEDGE.find(k => k.keys.some(key => t.includes(key)));
  if (k) return { intent: 'study', reply: `**${k.title}**\n\n${k.body}`, suggestions: ['Giải thích thêm ví dụ', 'Mẹo ôn thi'] };

  // Hỏi bài tập chung
  if (has(t, 'hoi bai', 'bai tap', 'giai bai', 'chi bai', 'huong dan bai', 'hoc bai')) {
    return {
      intent: 'homework',
      reply: `Bạn cứ gửi đề bài hoặc chủ đề cần hỏi vào đây nhé! Mình có thể hỗ trợ nhanh:\n- **Toán**: đạo hàm, nguyên hàm, lượng giác\n- **Văn & Anh**: dàn ý nghị luận xã hội, thì hiện tại hoàn thành\n- **Tin & Kỹ năng**: vòng lặp Python, lộ trình ôn thi, Pomodoro`,
      actions: [{ label: 'Nhắn giáo viên bộ môn', page: 'teacher-chat' }],
      suggestions: ['Công thức đạo hàm', 'Công thức lượng giác', 'Dàn ý nghị luận xã hội', 'Vòng lặp Python'],
    };
  }

  if (has(t, 'xin chao', 'chao', 'hello', 'hi ', 'alo') || t.trim() === 'hi') {
    return { intent: 'greeting', reply: `Chào ${name || 'bạn'}! Mình là **Trợ lý Học đường AI** 👋\nBạn muốn hỏi bài tập, kiểm tra tin nhắn lừa đảo hay cần tâm sự?`, suggestions: ['Công thức đạo hàm', 'Kế hoạch ôn thi', 'Mình đang áp lực thi cử', 'Dấu hiệu lừa đảo'] };
  }
  if (has(t, 'cam on', 'thanks', 'thank')) return { intent: 'thanks', reply: 'Không có gì nè! Chúc bạn một ngày học tập thật hiệu quả 🌟' };

  return {
    intent: 'fallback',
    reply: `Mình có thể hỗ trợ nhanh các chủ đề sau:\n- **Học tập**: đạo hàm, nguyên hàm, lượng giác, nghị luận xã hội, Present Perfect, Python\n- **An toàn & tâm lý**: áp lực thi cử, ứng phó bắt nạt, kiểm tra lừa đảo`,
    actions: [{ label: 'Chat với giáo viên', page: 'teacher-chat' }],
    suggestions: ['Công thức đạo hàm', 'Công thức lượng giác', 'Cách học tập trung', 'Dấu hiệu lừa đảo'],
  };
}
