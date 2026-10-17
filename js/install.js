// "Add to home screen": one-tap install on Android Chrome, instructions elsewhere.

let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep it for our own button instead of Chrome's mini-bar
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}

/** 'installed' | 'ready' (one-tap) | 'ios' | 'android' (manual menu) | 'none' */
export function installState() {
  if (isStandalone()) return 'installed';
  if (deferredPrompt) return 'ready';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'none';
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  prompt.prompt();
  try {
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  } finally {
    notify();
  }
}

export function onInstallChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
