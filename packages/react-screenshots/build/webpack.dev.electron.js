const path = require('path')
const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const webpackConfig = require('./webpack.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(webpackConfig, {
  mode: 'development',
  watch: true,
  entry: {
    app: config.entry.electron
  },
  target: 'electron-renderer',
  module: {
    rules: styleLoader({ sourceMap: true })
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(config.context, 'public/index.html'),
      inject: true,
      chunksSortMode: 'auto',
      chunks: ['app']
    })
  ]
})
