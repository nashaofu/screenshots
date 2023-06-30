import { app, BrowserWindow, screen, ipcMain } from "electron";
import os from 'os'
import path from "path";
import { Screenshots } from "akey-electron-screenshots";
import log from "electron-log";
// @ts-ignore

import { clearLog } from './log'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:8000");

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainWindow = createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle("screenshot", () => {
    console.log("hit screenshot");
    const screenshotsIns = new Screenshots();
    const isMacFullscreenHide = mainWindow.isFullScreen();
    screenshotsIns.startCapture({ isMacFullscreenHide: isMacFullscreenHide });
    return `hi, i'm from screenshot`;
  });

  ipcMain.handle("log-info", () => {
    log.info(`Info Test: ${new Date()}`);
  });

  ipcMain.handle("log-error", () => {
    log.info(`Error Test: ${new Date()}`);
  });

  ipcMain.handle("log-show", () => {
    const appData = app.getPath('appData');
    const appName = 'akey-im-desk';
    const path = `${appData}/${appName}/logs`
    return path;
  });
  
  ipcMain.handle("log-clear", async () => {
    const appData = app.getPath('appData');
    const appName = 'akey-im-desk';
    const path = `${appData}/${appName}/logs`
    await clearLog(path)
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



/**
 * 
 * pathList {
    appData: '/Users/ansiyuan/Library/Application Support',
    appName: 'akey-im-desk',
    appVersion: '2.4.0',
    electronDefaultDir: '/Users/ansiyuan/Library/Logs/Electron',
    home: '/Users/ansiyuan',
    libraryDefaultDir: '/Users/ansiyuan/Library/Logs/akey-im-desk',
    libraryTemplate: '/Users/ansiyuan/Library/Logs/{appName}',
    temp: '/var/folders/j3/psqzz65j4r38xjm2q8cmr6gh0000gn/T/',
    userData: '/Users/ansiyuan/Library/Application \Support/akey-im-desk'
  }
 */