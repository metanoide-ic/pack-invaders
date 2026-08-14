const { app, BrowserWindow } = require('electron');
const path = require('path');

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
