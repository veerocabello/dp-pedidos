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
const { app, BrowserWindow, Menu, dialog, session } = require('electron');
const path = require('path');

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

  function createWindow() {
    const win = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      show: false,
      backgroundColor: '#f6ead9',
      icon: path.join(__dirname, 'build', 'icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        // La app no necesita Node ni acceso al sistema de archivos desde la
        // página — es exactamente el mismo comandas.html/js/css que ya
        // corría en el navegador, solo que ahora empaquetado como app.
      },
    });

    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => win.show());
    win.maximize();

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

    return win;
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

  app.whenReady().then(() => {
    setupUsbDevicePicker();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
