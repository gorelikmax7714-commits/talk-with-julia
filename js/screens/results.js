// End-of-lesson celebration: stars, passport stamp, a note from Julia.
import { nextLesson, unitDone, lessonList } from '../store.js';
import { FINAL } from '../content.js';
import { esc, mount, on, confetti } from '../ui/dom.js';
import { openLesson } from '../ui/nav.js';
import { sfx } from '../sfx.js';

const NOTES = [
  "I can't wait to see you!", 'You are doing great!', 'So proud of you!',
  'See you very soon!', 'Wow! Your English is getting better!', 'Keep going, superstar!',
];

export function renderResults(ctx, { lesson, stars, review, count, spoken, chat, learned = [] }) {
  const finishedUnit = lesson && lesson.kind === 'chat' && unitDone(ctx.state, lesson.unitId);
  const unit = lesson ? ctx.unit(lesson.unitId) : null;
  const next = nextLesson(ctx.state);
  const note = NOTES[Math.floor(Math.random() * NOTES.length)];
  let title = 'סיימת שיעור! 🎉';
  if (review) title = `חזרת על ${count} משפטים! 🔁`;
  else if (lesson?.unitId === FINAL.id) title = 'את מוכנה ליום הגדול! 🏆';
  else if (chat) title = `דיברת עם ${ctx.state.profile.auntHe}! 💬`;

  const starRow = [1, 2, 3].map((n, i) => `<span class="${n <= stars ? '' : 'off'}" style="animation-delay:${0.2 + i * 0.18}s">⭐</span>`).join('');
  const stamp = finishedUnit
    ? `<div class="passport-stamp"><div><div class="em">${unit.emoji}</div><div class="en">${esc(unit.titleEn)}</div><div class="en" style="font-size:.8rem">APPROVED ✓</div></div></div>`
    : '';
  const learnedHtml = learned.length
    ? `<div class="card" style="text-align:right;margin:0 0 20px"><b>למדת היום:</b>${learned.map((p) => `<div class="en" style="text-align:left;margin-top:6px">${p.emoji} ${esc(p.en)}</div>`).join('')}</div>`
    : '';
  const spokenHtml = spoken ? `<div class="chip" style="margin-bottom:16px">🎤 דיברת בקול ${spoken} פעמים!</div>` : '';
  const nextBtn = next && !review ? '<button class="btn red" data-next>לשיעור הבא ←</button>' : '';

  const root = mount(`
    <div class="results enter">
      <h1>${title}</h1>
      <div class="big-stars">${starRow}</div>
      ${stamp}
      ${spokenHtml}
      ${learnedHtml}
      <div class="julia-note">“${esc(note)}” — ${esc(ctx.state.profile.aunt)} 💌</div>
      ${nextBtn}
      <button class="btn ${nextBtn ? 'ghost' : ''}" data-home>חזרה למסע</button>
    </div>`);
  sfx.win();
  confetti(finishedUnit ? 110 : 60);
  if (finishedUnit) setTimeout(() => sfx.stamp(), 650);
  on(root, '[data-home]', 'click', () => ctx.go('home'));
  on(root, '[data-next]', 'click', () => openLesson(ctx, lessonList().find((l) => l.id === next.id)));
}
