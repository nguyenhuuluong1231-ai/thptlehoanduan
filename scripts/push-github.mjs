// ============================================================================
//  TỰ ĐỘNG ĐẨY MÃ NGUỒN LÊN GITHUB: nguyenhuuluong1231-ai/thptlehoanduan
// ============================================================================
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_URL = process.argv[2] || 'https://github.com/nguyenhuuluong1231-ai/thptlehoanduan.git';

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: opts.silent ? 'pipe' : 'inherit',
    encoding: 'utf8',
    env: { ...process.env, GCM_INTERACTIVE: 'always', GIT_TERMINAL_PROMPT: '1' },
    ...opts,
  });
}

function clearGitHubCredentials() {
  spawnSync('cmdkey', ['/delete:LegacyGeneric:target=git:https://github.com'], { stdio: 'ignore' });
  spawnSync('cmdkey', ['/delete:git:https://github.com'], { stdio: 'ignore' });
  spawnSync('git', ['credential-manager', 'erase'], {
    input: 'protocol=https\nhost=github.com\n\n',
    stdio: ['pipe', 'ignore', 'ignore'],
  });
}

console.log('\n============================================================================');
console.log('  ĐẨY MÃ NGUỒN LÊN GITHUB: nguyenhuuluong1231-ai/thptlehoanduan');
console.log('============================================================================\n');

const lockFile = path.join(ROOT, '.git', 'index.lock');
if (fs.existsSync(lockFile)) {
  try { fs.unlinkSync(lockFile); } catch { /* ignore */ }
}

if (!fs.existsSync(path.join(ROOT, '.git'))) {
  run('git', ['init', '-b', 'main']);
}

run('git', ['remote', 'remove', 'origin'], { silent: true });
run('git', ['remote', 'add', 'origin', REPO_URL]);
console.log('  ✓ Đã gắn kho GitHub đích:', REPO_URL);

if (fs.existsSync(path.join(ROOT, 'scripts', 'obfuscate.mjs'))) {
  run(process.execPath, ['scripts/obfuscate.mjs']);
}

run('git', ['config', 'user.name', 'Vu Nguyen An Khang']);
run('git', ['config', 'user.email', 'admin@tuvantamlihocduonglehoan.com']);
run('git', ['branch', '-M', 'main']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Deploy Cong Hoc Duong So THPT Le Hoan'], { silent: true });

console.log('\n  • Đang đẩy code lên GitHub...');
console.log('  👉 Nếu cửa sổ đăng nhập GitHub hiện lên, hãy bấm "Sign in with your browser"\n');

let pushRes = run('git', ['push', '-u', 'origin', 'main', '--force']);
if (pushRes.status !== 0) {
  console.log('\n  • Đang xóa thông tin đăng nhập GitHub cũ để đăng nhập tài khoản nguyenhuuluong1231-ai...');
  clearGitHubCredentials();
  pushRes = run('git', ['push', '-u', 'origin', 'main', '--force']);
}

if (pushRes.status === 0) {
  console.log('\n============================================================================');
  console.log('  ✓ HOÀN TẤT! Đã đẩy toàn bộ code lên:');
  console.log('    https://github.com/nguyenhuuluong1231-ai/thptlehoanduan');
  console.log('============================================================================\n');
} else {
  console.error('\n✗ Chưa đẩy được lên GitHub. Hãy kiểm tra quyền truy cập của tài khoản nguyenhuuluong1231-ai.\n');
  process.exit(1);
}

