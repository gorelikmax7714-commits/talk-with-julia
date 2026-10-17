// Text-to-speech (Julia's voice) and speech recognition, with safe fallbacks.

const PREFERRED = ['Samantha', 'Google US English', 'Ava', 'Allison', 'Zira', 'Jenny', 'Aria'];
const LISTEN_TIMEOUT_MS = 7000;
const START_TIMEOUT_MS = 20000; // covers the first-time permission prompt

let voices = [];
let enVoice = null;
let heVoice = null;

function pickVoices() {
  voices = window.speechSynthesis?.getVoices() || [];
  const us = voices.filter((v) => /^en[-_]US/i.test(v.lang));
  const en = us.length ? us : voices.filter((v) => /^en/i.test(v.lang));
  const enhanced = en.find((v) => /enhanced|premium|natural/i.test(v.name));
  const preferred = PREFERRED.map((n) => en.find((v) => v.name.includes(n))).find(Boolean);
  enVoice = enhanced || preferred || en[0] || null;
  heVoice = voices.find((v) => /^he|^iw/i.test(v.lang)) || null;
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  pickVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoices);
}

/** iOS only lets audio start inside a tap: speak silence on the first one. */
export function unlockAudioOnFirstTap() {
  const unlock = () => {
    if (canSpeak()) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
    window.removeEventListener('pointerdown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
}

export function canSpeak() {
  return 'speechSynthesis' in window;
}

/** Speak English. Resolves when finished (or after a safety timeout). */
export function speak(text, { rate = 0.85, lang = 'en-US' } = {}) {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voice = lang.startsWith('he') ? heVoice : enVoice;
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = lang.startsWith('en') ? 1.1 : 1;
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, 1500 + (text.length * 90) / rate);
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

export function speakHebrew(text) {
  if (!heVoice) return Promise.resolve();
  return speak(text, { rate: 1, lang: 'he-IL' });
}

export function hasHebrewVoice() {
  return Boolean(heVoice);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

const Recognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

let micDenied = false;
let activeFinish = null;

export function canListen() {
  return Boolean(Recognition) && window.isSecureContext !== false && !micDenied;
}

/** Stop any recognition in progress; its listen() promise resolves to []. */
export function cancelListen() {
  activeFinish?.([]);
}

/**
 * Listen for one utterance. Resolves to an array of transcript alternatives
 * ([] on silence/timeout). Rejects only with { code: 'denied' } when the
 * microphone is blocked, so the UI can explain it.
 */
export function listen() {
  return new Promise((resolve, reject) => {
    if (!canListen()) return resolve([]);
    stopSpeaking();
    const rec = new Recognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let settled = false;
    let timer = setTimeout(() => finish([]), START_TIMEOUT_MS);
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      activeFinish = null;
      clearTimeout(timer);
      try { rec.abort(); } catch { /* already stopped */ }
      if (error) reject(error);
      else resolve(value);
    };
    cancelListen();
    activeFinish = finish;
    rec.onstart = () => {
      clearTimeout(timer);
      timer = setTimeout(() => finish([]), LISTEN_TIMEOUT_MS);
    };
    rec.onresult = (e) => {
      const alts = [];
      for (const result of e.results) {
        for (const alt of result) alts.push(alt.transcript);
      }
      finish(alts);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        micDenied = true;
        finish(null, { code: 'denied' });
      }
      else finish([]);
    };
    rec.onend = () => finish([]);
    try {
      rec.start();
    } catch (err) {
      console.warn('Speech recognition failed to start', err);
      finish([]);
    }
  });
}
