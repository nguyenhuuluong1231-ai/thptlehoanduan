// Argon2id (RFC 9106) viết bằng JavaScript thuần, không cần thư viện ngoài.
// Dùng để băm mật khẩu khi Node.js chưa có crypto.argon2 (Node < 24.7) và trong bản xem trước trên trình duyệt.
// Đã đối chiếu với vector kiểm thử chính thức của RFC 9106 và bộ kiểm thử gốc của tác giả Argon2 (scripts/smoke-test.js).

// ---------------------------------------------------------------- BLAKE2b (RFC 7693)
const IV = new Uint32Array([
  0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a,
  0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c, 0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19,
]);
const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4], [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13], [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11], [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5], [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
].map(r => r.map(x => x * 2));

function add64(v, a, b) { const o0 = v[a] + v[b]; let o1 = v[a + 1] + v[b + 1]; if (o0 >= 0x100000000) o1++; v[a] = o0; v[a + 1] = o1; }
function add64c(v, a, b0, b1) { let o0 = v[a] + b0; if (b0 < 0) o0 += 0x100000000; let o1 = v[a + 1] + b1; if (o0 >= 0x100000000) o1++; v[a] = o0; v[a + 1] = o1; }
const W = new Uint32Array(32), M = new Uint32Array(32);
function bG(a, b, c, d, ix, iy) {
  const x0 = M[ix], x1 = M[ix + 1], y0 = M[iy], y1 = M[iy + 1];
  add64(W, a, b); add64c(W, a, x0, x1);
  let xor0 = W[d] ^ W[a], xor1 = W[d + 1] ^ W[a + 1]; W[d] = xor1; W[d + 1] = xor0;
  add64(W, c, d);
  xor0 = W[b] ^ W[c]; xor1 = W[b + 1] ^ W[c + 1]; W[b] = (xor0 >>> 24) ^ (xor1 << 8); W[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);
  add64(W, a, b); add64c(W, a, y0, y1);
  xor0 = W[d] ^ W[a]; xor1 = W[d + 1] ^ W[a + 1]; W[d] = (xor0 >>> 16) ^ (xor1 << 16); W[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);
  add64(W, c, d);
  xor0 = W[b] ^ W[c]; xor1 = W[b + 1] ^ W[c + 1]; W[b] = (xor1 >>> 31) ^ (xor0 << 1); W[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
}
function compress(h, block, t, last) {
  for (let i = 0; i < 16; i++) { W[i] = h[i]; W[i + 16] = IV[i]; }
  W[24] ^= t; W[25] ^= t / 0x100000000;
  if (last) { W[28] = ~W[28]; W[29] = ~W[29]; }
  for (let i = 0; i < 32; i++) M[i] = block[i * 4] ^ (block[i * 4 + 1] << 8) ^ (block[i * 4 + 2] << 16) ^ (block[i * 4 + 3] << 24);
  for (let r = 0; r < 12; r++) {
    const s = SIGMA[r];
    bG(0, 8, 16, 24, s[0], s[1]); bG(2, 10, 18, 26, s[2], s[3]); bG(4, 12, 20, 28, s[4], s[5]); bG(6, 14, 22, 30, s[6], s[7]);
    bG(0, 10, 20, 30, s[8], s[9]); bG(2, 12, 22, 24, s[10], s[11]); bG(4, 14, 16, 26, s[12], s[13]); bG(6, 8, 18, 28, s[14], s[15]);
  }
  for (let i = 0; i < 16; i++) h[i] ^= W[i] ^ W[i + 16];
}
/** BLAKE2b không khóa, độ dài đầu ra 1–64 byte. `parts` là danh sách Uint8Array nối tiếp nhau. */
export function blake2b(outLen, ...parts) {
  const h = new Uint32Array(IV); h[0] ^= 0x01010000 ^ outLen;
  const buf = new Uint8Array(128); let c = 0, t = 0;
  for (const p of parts) for (let i = 0; i < p.length; i++) { if (c === 128) { t += c; compress(h, buf, t, false); c = 0; } buf[c++] = p[i]; }
  t += c; while (c < 128) buf[c++] = 0; compress(h, buf, t, true);
  const out = new Uint8Array(outLen); for (let i = 0; i < outLen; i++) out[i] = h[i >> 2] >> (8 * (i & 3));
  return out;
}

// ---------------------------------------------------------------- Argon2
const le32 = (n) => new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]);
/** Hàm băm độ dài thay đổi H' của Argon2 */
function hPrime(T, ...parts) {
  if (T <= 64) return blake2b(T, le32(T), ...parts);
  const out = new Uint8Array(T), r = Math.ceil(T / 32) - 2;
  let v = blake2b(64, le32(T), ...parts); out.set(v.subarray(0, 32), 0);
  for (let i = 1; i < r; i++) { v = blake2b(64, v); out.set(v.subarray(0, 32), i * 32); }
  out.set(blake2b(T - 32 * r, v), r * 32);
  return out;
}
// Phần cao của tích hai số 32 bit (chính xác, không dùng BigInt)
function mulHi(a, b) { const ah = a >>> 16, al = a & 0xffff, bh = b >>> 16, bl = b & 0xffff; return (ah * bh + Math.floor(((ah * bl + al * bh) * 65536 + al * bl) / 4294967296)) >>> 0; }

// GB của Argon2 (BLAKE2b có phép nhân BlaMka) trên mảng R gồm 128 từ 64 bit (256 phần tử uint32)
function GB(R, a, b, c, d) {
  let al = R[a], ah = R[a + 1], bl = R[b], bh = R[b + 1], cl = R[c], ch = R[c + 1], dl = R[d], dh = R[d + 1], lo, hi, pl, ph, t;
  // a = a + b + 2·lo(a)·lo(b)
  pl = Math.imul(al, bl) >>> 0; ph = mulHi(al, bl); ph = ((ph << 1) | (pl >>> 31)) >>> 0; pl = (pl << 1) >>> 0;
  lo = al + bl; hi = ah + bh + (lo > 0xffffffff ? 1 : 0); lo >>>= 0; t = lo + pl; hi += ph + (t > 0xffffffff ? 1 : 0); al = t >>> 0; ah = hi >>> 0;
  // d = (d ^ a) >>> 32
  t = (dl ^ al) >>> 0; dl = (dh ^ ah) >>> 0; dh = t;
  // c = c + d + 2·lo(c)·lo(d)
  pl = Math.imul(cl, dl) >>> 0; ph = mulHi(cl, dl); ph = ((ph << 1) | (pl >>> 31)) >>> 0; pl = (pl << 1) >>> 0;
  lo = cl + dl; hi = ch + dh + (lo > 0xffffffff ? 1 : 0); lo >>>= 0; t = lo + pl; hi += ph + (t > 0xffffffff ? 1 : 0); cl = t >>> 0; ch = hi >>> 0;
  // b = (b ^ c) >>> 24
  lo = bl ^ cl; hi = bh ^ ch; bl = ((lo >>> 24) | (hi << 8)) >>> 0; bh = ((hi >>> 24) | (lo << 8)) >>> 0;
  // a = a + b + 2·lo(a)·lo(b)
  pl = Math.imul(al, bl) >>> 0; ph = mulHi(al, bl); ph = ((ph << 1) | (pl >>> 31)) >>> 0; pl = (pl << 1) >>> 0;
  lo = al + bl; hi = ah + bh + (lo > 0xffffffff ? 1 : 0); lo >>>= 0; t = lo + pl; hi += ph + (t > 0xffffffff ? 1 : 0); al = t >>> 0; ah = hi >>> 0;
  // d = (d ^ a) >>> 16
  lo = dl ^ al; hi = dh ^ ah; dl = ((lo >>> 16) | (hi << 16)) >>> 0; dh = ((hi >>> 16) | (lo << 16)) >>> 0;
  // c = c + d + 2·lo(c)·lo(d)
  pl = Math.imul(cl, dl) >>> 0; ph = mulHi(cl, dl); ph = ((ph << 1) | (pl >>> 31)) >>> 0; pl = (pl << 1) >>> 0;
  lo = cl + dl; hi = ch + dh + (lo > 0xffffffff ? 1 : 0); lo >>>= 0; t = lo + pl; hi += ph + (t > 0xffffffff ? 1 : 0); cl = t >>> 0; ch = hi >>> 0;
  // b = (b ^ c) >>> 63
  lo = bl ^ cl; hi = bh ^ ch; bl = ((lo << 1) | (hi >>> 31)) >>> 0; bh = ((hi << 1) | (lo >>> 31)) >>> 0;
  R[a] = al; R[a + 1] = ah; R[b] = bl; R[b + 1] = bh; R[c] = cl; R[c + 1] = ch; R[d] = dl; R[d + 1] = dh;
}
// Hoán vị P trên 16 từ 64 bit có chỉ số (theo từ) w[0..15]
function P(R, w) {
  const o = (i) => w[i] * 2;
  GB(R, o(0), o(4), o(8), o(12)); GB(R, o(1), o(5), o(9), o(13)); GB(R, o(2), o(6), o(10), o(14)); GB(R, o(3), o(7), o(11), o(15));
  GB(R, o(0), o(5), o(10), o(15)); GB(R, o(1), o(6), o(11), o(12)); GB(R, o(2), o(7), o(8), o(13)); GB(R, o(3), o(4), o(9), o(14));
}
const ROWS = Array.from({ length: 8 }, (_, i) => Array.from({ length: 16 }, (_, k) => 16 * i + k));
const COLS = Array.from({ length: 8 }, (_, i) => Array.from({ length: 16 }, (_, k) => 2 * i + 16 * (k >> 1) + (k & 1)));
const Rb = new Uint32Array(256), Tb = new Uint32Array(256);
/** Hàm nén G: next = G(prev, ref) (xor với giá trị cũ của next nếu withXor) */
function fillBlock(mem, prev, ref, next, withXor) {
  for (let i = 0; i < 256; i++) { Rb[i] = mem[ref + i] ^ mem[prev + i]; Tb[i] = withXor ? Rb[i] ^ mem[next + i] : Rb[i]; }
  for (const r of ROWS) P(Rb, r);
  for (const c of COLS) P(Rb, c);
  for (let i = 0; i < 256; i++) mem[next + i] = Tb[i] ^ Rb[i];
}

/**
 * Argon2id thô. Trả về Uint8Array độ dài tagLength.
 * @param {{password:Uint8Array, salt:Uint8Array, t:number, m:number, p:number, tagLength?:number, secret?:Uint8Array, ad?:Uint8Array}} o  m tính bằng KiB
 */
export function argon2idRaw({ password, salt, t, m, p, tagLength = 32, secret = new Uint8Array(0), ad = new Uint8Array(0) }) {
  if (salt.length < 8) throw new Error('Salt Argon2 phải dài tối thiểu 8 byte');
  if (m < 8 * p) throw new Error('Bộ nhớ Argon2 quá nhỏ');
  const H0 = blake2b(64, le32(p), le32(tagLength), le32(m), le32(t), le32(0x13), le32(2), le32(password.length), password, le32(salt.length), salt, le32(secret.length), secret, le32(ad.length), ad);
  const mBlocks = 4 * p * Math.floor(m / (4 * p)), laneLen = mBlocks / p, segLen = laneLen / 4;
  const mem = new Uint32Array(mBlocks * 256);
  const putBlock = (idx, bytes) => { const o = idx * 256; for (let i = 0; i < 256; i++) mem[o + i] = bytes[i * 4] | (bytes[i * 4 + 1] << 8) | (bytes[i * 4 + 2] << 16) | (bytes[i * 4 + 3] << 24); };
  for (let l = 0; l < p; l++) { putBlock(l * laneLen, hPrime(1024, H0, le32(0), le32(l))); putBlock(l * laneLen + 1, hPrime(1024, H0, le32(1), le32(l))); }
  // Vùng nhớ phụ (đặt cuối mảng riêng) cho chế độ địa chỉ độc lập dữ liệu
  const aux = new Uint32Array(256 * 3), ZERO = 0, INPUT = 256, ADDR = 512;
  for (let pass = 0; pass < t; pass++) {
    for (let slice = 0; slice < 4; slice++) {
      for (let lane = 0; lane < p; lane++) {
        const indep = pass === 0 && slice < 2;
        if (indep) { aux.fill(0); aux[INPUT] = pass; aux[INPUT + 2] = lane; aux[INPUT + 4] = slice; aux[INPUT + 6] = mBlocks; aux[INPUT + 8] = t; aux[INPUT + 10] = 2; }
        const nextAddresses = () => { aux[INPUT + 12]++; fillBlock(aux, ZERO, INPUT, ADDR, false); fillBlock(aux, ZERO, ADDR, ADDR, false); };
        let start = 0;
        if (pass === 0 && slice === 0) { start = 2; if (indep) nextAddresses(); }
        let cur = lane * laneLen + slice * segLen + start;
        let prev = cur % laneLen === 0 ? cur + laneLen - 1 : cur - 1;
        for (let i = start; i < segLen; i++, cur++, prev++) {
          if (cur % laneLen === 1) prev = cur - 1;
          let j1, j2;
          if (indep) { if (i % 128 === 0) nextAddresses(); j1 = aux[ADDR + (i % 128) * 2]; j2 = aux[ADDR + (i % 128) * 2 + 1]; }
          else { j1 = mem[prev * 256]; j2 = mem[prev * 256 + 1]; }
          let refLane = j2 % p; if (pass === 0 && slice === 0) refLane = lane;
          const same = refLane === lane;
          let area;
          if (pass === 0) area = slice === 0 ? i - 1 : same ? slice * segLen + i - 1 : slice * segLen + (i === 0 ? -1 : 0);
          else area = same ? laneLen - segLen + i - 1 : laneLen - segLen + (i === 0 ? -1 : 0);
          const x = mulHi(j1, j1), rel = area - 1 - mulHi(area, x);
          const startPos = pass !== 0 && slice !== 3 ? (slice + 1) * segLen : 0;
          const refIdx = (startPos + rel) % laneLen;
          fillBlock(mem, prev * 256, (refLane * laneLen + refIdx) * 256, cur * 256, pass !== 0);
        }
      }
    }
  }
  const C = new Uint32Array(256);
  for (let l = 0; l < p; l++) { const o = (l * laneLen + laneLen - 1) * 256; for (let i = 0; i < 256; i++) C[i] ^= mem[o + i]; }
  const cb = new Uint8Array(1024); for (let i = 0; i < 256; i++) { cb[i * 4] = C[i]; cb[i * 4 + 1] = C[i] >>> 8; cb[i * 4 + 2] = C[i] >>> 16; cb[i * 4 + 3] = C[i] >>> 24; }
  mem.fill(0);
  return hPrime(tagLength, cb);
}

// ---------------------------------------------------------------- Chuỗi PHC: $argon2id$v=19$m=…,t=…,p=…$salt$hash
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function b64enc(u8) { let s = ''; for (let i = 0; i < u8.length; i += 3) { const n = (u8[i] << 16) | ((u8[i + 1] ?? 0) << 8) | (u8[i + 2] ?? 0); s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < u8.length ? B64[n >> 6 & 63] : '') + (i + 2 < u8.length ? B64[n & 63] : ''); } return s; }
export function b64dec(s) { const clean = s.replace(/=+$/, ''), out = new Uint8Array(Math.floor(clean.length * 3 / 4)); let bits = 0, val = 0, j = 0; for (const ch of clean) { const v = B64.indexOf(ch); if (v < 0) throw new Error('base64 không hợp lệ'); val = (val << 6) | v; bits += 6; if (bits >= 8) { bits -= 8; out[j++] = (val >> bits) & 255; } } return out; }
export const encodePhc = ({ m, t, p }, salt, hash) => `$argon2id$v=19$m=${m},t=${t},p=${p}$${b64enc(salt)}$${b64enc(hash)}`;
export function parsePhc(s) {
  const m = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/.exec(String(s || ''));
  if (!m) return null;
  return { m: +m[1], t: +m[2], p: +m[3], salt: b64dec(m[4]), hash: b64dec(m[5]) };
}
/** So sánh thời gian hằng (tránh dò theo thời gian phản hồi) */
export function safeEqual(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }

/** Tham số khuyến nghị của OWASP cho Argon2id: 19 MiB bộ nhớ, 2 lượt, 1 luồng */
export const ARGON2_PARAMS = { m: 19456, t: 2, p: 1 };
