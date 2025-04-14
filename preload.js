const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (fileInfo) => ipcRenderer.invoke('save-file', fileInfo),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    downloadFile: (url, path) => ipcRenderer.send('download-video', { url, path })
});