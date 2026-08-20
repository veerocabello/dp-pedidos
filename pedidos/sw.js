// ═══════════════════════════════════════════════════════════
//  SERVICE WORKER — Dulce Patata Food
//  Solo cachea assets estáticos (css, fonts, img, js) para que
//  la web cargue más rápido con conexión floja.
//  NO cachea nunca: HTML, Firebase, ni los PHP (send-code.php,
//  verify-code.php...) — esos siempre van directos a la red,
//  para que el menú, precios y pedidos estén siempre al día.
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'dpf-static-v9'; // subida por añadir los iconos de alérgenos en img/alergenos/ — súbelo otra vez si cambias otra imagen
//
// ⚠️ IMPORTANTE: las imágenes de img/ y js/firebase-auth-compat.js NO llevan
// ?v= en su URL (a diferencia de css/style.css y los módulos de src/, que sí).
// Si algún día cambias una imagen o ese archivo, hay que subir este número
// de versión (CACHE_NAME) también, o el Service Worker seguirá sirviendo
// la versión vieja cacheada indefinidamente a quien ya haya visitado la web.
const CACHEABLE_PATHS = ['/css/', '/fonts/', '/img/', '/js/', '/src/'];

// Página de "sin conexión" — autocontenida (estilos inline, sin depender de
// css/style.css) para que se pueda mostrar aunque falle justo lo que la
// hubiera traído. Se precachea aquí mismo al instalar el Service Worker,
// para que esté disponible incluso en el primer arranque sin red de quien
// instaló la app como PWA y nunca llegó a visitar offline.html a mano.
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).catch(() => {})
  );
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

  // Navegación (cargar una página completa, p.ej. index.php/admin-shell.html
  // o pulsar "Recargar"): SIEMPRE se intenta la red primero — el HTML nunca
  // se cachea, para que el menú/precios estén al día — pero si falla por
  // no haber conexión, en vez del típico error del navegador se muestra la
  // página de aviso propia en vez de dejarlo en manos del navegador.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL))
      )
    );
    return;
  }

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
