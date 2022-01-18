# react-screenshots

> a picture clipping and graffiti tool by react

## Install

[![NPM](https://nodei.co/npm/react-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-screenshots/)

## Usage

1. web 中使用

```js
import React, { useCallback } from 'react'
import Screenshot from 'react-screenshots'
import 'react-screenshots/lib/style.css'

import url from './Battlecry.jpg'

export default function App() {
  const onSave = useCallback((blob, bounds) => {
    console.log('save', blob, bounds)
  }, [])
  const onCancel = useCallback(() => {
    console.log('cancel')
  }, [])
  const onOk = useCallback((blob, bounds) => {
    console.log('ok', blob, bounds)
  }, [])

  return (
    <Screenshots
      url={url}
      width={window.innerWidth}
      height={window.innerHeight}
      onSave={onSave}
      onCancel={onCancel}
      onOk={onOk}
    />
  )
}
```

2. electron 中使用

- electron 中使用可直接加载渲染进程的页面，页面路径为`require.resolve('react-screenshots/electron/electron.html')`，不推荐自己手动开发主进程，推荐直接使用`electron-screenshots`模块

```ts
interface GlobalScreenshots {
  ready: () => void
  capture: (display: Display) => Promise<string>
  captured: () => void
  save: (arrayBuffer: ArrayBuffer, bounds: Bounds) => void
  cancel: () => void
  ok: (arrayBuffer: ArrayBuffer, bounds: Bounds) => void
  on: (channel: string, fn: ScreenshotsListener) => void
  off: (channel: string, fn: ScreenshotsListener) => void
}

// 需要在electron的preload中提前初始化这个对象，用于渲染进程与主进程通信
window.screenshots: GlobalScreenshots
```

## Props

```ts
interface Bounds {
  x: number
  y: number
  width: number
  height: number
}
```

| 名称     | 说明                 | 类型                                   |
| -------- | -------------------- | -------------------------------------- |
| url      | 要编辑的图像资源地址 | `string`                               |
| width    | 画布宽度             | `number`                               |
| height   | 画布宽度             | `number`                               |
| onSave   | 保存按钮回调         | `(blob: Blob, bounds: Bounds) => void` |
| onCancel | 取消按钮回调         | `() => void`                           |
| onOk     | 取消按钮回调         | `(blob: Blob, bounds: Bounds) => void` |

### example

```js
import React from 'react'

function App() {
  return (
    <Screenshot
      url="./example.png"
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

## Icons

[Iconfont](https://at.alicdn.com/t/project/572327/6f652e79-fb8b-4164-9fb3-40a705433d93.html?spm=a313x.7781069.1998910419.34)
