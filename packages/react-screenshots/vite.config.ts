import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      plugins: [react()]
    }
  }

  if (mode === 'web') {
    return {
      base: './',
      plugins: [react()]
    }
  }

  if (mode === 'electron') {
    return {
      base: './',
      build: {
        outDir: 'electron',
        rollupOptions: {
          input: {
            index: './electron.html'
          }
        }
      },
      plugins: [react()]
    }
  }

  if (mode === 'lib') {
    return {
      build: {
        outDir: 'lib',
        lib: {
          entry: './src/Screenshots/index.tsx',
          formats: ['es', 'cjs'],
          fileName: format => `react-screenshots.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom']
        }
      },
      plugins: [
        react({
          jsxRuntime: 'classic'
        })
      ]
    }
  }
})
