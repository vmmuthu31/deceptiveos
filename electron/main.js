/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { exec } = require('child_process');

let mainWindow;
let tray;

function createTray() {
  const iconDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA6SURBVDhPY2AYBaNgFIyC4QYgBsb/gfg/EDcAcQAQzwBiBhDGASAWAGIGIOYAYjgAMdCgUTAKRsEoAAEAiH4FBc3zHcwAAAAASUVORK5CYII=';
  const icon = nativeImage.createFromDataURL(iconDataUri);

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'CipherNest: Protected 🛡️', enabled: false },
    { type: 'separator' },
    {
      label: 'Open Operations Console',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { label: 'Active Decoys: 2 Active Containers', enabled: false },
    { label: 'Starknet STRK20 Pool: Active', enabled: false },
    { type: 'separator' },
    {
      label: 'Quit CipherNest',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('CipherNest — Private Cyber Defense Console');
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CipherNest — Private Cyber Defense Console',
    backgroundColor: '#F8FAFC',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const appUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(appUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Docker CLI status check via IPC
ipcMain.handle('check-docker-status', async () => {
  return new Promise((resolve) => {
    exec('docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"', (error, stdout) => {
      if (error) {
        resolve({ available: false, error: error.message, containers: [] });
        return;
      }
      const lines = stdout.trim().split('\n').filter(Boolean);
      const containers = lines.map((line) => {
        const [id, name, status, ports] = line.split('|');
        return { id, name, status, ports };
      });
      resolve({ available: true, containers });
    });
  });
});

app.on('ready', () => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
