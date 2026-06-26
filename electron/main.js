const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Pack Invaders',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the built Vite output
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Maximize after content loads
  win.webContents.on('did-finish-load', () => {
    win.maximize();
  });

  // F11 fullscreen toggle
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
