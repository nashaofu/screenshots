const webpack = require('webpack')
const main = require('./main/webpack.dev.conf')
const WebpackDevServer = require('webpack-dev-server')
const renderer = require('./renderer/webpack.dev.conf')

webpack(main, (err, stats) => {
  if (err) throw err
})

const port = renderer.devServer.port
renderer.entry.renderer = [
  `webpack-dev-server/client?http://localhost:${port}/`,
  'webpack/hot/dev-server',
  renderer.entry.renderer
]
const server = new WebpackDevServer(webpack(renderer), renderer.devServer)
server.listen(port)
