// Entry point: state, router and the shared context passed to every screen.
import { load, save } from './store.js';
import { UNITS, FINAL, findPhrase } from './content.js';
import { profileVars, resolvePhrase, fill } from './profile.js';
import { initSpeech, speak } from './speech.js';
import { setSoundEnabled } from './sfx.js';
import { renderHome } from './screens/home.js';
import { renderOnboarding } from './screens/onboarding.js';
import { renderBook } from './screens/book.js';
import { renderParent } from './screens/parent.js';
import { startLesson, startReview } from './screens/player.js';
import { startChat } from './screens/chat.js';
import { renderResults } from './screens/results.js';

let state = load();

// Units 1-4 always show the Hebrew-letter pronunciation; later it fades to tap-to-reveal.
const TR_ALWAYS_UNTIL = 4;

const ctx = {
  get state() { return state; },
  update(fn) {
    state = fn(state);
    save(state);
    setSoundEnabled(state.settings.sound);
  },
  vars() { return profileVars(state.profile); },
  fill(text) { return fill(text, this.vars()); },
  phrase(id) { return resolvePhrase(findPhrase(id), this.vars()); },
  unit(id) { return id === FINAL.id ? FINAL : UNITS.find((u) => u.id === id); },
  unitIndex(id) { return id === FINAL.id ? UNITS.length : UNITS.findIndex((u) => u.id === id); },
  showTr(unitId) {
    const mode = state.settings.trMode || 'auto';
    if (mode === 'always') return true;
    if (mode === 'never') return false;
    return this.unitIndex(unitId) < TR_ALWAYS_UNTIL;
  },
  say(text, opts = {}) {
    return speak(text, { rate: state.settings.rate * (opts.speed || 1) });
  },
  names() { return [state.profile.name, state.profile.aunt]; },
  go(screen, params = {}) {
    const routes = {
      home: () => renderHome(ctx),
      book: () => renderBook(ctx),
      parent: () => renderParent(ctx),
      onboarding: () => renderOnboarding(ctx),
      lesson: () => startLesson(ctx, params.lesson),
      review: () => startReview(ctx),
      chat: () => startChat(ctx, params.lesson),
      results: () => renderResults(ctx, params),
    };
    (routes[screen] || routes.home)();
  },
};

function boot() {
  initSpeech();
  setSoundEnabled(state.settings.sound);
  ctx.go(state.onboarded ? 'home' : 'onboarding');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW registration failed', err));
  }
}

boot();
