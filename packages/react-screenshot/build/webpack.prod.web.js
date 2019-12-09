const config = require('./config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const webpackConfig = require('./webpack.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(webpackConfig, {
  mode: 'production',
  entry: {
    app: config.entry.web
  },
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
