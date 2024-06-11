# fork from https://github.com/nashaofu/screenshots

# 📷 screenshots

`screenshots`是一个基于`electron`和`react`的截图插件，可以快速地实现截图功能，并支持多种截图操作，例如马赛克、文本、画笔、箭头、椭圆和矩形。此外，还提供了多语言支持，可以轻松地适配不同的语言环境。

在线示例：[https://nashaofu.github.io/screenshots/](https://nashaofu.github.io/screenshots/)

![react-screenshots](./screenshot.jpg)

## 特性

- 双击页面完成截图，触发`ok`事件，如果未选择截图区域，双击截取全屏，如果选择了截图区域，双击截取选择区域
- 右键点击取消截图，触发`cancel`事件
- 多语言支持
- 截图操作：马赛克、文本、画笔、箭头、椭圆、矩形

## electron-screenshots

[electron-screenshots](./packages/electron-screenshots/README.md)是`screenshots`的一个子项目，提供了与`electron`截图相关的功能。

### 安装

[![NPM](https://nodei.co/npm/electron-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/electron-screenshots/)

## react-screenshots

[react-screenshots](./packages/react-screenshots/README.md)是`screenshots`的另一个子项目，提供了与`react`相关的截图界面插件，可以与`electron-screenshots`渲染进程界面配合使用，当然也可以单独使用。

### 安装

[![NPM](https://nodei.co/npm/react-screenshots.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-screenshots/)
