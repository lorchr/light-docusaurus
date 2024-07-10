- [万万没想到《用浏览器打开终端竟这么容易实现！》](https://juejin.cn/post/7028813566266310686)
- [万万没想到，用浏览器打开终端竟这么容易实现](https://mp.weixin.qq.com/s/o93H_qUvyeHlAGwjzxl83g)

## 前言
你所追求的事物，所做的每一件事情，都有它存在的意义

说到用网页打开终端，相信大多数人都使用过，但是应该也没几个人去认真研究过🤔。自己也是因工作需要，于是对其进行了一番探索。

如果你有用过云服务器，肯定对这个就更熟悉了，比如阿里云的Workbench远程连接。它提供给我们的服务便利性、用户体验还是相当不错的，让我们和实际的机器通过网络联通了。

除此之外，浏览器上能运行的东西还有很多，如：云文档、云软件、云IDE、云储存、云函数、云调用、云编辑器 等等......

下面我们来做个小任务：用网页打开终端，然后在终端输入small_cat指令后，在终端输出一群小猫咪🐱。

## 先一睹为快


## 快速实现(仅需两步🚀 + 浏览器访问)
已有很成熟的组件库基于xterm.js来实现网页终端，比如webssh（More Real-world Uses），仅需两步就可以在网页连接你的服务器了。有木有很惊喜😁

### 1. 执行`pip install webssh`，安装webssh
首先要确定电脑安装了Python，且版本为2.7/3.4+

但实际上还是使用了python3（用pythond+pip安装时报错了，可能是Python和pip版本不匹配）。

如果你使用的mac，可以通过命令查看是否已存在python3，如下：

```bash
python2 --version
-> Python 2.7.16
python3 --version 或者 /usr/bin/python3 --version
-> Python 3.9.5
```

确定有python3之后可以直接执行（如有错误可再升级pip）：

```bash
python3 -m pip install webssh 或者 pip3 install webssh

# 如果pip报错，根据终端提示升级pip，执行：
sudo /usr/bin/python3 -m pip install --upgrade pip

// 再重新安装即可
sudo /usr/bin/python3 -m pip install webssh
```

### 2. 启动webssh服务
在终端输入wssh即可在本地打开浏览器访问了。

（当然，运行wssh会占用进程，如果是部署到生产环境，需要使其在后台运行，并开启进程守护）

更多使用可参考webssh使用：[huashengdun/webssh](https://github.com/huashengdun/webssh)

### 3. 猫咪要怎样画？
回答可能会让你大跌眼镜👓----答案是使用console😄，我们可以使用console输出字符图片，也可以使用console输出背景图案（nodejs的console不支持输出背景图）。（当然也可以使用echo, 总之都是用shell去执行的脚本。）

到此，这个小任务就已完成了。

当然，如果你是对技术比较有追求的小伙伴，想自己实现扩展一些功能的话，也是没问题的。请看下面：

## 亲自动手实现
经了解发现，浏览器打开终端的解决方案，大部分使用的xterm.js，它被 VS Code、Hyper 和 Theia 等流行项目使用。除了提供基本的功能，还提供了很多终端相关的插件。下面我们一起来使用它，实现自己的网页终端。

### 1. 根据官方文档安装运行[xtermjs文档地址](https://xtermjs.org/)
安装：`npm install xterm`

直接在页面中使用：
```html
<!doctype html>
  <html>
    <head>
      <link rel="stylesheet" href="node_modules/xterm/css/xterm.css" />
      <!-- 也可以直接使用使用xterm的cdn静态资源 -->
      <script src="node_modules/xterm/lib/xterm.js"></script>
    </head>
    <body>
      <div id="terminal"></div>
      <script>
        var term = new Terminal();
        term.open(document.getElementById('terminal'));
        term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
      </script>
    </body>
  </html>
```

### 2.在客服端无法输入字符
运行后，发现无法在浏览器终端输入任何字符。查找文档后发现需要监听每次的输入：

```javascript
term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
// 需要在脚本下增加：
term.onData((value)=>{
  term.write(value)
})
```

### 3.按删除键无效，回车时光标到了第一个字符
再次尝试，发现可以输入了，但是无法删除已输入的字符，继续查文档，发现是编码问题，无法识别删除等键。如文档所说，需使用node-pty来编译输入,它是基于 Node.js 的解决方案。

原理梳理（简概）

> 实现的逻辑是：客户端的任何输入指令 ==> 通过websocket传入到后端 ==> 在后端虚拟终端中编译后 ==> 再将结果通过websocket返回给客户端。

### 4.服务端虚拟终端（接收和转换来自客服端的输入）
浏览器端的具体实现（完整）：

```html
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/xterm/css/xterm.css" />
  <script src="node_modules/xterm/lib/xterm.js"></script>
  <script src="https://www.unpkg.com/dayjs@1.10.7/dayjs.min.js"></script>
  <script src="https://www.unpkg.com/xterm-addon-attach@0.6.0/lib/xterm-addon-attach.js"></script>
</head>

<body>
  <div id="terminal"></div>
  <script>
    var term = new Terminal();
    term.open(document.getElementById('terminal'));
    term.focus()
    const socketURL = "ws://127.0.0.1:3030/socket";
    const ws = new WebSocket(socketURL);
    attachAddon = new AttachAddon.AttachAddon(ws);
    term.loadAddon(attachAddon);
  </script>
</body>
</html>

<!-- copy后可直接在本地尝试使用 -->
```

服务端的具体实现（完整）：

```javascript
#!/usr/bin/env node
var express = require('express');
var app = express();
const pty = require("node-pty");
require('express-ws')(app);

const os = require("os");
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
app.ws("/socket", (ws, req) => {
  console.log('websocket连接成功了')
  // 每次连接的时候都要生成一次term。否则在客服端刷新页面时，服务端的term就会失去连接
  // 虚拟终端（接收和转换输入）
  const term = pty.spawn(shell, ["--login"], {
    name: "xterm",
    cols: 50,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });
  ws.on("open", (data) => {
    console.log('open data===', data)
  });
  term.on("data", function (data) {
    console.log('发送给客服端的数据===', data)
    ws.send(data);
  });
  ws.on("message", (data) => {
    console.log('接收客服端的数据===', data)
    term.write(data);
  });
  ws.on("close", function () {
    term.kill();
  });
});
app.listen(3030);

// copy后可直接在本地尝试使用
```

需要注意的是：客户端每次连接服务端的时候都要生成一次term，因此在socket每次连接时都需要初始化一次。否则在客服端重新刷新页面时，服务端的term就会失去连接

目前，我们已实现了网页终端的基本功能，官网还提供了很多有意思的插件，有兴趣的小伙伴可以去尝试哟！（[More Real-world Uses](https://xtermjs.org/)）

文章主体内容已完成，后续会继续补充一些关于linux命名行操作、vim快捷操作的相关内容。感兴趣的同学可以先加个收藏（Ctrl + D 或 command + D），以备不时之需。

## 最后
如果我们在遇到某些问题没有完整的思路时，也不妨先尝试下去实现。在实现的过程中再去寻找方法、总结经验。而不应该没有任何尝试就放弃实现或者认为不可能实现。

如果觉得有帮助，不妨点赞、关注支持一下。如文章有不足之处、疑问或建议，希望能在下方👇🏻 留言，非常感谢。
