// Lenient matching of what the speech recogniser heard against a target
// phrase. Kids' voices + a Hebrew accent confuse recognisers, so we score
// word overlap with per-word fuzziness and ignore names entirely.

const CONTRACTIONS = {
  "i'm": 'i am', "don't": 'do not', "let's": 'let us', "what's": 'what is',
  "you're": 'you are', "it's": 'it is', "that's": 'that is', "i'll": 'i will',
  "can't": 'can not', cannot: 'can not', "didn't": 'did not', "isn't": 'is not',
};
// Recognisers often drop the apostrophe ("lets play", "i dont").
Object.keys(CONTRACTIONS).forEach((k) => {
  const bare = k.replace(/'/g, '');
  if (!(bare in CONTRACTIONS) && !['its', 'ill', 'cant'].includes(bare)) CONTRACTIONS[bare] = CONTRACTIONS[k];
});
CONTRACTIONS.cant = 'can not';

const DIGITS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
  7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve',
};

// Words that sound alike and that recognisers routinely swap.
const SOUND_ALIKE = {
  to: 'two', too: 'two', for: 'four', fourth: 'four', '4th': 'four',
  mum: 'mom', mam: 'mom', hey: 'hi', hello: 'hi', ok: 'okay', yeah: 'yes', yep: 'yes',
  favourite: 'favorite', colour: 'color', grey: 'gray', u: 'you', r: 'are',
};

export const PASS_SCORE = 0.6;

export function normalize(text) {
  const lowered = String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'");
  const words = lowered
    .split(/\s+/)
    .flatMap((w) => {
      const bare = w.replace(/[^a-z0-9']/g, '');
      const expanded = CONTRACTIONS[bare] || bare;
      return expanded.split(' ');
    })
    .map((w) => w.replace(/'/g, ''))
    .filter(Boolean)
    .map((w) => DIGITS[w] || w)
    .map((w) => SOUND_ALIKE[w] || w);
  return words;
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function wordsClose(target, heard) {
  if (target === heard) return true;
  const allowed = target.length >= 6 ? 2 : target.length >= 4 ? 1 : 0;
  return allowed > 0 && levenshtein(target, heard) <= allowed;
}

/** Score 0..1: share of target words heard (fuzzy), names excluded. */
export function scoreOne(target, heard, ignore = []) {
  const skip = new Set(ignore.flatMap((n) => normalize(n)));
  const want = normalize(target).filter((w) => !skip.has(w));
  if (want.length === 0) return 1;
  const pool = normalize(heard);
  let hits = 0;
  for (const w of want) {
    const idx = pool.findIndex((h) => wordsClose(w, h));
    if (idx >= 0) {
      hits += 1;
      pool.splice(idx, 1);
    }
  }
  return hits / want.length;
}

/** Best score over all recogniser alternatives. */
export function bestScore(target, alternatives, ignore = []) {
  const list = Array.isArray(alternatives) ? alternatives : [alternatives];
  return list.reduce((best, alt) => Math.max(best, scoreOne(target, alt, ignore)), 0);
}

export function isMatch(target, alternatives, ignore = []) {
  return bestScore(target, alternatives, ignore) >= PASS_SCORE;
}

/** Which of several candidate phrases did she say? Returns index or -1. */
export function whichSaid(candidates, alternatives, ignore = []) {
  let bestIdx = -1;
  let best = PASS_SCORE - 1e-9;
  candidates.forEach((c, i) => {
    const s = bestScore(c, alternatives, ignore);
    if (s > best) {
      best = s;
      bestIdx = i;
    }
  });
  return bestIdx;
}
