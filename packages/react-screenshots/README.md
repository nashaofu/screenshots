# react-screenshots

> a picture clipping and graffiti tool by react

## Install

[![NPM](https://nodei.co/npm/react-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-screenshots/)

## Usage

1. web 中使用

```js
import React, { PureComponent } from 'react'
import Screenshot from 'react-screenshots'

export default class App extends PureComponent {
  state = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  onSave = ({ viewer, dataURL }) => {
    console.log('点击了保存按钮', dataURL, viewer)
  }

  onCancel = () => {
    console.log('点击了取消按钮')
  }

  onOk = ({ dataURL, viewer }) => {
    console.log('点击了确定按钮', dataURL, viewer)
  }

  render() {
    const { width, height } = this.state
    return (
      <Screenshot
        image="./demo.png"
        width={width}
        height={height}
        onSave={this.onSave}
        onCancel={this.onCancel}
        onOk={this.onOk}
      />
    )
  }
}
```

2. electron 中使用

- electron 中使用可直接加载渲染进程的页面，页面路径为`require.resolve('react-screenshots/dist/index.html')`，不推荐自己手动开发主进程，推荐直接使用`electron-screenshots`模块

```js
const $win = new BrowserWindow({
  /** 窗口参数 */
})
// 加载页面
$win.loadURL(`file://${require.resolve('react-screenshots/dist/index.html')}`)

// 渲染进程页面加载后通知主进程
ipcMain.once('SCREENSHOTS::DOM-READY', () => {
  // 发送需要截取的屏幕信息
  // display = {
  //   id, // 屏幕id
  //   x, // 屏幕位置和大小
  //   y,
  //   width,
  //   height
  // }
  $win.webContents.send('SCREENSHOTS::SEND-DISPLAY-DATA', display)
})

// 渲染进程完成桌面快照捕捉之后的回调
// 通常在这个事件之后再显示窗口，避免截图窗口自己被截图
ipcMain.once('SCREENSHOTS::CAPTURED', () => {
  $win.show()
  $win.focus()
})

// 点击保存按钮事件
ipcMain.on('SCREENSHOTS::SAVE', (e, data) => {})
// 点击取消按钮事件
ipcMain.on('SCREENSHOTS::CANCEL', e => {})
// 点击确定按钮事件
ipcMain.on('SCREENSHOTS::OK', (e, data) => {})
```

## Props

```ts
interface Bounds {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface Data {
  dataURL: string // 图片资源base64
  bounds: Bounds // 截图区域坐标信息
}
```

| 名称     | 说明                 | 类型                           |
| -------- | -------------------- | ------------------------------ |
| image    | 要编辑的图像资源地址 | `string`                       |
| width    | 画布宽度             | `number`                       |
| height   | 画布宽度             | `number`                       |
| onSave   | 保存按钮回调         | `function (data:Data):void {}` |
| onCancel | 取消按钮回调         | `function ():void {}`          |
| onOk     | 取消按钮回调         | `function (data:Data):void {}` |

### example

```js
import React from 'react'

function App() {
  return (
    <Screenshot
      image="./example.png"
      width={window.innerWidth}
      height={window.innerHeight}
      onSave={() => {}}
      onCancel={() => {}}
      onOk={() => {}}
    />
  )
}
```

## Screenshot

![screenshot](https://raw.githubusercontent.com/nashaofu/screenshots/master/packages/react-screenshots/screenshot.jpg)
