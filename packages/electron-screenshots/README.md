# electron-screenshots

> electron 截图插件

## Install

[![NPM](https://nodei.co/npm/electron-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/electron-screenshots/)

## Usage

```ts
import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import Screenshots from './screenshots'

app.on('ready', () => {
  const screenshots = new Screenshots()
  globalShortcut.register('ctrl+shift+a', () => screenshots.startCapture())
  // 点击确定按钮回调事件
  screenshots.on('ok', (e, { viewer }) => {
    console.log('capture', viewer)
  })
  // 点击取消按钮回调事件
  screenshots.on('cancel', () => {
    console.log('capture', 'cancel1')
  })
  screenshots.on('cancel', e => {
    // 执行了preventDefault
    // 点击取消不会关闭截图窗口
    e.preventDefault()
    console.log('capture', 'cancel2')
  })
  // 点击保存按钮回调事件
  screenshots.on('save', (e, { viewer }) => {
    console.log('capture', viewer)
  })
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**注意**：如果使用了 webpack 打包主进程，请在主进程 webpack 配置中修改如下配置，否则可能会出现不能调用截图窗口的情况

```js
{
  externals: {
    'electron-screenshots': 'require("electron-screenshots")'
  }
}
```

## Methods

| 名称         | 说明             | 参数 | 返回值 |
| ------------ | ---------------- | ---- | ------ |
| startCapture | 调用截图方法截图 | -    | -      |
| endCapture   | 手动结束截图     | -    | -      |

## Events

- 数据类型

```ts
interface Bounds {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface CaptureData {
  dataURL: string // 图片资源base64
  bounds: Bounds // 截图区域坐标信息
}

type OkData = CaptureData
type SaveData = CaptureData
```

| 名称   | 说明         | 回调参数                                  |
| ------ | ------------ | ----------------------------------------- |
| ok     | 截图确认事件 | `event`:事件对象, `data:OkData`: 截图信息 |
| cancel | 截图取消事件 | `event`:事件对象                          |
| save   | 截图保存事件 | `event`:事件对象，`data:OkData`: 截图信息 |

`event`对象可调用`preventDefault`方法来阻止默认事件，例如阻止默认保存事件

```js
const screenshots = new Screenshots()

screenshots.on('save', (e, data) => {
  // 阻止插件自带的保存功能
  // 用户自己控制保存功能
  e.preventDefault()
  // 用户可在这里自己定义保存功能
  console.log('capture', data)
})

screenshots.startCapture()
```

## Screenshot

![screenshot](https://raw.githubusercontent.com/nashaofu/screenshots/master/packages/electron-screenshots/screenshot.jpg)
