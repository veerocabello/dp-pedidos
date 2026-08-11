// Comandas Dulce Patata Food — envoltorio de escritorio (Electron) de la
// app web comandas/. Arranca como un programa normal de Windows (icono,
// acceso directo, sin barra de direcciones ni menús de navegador) y no
// necesita Chrome ni internet: Electron trae su propio Chromium integrado.
//
// La única pieza que cambia de verdad respecto a abrirla en Chrome es la
// impresora USB (WebUSB): un navegador normal muestra un selector nativo
// cuando la web pide un dispositivo (navigator.usb.requestDevice), pero
// Electron no tiene ese selector — hay que dárselo aquí, a mano, con
// dialog.showMessageBoxSync() listando los dispositivos USB conectados.
const { app, BrowserWindow, Menu, dialog, session, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

/* ── Ajustes propios de la app de escritorio (arranque automático, modo
   kiosco, carpeta de actualizaciones) — separados de los ajustes del
   ticket/impresora, que ya vivían en localStorage dentro de la propia
   página. Estos son ajustes DEL PROGRAMA, así que se guardan en un JSON
   aparte en la carpeta de datos de la app (fuera de la carpeta de
   instalación, para que sobrevivan a una reinstalación/actualización). ── */
const SETTINGS_FILE = path.join(app.getPath('userData'), 'desktop-settings.json');
const SETTINGS_DEFAULTS = { kiosk: false, updatePath: '' };
function loadDesktopSettings() {
  try { return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))); }
  catch (e) { return { ...SETTINGS_DEFAULTS }; }
}
function saveDesktopSettings(s) {
  try { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2)); } catch (e) { /* no debe romper la app */ }
}
let desktopSettings = loadDesktopSettings();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // Ya hay una ventana de Comandas abierta — no tiene sentido abrir una
  // segunda (dos comandas a la vez pisándose el contador de pedidos del
  // día), así que esta segunda instancia se cierra sola.
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  let mainWindow = null;
  // Con el modo kiosco activo, cerrar la ventana (Alt+F4, clic en X si lo
  // hubiera, o "Cerrar" desde el Administrador de tareas de forma limpia)
  // se bloquea — para no dejar el mostrador sin forma de salir nunca, un
  // atajo oculto (Ctrl+Shift+Alt+S) pide confirmación y sí permite salir.
  let allowRealClose = false;

  function createWindow() {
    const win = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      show: false,
      backgroundColor: '#f6ead9',
      icon: path.join(__dirname, 'build', 'icon.ico'),
      kiosk: desktopSettings.kiosk,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => win.show());
    if (!desktopSettings.kiosk) win.maximize();

    win.loadFile(path.join(__dirname, 'comandas', 'comandas.html'));

    // Sin esto, un enlace o un error de JS que intente abrir una ventana
    // nueva (window.open) dejaría una ventana de Chromium "suelta" sin
    // icono ni control — la app es de una sola ventana, así que se bloquea.
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    // Tampoco tiene sentido navegar a ninguna URL externa (la app no
    // depende de internet); si algo lo intentara, se ignora.
    win.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('file://')) event.preventDefault();
    });

    // Atajo de salida oculto para el modo kiosco (ver allowRealClose más
    // abajo) — Ctrl+Shift+Alt+S, difícil de pulsar sin querer.
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key.toLowerCase() === 's' && input.control && input.shift && input.alt) {
        requestExit(win);
      }
    });

    win.on('close', (event) => {
      if (desktopSettings.kiosk && !allowRealClose) {
        event.preventDefault();
        requestExit(win);
      }
    });

    return win;
  }

  async function requestExit(win) {
    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      title: 'Salir de Comandas',
      message: '¿Salir de la app? (modo kiosco activo)',
      buttons: ['Cancelar', 'Salir'],
      defaultId: 0,
      cancelId: 0,
    });
    if (response === 1) {
      allowRealClose = true;
      win.close();
    }
  }

  // ── Selector de impresora USB (sustituye al diálogo nativo de Chrome) ──
  function setupUsbDevicePicker() {
    const ses = session.defaultSession;

    ses.on('select-usb-device', (event, details, callback) => {
      event.preventDefault();
      const list = details.deviceList || [];
      if (list.length === 0) { callback(); return; }
      if (list.length === 1) { callback(list[0].deviceId); return; }
      // Varios dispositivos USB conectados (ej. impresora + lector de
      // códigos): se pregunta cuál es la impresora con un diálogo nativo
      // sencillo, en vez de coger uno a ciegas.
      const nombres = list.map(d => d.deviceName || (d.vendorId + ':' + d.productId));
      const resultado = dialog.showMessageBoxSync({
        type: 'question',
        title: 'Elegir impresora',
        message: 'Hay varios dispositivos USB conectados. ¿Cuál es la impresora?',
        buttons: [...nombres, 'Cancelar'],
        cancelId: nombres.length,
        noLink: true,
      });
      if (resultado >= 0 && resultado < list.length) callback(list[resultado].deviceId);
      else callback();
    });

    // Una vez elegido un dispositivo (arriba o en la propia página con
    // "🔌 Conectar impresora directa"), se recuerda sin volver a preguntar
    // — es una app de mostrador de un solo uso, no un navegador compartido
    // entre webs distintas donde este permiso importaría por seguridad.
    ses.setPermissionCheckHandler(() => true);
    ses.setDevicePermissionHandler(() => true);
  }

  // ── IPC: puente entre la página (comandas.js, vía preload.js) y estas
  // capacidades del programa que una web normal no tiene — arranque
  // automático, modo kiosco y comprobación de actualizaciones. ──
  function setupIpc() {
    ipcMain.handle('app:getVersion', () => app.getVersion());

    ipcMain.handle('autolaunch:get', () => app.getLoginItemSettings().openAtLogin);
    ipcMain.handle('autolaunch:set', (event, value) => {
      // En Windows, path apunta al .exe ya instalado (no al binario de
      // Electron "sin marca" que se usa en desarrollo) para que el acceso
      // directo de arranque automático sobreviva a una actualización.
      app.setLoginItemSettings({ openAtLogin: !!value, path: process.execPath });
      return app.getLoginItemSettings().openAtLogin;
    });

    ipcMain.handle('kiosk:get', () => desktopSettings.kiosk);
    ipcMain.handle('kiosk:set', (event, value) => {
      desktopSettings.kiosk = !!value;
      saveDesktopSettings(desktopSettings);
      if (mainWindow) mainWindow.setKiosk(desktopSettings.kiosk);
      return desktopSettings.kiosk;
    });

    ipcMain.handle('update:getPath', () => desktopSettings.updatePath || '');
    ipcMain.handle('update:setPath', (event, value) => {
      desktopSettings.updatePath = String(value || '').trim();
      saveDesktopSettings(desktopSettings);
      return desktopSettings.updatePath;
    });

    // Busca un archivo version.json en la carpeta configurada (una carpeta
    // compartida en la red local, o un pendrive/disco montado — nunca
    // internet, solo rutas de archivos accesibles desde este PC) con la
    // forma {"version":"1.1.0","instalador":"Comandas Dulce Patata Setup 1.1.0.exe"}.
    // Compara con la versión instalada y, si hay una más reciente, deja
    // abrir su instalador directamente desde ahí.
    ipcMain.handle('update:check', () => {
      const carpeta = desktopSettings.updatePath;
      if (!carpeta) return { ok: false, error: 'No hay ninguna carpeta de actualizaciones configurada.' };
      const versionFile = path.join(carpeta, 'version.json');
      if (!fs.existsSync(versionFile)) return { ok: false, error: 'No se encuentra version.json en esa carpeta.' };
      let info;
      try { info = JSON.parse(fs.readFileSync(versionFile, 'utf8')); }
      catch (e) { return { ok: false, error: 'version.json no es un JSON válido.' }; }
      if (!info.version) return { ok: false, error: 'version.json no indica ninguna versión.' };
      const actual = app.getVersion();
      const hayNueva = compareVersions(info.version, actual) > 0;
      let instaladorPath = null;
      if (info.instalador) {
        const candidato = path.join(carpeta, info.instalador);
        if (fs.existsSync(candidato)) instaladorPath = candidato;
      }
      return { ok: true, actual, disponible: info.version, hayNueva, instaladorPath, notas: info.notas || '' };
    });

    ipcMain.handle('update:install', (event, instaladorPath) => {
      if (!instaladorPath || !fs.existsSync(instaladorPath)) return { ok: false, error: 'No se encuentra el instalador.' };
      // Se abre el instalador con la app de Windows asociada (el propio
      // instalador NSIS) y esta app se cierra para no bloquear la
      // sobrescritura de sus propios archivos durante la instalación.
      shell.openPath(instaladorPath);
      allowRealClose = true;
      setTimeout(() => app.quit(), 300);
      return { ok: true };
    });
  }

  // Compara "1.2.10" vs "1.3.0" etc. Devuelve >0 si a es más nueva que b.
  function compareVersions(a, b) {
    const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
    const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  app.whenReady().then(() => {
    setupUsbDevicePicker();
    setupIpc();
    mainWindow = createWindow();

    // Primera vez que se abre la app en este PC: se activa el arranque
    // automático con Windows por defecto (lo que se pidió — "que se abra
    // sola al encender el PC"), pero solo la primera vez, para no pisar
    // si alguien lo desactiva luego a mano desde Ajustes.
    const marcaPrimeraVez = path.join(app.getPath('userData'), '.autolaunch-configurado');
    if (!fs.existsSync(marcaPrimeraVez)) {
      app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
      try { fs.writeFileSync(marcaPrimeraVez, '1'); } catch (e) { /* no crítico */ }
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
