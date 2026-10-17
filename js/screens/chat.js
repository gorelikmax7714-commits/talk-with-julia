// Role-play chat with Julia: she talks (voice + bubble), Gaia answers by
// tapping or by speaking, then says her answer out loud.
import { completeLesson, starsFor } from '../store.js';
import { shuffle } from '../lesson.js';
import { whichSaid, isMatch } from '../match.js';
import { canListen, listen, stopSpeaking } from '../speech.js';
import { esc, mount, on, today, wait, confetti } from '../ui/dom.js';
import { juliaSvg, setTalking } from '../ui/julia.js';
import { sfx } from '../sfx.js';

const HEBREW_SHOWN_UNTIL = 3; // units before this show Julia's Hebrew translation by default
const FAST_SPEED = 1.3;

export function startChat(ctx, lesson) {
  const unit = ctx.unit(lesson.unitId);
  const { profile } = ctx.state;
  const showHe = ctx.unitIndex(lesson.unitId) < HEBREW_SHOWN_UNTIL;
  const turns = unit.dialogue.turns;
  let mistakes = 0;
  let spoken = 0;
  let closed = false;

  const root = mount(`
    <div class="chat-stage">
      <div class="chat-top">
        <div class="player-top">
          <button class="close" data-close aria-label="יציאה">✕</button>
          <div class="bar"><div style="width:0%"></div></div>
        </div>
        <div class="julia-head">${juliaSvg()}<div class="who en">${esc(profile.aunt)} 🇺🇸<small>מדברת איתך באנגלית</small></div></div>
      </div>
      <div class="messages"></div>
      <div class="answer-zone"></div>
    </div>`);
  const box = root.querySelector('.messages');
  const zone = root.querySelector('.answer-zone');
  const bar = root.querySelector('.bar > div');
  on(root, '[data-close]', 'click', () => {
    if (!confirm('לצאת מהשיחה?')) return;
    closed = true;
    stopSpeaking();
    ctx.go('home');
  });

  const scroll = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  function add(html, cls) {
    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = html;
    box.appendChild(el);
    scroll();
    return el;
  }

  async function juliaSays(text, he, { pic, fast } = {}) {
    const typing = add('•••', 'msg julia typing');
    await wait(650);
    typing.remove();
    const heHtml = showHe
      ? `<div class="he">${esc(he)}</div>`
      : `<div class="tools"><button data-show-he>🇮🇱 מה היא אמרה?</button><button data-again>🔊</button><button data-slow>🐢</button></div>`;
    const el = add(`${pic ? `<span class="pic">${pic}</span>` : ''}<span>${esc(text)}</span>${heHtml}`, 'msg julia');
    on(el, '[data-show-he]', 'click', (e, b) => {
      b.closest('.tools').insertAdjacentHTML('beforebegin', `<div class="he">${esc(he)}</div>`);
      b.remove();
    });
    on(el, '[data-again]', 'click', () => ctx.say(text));
    on(el, '[data-slow]', 'click', () => ctx.say(text, { speed: 0.7 }));
    setTalking(root, true);
    const speech = ctx.say(text, { speed: fast ? FAST_SPEED : 1 }).then(() => setTalking(root, false));
    // Show answers after a short beat instead of waiting for the voice to end.
    await Promise.race([speech, wait(1500)]);
    return el;
  }

  function revealHebrew(msgEl) {
    msgEl?.querySelector('[data-show-he]')?.click();
  }

  function sayItPrompt(phrase, bubble) {
    return new Promise((resolve) => {
      if (!canListen()) return resolve();
      zone.innerHTML = `<div class="mic-hint" style="text-align:center">עכשיו תגידי את זה בקול ל${esc(profile.auntHe)} 🎤</div>
        <button class="mic-small" data-mic>🎤 לדבר</button>
        <button class="btn ghost" data-skip>המשך בלי לדבר ←</button>`;
      on(zone, '[data-skip]', 'click', () => resolve());
      let tries = 0;
      on(zone, '[data-mic]', 'click', async (e, mic) => {
        mic.classList.add('listening');
        let alts = [];
        try { alts = await listen(); } catch { alts = []; }
        mic.classList.remove('listening');
        tries += 1;
        if (isMatch(phrase.en, alts, ctx.names()) || tries >= 2) {
          spoken += 1;
          bubble.insertAdjacentHTML('beforeend', '<span class="star-bonus">⭐</span>');
          sfx.correct();
          resolve();
        } else {
          sfx.oops();
          zone.querySelector('.mic-hint').textContent = 'כמעט! נסי עוד פעם 🙂';
        }
      });
    });
  }

  function askTurn(turn, juliaMsg) {
    return new Promise((resolve) => {
      const right = turn.answers.map((id) => ctx.phrase(id));
      const options = shuffle([...right, ...turn.distract.map((id) => ctx.phrase(id))]);
      const tr = ctx.showTr(lesson.unitId);
      let misses = 0;
      zone.innerHTML = `<div class="options">${options.map((o, i) => `
        <button class="opt en-opt" data-i="${i}"><span class="oe">${o.emoji}</span><span class="ot en">${esc(o.en)}${tr ? `<small dir="rtl">${esc(o.tr)}</small>` : ''}</span></button>`).join('')}</div>
        ${canListen() ? '<button class="mic-small" data-mic>🎤 לענות בקול</button><div class="mic-hint" style="text-align:center"></div>' : ''}`;

      const accept = async (phrase, viaVoice) => {
        zone.innerHTML = '';
        const bubble = add(`<span>${esc(phrase.en)}</span>`, 'msg me');
        sfx.correct();
        if (viaVoice) {
          spoken += 1;
          bubble.insertAdjacentHTML('beforeend', '<span class="star-bonus">⭐</span>');
        } else {
          await ctx.say(phrase.en);
          await sayItPrompt(phrase, bubble);
        }
        resolve();
      };

      const reject = (btn) => {
        mistakes += 1;
        misses += 1;
        sfx.oops();
        btn?.classList.add('wrong');
        revealHebrew(juliaMsg);
        add('Hmm? 🤔', 'msg julia');
        if (misses >= 2) {
          zone.querySelectorAll('[data-i]').forEach((b) => {
            if (right.includes(options[Number(b.dataset.i)])) b.classList.add('right');
          });
        }
      };

      on(zone, '[data-i]', 'click', (e, btn) => {
        const picked = options[Number(btn.dataset.i)];
        if (right.includes(picked)) accept(picked, false);
        else reject(btn);
      });
      on(zone, '[data-mic]', 'click', async (e, mic) => {
        const hint = zone.querySelector('.mic-hint');
        mic.classList.add('listening');
        hint.textContent = 'מקשיבה… 👂';
        let alts = [];
        try { alts = await listen(); } catch { hint.textContent = 'צריך לאשר מיקרופון. אפשר גם ללחוץ על תשובה.'; }
        mic.classList.remove('listening');
        const i = whichSaid(options.map((o) => o.en), alts, ctx.names());
        if (i < 0) {
          if (alts.length) hint.textContent = 'לא הבנתי… נסי שוב או לחצי על תשובה';
          return;
        }
        if (right.includes(options[i])) accept(options[i], true);
        else reject(zone.querySelector(`[data-i="${i}"]`));
      });
    });
  }

  async function play() {
    await wait(300);
    for (let i = 0; i < turns.length; i += 1) {
      if (closed) return;
      const t = turns[i];
      bar.style.width = `${(i / turns.length) * 100}%`;
      const msg = await juliaSays(ctx.fill(t.julia), ctx.fill(t.he), t);
      if (t.task) add(`🎯 ${esc(ctx.fill(t.task))}`, 'task');
      await askTurn(t, msg);
    }
    if (closed) return;
    bar.style.width = '100%';
    zone.innerHTML = '';
    const end = unit.dialogue.end;
    await juliaSays(ctx.fill(end.julia), ctx.fill(end.he));
    await wait(1200);
    sfx.win();
    confetti();
    await wait(1400);
    const stars = starsFor(mistakes);
    ctx.update((s) => completeLesson(s, lesson.id, { stars, today: today() }));
    ctx.go('results', { lesson, stars, spoken, chat: true });
  }

  play();
}
