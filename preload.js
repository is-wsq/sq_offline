const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (fileInfo) => ipcRenderer.invoke('save-file', fileInfo),
});