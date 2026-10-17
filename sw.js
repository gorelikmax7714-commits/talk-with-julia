// Offline cache. Bump CACHE when shipping changes.
const CACHE = 'twj-v3';
const NETWORK_TIMEOUT_MS = 3000;
const FILES = [
  './', 'index.html', 'manifest.json', 'css/app.css', 'assets/icon.svg', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png', 'js/install.js',
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

// Network first with a short timeout (fresh when online, fast on weak signal),
// then cache; page navigations fall back to the cached app shell.
async function fromCache(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  if (request.mode === 'navigate') return caches.match('index.html');
  return Response.error();
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const network = fetch(e.request).then((res) => {
    if (res.ok && new URL(e.request.url).origin === location.origin) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS));
  e.respondWith(Promise.race([network, timeout]).catch(() => fromCache(e.request).then((r) => (r.type === 'error' ? network : r))));
});
