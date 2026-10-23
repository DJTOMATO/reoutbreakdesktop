const { app, BrowserWindow, ipcMain, nativeImage, powerSaveBlocker, session, shell } = require('electron');
const path = require('path');

const TARGET_URL = 'https://outbreakweb.com/';
const ALLOWED_HOST = 'outbreakweb.com';

// Maximize GPU, WebGPU, WebAssembly, Audio, and Network hardware capabilities
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('force_high_performance_gpu');
app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disk-cache-size', String(1024 * 1024 * 1024));

// Prevent background throttling so online multiplayer (NETWORK PLAY) never desyncs or disconnects
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// Ensure WebAssembly JSPI, Exception Handling (try_table), Tail Calls, and SIMD are enabled
app.commandLine.appendSwitch('enable-experimental-web-platform-features');

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-features', 'Vulkan,WebAssemblyJSPI');
} else {
  app.commandLine.appendSwitch('enable-features', 'WebAssemblyJSPI');
}

app.setName('Outbreak Web');
if (process.platform === 'win32') {
  app.setAppUserModelId('com.glas.outbreakweb');
}

let mainWindow = null;
let powerSaveId = null;

function getCleanUserAgent() {
  return app.userAgentFallback
    .replace(/\s*Electron\/[^\s]+/i, '')
    .replace(/\s*(?:outbreak-web|reoutbreakdesktop)\/[^\s]+/i, '');
}

function getAppIcon() {
  const icoPath = path.join(__dirname, 'icon.ico');
  const pngPath = path.join(__dirname, 'icon.png');
  const icon = nativeImage.createFromPath(process.platform === 'win32' ? icoPath : pngPath);
  return icon.isEmpty() ? undefined : icon;
}

function createWindow() {
  const userAgent = getCleanUserAgent();

  // Grant hardware & media permissions for outbreakweb.com (Gamepad, WebGPU, Fullscreen, Audio, PointerLock)
  const allowedPermissions = new Set([
    'fullscreen',
    'pointerLock',
    'gamepad',
    'hid',
    'media',
    'audioCapture',
    'clipboard-read',
    'clipboard-sanitized-write',
    'idle-detection',
    'window-management'
  ]);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    try {
      const url = new URL(webContents.getURL());
      if (url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`)) {
        callback(allowedPermissions.has(permission));
        return;
      }
    } catch (_) {
      // Ignore invalid URLs
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    try {
      const url = new URL(requestingOrigin);
      if (url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`)) {
        return allowedPermissions.has(permission);
      }
    } catch (_) {
      // Ignore invalid URLs
    }
    return false;
  });

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'Resident Evil Outbreak — Outbreak·Web',
    backgroundColor: '#090707',
    autoHideMenuBar: true,
    fullscreenable: true,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webgl: true,
      backgroundThrottling: false,
      paintWhenInitiallyHidden: true,
      spellcheck: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setUserAgent(userAgent);

  // Open external links (e.g., Discord invite on outbreakweb.com) in the default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === ALLOWED_HOST || parsed.hostname.endsWith(`.${ALLOWED_HOST}`)) {
        return { action: 'allow' };
      }
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch (_) {
      // Ignore malformed URLs
    }
    return { action: 'deny' };
  });

  // Prevent in-window navigation away from outbreakweb.com to external sites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'file:') {
        return;
      }
      if (parsed.hostname !== ALLOWED_HOST && !parsed.hostname.endsWith(`.${ALLOWED_HOST}`)) {
        event.preventDefault();
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          shell.openExternal(url);
        }
      }
    } catch (_) {
      event.preventDefault();
    }
  });

  // Window-scoped keyboard shortcuts (no global OS shortcut hijacking)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;

    if (input.key === 'F5' || (input.control && !input.alt && input.key.toLowerCase() === 'r')) {
      event.preventDefault();
      mainWindow.reload();
    } else if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    } else if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      event.preventDefault();
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Fallback to local splash/retry view if network fails
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return; // Ignore aborted loads (-3)
    if (validatedURL && validatedURL.startsWith('https://')) {
      mainWindow.loadFile('index.html', { query: { error: '1' } });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
  createWindow();
});

ipcMain.on('load-site', (event, url) => {
  if (!mainWindow) return;
  try {
    const parsed = new URL(url || TARGET_URL);
    if (parsed.hostname === ALLOWED_HOST || parsed.hostname.endsWith(`.${ALLOWED_HOST}`)) {
      mainWindow.loadURL(parsed.toString());
    } else {
      mainWindow.loadURL(TARGET_URL);
    }
  } catch (_) {
    mainWindow.loadURL(TARGET_URL);
  }
});

ipcMain.on('retry-connection', () => {
  if (mainWindow) {
    mainWindow.loadURL(TARGET_URL);
  }
});

app.on('window-all-closed', () => {
  if (powerSaveId !== null && powerSaveBlocker.isStarted(powerSaveId)) {
    powerSaveBlocker.stop(powerSaveId);
    powerSaveId = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
