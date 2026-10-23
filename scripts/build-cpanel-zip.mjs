// ============================================================================
//  ĐÓNG GÓI MÃ NGUỒN + DỮ LIỆU THẬT CHO HOSTING CPANEL (lehoan-portal-cpanel.zip)
//  Chuẩn quyền Linux (0755 cho thư mục, 0644 cho tệp) để LiteSpeed không báo 403/404
// ============================================================================
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_KEY_FILE = path.join(DATA_DIR, 'db.key');
const DB_LIVE_FILE = path.join(DATA_DIR, 'db-live.json');
const STAGE_DIR = path.join(ROOT, '_tmp_cpanel_stage');
const ZIP_OUT = path.join(ROOT, 'lehoan-portal-cpanel.zip');

// 1. Làm rối lại client-src/js -> public/js
execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'obfuscate.mjs')], { cwd: ROOT, stdio: 'inherit' });

// 2. Giải mã data/db.json ra data/db-live.json để sync.php phục vụ đầy đủ 1.517 tài khoản thật
if (fs.existsSync(DB_FILE) && fs.existsSync(DB_KEY_FILE)) {
  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (raw?.enc === 'aes-256-gcm') {
    const key = Buffer.from(fs.readFileSync(DB_KEY_FILE, 'utf8').trim(), 'hex');
    const dec = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(raw.iv, 'base64'));
    dec.setAuthTag(Buffer.from(raw.tag, 'base64'));
    const plain = Buffer.concat([dec.update(Buffer.from(raw.data, 'base64')), dec.final()]).toString('utf8');
    fs.writeFileSync(DB_LIVE_FILE, plain, 'utf8');
    console.log('✓ Đã xuất dữ liệu thật sang data/db-live.json cho Hosting cPanel.');
  } else {
    fs.copyFileSync(DB_FILE, DB_LIVE_FILE);
  }
}

// 3. Dọn thư mục tạm và gom toàn bộ tệp cần thiết cho public_html
fs.rmSync(STAGE_DIR, { recursive: true, force: true });
fs.mkdirSync(STAGE_DIR, { recursive: true });

// Copy toàn bộ nội dung trong public/ ra gốc public_html VÀ giữ bản sao trong public/
fs.cpSync(path.join(ROOT, 'public'), STAGE_DIR, { recursive: true });
fs.cpSync(path.join(ROOT, 'public'), path.join(STAGE_DIR, 'public'), { recursive: true });
fs.cpSync(path.join(ROOT, 'shared'), path.join(STAGE_DIR, 'shared'), { recursive: true });
fs.cpSync(path.join(ROOT, 'data'), path.join(STAGE_DIR, 'data'), { recursive: true });

for (const f of ['server.js', 'app.cjs', 'package.json']) {
  if (fs.existsSync(path.join(ROOT, f))) {
    fs.copyFileSync(path.join(ROOT, f), path.join(STAGE_DIR, f));
  }
}

if (fs.existsSync(ZIP_OUT)) fs.unlinkSync(ZIP_OUT);

// Dùng Python zipfile để đóng gói chuẩn đường dẫn "/" (không có "./") và quyền Unix 0644/0755 chuẩn LiteSpeed
const pyScript = `
import os, zipfile
stage = ${JSON.stringify(STAGE_DIR)}
out = ${JSON.stringify(ZIP_OUT)}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(stage):
        rel_root = os.path.relpath(root, stage).replace('\\\\', '/')
        if rel_root != '.':
            zi = zipfile.ZipInfo(rel_root + '/')
            zi.create_system = 3
            zi.external_attr = (0o40755 << 16) | 0x10
            zf.writestr(zi, b'')
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, stage).replace('\\\\', '/')
            with open(full, 'rb') as fp:
                data = fp.read()
            zi = zipfile.ZipInfo(rel)
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.create_system = 3
            zi.external_attr = (0o100644 << 16)
            zf.writestr(zi, data)
`;
execFileSync('python', ['-c', pyScript], { stdio: 'inherit' });
fs.rmSync(STAGE_DIR, { recursive: true, force: true });

const sizeMb = (fs.statSync(ZIP_OUT).size / (1024 * 1024)).toFixed(2);
console.log(`✓ Đã tạo gói cài đặt cPanel chuẩn LiteSpeed (0644/0755): ${ZIP_OUT} (${sizeMb} MB)`);
