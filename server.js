// ============================================================================
//  CỔNG HỌC ĐƯỜNG SỐ — THPT LÊ HOÀN
//  Máy chủ Node.js thuần (không cần cài thư viện): REST API + realtime (SSE) + web tĩnh.
//  Chạy:  node server.js        (mặc định http://localhost:3000)
// ============================================================================
import http from 'node:http';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildApi, API_VERSION } from './shared/api.js';
import { createSeed } from './shared/seed.js';
import { HttpError } from './shared/router.js';
import { createLlm } from './shared/ai/providers.js';
import { ATTACH_TYPES } from './shared/util.js';
import { migrateData } from './shared/migrate.js';
import { createArgon2Pool } from './shared/crypto/pool.js';
import { createPasswordHasher, SERVER_PARAMS } from './shared/crypto/password.js';
import { getSession, sessionValid, touchSession, putSession } from './shared/sessions.js';
import { startHandshake, getChannelKey, encryptEnvelope, decryptEnvelope } from './shared/channel.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(ROOT, '.env'));
const RAW_PORT = process.env.PORT;
const IS_SOCKET = typeof RAW_PORT === 'string' && RAW_PORT.trim() !== '' && Number.isNaN(Number(RAW_PORT));
const PORT = IS_SOCKET ? RAW_PORT : (Number(RAW_PORT) || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(ROOT, process.env.DATA_DIR || 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const PUBLIC_DIR = fs.existsSync(path.join(ROOT, 'public', 'index.html')) ? path.join(ROOT, 'public') : ROOT;
const SHARED_DIR = path.join(ROOT, 'shared');
const MAX_BODY = 400 * 1024 * 1024; // đủ chỗ cho các biểu mẫu gửi cùng lúc 2 ảnh (vd. ảnh đại diện + ảnh chứng chỉ), mỗi ảnh tối đa 100 MB gốc, cộng chi phí mã hóa + base64 (~gấp 1.8 lần)
const MAX_UPLOAD = 25 * 1024 * 1024; // tệp đính kèm tối đa 25 MB (gửi dạng base64 nên thân yêu cầu lớn hơn ~4/3)

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Mật mã: băm mật khẩu scrypt, token ký HMAC-SHA256 (tương tự JWT)
// ---------------------------------------------------------------------------
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');
const SECRET = process.env.APP_SECRET || (fs.existsSync(SECRET_FILE) ? fs.readFileSync(SECRET_FILE, 'utf8').trim() : (() => { const s = crypto.randomBytes(48).toString('hex'); fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 }); return s; })());
const b64u = (buf) => Buffer.from(buf).toString('base64url');

// Băm mật khẩu: Argon2id (RFC 9106, tham số theo khuyến nghị OWASP) chạy trong nhóm luồng worker riêng
// để không chặn máy chủ (chat thời gian thực vẫn mượt trong lúc có người đăng nhập).
const argon2Pool = createArgon2Pool(2);
// Hash scrypt cũ (trước khi nâng cấp lên Argon2id) vẫn xác thực được để không khóa tài khoản đang dùng — sẽ tự nâng cấp ngay sau khi đăng nhập thành công (xem auth.js).
async function legacyScryptVerify(pw, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, saltHex, hashHex] = stored.split('$');
  const hash = await new Promise((res, rej) => crypto.scrypt(pw, Buffer.from(saltHex, 'hex'), 32, { N: 16384, r: 8, p: 1 }, (e, k) => e ? rej(e) : res(k)));
  const expected = Buffer.from(hashHex, 'hex');
  return expected.length === hash.length && crypto.timingSafeEqual(expected, hash);
}
const { hashPassword, verifyPassword, needsRehash } = createPasswordHasher({
  raw: (args) => argon2Pool.run(args), params: SERVER_PARAMS, randomBytes: (n) => crypto.randomBytes(n), legacyVerify: legacyScryptVerify,
});

const cryptoProvider = {
  hashPassword, verifyPassword, needsRehash,
  async signToken(payload, ttlSec) {
    const body = b64u(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSec }));
    const sig = b64u(crypto.createHmac('sha256', SECRET).update(body).digest());
    return `${body}.${sig}`;
  },
  async verifyToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) return null;
    const [body, sig] = token.split('.');
    const expected = b64u(crypto.createHmac('sha256', SECRET).update(body).digest());
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp * 1000 > Date.now() ? p : null; } catch { return null; }
  },
  async hmac(key, msg) { return crypto.createHmac('sha256', SECRET + '|' + key).update(String(msg)).digest('hex'); },
  async randomToken() { return crypto.randomBytes(24).toString('base64url'); },
};

// ---------------------------------------------------------------------------
// Mã hóa dữ liệu lưu trữ (data at rest): toàn bộ data/db.json được mã hóa bằng AES-256-GCM
// trước khi ghi xuống đĩa, giải mã khi đọc lên — nếu ai đó lấy được tệp (sao lưu, USB, đĩa cứng cũ…)
// cũng không đọc được nội dung nếu không có khóa.
//
// Quản lý khóa: khóa chính (32 byte) được lưu tại data/db.key, quyền 0600 (chỉ chủ tệp đọc được),
// cùng cách làm với khóa ký token (secret.key) đã có từ trước — đây là mức bảo vệ thực tế cho một
// ứng dụng Node.js tự quản lý, chạy trên máy/máy chủ riêng của trường.
// Có thể đặt DB_ENC_KEY (64 ký tự hex = 32 byte) trong biến môi trường để KHÔNG lưu khóa trên đĩa —
// đây là điểm nối để một KMS/HSM thật (AWS KMS, Vault, Azure Key Vault…) tiêm khóa vào lúc khởi động
// tiến trình. Một ứng dụng Node.js độc lập không thể TỰ LÀ một KMS/HSM phần cứng — việc quản lý khóa
// bằng HSM thật cần một dịch vụ/hạ tầng chuyên biệt nằm ngoài phạm vi mã nguồn này.
const DB_KEY_FILE = path.join(DATA_DIR, 'db.key');
const DB_ENC_KEY = (() => {
  if (process.env.DB_ENC_KEY) { const k = Buffer.from(process.env.DB_ENC_KEY, 'hex'); if (k.length === 32) return k; console.warn('  ⚠ DB_ENC_KEY không hợp lệ (cần đúng 64 ký tự hex = 32 byte), bỏ qua.'); }
  if (fs.existsSync(DB_KEY_FILE)) return Buffer.from(fs.readFileSync(DB_KEY_FILE, 'utf8').trim(), 'hex');
  const k = crypto.randomBytes(32);
  fs.writeFileSync(DB_KEY_FILE, k.toString('hex'), { mode: 0o600 });
  return k;
})();
function encryptAtRest(plaintext) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', DB_ENC_KEY, iv);
  const enc = Buffer.concat([c.update(plaintext, 'utf8'), c.final()]);
  return JSON.stringify({ enc: 'aes-256-gcm', v: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: enc.toString('base64') });
}
function decryptAtRest(fileText) {
  const env = JSON.parse(fileText);
  if (env?.enc !== 'aes-256-gcm') return null; // tệp cũ chưa mã hóa (bản nâng cấp từ trước) → do load() xử lý riêng
  const d = crypto.createDecipheriv('aes-256-gcm', DB_ENC_KEY, Buffer.from(env.iv, 'base64'));
  d.setAuthTag(Buffer.from(env.tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(env.data, 'base64')), d.final()]).toString('utf8');
}

// ---------------------------------------------------------------------------
// Cơ sở dữ liệu JSON: đọc vào bộ nhớ, ghi xuống đĩa an toàn (ghi tệp tạm rồi đổi tên), mã hóa khi lưu
// ---------------------------------------------------------------------------
let lastAutoBackupAt = 0;
function fmtStamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function pruneBackups(maxKeep = 30) {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs })).sort((a, b) => b.t - a.t);
    for (const x of files.slice(maxKeep)) fs.rmSync(path.join(BACKUP_DIR, x.f), { force: true });
  } catch { /* bỏ qua */ }
}
async function createBackupSnapshot(type = 'auto', dataObj = db.data) {
  if (!dataObj) return '';
  const now = new Date();
  const stamp = fmtStamp(now);
  const name = type === 'daily' ? `daily-${stamp.slice(0, 8)}.json` : `${type}-${stamp}.json`;
  const json = JSON.stringify(dataObj);
  await fsp.writeFile(path.join(BACKUP_DIR, name), json, 'utf8');
  lastAutoBackupAt = Date.now();
  pruneBackups(30);
  return name;
}
function listBackupsSync() {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).map(f => {
      const p = path.join(BACKUP_DIR, f);
      const st = fs.statSync(p);
      return { f, p, mtimeMs: st.mtimeMs, size: st.size };
    }).sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, 30);
    return files.map(x => {
      let counts = { users: 0, reports: 0, counseling: 0, messages: 0 };
      try {
        const d = JSON.parse(fs.readFileSync(x.p, 'utf8'));
        counts = {
          users: d.users?.length || 0,
          reports: d.reports?.length || 0,
          counseling: d.counseling?.length || 0,
          messages: d.schoolChat?.messages?.length || 0,
        };
      } catch { /* bỏ qua */ }
      const type = x.f.startsWith('manual-') ? 'manual' : x.f.startsWith('daily-') ? 'daily' : x.f.startsWith('pre-restore-') ? 'pre-restore' : 'auto';
      return { id: x.f, type, at: new Date(x.mtimeMs).toISOString(), size: x.size, counts };
    });
  } catch { return []; }
}

const db = {
  data: null, timer: null, writing: Promise.resolve(),
  async load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = await fsp.readFile(DB_FILE, 'utf8');
        let plain;
        try { plain = decryptAtRest(raw); } catch { throw new Error('Sai khóa giải mã hoặc tệp bị hỏng'); }
        let upgraded = false;
        if (plain === null) { plain = raw; upgraded = true; } // db.json cũ (bản trước khi có mã hóa) — đọc bình thường rồi mã hóa lại khi lưu
        this.data = JSON.parse(plain);
        if (migrateData(this.data)) { upgraded = true; console.log('  ✓ Đã nâng cấp dữ liệu cũ lên phiên bản mới'); }
        if (upgraded) await this.flush();
        const dailyName = `daily-${fmtStamp().slice(0, 8)}.json`;
        if (!fs.existsSync(path.join(BACKUP_DIR, dailyName))) await createBackupSnapshot('daily', this.data);
        return false;
      } catch (e) { const bak = DB_FILE + '.corrupt-' + Date.now(); fs.renameSync(DB_FILE, bak); console.warn('⚠ db.json bị lỗi, đã sao lưu sang', bak, '·', e.message); }
    }
    await this.reseed();
    return true;
  },
  async reseed() {
    const hasLogo = fs.existsSync(path.join(PUBLIC_DIR, 'assets/school_logo.png'));
    this.data = await createSeed(cryptoProvider, { logo: hasLogo ? 'assets/school_logo.png' : undefined, studentAvatar: fs.existsSync(path.join(PUBLIC_DIR, 'assets/avatar.jpg')) ? 'assets/avatar.jpg' : null, teacherAvatar: fs.existsSync(path.join(PUBLIC_DIR, 'assets/teacher_avatar.jpg')) ? 'assets/teacher_avatar.jpg' : null });
    await this.flush();
  },
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 250); },
  flush() {
    clearTimeout(this.timer);
    this.writing = this.writing.then(async () => {
      const json = JSON.stringify(this.data);
      const tmp = DB_FILE + '.tmp';
      await fsp.writeFile(tmp, encryptAtRest(json));
      await fsp.rename(tmp, DB_FILE);
      await fsp.writeFile(path.join(DATA_DIR, 'db-live.json'), json).catch(() => {});
      const dailyName = `daily-${fmtStamp().slice(0, 8)}.json`;
      if (!fs.existsSync(path.join(BACKUP_DIR, dailyName))) {
        await createBackupSnapshot('daily', this.data).catch(() => {});
      } else if (Date.now() - lastAutoBackupAt >= 15 * 60 * 1000) {
        await createBackupSnapshot('auto', this.data).catch(() => {});
      }
    }).catch(e => console.error('Lỗi ghi dữ liệu:', e));
    return this.writing;
  },
};
setInterval(() => { if (db.data) createBackupSnapshot('auto', db.data).catch(() => {}); }, 30 * 60 * 1000).unref();

// ---------------------------------------------------------------------------
// Lưu ảnh tải lên (data URL → tệp trong data/uploads)
// ---------------------------------------------------------------------------
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
async function storeFile(value, kind = 'file') {
  if (typeof value !== 'string') throw httpError(400, 'Tệp đính kèm không hợp lệ.');
  if (/^(assets|uploads)\/[\w./-]+$/.test(value) && !value.includes('..')) return value;
  const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(value);
  if (!m || !MIME_EXT[m[1]]) throw httpError(400, 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 100 * 1024 * 1024) throw httpError(413, 'Ảnh quá lớn (tối đa 100 MB).');
  const name = `${kind}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}.${MIME_EXT[m[1]]}`;
  await fsp.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `uploads/${name}`;
}
// Địa chỉ IP trong mạng nội bộ (để mở app trên điện thoại cùng Wi-Fi)
function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) {
    if (n.family === 'IPv4' && !n.internal && !/^169\.254\./.test(n.address)) out.push(`${tls ? 'https' : 'http'}://${n.address}:${PORT}`);
  }
  return out.sort((a, b) => (/\/\/192\.168\./.test(b) ? 1 : 0) - (/\/\/192\.168\./.test(a) ? 1 : 0));
}

// Lưu tệp đính kèm tin nhắn (ảnh, video, tài liệu) vào data/uploads
async function storeUpload({ name, type, data }) {
  const m = /^data:([\w/+.-]*);base64,(.*)$/s.exec(data || '');
  if (!m) throw httpError(400, 'Dữ liệu tệp không hợp lệ.');
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length) throw httpError(400, 'Tệp rỗng.');
  if (buf.length > MAX_UPLOAD) throw httpError(413, 'Tệp quá lớn (tối đa 25 MB).');
  const ext = ATTACH_TYPES[type]?.[0] || 'bin';
  const base = String(name).replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'tep';
  const file = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}-${base}.${ext}`;
  await fsp.writeFile(path.join(UPLOAD_DIR, file), buf);
  return { url: `uploads/${file}`, size: buf.length };
}
const httpError = (status, message) => new HttpError(status, message);

// ---------------------------------------------------------------------------
// Realtime: Server-Sent Events
// ---------------------------------------------------------------------------
const clients = new Set();
function emit(event, data, target = { all: true }) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) {
    const u = c.user;
    const ok = target.all || (target.userId && u.id === target.userId) || (target.classId && u.classId === target.classId) ||
      (target.role === 'staff' && u.role !== 'student') || (target.role && target.role !== 'staff' && u.role === target.role);
    if (ok) c.res.write(payload);
  }
}
setInterval(() => { for (const c of clients) c.res.write(`: ping ${Date.now()}\n\n`); }, 25000).unref();

// ---------------------------------------------------------------------------
// Tích hợp AI (tùy chọn): điền ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY trong .env
// (xem shared/ai/providers.js để dùng Groq, OpenRouter, Ollama…)
// ---------------------------------------------------------------------------
const ENV_AI = !!createLlm(process.env);
// Cấu hình AI do Ban Giám hiệu nhập trong Cổng Giáo Viên (lưu ở data/db.json) được ưu tiên hơn tệp .env
function makeLlm(c = {}) {
  if (!c.provider || c.provider === 'off') return null;
  return createLlm({ AI_PROVIDER: c.provider === 'custom' ? 'openai' : c.provider, AI_API_KEY: c.apiKey || '', AI_MODEL: c.model || '', AI_BASE_URL: c.baseUrl || '', AI_TIMEOUT_MS: process.env.AI_TIMEOUT_MS });
}
function buildLlm() {
  const c = db.data?.aiConfig;
  if (c?.provider === 'off') return null;
  if (c?.provider) return makeLlm(c);
  return createLlm(process.env);
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const backupsService = {
  async list() { return { items: listBackupsSync() }; },
  async create() { const created = await createBackupSnapshot('manual', db.data); return { created, items: listBackupsSync() }; },
  async remove(id) {
    const fn = path.basename(String(id || ''));
    if (fn.endsWith('.json')) await fsp.rm(path.join(BACKUP_DIR, fn), { force: true });
    return { items: listBackupsSync() };
  },
  async download(id) {
    const fn = path.basename(String(id || ''));
    let src = db.data;
    if (fn.endsWith('.json') && fs.existsSync(path.join(BACKUP_DIR, fn))) {
      src = JSON.parse(await fsp.readFile(path.join(BACKUP_DIR, fn), 'utf8'));
    }
    return { id: fn || `backup-${fmtStamp()}.json`, backup: src };
  },
  async restore(id) {
    const fn = path.basename(String(id || ''));
    const p = path.join(BACKUP_DIR, fn);
    if (!fn.endsWith('.json') || !fs.existsSync(p)) throw httpError(404, 'Không tìm thấy bản sao lưu.');
    const restored = JSON.parse(await fsp.readFile(p, 'utf8'));
    if (!restored?.users) throw httpError(400, 'Tệp sao lưu không hợp lệ.');
    await createBackupSnapshot('pre-restore', db.data);
    db.data = restored;
    await db.flush();
    emit('sync', { at: new Date().toISOString(), restored: fn }, { all: true });
    return { items: listBackupsSync() };
  },
  async importData(restored) {
    if (!restored?.users || !Array.isArray(restored.users)) throw httpError(400, 'Tệp sao lưu tải lên không hợp lệ.');
    await createBackupSnapshot('pre-restore', db.data);
    const oldMap = new Map((db.data?.users || []).map(u => [u.id, u.passwordHash]));
    for (const u of restored.users) {
      if (String(u.passwordHash || '').endsWith('$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') && oldMap.has(u.id)) {
        u.passwordHash = oldMap.get(u.id);
      }
    }
    db.data = restored;
    await db.flush();
    emit('sync', { at: new Date().toISOString(), restored: 'import' }, { all: true });
    return { items: listBackupsSync() };
  },
};
const api = buildApi();
const ctx = { db, backups: backupsService, crypto: cryptoProvider, emit, storeFile, storeUpload, lanUrls, llm: null, envAi: ENV_AI, makeLlm, reloadLlm() { this.llm = buildLlm(); return this.llm; }, mode: 'server', reseed: () => db.reseed(), log: (m) => console.warn(`${new Date().toLocaleTimeString('vi-VN')}  ⚠ ${m}`) };

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.3gp': 'video/3gpp', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.weba': 'audio/webm', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.zip': 'application/zip', '.rar': 'application/vnd.rar' };
const ALIASES = { '/': 'index.html', '/login': 'index.html', '/dang-nhap': 'index.html', '/login.html': 'index.html', '/hocsinhlogin': 'index.html', '/loginhocinh': 'index.html', '/loginhocsinh': 'index.html', '/login-hoc-sinh': 'index.html', '/dang-nhap-hoc-sinh': 'index.html', '/app': 'app.html', '/hoc-sinh': 'app.html', '/desktop.html': 'app.html', '/admin': 'admin.html', '/quan-tri-vien': 'admin.html', '/giao-vien': 'admin.html', '/giaovien.html': 'admin.html', '/teacher': 'admin.html', '/admin-login': 'staff.html', '/admin-login.html': 'staff.html', '/loginadmin': 'staff.html', '/login-admin': 'staff.html', '/dang-nhap-admin': 'staff.html', '/dang-nhap-quan-tri': 'staff.html', '/quan-tri': 'staff.html', '/giaovien_login.html': 'staff.html', '/dang-nhap-giao-vien': 'staff.html', '/logingiaovien': 'staff.html', '/staff': 'staff.html', '/docs': 'docs.html', '/mobile': 'phone.html', '/phone': 'phone.html', '/app-dien-thoai': 'phone.html', '/dien-thoai': 'phone.html', '/api-docs': 'docs.html' };
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(self), geolocation=(self), microphone=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
};
// Chỉ bắt buộc trình duyệt luôn dùng HTTPS cho các lần sau khi máy chủ THỰC SỰ đang chạy HTTPS
// (bật qua biến môi trường HTTPS=1 ở dưới) — thêm header này khi đang chạy HTTP thường sẽ tự khóa người
// dùng khỏi trang nếu sau đó không có HTTPS, nên để hàm tạo server quyết định lúc khởi động.
function securityHeaders(isHttps) { return isHttps ? { ...SECURITY_HEADERS, 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : SECURITY_HEADERS; }

function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0, done = false; const chunks = [];
    // Lưu ý: KHÔNG gọi req.destroy() khi vượt giới hạn — hủy kết nối giữa chừng khiến trình duyệt không
    // nhận được phản hồi lỗi nào cả, chỉ thấy mất kết nối (hiện "Không kết nối được máy chủ" dù máy chủ
    // vẫn đang chạy bình thường). Thay vào đó, báo lỗi 413 rõ ràng rồi lặng lẽ bỏ qua phần dữ liệu còn lại.
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { if (!done) { done = true; reject(httpError(413, limit > MAX_BODY ? 'Tệp quá lớn (tối đa 25 MB).' : 'Dữ liệu gửi lên quá lớn (tối đa 400 MB).')); } }
      else chunks.push(c);
    });
    req.on('end', () => {
      if (done) return;
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(httpError(400, 'Dữ liệu gửi lên không đúng định dạng JSON.')); }
    });
    req.on('error', (e) => { if (!done) { done = true; reject(e); } });
  });
}

function sendJson(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', ...securityHeaders(!!tls), ...extra });
  res.end(JSON.stringify(body));
}

async function serveStatic(req, res, urlPath) {
  if (/^\/(data(\/|$)|server\.js$|app\.cjs$|package\.json$|\.env|\.htaccess)/i.test(urlPath)) return notFound(res);
  let file;
  const aliasKey = urlPath.length > 1 ? urlPath.replace(/\/+$/, '').toLowerCase() : urlPath;
  if (ALIASES[aliasKey]) file = path.join(PUBLIC_DIR, ALIASES[aliasKey]);
  else if (urlPath.startsWith('/shared/')) file = path.join(SHARED_DIR, urlPath.slice(8));
  else if (urlPath.startsWith('/uploads/')) file = path.join(UPLOAD_DIR, urlPath.slice(9));
  else file = path.join(PUBLIC_DIR, urlPath);
  const base = urlPath.startsWith('/shared/') ? SHARED_DIR : urlPath.startsWith('/uploads/') ? UPLOAD_DIR : PUBLIC_DIR;
  // So khớp có dấu phân cách ở cuối để chặn dò đường dẫn kiểu "../" thoát khỏi thư mục cho phép
  // (và tránh khớp nhầm một thư mục anh em có tiền tố trùng tên, ví dụ "uploads-evil").
  if (!(path.resolve(file) + path.sep).startsWith(base + path.sep)) return notFound(res);
  try {
    const st = await fsp.stat(file);
    if (st.isDirectory()) return serveStatic(req, res, path.posix.join(urlPath, 'index.html'));
    const ext = path.extname(file).toLowerCase();
    const etag = `W/"${st.size.toString(36)}-${st.mtimeMs.toString(36)}"`;
    if (req.headers['if-none-match'] === etag) { res.writeHead(304); return res.end(); }
    const isUpload = base === UPLOAD_DIR;
    const inline = /^\.(jpe?g|png|webp|gif|svg|mp4|webm|mov|3gp|mp3|m4a|weba|ogg|wav|pdf)$/.test(ext);
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', ETag: etag, 'Accept-Ranges': 'bytes', 'Cache-Control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-store' : 'public, max-age=3600', ...securityHeaders(!!tls) };
    if (isUpload) { headers['Access-Control-Allow-Origin'] = '*'; if (!inline) headers['Content-Disposition'] = 'attachment'; }
    // Hỗ trợ tua video (HTTP Range)
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && st.size) {
      let start = range[1] ? Number(range[1]) : st.size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : st.size - 1;
      start = Math.max(0, start); end = Math.min(end, st.size - 1);
      if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { ...headers, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch { notFound(res); }
}
function notFound(res) {
  const f = path.join(PUBLIC_DIR, '404.html');
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...securityHeaders(!!tls) });
  fs.existsSync(f) ? fs.createReadStream(f).pipe(res) : res.end('<h1>404 · Không tìm thấy trang</h1><a href="/">Về trang chủ</a>');
}

// ---------------------------------------------------------------------------
// HTTPS / TLS 1.3 (tùy chọn, mặc định TẮT để không phá vỡ cách chạy đơn giản hiện tại qua tệp .bat).
// Đặt HTTPS=1 trong .env để bật mã hóa đường truyền bằng TLS 1.3, trao đổi khóa X25519, mật mã AES-256-GCM.
// Có thể tự cấp chứng chỉ (nếu máy có openssl) hoặc chỉ định sẵn qua TLS_CERT/TLS_KEY (chứng chỉ thật, vd. Let's Encrypt).
// LƯU Ý THẬT: trao đổi khóa hậu lượng tử (X25519 lai Kyber…) và quản lý khóa bằng KMS/HSM thật
// KHÔNG thể tự triển khai trong một ứng dụng Node.js độc lập — xem ghi chú ở cuối hàm để biết hướng triển khai thực tế.
function setupTls() {
  if (process.env.HTTPS !== '1') return null;
  const certPath = process.env.TLS_CERT || path.join(DATA_DIR, 'tls', 'cert.pem');
  const keyPath = process.env.TLS_KEY || path.join(DATA_DIR, 'tls', 'key.pem');
  try {
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      fs.mkdirSync(path.dirname(certPath), { recursive: true });
      // Tự cấp chứng chỉ tự ký (self-signed) để CÓ mã hóa TLS 1.3 ngay trên mạng LAN của trường — trình duyệt
      // sẽ cảnh báo "không tin cậy" lần đầu (vì không do một CA công khai cấp), người dùng cần bấm "Tiếp tục"/
      // "Nâng cao → Vẫn truy cập" một lần. Nếu trường có tên miền thật, nên dùng chứng chỉ Let's Encrypt (miễn phí)
      // và đặt đường dẫn qua TLS_CERT/TLS_KEY để có kết nối tin cậy, không cảnh báo.
      execFileSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-keyout', keyPath, '-out', certPath, '-days', '825', '-nodes', '-subj', '/CN=lehoan-portal/O=THPT Le Hoan', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
      fs.chmodSync(keyPath, 0o600);
      console.log('  ✓ Đã tự tạo chứng chỉ TLS tự ký tại data/tls/ (hợp lệ ~825 ngày)');
    }
    return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
  } catch (e) {
    console.warn('  ⚠ Không thể bật HTTPS (thiếu openssl hoặc chứng chỉ không đọc được), tiếp tục chạy HTTP thường:', e.message);
    console.warn('    → Cách khác: cấp sẵn chứng chỉ rồi đặt TLS_CERT / TLS_KEY trong tệp .env, hoặc cài openssl vào PATH.');
    return null;
  }
}
const tls = setupTls();
const createServer = (handler) => tls
  ? https.createServer({ ...tls, minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3', ciphers: 'TLS_AES_256_GCM_SHA384', ecdhCurve: 'X25519' }, handler)
  : http.createServer(handler);

const server = createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, 'http://localhost');
  const urlPath = decodeURIComponent(url.pathname);

  if (urlPath.startsWith('/api')) {
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Channel-Id', 'Access-Control-Max-Age': '86400' }); return res.end(); }
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : url.searchParams.get('token');

    // Bắt tay mã hóa dữ liệu API ở tầng ứng dụng (xem shared/channel.js) — không mã hóa chính nó,
    // vì đây là bước thiết lập khóa dùng chung.
    if (urlPath === '/api/handshake' && req.method === 'POST') {
      try {
        const body = await readBody(req, 4096);
        const hs = body?.pub && startHandshake(body.pub);
        if (!hs) return sendJson(res, 400, { error: 'Khóa bắt tay không hợp lệ.' });
        return sendJson(res, 200, { cid: hs.cid, pub: hs.serverPub });
      } catch (e) { return sendJson(res, e.status || 400, { error: e.message || 'Bắt tay thất bại.' }); }
    }
    const channelId = req.headers['x-channel-id'];
    const channelKey = channelId ? getChannelKey(String(channelId)) : null;
    if (channelId && !channelKey) return sendJson(res, 409, { error: 'Kênh mã hóa đã hết hạn, vui lòng thử lại.', details: { channelExpired: true } }, { 'X-Channel-Expired': '1', 'Access-Control-Expose-Headers': 'X-Channel-Expired' });

    // Kênh realtime
    if (urlPath === '/api/stream') {
      const p = await cryptoProvider.verifyToken(token);
      let sess = p?.jti && getSession(p.jti);
      if (p?.jti && !sess) {
        putSession(p.jti, { userId: p.sub, v: p.v || 1, abs: p.exp, device: 'Trình duyệt', issuedAt: p.iat || Date.now() / 1000, noIdle: !!p.noIdle });
        sess = getSession(p.jti);
      }
      const user = p && sessionValid(sess) && db.data.users.find(u => u.id === p.sub && !u.locked);
      if (!user) return sendJson(res, 401, { error: 'Phiên đăng nhập không hợp lệ.' });
      touchSession(p.jti);
      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no', 'Access-Control-Allow-Origin': '*' });
      res.write(`event: ready\ndata: ${JSON.stringify({ user: user.id, at: new Date().toISOString() })}\n\n`);
      const client = { res, user: { id: user.id, role: user.role, classId: user.classId } };
      clients.add(client);
      const keepAlive = setInterval(() => { try { res.write(':ping\n\n'); } catch { /* bỏ qua */ } }, 25000);
      req.on('close', () => { clients.delete(client); clearInterval(keepAlive); });
      return;
    }

    try {
      let body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req, urlPath === '/api/uploads' ? Math.ceil(MAX_UPLOAD * 1.37) + 4096 : MAX_BODY) : {};
      // Đã bắt tay kênh mã hóa: thân yêu cầu thật sự đến dưới dạng gói {iv,tag,data} — giải mã trước khi xử lý.
      if (channelKey && body && Object.keys(body).length) {
        try { body = decryptEnvelope(channelKey, body) || {}; }
        catch { return sendJson(res, 400, { error: 'Không giải mã được dữ liệu gửi lên.' }); }
      }
      if (body && typeof body === 'object' && !body.device) body.device = String(req.headers['user-agent'] || '').slice(0, 120);
      const out = await api.handle({ method: req.method, path: urlPath.replace(/\/+$/, '') || '/api', query: Object.fromEntries(url.searchParams), body, token, ip: req.socket.remoteAddress }, ctx);
      const newTokenHeader = out.rotatedToken ? { 'X-New-Token': out.rotatedToken } : {};
      if (out.raw) {
        // Tệp nhị phân (xuất Excel, tệp đính kèm…) nằm ngoài phạm vi lớp mã hóa này — xem shared/channel.js.
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Content-Disposition, X-New-Token', 'Cache-Control': 'no-store', ...newTokenHeader, ...out.headers });
        res.end(Buffer.from(out.body));
      } else {
        const resBody = channelKey ? encryptEnvelope(channelKey, out.body) : out.body;
        sendJson(res, out.status, resBody, { 'Access-Control-Expose-Headers': 'X-New-Token', ...newTokenHeader });
      }
      if (process.env.LOG !== 'off') console.log(`${new Date().toLocaleTimeString('vi-VN')}  ${req.method.padEnd(6)} ${urlPath}  →  ${out.status}  ${Date.now() - started}ms`);
    } catch (e) {
      const errBody = { error: e.status ? e.message : 'Máy chủ gặp lỗi.' };
      sendJson(res, e.status || 500, channelKey ? encryptEnvelope(channelKey, errBody) : errBody);
      if (!e.status) console.error(e);
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, urlPath);
});

const fresh = await db.load();
ctx.reloadLlm();
const onServerReady = () => {
  const proto = tls ? 'https' : 'http';
  const W = 64, row = (t = '') => console.log(`│ ${t.padEnd(W - 2)} │`), line = '─'.repeat(W);
  console.log(`\n┌${line}┐`);
  row(`CỔNG HỌC ĐƯỜNG SỐ · ${db.data.settings.schoolName}`);
  console.log(`├${line}┤`);
  row(`Đăng nhập HS      ${proto}://localhost:${PORT}/loginhocinh`);
  row(`Cổng Học Sinh     ${proto}://localhost:${PORT}/app`);
  row(`Đăng nhập GV/QT   ${proto}://localhost:${PORT}/quan-tri`);
  row(`Cổng Giáo Viên    ${proto}://localhost:${PORT}/admin`);
  row(`App điện thoại    ${proto}://localhost:${PORT}/mobile`);
  for (const u of lanUrls().slice(0, 2)) row(`Điện thoại Wi-Fi  ${u}`);
  row(`Tài liệu API      ${proto}://localhost:${PORT}/docs`);
  row(`REST API v${API_VERSION} · ${api.routes.length} endpoint · realtime SSE`);
  console.log(`├${line}┤`);
  row('Học sinh   2126220004 / 123456');
  row('Giáo viên  GV2024089  / 123456');
  row('Quản trị   admin      / admin123');
  console.log(`└${line}┘`);
  console.log(fresh ? '  ✓ Đã tạo dữ liệu mẫu tại data/db.json\n' : '  ✓ Đã nạp dữ liệu từ data/db.json\n');
  console.log(ctx.llm ? `  ✓ AI đã bật: ${ctx.llm.label} (Trợ lý AI + phân tích lừa đảo)\n` : '  • AI chưa bật: vào Cổng Giáo Viên → AI Guard → Kết nối AI để nhập khóa API (hoặc điền vào tệp .env)\n');
  if (tls) console.log('  ✓ HTTPS/TLS 1.3 đang bật (AES-256-GCM, trao đổi khóa X25519). Chứng chỉ tự ký: trình duyệt sẽ cảnh báo "không tin cậy" lần đầu — đây là bình thường trên LAN nội bộ, bấm "Tiếp tục"/"Nâng cao → Vẫn truy cập" một lần.\n');
  else console.log('  • Đang chạy HTTP thường (không mã hóa đường truyền). Đặt HTTPS=1 trong tệp .env để bật TLS 1.3 + AES-256-GCM.\n');
};
// Tương thích cPanel (Phusion Passenger / LiteSpeed lsnode): nếu PORT là socket hoặc chạy qua Passenger thì không ép HOST
if (IS_SOCKET || typeof globalThis.PhusionPassenger !== 'undefined' || process.env.PASSENGER_APP_ENV) {
  server.listen(PORT, onServerReady);
} else {
  server.listen(PORT, HOST, onServerReady);
}

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { console.log('\nĐang lưu dữ liệu…'); await db.flush(); process.exit(0); });

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
