'use strict'
const path = require('path')
const config = require('../config')

function resolve (dir) {
  return path.join(config.baseDir, dir)
}

module.exports = {
  context: config.baseDir,
  entry: {
    main: config.srcMainDir
  },
  output: {
    path: config.distDir,
    filename: '[name].js'
  },
  target: 'electron-main',
  resolve: {
    alias: {
      '@': resolve('src/main')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src/main')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
}
