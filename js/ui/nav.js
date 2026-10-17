import { on } from './dom.js';

const TABS = [
  { id: 'home', icon: '🗺️', label: 'המסע' },
  { id: 'book', icon: '📒', label: 'המילון שלי' },
  { id: 'parent', icon: '⚙️', label: 'הורים' },
];

export function navHtml(active) {
  return `<nav class="nav">${TABS.map((t) => `
    <button data-tab="${t.id}" class="${t.id === active ? 'active' : ''}"><span>${t.icon}</span>${t.label}</button>`).join('')}
  </nav>`;
}

export function bindNav(root, ctx) {
  on(root, '[data-tab]', 'click', (e, el) => ctx.go(el.dataset.tab));
}

/** Open a lesson in the right player. */
export function openLesson(ctx, lesson) {
  ctx.go(lesson.kind === 'chat' ? 'chat' : 'lesson', { lesson });
}
