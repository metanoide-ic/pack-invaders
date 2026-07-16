/* HUMANOCRACY — executável desktop (Electron) para o build Steam.
   Rodar em dev:  npm run humanocracy   (na raiz do repositório)
   Empacotar:     ver steam/README.md                                  */
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1100,
    minHeight: 640,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#1a1c19',
    title: 'HUMANOCRACY',
    webPreferences: {
      contextIsolation: true,
      // o save usa localStorage; o Electron o persiste em userData automaticamente
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '..', 'index.html'));

  globalShortcut.register('F11', () => win.setFullScreen(!win.isFullScreen()));
  globalShortcut.register('Alt+Enter', () => win.setFullScreen(!win.isFullScreen()));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => globalShortcut.unregisterAll());
