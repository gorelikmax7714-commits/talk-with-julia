// Leitner-style spaced repetition for phrases. Pure functions on plain data.

export const INTERVALS = [0, 1, 2, 4, 7, 14]; // days, indexed by box
export const MAX_BOX = INTERVALS.length - 1;
const DAY = 24 * 60 * 60 * 1000;

export function dayKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function daysBetween(fromKey, toKey) {
  const [y1, m1, d1] = fromKey.split('-').map(Number);
  const [y2, m2, d2] = toKey.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / DAY);
}

/** A phrase just learned: first review tomorrow. */
export function introduce(today) {
  return { box: 1, due: addDays(today, INTERVALS[1]) };
}

/** Update a card after a review answer. Never mutates. */
export function review(card, correct, today) {
  const box = correct ? Math.min((card?.box || 0) + 1, MAX_BOX) : 1;
  return { box, due: addDays(today, INTERVALS[box]) };
}

export function isDue(card, today) {
  return Boolean(card) && card.due <= today;
}

/** Ids due today, most-overdue (lowest box) first, capped. */
export function dueIds(cards, today, limit = 8) {
  return Object.entries(cards || {})
    .filter(([, c]) => isDue(c, today))
    .sort(([, a], [, b]) => a.box - b.box || a.due.localeCompare(b.due))
    .slice(0, limit)
    .map(([id]) => id);
}
