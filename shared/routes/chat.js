import { fail } from '../router.js';
import { str, oneOf, findOr404, nowISO, uid, filterProfanity, brief, notify, cleanAttachments, attachSummary, recallView, scrubRecalledNotice } from '../util.js';
import { moduleOn, raiseAlert, aiFor } from '../services.js';
import { scanGuard } from '../ai/guard.js';
import { scanMessage, scanUrl, scanPhone, scanAccount } from '../ai/scam.js';
import { assistantReply } from '../ai/assistant.js';
import { scamCheckWithAi } from '../ai/llm.js';

const EMOJIS = ['❤️', '👍', '😂', '😮', '🙏', '🔥', '👏', '💡'];

export default function chatRoutes(r) {
  const S = 'Chat toàn trường';
  const T = 'Chat giáo viên';
  const A = 'Trí tuệ nhân tạo (AI)';

  // ---------- Chat chung toàn trường ----------
  // Tin đã thu hồi: mọi người chỉ thấy “đã thu hồi”; riêng quản trị viên vẫn xem được nội dung gốc để giám sát
  const msgView = (m, user, db) => {
    const mine = m.userId === user.id;
    const isAnon = !!m.anonymous;
    const sender = db?.data?.users?.find(u => u.id === m.userId);
    const alias = m.alias || `Học sinh ẩn danh #${String(m.userId || '').slice(-3) || '000'}`;
    return {
      ...m,
      anonymous: isAnon,
      userId: isAnon && !mine && user.role !== 'admin' ? 'anon' : m.userId,
      name: isAnon ? alias : (sender?.name || m.name),
      className: isAnon ? 'Ẩn danh' : m.className,
      avatar: isAnon ? null : (sender?.avatar || m.avatar || null),
      recalled: !!m.recalled,
      text: m.deleted || (m.recalled && user.role !== 'admin') ? '' : m.text,
      attachments: m.deleted || (m.recalled && user.role !== 'admin') ? [] : (m.attachments || []),
      reactions: Object.fromEntries(Object.entries(m.reactions || {}).map(([e, ids]) => [e, { count: ids.length, mine: ids.includes(user.id) }])),
      mine,
    };
  };

  r.get('/api/school-chat', { auth: 'user', group: S, desc: 'Tin nhắn kênh chung (mới nhất). ?since=<ISO> để lấy tin mới.', query: { since: '' } }, async (req, ctx) => {
    const c = ctx.db.data.schoolChat;
    let list = c.messages;
    if (req.query.since) list = list.filter(m => m.at > req.query.since);
    const online = new Set(ctx.db.data.users.filter(u => u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 3 * 3600000).map(u => u.id)).size;
    return { locked: c.locked, lockReason: c.lockReason, muted: c.muted.includes(req.user.id), warnings: c.warnings[req.user.id] || 0, online: Math.max(online, 3) + 180, items: list.slice(-120).map(m => msgView(m, req.user, ctx.db)), emojis: EMOJIS };
  });

  r.post('/api/school-chat', { auth: 'user', group: S, desc: 'Gửi tin nhắn kênh chung (tự động lọc ngôn từ phản cảm, hỗ trợ gửi ẩn danh).', body: { text: 'Chào cả nhà!', anonymous: false } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'schoolChat')) fail(403, 'Kênh chat chung đang tạm tắt.');
    const c = ctx.db.data.schoolChat, u = req.user;
    if (c.locked && u.role === 'student') fail(423, c.lockReason || 'Kênh chat đang tạm khóa.');
    if (c.muted.includes(u.id)) fail(403, 'Bạn đang bị tạm cấm chat do vi phạm quy tắc ứng xử.');
    const recent = c.messages.filter(m => m.userId === u.id && Date.now() - new Date(m.at).getTime() < 10000);
    if (recent.length >= 3) fail(429, 'Bạn gửi tin quá nhanh. Hãy chờ vài giây nhé.');
    const attachments = cleanAttachments(req.body.attachments);
    const raw = str(req.body.text, 'tin nhắn', { required: !attachments.length, max: 600 });
    const { text, flagged } = !raw || ctx.db.data.aiGuard.autoFilterChat === false ? { text: raw, flagged: false } : filterProfanity(raw);
    const isAnon = u.role === 'student' && !!req.body.anonymous;
    const alias = `Học sinh ẩn danh #${String(u.id).slice(-3)}`;
    const m = {
      id: uid('SC'),
      userId: u.id,
      name: isAnon ? alias : u.name,
      realName: u.name,
      className: isAnon ? 'Ẩn danh' : (u.className || (u.role === 'admin' ? 'Ban Giám hiệu' : 'Giáo viên')),
      realClass: u.className || '',
      anonymous: isAnon,
      alias,
      role: u.role === 'student' ? 'student' : 'staff',
      avatar: isAnon ? null : (u.avatar || null),
      text,
      attachments,
      reactions: {},
      at: nowISO(),
      deleted: false,
      flagged,
    };
    c.messages.push(m);
    if (c.messages.length > 1000) c.messages.splice(0, c.messages.length - 1000);
    if (flagged) {
      c.warnings[u.id] = (c.warnings[u.id] || 0) + 1;
      if (c.warnings[u.id] >= 3 && !c.muted.includes(u.id)) { c.muted.push(u.id); notify(ctx, u.id, { title: 'Bạn bị tạm cấm chat', content: 'Hệ thống phát hiện ngôn từ không phù hợp 3 lần. Liên hệ GVCN để được mở lại.', type: 'warning' }); }
    }
    const guard = raw ? scanGuard(raw, ctx.db.data.aiGuard) : null;
    if (guard && guard.level !== 'yellow') raiseAlert(ctx, { level: guard.level, source: 'chat', title: `Chat chung: ${guard.categories[0]}`, userId: u.id, name: u.name, className: u.className, keywords: guard.keywords, context: raw.slice(0, 160), ref: m.id });
    ctx.emit('school-chat:message', { ...m, name: isAnon ? alias : m.name, className: isAnon ? 'Ẩn danh' : m.className, avatar: isAnon ? null : m.avatar }, { all: true });
    ctx.db.save();
    return { item: msgView(m, u), filtered: flagged, warning: flagged ? `Tin nhắn chứa từ ngữ không phù hợp đã được che. Cảnh báo ${c.warnings[u.id]}/3.` : null };
  });

  r.post('/api/school-chat/:id/react', { auth: 'user', group: S, desc: 'Thả / bỏ biểu cảm cho tin nhắn.', body: { emoji: '❤️' } }, async (req, ctx) => {
    const m = findOr404(ctx.db.data.schoolChat.messages, req.params.id, 'tin nhắn');
    const e = oneOf(req.body.emoji, 'biểu cảm', EMOJIS);
    m.reactions[e] = m.reactions[e] || [];
    const i = m.reactions[e].indexOf(req.user.id);
    if (i >= 0) m.reactions[e].splice(i, 1); else m.reactions[e].push(req.user.id);
    if (!m.reactions[e].length) delete m.reactions[e];
    ctx.emit('school-chat:react', { id: m.id, reactions: Object.fromEntries(Object.entries(m.reactions).map(([k, v]) => [k, v.length])) }, { all: true });
    ctx.db.save();
    return { item: msgView(m, req.user) };
  });

  r.post('/api/school-chat/:id/recall', { auth: 'user', group: S, desc: 'Thu hồi tin nhắn của mình. Mọi người chỉ thấy “đã thu hồi”; quản trị viên vẫn xem được nội dung gốc để giám sát.' }, async (req, ctx) => {
    const m = findOr404(ctx.db.data.schoolChat.messages, req.params.id, 'tin nhắn');
    if (m.userId !== req.user.id) fail(403, 'Bạn chỉ thu hồi được tin nhắn của mình.');
    if (!m.recalled) { m.recalled = true; m.recalledAt = nowISO(); ctx.emit('school-chat:recall', { id: m.id }, { all: true }); ctx.db.save(); }
    return { item: msgView(m, req.user) };
  });

  // ---------- Chat 1-1 học sinh ↔ giáo viên ----------
  const threadView = (t, db, viewer) => {
    const teacher = db.data.users.find(u => u.id === t.teacherId), student = db.data.users.find(u => u.id === t.studentId);
    const admin = viewer.role === 'admin'; // Ban Giám hiệu vẫn xem được tin đã thu hồi
    const messages = t.messages.map(m => recallView(m, admin));
    const isAnon = !!t.anonymous;
    const alias = t.alias || `Học sinh ẩn danh #${t.id.slice(-4)}`;
    const studentInfo = (viewer.role !== 'student' && isAnon)
      ? { id: 'anon', name: alias, className: 'Ẩn danh', avatar: null, anonymous: true }
      : { ...brief(student), anonymous: isAnon };
    return { ...t, anonymous: isAnon, alias, messages, teacher: { ...brief(teacher), subject: teacher?.subject, title: teacher?.title, counselor: !!teacher?.counselor }, student: studentInfo, unread: viewer.role === 'student' ? t.unreadStudent : t.unreadTeacher, last: messages.at(-1) || null };
  };
  const canSee = (t, u) => u.role === 'admin' || t.studentId === u.id || t.teacherId === u.id;

  r.get('/api/teacher-chat/threads', { auth: 'user', group: T, desc: 'Danh sách cuộc trò chuyện 1-1 (học sinh hoặc giáo viên).' }, async (req, ctx) => {
    const u = req.user;
    const list = ctx.db.data.teacherChat.filter(t => u.role === 'student' ? t.studentId === u.id && !t.hiddenForStudent : u.role === 'admin' ? true : t.teacherId === u.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { items: list.map(t => { const v = threadView(t, ctx.db, u); delete v.messages; return v; }) };
  });

  r.post('/api/teacher-chat/threads', { auth: 'student', group: T, desc: 'Bắt đầu (hoặc mở lại) cuộc trò chuyện với một giáo viên (có thể chọn ẩn danh).', body: { teacherId: 'GV2024101', anonymous: false } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'teacherChat')) fail(403, 'Chức năng chat với giáo viên đang tạm tắt.');
    const teacher = ctx.db.data.users.find(u => u.id === req.body.teacherId && u.role === 'teacher');
    if (!teacher) fail(404, 'Không tìm thấy giáo viên.');
    let t = ctx.db.data.teacherChat.find(x => x.teacherId === teacher.id && x.studentId === req.user.id);
    if (!t) {
      const id = uid('GVC');
      t = { id, teacherId: teacher.id, studentId: req.user.id, anonymous: !!req.body.anonymous, alias: `Học sinh ẩn danh #${id.slice(-4)}`, unreadTeacher: 0, unreadStudent: 0, updatedAt: nowISO(), messages: [] };
      ctx.db.data.teacherChat.unshift(t);
      ctx.db.save();
    } else {
      let dirty = false;
      if (t.hiddenForStudent) { t.hiddenForStudent = false; dirty = true; }
      if (req.body.anonymous !== undefined) { t.anonymous = !!req.body.anonymous; t.alias = t.alias || `Học sinh ẩn danh #${t.id.slice(-4)}`; dirty = true; }
      if (dirty) ctx.db.save();
    }
    return { item: threadView(t, ctx.db, req.user) };
  });

  r.put('/api/teacher-chat/threads/:id/anonymous', { auth: 'student', group: T, desc: 'Bật / tắt chế độ ẩn danh cho cuộc trò chuyện với giáo viên.', body: { anonymous: true } }, async (req, ctx) => {
    const t = findOr404(ctx.db.data.teacherChat, req.params.id, 'cuộc trò chuyện');
    if (t.studentId !== req.user.id) fail(403, 'Bạn không có quyền thay đổi cuộc trò chuyện này.');
    t.anonymous = !!req.body.anonymous;
    t.alias = t.alias || `Học sinh ẩn danh #${t.id.slice(-4)}`;
    ctx.db.save();
    return { item: threadView(t, ctx.db, req.user) };
  });

  r.get('/api/teacher-chat/threads/:id', { auth: 'user', group: T, desc: 'Tin nhắn trong một cuộc trò chuyện (đánh dấu đã đọc).' }, async (req, ctx) => {
    const t = findOr404(ctx.db.data.teacherChat, req.params.id, 'cuộc trò chuyện');
    if (!canSee(t, req.user)) fail(403, 'Bạn không có quyền xem cuộc trò chuyện này.');
    if (req.user.role === 'student') t.unreadStudent = 0; else if (req.user.id === t.teacherId) t.unreadTeacher = 0;
    ctx.db.save();
    return { item: threadView(t, ctx.db, req.user) };
  });

  r.delete('/api/teacher-chat/threads/:id', { auth: 'user', group: T, desc: 'Xóa một cuộc trò chuyện khỏi danh sách "Chat với giáo viên".' }, async (req, ctx) => {
    const t = findOr404(ctx.db.data.teacherChat, req.params.id, 'cuộc trò chuyện');
    if (req.user.role === 'student') {
      if (t.studentId !== req.user.id) fail(403, 'Bạn chỉ xóa được cuộc trò chuyện của mình.');
      t.hiddenForStudent = true;
    } else if (req.user.role === 'teacher') {
      if (t.teacherId !== req.user.id) fail(403, 'Bạn chỉ xóa được cuộc trò chuyện của mình.');
      const i = ctx.db.data.teacherChat.findIndex(x => x.id === t.id);
      if (i >= 0) ctx.db.data.teacherChat.splice(i, 1);
    } else if (req.user.role === 'admin') {
      const i = ctx.db.data.teacherChat.findIndex(x => x.id === t.id);
      if (i >= 0) ctx.db.data.teacherChat.splice(i, 1);
    }
    ctx.db.save();
    return { ok: true };
  });

  r.post('/api/teacher-chat/threads/:id/messages', { auth: 'user', group: T, desc: 'Gửi tin nhắn. kind: text | leave (đơn xin nghỉ phép).', body: { text: 'Em chào cô ạ', kind: 'text', anonymous: false, leave: { date: '2026-10-20', session: 'Sáng', reason: 'Đi khám bệnh' } } }, async (req, ctx) => {
    const t = findOr404(ctx.db.data.teacherChat, req.params.id, 'cuộc trò chuyện');
    if (!canSee(t, req.user) || req.user.role === 'admin' && req.user.id !== t.teacherId) fail(403, 'Bạn không có quyền gửi tin trong cuộc trò chuyện này.');
    const fromStudent = req.user.role === 'student';
    if (fromStudent && req.body.anonymous !== undefined) {
      t.anonymous = !!req.body.anonymous;
      t.alias = t.alias || `Học sinh ẩn danh #${t.id.slice(-4)}`;
    }
    const kind = oneOf(req.body.kind, 'loại tin', ['text', 'leave', 'leave-reply'], 'text');
    let msg;
    if (kind === 'leave') {
      if (!fromStudent) fail(400, 'Chỉ học sinh mới gửi đơn xin nghỉ.');
      const l = req.body.leave || {};
      msg = { id: uid('c'), from: 'student', kind, text: str(l.reason, 'lý do', { required: true, max: 500 }), leave: { date: str(l.date, 'ngày nghỉ', { required: true, max: 20 }), session: str(l.session, 'buổi', { max: 20 }) || 'Cả ngày', status: 'pending' }, at: nowISO() };
    } else if (kind === 'leave-reply') {
      if (fromStudent) fail(403, 'Chỉ giáo viên mới duyệt đơn.');
      const target = t.messages.find(m => m.id === req.body.messageId && m.kind === 'leave');
      if (!target) fail(404, 'Không tìm thấy đơn xin nghỉ.');
      target.leave.status = req.body.approve ? 'approved' : 'rejected';
      msg = { id: uid('c'), from: 'teacher', kind: 'text', text: req.body.approve ? `Cô/thầy đã duyệt đơn nghỉ ngày ${target.leave.date}. Em nhớ chép bài đầy đủ nhé.` : `Đơn nghỉ ngày ${target.leave.date} chưa được duyệt. Em liên hệ trực tiếp với cô/thầy nhé.`, at: nowISO() };
    } else {
      const attachments = cleanAttachments(req.body.attachments);
      msg = { id: uid('c'), from: fromStudent ? 'student' : 'teacher', kind: 'text', text: str(req.body.text, 'tin nhắn', { required: !attachments.length, max: 2000 }), attachments, at: nowISO() };
    }
    t.messages.push(msg); t.updatedAt = msg.at;
    if (fromStudent) t.unreadTeacher++; else { t.unreadStudent++; t.hiddenForStudent = false; }
    const target = fromStudent ? { userId: t.teacherId } : { userId: t.studentId };
    ctx.emit('teacher-chat:message', { threadId: t.id, message: msg }, target);
    if (!fromStudent) msg.notifId = notify(ctx, t.studentId, { title: `${req.user.name} đã trả lời`, content: (msg.text || `Đã gửi ${attachSummary(msg.attachments)}`).slice(0, 120), type: 'chat', link: 'teacher-chat' }).id;
    ctx.db.save();
    return { item: threadView(t, ctx.db, req.user), message: msg };
  });

  r.post('/api/teacher-chat/threads/:id/messages/:mid/recall', { auth: 'user', group: T, desc: 'Thu hồi tin nhắn mình đã gửi trong cuộc trò chuyện 1-1 (Ban Giám hiệu vẫn xem được nội dung gốc).' }, async (req, ctx) => {
    const t = findOr404(ctx.db.data.teacherChat, req.params.id, 'cuộc trò chuyện');
    const m = t.messages.find(x => x.id === req.params.mid);
    if (!m) fail(404, 'Không tìm thấy tin nhắn.');
    const mine = (m.from === 'student' && req.user.id === t.studentId) || (m.from === 'teacher' && req.user.id === t.teacherId);
    if (!mine) fail(403, 'Bạn chỉ thu hồi được tin nhắn của mình.');
    if (!m.recalled) {
      m.recalled = true; m.recalledAt = nowISO(); scrubRecalledNotice(ctx.db, m);
      ctx.emit('teacher-chat:message', { threadId: t.id, recall: m.id }, { userId: m.from === 'student' ? t.teacherId : t.studentId });
      ctx.db.save();
    }
    return { item: threadView(t, ctx.db, req.user) };
  });

  // ---------- AI: tra cứu lừa đảo ----------
  r.get('/api/ai/status', { auth: 'user', group: A, desc: 'Trạng thái kết nối mô hình ngôn ngữ (AI) của hệ thống.' }, async (req, ctx) => ({
    enabled: !!ctx.llm, provider: ctx.llm?.provider || null, model: ctx.llm?.model || null, label: ctx.llm?.label || null,
    features: { chat: !!aiFor(ctx, 'chat'), scam: !!aiFor(ctx, 'scam') },
  }));

  r.post('/api/ai/scam-check', { auth: 'user', group: A, desc: 'Quét dấu hiệu lừa đảo 4-trong-1 bằng bộ luật + AI (khi đã cấu hình LLM). kind: message | url | phone | account', body: { kind: 'message', input: 'Chúc mừng bạn trúng thưởng xe SH, nộp phí 2 triệu để nhận quà…', bank: '' } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'scam')) fail(403, 'Chức năng tra cứu lừa đảo đang tạm tắt.');
    const kind = oneOf(req.body.kind, 'loại tra cứu', ['message', 'url', 'phone', 'account']);
    const input = str(req.body.input, 'nội dung cần kiểm tra', { required: true, max: kind === 'message' ? 3000 : 300 });
    const db = ctx.db.data.scamDb;
    const rule = kind === 'message' ? scanMessage(input) : kind === 'url' ? scanUrl(input, db.domains) : kind === 'phone' ? scanPhone(input, db.phones) : scanAccount(input, str(req.body.bank, 'ngân hàng', { max: 80 }), db.accounts);
    let result = { ...rule, engine: 'rules' };
    const scamLlm = aiFor(ctx, 'scam');
    if (scamLlm && req.body.ai !== false && ['message', 'url'].includes(kind)) {
      try { result = await scamCheckWithAi(scamLlm, { kind, input, rule }); } catch (e) { result.aiError = 'Không kết nối được AI, đang dùng bộ luật phân tích sẵn có.'; ctx.log?.('AI scam-check lỗi: ' + (e?.message || e)); }
    }
    ctx.db.data.scamChecks.unshift({ id: uid('LD'), userId: req.user.id, kind, input: input.slice(0, 200), level: result.level, score: result.score, engine: result.engine, at: nowISO() });
    if (ctx.db.data.scamChecks.length > 2000) ctx.db.data.scamChecks.length = 2000;
    ctx.db.save();
    return { ...result, checkedAt: nowISO() };
  });

  r.post('/api/ai/scam-report', { auth: 'user', group: A, desc: 'Cộng đồng báo cáo số điện thoại / tài khoản / tên miền lừa đảo.', body: { kind: 'phone', value: '0120555014', note: 'Gọi mạo danh giáo viên', bank: '' } }, async (req, ctx) => {
    const kind = oneOf(req.body.kind, 'loại báo cáo', ['phone', 'account', 'url']);
    const note = str(req.body.note, 'ghi chú', { max: 300 });
    const db = ctx.db.data.scamDb;
    let value = str(req.body.value, 'giá trị', { required: true, max: 200 });
    if (kind === 'phone') { value = scanPhone(value).normalized; const e = db.phones.find(p => p.number === value); if (e) { e.reports++; e.lastReported = nowISO(); } else db.phones.push({ number: value, reports: 1, note, lastReported: nowISO() }); }
    if (kind === 'account') { value = value.replace(/\D/g, ''); const e = db.accounts.find(a => a.number === value); if (e) { e.reports++; e.lastReported = nowISO(); } else db.accounts.push({ number: value, bank: str(req.body.bank, 'ngân hàng', { max: 80 }), reports: 1, note, lastReported: nowISO() }); }
    if (kind === 'url') { value = scanUrl(value).host; const e = db.domains.find(d => d.domain === value); if (e) e.reports++; else db.domains.push({ domain: value, reports: 1, note }); }
    ctx.db.save();
    return { ok: true, message: 'Cảm ơn bạn! Báo cáo đã được ghi nhận vào cơ sở dữ liệu cảnh báo của trường.' };
  });

  // ---------- AI: trợ lý học đường ----------
  r.post('/api/ai/chat', { auth: 'user', group: A, desc: 'Trò chuyện với Trợ lý Học đường AI (có AI Guard giám sát an toàn).', body: { message: 'Công thức đạo hàm của hàm hợp là gì?', conversationId: null } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'aiChat')) fail(403, 'Trợ lý AI đang tạm tắt.');
    const u = req.user;
    const message = str(req.body.message, 'câu hỏi', { required: true, max: 1500 });
    let conv = req.body.conversationId ? ctx.db.data.aiLogs.find(c => c.id === req.body.conversationId && c.userId === u.id) : null;
    if (!conv) { conv = { id: uid('AI'), userId: u.id, name: u.name, className: u.className || '', flagged: null, updatedAt: nowISO(), messages: [] }; ctx.db.data.aiLogs.unshift(conv); }
    const guard = scanGuard(message, ctx.db.data.aiGuard);
    const history = conv.messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
    const chatLlm = aiFor(ctx, 'chat');
    const out = await assistantReply(message, { user: u, guard, llm: chatLlm, history, school: ctx.db.data.settings });
    if (out.llmError) ctx.log?.('AI chat lỗi: ' + out.llmError);
    conv.messages.push({ role: 'user', text: message, at: nowISO(), guard: guard || undefined });
    conv.messages.push({ role: 'assistant', text: out.reply, intent: out.intent, engine: out.engine, at: nowISO() });
    if (conv.messages.length > 200) conv.messages.splice(0, conv.messages.length - 200);
    conv.updatedAt = nowISO();
    if (guard) {
      const order = { red: 3, orange: 2, yellow: 1 };
      if (!conv.flagged || order[guard.level] > order[conv.flagged]) conv.flagged = guard.level;
      if (ctx.db.data.aiGuard.autoAlert !== false) raiseAlert(ctx, { level: guard.level, source: 'ai', title: `AI Guard: ${guard.categories.join(', ')}`, userId: u.id, name: u.name, className: u.className || '', keywords: guard.keywords, context: message.slice(0, 160), ref: conv.id });
    }
    ctx.db.save();
    return { conversationId: conv.id, reply: out.reply, intent: out.intent, engine: out.engine, model: out.engine === 'llm' ? (chatLlm?.label || chatLlm?.model || null) : null, scan: out.scan || null, aiError: out.llmError ? 'AI tạm thời không phản hồi, đang dùng bộ trả lời dự phòng.' : null, actions: out.actions || [], suggestions: out.suggestions || [], guard: guard ? { level: guard.level, levelName: guard.levelName, showHotline: ctx.db.data.aiGuard.autoHotline !== false && guard.level !== 'yellow' } : null };
  });

  r.get('/api/ai/conversations/mine', { auth: 'user', group: A, desc: 'Lịch sử hội thoại gần nhất với Trợ lý AI.' }, async (req, ctx) => {
    const c = ctx.db.data.aiLogs.find(x => x.userId === req.user.id);
    return { conversation: c ? { id: c.id, messages: c.messages.slice(-40).map(({ guard, ...m }) => m) } : null };
  });
}
