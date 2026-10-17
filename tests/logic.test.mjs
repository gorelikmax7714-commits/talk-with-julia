import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, scoreOne, isMatch, whichSaid, levenshtein } from '../js/match.js';
import { introduce, review, dueIds, addDays, daysBetween, MAX_BOX } from '../js/srs.js';
import {
  initialState, completeLesson, applyReviews, updateStreak, isUnlocked, nextLesson,
  lessonList, starsFor, load, save, progress, unitDone,
} from '../js/store.js';
import { buildLearnSteps, buildReviewSteps, buildIsCorrect, wordsOf, shuffle } from '../js/lesson.js';
import { UNITS, FINAL, findPhrase, allPhrases } from '../js/content.js';
import { profileVars, fill, resolvePhrase, DEFAULT_PROFILE } from '../js/profile.js';

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// ---------- match ----------
test('normalize expands contractions, digits and strips punctuation', () => {
  assert.deepEqual(normalize("I'm 9!"), ['i', 'am', 'nine']);
  assert.deepEqual(normalize('Don’t'), ['do', 'not']);
});

test('levenshtein basic distances', () => {
  assert.equal(levenshtein('water', 'water'), 0);
  assert.equal(levenshtein('water', 'vater'), 1);
});

test('accepts accented / partial speech', () => {
  assert.ok(isMatch('Can I have water, please?', ['can i have vater please']));
  assert.ok(isMatch("I'm good, thank you!", ['I am good thank']));
});

test('rejects unrelated speech', () => {
  assert.ok(!isMatch('Nice to meet you!', ['good night']));
  assert.ok(!isMatch('How are you?', []));
});

test('names are ignored when scoring', () => {
  assert.equal(scoreOne('My name is Gaia.', 'my name is guy', ['Gaia']), 1);
});

test('whichSaid picks the closest candidate', () => {
  const cands = ['Good morning!', 'Good night!'];
  assert.equal(whichSaid(cands, ['good night']), 1);
  assert.equal(whichSaid(cands, ['banana']), -1);
});

// ---------- srs ----------
test('introduce schedules tomorrow', () => {
  assert.deepEqual(introduce('2026-10-17'), { box: 1, due: '2026-10-18' });
});

test('review moves box up on success and resets on failure', () => {
  const c = { box: 2, due: '2026-10-17' };
  assert.deepEqual(review(c, true, '2026-10-17'), { box: 3, due: '2026-10-21' });
  assert.deepEqual(review(c, false, '2026-10-17'), { box: 1, due: '2026-10-18' });
  assert.equal(review({ box: MAX_BOX }, true, '2026-10-17').box, MAX_BOX);
  assert.equal(c.box, 2, 'does not mutate');
});

test('dueIds returns due cards lowest box first, capped', () => {
  const cards = {
    a: { box: 3, due: '2026-10-10' }, b: { box: 1, due: '2026-10-17' },
    c: { box: 1, due: '2026-10-30' }, d: { box: 2, due: '2026-10-01' },
  };
  assert.deepEqual(dueIds(cards, '2026-10-17'), ['b', 'd', 'a']);
  assert.deepEqual(dueIds(cards, '2026-10-17', 1), ['b']);
});

test('date helpers cross month boundaries', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(daysBetween('2026-10-17', '2026-12-18'), 62);
});

// ---------- store ----------
test('lessons unlock in order', () => {
  const s = initialState();
  const [first, second] = lessonList();
  assert.ok(isUnlocked(s, first.id));
  assert.ok(!isUnlocked(s, second.id));
  const s2 = completeLesson(s, first.id, { stars: 3, phraseIds: first.phraseIds, today: '2026-10-17' });
  assert.ok(isUnlocked(s2, second.id));
  assert.equal(nextLesson(s2).id, second.id);
  assert.equal(Object.keys(s2.cards).length, first.phraseIds.length);
  assert.deepEqual(s.lessons, {}, 'original untouched');
});

test('completeLesson keeps best stars and progress counts', () => {
  let s = initialState();
  s = completeLesson(s, 'u1-1', { stars: 3, today: '2026-10-17' });
  s = completeLesson(s, 'u1-1', { stars: 1, today: '2026-10-17' });
  assert.equal(s.lessons['u1-1'].stars, 3);
  assert.equal(progress(s).done, 1);
  assert.ok(!unitDone(s, 'u1'));
});

test('streak continues, holds and resets', () => {
  assert.deepEqual(updateStreak({ count: 0, last: null }, '2026-10-17'), { count: 1, last: '2026-10-17' });
  assert.deepEqual(updateStreak({ count: 3, last: '2026-10-16' }, '2026-10-17'), { count: 4, last: '2026-10-17' });
  assert.deepEqual(updateStreak({ count: 3, last: '2026-10-17' }, '2026-10-17'), { count: 3, last: '2026-10-17' });
  assert.deepEqual(updateStreak({ count: 3, last: '2026-10-10' }, '2026-10-17'), { count: 1, last: '2026-10-17' });
});

test('applyReviews updates cards', () => {
  const s = { ...initialState(), cards: { x: { box: 1, due: '2026-10-17' } } };
  const s2 = applyReviews(s, { x: true }, '2026-10-17');
  assert.equal(s2.cards.x.box, 2);
});

test('starsFor thresholds', () => {
  assert.equal(starsFor(0), 3);
  assert.equal(starsFor(3), 2);
  assert.equal(starsFor(9), 1);
});

test('load/save round trip and survives bad data', () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const s = { ...initialState(), onboarded: true };
  assert.ok(save(s, storage));
  assert.equal(load(storage).onboarded, true);
  mem.set('talk-with-julia-v1', '{broken');
  assert.equal(load(storage).onboarded, false);
  const throwing = { setItem: () => { throw new Error('full'); } };
  assert.equal(save(s, throwing), false);
});

// ---------- lesson ----------
test('learn steps teach each new phrase then quiz', () => {
  const pool = UNITS[0].phrases;
  const steps = buildLearnSteps(pool.slice(0, 3), [], pool, seeded());
  assert.equal(steps[0].type, 'intro');
  assert.equal(steps[1].type, 'say');
  assert.equal(steps.at(-1).type, 'say');
  steps.filter((s) => s.options).forEach((s) => {
    assert.equal(s.options.length, 3);
    assert.ok(s.options.some((o) => o.id === s.phrase.id));
  });
});

test('review steps cover every phrase', () => {
  const pool = allPhrases();
  const steps = buildReviewSteps(pool.slice(0, 6), pool, seeded(3));
  const ids = new Set(steps.map((s) => s.phrase.id));
  assert.equal(ids.size, 6);
});

test('buildIsCorrect checks order case-insensitively', () => {
  const p = { en: 'How are you?' };
  assert.ok(buildIsCorrect(p, ['how', 'are', 'you']));
  assert.ok(!buildIsCorrect(p, ['are', 'how', 'you']));
  assert.deepEqual(wordsOf('Hi, Julia!'), ['Hi', 'Julia']);
  assert.equal(shuffle([1, 2, 3], seeded()).length, 3);
});

// ---------- content integrity ----------
test('every dialogue reference points to a real phrase', () => {
  const dialogues = [...UNITS.map((u) => u.dialogue), FINAL.dialogue];
  dialogues.forEach((d) => d.turns.forEach((t) => {
    [...t.answers, ...t.distract].forEach((id) => assert.ok(findPhrase(id), `missing ${id}`));
  }));
});

test('all placeholders resolve for the default profile', () => {
  const vars = profileVars(DEFAULT_PROFILE);
  allPhrases().forEach((p) => {
    const r = resolvePhrase(p, vars);
    [r.en, r.he, r.tr, r.emoji].forEach((txt) => assert.ok(!/\{\w+\}/.test(txt), `${p.id}: ${txt}`));
  });
  const texts = [...UNITS, FINAL].flatMap((u) => [u.titleHe, ...u.dialogue.turns.flatMap((t) => [t.julia, t.he]), u.dialogue.end.julia]);
  texts.forEach((t) => assert.ok(!/\{\w+\}/.test(fill(t, vars)), t));
});

test('profileVars falls back on unknown choices', () => {
  const v = profileVars({ color: 'plaid', age: 42 });
  assert.equal(v.color, 'pink');
  assert.equal(v.ageEn, 'nine');
});
