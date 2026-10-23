import { fail, raw } from '../router.js';
import { str, num, oneOf, publicUser, brief, findOr404, nowISO, uid, notify, paginate, localDate, nextCode, cleanAttachments, attachSummary, recallView, scrubRecalledNotice } from '../util.js';
import { audit } from '../services.js';
import { REPORT_TYPES, REPORT_STATUS, SEVERITY, RECORD_TYPES, PENALTIES, MOODS, QUIZ_TOPICS, MODULES, NEWS_CATEGORIES } from '../constants.js';
import { reportView } from './safety.js';
import { leaderboard, getQuizGate } from './engage.js';
import { buildXlsx } from '../xlsx.js';
import { dropAllForUser } from '../sessions.js';
import { isCounselTeamTeacher } from '../counsel-team.js';

const fmt = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

export default function adminRoutes(r) {
  const D = 'Quản trị · Tổng quan';
  const U = 'Quản trị · Tài khoản';
  const V = 'Quản trị · Tố giác & biên bản';
  const E = 'Quản trị · Trắc nghiệm & khảo sát';
  const C = 'Quản trị · Tư vấn & AI Guard';
  const N = 'Quản trị · Nội dung & giao diện';
  const X = 'Quản trị · Xuất dữ liệu';

  // ================= TỔNG QUAN =================
  r.get('/api/admin/dashboard', { auth: 'staff', group: D, desc: 'Số liệu tổng hợp, biểu đồ và hoạt động gần đây.' }, async (req, ctx) => {
    const d = ctx.db.data;
    const today = localDate();
    const students = d.users.filter(u => u.role === 'student');
    const days7 = [...Array(7)].map((_, i) => localDate(new Date(Date.now() - (6 - i) * 86400000)));
    const wellbeing7 = days7.map(day => { const l = d.moods.filter(m => localDate(m.at) === day); const pos = l.filter(m => m.mood === 'joyful' || m.mood === 'calm').length; return { day, label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(day + 'T00:00:00').getDay()] + ' ' + day.slice(8) + '/' + day.slice(5, 7), total: l.length, rate: l.length ? Math.round(pos / l.length * 1000) / 10 : null }; });
    const weekAgo = Date.now() - 7 * 86400000;
    const moodWeek = Object.fromEntries(Object.keys(MOODS).map(k => [k, d.moods.filter(m => m.mood === k && new Date(m.at).getTime() > weekAgo).length]));
    const sevRank = { critical: 4, high: 3, medium: 2, low: 1 };
    const reportsByType = Object.entries(REPORT_TYPES).map(([k, t]) => {
      const list = d.reports.filter(x => x.type === k);
      const latestAt = list.reduce((m, x) => ((x.createdAt || '') > m ? x.createdAt : m), '');
      return { key: k, label: t.label, count: list.length, latestAt, sev: sevRank[t.severity] || 0 };
    }).sort((a, b) => b.count - a.count || b.latestAt.localeCompare(a.latestAt) || b.sev - a.sev);
    const reportsByStatus = Object.entries(REPORT_STATUS).map(([k, t]) => ({ key: k, label: t.label, count: d.reports.filter(x => x.status === k).length }));
    const surveyResp = d.surveyResponses.length, surveyTarget = d.surveys.filter(s => s.status === 'active').reduce((a, s) => a + (s.targetCount || 0), 0);
    const myCounsel = req.user.role === 'admin' ? d.counseling : d.counseling.filter(t => t.counselorId === req.user.id);
    return {
      stats: {
        students: students.length, teachers: d.users.filter(u => u.role === 'teacher').length, classes: d.classes.length,
        reportsPending: d.reports.filter(x => x.status === 'pending').length, reportsOpen: d.reports.filter(x => ['pending', 'verifying'].includes(x.status)).length, reportsTotal: d.reports.length,
        surveyResponses: surveyResp, surveyTarget, quizPlays: d.quizAttempts.length, quizPlayers: new Set(d.quizAttempts.map(a => a.userId)).size,
        alertsOpen: d.alerts.filter(a => a.status === 'open').length, counselingUnread: myCounsel.reduce((a, t) => a + (t.unreadStaff || 0), 0), counselingFlagged: myCounsel.filter(t => t.flagged).length,
        scamChecks: d.scamChecks.length, teacherChatUnread: d.teacherChat.filter(t => t.teacherId === req.user.id).reduce((a, t) => a + t.unreadTeacher, 0),
        unlockRequests: (d.unlockRequests || []).filter(x => x.status === 'pending').length,
      },
      charts: { wellbeing7, moodWeek, reportsByType, reportsByStatus },
      recentReports: d.reports.slice(0, 5).map(x => reportView(x, null)),
      alerts: d.alerts.filter(a => a.status === 'open').slice(0, 6),
      audit: d.audit.slice(0, 8),
      leaderboard: leaderboard(ctx.db, { days: 7, limit: 3 }),
    };
  });

  r.get('/api/admin/meta', { auth: 'staff', group: D, desc: 'Danh mục dùng cho form quản trị.' }, async (req, ctx) => ({ reportTypes: REPORT_TYPES, reportStatus: REPORT_STATUS, severity: SEVERITY, recordTypes: RECORD_TYPES, penalties: PENALTIES, moods: MOODS, quizTopics: QUIZ_TOPICS, modules: MODULES, newsCategories: NEWS_CATEGORIES, classes: ctx.db.data.classes }));

  r.post('/api/admin/sync', { auth: 'staff', group: D, desc: 'Đồng bộ toàn bộ dữ liệu: ghi xuống ổ đĩa và yêu cầu mọi thiết bị tải lại.' }, async (req, ctx) => {
    await ctx.db.flush?.();
    const d = ctx.db.data;
    const counts = { users: d.users.length, reports: d.reports.length, records: d.records.length, surveys: d.surveys.length, responses: d.surveyResponses.length, quiz: d.quizAttempts.length, messages: d.schoolChat.messages.length };
    ctx.emit('sync', { at: nowISO(), by: req.user.name }, { all: true });
    audit(ctx, req.user, 'Đồng bộ toàn bộ dữ liệu');
    ctx.db.save();
    return { ok: true, at: nowISO(), counts, message: 'Đã đồng bộ 100% dữ liệu tới tất cả thiết bị.' };
  });

  r.get('/api/admin/audit', { auth: 'staff', group: D, desc: 'Nhật ký hoạt động hệ thống.' }, async (req, ctx) => ({ items: ctx.db.data.audit.slice(0, 200) }));
  r.delete('/api/admin/audit', { auth: 'staff', group: D, desc: 'Xóa toàn bộ nhật ký thao tác hệ thống.' }, async (req, ctx) => {
    ctx.db.data.audit = [];
    ctx.db.save();
    return { ok: true };
  });
  r.get('/api/admin/feedback', { auth: 'staff', group: D, desc: 'Đánh giá, góp ý của người dùng.' }, async (req, ctx) => { const l = ctx.db.data.feedback.map(f => ({ ...f, avatar: ctx.db.data.users.find(u => u.id === f.userId)?.avatar || f.avatar || null })); return { items: l, average: l.length ? Math.round(l.reduce((a, f) => a + f.rating, 0) / l.length * 10) / 10 : null }; });
  r.delete('/api/admin/feedback', { auth: 'staff', group: D, desc: 'Xóa toàn bộ góp ý ứng dụng.' }, async (req, ctx) => {
    ctx.db.data.feedback = [];
    ctx.db.save();
    return { ok: true };
  });
  r.delete('/api/admin/feedback/:id', { auth: 'staff', group: D, desc: 'Xóa một góp ý ứng dụng.' }, async (req, ctx) => {
    const i = ctx.db.data.feedback.findIndex(x => x.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy góp ý.');
    ctx.db.data.feedback.splice(i, 1);
    ctx.db.save();
    return { ok: true };
  });
  r.post('/api/admin/logs/reset', { auth: 'staff', group: D, desc: 'Đặt lại nhật ký thao tác và góp ý ứng dụng về mặc định trống.' }, async (req, ctx) => {
    ctx.db.data.audit = [];
    ctx.db.data.feedback = [];
    ctx.db.save();
    return { ok: true };
  });

  r.post('/api/admin/reset-demo', { auth: 'admin', group: D, desc: 'Khôi phục dữ liệu mẫu ban đầu (chỉ Ban Giám hiệu).' }, async (req, ctx) => { await ctx.reseed(); ctx.emit('sync', { at: nowISO(), reset: true }, { all: true }); return { ok: true, message: 'Đã khôi phục dữ liệu mẫu.' }; });

  // ================= TÀI KHOẢN =================
  r.get('/api/admin/classes', { auth: 'staff', group: U, desc: 'Danh sách lớp và sĩ số.' }, async (req, ctx) => ({ items: ctx.db.data.classes.map(c => ({ ...c, size: ctx.db.data.users.filter(u => u.classId === c.id).length, homeroomName: ctx.db.data.users.find(u => u.id === c.homeroom)?.name })) }));

  r.get('/api/admin/users', { auth: 'staff', group: U, desc: 'Danh sách tài khoản. ?role=student|teacher|admin&classId=&grade=&q=&page=&limit= (grade lọc theo khối, bỏ qua nếu đã có classId)', query: { role: 'student', classId: '', grade: '', q: '' } }, async (req, ctx) => {
    let list = ctx.db.data.users;
    if (req.query.role) list = list.filter(u => u.role === req.query.role);
    if (req.query.classId) list = list.filter(u => u.classId === req.query.classId);
    else if (req.query.grade) {
      const gradeClassIds = new Set(ctx.db.data.classes.filter(c => String(c.grade) === String(req.query.grade)).map(c => c.id));
      list = list.filter(u => gradeClassIds.has(u.classId));
    }
    const res = paginate(list, req.query, ['id', 'name', 'email', 'className', 'title']);
    return { ...res, items: res.items.map(publicUser) };
  });

  r.post('/api/admin/users', { auth: 'staff', group: U, desc: 'Thêm tài khoản học sinh / giáo viên.', body: { id: '2126229999', name: 'Nguyễn Văn A', role: 'student', classId: '12A1', email: '', phone: '', gender: 'Nam', dob: '2009-05-01', password: '123456' } }, async (req, ctx) => {
    const b = req.body;
    const id = str(b.id, 'mã tài khoản', { required: true, max: 30 });
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(id)) fail(400, 'Mã tài khoản chỉ gồm chữ, số, dấu chấm, gạch ngang (3–30 ký tự).');
    if (ctx.db.data.users.some(u => u.id.toLowerCase() === id.toLowerCase())) fail(409, 'Mã tài khoản đã tồn tại.');
    const role = oneOf(b.role, 'vai trò', ['student', 'teacher', 'admin'], 'student');
    if (role === 'admin' && req.user.role !== 'admin') fail(403, 'Chỉ Ban Giám hiệu mới tạo được tài khoản quản trị.');
    const classId = role === 'student' ? oneOf(b.classId, 'lớp', ctx.db.data.classes.map(c => c.id)) : null;
    const avatar = b.avatar && String(b.avatar).startsWith('data:') ? await ctx.storeFile(b.avatar, 'avatar') : (b.avatar ? str(b.avatar, 'ảnh đại diện', { max: 300 }) : null);
    const u = { id, role, name: str(b.name, 'họ tên', { required: true, max: 80 }), classId, className: classId, title: role !== 'student' ? str(b.title, 'chức danh', { max: 80 }) : undefined, subject: str(b.subject, 'môn', { max: 60 }) || undefined, department: role !== 'student' ? (str(b.department, 'tổ / bộ phận', { max: 80 }) || 'Hội đồng Sư phạm') : undefined, email: str(b.email, 'email', { max: 120 }) || '', phone: str(b.phone, 'số điện thoại', { max: 20 }), gender: str(b.gender, 'giới tính', { max: 10 }), dob: str(b.dob, 'ngày sinh', { max: 10 }), hometown: str(b.hometown, 'quê quán', { max: 100 }), avatar, conduct: role === 'student' ? 90 : undefined, passwordHash: await ctx.crypto.hashPassword(str(b.password, 'mật khẩu', { max: 128 }) || '123456'), tokenVersion: 1, locked: false, mustChangePassword: true, profileComplete: true, createdAt: nowISO(), lastLogin: null };
    ctx.db.data.users.push(u);
    audit(ctx, req.user, 'Thêm tài khoản', `${id} · ${u.name}`); ctx.db.save();
    return { item: publicUser(u), message: `Đã tạo tài khoản ${id}.` };
  });

  r.post('/api/admin/users/bulk-generate', { auth: 'staff', group: U, desc: 'Tạo hàng loạt tài khoản học sinh theo số lượng, chưa cần biết họ tên — mã đăng nhập tự sinh dạng {Khối}{Số thứ tự}{Năm} (vd. 100012026). Học sinh bắt buộc đổi mật khẩu và tự điền họ tên + chọn lớp thật ngay lần đăng nhập đầu tiên trước khi vào được ứng dụng.', body: { grade: 10, count: 40, year: 2026, startSeq: 1, password: '123456' } }, async (req, ctx) => {
    const b = req.body;
    const grade = num(b.grade, 'khối', { required: true, min: 1, max: 99 });
    const count = num(b.count, 'số lượng', { required: true, min: 1, max: 500 });
    const year = num(b.year, 'năm', { required: true, min: 2000, max: 2100 });
    const startSeq = num(b.startSeq, 'số thứ tự bắt đầu', { min: 1 }) || 1;
    const password = str(b.password, 'mật khẩu', { max: 128 }) || '123456';
    const gradeDigits = String(grade).padStart(2, '0');
    // Lớp tạm "chưa xếp lớp" riêng cho khối này — chỉ để tài khoản có một lớp hợp lệ trước khi học
    // sinh tự chọn đúng lớp thật của mình ở bước hoàn tất hồ sơ (xem /api/auth/complete-profile).
    // Đánh dấu placeholder:true để KHÔNG hiện trong danh sách lớp cho học sinh chọn (xem /api/classes).
    const placeholderId = `${gradeDigits}-CHUAXEP`;
    let cls = ctx.db.data.classes.find(c => c.id === placeholderId);
    if (!cls) { cls = { id: placeholderId, name: `Khối ${grade} · Chưa xếp lớp`, grade, homeroom: null, room: '', placeholder: true }; ctx.db.data.classes.push(cls); }
    const passwordHash = await ctx.crypto.hashPassword(password);
    const created = [], skipped = [];
    for (let i = 0; i < count; i++) {
      const seq = startSeq + i;
      const id = `${gradeDigits}${String(seq).padStart(3, '0')}${year}`;
      if (ctx.db.data.users.some(u => u.id === id)) { skipped.push(id); continue; }
      const u = {
        id, role: 'student', name: `Học sinh ${id}`, classId: cls.id, className: cls.id, title: undefined, subject: undefined,
        email: '', phone: '', gender: '', dob: '', hometown: '', avatar: null, conduct: 90,
        passwordHash, tokenVersion: 1, locked: false, mustChangePassword: true, profileComplete: false,
        createdAt: nowISO(), lastLogin: null,
      };
      ctx.db.data.users.push(u);
      created.push({ id, password });
    }
    audit(ctx, req.user, 'Tạo hàng loạt tài khoản', `Khối ${grade} · ${created.length} tài khoản · năm ${year}`); ctx.db.save();
    return { created, skipped, classId: cls.id, message: `Đã tạo ${created.length} tài khoản${skipped.length ? `, bỏ qua ${skipped.length} mã đã tồn tại` : ''}.` };
  });

  // Nhập danh sách học sinh có sẵn (họ tên + lớp, ví dụ xuất từ sổ điểm danh) — khác bulk-generate ở chỗ
  // hồ sơ coi như hoàn tất ngay (có tên thật + lớp thật), học sinh chỉ cần đổi mật khẩu lần đăng nhập đầu.
  r.post('/api/admin/users/bulk-import', { auth: 'staff', group: U, desc: 'Nhập danh sách học sinh có sẵn (họ tên + lớp) và tạo tài khoản đầy đủ cho từng em — mã đăng nhập tự sinh theo khối, dạng {Khối}{Số thứ tự}{Năm}, tiếp nối đúng số thứ tự đã dùng (không trùng). Lớp chưa có trong hệ thống sẽ được tạo mới. Hồ sơ coi như đã hoàn tất (có tên thật + lớp thật), học sinh chỉ cần đổi mật khẩu khi đăng nhập lần đầu.', body: { items: [{ name: 'Nguyễn Văn A', classId: '12A1' }], year: 2026, password: '123456' } }, async (req, ctx) => {
    const b = req.body;
    const year = num(b.year, 'năm', { required: true, min: 2000, max: 2100 });
    const password = str(b.password, 'mật khẩu', { max: 128 }) || '123456';
    if (!Array.isArray(b.items) || !b.items.length) fail(400, 'Danh sách học sinh đang trống.');
    if (b.items.length > 2000) fail(400, 'Mỗi lần nhập tối đa 2000 học sinh — vui lòng tách nhỏ danh sách.');
    const rows = b.items.map((it, i) => {
      const name = str(it?.name, `họ tên (dòng ${i + 1})`, { required: true, max: 80 });
      const classId = str(it?.classId, `lớp (dòng ${i + 1})`, { required: true, max: 20 });
      const m = classId.match(/^(\d{1,2})/);
      if (!m) fail(400, `Lớp "${classId}" (dòng ${i + 1}) không xác định được khối — tên lớp phải bắt đầu bằng số khối, ví dụ "10A1".`);
      const grade = Number(m[1]);
      if (grade < 1 || grade > 99) fail(400, `Khối "${grade}" (dòng ${i + 1}, lớp ${classId}) không hợp lệ.`);
      return { name, classId, grade };
    });
    const passwordHash = await ctx.crypto.hashPassword(password);
    const createdClasses = [];
    const nextSeqByGrade = {};
    const seqFor = (grade) => {
      if (nextSeqByGrade[grade] === undefined) {
        const prefix = String(grade).padStart(2, '0');
        const re = new RegExp(`^${prefix}(\\d{3})${year}$`);
        let max = 0;
        for (const u of ctx.db.data.users) { const mm = u.id.match(re); if (mm) max = Math.max(max, Number(mm[1])); }
        nextSeqByGrade[grade] = max + 1;
      }
      return nextSeqByGrade[grade]++;
    };
    const created = [], skipped = [];
    for (const row of rows) {
      let cls = ctx.db.data.classes.find(c => c.id === row.classId);
      if (!cls) { cls = { id: row.classId, name: row.classId, grade: row.grade, homeroom: null, room: '' }; ctx.db.data.classes.push(cls); createdClasses.push(cls.id); }
      const seq = seqFor(row.grade);
      if (seq > 999) { skipped.push({ name: row.name, classId: row.classId, reason: `Khối ${row.grade} đã vượt quá 999 tài khoản trong năm ${year}` }); continue; }
      const id = `${String(row.grade).padStart(2, '0')}${String(seq).padStart(3, '0')}${year}`;
      if (ctx.db.data.users.some(u => u.id === id)) { skipped.push({ name: row.name, classId: row.classId, reason: 'Mã trùng (hiếm gặp)' }); continue; }
      const u = {
        id, role: 'student', name: row.name, classId: row.classId, className: row.classId, title: undefined, subject: undefined,
        email: '', phone: '', gender: '', dob: '', hometown: '', avatar: null, conduct: 90,
        passwordHash, tokenVersion: 1, locked: false, mustChangePassword: true, profileComplete: true,
        createdAt: nowISO(), lastLogin: null,
      };
      ctx.db.data.users.push(u);
      created.push({ id, name: row.name, classId: row.classId, password });
    }
    audit(ctx, req.user, 'Nhập danh sách học sinh', `${created.length} tài khoản${createdClasses.length ? ` · ${createdClasses.length} lớp mới` : ''} · năm ${year}`); ctx.db.save();
    return { created, createdClasses, skipped, message: `Đã tạo ${created.length} tài khoản${createdClasses.length ? `, thêm mới ${createdClasses.length} lớp` : ''}${skipped.length ? `, bỏ qua ${skipped.length} dòng lỗi` : ''}.` };
  });

  r.put('/api/admin/users/:id', { auth: 'staff', group: U, desc: 'Cập nhật thông tin tài khoản.', body: { name: 'Nguyễn Văn A', classId: '12A2', phone: '', email: '' } }, async (req, ctx) => {
    const u = findOr404(ctx.db.data.users, req.params.id, 'tài khoản');
    if (u.role === 'admin' && req.user.role !== 'admin') fail(403, 'Không thể sửa tài khoản quản trị.');
    const b = req.body;
    for (const [k, name, max] of [['name', 'họ tên', 80], ['email', 'email', 120], ['phone', 'số điện thoại', 20], ['gender', 'giới tính', 10], ['dob', 'ngày sinh', 10], ['hometown', 'quê quán', 100], ['title', 'chức danh', 80], ['subject', 'môn', 60], ['department', 'tổ / bộ phận', 80]]) if (b[k] !== undefined) u[k] = str(b[k], name, { max, required: k === 'name' });
    if (b.avatar && String(b.avatar).startsWith('data:')) u.avatar = await ctx.storeFile(b.avatar, 'avatar');
    else if (b.avatar === '' || b.avatar === null) u.avatar = null;
    if (b.avatar !== undefined) {
      if (Array.isArray(ctx.db.data.counselTeam)) {
        for (const m of ctx.db.data.counselTeam) if (m.userId === u.id) m.avatar = u.avatar;
      }
      for (const a of (ctx.db.data.quizAttempts || [])) if (a.userId === u.id) a.avatar = u.avatar;
      for (const f of (ctx.db.data.feedback || [])) if (f.userId === u.id) f.avatar = u.avatar;
      for (const m of (ctx.db.data.schoolChat?.messages || [])) if (!m.anonymous && m.userId === u.id) m.avatar = u.avatar;
    }
    if (b.classId !== undefined && u.role === 'student') { u.classId = oneOf(b.classId, 'lớp', ctx.db.data.classes.map(c => c.id)); u.className = u.classId; }
    if (b.conduct !== undefined && u.role === 'student') u.conduct = num(b.conduct, 'điểm rèn luyện', { min: 0, max: 100 });
    audit(ctx, req.user, 'Sửa tài khoản', u.id); ctx.db.save();
    ctx.emit('profile:update', { user: publicUser(u) }, { all: true });
    return { item: publicUser(u) };
  });

  r.delete('/api/admin/users/:id', { auth: 'admin', group: U, desc: 'Xóa tài khoản (chỉ Ban Giám hiệu).' }, async (req, ctx) => {
    const i = ctx.db.data.users.findIndex(u => u.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy tài khoản.');
    if (ctx.db.data.users[i].id === req.user.id) fail(400, 'Không thể tự xóa tài khoản đang đăng nhập.');
    const [u] = ctx.db.data.users.splice(i, 1);
    audit(ctx, req.user, 'Xóa tài khoản', `${u.id} · ${u.name}`); ctx.db.save();
    return { ok: true };
  });

  r.post('/api/admin/users/:id/reset-password', { auth: 'staff', group: U, desc: 'Đặt lại mật khẩu mặc định 123456 (bắt buộc đổi khi đăng nhập).' }, async (req, ctx) => {
    const u = findOr404(ctx.db.data.users, req.params.id, 'tài khoản');
    if (u.role === 'admin' && req.user.role !== 'admin') fail(403, 'Không thể đặt lại mật khẩu quản trị.');
    u.passwordHash = await ctx.crypto.hashPassword('123456'); u.mustChangePassword = true; u.tokenVersion = (u.tokenVersion || 1) + 1;
    u.failedLoginCount = 0; dropAllForUser(u.id);
    notify(ctx, u.id, { title: 'Mật khẩu đã được đặt lại', content: 'Mật khẩu của bạn đã được đặt về mặc định. Hãy đổi mật khẩu mới ngay sau khi đăng nhập.', type: 'warning' });
    audit(ctx, req.user, 'Đặt lại mật khẩu', u.id); ctx.db.save();
    return { ok: true, password: '123456', message: `Đã đặt lại mật khẩu của ${u.name} về 123456.` };
  });

  r.post('/api/admin/users/:id/lock', { auth: 'staff', group: U, desc: 'Khóa / mở khóa tài khoản thủ công.', body: { locked: true } }, async (req, ctx) => {
    const u = findOr404(ctx.db.data.users, req.params.id, 'tài khoản');
    if (u.id === req.user.id) fail(400, 'Không thể tự khóa tài khoản của mình.');
    if (u.role === 'admin' && req.user.role !== 'admin') fail(403, 'Không thể khóa tài khoản quản trị.');
    u.locked = !!req.body.locked;
    u.lockReason = u.locked ? 'manual' : null; u.lockedAt = u.locked ? nowISO() : null;
    if (u.locked) dropAllForUser(u.id); else u.failedLoginCount = 0;
    if (!u.locked && Array.isArray(ctx.db.data.unlockRequests)) for (const r2 of ctx.db.data.unlockRequests) if (r2.userId === u.id && r2.status === 'pending') { r2.status = 'approved'; r2.handledBy = req.user.name; r2.handledAt = nowISO(); }
    audit(ctx, req.user, u.locked ? 'Khóa tài khoản' : 'Mở khóa tài khoản', u.id); ctx.db.save();
    return { item: publicUser(u) };
  });

  // ================= YÊU CẦU MỞ KHÓA TÀI KHOẢN =================
  r.get('/api/admin/unlock-requests', { auth: 'staff', group: U, desc: 'Danh sách yêu cầu mở khóa tài khoản (học sinh/giáo viên tự khóa do đăng nhập sai 3 lần).' }, async (req, ctx) => ({
    items: [...(ctx.db.data.unlockRequests || [])].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.at.localeCompare(a.at)),
  }));
  r.post('/api/admin/unlock-requests/:id/approve', { auth: 'staff', group: U, desc: 'Duyệt mở khóa tài khoản.' }, async (req, ctx) => {
    const item = findOr404(ctx.db.data.unlockRequests || [], req.params.id, 'yêu cầu');
    const u = ctx.db.data.users.find(x => x.id === item.userId);
    if (u) { u.locked = false; u.lockReason = null; u.lockedAt = null; u.failedLoginCount = 0; }
    item.status = 'approved'; item.handledBy = req.user.name; item.handledAt = nowISO();
    audit(ctx, req.user, 'Duyệt mở khóa tài khoản', item.userId); ctx.db.save();
    return { item, user: u ? publicUser(u) : null };
  });
  r.post('/api/admin/unlock-requests/:id/deny', { auth: 'staff', group: U, desc: 'Từ chối mở khóa tài khoản (vẫn giữ khóa).' }, async (req, ctx) => {
    const item = findOr404(ctx.db.data.unlockRequests || [], req.params.id, 'yêu cầu');
    item.status = 'denied'; item.handledBy = req.user.name; item.handledAt = nowISO();
    audit(ctx, req.user, 'Từ chối mở khóa tài khoản', item.userId); ctx.db.save();
    return { item };
  });

  // ================= TỐ GIÁC & BIÊN BẢN =================
  r.get('/api/admin/reports', { auth: 'staff', group: V, desc: 'Danh sách tố giác. ?status=&severity=&type=&q=', query: { status: '', severity: '', type: '', q: '' } }, async (req, ctx) => {
    let l = ctx.db.data.reports;
    for (const k of ['status', 'severity', 'type']) if (req.query[k]) l = l.filter(x => x[k] === req.query[k]);
    if (req.query.q) { const q = req.query.q.toLowerCase(); l = l.filter(x => (x.id + x.location + x.description).toLowerCase().includes(q)); }
    const order = { critical: 4, high: 3, medium: 2, low: 1 };
    l = [...l].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || order[b.severity] - order[a.severity] || b.createdAt.localeCompare(a.createdAt));
    const all = ctx.db.data.reports;
    return { items: l.map(x => reportView(x, null)), counts: Object.fromEntries(Object.keys(REPORT_STATUS).map(k => [k, all.filter(x => x.status === k).length])) };
  });

  r.get('/api/admin/reports/:id', { auth: 'staff', group: V, desc: 'Chi tiết tố giác kèm bằng chứng và tiến trình.' }, async (req, ctx) => {
    const rep = findOr404(ctx.db.data.reports, req.params.id, 'tố giác');
    return { item: reportView(rep, null), records: ctx.db.data.records.filter(x => x.reportId === rep.id) };
  });

  r.patch('/api/admin/reports/:id', { auth: 'staff', group: V, desc: 'Cập nhật tiến độ xử lý, mức độ, phản hồi cho học sinh.', body: { status: 'verifying', severity: 'high', note: 'Đang trích xuất camera', feedback: 'Nhà trường đã tiếp nhận…' } }, async (req, ctx) => {
    const rep = findOr404(ctx.db.data.reports, req.params.id, 'tố giác');
    const b = req.body;
    const status = b.status ? oneOf(b.status, 'trạng thái', Object.keys(REPORT_STATUS)) : rep.status;
    if (b.severity) rep.severity = oneOf(b.severity, 'mức độ', Object.keys(SEVERITY));
    if (b.feedback !== undefined) rep.feedback = str(b.feedback, 'phản hồi', { max: 2000 });
    const note = str(b.note, 'ghi chú xử lý', { max: 500 });
    if (status !== rep.status || note) rep.timeline.push({ status, note: note || REPORT_STATUS[status].label, by: req.user.name, at: nowISO() });
    rep.status = status; rep.updatedAt = nowISO(); rep.handler = req.user.name;
    if (rep.reporterId) notify(ctx, rep.reporterId, { title: `Tố giác ${rep.id}: ${REPORT_STATUS[status].label}`, content: rep.feedback || note || 'Hồ sơ của bạn vừa được cập nhật.', type: 'report', link: 'report' });
    ctx.emit('report:update', reportView(rep, null), { role: 'staff' });
    audit(ctx, req.user, 'Cập nhật tố giác', `${rep.id} → ${REPORT_STATUS[status].label}`); ctx.db.save();
    return { item: reportView(rep, null) };
  });

  r.delete('/api/admin/reports/:id', { auth: 'staff', group: V, desc: 'Xóa hồ sơ tố giác.' }, async (req, ctx) => {
    const i = ctx.db.data.reports.findIndex(x => x.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy hồ sơ tố giác.');
    const [rep] = ctx.db.data.reports.splice(i, 1);
    if (Array.isArray(ctx.db.data.alerts)) ctx.db.data.alerts = ctx.db.data.alerts.filter(a => a.ref !== rep.id);
    audit(ctx, req.user, 'Xóa tố giác', rep.id); ctx.db.save();
    return { ok: true };
  });

  r.post('/api/admin/reports/reset', { auth: 'staff', group: V, desc: 'Đặt lại danh sách tố giác và biên bản vi phạm về mặc định trống.' }, async (req, ctx) => {
    for (const rec of ctx.db.data.records || []) {
      const s = ctx.db.data.users.find(u => u.id === rec.studentId);
      if (s && rec.points) s.conduct = Math.min(100, (s.conduct ?? 0) + rec.points);
    }
    const reportIds = new Set((ctx.db.data.reports || []).map(x => x.id));
    ctx.db.data.reports = [];
    ctx.db.data.records = [];
    if (Array.isArray(ctx.db.data.alerts)) ctx.db.data.alerts = ctx.db.data.alerts.filter(a => a.source !== 'report' && !reportIds.has(a.ref));
    audit(ctx, req.user, 'Đặt lại tố giác & biên bản', 'Về mặc định trống'); ctx.db.save();
    return { ok: true };
  });

  r.get('/api/admin/records', { auth: 'staff', group: V, desc: 'Sổ biên bản vi phạm. ?studentId=&classId=&q=' }, async (req, ctx) => {
    let l = ctx.db.data.records;
    if (req.query.studentId) l = l.filter(x => x.studentId === req.query.studentId);
    if (req.query.classId) l = l.filter(x => x.className === req.query.classId);
    if (req.query.q) { const q = req.query.q.toLowerCase(); l = l.filter(x => (x.id + x.studentName + x.description).toLowerCase().includes(q)); }
    return { items: [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(x => { const s = ctx.db.data.users.find(u => u.id === x.studentId); return { ...x, studentName: s?.name || x.studentName, studentAvatar: s?.avatar || x.studentAvatar || null, typeName: RECORD_TYPES[x.type] || x.type }; }) };
  });

  r.post('/api/admin/records', { auth: 'staff', group: V, desc: 'Thầy cô lập biên bản vi phạm (kèm ảnh hiện trường / biên bản giấy).', body: { studentId: '2126220028', type: 'fight', location: 'Sân sau', at: '2026-10-18T09:40', description: '…', penalty: 'Viết bản tự kiểm điểm', points: 5, photo: 'data:image/jpeg;base64,…', reportId: '' } }, async (req, ctx) => {
    const b = req.body;
    const s = ctx.db.data.users.find(u => u.id === b.studentId && u.role === 'student');
    if (!s) fail(404, 'Không tìm thấy học sinh.');
    const type = oneOf(b.type, 'loại lỗi', Object.keys(RECORD_TYPES));
    const points = num(b.points, 'điểm trừ', { min: 0, max: 50 }) || 0;
    const rec = { id: nextCode(ctx.db.data.records, 'BB', 3), studentId: s.id, studentName: s.name, className: s.className, type, location: str(b.location, 'địa điểm', { required: true, max: 200 }), at: b.at ? new Date(b.at).toISOString() : nowISO(), description: str(b.description, 'nội dung vi phạm', { required: true, max: 2000 }), penalty: oneOf(b.penalty, 'hình thức xử lý', PENALTIES, 'Nhắc nhở'), points, photo: b.photo ? await ctx.storeFile(b.photo, 'record') : null, reportId: str(b.reportId, 'mã tố giác', { max: 30 }) || null, createdBy: req.user.id, createdByName: req.user.name, createdAt: nowISO() };
    ctx.db.data.records.unshift(rec);
    if (points) s.conduct = Math.max(0, (s.conduct ?? 100) - points);
    if (rec.reportId) { const rep = ctx.db.data.reports.find(x => x.id === rec.reportId); if (rep) { rep.status = 'recorded'; rep.updatedAt = nowISO(); rep.timeline.push({ status: 'recorded', note: `Đã lập biên bản ${rec.id}.`, by: req.user.name, at: nowISO() }); } }
    notify(ctx, s.id, { title: 'Biên bản vi phạm nề nếp', content: `${RECORD_TYPES[type]} tại ${rec.location}. Hình thức: ${rec.penalty}${points ? ` · Trừ ${points} điểm rèn luyện` : ''}.`, type: 'warning', link: 'profile' });
    audit(ctx, req.user, 'Lập biên bản', `${rec.id} · ${s.name}`); ctx.db.save();
    return { item: { ...rec, typeName: RECORD_TYPES[type] }, message: `Đã lập biên bản ${rec.id}.` };
  });

  r.delete('/api/admin/records/:id', { auth: 'staff', group: V, desc: 'Hủy biên bản (hoàn lại điểm rèn luyện đã trừ).' }, async (req, ctx) => {
    const i = ctx.db.data.records.findIndex(x => x.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy biên bản.');
    const [rec] = ctx.db.data.records.splice(i, 1);
    const s = ctx.db.data.users.find(u => u.id === rec.studentId);
    if (s && rec.points) s.conduct = Math.min(100, (s.conduct ?? 0) + rec.points);
    audit(ctx, req.user, 'Hủy biên bản', rec.id); ctx.db.save();
    return { ok: true };
  });

  // ================= TRẮC NGHIỆM =================
  const qInput = (b) => {
    const options = Array.isArray(b.options) ? b.options.map((o, i) => str(o, `phương án ${'ABCD'[i]}`, { required: true, max: 300 })) : [];
    if (options.length !== 4) fail(400, 'Câu hỏi cần đủ 4 phương án A, B, C, D.');
    return { topic: oneOf(b.topic, 'chủ đề', Object.keys(QUIZ_TOPICS)), question: str(b.question, 'nội dung câu hỏi', { required: true, max: 500 }), options, answer: num(b.answer, 'đáp án đúng', { min: 0, max: 3, required: true }), difficulty: oneOf(b.difficulty, 'độ khó', ['Dễ', 'Trung bình', 'Khó'], 'Trung bình'), explanation: str(b.explanation, 'giải thích', { max: 800 }), active: b.active !== false };
  };
  r.get('/api/admin/quiz/questions', { auth: 'staff', group: E, desc: 'Ngân hàng câu hỏi (kèm đáp án). ?topic=&q=' }, async (req, ctx) => {
    let l = ctx.db.data.quizQuestions;
    if (req.query.topic) l = l.filter(q => q.topic === req.query.topic);
    if (req.query.q) { const q = req.query.q.toLowerCase(); l = l.filter(x => x.question.toLowerCase().includes(q)); }
    return { items: l, topics: QUIZ_TOPICS, gate: getQuizGate(ctx.db) };
  });
  r.put('/api/admin/quiz/gate', { auth: 'staff', group: E, desc: 'Cấu hình khóa đấu trường trắc nghiệm và hẹn giờ tự động mở/đóng thi.', body: { locked: true, openAt: '2026-10-23T08:00', closeAt: '', note: 'Đấu trường mở lúc 08:00.' } }, async (req, ctx) => {
    const cur = ctx.db.data.quizConfig || {};
    const openAt = req.body.openAt !== undefined ? str(req.body.openAt, 'giờ mở thi', { max: 40 }) : (cur.openAt || '');
    const closeAt = req.body.closeAt !== undefined ? str(req.body.closeAt, 'giờ đóng thi', { max: 40 }) : (cur.closeAt || '');
    if (openAt && isNaN(new Date(openAt).getTime())) fail(400, 'Thời gian mở thi không hợp lệ.');
    if (closeAt && isNaN(new Date(closeAt).getTime())) fail(400, 'Thời gian đóng thi không hợp lệ.');
    if (openAt && closeAt && new Date(closeAt).getTime() <= new Date(openAt).getTime()) fail(400, 'Giờ đóng thi phải sau giờ mở thi.');
    const locked = req.body.locked !== undefined ? !!req.body.locked : !!cur.locked;
    const note = req.body.note !== undefined ? str(req.body.note, 'ghi chú', { max: 300 }) : (cur.note || '');
    ctx.db.data.quizConfig = { locked, openAt, closeAt, note, updatedAt: nowISO(), updatedBy: req.user.name };
    audit(ctx, req.user, locked ? 'Khóa / hẹn giờ đấu trường trắc nghiệm' : 'Mở đấu trường trắc nghiệm', openAt ? `Mở lúc ${openAt}` : '');
    ctx.db.save();
    ctx.emit('data:changed', { scope: 'quiz' }, { all: true });
    return { gate: getQuizGate(ctx.db) };
  });
  r.post('/api/admin/quiz/questions', { auth: 'staff', group: E, desc: 'Thêm câu hỏi.', body: { topic: 'law', question: '…?', options: ['A', 'B', 'C', 'D'], answer: 0, difficulty: 'Dễ', explanation: '' } }, async (req, ctx) => {
    const n = ctx.db.data.quizQuestions.reduce((m, q) => Math.max(m, parseInt(q.id.replace(/\D/g, '')) || 0), 0) + 1;
    const q = { id: `CH-${String(n).padStart(2, '0')}`, ...qInput(req.body), createdAt: nowISO() };
    ctx.db.data.quizQuestions.push(q); audit(ctx, req.user, 'Thêm câu hỏi', q.id); ctx.db.save();
    return { item: q };
  });
  r.put('/api/admin/quiz/questions/:id', { auth: 'staff', group: E, desc: 'Sửa câu hỏi, phương án, đáp án.' }, async (req, ctx) => {
    const q = findOr404(ctx.db.data.quizQuestions, req.params.id, 'câu hỏi');
    Object.assign(q, qInput({ ...q, ...req.body }), { updatedAt: nowISO() });
    audit(ctx, req.user, 'Sửa câu hỏi', q.id); ctx.db.save();
    return { item: q };
  });
  r.delete('/api/admin/quiz/questions/:id', { auth: 'staff', group: E, desc: 'Xóa câu hỏi.' }, async (req, ctx) => {
    const i = ctx.db.data.quizQuestions.findIndex(q => q.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy câu hỏi.');
    ctx.db.data.quizQuestions.splice(i, 1); audit(ctx, req.user, 'Xóa câu hỏi', req.params.id); ctx.db.save();
    return { ok: true };
  });
  r.get('/api/admin/quiz/attempts', { auth: 'staff', group: E, desc: 'Kết quả thi đấu của học sinh và bảng vàng.' }, async (req, ctx) => {
    const l = [...ctx.db.data.quizAttempts].sort((a, b) => b.at.localeCompare(a.at));
    const items = l.slice(0, 300).map(x => { const u = ctx.db.data.users.find(u => u.id === x.userId); return { ...x, name: u?.name || x.name, className: u?.className || x.className, avatar: u?.avatar || x.avatar || null }; });
    return { items, leaderboard: leaderboard(ctx.db, { days: req.query.period === 'all' ? null : 7, limit: 10 }), average: l.length ? Math.round(l.reduce((a, x) => a + x.score, 0) / l.length) : 0, gate: getQuizGate(ctx.db) };
  });
  r.delete('/api/admin/quiz/attempts', { auth: 'staff', group: E, desc: 'Đặt lại toàn bộ kết quả thi trắc nghiệm và bảng vàng về mặc định trống.' }, async (req, ctx) => {
    ctx.db.data.quizAttempts = [];
    ctx.db.save();
    return { ok: true };
  });
  r.delete('/api/admin/quiz/attempts/:id', { auth: 'staff', group: E, desc: 'Xóa một lượt thi trắc nghiệm.' }, async (req, ctx) => {
    const i = ctx.db.data.quizAttempts.findIndex(a => a.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy lượt thi.');
    ctx.db.data.quizAttempts.splice(i, 1);
    ctx.db.save();
    return { ok: true };
  });

  // ================= KHẢO SÁT =================
  const surveyInput = (b, cur = {}) => {
    const questions = (Array.isArray(b.questions) ? b.questions : cur.questions || []).map((q, i) => {
      const type = oneOf(q.type, 'loại câu hỏi', ['single', 'multi', 'scale', 'text']);
      const options = type === 'scale' ? ['1', '2', '3', '4', '5'] : type === 'text' ? [] : (q.options || []).map(o => str(o, 'phương án', { max: 200 })).filter(Boolean);
      if ((type === 'single' || type === 'multi') && options.length < 2) fail(400, `Câu ${i + 1} cần ít nhất 2 phương án.`);
      return { id: q.id || `q${i + 1}`, type, text: str(q.text, `nội dung câu ${i + 1}`, { required: true, max: 300 }), options, required: q.required !== false && type !== 'text' };
    });
    if (!questions.length) fail(400, 'Phiếu khảo sát cần ít nhất 1 câu hỏi.');
    return { title: str(b.title ?? cur.title, 'tiêu đề', { required: true, max: 200 }), description: str(b.description ?? cur.description, 'mô tả', { max: 1000 }), purpose: oneOf(b.purpose ?? cur.purpose, 'mục đích', ['khkt', 'discipline', 'mental', 'other'], 'other'), anonymous: (b.anonymous ?? cur.anonymous) !== false, target: str(b.target ?? cur.target, 'đối tượng', { max: 120 }) || 'Toàn trường', targetCount: num(b.targetCount ?? cur.targetCount, 'chỉ tiêu', { min: 1, max: 5000 }) || 100, deadline: str(b.deadline ?? cur.deadline, 'hạn chót', { required: true, max: 10 }), status: oneOf(b.status ?? cur.status, 'trạng thái', ['active', 'closed', 'draft'], 'active'), questions };
  };
  r.get('/api/admin/surveys', { auth: 'staff', group: E, desc: 'Danh sách đợt khảo sát và tiến độ thu phiếu.' }, async (req, ctx) => ({ items: ctx.db.data.surveys.map(s => ({ ...s, responses: ctx.db.data.surveyResponses.filter(x => x.surveyId === s.id).length })) }));
  r.post('/api/admin/surveys', { auth: 'staff', group: E, desc: 'Thiết lập đợt khảo sát mới.', body: { title: 'Khảo sát…', description: '', purpose: 'khkt', deadline: '2026-11-30', targetCount: 150, questions: [{ type: 'single', text: 'Bạn học khối nào?', options: ['10', '11', '12'] }] } }, async (req, ctx) => {
    const n = ctx.db.data.surveys.length + 1;
    const s = { id: `KS-${new Date().getFullYear()}-${String(n).padStart(2, '0')}`, ...surveyInput(req.body), createdBy: req.user.id, createdAt: nowISO() };
    while (ctx.db.data.surveys.some(x => x.id === s.id)) s.id += 'A';
    ctx.db.data.surveys.unshift(s);
    if (s.status === 'active') notify(ctx, 'students', { title: 'Khảo sát mới', content: s.title, type: 'survey', link: 'survey' });
    audit(ctx, req.user, 'Tạo khảo sát', s.id); ctx.db.save();
    ctx.emit('data:changed', { scope: 'surveys' }, { all: true });
    return { item: s };
  });
  r.put('/api/admin/surveys/:id', { auth: 'staff', group: E, desc: 'Sửa / đóng đợt khảo sát.' }, async (req, ctx) => {
    const s = findOr404(ctx.db.data.surveys, req.params.id, 'khảo sát');
    Object.assign(s, surveyInput(req.body, s), { updatedAt: nowISO() });
    audit(ctx, req.user, 'Sửa khảo sát', s.id); ctx.db.save();
    ctx.emit('data:changed', { scope: 'surveys' }, { all: true });
    return { item: s };
  });
  r.delete('/api/admin/surveys/:id', { auth: 'staff', group: E, desc: 'Xóa đợt khảo sát và toàn bộ phiếu trả lời.' }, async (req, ctx) => {
    const i = ctx.db.data.surveys.findIndex(s => s.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy khảo sát.');
    ctx.db.data.surveys.splice(i, 1);
    ctx.db.data.surveyResponses = ctx.db.data.surveyResponses.filter(x => x.surveyId !== req.params.id);
    audit(ctx, req.user, 'Xóa khảo sát', req.params.id); ctx.db.save();
    return { ok: true };
  });
  r.get('/api/admin/surveys/:id/results', { auth: 'staff', group: E, desc: 'Kết quả tổng hợp theo từng câu và danh sách phiếu trả lời.' }, async (req, ctx) => {
    const s = findOr404(ctx.db.data.surveys, req.params.id, 'khảo sát');
    const resp = ctx.db.data.surveyResponses.filter(x => x.surveyId === s.id).sort((a, b) => b.at.localeCompare(a.at));
    const summary = s.questions.map(q => {
      if (q.type === 'text') return { ...q, answers: resp.map(x => x.answers[q.id]).filter(Boolean).slice(0, 50) };
      const counts = Object.fromEntries(q.options.map(o => [o, 0]));
      resp.forEach(x => { const v = x.answers[q.id]; (Array.isArray(v) ? v : [v]).forEach(o => { if (o in counts) counts[o]++; }); });
      const avg = q.type === 'scale' ? Math.round(resp.reduce((a, x) => a + (Number(x.answers[q.id]) || 0), 0) / (resp.filter(x => x.answers[q.id]).length || 1) * 100) / 100 : null;
      return { ...q, counts, average: avg, answered: resp.filter(x => x.answers[q.id] && (!Array.isArray(x.answers[q.id]) || x.answers[q.id].length)).length };
    });
    return { survey: s, total: resp.length, summary, responses: resp.slice(0, 200).map(({ userKey, ...x }) => x) };
  });

  // ================= TƯ VẤN TÂM LÝ =================
  // Tin đã thu hồi: chỉ quản trị viên còn xem được nội dung gốc. Mỗi hộp thư gắn với 1 chuyên viên cụ
  // thể (counselorId) để phân biệt khi cùng 1 học sinh có hộp thư riêng với từng người — mỗi tài khoản
  // giáo viên trong Tổ tâm lý chỉ nhìn thấy và xử lý đúng hộp thư gửi riêng cho tài khoản của mình.
  const ensureCounselor = (req, ctx) => { if (!isCounselTeamTeacher(ctx.db.data, req.user)) fail(403, 'Chỉ thành viên Tổ tâm lý học đường mới có quyền truy cập chức năng Tư vấn tâm lý.'); };
  const canSeeCounsel = (t, user) => user?.role === 'admin' || t.counselorId === user?.id;
  const tv = (t, user, ctx) => {
    const { ownerKey, ...x } = t;
    const c = ctx.db.data.users.find(u => u.id === t.counselorId);
    const tm = (ctx.db.data.counselTeam || []).find(m => m.userId === t.counselorId);
    const s = !t.anonymous && t.studentId ? ctx.db.data.users.find(u => u.id === t.studentId) : null;
    return {
      ...x,
      messages: x.messages.map(m => recallView(m, user?.role === 'admin')),
      counselor: c ? { ...brief(c), avatar: c.avatar || tm?.avatar || null } : null,
      student: s ? brief(s) : null,
    };
  };
  r.get('/api/admin/counseling', { auth: 'staff', group: C, desc: 'Hộp thư tư vấn: danh sách học sinh gửi tâm sự / xin trợ giúp (mỗi chuyên viên một hộp thư riêng biệt).' }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const list = ctx.db.data.counseling.filter(t => canSeeCounsel(t, req.user) && t.messages?.length > 0);
    return {
      items: [...list]
        .sort((a, b) => (b.flagged - a.flagged) || b.updatedAt.localeCompare(a.updatedAt))
        .map(t => { const v = tv(t, req.user, ctx); return { ...v, messages: undefined, last: v.messages.at(-1) || null, count: t.messages.length }; }),
    };
  });
  r.get('/api/admin/counseling/:id', { auth: 'staff', group: C, desc: 'Nội dung một hộp thư (đánh dấu đã đọc).' }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const t = findOr404(ctx.db.data.counseling, req.params.id, 'hộp thư');
    if (!canSeeCounsel(t, req.user)) fail(403, 'Hộp thư này được gửi riêng cho chuyên viên khác.');
    if (req.user.id === t.counselorId || req.user.role === 'admin') { t.unreadStaff = 0; ctx.db.save(); }
    return { item: tv(t, req.user, ctx) };
  });
  r.post('/api/admin/counseling/:id/messages', { auth: 'staff', group: C, desc: 'Chuyên viên phản hồi học sinh.', body: { text: 'Thầy đã đọc tin nhắn của em…' } }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const t = findOr404(ctx.db.data.counseling, req.params.id, 'hộp thư');
    if (!canSeeCounsel(t, req.user)) fail(403, 'Bạn chỉ có thể phản hồi hộp thư gửi tới tài khoản của mình.');
    const attachments = cleanAttachments(req.body.attachments);
    const msg = { id: uid('m'), from: 'counselor', name: req.user.name, byId: req.user.id, text: str(req.body.text, 'nội dung', { required: !attachments.length, max: 2000 }), attachments, at: nowISO() };
    t.messages.push(msg); t.unreadStudent = (t.unreadStudent || 0) + 1; t.updatedAt = msg.at; t.hiddenForStudent = false;
    if (t.studentId) msg.notifId = notify(ctx, t.studentId, { title: `${req.user.name} đã phản hồi`, content: (msg.text || `Đã gửi ${attachSummary(attachments)}`).slice(0, 120), type: 'counseling', link: 'counseling' }).id;
    ctx.emit('counseling:reply', { threadId: t.id, counselorId: t.counselorId, message: msg }, { all: true });
    ctx.db.save();
    return { item: tv(t, req.user, ctx) };
  });
  r.post('/api/admin/counseling/:id/messages/:mid/recall', { auth: 'staff', group: C, desc: 'Chuyên viên thu hồi phản hồi đã gửi (học sinh không còn thấy; nhà trường vẫn lưu).' }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const t = findOr404(ctx.db.data.counseling, req.params.id, 'hộp thư');
    if (!canSeeCounsel(t, req.user)) fail(403, 'Bạn không có quyền truy cập hộp thư này.');
    const m = t.messages.find(x => x.id === req.params.mid && x.from === 'counselor');
    if (!m) fail(404, 'Không tìm thấy tin nhắn.');
    if (m.byId ? m.byId !== req.user.id && req.user.role !== 'admin' : m.name !== req.user.name && req.user.role !== 'admin') fail(403, 'Bạn chỉ thu hồi được phản hồi của mình.');
    if (!m.recalled) { m.recalled = true; m.recalledAt = nowISO(); scrubRecalledNotice(ctx.db, m); ctx.emit('counseling:reply', { threadId: t.id, counselorId: t.counselorId, recall: m.id }, { all: true }); ctx.db.save(); }
    return { item: tv(t, req.user, ctx) };
  });
  r.patch('/api/admin/counseling/:id', { auth: 'staff', group: C, desc: 'Đánh dấu cần gặp trực tiếp để can thiệp / đóng hộp thư.', body: { flagged: true, status: 'open' } }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const t = findOr404(ctx.db.data.counseling, req.params.id, 'hộp thư');
    if (!canSeeCounsel(t, req.user)) fail(403, 'Bạn không có quyền cập nhật hộp thư này.');
    if (req.body.flagged !== undefined) t.flagged = !!req.body.flagged;
    if (req.body.status) t.status = oneOf(req.body.status, 'trạng thái', ['open', 'closed']);
    audit(ctx, req.user, t.flagged ? 'Đánh dấu cần can thiệp' : 'Cập nhật hộp thư tư vấn', t.alias); ctx.db.save();
    return { item: tv(t, req.user, ctx) };
  });
  r.delete('/api/admin/counseling/:id', { auth: 'staff', group: C, desc: 'Xóa một cuộc trò chuyện tư vấn tâm lý.' }, async (req, ctx) => {
    ensureCounselor(req, ctx);
    const i = ctx.db.data.counseling.findIndex(x => x.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy hộp thư.');
    if (!canSeeCounsel(ctx.db.data.counseling[i], req.user)) fail(403, 'Bạn chỉ xóa được hộp thư gửi tới tài khoản của mình.');
    const [t] = ctx.db.data.counseling.splice(i, 1);
    audit(ctx, req.user, 'Xóa hộp thư tư vấn', t.alias || t.id); ctx.db.save();
    return { ok: true };
  });

  // ================= AI GUARD =================
  r.get('/api/admin/ai/logs', { auth: 'staff', group: C, desc: 'Nhật ký hội thoại học sinh ↔ Trợ lý AI. ?flagged=1 chỉ lấy hội thoại có cảnh báo.' }, async (req, ctx) => {
    let l = ctx.db.data.aiLogs;
    if (req.query.flagged) l = l.filter(c => c.flagged);
    return { items: l.slice(0, 200).map(c => { const u = ctx.db.data.users.find(x => x.id === c.userId); return { ...c, name: u?.name || c.name, className: u?.className || c.className, avatar: u?.avatar || c.avatar || null, messages: undefined, count: c.messages.length, last: c.messages.filter(m => m.role === 'user').at(-1)?.text || '' }; }) };
  });
  r.get('/api/admin/ai/logs/:id', { auth: 'staff', group: C, desc: 'Chi tiết một hội thoại AI.' }, async (req, ctx) => ({ item: findOr404(ctx.db.data.aiLogs, req.params.id, 'hội thoại') }));
  // ---------- Kết nối AI (Ban Giám hiệu cấu hình ngay trên web, không cần sửa tệp .env) ----------
  const AI_PROVIDERS = [
    { id: 'mirai', name: 'MiraiAPI', note: 'Cổng API tương thích OpenAI · mặc định claude-opus-4.8', models: ['claude-opus-4.8'], keyPlaceholder: 'sk-…', defaultBaseUrl: 'https://api.miraiapi.com/v1' },
    { id: 'anthropic', name: 'Claude (Anthropic)', models: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'], keyUrl: 'https://console.anthropic.com/settings/keys', keyPlaceholder: 'sk-ant-…' },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-2.5-flash', 'gemini-2.5-pro'], keyUrl: 'https://aistudio.google.com/apikey', keyPlaceholder: 'AIza…' },
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o'], keyUrl: 'https://platform.openai.com/api-keys', keyPlaceholder: 'sk-…' },
    { id: 'custom', name: 'Dịch vụ khác', note: 'Groq, OpenRouter, DeepSeek, Ollama… (tương thích OpenAI)', models: [], keyPlaceholder: 'Khóa API (bỏ trống nếu là Ollama trên máy)', needsBaseUrl: true },
  ];
  const aiConfigView = (req, ctx) => {
    const c = ctx.db.data.aiConfig || {};
    return {
      provider: c.provider || '', model: c.model || '', baseUrl: c.baseUrl || '', hasKey: !!c.apiKey, keyHint: c.apiKey ? `••••${c.apiKey.slice(-4)}` : '',
      features: { chat: c.features?.chat !== false, scam: c.features?.scam !== false },
      source: c.provider ? 'admin' : ctx.mode === 'demo' ? (ctx.llm ? 'preview' : 'none') : ctx.envAi ? 'env' : 'none',
      envAvailable: !!ctx.envAi, updatedAt: c.updatedAt || null, updatedBy: c.updatedBy || null,
      status: { enabled: !!ctx.llm, label: ctx.llm?.label || null }, providers: AI_PROVIDERS, mode: ctx.mode || 'server', canEdit: req.user.role === 'admin',
    };
  };
  const readAiBody = (b, cur = {}) => {
    const provider = oneOf(b.provider ?? '', 'nhà cung cấp AI', ['', 'off', 'mirai', 'anthropic', 'gemini', 'openai', 'custom']);
    const baseUrl = str(b.baseUrl, 'địa chỉ máy chủ AI', { max: 200 }).replace(/\/+$/, '');
    if (baseUrl && !/^https?:\/\/[^\s]+$/i.test(baseUrl)) fail(400, 'Địa chỉ máy chủ AI phải bắt đầu bằng http:// hoặc https://');
    const apiKey = b.clearKey ? '' : (typeof b.apiKey === 'string' && b.apiKey.trim() ? b.apiKey.trim() : (cur.provider === provider || !cur.provider ? cur.apiKey || '' : ''));
    if (apiKey.length > 400) fail(400, 'Khóa API không hợp lệ.');
    const c = { provider, model: str(b.model, 'tên mô hình', { max: 80 }), baseUrl, apiKey, features: { chat: b.features?.chat !== false, scam: b.features?.scam !== false } };
    if (['mirai', 'anthropic', 'gemini', 'openai'].includes(provider) && !apiKey) fail(400, 'Vui lòng nhập khóa API.');
    if (provider === 'custom' && !baseUrl) fail(400, 'Vui lòng nhập địa chỉ máy chủ AI (Base URL).');
    return c;
  };
  r.get('/api/admin/ai/config', { auth: 'staff', group: C, desc: 'Cấu hình kết nối AI hiện tại (không trả về khóa API, chỉ 4 ký tự cuối).' }, async (req, ctx) => aiConfigView(req, ctx));
  r.put('/api/admin/ai/config', { auth: 'admin', group: C, desc: 'Lưu cấu hình AI: nhà cung cấp, khóa API, mô hình, bật/tắt từng chức năng. provider: mirai | anthropic | gemini | openai | custom | off | "" (dùng tệp .env). Để trống apiKey để giữ khóa cũ.', body: { provider: 'mirai', apiKey: 'sk-…', model: 'claude-opus-4.8', baseUrl: 'https://api.miraiapi.com/v1', features: { chat: true, scam: true } } }, async (req, ctx) => {
    const cur = ctx.db.data.aiConfig || {};
    const c = readAiBody(req.body, cur);
    ctx.db.data.aiConfig = { ...c, updatedAt: nowISO(), updatedBy: req.user.name };
    ctx.reloadLlm?.();
    // Đồng bộ tức thời tới mọi trình duyệt / app điện thoại đang mở
    ctx.emit('ai:config', { enabled: !!ctx.llm, label: ctx.llm?.label || null, features: { chat: c.features.chat && !!ctx.llm, scam: c.features.scam && !!ctx.llm } }, { all: true });
    audit(ctx, req.user, 'Cấu hình AI', c.provider ? `${c.provider}${c.model ? ' · ' + c.model : ''}` : 'Dùng tệp .env');
    ctx.db.save();
    return aiConfigView(req, ctx);
  });

  r.post('/api/admin/ai/test', { auth: 'staff', group: C, desc: 'Kiểm tra kết nối AI: gửi một câu hỏi ngắn và đo thời gian phản hồi. Gửi kèm cấu hình (provider, apiKey, model, baseUrl) để thử trước khi lưu.', body: {} }, async (req, ctx) => {
    let llm = ctx.llm;
    if (req.body?.provider !== undefined && ctx.makeLlm) {
      const cur = ctx.db.data.aiConfig || {};
      const c = req.body.provider === '' ? null : readAiBody(req.body, cur);
      llm = c ? ctx.makeLlm(c) : ctx.llm;
    }
    if (!llm) return { ok: false, enabled: false, message: req.body?.provider === 'off' ? 'AI đang được chọn là Tắt.' : 'Chưa cấu hình AI. Chọn nhà cung cấp và nhập khóa API.' };
    const t0 = Date.now();
    try {
      const text = await llm({ system: 'Bạn là trợ lý kiểm tra kết nối. Trả lời đúng một câu tiếng Việt thật ngắn.', messages: [{ role: 'user', content: 'Chào bạn, hãy xác nhận bạn đang hoạt động.' }], maxTokens: 60, temperature: 0, purpose: 'test' });
      return { ok: true, enabled: true, provider: llm.provider, model: llm.model, label: llm.label || llm.model, ms: Date.now() - t0, reply: String(text || '').trim().slice(0, 300) };
    } catch (e) {
      return { ok: false, enabled: true, provider: llm.provider, model: llm.model, ms: Date.now() - t0, message: String(e?.message || e).slice(0, 300) };
    }
  });
  r.get('/api/admin/ai/guard', { auth: 'staff', group: C, desc: 'Cấu hình AI Guard: từ khóa nguy hiểm, độ nhạy, hành động tự động.' }, async (req, ctx) => ({ config: ctx.db.data.aiGuard }));
  r.put('/api/admin/ai/guard', { auth: 'staff', group: C, desc: 'Lưu cấu hình AI Guard.', body: { sensitivity: 'high', autoAlert: true, autoHotline: true, autoFilterChat: true, keywords: { mental: 'tự tử, …', violence: '…', weapons: '…', drugs: '…', cyber: '…' } } }, async (req, ctx) => {
    const g = ctx.db.data.aiGuard, b = req.body;
    if (b.sensitivity) g.sensitivity = oneOf(b.sensitivity, 'độ nhạy', ['low', 'medium', 'high']);
    for (const k of ['autoAlert', 'autoHotline', 'autoFilterChat']) if (b[k] !== undefined) g[k] = !!b[k];
    if (b.keywords) for (const k of Object.keys(g.keywords)) if (b.keywords[k] !== undefined) g.keywords[k] = str(b.keywords[k], 'danh sách từ khóa', { max: 3000 });
    g.updatedAt = nowISO(); g.updatedBy = req.user.name;
    audit(ctx, req.user, 'Cập nhật AI Guard'); ctx.db.save();
    return { config: g };
  });
  r.get('/api/admin/alerts', { auth: 'staff', group: C, desc: 'Cảnh báo đỏ / cam / vàng từ AI Guard, tố giác, chat. ?status=open' }, async (req, ctx) => {
    let l = ctx.db.data.alerts; if (req.query.status) l = l.filter(a => a.status === req.query.status);
    return { items: l.slice(0, 200) };
  });
  r.patch('/api/admin/alerts/:id', { auth: 'staff', group: C, desc: 'Đánh dấu cảnh báo đã xử lý.', body: { status: 'handled', note: 'Đã gặp trực tiếp học sinh' } }, async (req, ctx) => {
    const a = findOr404(ctx.db.data.alerts, req.params.id, 'cảnh báo');
    a.status = oneOf(req.body.status, 'trạng thái', ['open', 'handled'], 'handled'); a.handledBy = req.user.name; a.handledAt = nowISO(); a.note = str(req.body.note, 'ghi chú', { max: 500 });
    audit(ctx, req.user, 'Xử lý cảnh báo', a.title); ctx.db.save();
    return { item: a };
  });
  r.get('/api/admin/scam/stats', { auth: 'staff', group: C, desc: 'Thống kê tra cứu lừa đảo và cơ sở dữ liệu cảnh báo.' }, async (req, ctx) => {
    const c = ctx.db.data.scamChecks;
    return { total: c.length, byLevel: { safe: c.filter(x => x.level === 'safe').length, warning: c.filter(x => x.level === 'warning').length, danger: c.filter(x => x.level === 'danger').length }, byKind: Object.fromEntries(['message', 'url', 'phone', 'account'].map(k => [k, c.filter(x => x.kind === k).length])), recent: c.slice(0, 20), db: ctx.db.data.scamDb };
  });

  // ================= CHAT CHUNG: KIỂM DUYỆT =================
  r.get('/api/admin/school-chat', { auth: 'staff', group: C, desc: 'Luồng tin nhắn kênh chung (cả tin đã xóa / bị gắn cờ) và danh sách bị cấm chat.' }, async (req, ctx) => {
    const c = ctx.db.data.schoolChat;
    return { locked: c.locked, lockReason: c.lockReason, muted: c.muted.map(id => ({ ...brief(ctx.db.data.users.find(u => u.id === id) || { id, name: id }), warnings: c.warnings[id] || 0 })), warnings: c.warnings, items: c.messages.slice(-200).map(m => { const u = !m.anonymous && m.userId ? ctx.db.data.users.find(x => x.id === m.userId) : null; return { ...recallView(m, req.user.role === 'admin'), avatar: m.anonymous ? null : (u?.avatar || m.avatar || null), reactions: Object.fromEntries(Object.entries(m.reactions || {}).map(([e, ids]) => [e, ids.length])) }; }) };
  });
  r.delete('/api/admin/school-chat/:id', { auth: 'staff', group: C, desc: 'Gỡ tin nhắn không phù hợp.' }, async (req, ctx) => {
    const m = findOr404(ctx.db.data.schoolChat.messages, req.params.id, 'tin nhắn');
    m.deleted = true; m.deletedBy = req.user.name;
    ctx.emit('school-chat:delete', { id: m.id }, { all: true });
    audit(ctx, req.user, 'Gỡ tin nhắn chat chung', `${m.name}: ${m.text.slice(0, 60)}`); ctx.db.save();
    return { ok: true };
  });
  r.post('/api/admin/school-chat/users/:userId/warn', { auth: 'staff', group: C, desc: 'Cảnh cáo tài khoản vi phạm quy tắc chat.' }, async (req, ctx) => {
    const c = ctx.db.data.schoolChat; const id = req.params.userId;
    c.warnings[id] = (c.warnings[id] || 0) + 1;
    notify(ctx, id, { title: 'Cảnh cáo từ quản trị kênh chat', content: `Bạn nhận cảnh cáo lần ${c.warnings[id]} do vi phạm quy tắc ứng xử trên kênh chat chung.`, type: 'warning' });
    audit(ctx, req.user, 'Cảnh cáo chat', id); ctx.db.save();
    return { warnings: c.warnings[id] };
  });
  r.post('/api/admin/school-chat/users/:userId/mute', { auth: 'staff', group: C, desc: 'Cấm / bỏ cấm chat một tài khoản.', body: { muted: true } }, async (req, ctx) => {
    const c = ctx.db.data.schoolChat; const id = req.params.userId;
    c.muted = c.muted.filter(x => x !== id); if (req.body.muted) c.muted.push(id); else c.warnings[id] = 0;
    audit(ctx, req.user, req.body.muted ? 'Cấm chat' : 'Bỏ cấm chat', id); ctx.db.save();
    return { muted: c.muted };
  });
  r.put('/api/admin/school-chat/lock', { auth: 'staff', group: C, desc: 'Khóa / mở kênh chat chung.', body: { locked: true, reason: 'Tạm khóa trong giờ kiểm tra' } }, async (req, ctx) => {
    const c = ctx.db.data.schoolChat; c.locked = !!req.body.locked; c.lockReason = str(req.body.reason, 'lý do', { max: 200 });
    ctx.emit('school-chat:lock', { locked: c.locked, reason: c.lockReason }, { all: true });
    audit(ctx, req.user, c.locked ? 'Khóa kênh chat' : 'Mở kênh chat'); ctx.db.save();
    return { locked: c.locked, lockReason: c.lockReason };
  });

  // ================= NỘI DUNG: CẨM NANG & BẢN TIN =================
  const crud = (path, key, label, prefix, input) => {
    r.get(`/api/admin/${path}`, { auth: 'staff', group: N, desc: `Danh sách ${label} (kể cả đang ẩn).` }, async (req, ctx) => ({ items: ctx.db.data[key] }));
    r.post(`/api/admin/${path}`, { auth: 'staff', group: N, desc: `Đăng ${label} mới.` }, async (req, ctx) => {
      const item = { id: uid(prefix), ...(await input(req.body, {}, ctx)), views: 0, author: str(req.body.author, 'tác giả', { max: 100 }) || req.user.name, createdAt: nowISO(), updatedAt: nowISO(), publishedAt: nowISO() };
      ctx.db.data[key].unshift(item); audit(ctx, req.user, `Đăng ${label}`, item.title); ctx.db.save();
      if (key === 'news' && item.active) notify(ctx, 'all', { title: 'Bản tin mới', content: item.title, type: 'news', link: 'news' });
      ctx.emit('data:changed', { scope: key }, { all: true });
      return { item };
    });
    r.put(`/api/admin/${path}/:id`, { auth: 'staff', group: N, desc: `Sửa / ghim / ẩn ${label}.` }, async (req, ctx) => {
      const item = findOr404(ctx.db.data[key], req.params.id, label);
      Object.assign(item, await input({ ...item, ...req.body }, item, ctx), { updatedAt: nowISO() });
      if (req.body.author) item.author = str(req.body.author, 'tác giả', { max: 100 });
      audit(ctx, req.user, `Sửa ${label}`, item.title); ctx.db.save();
      ctx.emit('data:changed', { scope: key }, { all: true });
      return { item };
    });
    r.delete(`/api/admin/${path}/:id`, { auth: 'staff', group: N, desc: `Xóa ${label}.` }, async (req, ctx) => {
      const i = ctx.db.data[key].findIndex(x => x.id === req.params.id);
      if (i < 0) fail(404, `Không tìm thấy ${label}.`);
      const [item] = ctx.db.data[key].splice(i, 1); audit(ctx, req.user, `Xóa ${label}`, item.title); ctx.db.save();
      ctx.emit('data:changed', { scope: key }, { all: true });
      return { ok: true };
    });
  };
  crud('handbook', 'handbook', 'bài cẩm nang', 'CD', async (b) => ({ title: str(b.title, 'tiêu đề', { required: true, max: 200 }), category: str(b.category, 'chuyên mục', { required: true, max: 60 }), summary: str(b.summary, 'tóm tắt', { max: 500 }), content: str(b.content, 'nội dung', { required: true, max: 20000 }), pinned: !!b.pinned, active: b.active !== false }));
  crud('news', 'news', 'bản tin', 'N', async (b, cur, ctx) => ({ title: str(b.title, 'tiêu đề', { required: true, max: 200 }), category: oneOf(b.category, 'chuyên mục', Object.keys(NEWS_CATEGORIES)), badge: NEWS_CATEGORIES[b.category], kind: b.kind || 'legal', summary: str(b.summary, 'tóm tắt', { max: 500 }), content: str(b.content, 'nội dung', { required: true, max: 20000 }), cover: b.cover && String(b.cover).startsWith('data:') ? await ctx.storeFile(b.cover, 'cover') : (b.cover || null), pinned: !!b.pinned, active: b.active !== false }));

  // ================= HƯỚNG DẪN TẢI APP =================
  r.put('/api/admin/app-guide', { auth: 'staff', group: N, desc: 'Cập nhật nội dung trang Hướng dẫn tải App.' }, async (req, ctx) => {
    const b = req.body || {};
    const cur = ctx.db.data.appGuide || {};
    const cleanSteps = (arr) => (Array.isArray(arr) ? arr : String(arr || '').split('\n')).map(s => String(s || '').trim()).filter(Boolean).slice(0, 15).map(s => s.slice(0, 500));
    const cleanBenefits = (arr) => (Array.isArray(arr) ? arr : []).map(x => ({
      icon: str(x?.icon, 'biểu tượng', { max: 40 }) || 'sparkles',
      title: str(x?.title, 'tiêu đề lợi ích', { max: 160 }),
      desc: str(x?.desc, 'mô tả lợi ích', { max: 400 }),
    })).filter(x => x.title).slice(0, 8);
    const cleanPlatforms = (arr) => (Array.isArray(arr) ? arr : []).map(p => ({
      id: str(p?.id, 'mã nền tảng', { max: 30 }) || 'platform',
      icon: str(p?.icon, 'biểu tượng', { max: 40 }) || 'smartphone',
      tone: str(p?.tone, 'màu', { max: 20 }) || 'ok',
      title: str(p?.title, 'tiêu đề nền tảng', { max: 120 }),
      badge: str(p?.badge, 'nhãn', { max: 60 }),
      sub: str(p?.sub, 'mô tả phụ', { max: 200 }),
      steps: cleanSteps(p?.steps),
    })).filter(p => p.title).slice(0, 6);
    ctx.db.data.appGuide = {
      title: str(b.title ?? cur.title, 'tiêu đề', { max: 160 }),
      subtitle: str(b.subtitle ?? cur.subtitle, 'mô tả', { max: 500 }),
      qrTitle: str(b.qrTitle ?? cur.qrTitle, 'tiêu đề khung QR', { max: 160 }),
      qrSub: str(b.qrSub ?? cur.qrSub, 'mô tả khung QR', { max: 300 }),
      qrBadge: str(b.qrBadge ?? cur.qrBadge, 'nhãn khung QR', { max: 80 }),
      customUrl: str(b.customUrl ?? cur.customUrl, 'địa chỉ truy cập', { max: 300 }),
      apkUrl: str(b.apkUrl ?? cur.apkUrl, 'link tải APK', { max: 500 }),
      qrNote: str(b.qrNote ?? cur.qrNote, 'ghi chú QR', { max: 400 }),
      benefitsTitle: str(b.benefitsTitle ?? cur.benefitsTitle, 'tiêu đề lợi ích', { max: 160 }),
      benefits: b.benefits !== undefined ? cleanBenefits(b.benefits) : (cur.benefits || null),
      platforms: b.platforms !== undefined ? cleanPlatforms(b.platforms) : (cur.platforms || null),
      serverTitle: str(b.serverTitle ?? cur.serverTitle, 'tiêu đề kết nối máy chủ', { max: 200 }),
      serverText: str(b.serverText ?? cur.serverText, 'nội dung kết nối máy chủ', { max: 1000 }),
      updatedAt: nowISO(),
      updatedBy: req.user.name,
    };
    audit(ctx, req.user, 'Cập nhật Hướng dẫn tải App');
    ctx.db.save();
    ctx.emit('data:changed', { scope: 'appGuide' }, { all: true });
    return { guide: ctx.db.data.appGuide, message: 'Đã lưu nội dung Hướng dẫn tải App.' };
  });

  r.post('/api/admin/app-guide/reset', { auth: 'staff', group: N, desc: 'Đặt nội dung Hướng dẫn tải App về mặc định.' }, async (req, ctx) => {
    delete ctx.db.data.appGuide;
    audit(ctx, req.user, 'Đặt lại Hướng dẫn tải App', 'Về mặc định');
    ctx.db.save();
    ctx.emit('data:changed', { scope: 'appGuide' }, { all: true });
    return { ok: true, guide: null, message: 'Đã khôi phục Hướng dẫn tải App về mặc định.' };
  });

  // ================= TỔ TÂM LÝ =================
  const teamInput = async (b, ctx) => {
    const days = (Array.isArray(b.days) ? b.days : String(b.days || '').split(',')).map(Number).filter(d => d >= 0 && d <= 6);
    const hours = str(b.hours, 'giờ trực', { max: 20 });
    if (hours && !/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(hours)) fail(400, 'Giờ trực có dạng 07:00-11:00.');
    const userId = str(b.userId, 'tài khoản', { max: 40 });
    if (userId && !ctx.db.data.users.some(u => u.id === userId && u.role !== 'student')) fail(400, 'Không tìm thấy tài khoản giáo viên để liên kết.');
    return {
      name: str(b.name, 'họ tên', { required: true, max: 100 }), role: str(b.role, 'vai trò', { max: 60 }) || 'Thành viên', title: str(b.title, 'chức danh', { max: 160 }),
      schoolYear: str(b.schoolYear, 'năm học', { max: 20 }) || '2026-2027',
      userId, phone: str(b.phone, 'điện thoại', { max: 30 }), email: str(b.email, 'email', { max: 120 }), room: str(b.room, 'nơi làm việc', { max: 120 }),
      days: [...new Set(days)].sort(), hours: hours.replace(/\s/g, ''), bio: str(b.bio, 'giới thiệu', { max: 600 }),
      topics: (Array.isArray(b.topics) ? b.topics : String(b.topics || '').split(',')).map(x => String(x).trim()).filter(Boolean).slice(0, 8).map(x => x.slice(0, 40)),
      avatar: b.avatar && String(b.avatar).startsWith('data:') ? await ctx.storeFile(b.avatar, 'avatar') : (b.avatar || null),
      certificate: b.certificate && String(b.certificate).startsWith('data:') ? await ctx.storeFile(b.certificate, 'certificate') : (b.certificate || null),
      order: Number(b.order) || 99, active: b.active !== false,
    };
  };
  const teamList = (ctx) => { if (!Array.isArray(ctx.db.data.counselTeam)) ctx.db.data.counselTeam = []; return ctx.db.data.counselTeam; };
  r.get('/api/admin/counsel-team', { auth: 'staff', group: C, desc: 'Danh sách Tổ tâm lý (kể cả thành viên đang ẩn) và các tài khoản giáo viên có thể liên kết.' }, async (req, ctx) => ({
    items: [...teamList(ctx)].sort((a, b) => (a.order || 99) - (b.order || 99)).map(m => { const u = m.userId ? ctx.db.data.users.find(x => x.id === m.userId) : null; return { ...m, avatar: m.avatar || u?.avatar || null }; }),
    teachers: ctx.db.data.users.filter(u => u.role !== 'student').map(u => ({ id: u.id, name: u.name, title: u.title || '', avatar: u.avatar || null })),
  }));
  r.post('/api/admin/counsel-team', { auth: 'staff', group: C, desc: 'Thêm thành viên Tổ tâm lý.', body: { name: 'Cô Nguyễn Thị A', role: 'Chuyên viên tâm lý', title: '', userId: '', phone: '', email: '', room: 'Phòng Tham vấn', days: [1, 3, 5], hours: '07:00-11:00', topics: ['Áp lực học tập'] } }, async (req, ctx) => {
    const item = { id: uid('TL'), ...(await teamInput(req.body, ctx)), updatedAt: nowISO() };
    if (item.userId) { const u = ctx.db.data.users.find(x => x.id === item.userId); if (u) { if (item.avatar) u.avatar = item.avatar; else if (u.avatar) item.avatar = u.avatar; } }
    teamList(ctx).push(item); audit(ctx, req.user, 'Thêm thành viên Tổ tâm lý', item.name); ctx.db.save();
    ctx.emit('data:changed', { scope: 'counselTeam' }, { all: true });
    return { item };
  });
  r.put('/api/admin/counsel-team/:id', { auth: 'staff', group: C, desc: 'Sửa / ẩn thành viên Tổ tâm lý.' }, async (req, ctx) => {
    const item = findOr404(teamList(ctx), req.params.id, 'thành viên');
    Object.assign(item, await teamInput({ ...item, ...req.body }, ctx), { updatedAt: nowISO() });
    if (item.userId) {
      const u = ctx.db.data.users.find(x => x.id === item.userId);
      if (u) {
        if (req.body.avatar !== undefined) u.avatar = item.avatar || null;
        else if (item.avatar) u.avatar = item.avatar;
        else if (u.avatar) item.avatar = u.avatar;
      }
    }
    audit(ctx, req.user, 'Sửa thành viên Tổ tâm lý', item.name); ctx.db.save();
    ctx.emit('data:changed', { scope: 'counselTeam' }, { all: true });
    return { item };
  });
  r.delete('/api/admin/counsel-team/:id', { auth: 'staff', group: C, desc: 'Xóa thành viên khỏi Tổ tâm lý.' }, async (req, ctx) => {
    const list = teamList(ctx), i = list.findIndex(x => x.id === req.params.id);
    if (i < 0) fail(404, 'Không tìm thấy thành viên.');
    const [item] = list.splice(i, 1); audit(ctx, req.user, 'Xóa thành viên Tổ tâm lý', item.name); ctx.db.save();
    ctx.emit('data:changed', { scope: 'counselTeam' }, { all: true });
    return { ok: true };
  });

  // ================= GIAO DIỆN & CẤU HÌNH =================
  r.get('/api/admin/settings', { auth: 'staff', group: N, desc: 'Cấu hình nhà trường: tên, khẩu hiệu, logo, biểu ngữ, module, đường dây nóng.' }, async (req, ctx) => ({ settings: ctx.db.data.settings, modules: MODULES }));
  r.put('/api/admin/settings', { auth: 'admin', group: N, desc: 'Lưu cấu hình (chỉ Ban Giám hiệu).', body: { schoolName: 'Trường THPT Lê Hoàn', slogan: '…', marquee: ['…'], modules: { aiChat: true }, logo: 'data:image/png;base64,…' } }, async (req, ctx) => {
    const s = ctx.db.data.settings, b = req.body;
    for (const [k, n, max] of [['schoolName', 'tên trường', 120], ['shortName', 'tên ngắn', 60], ['slogan', 'khẩu hiệu', 200], ['location', 'địa phương', 60], ['schoolYear', 'năm học', 20], ['semester', 'học kỳ', 30], ['apiPin', 'mã PIN REST API', 32], ['contactPhone', 'số điện thoại liên hệ', 100], ['contactEmail', 'email liên hệ', 120], ['contactAddress', 'địa chỉ nhà trường', 250], ['facebookUrl', 'link Facebook', 250], ['linkedinUrl', 'link LinkedIn / Cổng thông tin', 250], ['zaloUrl', 'link Zalo', 250], ['creatorName', 'tác giả trang web', 120], ['siteIntro', 'giới thiệu trang web', 600]]) if (b[k] !== undefined) s[k] = str(b[k], n, { max, required: k === 'schoolName' || k === 'apiPin' });
    if (Array.isArray(b.legalLines)) s.legalLines = b.legalLines.map(m => str(m, 'thông tin pháp lý', { max: 300 })).filter(Boolean).slice(0, 6);
    if (Array.isArray(b.marquee)) s.marquee = b.marquee.map(m => str(m, 'nội dung biểu ngữ', { max: 200 })).filter(Boolean).slice(0, 10);
    if (b.modules) for (const k of Object.keys(MODULES)) if (b.modules[k] !== undefined) s.modules[k] = !!b.modules[k];
    if (Array.isArray(b.hotlines)) s.hotlines = b.hotlines.slice(0, 12).map(h => ({ name: str(h.name, 'tên đường dây', { required: true, max: 80 }), number: str(h.number, 'số điện thoại', { required: true, max: 30 }), note: str(h.note, 'ghi chú', { max: 60 }) }));
    if (b.logo === '') s.logo = 'assets/logo-mark.svg';
    else if (b.logo && String(b.logo).startsWith('data:')) s.logo = await ctx.storeFile(b.logo, 'logo');
    s.updatedAt = nowISO();
    ctx.emit('settings', { at: s.updatedAt }, { all: true });
    audit(ctx, req.user, 'Cập nhật giao diện & cấu hình'); ctx.db.save();
    return { settings: s };
  });

  r.get('/api/admin/notifications', { auth: 'staff', group: N, desc: 'Lịch sử thông báo đã phát.' }, async (req, ctx) => ({ items: ctx.db.data.notifications.filter(n => !/^\d|^GV|^admin/.test(n.target)).slice(0, 100).map(({ readBy, ...n }) => ({ ...n, reads: readBy.length })) }));
  r.post('/api/admin/notifications', { auth: 'staff', group: N, desc: 'Phát thông báo toàn trường / theo đối tượng / theo lớp.', body: { target: 'all', title: 'Thông báo nghỉ học', content: '…', type: 'info' } }, async (req, ctx) => {
    const target = str(req.body.target, 'đối tượng', { required: true, max: 40 });
    if (!['all', 'students', 'staff'].includes(target) && !target.startsWith('class:')) fail(400, 'Đối tượng nhận không hợp lệ.');
    const n = notify(ctx, target, { title: str(req.body.title, 'tiêu đề', { required: true, max: 150 }), content: str(req.body.content, 'nội dung', { required: true, max: 2000 }), type: oneOf(req.body.type, 'loại', ['info', 'event', 'warning', 'academic', 'urgent'], 'info') });
    audit(ctx, req.user, 'Phát thông báo', n.title); ctx.db.save();
    return { item: n, message: 'Đã phát thông báo.' };
  });

  // ================= XUẤT EXCEL =================
  const XL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const send = (name, sheets) => raw(buildXlsx(sheets, { title: name }), { 'Content-Type': XL, 'Content-Disposition': `attachment; filename="${name}.xlsx"; filename*=UTF-8''${encodeURIComponent(name)}.xlsx` });
  r.get('/api/admin/export/:dataset', { auth: 'staff', group: X, desc: 'Xuất Excel (.xlsx): users | reports | records | quiz-attempts | quiz-questions | feedback' }, async (req, ctx) => {
    const d = ctx.db.data, ds = req.params.dataset, stamp = localDate();
    if (ds === 'users') return send(`Danh-sach-tai-khoan-${stamp}`, [
      { name: 'Học sinh', columns: [{ key: 'id', label: 'Mã HS', width: 14 }, { key: 'name', label: 'Họ và tên', width: 28 }, { key: 'className', label: 'Lớp', width: 8 }, { key: 'gender', label: 'Giới tính', width: 10 }, { key: 'dob', label: 'Ngày sinh', width: 12 }, { key: 'email', label: 'Email', width: 30 }, { key: 'phone', label: 'Điện thoại', width: 14 }, { key: 'conduct', label: 'Điểm rèn luyện', width: 14 }, { label: 'Trạng thái', value: u => u.locked ? 'Đang khóa' : 'Hoạt động', width: 12 }, { label: 'Đăng nhập gần nhất', value: u => fmt(u.lastLogin), width: 20 }], rows: d.users.filter(u => u.role === 'student') },
      { name: 'Giáo viên & quản trị', columns: [{ key: 'id', label: 'Mã', width: 14 }, { key: 'name', label: 'Họ và tên', width: 28 }, { label: 'Vai trò', value: u => u.role === 'admin' ? 'Quản trị' : 'Giáo viên', width: 12 }, { key: 'title', label: 'Chức danh', width: 34 }, { key: 'department', label: 'Đơn vị', width: 24 }, { key: 'email', label: 'Email', width: 30 }, { key: 'phone', label: 'Điện thoại', width: 14 }], rows: d.users.filter(u => u.role !== 'student') },
    ]);
    if (ds === 'reports') return send(`Ho-so-to-giac-${stamp}`, [{ name: 'Tố giác', columns: [{ key: 'id', label: 'Mã hồ sơ', width: 16 }, { label: 'Thời gian gửi', value: x => fmt(x.createdAt), width: 18 }, { label: 'Loại vi phạm', value: x => REPORT_TYPES[x.type]?.label, width: 30 }, { label: 'Mức độ', value: x => SEVERITY[x.severity]?.label, width: 12 }, { key: 'location', label: 'Địa điểm', width: 30 }, { label: 'Thời điểm xảy ra', value: x => fmt(x.occurredAt), width: 18 }, { key: 'description', label: 'Mô tả', width: 60 }, { label: 'Người gửi', value: x => x.anonymous ? 'Ẩn danh' : x.reporterName, width: 24 }, { label: 'Trạng thái', value: x => REPORT_STATUS[x.status]?.label, width: 16 }, { key: 'feedback', label: 'Kết luận / phản hồi', width: 50 }], rows: d.reports }]);
    if (ds === 'records') return send(`So-bien-ban-vi-pham-${stamp}`, [{ name: 'Biên bản', columns: [{ key: 'id', label: 'Số biên bản', width: 14 }, { label: 'Ngày lập', value: x => fmt(x.createdAt), width: 18 }, { key: 'studentId', label: 'Mã HS', width: 14 }, { key: 'studentName', label: 'Học sinh', width: 26 }, { key: 'className', label: 'Lớp', width: 8 }, { label: 'Loại lỗi', value: x => RECORD_TYPES[x.type], width: 26 }, { key: 'location', label: 'Địa điểm', width: 26 }, { key: 'description', label: 'Nội dung', width: 50 }, { key: 'penalty', label: 'Hình thức xử lý', width: 24 }, { key: 'points', label: 'Điểm trừ', width: 10 }, { key: 'createdByName', label: 'Người lập', width: 24 }], rows: d.records }]);
    if (ds === 'quiz-attempts') return send(`Ket-qua-trac-nghiem-${stamp}`, [{ name: 'Kết quả', columns: [{ label: 'Thời gian', value: x => fmt(x.at), width: 18 }, { key: 'userId', label: 'Mã', width: 14 }, { key: 'name', label: 'Họ tên', width: 26 }, { key: 'className', label: 'Lớp', width: 10 }, { key: 'correct', label: 'Số câu đúng', width: 12 }, { key: 'total', label: 'Tổng số câu', width: 12 }, { key: 'score', label: 'Điểm', width: 8 }, { key: 'duration', label: 'Thời gian (giây)', width: 16 }], rows: [...d.quizAttempts].sort((a, b) => b.at.localeCompare(a.at)) }, { name: 'Bảng vàng tuần', columns: [{ key: 'rank', label: 'Hạng', width: 8 }, { key: 'name', label: 'Họ tên', width: 26 }, { key: 'className', label: 'Lớp', width: 10 }, { key: 'score', label: 'Điểm cao nhất', width: 14 }, { key: 'duration', label: 'Thời gian (giây)', width: 16 }, { key: 'attempts', label: 'Số lượt', width: 10 }], rows: leaderboard(ctx.db, { days: 7, limit: 50 }) }]);
    if (ds === 'quiz-questions') return send(`Ngan-hang-cau-hoi-${stamp}`, [{ name: 'Câu hỏi', columns: [{ key: 'id', label: 'Mã', width: 8 }, { label: 'Chủ đề', value: q => QUIZ_TOPICS[q.topic]?.short, width: 18 }, { key: 'question', label: 'Câu hỏi', width: 60 }, { label: 'A', value: q => q.options[0], width: 30 }, { label: 'B', value: q => q.options[1], width: 30 }, { label: 'C', value: q => q.options[2], width: 30 }, { label: 'D', value: q => q.options[3], width: 30 }, { label: 'Đáp án', value: q => 'ABCD'[q.answer], width: 8 }, { key: 'difficulty', label: 'Độ khó', width: 12 }, { key: 'explanation', label: 'Giải thích', width: 50 }], rows: d.quizQuestions }]);
    if (ds === 'feedback') return send(`Gop-y-ung-dung-${stamp}`, [{ name: 'Góp ý', columns: [{ label: 'Thời gian', value: x => fmt(x.at), width: 18 }, { key: 'name', label: 'Người gửi', width: 26 }, { key: 'rating', label: 'Số sao', width: 8 }, { key: 'comment', label: 'Nội dung', width: 70 }], rows: d.feedback }]);
    fail(404, 'Không có bộ dữ liệu này để xuất.');
  });
  r.get('/api/admin/export/survey/:id', { auth: 'staff', group: X, desc: 'Xuất toàn bộ phiếu khảo sát ra Excel để phân tích định lượng (SPSS, Excel).' }, async (req, ctx) => {
    const s = findOr404(ctx.db.data.surveys, req.params.id, 'khảo sát');
    const resp = ctx.db.data.surveyResponses.filter(x => x.surveyId === s.id);
    const summary = [];
    s.questions.filter(q => q.type !== 'text').forEach(q => q.options.forEach(o => summary.push({ q: q.text, o, n: resp.filter(x => { const v = x.answers[q.id]; return Array.isArray(v) ? v.includes(o) : v === o; }).length })));
    return send(`Khao-sat-${s.id}`, [
      { name: 'Phiếu trả lời', columns: [{ label: 'STT', value: (x) => resp.indexOf(x) + 1, width: 6 }, { label: 'Thời gian', value: x => fmt(x.at), width: 18 }, ...s.questions.map((q, i) => ({ label: `C${i + 1}. ${q.text}`, value: x => x.answers[q.id], width: q.type === 'text' ? 40 : 24 }))], rows: resp },
      { name: 'Tổng hợp', columns: [{ key: 'q', label: 'Câu hỏi', width: 60 }, { key: 'o', label: 'Phương án', width: 40 }, { key: 'n', label: 'Số phiếu', width: 10 }, { label: 'Tỷ lệ (%)', value: x => resp.length ? Math.round(x.n / resp.length * 1000) / 10 : 0, width: 10 }], rows: summary },
    ]);
  });
}
