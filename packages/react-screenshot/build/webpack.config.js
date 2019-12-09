const path = require('path')
const config = require('./config')

function resolve (dir) {
  return path.resolve(config.context, dir)
}

module.exports = {
  context: config.context,
  output: {
    path: config.distDir,
    filename: '[name].js'
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: [resolve('node_modules')],
        options: {
          emitWarning: true,
          formatter: 'eslint/lib/cli-engine/formatters/codeframe'
        }
      },
      {
        test: /\.js$/,
        exclude: [resolve('node_modules')],
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
}
