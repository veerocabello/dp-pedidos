// Copia la app web (../../pedidos) dentro de esta carpeta antes de empaquetar,
// para no mantener dos copias a mano — así nunca queda desincronizado si se
// actualiza pedidos/comandas.js, .html o .css.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'pedidos');
const dest = path.join(__dirname, '..', 'comandas');

if (!fs.existsSync(src)) {
  console.error('No se encuentra ../../pedidos junto a comandas-app/. Nada que copiar.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const name of ['comandas.html', 'comandas.css', 'comandas.js']) {
  fs.copyFileSync(path.join(src, name), path.join(dest, name));
}
fs.cpSync(path.join(src, 'img'), path.join(dest, 'img'), { recursive: true });
fs.cpSync(path.join(src, 'fonts'), path.join(dest, 'fonts'), { recursive: true });
console.log('Copiado ' + src + ' -> ' + dest);
