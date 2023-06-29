// src/template/entry-prod.js
var { app, BrowserWindow } = require("electron");
var path = require("path");
var fs = require("fs");
app.on("ready", () => {
  var _a;
  let userConfig = {};
  if (fs.existsSync(path.join(__dirname, "./config.js"))) {
    userConfig = require("./config").default;
  }
  const bw = new BrowserWindow({
    ...userConfig.browserWindow,
    webPreferences: {
      ...((_a = userConfig.browserWindow) == null ? void 0 : _a.webPreferences) || {},
      preload: path.join(__dirname, "./preload.js")
    }
  });
  bw.loadFile(path.join(__dirname, "./renderer/index.html")).then(() => {
    require("./index.js");
  });
  try {
    fs.readdirSync(path.join(__dirname, "./ipc")).forEach((file) => {
      const ipcFilepath = path.join(__dirname, "./ipc", file);
      require(ipcFilepath);
    });
  } catch (error) {
    console.log(error);
  }
});
