// Tạo cơ sở dữ liệu mẫu cho lần chạy đầu tiên. Ngày giờ được tính tương đối theo thời điểm hiện tại
// để lịch học, lịch thi, bản tin… luôn "mới" khi chạy thử.
import { NEWS, QUIZ, HANDBOOK_META, COUNSEL_TOPICS, SCHOOL_CHAT } from './content.js';
import { defaultCounselTeam } from './counsel-team.js';

function prng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const DAY = 86400000;

export async function createSeed(crypto, opts = {}) {
  const rnd = prng(20262027);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();
  const dateOnly = (offsetDays) => { const d = new Date(now + offsetDays * DAY); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const pw = await crypto.hashPassword('123456');
  const adminPw = await crypto.hashPassword('admin123');

  const classes = [
    { id: '12A1', name: 'Lớp 12A1', grade: 12, homeroom: 'GV2024089', room: 'Phòng A2.04' },
    { id: '12A2', name: 'Lớp 12A2', grade: 12, homeroom: 'GV2024033', room: 'Phòng A2.05' },
    { id: '11A2', name: 'Lớp 11A2', grade: 11, homeroom: 'GV2024033', room: 'Phòng B1.02' },
    { id: '10A4', name: 'Lớp 10A4', grade: 10, homeroom: 'GV2024089', room: 'Phòng C1.01' },
  ];

  const S = (id, name, classId, gender, dob, hometown, extra = {}) => ({
    id, role: 'student', name, classId, className: classId,
    gender, dob, hometown, email: '', phone: '', avatar: null,
    conduct: 80 + Math.floor(rnd() * 18), courseYear: classId.startsWith('12') ? '2024 – 2027' : classId.startsWith('11') ? '2025 – 2028' : '2026 – 2029',
    passwordHash: pw, tokenVersion: 1, locked: false, createdAt: iso(-120 * DAY), lastLogin: null, ...extra,
  });
  const users = [
    S('2126220004', 'Nguyễn Hoàng Hữu Lượng', '12A1', 'Nam', '2009-08-15', 'Thọ Xuân, Thanh Hóa', { avatar: opts.studentAvatar || null, conduct: 92, phone: '0987 654 321' }),
    S('2126220015', 'Trần Thị Mai', '12A1', 'Nữ', '2009-03-22', 'Pleiku, Gia Lai'),
    S('2126220028', 'Lê Văn Đạt', '12A1', 'Nam', '2009-11-02', 'Chư Păh, Gia Lai'),
    S('2126220033', 'Phạm Quốc Bảo', '12A1', 'Nam', '2009-06-30', 'Ia Grai, Gia Lai'),
    S('2126220067', 'Đỗ Khánh Linh', '12A1', 'Nữ', '2009-01-18', 'Pleiku, Gia Lai'),
    S('2126220077', 'Hoàng Minh Tuấn', '12A2', 'Nam', '2009-09-09', 'Đak Đoa, Gia Lai'),
    S('2126220084', 'Bùi Ngọc Ánh', '12A2', 'Nữ', '2009-12-12', 'An Khê, Gia Lai'),
    S('2126220018', 'Lê Thu Hà', '11A2', 'Nữ', '2010-04-05', 'Pleiku, Gia Lai'),
    S('2126220061', 'Phạm Đức Huy', '11A2', 'Nam', '2010-07-21', 'Chư Sê, Gia Lai'),
    S('2126220042', 'Nguyễn Hoàng Anh', '10A4', 'Nam', '2011-02-14', 'Pleiku, Gia Lai'),
    S('2126220073', 'Vũ Gia Bảo', '10A4', 'Nam', '2011-10-01', 'Kbang, Gia Lai'),
    S('2126220081', 'Vũ Mai Linh', '10A4', 'Nữ', '2011-05-27', 'Pleiku, Gia Lai'),
    { id: 'GV2024089', role: 'teacher', name: 'ThS. Vũ Thị Hường', title: 'GVCN 12A1 · Tin học & Toán', subject: 'Tin học', department: 'Tổ Toán – Tin', email: 'huong.vt@lehoan.edu.vn', phone: '0912 345 678', avatar: opts.teacherAvatar || null, homeroom: '12A1', passwordHash: pw, tokenVersion: 1, locked: false, createdAt: iso(-400 * DAY), lastLogin: null },
    { id: 'GV2024101', role: 'teacher', name: 'Cô Hoàng Thị Mai Hằng', title: 'Giáo viên GDCD · Tư vấn học đường', subject: 'GDCD', department: 'Phòng Tham vấn Tâm lý', counselor: true, email: 'hang.htm@lehoan.edu.vn', phone: '0913 222 444', avatar: null, passwordHash: pw, tokenVersion: 1, locked: false, createdAt: iso(-400 * DAY), lastLogin: null },
    { id: 'GV2024102', role: 'teacher', name: 'Cô Phạm Thị Tiến Quỳnh', title: 'Y tế học đường', subject: 'Y tế học đường', department: 'Phòng Y tế', counselor: true, email: 'quynh.ptt@lehoan.edu.vn', phone: '0913 555 777', avatar: null, passwordHash: pw, tokenVersion: 1, locked: false, createdAt: iso(-400 * DAY), lastLogin: null },
    { id: 'GV2024033', role: 'teacher', name: 'Thầy Lê Văn Hải', title: 'Trưởng ban Giám thị · GD Quốc phòng', subject: 'GD Quốc phòng & An ninh', department: 'Ban Giám thị', supervisor: true, email: 'hai.lv@lehoan.edu.vn', phone: '0905 112 233', avatar: null, homeroom: '12A2', passwordHash: pw, tokenVersion: 1, locked: false, createdAt: iso(-400 * DAY), lastLogin: null },
    { id: 'admin', role: 'admin', name: 'Ban Giám hiệu', title: 'Quản trị hệ thống', department: 'Ban Giám hiệu', email: 'bgh@lehoan.edu.vn', phone: '', avatar: null, passwordHash: adminPw, tokenVersion: 1, locked: false, createdAt: iso(-500 * DAY), lastLogin: null },
  ];
  const students = users.filter(u => u.role === 'student');

  // ---------- Tố giác của học sinh ----------
  const reports = [];

  // ---------- Biên bản vi phạm ----------
  const records = [];

  // ---------- Cảm xúc ----------
  const moodKeys = ['joyful', 'calm', 'stressed', 'sad', 'anxious', 'exhausted'];
  const moods = [];
  students.forEach((s) => {
    for (let d = 0; d < 14; d++) {
      if (rnd() < 0.35) continue;
      const r = rnd();
      const mood = r < 0.3 ? 'joyful' : r < 0.58 ? 'calm' : r < 0.74 ? 'stressed' : r < 0.84 ? 'anxious' : r < 0.93 ? 'exhausted' : 'sad';
      moods.push({ id: `CX-${s.id}-${d}`, userId: s.id, mood, note: '', at: iso(-d * DAY - Math.floor(rnd() * 8) * 3600000) });
    }
  });

  // ---------- Hộp thư tư vấn ----------
  const counseling = [
    { id: 'TV-001', ownerKey: await crypto.hmac('counsel-owner', '2126220004'), counselorId: 'GV2024101', studentId: null, anonymous: true, alias: 'Học sinh ẩn danh #7F3A', topic: 'stress', flagged: false, status: 'open', unreadStaff: 0, unreadStudent: 1, updatedAt: iso(-5 * 3600000),
      messages: [
        { id: 'm1', from: 'counselor', name: 'Thầy Lê Trung Thành', text: 'Chào em! Thầy là chuyên viên tâm lý của trường. Mọi chia sẻ tại đây đều được giữ bí mật. Em muốn kể với thầy điều gì?', at: iso(-30 * 3600000) },
        { id: 'm2', from: 'student', text: 'Dạ em đang bị áp lực thi cử quá, tối nào cũng thức khuya mà vẫn thấy không kịp ôn.', at: iso(-29 * 3600000) },
        { id: 'm3', from: 'counselor', name: 'Thầy Lê Trung Thành', text: 'Thầy hiểu cảm giác đó. Mình thử chia nhỏ khối lượng: mỗi tối chỉ chọn 2 chuyên đề, học theo khung 25 phút và ngủ trước 23h nhé. Thứ Năm này em có muốn ghé phòng tham vấn để thầy cùng em lên kế hoạch không?', at: iso(-5 * 3600000) },
      ] },
    { id: 'TV-002', ownerKey: await crypto.hmac('counsel-owner', '2126220015'), counselorId: 'GV2024101', studentId: '2126220015', anonymous: false, alias: 'Trần Thị Mai · 12A1', topic: 'friends', flagged: false, status: 'open', unreadStaff: 1, unreadStudent: 0, updatedAt: iso(-50 * 60000),
      messages: [{ id: 'm1', from: 'student', text: 'Thầy ơi, dạo này nhóm bạn thân tự nhiên không nói chuyện với em nữa, em buồn lắm.', at: iso(-50 * 60000) }] },
    { id: 'TV-003', ownerKey: await crypto.hmac('counsel-owner', '2126220061'), counselorId: 'GV2024101', studentId: null, anonymous: true, alias: 'Học sinh ẩn danh #B21C', topic: 'bullying', flagged: true, status: 'open', unreadStaff: 0, unreadStudent: 0, updatedAt: iso(-20 * 3600000),
      messages: [
        { id: 'm1', from: 'student', text: 'Em bị mấy anh lớp trên chặn ở nhà xe đòi tiền mấy lần rồi, em sợ không dám nói với ai.', at: iso(-22 * 3600000) },
        { id: 'm2', from: 'counselor', name: 'Thầy Lê Trung Thành', text: 'Cảm ơn em đã tin tưởng nói ra, việc này không phải lỗi của em. Thầy đã báo Ban Giám thị tăng cường trực nhà xe. Em có thể gặp thầy trực tiếp lúc 10h sáng mai tại phòng tham vấn (tầng 1 dãy B), danh tính của em được bảo vệ.', at: iso(-20 * 3600000) },
      ] },
  ];

  // ---------- Trắc nghiệm ----------
  const extraQuiz = [
    { id: 'CH-16', topic: 'traffic', question: 'Học sinh đủ 16 tuổi được phép điều khiển loại phương tiện nào sau đây?', options: ['Xe mô tô dung tích từ 125 cm³ trở lên', 'Xe gắn máy (dưới 50 cm³) hoặc xe máy điện có công suất tương đương', 'Ô tô con dưới 9 chỗ', 'Mọi loại xe nếu có người lớn đi cùng'], answer: 1, difficulty: 'Dễ', explanation: 'Người đủ 16 tuổi được điều khiển xe gắn máy (dung tích dưới 50 cm³ hoặc xe máy điện tương đương). Xe mô tô cần đủ 18 tuổi và có giấy phép lái xe.' },
    { id: 'CH-17', topic: 'traffic', question: 'Khi đi xe đạp điện đến trường, việc đội mũ bảo hiểm được quy định thế nào?', options: ['Không bắt buộc vì là xe đạp', 'Chỉ bắt buộc khi đi trên quốc lộ', 'Bắt buộc đội mũ bảo hiểm và cài quai đúng quy cách', 'Chỉ bắt buộc vào ban đêm'], answer: 2, difficulty: 'Dễ', explanation: 'Người điều khiển và người ngồi trên xe đạp máy (xe đạp điện) bắt buộc đội mũ bảo hiểm và cài quai đúng quy cách.' },
    { id: 'CH-18', topic: 'traffic', question: 'Hành vi nào sau đây là vi phạm khi đi xe đạp?', options: ['Đi bên phải theo chiều đi của mình', 'Đi hàng ba trở lên, buông cả hai tay hoặc kéo, đẩy xe khác', 'Giơ tay xin đường khi chuyển hướng', 'Bật đèn khi đi buổi tối'], answer: 1, difficulty: 'Trung bình', explanation: 'Người đi xe đạp không được đi dàn hàng ngang từ ba xe trở lên, buông cả hai tay, kéo đẩy xe khác hay sử dụng ô, điện thoại khi đang đi.' },
  ];
  const quizQuestions = [...QUIZ, ...extraQuiz].map(q => ({ ...q, active: true, createdAt: iso(-30 * DAY) }));
  const quizAttempts = [];

  // ---------- Khảo sát ----------
  const Q = (id, type, text, options = [], required = true) => ({ id, type, text, options, required });
  const surveys = [
    { id: 'KS-2026-01', title: 'Thực trạng bạo lực học đường & giải pháp ứng phó tâm lý học sinh', description: 'Đề tài nghiên cứu của học sinh THPT Lê Hoàn. Phiếu ẩn danh, mất khoảng 4 phút.', purpose: 'khkt', anonymous: true, target: 'Toàn trường (Khối 10, 11, 12)', targetCount: 150, deadline: dateOnly(7), status: 'active', createdBy: 'GV2024089', createdAt: iso(-17 * DAY),
      questions: [
        Q('q1', 'single', 'Bạn đang học khối nào?', ['Khối 10', 'Khối 11', 'Khối 12']),
        Q('q2', 'single', 'Giới tính của bạn', ['Nam', 'Nữ', 'Không muốn trả lời']),
        Q('q3', 'single', 'Bạn đã từng chứng kiến hoặc trải qua bạo lực học đường chưa?', ['Chưa từng', 'Từng chứng kiến người khác bị bắt nạt', 'Bản thân từng bị bắt nạt', 'Cả hai']),
        Q('q4', 'multi', 'Những hình thức bạn từng gặp (chọn nhiều)', ['Bạo lực thể chất', 'Bạo lực tinh thần, lời nói', 'Cô lập, tẩy chay', 'Bắt nạt trên mạng'], false),
        Q('q5', 'single', 'Tần suất bạn gặp các tình huống trên', ['Chưa bao giờ', 'Vài lần mỗi học kỳ', '1–2 lần mỗi tháng', 'Hằng tuần']),
        Q('q6', 'scale', 'Bạn cảm thấy an toàn ở trường ở mức nào? (1 = rất không an toàn, 5 = rất an toàn)', ['1', '2', '3', '4', '5']),
        Q('q7', 'single', 'Khi gặp bạo lực, bạn sẽ chia sẻ với ai đầu tiên?', ['Bố mẹ', 'Giáo viên chủ nhiệm', 'Bạn bè', 'Chuyên viên tâm lý', 'Không chia sẻ với ai']),
        Q('q8', 'single', 'Bạn có biết Tổng đài Quốc gia Bảo vệ Trẻ em 111?', ['Biết rõ và nhớ số', 'Có nghe nhưng không nhớ', 'Chưa từng biết']),
        Q('q9', 'multi', 'Giải pháp bạn mong muốn nhà trường triển khai', ['Học kỹ năng sống, đóng vai tình huống', 'Lắp thêm camera khu vực khuất', 'Kênh tố giác ẩn danh', 'Tăng cường tư vấn tâm lý', 'Giám thị trực cổng và nhà xe']),
        Q('q10', 'text', 'Góp ý khác của bạn', [], false),
      ] },
    { id: 'KS-2026-02', title: 'Mức độ an toàn & nề nếp khu vực cổng trường', description: 'Thu thập ý kiến về an ninh, giao thông và hàng quán quanh cổng trường để Ban Giám thị cải thiện.', purpose: 'discipline', anonymous: true, target: 'Khối 12', targetCount: 100, deadline: dateOnly(12), status: 'active', createdBy: 'GV2024033', createdAt: iso(-10 * DAY),
      questions: [
        Q('q1', 'scale', 'Mức độ an toàn khu vực cổng trường giờ tan học', ['1', '2', '3', '4', '5']),
        Q('q2', 'single', 'Tình trạng ùn tắc trước cổng trường', ['Thường xuyên', 'Thỉnh thoảng', 'Hiếm khi', 'Không bao giờ']),
        Q('q3', 'multi', 'Vấn đề bạn thấy đáng lo ngại', ['Hàng quán lấn chiếm vỉa hè', 'Người lạ tụ tập', 'Xe lạng lách, không đội mũ bảo hiểm', 'Bán thuốc lá điện tử, đồ ăn lạ', 'Thiếu đèn chiếu sáng']),
        Q('q4', 'text', 'Đề xuất của bạn', [], false),
      ] },
    { id: 'KS-2026-03', title: 'Nhu cầu tham vấn tâm lý & áp lực thi cử', description: 'Lắng nghe tâm tư, áp lực của học sinh trước kỳ thi tốt nghiệp THPT.', purpose: 'mental', anonymous: true, target: 'Toàn trường', targetCount: 250, deadline: dateOnly(30), status: 'active', createdBy: 'GV2024101', createdAt: iso(-1 * DAY),
      questions: [
        Q('q1', 'scale', 'Mức độ áp lực học tập hiện tại (1 = rất thấp, 5 = rất cao)', ['1', '2', '3', '4', '5']),
        Q('q2', 'scale', 'Chất lượng giấc ngủ của bạn tuần qua', ['1', '2', '3', '4', '5']),
        Q('q3', 'single', 'Nguồn áp lực lớn nhất', ['Thi cử, điểm số', 'Kỳ vọng của gia đình', 'Quan hệ bạn bè', 'Định hướng tương lai', 'Khác']),
        Q('q4', 'single', 'Hình thức hỗ trợ bạn mong muốn', ['Gặp trực tiếp chuyên viên', 'Nhắn tin ẩn danh', 'Hội thảo kỹ năng', 'Nhóm hỗ trợ bạn bè']),
        Q('q5', 'text', 'Điều bạn muốn nhà trường biết', [], false),
      ] },
  ];
  const surveyResponses = [];
  const answer = (q) => {
    if (q.type === 'single') { const w = q.options.map((_, i) => 1 / (i + 1.2)); const sum = w.reduce((a, b) => a + b); let r = rnd() * sum; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return q.options[i]; } return q.options[0]; }
    if (q.type === 'multi') return q.options.filter(() => rnd() < 0.42);
    if (q.type === 'scale') return String(Math.min(5, Math.max(1, Math.round(2.4 + rnd() * 2.6))));
    return rnd() < 0.12 ? pick(['Mong trường tổ chức thêm buổi ngoại khóa kỹ năng sống.', 'Nên có thêm ghế đá và đèn ở nhà xe.', 'Cảm ơn thầy cô đã lắng nghe học sinh.']) : '';
  };
  [['KS-2026-01', 136], ['KS-2026-02', 82], ['KS-2026-03', 21]].forEach(([sid, count]) => {
    const sv = surveys.find(s => s.id === sid);
    for (let i = 0; i < count; i++) surveyResponses.push({ id: `PH-${sid}-${i}`, surveyId: sid, userKey: `seed-${i}`, answers: Object.fromEntries(sv.questions.map(q => [q.id, answer(q)])), at: iso(-Math.floor(rnd() * 14) * DAY - Math.floor(rnd() * 20) * 3600000) });
  });

  // ---------- Chat chung ----------
  const chatMsgs = [];

  // ---------- Chat giáo viên ----------
  const teacherChat = [
    { id: 'GVC-002', teacherId: 'GV2024089', studentId: '2126220015', unreadTeacher: 1, unreadStudent: 0, updatedAt: iso(-2 * 3600000), messages: [
      { id: 'c1', from: 'student', text: 'Cô ơi, thứ Ba em xin phép nghỉ học buổi sáng để đi khám răng ạ. Mẹ em sẽ gửi giấy phép sau.', at: iso(-2 * 3600000) },
    ] },
    { id: 'GVC-003', teacherId: 'GV2024033', studentId: '2126220028', unreadTeacher: 0, unreadStudent: 0, updatedAt: iso(-2 * DAY), messages: [
      { id: 'c1', from: 'teacher', text: 'Đạt nhớ nộp bản cam kết có chữ ký phụ huynh trước thứ Sáu nhé.', at: iso(-2.2 * DAY) },
      { id: 'c2', from: 'student', text: 'Dạ em nộp cho thầy rồi ạ, em hứa không tái phạm.', at: iso(-2 * DAY) },
    ] },
  ];

  // ---------- AI ----------
  const aiGuard = {
    sensitivity: 'high', autoAlert: true, autoHotline: true, autoFilterChat: true, retention: 'year', updatedAt: iso(-1 * DAY), updatedBy: 'Tổ Giám thị & Tư vấn Tâm lý',
    keywords: {
      mental: 'tự tử, tự sát, muốn chết, tự hại, rạch tay, không thiết sống, muốn buông xuôi, tuyệt vọng, bế tắc quá, trầm cảm nặng',
      violence: 'đánh nhau, đánh hội đồng, chặn đường, trấn lột, bảo kê, côn đồ, dọa đánh, đe dọa, hành hung',
      weapons: 'dao, mã tấu, súng, hung khí, vũ khí, kiếm, côn nhị khúc',
      drugs: 'ma túy, cần sa, thuốc lắc, ketamine, nước vui, bóng cười, tem giấy',
      cyber: 'bóc phốt, dọa tung clip, tung ảnh, tống tiền, hack tài khoản, OTP, trúng thưởng, link lạ, lừa đảo',
    },
  };
  const aiLogs = [
    { id: 'AI-001', userId: '2126220061', name: 'Phạm Đức Huy', className: '11A2', flagged: 'orange', updatedAt: iso(-26 * 3600000), messages: [
      { role: 'user', text: 'Mình bị mấy anh lớp trên chặn đường đòi tiền và dọa đánh nếu không đưa thì làm sao?', at: iso(-26 * 3600000), guard: { level: 'orange', levelName: 'Cấp 2 · Cao', categories: ['Bạo lực, đe dọa'], keywords: ['chặn đường', 'dọa đánh'] } },
      { role: 'assistant', text: 'Mình rất lo cho sự an toàn của bạn. Hãy rời khỏi nơi nguy hiểm, báo ngay cho GVCN/Ban Giám thị hoặc gọi 113, 111…', at: iso(-26 * 3600000) },
    ] },
    { id: 'AI-002', userId: '2126220015', name: 'Trần Thị Mai', className: '12A1', flagged: 'yellow', updatedAt: iso(-30 * 3600000), messages: [
      { role: 'user', text: 'Có người nhắn mình trúng xe SH, bảo nộp 2 triệu phí và đọc mã OTP để nhận quà, có thật không?', at: iso(-30 * 3600000), guard: { level: 'yellow', levelName: 'Cấp 3 · Theo dõi', categories: ['Lừa đảo, bắt nạt mạng'], keywords: ['trúng thưởng', 'OTP'] } },
      { role: 'assistant', text: 'Đây là dấu hiệu lừa đảo điển hình: trúng thưởng bất ngờ, đòi nộp phí và mã OTP. Tuyệt đối không làm theo…', at: iso(-30 * 3600000) },
    ] },
    { id: 'AI-003', userId: '2126220004', name: 'Nguyễn Hoàng Hữu Lượng', className: '12A1', flagged: null, updatedAt: iso(-4 * 3600000), messages: [
      { role: 'user', text: 'Công thức đạo hàm của hàm hợp là gì?', at: iso(-4 * 3600000) },
      { role: 'assistant', text: 'Hàm hợp: [f(g(x))]′ = f′(g(x))·g′(x)…', at: iso(-4 * 3600000) },
    ] },
  ];
  const alerts = [
    { id: 'CB-002', level: 'orange', source: 'ai', title: 'AI Guard: dấu hiệu bị đe dọa bạo lực', userId: '2126220061', name: 'Phạm Đức Huy', className: '11A2', keywords: ['chặn đường', 'dọa đánh'], context: 'Bị bạn lớp khác chặn đường xin tiền và dọa đánh nếu không đưa…', status: 'handled', handledBy: 'Thầy Lê Trung Thành', ref: 'AI-001', at: iso(-26 * 3600000) },
    { id: 'CB-001', level: 'yellow', source: 'ai', title: 'AI Guard: tin nhắn lừa đảo trúng thưởng', userId: '2126220015', name: 'Trần Thị Mai', className: '12A1', keywords: ['trúng thưởng', 'OTP'], context: 'Có người nhắn trúng xe SH yêu cầu nộp 2 triệu phí nhận quà…', status: 'handled', handledBy: 'AI Scam Scanner', ref: 'AI-002', at: iso(-30 * 3600000) },
  ];

  // ---------- Cẩm nang ----------
  const HB_CONTENT = {
    'CD-01': `Bạo lực học đường không chỉ là đánh nhau. Có 4 hình thức thường gặp:\n\n1. BẠO LỰC THỂ CHẤT\n- Đánh, đấm, xô đẩy, giật tóc, ép làm việc nặng, lấy hoặc phá hỏng đồ dùng.\n\n2. BẠO LỰC TINH THẦN, LỜI NÓI\n- Chửi bới, miệt thị ngoại hình, gán biệt danh xúc phạm, đe dọa, vu khống.\n\n3. BẠO LỰC XÃ HỘI (CÔ LẬP, TẨY CHAY)\n- Cố tình loại một bạn ra khỏi nhóm, lan truyền tin đồn, kêu gọi người khác không chơi cùng.\n\n4. BẠO LỰC TRÊN KHÔNG GIAN MẠNG\n- Đăng ảnh chế giễu, lập nhóm “bóc phốt”, nhắn tin đe dọa, phát tán thông tin riêng tư.\n\nDẤU HIỆU MỘT BẠN ĐANG BỊ BẮT NẠT\n- Ngại đi học, thu mình, kết quả học tập giảm sút, thường xuyên mất đồ, có vết thương không rõ lý do.\n\nBẠN CÓ THỂ LÀM GÌ?\n- Không im lặng, lưu lại bằng chứng và báo ngay với GVCN, Ban Giám thị hoặc gửi tố giác ẩn danh trên ứng dụng.`,
    'CD-02': `Nguyên tắc số 1: AN TOÀN CỦA BẠN QUAN TRỌNG HƠN MỌI THỨ.\n\nKHI BỊ NHÓM BẠN ĐE DỌA, CHẶN ĐƯỜNG\n1. Giữ bình tĩnh, nói chậm và rõ ràng. Không khiêu khích, không đối đầu trực diện.\n2. Quan sát lối thoát. Di chuyển về phía đông người: cổng trường, phòng bảo vệ, cửa hàng.\n3. Nếu bị giữ lại, hô to “CỨU VỚI” hoặc “CHÁY” để gây chú ý.\n4. Ghi nhớ đặc điểm: số người, trang phục, biển số xe, thời gian, địa điểm.\n5. Báo ngay cho thầy cô, cha mẹ. Gọi 113 nếu khẩn cấp, 111 để được tư vấn bảo vệ.\n\nPHÒNG NGỪA\n- Đi theo nhóm bạn, tránh đường vắng, không mang theo nhiều tiền hoặc đồ giá trị.\n- Lưu sẵn số GVCN, Ban Giám thị và 111 trong danh bạ khẩn cấp.`,
    'CD-03': `Nhà trường thực hiện tiếp nhận tố giác theo tinh thần Nghị định 80/2017/NĐ-CP về môi trường giáo dục an toàn, lành mạnh, thân thiện, phòng chống bạo lực học đường.\n\nCÁCH GỬI TỐ GIÁC TRÊN ỨNG DỤNG\n1. Mở mục “Tố giác vi phạm” hoặc bấm nút máy ảnh ở giữa thanh điều hướng.\n2. Chọn loại vi phạm, nhập địa điểm, thời gian và mô tả sự việc.\n3. Đính kèm ảnh minh chứng (nếu chụp được một cách an toàn).\n4. Bật “Gửi ẩn danh” nếu bạn không muốn lộ danh tính.\n5. Theo dõi trạng thái hồ sơ trong mục “Lịch sử tố giác”.\n\nCAM KẾT BẢO MẬT\n- Với tố giác ẩn danh, hệ thống không lưu họ tên và mã học sinh của người gửi. Cán bộ xử lý không thể biết ai đã gửi.\n- Mọi hành vi trả thù người tố giác sẽ bị xử lý nghiêm.\n\nLƯU Ý: Chỉ chụp ảnh khi bạn ở vị trí an toàn. Không áp sát, không đăng lên mạng xã hội.`,
    'CD-04': `5 THÓI QUEN AN TOÀN TRÊN MẠNG\n1. Không bao giờ cung cấp mã OTP, mật khẩu cho bất kỳ ai, kể cả người tự xưng là công an, nhà trường hay ngân hàng.\n2. Bật xác thực 2 lớp cho Facebook, Zalo, email.\n3. Không bấm vào link lạ, link “bình chọn”, “nhận quà”. Kiểm tra bằng Tra cứu lừa đảo AI trước.\n4. Đặt chế độ riêng tư cho ảnh cá nhân, không công khai địa chỉ nhà, lịch sinh hoạt.\n5. Không gửi ảnh nhạy cảm cho bất kỳ ai.\n\nKHI BỊ BẮT NẠT, TỐNG TIỀN TRÊN MẠNG\n- Không trả lời, không làm theo yêu cầu, không chuyển tiền.\n- Chụp màn hình toàn bộ tin nhắn, đường link tài khoản.\n- Chặn và báo cáo tài khoản, sau đó báo ngay cho cha mẹ, thầy cô hoặc công an.`,
    'CD-05': `Khi một người bạn có dấu hiệu buồn bã kéo dài, thu mình hoặc nói những điều tiêu cực về bản thân, bạn có thể là người giúp đỡ đầu tiên.\n\nNHẬN BIẾT TÍN HIỆU\n- Thay đổi rõ rệt trong ăn ngủ, học tập; rút khỏi bạn bè; hay nói “mệt mỏi”, “vô dụng”.\n\nLẮNG NGHE ĐÚNG CÁCH\n- Tìm nơi yên tĩnh, hỏi thăm chân thành: “Dạo này cậu ổn không?”.\n- Lắng nghe, không phán xét, không vội khuyên “đừng nghĩ nhiều”.\n\nKẾT NỐI HỖ TRỢ\n- Khuyến khích bạn gặp chuyên viên tâm lý của trường; có thể đi cùng bạn.\n- Nếu bạn có ý định làm hại bản thân, KHÔNG giữ bí mật: báo ngay cho người lớn đáng tin cậy và gọi 111 hoặc 115.\n\nChăm sóc bản thân bạn nữa: giúp người khác cũng cần bạn được nghỉ ngơi và chia sẻ.`,
    'CD-06': `CĂN CỨ PHÁP LÝ CHÍNH\n- Luật Trẻ em 2016: trẻ em có quyền được bảo vệ khỏi mọi hình thức bạo lực, xâm hại.\n- Nghị định 80/2017/NĐ-CP: quy định môi trường giáo dục an toàn, lành mạnh, thân thiện, phòng, chống bạo lực học đường.\n- Luật An ninh mạng 2018: nghiêm cấm xúc phạm danh dự, nhân phẩm người khác trên không gian mạng.\n\nXỬ LÝ TẠI NHÀ TRƯỜNG\n- Áp dụng các biện pháp kỷ luật mang tính giáo dục theo quy định hiện hành của Bộ GD&ĐT: nhắc nhở, phê bình, yêu cầu viết bản tự kiểm điểm, mời phụ huynh làm việc.\n- Điểm rèn luyện và kết quả đánh giá rèn luyện bị ảnh hưởng tương ứng với mức độ vi phạm.\n\nTRÁCH NHIỆM PHÁP LÝ\n- Hành vi gây thương tích, cưỡng đoạt tài sản, làm nhục người khác có thể bị xử phạt hành chính hoặc truy cứu trách nhiệm hình sự theo quy định của pháp luật.`,
  };
  const handbook = HANDBOOK_META.map((h, i) => ({ id: h.id, title: h.title, category: h.category, author: h.author, summary: h.summary, content: HB_CONTENT[h.id] || h.summary, views: h.views, pinned: i < 2, active: true, updatedAt: iso(-(i + 1) * 2 * DAY) }));

  const news = NEWS.map((n, i) => ({ ...n, publishedAt: iso(-(i * 1.5 + 0.3) * DAY), pinned: i < 6, active: true }));
  news.push({ id: 'N201', title: 'Phát động tháng cao điểm “Trường học an toàn – Nói không với bạo lực học đường”', category: 'school', badge: 'Tin nhà trường', kind: 'school', cover: null, author: 'Ban Giám hiệu', views: 980, pinned: false, active: true, publishedAt: iso(-20 * DAY),
    summary: 'Từ nay đến hết tháng 11, toàn trường triển khai chuỗi hoạt động: khảo sát, đấu trường trắc nghiệm pháp luật, tọa đàm kỹ năng ứng phó và tuần lễ tư vấn tâm lý mở.',
    content: `Hưởng ứng phong trào xây dựng trường học an toàn, thân thiện, Ban Giám hiệu phát động tháng cao điểm với các hoạt động:\n\n1. Khảo sát về thực trạng bạo lực học đường (mục “Khảo sát” trên ứng dụng).\n2. Đấu trường trắc nghiệm tri thức pháp luật hằng tuần, vinh danh Top 3 trên bảng vàng.\n3. Tọa đàm “Lên tiếng đúng cách” với chuyên viên tâm lý và Công an phường.\n4. Tuần lễ tư vấn tâm lý mở: học sinh có thể đặt lịch gặp trực tiếp hoặc nhắn tin ẩn danh.\n\nMỗi học sinh là một “đại sứ an toàn”. Khi thấy hành vi vi phạm, hãy gửi tố giác qua ứng dụng, danh tính được bảo mật tuyệt đối.` });

  const notifications = [
    { id: 'TB-1', target: 'all', title: 'Phát động tháng cao điểm Trường học an toàn', content: 'Tham gia khảo sát và đấu trường trắc nghiệm để nhận điểm thi đua.', type: 'event', link: 'news', createdAt: iso(-2 * 3600000), readBy: [] },
    { id: 'TB-3', target: 'students', title: 'Khảo sát về bạo lực học đường', content: 'Mời các bạn dành 4 phút tham gia khảo sát ẩn danh phục vụ đề tài nghiên cứu của nhà trường.', type: 'event', link: 'survey', createdAt: iso(-1 * DAY), readBy: [] },
    { id: 'TB-4', target: '2126220004', title: 'Cô Vũ Thị Hường đã trả lời tin nhắn', content: '“Cô đã nhận được bài của Lượng rồi nhé, làm rất tốt!”', type: 'chat', link: 'teacher-chat', createdAt: iso(-40 * 60000), readBy: [] },
  ];

  const scamDb = {
    phones: [
      { number: '+12025550147', reports: 14, note: 'Giả danh nhân viên chuyển phát, yêu cầu bấm phím để nhận bưu kiện', lastReported: iso(-1 * DAY) },
      { number: '0120555014', reports: 9, note: 'Mạo danh giáo viên báo học sinh tai nạn, đòi chuyển viện phí', lastReported: iso(-3 * DAY) },
      { number: '+447700900123', reports: 6, note: 'Tuyển cộng tác viên “việc nhẹ lương cao”, yêu cầu nạp tiền làm nhiệm vụ', lastReported: iso(-6 * DAY) },
    ],
    accounts: [
      { number: '000123456789', bank: 'Ngân hàng mẫu (dữ liệu thử)', reports: 11, note: 'Nhận tiền cọc “làm nhiệm vụ” rồi chặn liên lạc', lastReported: iso(-2 * DAY) },
      { number: '999988887777', bank: 'Ví điện tử mẫu (dữ liệu thử)', reports: 5, note: 'Bán tài khoản game, nhận tiền không giao hàng', lastReported: iso(-8 * DAY) },
    ],
    domains: [
      { domain: 'vietcombank-xacthuc.top', reports: 21, note: 'Trang đăng nhập ngân hàng giả mạo' },
      { domain: 'nhanqua-shopee.vip', reports: 13, note: 'Giả mạo chương trình tri ân khách hàng' },
    ],
  };

  const settings = {
    schoolName: 'Trường THPT Lê Hoàn', shortName: 'Trường THPT Lê Hoàn', slogan: 'Trường học an toàn · Thân thiện · Hạnh phúc', location: 'Gia Lai',
    logo: opts.logo || 'assets/logo-mark.svg', schoolYear: '2026 – 2027', semester: 'Học kỳ I', apiPin: '123456',
    contactPhone: '0269 3846 359 · Khẩn cấp: 111',
    contactEmail: 'thptlehoan@sgddt.gialai.gov.vn',
    contactAddress: 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam',
    facebookUrl: 'https://facebook.com',
    linkedinUrl: 'https://gialai.edu.vn',
    zaloUrl: 'https://zalo.me',
    creatorName: 'Vũ Nguyễn An Khang',
    siteIntro: 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.',
    legalLines: [
      'Đơn vị trực thuộc: Sở Giáo dục và Đào tạo tỉnh Gia Lai · Quyết định thành lập của UBND tỉnh Gia Lai.',
      'Hệ thống Cổng Học Đường Số vận hành phục vụ công tác An toàn trường học, Tư vấn tâm lý học đường & Phổ biến giáo dục pháp luật.',
      'Xác nhận bảo mật thông tin học sinh và tiếp nhận phản ánh trực tuyến theo quy định của Bộ Giáo dục và Đào tạo.',
    ],
    marquee: ['Tháng cao điểm “Trường học an toàn – Nói không với bạo lực học đường” đang diễn ra', 'Gặp nguy hiểm? Gọi ngay Tổng đài 111 (miễn phí 24/7)', 'Tham gia khảo sát ẩn danh về an toàn trường học trong mục Khảo sát', 'Không cung cấp mã OTP cho bất kỳ ai, kể cả người xưng là công an hay nhà trường'],
    modules: { report: true, counseling: true, quiz: true, survey: true, schoolChat: true, teacherChat: true, scam: true, aiChat: true },
    hotlines: [
      { name: 'Tổng đài Quốc gia Bảo vệ Trẻ em', number: '111', note: 'Miễn phí · 24/7' },
      { name: 'Công an', number: '113', note: 'Khẩn cấp an ninh' },
      { name: 'Cấp cứu y tế', number: '115', note: 'Tai nạn, sức khỏe' },
      { name: 'Cứu hỏa & cứu nạn', number: '114', note: 'Cháy nổ, cứu hộ' },
      { name: 'Ban Giám thị nhà trường', number: '0237 385 2299', note: 'Giờ hành chính' },
      { name: 'Phòng Tham vấn Tâm lý', number: '0912 888 999', note: 'Thứ 2 – Thứ 7' },
    ],
    updatedAt: iso(-1 * DAY),
  };

  return {
    meta: { version: 1, createdAt: iso(), seeded: true },
    settings, users, classes,
    reports, records, moods, counseling, quizQuestions, quizAttempts, surveys, surveyResponses,
    schoolChat: { locked: false, lockReason: '', muted: [], warnings: {}, messages: chatMsgs },
    teacherChat, aiGuard, aiLogs, alerts, handbook, news, notifications, counselTeam: defaultCounselTeam(users),
    feedback: [],
    unlockRequests: [],
    scamDb, scamChecks: [], audit: [], faceKeys: [],
  };
}
