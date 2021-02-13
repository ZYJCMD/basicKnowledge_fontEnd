const webpack = require("webpack");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
/**
 * parsets:[['@babel/preset-env',{
 * targets:{
 *  chrome:"67"
 *  },
 * useBuiltIns:"usage"
 * }]]
 */

const devConfig = {
  mode: "development",
  devtool: "cheap-module-eval-source-map", //如果是inline-source-map 则map文件不见了直接写到了打包好的文件中
  devServer: {
    contentBase: "./dist",
    open: "true",
    port: 8080, //修改默认的端口号
    hot: true,
    //hotOnly: true, //不让浏览器自动重新刷新（即使hmr失效）
  },

  plugins: [new webpack.HotModuleReplacementPlugin()],
  output: { filename: "[name].js", chunkFilename: "[name].js" },
};

module.exports = devConfig;
