// Băm & xác thực mật khẩu bằng Argon2id (RFC 9106) — thuật toán được OWASP khuyến nghị hàng đầu
// để chống dò mật khẩu (brute-force / rainbow table): tốn nhiều bộ nhớ nên khó tăng tốc bằng GPU/ASIC,
// có muối (salt) ngẫu nhiên riêng cho từng mật khẩu nên hai người dùng cùng mật khẩu sẽ ra hai chuỗi băm khác nhau.
// Mật khẩu KHÔNG BAO GIỜ được mã hóa hai chiều (AES…) để lưu trữ — băm một chiều mới đúng chuẩn.
import { argon2idRaw, encodePhc, parsePhc, safeEqual, ARGON2_PARAMS } from './argon2.js';

// Máy chủ Node.js: tham số đầy đủ theo khuyến nghị OWASP (19 MiB bộ nhớ, ~500-700ms/lần — chạy trong worker thread riêng, không chặn máy chủ).
export const SERVER_PARAMS = ARGON2_PARAMS;
// Bản xem trước chạy trong trình duyệt: giảm bộ nhớ để không treo giao diện, vẫn là Argon2id thật (không hạ xuống thuật toán yếu hơn).
export const DEMO_PARAMS = { m: 9216, t: 2, p: 1 };

function randomSalt(randomBytes) { return randomBytes(16); }

/**
 * Tạo bộ hàm hashPassword / verifyPassword.
 * @param {{ raw: (args) => Promise<Uint8Array>|Uint8Array, params: {m:number,t:number,p:number}, randomBytes: (n:number) => Uint8Array, legacyVerify?: (pw:string, stored:string) => Promise<boolean>|boolean }} opts
 */
export function createPasswordHasher({ raw, params, randomBytes, legacyVerify }) {
  async function hashPassword(password) {
    const pw = new TextEncoder().encode(String(password));
    const salt = randomSalt(randomBytes);
    const hash = await raw({ password: pw, salt, t: params.t, m: params.m, p: params.p, tagLength: 32 });
    return encodePhc(params, salt, hash);
  }
  async function verifyPassword(password, stored) {
    if (!stored) return false;
    const parsed = parsePhc(stored);
    if (!parsed) return legacyVerify ? !!(await legacyVerify(password, stored)) : false; // tương thích hash cũ (scrypt) để nâng cấp dần
    const pw = new TextEncoder().encode(String(password));
    const hash = await raw({ password: pw, salt: parsed.salt, t: parsed.t, m: parsed.m, p: parsed.p, tagLength: parsed.hash.length });
    return safeEqual(hash, parsed.hash);
  }
  /** true nếu hash cũ dùng tham số yếu hơn hiện tại (hoặc không phải Argon2id) — dùng để nâng cấp hash ngay sau khi xác thực thành công */
  function needsRehash(stored) {
    const parsed = parsePhc(stored);
    return !parsed || parsed.m < params.m || parsed.t < params.t;
  }
  return { hashPassword, verifyPassword, needsRehash };
}
