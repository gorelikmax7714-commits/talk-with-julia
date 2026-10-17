// Home: countdown postcard with Julia's flight, today's lesson, the journey map.
import { UNITS, FINAL } from '../content.js';
import { lessonList, nextLesson, progress, totalStars, isUnlocked, unitDone } from '../store.js';
import { daysBetween, dueIds } from '../srs.js';
import { esc, mount, on, today, sheet, starsText } from '../ui/dom.js';
import { navHtml, bindNav, openLesson } from '../ui/nav.js';
import { sfx } from '../sfx.js';

const P0 = [34, 74];
const P1 = [160, -14];
const P2 = [286, 74];

function bezier(t) {
  const u = 1 - t;
  const x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0];
  const y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1];
  const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function flightSvg(ratio) {
  const t = Math.max(0.02, Math.min(0.98, ratio));
  const { x, y, angle } = bezier(t);
  const d = `M${P0} Q${P1} ${P2}`;
  return `
  <svg class="flight" viewBox="0 0 320 96" aria-hidden="true">
    <path class="path" d="${d}"/>
    <path class="done" d="${d}" pathLength="100" stroke-dasharray="${(t * 100).toFixed(1)} 100"/>
    <text x="${P0[0] - 14}" y="${P0[1] + 8}">🇺🇸</text>
    <text x="${P2[0] - 10}" y="${P2[1] + 8}">🇮🇱</text>
    <text class="label" x="${P0[0] - 14}" y="${P0[1] + 22}">USA</text>
    <text class="label" x="${P2[0] - 12}" y="${P2[1] + 22}">ישראל</text>
    <g class="plane" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(angle + 45).toFixed(1)})">
      <text x="-13" y="9" style="font-size:26px">✈️</text>
    </g>
  </svg>`;
}

function countdownHtml(ctx) {
  const { settings } = ctx.state;
  const aunt = ctx.state.profile.auntHe;
  const days = daysBetween(today(), settings.arrival);
  const prog = progress(ctx.state);
  const left = prog.total - prog.done;
  let main;
  if (days > 0) {
    main = `<div><div class="days">${days}</div><div class="days-label">ימים עד ש${esc(aunt)} נוחתת!</div></div>`;
  } else if (days === 0) {
    main = `<div><div class="days">🎉</div><div class="days-label">היום ${esc(aunt)} מגיעה! את מוכנה!</div></div>`;
  } else {
    main = `<div><div class="days">💬</div><div class="days-label">${esc(aunt)} כאן! זמן לדבר איתה!</div></div>`;
  }
  const perWeek = days > 0 && left > 0 ? Math.ceil((left / days) * 7) : 0;
  const pace = left === 0
    ? 'סיימת את כל המסע! את מוכנה לגמרי 🏆'
    : perWeek ? `כדי להספיק: בערך ${perWeek} שיעורים בשבוע (נשארו ${left})` : `נשארו ${left} שיעורים`;
  return `
  <section class="postcard">
    <div class="row">${main}<div class="sign en">See you soon!<br>— ${esc(ctx.state.profile.aunt)}</div></div>
    ${flightSvg(prog.ratio)}
    <div class="pace">${pace}</div>
  </section>`;
}

function lessonTitle(ctx, lesson) {
  const unit = ctx.unit(lesson.unitId);
  if (lesson.kind === 'chat') return lesson.unitId === FINAL.id ? 'החזרה הגדולה' : `שיחה עם ${ctx.state.profile.auntHe}`;
  return lesson.id.endsWith('-1') ? `מילים חדשות: ${ctx.fill(unit.titleHe)}` : `עוד מילים: ${ctx.fill(unit.titleHe)}`;
}

function todayHtml(ctx) {
  const next = nextLesson(ctx.state);
  const due = dueIds(ctx.state.cards, today()).length;
  const cta = next
    ? `<button class="btn red" data-start="${next.id}"><span>▶ השיעור של היום<span class="sub">${esc(lessonTitle(ctx, next))}</span></span></button>`
    : `<button class="btn mint" data-start="final-1">🛬 עוד חזרה על היום הגדול</button>`;
  const review = due
    ? `<button class="review-chip" data-review><span>🔁 חזרה מהירה — ${due} משפטים מחכים לך</span><span>←</span></button>`
    : '';
  return `<section class="today">${cta}${review}</section>`;
}

function unitRow(ctx, unit, idx, current) {
  const lessons = lessonList().filter((l) => l.unitId === unit.id);
  const unlocked = isUnlocked(ctx.state, lessons[0].id);
  const done = unitDone(ctx.state, unit.id);
  const dots = lessons.map((l) => {
    const isDone = ctx.state.lessons[l.id]?.done;
    const isNext = !isDone && isUnlocked(ctx.state, l.id);
    const icon = l.kind === 'chat' ? '💬' : '';
    return `<span class="dot ${isDone ? 'done' : ''} ${isNext ? 'next' : ''}">${isDone ? '✓' : icon}</span>`;
  }).join('');
  const tilt = idx % 2 ? '3deg' : '-3deg';
  return `
  <button class="unit-row ${unlocked ? '' : 'locked'} ${current ? 'current' : ''}" data-unit="${unit.id}" style="--tilt:${tilt}">
    <div class="stamp"><div class="stamp-inner" style="--c:${unit.color}">
      <span>${unit.emoji}</span>
      ${done ? '<div class="postmark">DONE ✓</div>' : ''}
      ${unlocked ? '' : '<span class="lock">🔒</span>'}
    </div></div>
    <div class="unit-info">
      <div class="t">${esc(ctx.fill(unit.titleHe))}</div>
      <div class="e en">${esc(unit.titleEn)}</div>
      <div class="dots">${dots}</div>
    </div>
  </button>`;
}

function openUnitSheet(ctx, unitId) {
  const unit = ctx.unit(unitId);
  const lessons = lessonList().filter((l) => l.unitId === unitId);
  const items = lessons.map((l) => {
    const rec = ctx.state.lessons[l.id];
    const open = isUnlocked(ctx.state, l.id);
    const icon = l.kind === 'chat' ? '💬' : '📖';
    return `<button class="lesson-item" data-lesson="${l.id}" ${open ? '' : 'disabled'}>
      <span class="ic">${open ? icon : '🔒'}</span>${esc(lessonTitle(ctx, l))}
      <span class="stars">${rec?.done ? starsText(rec.stars) : ''}</span></button>`;
  }).join('');
  sfx.tap();
  sheet(`<h2>${unit.emoji} ${esc(ctx.fill(unit.titleHe))}</h2><div class="en" style="color:var(--ink-soft)">${esc(unit.titleEn)}</div>${items}`,
    (root, close) => on(root, '[data-lesson]', 'click', (e, el) => {
      close();
      openLesson(ctx, lessons.find((l) => l.id === el.dataset.lesson));
    }));
}

export function renderHome(ctx) {
  const { state } = ctx;
  const next = nextLesson(state);
  const units = [...UNITS, FINAL];
  const root = mount(`
  <div class="airmail-top"></div>
  <div class="enter">
    <header class="topbar">
      <div class="hello">היי ${esc(state.profile.nameHe)}! 👋<small>בואי נתכונן לביקור של ${esc(state.profile.auntHe)}</small></div>
      <div class="stats"><span class="chip">🔥 ${state.streak.count}</span><span class="chip">⭐ ${totalStars(state)}</span></div>
    </header>
    ${countdownHtml(ctx)}
    ${todayHtml(ctx)}
    <div class="section-title">🛂 הדרכון שלי</div>
    <div class="journey">${units.map((u, i) => unitRow(ctx, u, i, next?.unitId === u.id)).join('')}</div>
  </div>
  ${navHtml('home')}`);
  bindNav(root, ctx);
  on(root, '[data-start]', 'click', (e, el) => openLesson(ctx, lessonList().find((l) => l.id === el.dataset.start)));
  on(root, '[data-review]', 'click', () => ctx.go('review'));
  on(root, '[data-unit]', 'click', (e, el) => {
    const first = lessonList().find((l) => l.unitId === el.dataset.unit);
    if (!isUnlocked(ctx.state, first.id)) {
      sfx.oops();
      el.querySelector('.stamp').animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 });
      return;
    }
    openUnitSheet(ctx, el.dataset.unit);
  });
}
