// First-run setup: Gaia picks her real answers so every lesson is about HER.
import { AGES, COLORS, ANIMALS, FOODS, HOBBIES, SIBLINGS } from '../profile.js';
import { esc, mount, on, confetti } from '../ui/dom.js';
import { juliaSvg } from '../ui/julia.js';
import { sfx } from '../sfx.js';

function grid(key, table, current, labelOf) {
  return `<div class="choice-grid">${Object.entries(table).map(([value, item]) => `
    <button class="choice ${String(current) === value ? 'on' : ''}" data-pick="${key}" data-value="${esc(value)}">
      <span class="ce">${item.emoji || '🎂'}</span>${esc(labelOf(value, item))}
    </button>`).join('')}</div>`;
}

const STEPS = [
  {
    render: (p) => `${juliaSvg()}<h1>היי ${esc(p.nameHe)}!</h1>
      <p>${esc(p.auntHe)} מגיעה מאמריקה ב־18.12 ✈️<br>בואי נתאמן כדי שתוכלי לדבר איתה באנגלית!</p>
      <p style="font-size:.95rem">כל יום שיעור קצר — 10 דקות. מקשיבים, מדברים, ומשחקים.</p>`,
    cta: 'יאללה, מתחילים!',
  },
  {
    render: (p) => `<h1>איך קוראים לך? 😊</h1><p>זה ייכנס לשיחות עם ${esc(p.auntHe)}</p>
      <div class="field"><label>השם שלי בעברית</label><input data-field="nameHe" value="${esc(p.nameHe)}"></div>
      <div class="field"><label>השם שלי באנגלית</label><input data-field="name" dir="ltr" value="${esc(p.name)}"><span class="hint">אפשר לבקש עזרה מאבא או אמא</span></div>`,
  },
  {
    render: (p) => `<h1>בת כמה את? 🎂</h1>
      ${grid('age', AGES, p.age, (v) => v)}
      <div class="field"><label>איפה את גרה? (עברית)</label><input data-field="cityHe" value="${esc(p.cityHe)}"></div>
      <div class="field"><label>ובאנגלית</label><input data-field="city" dir="ltr" value="${esc(p.city)}"><span class="hint">למשל: Haifa, Tel Aviv, Israel</span></div>`,
  },
  {
    render: (p) => `<h1>יש לך אחים או אחיות? 👧👦</h1>${grid('siblings', SIBLINGS, p.siblings, (v, i) => i.label)}`,
  },
  { render: (p) => `<h1>הצבע האהוב עלייך? 🎨</h1>${grid('color', COLORS, p.color, (v, i) => i.he)}` },
  { render: (p) => `<h1>החיה האהובה עלייך? 🐾</h1>${grid('animal', ANIMALS, p.animal, (v, i) => i.he.replace(/^ה/, ''))}` },
  { render: (p) => `<h1>מה את הכי אוהבת לאכול? 😋</h1>${grid('food', FOODS, p.food, (v, i) => i.he)}` },
  { render: (p) => `<h1>מה את אוהבת לעשות? ⭐</h1>${grid('hobby', HOBBIES, p.hobby, (v, i) => i.he)}` },
  {
    render: (p) => `<div style="font-size:5rem;margin-top:20px">🛂</div><h1>הדרכון שלך מוכן!</h1>
      <p>8 תחנות בדרך ל${esc(p.auntHe)}. בכל תחנה מקבלים חותמת.<br>בסוף — חזרה גדולה על היום שהיא נוחתת!</p>`,
    cta: 'לדרך! ✈️',
  },
];

export function renderOnboarding(ctx, idx = 0) {
  const step = STEPS[idx];
  const p = ctx.state.profile;
  const dots = STEPS.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('');
  const root = mount(`
    <div class="airmail-top"></div>
    <div class="ob enter">
      <div class="ob-dots">${dots}</div>
      <div>${step.render(p)}</div>
      <button class="btn red" data-go>${step.cta || 'הבא ←'}</button>
      ${idx > 0 ? '<button class="btn ghost" data-back>→ חזרה</button>' : ''}
    </div>`);

  const saveFields = () => {
    const updates = {};
    root.querySelectorAll('[data-field]').forEach((input) => {
      const v = input.value.trim();
      if (v) updates[input.dataset.field] = v;
    });
    ctx.update((s) => ({ ...s, profile: { ...s.profile, ...updates } }));
  };

  on(root, '[data-pick]', 'click', (e, el) => {
    sfx.tap();
    const key = el.dataset.pick;
    const value = key === 'age' ? Number(el.dataset.value) : el.dataset.value;
    root.querySelectorAll(`[data-pick="${key}"]`).forEach((b) => b.classList.toggle('on', b === el));
    ctx.update((s) => ({ ...s, profile: { ...s.profile, [key]: value } }));
  });
  on(root, '[data-go]', 'click', () => {
    saveFields();
    sfx.tap();
    if (idx === STEPS.length - 1) {
      ctx.update((s) => ({ ...s, onboarded: true }));
      confetti();
      ctx.go('home');
      return;
    }
    renderOnboarding(ctx, idx + 1);
  });
  on(root, '[data-back]', 'click', () => {
    saveFields();
    renderOnboarding(ctx, idx - 1);
  });
}
