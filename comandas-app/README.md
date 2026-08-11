# Comandas Dulce Patata — app de escritorio

Envoltorio [Electron](https://www.electronjs.org/) de la app web `../comandas/`
(comandas.html/js/css). Empaqueta esa misma app dentro de un programa de
escritorio con su propio Chromium integrado, así que en el ordenador del
mostrador **no hace falta tener Chrome instalado ni conexión a internet** —
solo hace falta instalar (o copiar) el programa ya compilado.

## Cómo se genera (aquí, en un ordenador con internet)

```
cd comandas-app
npm install          # una sola vez
npm run dist          # copia comandas/, genera los iconos y empaqueta
```

Esto deja los instaladores en `comandas-app/dist/`:

- **Windows**: `Comandas Dulce Patata Setup <versión>.exe` — instalador con
  acceso directo en el escritorio y en el menú de inicio.
- **Mac** (compilando desde este proyecto en Linux con `npm run dist -- --mac`):
  `Comandas Dulce Patata-<versión>-mac.zip` (Intel) y
  `-arm64-mac.zip` (Apple Silicon) — sin firmar (solo para pruebas internas;
  macOS pedirá "Abrir de todos modos" la primera vez, clic derecho › Abrir).

`comandas/` dentro de esta carpeta y los iconos en `build/` se generan solos
a partir de `../comandas/` — no se editan a mano ni se suben a git (ver
`.gitignore` en la raíz del repo). Si cambia algo en `../comandas/`, solo
hay que volver a ejecutar `npm run dist`.

## Qué cambia respecto a abrirla en el navegador

Todo el comportamiento (carta, comanda, caja, historial, impresión...) es
exactamente el mismo código que en `../comandas/`. Lo único distinto es la
impresora USB (WebUSB): un navegador muestra un selector nativo al pedir un
dispositivo; Electron no lo tiene, así que `main.js` implementa uno propio
con `dialog.showMessageBoxSync()` cuando hay más de un dispositivo USB
conectado (por ejemplo, impresora + lector de códigos). Si solo hay uno
conectado, se conecta solo sin preguntar.

## Notas de compilación (por si hay que tocar esto más adelante)

- El target Windows (`nsis`) necesita `wine` instalado si se compila desde
  Linux/Mac (para incrustar el icono en el .exe): `apt-get install -y wine
  wine32:i386` (hace falta habilitar multiarch i386 primero con
  `dpkg --add-architecture i386 && apt-get update`).
- `"publish": null` en el `package.json` desactiva la generación de
  metadatos de auto-actualización (`latest.yml`) — esta app no se
  autoactualiza por red, así que ese paso solo daba un error sin sentido.
- `"signAndEditExecutable": false` evita un segundo paso de firma que
  tampoco hace falta (no hay certificado de firma de código).
