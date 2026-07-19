// ═══════════════════════════════════════════════════════════
//  SERVICE WORKER — Dulce Patata Food
//  Solo cachea assets estáticos (css, fonts, img, js) para que
//  la web cargue más rápido con conexión floja.
//  NO cachea nunca: HTML, Firebase, ni los PHP (send-code.php,
//  verify-code.php...) — esos siempre van directos a la red,
//  para que el menú, precios y pedidos estén siempre al día.
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'dpf-static-v5'; // súbelo a v6, v7... si algún día cambias esta lógica
//
// ⚠️ IMPORTANTE: las imágenes de img/ y js/firebase-auth-compat.js NO llevan
// ?v= en su URL (a diferencia de css/style.css y los módulos de src/, que sí).
// Si algún día cambias una imagen o ese archivo, hay que subir este número
// de versión (CACHE_NAME) también, o el Service Worker seguirá sirviendo
// la versión vieja cacheada indefinidamente a quien ya haya visitado la web.
const CACHEABLE_PATHS = ['/css/', '/fonts/', '/img/', '/js/', '/src/'];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo peticiones GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nunca tocar peticiones a otros dominios (Firebase, Google Fonts, EmailJS, etc.)
  if (url.origin !== self.location.origin) return;

  // Solo cachear rutas estáticas conocidas — todo lo demás (HTML, PHP) pasa directo a la red
  const isCacheable = CACHEABLE_PATHS.some((p) => url.pathname.includes(p));
  if (!isCacheable) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req, { credentials: 'include' }).then((res) => {
          // Solo guardar respuestas válidas
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached); // si falla la red y había algo en caché, úsalo
      })
    )
  );
});
