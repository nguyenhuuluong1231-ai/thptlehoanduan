// Nhóm luồng worker nhỏ để chạy Argon2id song song, không chặn vòng lặp sự kiện chính của máy chủ.
// Tự động chuyển sang chạy trực tiếp trên luồng chính nếu gói cPanel Shared Hosting giới hạn tạo Worker Threads.
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { argon2idRaw } from './argon2.js';

const WORKER_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'argon2-worker.js');

export function createArgon2Pool(size = 2) {
  const workers = [];
  try {
    for (let i = 0; i < Math.max(1, size); i++) workers.push(new Worker(WORKER_FILE));
  } catch {
    // Một số gói cPanel Shared Hosting giới hạn số luồng (NPROC/LVE) → dùng fallback trực tiếp không lỗi
  }
  if (!workers.length) {
    return {
      async run({ password, salt, t, m, p, tagLength }) {
        return argon2idRaw({ password: new Uint8Array(password), salt: new Uint8Array(salt), t, m, p, tagLength });
      },
      async close() {},
    };
  }
  const pending = new Map();
  let seq = 0, next = 0;
  for (const w of workers) {
    w.on('message', (msg) => {
      const p = pending.get(msg.id); if (!p) return;
      pending.delete(msg.id);
      if (pending.size === 0) for (const ww of workers) ww.unref();
      if (msg.error) p.reject(new Error(msg.error)); else p.resolve(new Uint8Array(msg.hash));
    });
    w.on('error', (e) => { for (const [id, p] of pending) { p.reject(e); pending.delete(id); } if (pending.size === 0) for (const ww of workers) ww.unref(); });
    w.unref();
  }
  return {
    run({ password, salt, t, m, p, tagLength }) {
      return new Promise((resolve, reject) => {
        const id = ++seq;
        pending.set(id, { resolve, reject });
        for (const ww of workers) ww.ref();
        const w = workers[next]; next = (next + 1) % workers.length;
        w.postMessage({ id, password: password.buffer.slice(password.byteOffset, password.byteOffset + password.byteLength), salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength), t, m, p, tagLength });
      });
    },
    async close() { await Promise.all(workers.map(w => w.terminate())); },
  };
}
