/* CipherNest Electron Main Process */
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } = require('electron');
const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let nextProcess   = null;
let pythonProcess = null;

const APP_PORT  = process.env.PORT || 3000;
const API_PORT  = 8000;
const APP_URL   = `http://localhost:${APP_PORT}`;
const API_URL   = `http://localhost:${API_PORT}/api/health`;
const ROOT_DIR  = path.dirname(__dirname);
const NEXT_BUILD_DIR = path.join(ROOT_DIR, '.next');
const PRELOAD_PATH   = path.join(__dirname, 'preload.js');

// ─── Server health check ──────────────────────────────────────────────────────
function isServerReady(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    }).on('error', () => resolve(false));
  });
}

async function waitForServer(url, maxRetries = 60, delayMs = 500) {
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
        BEACON_PORT:   '8001',
        API_PORT:      String(API_PORT),
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
  const hasBuild = fs.existsSync(NEXT_BUILD_DIR);
  const args = hasBuild
    ? ['next', 'start', '-p', String(APP_PORT)]
    : ['next', 'dev',   '-p', String(APP_PORT)];

  console.log(`[CipherNest] Starting Next.js (${hasBuild ? 'production' : 'dev'}) on port ${APP_PORT}...`);

  nextProcess = spawn('npx', args, {
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: hasBuild ? 'production' : 'development' },
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
    console.log('[CipherNest] Next.js already running, attaching...');
  }
}

function stopBackendProcesses() {
  [pythonProcess, nextProcess].forEach((proc) => {
    if (proc) { try { proc.kill('SIGTERM'); } catch (_) {} }
  });
  pythonProcess = null;
  nextProcess   = null;
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
    { label: `FastAPI Server:    Port ${API_PORT}`,  enabled: false },
    { label: `SSH Honeypot:      Port 2222`,         enabled: false },
    { label: `Beacon Receiver:   Port 8001`,         enabled: false },
    { label: `Python Core: ${pythonProcess ? 'Running ✓' : 'Stopped'}`, enabled: false },
    { type: 'separator' },
    { label: 'Quit CipherNest', click: () => app.quit() },
  ]);

  tray.setToolTip('CipherNest — Cyber Deception Console');
  tray.setContextMenu(buildMenu());
  setInterval(() => { if (tray) tray.setContextMenu(buildMenu()); }, 10000);
}

// ─── Window ───────────────────────────────────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'CipherNest — Cyber Defense Console',
    backgroundColor: '#0F172A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
      sandbox: false,
    },
  });

  mainWindow.loadURL(`data:text/html,
    <html><body style="margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#38bdf8;font-size:14px;">
      <div><div style="font-size:22px;font-weight:bold;margin-bottom:12px;">⬡ CipherNest</div>
      <div>Starting deception engine...</div></div>
    </body></html>`);

  // Wait for both Next.js (frontend) and FastAPI (backend)
  const [nextReady] = await Promise.all([
    waitForServer(APP_URL, 80, 500),
    waitForServer(API_URL,  40, 500),
  ]);

  if (nextReady) {
    mainWindow.loadURL(APP_URL);
  } else {
    mainWindow.loadURL(`data:text/html,
      <html><body style="margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#f87171;font-size:14px;">
        <div><div style="font-size:22px;font-weight:bold;margin-bottom:12px;">⬡ CipherNest</div>
        <div>Server failed to start. Check terminal for errors.<br><br>
        Make sure Python deps are installed:<br>
        <code style="background:#1e293b;padding:4px 8px;border-radius:4px;">pip3 install -r backend/requirements.txt</code>
        </div></div></body></html>`);
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
