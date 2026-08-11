// Copia la app web (../comandas) dentro de esta carpeta antes de empaquetar,
// para no mantener dos copias a mano — así nunca queda desincronizado si se
// actualiza comandas/comandas.js, .html o .css.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'comandas');
const dest = path.join(__dirname, '..', 'comandas');

if (!fs.existsSync(src)) {
  console.error('No se encuentra ../../comandas junto a comandas-app/. Nada que copiar.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Copiado ' + src + ' -> ' + dest);
