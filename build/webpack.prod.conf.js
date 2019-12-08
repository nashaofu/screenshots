'use strict'
const path = require('path')
const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
    path: config.distRendererDir,
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(config.srcRendererDir, 'index.html'),
      inject: true,
      chunksSortMode: 'auto',
      chunks: ['renderer']
    })
  ]
})
