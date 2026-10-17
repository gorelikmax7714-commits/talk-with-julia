// Runs a sequence of lesson steps with a progress bar and feedback sheets.
import { buildLearnSteps, buildReviewSteps, shuffle } from '../lesson.js';
import { completeLesson, applyReviews, starsFor } from '../store.js';
import { dueIds } from '../srs.js';
import { UNITS } from '../content.js';
import { esc, mount, on, today } from '../ui/dom.js';
import { renderStep } from './steps.js';
import { stopSpeaking } from '../speech.js';
import { sfx } from '../sfx.js';

const PRAISE = [
  ['כל הכבוד!', 'Great job!'], ['מדהים!', 'Awesome!'], ['יופי!', 'You got it!'],
  ['את אלופה!', "You're a star!"], ['מושלם!', 'Perfect!'], ['וואו!', 'Wow, super!'],
];
const REVIEW_EXTRA = 3;

function learnedPhrases(ctx, excludeIds = []) {
  return Object.keys(ctx.state.cards)
    .filter((id) => !excludeIds.includes(id))
    .map((id) => ctx.phrase(id))
    .filter((p) => p && p.en);
}

function unitPhrases(ctx, unitId) {
  return UNITS.find((u) => u.id === unitId).phrases.map((p) => ctx.phrase(p.id));
}

function run(ctx, { steps, unitId, onDone }) {
  let idx = 0;
  let mistakes = 0;
  const firstTry = {};
  const root = mount(`
    <div class="player-top">
      <button class="close" data-close aria-label="יציאה">✕</button>
      <div class="bar"><div style="width:0%"></div></div>
    </div>
    <div class="stage"></div>`);
  const stage = root.querySelector('.stage');
  const bar = root.querySelector('.bar > div');
  on(root, '[data-close]', 'click', () => {
    if (confirm('לצאת מהשיעור? ההתקדמות בשיעור הזה לא תישמר.')) {
      stopSpeaking();
      ctx.go('home');
    }
  });

  const record = (ok) => {
    const id = steps[idx].phrase.id;
    if (!(id in firstTry)) firstTry[id] = ok;
    else firstTry[id] = firstTry[id] && ok;
  };

  const feedback = (good, opts = {}) => {
    const p = steps[idx].phrase;
    const [he, en] = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    const box = document.createElement('div');
    box.className = `feedback ${good ? 'good' : 'soft'}`;
    box.innerHTML = good
      ? `<div class="fb-title">🎉 ${esc(opts.title || he)} <span class="en" style="font-weight:500;font-size:1rem">${esc(opts.sub || en)}</span></div>
         <button class="btn mint" data-cont>ממשיכים ←</button>`
      : `<div class="fb-title">🤏 כמעט! התשובה הנכונה:</div>
         <div class="fb-answer"><b class="en">${esc(p.en)}</b><br>${esc(p.he)}</div>
         <button class="btn orange" data-cont>הבנתי ←</button>`;
    document.body.appendChild(box);
    box.querySelector('[data-cont]').addEventListener('click', () => {
      box.remove();
      next();
    });
    if (good) {
      sfx.correct();
      if (opts.speak) ctx.say(p.en);
    } else {
      sfx.oops();
      ctx.say(p.en, { speed: 0.85 });
    }
  };

  const api = {
    ctx,
    unitId,
    correct(opts = {}) {
      record(true);
      feedback(true, opts);
    },
    wrong() {
      record(false);
      mistakes += 1;
      feedback(false);
    },
    next: () => next(),
  };

  function show() {
    bar.style.width = `${(idx / steps.length) * 100}%`;
    stage.innerHTML = '<div class="step"></div>';
    renderStep(stage.firstChild, steps[idx], api);
  }

  function next() {
    stopSpeaking();
    idx += 1;
    if (idx >= steps.length) {
      bar.style.width = '100%';
      onDone({ mistakes, firstTry });
      return;
    }
    show();
  }

  show();
}

export function startLesson(ctx, lesson) {
  const fresh = lesson.phraseIds.map((id) => ctx.phrase(id));
  const learned = learnedPhrases(ctx, lesson.phraseIds);
  const due = new Set(dueIds(ctx.state.cards, today(), 20));
  const reviewPick = [
    ...shuffle(learned.filter((p) => due.has(p.id))),
    ...shuffle(learned.filter((p) => !due.has(p.id))),
  ].slice(0, REVIEW_EXTRA);
  const pool = [...learned, ...unitPhrases(ctx, lesson.unitId)];
  const steps = buildLearnSteps(fresh, reviewPick, pool);
  run(ctx, {
    steps,
    unitId: lesson.unitId,
    onDone: ({ mistakes, firstTry }) => {
      const stars = starsFor(mistakes);
      const reviewed = Object.fromEntries(reviewPick.map((p) => [p.id, firstTry[p.id] !== false]));
      ctx.update((s) => applyReviews(
        completeLesson(s, lesson.id, { stars, phraseIds: lesson.phraseIds, today: today() }),
        reviewed,
        today(),
      ));
      ctx.go('results', { lesson, stars, learned: fresh });
    },
  });
}

export function startReview(ctx) {
  const ids = dueIds(ctx.state.cards, today());
  if (!ids.length) {
    ctx.go('home');
    return;
  }
  const phrases = ids.map((id) => ctx.phrase(id));
  const pool = learnedPhrases(ctx);
  const steps = buildReviewSteps(phrases, pool.length >= 3 ? pool : [...pool, ...unitPhrases(ctx, 'u1')]);
  run(ctx, {
    steps,
    unitId: 'u1',
    onDone: ({ mistakes, firstTry }) => {
      const results = Object.fromEntries(ids.map((id) => [id, firstTry[id] !== false]));
      ctx.update((s) => applyReviews(s, results, today()));
      ctx.go('results', { review: true, stars: starsFor(mistakes), count: ids.length });
    },
  });
}
