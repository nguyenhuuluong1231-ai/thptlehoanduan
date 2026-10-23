// Luồng worker (worker_threads) chạy Argon2id tốn nhiều bộ nhớ ở ngoài luồng chính,
// để việc băm/xác thực mật khẩu không làm chậm chat thời gian thực (SSE) hay các yêu cầu khác của máy chủ.
import { parentPort } from 'node:worker_threads';
import { argon2idRaw } from './argon2.js';

parentPort.on('message', (msg) => {
  try {
    const { id, password, salt, t, m, p, tagLength } = msg;
    const hash = argon2idRaw({ password: new Uint8Array(password), salt: new Uint8Array(salt), t, m, p, tagLength });
    parentPort.postMessage({ id, hash: hash.buffer }, [hash.buffer]);
  } catch (e) {
    parentPort.postMessage({ id: msg.id, error: e.message });
  }
});
