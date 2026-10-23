// Bộ định tuyến REST tối giản, chạy được cả trên Node.js (server.js) lẫn trình duyệt (bản demo).
// Mỗi route khai báo: phương thức, đường dẫn, quyền truy cập, nhóm, mô tả — dùng để sinh tài liệu API tự động.
import { getSession, sessionValid, needsRotation, putSession, dropSession, supersededBy, isRevoked } from './sessions.js';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const fail = (status, message, details) => { throw new HttpError(status, message, details); };

/** Trả về dữ liệu nhị phân (vd: file Excel) thay vì JSON */
export const raw = (body, headers = {}) => ({ __raw: true, body, headers });

const ROLE_RULES = {
  public: () => true,
  user: (u) => !!u,
  student: (u) => u && u.role === 'student',
  staff: (u) => u && (u.role === 'teacher' || u.role === 'admin'),
  admin: (u) => u && u.role === 'admin',
};

export function createRouter() {
  const routes = [];

  function add(method, path, meta, handler) {
    if (typeof meta === 'function') { handler = meta; meta = {}; }
    const keys = [];
    const pattern = new RegExp('^' + path.replace(/\/:([a-zA-Z_]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$');
    routes.push({ method, path, pattern, keys, handler, auth: meta.auth || 'public', group: meta.group || 'Khác', desc: meta.desc || '', body: meta.body || null, query: meta.query || null });
  }

  const api = {
    routes,
    get: (p, m, h) => add('GET', p, m, h),
    post: (p, m, h) => add('POST', p, m, h),
    put: (p, m, h) => add('PUT', p, m, h),
    patch: (p, m, h) => add('PATCH', p, m, h),
    delete: (p, m, h) => add('DELETE', p, m, h),

    /** Danh sách endpoint (phục vụ trang tài liệu /docs.html) */
    describe() {
      return routes.map(r => ({ method: r.method, path: r.path, auth: r.auth, group: r.group, desc: r.desc, body: r.body, query: r.query }));
    },

    /**
     * Xử lý một yêu cầu.
     * @param {{method:string,path:string,query:object,body:any,token?:string,ip?:string}} req
     * @param {object} ctx  { db, crypto, emit, storeFile, config }
     */
    async handle(req, ctx) {
      const method = req.method.toUpperCase();
      let matchedPath = false;
      for (const r of routes) {
        const m = r.pattern.exec(req.path);
        if (!m) continue;
        matchedPath = true;
        if (r.method !== method) continue;
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        try {
          const { user, rotatedToken } = await resolveUser(req.token, ctx);
          if (!ROLE_RULES[r.auth](user)) {
            if (!user) fail(401, 'Bạn cần đăng nhập để sử dụng chức năng này.');
            fail(403, 'Tài khoản của bạn không có quyền truy cập chức năng này.');
          }
          const out = await r.handler({ ...req, params, user, query: req.query || {}, body: req.body || {} }, ctx);
          if (out && out.__raw) return { status: 200, raw: true, body: out.body, headers: { ...out.headers, ...(rotatedToken ? { 'X-New-Token': rotatedToken } : {}) } };
          return { status: 200, body: out === undefined ? { ok: true } : out, rotatedToken };
        } catch (err) {
          if (err instanceof HttpError) return { status: err.status, body: { error: err.message, details: err.details } };
          (ctx.log || console.error)('[API]', method, req.path, err);
          return { status: 500, body: { error: 'Máy chủ gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.' } };
        }
      }
      if (matchedPath) return { status: 405, body: { error: 'Phương thức không được hỗ trợ cho đường dẫn này.' } };
      return { status: 404, body: { error: `Không tìm thấy API ${method} ${req.path}` } };
    },
  };
  return api;
}

/**
 * Xác thực token và — nếu phiên đã "sống" đủ lâu — đổi sang một token mới (xem shared/sessions.js).
 * Trả về { user, rotatedToken }: user là null nếu token không hợp lệ/hết hạn; rotatedToken chỉ có giá
 * trị khi vừa đổi token, bộ gọi (server.js / demo.js) cần trả giá trị này lại cho trình duyệt.
 */
async function resolveUser(token, ctx) {
  if (!token) return { user: null };
  const payload = await ctx.crypto.verifyToken(token);
  if (!payload || !payload.jti) return { user: null };
  const u = ctx.db.data.users.find(x => x.id === payload.sub);
  if (!u || u.locked) return { user: null };
  if (u.tokenVersion && payload.v !== u.tokenVersion) return { user: null };
  let sess = getSession(payload.jti);
  if (!sess) {
    // Phiên không còn — có thể token này vừa bị đổi sang token mới bởi một yêu cầu khác chạy song song
    // (ví dụ trang gọi nhiều API cùng lúc lúc tải). Trong khoảng đệm ngắn, trỏ sang phiên mới thay vì
    // coi là hết hạn, để các yêu cầu song song đó không bị văng ra ngoài một cách oan uổng.
    const newJti = supersededBy(payload.jti);
    const s2 = newJti && getSession(newJti);
    if (s2 && sessionValid(s2)) {
      s2.lastSeen = Date.now() / 1000;
      const rotatedToken = await ctx.crypto.signToken({ sub: u.id, role: u.role, v: payload.v, jti: newJti, ...(s2.noIdle ? { noIdle: true } : {}) }, Math.max(1, s2.abs - Math.floor(Date.now() / 1000)));
      return { user: u, rotatedToken };
    }
    if (isRevoked(payload.jti)) return { user: null };
    putSession(payload.jti, { userId: u.id, v: payload.v, abs: payload.exp, device: 'Trình duyệt', issuedAt: payload.iat || Date.now() / 1000, noIdle: !!payload.noIdle });
    sess = getSession(payload.jti);
  }
  if (!sessionValid(sess)) { dropSession(payload.jti); return { user: null }; }
  sess.lastSeen = Date.now() / 1000;
  if (!needsRotation(sess)) return { user: u };
  // Token đã dùng đủ lâu (>ROTATE_SEC): phát token mới. Giữ token cũ dùng tạm được thêm một khoảng đệm ngắn
  // (xem ROTATE_GRACE_SEC) để các yêu cầu chạy song song còn mang token cũ không bị văng ra ngoài,
  // trước khi token cũ bị vô hiệu hẳn — dù bị lộ cũng chỉ còn dùng được trong khoảnh khắc ngắn đó.
  const jti = await ctx.crypto.randomToken();
  putSession(jti, { userId: u.id, v: payload.v, abs: payload.exp, device: sess.device, issuedAt: Date.now() / 1000, noIdle: !!sess.noIdle });
  dropSession(payload.jti, jti);
  const rotatedToken = await ctx.crypto.signToken({ sub: u.id, role: u.role, v: payload.v, jti, ...(sess.noIdle ? { noIdle: true } : {}) }, Math.max(1, payload.exp - Math.floor(Date.now() / 1000)));
  return { user: u, rotatedToken };
}
