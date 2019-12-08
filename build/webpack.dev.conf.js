'use strict'
const path = require('path')
const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  watch: true,
  module: {
    rules: styleLoader({ sourceMap: true })
  },

  devtool: 'source-map',

  plugins: [
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(config.srcRendererDir, 'index.html'),
      inject: true,
      chunksSortMode: 'auto',
      chunks: ['renderer']
    })
  ]
})
