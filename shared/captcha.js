// CAPTCHA số ngẫu nhiên (ảnh SVG méo + nhiễu) để chặn script tự động dò mật khẩu hàng loạt.
// Mỗi mã chỉ dùng được một lần (xóa khỏi bộ nhớ ngay sau khi kiểm tra, dù đúng hay sai) và hết hạn sau 2 phút.
const STORE = new Map(); // id -> { code, exp }
const TTL_MS = 120000;
const LEN = 5;

const rndInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // chỉ dùng cho vị trí/màu trang trí, không phải bí mật
function randomDigits(n) { const a = new Uint32Array(n); crypto.getRandomValues(a); return [...a].map(x => x % 10).join(''); }
function randomId() { const a = new Uint8Array(12); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); }

function renderSvg(code) {
  const W = 160, H = 56;
  let deco = `<rect width="${W}" height="${H}" rx="12" fill="currentColor" fill-opacity="0.06"/>`;
  for (let i = 0; i < 5; i++) deco += `<path d="M${rndInt(0, 10)} ${rndInt(5, H - 5)} Q ${W / 2} ${rndInt(0, H)} ${W - rndInt(0, 10)} ${rndInt(5, H - 5)}" stroke="currentColor" stroke-opacity="${(rndInt(8, 18) / 100).toFixed(2)}" stroke-width="1.5" fill="none"/>`;
  for (let i = 0; i < 22; i++) deco += `<circle cx="${rndInt(0, W)}" cy="${rndInt(0, H)}" r="1" fill="currentColor" fill-opacity="${(rndInt(15, 32) / 100).toFixed(2)}"/>`;
  const colors = ['#1747c9', '#0a84b8', '#6a4fe0', '#c2410c', '#0f8f67', '#be123c'];
  let glyphs = '';
  for (let i = 0; i < code.length; i++) {
    const x = 18 + i * 26, y = 36 + rndInt(-6, 6), rot = rndInt(-24, 24), size = rndInt(26, 32);
    glyphs += `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial,Helvetica,sans-serif" font-weight="800" fill="${colors[i % colors.length]}" transform="rotate(${rot} ${x} ${y})">${code[i]}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mã xác nhận gồm các chữ số">${deco}${glyphs}</svg>`;
}

// Chỉ bật khi biến môi trường ALLOW_TEST_CAPTCHA=1 được đặt rõ ràng lúc khởi chạy máy chủ (dùng cho
// kiểm thử tự động/CI chạy trên máy chủ riêng, không công khai) — khi đó API trả thêm mã thật dạng chữ,
// để script kiểm thử có thể "nhìn thấy" mã như một trình kiểm thử tự động mà KHÔNG cần giải ảnh SVG.
// KHÔNG đặt biến này trên máy chủ thật đang phục vụ người dùng — nó tắt tác dụng chống dò của CAPTCHA.
const TEST_MODE = process.env.ALLOW_TEST_CAPTCHA === '1';

export function createCaptcha() {
  const now = Date.now();
  if (STORE.size > 5000) for (const [id, v] of STORE) if (v.exp < now) STORE.delete(id); // dọn bộ nhớ định kỳ
  const code = randomDigits(LEN), id = randomId();
  STORE.set(id, { code, exp: now + TTL_MS });
  return { id, svg: renderSvg(code), ...(TEST_MODE ? { code } : {}) };
}

/** Kiểm tra mã — luôn xóa bản ghi sau khi gọi (một lần dùng) để không cho phép dò lại nhiều lần trên cùng một mã. */
export function verifyCaptcha(id, code) {
  const rec = id && STORE.get(id);
  if (id) STORE.delete(id);
  if (!rec || rec.exp < Date.now()) return false;
  return String(code || '').trim() === rec.code;
}
