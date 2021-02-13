const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: {
    vendors: ["react", "react-dom", "lodash"], //就是将这三个打包到一个文件中
  },
  output: {
    filename: "[name].dll.js",
    path: path.resolve(__dirname, "../dist"),
    library: "[name]", //这里是定义如何暴露出去
  },
  plugins: [
    new webpack.DllPlugin({
      name: "[name]",
      path: path.resolve(__dirname, "../dll/[name].manifest.json"), //映射关系，生成映射文件
    }),
  ],
};
