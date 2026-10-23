// Nghiệp vụ dùng chung giữa các nhóm API
import { uid, nowISO } from './util.js';

export const DAY_NAMES = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function audit(ctx, user, action, detail = '') {
  ctx.db.data.audit.unshift({ id: uid('NK'), userId: user?.id || null, name: user?.name || 'Hệ thống', action, detail, at: nowISO() });
  if (ctx.db.data.audit.length > 300) ctx.db.data.audit.length = 300;
}

/** Tạo cảnh báo đỏ cho nhà trường */
export function raiseAlert(ctx, alert) {
  const a = { id: uid('CB'), status: 'open', at: nowISO(), ...alert };
  ctx.db.data.alerts.unshift(a);
  if (ctx.db.data.alerts.length > 300) ctx.db.data.alerts.length = 300;
  ctx.emit('alert', a, { role: 'staff' });
  return a;
}

export function moduleOn(db, key) { return db.data.settings.modules?.[key] !== false; }

/** Mô hình AI cho một chức năng ('chat' | 'scam'), hoặc null nếu chưa bật / Ban Giám hiệu tắt chức năng đó. */
export function aiFor(ctx, feature) {
  return ctx.llm && ctx.db.data.aiConfig?.features?.[feature] !== false ? ctx.llm : null;
}
