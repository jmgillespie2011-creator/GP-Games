// Service worker for the installable app: the game works offline after one visit.
// The page is fetched fresh when online (so updates arrive), and falls back to the cached copy offline.
// The game is cached as '/'; other pages (the trailer) under their own address, so they never replace it.
// Fonts and icons are cached as they're used. The leaderboard (Supabase) and video are never cached.
const CACHE = 'lps-v2';
const CORE = ['/', '/last-partner-standing/icon-192.png', '/last-partner-standing/manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  if (req.headers.has('range') || url.pathname.endsWith('.mp4')) return;
  if (req.mode === 'navigate') {
    const game = url.pathname === '/' || url.pathname === '/last-partner-standing' || url.pathname.endsWith('/last-partner-standing-play.html');
    const key = game ? '/' : url.pathname;
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return r; }).catch(() => caches.match(key).then(hit => hit || caches.match('/'))));
    return;
  }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
