// Small DOM helpers shared by all screens.
import { dayKey } from '../srs.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

export function mount(html) {
  const app = document.getElementById('app');
  app.innerHTML = html;
  window.scrollTo(0, 0);
  return app;
}

export function on(root, selector, event, handler) {
  root.querySelectorAll(selector).forEach((el) => el.addEventListener(event, (e) => handler(e, el)));
}

export function today() {
  return dayKey(new Date());
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function starsText(n, max = 3) {
  return '⭐'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
}

export function confetti(count = 70) {
  const colors = ['#e23d3d', '#1f4fa8', '#ffc23d', '#22b07d', '#ff8a3d', '#d62868'];
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    bit.style.animationDelay = `${Math.random() * 0.4}s`;
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4000);
}

export function sheet(html, onMount) {
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  back.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
  const close = () => back.remove();
  back.addEventListener('click', (e) => {
    if (e.target === back) close();
  });
  document.body.appendChild(back);
  onMount?.(back, close);
  return close;
}
