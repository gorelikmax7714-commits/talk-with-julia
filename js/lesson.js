// Builds the step sequence of a lesson. Pure: phrases in, steps out.
// Step types: intro, say, listen (hear → pick meaning), meaning (Hebrew →
// pick English), build (tap word tiles in order).

export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function wordsOf(en) {
  return en.replace(/[.,!?…]/g, '').split(/\s+/).filter(Boolean);
}

function optionsFor(target, pool, rng, count = 3) {
  const others = shuffle(pool.filter((p) => p.id !== target.id && p.en !== target.en), rng);
  return shuffle([target, ...others.slice(0, count - 1)], rng);
}

function canBuild(p) {
  const n = wordsOf(p.en).length;
  return n >= 3 && n <= 7;
}

function quizFor(p, pool, rng, variant) {
  if (variant === 'build' && canBuild(p)) {
    return { type: 'build', phrase: p, tiles: shuffle(wordsOf(p.en), rng) };
  }
  if (variant === 'meaning') return { type: 'meaning', phrase: p, options: optionsFor(p, pool, rng) };
  return { type: 'listen', phrase: p, options: optionsFor(p, pool, rng) };
}

/** New phrases get intro+say; then a shuffled quiz mixing new + review. */
export function buildLearnSteps(newPhrases, reviewPhrases, pool, rng = Math.random) {
  const teach = newPhrases.flatMap((p) => [
    { type: 'intro', phrase: p },
    { type: 'say', phrase: p },
  ]);
  const quizNew = newPhrases.flatMap((p, i) => [
    quizFor(p, pool, rng, 'listen'),
    quizFor(p, pool, rng, i % 2 === 0 ? 'build' : 'meaning'),
  ]);
  const quizReview = reviewPhrases.map((p, i) => quizFor(p, pool, rng, i % 2 ? 'meaning' : 'listen'));
  const finale = newPhrases.length ? [{ type: 'say', phrase: newPhrases[newPhrases.length - 1] }] : [];
  return [...teach, ...shuffle([...quizNew, ...quizReview], rng), ...finale];
}

/** Daily review of due phrases: alternate recognition, recall and speaking. */
export function buildReviewSteps(phrases, pool, rng = Math.random) {
  const variants = ['listen', 'meaning', 'build'];
  return shuffle(phrases, rng).flatMap((p, i) => {
    const step = quizFor(p, pool, rng, variants[i % variants.length]);
    return i % 3 === 2 ? [step, { type: 'say', phrase: p }] : [step];
  });
}

/** Does the tapped tile order spell the phrase? */
export function buildIsCorrect(phrase, chosenWords) {
  const want = wordsOf(phrase.en).map((w) => w.toLowerCase());
  const got = chosenWords.map((w) => w.toLowerCase());
  return want.length === got.length && want.every((w, i) => w === got[i]);
}
