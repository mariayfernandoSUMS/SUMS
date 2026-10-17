// SUMS · guarda la app en el móvil para poder abrirla sin conexión.
// Los datos NO se guardan aquí: siempre se piden a la hoja de Google.
// Primero intenta descargar la versión más nueva de GitHub (si tarda más de 3 s o no hay conexión, usa la guardada).
const CACHE = 'sums-v3';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // la hoja de Google y las fuentes van directas
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const red = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    const espera = new Promise(res => setTimeout(res, 3000));
    try {
      const r = await Promise.race([red, espera]);
      if (r) return r;
    } catch (err) {}
    const guardado = await c.match(e.request, { ignoreSearch: true });
    return guardado || red;
  })());
});
