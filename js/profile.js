// Personal answers Gaia chooses once; lessons are filled with HER real facts.

export const AGES = {
  7: { en: 'seven', tr: 'סבן' },
  8: { en: 'eight', tr: 'אייט' },
  9: { en: 'nine', tr: 'ניין' },
  10: { en: 'ten', tr: 'טן' },
  11: { en: 'eleven', tr: 'אילבן' },
};

export const COLORS = {
  pink: { he: 'ורוד', tr: 'פינק', emoji: '🩷' },
  purple: { he: 'סגול', tr: 'פרפל', emoji: '💜' },
  blue: { he: 'כחול', tr: 'בלו', emoji: '💙' },
  red: { he: 'אדום', tr: 'רד', emoji: '❤️' },
  green: { he: 'ירוק', tr: 'גרין', emoji: '💚' },
  yellow: { he: 'צהוב', tr: 'יילו', emoji: '💛' },
};

export const ANIMALS = {
  dog: { he: 'הכלב', tr: 'דוג', emoji: '🐶' },
  cat: { he: 'החתול', tr: 'קט', emoji: '🐱' },
  horse: { he: 'הסוס', tr: 'הורס', emoji: '🐴' },
  rabbit: { he: 'הארנב', tr: 'רביט', emoji: '🐰' },
  dolphin: { he: 'הדולפין', tr: 'דולפין', emoji: '🐬' },
  unicorn: { he: 'החד-קרן', tr: 'יוניקורן', emoji: '🦄' },
};

export const FOODS = {
  pizza: { he: 'פיצה', tr: 'פיצה', emoji: '🍕' },
  pasta: { he: 'פסטה', tr: 'פסטה', emoji: '🍝' },
  'ice cream': { he: 'גלידה', tr: 'אייס קרים', emoji: '🍦' },
  chocolate: { he: 'שוקולד', tr: "צ'וקלט", emoji: '🍫' },
  pancakes: { he: 'פנקייקים', tr: 'פנקייקס', emoji: '🥞' },
  schnitzel: { he: 'שניצל', tr: 'שניצל', emoji: '🍗' },
};

export const HOBBIES = {
  draw: { he: 'לצייר', tr: 'דרואו', emoji: '🎨' },
  dance: { he: 'לרקוד', tr: 'דאנס', emoji: '💃' },
  swim: { he: 'לשחות', tr: 'סווים', emoji: '🏊‍♀️' },
  sing: { he: 'לשיר', tr: 'סינג', emoji: '🎤' },
  read: { he: 'לקרוא', tr: 'ריד', emoji: '📖' },
  'play soccer': { he: 'לשחק כדורגל', tr: 'פליי סוקר', emoji: '⚽' },
};

export const SIBLINGS = {
  brother: { en: 'I have a brother.', he: 'יש לי אח.', tr: 'איי הב א בראדר', emoji: '👦', label: 'אח' },
  sister: { en: 'I have a sister.', he: 'יש לי אחות.', tr: 'איי הב א סיסטר', emoji: '👧', label: 'אחות' },
  both: { en: 'I have a brother and a sister.', he: 'יש לי אח ואחות.', tr: 'איי הב א בראדר אנד א סיסטר', emoji: '👧👦', label: 'אח ואחות' },
  none: { en: 'I am an only child.', he: 'אני בת יחידה.', tr: "איי אם אן אונלי צ'יילד", emoji: '🌟', label: 'אין לי' },
};

export const DEFAULT_PROFILE = {
  name: 'Gaia', nameHe: 'גאיה',
  aunt: 'Julia', auntHe: "ג'וליה",
  auntCity: 'America', auntCityHe: 'אמריקה',
  age: 9,
  city: 'Israel', cityHe: 'ישראל',
  color: 'pink', animal: 'dog', food: 'pizza', hobby: 'draw', siblings: 'brother',
};

function pick(table, key, fallbackKey) {
  return table[key] || table[fallbackKey];
}

/** Flat map of every {placeholder} → value for a profile. */
export function profileVars(profile) {
  const p = { ...DEFAULT_PROFILE, ...profile };
  const age = pick(AGES, p.age, 9);
  const color = pick(COLORS, p.color, 'pink');
  const animal = pick(ANIMALS, p.animal, 'dog');
  const food = pick(FOODS, p.food, 'pizza');
  const hobby = pick(HOBBIES, p.hobby, 'draw');
  const sib = pick(SIBLINGS, p.siblings, 'brother');
  return {
    name: p.name, nameHe: p.nameHe,
    aunt: p.aunt, auntHe: p.auntHe,
    auntCity: p.auntCity, auntCityHe: p.auntCityHe,
    city: p.city, cityHe: p.cityHe,
    age: String(p.age), ageEn: age.en, ageTr: age.tr,
    color: p.color in COLORS ? p.color : 'pink', colorHe: color.he, colorTr: color.tr, colorEmoji: color.emoji,
    animal: p.animal in ANIMALS ? p.animal : 'dog', animalHe: animal.he, animalTr: animal.tr, animalEmoji: animal.emoji,
    food: p.food in FOODS ? p.food : 'pizza', foodHe: food.he, foodTr: food.tr, foodEmoji: food.emoji,
    hobby: p.hobby in HOBBIES ? p.hobby : 'draw', hobbyHe: hobby.he, hobbyTr: hobby.tr, hobbyEmoji: hobby.emoji,
    sibEn: sib.en, sibHe: sib.he, sibTr: sib.tr, sibEmoji: sib.emoji,
  };
}

/** Replace {key} placeholders; unknown keys are left untouched. */
export function fill(text, vars) {
  if (typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/** Return a new phrase object with all text fields filled. */
export function resolvePhrase(phrase, vars) {
  return {
    ...phrase,
    en: fill(phrase.en, vars),
    he: fill(phrase.he, vars),
    tr: fill(phrase.tr, vars),
    emoji: fill(phrase.emoji, vars),
  };
}
