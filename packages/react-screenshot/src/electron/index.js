// 导入core-js和raf
import 'core-js'
import 'raf/polyfill'
import App from './app'
import React from 'react'
import ReactDOM from 'react-dom'

function render (App) {
  ReactDOM.render(<App />, document.getElementById('app'))
}

render(App)

if (module.hot) {
  module.hot.accept('./app.js', () => render(App))
}
