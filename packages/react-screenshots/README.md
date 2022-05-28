# react-screenshots

> a screenshot cropper tool by react

## Install

[![NPM](https://nodei.co/npm/react-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-screenshots/)

## Usage

1. web 中使用

```ts
import React, { ReactElement, useCallback } from 'react'
import Screenshots, { Bounds } from 'react-screenshots'
import url from './image.jpg'

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export default function App(): ReactElement {
  const onSave = useCallback((blob: Blob, bounds: Bounds) => {
    console.log('save', blob, bounds)
    console.log(URL.createObjectURL(blob))
  }, [])
  const onCancel = useCallback(() => {
    console.log('cancel')
  }, [])
  const onOk = useCallback((blob: Blob, bounds: Bounds) => {
    console.log('ok', blob, bounds)
    console.log(URL.createObjectURL(blob))
  }, [])

  return (
    <Screenshots
      url={url}
      width={window.innerWidth}
      height={window.innerHeight}
      lang={{
        operation_undo_title: 'Undo',
        operation_mosaic_title: 'Mosaic',
        operation_text_title: 'Text',
        operation_brush_title: 'Brush',
        operation_arrow_title: 'Arrow',
        operation_ellipse_title: 'Ellipse',
        operation_rectangle_title: 'Rectangle'
      }}
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
interface ScreenshotsData {
  bounds: Bounds
  display: Display
}

interface GlobalScreenshots {
  ready: () => void
  reset: () => void
  save: (arrayBuffer: ArrayBuffer, data: ScreenshotsData) => void
  cancel: () => void
  ok: (arrayBuffer: ArrayBuffer, data: ScreenshotsData) => void
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

interface Lang {
  magnifier_position_label: string
  operation_ok_title: string
  operation_cancel_title: string
  operation_save_title: string
  operation_redo_title: string
  operation_undo_title: string
  operation_mosaic_title: string
  operation_text_title: string
  operation_brush_title: string
  operation_arrow_title: string
  operation_ellipse_title: string
  operation_rectangle_title: string
}
```

| 名称     | 说明                 | 类型                                   | 是否必选 |
| -------- | -------------------- | -------------------------------------- | -------- |
| url      | 要编辑的图像资源地址 | `string`                               | 是       |
| width    | 画布宽度             | `number`                               | 是       |
| height   | 画布宽度             | `number`                               | 是       |
| lang     | 多语言支持，默认中文 | `Partial<Lang>`                        | 否       |
| onSave   | 保存按钮回调         | `(blob: Blob, bounds: Bounds) => void` | 否       |
| onCancel | 取消按钮回调         | `() => void`                           | 否       |
| onOk     | 取消按钮回调         | `(blob: Blob, bounds: Bounds) => void` | 否       |

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

![screenshot](../../screenshot.jpg)

## Icons

[Iconfont](https://at.alicdn.com/t/project/572327/6f652e79-fb8b-4164-9fb3-40a705433d93.html?spm=a313x.7781069.1998910419.34)
