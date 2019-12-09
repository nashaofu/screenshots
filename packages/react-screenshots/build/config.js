const path = require('path')

const context = path.resolve(__dirname, '../')
const srcDir = path.resolve(context, './src')
const distDir = path.resolve(context, './dist')

module.exports = {
  context,
  srcDir,
  distDir,
  entry: {
    web: path.resolve(srcDir, 'web/index.js'),
    electron: path.resolve(srcDir, 'electron/index.js')
  },
  port: 8080,
  sourceMap: false
}
