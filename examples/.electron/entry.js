// src/template/entry-dev.js
var electron = require("electron");
var fs = require("fs");
var path = require("path");
var decache = require("clear-module");
var { join, parse } = require("path");
var _ = require("lodash");
var chokidar = require("chokidar");
var mPath = path.join(__dirname, "./dist/index.js");
var { UMI_APP_PORT = "8000" } = process.env;
var main = async () => {
  const context = { browserWindow: null, electron };
  let userConfig = {};
  if (fs.existsSync(join(__dirname, "./dist/config.js"))) {
    userConfig = require("./dist/config").default;
  } else {
    console.log(`[config] user config not found`);
  }
  const _config = _.merge(userConfig.browserWindow || {}, {
    webPreferences: {
      preload: join(__dirname, "./dist/preload.js")
    }
  });
  const _ipcMain = electron.ipcMain;
  const _ipcMainOnMap = {};
  const _ipcHandleMap = {};
  const hackContext = (_context) => {
    const _on = (filepath) => (channel, listener) => {
      if (!_ipcMainOnMap[filepath]) {
        _ipcMainOnMap[filepath] = {
          channels: [],
          listeners: []
        };
      }
      _ipcMainOnMap[filepath].channels.push(channel);
      _ipcMainOnMap[filepath].listeners.push(listener);
      _ipcMain.on(channel, listener);
    };
    _on._hof = true;
    _context.electron = {
      ...electron,
      ipcMain: {
        ..._ipcMain,
        on: _on,
        handle: (filepath) => (channel, listener) => {
          if (!_ipcHandleMap[filepath]) {
            _ipcHandleMap[filepath] = {
              channels: [],
              listeners: []
            };
          }
          _ipcHandleMap[filepath].channels.push(channel);
          _ipcHandleMap[filepath].listeners.push(listener);
          return _ipcMain.handle(channel, listener);
        }
      }
    };
    return _context;
  };
  context.browserWindow = new electron.BrowserWindow(_config);
  await context.browserWindow.loadURL(`http://localhost:${UMI_APP_PORT}`);
  require(mPath).call(exports, hackContext(context));
  let ipcFiles = [];
  const unmountAllIpc = () => {
    ipcFiles.forEach((ipcPath) => hotReplaceModule(ipcPath));
  };
  const clearEvents = (filepath) => {
    if (_ipcMainOnMap[filepath]) {
      const { channels, listeners } = _ipcMainOnMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeListener(channel, listeners[index]);
      });
      _ipcMainOnMap[filepath] = void 0;
    }
    if (_ipcHandleMap[filepath]) {
      const { channels, listeners } = _ipcHandleMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeHandler(channel, listeners[index]);
      });
      _ipcHandleMap[filepath] = void 0;
    }
  };
  const unmountModule = (filepath) => {
    clearEvents(filepath);
    decache(filepath);
  };
  const mountMoudle = (filepath) => {
    const _module = require(filepath);
    _module.call(exports, hackContext(context));
  };
  const hotReplaceModule = (filepath) => {
    console.log("[hrm] ", filepath);
    unmountModule(filepath);
    mountMoudle(filepath);
  };
  const hotReplacePreload = () => {
    context.browserWindow.reload();
  };
  const src = path.join(__dirname, "./dist");
  const isIpcFile = (filepath) => {
    return parse(filepath).dir === join(src, "ipc") && /\.js$/.test(filepath);
  };
  chokidar.watch(src, {
    usePolling: true
  }).on("change", (filepath) => {
    if (join(src, "preload.js") === filepath) {
      hotReplacePreload();
    } else if (join(src, "config.js") === filepath) {
      console.log("[info] config changed, restart application to take effect.");
    } else if (isIpcFile(filepath)) {
      hotReplaceModule(filepath);
    } else if (filepath === mPath) {
      hotReplaceModule(mPath);
    } else {
      hotReplaceModule(mPath);
      unmountAllIpc();
    }
  }).on("unlink", (filepath) => {
    if (isIpcFile(filepath)) {
      ipcFiles = ipcFiles.filter((ipcPath) => ipcPath !== filepath);
      unmountModule(filepath);
    }
  }).on("add", (filepath) => {
    if (isIpcFile(filepath)) {
      ipcFiles.push(filepath);
      mountMoudle(filepath);
    }
  });
};
electron.app.on("ready", () => {
  main();
});
