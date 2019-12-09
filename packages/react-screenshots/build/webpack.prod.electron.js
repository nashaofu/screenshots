const path = require('path')
const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const webpackConfig = require('./webpack.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(webpackConfig, {
  mode: 'production',
  entry: {
    app: config.entry.electron
  },
  target: 'electron-renderer',
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
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(config.context, 'public/index.html'),
      inject: true,
      chunksSortMode: 'auto',
      chunks: ['app']
    })
  ]
})
