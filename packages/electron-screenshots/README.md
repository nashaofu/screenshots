# electron-screenshots

> electron 截图插件

## Prerequisites

- electron >= 11

## Install

[![NPM](https://nodei.co/npm/electron-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/electron-screenshots/)

## Features

- 双击页面完成截图，触发`ok`事件
- 右键点击取消截图，触发`cancel`事件
- 多语言支持

## Usage

```ts
import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import Screenshots from './screenshots'

app.whenReady().then(() => {
  const screenshots = new Screenshots()
  globalShortcut.register('ctrl+shift+a', () => {
    screenshots.startCapture()
    screenshots.$view.webContents.openDevTools()
  })
  // 点击确定按钮回调事件
  screenshots.on('ok', (e, buffer, bounds) => {
    console.log('capture', buffer, bounds)
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
  screenshots.on('save', (e, buffer, bounds) => {
    console.log('capture', buffer, bounds)
  })
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

### 注意

- 如果使用了 webpack 打包主进程，请在主进程 webpack 配置中修改如下配置，否则可能会出现不能调用截图窗口的情况

```js
{
  externals: {
    'electron-screenshots': 'require("electron-screenshots")'
  }
}
```

- `vue-cli-plugin-electron-builder`配置示例[vue-cli-plugin-electron-builder-issue](https://github.com/nashaofu/vue-cli-plugin-electron-builder-issue/blob/0f774a90b09e10b02f86fcb6b50645058fe1a4e8/vue.config.js#L1-L8)

```js
// vue.config.js
module.exports = {
  publicPath: '.',
  pluginOptions: {
    electronBuilder: {
      // 不打包，使用 require 加载
      externals: ['electron-screenshots']
    }
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
  x: number
  y: number
  width: number
  height: number
}

class Event {
  public defaultPrevented = false

  public preventDefault(): void {
    this.defaultPrevented = true
  }
}
```

| 名称   | 说明         | 回调参数                                                 |
| ------ | ------------ | -------------------------------------------------------- |
| ok     | 截图确认事件 | `(event: Event, buffer: Buffer, bounds: Bounds) => void` |
| cancel | 截图取消事件 | `(event: Event) => void`                                 |
| save   | 截图保存事件 | `(event: Event, buffer: Buffer, bounds: Bounds) => void` |

### 说明

- event: 事件对象
- buffer: png 图片 buffer
- bounds: 截图区域信息
- `event`对象可调用`preventDefault`方法来阻止默认事件，例如阻止默认保存事件

```ts
const screenshots = new Screenshots()

screenshots.on('save', (e, buffer, bounds) => {
  // 阻止插件自带的保存功能
  // 用户自己控制保存功能
  e.preventDefault()
  // 用户可在这里自己定义保存功能
  console.log('capture', buffer, bounds)
})

screenshots.startCapture()
```

## Screenshot

![screenshot](../../screenshot.jpg)
