---
title: qiankun微前端
date: 2021-01-15
tags:
 - qiankun
categories:
 -  常用工具
---

## 什么是微前端？

我们先来看两个实际的场景：

### 1. 复用别的的项目页面

通常，我们的后台项目都长这样：

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/836b333bec0645c6a87c491e0f4be5e6~tplv-k3u1fbpfcp-watermark.awebp)

如果我们的项目需要开发某个新的功能，而这个功能另一个项目已经开发好，我们想直接复用时。PS：我们需要的只是别人项目的这个功能页面的**内容部分**，不需要别人项目的顶部导航和菜单。

一个比较笨的办法就是直接把别人项目这个页面的代码拷贝过来，但是万一别人不是 `vue` 开发的，或者说 `vue` 版本、`UI` 库等不同，以及别人的页面加载之前操作（路由拦截，鉴权等）我们都需要拷贝过来，更重要的问题是，别人代码有更新，我们如何做到同步更新。

长远来看，代码拷贝不太可行，问题的根本就是，我们需要做到让他们的代码运行在他们自己的环境之上，而我们对他们的页面仅仅是“引用”。这个环境包括各种插件（ `vue`、 `vuex` 、 `vue-router` 等），也包括加载前的逻辑（读 `cookie`，鉴权，路由拦截等）。私有 `npm` 可以共享组件，但是依然存在技术栈不同/UI库不同等问题。

### 2. 巨无霸项目的自由拆分组合

- 代码越来越多，打包越来越慢，部署升级麻烦，一些插件的升级和公共组件的修改需要考虑的更多，很容易牵一发而动全身
- 项目太大，参与人员越多，代码规范比较难管理，代码冲突也频繁。
- 产品功能齐全，但是客户往往只需要其中的部分功能。剥离不需要的代码后，需要独立制定版本，独立维护，增加人力成本。

举个栗子，你们的产品有几百个页面，功能齐全且强大，客户只需要其中的部分页面，而且需要你们提供源码，这时候把所有代码都给出去肯定是不可能的，只能挑出来客户需要，这部分代码需要另外制定版本维护，就很浪费。

## 常见微前端方案

微前端的诞生也是为了解决以上两个问题：

1. 复用（嵌入）别人的项目页面，但是别人的项目运行在他自己的环境之上。
2. 巨无霸应用拆分成一个个的小项目，这些小项目独立开发部署，又可以自由组合进行售卖。

使用微前端的好处：

1. 技术栈无关，各个子项目可以自由选择框架，可以自己制定开发规范。
2. 快速打包，独立部署，互不影响，升级简单。
3. 可以很方便的复用已有的功能模块，避免重复开发。

目前微前端主要有两种解决方案：`iframe` 方案和 `single-spa` 方案

### `iframe`方案

`iframe` 大家都很熟悉，使用简单方便，提供天然的 `js/css` 隔离，也带来了数据传输的不便，一些数据无法共享（主要是本地存储、全局变量和公共插件），两个项目不同源（跨域）情况下数据传输需要依赖 `postMessage` 。

`iframe` 有很多坑，但是大多都有解决的办法：

1. 页面加载问题

`iframe` 和主页面共享连接池，而浏览器对相同域的连接有限制，所以会影响页面的并行加载，阻塞 `onload` 事件。每次点击都需要重新加载，虽然可以采用 `display:none` 来做缓存，但是页面缓存过多会导致电脑卡顿。**(无法解决)**

1. 布局问题

`iframe` 必须给一个指定的高度，否则会塌陷。

解决办法：子项目实时计算高度并通过 `postMessage` 发送给主页面，主页面动态设置 `iframe` 高度。有些情况会出现多个滚动条，用户体验不佳。

1. 弹窗及遮罩层问题

弹窗只能在 `iframe` 范围内垂直水平居中，没法在整个页面垂直水平居中。

- 解决办法1：通过与框架页面消息同步解决，将弹窗消息发送给主页面，主页面来弹窗，对原项目改动大且影响原项目的使用。
- 解决办法2：修改弹窗的样式：隐藏遮罩层，修改弹窗的位置。

1. `iframe` 内的 `div` 无法全屏

弹窗的全屏，指的是在浏览器可视区全屏。这个全屏指的是占满用户屏幕。

全屏方案，原生方法使用的是 `Element.requestFullscreen()`，插件：[vue-fullscreen](https://link.juejin.cn?target=https%3A%2F%2Fmirari.cc%2F2017%2F08%2F14%2F%E5%85%A8%E5%B1%8F%E5%88%87%E6%8D%A2%E7%BB%84%E4%BB%B6vue-fullscreen%2F)。当页面在 `iframe` 里面时，全屏会报错，且 `dom` 结构错乱。

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/293a247da5ff48e7a308290dd9f58f3c~tplv-k3u1fbpfcp-watermark.awebp)

解决方案：`iframe` 标签设置 `allow="fullscreen"` 属性即可

1. 浏览器前进/后退问题

`iframe` 和主页面共用一个浏览历史，`iframe` 会影响页面的前进后退。大部分时候正常，`iframe` 多次重定向则会导致浏览器的前进后退功能无法正常使用。并且 `iframe` 页面刷新会重置（比如说从列表页跳转到详情页，然后刷新，会返回到列表页），因为浏览器的地址栏没有变化，`iframe` 的 `src` 也没有变化。

1. `iframe` 加载失败的情况不好处理

非同源的 `iframe` 在火狐及 `chorme` 都不支持 `onerror` 事件。

- 解决办法1：`onload` 事件里面判断页面的标题，是否 `404` 或者 `500`
- 解决办法2：使用 `try catch` 解决此问题，尝试获取 `contentDocument` 时将抛出异常。

解决办法参考：[stackoverflow上的问题：Catch error if iframe src fails to load](https://link.juejin.cn?target=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F15273042%2Fcatch-error-if-iframe-src-fails-to-load-error-refused-to-display-http-ww)

### `single-spa` 微前端方案

`spa` 单页应用时代，我们的页面只有 `index.html` 这一个 `html` 文件，并且这个文件里面只有一个内容标签 `<div id="app"></div>`，用来充当其他内容的容器，而其他的内容都是通过 `js` 生成的。也就是说，我们只要拿到了子项目的容器 `<div id="app"></div>` 和生成内容的 `js`，插入到主项目，就可以呈现出子项目的内容。

```html
<link href=/css/app.c8c4d97c.css rel=stylesheet>
<div id=app></div>
<script src=/js/chunk-vendors.164d8230.js> </script>
<script src=/js/app.6a6f1dda.js> </script> 
复制代码
```

我们只需要拿到子项目的上面四个标签，插入到主项目的 `HTML` 中，就可以在父项目中展现出子项目。

这里有个问题，由于子项目的内容标签是动态生成的，其中的 `img/video/audio` 等资源文件和按需加载的路由页面 `js/css` 都是相对路径，在子项目的 `index.html` 里面，可以正确请求，而在主项目的 `index.html` 里面，则不能。

举个例子，假设我们主项目的网址是 `www.baidu.com` ，子项目的网址是 `www.taobao.com` ，在子项目的 `index.html` 里面有一张图片 `<img src="./logo.jpg">`，那么这张图片的完整地址是 `www.taobao.com/logo.jpg`，现在将这个图片的 `img` 标签生成到了父项目的 `index.html`，那么图片请求的地址是 `www.baidu.com/logo.jpg`，很显然，父项目服务器上并没有这张图。

解决思路：

1. 这里面的 `js/css/img/video` 等都是相对路径，能否通过 `webpack` 打包，将这些路径全部打包成绝对路径？这样就可以解决文件请求失败的问题。
2. 能否手动（或借助 `node` ）将子项目的文件全部拷贝到主项目服务器上，`node` 监听子项目文件有更新，就自动拷贝过来，并且按 `js/css/img` 文件夹合并
3. 能否像 `CDN` 一样，一个服务器挂了，会去其他服务器上请求对应文件。或者说服务器之间的文件共享，主项目上的文件请求失败会自动去子服务器上找到并返回。

通常做法是动态修改 `webpack` 打包的 `publicPath`，然后就可以自动注入前缀给这些资源。

`single-spa` 是一个微前端框架，基本原理如上，在上述呈现子项目的基础上，还新增了 `bootstrap` 、 `mount` 、 `unmount` 等生命周期。

相对于 `iframe`，`single-spa` 让父子项目属于同一个 `document`，这样做既有好处，也有坏处。好处就是数据/文件都可以共享，公共插件共享，子项目加载就更快了，缺点是带来了 `js/css` 污染。

`single-spa` 上手并不简单，也不能开箱即用，开发部署更是需要修改大量的 `webpack` 配置，对子项目的改造也非常多。

### `qiankun` 方案

`qiankun` 是蚂蚁金服开源的一款框架，它是基于 `single-spa` 的。他在 `single-spa` 的基础上，实现了开箱即用，除一些必要的修改外，子项目只需要做很少的改动，就能很容易的接入。如果说 `single-spa` 是自行车的话，`qiankun` 就是个汽车。

微前端中子项目的入口文件常见的有两种方式：`JS entry` 和 `HTML entry`

纯 `single-spa` 采用的是 `JS entry`，而 `qiankun` 既支持 `JS entry`，又支持 `HTML entry`。

`JS entry` 的要求比较苛刻：

（1）将 `css` 打包到 `js` 里面

（2）去掉 `chunk-vendors.js`，

（3）去掉文件名的 `hash` 值

（4）将 `single-spa` 模式的入口文件( `app.js` )放置到 `index.html` 目录，其他文件不变，原因是要截取 `app.js` 的路径作为 `publicPath`

| APP entry    | 优点                                                         | 缺点                                                         |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `JS entry`   | 可以配合 `systemJs`，按需加载公共依赖( `vue` , `vuex` , `vue-router` 等) | 需要各种打包配置配合，无法实现预加载                         |
| `HTML entry` | 打包配置无需做太多的修改，可以预加载                         | 多一层请求，需要先请求到 `HTML` 文件，再用正则匹配到其中的 `js` 和 `css` |

其实 `qiankun` 还支持 `config entry` ：

```js
{
   entry: {
        scripts: [
          "app.3249afbe.js"
          "chunk-vendors.75fba470.js",
        ],
        styles: [
          "app.3249afbe.css"
          "chunk.75fba470.css",
        ],
        html: `<!doctype html>
        		  <html>
        			...
               `
    }
}
复制代码
```

建议使用 `HTML entry` ，使用起来和 `iframe` 一样简单，但是用户体验比 `iframe` 强很多。`qiankun` 请求到子项目的 `index.html` 之后，会先用正则匹配到其中的 `js/css` 相关标签，然后替换掉，它需要自己加载 `js` 并运行，然后去掉 `html/head/body` 等标签，剩下的内容原样插入到子项目的容器中 ：

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4c5ea8f4962411ea7a6aa81e0e6ae07~tplv-k3u1fbpfcp-watermark.awebp)

使用 `qiankun` 的好处：

1. `qiankun` 自带 `js/css` 沙箱功能，`singles-spa` 可以解决 `css` 污染，但是需要子项目配合
2. `single-spa` 方案只支持 `JS entry` 的特点，限制了它只能支持 `vue` 、 `react` 、 `angular` 等技术开发的项目，对一些 `jQuery` 老项目则无能为力。`qiankun` 则没有限制
3. `qiankun` 支持子项目预请求功能。

#### `js` 沙箱

`js/css` 污染是无法避免的，并且是一个可大可小的问题。就像一颗定时炸弹，不知道什么时候会出问题，排查也麻烦。作为一个基础框架，解决这两个污染非常重要，不能仅凭“规范”开发。

`js` 沙箱的原理是子项目加载之前，对 `window` 对象做一个快照，子项目卸载时恢复这个快照，如图：

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da362e782c0e448587dd5d4141ea50bc~tplv-k3u1fbpfcp-watermark.awebp)

那么如何监测 `window` 对象的变化呢，直接将 `window` 对象进行一下深拷贝，然后深度对比各个属性显然可行性不高，`qiankun`框架采用的是`ES6`新特性，`proxy`代理方法。具体如何操作的，之前的文章有写（链接在文末），就不再赘述。

但是 `proxy` 是不兼容 `IE11` 的，为了兼容，低版本 `IE` 采用了 `diff` 方法：浅拷贝 `window` 对象，然后对比每一个属性。

#### css 沙箱

`qiankun` 的 `css` 沙箱的原理是重写 `HTMLHeadElement.prototype.appendChild` 事件，记录子项目运行时新增的 `style/link` 标签，卸载子项目时移除这些标签。

`single-spa` 方案中我用了换肤的思路来解决 `css` 污染：首先 `css-scoped` 解决大部分的污染，对于一些全局样式，在子项目给 `body/html` 加一个唯一的 `id/class`（正常开发部署用），然后这个全局的样式前面加上这个 `id/class`，而 `single-spa` 模式则在 `mount` 周期给 `body/html` 加上这个唯一的 `id/class`，在 `unmount` 周期去掉，这样就可以保证这个全局 `css` 只对这个项目生效了。

这两个方案的致命点都在于无法解决多个子项目同时运行时的 `css` 污染，以及子项目对主项目的 `css` 污染。

虽然说两个项目同时运行常见并不常见，但是如果想实现 `keep-alive` ，就需要使用 `display: none` 将子项目隐藏起来，子项目不需要卸载，这时候就会存在两个子项目同时运行，只不过其中一个对用户不可见。

`css` 沙箱还有个思路就是将子项目的样式局限到子项目的容器范围内生效，这样只需要给不同的子项目不同的容器就可以了。但是这样也会有新的问题，子项目中 `append` 到 `body` 的弹窗，样式就无法生效。所以说样式污染还需要制定规范才行，约定 `class` 命名前缀。

## 微前端方案实践

在我的前几篇文章(链接在文末)中，`single-spa` 和 `qiankun` 的 `demo` 已经实现了，开发部署流程也都有，接下来就是实践出真知，用在实际项目中，才知道有那些坑。

### 改造已有的项目为 `qiankun` 子项目

由于我们是 `vue` 技术栈，所以我就以改造一个 `vue` 项目为例说明，其他的技术栈原理是一样的。

1. 在 `src` 目录新增文件 `public-path.js`：

```js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
复制代码
```

1. 修改 `index.html` 中项目初始化的容器，不要使用 `#app` ，避免与其他的项目冲突，建议换成项目 `name` 的驼峰写法
2. 修改入口文件 `main.js`：

```js
import './public-path';
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from './store';

Vue.use(VueRouter)
Vue.config.productionTip = false

let router = null;
let instance = null;
function render(parent = {}) {
  const router = new VueRouter({
    // histroy模式的路由需要设置base，app-history-vue根据项目名称来定
    base: window.__POWERED_BY_QIANKUN__ ? '/app-history-vue' : '/',
    mode: 'history',
    // hash模式不需要上面两行
    routes: []
  })
  instance = new Vue({
    router,
    store,
    render: h => h(App),
    data(){
      return {
        parentRouter: parent.router,
        parentVuex: parent.store,
      }
    },
  }).$mount('#appVueHistory');
}
//全局变量来判断环境，独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('vue app bootstraped');
}
export async function mount(props) {
  console.log('props from main framework', props);
  render(props.data);
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  router = null;
}
复制代码
```

主要改动是：引入修改 `publicPath` 的文件和 `export` 三个生命周期。

注意：

- `webpack` 的 `publicPath` 值只能在入口文件修改，之所以单独写到一个文件并在入口文件最开始引入，是因为这样做可以让下面所有的代码都能使用这个。
- 路由文件需要 `export` 路由数据，而不是实例化的路由对象，路由的钩子函数也需要移到入口文件。
- 在 `mount` 生命周期，可以拿到父项目传递过来的数据，`router` 用于跳转到主项目/其他子项目的路由，`store` 是父项目的实例化的 `Vuex`（也可以传递其他数据过来）。

1. 修改打包配置 `vue.config.js`:

```js
const { name } = require('./package');

module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  // 自定义webpack配置
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',// 把子应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
复制代码
```

注： 这个 `name` 默认从 `package.json` 获取，可以自定义，只要和父项目注册时的 `name` 保持一致即可。

这个配置主要就两个，一个是允许跨域，另一个是打包成 `umd` 格式。为什么要打包成 `umd` 格式呢？是为了让 `qiankun` 拿到其 `export` 的生命周期函数。我们可以看下其打包后的 `app.js` 就知道了:

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d98cf4e48d2a4e48811474240debf36c~tplv-k3u1fbpfcp-watermark.awebp)

`root` 在浏览器环境就是 `window` , `qiankun` 拿这三个生命周期，是根据注册应用时，你给的 `name` 值，`name` 不一致则会导致拿不到生命周期函数

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/88d0c7d9e4ad41399cf66edd8a6ef4fc~tplv-k3u1fbpfcp-watermark.awebp)

### 子项目开发的一些注意事项

1. 所有的资源（图片/音视频等）都应该放到 `src` 目录，不要放在 `public` 或 者`static`

资源放 `src` 目录，会经过 `webpack` 处理，能统一注入 `publicPath`。否则在主项目中会404。

参考：[vue-cli3的官方文档介绍：何时使用-public-文件夹](https://link.juejin.cn?target=https%3A%2F%2Fcli.vuejs.org%2Fzh%2Fguide%2Fhtml-and-static-assets.html%23%E4%BD%95%E6%97%B6%E4%BD%BF%E7%94%A8-public-%E6%96%87%E4%BB%B6%E5%A4%B9)

暴露给运维人员的配置文件 `config.js`，可以放在 `public` 目录，因为在 `index.html` 中 `url` 为相对链接的 `js/css` 资源，`qiankun` 会给其注入前缀。

1. 请给 `axios` 实例添加拦截器，而不是 `axios` 对象

后续会考虑子项目共享公共插件，这时就需要避免公共插件的污染

```js
// 正确做法：给 axios 实例添加拦截器
const instance = axios.create();
instance.interceptors.request.use(function () {/*...*/});
// 错误用法：直接给 axios 对象添加拦截器
axios.interceptors.request.use(function () {/*...*/});
复制代码
```

1. 避免 `css` 污染

组件内样式的 `css-scoped` 是必须的。

对于一些插入到 `body` 的弹窗，无法使用 `scoped`，请不要直接使用原 `class` 修改样式，请添加自己的 `class`，来修改样式。

```css
.el-dialog{
  /* 不推荐使用组件原有的class */
}
.my-el-dialog{
  /* 推荐使用自定义组件的class */
}
复制代码
```

1. 谨慎使用 `position：fixed`

在父项目中，这个定位未必准确，应尽量避免使用，确有相对于浏览器窗口定位需求，可以用 `position: sticky`，但是会有兼容性问题（IE不支持）。如果定位使用的是 `bottom` 和 `right`，则问题不大。

还有个办法，位置可以写成动态绑定 `style` 的形式:

```html
<div :style="{ top: isQiankun ? '10px' : '0'}">
复制代码
```

1. 给 `body` 、 `document` 等绑定的事件，请在 `unmount` 周期清除

`js` 沙箱只劫持了 `window.addEventListener`，使用 `document.body.addEventListener` 或者 `document.body.onClick` 添加的事件并不会被沙箱移除，会对其他的页面产生影响，请在 `unmount` 周期清除

## `qiankun` 常见问题及解决方案

### `qiankun` 常见报错

1. 子项目未 `export` 需要的生命周期函数

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49f33800f32547d0ba6eb31fc913f321~tplv-k3u1fbpfcp-watermark.awebp)

先检查下子项目的入口文件有没有 `export` 生命周期函数，再检查下子项目的打包，最后看看请求到的子项目的文件对不对。

1. 子项目加载时，容器未渲染好

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8a149eeb6f6480db43e7dc4b9f48e82~tplv-k3u1fbpfcp-watermark.awebp)

检查容器 `div` 是否是写在了某个路由里面，路由没匹配到所有未加载。如果只在某个路由页面加载子项目，可以在页面的 `mounted` 周期里面注册子项目并启动。

### 主项目路由只能用`history`模式吗？

由于 `qiankun` 是通过 `location.pathname` 值来判断当前应该加载哪个子项目的，所以需要给每个子项目注入不同的路由 `path`，而 `hash` 模式子项目路由跳转不改变 `path`，所以无影响，`history` 模式子项目路由设置 `base` 属性即可。

如果主项目使用 `hash` 模式，那么得用 `location.hash` 值来判断当前应该加载哪个子项目，并且子项目都得是 `hash` 模式，还需要给子项目所有的路由都添加一个前缀，子项目的路由跳转如果之前使用的是 `path` 也需要修改，用 `name` 跳转则不用。

如果主项目是 `hash` 模式子项目为 `history` 模式，那么跳转到子项目之后，无法跳转到另一个 `history` 模式的子项目，也无法回到主项目的页面。

`vue` 项目 `hash` 模式改 `history` 模式也很简单:

1. `new Router` 时设置 `mode` 为 `history` ：

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4f923acb8624b04965970cc9c28ffda~tplv-k3u1fbpfcp-watermark.awebp)

1. `webpack` 打包的配置( `vue.config.js` ) :

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7667f1c89c6c4a71b2e7b2de77ffeb1a~tplv-k3u1fbpfcp-watermark.awebp)

1. 一些资源会报 404，相对路径改为绝对路径：`<img src="./img/logo.jpg">` 改为 `<img src="/img/logo.jpg">` 即可

### `css` 污染问题及加载 `bug`

1. `qiankun` 只能解决子项目之间的样式相互污染，不能解决子项目的样式污染主项目的样式

主项目要想不被子项目的样式污染，子项目是 `vue` 技术，样式可以写 `css-scoped` ，如果子项目是 `jQuery` 技术呢？所以主项目本身的 `id/class` 需要特殊一点，不能太简单，被子项目匹配到。

1. 从子项目页面跳转到主项目自身的页面时，主项目页面的 `css` 未加载的 `bug`

产生这个问题的原因是：在子项目跳转到父项目时，子项目的卸载需要一点点的时间，在这段时间内，父项目加载了，插入了 `css`，但是被子项目的 `css` 沙箱记录了，然后被移除了。父项目的事件监听也是一样的，所以需要在子项目卸载完成之后再跳转。我原本想在路由钩子函数里面判断下，子项目是否卸载完成，卸载完成再跳转路由，然而路由不跳转，子项目根本不会卸载。

临时解决办法：先复制一下 `HTMLHeadElement.prototype.appendChild` 和 `window.addEventListener` ，路由钩子函数 `beforeEach` 中判断一下，如果当前路由是子项目，并且去的路由是父项目的，则还原这两个对象.

```js
const childRoute = ['/app-vue-hash','/app-vue-history'];
const isChildRoute = path => childRoute.some(item => path.startsWith(item))
const rawAppendChild = HTMLHeadElement.prototype.appendChild;
const rawAddEventListener = window.addEventListener;
router.beforeEach((to, from, next) => {
  // 从子项目跳转到主项目
  if(isChildRoute(from.path) && !isChildRoute(to.path)){
    HTMLHeadElement.prototype.appendChild = rawAppendChild;
    window.addEventListener = rawAddEventListener;
  }
  next();
});
复制代码
```

### 路由跳转问题

在子项目里面如何跳转到另一个子项目/主项目页面呢，直接写 `<router-link>` 或者用 `router.push/router.replace` 是不行的，原因是这个 `router` 是子项目的路由，所有的跳转都会基于子项目的 `base` 。写 `<a>` 链接可以跳转过去，但是会刷新页面，用户体验不好。

解决办法也比较简单，在子项目注册时将主项目的路由实例对象传过去，子项目挂载到全局，用父项目的这个 `router` 跳转就可以了。

但是有一丢丢不完美，这样只能通过 `js` 来跳转，跳转的链接无法使用浏览器自带的右键菜单（如图：`Chrome` 自带的链接右键菜单）

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ed6fbb1ae364af2ad4f4f0e44a13473~tplv-k3u1fbpfcp-watermark.awebp)

### 项目通信问题

项目之间的不要有太多的数据依赖，毕竟项目还是要独立运行的。通信操作需要判断是否 `qiankun` 模式，做兼容处理。

通过 `props` 传递父项目的 `Vuex` ，如果子项目是 `vue` 技术栈，则会很好用。假如子项目是 `jQuery/react/angular` ，就不能很好的监听到数据的变化。

`qiakun` 提供了一个全局的 `GlobalState` 来共享数据。主项目初始化之后，子项目可以监听到这个数据的变化，也能提交这个数据。

```js
// 主项目初始化
import { initGlobalState } from 'qiankun';
const actions = initGlobalState(state);
// 主项目项目监听和修改
actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log(state, prev);
});
actions.setGlobalState(state);

// 子项目监听和修改
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev);
  });
  props.setGlobalState(state);
}
复制代码
```

`vue` 项目之间数据传递还是使用共享父组件的 `Vuex` 比较方便，与其他技术栈的项目之间的通信使用 `qiankun` 提供的 `GlobalState` 。

### 子项目之间的公共插件如何共享

如果主项目和子项目都用到了同一个版本的 `Vue/Vuex/Vue-Router` 等，主项目加载一遍之后，子项目又加载一遍，就很浪费。

要想复用公共依赖，前提条件是子项目必须配置 `externals` ，这样依赖就不会打包进 `chunk-vendors.js` ，才能复用已有的公共依赖。

按需引入公共依赖，有两个层面：

1. 没有使用到的依赖不加载
2. 大插件只加载需要的部分，例如 `UI` 组件库的按需加载、`echarts/lodash` 的按需加载。

`webpack` 的 `externals` 是支持大插件的按需引入的：

```js
subtract : {
   root: ['math', 'subtract']
}
复制代码
```

`subtract` 可以通过全局 `math` 对象下的属性 `subtract` 访问（例如 `window['math']['subtract']`）。

#### `single-spa` 可以按需引入子项目的公共依赖

`single-spa` 是使用 `systemJs` 加载子项目和公共依赖的，将公共依赖和子项目一起配置到 `systemJs` 的配置文件 `importmap.json` ，就可以实现公共依赖的按需加载：

```json
{
 "imports": {
   "appVueHash": "http://localhost:7778/app.js",
   "appVueHistory": "http://localhost:7779/app.js",
   "single-spa": "https://cdnjs.cloudflare.com/ajax/libs/single-spa/4.3.7/system/single-spa.min.js",
   "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js",
   "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@3.0.7/dist/vue-router.min.js",
   "echarts": "https://cdn.bootcss.com/echarts/4.2.1-rc1/echarts.min.js"
 }
}
复制代码
```

#### `qiankun` 如何按需引入公共依赖

巨无霸应用的公共依赖和公共函数被太多的页面使用，导致升级和改动困难，使用微前端可以让各个子项目独立拥有自己的依赖，互不干扰。而我们想要复用公共依赖，这与微前端的理念是相悖的。

所以我的想法是：父项目提供公共依赖，子项目可以自由选择用或者不用。

这个也很好实现，父项目先加载好依赖，然后在注册子项目时，将 `Vue/Vuex/Vue-Router` 等通过 `props` 传过去，子项目可以选择用或者不用。

主项目：

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { registerMicroApps, start } from 'qiankun';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

registerMicroApps([
  { 
    name: 'app-vue-hash', 
    entry: 'http://localhost:1111', 
    container: '#appContainer', 
    activeRule: '/app-vue-hash', 
    props: { data : { store, router, Vue, Vuex, VueRouter } }
  },
]);

start();
复制代码
```

子项目：

```js
import Vue from 'vue'

export async function bootstrap() {
  console.log('vue app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  const { VueRouter, Vuex } = props.data;
  Vue.use(VueRouter);
  Vue.use(Vuex);
  render(props.data);
}

export async function unmount() {
  instance.$destroy();
  instance = null;
  router = null;
}
复制代码
```

这样做不太可行，原因有两个：

1. 子项目独立运行时，`Vue-Router/Vuex`这些依赖从哪里来？子项目是只部署一份的，既可以独立运行，也可以被 `qiankun` 集成。
2. 父项目只能传递它自己已经有的依赖，如何确定子项目需要哪些依赖？不满足按需引入的需求

配置 `webpack` 的 `externals` 之后，子项目独立运行时，这些依赖的来源**有且仅有** `index.html` 中的外链 `script` 标签。

在这个前提下，子项目和主项目的 `vue` 版本一致的情况下，使用同一份服务器文件。即使无法共享，也是可以做 `http` 缓存的。

那么 `qiankun` 能否做到，某个依赖加载了之后，不再加载，直接复用呢？比如说子项目 A 请求了服务器上的 2.6 版本 `vue`，切换到子项目 B，B 项目也用了这个 `vue` 文件，能否不再次加载，直接复用呢？

其实是可以的，可以看到 `qiankun` 将子项目的外链 `script` 标签，内容请求到之后，会记录到一个全局变量中，下次再次使用，他会先从这个全局变量中取。这样就会实现内容的复用，只要保证两个链接的`url`一致即可。

```js
const fetchScript = scriptUrl => scriptCache[scriptUrl] ||
		(scriptCache[scriptUrl] = fetch(scriptUrl).then(response => response.text()));
复制代码
```

所以只要子项目配置了 `webpack` 的 `externals`，并在 `index.html` 中使用外链 `script` 引入这些公共依赖，只要这些公共依赖在同一台服务器上，便可以实现子项目的公共依赖的按需引入，一个项目使用了之后，另一个项目使用不再重复加载，可以直接复用这个文件。

#### `qiankun` 更完美的按需引入

虽然 `qiankun` 不会重复请求相同 `url` 的公共依赖，但是这也仅比 `http` 缓存强了一丢丢。

有缺陷的地方在于：

1. 主项目中的公共依赖没有记录到这个缓存中，也就不会被其他的项目复用
2. 只是没有重复请求，还是需要重复执行一次。能否不执行，直接复用？。`js` 沙箱在子项目卸载时，会移除 `window` 上新增的变量，而 `webpack` 的 `externals`恰恰是将这些公共依赖挂载在 `window` 上，能否看情况移除这些公共依赖？
3. 相同版本的依赖会复用，版本不同但是使用无差别，能否做到也复用？（版本不同 `url` 也就不同，就不会复用）但是这里可能会有一些疑问，既然使用无差别，为什么不升级插件？

这些问题可能需要去改动 `qiankun` 的源码。

### `jQuery` 老项目的资源加载问题

子项目的内容标签插到父项目的 `index.html` 后，其中的资源( `img/video/audio` 等)路径都是相对的，导致资源无法正确显示。上面我列举了三种解决方案。

一般来说，`jQuery` 项目是不经过 `webpack` 打包的，所以没法通过修改 `publicPath` 来注入路径前缀。后面两种方法操作起来比较麻烦，或者说我们应该**优先从框架本身**解决这个问题，而不是其他方法。所以我想了如下三种方案：

#### 方案一：动态插入 `<base>` 标签

`html` 有一个原生标签 `<base>`，这个标签只能放在 `<head>` 里面，它的 `href` 属性是一个 `url` 值。 `mdn` 地址：[ base 文档根 URL 元素 ](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FHTML%2FElement%2Fbase)

设置了 `<base>` 标签之后，页面上所有的链接和 `url` 都基于它的 `href`。例如页面访问地址是 `https://www.taobao.com` ，设置 `<base href="https://www.baidu.com">` 之后，页面中原本的图 `<img src="./img/jQuery1.png" alt="">` 的实际请求地址会变成 `https://www.baidu.com/img/jQuery1.png` ，页面上的 `<a>` 链接:`<a href="/about"></a>`，点击之后，页面会跳转到：`https://www.baidu.com/about`

可以看到，`<base>` 标签和 `webpack` 的 `publicPath` 有一样的效果，那么能否在 `jQuery` 项目加载之前，把 `jQuery` 项目的地址赋给 `<base>` 标签，然后插入到 `<head>` ？这样就可以解决 `jQuery` 项目的资源加载问题。

做法也很简单，在 `qiankun` 提供的 `beforeLoad` 生命周期，判断当前是否是 `jQuery` 项目：

```js
beforeLoad: app => {
   if(app.name === 'purehtml'){
       const baseTag = document.createElement('base');
       baseTag.setAttribute('href',app.entry);
       console.log(baseTag);
       document.head.appendChild(baseTag);
   }
},
beforeUnmount: app => {
   if(app.name === 'purehtml'){
      const baseTag = document.head.querySelector('base');
      document.head.removeChild(baseTag);
   }
}
复制代码
```

这样做子项目资源可以正确加载，但是 `<base>` 标签的威力太强大了，会导致所有的路由无法正常跳转，跳转到其他的子项目时，`<a>` 链接是基于 `<base>` 的，会跳转到 `jQuery` 子项目的不存在的路由。解决了一个 `bug` ，又出现了新的 `bug` ，这样是不行的。所以这个方案可行性特别小。

#### 方案二：劫持标签插入函数

这个方案分两步：

1. 对于 `HTML` 中已有的 `img/audio/video` 等标签，`qiankun` 支持重写 `getTemplate` 函数，可以将入口文件 `index.html` 中的静态资源路径替换掉
2. 对于动态插入的 `img/audio/video` 等标签，劫持 `appendChild` 、 `innerHTML` 、`insertBefore` 等事件，将资源的相对路径替换成绝对路径

前面我们说到，对于子项目是 `HTML entry` 的，`qiankun` 拿到入口文件 `index.html` 之后，会用正则匹配到 `<body>` 标签及其内容，`<head>` 中的 `link/style/script/meta` 等标签，然后插入到父项目的容器中。

![img](https:////p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa13c0a9c18b4351a7cc088ed3f5348f~tplv-k3u1fbpfcp-watermark.awebp)

我们可以传递一个 `getTemplate` 函数，将图片的相对路径转为绝对路径，它会在处理模板时使用:

```js
start({
  getTemplate(tpl,...rest) {
    // 为了直接看到效果，所以写死了，实际中需要用正则匹配
    return tpl.replace('<img src="./img/jQuery1.png">', '<img src="http://localhost:3333/img/jQuery1.png">');
  }
});
复制代码
```

对于动态插入的标签，劫持其插入 `DOM` 的函数，注入前缀。

假如子项目动态插入一张图:

```js
const render = $ => {
  $('#purehtml-container').html('<p>Hello, render with jQuery</p><img src="./img/jQuery2.png">');
  return Promise.resolve();
};
复制代码
```

主项目劫持 `jQuery` 的 `html` 方法:

```js
beforeMount: app => {
   if(app.name === 'purehtml'){
       // jQuery 的 html 方法是一个挺复杂的函数，这里只是为了看效果，简写了
       $.prototype.html = function(value){
          const str = value.replace('<img src="/img/jQuery2.png">', '<img src="http://localhost:3333/img/jQuery2.png">')
          this[0].innerHTML = str;
       }
   }
}
复制代码
```

当然了，还有个简单粗暴的写法，给 `jQuery` 项目的图片路径写成绝对路径，但是不建议这么做，换个服务器部署就不能用了。

#### 方案三：给 `jQuery` 项目加上 `webpack` 打包

这个方案的可行性不高，都是陈年老项目了，没必要这样折腾。

#### 老项目的资源加载总结

`qiankun` 本身就对接入 `jQuery` 多页应用比较乏力，一般使用场景就是，一个大项目只接入某个/某几个页面，这样的话使用方案二比较合理。

### `qiankun` 使用总结

1. 只有一个子项目时，要想启用预加载，必须使用`start({ prefetch: 'all' })`
2. `js` 沙箱并不能解决所有的 `js` 污染，例如我用 `onclick` 或 `addEventListener` 给 `<body>` 添加了一个点击事件，`js` 沙箱并不能消除它的影响，所以说，还得靠代码规范和自己自觉
3. `qiankun` 框架不太好实现 `keep-alive` 需求，因为解决 `css/js` 污染的办法就是删除子项目插入的 `css` 标签和劫持 `window` 对象，卸载时还原成子项目加载前的样子，这与 `keep-alive` 相悖： `keep-alive` 要求保留这些，仅仅是样式上的隐藏。
4. `qiankun` 无法很好嵌入一些老项目

虽然 `qiankun` 支持 `jQuery` 老项目，但是似乎对**多页应用**没有很好的解决办法。每个页面都去修改，成本很大也很麻烦，但是使用 `iframe` 嵌入这些老项目就比较方便。

1. 安全和性能的问题

`qiankun` 将每个子项目的 `js/css` 文件内容都记录在一个全局变量中，如果子项目过多，或者文件体积很大，可能会导致内存占用过多，导致页面卡顿。

另外，`qiankun` 运行子项目的 `js`，并不是通过 `script` 标签插入的，而是通过 `eval` 函数实现的，`eval` 函数的安全和性能是有一些争议的：[MDN的eval介绍](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2Feval)

1. 微前端调试时，每次都需要分别进入子项目和主项目运行和打包，非常麻烦，可以使用 `npm-run-all` 插件来实现：一个命令，运行所有项目。

```json
{
  "scripts": {
    "install:hash": "cd app-vue-hash && npm install",
    "install:history": "cd app-vue-history && npm install",
    "install:main": "cd main && npm install",
    "install:purehtml": "cd purehtml && npm install",
    "install-all": "npm-run-all install:*",
    "start:hash": "cd app-vue-hash && npm run serve ",
    "start:history": "cd app-vue-history && npm run serve",
    "start:main": "cd main && npm run serve",
    "start:purehtml": "cd purehtml && npm run serve",
    "start-all": "npm-run-all --parallel start:*",
    "serve-all": "npm-run-all --parallel start:*",
    "build:hash": "cd app-vue-hash && npm run build",
    "build:history": "cd app-vue-history && npm run build",
    "build:main": "cd main && npm run build",
    "build-all": "npm-run-all --parallel build:*"
  }
}
复制代码
```

其中 `--parallel` 参数表示并行，没有这个参数则是等上一个命令执行完才会执行下一个命令。

## 结尾

不要对 `iframe` 抱有偏见，它也是微前端的一种实现方式，如果页面上无弹窗、无全屏等操作，`iframe` 也是很好用的。配置缓存和 `cdn` 加速，如果是内网访问，也不会很慢。

`iframe` 和 `qiankun` 可以并存，`jQuery` 多页应用使用 `iframe` 接入就挺好，什么时候什么场景该用哪种方案，具体情况具体分析。

