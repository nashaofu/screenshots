'use strict'
const path = require('path')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  entry: {
    main: path.resolve(config.srcMainDir, 'shortcut-capture.js')
  },
  output: {
    path: config.distDir,
    filename: '[name].js',
    library: 'ShortcutCapture',
    libraryExport: 'default',
    libraryTarget: 'commonjs2'
  },
  devtool: config.prod.sourcemap ? '#source-map' : false
})
