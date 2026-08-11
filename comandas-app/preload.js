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
  getUpdatePath: () => ipcRenderer.invoke('update:getPath'),
  setUpdatePath: (value) => ipcRenderer.invoke('update:setPath', value),
  checkForUpdate: () => ipcRenderer.invoke('update:check'),
  installUpdate: (installerPath) => ipcRenderer.invoke('update:install', installerPath),
});
