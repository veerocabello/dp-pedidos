// Genera build/icon.ico (Windows) y build/icon.icns (Mac) a partir del
// logo redondo que ya usa la web (comandas/img/logo.png) — sin necesitar
// Windows ni macOS para generarlos (png-to-ico y png2icons son puro JS).
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');
const png2icons = require('png2icons');

const logoPng = path.join(__dirname, '..', 'comandas', 'img', 'logo.png');
const outIco = path.join(__dirname, '..', 'build', 'icon.ico');
const outIcns = path.join(__dirname, '..', 'build', 'icon.icns');

(async () => {
  if (!fs.existsSync(logoPng)) {
    console.error('No se encuentra ' + logoPng + ' — ejecuta "npm run copy-assets" primero.');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outIco), { recursive: true });

  const icoBuf = await pngToIco(logoPng);
  fs.writeFileSync(outIco, icoBuf);
  console.log('Icono Windows generado en ' + outIco);

  const pngBuf = fs.readFileSync(logoPng);
  const icnsBuf = png2icons.createICNS(pngBuf, png2icons.BILINEAR, 0);
  if (icnsBuf) {
    fs.writeFileSync(outIcns, icnsBuf);
    console.log('Icono Mac generado en ' + outIcns);
  } else {
    console.warn('No se pudo generar icon.icns (se usará el icono por defecto de Electron en Mac)');
  }
})().catch(err => {
  console.error('No se pudo generar el icono:', err.message);
  process.exit(1);
});
