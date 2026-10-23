const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
function gfMul(x, y) {
let z = 0;
for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; }
return z & 0xff;
}
function rsDivisor(degree) {
const r = new Array(degree).fill(0); r[degree - 1] = 1;
let root = 1;
for (let i = 0; i < degree; i++) {
for (let j = 0; j < degree; j++) { r[j] = gfMul(r[j], root); if (j + 1 < degree) r[j] ^= r[j + 1]; }
root = gfMul(root, 0x02);
}
return r;
}
function rsRemainder(data, div) {
const r = div.map(() => 0);
for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gfMul(c, f); }); }
return r;
}
const rawModules = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
const dataCodewords = (v) => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[v] * NUM_BLOCKS[v];
function alignPositions(v, size) {
if (v === 1) return [];
const n = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
const out = [6];
for (let pos = size - 7; out.length < n; pos -= step) out.splice(1, 0, pos);
return out;
}
export function qrMatrix(text) {
const bytes = [...new TextEncoder().encode(String(text))];
let ver = 0;
for (let v = 1; v <= 10; v++) { const cc = v < 10 ? 8 : 16; if (4 + cc + bytes.length * 8 <= dataCodewords(v) * 8) { ver = v; break; } }
if (!ver) throw new Error(_lhD("TuG7mWkgZHVuZyBxdcOhIGTDoGkgxJHhu4MgdOG6oW8gbcOjIFFS"));
const bits = [];
const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
const cap = dataCodewords(ver) * 8;
put(0, Math.min(4, cap - bits.length));
put(0, (8 - bits.length % 8) % 8);
for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
const data = [];
for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
const nb = NUM_BLOCKS[ver], ecLen = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(ecLen);
const blocks = [];
for (let i = 0, k = 0; i < nb; i++) {
const dat = data.slice(k, k + shortLen - ecLen + (i < nShort ? 0 : 1)); k += dat.length;
const ecc = rsRemainder(dat, div);
if (i < nShort) dat.push(0);
blocks.push(dat.concat(ecc));
}
const words = [];
for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - ecLen || j >= nShort) words.push(b[i]); });
const size = ver * 4 + 17;
const m = Array.from({ length: size }, () => new Array(size).fill(false));
const fn = Array.from({ length: size }, () => new Array(size).fill(false));
const set = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4); } };
finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
const ap = alignPositions(ver, size), na = ap.length;
for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) {
if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
}
const drawFormat = (mask) => {
const d = (0 << 3) | mask;
let rem = d; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
const b = ((d << 10) | rem) ^ 0x5412, bit = (i) => ((b >>> i) & 1) === 1;
for (let i = 0; i <= 5; i++) set(8, i, bit(i));
set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
set(8, size - 8, true);
};
drawFormat(0);
if (ver >= 7) {
let rem = ver; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
const b = (ver << 12) | rem;
for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); set(a, c, bit); set(c, a, bit); }
}
let idx = 0;
for (let right = size - 1; right >= 1; right -= 2) {
if (right === 6) right = 5;
for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
if (!fn[y][x] && idx < words.length * 8) { m[y][x] = ((words[idx >>> 3] >>> (7 - (idx & 7))) & 1) === 1; idx++; }
}
}
const maskFn = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0, (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0];
const applyMask = (k) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && maskFn[k](x, y)) m[y][x] = !m[y][x]; };
const penalty = () => {
let p = 0, dark = 0;
const line = (get) => { for (let a = 0; a < size; a++) { let run = 1; for (let b = 1; b <= size; b++) { if (b < size && get(a, b) === get(a, b - 1)) run++; else { if (run >= 5) p += 3 + run - 5; run = 1; } } } };
line((a, b) => m[a][b]); line((a, b) => m[b][a]);
for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
const pat = [true, false, true, true, true, false, true];
const isPat = (get, a, b) => pat.every((v, i) => get(a, b + i) === v);
const light4 = (get, a, b) => [0, 1, 2, 3].every(i => b + i >= 0 && b + i < size ? !get(a, b + i) : true);
for (let a = 0; a < size; a++) for (let b = 0; b + 7 <= size; b++) {
for (const get of [(r, c) => m[r][c], (r, c) => m[c][r]]) if (isPat(get, a, b) && (light4(get, a, b - 4) || light4(get, a, b + 7))) p += 40;
}
for (const row of m) for (const c of row) if (c) dark++;
p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
return p;
};
let best = 0, bestP = Infinity;
for (let k = 0; k < 8; k++) { applyMask(k); drawFormat(k); const p = penalty(); if (p < bestP) { bestP = p; best = k; } applyMask(k); }
applyMask(best); drawFormat(best);
return m;
}
export function qrSvg(text, { size = 160, dark = _lhD("IzBiMTczNg=="), light = _lhD("I2ZmZmZmZg=="), margin = 4 } = {}) {
const m = qrMatrix(text), n = m.length + margin * 2;
let d = '';
m.forEach((row, y) => row.forEach((c, x) => { if (c) d += `${_lhD("TQ==")}${x + margin} ${y + margin}${_lhD("aDF2MWgtMXo=")}`; }));
return `${_lhD("PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA=")}${n} ${n}${_lhD("IiB3aWR0aD0i")}${size}${_lhD("IiBoZWlnaHQ9Ig==")}${size}${_lhD("IiBzaGFwZS1yZW5kZXJpbmc9ImNyaXNwRWRnZXMiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iTcOjIFFSIj48cmVjdCB3aWR0aD0i")}${n}${_lhD("IiBoZWlnaHQ9Ig==")}${n}${_lhD("IiBmaWxsPSI=")}${light}${_lhD("Ii8+PHBhdGggZD0i")}${d}${_lhD("IiBmaWxsPSI=")}${dark}${_lhD("Ii8+PC9zdmc+")}`;
}
