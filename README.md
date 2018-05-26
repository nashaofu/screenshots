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
  dirname?: string
})
```

| 名称 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| dirname | string | 本插件所在文件夹，目的是使得插件能够正确引用资源，如窗口界面 | path.join(app.getAppPath(), 'node_modules/shortcut-capture') |

## Properties

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| $win | Electron.BrowserWindow | 截图窗口对象 |

## Methods

| 名称 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| shortcutCapture | 调用截图方法直接截图 | - | - |

## TODOS

- [x] 截图区域移动
- [x] 截图区域大小调整
- [x] 主显示器切换支持，显示器变动支持
- [ ] 对各个平台进行不同样式的显示，窗口大小等等，windows平台已经完美支持，其他平台还需调整与优化

## 问题

* 高分屏作为主显示器是截图质量很低，以低分屏作为主显示器时，截图效果较为理想
