// Curriculum: 8 units + a final mission, each built around real things
// Gaia will say to Julia. Strings use {placeholders} filled from the profile
// (see profile.js). tr = Hebrew-letter transliteration for a weak reader.

export const UNITS = [
  {
    id: 'u1', emoji: '👋', color: '#E63946',
    titleEn: 'Hello!', titleHe: 'שלום, נעים להכיר',
    phrases: [
      { id: 'u1p1', en: 'Hi, {aunt}!', he: 'היי, {auntHe}!', tr: 'היי, {auntHe}!', emoji: '👋' },
      { id: 'u1p2', en: 'My name is {name}.', he: 'קוראים לי {nameHe}.', tr: 'מאי ניים איז {nameHe}', emoji: '😊' },
      { id: 'u1p3', en: 'Nice to meet you!', he: 'נעים להכיר!', tr: 'נייס טו מיט יו!', emoji: '🤝' },
      { id: 'u1p4', en: 'How are you?', he: 'מה שלומך?', tr: 'האו אר יו?', emoji: '🙂' },
      { id: 'u1p5', en: "I'm good, thank you!", he: 'אני בסדר, תודה!', tr: "איים גוד, ת'נק יו!", emoji: '👍' },
      { id: 'u1p6', en: 'Me too!', he: 'גם אני!', tr: 'מי טו!', emoji: '🙌' },
    ],
    dialogue: {
      turns: [
        { julia: "Hi! I'm {aunt}! What's your name?", he: 'היי! אני {auntHe}! איך קוראים לך?', answers: ['u1p2'], distract: ['u1p4'] },
        { julia: "I'm so happy to meet you, {name}!", he: 'אני כל כך שמחה להכיר אותך, {nameHe}!', answers: ['u1p3'], distract: ['u1p5'] },
        { julia: 'How are you?', he: 'מה שלומך?', answers: ['u1p5'], distract: ['u1p2'] },
        { julia: "I'm good too! I'm so happy to be here!", he: 'גם אני בסדר! אני כל כך שמחה להיות פה!', answers: ['u1p6'], distract: ['u1p4'] },
      ],
      end: { julia: 'Come here, give me a hug!', he: 'בואי, תני לי חיבוק!' },
    },
  },
  {
    id: 'u2', emoji: '🛟', color: '#2A9D8F',
    titleEn: 'Help words', titleHe: 'מילות הצלה',
    phrases: [
      { id: 'u2p1', en: "I don't understand.", he: 'אני לא מבינה.', tr: 'איי דונט אנדרסטנד', emoji: '🤔' },
      { id: 'u2p2', en: 'Can you say it again, please?', he: 'את יכולה להגיד שוב, בבקשה?', tr: 'קן יו סיי איט אגיין, פליז?', emoji: '🔁' },
      { id: 'u2p3', en: 'Slowly, please.', he: 'לאט, בבקשה.', tr: 'סלואו-לי, פליז', emoji: '🐢' },
      { id: 'u2p4', en: 'I speak a little English.', he: 'אני מדברת קצת אנגלית.', tr: 'איי ספיק א ליטל אינגליש', emoji: '🤏' },
      { id: 'u2p5', en: 'Yes, please!', he: 'כן, בבקשה!', tr: 'יס, פליז!', emoji: '✅' },
      { id: 'u2p6', en: 'Can I have water, please?', he: 'אפשר מים, בבקשה?', tr: 'קן איי הב ווטר, פליז?', emoji: '💧' },
      { id: 'u2p7', en: 'Thank you very much!', he: 'תודה רבה!', tr: "ת'נק יו ורי מאץ'!", emoji: '🙏' },
    ],
    dialogue: {
      turns: [
        { julia: 'Would you like to go to the beach with me tomorrow afternoon?', fast: true, he: 'את רוצה ללכת איתי לים מחר אחר הצהריים?', answers: ['u2p2', 'u2p3', 'u2p1'], distract: ['u2p7'] },
        { julia: 'Sorry! Do you... want... to go... to the beach?', he: 'סליחה! את... רוצה... ללכת... לים?', answers: ['u2p5'], distract: ['u2p6'] },
        { julia: 'Great! It is very hot today. Are you thirsty?', he: 'מעולה! חם מאוד היום. את צמאה?', answers: ['u2p6'], distract: ['u2p1'] },
        { julia: 'Here you go!', he: 'הנה, בבקשה!', pic: '💧', answers: ['u2p7'], distract: ['u2p3'] },
      ],
      end: { julia: "You're welcome, sweetie!", he: 'בכיף, מתוקה!' },
    },
  },
  {
    id: 'u3', emoji: '🙋‍♀️', color: '#F4A261',
    titleEn: 'All about me', titleHe: 'הכל עליי',
    phrases: [
      { id: 'u3p1', en: 'I am {ageEn} years old.', he: 'אני בת {age}.', tr: 'איי אם {ageTr} ירז אולד', emoji: '🎂' },
      { id: 'u3p2', en: "I'm in {gradeEn} grade.", he: 'אני בכיתה {gradeHe}.', tr: 'איים אין {gradeTr} גרייד', emoji: '🎒' },
      { id: 'u3p3', en: 'I live in {city}.', he: 'אני גרה ב{cityHe}.', tr: 'איי ליב אין {cityHe}', emoji: '🏠' },
      { id: 'u3p4', en: 'I speak Hebrew.', he: 'אני מדברת עברית.', tr: 'איי ספיק היברו', emoji: '🗣️' },
      { id: 'u3p5', en: "I'm learning English.", he: 'אני לומדת אנגלית.', tr: 'איים לרנינג אינגליש', emoji: '📚' },
      { id: 'u3p6', en: 'I like to {hobby}.', he: 'אני אוהבת {hobbyHe}.', tr: 'איי לייק טו {hobbyTr}', emoji: '{hobbyEmoji}' },
    ],
    dialogue: {
      turns: [
        { julia: 'How old are you, {name}?', he: 'בת כמה את, {nameHe}?', answers: ['u3p1'], distract: ['u3p2'] },
        { julia: "Wow, you're so big! What grade are you in?", he: 'וואו, את כבר גדולה! באיזו כיתה את?', answers: ['u3p2'], distract: ['u3p3'] },
        { julia: 'Where do you live?', he: 'איפה את גרה?', answers: ['u3p3'], distract: ['u3p1'] },
        { julia: 'Your English is very good!', he: 'האנגלית שלך ממש טובה!', answers: ['u3p5', 'u2p7'], distract: ['u3p6'] },
        { julia: 'What do you like to do?', he: 'מה את אוהבת לעשות?', answers: ['u3p6'], distract: ['u3p4'] },
      ],
      end: { julia: "That's so cool!", he: 'זה ממש מגניב!' },
    },
  },
  {
    id: 'u4', emoji: '👨‍👩‍👧', color: '#457B9D',
    titleEn: 'My family', titleHe: 'המשפחה שלי',
    phrases: [
      { id: 'u4p1', en: 'This is my mom.', he: 'זאת אמא שלי.', tr: 'דיס איז מאי מאם', emoji: '👩' },
      { id: 'u4p2', en: 'This is my dad.', he: 'זה אבא שלי.', tr: 'דיס איז מאי דאד', emoji: '👨' },
      { id: 'u4p3', en: '{sibEn}', he: '{sibHe}', tr: '{sibTr}', emoji: '{sibEmoji}' },
      { id: 'u4p4', en: 'This is my grandma.', he: 'זאת סבתא שלי.', tr: 'דיס איז מאי גרנדמה', emoji: '👵' },
      { id: 'u4p5', en: 'Come with me!', he: 'בואי איתי!', tr: "קאם וויד' מי!", emoji: '🏃‍♀️' },
      { id: 'u4p6', en: 'Look!', he: 'תסתכלי!', tr: 'לוק!', emoji: '👀' },
    ],
    dialogue: {
      turns: [
        { julia: 'Who is this?', he: 'מי זאת?', pic: '👩', answers: ['u4p1'], distract: ['u4p2'] },
        { julia: 'And who is this?', he: 'ומי זה?', pic: '👨', answers: ['u4p2'], distract: ['u4p4'] },
        { julia: 'Do you have brothers or sisters?', he: 'יש לך אחים או אחיות?', answers: ['u4p3'], distract: ['u4p6'] },
        { julia: 'I want to see your room!', he: 'אני רוצה לראות את החדר שלך!', answers: ['u4p5'], distract: ['u4p1'] },
        { julia: 'What do you want to show me?', he: 'מה את רוצה להראות לי?', answers: ['u4p6'], distract: ['u4p2'] },
      ],
      end: { julia: "Wow! It's beautiful!", he: 'וואו! זה יפהפה!' },
    },
  },
  {
    id: 'u5', emoji: '❤️', color: '#D62868',
    titleEn: 'I like…', titleHe: 'מה אני אוהבת',
    phrases: [
      { id: 'u5p1', en: 'I like {food}.', he: 'אני אוהבת {foodHe}.', tr: 'איי לייק {foodTr}', emoji: '{foodEmoji}' },
      { id: 'u5p2', en: 'My favorite color is {color}.', he: 'הצבע האהוב עליי הוא {colorHe}.', tr: 'מאי פייבוריט קאלר איז {colorTr}', emoji: '{colorEmoji}' },
      { id: 'u5p3', en: 'My favorite animal is the {animal}.', he: 'החיה האהובה עליי היא {animalHe}.', tr: 'מאי פייבוריט אנימל איז דה {animalTr}', emoji: '{animalEmoji}' },
      { id: 'u5p4', en: 'Yes, I do!', he: 'כן, אני אוהבת!', tr: 'יס, איי דו!', emoji: '👍' },
      { id: 'u5p5', en: "No, I don't.", he: 'לא, אני לא אוהבת.', tr: 'נו, איי דונט', emoji: '👎' },
      { id: 'u5p6', en: 'Do you like {food}?', he: 'את אוהבת {foodHe}?', tr: 'דו יו לייק {foodTr}?', emoji: '❓' },
    ],
    dialogue: {
      turns: [
        { julia: 'What food do you like?', he: 'איזה אוכל את אוהבת?', answers: ['u5p1'], distract: ['u5p2'] },
        { julia: 'Yummy! Do you like chocolate?', he: 'יאמי! את אוהבת שוקולד?', pic: '🍫', answers: ['u5p4', 'u5p5'], distract: ['u5p3'] },
        { julia: "What's your favorite color?", he: 'מה הצבע האהוב עלייך?', answers: ['u5p2'], distract: ['u5p1'] },
        { julia: 'And your favorite animal?', he: 'והחיה האהובה עלייך?', answers: ['u5p3'], distract: ['u5p5'] },
        { julia: 'Now you ask me something!', he: 'עכשיו את תשאלי אותי משהו!', answers: ['u5p6'], distract: ['u5p4'] },
      ],
      end: { julia: 'Yes, I do! I love it!', he: 'כן! אני מתה על זה!' },
    },
  },
  {
    id: 'u6', emoji: '😊', color: '#E9A400',
    titleEn: 'How I feel', titleHe: 'איך אני מרגישה',
    phrases: [
      { id: 'u6p1', en: "I'm happy!", he: 'אני שמחה!', tr: 'איים האפי!', emoji: '😄' },
      { id: 'u6p2', en: "I'm hungry.", he: 'אני רעבה.', tr: 'איים האנגרי', emoji: '🍽️' },
      { id: 'u6p3', en: "I'm tired.", he: 'אני עייפה.', tr: 'איים טאיירד', emoji: '😴' },
      { id: 'u6p4', en: "I'm cold.", he: 'קר לי.', tr: 'איים קולד', emoji: '🥶' },
      { id: 'u6p5', en: "I'm so happy you're here!", he: 'אני כל כך שמחה שאת פה!', tr: 'איים סו האפי יור היר!', emoji: '🥰' },
      { id: 'u6p6', en: 'I love you!', he: 'אני אוהבת אותך!', tr: 'איי לאב יו!', emoji: '❤️' },
      { id: 'u6p7', en: 'Yes, I am!', he: 'כן, אני כן!', tr: 'יס, איי אם!', emoji: '👍' },
      { id: 'u6p8', en: "No, I'm not.", he: 'לא, אני לא.', tr: 'נו, איים נוט', emoji: '👎' },
    ],
    dialogue: {
      turns: [
        { julia: 'How do you feel today?', he: 'איך את מרגישה היום?', answers: ['u6p1'], distract: ['u6p3'] },
        { julia: "It's lunch time! Are you hungry?", he: 'זמן ארוחת צהריים! את רעבה?', answers: ['u6p2', 'u6p7'], distract: ['u6p4'] },
        { julia: "It's very late. Are you tired?", he: 'כבר מאוחר מאוד. את עייפה?', answers: ['u6p3', 'u6p7', 'u6p8'], distract: ['u6p2'] },
        { julia: "I'm so happy to be with you!", he: 'אני כל כך שמחה להיות איתך!', answers: ['u6p5', 'u6p6'], distract: ['u6p4'] },
      ],
      end: { julia: "I love you, sweetie! I'm so happy too!", he: 'אני אוהבת אותך, מתוקה! גם אני כל כך שמחה!' },
    },
  },
  {
    id: 'u7', emoji: '❓', color: '#6A4C93',
    titleEn: 'Ask Julia', titleHe: 'שאלות ל{auntHe}',
    phrases: [
      { id: 'u7p1', en: 'How was your flight?', he: 'איך הייתה הטיסה?', tr: 'האו וואז יור פלייט?', emoji: '✈️' },
      { id: 'u7p2', en: 'Where do you live?', he: 'איפה את גרה?', tr: 'וור דו יו ליב?', emoji: '🗺️' },
      { id: 'u7p3', en: 'Do you have a pet?', he: 'יש לך חיית מחמד?', tr: 'דו יו הב א פט?', emoji: '🐶' },
      { id: 'u7p4', en: 'Do you like Israel?', he: 'את אוהבת את ישראל?', tr: 'דו יו לייק איזראל?', emoji: '🇮🇱' },
      { id: 'u7p5', en: 'What is your favorite food?', he: 'מה האוכל האהוב עלייך?', tr: 'וואט איז יור פייבוריט פוד?', emoji: '🍕' },
      { id: 'u7p6', en: 'What do you like to do?', he: 'מה את אוהבת לעשות?', tr: 'וואט דו יו לייק טו דו?', emoji: '🎯' },
    ],
    dialogue: {
      turns: [
        { julia: 'Hi! You can ask me anything!', he: 'היי! את יכולה לשאול אותי כל דבר!', task: 'תשאלי איך הייתה הטיסה', answers: ['u7p1'], distract: ['u7p2'] },
        { julia: "It was long, but now I'm here with you!", he: 'היא הייתה ארוכה, אבל עכשיו אני פה איתך!', task: 'תשאלי איפה היא גרה', answers: ['u7p2'], distract: ['u7p6'] },
        { julia: 'I live in {auntCity}. It is very cold there now!', he: 'אני גרה ב{auntCityHe}. קר שם מאוד עכשיו!', task: 'תשאלי אם יש לה חיית מחמד', answers: ['u7p3'], distract: ['u7p4'] },
        { julia: 'Hmm, guess! I love animals!', he: 'הממ, תנחשי! אני אוהבת חיות!', task: 'תשאלי אם היא אוהבת את ישראל', answers: ['u7p4'], distract: ['u7p5'] },
        { julia: 'Yes! I love Israel! It is beautiful.', he: 'כן! אני אוהבת את ישראל! היא יפהפייה.', task: 'תשאלי מה האוכל האהוב עליה', answers: ['u7p5'], distract: ['u7p1'] },
      ],
      end: { julia: 'I love hummus! Can we eat hummus together?', he: 'אני מתה על חומוס! נאכל חומוס ביחד?' },
    },
  },
  {
    id: 'u8', emoji: '🎁', color: '#1D7874',
    titleEn: 'Together!', titleHe: 'ביחד!',
    phrases: [
      { id: 'u8p1', en: 'Good morning!', he: 'בוקר טוב!', tr: 'גוד מורנינג!', emoji: '☀️' },
      { id: 'u8p2', en: 'Thank you for the present!', he: 'תודה על המתנה!', tr: "ת'נק יו פור דה פרזנט!", emoji: '🎁' },
      { id: 'u8p3', en: "Let's play!", he: 'בואי נשחק!', tr: 'לטס פליי!', emoji: '🎲' },
      { id: 'u8p4', en: 'Do you want to play with me?', he: 'את רוצה לשחק איתי?', tr: "דו יו וונט טו פליי וויד' מי?", emoji: '🧸' },
      { id: 'u8p5', en: 'Good night!', he: 'לילה טוב!', tr: 'גוד נייט!', emoji: '🌙' },
      { id: 'u8p6', en: 'See you soon!', he: 'נתראה בקרוב!', tr: 'סי יו סון!', emoji: '💌' },
    ],
    dialogue: {
      turns: [
        { julia: 'Good morning, {name}!', he: 'בוקר טוב, {nameHe}!', answers: ['u8p1'], distract: ['u8p5'] },
        { julia: 'I have something for you!', he: 'יש לי משהו בשבילך!', pic: '🎁', answers: ['u8p2'], distract: ['u8p3'] },
        { julia: 'What do you want to do today?', he: 'מה את רוצה לעשות היום?', answers: ['u8p3', 'u8p4'], distract: ['u8p6'] },
        { julia: "It's late. Time to sleep!", he: 'מאוחר. זמן לישון!', answers: ['u8p5'], distract: ['u8p1'] },
      ],
      end: { julia: 'Good night, sweetie! Sweet dreams!', he: 'לילה טוב, מתוקה! חלומות פז!' },
    },
  },
];

// The rehearsal for the real day: everything together, at the airport.
export const FINAL = {
  id: 'final', emoji: '🛬', color: '#E63946',
  titleEn: 'The big day!', titleHe: 'היום הגדול: {auntHe} נוחתת!',
  dialogue: {
    turns: [
      { julia: '{name}! Is that you?', he: '{nameHe}! זאת את?', pic: '🛬', answers: ['u1p1'], distract: ['u8p5'] },
      { julia: 'Oh my, you are so big! How are you?', he: 'וואו, כמה גדלת! מה שלומך?', answers: ['u1p5', 'u6p1'], distract: ['u7p2'] },
      { julia: "I'm great! I'm so happy to see you!", he: 'אני מעולה! אני כל כך שמחה לראות אותך!', answers: ['u6p5', 'u1p6', 'u6p6'], distract: ['u2p1'] },
      { julia: 'Ask me something!', he: 'תשאלי אותי משהו!', task: 'תשאלי איך הייתה הטיסה', answers: ['u7p1'], distract: ['u3p4'] },
      { julia: 'It was very, very long! I am tired and hungry.', fast: true, he: 'היא הייתה ממש ממש ארוכה! אני עייפה ורעבה.', answers: ['u2p2', 'u2p3', 'u2p1'], distract: ['u8p1'] },
      { julia: 'I am tired... and hungry!', he: 'אני עייפה... ורעבה!', answers: ['u6p2', 'u1p6'], distract: ['u8p3'] },
      { julia: 'Your English is amazing!', he: 'האנגלית שלך מדהימה!', answers: ['u3p5', 'u2p7'], distract: ['u4p6'] },
      { julia: 'I have a present for you!', he: 'יש לי מתנה בשבילך!', pic: '🎁', answers: ['u8p2'], distract: ['u5p5'] },
      { julia: 'What do you want to do at home?', he: 'מה את רוצה לעשות בבית?', answers: ['u8p4', 'u8p3'], distract: ['u7p3'] },
    ],
    end: { julia: "Let's go home! I love you, {name}!", he: 'בואי נלך הביתה! אני אוהבת אותך, {nameHe}!' },
  },
};

export function allPhrases() {
  return UNITS.flatMap((u) => u.phrases);
}

export function findPhrase(id) {
  return allPhrases().find((p) => p.id === id);
}
