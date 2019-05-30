# shortcut-capture

electron shortcut capture plugin(electron 截图模块插件)。注意：1.1.x和1.0.x版本有API的改动，所以会有不兼容的地方，请参考API，1.1.x主要支持了窗口关闭不能结束应用的问题。参考[https://github.com/nashaofu/shortcut-capture/issues/4](https://github.com/nashaofu/shortcut-capture/issues/4)和[https://github.com/nashaofu/shortcut-capture/issues/7](https://github.com/nashaofu/shortcut-capture/issues/7)

## Install

[![NPM](https://nodei.co/npm/shortcut-capture.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/shortcut-capture/)

## Usage

```js
import { app, globalShortcut } from 'electron'
import ShortcutCapture from 'shortcut-capture'

app.on('ready', () => {
  // 必须在ready之后初始化，否者会报错
  const shortcutCapture = new ShortcutCapture()
  globalShortcut.register('ctrl+alt+a', () => shortcutCapture.shortcutCapture())
  console.log(shortcutCapture)
  // 拿取截图后返回信息
  shortcutCapture.on('capture', ({ dataURL, bounds }) => console.log(dataURL, bounds))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**注意**：如果使用了webpack等工具来打包主进程，请在主进程webpack配置中修改如下配置

```js
{
  externals: {
    'shortcut-capture': 'require("shortcut-capture")'
  }
}
```

## Options

```typescript
new ShortcutCapture({
  isUseClipboard: true
})
```

| 名称 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| isUseClipboard | boolean | 是否使用剪切板，即是否把图片资源写入剪切板  | `true` |

## Methods

| 名称 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| shortcutCapture | 调用截图方法直接截图 | - | - |

## Events

| 名称 | 说明 | 回调参数 |
| --- | --- | --- |
| capture | 截图确认后后调 | `dataURL`-图片资源, `bounds`-截图区域信息 |

## Screenshot

![screenshot](./screenshot.png)

## TODOS

- [x] 截图区域移动
- [x] 截图区域大小调整
- [x] 主显示器切换支持，显示器变动支持
- [x] Mac 多显示器截图还存在问题
- [ ] 对各个平台进行不同样式的显示，窗口大小等等，windows 平台已经完美支持，其他平台还需调整与优化

## 问题

- 高分屏作为主显示器是截图质量很低，以低分屏作为主显示器时，截图效果较为理想
