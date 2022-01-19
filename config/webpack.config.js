const path = require("path");
const { merge } = require("webpack-merge");
const parts = require('./webpack.parts')
const { mode } = require("webpack-nano/argv");

const common = merge([
  { output: { path: path.resolve(process.cwd(), "dist") } },
  parts.page({ title: "Dice Game App" }),
  parts.loadSvg(),
  parts.svelte(mode),
  parts.typescript(),
  parts.useDotenv(),
  parts.polyfill(),
  parts.pf()
]);

const development = merge([
  { entry: ["./src/index.ts", "webpack-plugin-serve/client"] },
  { target: "web" },
  parts.generateSourceMaps({ type: "eval-source-map" }),
  parts.devServer(),
]);

const production = merge([
  { entry: ['./src/index.ts'] },
  parts.typescript(),
]);

const getConfig = (mode) => {
  switch (mode) {
    case "production":
      return merge(common, production, { mode });
    case "development":
      return merge(common, development, { mode });
    default:
      throw new Error(`Unknown mode, ${mode}`);
  }
};

module.exports = getConfig(mode);
