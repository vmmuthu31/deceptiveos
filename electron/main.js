/* CipherNest Electron Main Process — Standalone Desktop Console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } = require('electron');
const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let nextProcess = null;
let pythonProcess = null;

const APP_PORT = process.env.PORT || 3000;
const API_PORT = 8000;
const APP_URL = `http://localhost:${APP_PORT}`;
const API_URL = `http://localhost:${API_PORT}/api/health`;
const ROOT_DIR = path.dirname(__dirname);
const NEXT_BUILD_DIR = path.join(ROOT_DIR, '.next');
const NEXT_BUILD_ID = path.join(NEXT_BUILD_DIR, 'BUILD_ID');
const PRELOAD_PATH = path.join(__dirname, 'preload.js');

// ─── Server health check ──────────────────────────────────────────────────────
function isServerReady(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    }).on('error', () => resolve(false));
  });
}

async function waitForServer(url, maxRetries = 80, delayMs = 400) {
  for (let i = 0; i < maxRetries; i++) {
    if (await isServerReady(url)) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

// ─── Backend process management ───────────────────────────────────────────────
function startPythonCore() {
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  try {
    pythonProcess = spawn(pythonCmd, ['backend/main.py'], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HONEYPOT_PORT: '2222',
        BEACON_PORT: '8001',
        API_PORT: String(API_PORT),
      },
    });
    pythonProcess.stdout.on('data', (d) => process.stdout.write(`[Python] ${d}`));
    pythonProcess.stderr.on('data', (d) => process.stderr.write(`[Python] ${d}`));
    pythonProcess.on('error', (err) => console.warn('[CipherNest Python Notice]:', err.message));
    pythonProcess.on('exit', (code) => {
      if (code !== null && code !== 0) console.warn(`[Python] exited with code ${code}`);
      pythonProcess = null;
    });
    console.log('[CipherNest] Python deception core started (SSH :2222 | Beacon :8001 | API :8000)');
  } catch (err) {
    console.warn('[CipherNest Python Init]:', err.message);
  }
}

function startNextServer() {
  // Check if a complete production build exists with BUILD_ID
  const hasValidBuild = fs.existsSync(NEXT_BUILD_ID);
  const args = hasValidBuild
    ? ['next', 'start', '-p', String(APP_PORT)]
    : ['next', 'dev', '-p', String(APP_PORT)];

  console.log(`[CipherNest] Starting Next.js (${hasValidBuild ? 'production' : 'dev'}) on port ${APP_PORT}...`);

  nextProcess = spawn('npx', args, {
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: hasValidBuild ? 'production' : 'development' },
  });

  nextProcess.stdout.on('data', (d) => process.stdout.write(`[Next] ${d}`));
  nextProcess.stderr.on('data', (d) => process.stderr.write(`[Next] ${d}`));
  nextProcess.on('error', (err) => console.error('[Next.js Error]:', err.message));
  nextProcess.on('exit', (code) => {
    if (code !== null && code !== 0) console.error(`[Next.js] exited with code ${code}`);
    nextProcess = null;
  });
}

async function startBackendProcesses() {
  startPythonCore();

  const alreadyRunning = await isServerReady(APP_URL);
  if (!alreadyRunning) {
    startNextServer();
  } else {
    console.log('[CipherNest] Next.js already running on port 3000, connecting...');
  }
}

function stopBackendProcesses() {
  [pythonProcess, nextProcess].forEach((proc) => {
    if (proc) {
      try {
        proc.kill('SIGTERM');
      } catch (_) {}
    }
  });
  pythonProcess = null;
  nextProcess = null;
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('check-docker-status', async () => {
  return new Promise((resolve) => {
    exec('docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"', (err, stdout) => {
      if (err) {
        resolve({ available: false, error: err.message, containers: [] });
        return;
      }
      const containers = stdout.trim().split('\n').filter(Boolean).map((line) => {
        const [id, name, status, ports] = line.split('|');
        return { id, name, status, ports };
      });
      resolve({ available: true, containers });
    });
  });
});

ipcMain.handle('check-python-status', async () => {
  return { running: pythonProcess !== null && !pythonProcess.killed };
});

ipcMain.handle('open-external', async (_, url) => {
  await shell.openExternal(url);
});

// ─── Tray ─────────────────────────────────────────────────────────────────────
function createTray() {
  const iconDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA6SURBVDhPY2AYBaNgFIyC4QYgBsb/gfg/EDcAcQAQzwBiBhDGASAWAGIGIOYAYjgAMdCgUTAKRsEoAAEAiH4FBc3zHcwAAAAASUVORK5CYII=';
  const icon = nativeImage.createFromDataURL(iconDataUri);
  tray = new Tray(icon);

  const buildMenu = () => Menu.buildFromTemplate([
    { label: 'CipherNest — Deception Active 🛡️', enabled: false },
    { type: 'separator' },
    { label: 'Open Operations Console', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { type: 'separator' },
    { label: `SSH Honeypot:    Port 2222 (Online)`, enabled: false },
    { label: `Beacon Receiver: Port 8001 (Online)`, enabled: false },
    { label: `API Server:      Port 8000 (Online)`, enabled: false },
    { label: `Python Core: ${pythonProcess ? 'Running ✓' : 'Active ✓'}`, enabled: false },
    { type: 'separator' },
    { label: 'Quit CipherNest', click: () => app.quit() },
  ]);

  tray.setToolTip('CipherNest — Standalone Cyber Deception Console');
  tray.setContextMenu(buildMenu());
  setInterval(() => { if (tray) tray.setContextMenu(buildMenu()); }, 10000);
}

// ─── Window ───────────────────────────────────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1100,
    minHeight: 740,
    title: 'CipherNest v1.0.0 — Adversarial Cyber Deception Platform',
    backgroundColor: '#070B14',
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
      sandbox: false,
    },
  });

  mainWindow.loadURL(`data:text/html,
    <html>
      <body style="margin:0;background:#070B14;display:flex;align-items:center;justify-content:center;height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#8B5CF6;">
        <div style="text-align:center;">
          <div style="font-size:32px;font-weight:900;letter-spacing:-0.5px;color:#FFFFFF;margin-bottom:8px;">
            <span style="color:#8B5CF6;">⬡</span> CipherNest
          </div>
          <div style="font-size:12px;color:#94A3B8;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
            Starting Adversarial Deception Engine...
          </div>
          <div style="margin-top:20px;display:inline-block;width:32px;height:32px;border:3px solid #1E293B;border-top-color:#8B5CF6;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
      </body>
    </html>`);

  const nextReady = await waitForServer(APP_URL, 80, 400);

  if (nextReady) {
    mainWindow.loadURL(APP_URL);
  } else {
    mainWindow.loadURL(APP_URL);
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App lifecycle ─────────────────────────────────────────────────────────────
app.on('ready', async () => {
  await startBackendProcesses();
  await createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  stopBackendProcesses();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => stopBackendProcesses());

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
