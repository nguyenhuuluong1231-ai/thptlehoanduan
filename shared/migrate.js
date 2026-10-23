// Nâng cấp dữ liệu cũ (data/db.json hoặc dữ liệu bản xem trước trong trình duyệt) khi cập nhật phiên bản mới.
// An toàn khi chạy nhiều lần.
import { defaultCounselTeam, CURRENT_SCHOOL_YEAR } from './counsel-team.js';

const TEXT_FIXES = [
  [/Dự án Nghiên cứu Khoa học Kỹ thuật của học sinh THPT Lê Hoàn\./g, 'Đề tài nghiên cứu của học sinh THPT Lê Hoàn.'],
  [/([Kk])hảo sát KH-KT/g, '$1hảo sát'],
  [/Nghiên cứu KH-KT/g, 'Nghiên cứu khoa học'],
  [/đề tài KH-KT/g, 'đề tài nghiên cứu'],
];
const fixText = (v) => (typeof v === 'string' ? TEXT_FIXES.reduce((s, [re, to]) => s.replace(re, to), v) : v);

export function migrateData(d) {
  if (!d || typeof d !== 'object') return false;
  const before = JSON.stringify(d).length;
  let changed = false;
  // Bỏ thông tin khối lớp (không còn dùng)
  for (const k of ['users', 'classes']) for (const x of d[k] || []) if ('block' in x) { delete x.block; changed = true; }
  // Bỏ mục khen thưởng / thành tích
  if ('achievements' in d) { delete d.achievements; changed = true; }
  // Thêm tài khoản giáo viên của 2 thành viên Tổ tâm lý có thể nhắn tin trực tiếp (GV2024101, GV2024102)
  // — cho các cơ sở dữ liệu được tạo từ trước khi có 2 tài khoản này, để nút "Nhắn tin" và cuộc trò chuyện
  // mặc định với tổ tư vấn hiện ra đúng như mong đợi.
  if (Array.isArray(d.users)) {
    const refPw = d.users.find(u => u.role === 'teacher' && u.passwordHash)?.passwordHash;
    const addTeacher = (id, name, title, subject, department, email, phone, counselor = true) => {
      if (d.users.some(u => u.id === id)) return;
      d.users.push({ id, role: 'teacher', name, title, subject, department, ...(counselor ? { counselor: true } : {}), email, phone, avatar: null, passwordHash: refPw || '', tokenVersion: 1, locked: false, failedLoginCount: 0, lockReason: null, mustChangePassword: false, profileComplete: true, createdAt: new Date().toISOString(), lastLogin: null });
      changed = true;
    };
    addTeacher('GV2024101', 'Cô Hoàng Thị Mai Hằng', 'Giáo viên GDCD · Tư vấn học đường', 'GDCD', 'Phòng Tham vấn Tâm lý', 'hang.htm@lehoan.edu.vn', '0913 222 444', true);
    addTeacher('GV2024102', 'Cô Phạm Thị Tiến Quỳnh', 'Y tế học đường', 'Y tế học đường', 'Phòng Y tế', 'quynh.ptt@lehoan.edu.vn', '0913 555 777', true);

    const TEACHER_ROSTER = [
      'Huỳnh Hữu Thừa', 'Nguyễn Văn Tèo', 'Võ Thị Lệ', 'Nguyễn Tuấn', 'Nguyễn Thị Minh Hiển',
      'Đào Thanh Hải', 'Lê Thanh Tuấn', 'Nguyễn Hồng Nhơn', 'Nguyễn Thị Duyền', 'Trần Thị Yến',
      'Trần Thị Ngọc Phước', 'Vũ Đức Cảnh', 'Đỗ Thị Khánh Linh', 'Lê Thanh Xuân', 'Đặng Do',
      'Võ Thị Bình', 'Võ Thị Sen', 'Nguyễn Thị Ngọc', 'Nguyễn Thúy Hằng', 'Bùi Thị Thùy Hương',
      'Lê Đức Đạt', 'Phạm Nguyễn Kim Trang', 'Phạm Thị Tiến Quỳnh', 'Lê Trung Thành', 'Nguyễn Thị Dung',
      'Nguyễn Thị Kim Chinh', 'Nguyễn Thị Thảo', 'Lê Anh Phong', 'Lê Tiến Minh', 'Đoàn Thị Minh Hương',
      'Hoàng Quốc Nam', 'Hoàng Thị Mai', 'Lường Thị Loan', 'Hà Thị Hằng', 'Bùi Quang Vĩnh',
      'Bùi Thị Bình', 'Ksor Than', 'Nguyễn Xuân Huy', 'Hoàng Thị Thanh', 'Nguyễn T.Thảo Trinh',
      'Hoàng Thị Mai Hằng', 'Trần Thị Thu Hằng', 'Thái Thanh Vi', 'Hồ Thị Ngọc Thu', 'Phạm Thị Lệ',
      'Nguyễn Thị Huệ', 'Nguyễn Thị Linh Phụng', 'Trần Mạnh Hùng', 'Trịnh Thị Hồng Vân', 'Trần Danh Tới',
      'Hồ Hữu Thế', 'Trần Văn Tâm', 'Nguyễn Trọng Thuận', 'Nguyễn Thị Thanh Trúc', 'Trần Thị Mộng Thường',
      'Trần Thị Giang', 'Ngô Bảo Ngân', 'Trương Thị Thơ', "K sor H' Quet", 'Nguyễn Thị Hoàn Thiện',
      'Hồ Trung Đàn', 'Nguyễn Thị Thu Thùy', 'Rơ Châm Thiêng', 'Võ Thành Tài', 'Huỳnh Thị Thúy Lâm',
      'Trần Thị Duệ', 'Trần Thị Thủy Tâm',
    ];
    const EXTRA_INFO = {
      'Nguyễn Văn Tèo': { title: 'Phó hiệu trưởng', department: 'Ban Giám hiệu', email: 'teo.nv@lehoan.edu.vn' },
      'Võ Thị Lệ': { title: 'Phó hiệu trưởng', subject: 'Hóa học', department: 'Ban Giám hiệu', email: 'le.vt@lehoan.edu.vn' },
      'Lê Trung Thành': { title: 'Bí thư Đoàn trường', department: 'Đoàn trường', email: 'thanh.lt@lehoan.edu.vn' },
      'Hồ Hữu Thế': { title: 'Phó Bí thư Đoàn trường', subject: 'GD Quốc phòng & An ninh', department: 'Đoàn trường', email: 'the.hh@lehoan.edu.vn' },
      'Trần Thị Thủy Tâm': { title: 'Nhân viên y tế', department: 'Phòng Y tế', email: 'tam.ttt@lehoan.edu.vn' },
      'Huỳnh Thị Thúy Lâm': { title: 'Tổ trưởng VP', subject: 'Ngữ văn', department: 'Văn phòng', email: 'lam.htt@lehoan.edu.vn' },
      'Võ Thị Sen': { title: 'GVCN 12C2', department: 'Hội đồng Sư phạm', email: 'sen.vt@lehoan.edu.vn' },
      'Nguyễn Thị Duyền': { title: 'TTCM Ngữ Văn', subject: 'Ngữ văn', department: 'Tổ Ngữ văn', email: 'duyen.nt@lehoan.edu.vn' },
      'Hồ Thị Ngọc Thu': { title: 'GVCN 10B4', subject: 'Thể dục', department: 'Tổ TD – GDQP', email: 'thu.htn@lehoan.edu.vn' },
      'Trần Thị Thu Hằng': { title: 'GVCN 12C5', department: 'Hội đồng Sư phạm', email: 'hang.ttt@lehoan.edu.vn' },
    };
    const normName = (s) => String(s || '').replace(/^(ThS\.|TS\.|Thầy|Cô|PGS\.)\s*/i, '').trim().toLowerCase();
    const toAscii = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^a-zA-Z0-9\s.]/g, '').toLowerCase();
    const usedEmails = new Set(d.users.map(u => (u.email || '').toLowerCase()).filter(Boolean));
    const makeEmail = (name, preset) => {
      if (preset && !usedEmails.has(preset.toLowerCase())) { usedEmails.add(preset.toLowerCase()); return preset; }
      const parts = toAscii(name).split(/[\s.]+/).filter(Boolean);
      const last = parts.pop() || 'gv';
      const init = parts.map(p => p[0]).join('');
      const base = init ? `${last}.${init}` : last;
      let candidate = `${base}@lehoan.edu.vn`, k = 2;
      while (usedEmails.has(candidate)) { candidate = `${base}${k}@lehoan.edu.vn`; k++; }
      usedEmails.add(candidate);
      return candidate;
    };
    let seq = 1;
    for (const rawName of TEACHER_ROSTER) {
      const target = normName(rawName);
      const existing = d.users.find(u => u.role === 'teacher' && normName(u.name) === target);
      const info = EXTRA_INFO[rawName];
      if (existing) {
        if (info) {
          if (info.title && existing.title !== info.title) { existing.title = info.title; changed = true; }
          if (info.department && existing.department !== info.department) { existing.department = info.department; changed = true; }
        }
        continue;
      }
      let id;
      do { id = `GV2026${String(seq++).padStart(3, '0')}`; } while (d.users.some(u => u.id === id));
      const email = makeEmail(rawName, info?.email);
      addTeacher(id, rawName, info?.title || 'Giáo viên', info?.subject || '', info?.department || 'Hội đồng Sư phạm', email, '', false);
    }
  }
  // Thêm danh sách Tổ tâm lý (phiên bản mới)
  if (Array.isArray(d.users) && !Array.isArray(d.counselTeam)) { d.counselTeam = defaultCounselTeam(d.users); changed = true; }
  // Gắn năm học cho các thành viên Tổ tâm lý cũ (trước khi có tính năng nhiều năm học)
  if (Array.isArray(d.counselTeam)) for (const m of d.counselTeam) if (!m.schoolYear) { m.schoolYear = CURRENT_SCHOOL_YEAR; changed = true; }
  // Cập nhật danh sách Tổ tâm lý 2026-2027 (13 thành viên) và 2025-2026 (11 thành viên) đúng theo quyết định của trường;
  // chỉ 2 thành viên Hoàng Thị Mai Hằng (GV2024101) và Phạm Thị Tiến Quỳnh (GV2024102) có tài khoản nhắn tin & chứng chỉ.
  if (Array.isArray(d.users) && Array.isArray(d.counselTeam)) {
    const defaults = defaultCounselTeam(d.users);
    const need2627 = !d.counselTeam.some(m => m.schoolYear === '2026-2027' && m.name === 'Nguyễn Văn Tèo' && m.role === 'Tổ trưởng') || d.counselTeam.filter(m => m.schoolYear === '2026-2027').length !== 13;
    const need2526 = !d.counselTeam.some(m => m.schoolYear === '2025-2026' && m.name === 'Nguyễn Tuấn Vũ') || d.counselTeam.filter(m => m.schoolYear === '2025-2026').length !== 11;
    if (need2627) {
      d.counselTeam = d.counselTeam.filter(m => m.schoolYear !== '2026-2027').concat(defaults.filter(m => m.schoolYear === '2026-2027'));
      changed = true;
    }
    if (need2526) {
      d.counselTeam = d.counselTeam.filter(m => m.schoolYear !== '2025-2026').concat(defaults.filter(m => m.schoolYear === '2025-2026'));
      changed = true;
    }
    const norm = (s) => String(s || '').replace(/^(ThS\.|TS\.|Thầy|Cô|PGS\.)\s*/i, '').trim().toLowerCase();
    for (const u of d.users) {
      if (u.id === 'GV2024101' || u.id === 'GV2024102') {
        if (!u.counselor) { u.counselor = true; changed = true; }
        if (u.title === 'Y tế học đường' || u.title === 'Tư vấn học đường') { u.title = 'Giáo viên · Tổ tâm lý học đường'; changed = true; }
      } else if (u.counselor) {
        u.counselor = false; changed = true;
      }
    }
    for (const m of d.counselTeam) {
      const k = norm(m.name);
      if (k === 'hoàng thị mai hằng') {
        if (m.userId !== 'GV2024101') { m.userId = 'GV2024101'; changed = true; }
        if (!m.certificate) { m.certificate = 'uploads/certificate-mvfqjrik-dab4f8b0.jpg'; changed = true; }
      } else if (k === 'phạm thị tiến quỳnh') {
        if (m.userId !== 'GV2024102') { m.userId = 'GV2024102'; changed = true; }
        if (!m.certificate) { m.certificate = 'uploads/certificate-mvfqjrin-9c2c572c.jpg'; changed = true; }
      } else {
        if (m.userId) { m.userId = ''; changed = true; }
        if (m.certificate) { m.certificate = null; changed = true; }
      }
    }
  }
  // Tách hộp thư tư vấn tâm lý theo từng chuyên viên (phiên bản mới: 1 chuyên viên 1 cuộc trò chuyện
  // riêng, thay vì 1 hộp thư chung cho tất cả). Hộp thư cũ (trước khi có counselorId) được gắn vào
  // chuyên viên đầu tiên để không mất lịch sử trò chuyện; hộp thư trống cho (các) chuyên viên còn lại
  // sẽ tự được tạo khi học sinh mở trang Tư vấn tâm lý (xem ensureMyThreads trong shared/routes/safety.js).
  if (Array.isArray(d.counseling) && Array.isArray(d.users)) {
    const firstCounselor = d.users.find(u => u.counselor);
    if (firstCounselor) for (const t of d.counseling) if (!t.counselorId) { t.counselorId = firstCounselor.id; changed = true; }
  }
  // Thêm danh sách yêu cầu mở khóa tài khoản (phiên bản mới: tự khóa sau 3 lần sai mật khẩu)
  if (!Array.isArray(d.unlockRequests)) { d.unlockRequests = []; changed = true; }
  for (const u of d.users || []) { if (u.failedLoginCount === undefined) { u.failedLoginCount = 0; changed = true; } if (u.lockReason === undefined) { u.lockReason = u.locked ? 'manual' : null; changed = true; } }
  // Hồ sơ đã đầy đủ hay chưa (tài khoản cũ đều coi như đã đủ; chỉ tài khoản tạo hàng loạt mới cần hoàn tất)
  for (const u of d.users || []) if (u.profileComplete === undefined) { u.profileComplete = true; changed = true; }
  // Xóa các hồ sơ tố giác & biên bản mẫu (seed) để Quản lý tố giác & biên bản vi phạm về mặc định sạch
  const SEED_REPORTS = new Set(['TG-2610-0007', 'TG-2610-0006', 'TG-2610-0005', 'TG-2610-0004', 'TG-2610-0003', 'TG-2610-0002']);
  const SEED_RECORDS = new Set(['BB-2610-003', 'BB-2610-002', 'BB-2610-001', 'BB-2609-014']);
  if (Array.isArray(d.reports) && d.reports.some(r => SEED_REPORTS.has(r.id))) {
    d.reports = d.reports.filter(r => !SEED_REPORTS.has(r.id));
    changed = true;
  }
  if (Array.isArray(d.records) && d.records.some(r => SEED_RECORDS.has(r.id))) {
    d.records = d.records.filter(r => !SEED_RECORDS.has(r.id));
    changed = true;
  }
  if (Array.isArray(d.alerts) && d.alerts.some(a => a.id === 'CB-003' || SEED_REPORTS.has(a.ref))) {
    d.alerts = d.alerts.filter(a => a.id !== 'CB-003' && !SEED_REPORTS.has(a.ref));
    changed = true;
  }
  if (Array.isArray(d.notifications) && d.notifications.some(n => n.id === 'TB-2' || n.id === 'TB-5')) {
    d.notifications = d.notifications.filter(n => n.id !== 'TB-2' && n.id !== 'TB-5');
    changed = true;
  }
  // Xóa toàn bộ tin nhắn mẫu trong kênh chat chung học sinh (đưa về mặc định trống)
  if (d.schoolChat && !d.schoolChat.clearedDefaultV1) {
    d.schoolChat.messages = [];
    d.schoolChat.clearedDefaultV1 = true;
    changed = true;
  }
  // Đưa Nhật ký thao tác & Góp ý ứng dụng về mặc định trống
  if (!d.meta) d.meta = {};
  if (!d.meta.clearedLogsDefaultV1) {
    d.audit = [];
    d.feedback = [];
    d.meta.clearedLogsDefaultV1 = true;
    changed = true;
  }
  // Đưa Top trắc nghiệm tuần / Kết quả thi đấu trắc nghiệm về mặc định trống
  if (!d.meta.clearedQuizAttemptsDefaultV1) {
    d.quizAttempts = [];
    d.meta.clearedQuizAttemptsDefaultV1 = true;
    changed = true;
  }
  // Xóa email tự sinh (@hs.lehoan.edu.vn) của học sinh để học sinh tự nhập
  for (const u of d.users || []) {
    if (u.role === 'student' && typeof u.email === 'string' && /@hs\.lehoan\.edu\.vn$/i.test(u.email.trim())) {
      u.email = '';
      changed = true;
    }
  }
  if (d.settings && d.settings.shortName === 'THPT Lê Hoàn') {
    d.settings.shortName = 'Trường THPT Lê Hoàn';
    changed = true;
  }
  if (d.settings && !d.settings.apiPin) {
    d.settings.apiPin = '123456';
    changed = true;
  }
  if (d.settings) {
    if (!d.settings.contactPhone) { d.settings.contactPhone = '0269 3846 359 · Khẩn cấp: 111'; changed = true; }
    if (!d.settings.contactEmail) { d.settings.contactEmail = 'thptlehoan@sgddt.gialai.gov.vn'; changed = true; }
    if (!d.settings.contactAddress) { d.settings.contactAddress = 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam'; changed = true; }
    if (!d.settings.facebookUrl) { d.settings.facebookUrl = 'https://facebook.com'; changed = true; }
    if (!d.settings.linkedinUrl) { d.settings.linkedinUrl = 'https://gialai.edu.vn'; changed = true; }
    if (!d.settings.zaloUrl) { d.settings.zaloUrl = 'https://zalo.me'; changed = true; }
    if (!d.settings.creatorName) { d.settings.creatorName = 'Vũ Nguyễn An Khang'; changed = true; }
    if (!d.settings.siteIntro) {
      d.settings.siteIntro = 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.';
      changed = true;
    }
    if (!Array.isArray(d.settings.legalLines) || !d.settings.legalLines.length) {
      d.settings.legalLines = [
        'Đơn vị trực thuộc: Sở Giáo dục và Đào tạo tỉnh Gia Lai · Quyết định thành lập của UBND tỉnh Gia Lai.',
        'Hệ thống Cổng Học Đường Số vận hành phục vụ công tác An toàn trường học, Tư vấn tâm lý học đường & Phổ biến giáo dục pháp luật.',
        'Xác nhận bảo mật thông tin học sinh và tiếp nhận phản ánh trực tuyến theo quy định của Bộ Giáo dục và Đào tạo.',
      ];
      changed = true;
    }
  }
  // Bỏ chữ "KH-KT"
  const walk = (o) => { for (const [k, v] of Object.entries(o)) { if (typeof v === 'string') { const n = fixText(v); if (n !== v) { o[k] = n; changed = true; } } else if (v && typeof v === 'object') walk(v); } };
  for (const k of ['settings', 'news', 'notifications', 'surveys']) if (d[k]) walk(d[k]);
  return changed || JSON.stringify(d).length !== before;
}
