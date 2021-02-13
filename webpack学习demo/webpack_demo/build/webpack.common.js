const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const devConfig = require("./webpack.dev");
const prodConfig = require("./webpack.prod");
const addAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");
const { Z_DEFLATED } = require("zlib");
const commonConfig = {
  entry: { main: "./src/index.js" },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: "babel-loader" },
          { loader: "imports-loader?this=>window" },
        ],
      },
      {
        test: /\.jpg$/,
        use: {
          loader: "url-loader",
          options: {
            //placeholder
            name: "[name]_[hash].[ext]", //保证名字不变
            outputPath: "images/",
            limit: 2048,
          },
        },
      },
      {
        test: /\(eot|ttf|svg)$/,
        use: {
          loader: "file-loader",
        },
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
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
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, "../"), //跟路径为当前路径向上一层
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    new addAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname, "../dll/vendors.dll.js"),
    }),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, "../dll/vendor.manifest.js"),
    }),
  ],
  optimization: {
    runtimeChunk: {
      name: "runtime",
    },
    usedExports: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: {
          test: "/[\\/]node_modules[\\/]/",
          priority: -10,
          name: "vendors",
        },
      },
    },
  },
  performance: false, //不让报警告
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "../dist"),
  },
};

module.exports = (env) => {
  if (env && env.production) {
    return merge(prodConfig, commonConfig);
  } else {
    return merge(devConfig, commonConfig);
  }
};
