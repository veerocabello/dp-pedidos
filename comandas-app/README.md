# Comandas Dulce Patata — app de escritorio

Envoltorio [Electron](https://www.electronjs.org/) de la app web `../pedidos/`
(comandas.html/js/css). Empaqueta esa misma app dentro de un programa de
escritorio con su propio Chromium integrado, así que en el ordenador del
mostrador **no hace falta tener Chrome instalado ni conexión a internet** —
solo hace falta instalar (o copiar) el programa ya compilado.

## Cómo se genera (aquí, en un ordenador con internet)

```
cd comandas-app
npm install          # una sola vez
npm run dist          # copia comandas.html/js/css + img/fonts, genera los iconos y empaqueta
```

Esto deja los instaladores en `comandas-app/dist/`:

- **Windows**: `Comandas Dulce Patata Setup <versión>.exe` — instalador con
  acceso directo en el escritorio y en el menú de inicio.
- **Mac** (compilando desde este proyecto en Linux con `npm run dist -- --mac`):
  `Comandas Dulce Patata-<versión>-mac.zip` (Intel) y
  `-arm64-mac.zip` (Apple Silicon) — sin firmar (solo para pruebas internas;
  macOS pedirá "Abrir de todos modos" la primera vez, clic derecho › Abrir).

`comandas/` dentro de esta carpeta y los iconos en `build/` se generan solos
a partir de `../pedidos/` (solo comandas.html/css/js + img/ + fonts/, no el
resto de pedidos/) — no se editan a mano ni se suben a git (ver `.gitignore`
en la raíz del repo). Si cambia algo en `../pedidos/comandas.*`, solo hay
que volver a ejecutar `npm run dist`.

## Ajustes propios de la app de escritorio

Dentro de Ajustes (⚙️), sección "App de escritorio" (solo aparece cuando la
página corre dentro de esta app, no en un navegador normal):

- **Arranque automático**: se activa solo la primera vez que se abre la app
  en un PC (guardado en `desktop-settings.json` dentro de la carpeta de
  datos de la app). Se puede desactivar/activar a mano después.
- **Modo kiosco**: pantalla completa fija y bloquea cerrar por error
  (Alt+F4). Para salir de verdad: **Esc** (pide confirmación, así una
  pulsación accidental no cierra la app).
- **Buscar actualización**: lee un `version.json` de la carpeta indicada
  (una ruta de red local tipo `\\SERVIDOR\comandas-updates`, o un
  pendrive — nunca internet). Formato esperado:
  ```json
  { "version": "1.1.0", "instalador": "Comandas Dulce Patata Setup 1.1.0.exe", "notas": "Qué ha cambiado" }
  ```
  Si hay una versión más nueva y su instalador está en esa misma carpeta,
  ofrece un botón para abrirlo (la app se cierra sola para no bloquear la
  sobrescritura de sus propios archivos durante la instalación).
- **Carpeta de copias de seguridad**: al elegir una carpeta aquí (botón
  "📁 Elegir…", selector nativo de carpetas), cada vez que se pulsa
  "📥 Descargar copia" en Hacer Caja se guarda sola, además de la descarga
  normal, una copia de ese día en
  `<carpeta>/AAAA/MM - Mes/Semana NN (rango de fechas)/comandas-AAAA-MM-DD.json`
  — organizada por año, mes y semana, escrita de verdad en disco (no
  depende de la carpeta de Descargas del navegador). También hay un botón
  "📁 Guardar copia organizada" en Hacer Caja para guardarla a mano en
  cualquier momento.

## Qué cambia respecto a abrirla en el navegador

Todo el comportamiento (carta, comanda, caja, historial, impresión...) es
exactamente el mismo código que en `../pedidos/`. Lo único distinto es la
impresora USB (WebUSB): un navegador muestra un selector nativo al pedir un
dispositivo; Electron no lo tiene, así que `main.js` implementa uno propio
con `dialog.showMessageBoxSync()` cuando hay más de un dispositivo USB
conectado (por ejemplo, impresora + lector de códigos). Si solo hay uno
conectado, se conecta solo sin preguntar.

## Notas de compilación (por si hay que tocar esto más adelante)

- El target Windows (`nsis`) necesita `wine` instalado si se compila desde
  Linux/Mac (para incrustar el icono en el .exe): `apt-get install -y wine
  wine32:i386` (hace falta habilitar multiarch i386 primero con
  `dpkg --add-architecture i386 && apt-get update`). En un entorno sin
  soporte de WoW64 de 32 bits (solo `wine64`, sin `wine32`), el paso de
  electron-builder que ejecuta el instalador NSIS ya compilado (para
  generar el desinstalador embebido) falla — el workaround en ese caso es
  compilar con target `dir` (deja `dist/win-unpacked/` sin instalador) y
  envolver esa carpeta a mano con un `.nsi` propio compilado con el
  `makensis` nativo de Linux (paquete `nsis` de apt), que no necesita wine.
- `"publish": null` en el `package.json` desactiva la generación de
  metadatos de auto-actualización (`latest.yml`) — esta app no se
  autoactualiza por red, así que ese paso solo daba un error sin sentido.
- `"signAndEditExecutable": false` evita un segundo paso de firma que
  tampoco hace falta (no hay certificado de firma de código).
