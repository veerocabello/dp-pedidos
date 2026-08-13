// Script de construcción: une los archivos de src/ en el orden correcto
// y genera js/app.js — el único archivo que se sube al servidor (dentro
// de js/, no los 16 de src/ sueltos: las const/let de cada módulo no se
// comparten entre <script> tags distintas, solo funcionan unidas en un
// único archivo).
//
// Uso: node scripts/build.js

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// ── ORDEN DE LOS MÓDULOS ─────────────────────────────────────
// El orden importa: JavaScript ejecuta esto de arriba a abajo,
// igual que si fuera un único archivo. Al añadir nuevos módulos,
// se van agregando a esta lista en el orden que corresponda.
const MODULOS = [
  'vacaciones.js',
  'proveedores.js',
  'carta.js',
  'carrito-checkout.js',
  'antifraude.js',
  'admin-turnos-descuentos.js',
  'finanzas.js',
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
  'init.js',
  'buscador.js',
];

const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'js');
const rootDir = path.join(__dirname, '..');

// 1. Concatenar todos los módulos en orden
let unido = MODULOS.map(nombre => {
  const contenido = fs.readFileSync(path.join(srcDir, nombre), 'utf8');
  return contenido;
}).join('\n');

// 2. Guardar versión sin minificar (para comparar / depurar)
fs.writeFileSync(path.join(outDir, 'app.build.js'), unido);

// 3. Minificar con esbuild y guardar como app.js (el que se sube)
esbuild.transform(unido, { minify: true, loader: 'js' }).then(result => {
  fs.writeFileSync(path.join(outDir, 'app.js'), result.code);
  console.log('✅ Construido: js/app.js (' + result.code.length + ' bytes)');
  console.log('   Versión legible en js/app.build.js para revisar si algo falla.');
}).catch(err => {
  console.error('❌ Error al construir:', err);
  process.exit(1);
});

// 4. menu-default.json — copia limpia (JSON de verdad, no JS) del array MENU
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
