const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadSite: (url) => ipcRenderer.send('load-site', url),
  retryConnection: () => ipcRenderer.send('retry-connection')
});
