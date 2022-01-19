// config/webpack.parts.js

const path = require("path");
const preprocess = require("svelte-preprocess");
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");

exports.devServer = () => ({
  watch: true,
  plugins: [
    new WebpackPluginServe({
      port: 3000,
      static: path.resolve(process.cwd(), "dist"),
      historyFallback: true,
    }),
  ],
});

exports.page = ({ title }) => ({
  plugins: [new MiniHtmlWebpackPlugin({ publicPath: "/", context: { title } })],
});

exports.generateSourceMaps = ({ type }) => ({ devtool: type });

exports.svelte = (mode) => {
  const prod = mode === "production";

  return {
    resolve: {
      alias: {
        svelte: path.dirname(require.resolve("svelte/package.json")),
      },
      extensions: [".mjs", ".js", ".svelte", ".ts"],
      mainFields: ["svelte", "browser", "module", "main"],
    },
    module: {
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: "svelte-loader",
            options: {
              compilerOptions: {
                dev: !prod,
              },
              emitCss: prod,
              hotReload: !prod,
              preprocess: preprocess({
                postcss: true,
              }),
            },
          },
        },
        {
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
  };
};

exports.typescript = () => ({
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
});

exports.loadSvg = () => ({
  module: { rules: [{ test: /\.svg$/, type: "asset" }] },
});

exports.useDotenv = () => ({
  plugins: [new DotenvPlugin()],
});

exports.polyfill = () => ({
  plugins: [new NodePolyfillPlugin()],
});

exports.pf = () => ({
  resolve: {
    fallback: {
      fs: false,
    },
  },
});
