// Comandas Dulce Patata Food — envoltorio de escritorio (Electron) de la
// app web comandas/. Arranca como un programa normal de Windows (icono,
// acceso directo, sin barra de direcciones ni menús de navegador) y no
// necesita Chrome ni internet: Electron trae su propio Chromium integrado.
//
// La única pieza que cambia de verdad respecto a abrirla en Chrome es la
// impresora USB (WebUSB): un navegador normal muestra un selector nativo
// cuando la web pide un dispositivo (navigator.usb.requestDevice), pero
// Electron no tiene ese selector — hay que dárselo aquí, a mano, con un
// modal propio dentro de la página (ver setupUsbDevicePicker más abajo).
const { app, BrowserWindow, Menu, dialog, session, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

/* ── Ajustes propios de la app de escritorio (arranque automático, modo
   kiosco, carpeta de actualizaciones) — separados de los ajustes del
   ticket/impresora, que ya vivían en localStorage dentro de la propia
   página. Estos son ajustes DEL PROGRAMA, así que se guardan en un JSON
   aparte en la carpeta de datos de la app (fuera de la carpeta de
   instalación, para que sobrevivan a una reinstalación/actualización). ── */
const SETTINGS_FILE = path.join(app.getPath('userData'), 'desktop-settings.json');
const SETTINGS_DEFAULTS = { kiosk: false, updatePath: '', backupFolder: '' };
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
  // se bloquea — para no dejar el mostrador sin forma de salir nunca, Esc
  // pide confirmación y sí permite salir (el diálogo de confirmación es lo
  // que evita que una pulsación accidental cierre la app de verdad).
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

    // Atajo de salida para el modo kiosco (ver allowRealClose más abajo) —
    // Esc, con diálogo de confirmación antes de cerrar de verdad.
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'Escape' && desktopSettings.kiosk) {
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
  // Antes usaba dialog.showMessageBoxSync(), un diálogo NATIVO y SÍNCRONO:
  // bloqueaba el proceso principal entero mientras esperaba (la app parecía
  // "colgada"), con botones diminutos y difíciles de tocar en la pantalla
  // táctil del mostrador. Ahora se le pregunta a la propia página (modal
  // grande, igual de estilo que el resto de la app) vía IPC, sin bloquear
  // nada mientras se espera el toque.
  let pendingUsbPickerResolve = null;
  function setupUsbDevicePicker() {
    const ses = session.defaultSession;

    ses.on('select-usb-device', (event, details, callback) => {
      event.preventDefault();
      const list = details.deviceList || [];
      if (list.length === 0) { callback(); return; }
      if (list.length === 1) { callback(list[0].deviceId); return; }
      // Varios dispositivos USB conectados (ej. impresora + lector de
      // códigos, ratón inalámbrico...) — se pregunta cuál es la impresora
      // dentro de la propia app en vez de coger uno a ciegas.
      if (!mainWindow) { callback(); return; }
      const nombres = list.map(d => d.deviceName || (d.vendorId + ':' + d.productId));
      pendingUsbPickerResolve = (index) => {
        pendingUsbPickerResolve = null;
        if (index >= 0 && index < list.length) callback(list[index].deviceId);
        else callback();
      };
      mainWindow.webContents.send('usb-device-picker:show', nombres);
    });

    ipcMain.on('usb-device-picker:choose', (event, index) => {
      if (pendingUsbPickerResolve) pendingUsbPickerResolve(index);
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

    ipcMain.handle('backup:getFolder', () => desktopSettings.backupFolder || '');
    ipcMain.handle('backup:chooseFolder', async () => {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Elegir carpeta para las copias de seguridad',
        properties: ['openDirectory', 'createDirectory'],
      });
      if (result.canceled || !result.filePaths[0]) return { ok: false };
      desktopSettings.backupFolder = result.filePaths[0];
      saveDesktopSettings(desktopSettings);
      return { ok: true, folder: desktopSettings.backupFolder };
    });
    // Guarda la copia de un día en <carpeta elegida>/AAAA/MM - Mes/Semana
    // NN (rango)/comandas-AAAA-MM-DD.json — el contenido (mismo formato
    // que "📥 Descargar copia") lo genera la propia página, aquí solo se
    // decide la ruta y se escribe de verdad en disco.
    ipcMain.handle('backup:save', (event, { fecha, contenido }) => {
      if (!desktopSettings.backupFolder) return { ok: false, error: 'No hay ninguna carpeta de copias configurada.' };
      try {
        const filePath = buildBackupPath(desktopSettings.backupFolder, fecha);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, contenido);
        return { ok: true, path: filePath };
      } catch (e) {
        return { ok: false, error: e.message };
      }
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

    // Impresión silenciosa (sin diálogo) usando el driver de Windows ya
    // instalado para la impresora — esto NO pasa por WebUSB, así que no
    // choca con el bloqueo de Chrome a dispositivos USB de clase
    // "protegida" (impresoras, HID, etc.), que es un límite fijo del
    // navegador y no depende de si el driver está bien instalado o no.
    ipcMain.handle('print:list', async () => {
      if (!mainWindow) return [];
      try { return await mainWindow.webContents.getPrintersAsync(); }
      catch (e) { return []; }
    });
    // El @page CSS (size: 80mm auto) no basta por sí solo para la impresión
    // SILENCIOSA de Electron en todos los equipos — confirmado en la tienda:
    // eligiendo la impresora a mano en el diálogo sí sale el ticket, pero la
    // misma impresora en modo silencioso no imprime nada (Electron dice
    // "éxito" pero no llega papel). Se le pasa el tamaño de página EXPLÍCITO
    // (en micras) en vez de confiar en que Electron lea el CSS por su cuenta.
    ipcMain.handle('print:silent', (event, { deviceName, widthMicrons, heightMicrons } = {}) => {
      if (!mainWindow) return { success: false, reason: 'no hay ventana' };
      const options = { silent: true, printBackground: true, deviceName: deviceName || undefined, margins: { marginType: 'none' } };
      if (widthMicrons && heightMicrons) options.pageSize = { width: widthMicrons, height: heightMicrons };
      return new Promise((resolve) => {
        mainWindow.webContents.print(options, (success, reason) => resolve({ success, reason }));
      });
    });

    // Impresión RAW (bytes ESC/POS directos a la cola de Windows) — la vía
    // "print:silent" de arriba (renderizar la página e imprimirla) resultó
    // poco fiable en la tienda con esta impresora: Electron decía éxito pero
    // el ticket salía en blanco (solo se oía el corte de papel), pase lo que
    // pase con el tamaño de página o el tiempo de pintado. Esta vía evita
    // por completo el renderizado de página: manda los mismos bytes ESC/POS
    // que ya funcionan por USB directamente al spooler de Windows como
    // trabajo "RAW" (sin interpretación), vía un pequeño script de
    // PowerShell que llama a la API WritePrinter de Windows — la técnica
    // estándar para imprimir tickets desde programas de TPV en Windows.
    // Se preguntaba a Windows "¿cuál es la impresora predeterminada?" solo
    // una vez y se guardaba en memoria para las siguientes comandas — pero
    // eso hacía que, si esa primera consulta fallaba o llegaba antes de
    // que el sistema de impresión estuviera listo del todo (recién
    // arrancada la app), el fallo (o la impresora equivocada) se quedara
    // pegado el resto del día. Mejor preguntar siempre fresco: consultar
    // la lista de impresoras es rápido, la fiabilidad importa más aquí que
    // ahorrarse esa consulta.
    ipcMain.handle('print:raw', async (event, { deviceName, bytesBase64 } = {}) => {
      try {
        let printerName = deviceName;
        if (!printerName) {
          const printers = await mainWindow.webContents.getPrintersAsync();
          const def = printers.find(p => p.isDefault) || printers[0];
          if (!def) return { success: false, reason: 'No hay ninguna impresora configurada en Windows' };
          printerName = def.name;
        }
        const tmpFile = path.join(os.tmpdir(), 'comanda-' + Date.now() + '.bin');
        fs.writeFileSync(tmpFile, Buffer.from(bytesBase64, 'base64'));

        let result;
        if (process.platform === 'win32') {
          const scriptPath = app.isPackaged
            ? path.join(process.resourcesPath, 'print-raw.ps1')
            : path.join(__dirname, 'resources', 'print-raw.ps1');
          if (!fs.existsSync(scriptPath)) return { success: false, reason: 'No se encuentra print-raw.ps1' };
          result = await new Promise((resolve) => {
            execFile(
              'powershell.exe',
              // -NoLogo/-NonInteractive/-WindowStyle Hidden: arrancan la consola
              // de PowerShell algo más rápido y sin parpadeo de ventana; el
              // grueso del tiempo ya se ahorró antes cacheando el .dll
              // compilado (ver print-raw.ps1), esto es la siguiente milla.
              ['-NoLogo', '-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-PrinterName', printerName, '-FilePath', tmpFile],
              { timeout: 10000 },
              (error, stdout, stderr) => {
                if (error) resolve({ success: false, reason: (stderr || error.message || '').trim().slice(0, 300) });
                else resolve({ success: stdout.trim() === 'OK', reason: stdout.trim() || stderr.trim() });
              }
            );
          });
        } else {
          // macOS/Linux: no hay PowerShell ni WinSpool, pero CUPS (el sistema
          // de impresión que trae macOS de serie) tiene el mismo concepto de
          // trabajo "RAW" — con "-o raw" manda los bytes ESC/POS tal cual al
          // puerto de la impresora, sin que CUPS los intente reinterpretar
          // como un documento normal (que es justo lo que hacía fallar
          // print:silent). La impresora tiene que estar dada de alta en
          // Ajustes del Sistema → Impresoras y escáneres para que "lp" la
          // encuentre por su nombre.
          result = await new Promise((resolve) => {
            execFile(
              'lp',
              ['-d', printerName, '-o', 'raw', tmpFile],
              { timeout: 10000 },
              (error, stdout, stderr) => {
                if (error) resolve({ success: false, reason: (stderr || error.message || '').trim().slice(0, 300) });
                else resolve({ success: true, reason: stdout.trim() });
              }
            );
          });
        }
        try { fs.unlinkSync(tmpFile); } catch (e) { /* no crítico */ }
        return result;
      } catch (e) {
        return { success: false, reason: e.message };
      }
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

  /* ── Copia de seguridad organizada por año/mes/semana ── Esto SÍ puede
     escribir en cualquier carpeta real del disco (no solo "Descargas" como
     hacía la versión de navegador) porque aquí, en el proceso principal de
     Electron, hay acceso de verdad al sistema de archivos. Estructura:
     <carpeta elegida>/2026/08 - Agosto/Semana 33 (11 a 17 ago)/comandas-2026-08-11.json ── */
  const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7; // lunes=0 .. domingo=6
    d.setUTCDate(d.getUTCDate() - dayNum + 3); // jueves de esa semana (define a qué año/semana ISO pertenece)
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    return 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
  }
  function getWeekRangeLabel(date) {
    const dayNum = (date.getDay() + 6) % 7;
    const monday = new Date(date); monday.setDate(date.getDate() - dayNum);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => d.getDate() + ' ' + MESES_CORTO[d.getMonth()];
    return fmt(monday) + ' a ' + fmt(sunday);
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function buildBackupPath(baseFolder, fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const yearFolder = String(y);
    const monthFolder = String(m).padStart(2, '0') + ' - ' + capitalize(MESES_LARGO[m - 1]);
    const weekFolder = 'Semana ' + String(getISOWeek(date)).padStart(2, '0') + ' (' + getWeekRangeLabel(date) + ')';
    const fileName = 'comandas-' + fechaISO + '.json';
    return path.join(baseFolder, yearFolder, monthFolder, weekFolder, fileName);
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
