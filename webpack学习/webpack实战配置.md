---library 打包,生成一个库

1.

````
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
    ```

"main": "./dist/library.js", //还需要在 package.js 中配置

````

2.  PWA 打包

```
"start": "http-server dist", //package.json下，起一个服务器，文件是dist
```

PWA->**即使服务器挂掉了，之前打开过后，在本地仍然有一份缓存(prod)** //使用 workbox-webpack-plugin

```
new WorkboxPlugin.generateSW({
      clientsClaim: true,
      skipWaiting: true,
    }), //PWA的底层技术是service worker (可以理解为另类的缓存)

同时业务代码需要添加
if ("serviceWorker" in navigator) { //如果浏览器支持serviceWorker
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then(registration=>{console.log('registered ok')}).catch(error=>console.log(error));
  });
}
```

3.  typescript 的打包配置 -》对 typescript 实现支持
    需要在跟路径下创建 tsconfig.json

```
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ES6", //模块引入方式
    "target": "ES5",
    "allowJs": true //允许typescript中允许JS模块
  }
}
```

```
module.exports = {
  mode: "production",
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

4.

```
import * as _ from 'lodash' //安装完@types/lodash 可以进行语法上的提示
```

5.  webpackDevServer 实现请求转发
    解决线上线下请求借口不同的问题

```
devServer:{
    proxy:{'/api/getlist':{target:'http://xxx.com',pathRewrite:{'header.json':'demo.json'}},changeOrigin:true}  //配置代理 //如果是拿header.json 实际是拿demo.json,好处就是当后端说可以用真实接口的时候，把pathRewrite注释掉就行
}
```

6.  webpackDevServer **单页路由** -》React 中路由很重要

```
devServer:{
    historyApiFallback:true //解决路由访问不到的问题（BrowserRoute） 原理是：无论请求什么地址都会转换到根路径
} //但这只是开发环境-》这里需要apache,niginx后端仿照这里的配置
```

--- **Eslint 的配置** 
7. npm install eslint --save-dev
npx eslint --init
---

npx eslint src//检查 src 下的代码有没有问题
.eslintrc.js//配置文件
亦或者插件结合配置文件，编辑器中直接提示
将 elint 和 webpack 配合

```
devServer:{
    overlay:true //弹出一个层
}
use:['babel-loader','eslint-loader']
```

真实项目中不会使用 eslint-loader，因为会降低打包速度//git 钩子 eslint src,但 git 无法看到图形交互式的提示

---提升 webpack 的打包速度**性能优化** 8.

8.  1）. 跟上技术的迭代
    2）. 尽可能少的模块上应用 loader //如 exclude:node_modules
    3）. 尽可能精简 plugin 并确保可靠 //最好是社区里面验证过性能比较好的插件
    4）. resolve 参数合理配置

```
resolve:{
    extension:['.js','.jsx'], //引用文件的时候，后缀就可以不用添加，会通过这里的配置自动去寻找补齐；但是这里不能配置过多的内容，否则性能会下降
    mainFiles:['index'], //当引入某目录下的内容时候，具体不知道先去找谁的时候，先去找index
    alias:{
        xxx:path.resolve(__dirname,'../src/child) //用别名来引入
    }
}
```

9.  使用 DllPlugin 提升打包速率**高业务价值**
    //希望第三方模块，只是第一次的时候需要分析（打包），之后就不需要分析-》进而提升打包性能
    1. 打包第三方模块
    2. 我们引入第三方模块的时候，要去使用 dll 引用

```
//新配置一个文件 webpack.dll.js
const path = require("path");
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

//接下来如何使得生成的vendors.dll.js被使用到,在webpack.commmon.js中配置一个插件
new addAssetHtmlWebpackPlugin({
      filepath:path.resolve(__dirname,"../dll/vendors.dll.js")
    }),//挂载到页面上，页面上就会有全局变量
new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, "../dll/vendor.manifest.js"), //但使用第三方模块的时候，会去这个文件找映射关系//会去全变量中取
    }),

//fs.readdirSync()

```

10. 控制包的大小--tree shaking
    默认通过 node.js 打包，是单进程
    thread-loader,parallel-webpack,happypack 多进程打包
    合理使用 sourcemap->越详细生成越慢
    结合 stats 分析打包结果**常用的优化手段**
    开发环境内存编译
    开发环境无用插件剔除

11. 多页面打包配置
    单页面-》整个文件只有一个 html 文件

```
new HtmlWebpackPlugin({
  template:'src/index.html',
  filename:'index.html',
  chunks:['runtime','vendors','main'] //该模版对应的文件
})
```
