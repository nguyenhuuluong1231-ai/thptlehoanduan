// =============================================================================
// BẢN VÁ: lỗi "Không kết nối được máy chủ" khi lưu ảnh chứng chỉ (hoặc bất kỳ
// dữ liệu lớn nào) ở Tổ tâm lý.
//
// NGUYÊN NHÂN THẬT: hàm mã hoá dữ liệu trước khi gửi lên máy chủ
// (client-src/js/core/api.js) dùng cách viết
//     btoa(String.fromCharCode(...new Uint8Array(buf)))
// Cách viết này dùng "spread" để truyền từng byte làm một tham số hàm riêng —
// với dữ liệu đủ lớn (như một ảnh), trình duyệt bị tràn ngăn xếp gọi hàm
// (RangeError: Maximum call stack size exceeded). Lỗi đó bị bắt và hiện nhầm
// thành "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại." — nghe như lỗi
// mạng nhưng thật ra dữ liệu chưa từng rời khỏi trình duyệt.
//
// Bản vá này:
//   1) Sửa hàm b64() trong client-src/js/core/api.js (mã nguồn) — xử lý theo
//      từng đoạn nhỏ (chunk) thay vì truyền hết một lần.
//   2) Vá luôn public/js/core/api.js (bản đã "làm rối" đang được máy chủ phát
//      cho trình duyệt) với cùng nội dung — để có tác dụng ngay cả khi không
//      chạy lại được bước build.
//   3) Thêm trường "certificate" vào shared/routes/admin.js — trước đây trường
//      này chưa được máy chủ nhận & lưu lại cho thành viên Tổ tâm lý.
//   4) Chạy lại scripts/obfuscate.mjs (nếu có) để public/js/ luôn khớp với
//      client-src/ — đúng quy trình chính thức của dự án.
//   5) Tự gắn sẵn 2 ảnh chứng chỉ (đi kèm trong thư mục __anh-chung-chi__) cho
//      đúng 2 thầy/cô theo tên, NẾU tìm thấy và NẾU họ chưa có ảnh — để bạn
//      không cần bấm "Chọn ảnh" thủ công nữa.
//
// CÁCH DÙNG: copy toàn bộ các file đi kèm (file này, __anh-chung-chi__/, và
// SUA-LOI-CHUNG-CHI.bat) vào ĐÚNG thư mục dự án đang chạy thật (cùng cấp với
// server.js, package.json) — rồi chạy SUA-LOI-CHUNG-CHI.bat. Hãy ĐÓNG server
// (cửa sổ đen) lại trước khi chạy để tránh xung đột khi ghi dữ liệu.
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const log = (s = '') => console.log(s);

function patchFile(relPath, oldStr, newStr, label) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) { log(`  ✗ Không tìm thấy ${relPath} trong thư mục này — bỏ qua mục này.`); return 'missing'; }
  const content = fs.readFileSync(p, 'utf8');
  if (content.includes(newStr)) { log(`  ✓ ${label}: đã được sửa từ trước (không cần sửa lại).`); return 'already'; }
  const occurrences = content.split(oldStr).length - 1;
  if (occurrences === 0) {
    log(`  ✗ ${label}: không khớp được với nội dung hiện có của ${relPath}.`);
    log(`    → File này có thể đã khác bản gốc mà Claude đã xem. KHÔNG có gì bị thay đổi.`);
    log(`    → Bạn chụp lại thông báo này gửi cho Claude để kiểm tra lại nhé.`);
    return 'nomatch';
  }
  if (occurrences > 1) {
    log(`  ⚠ ${label}: khớp ${occurrences} chỗ (cần đúng 1 chỗ) — dừng lại cho an toàn, KHÔNG sửa gì.`);
    return 'ambiguous';
  }
  fs.writeFileSync(p, content.replace(oldStr, newStr), 'utf8');
  log(`  ✓ ${label}: đã sửa xong.`);
  return 'patched';
}

const OLD_B64 = `const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));`;
const NEW_B64 = `const b64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const CHUNK = 0x2000; // xử lý từng 8192 byte một — tránh tràn ngăn xếp khi gọi hàm với mảng lớn
  for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return btoa(binary);
};`;

const OLD_TEAM = `avatar: b.avatar && String(b.avatar).startsWith('data:') ? await ctx.storeFile(b.avatar, 'avatar') : (b.avatar || null),
      order: Number(b.order) || 99, active: b.active !== false,
    };
  };
  const teamList = (ctx) => { if (!Array.isArray(ctx.db.data.counselTeam)) ctx.db.data.counselTeam = []; return ctx.db.data.counselTeam; };`;
const NEW_TEAM = `avatar: b.avatar && String(b.avatar).startsWith('data:') ? await ctx.storeFile(b.avatar, 'avatar') : (b.avatar || null),
      certificate: b.certificate && String(b.certificate).startsWith('data:') ? await ctx.storeFile(b.certificate, 'certificate') : (b.certificate || null),
      order: Number(b.order) || 99, active: b.active !== false,
    };
  };
  const teamList = (ctx) => { if (!Array.isArray(ctx.db.data.counselTeam)) ctx.db.data.counselTeam = []; return ctx.db.data.counselTeam; };`;

log('=== BẢN VÁ: lỗi lưu ảnh chứng chỉ Tổ tâm lý ===\n');

log('[1/5] Sửa mã nguồn client-src/js/core/api.js…');
const r1 = patchFile('client-src/js/core/api.js', OLD_B64, NEW_B64, 'client-src/js/core/api.js');

log('\n[2/5] Vá trực tiếp public/js/core/api.js (bản đang phát cho trình duyệt)…');
const r2 = patchFile('public/js/core/api.js', OLD_B64, NEW_B64, 'public/js/core/api.js');

log('\n[3/5] Thêm hỗ trợ lưu "ảnh chứng chỉ" ở shared/routes/admin.js…');
const r3 = patchFile('shared/routes/admin.js', OLD_TEAM, NEW_TEAM, 'shared/routes/admin.js');

log('\n[4/5] Dựng lại public/js/ từ client-src/ (node scripts/obfuscate.mjs)…');
if (fs.existsSync(path.join(ROOT, 'scripts/obfuscate.mjs'))) {
  try { execSync('node scripts/obfuscate.mjs', { cwd: ROOT, stdio: 'inherit' }); log('  ✓ Đã dựng lại xong.'); }
  catch (e) { log('  ✗ Chạy obfuscate.mjs bị lỗi (không sao, bước [2] ở trên đã vá trực tiếp rồi): ' + e.message); }
} else log('  • Không thấy scripts/obfuscate.mjs — bỏ qua (không sao, bước [2] đã đủ).');

log('\n[5/5] Tự gắn sẵn ảnh chứng chỉ cho Cô Hoàng Thị Mai Hằng và Cô Phạm Thị Tiến Quỳnh…');
try {
  const DATA_DIR = path.join(ROOT, 'data');
  const dbFile = path.join(DATA_DIR, 'db.json');
  const keyFile = path.join(DATA_DIR, 'db.key');
  if (!fs.existsSync(dbFile) || !fs.existsSync(keyFile)) {
    log('  • Không tìm thấy data/db.json hoặc data/db.key ở đây — bỏ qua bước này.');
    log('    (Có thể đây không phải đúng thư mục dữ liệu thật — bạn tự thêm ảnh qua giao diện web sau khi sửa lỗi xong.)');
  } else {
    const KEY = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'hex');
    const env = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    const d = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(env.iv, 'base64'));
    d.setAuthTag(Buffer.from(env.tag, 'base64'));
    const data = JSON.parse(Buffer.concat([d.update(Buffer.from(env.data, 'base64')), d.final()]).toString('utf8'));
    const team = Array.isArray(data.counselTeam) ? data.counselTeam : [];
    const assign = [
      { match: 'Hoàng Thị Mai Hằng', file: 'chung-chi-Hoang-Thi-Mai-Hang.jpg' },
      { match: 'Phạm Thị Tiến Quỳnh', file: 'chung-chi-Pham-Thi-Tien-Quynh.jpg' },
    ];
    let changed = false;
    for (const { match, file } of assign) {
      const member = team.find(m => m?.name?.includes(match));
      const imgPath = path.join(ROOT, '__anh-chung-chi__', file);
      if (!member) { log(`  • Không thấy "${match}" trong Tổ tâm lý ở đây — bỏ qua.`); continue; }
      if (!fs.existsSync(imgPath)) { log(`  • Thiếu file ảnh đi kèm (${file}) — bỏ qua.`); continue; }
      if (member.certificate) { log(`  • "${member.name}" đã có ảnh chứng chỉ rồi — không ghi đè.`); continue; }
      const buf = fs.readFileSync(imgPath);
      const name = `certificate-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}.jpg`;
      fs.mkdirSync(path.join(DATA_DIR, 'uploads'), { recursive: true });
      fs.writeFileSync(path.join(DATA_DIR, 'uploads', name), buf);
      member.certificate = `uploads/${name}`;
      member.updatedAt = new Date().toISOString();
      changed = true;
      log(`  ✓ Đã gắn ảnh chứng chỉ cho "${member.name}".`);
    }
    if (changed) {
      const iv = crypto.randomBytes(12);
      const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
      const enc = Buffer.concat([c.update(JSON.stringify(data), 'utf8'), c.final()]);
      const newEnv = { enc: 'aes-256-gcm', v: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: enc.toString('base64') };
      fs.writeFileSync(dbFile, JSON.stringify(newEnv));
      log('  ✓ Đã lưu lại data/db.json.');
    }
  }
} catch (e) {
  log('  • Không tự gắn được ảnh (bỏ qua, không ảnh hưởng gì khác) — bạn có thể tự thêm qua giao diện web sau. Chi tiết: ' + e.message);
}

log('\n=== XONG ===');
if (r1 === 'patched' || r1 === 'already') {
  log('→ Giờ hãy ĐÓNG cửa sổ server cũ (nếu còn mở) rồi mở lại CHAY-WEB.bat như bình thường.');
  log('→ Vào lại "Tổ tâm lý": Cô Mai Hằng và Cô Phạm Thị Tiến Quỳnh sẽ có sẵn ảnh chứng chỉ (nếu bước [5] tìm thấy đúng tên).');
  log('→ Lỗi "Không kết nối được máy chủ" khi lưu ảnh lớn sẽ không còn nữa.');
} else {
  log('→ Có bước không khớp được — xem dòng ✗ ở trên, chụp lại gửi cho Claude kiểm tra giúp.');
}
