import { fail } from '../router.js';
import { str, num, findOr404, nowISO, uid, localDate } from '../util.js';
import { moduleOn } from '../services.js';
import { QUIZ_TOPICS } from '../constants.js';

export function leaderboard(db, { days = null, limit = 10 } = {}) {
  const since = days ? Date.now() - days * 86400000 : 0;
  const best = new Map();
  for (const a of db.data.quizAttempts) {
    if (new Date(a.at).getTime() < since) continue;
    const cur = best.get(a.userId);
    if (!cur || a.score > cur.score || (a.score === cur.score && a.duration < cur.duration)) best.set(a.userId, { ...a, attempts: (cur?.attempts || 0) + 1 });
    else cur.attempts++;
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.duration - b.duration).slice(0, limit).map((a, i) => {
    const u = db.data.users.find(x => x.id === a.userId);
    return { rank: i + 1, userId: a.userId, name: u?.name || a.name, className: u?.className || a.className, avatar: u?.avatar || a.avatar || null, score: a.score, duration: a.duration, attempts: a.attempts, at: a.at };
  });
}

export function badgesFor(attempts) {
  const b = [];
  if (attempts.length) b.push({ id: 'rookie', label: 'Tân binh tri thức', desc: 'Hoàn thành lượt thi đầu tiên' });
  if (attempts.some(a => a.score === 100)) b.push({ id: 'perfect', label: 'Điểm tuyệt đối', desc: 'Đạt 100/100 điểm' });
  if (attempts.some(a => a.score >= 80 && a.duration <= 90)) b.push({ id: 'flash', label: 'Tốc độ ánh sáng', desc: 'Đạt từ 80 điểm trong 90 giây' });
  if (attempts.length >= 5) b.push({ id: 'grit', label: 'Bền bỉ', desc: 'Tham gia từ 5 lượt trở lên' });
  return b;
}

export function getQuizGate(db) {
  const cfg = db.data.quizConfig || {};
  const now = Date.now();
  const openMs = cfg.openAt ? new Date(cfg.openAt).getTime() : 0;
  const closeMs = cfg.closeAt ? new Date(cfg.closeAt).getTime() : 0;
  let state = 'open'; // 'open' | 'locked' | 'scheduled' | 'closed'
  if (cfg.locked) {
    if (openMs && now >= openMs && (!closeMs || now <= closeMs)) state = 'open';
    else if (openMs && now < openMs) state = 'scheduled';
    else state = 'locked';
  } else if (openMs && now < openMs) {
    state = 'scheduled';
  } else if (closeMs && now > closeMs) {
    state = 'closed';
  }
  return {
    locked: state !== 'open',
    state,
    manualLock: !!cfg.locked,
    openAt: cfg.openAt || '',
    closeAt: cfg.closeAt || '',
    note: cfg.note || '',
    serverNow: new Date(now).toISOString(),
  };
}

export default function engageRoutes(r) {
  const Q = 'Trắc nghiệm & khảo sát';

  r.get('/api/quiz/topics', { auth: 'user', group: Q, desc: 'Chủ đề trắc nghiệm, số câu hỏi mỗi chủ đề và trạng thái khóa / hẹn giờ mở thi.' }, async (req, ctx) => {
    const qs = ctx.db.data.quizQuestions.filter(q => q.active !== false);
    return { topics: Object.entries(QUIZ_TOPICS).map(([id, t]) => ({ id, ...t, count: qs.filter(q => q.topic === id).length })), total: qs.length, gate: getQuizGate(ctx.db) };
  });

  r.get('/api/quiz/questions', { auth: 'user', group: Q, desc: 'Lấy bộ câu hỏi ngẫu nhiên (không kèm đáp án). ?topic=all&count=10', query: { topic: 'all', count: 10 } }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'quiz')) fail(403, 'Đấu trường trắc nghiệm đang tạm tắt.');
    const gate = getQuizGate(ctx.db);
    if (gate.locked) fail(403, gate.state === 'scheduled' ? 'Chưa đến giờ mở thi. Vui lòng chờ đến giờ quy định.' : gate.state === 'closed' ? 'Đã hết thời gian mở đề thi.' : (gate.note || 'Đấu trường trắc nghiệm hiện đang khóa.'));
    const count = num(req.query.count, 'số câu', { min: 3, max: 30 }) || 10;
    let pool = ctx.db.data.quizQuestions.filter(q => q.active !== false && (!req.query.topic || req.query.topic === 'all' || q.topic === req.query.topic));
    pool = pool.map(q => [Math.random(), q]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, count);
    return { items: pool.map(({ answer, explanation, ...q }) => ({ ...q, topicName: QUIZ_TOPICS[q.topic]?.short })), timeLimit: count * 30 };
  });

  r.post('/api/quiz/submit', { auth: 'user', group: Q, desc: 'Nộp bài, chấm điểm tức thì kèm đáp án & giải thích.', body: { topic: 'all', duration: 95, answers: [{ id: 'CH-01', choice: 2 }] } }, async (req, ctx) => {
    const gate = getQuizGate(ctx.db);
    if (gate.locked && gate.state !== 'closed') fail(403, 'Đấu trường trắc nghiệm hiện đang khóa.');
    const answers = Array.isArray(req.body.answers) ? req.body.answers.slice(0, 30) : [];
    if (!answers.length) fail(400, 'Bài làm chưa có câu trả lời nào.');
    const duration = num(req.body.duration, 'thời gian làm bài', { min: 1, max: 3600, required: true });
    const results = answers.map(a => {
      const q = ctx.db.data.quizQuestions.find(x => x.id === a.id);
      if (!q) return null;
      return { id: q.id, question: q.question, options: q.options, choice: a.choice ?? null, answer: q.answer, correct: a.choice === q.answer, explanation: q.explanation };
    }).filter(Boolean);
    const correct = results.filter(x => x.correct).length;
    const score = Math.round((correct / results.length) * 100);
    const attempt = { id: uid('TN'), userId: req.user.id, name: req.user.name, className: req.user.className || req.user.title || '', avatar: req.user.avatar || null, topic: str(req.body.topic, 'chủ đề', { max: 20 }) || 'all', total: results.length, correct, score, duration, at: nowISO() };
    ctx.db.data.quizAttempts.push(attempt);
    const board = leaderboard(ctx.db, { days: 7, limit: 50 });
    const rank = board.findIndex(b => b.userId === req.user.id) + 1;
    ctx.emit('quiz:attempt', { name: attempt.name, score, duration }, { all: true });
    ctx.db.save();
    return { attempt, results, rank, badges: badgesFor(ctx.db.data.quizAttempts.filter(a => a.userId === req.user.id)) };
  });

  r.get('/api/quiz/leaderboard', { auth: 'user', group: Q, desc: 'Bảng vàng: ?period=week|all', query: { period: 'week' } }, async (req, ctx) => {
    const mine = ctx.db.data.quizAttempts.filter(a => a.userId === req.user.id);
    return { items: leaderboard(ctx.db, { days: req.query.period === 'all' ? null : 7, limit: 10 }), mine: { attempts: mine.length, best: mine.reduce((m, a) => Math.max(m, a.score), 0), badges: badgesFor(mine) } };
  });

  // ---------- Khảo sát ----------
  const surveyKey = (ctx, sid, uidv) => ctx.crypto.hmac('survey', `${sid}:${uidv}`);

  r.get('/api/surveys', { auth: 'student', group: Q, desc: 'Các đợt khảo sát đang mở và trạng thái đã tham gia.' }, async (req, ctx) => {
    if (!moduleOn(ctx.db, 'survey')) return { items: [], disabled: true };
    const items = [];
    for (const s of ctx.db.data.surveys.filter(s => s.status === 'active')) {
      const key = await surveyKey(ctx, s.id, req.user.id);
      const count = ctx.db.data.surveyResponses.filter(x => x.surveyId === s.id).length;
      items.push({ id: s.id, title: s.title, description: s.description, purpose: s.purpose, anonymous: s.anonymous, target: s.target, targetCount: s.targetCount, deadline: s.deadline, questionCount: s.questions.length, responses: count, done: ctx.db.data.surveyResponses.some(x => x.surveyId === s.id && x.userKey === key), expired: s.deadline < localDate() });
    }
    return { items };
  });

  r.get('/api/surveys/:id', { auth: 'student', group: Q, desc: 'Chi tiết phiếu khảo sát.' }, async (req, ctx) => {
    const s = findOr404(ctx.db.data.surveys, req.params.id, 'khảo sát');
    if (s.status !== 'active') fail(403, 'Đợt khảo sát này đã đóng.');
    const key = await surveyKey(ctx, s.id, req.user.id);
    return { item: s, done: ctx.db.data.surveyResponses.some(x => x.surveyId === s.id && x.userKey === key) };
  });

  r.post('/api/surveys/:id/responses', { auth: 'student', group: Q, desc: 'Gửi phiếu trả lời khảo sát.', body: { answers: { q1: 'Khối 12', q4: ['Cô lập, tẩy chay'], q6: '4' } } }, async (req, ctx) => {
    const s = findOr404(ctx.db.data.surveys, req.params.id, 'khảo sát');
    if (s.status !== 'active') fail(403, 'Đợt khảo sát này đã đóng.');
    if (s.deadline < localDate()) fail(403, 'Đợt khảo sát đã quá hạn.');
    const key = await surveyKey(ctx, s.id, req.user.id);
    if (ctx.db.data.surveyResponses.some(x => x.surveyId === s.id && x.userKey === key)) fail(409, 'Bạn đã gửi phiếu cho đợt khảo sát này rồi. Cảm ơn bạn!');
    const input = req.body.answers || {};
    const answers = {};
    for (const q of s.questions) {
      let v = input[q.id];
      if (q.type === 'multi') v = Array.isArray(v) ? v.filter(x => q.options.includes(x)) : [];
      else if (q.type === 'text') v = str(v, 'câu trả lời', { max: 1000 });
      else v = q.options.includes(String(v)) ? String(v) : '';
      if (q.required && (!v || (Array.isArray(v) && !v.length))) fail(400, `Vui lòng trả lời câu: “${q.text}”.`);
      answers[q.id] = v;
    }
    ctx.db.data.surveyResponses.push({ id: uid('PH'), surveyId: s.id, userKey: key, userId: s.anonymous ? null : req.user.id, name: s.anonymous ? null : req.user.name, className: s.anonymous ? null : req.user.className, answers, at: nowISO() });
    ctx.db.save();
    return { ok: true, message: 'Đã gửi phiếu khảo sát. Cảm ơn bạn đã đóng góp cho đề tài của nhà trường!' };
  });
}
