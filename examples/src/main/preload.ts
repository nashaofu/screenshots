import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('$api', {
  getPlatform: async () => {
    return await ipcRenderer.invoke('getPlatform');
  },
  screenshot: async () => {
    return await ipcRenderer.invoke('screenshot');
  },
});
