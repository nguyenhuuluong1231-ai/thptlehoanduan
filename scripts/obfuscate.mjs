#!/usr/bin/env node
// =============================================================================
// Công cụ "làm rối mã nguồn" (chống dịch ngược) cho JS phía trình duyệt.
//
// NGUỒN GỐC & CÁCH DÙNG
//   - Mã nguồn DỄ ĐỌC, dùng để sửa/phát triển tiếp, nằm ở:   client-src/js/
//   - File THỰC SỰ được máy chủ phát cho trình duyệt nằm ở:  public/js/
//   - public/js/ LÀ BẢN SINH RA TỰ ĐỘNG — không sửa tay trực tiếp trong đó,
//     vì lần chạy lại công cụ này sẽ ghi đè mất mọi thay đổi.
//
//   Quy trình khi cần sửa giao diện/logic phía trình duyệt:
//     1) Sửa file trong client-src/js/...
//     2) Chạy:  node scripts/obfuscate.mjs
//     3) Kiểm tra lại: npm run smoke test (hoặc ALLOW_TEST_CAPTCHA=1 node scripts/smoke-test.js)
//     4) Phát hành public/js/ đã sinh ra.
//
// CÔNG CỤ NÀY LÀM GÌ (không phụ thuộc thư viện ngoài — đúng tinh thần "zero-dependency"
// của dự án; mọi thứ chỉ dùng API có sẵn của Node.js):
//   1) Gỡ toàn bộ chú thích trong mã (nhiều chú thích giải thích rõ logic nghiệp vụ bằng
//      tiếng Việt — bỏ đi để không lộ ra cho người đọc file tĩnh).
//   2) Rút gọn khoảng trắng/dòng trống thừa.
//   3) Mã hóa (base64) hầu hết các chuỗi ký tự "văn bản" trong mã — thông báo lỗi, nhãn giao
//      diện, tên route, v.v. — kể cả phần văn bản thường nằm bên trong template literal
//      (`...${x}...`) — rồi giải mã lại ĐÚNG giá trị gốc ngay tại thời điểm chạy qua một hàm
//      trợ giúp nhỏ (_lhD). Hành vi của ứng dụng không đổi; chỉ là người mở tab "Sources" của
//      trình duyệt không còn thấy văn bản rõ nghĩa hay chú thích giải thích logic nữa.
//
// GIỚI HẠN CẦN HIỂU RÕ (nói thật, không phóng đại):
//   - Đây là một bộ dò token (lexer) viết tay, KHÔNG phải trình biên dịch/rút gọn chuyên
//     nghiệp (như Terser/UglifyJS) — vì môi trường chạy việc này không có mạng để cài gói
//     ngoài. Nó CHỦ ĐỘNG không đổi tên biến/hàm (rename) vì việc đó cần phân tích phạm vi biến
//     (scope) đầy đủ — rủi ro làm hỏng ứng dụng không đáng để đánh đổi với một dự án không có
//     bộ kiểm thử bao trùm 100% giao diện.
//   - Trình duyệt luôn PHẢI nhận được mã JavaScript hợp lệ, chạy được — nên đây là "làm rối"
//     (obfuscation) để gây khó cho việc đọc hiểu, KHÔNG phải mã hóa thật như dữ liệu API (xem
//     shared/channel.js): một người đủ kiên nhẫn dùng DevTools vẫn có thể đặt điểm dừng
//     (breakpoint) và xem giá trị đã giải mã lúc chạy. Kết hợp với chặn DevTools (public/js/core/ui.js
//     → initDevToolsGuard) để nâng rào cản thêm một bước, nhưng không có gì chạy được trong trình
//     duyệt lại "tuyệt đối không đọc được" — đây là giới hạn chung của mọi ứng dụng web.
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'client-src', 'js');
const OUT_DIR = path.join(ROOT, 'public', 'js');

const PUNCT_BEFORE_REGEX = new Set(['(', ',', ';', ':', '[', '!', '&', '|', '?', '{', '}', '=', '+', '-', '*', '%', '^', '~', '<', '>', '/']);
const KEYWORD_BEFORE_REGEX = new Set(['return', 'typeof', 'in', 'of', 'instanceof', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

function lastSignificant(chars) {
  for (let i = chars.length - 1; i >= 0; i--) {
    const c = chars[i];
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r') continue;
    return c;
  }
  return '';
}
function trailingWord(out) {
  const s = out.join('');
  const m = /[A-Za-z_$][A-Za-z0-9_$]*\s*$/.exec(s);
  return m ? m[0].trim() : '';
}

/** Giống isRegexPos ở tokenize() cấp cao nhất, nhưng tra ngược trực tiếp trong `src` (dùng cho
 * bộ quét độ sâu ${...} lồng trong template — nơi không có sẵn mảng `out` tích lũy). Cần để
 * phân biệt "/" mở đầu regex literal (ví dụ /"/g) với phép chia, ngay TRƯỚC khi quét quy ước
 * dấu nháy '/" — nếu không, một regex chứa ký tự nháy kép sẽ bị hiểu lầm thành chuỗi mở ra
 * không bao giờ đóng đúng chỗ, "ăn" luôn phần mã còn lại của khối ${...} (và có thể xa hơn). */
function isRegexPositionInSrc(src, idx) {
  let k = idx - 1;
  while (k >= 0 && (src[k] === ' ' || src[k] === '\t' || src[k] === '\n' || src[k] === '\r')) k--;
  if (k < 0) return true;
  const prev = src[k];
  if (PUNCT_BEFORE_REGEX.has(prev)) return true;
  let wStart = k + 1;
  while (wStart > 0 && /[A-Za-z0-9_$]/.test(src[wStart - 1])) wStart--;
  return KEYWORD_BEFORE_REGEX.has(src.slice(wStart, k + 1));
}

/** Quét một regex literal bắt đầu tại src[j] === '/' (đã xác nhận là vị trí biểu thức qua
 * isRegexPositionInSrc) — trả về chỉ số NGAY SAU phần cờ (g, i, ...), hoặc -1 nếu không khớp
 * (ví dụ gặp dòng mới trước khi tìm được "/" đóng — khi đó đây chỉ là phép chia, không phải regex). */
function scanRegexLiteralEnd(src, j, n) {
  let k = j + 1, inClass = false;
  while (k < n) {
    if (src[k] === '\\') { k += 2; continue; }
    if (src[k] === '\n') return -1;
    if (src[k] === '[') inClass = true;
    else if (src[k] === ']') inClass = false;
    else if (src[k] === '/' && !inClass) { k++; break; }
    k++;
  }
  if (k >= n && src[k - 1] !== '/') return -1;
  while (k < n && /[a-z]/i.test(src[k])) k++;
  return k;
}

/** Bộ dò token (lexer) cho JS: nhận diện chuỗi, template literal (lồng ${...} đệ quy),
 * regex literal, chú thích dòng/khối — còn lại coi là "code" (giữ nguyên nguyên văn). */
function tokenize(src) {
  const tokens = [];
  let i = 0;
  const n = src.length;
  const out = []; // ký tự "có nghĩa" đã phát ra — dùng để phân biệt regex literal với phép chia

  function pushCode(s) { tokens.push({ type: 'code', value: s }); out.push(s); }

  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      let j = i + 2;
      while (j < n && src[j] !== '\n') j++;
      tokens.push({ type: 'linecomment', value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(j + 2, n);
      tokens.push({ type: 'blockcomment', value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      j = Math.min(j + 1, n);
      const raw = src.slice(i, j);
      tokens.push({ type: 'string', value: raw });
      out.push(raw);
      i = j;
      continue;
    }
    // Template literal — ghi lại ranh giới từng đoạn văn bản thường vs. từng biểu thức ${...}
    // (biểu thức được tokenize lại đệ quy ở bước mã hóa, văn bản thường thì mã hóa base64).
    if (c === '`') {
      let j = i + 1;
      let depth = 0;
      const segments = [];
      let segStart = j;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (depth === 0 && src[j] === '`') { segments.push({ type: 'text', raw: src.slice(segStart, j) }); j++; break; }
        if (depth === 0 && src[j] === '$' && src[j + 1] === '{') {
          segments.push({ type: 'text', raw: src.slice(segStart, j) });
          const exprStart = j + 2;
          depth = 1; j += 2;
          while (j < n && depth > 0) {
            if (src[j] === '\\') { j += 2; continue; }
            if (src[j] === '{') { depth++; j++; continue; }
            if (src[j] === '}') { depth--; j++; continue; }
            if (src[j] === '`') { // template lồng bên trong biểu thức — nhảy qua nguyên khối
              let k = j + 1, d2 = 0;
              while (k < n) {
                if (src[k] === '\\') { k += 2; continue; }
                if (d2 === 0 && src[k] === '`') { k++; break; }
                if (d2 === 0 && src[k] === '$' && src[k + 1] === '{') { d2++; k += 2; continue; }
                if (d2 > 0) { if (src[k] === '{') d2++; else if (src[k] === '}') d2--; }
                k++;
              }
              j = k; continue;
            }
            if (src[j] === '/' && isRegexPositionInSrc(src, j)) {
              const end = scanRegexLiteralEnd(src, j, n);
              if (end !== -1) { j = end; continue; }
            }
            if (src[j] === "'" || src[j] === '"') {
              const qc = src[j]; let k = j + 1;
              while (k < n && src[k] !== qc) { if (src[k] === '\\') k++; k++; }
              j = k + 1; continue;
            }
            j++;
          }
          segments.push({ type: 'expr', raw: src.slice(exprStart, j - 1) });
          segStart = j;
          continue;
        }
        j++;
      }
      const raw = src.slice(i, j);
      tokens.push({ type: 'template', value: raw, segments });
      out.push(raw);
      i = j;
      continue;
    }
    // Regex literal — chỉ khi ký tự "có nghĩa" trước đó cho thấy đây là vị trí biểu thức (không phải phép chia)
    if (c === '/') {
      const prev = lastSignificant(out);
      const word = trailingWord(out);
      const isRegexPos = prev === '' || PUNCT_BEFORE_REGEX.has(prev) || KEYWORD_BEFORE_REGEX.has(word);
      if (isRegexPos) {
        let j = i + 1, inClass = false, ok = false;
        while (j < n) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '[') inClass = true;
          else if (src[j] === ']') inClass = false;
          else if (src[j] === '/' && !inClass) { j++; ok = true; break; }
          else if (src[j] === '\n') break;
          j++;
        }
        if (ok) {
          while (j < n && /[a-z]/i.test(src[j])) j++;
          const raw = src.slice(i, j);
          tokens.push({ type: 'code', value: raw });
          out.push(raw);
          i = j;
          continue;
        }
      }
    }
    pushCode(c);
    i++;
  }
  return tokens;
}

function b64(s) { return Buffer.from(s, 'utf8').toString('base64'); }

/** Giải thoát (unescape) các escape JS thường gặp (\n, \t, \uXXXX, \xXX, \`, \$, \\, ...) để
 * lấy đúng giá trị gốc trước khi mã hóa base64 — dùng cho cả chuỗi và văn bản trong template. */
function unescapeJs(raw) {
  return raw.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_m, g) => {
    if (g[0] === 'u') return String.fromCodePoint(parseInt(g[1] === '{' ? g.slice(2, -1) : g.slice(1), 16));
    if (g[0] === 'x') return String.fromCodePoint(parseInt(g.slice(1), 16));
    switch (g) {
      case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r';
      case 'b': return '\b'; case 'f': return '\f'; case 'v': return '\v';
      case '0': return '\0';
      default: return g; // bỏ dấu backslash, giữ ký tự (vd. \', \", \`, \$, \\)
    }
  });
}

function nextSignificantChar(tokens, fromIdx) {
  for (let k = fromIdx; k < tokens.length; k++) {
    const tk = tokens[k];
    if (tk.type === 'linecomment' || tk.type === 'blockcomment') continue;
    for (const ch of tk.value) { if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') return ch; }
  }
  return '';
}

/** Mã hóa một danh sách token — dùng cho cả mã cấp cao nhất VÀ nội dung ${...} lồng trong
 * template (đệ quy qua encodeTokens(tokenize(seg.raw), state)). */
function encodeTokens(tokens, state) {
  let result = '';
  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];
    if (t.type === 'linecomment' || t.type === 'blockcomment') continue;
    if (t.type === 'string') {
      const inner = t.value.slice(1, -1);
      const prevCode = result.slice(-80);
      const isModuleSpecifier = /\b(from|import)\s*$/.test(prevCode);
      // ':' CHỈ bị coi là khóa đối tượng/nhãn khi đứng ngay sau '{' hoặc ',' (nơi một khóa mới có
      // thể bắt đầu) — để không nhầm với nhánh true của toán tử ba ngôi `cond ? 'x' : y`.
      const nextCh = nextSignificantChar(tokens, idx + 1);
      const prevCh = lastSignificant(prevCode.split(''));
      const isKeyPosition = (nextCh === ':' && (prevCh === '{' || prevCh === ',')) || nextCh === '(';
      const decoded = unescapeJs(inner);
      if (!isModuleSpecifier && !isKeyPosition && decoded.length > 0) {
        state.usedDecoder = true;
        result += `_lhD("${b64(decoded)}")`;
        continue;
      }
      result += t.value;
      continue;
    }
    if (t.type === 'template' && t.segments) {
      let piece = '`';
      for (const seg of t.segments) {
        if (seg.type === 'expr') { piece += '${' + encodeTokens(tokenize(seg.raw), state) + '}'; continue; }
        const decoded = unescapeJs(seg.raw);
        if (decoded.trim().length > 0) { state.usedDecoder = true; piece += '${_lhD("' + b64(decoded) + '")}'; }
        else piece += seg.raw; // khoảng trắng/định dạng thuần — không cần mã hóa
      }
      piece += '`';
      result += piece;
      continue;
    }
    result += t.value;
  }
  return result;
}

export function transform(src) {
  const state = { usedDecoder: false };
  let result = encodeTokens(tokenize(src), state);
  result = result.replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n').replace(/^\s+/gm, '');
  if (state.usedDecoder) {
    result = `const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};\n` + result;
  }
  return result;
}

function walk(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full, base));
    else if (name.endsWith('.js')) out.push(path.relative(base, full));
  }
  return out;
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`Không tìm thấy thư mục mã nguồn: ${SRC_DIR}`);
  process.exit(1);
}
const files = walk(SRC_DIR);
let totalIn = 0, totalOut = 0;
for (const rel of files) {
  const src = fs.readFileSync(path.join(SRC_DIR, rel), 'utf8');
  const out = transform(src);
  const outPath = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out);
  totalIn += src.length; totalOut += out.length;
  console.log(`✓ ${rel}  (${src.length} → ${out.length} byte)`);
}
console.log(`\nĐã làm rối ${files.length} file (${totalIn} → ${totalOut} byte) từ client-src/js/ sang public/js/.`);
