
"use strict";
const getBrowserWindowRuntime = ()=>{
 return require('electron').BrowserWindow.getAllWindows()[0]; 
}


Object.defineProperty(exports, "__esModule", {
  value: true
});
