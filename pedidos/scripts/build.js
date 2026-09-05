// Script de construcción: une los archivos de src/ en el orden correcto y
// genera DOS bundles — js/app.js (núcleo, lo descarga cualquier visitante
// nada más entrar) y js/app-admin.js (panel de admin, solo se descarga
// cuando alguien abre el panel — ver loadAdminShell() en index.php). Los
// 21 archivos de src/ sueltos NO se suben al servidor: las const/let de
// cada módulo solo se comparten entre sí dentro del mismo bundle (o entre
// bundles ya cargados, gracias al scope léxico global que comparten los
// <script> clásicos de una misma página — por eso nucleo-compartido.js
// tiene que cargar siempre antes que app-admin.js).
//
// Uso: node scripts/build.js

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// ── NÚCLEO (bundle de cliente) ───────────────────────────────
// Todo lo que necesita CUALQUIER visitante: carta, carrito, checkout,
// antifraude, banner del día, oferta relámpago, juegos (ruleta/rasca),
// fidelización, aviso de saturación, arranque general... nucleo-compartido.js
// va SIEMPRE primero: reúne las piezas de cliente que antes vivían
// repartidas en archivos que ahora son mayormente de admin, y varias de
// las otras piezas de este bundle dependen de sus consts/funciones.
const CORE_MODULOS = [
  'nucleo-compartido.js',
  'carta.js',
  'carrito-checkout.js',
  'antifraude.js',
  'init.js',
];

// ── ADMIN (bundle del panel) ──────────────────────────────────
// Todo lo que solo usa la dueña/el personal desde el panel: gestión de
// productos, turnos, descuentos, empleados, fichajes, estadísticas,
// impresora térmica, exportaciones, configuración de juegos... Se carga de
// forma diferida (ver loadAdminShell() en index.php) la primera vez que se
// abre el panel, no al entrar a la web.
const ADMIN_MODULOS = [
  'vacaciones.js',
  'proveedores.js',
  'admin-antispam-stats.js',
  'admin-turnos-descuentos.js',
  // finanzas.js: fuera del bundle a propósito — Márgenes/Calculadora/Equipo
  // vs facturación/Estrellas y perdedores se quitaron de esta web (panel
  // bimba) porque ya viven en administracion.dulcepatatafood.es, que lee
  // los mismos datos de este mismo proyecto de Firebase. El archivo se deja
  // en el repo sin usar, por si hace falta como referencia más adelante.
  'admin-accesos.js',
  'slots-alertas.js',
  'admin-config.js',
  'historial-export.js',
  'pedidos-vivo-cocina.js',
  'impresora-termica.js',
  'banner-pdf.js',
  'fidelizacion-admin.js',
  'stock-empleados.js',
  'juegos.js',
  'buscador.js',
  'empleados-fichajes.js',
];

const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'js');
const rootDir = path.join(__dirname, '..');

function construirBundle(nombreBundle, modulos, buildFile, minFile) {
  const unido = modulos.map(nombre => fs.readFileSync(path.join(srcDir, nombre), 'utf8')).join('\n');
  fs.writeFileSync(path.join(outDir, buildFile), unido);
  return esbuild.transform(unido, { minify: true, loader: 'js' }).then(result => {
    fs.writeFileSync(path.join(outDir, minFile), result.code);
    console.log('✅ Construido: js/' + minFile + ' (' + result.code.length + ' bytes, ' + modulos.length + ' módulos)');
    return result.code.length;
  });
}

// css/style.css sigue siendo el archivo que se edita a mano (igual que los
// módulos de src/ para el JS); aquí se genera aparte una copia minificada
// que es la que index.php enlaza de verdad, para que la página pese menos
// y cargue más rápido (Google lo mide directamente en Core Web Vitals).
function construirCss() {
  const cssDir = path.join(rootDir, 'css');
  const original = fs.readFileSync(path.join(cssDir, 'style.css'), 'utf8');
  return esbuild.transform(original, { minify: true, loader: 'css' }).then(result => {
    fs.writeFileSync(path.join(cssDir, 'style.min.css'), result.code);
    console.log('✅ Construido: css/style.min.css (' + result.code.length + ' bytes, antes ' + original.length + ')');
    return result.code.length;
  });
}

Promise.all([
  construirBundle('núcleo', CORE_MODULOS, 'app.build.js', 'app.js'),
  construirBundle('admin', ADMIN_MODULOS, 'app-admin.build.js', 'app-admin.js'),
  construirCss(),
]).then(([coreBytes, adminBytes]) => {
  console.log('   Versiones legibles en js/app.build.js y js/app-admin.build.js para revisar si algo falla.');
  console.log('   Total: ' + (coreBytes + adminBytes) + ' bytes (antes, un único bundle con todo).');
}).catch(err => {
  console.error('❌ Error al construir:', err);
  process.exit(1);
});

// menu-default.json — copia limpia (JSON de verdad, no JS) del array MENU
// de carta.js, para que index.php pueda leer el menú "de fábrica" sin tener
// que parsear JavaScript. Es el mismo papel que ya cumplen app.js/app.build.js:
// un artefacto derivado que se regenera solo en cada build, así carta.js
// sigue siendo la única fuente que se edita a mano. index.php solo usa este
// archivo si Firebase (config/menu, con los cambios reales del panel) no
// responde y tampoco hay caché previa — ver menu-render.php.
(function generarMenuDefaultJson() {
  const cartaSrc = fs.readFileSync(path.join(srcDir, 'carta.js'), 'utf8');
  const match = cartaSrc.match(/const MENU = \[[\s\S]*?\n\}\];/);
  if (!match) {
    console.error('❌ No se encontró el array MENU en carta.js — menu-default.json no se ha regenerado.');
    return;
  }
  const sandbox = {};
  new Function('exports', match[0].replace('const MENU', 'exports.MENU'))(sandbox);
  fs.writeFileSync(path.join(rootDir, 'menu-default.json'), JSON.stringify(sandbox.MENU));
  console.log('✅ Construido: menu-default.json (' + sandbox.MENU.length + ' productos)');
})();

// index.php carga js/app.js, js/auth.js y css/style.min.css con un
// "?v=<timestamp>" fijo en el propio HTML (a diferencia de js/app-admin.js,
// que ya se pide con Date.now() calculado en el navegador — ver
// loadAdminShell() en index.php, siempre fresco). Antes había que acordarse
// de subir ese número a mano cada vez que cambiaba alguno de esos archivos:
// si se olvidaba, el navegador (o una caché del propio hosting) podía
// seguir sirviendo la versión vieja aunque el archivo nuevo ya estuviera
// subido — pasó de verdad: un botón nuevo del panel no respondía porque
// auth.js seguía en caché. Ahora se regenera solo en cada build.
// style.min.css se añadió después de app.js/auth.js y durante un tiempo se
// quedó fuera de este replace por descuido — con el Service Worker
// cacheando /css/ por URL exacta (ver sw.js), un cambio de CSS sin subir
// este número podía quedarse invisible indefinidamente para quien ya
// hubiera visitado la web, aunque el archivo nuevo ya estuviera subido.
(function actualizarVersionCache() {
  const indexPath = path.join(rootDir, 'index.php');
  const original = fs.readFileSync(indexPath, 'utf8');
  const v = Date.now();
  const actualizado = original
    .replace(/js\/app\.js\?v=\d+/, 'js/app.js?v=' + v)
    .replace(/js\/auth\.js\?v=\d+/, 'js/auth.js?v=' + v)
    .replace(/css\/style\.min\.css\?v=\d+/, 'css/style.min.css?v=' + v);
  if (actualizado !== original) {
    fs.writeFileSync(indexPath, actualizado);
    console.log('✅ index.php: versión de caché de app.js/auth.js/style.min.css actualizada a ' + v);
  }
})();

// comandas.html es una página aparte (no pasa por index.php ni por este
// build.js más arriba) que carga comandas.js/comandas.css con su propio
// "?v=" fijo en el HTML — mismo motivo que arriba: sin esto, la tablet del
// mostrador podía seguir sirviendo una versión vieja de Comandas aunque el
// archivo nuevo ya estuviera subido, sin ningún aviso de que era eso lo
// que pasaba.
(function actualizarVersionCacheComandas() {
  const comandasPath = path.join(rootDir, 'comandas.html');
  const original = fs.readFileSync(comandasPath, 'utf8');
  const v = Date.now();
  const actualizado = original
    .replace(/comandas\.js\?v=\d+/, 'comandas.js?v=' + v)
    .replace(/comandas\.css\?v=\d+/, 'comandas.css?v=' + v);
  if (actualizado !== original) {
    fs.writeFileSync(comandasPath, actualizado);
    console.log('✅ comandas.html: versión de caché de comandas.js/comandas.css actualizada a ' + v);
  }
})();
