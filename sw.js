// Offline cache. Bump CACHE when shipping changes.
const CACHE = 'twj-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/app.css', 'assets/icon.svg', 'assets/icon-180.png', 'assets/icon-512.png',
  'js/app.js', 'js/content.js', 'js/profile.js', 'js/match.js', 'js/srs.js', 'js/store.js',
  'js/lesson.js', 'js/speech.js', 'js/sfx.js', 'js/ui/dom.js', 'js/ui/julia.js', 'js/ui/nav.js',
  'js/screens/home.js', 'js/screens/onboarding.js', 'js/screens/book.js', 'js/screens/parent.js',
  'js/screens/player.js', 'js/screens/steps.js', 'js/screens/chat.js', 'js/screens/results.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first (fresh content when online), cache fallback (works offline).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request)
    .then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    })
    .catch(() => caches.match(e.request)));
});
