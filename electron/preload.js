/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * CipherNest Electron Preload — Secure IPC Bridge
 * Exposes safe, scoped APIs to the Next.js renderer via contextBridge.
 * contextIsolation = true means the renderer has NO direct Node/Electron access.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  /** Query real Docker daemon status from main process */
  getDockerStatus: () => ipcRenderer.invoke('check-docker-status'),

  /** Query Python backend health */
  getPythonStatus: () => ipcRenderer.invoke('check-python-status'),

  /** Tell main process to open a URL in the system browser */
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  /** Platform info */
  platform: process.platform,
});
