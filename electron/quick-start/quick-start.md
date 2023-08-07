- [Offical](https://www.electronjs.org/)
- [Github](https://github.com/electron/electron)
- [Offical Document](https://www.electronjs.org/zh/docs/latest/)
- [Offical API Document](https://www.electronjs.org/zh/docs/latest/api/app)
- [Quick Start](https://www.electronjs.org/zh/docs/latest/tutorial/quick-start)

## 前提条件
需要有[Node.js](https://nodejs.org/en/download/)环境

```shell
# 建议Node版本在12以上
node -v

npm -v

# 配置国内镜像源，否则容易安装失败
npm config set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

## Hello World

### 1. 初始化项目

```shell
mkdir my-electron-app && cd my-electron-app
npm init -y
```
init初始化命令会提示您在项目初始化配置中设置一些值 为本教程的目的，有几条规则需要遵循：

- entry point 应为 main.js.
- author 与 description 可为任意值，但对于[应用打包](https://www.electronjs.org/zh/docs/latest/tutorial/quick-start#package-and-distribute-your-application)是必填项。
你的 package.json 文件应该像这样：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Lorch",
  "license": "MIT"
}
```

### 2. [安装Electron](https://www.electronjs.org/zh/docs/latest/tutorial/installation)
然后，将 electron 包安装到应用的开发依赖中。
```shell
npm install --save-dev electron
```
在package.json中增加start命令
```json
{
  "scripts": {
    "start": "electron ."
  }
}
```


最终的package.json长这样
```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World",
  "main": "main.js",
  "author": "Lorch",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "devDependencies": {
    "electron": "^25.2.0"
  }
}
```

### 3. 编写入口类main.js及页面index.html
1. main.js
```js
// main.js

// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载 index.html
  mainWindow.loadFile('index.html')

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态, 
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。
```

2. preload.js
```js
// preload.js

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
```

3. index.html
```html
<!--index.html-->

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>你好!</title>
  </head>
  <body>
    <h1>你好!</h1>
    我们正在使用 Node.js <span id="node-version"></span>,
    Chromium <span id="chrome-version"></span>,
    和 Electron <span id="electron-version"></span>.

    <！-- 您也可以此进程中运行其他文件 -->
    <script src="./renderer.js"></script>
  </body>
</html>
```

### 4. 运行项目
```shell
npm start
```

### 5. 打包

最快捷的打包方式是使用 [Electron Forge](https://www.electronforge.io/)。

1. 将 Electron Forge 添加到您应用的开发依赖中，并使用其"import"命令设置 Forge 的脚手架：
```shell
npm install --save-dev @electron-forge/cli
npx electron-forge import

✔ Checking your system
✔ Initializing Git Repository
✔ Writing modified package.json file
✔ Installing dependencies
✔ Writing modified package.json file
✔ Fixing .gitignore

We have ATTEMPTED to convert your app to be in a format that electron-forge understands.

Thanks for using "electron-forge"!!!
```

2. 使用 Forge 的 make 命令来创建可分发的应用程序：
```shell
npm run make

> my-electron-app@1.0.0 make /my-electron-app
> electron-forge make

✔ Checking your system
✔ Resolving Forge Config
We need to package your application before we can make it
✔ Preparing to Package Application for arch: x64
✔ Preparing native dependencies
✔ Packaging Application
Making for the following targets: zip
✔ Making for target: zip - On platform: darwin - For arch: x64
```

Electron-forge 会创建 out 文件夹，您的软件包将在那里找到：
```shell
// Example for macOS
out/
├── out/make/zip/darwin/x64/my-electron-app-darwin-x64-1.0.0.zip
├── ...
└── out/my-electron-app-darwin-x64/my-electron-app.app/Contents/MacOS/my-electron-app
```

**Note:** 安装`Electron Forge`时可能会出现异常导致失败，大概率是Node版本不匹配导致的，注意错误日志信息
