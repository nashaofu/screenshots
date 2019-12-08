export default class Events {
  ['[[EVENTS]]'] = {}

  /**
   * 绑定事件
   * @param event
   * @param handler
   */
  on (event, handler) {
    if (!this['[[EVENTS]]'][event]) {
      this['[[EVENTS]]'][event] = []
    }
    this['[[EVENTS]]'][event].push(handler)
  }

  /**
   * 绑定事件只触发一次
   * @param event
   * @param handler
   */
  once (event, handler) {
    const f = (...args) => {
      this.off(event, f)
      handler.call(this, ...args)
    }
    f.handler = handler
    this.on(event, f)
  }

  /**
   * 移除事件
   * event不存在时移除所有事件
   * handler不存在时移除该事件的所有绑定
   * @param event
   * @param handler
   */
  off (event, handler) {
    if (!event) {
      this['[[EVENTS]]'] = {}
    } else {
      const handlers = this['[[EVENTS]]'][event]
      if (handlers) {
        if (!handler) {
          this['[[EVENTS]]'][event] = []
        } else {
          const index = handlers.findIndex(f => f === handler || f.handler === handler)
          if (index > -1) {
            handlers.splice(index, 1)
          }
        }
      }
    }
  }

  /**
   * 触发事件
   * @param event
   * @param args
   */
  emit (event, ...args) {
    const handlers = this['[[EVENTS]]'][event]
    if (handlers) {
      handlers.forEach(f => f.call(this, ...args))
    }
  }
}
