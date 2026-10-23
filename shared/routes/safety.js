import { fail } from '../router.js';
import { str, oneOf, findOr404, nowISO, uid, notify, localDate, nextCode, cleanAttachments, recallView } from '../util.js';
import { moduleOn, raiseAlert } from '../services.js';
import { REPORT_TYPES, REPORT_STATUS, MOODS } from '../constants.js';
import { scanGuard } from '../ai/guard.js';
import { COUNSEL_TOPICS } from '../content.js';

/** Ẩn danh tính người gửi tố giác ẩn danh trước khi trả về */
export function reportView(rep, viewer) {
  const { reporterKey, ...r } = rep;
  const mine = viewer && viewer.role === 'student';
  return { ...r, typeName: REPORT_TYPES[r.type]?.label || r.type, statusName: REPORT_STATUS[r.status]?.label || r.status, reporterId: r.anonymous && !mine ? null : r.reporterId, reporterName: r.anonymous ? 'Người gửi ẩn danh' : r.reporterName };
}

export default function safetyRoutes(r) {
  const G = 'An toàn học đường';

  // ---------- Tố giác vi phạm ----------
  r.get('/api/report-types', { group: G, desc: 'Danh mục loại vi phạm và trạng thái xử lý.' }, async () => ({ types: REPORT_TYPES, statuses: REPORT_STATUS }));

  r.get('/api/reports', { auth: 'student', group: G, desc: 'Sổ theo dõi tố giác của tôi (kể cả tố giác ẩn danh).' }, async (req, ctx) => {
    const key = await ctx.crypto.hmac('anon-reporter', req.user.id);
    const items = ctx.db.data.reports.filter(x => x.reporterId === req.user.id || x.reporterKey === key).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items: items.map(x => reportView(x, req.user)) };
  });

  r.get('/api/reports/:id', { auth: 'student', group: G, desc: 'Chi tiết một tố giác của tôi.' }, async (req, ctx) => {
    const key = await ctx.crypto.hmac('anon-reporter', req.user.id);
    const rep = ctx.db.data.reports.find(x => x.id === req.params.id && (x.reporterId === req.user.id || x.reporterKey === key));
    if (!rep) fail(404, 'Không tìm thấy hồ sơ tố giác.');
    return { item: reportView(rep, req.user) };
  });

  r.post('/api/reports', { auth: 'student', group: G, desc: 'Gửi tố giác vi phạm (có thể ẩn danh, đính kèm tối đa 4 ảnh dạng data URL).', body: { type: 'violence', location: 'Cổng phụ', occurredAt: '2026-10-18T10:30', description: 'Mô tả sự việc…', anonymous: true, photos: ['data:image/jpeg;base64,…'] } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'report')) fail(403, 'Chức năng tố giác đang tạm tắt.');
    const b = req.body;
    const type = oneOf(b.type, 'loại vi phạm', Object.keys(REPORT_TYPES));
    const location = str(b.location, 'địa điểm', { required: true, max: 200 });
    const description = str(b.description, 'mô tả sự việc', { required: true, min: 10, max: 3000 });
    const occurredAt = b.occurredAt ? new Date(b.occurredAt) : new Date();
    if (isNaN(occurredAt)) fail(400, 'Thời gian xảy ra không hợp lệ.');
    const photos = Array.isArray(b.photos) ? b.photos.slice(0, 4) : [];
    const stored = [];
    for (const p of photos) stored.push(await ctx.storeFile(p, 'evidence'));
    const anonymous = !!b.anonymous;
    const rep = {
      id: nextCode(ctx.db.data.reports, 'TG'),
      type, location, occurredAt: occurredAt.toISOString(), description, photos: stored, anonymous,
      reporterId: anonymous ? null : req.user.id, reporterKey: anonymous ? await ctx.crypto.hmac('anon-reporter', req.user.id) : null,
      reporterName: anonymous ? null : req.user.name, reporterClass: anonymous ? null : req.user.className,
      severity: REPORT_TYPES[type].severity, status: 'pending', feedback: '',
      timeline: [{ status: 'pending', note: anonymous ? 'Hệ thống đã tiếp nhận tố giác ẩn danh. Danh tính người gửi không được lưu.' : 'Hệ thống đã tiếp nhận tố giác.', by: 'Hệ thống', at: nowISO() }],
      createdAt: nowISO(), updatedAt: nowISO(),
    };
    ctx.db.data.reports.unshift(rep);
    notify(ctx, 'staff', { title: `Tố giác mới: ${REPORT_TYPES[type].label}`, content: `${rep.id} · ${location}`, type: 'report', link: 'reports' });
    if (rep.severity === 'high' || rep.severity === 'critical') raiseAlert(ctx, { level: rep.severity === 'critical' ? 'red' : 'orange', source: 'report', title: `Tố giác mức ${rep.severity === 'critical' ? 'Nghiêm trọng' : 'Cao'}: ${REPORT_TYPES[type].label}`, userId: rep.reporterId, name: anonymous ? 'Ẩn danh' : req.user.name, className: anonymous ? '' : req.user.className, keywords: [], context: description.slice(0, 160), ref: rep.id });
    ctx.emit('report:new', reportView(rep, null), { role: 'staff' });
    ctx.db.save();
    return { item: reportView(rep, req.user), message: `Đã gửi tố giác ${rep.id}. Cảm ơn bạn đã lên tiếng!` };
  });

  // ---------- Theo dõi cảm xúc ----------
  r.get('/api/mood', { auth: 'student', group: G, desc: 'Cảm xúc hôm nay, lịch sử 30 ngày và thống kê.' }, async (req, ctx) => {
    const list = ctx.db.data.moods.filter(m => m.userId === req.user.id).sort((a, b) => b.at.localeCompare(a.at));
    const today = list.find(m => localDate(m.at) === localDate()) || null;
    const since = Date.now() - 30 * 86400000;
    const recent = list.filter(m => new Date(m.at).getTime() > since);
    const counts = Object.fromEntries(Object.keys(MOODS).map(k => [k, recent.filter(m => m.mood === k).length]));
    return { today, history: list.slice(0, 60), counts, moods: MOODS };
  });

  r.post('/api/mood', { auth: 'student', group: G, desc: 'Ghi lại cảm xúc hôm nay.', body: { mood: 'calm', note: 'Hôm nay học khá ổn' } }, async (req, ctx) => {
    const mood = oneOf(req.body.mood, 'cảm xúc', Object.keys(MOODS));
    const note = str(req.body.note, 'ghi chú', { max: 500 });
    const m = { id: uid('CX'), userId: req.user.id, mood, note, at: nowISO() };
    ctx.db.data.moods.push(m);
    // Theo dõi chuỗi cảm xúc tiêu cực để chuyên viên chủ động hỏi thăm
    const last = ctx.db.data.moods.filter(x => x.userId === req.user.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
    if (last.length === 4 && last.every(x => ['sad', 'exhausted', 'anxious'].includes(x.mood))) {
      raiseAlert(ctx, { level: 'yellow', source: 'mood', title: 'Theo dõi cảm xúc: 4 lần liên tiếp tiêu cực', userId: req.user.id, name: req.user.name, className: req.user.className, keywords: last.map(x => MOODS[x.mood].label), context: 'Học sinh ghi nhận cảm xúc tiêu cực nhiều lần liên tiếp. Đề nghị chuyên viên tâm lý chủ động hỏi thăm.' });
    }
    const guard = note ? scanGuard(note, ctx.db.data.aiGuard) : null;
    if (guard && guard.level === 'red') raiseAlert(ctx, { level: 'red', source: 'mood', title: `AI Guard: ${guard.categories[0]}`, userId: req.user.id, name: req.user.name, className: req.user.className, keywords: guard.keywords, context: note.slice(0, 160) });
    ctx.db.save();
    return { item: m, advice: MOODS[mood].advice, showHotline: !!guard && guard.level === 'red' };
  });

  // ---------- Hộp thư tư vấn tâm lý: mỗi chuyên viên một cuộc trò chuyện riêng ----------
  // Học sinh xem hộp thư của mình: tin đã thu hồi chỉ hiện “đã thu hồi” (chuyên viên vẫn xem được nội dung gốc)
  const threadView = (t) => { const { ownerKey, ...rest } = t; return { ...rest, messages: rest.messages.map(m => recallView(m, false)) }; };
  const counselorBrief = (ctx, t) => {
    const c = ctx.db.data.users.find(u => u.id === t.counselorId);
    const tm = (ctx.db.data.counselTeam || []).find(m => m.userId === t.counselorId && m.avatar);
    return c ? { id: c.id, name: c.name, title: c.title, phone: c.phone, avatar: c.avatar || tm?.avatar || null } : null;
  };

  // Đảm bảo học sinh luôn có sẵn 1 hộp thư riêng với từng chuyên viên đang hoạt động — không cần tự
  // tạo cuộc trò chuyện mới như "Chat với giáo viên" (chuyên viên tâm lý thì mặc định đã có sẵn để nhắn).
  async function ensureMyThreads(ctx, user) {
    const key = await ctx.crypto.hmac('counsel-owner', user.id);
    const counselors = ctx.db.data.users.filter(u => u.counselor);
    let changed = false;
    for (const c of counselors) {
      if (!ctx.db.data.counseling.some(x => x.ownerKey === key && x.counselorId === c.id)) {
        ctx.db.data.counseling.unshift({ id: uid('TV'), ownerKey: key, counselorId: c.id, studentId: null, anonymous: true, alias: `Học sinh ẩn danh #${key.slice(0, 4).toUpperCase()}`, topic: '', flagged: false, status: 'open', unreadStaff: 0, unreadStudent: 0, messages: [], updatedAt: nowISO() });
        changed = true;
      }
    }
    if (changed) ctx.db.save();
    return { key, list: ctx.db.data.counseling.filter(x => x.ownerKey === key) };
  }
  const myThread = async (ctx, user, id) => { const key = await ctx.crypto.hmac('counsel-owner', user.id); return ctx.db.data.counseling.find(x => x.id === id && x.ownerKey === key); };

  r.get('/api/counseling/threads', { auth: 'student', group: G, desc: 'Danh sách hộp thư tư vấn của tôi — mỗi chuyên viên một cuộc trò chuyện riêng (bảo mật, có thể ẩn danh).' }, async (req, ctx) => {
    const { list } = await ensureMyThreads(ctx, req.user);
    const allItems = list.map(t => { const v = threadView(t); return { ...v, messages: undefined, last: v.messages.at(-1) || null, counselor: counselorBrief(ctx, t) }; }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const items = req.query.all ? allItems : allItems.filter(t => !t.hiddenForStudent);
    return { items, allItems, topics: COUNSEL_TOPICS };
  });

  r.get('/api/counseling/threads/:id', { auth: 'student', group: G, desc: 'Nội dung một hộp thư tư vấn (đánh dấu đã đọc).' }, async (req, ctx) => {
    const t = await myThread(ctx, req.user, req.params.id);
    if (!t) fail(404, 'Không tìm thấy hộp thư.');
    let dirty = false;
    if (t.hiddenForStudent) { t.hiddenForStudent = false; dirty = true; }
    if (t.unreadStudent) { t.unreadStudent = 0; dirty = true; }
    if (dirty) ctx.db.save();
    return { item: { ...threadView(t), counselor: counselorBrief(ctx, t) } };
  });

  const applyAnonymous = (t, user, anon) => {
    const key = t.ownerKey;
    t.anonymous = anon !== false;
    t.studentId = t.anonymous ? null : user.id;
    t.alias = t.anonymous ? `Học sinh ẩn danh #${key.slice(0, 4).toUpperCase()}` : `${user.name} · ${user.className}`;
  };

  r.put('/api/counseling/threads/:id/anonymous', { auth: 'student', group: G, desc: 'Bật / tắt chế độ ẩn danh cho cuộc trò chuyện tư vấn tâm lý.', body: { anonymous: true } }, async (req, ctx) => {
    const t = await myThread(ctx, req.user, req.params.id);
    if (!t) fail(404, 'Không tìm thấy hộp thư.');
    t.hiddenForStudent = false;
    applyAnonymous(t, req.user, req.body.anonymous);
    ctx.db.save();
    return { item: { ...threadView(t), counselor: counselorBrief(ctx, t) } };
  });

  r.post('/api/counseling/threads/:id/messages', { auth: 'student', group: G, desc: 'Gửi tâm sự tới một chuyên viên cụ thể (có thể chọn ẩn danh hoặc hiện tên bất cứ lúc nào).', body: { text: 'Em đang thấy áp lực…', anonymous: true, topic: 'stress' } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'counseling')) fail(403, 'Hộp thư tư vấn đang tạm tắt.');
    const t = await myThread(ctx, req.user, req.params.id);
    if (!t) fail(404, 'Không tìm thấy hộp thư.');
    const attachments = cleanAttachments(req.body.attachments);
    const text = str(req.body.text, 'nội dung', { required: !attachments.length, max: 2000 });
    if (req.body.anonymous !== undefined || !t.messages.length) {
      applyAnonymous(t, req.user, req.body.anonymous);
    }
    if (!t.messages.length) {
      t.topic = str(req.body.topic, 'chủ đề', { max: 30 }) || 'general';
    }
    const msg = { id: uid('m'), from: 'student', anonymous: t.anonymous, text, attachments, at: nowISO() };
    t.messages.push(msg); t.unreadStaff = (t.unreadStaff || 0) + 1; t.updatedAt = msg.at; t.status = 'open'; t.hiddenForStudent = false;
    const guard = text ? scanGuard(text, ctx.db.data.aiGuard) : null;
    if (guard) {
      msg.guard = guard;
      if (guard.level !== 'yellow') { t.flagged = true; raiseAlert(ctx, { level: guard.level, source: 'counseling', title: `Hộp thư tư vấn: ${guard.categories[0]}`, userId: t.studentId, name: t.alias, className: '', keywords: guard.keywords, context: text.slice(0, 160), ref: t.id }); }
    }
    if (t.counselorId) notify(ctx, t.counselorId, { title: `Tin nhắn tư vấn mới từ ${t.alias}`, content: (text || '📎 Đã gửi tệp đính kèm').slice(0, 120), type: 'counseling', link: 'counseling' });
    ctx.emit('counseling:message', { threadId: t.id, counselorId: t.counselorId, message: msg, alias: t.alias }, { userId: t.counselorId, role: 'admin' });
    ctx.db.save();
    return { item: { ...threadView(t), counselor: counselorBrief(ctx, t) }, showHotline: guard?.level === 'red' };
  });

  r.post('/api/counseling/threads/:id/messages/:mid/recall', { auth: 'student', group: G, desc: 'Thu hồi tin nhắn đã gửi cho chuyên viên (chuyên viên vẫn lưu nội dung để kịp thời hỗ trợ).' }, async (req, ctx) => {
    const t = await myThread(ctx, req.user, req.params.id);
    const m = t?.messages.find(x => x.id === req.params.mid && x.from === 'student');
    if (!m) fail(404, 'Không tìm thấy tin nhắn.');
    if (!m.recalled) { m.recalled = true; m.recalledAt = nowISO(); ctx.emit('counseling:message', { threadId: t.id, counselorId: t.counselorId, recall: m.id, alias: t.alias }, { userId: t.counselorId, role: 'admin' }); ctx.db.save(); }
    return { item: { ...threadView(t), counselor: counselorBrief(ctx, t) } };
  });

  r.delete('/api/counseling/threads/:id', { auth: 'student', group: G, desc: 'Xóa cuộc trò chuyện tư vấn tâm lý của học sinh với một chuyên viên.' }, async (req, ctx) => {
    const t = await myThread(ctx, req.user, req.params.id);
    if (!t) fail(404, 'Không tìm thấy hộp thư.');
    t.messages = [];
    t.unreadStudent = 0;
    t.unreadStaff = 0;
    t.hiddenForStudent = true;
    ctx.db.save();
    return { ok: true, item: { ...threadView(t), counselor: counselorBrief(ctx, t) } };
  });
}
