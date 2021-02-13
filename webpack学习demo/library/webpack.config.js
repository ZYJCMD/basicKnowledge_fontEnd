const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index",
  //   externals: {
  //     lodash: {
  //       //root: "_", //表示通过<script>全局引用
  //       commonjs: "lodash",
  //     },
  //   }, //打包过程如果遇到这个库就忽略该库,而是希望使用该库的业务代码引用该个库 //避免外部使用该库时候，也使用lodash，导致的两次打包
  externals: "lodash",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "library.js",
    library: "root", //希望通过<script>的方式引用
    libraryTarget: "umd", //u:universe ，无论如何引用,AMD亦或者其他都可以正确引用到 //亦或者this, window都可以，如果是node.js的环境，可以用global
  },
};
