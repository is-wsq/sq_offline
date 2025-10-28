const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    downloadFile: (url, path, fileName) => ipcRenderer.send('download-video', { url, path, fileName }),
});