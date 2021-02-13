/**
 * parsets:[['@babel/preset-env',{
 * targets:{
 *  chrome:"67"
 *  },
 * useBuiltIns:"usage"
 * }]]
 */
const MiniCssExtraPlugin = require("mini-css-extra-plugin");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const optimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WorkboxPlugin = require("work-box-plugin");

const prodConfig = {
  mode: "production",
  devtool: "cheap-module-source-map", //如果是inline-source-map 则map文件不见了直接写到了打包好的文件中
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "MiniCssExtraPlugin.loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
            },
          },
          "sass-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.css$/,
        use: ["MiniCssExtraPlugin.loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [new optimizeCSSAssetsPlugin()],
  },
  plugins: [
    new MiniCssExtraPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
    new WorkboxPlugin.generateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
  },
};

module.exports = prodConfig;
