const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const steam = require('./steam.cjs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Linha Zero',
    backgroundColor: '#0a0e18',
    autoHideMenuBar: true,
    fullscreenable: true,
    // Windows/macOS get their icon baked in at packaging time (see
    // forge.config.cjs); Linux window managers read it from the running
    // BrowserWindow instead, so it's set here too.
    icon: path.join(__dirname, '..', 'assets', 'icons', 'icon-1024.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load the built Vite output — run `npm run build` first.
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Maximize after content loads, so the first frame isn't a tiny window.
  win.webContents.on('did-finish-load', () => {
    win.maximize();
  });

  // F11 fullscreen toggle — the convention Steam players expect from a game window.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  // Open DevTools to see errors (remove in production)
  // win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  steam.init(); // no-ops safely if Steam/an App ID isn't available — see electron/steam.cjs
  ipcMain.handle('steam:isAvailable', () => steam.isAvailable());
  ipcMain.handle('steam:unlockAchievement', (_event, id) => steam.unlockAchievement(id));
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
