import { fail } from '../router.js';
import { str, num, publicUser, brief, findOr404, nowISO, uid, notifVisible, localDate, guessMime, ATTACH_TYPES } from '../util.js';
import { leaderboard } from './engage.js';
import { MOODS } from '../constants.js';
import { CURRENT_SCHOOL_YEAR, isCounselTeamTeacher } from '../counsel-team.js';

export default function portalRoutes(r) {
  const P = 'Công khai';
  const H = 'Trang chủ học sinh';
  const C = 'Cá nhân & tiện ích';

  // ---------- Công khai ----------
  r.get('/api/health', { group: P, desc: 'Kiểm tra máy chủ hoạt động.' }, async (req, ctx) => ({ ok: true, app: 'lehoan-portal', mode: ctx.mode || 'server', time: nowISO() }));
  r.get('/api/server-info', { group: P, desc: 'Địa chỉ máy chủ trong mạng nội bộ (Wi-Fi) để mở app trên điện thoại thật.' }, async (req, ctx) => ({ mode: ctx.mode || 'server', lan: ctx.lanUrls ? ctx.lanUrls() : [] }));
  r.get('/api/app-guide', { group: P, desc: 'Nội dung trang Hướng dẫn tải & cài đặt App (kèm địa chỉ mạng LAN).' }, async (req, ctx) => ({ guide: ctx.db.data.appGuide || null, lan: ctx.lanUrls ? ctx.lanUrls() : [] }));

  r.get('/api/settings/public', { group: P, desc: 'Thông tin nhận diện nhà trường, biểu ngữ chạy, module đang bật, đường dây nóng.' }, async (req, ctx) => {
    const s = ctx.db.data.settings;
    return {
      schoolName: s.schoolName, shortName: s.shortName, slogan: s.slogan, location: s.location, logo: s.logo,
      schoolYear: s.schoolYear, semester: s.semester, marquee: s.marquee, modules: s.modules, hotlines: s.hotlines,
      orgSub: s.orgSub || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO TỈNH GIA LAI',
      creatorName: s.creatorName || 'Vũ Nguyễn An Khang',
      creatorRole: s.creatorRole || 'Thiết kế giao diện, kiến trúc bảo mật & phát triển toàn diện Web · App · AI',
      socialLabel: s.socialLabel || 'KẾT NỐI NHÀ TRƯỜNG',
      facebookUrl: s.facebookUrl || 'https://facebook.com',
      linkedinUrl: s.linkedinUrl || 'https://gialai.edu.vn',
      zaloUrl: s.zaloUrl || 'https://zalo.me',
      countryLabel: s.countryLabel || 'Việt Nam',
      verifiedTitle: s.verifiedTitle || 'ĐÃ ĐĂNG KÝ',
      verifiedSub: s.verifiedSub || 'CỔNG HỌC ĐƯỜNG SỐ',
      introCardTitle: s.introCardTitle || 'GIỚI THIỆU TRANG WEB',
      siteIntro: s.siteIntro || 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.',
      phoneCardTitle: s.phoneCardTitle || 'HOTLINE & KHẨN CẤP 24/7',
      contactPhone: s.contactPhone || '0269 3846 359 · Khẩn cấp: 111',
      contactPhoneSub: s.contactPhoneSub || 'Tiếp nhận hỗ trợ & tư vấn trực tuyến',
      emailCardTitle: s.emailCardTitle || 'HỘP THƯ ĐIỆN TỬ',
      contactEmail: s.contactEmail || 'thptlehoan@sgddt.gialai.gov.vn',
      contactEmailSub: s.contactEmailSub || 'Ban Giám hiệu & Tổ Tư vấn học đường',
      addressCardTitle: s.addressCardTitle || 'ĐỊA CHỈ NHÀ TRƯỜNG',
      contactAddress: s.contactAddress || 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam',
      contactAddressSub: s.contactAddressSub || 'Sở Giáo dục và Đào tạo tỉnh Gia Lai',
      copyrightText: s.copyrightText || '',
      termsContent: s.termsContent || '',
      privacyContent: s.privacyContent || '',
      cookiesContent: s.cookiesContent || '',
      legalLines: s.legalLines || [],
    };
  });

  r.post('/api/docs/verify-pin', { group: P, desc: 'Kiểm tra mã PIN truy cập trang Tài liệu REST API.' }, async (req, ctx) => {
    const pin = String(req.body?.pin || '').trim();
    const expected = String(ctx.db.data.settings?.apiPin || '123456').trim();
    if (!pin || pin !== expected) fail(403, 'Mã PIN không đúng. Vui lòng thử lại hoặc liên hệ Quản trị viên.');
    return { ok: true };
  });

  r.get('/api/news', { group: P, desc: 'Danh sách bản tin tuyên truyền. Lọc: ?category=&q=', query: { category: 'scam', q: '' } }, async (req, ctx) => {
    let list = ctx.db.data.news.filter(n => n.active !== false);
    if (req.query.category) list = list.filter(n => n.category === req.query.category || n.kind === req.query.category);
    if (req.query.q) { const q = req.query.q.toLowerCase(); list = list.filter(n => (n.title + n.summary).toLowerCase().includes(q)); }
    list = [...list].sort((a, b) => (b.pinned - a.pinned) || (Boolean(b.cover) - Boolean(a.cover)) || b.publishedAt.localeCompare(a.publishedAt));
    return { items: list.map(({ content, ...n }) => n) };
  });

  r.get('/api/news/:id', { group: P, desc: 'Chi tiết bản tin (tăng lượt xem).' }, async (req, ctx) => {
    const n = findOr404(ctx.db.data.news, req.params.id, 'bản tin');
    n.views = (n.views || 0) + 1; ctx.db.save();
    const related = ctx.db.data.news.filter(x => x.id !== n.id && x.active !== false && (x.category === n.category || x.kind === n.kind)).slice(0, 3).map(({ content, ...x }) => x);
    return { item: n, related };
  });

  r.get('/api/handbook', { group: P, desc: 'Cẩm nang học đường & kỹ năng ứng phó.' }, async (req, ctx) => {
    const list = ctx.db.data.handbook.filter(h => h.active !== false).sort((a, b) => (b.pinned - a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
    return { items: list.map(({ content, ...h }) => h), hotlines: ctx.db.data.settings.hotlines };
  });

  r.get('/api/handbook/:id', { group: P, desc: 'Chi tiết bài cẩm nang.' }, async (req, ctx) => {
    const h = findOr404(ctx.db.data.handbook, req.params.id, 'bài cẩm nang');
    h.views = (h.views || 0) + 1; ctx.db.save();
    return { item: h };
  });

  // ---------- Trang chủ học sinh ----------
  r.get('/api/me/dashboard', { auth: 'student', group: H, desc: 'Dữ liệu tổng hợp cho trang chủ học sinh: cảm xúc hôm nay, tố giác của tôi, khảo sát đang mở, bảng vàng, thông báo, tin mới.' }, async (req, ctx) => {
    const u = req.user, d = ctx.db.data;
    const todayStr = localDate();
    const moodToday = d.moods.filter(m => m.userId === u.id && localDate(m.at) === todayStr).sort((a, b) => b.at.localeCompare(a.at))[0] || null;
    const unread = d.notifications.filter(n => notifVisible(n, u) && !n.readBy.includes(u.id)).length;
    const teacherUnread = d.teacherChat.filter(t => t.studentId === u.id).reduce((a, t) => a + (t.unreadStudent || 0), 0);
    const anonKey = await ctx.crypto.hmac('anon-reporter', u.id);
    const mine = d.reports.filter(x => x.reporterId === u.id || x.reporterKey === anonKey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const counselKey = await ctx.crypto.hmac('counsel-owner', u.id);
    const myCounseling = d.counseling.filter(t => t.ownerKey === counselKey);
    const surveys = [];
    for (const s of d.surveys.filter(s => s.status === 'active' && s.deadline >= todayStr)) {
      const key = await ctx.crypto.hmac('survey', `${s.id}:${u.id}`);
      surveys.push({ id: s.id, title: s.title, purpose: s.purpose, deadline: s.deadline, questionCount: s.questions.length, done: d.surveyResponses.some(x => x.surveyId === s.id && x.userKey === key) });
    }
    const myAttempts = d.quizAttempts.filter(a => a.userId === u.id);
    const news = d.news.filter(n => n.active !== false).sort((a, b) => (b.pinned - a.pinned) || (Boolean(b.cover) - Boolean(a.cover)) || b.publishedAt.localeCompare(a.publishedAt)).slice(0, 12).map(({ content, ...n }) => n);
    return {
      user: publicUser(u), moodToday, unread, teacherUnread, news,
      reports: { total: mine.length, open: mine.filter(x => ['pending', 'verifying'].includes(x.status)).length, latest: mine[0] ? { id: mine[0].id, type: mine[0].type, status: mine[0].status, updatedAt: mine[0].updatedAt } : null },
      counseling: { unread: myCounseling.reduce((a, t) => a + (t.unreadStudent || 0), 0), started: myCounseling.some(t => t.messages.some(m => m.from === 'student')) },
      surveys: { open: surveys.filter(s => !s.done).length, items: surveys.slice(0, 3) },
      quiz: { attempts: myAttempts.length, best: myAttempts.reduce((m, a) => Math.max(m, a.score), 0), top: leaderboard(ctx.db, { days: 7, limit: 3 }) },
    };
  });

  // ---------- Tải tệp đính kèm (ảnh, video, tài liệu) ----------
  r.post('/api/uploads', { auth: 'user', group: C, desc: 'Tải lên một tệp đính kèm cho tin nhắn: ảnh, video, ghi âm, PDF, Word, Excel, PowerPoint, ZIP (tối đa 25 MB). Gửi JSON {name, type, data: data URL base64}.', body: { name: 'bai-tap.pdf', type: 'application/pdf', data: 'data:application/pdf;base64,JVBERi0xLjQK' } }, async (req, ctx) => {
    const name = str(req.body.name, 'tên tệp', { required: true, max: 160 }).replace(/[\\/:*?"<>|]+/g, '_');
    const type = guessMime(name, req.body.type);
    if (!ATTACH_TYPES[type]) fail(415, 'Định dạng tệp chưa được hỗ trợ. Hãy gửi ảnh, video, ghi âm, PDF, Word, Excel, PowerPoint, TXT hoặc ZIP.');
    if (typeof req.body.data !== 'string' || !req.body.data.startsWith('data:')) fail(400, 'Thiếu dữ liệu tệp.');
    if (!ctx.storeUpload) fail(501, 'Máy chủ chưa hỗ trợ tải tệp.');
    const file = await ctx.storeUpload({ name, type, data: req.body.data });
    return { file: { ...file, name, type, kind: ATTACH_TYPES[type][1] } };
  });

  // ---------- Chấm đỏ: tin nhắn & thông báo chưa đọc ----------
  const SEEN_KEYS = ['schoolChat'];
  const DEFAULT_LOOKBACK = 24 * 3600000; // lần đầu: tính tin trong 24 giờ gần nhất
  r.get('/api/me/badges', { auth: 'user', group: C, desc: 'Số tin nhắn / thông báo chưa đọc để hiện chấm đỏ trên menu: thông báo, chat toàn trường, chat giáo viên, tư vấn.' }, async (req, ctx) => {
    const u = req.user, d = ctx.db.data;
    const notifications = d.notifications.filter(n => notifVisible(n, u) && !n.readBy.includes(u.id)).length;
    const since = u.seen?.schoolChat || new Date(Date.now() - DEFAULT_LOOKBACK).toISOString();
    const schoolChat = d.schoolChat.messages.filter(m => m.at > since && m.userId !== u.id && !m.deleted).length;
    let teacherChat, counseling;
    if (u.role === 'student') {
      teacherChat = d.teacherChat.filter(t => t.studentId === u.id).reduce((a, t) => a + (t.unreadStudent || 0), 0);
      const key = await ctx.crypto.hmac('counsel-owner', u.id);
      counseling = d.counseling.filter(t => t.ownerKey === key).reduce((a, t) => a + (t.unreadStudent || 0), 0);
    } else {
      teacherChat = d.teacherChat.filter(t => t.teacherId === u.id).reduce((a, t) => a + (t.unreadTeacher || 0), 0);
      counseling = isCounselTeamTeacher(d, u)
        ? d.counseling.filter(t => (u.role === 'admin' || t.counselorId === u.id) && t.messages?.length > 0).reduce((a, t) => a + (t.unreadStaff || 0), 0)
        : 0;
    }
    return { notifications, schoolChat, teacherChat, counseling, messages: schoolChat + teacherChat + counseling, total: notifications + schoolChat + teacherChat + counseling };
  });

  r.post('/api/me/seen', { auth: 'user', group: C, desc: 'Đánh dấu đã xem một mục (tắt chấm đỏ). key: schoolChat', body: { key: 'schoolChat' } }, async (req, ctx) => {
    const key = req.body?.key;
    if (!SEEN_KEYS.includes(key)) fail(400, 'Mục không hợp lệ.');
    const prev = req.user.seen?.[key] || '';
    const latest = (ctx.db.data.schoolChat?.messages || []).at(-1)?.at || '';
    const now = nowISO();
    req.user.seen = { ...(req.user.seen || {}), [key]: now };
    if (!prev || (latest && latest > prev)) ctx.db.save();
    return { ok: true, key, at: now };
  });

  // ---------- Cá nhân ----------
  r.get('/api/notifications', { auth: 'user', group: C, desc: 'Thông báo của tôi.' }, async (req, ctx) => {
    const items = ctx.db.data.notifications.filter(n => notifVisible(n, req.user)).slice(0, 60).map(({ readBy, ...n }) => ({ ...n, unread: !readBy.includes(req.user.id) }));
    return { items, unread: items.filter(n => n.unread).length };
  });
  r.post('/api/notifications/:id/read', { auth: 'user', group: C, desc: 'Đánh dấu đã đọc một thông báo.' }, async (req, ctx) => {
    const n = findOr404(ctx.db.data.notifications, req.params.id, 'thông báo');
    if (!n.readBy.includes(req.user.id)) n.readBy.push(req.user.id);
    ctx.db.save(); return { ok: true };
  });
  r.post('/api/notifications/read-all', { auth: 'user', group: C, desc: 'Đánh dấu tất cả thông báo đã đọc.' }, async (req, ctx) => {
    ctx.db.data.notifications.forEach(n => { if (notifVisible(n, req.user) && !n.readBy.includes(req.user.id)) n.readBy.push(req.user.id); });
    ctx.db.save(); return { ok: true };
  });

  r.get('/api/classes', { auth: 'user', group: C, desc: 'Danh sách lớp thật (ẩn các lớp tạm "chưa xếp lớp") — dùng cho form hoàn tất hồ sơ.' }, async (req, ctx) =>
    ({ items: ctx.db.data.classes.filter(c => !c.placeholder).map(c => ({ id: c.id, name: c.name, grade: c.grade })) }));

  r.get('/api/profile', { auth: 'user', group: C, desc: 'Hồ sơ cá nhân đầy đủ.' }, async (req, ctx) => {
    const u = req.user;
    const cls = ctx.db.data.classes.find(c => c.id === u.classId);
    const homeroomUser = cls ? ctx.db.data.users.find(x => x.id === cls.homeroom) : null;
    const homeroom = u.homeroomName ? { id: homeroomUser?.id || '', name: u.homeroomName } : (homeroomUser ? brief(homeroomUser) : null);
    const classes = ctx.db.data.classes.filter(c => !c.placeholder).map(c => c.id);
    const teachers = ctx.db.data.users.filter(x => x.role === 'teacher' && !x.locked).map(x => x.name);
    return { user: publicUser(u), class: cls || null, homeroom, classes, teachers, faceDevices: ctx.db.data.faceKeys.filter(f => f.userId === u.id).map(f => ({ id: f.id, device: f.device, createdAt: f.createdAt })) };
  });
  r.put('/api/profile', { auth: 'user', group: C, desc: 'Cập nhật thông tin hồ sơ cá nhân (họ tên, lớp, niên khóa, ngày sinh, giới tính, quê quán, giáo viên chủ nhiệm, số điện thoại, email, ảnh đại diện).', body: { name: 'Nguyễn Hoàng Hữu Lượng', classId: '12A1', courseYear: '2024 – 2027', dob: '2009-08-15', gender: 'Nam', hometown: 'Đức Cơ, Gia Lai', homeroomName: 'Võ Thị Sen', phone: '0987 654 321', email: 'hs@lehoan.edu.vn', avatar: 'data:image/jpeg;base64,…' } }, async (req, ctx) => {
    const u = req.user, b = req.body || {};
    if (b.name !== undefined) u.name = str(b.name, 'họ và tên', { required: true, max: 80 });
    if (b.classId !== undefined && u.role === 'student') {
      const cid = str(b.classId, 'lớp', { required: true, max: 20 });
      u.classId = cid;
      u.className = cid;
      if (!ctx.db.data.classes.some(c => c.id === cid)) {
        const g = parseInt(cid.match(/^\d{1,2}/)?.[0] || '10', 10);
        ctx.db.data.classes.push({ id: cid, name: cid, grade: g, homeroom: null, room: '' });
      }
    }
    if (b.courseYear !== undefined) u.courseYear = str(b.courseYear, 'niên khóa', { max: 40 });
    if (b.dob !== undefined) u.dob = str(b.dob, 'ngày sinh', { max: 20 });
    if (b.gender !== undefined) u.gender = str(b.gender, 'giới tính', { max: 20 });
    if (b.hometown !== undefined) u.hometown = str(b.hometown, 'quê quán', { max: 120 });
    if (b.homeroomName !== undefined) {
      u.homeroomName = str(b.homeroomName, 'giáo viên chủ nhiệm', { max: 80 });
      const cls = ctx.db.data.classes.find(c => c.id === u.classId);
      const t = ctx.db.data.users.find(x => x.role === 'teacher' && x.name.toLowerCase() === u.homeroomName.toLowerCase());
      if (cls && t) cls.homeroom = t.id;
    }
    if (b.phone !== undefined) { const p = str(b.phone, 'số điện thoại', { max: 20 }); if (p && !/^[+\d][\d .]{7,18}$/.test(p)) fail(400, 'Số điện thoại không hợp lệ.'); u.phone = p; }
    if (b.email !== undefined) { const e = str(b.email, 'email', { max: 120 }); if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) fail(400, 'Email không hợp lệ.'); u.email = e; }
    if (b.avatar) {
      u.avatar = await ctx.storeFile(b.avatar, 'avatar');
    } else if (b.avatar === '' || b.avatar === null) {
      u.avatar = null;
    }
    if (b.avatar !== undefined) {
      if (Array.isArray(ctx.db.data.counselTeam)) {
        for (const m of ctx.db.data.counselTeam) if (m.userId === u.id) m.avatar = u.avatar;
      }
      for (const a of (ctx.db.data.quizAttempts || [])) if (a.userId === u.id) a.avatar = u.avatar;
      for (const f of (ctx.db.data.feedback || [])) if (f.userId === u.id) f.avatar = u.avatar;
      for (const m of (ctx.db.data.schoolChat?.messages || [])) if (!m.anonymous && m.userId === u.id) m.avatar = u.avatar;
    }
    ctx.db.save();
    ctx.emit('profile:update', { user: publicUser(u) }, { all: true }); // đồng bộ ảnh đại diện và hồ sơ sang mọi thiết bị
    const cls = ctx.db.data.classes.find(c => c.id === u.classId);
    const homeroomUser = cls ? ctx.db.data.users.find(x => x.id === cls.homeroom) : null;
    const homeroom = u.homeroomName ? { id: homeroomUser?.id || '', name: u.homeroomName } : (homeroomUser ? brief(homeroomUser) : null);
    return { user: publicUser(u), homeroom };
  });

  r.get('/api/my-records', { auth: 'student', group: C, desc: 'Biên bản vi phạm của bản thân (nếu có).' }, async (req, ctx) => ({ items: ctx.db.data.records.filter(x => x.studentId === req.user.id) }));

  r.post('/api/feedback', { auth: 'user', group: C, desc: 'Đánh giá, góp ý chất lượng ứng dụng.', body: { rating: 5, comment: 'Ứng dụng rất hữu ích!' } }, async (req, ctx) => {
    const fb = { id: uid('GY'), userId: req.user.id, name: req.user.name, avatar: req.user.avatar || null, rating: num(req.body.rating, 'số sao', { min: 1, max: 5, required: true }), comment: str(req.body.comment, 'góp ý', { max: 1000 }), at: nowISO() };
    ctx.db.data.feedback.unshift(fb); ctx.db.save();
    return { item: fb, message: 'Cảm ơn bạn đã góp ý! Nhà trường sẽ ghi nhận để cải thiện ứng dụng.' };
  });

  r.get('/api/teachers', { auth: 'user', group: C, desc: 'Danh sách giáo viên có thể nhắn tin.' }, async (req, ctx) => ({ items: ctx.db.data.users.filter(u => u.role === 'teacher' && !u.locked).map(u => {
    const tmAvatar = (ctx.db.data.counselTeam || []).find(m => m.userId === u.id && m.avatar)?.avatar || null;
    return { ...brief(u), avatar: u.avatar || tmAvatar, subject: u.subject, department: u.department, phone: u.phone || '', email: u.email || '', counselor: !!u.counselor };
  }) }));

  r.get('/api/counsel-team', { auth: 'user', group: C, desc: 'Danh sách Tổ tâm lý học đường theo năm học: thành viên, lịch trực, lĩnh vực hỗ trợ (thành viên có tài khoản thì nhắn tin trực tiếp được). Query ?year=2025-2026 để xem năm học trước; mặc định là năm học hiện hành.' }, async (req, ctx) => {
    const users = ctx.db.data.users;
    const all = (ctx.db.data.counselTeam || []).filter(m => m.active !== false);
    const years = [...new Set(all.map(m => m.schoolYear || CURRENT_SCHOOL_YEAR))].sort().reverse();
    const year = req.query?.year && years.includes(req.query.year) ? req.query.year : (years[0] || CURRENT_SCHOOL_YEAR);
    const items = all.filter(m => (m.schoolYear || CURRENT_SCHOOL_YEAR) === year).sort((a, b) => (a.order || 99) - (b.order || 99)).map(m => {
      const u = m.userId && users.find(x => x.id === m.userId && x.role !== 'student' && !x.locked);
      return { id: m.id, name: m.name, role: m.role, title: m.title, phone: m.phone, email: m.email, room: m.room, days: m.days || [], hours: m.hours || '', topics: m.topics || [], bio: m.bio, avatar: m.avatar || u?.avatar || null, certificate: m.certificate || null, userId: u ? u.id : '' };
    });
    return { items, year, years };
  });

  r.get('/api/meta', { group: P, desc: 'Danh mục dùng chung: loại cảm xúc…' }, async () => ({ moods: MOODS }));
}
