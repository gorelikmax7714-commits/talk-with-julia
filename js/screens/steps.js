// Renderers for each lesson step type. Each gets (el, step, api) where api =
// { ctx, unitId, correct(), wrong(), next() } provided by the player.
import { esc, on, wait } from '../ui/dom.js';
import { canListen, listen, speakHebrew, hasHebrewVoice } from '../speech.js';
import { isMatch } from '../match.js';
import { buildIsCorrect } from '../lesson.js';
import { sfx } from '../sfx.js';

const MAX_SAY_TRIES = 2;

function prompt(text) {
  const btn = hasHebrewVoice() ? `<button class="say-he" data-he="${esc(text)}" aria-label="הקראה">🔈</button>` : '';
  return `<div class="prompt">${btn}<span>${esc(text)}</span></div>`;
}

function trLine(api, p) {
  if (api.ctx.showTr(api.unitId)) return `<div class="phrase-tr">${esc(p.tr)}</div>`;
  return `<button class="tr-reveal" data-tr="${esc(p.tr)}">👀 איך קוראים את זה?</button>`;
}

function bindCommon(el, api, p) {
  on(el, '[data-he]', 'click', (e, b) => speakHebrew(b.dataset.he));
  on(el, '[data-play]', 'click', (e, b) => api.ctx.say(p.en, { speed: b.dataset.play === 'slow' ? 0.7 : 1 }));
  on(el, '[data-tr]', 'click', (e, b) => {
    b.outerHTML = `<div class="phrase-tr">${esc(b.dataset.tr)}</div>`;
  });
}

const audioRow = `<div class="audio-row"><button class="audio-btn" data-play="normal" aria-label="השמעה">🔊</button><button class="audio-btn slow" data-play="slow" aria-label="לאט">🐢</button></div>`;

function intro(el, step, api) {
  const p = step.phrase;
  el.innerHTML = `
    ${prompt('משפט חדש! תקשיבי:')}
    <div class="card phrase-card">
      <span class="big-emoji">${p.emoji}</span>
      <div class="phrase-en en">${esc(p.en)}</div>
      ${trLine(api, p)}
      ${p.he !== p.tr ? `<div class="phrase-he">${esc(p.he)}</div>` : ""}
      ${audioRow}
    </div>
    <div style="height:18px"></div>
    <button class="btn" data-next>הבנתי! ממשיכים ←</button>`;
  bindCommon(el, api, p);
  on(el, '[data-next]', 'click', () => api.next());
  wait(350).then(() => api.ctx.say(p.en));
}

function say(el, step, api) {
  const p = step.phrase;
  const micOk = canListen();
  let tries = 0;
  el.innerHTML = `
    ${prompt('עכשיו את! תגידי בקול:')}
    <div class="card phrase-card">
      <span class="big-emoji">${p.emoji}</span>
      <div class="phrase-en en">${esc(p.en)}</div>
      ${trLine(api, p)}
      ${audioRow}
    </div>
    <div class="mic-wrap">
      ${micOk ? '<button class="mic" data-mic aria-label="מיקרופון">🎤</button>' : ''}
      <div class="mic-hint">${micOk ? 'לחצי על המיקרופון ודברי' : 'תגידי את המשפט בקול רם, ואז לחצי:'}</div>
      <div class="heard"></div>
      <button class="btn ${micOk ? 'ghost' : 'mint'}" data-self>${micOk ? 'אין לי מיקרופון עכשיו — דלגי' : '✅ אמרתי!'}</button>
    </div>`;
  bindCommon(el, api, p);
  const hint = el.querySelector('.mic-hint');
  const heard = el.querySelector('.heard');
  on(el, '[data-self]', 'click', (e, b) => (b.classList.contains('ghost') ? api.next() : api.correct()));
  on(el, '[data-mic]', 'click', async (e, mic) => {
    if (mic.classList.contains('listening')) return;
    mic.classList.add('listening');
    hint.textContent = 'מקשיבה… 👂';
    let alts = [];
    try {
      alts = await listen();
    } catch (err) {
      if (!el.isConnected) return;
      mic.classList.remove('listening');
      hint.textContent = 'צריך לאשר מיקרופון בדפדפן. בינתיים: תגידי בקול ולחצי "אמרתי!"';
      el.querySelector('[data-self]').textContent = '✅ אמרתי!';
      el.querySelector('[data-self]').className = 'btn mint';
      return;
    }
    if (!el.isConnected) return; // step already left (skipped / closed)
    mic.classList.remove('listening');
    heard.textContent = alts[0] ? `שמעתי: "${alts[0]}"` : '';
    if (isMatch(p.en, alts, api.ctx.names())) {
      api.correct();
      return;
    }
    tries += 1;
    if (tries >= MAX_SAY_TRIES) {
      api.correct({ title: 'ניסיון מעולה! 💪', sub: 'Great try!' });
      return;
    }
    sfx.oops();
    hint.textContent = alts.length ? 'כמעט! תקשיבי שוב ונסי עוד פעם 🙂' : 'לא שמעתי… קרבי את הטלפון ונסי שוב';
    api.ctx.say(p.en, { speed: 0.8 });
  });
  wait(300).then(() => api.ctx.say(p.en));
}

function choice(el, step, api, mode) {
  const p = step.phrase;
  const isListen = mode === 'listen';
  const head = isListen
    ? `${prompt(`מה ${api.ctx.state.profile.auntHe} אמרה?`)}<button class="audio-btn big" data-play="normal">🔊</button>
       <div style="text-align:center"><button class="audio-btn slow" data-play="slow" style="width:52px;height:52px;font-size:1.3rem">🐢</button></div>`
    : `${prompt('איך אומרים את זה באנגלית?')}<div class="card phrase-card"><span class="big-emoji">${p.emoji}</span><div class="phrase-en" style="font-size:1.5rem">${esc(p.he)}</div></div>`;
  const opts = step.options.map((o) => (isListen
    ? `<button class="opt" data-opt="${o.id}"><span class="oe">${o.emoji}</span><span class="ot">${esc(o.he)}</span></button>`
    : `<button class="opt en-opt" data-opt="${o.id}"><span class="ot en">${esc(o.en)}</span></button>`)).join('');
  el.innerHTML = `${head}<div class="options">${opts}</div>`;
  bindCommon(el, api, p);
  let answered = false;
  on(el, '[data-opt]', 'click', (e, btn) => {
    if (answered) return;
    answered = true;
    const right = btn.dataset.opt === p.id;
    el.querySelectorAll('[data-opt]').forEach((b) => {
      if (b.dataset.opt === p.id) b.classList.add('right');
      else if (b !== btn) b.classList.add('dim');
    });
    if (right) api.correct({ speak: !isListen });
    else {
      btn.classList.add('wrong');
      api.wrong();
    }
  });
  if (isListen) wait(350).then(() => api.ctx.say(p.en));
}

function build(el, step, api) {
  const p = step.phrase;
  let chosen = [];
  let misses = 0;
  el.innerHTML = `
    ${prompt('סדרי את המילים:')}
    <div class="card phrase-card" style="padding:14px"><span class="big-emoji" style="font-size:2.6rem">${p.emoji}</span><div class="phrase-he" style="font-size:1.25rem;color:var(--ink)">${esc(p.he)}</div></div>
    <div class="build-answer"></div>
    <div class="tiles">${step.tiles.map((w, i) => `<button class="tile" data-tile="${i}">${esc(w)}</button>`).join('')}</div>`;
  const answer = el.querySelector('.build-answer');
  const renderAnswer = () => {
    answer.innerHTML = chosen.map((i, pos) => `<button class="tile placed" data-pos="${pos}">${esc(step.tiles[i])}</button>`).join('');
    el.querySelectorAll('[data-tile]').forEach((t) => t.classList.toggle('used', chosen.includes(Number(t.dataset.tile))));
    answer.querySelectorAll('[data-pos]').forEach((t) => t.addEventListener('click', () => {
      chosen = chosen.filter((_, pos) => pos !== Number(t.dataset.pos));
      renderAnswer();
    }));
  };
  const check = () => {
    const words = chosen.map((i) => step.tiles[i]);
    if (buildIsCorrect(p, words)) {
      api.correct({ speak: true });
      return;
    }
    misses += 1;
    answer.classList.add('wrong');
    sfx.oops();
    setTimeout(() => {
      answer.classList.remove('wrong');
      if (misses >= 2) api.wrong();
      else {
        chosen = [];
        renderAnswer();
      }
    }, 450);
  };
  on(el, '[data-tile]', 'click', (e, t) => {
    const i = Number(t.dataset.tile);
    if (chosen.includes(i)) return;
    sfx.tap();
    chosen = [...chosen, i];
    renderAnswer();
    if (chosen.length === step.tiles.length) check();
  });
}

export function renderStep(el, step, api) {
  const renderers = {
    intro,
    say,
    listen: (e, s, a) => choice(e, s, a, 'listen'),
    meaning: (e, s, a) => choice(e, s, a, 'meaning'),
    build,
  };
  renderers[step.type](el, step, api);
}
