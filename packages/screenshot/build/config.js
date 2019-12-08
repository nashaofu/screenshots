const path = require('path')

const context = path.resolve(__dirname, '../')
const srcDir = path.resolve(context, './src')
const distDir = path.resolve(context, './dist')

module.exports = {
  context,
  srcDir,
  distDir,
  sourceMap: false
}
