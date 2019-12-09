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
    app: config.entry.web
  },
  module: {
    rules: styleLoader({ sourceMap: true })
  },
  devtool: 'source-map',
  devServer: {
    host: 'localhost',
    port: config.port,
    hot: true,
    contentBase: path.resolve(config.context, 'public'),
    watchContentBase: true,
    publicPath: '',
    disableHostCheck: true,
    clientLogLevel: 'warning',
    compress: true,
    overlay: true,
    quiet: true,
    inline: true
  },
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
