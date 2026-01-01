import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
    entry: {
      index: './src/web/index.tsx',
      electron: './src/electron/index.tsx',
    },
  },
  output: {
    assetPrefix: './',
  },
  plugins: [pluginReact(), pluginLess()],
});
