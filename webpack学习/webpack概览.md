## WebPack

### webpack 是用来做什么的

    js应用程序的静态模块打包工具;
    1. 模块化，方便复用
    2. 由于前端涉及到越来越多的文件，因此我们从代码中很难看到文件的相互关系;
    3. 最初级的感觉：我们现在常用的方式，通过在某个文件引入另外一个文件中某一模块的行为其实在浏览器中是不可以实现的（浏览器会报错，浏览器根本不能识别import语句），所以我们需要webpack，webpack相当于做了一次翻译（但不是JS的翻译器）
    -》其核心是：模块打包工具
    **JS模块打包工具-》**
    4.对于CommonJS,AMD,CMD都能识别

### webpack

### 基础知识

    1. 非全局安装后直接使用webpack会报错，使用npx 会到当前目录下去找webpack(npx webpack -v)
    2. 指定某一文件为webpack配置文件，npx webpack --config webpackconfig.js
    3. 在scripts配置命令 eg:"bundle": "webpack" 即便没有全局安装webpack，这里也会去工程目录下查找webpack
    4. mode:"production"文件被压缩，设置为development后，打包的代码则不会被压缩

### 核心概念

    ---loader
    webpack默认知道如何打包JS，但不知道jpg等其他格式的文件，因此需要-》loader
    1. *file-loader 会将文件移动到dist目录下*，并改名
    2. 如何保证文件名不被修改-》配置options:{name:"[name].[ext]"}(属于placeholder部分)
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
    3.  url-loader会将图片转换为base64的图片，且直接放入bundle.js文件中而不是生成的单独的图片；=》最佳使用方式是，如果图片很小，就可以使用该种方式，如果图片很大，则不能如此做，否则页面加载很慢很九才可以展示出来;使用limit来决定图片的大小为多少时候需要变成base64格式
    ```
    options: {
            //placeholder
            name: "[name]_[hash].[ext]", //保证名字不变
            outputPath: "images/",
            limit:2048
          },
    ```
    4. 打包css,使用css-loader和style-loader一起 ->css-loader ;style-loade会将css-loader拿到的内容挂载到head标签上
    5. 注意loader是有执行顺序的，从下到上，从右到左
    ```
    use: [
            "style-loader",
             "css-loader",
            "sass-loader"],
    ```
    6. postcss-loader 处理添加如CSS厂商前缀，需要配置postcss.config.js并安装autoprefixer插件
    7.
    ```
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
        ], //对于**JS**中的scss文件，会依次调用这几个loader,但是对于scss调用的scss文件，我们也希望它进行以下两种loader的处理，所以要用importLoaders
    ```
    8. css-modules：模块化的css,防止css冲突
    ```
    options: {
              importLoaders: 2,
              modules:true
    ```
    9.  打包字体文件：本质是file-loader-》通过这个loader将文件移到dist下

    ---plugin-》可以在webpack运行到某个时刻的时候，帮你做一些事情-》有一点像生命周期函数
    10. htmlWebpackPlugin 会在打包结束后，会自动生成html文件，并把打包生成的js自动引入到这个html文件中
    ```
    plugins: [new HtmlWebpackPlugin()],
    ```
    由于生成的没有我们想要的id，故这里可以使用模版
    ` ``
    plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    })],//之后将打包好的文件bundle.js注入到模板中
    ```
    11.clean-webpack-plugin清除之前打包的dist文件
    ```
    plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CleanWebpackPlugin(["dist"]),
     ]//打包之前帮助删除dist目录
    ```
    12. 如果静态资源需要放大CDN上，则可以添加publicPath
    ```
    output: {
    publicPath:'http://cdn.com.cn',
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    },
    ```

    ---sourceMap是一个映射关系，映射打包好的文件中出错的代码到源代码中去(解决当打包后发现文件出错的问题)
    13.
    ```
     devtool: "source-map", //如果是inline-source-map 则生成的.map文件直接写到了打包好的文件中；文件大的时候添加cheap(否则会告诉哪行哪列，耗费性能)
    ```
    //这里是不负责第三方模块的，若需要管理则改为inline-module-rouce-map
    //devlopment环境最佳实践：cheap-module-eval-source-map
    //production环境：cheap-module-source-map  **这里有个点是source-map的原理是什么**

    ---webpack-dev-server
    14. 监听源码是否变化，若变化，自动重新打包（--watch的作用）
    ```
    "scripts": {
    "watch": "webpack --watch"
    },
    ```
    15.起动类似于服务器的功能;同时webpackserver也能自动感知源代码发生了该改变并重新打包，相比于--watch，其可以重新刷新浏览器
    **同时只有启动了服务器，才可以去发送ajax请求**
    ```
    devServer:{
    contentBase:'./dist'   //文件存放的位置
    open: "true", //自动打开浏览器，访问其位置
    },

     "start": "webpack-dev-server" //同时需要在package.json中进行配置& *并且会把打包生成的dist的东西放到内存中*
    ```
    16. 同时支持跨域的代理和端口设置（默认是8000）
    ```
    port: 8080, //修改默认的端口号
    proxy:{
        './api':'http:localhost:3000'
    },
    ```
    ---hot module replacement
    17.如何只替换样式，不重新刷新（其实css loader底层已经实现了18所讲的效果，所以不用去写module.hot的代码）
    ```
    devServer: {
    hot: true,
    hotOnly: true, //不让浏览器自动重新刷新（即使hmr失效）
    },

    new webpack.HotModuleReplacementPlugin(), //plugins中添加
    ```

    18.遇到另外一个问题，如果想使文件修改后（目的是使得仅某一部分变化），保存后变化，则需要添加
    ```
    if(module.hot){   //（**React已经内置了，但如果处理数据文件或比较偏的东西，就需要自己手动写**）
    module.hot.accept("./xxx文件",()=>{
        XXX
    })
    }
    ```
    ---babel //chrome与时俱进可以解析ES6
    19.
    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },//如果js文件在node_modules就不使用该方法，**babel-loader只是打通webpack和babel,它本身不会做语法翻译**

    20. babel/preset-env -》才是将ES6翻译为ES5
    ```
     options: { presets: ["@babel/preset-env"] }, //但只是翻译了一部分如map等就无法转换
    ```
    21. 所以使用@babel/polyfill
    ```
    import "@babel/polyfill"; //放入业务代码顶部
    ```

    22. //打包后文件过大，所以只想打包涉及到的语法
    ```
     options: { presets: [["@babel/preset-env", { useBuiltIns: "usage" }]] },
    ```

    23. 限定需要打包的浏览器条件 //**babel相关的内容**框架是如何使用babel的
    ```
    useBuiltIns: "usage",
    targets: {chrome: "67",},
    ```

    24. 之前的方式，如注入promise会通过全局变量进行注入，污染全局环境，因此要换一种打包方式//使用库项目的时候就用该方法？？？
    ```
    plugins: [
            "@babel/plugin-transform-runtime",
            {
              corejs: 2,
              helpers: true,
              regenerator: true,
              useESModules: false,
            },
          ],
    ```

    25. 由于babel配置过多，可以把options部分放入.babelrc
