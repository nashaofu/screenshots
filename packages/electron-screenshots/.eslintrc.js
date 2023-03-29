module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: ["airbnb-base", "airbnb-typescript/base"],
};
