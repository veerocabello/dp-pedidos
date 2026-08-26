// Puente seguro entre comandas.html/js (que no tiene Node ni acceso al
// sistema, contextIsolation activado) y las capacidades propias de la app
// de escritorio (arranque automático, modo kiosco, comprobar
// actualizaciones). comandas.js comprueba si window.comandasDesktop existe
// antes de mostrar esos controles — si la página se abre en un navegador
// normal (como antes), simplemente no está y esa parte de Ajustes no
// aparece, sin romper nada.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('comandasDesktop', {
  isDesktopApp: true,
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAutoLaunch: () => ipcRenderer.invoke('autolaunch:get'),
  setAutoLaunch: (value) => ipcRenderer.invoke('autolaunch:set', value),
  getKiosk: () => ipcRenderer.invoke('kiosk:get'),
  setKiosk: (value) => ipcRenderer.invoke('kiosk:set', value),
  getBackupFolder: () => ipcRenderer.invoke('backup:getFolder'),
  chooseBackupFolder: () => ipcRenderer.invoke('backup:chooseFolder'),
  saveOrganizedBackup: (fecha, contenido) => ipcRenderer.invoke('backup:save', { fecha, contenido }),
  getUpdatePath: () => ipcRenderer.invoke('update:getPath'),
  setUpdatePath: (value) => ipcRenderer.invoke('update:setPath', value),
  checkForUpdate: () => ipcRenderer.invoke('update:check'),
  installUpdate: (installerPath) => ipcRenderer.invoke('update:install', installerPath),
  // Selector de impresora USB cuando hay varios dispositivos conectados —
  // se muestra dentro de la propia página (grande, táctil) en vez de un
  // diálogo nativo del sistema. onUsbDevicePicker recibe la lista de
  // nombres cuando main.js necesita preguntar; chooseUsbDevice(index)
  // devuelve la elección (-1 = cancelar).
  onUsbDevicePicker: (cb) => ipcRenderer.on('usb-device-picker:show', (event, names) => cb(names)),
  chooseUsbDevice: (index) => ipcRenderer.send('usb-device-picker:choose', index),
  // Impresión silenciosa (sin diálogo) al driver de Windows ya instalado —
  // ver comandas-app/main.js para por qué esto no pasa por WebUSB.
  listPrinters: () => ipcRenderer.invoke('print:list'),
  printSilent: (deviceName, widthMicrons, heightMicrons) => ipcRenderer.invoke('print:silent', { deviceName, widthMicrons, heightMicrons }),
  // Impresión RAW: manda los mismos bytes ESC/POS que la vía USB directa,
  // pero a través de la cola de Windows (ver comandas-app/main.js) en vez de
  // WebUSB o del renderizado de página de Electron.
  printRaw: (bytesBase64, deviceName) => ipcRenderer.invoke('print:raw', { bytesBase64, deviceName }),
});
