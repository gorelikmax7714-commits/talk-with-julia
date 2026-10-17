// App state: pure update functions + a thin localStorage wrapper.
import { UNITS, FINAL } from './content.js';
import { introduce, review, addDays } from './srs.js';
import { DEFAULT_PROFILE } from './profile.js';

const KEY = 'talk-with-julia-v1';
export const DEFAULT_ARRIVAL = '2026-12-18';

export function initialState() {
  return {
    onboarded: false,
    profile: { ...DEFAULT_PROFILE },
    settings: { rate: 0.85, arrival: DEFAULT_ARRIVAL, sound: true },
    lessons: {},
    cards: {},
    streak: { count: 0, last: null },
    log: [],
  };
}

/** Ordered list of every lesson in the journey. */
export function lessonList() {
  const list = UNITS.flatMap((u) => {
    const half = Math.ceil(u.phrases.length / 2);
    return [
      { id: `${u.id}-1`, unitId: u.id, kind: 'learn', phraseIds: u.phrases.slice(0, half).map((p) => p.id) },
      { id: `${u.id}-2`, unitId: u.id, kind: 'learn', phraseIds: u.phrases.slice(half).map((p) => p.id) },
      { id: `${u.id}-3`, unitId: u.id, kind: 'chat', phraseIds: [] },
    ];
  });
  return [...list, { id: `${FINAL.id}-1`, unitId: FINAL.id, kind: 'chat', phraseIds: [] }];
}

export function isUnlocked(state, lessonId) {
  const list = lessonList();
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return idx === 0;
  return Boolean(state.lessons[list[idx - 1].id]?.done);
}

export function nextLesson(state) {
  return lessonList().find((l) => !state.lessons[l.id]?.done) || null;
}

export function progress(state) {
  const list = lessonList();
  const done = list.filter((l) => state.lessons[l.id]?.done).length;
  return { done, total: list.length, ratio: done / list.length };
}

export function totalStars(state) {
  return Object.values(state.lessons).reduce((sum, l) => sum + (l.stars || 0), 0);
}

export function unitDone(state, unitId) {
  return lessonList()
    .filter((l) => l.unitId === unitId)
    .every((l) => state.lessons[l.id]?.done);
}

export function starsFor(mistakes) {
  if (mistakes <= 1) return 3;
  if (mistakes <= 3) return 2;
  return 1;
}

export function updateStreak(streak, today) {
  if (streak.last === today) return streak;
  const continues = streak.last && addDays(streak.last, 1) === today;
  return { count: continues ? streak.count + 1 : 1, last: today };
}

export function completeLesson(state, lessonId, { stars, phraseIds = [], today }) {
  const prev = state.lessons[lessonId];
  const cards = { ...state.cards };
  phraseIds.forEach((id) => {
    if (!cards[id]) cards[id] = introduce(today);
  });
  return {
    ...state,
    lessons: { ...state.lessons, [lessonId]: { done: true, stars: Math.max(prev?.stars || 0, stars) } },
    cards,
    streak: updateStreak(state.streak, today),
    log: [...state.log, { lessonId, stars, day: today }].slice(-200),
  };
}

/** results: { phraseId: boolean } — first-try correctness per phrase. */
export function applyReviews(state, results, today) {
  const cards = { ...state.cards };
  Object.entries(results).forEach(([id, ok]) => {
    cards[id] = review(cards[id], ok, today);
  });
  return { ...state, cards, streak: updateStreak(state.streak, today) };
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const base = initialState();
    return {
      ...base,
      ...saved,
      profile: { ...base.profile, ...saved.profile },
      settings: { ...base.settings, ...saved.settings },
    };
  } catch (err) {
    console.warn('Could not load saved progress, starting fresh', err);
    return initialState();
  }
}

export function save(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Could not save progress', err);
    return false;
  }
}
