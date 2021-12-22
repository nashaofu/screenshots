/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs/promises')
const { build } = require('vite')
const react = require('@vitejs/plugin-react')

build({
  configFile: false,
  base: './',
  build: {
    outDir: 'dist/electron',
    rollupOptions: {
      input: {
        index: './src/electron/index.tsx'
      },
      external: ['electron'],
      output: {
        format: 'cjs'
      }
    },
    minify: false
  },
  optimizeDeps: {
    exclude: ['electron']
  },
  plugins: [
    react.default({
      jsxRuntime: 'classic'
    })
  ]
}).then(({ output }) => {
  const files = output.reduce((obj, item) => {
    obj[item.name] = item.fileName
    return obj
  }, {})

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>react-screenshots</title>
    <link rel="stylesheet" href="./${files['index.css']}">
  </head>
  <body>
    <div id="app"></div>
    <script>require("./${files.index}")</script>
  </body>
</html>
  `

  fs.writeFile('./dist/electron/index.html', html)
})
