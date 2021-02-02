## WebPack

### webpack 是用来做什么的

    js应用程序的静态模块打包工具;
    1. 模块化，方便复用
    2. 由于前端涉及到越来越多的文件，因此我们从代码中很难看到文件的相互关系;
    3. 最初级的感觉：我们现在常用的方式，通过在某个文件引入另外一个文件中某一模块的行为其实在浏览器中是不可以实现的（浏览器会报错，浏览器根本不能识别import语句），所以我们需要webpack，webpack相当于做了一次翻译（但不是JS的翻译器）
    -》其核心是：模块打包工具
    **JS模块打包工具-》**
    4.对于CommonJS,AMD,CMD都能识别

### 基础知识

    1. 非全局安装后直接使用webpack会报错，使用npx 会到当前目录下去找webpack(npx webpack -v)
    2. 指定某一文件为webpack配置文件，npx webpack --config webpackconfig.js
    3. 在scripts配置命令 eg:"bundle": "webpack" 即便没有全局安装webpack，这里也会去工程目录下查找webpack
    4. mode:"production"代码被压缩为一行，设置为development后，打包的代码则不会被压缩

### 核心概念

---loader
webpack 默认知道如何打包 JS，但不知道 jpg 等其他格式的文件，因此需要-》loader

1. _file-loader 会将文件移动到 dist 目录下_，并改名
2. 如何保证文件名不被修改-》配置 options:{name:"[name].[ext]"}(属于 placeholder 部分)

   ```
   rules: [
     {
       test: /\.jpg$/,
       use: {
         loader: "file-loader",
         options: {
           //placeholder
           name: "[name]_[hash].[ext]", //保证名字不变
           outputPath: "images/", //打包到dist/images的目录下
         },
       },
     },]

   ```

3. url-loader 会将图片转换为 base64 的图片，且直接放入 bundle.js 文件中(打包好的文件)而不是生成的单独的图片；=》最佳使用方式是，如果图片很小，就可以使用该种方式，如果图片很大，则不能如此做，否则页面加载很慢很九才可以展示出来;使用 limit 来决定图片的大小为多少时候需要变成 base64 格式

   ```
   options: {
           //placeholder
           name: "[name]_[hash].[ext]", //保证名字不变
           outputPath: "images/",
           limit:2048
         },
   ```

4. 打包 css,使用 css-loader 和 style-loader 一起 ->css-loader ;style-loade 会将 css-loader 拿到的内容挂载到 head 标签上
5. 注意 loader 是有执行顺序的，从下到上，从右到左

   ```
   use: [
           "style-loader",
            "css-loader",
           "sass-loader"],
   ```

6. postcss-loader 处理添加如 CSS 厂商前缀，需要配置 postcss.config.js 并安装 autoprefixer 插件
7. ```
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
   ```

   //对于**JS**中的 scss 文件，会依次调用这几个 loader,但是对于 scss 调用的 scss 文件，我们也希望它进行以下两种 loader 的处理，所以要用 importLoaders

8. css-modules：模块化的 css,防止 css 冲突

   ```
   options: {
             importLoaders: 2,
             modules:true
   ```

9. 打包字体文件：本质是 file-loader-》通过这个 loader 将文件移到 dist 下

   ---plugin-》可以在 webpack 运行到某个时刻的时候，帮你做一些事情-》有一点像生命周期函数

10. htmlWebpackPlugin 会在打包结束后，会自动生成 html 文件，并把打包生成的 js 自动引入到这个 html 文件中

    ```
    plugins: [new HtmlWebpackPlugin()],
    ```

    由于生成的没有我们想要的 id，故这里可以使用模版

    ```
    plugins: [
    new HtmlWebpackPlugin({
    template: "src/index.html",
    })],//之后将打包好的文件 bundle.js 注入到模板中

    ```

11. clean-webpack-plugin 清除之前打包的 dist 文件

    ```
    plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CleanWebpackPlugin(["dist"]),
     ]//打包之前帮助删除dist目录
    ```

12. 如果静态资源需要放大 CDN 上，则可以添加 publicPath

    ```
    output: {
    publicPath:'http://cdn.com.cn',
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    },
    ```

    ---sourceMap 是一个映射关系，映射打包好的文件中出错的代码到源代码中去(解决当打包后发现文件出错的问题)

13. ```
     devtool: "source-map", //如果是inline-source-map 则生成的.map文件直接写到了打包好的文件中；文件大的时候添加cheap(否则会告诉哪行哪列，耗费性能)
    ```

    //这里是不负责第三方模块的，若需要管理则改为 inline-module-source-map
    //devlopment 环境最佳实践：cheap-module-eval-source-map //用到了 eval,所以 source map 也会放到生成的文件中去
    //production 环境：cheap-module-source-map **这里有个点是 source-map 的原理是什么**

    ---webpack-dev-server

14. 监听源码是否变化，若变化，自动重新打包（--watch 的作用）

    ```
    "scripts": {
    "watch": "webpack --watch"
    },
    ```

15. 起动类似于服务器的功能;同时 webpackserver 也能自动感知源代码发生了该改变并重新打包，相比于--watch，其可以重新刷新浏览器
    **同时只有启动了服务器，才可以去发送 ajax 请求**

    ```
    devServer:{
    contentBase:'./dist'   //文件存放的位置
    open: "true", //自动打开浏览器，访问其位置
    },

     "start": "webpack-dev-server" //同时需要在package.json中进行配置&
    ```

    // **并且会把打包生成的 dist 的东西放到内存中**

16. 同时支持跨域的代理和端口设置（默认是 8000）

    ```
    port: 8080, //修改默认的端口号
    proxy:{
        './api':'http:localhost:3000'
    },
    ```

    ---hot module replacement

17. 如何只替换样式，不重新刷新（其实 css loader 底层已经实现了 18 所讲的效果，所以不用去写 module.hot 的代码）

    ```
    devServer: {
    hot: true,
    hotOnly: true, //不让浏览器自动重新刷新（即使hmr失效）
    },

    new webpack.HotModuleReplacementPlugin(), //plugins中添加
    ```

18. 遇到另外一个问题，如果想使文件修改后（目的是使得仅某一部分变化），保存后变化，则需要添加

    ```
    if(module.hot){   //（**React已经内置了，但如果处理数据文件或比较偏的东西，就需要自己手动写**）
    module.hot.accept("./xxx文件",()=>{
        XXX
    })
    }
    ```

    ---babel //chrome 与时俱进可以解析 ES6

19.

```
{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },//如果 js 文件在 node_modules 就不使用该方法，
```

**babel-loader 只是打通 webpack 和 babel,它本身不会做语法翻译**

20. _babel/preset-env -》才是将 ES6 翻译为 ES5_

    ```
     options: { presets: ["@babel/preset-env"] }, //但只是翻译了一部分如map等就无法转换
    ```

21. 所以使用@babel/polyfill

    ```
    import "@babel/polyfill"; //放入业务代码顶部
    ```

22. //打包后文件过大，所以只想打包涉及到需要翻译的语法

    ```
     options: { presets: [["@babel/preset-env", { useBuiltIns: "usage" }]] },
    ```

23. 限定需要打包的浏览器条件 //**babel 相关的内容** 问题:框架是如何使用 babel 的

    ```
    useBuiltIns: "usage",
    targets: {chrome: "67",},
    ```

24. 之前的方式，如注入 promise 会通过全局变量进行注入，污染全局环境，因此要换一种打包方式//使用库项目（如 UI 组件）的时候就用该方法

    ```
    plugins: [
            "@babel/plugin-transform-runtime",
            {
              corejs: 2, //false改为2，当页面不存在promise、map方法才会把打包到main.js中若不配置则不会打包进来的 ？？？
              helpers: true,
              regenerator: true,
              useESModules: false,
            },
          ],
    ```

25. 由于 babel 配置过多，可以把 options 部分放入.babelrc

    ---**React 代码的打包**

26. 从下到上执行，从右往左

    ```
    {
    "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": 67
        },
        "useBuiltIns": "usage" //使用了这个 @babel/polyfill就自动引入了，业务代码也就不需要手动写上去了
      }
    ],
    "@babel/preset-react" //添加为了处理React语法
    ]
    }
    ```

### 高级概念

    ---Tree shaking-》解决打包的时候只打包引入的代码，而不打包未使用的部分 **Tree shaking 只支持ES moudule的引入（import）-》静态引入的方式** ？？？动态引入和静态引入？？？

1.  ```
    "sideEffects": ["*.css"],//package.json设置,则表明不需要对这个部分进行tree shaking，一般的还会写入css文件,因为tree-shaking会看导出了什么使用了什么，否则css就被忽略掉了，进而报错

    optimization: {
    usedExports: true,
    }, //webpack.config.js中配置   //这里都是devlopment环境
    ```

2.  production 环境下，1 的 optimization 注释掉，sideEffects 保留

    ---development & production 模式

3.  production 模式下，代码被压缩；配置两个文件 webpack.dev.js && webpack.prod.js

    ```
    "scripts": {
    "dev": "webpack-dev-server --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js" //package.json中配置
    },
    ```

4.  使用的两个文件存在很多相同的部分-》该如何优化->将公用的代码拆分到 webpack.common.js;引入第三方模块进行合并
    使用 webpack-merge

    ```
    module.exports = merge(commonConfig, devConfig);
    ```

5.  webpack && codeSplitting
    如果业务文件对应的文件非常大（**核心是：业务逻辑+加载的包**）-》如果打包为一个-》打包文件大，加载时间会很长，若重新访问又会加载该大小的文件

    ```
    import _ from 'lodash'
    window._=_  //将加载模块的部分分出来，打包两个文件
    ```

6.  此时在 5 的基础上，就是同时加载 2 个 1MB 的文件，但当业务逻辑发生变化的时候我们不希望加载引入的模块的 -》因此有 codeSplitting

7.  webpack 帮助我们自动做代码分割

    ```
    optimization: { splitChunks: "all" }, //webpack.common.js中配置
    ```

8.  异步性质代码打包

    ```
    "plugins": ["dynamic-import-webpack"]
    ```

    //**代码分割与 webpack 无关** //1.同步代码分割 7th 点 2.异步代码（这里是 import 语法引入)分割 8th 点

    ```
    return import('loadsh').then(({default:_})=>{xxx})
    ```

    --- splitChunksPlugin （代码分割的底层使用的插件

9.  异步加载组件（对生成的文件改名，使用魔法注释）

    ````
    return import(/*webpackChunkName:'lodash'*/'loadsh').then(({default:_})=>{xxx})
    ```//且使用plugin-syntax-dynamic-import

    //同时避免打包的文件前面有vendor前缀
    ````

    optimization: {
    splitChunks: {
    chunks: "all",
    cacheGroups: { vendors: false, default: false }, //无论同步异步，该两部分的代码都有效果
    },
    },

    ```

    配置解释
    ```

        optimization: {
          splitChunks: {
          chunks: 'async', //只对异步生效 //若为all，想要分割同步代码，需要修改cacheGroups配置vendors
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1, //条件：用了几次的引入才做代码分割
          maxAsyncRequests: 30,
          maxInitialRequests: 30,//入口文件进行加载，入口文件可能会引入其他的JS文件或者库，入口文件最多分解为这么多个，超过就不会再分割
          enforceSizeThreshold: 50000,
          cacheGroups: {
              vendors:{
                  test: /[\\/]node_modules[\\/]/,
                  priority: -10,
                  filename:'vendors.js' //发现代码是从node_modules引入的，打包好的的文件都放入该文件下
              },
              default:{
                      priority: -20,
                      reuseExistingChunk: true,
                      filename:'commom.js'},
              }
          }

    }
    };

    ```

    ---lazy loading 懒加载

    ```

10. 加载速度更快-》在 react 中如路由就是使用了该方法，如首页单独做代码分割，做路由切换的时候，做对应代码的加载就行
    懒加载 //以下语法

    ```
    return import(/*webpackChunkName:'lodash'*/'loadsh').then(({default:_})=>{xxx})
    ```

11. chunk 是什么
    生成的每一个 js 文件都是一个 chunk

    ```
    splitChunks:{chunks:'all'}//其实这样写就行
    ```

12. 打包分析，preloading,prefetching /https://github.com/webpack/analyse/分析仓库

    ```
    "dev-build": "webpack --profile --json > stats.json --config ./build/webpack.prod.js", //将打包过程中描述放入stats.json中
    ```

13. --prefetch
    webpack 默认是 chunks:'async' =>**webpack 希望第一次就很快(多些异步的代码，使得首屏加载很快，或者说把首屏中没有用到的业务代码再分出去城异步的)，我们的分割是利用缓存使得第二次及其之后很快（只是修改业务代码，包的代码就不会重新加载），所以还要做代码的优化**-》让首屏代码利用率变高
    //通过 command p >coverage 分析代码利用率 //将交互的代码写到异步的文件中去（这样首屏加载代码利用率很快）
    **编写高性能前端代码的问题，不是缓存，而是代码使用率**
    prefetch

    ```
    import(/*webpackPrefetch:true*/'./click.js').then(({default:func})=>{func()}) //异步加载，等到网络空闲时候就会自动加载而不是等到手动点击事件的时候才会加载
    ```

    //preload 是和主的一起加载（和 prefetch 的区别

    --- css 文件的代码分割 mini-css-extract-plugin 13.

    ```
    output: {
    publicPath: "/",
    filename: "[name].js",
    chunkFilename: "[name].chunk.js", //间接引入的代码走这条要求
    path: path.resolve(__dirname, "../dist"),
    },
    ```

    **webpack 默认的会把 css 文件打包到 js 中，我们希望它单独打包到单独的 css 文件**

    ```
    开prod中单独配置插件和规则，style-loader变为MiniCssExtraPlugin.loader
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
        ]
    ```

    ```
    "sideEffects": [
    "*.css"
    ], //同时package.json要如此配置，表明css不需要做tree-shaking,否则就不会生成css打包的文件
    ```

14. ```
    plugins: [
    new MiniCssExtraPlugin({
      filename: "[name].css", //对于css,直接被页面html引用就走这条
      chunkFilename: "[name].chunk.css",
    }),
    ],
    ```

    对 css 的代码做压缩，使用插件

    ```
    optimization: {
    minimizer: [new optimizeCSSAssetsPlugin({})], //其他代码分割需求，cacheGroup进行配置
    },
    ```

    ---webpack 和浏览器缓存 caching

15. ```
    output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js", //浏览器会判断名字是否修改来选择是否加载新的还是使用缓存
    },
    ```

    //有时候会失效 -》对于老版本的，因为 manifest 会放到打包的文件中，解决这个问题的核心在于

    ```
    optimization: {
    runtimeChunk:{
      name:'runtime' //本质是将manifest放入runtime.xxx.js中
    },
    ```

    ---shiming

16. shimmig (垫片-》解决兼容性的问题)

    ```
    plugins: [
        new webpack.ProvidePlugin({
        $:'jquery' //当发现模块里面用了这个字符串，就回该模块自动帮忙引入jquery
        _join:['lodash','join'] //直接使用lodash中的join
        })
    ],
    ```

    ```
    之前是指向自身，现在让模块的this都指向window //改变默认的配置
    {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: "babel-loader" },
          { loader: "imports-loader?this=>window" },
        ],
      },
    ```

    //Guides 部分 shimming 之前所有

17. 环境变量的使用

    ```
    "build": "webpack  --env.prodcution --config ./build/webpack.common.js" //package.json，这里写法有很多也可以env.production=abc

    module.exports = (env) => {
    if (env && env.production) {
    return merge(prodConfig, commonConfig);
    } else {
    return merge(devConfig, commonConfig);
        }
    }; //webpack.common.js中的文件
    ```
