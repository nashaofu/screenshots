# shortcut-capture

electron shortcut capture plugin(electron截图模块插件)

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
  shortcutCapture.on('capture', ({ dataURL, bound }) => console.log(dataURL, bound))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

## Options

```typescript
new ShortcutCapture({
  dirname?: string,
  isUseClipboard?: true
})
```

| 名称 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| dirname | string | 本插件所在文件夹，目的是使得插件能够正确引用资源，如窗口界面 | `path.join(app.getAppPath(), 'node_modules/shortcut-capture')` |
| isUseClipboard | boolean | 是否使用剪切板，即是否把图片资源写入剪切板 | `true` |

## Properties

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| $win | Electron.BrowserWindow | 截图窗口对象 |

## Methods

| 名称 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| shortcutCapture | 调用截图方法直接截图 | - | - |
| destroy | 销毁截图对象 | - | - |

## Events

| 名称 | 说明 | 回调参数 |
| --- | --- | --- |
| capture | 截图确认后后调 | `dataURL`-图片资源, `bound`-截图区域信息 |

## Screenshot

![screenshot](./screenshot.png)

## TODOS

- [x] 截图区域移动
- [x] 截图区域大小调整
- [x] 主显示器切换支持，显示器变动支持
- [ ] 对各个平台进行不同样式的显示，窗口大小等等，windows平台已经完美支持，其他平台还需调整与优化
- [ ] Mac多显示器截图还存在问题

## 问题

* 高分屏作为主显示器是截图质量很低，以低分屏作为主显示器时，截图效果较为理想
