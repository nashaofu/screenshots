'use strict'
const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const baseWebpackConfig = require('./webpack.base.conf')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: styleLoader({
      sourceMap: config.sourceMap,
      extract: true
    })
  },
  devtool: config.sourceMap ? 'source-map' : false,
  output: {
    path: config.distDir,
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  ]
})
