// Parent area: progress at a glance, profile + settings, mic test, reset.
import { progress, totalStars, initialState, lessonList } from '../store.js';
import { dueIds, addDays } from '../srs.js';
import { AGES, COLORS, ANIMALS, FOODS, HOBBIES, SIBLINGS } from '../profile.js';
import { canListen, listen, speak } from '../speech.js';
import { esc, mount, on, today } from '../ui/dom.js';
import { navHtml, bindNav } from '../ui/nav.js';

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

function select(key, table, current, labelOf) {
  return `<select data-field="${key}">${Object.entries(table).map(([v, item]) => `
    <option value="${esc(v)}" ${String(current) === v ? 'selected' : ''}>${esc(labelOf(v, item))}</option>`).join('')}</select>`;
}

function weekHtml(log) {
  const days = new Set(log.map((l) => l.day));
  const t = today();
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(t, i - 6);
    const [y, m, d] = key.split('-').map(Number);
    const name = DAY_NAMES[new Date(y, m - 1, d).getDay()];
    return `<div><i class="${days.has(key) ? 'on' : ''}"></i>${name}</div>`;
  }).join('');
}

function text(key, label, value, ltr = false) {
  return `<div class="field"><label>${label}</label><input data-field="${key}" ${ltr ? 'dir="ltr"' : ''} value="${esc(value)}"></div>`;
}

export function renderParent(ctx) {
  const { state } = ctx;
  const p = state.profile;
  const s = state.settings;
  const prog = progress(state);
  const learned = Object.keys(state.cards).length;
  const due = dueIds(state.cards, today(), 99).length;
  const lastLesson = lessonList().filter((l) => state.lessons[l.id]?.done).at(-1);

  const root = mount(`
    <div class="airmail-top"></div>
    <header class="topbar"><div class="hello">⚙️ אזור הורים<small>מעקב והגדרות</small></div></header>
    <div class="stat-grid">
      <div class="stat"><b>${prog.done}/${prog.total}</b><span>שיעורים הושלמו</span></div>
      <div class="stat"><b>${learned}</b><span>משפטים נלמדו</span></div>
      <div class="stat"><b>🔥 ${state.streak.count}</b><span>ימים ברצף</span></div>
      <div class="stat"><b>⭐ ${totalStars(state)}</b><span>כוכבים · ${due} לחזרה</span></div>
    </div>
    <div class="card" style="margin-bottom:16px"><b>7 הימים האחרונים</b><div class="week">${weekHtml(state.log)}</div>
      <span style="color:var(--ink-soft);font-size:.9rem">${lastLesson ? `שיעור אחרון: ${esc(ctx.fill(ctx.unit(lastLesson.unitId).titleHe))}` : 'עוד לא התחילה'}</span></div>

    <div class="card" style="margin-bottom:16px">
      <b>🎤 בדיקת קול ומיקרופון</b>
      <p style="color:var(--ink-soft);font-size:.9rem;margin:6px 0 10px">${canListen() ? 'לחצו "בדיקה" ואמרו Hello.' : 'זיהוי דיבור לא נתמך בדפדפן הזה — האפליקציה תעבוד עם כפתור "אמרתי!". מומלץ Chrome באנדרואיד או Safari באייפון.'}</p>
      <div style="display:flex;gap:10px"><button class="btn" data-test-voice style="min-height:48px">🔊 קול</button>${canListen() ? '<button class="btn red" data-test-mic style="min-height:48px">🎤 בדיקה</button>' : ''}</div>
      <div class="heard" data-mic-out style="margin-top:8px"></div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <b>👧 הפרופיל</b><div style="height:10px"></div>
      ${text('nameHe', 'שם (עברית)', p.nameHe)}${text('name', 'שם (אנגלית)', p.name, true)}
      ${text('auntHe', 'שם הדודה (עברית)', p.auntHe)}${text('aunt', 'שם הדודה (אנגלית)', p.aunt, true)}
      ${text('auntCityHe', 'איפה הדודה גרה (עברית)', p.auntCityHe)}${text('auntCity', 'איפה הדודה גרה (אנגלית)', p.auntCity, true)}
      ${text('cityHe', 'העיר שלנו (עברית)', p.cityHe)}${text('city', 'העיר שלנו (אנגלית)', p.city, true)}
      <div class="field"><label>גיל</label>${select('age', AGES, p.age, (v) => v)}</div>
      <div class="field"><label>אחים</label>${select('siblings', SIBLINGS, p.siblings, (v, i) => i.label)}</div>
      <div class="field"><label>צבע אהוב</label>${select('color', COLORS, p.color, (v, i) => `${i.emoji} ${i.he}`)}</div>
      <div class="field"><label>חיה אהובה</label>${select('animal', ANIMALS, p.animal, (v, i) => `${i.emoji} ${i.he}`)}</div>
      <div class="field"><label>אוכל אהוב</label>${select('food', FOODS, p.food, (v, i) => `${i.emoji} ${i.he}`)}</div>
      <div class="field"><label>תחביב</label>${select('hobby', HOBBIES, p.hobby, (v, i) => `${i.emoji} ${i.he}`)}</div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <b>🛠️ הגדרות</b>
      <div class="field" style="margin-top:10px"><label>תאריך הנחיתה</label><input type="date" data-setting="arrival" value="${esc(s.arrival)}"></div>
      <div class="field"><label>מהירות הדיבור: <span data-rate-out>${s.rate}</span></label><input type="range" min="0.6" max="1.1" step="0.05" data-setting="rate" value="${s.rate}"></div>
      <div class="field"><label>תעתיק בעברית (איך קוראים)</label>
        <select data-setting="trMode">
          <option value="auto" ${(s.trMode || 'auto') === 'auto' ? 'selected' : ''}>אוטומטי — נעלם בהדרגה</option>
          <option value="always" ${s.trMode === 'always' ? 'selected' : ''}>תמיד להציג</option>
          <option value="never" ${s.trMode === 'never' ? 'selected' : ''}>לא להציג</option>
        </select></div>
      <label class="toggle-row">צלילים <input type="checkbox" data-setting="sound" ${s.sound ? 'checked' : ''}></label>
    </div>
    <button class="btn ghost" data-reset style="color:var(--red)">🗑️ איפוס כל ההתקדמות</button>
    ${navHtml('parent')}`);

  bindNav(root, ctx);
  on(root, '[data-field]', 'change', (e, el) => {
    const v = el.value.trim();
    if (!v) return;
    const value = el.dataset.field === 'age' ? Number(v) : v;
    ctx.update((st) => ({ ...st, profile: { ...st.profile, [el.dataset.field]: value } }));
  });
  on(root, '[data-setting]', 'change', (e, el) => {
    const key = el.dataset.setting;
    let value = el.value;
    if (key === 'sound') value = el.checked;
    if (key === 'rate') value = Number(el.value);
    if (key === 'arrival' && !value) return;
    ctx.update((st) => ({ ...st, settings: { ...st.settings, [key]: value } }));
  });
  on(root, '[data-setting="rate"]', 'input', (e, el) => {
    root.querySelector('[data-rate-out]').textContent = el.value;
  });
  on(root, '[data-test-voice]', 'click', () => speak(`Hi ${ctx.state.profile.name}! I can't wait to see you!`, { rate: ctx.state.settings.rate }));
  on(root, '[data-test-mic]', 'click', async () => {
    const out = root.querySelector('[data-mic-out]');
    out.textContent = 'מקשיבה…';
    try {
      const alts = await listen();
      out.textContent = alts.length ? `שמעתי: "${alts[0]}" ✅` : 'לא נשמע כלום — נסו שוב קרוב יותר';
    } catch {
      out.textContent = 'הגישה למיקרופון חסומה — אפשרו אותה בהגדרות הדפדפן';
    }
  });
  on(root, '[data-reset]', 'click', () => {
    if (!confirm('למחוק את כל ההתקדמות? אי אפשר לבטל.')) return;
    const fresh = initialState();
    ctx.update((st) => ({ ...fresh, profile: st.profile, settings: st.settings, onboarded: true }));
    ctx.go('home');
  });
}
