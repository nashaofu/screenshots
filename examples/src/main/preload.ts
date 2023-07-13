import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("$api", {
  getPlatform: async () => {
    return await ipcRenderer.invoke("getPlatform");
  },
  screenshot: async () => {
    return await ipcRenderer.invoke("screenshot");
  },
  logInfo: async () => {
    return await ipcRenderer.invoke("log-info");
  },
  logError: async () => {
    return await ipcRenderer.invoke("log-error");
  },
  showLog: async () => {
    return await ipcRenderer.invoke("log-show");
  },
  clearLog: async () => {
    return await ipcRenderer.invoke("log-clear");
  },
  diskDetail: async () => {
    return await ipcRenderer.invoke("disk-detail");
  },
  handleScreenShot: (callback: any) => {
    ipcRenderer.on('screenshot:ok', callback)
  },
  rmHandleScreenShot: (callback: any) => {
    ipcRenderer.removeListener('screenshot:ok', callback)
  }
});
