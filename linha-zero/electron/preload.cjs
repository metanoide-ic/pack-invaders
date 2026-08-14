const { contextBridge, ipcRenderer } = require('electron');

// Minimal, explicit surface — the renderer (the game itself) never gets
// direct Node/Electron access, only these few whitelisted calls.
contextBridge.exposeInMainWorld('steamBridge', {
  isAvailable: () => ipcRenderer.invoke('steam:isAvailable'),
  unlockAchievement: (id) => ipcRenderer.invoke('steam:unlockAchievement', id),
});
