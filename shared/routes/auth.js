import { fail } from '../router.js';
import { str, oneOf, publicUser, nowISO, uid, notify } from '../util.js';
import { audit } from '../services.js';
import { createCaptcha, verifyCaptcha } from '../captcha.js';
import { putSession, dropSession, dropAllForUser, listForUser } from '../sessions.js';
import { isCounselTeamTeacher } from '../counsel-team.js';

const attempts = new Map(); // chống dò mật khẩu theo mã đăng nhập: tối đa 8 lần sai / 10 phút (áp dụng cả khi tài khoản không tồn tại)
const LOCK_AFTER = 3; // số lần sai mật khẩu liên tiếp trước khi tài khoản TỰ KHÓA, cần nhà trường duyệt mở lại

/** Phát hành token đăng nhập mới: tạo một phiên ở máy chủ (xem shared/sessions.js) rồi ký token mang theo mã phiên. */
async function issueToken(ctx, u, ttlSec, device, noIdle = false) {
  const jti = await ctx.crypto.randomToken();
  const abs = Math.floor(Date.now() / 1000) + ttlSec;
  putSession(jti, { userId: u.id, v: u.tokenVersion || 1, abs, device: device || '', noIdle: !!noIdle });
  return ctx.crypto.signToken({ sub: u.id, role: u.role, v: u.tokenVersion || 1, jti, ...(noIdle ? { noIdle: true } : {}) }, ttlSec);
}

/** Tạo (hoặc làm mới) một yêu cầu mở khóa đang chờ Ban Giám hiệu / giám thị duyệt, và báo cho họ biết. */
function raiseUnlockRequest(ctx, u, reason) {
  if (!Array.isArray(ctx.db.data.unlockRequests)) ctx.db.data.unlockRequests = [];
  const existing = ctx.db.data.unlockRequests.find(x => x.userId === u.id && x.status === 'pending');
  if (existing) { existing.at = nowISO(); existing.reason = reason; return existing; }
  const item = { id: uid('UL'), userId: u.id, userName: u.name, role: u.role, reason, at: nowISO(), status: 'pending', handledBy: null, handledAt: null };
  ctx.db.data.unlockRequests.unshift(item);
  notify(ctx, 'staff', { title: 'Yêu cầu mở khóa tài khoản', content: `${u.name} (${u.id}) · ${reason}`, type: 'warning', link: 'accounts' });
  return item;
}

export default function authRoutes(r) {
  const G = 'Xác thực & tài khoản';

  r.get('/api/auth/captcha', { group: G, desc: 'Lấy mã xác nhận (CAPTCHA) dạng ảnh SVG — bắt buộc gửi kèm captchaId/captchaCode khi đăng nhập, mỗi mã dùng một lần và hết hạn sau 2 phút.' }, async () => createCaptcha());

  r.post('/api/auth/login', { group: G, desc: 'Đăng nhập bằng MSHS / mã giáo viên, mật khẩu và mã xác nhận (CAPTCHA). Sai mật khẩu 3 lần liên tiếp sẽ tự khóa tài khoản, cần nhà trường duyệt mở lại. Trả về token Bearer.', body: { username: '2126220004', password: '123456', captchaId: '…', captchaCode: '12345', remember: true } }, async (req, ctx) => {
    const username = str(req.body.username, 'mã đăng nhập', { required: true, max: 60 });
    const password = str(req.body.password, 'mật khẩu', { required: true, max: 128 });
    const isMobile = req.body.portal === 'mobile';
    if (!isMobile && !verifyCaptcha(req.body.captchaId, req.body.captchaCode)) fail(400, 'Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng lấy mã mới và thử lại.');
    const key = username.toLowerCase();
    const rec = attempts.get(key);
    if (rec && rec.count >= 8 && Date.now() - rec.first < 600000) fail(429, 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');
    const u = ctx.db.data.users.find(x => x.id.toLowerCase() === key || (x.email || '').toLowerCase() === key);
    const ok = u && await ctx.crypto.verifyPassword(password, u.passwordHash);
    if (!ok) {
      const cur = rec && Date.now() - rec.first < 600000 ? rec : { count: 0, first: Date.now() };
      cur.count++; attempts.set(key, cur);
      let msg = 'Mã đăng nhập hoặc mật khẩu chưa đúng.';
      if (u && !u.locked) {
        u.failedLoginCount = (u.failedLoginCount || 0) + 1;
        if (u.failedLoginCount >= LOCK_AFTER) {
          u.locked = true; u.lockReason = 'auto'; u.lockedAt = nowISO();
          raiseUnlockRequest(ctx, u, 'Tự động khóa do nhập sai mật khẩu 3 lần liên tiếp.');
          audit(ctx, u, 'Tài khoản tự khóa (sai mật khẩu 3 lần)'); ctx.db.save();
          fail(403, 'Tài khoản đã bị khóa do nhập sai mật khẩu quá 3 lần. Yêu cầu mở khóa đã được gửi tới nhà trường — vui lòng chờ duyệt hoặc liên hệ GVCN.', { locked: 'auto', userId: u.id });
        }
        msg += ` (còn ${LOCK_AFTER - u.failedLoginCount} lần trước khi tài khoản bị tạm khóa)`;
        ctx.db.save();
      }
      fail(401, msg);
    }
    if (u.locked) fail(403, u.lockReason === 'auto' ? 'Tài khoản đang chờ nhà trường duyệt mở khóa sau khi đăng nhập sai nhiều lần. Vui lòng liên hệ GVCN nếu cần gấp.' : 'Tài khoản đang bị khóa. Vui lòng liên hệ Ban Giám hiệu hoặc GVCN.', { locked: u.lockReason || 'manual', userId: u.id });
    if ((req.body.portal === 'staff' || req.body.portal === 'admin') && u.role === 'student') {
      fail(403, 'Đây là trang đăng nhập dành cho Quản trị / Giáo viên. Học sinh vui lòng đăng nhập tại Cổng Học Sinh.');
    }
    if (req.body.portal === 'student' && u.role !== 'student') {
      fail(403, 'Tài khoản này thuộc Cổng Quản Trị / Giáo Viên. Vui lòng đăng nhập tại trang dành riêng cho Quản trị và Giáo viên.');
    }
    attempts.delete(key);
    u.failedLoginCount = 0;
    u.lastLogin = nowISO();
    if (ctx.crypto.needsRehash?.(u.passwordHash)) u.passwordHash = await ctx.crypto.hashPassword(password); // tự nâng cấp hash cũ (vd. scrypt) lên Argon2id
    const days = isMobile ? 3650 : (req.body.remember ? 30 : 1);
    const token = await issueToken(ctx, u, days * 86400, str(req.body.device, '', { max: 120 }) || (isMobile ? 'App điện thoại' : 'Trình duyệt'), isMobile);
    audit(ctx, u, 'Đăng nhập', req.ip || '');
    ctx.db.save();
    return { token, expiresIn: days * 86400, user: { ...publicUser(u), inCounselTeam: isCounselTeamTeacher(ctx.db.data, u) } };
  });

  // ---------- Yêu cầu mở khóa tài khoản (sau khi tự khóa do sai mật khẩu 3 lần) ----------
  r.post('/api/auth/unlock-request', { group: G, desc: 'Gửi (hoặc gửi lại) yêu cầu mở khóa tài khoản tới nhà trường sau khi bị tự khóa vì đăng nhập sai nhiều lần.', body: { userId: '2126220004', captchaId: '…', captchaCode: '12345' } }, async (req, ctx) => {
    if (req.body.portal !== 'mobile' && !verifyCaptcha(req.body.captchaId, req.body.captchaCode)) fail(400, 'Mã xác nhận không đúng hoặc đã hết hạn.');
    const id = str(req.body.userId, 'mã tài khoản', { required: true, max: 60 });
    const u = ctx.db.data.users.find(x => x.id === id);
    if (!u || !u.locked) fail(404, 'Không tìm thấy tài khoản đang bị khóa với mã này.');
    const item = raiseUnlockRequest(ctx, u, u.lockReason === 'auto' ? 'Tự động khóa do nhập sai mật khẩu 3 lần liên tiếp.' : 'Học sinh/giáo viên yêu cầu mở khóa.');
    ctx.db.save();
    return { ok: true, status: item.status, message: 'Đã gửi yêu cầu mở khóa tới nhà trường. Vui lòng chờ duyệt hoặc liên hệ GVCN nếu cần gấp.' };
  });

  r.post('/api/auth/logout', { auth: 'user', group: G, desc: 'Đăng xuất phiên hiện tại.' }, async (req, ctx) => {
    const payload = await ctx.crypto.verifyToken(req.token);
    if (payload?.jti) dropSession(payload.jti);
    audit(ctx, req.user, 'Đăng xuất'); ctx.db.save();
    return { ok: true };
  });

  r.post('/api/auth/logout-all', { auth: 'user', group: G, desc: 'Đăng xuất khỏi tất cả thiết bị (vô hiệu mọi token).' }, async (req, ctx) => {
    req.user.tokenVersion = (req.user.tokenVersion || 1) + 1;
    dropAllForUser(req.user.id);
    ctx.db.save();
    return { ok: true };
  });

  r.get('/api/auth/sessions', { auth: 'user', group: G, desc: 'Danh sách phiên đăng nhập đang hoạt động của tài khoản (thiết bị, lần hoạt động gần nhất).' }, async (req, ctx) => {
    const payload = await ctx.crypto.verifyToken(req.token);
    return { items: listForUser(req.user.id).map(s => ({ ...s, current: s.jti === payload?.jti })) };
  });

  r.delete('/api/auth/sessions/:jti', { auth: 'user', group: G, desc: 'Đăng xuất một thiết bị cụ thể (thu hồi phiên đó).' }, async (req, ctx) => {
    const mine = listForUser(req.user.id).some(s => s.jti === req.params.jti);
    if (!mine) fail(404, 'Không tìm thấy phiên đăng nhập này.');
    dropSession(req.params.jti); ctx.db.save();
    return { ok: true };
  });

  r.get('/api/auth/me', { auth: 'user', group: G, desc: 'Thông tin tài khoản đang đăng nhập.' }, async (req, ctx) => ({ user: { ...publicUser(req.user), inCounselTeam: isCounselTeamTeacher(ctx.db.data, req.user) } }));

  r.post('/api/auth/change-password', { auth: 'user', group: G, desc: 'Đổi mật khẩu.', body: { currentPassword: '123456', newPassword: 'MatKhauMoi@2026' } }, async (req, ctx) => {
    const cur = str(req.body.currentPassword, 'mật khẩu hiện tại', { required: true, max: 128 });
    const next = str(req.body.newPassword, 'mật khẩu mới', { required: true, min: 6, max: 128 });
    if (!await ctx.crypto.verifyPassword(cur, req.user.passwordHash)) fail(400, 'Mật khẩu hiện tại chưa đúng.');
    if (cur === next) fail(400, 'Mật khẩu mới phải khác mật khẩu hiện tại.');
    const curPayload = await ctx.crypto.verifyToken(req.token);
    const noIdle = !!curPayload?.noIdle;
    req.user.passwordHash = await ctx.crypto.hashPassword(next);
    req.user.mustChangePassword = false;
    req.user.tokenVersion = (req.user.tokenVersion || 1) + 1;
    dropAllForUser(req.user.id);
    const token = await issueToken(ctx, req.user, (noIdle ? 3650 : 30) * 86400, noIdle ? 'App điện thoại' : 'Trình duyệt', noIdle);
    audit(ctx, req.user, 'Đổi mật khẩu'); ctx.db.save();
    return { ok: true, token, message: 'Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.' };
  });

  r.put('/api/auth/complete-profile', { auth: 'user', group: G, desc: 'Hoàn tất hồ sơ lần đầu đăng nhập — bắt buộc với tài khoản được tạo hàng loạt (chưa có họ tên/lớp thật/ảnh thẻ). Sau khi gọi thành công, tài khoản mới được vào ứng dụng.', body: { name: 'Nguyễn Văn A', classId: '12A1', gender: 'Nam', dob: '2009-05-01', phone: '', email: '', hometown: '', avatar: 'data:image/jpeg;base64,…' } }, async (req, ctx) => {
    const u = req.user;
    const b = req.body;
    u.name = str(b.name, 'họ tên', { required: true, max: 80 });
    if (u.role === 'student') {
      const classes = ctx.db.data.classes.filter(c => !c.placeholder).map(c => c.id);
      u.classId = oneOf(b.classId, 'lớp', classes);
      u.className = u.classId;
    }
    if (b.gender !== undefined) u.gender = str(b.gender, 'giới tính', { max: 10 });
    if (b.dob !== undefined) u.dob = str(b.dob, 'ngày sinh', { max: 10 });
    if (b.hometown !== undefined) u.hometown = str(b.hometown, 'quê quán', { max: 100 });
    if (b.phone !== undefined) { const p = str(b.phone, 'số điện thoại', { max: 20 }); if (p && !/^[+\d][\d .]{7,18}$/.test(p)) fail(400, 'Số điện thoại không hợp lệ.'); u.phone = p; }
    if (b.email !== undefined) { const e = str(b.email, 'email', { max: 120 }); if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) fail(400, 'Email không hợp lệ.'); u.email = e; }
    if (!b.avatar) fail(400, 'Vui lòng tải lên ảnh thẻ (có khuôn mặt) để hoàn tất hồ sơ.');
    u.avatar = await ctx.storeFile(b.avatar, 'avatar');
    u.profileComplete = true;
    audit(ctx, u, 'Hoàn tất hồ sơ lần đầu'); ctx.db.save();
    ctx.emit('profile:update', { user: publicUser(u) }, { userId: u.id });
    return { user: publicUser(u) };
  });

  // Face ID giả lập: thiết bị đăng ký một khóa ngẫu nhiên, lần sau "quét khuôn mặt" sẽ gửi khóa này.
  r.post('/api/auth/face/enroll', { auth: 'user', group: G, desc: 'Đăng ký Face ID (giả lập) cho thiết bị hiện tại. Trả về khóa thiết bị.', body: { device: 'iPhone của Lượng' } }, async (req, ctx) => {
    const key = await ctx.crypto.randomToken();
    const hash = await ctx.crypto.hmac('face', key);
    ctx.db.data.faceKeys = ctx.db.data.faceKeys.filter(f => !(f.userId === req.user.id && f.device === (req.body.device || 'Thiết bị')));
    ctx.db.data.faceKeys.push({ id: uid('FACE'), userId: req.user.id, device: str(req.body.device || 'Thiết bị', 'tên thiết bị', { max: 60 }), hash, createdAt: nowISO() });
    ctx.db.save();
    return { faceKey: key, userId: req.user.id };
  });

  r.post('/api/auth/face/login', { group: G, desc: 'Đăng nhập bằng Face ID (giả lập) với khóa thiết bị đã đăng ký.', body: { userId: '2126220004', faceKey: '…' } }, async (req, ctx) => {
    const hash = await ctx.crypto.hmac('face', str(req.body.faceKey, 'khóa Face ID', { required: true, max: 200 }));
    const f = ctx.db.data.faceKeys.find(x => x.hash === hash && x.userId === req.body.userId);
    if (!f) fail(401, 'Không nhận diện được khuôn mặt trên thiết bị này. Vui lòng đăng nhập bằng mật khẩu.');
    const u = ctx.db.data.users.find(x => x.id === f.userId);
    if (!u || u.locked) fail(403, 'Tài khoản không khả dụng.');
    u.lastLogin = nowISO();
    const token = await issueToken(ctx, u, 3650 * 86400, f.device || 'Face ID', true);
    audit(ctx, u, 'Đăng nhập Face ID', f.device); ctx.db.save();
    return { token, user: publicUser(u) };
  });
}
