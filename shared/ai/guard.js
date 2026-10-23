// AI Guard: phát hiện nội dung nguy hiểm trong hội thoại / chat để nhà trường can thiệp kịp thời.

export const strip = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

export const GUARD_CATEGORIES = {
  mental: { label: 'Khủng hoảng tâm lý', level: 'red', levelName: 'Cấp 1 · Khẩn cấp' },
  weapons: { label: 'Vũ khí, hung khí', level: 'red', levelName: 'Cấp 1 · Khẩn cấp' },
  violence: { label: 'Bạo lực, đe dọa', level: 'orange', levelName: 'Cấp 2 · Cao' },
  drugs: { label: 'Chất cấm, ma túy', level: 'orange', levelName: 'Cấp 2 · Cao' },
  cyber: { label: 'Lừa đảo, bắt nạt mạng', level: 'yellow', levelName: 'Cấp 3 · Theo dõi' },
};
const ORDER = { red: 3, orange: 2, yellow: 1 };

const norm = (s = '') => ' ' + s.toLowerCase().normalize('NFC').replace(/[^\p{L}\d]+/gu, ' ').trim() + ' ';
const hasDiacritics = (s) => /[^\u0000-\u007f]/.test(s.normalize('NFC'));

export function scanGuard(text, cfg) {
  if (!cfg || !text) return null;
  // Học sinh gõ có dấu: so khớp nguyên dấu để tránh nhầm (vd. "đạo hàm" ≠ "dao").
  // Gõ không dấu: so khớp sau khi bỏ dấu cả hai phía.
  const accented = hasDiacritics(text);
  const t = accented ? norm(text) : norm(strip(text));
  const hits = [];
  for (const [cat, meta] of Object.entries(GUARD_CATEGORIES)) {
    const words = (cfg.keywords?.[cat] || '').split(',').map(w => w.trim()).filter(Boolean);
    const found = words.filter(w => {
      const k = (accented ? norm(w) : norm(strip(w))).trim();
      return k && t.includes(' ' + k + ' ');
    });
    if (found.length) hits.push({ category: cat, ...meta, keywords: found });
  }
  if (!hits.length) return null;
  // Độ nhạy thấp: bỏ qua mức theo dõi (vàng)
  const filtered = cfg.sensitivity === 'low' ? hits.filter(h => h.level !== 'yellow') : hits;
  if (!filtered.length) return null;
  filtered.sort((a, b) => ORDER[b.level] - ORDER[a.level]);
  return { level: filtered[0].level, levelName: filtered[0].levelName, categories: filtered.map(h => h.label), keywords: filtered.flatMap(h => h.keywords), primary: filtered[0].category };
}
