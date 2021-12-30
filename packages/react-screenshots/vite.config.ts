import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      build: {
        outDir: 'dist/web'
      },
      plugins: [react()]
    }
  }

  if (mode === 'electron') {
    return {
      base: './',
      build: {
        outDir: 'dist/electron',
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
        outDir: 'dist/lib',
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
