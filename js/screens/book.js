// "My phrasebook": every phrase Gaia has learned, tap to hear. Handy during the visit.
import { UNITS } from '../content.js';
import { esc, mount, on } from '../ui/dom.js';
import { navHtml, bindNav } from '../ui/nav.js';

export function renderBook(ctx) {
  const { cards } = ctx.state;
  const learnedCount = Object.keys(cards).length;
  const sections = UNITS.map((u) => {
    const known = u.phrases.filter((p) => cards[p.id]).map((p) => ctx.phrase(p.id));
    const head = `<h3>${u.emoji} ${esc(ctx.fill(u.titleHe))}</h3>`;
    if (!known.length) return `<div class="book-unit">${head}<div class="book-locked">🔒 נפתח כשתגיעי ליחידה הזאת</div></div>`;
    const rows = known.map((p) => `
      <button class="book-row" data-say="${esc(p.en)}">
        <span class="be">${p.emoji}</span>
        <span class="bt"><span class="en">${esc(p.en)}</span><small>${esc(p.he)}${p.tr !== p.he ? ` · ${esc(p.tr)}` : ""}</small></span>
        <span class="play">🔊</span>
      </button>`).join('');
    return `<div class="book-unit">${head}${rows}</div>`;
  }).join('');

  const root = mount(`
    <div class="airmail-top"></div>
    <header class="topbar"><div class="hello">📒 המילון שלי<small>${learnedCount} משפטים שאת כבר יודעת · לחצי לשמוע</small></div></header>
    ${sections}
    ${navHtml('book')}`);
  bindNav(root, ctx);
  on(root, '[data-say]', 'click', (e, el) => ctx.say(el.dataset.say));
}
