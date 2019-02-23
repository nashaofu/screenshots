const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// generate loader string to be used with extract text plugin
function generateLoaders (loader) {
  return function (options) {
    const cssLoader = {
      loader: 'css-loader',
      options: {
        sourceMap: options.sourceMap
      }
    }

    const postcssLoader = {
      loader: 'postcss-loader',
      options: {
        sourceMap: options.sourceMap
      }
    }

    const vueStyleLoader = {
      loader: 'vue-style-loader',
      options: {
        sourceMap: options.sourceMap
      }
    }

    const loaders = [cssLoader, postcssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options
      })
    }

    return [options.extract ? MiniCssExtractPlugin.loader : vueStyleLoader, ...loaders]
  }
}

module.exports = function (options) {
  return [
    {
      test: /\.css$/,
      use: generateLoaders()(options)
    },
    {
      test: /\.less$/,
      use: generateLoaders('less')(options)
    },
    {
      test: /\.(sass|scss)$/,
      use: generateLoaders('sass')(options)
    },
    {
      test: /\.(stylus|styl)$/,
      use: generateLoaders('stylus')(options)
    }
  ]
}
