# react-screenshots

> picture clipping and graffiti tool by react

## TODOS

-[] 在内存中（context）给每一个插件开辟一个内存空间，用于存储插件的临时数据，mount 的时候初始化，unmount 的时候销毁
-[] 每次画的内容都在页面中建立一个图层，方便图层拖拽移动

## action 设计说明

1. 所有的有效 action 必须继承与 Action 类，action 类中提供封装方法，每一次 context 更新之后也同步更新所有的 actions 的 props 状态
