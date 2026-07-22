import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { existsSync } from 'fs';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcessWithoutNullStreams | null = null;

const SERVER_PORT = 8080;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    title: 'CipherNest',
  });

  const devUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  mainWindow.loadURL(devUrl);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = join(__dirname, '../rust/ciphernest-server');
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev && !existsSync(serverPath)) {
    console.log('Server binary not found, assuming external server is running');
    return;
  }

  serverProcess = spawn(serverPath, [], {
    env: { ...process.env, RUST_LOG: 'info' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[server] ${data}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[server] ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`[server] exited with code ${code}`);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

ipcMain.handle('get-server-url', () => SERVER_URL);
ipcMain.handle('open-external', async (_event, url: string) => {
  await shell.openExternal(url);
  return true;
});
