const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (fileInfo) => ipcRenderer.invoke('save-file', fileInfo),
    closeWindow: () => ipcRenderer.send('close-window'),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    downloadFile: (url, path, fileName) => ipcRenderer.send('download-video', { url, path, fileName })
});