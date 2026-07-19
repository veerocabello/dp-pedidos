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
  'banner-pdf.js',
  'fidelizacion-admin.js',
  'stock-empleados.js',
  'init.js',
];

const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'js');

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
