
"use strict";
const getBrowserWindowRuntime = ()=>{
 return require('electron').BrowserWindow.getAllWindows()[0]; 
}


var _electron = require("electron");
_electron.ipcMain.handle('getPlatform', function () {
  return "hi, i'm from ".concat(process.platform);
});
