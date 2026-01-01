import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import { pluginLess } from "@rsbuild/plugin-less";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**/*.tsx", "./src/**/*.ts"],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: "esm",
    },
  ],
  output: {
    target: "web",
    distPath: "./lib",
  },
  plugins: [pluginReact(), pluginLess()],
});
