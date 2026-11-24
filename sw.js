const CACHE = 'gold-ninja-859c469e86';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  e.respondWith(caches.open(CACHE).then(async c => {
    if (isPage) {
      try { const r = await fetch(req, { cache: 'no-cache' }); if (r.ok) c.put('./index.html', r.clone()); return r; }
      catch (err) { return (await c.match('./index.html')) || (await c.match(req, { ignoreSearch: true })) || Response.error(); }
    }
    const hit = await c.match(req, { ignoreSearch: true });
    return hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; });
  }));
});
