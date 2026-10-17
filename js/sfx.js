// Tiny synthesized sound effects (no audio files to download).

let ctx = null;
let enabled = true;

export function setSoundEnabled(on) {
  enabled = on;
}

function audio() {
  if (!enabled) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  correct: () => { tone(784, 0, 0.18); tone(1175, 0.1, 0.3); },
  oops: () => { tone(330, 0, 0.18, 'triangle', 0.12); tone(294, 0.12, 0.25, 'triangle', 0.1); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.35, 'triangle', 0.14)),
  stamp: () => { tone(140, 0, 0.15, 'square', 0.12); tone(90, 0.02, 0.2, 'sine', 0.2); },
};
