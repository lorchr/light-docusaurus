[TOC]
Termux 高级终端安装使用配置教程，刚写这篇文章的时候，当时国内 Termux 相关的文章和资料相对来说还是比较少的，就花了几天写了这一篇文章，没想到居然火了，受宠若惊。所以这篇文章国光就打算定期更新了，想打造成 Termux 的中文文档，希望本文可以帮助到更多对 Termux 感兴趣的朋友，发挥 Android 平台更大的 DIY 空间。

## 1. 版权声明
17 年开始接触到 Termux，就发现它有很多值得挖掘的潜力，于是抽空在 18 年的某一个法定的整整花了三天假期开才写完第一版文章，然后文章陆陆续续更新到现在，期间有一次误操作不小心把博客所有的评论都删了，否则这篇文章的评论数会更多。现在本文的截图数量达到了 150 张左右了，文字数目已经数万多了。自己花了很长时间写出来的原创文章，抄袭白嫖党直接 Ctrl+C Ctrl+V 只要几秒钟。原创很辛苦，抄袭的成本却很低，维权的成本又很高，虽然国内目前的抄袭风气很严重，但是我相信尊重原创，保护原创从现在做起从大家做起，tomorrow is another day! 如果大面转载引用的话 希望标明文章出处:

### Termux 高级终端安装使用配置教程

https://www.sqlsec.com/2018/05/termux.html

## 2. 学习资源
考虑到手机用户体验和离线观看教程的需求，国光打包了几种风格的 PDF 版本，并且已经插入好目录，阅读体验会比较友好。

- 黑色背景的 PDF : [Termux 入门指南（Vue 黑）](https://sqlsec.lanzoux.com/ibuzvna)
- 白色背景的 PDF : [Termux 入门指南（Github 白）](https://sqlsec.lanzoux.com/ibuztyj)
- macOS light 风格 : [Termux 入门指南（macOS 白）](https://sqlsec.lanzoux.com/ibuzuxe)
- Gothic 风格 : [Termux 入门指南（简约线条）](https://sqlsec.lanzoux.com/ibuztch)

因为本文内容超级长，也包含了大量的图片，手机浏览起来难免会卡顿，而且如果你浏览比较拮据的话，还是建议看 PDF 版本的，国光还是比较建议有条件的同学使用 PC 端观看本文。

早期我的信息安全交流群里面陆陆续续加了很多 Temux 玩家，然而那是一个信息安全交流群，Termux 的提问经常没有人回答，所以后来我就把博客所有的加群链接给去了。现在国光我单独建立了 1 个 Temux 群，加群链接藏在本文当中，是一个彩蛋，缘妙不可言，随缘入群吧。好了话不多说，教程开始了，希望本文可以帮助到大家。

## 3. Termux 简介
文档相关

- [Termux 官网](https://termux.com/)
- [Github 项目地址](https://github.com/termux/termux-app)
- [官方英文 WiKi 文档](https://wiki.termux.com/wiki/Main_Page)

下载地址

- [F-Droid 下载地址](https://f-droid.org/packages/com.termux/)
- [Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux)
- [酷安 下载地址](https://www.coolapk.com/apk/com.termux)

> F-Droid 市场版本下载的版本比 Google Play （貌似 1 年多没有更新了）下载的要新，而且插件这块安装也很方便，有能力的朋友建议首先考虑下载 F-Droid 版本的，然后考虑 Google Play 版本，最后再考虑酷安的版本。

Termux 是一个 Android 下一个高级的终端模拟器，开源且不需要 root，支持 apt 管理软件包，十分方便安装软件包，完美支持 Python、 PHP、 Ruby、 Nodejs、 MySQL 等。随着智能设备的普及和性能的不断提升，如今的手机、平板等的硬件标准已达到了初级桌面计算机的硬件标准，用心去打造 DIY 的话完全可以把手机变成一个强大的极客工具。

### 初始化

第一次启动 Termux 的时候需要从远程服务器加载数据，然而可能会遇到这种问题：

```shell
Ubable to install
Termux was unable to install the bootstrap packages.
Check your network connection and try again.
```

这里的 Termux 官方远程的服务器地址是: http://termux.net/bootstrap/

目前解决方法有两种：
- VPN 全局代理 （成功率很高）
- 如果你是 WiFi 的话尝试切换到运营商流量 （有一定成功率）
- ① F-Droid > ② Google Play > ③ 酷安 根据这个顺序尝试安装，如果不行再重复 1、2 步骤操作

## 4. 基本操作
基本操作还是要学习一下的，可以事半功倍。

### 1. 缩放文本
可以使用缩放手势来调整其字体大小。 对就是 「双指放大缩小」照片那样操作。

### 2. 长按屏幕
长按屏幕会调出显示菜单项（包括复制、粘贴、更多），方便我们进行复制或者粘贴：

More 菜单的说明如下：

```shell
├── COPY:    # 复制
├── PASTE:   # 粘贴
├── More:    # 更多
   ├── Select URL:             # 提取屏幕所有网址
   └── Share transcipt:        # 分享命令脚本
   └── Reset:                  # 重置
   └── Kill process:           # 杀掉当前会话进程
   └── Style:                  # 风格配色 需要自行安装
   └── Keep screen on:         # 保持屏幕常亮
   └── Help:                   # 帮助文档
```

### 3. 会话管理
显示隐藏式导航栏，可以新建、切换、重命名会话 session 和调用弹出输入法：

同时在 Android 的通知栏中也可以看到当前 Termux 运行的会话数：



### 4. 常用按键
常用键是 PC 端常用的按键如: ESC 键、Tab 键、CTR 键、ALT 键，有了这些按键后可以提高我们日常操作的效率，所以 Termux 后面的版本默认都是显示这个扩展功能按键的。 (18 年的时候默认是不显示的)：



打开和隐藏这个扩展功能按键目前有下面两种方法：

#### 方法一

从左向右滑动，显示隐藏式导航栏，长按左下角的 KEYBOARD

#### 方法二

使用 Termux 快捷键: 音量++Q 键 或者 音量++K 键

当然这个常用按键在 Termux 后面的版本也支持自定义的，详情见本文的「进阶配置」-「定制常用按键」这一小节。

## 5. 基础知识
这些基础知识简单了解一下就可以了，Linux 用的多了就会慢慢熟悉理解了。

### 1. 快捷键表
Ctrl 键是终端用户常用的按键，但大多数触摸键盘都没有这个按键，因此 Termux 使用音量减小按钮来模拟 Ctrl 键。
例如，在触摸键盘上按音量减小 + L 就相当于是键盘上按 Ctrl + L 的效果一样，达到清屏的效果。

- Ctrl + A -> 将光标移动到行首
- Ctrl + C -> 中止当前进程
- Ctrl + D -> 注销终端会话
- Ctrl + E -> 将光标移动到行尾
- Ctrl + K -> 从光标删除到行尾
- Ctrl + U -> 从光标删除到行首
- Ctrl + L -> 清除终端
- Ctrl + Z -> 挂起（发送 SIGTSTP 到）当前进程
- Ctrl + alt + C -> 打开新会话（仅适用于 黑客键盘）

音量加键也可以作为产生特定输入的特殊键.

- 音量加 + E -> Esc 键
- 音量加 + T -> Tab 键
- 音量加 + 1 -> F1（音量增加 + 2 → F2… 以此类推）
- 音量加 + 0 -> F10
- 音量加 + B -> Alt + B，使用 readline 时返回一个单词
- 音量加 + F -> Alt + F，使用 readline 时转发一个单词
- 音量加 + X -> Alt+X
- 音量加 + W -> 向上箭头键
- 音量加 + A -> 向左箭头键
- 音量加 + S -> 向下箭头键
- 音量加 + D -> 向右箭头键
- 音量加 + L -> | （管道字符）
- 音量加 + H -> 〜（波浪号字符）
- 音量加 + U -> _ (下划线字符)
- 音量加 + P -> 上一页
- 音量加 + N -> 下一页
- 音量加 + . -> Ctrl + \（SIGQUIT）
- 音量加 + V -> 显示音量控制
- 音量加 + Q -> 切换显示的功能键视
- 音量加 + K -> 切换显示的功能键视图

快捷键用的熟悉的话也可以极大提高操作的效率。

### 2. 基本命令
Termux 除了支持 apt 命令外，还在此基础上封装了 pkg 命令，pkg 命令向下兼容 apt 命令。apt 命令大家应该都比较熟悉了，这里直接简单的介绍下 pkg 命令:

```shell
pkg search <query>              # 搜索包
pkg install <package>           # 安装包
pkg uninstall <package>         # 卸载包
pkg reinstall <package>         # 重新安装包
pkg update                      # 更新源
pkg upgrade                     # 升级软件包
pkg list-all                    # 列出可供安装的所有包
pkg list-installed              # 列出已经安装的包
pkg show <package>              # 显示某个包的详细信息
pkg files <package>             # 显示某个包的相关文件夹路径
```

> 国光建议大家使用 pkg 命令，因为 pkg 命令每次安装的时候自动执行 apt update 命令，还是比较方便的。

### 3. 软件安装
除了通过上述的 pkg 命令安装软件以外，如果我们有 .deb 软件包文件，也可以使用 dpkg 进行安装。
```shell
dpkg -i ./package.de         # 安装 deb 包
dpkg --remove [package name] # 卸载软件包
dpkg -l                      # 查看已安装的包
man dpkg                     # 查看详细文档
```

### 4. 目录结构
```shell
echo $HOME
/data/data/com.termux/files/home
echo $PREFIX
/data/data/com.termux/files/usr

echo $TMPPREFIX
/data/data/com.termux/files/usr/tmp/zsh
```
长期使用 Linux 的朋友可能会发现，这个 HOME 路径看上去和我们电脑端的不太一样，这是为了方便 Termux 提供的特殊的环境变量。



### 5. 端口查看

#### Android 10 以下版本
Andorid 10 以下的版本是可以正常使用 netstat 命令的，这样可以方便的查看端口开放信息：

```shell
# 查看所有端口
netstat -an

# 查看3306端口的开放情况
netstat -an|grep 3306
```

#### Android 10 版本
Andorid 10 版本的 Termux 下无法正常使用 netstat -an 命令，国光的解决方法是安装一个 nmap，然后扫描本地端口（弯道超车）：

```shell
# 安装nmap端口扫描神器
pkg install nmap

# 扫描本地端口
nmap 127.0.0.1
```
使用 nmap 操作 纯属无奈之举，但是又不是不能用（源于：罗永浩名言 :-)）



## 6. 进阶配置
要想使用体验好，进阶配置少不了。（单押）

### 1. 更换国内源
使用 pkg update 更新一下的时候发现默认的官方源网速有点慢，在这个喧嚣浮躁的时代，我们难以静下心等待，这个时候就得更换成国内的 Termux 清华大学源了，加快软件包下载速度。

#### 方法一：自动替换（推荐）
可以使用如下命令自动替换官方源为 TUNA 镜像源

> pkg update 卡住的话多按几次回车 不要傻乎乎的等
```shell
sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/termux-packages-24 stable main@' $PREFIX/etc/apt/sources.list

sed -i 's@^\(deb.*games stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/game-packages-24 games stable@' $PREFIX/etc/apt/sources.list.d/game.list

sed -i 's@^\(deb.*science stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/science-packages-24 science stable@' $PREFIX/etc/apt/sources.list.d/science.list

pkg update
```
更换源几秒钟就可以执行完 pkg update 了，心里顿时乐开了花。

#### 方法二：手动修改
请使用内置或安装在 Termux 里的文本编辑器，例如 `vi` / `vim` / `nano` 等直接编辑源文件，`不要使用 RE 管理器等其他具有 ROOT 权限的外部 APP` 来修改 Termux 的文件

编辑 `$PREFIX/etc/apt/sources.list` 修改为如下内容
```shell
# The termux repository mirror from TUNA:
deb https://mirrors.tuna.tsinghua.edu.cn/termux/termux-packages-24 stable main
```

编辑 $PREFIX/etc/apt/sources.list.d/science.list 修改为如下内容
```shell
# The termux repository mirror from TUNA:
deb https://mirrors.tuna.tsinghua.edu.cn/termux/science-packages-24 science stable
```

编辑 $PREFIX/etc/apt/sources.list.d/game.list 修改为如下内容
```shell
# The termux repository mirror from TUNA:
deb https://mirrors.tuna.tsinghua.edu.cn/termux/game-packages-24 games stable
```

#### 安装基础工具

更换源之后来赶紧来下载安装一些基本工具吧，这些工具基本上是 Linux 系统自带的，因为 Termux 为了体积不过大，默认是没有带这些工具的，执行下面的命令来安装:

```shell
pkg update
pkg install vim curl wget git tree -y
```

### 2. 终端配色方案
脚本项目地址：https://github.com/Cabbagec/termux-ohmyzsh/

该脚本主要使用了 zsh 来替代 bash 作为默认 shell，并且支持色彩和字体样式，同时也激活了外置存储，可以直接访问 SD 卡下的目录。主题默认为 agnoster，颜色样式默认为 Tango，字体默认为 Ubuntu。

> 执行下面这个命令确保已经安装好了 curl 命令
```shell
sh -c "$(curl -fsSL https://github.com/Cabbagec/termux-ohmyzsh/raw/master/install.sh)"  
```
如果因为不可抗力的原因，出现 `port 443: Connection refused` 网络超时的情况，那么执行下面国光迁移到国内的地址的命令即可：
```shell
sh -c "$(curl -fsSL https://html.sqlsec.com/termux-install.sh)"  
```
Android6.0 以上会弹框确认是否授权访问文件，点击始终允许授权后 Termux 可以方便的访问 SD 卡文件。



手机 App 默认只能访问自己的数据，如果要访问手机的存储，需要请求权限，如果你刚刚不小心点了拒绝的话，那么可以执行以下命令来重新获取访问权限：
```shell
termux-setup-storage
```
脚本允许后先后有如下两个选项:
```shell
Enter a number, leave blank to not to change: 14
Enter a number, leave blank to not to change: 6
```
分别选择`色彩样式`和`字体样式`，重启 Termux app 后生效配置。不满意刚刚的效果，想要继续更改配色方案的话，可以根据下面命令来更改对应的色彩配色方案：

#### 设置色彩样式：

输入 `chcolor` 命令更换色彩样式，或者执行 `~/.termux/colors.sh` 命令

#### 设置字体

运行 `chfont` 命令更换字体，或者执行 `~/.termux/fonts.sh` 命令

### 3. 创建目录软连接
执行过上面的一键配置脚本后，并且授予 Termux 文件访问权限的话，会在家目录生成 storage 目录，并且生成若干目录，软连接都指向外置存储卡的相应目录：



#### 创建 QQ 文件夹软连接

手机上一般经常使用手机 QQ 来接收文件，这里为了方便文件传输，直接在 storage 目录下创建软链接.
QQ
```shell
ln -s /data/data/com.termux/files/home/storage/shared/tencent/QQfile_recv QQ
```
TIM
```shell
ln -s /data/data/com.termux/files/home/storage/shared/tencent/TIMfile_recv TIM
```

这样可以直接在 home 目录下去访问 QQ 文件夹，大大提升了文件操作的工作效率。

### 4. 定制常用按键
在 Termux v0.66 的版本之后我们可以通过 `~/.termux/termux.properties` 文件来定制我们的常用功能按键，默认是不存在这个文件的，我们得自己配置创建一下这个文件。

下面做尝试简单配置一下这个文件:
```shell
# 新建并编辑配置文件
vim ~/.termux/termux.properties
```
内容为：
```shell
extra-keys = [ \
 ['ESC','|','/','HOME','UP','END','PGUP','DEL'], \
 ['TAB','CTRL','ALT','LEFT','DOWN','RIGHT','PGDN','BKSP'] \
]
```
> 如果无法创建这个文件，那么得首先新建一下这个目录 `mkdir ~/.termux`

修改完成保存文件后，重启 Termux app 生效配置：



可以直接输入特殊的字符串，例如上面的例子中的 | 就是一个字符串，此外 Termux 还有封装了一些特殊按键，入上面例子中的 ESC 就是 Termux 自带的按键，完整的特殊按键表如下：

| 按键       | 说明        |
| ---------- | ----------- |
| CTRL       | 特殊按键    |
| ALT        | 特殊按键    |
| FN         | 特殊按键    |
| ESC        | 退出键      |
| TAB        | 表格键      |
| HOME       | 原位键      |
| END        | 结尾键      |
| PGUP       | 上翻页键    |
| PGDN       | 下翻页键    |
| INS        | 插入键      |
| DEL        | 删除键      |
| BKSP       | 退格键      |
| UP         | 方向键 上   |
| LEFT       | 方向键 左   |
| RIGHT      | 方向键 右   |
| DOWN       | 方向键 下   |
| ENTER      | 回车键      |
| BACKSLASH  | 反斜杠 \    |
| QUOTE      | 双引号键    |
| APOSTROPHE | 单引号键    |
| F1~F12     | F1-F12 按键 |

上面列出的三个`特殊键`中的每一个最多只能在附加键定义中列出一次，超过次数将会报错。

下面是国光我自用的按键表：
```shell
extra-keys = [ \
 ['ESC','|','/','`','UP','QUOTE','APOSTROPHE'], \
 ['TAB','CTRL','~','LEFT','DOWN','RIGHT','ENTER'] \
]
```
实际效果如下：



### 5. zsh 主题配色
编辑家目录下的 `.zshrc` 配置文件
```shell
$ vim .zshrc
```
第一行可以看到，默认的主题是 `agnoster` 主题:



实际上这个主题也蛮酷的，如果你还想更换其他主题的话，那么在.oh-my-zsh/themes 目录下放着 oh-my-zsh 所有的主题配置文件，只要将默认的 agnoster 更换为其他的主题文件名即可。
下面是国光认为还不错的几款主题

主题比较多，国光这里就不列举了，感兴趣大家可以一个个尝试去看看。 当然如果你是个变态的话，可以尝试 random 主题，每打开一个会话配色主题都是随机的。
```shell
ZSH_THEME="random"
```

> 如果 oh-my-zsh 主题满足不了你们的话，Github 上还有很多高度定制的主题，感兴趣的朋友可以自己去折腾研究看看。

### 6. zsh 插件推荐
zsh 之所以受欢迎除了好看的配色以为，另一个原因就是强大的插件了。下面国光列举一款比较实用的插件的安装方法，更多强大的插件等待大家自己去探索。

#### autosuggestions
根据用户的平时使用习惯，终端会自动提示接下来可能要输入的命令，这个实际使用效率还是比较高的：
```shell
# 拷贝到 plugins 目录下
git clone git://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```
在 `~/.zshrc` 中配置：
```shell
plugins=(其他的插件 zsh-autosuggestions)
```

输入 `zsh` 命令生效配置：

效果图

可以看到国光我只敲了一个 v 后面的命令就自动提示补全了，这时候只要按右方向键，在 Termux 里面的快捷键是 音量加 + D，就可以直接补全命令了。

### 7. 修改启动问候语
默认的启动问候语如下：



这个启动问候语在前期对于初学者有一定的帮助，但是随着你们 Termux 的熟悉，这个默认的问候语就会显得比较臃肿。编辑问候语文件可以直接修改启动显示的问候语:
```shell
vim $PREFIX/etc/motd
```
修改完的效果如下:

本文版本归国光所有 转载注明出处哦

这样启动新的会话的时候看上去就会简洁很多。什么你也想要这个效果？ 呐～下面是国光自己生成的，可以直接复制粘贴：
```shell
 _____                              
|_   _|__ _ __ _ __ ___  _   ___  __
  | |/ _ \ '__| '_ ` _ \| | | \ \/ /
  | |  __/ |  | | | | | | |_| |>  < 
  |_|\___|_|  |_| |_| |_|\__,_/_/\_\
```
### 8. 超级管理员身份
实际上 Termux 不需要 root 权限也可以折腾各种各样的操作的，大家不必对 root 抱有啥幻想，本文的操作基本上没有涉及到手机要用到 root 的地步。

#### 手机没有 root
利用 proot 可以为手机没有 root 的用户来模拟一个 root 的环境，这里主要是经典的 Linux 文件系统布局上的模拟。
```shell
pkg install proot -y
```
然后终端下面输入:
```shell
termux-chroot
```
即可模拟 root 环境，该环境模仿 Termux 中的常规 Linux 文件系统，但是不是真正的 root。



输入 exit 可回到普通用户的文件系统。

#### 手机已经 root
安装 tsu，这是一个 su 的 Termux 版本，是一个真正的 root 权限，用来在 Termux 上替代 su，操作不慎可能对手机有安全风险，因为官方封装了，所以安装也很简单：
```shell
pkg install tsu -y
```
然后终端下面输入:
```shell
tsu
```
即可切换 root 用户，这个时候会弹出 root 授权提示，给予其 root 权限，效果图如下:

18年的老图了 将就着看吧

在管理员身份下，输入 exit 可回到普通用户身份。不过本文没有设计到 root 权限的操作，一些底层的工具可能才会需要，考虑到 root 的不安全性 和 那些工具的冷门性，国光这里就没有继续拓展。

### 9. 备份与恢复
评论区有网友提问 Termux 有办法打个镜像或者快照吗？😂 怕折腾坏了。也有网友分享了官方 WiKi 已经更新了备份和恢复的方法了，原文是：https://wiki.termux.com/wiki/Backing_up_Termux

下面国光简单搬运过来：

强烈建议在复制粘贴之前了解对应命令的作用。误操作可能会不可挽回地损坏您的数据，数据无价，谨慎操作。

#### 备份
确保已经获取了存储访问的权限，如果没有获取的话，执行以下命令来重新获取访问权限：
```shell
termux-setup-storage
```
然后去 Termux 根目录下：
```shell
cd /data/data/com.termux/files
```
备份配置文件为 `termux-backup.tar.gz`：
```shell
tar -zcf /sdcard/termux-backup.tar.gz home usr
```
备份应该完成，没有任何错误。除非用户滥用 root 权限，否则不应有任何权限拒绝。

> 警告：不要将备份文件存储在 Termux 私有目录中，因为从设置中清除 Termux 数据后，这些目录也将被删除。（类似于 Windows 准备重新安装系统，却把资料备份存储在 C 盘一个道理）

这些私有目录看上去类似如下的目录：
```shell
/data/data/com.termux 
/sdcard/Android/data/com.termux
/storage/XXXX-XXXX/Android/data/com.termux
${HOME}/storage/external-1
```
珍爱数据，远离私有目录。

#### 恢复
这里假设您已将 Termu 之前备份的 home 和 usr 目录备份到同一个备份文件中。请注意，在此过程中所有文件都将被覆盖现有的配置：

确保已经获取了存储访问的权限，如果没有获取的话，执行以下命令来重新获取访问权限：
```shell
termux-setup-storage
```
然后去 Termux 根目录下：
```shell
cd /data/data/com.termux/files
```
解压提取之前备份的内容，覆盖现存的文件并删除之前的备份文件：
```shell
tar -zxf /sdcard/termux-backup.tar.gz --recursive-unlink --preserve-permissions
```
操作完成重启 Termux 即可恢复数据。

## 7. 开发环境
Termux 支持的开发环境很强，可以完美的运行 C、Python、Java、PHP、Ruby 等开发环境，建议读者朋友们选择自己需要的开发环境折腾。

### 1. 编辑器
写代码前总得折腾一下编辑器，毕竟磨刀不误砍柴工嘛。Termux 支持多种编辑器，完全可以满足日常使用需求。

#### Emacs
据说 Emacs 是神的编辑器，国光我这种小菜鸡还不会使用哎，但是 Termux 官方已经封装好了 Emacs 了，我们安装起来就会简单很多:
```shell
pkg install emacs
```
#### nano
nano 是一个小而美的编辑器。具有如下：打开多个文件，每行滚动，撤消 / 重做，语法着色，行编号等功能

同样安装起来也很简单：
```shell
pkg install nano
```

#### Vim
Vim 被称为编辑器之神，基本上 Linux 发行版都会自带 Vim，这个在前文基本工具已经安装了，如果你没有安装的话，可以使用如下命令安装：

```shell
pkg install vim
```
并且官方也已经封装了 vim-python，对 Python 相关的优化。
```shell
pkg install vim-python
```
##### 解决汉字乱码
如果你的 Vim 打开汉字出现乱码的话，那么在家目录 (~) 下，新建.vimrc 文件
```shell
vim .vimrc
```
添加内容如下：
```shell
set fileencodings=utf-8,gb2312,gb18030,gbk,ucs-bom,cp936,latin1
set enc=utf8
set fencs=utf8,gbk,gb2312,gb18030
```
然后 source 下变量：
```shell
source .vimrc
```
效果图



##### Vim 配色
Termux Vim 自带了如下的配色：
```shell
ls /data/data/com.termux/files/usr/share/vim/vim82/colors

desert.vim    morning.vim    shine.vim    blue.vim      elflord.vim   murphy.vim     slate.vim    darkblue.vim  evening.vim   pablo.vim      industry.vim  peachpuff.vim  torte.vim    delek.vim     koehler.vim   ron.vim        zellner.vim   
```
配色可以自己一个个尝试一下，还是向上面的汉字乱码那样，编辑家目录下的.vimrc 文件：
```shell
vim ~/.vimrc
```
新增如下内容：
```shell
set nu                " 显示行号
colorscheme desert    " 颜色主题
syntax on             " 打开语法高亮
```
下面是国光随便找的几个颜色主题效果，感兴趣的朋友可以自己一个个尝试：


### 2. Apache
Apache 是一个开源网页服务器软件，由于其跨平台和安全性，被广泛使用，是最流行的 Web 服务器软件之一。

#### 安装 Apache
```shell
pkg install apache2
```

#### 启动 Apache
```shell
apachectl start
```
然后浏览器访问: `http://127.0.0.1:8080` 访问是否成功启动：

Termux 自带的 Apache 的网站默认路径为：
```shell
$PREFIX/share/apache2/default-site/htdocs/index.html
```

#### 停止 Apache
```shell
apachectl stop
```

#### 重启 Apache
```shell
apachectl restart
```

### 3. Apache 解析 PHP
既然 Apache、PHP、MySQL 都可以成功安装的话，那么现在只要配置好 Apache 解析 PHP 之后就可以打造一个 Android 平台上的 LAMPP 平台了，配置本小节的内容得确保 Termux 已经配置好了 PHP 开发环境，没有配置好的可以参加下面 PHP 小节部分。

#### 安装 php-apache
默认的 Apache 是无法解析 PHP 的，我们需要安装相应的包：
```shell
pkg install php-apache
```
#### 配置 Apache
Termux 上的 Apache 默认配置文件的路径为:
```shell
$PREFIX/etc/apache2/httpd.conf
```
直接编辑配置文件:
```shell
vim /data/data/com.termux/files/usr/etc/apache2/httpd.conf
```
配置文件里面搜索 PHP 没有相关的模块，所以需要我们手动添加 PHP7 的模块:
```shell
LoadModule php7_module /data/data/com.termux/files/usr/libexec/apache2/libphp7.so 
```
并在刚刚这个语句下方添加解析器，内容如下:
```xml
<FilesMatch \.php$>
  SetHandler application/x-httpd-php
</FilesMatch> 
```
接着继续往下找配置文件里面配置默认首页的地方，我们添加 index.php 到默认首页的规则里面:
```xml
<IfModule dir_module>
  DirectoryIndex index.php index.html
</IfModule>
```
这表示网站目录的默认首页是 index.php，如果没有 index.php 系统会自动寻找 index.html 做为默认首页了。

修改完 Apache 的配置文件后，记得使用 `apachectl restart` 重启 Apache 服务，然后这个时候回发现我们重启居然报错了：
```shell
Apache is running a threaded MPM, but your PHP Module is not compiled to be threadsafe.  You need to recompile PHP.
AH00013: Pre-configuration failed
```
不要慌问题不大，下面来解决这个问题

#### 解决 Apache PHP 报错
先找到如下行：
```shell
LoadModule mpm_worker_module libexec/apache2/mod_mpm_worker.so
```
给他注释掉为：
```shell
#LoadModule mpm_worker_module libexec/apache2/mod_mpm_worker.so
```
然后找到如下行：
```shell
#LoadModule mpm_prefork_module libexec/apache2/mod_mpm_prefork.so
```
取消注释：
```shell
LoadModule mpm_prefork_module libexec/apache2/mod_mpm_prefork.so
```
最终的示例图如下:



#### 解析 PHP 测试
在 Apache 的网站根目录下，创建一个 index.php ，测试一下 phpinfo () 函数能否正常运行:
```shell
echo '<?php phpinfo(); ?>' > $PREFIX/share/apache2/default-site/htdocs/index.php
```
然后浏览访问: `http://127.0.0.1:8080` 查看效果：

Termux 官方封装了 Clang，他是一个 C、C++、Objective-C 和 Objective-C++ 编程语言的编译器前端。

### 4. C
#### 安装 clang
```shell
pkg install clang
```

#### 编译测试
clang 在编译这一块很强大，感兴趣的朋友可以去网上查看详细的教程，国光这里只演示基本的 Hello World 使用。写一个 Hello World 的 C 程序，如下 hello.c：
```shell
#include <stdio.h>

int main(){
  printf("Hello World")
  return 0;
}
```
编辑完成后，使用 clang 来编译生成 hello 的可执行文件：
```shell
clang hello.c -o hello
```
效果图

### 5. Java
Termux 早期原生编译 JAVA 只能使用 ecj (Eclipse Compiler for Java) 和 dx 了，然后使用 Android 自带的 dalvikvm 运行。后面 Termux 官方也封装了 openjdk-17 这样安装起来就更方便了。

还有如果想要完整体验 JAVA 环境的话，另一个方法就是 Termux 里面安装一个完整的 Linux 系统，然后在 Linux 里面运行 Java，安装系统部分下面文章会详细介绍，这种思路也是可以的。

#### Openjdk-17
```shell
pkg update
pkg install openjdk-17
```
当然这个包可能不太稳定，遇到相关问题可以去 Termux 官方的项目下提交 issue：
```shell
https://github.com/termux/termux-packages/issues?q=openjdk
https://github.com/termux/termux-packages/issues?q=java
```

#### ECJ
##### 安装编译工具
```shell
pkg install ecj dx -y
```
国光这里只演示基本的 Hello World 使用。写一个 Hello World 的 JAVA 程序，如下 HelloWorld.java:
```shell
public class HelloWorld {
    public static void main(String[] args){
        System.out.println("Hello Termux");
    }
}
```
##### 编译生成 class 文件
```shell
ecj HelloWorld.java
```
##### 编译生成 dex 文件
```shell
dx --dex --output=hello.dex HelloWorld.class
```
##### 使用 dalvikvm 运行
> 格式规范如下：dalvikvm -cp dex文件名 类名
```shell
dalvikvm -cp hello.dex HelloWorld
```
效果图

### 6. MariaDB (MySQL)
MariaDB 是 MySQL 关系数据库管理系统的一个复刻，由社区开发，有商业支持，旨在继续保持在 GNU GPL 下开源。开发这个分支的原因之一是：甲骨文公司收购了 MySQL 后，有将 MySQL 闭源的潜在风险，因此社区采用分支的方式来避开这个风险。

#### 安装 MariaDB
Termux 官方也封装了 MariaDB，所以安装起来很方便：
```shell
pkg install mariadb
```

这里基本上会安装很顺利，但是早期用户可能出现安装失败的情况，如果安装失败的话，这个时候手动在配置目录下创建 my.cnf.d 文件夹即可：
```shell
$ cd /data/data/com.termux/files/usr/etc/
$ mkdir my.cnf.d
```
#### 初始化数据库
> 早期的 Termux 安装完 MySQL 是需要初始化数据库的，新版本在安装时候就已经初始化了数据库
```shell
mysql_install_db
```
2020 年 4 月 19 日：国光今天安装的 MySQL 发现已经存在 mysql.user 表了，无需初始化：



#### 启动 MySQL 服务
因为正常启动完成后，MySQL 这个会话就一直存活，类似与 Debug 调试一样，此时使用 Ctrl + C -> 中止当前进程也无济于事，体验式就一点都不优雅，所以这里国光使用 Linux 自带的 nohup 命令将其放到后台启动。
```shell
nohup mysqld &
```

上这个 17115 此时就是 mysqld 的进程 PID 号，我们使用如下命令验证一下是否正确：
```shell
ps aux|grep mysql
```
可以看到果然是进程的 PID 号：



至于 nohup 运行的提示
```shell
nohup: ignoring input and appending output to `nohup.out'
```
这个是正常现象，无伤大雅，Termux 下就这样将就着用吧。

#### 停止 MySQL 服务
Termux 下没有好的办法退出 MySQL 服务，只能强制杀掉进程了，使用如下命令格式可以轻松杀掉进程：
```shell
kill -9 PID
```
成功kill掉

当然每次查看进程的 PID 号，再杀掉进程有点繁琐了，实际上这一步可以直接这样操作：
```shell
kill -9 `pgrep mysql`
```
Awesome ! 优雅！

#### 默认的两个用户
> 用户登录的前提是 MySQL 服务在后台运行，如果你按照上一小节操作把 MySQL kill 掉的话，请重新启动一下 MySQL 服务

新版本的 Termux 安装初始化数据库的时候包含两个高权限用户，一个是无法访问的 root 用户
```shell
mysql -u root
```
提示拒绝 root 登录

另一个用户就是 Termux 的用户名，默认密码为空，我们来登录看看：
```shell
mysql -u $(whoami)
```
可以成功登录 并执行 SQL 语句

那么这个无法登录的 root 用户该怎么办呢 ？不要着急 继续往下看

#### 修改 root 密码
老版本的 Termux 的直接使用 `mysql_secure_installation` 可以设置密码，但是新版本的安全策略变更了 我们在设置密码的时候回提示当前密码不正确，所以这条路行不通了。

这里我们只能使用 MySQL 的另一个用户名，即 Termux 用户名登录，然后来修改 root 的密码，使用如下命令修改 root 密码:
```shell
# 登录 Termux 用户
mysql -u $(whoami)

# 修改 root 密码的 SQL语句
use mysql;
set password for 'root'@'localhost' = password('你设置的密码');

# 刷新权限 并退出
flush privileges;
quit; 
```

OK！ 如何和图片上差不的效果，那么修改 root 密码就成功了。

#### root 用户登录
修改完密码之后我们就可以美滋滋地使用 root 用户来登录了：
```shell
mysql -u root -p
Enter password: xxxxx（这里输入你的密码)
```

#### 远程登录 MySQL
使用 `ip addr` 后查看 IP 地址后，尝试电脑端远程访问 Termux 的数据库:



发现默认是无法成功连接的，这个时候我们需要到数据库手动开启 root 用户的远程访问权限:

这里的 P@ssw0rd 是我的 root 密码
```shell
grant all on *.* to root@'%' identified by 'P@ssw0rd' with grant option;
flush privileges;
```

执行完成后 尝试 PC 端远程过去看看：



### 7. Nginx
Nginx 是一个高性能的 Web 和反向代理服务器，Nginx 用的熟悉的话，下面搭建各种网站也就轻而易举了。

#### 安装 Nginx
Termux 安装 Nginx 也很简单，一条命令即可：
```shell
pkg install nginx
```
安装完成后，国光的习惯是查看一下版本信息：

1.17.10 版本

#### 测试 Nginx
测试检查 Nginx 的配置文件是否正常:
```shell
nginx -t
```

现在测试肯定是 OK 的，这个多用于我们修改完 Nginx 的配置文件后的检查。

#### 启动 Nginx
早期版本的 Termux 需要在 termux-chroot 环境下才可以成功启动 Nginx ，新版本的 Termux 可以直接启动，还是很方便的：
```shell
nginx
```

Termux 在 Nginx 上默认运行的端口号是 8080， 使用 pgrep 命令也可以查看 Nginx 进程相关的 PID 号。

然后手机本地直接访问 `http://127.0.0.1:8080` 查看 Nginx 是否正常启动：

#### 配置IPv6支持
```shell
vim /data/data/com.termux/files/usr/etc/nginx/nginx.conf

# 添加IPv6监听端口
listen [::1]:8080;
```

#### 重启 Nginx
一般当修改完 Nginx 相关的配置文件时，我们需要重启 Nginx，使用如下命令即可重启:
```shell
nginx -s reload
```
#### 停止 Nginx
##### 方法一 原生停止
```shell
nginx -s stop
```
或者
```shell
nginx -s quit
```
quit 是一个优雅的关闭方式，Nginx 在退出前完成已经接受的连接请求。Stop 是快速关闭，不管有没有正在处理的请求。

##### 方法二 杀掉进程
只需三番钟，里造会干我一样，爱象节款游戏 扯远了，只需要 1 条命令，即可优雅的终止掉 Nginx 服务:
```shell
kill -9 `pgrep nginx`
```
貌似手机党 并不好敲 这个 ` 符号 =，= ，如果实在敲不出来，那就分两步走吧：
```shell
# 查询 nginx 进程相关的 PID 号
pgrep nginx

# 杀掉 查询出的 PID号进程
kill -9 PID
```

### 8. Nginx 解析 PHP
Termux 下的 Nginx 解析 PHP 这里单独拿出一级标题来叙述，成功解析的话，下面安装 wordpress 等 PHP 网站就会轻松很多。

#### 安装 php-fpm
Nginx 本身不能处理 PHP，它只是个 Web 服务器，当接收到 PHP 请求后发给 PHP 解释器处理。Nginx 一般是把请求转发给 fastcgi 管理进程处理，PHP-FPM 是一个 PHP FastCGI 管理器，所以这里得先安装它：
```shell
pkg install php-fpm
```
安装完成顺便检查一下版本信息吧：



#### 配置 php-fpm
编辑 php-fpm 的配置文件 www.conf：
```shell
vim $PREFIX/etc/php-fpm.d/www.conf
```
定位搜索 listen = 找到
```shell
listen = /data/data/com.termux/files/usr/var/run/php-fpm.sock
```
将其改为：
```shell
listen = 127.0.0.1:9000
```
？？？啥 你不会使用 vim 搜索 ㄟ (▔,▔) ㄏ 那就老老实实一个个翻页吧。

#### 配置 Nginx
编辑 Nginx 的配置文件 nginx.conf：
```shell
vim $PREFIX/etc/nginx/nginx.conf
```
下面国光贴出配置好的完整配置文件，大家可以参考下面这些图，只需要两大步骤：

添加 index.php 到默认首页的规则里面：


取消 `location ~ \.php$` 这些注释，按照图片上的 提示修改：


Termux 里面的 Nginx 默认网站的根目为：
```shell
/data/data/com.termux/files/usr/share/nginx/html
```
如果想要修改默认路径的话 只需要在配置文件中 替换 2 处出现的这个路径即可

下面贴一份完整的配置文件：
```conf
worker_processes  1;
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       8080;
        server_name  localhost;
        location / {
            root   /data/data/com.termux/files/usr/share/nginx/html;
            index  index.html index.htm index.php;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /data/data/com.termux/files/usr/share/nginx/html;
        }

        location ~ \.php$ {
            root           html;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  /data/data/com.termux/files/usr/share/nginx/html$fastcgi_script_name;
            include        fastcgi_params;
        }
    }
}
```
#### 测试 PHP 解析
Nginx 默认网站的根目录为：
```shell
/data/data/com.termux/files/usr/share/nginx/html
```
在这个网站根目录下新建 info.php 内容为：<?php phpinfo(); ?>
```shell
echo '<?php phpinfo(); ?>' > $PREFIX/share/nginx/html/info.php
```
#### 启动服务
先启动 php-fpm 服务：
```shell
php-fpm
```
然后再启动 Nginx 服务：
```shell
nginx
```
如果你的 Nginx 已经启动了的话，使用 nginx -s reload 重启 Nginx

#### 访问测试
浏览器访问 `http://127.0.0.1:8080/info.php` 来看看刚刚新建的测试文件是否解析了：

哇哦~ awesome

### 9. Nodejs
Node.js 是能够在服务器端运行 JavaScript 的开放源代码、跨平台 JavaScript 运行环境。

#### 安装 Nodejs
nodejs-lts 是长期支持版本，如果执行 pkg install nodejs 版本后，发现 npm 报如下错误:
```shell
segmentation fault
```
那么这个时候可以尝试卸载当前版本 pkg uninstall nodejs 然后执行下面命令安装长期稳定版本：
```shell
pkg install nodejs-lts
```
安装完成后使用如下命令查看版本信息：
```shell
node -V
npm -V
```
#### Hello World
新建一个 hello.js 脚本，内容如下:
```shell
console.log('Hello Termux');
```
然后尝试运行：
```shell
$ node hello.js
Hello Termux
```
#### http-server
http-server 是一个基于 Node.js 的简单零配置命令行 HTTP 服务器。
```shell
# 安装 http-server
npm install -g http-server

# 运行 http-server
http-server
```

尝试电脑端浏览器直接访问看看：

OK

#### 安装报错
早期版本的 Termux 的 npm 安装一些包的时候会报如下错误：
```shell
Cannot read property 'length' of undefined
```
查了下是这边版本的问题：

新版本貌似npm正常

这是一个 BUG，官方的解决方法如下：
```shell
disable concurrency in case of libuv/libuv#1459
```


编辑如下文件：
```shell
vim $PREFIX/lib/node_modules/npm/node_modules/worker-farm/lib/farm.js
```
我这里修改 length 的是 4，这个好像和 CPU 有关，总之这里的 length 得指定一个数字：

新版本貌似npm正常

然后在重新安装下 npm install hexo-cli -g 成功。

### 10. PHP
PHP 是一种开源的脚本语言，适用于网络开发。语法借鉴吸收 C 语言、Java 和 Perl 等流行计算机语言的特点，易于学习，PHP 是世界上最好的语言（手动狗头）。

#### 安装 PHP
Termux 官方封装了 PHP，所以我们安装起来就很方便：
```shell
pkg install php
```
安装完成后查看下版本信息：
```shell
php --version
```

#### 运行测试文件
> 自 PHP5.4 之后 PHP 内置了一个 Web 服务器。在 Termux 下可以很方便地测试 PHP 文件

首先在家 (~) 目录下建一个 www 文件夹，然后在 www 文件夹下新建一个 index.php 文件，内容为：
```php
<?php phpinfo();?>
```
完整的步骤如下：
```shell
# 新建 www 文件夹
mkdir ~/www

# 创建 inedx.php 文件
echo '<?php phpinfo();?>' > ~/www/index.php
```
编写完成 index.php 文件后，尝试使用 PHP 内置的 WebServer 直接启动：
```shell
# 进入家目录
cd ~

# 启动 WebServer
php -S 0.0.0.0:8888 -t www/
```
自己制定端口后，浏览器访问 `http://127.0.0.1:8888` 效果如下：



### 11. Python
Python 是近几年非常流行的语言，Python 相关的书籍和资料也如雨后春笋一般不断涌现，带来了活跃了 Python 学习氛围。

#### 安装 Python2
Python2 版本要淘汰了，大家简单了解一下就好：
```shell
pkg install python2 -y
```
安装完成后，使用 python2 命令启动 Python2.7 的环境。

#### 安装 Python3
Termux 安装 Python 默认版本是 Python3 的版本，与此同时也顺便安装了 clang
```shell
pkg install python -y
```
安装完成后，查看下 clang 和 Python 的版本：



#### 注意版本区分
如果你同时安装了 Python3 和 Python2 版本的话，最好向下图中这样验证一下各个版本情况，做到心知肚明，国光我是先安装 Python3 然后再安装 Python2 的：

安装顺序不一样 pip 这种图片应该也就不一样

如果版本直接混乱的话，手动修改 bin 目录下的软连接指向的位置即可。

#### 升级 PIP 版本
PIP 保持最新是一个好习惯，升级方式很简单：
```shell
# 升级 pip2 
python2 -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple some-package

# 升级 pip3
python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple some-package
```
这两条命令分别升级了 pip2 和 pip3 到最新版。升级完成后你会惊讶的发现你的 pip3 命令不见了？？？然后这个时候就开始吐槽国光了（内心 OS：国光 非要强迫症升级 pip 版本，这下好了吧！）

国光：不要慌 问题不大，我们可以手动查看当前有哪些可执行的 pip 文件，使用如下命令：
```shell
ls /data/data/com.termux/files/usr/bin|grep pip
```
原来我们的pip3变成了pip3.8了啊

接下来分别查看对应 pip 可执行文件的版本：



现在全都是最新版的 pip 了哦

#### iPython
iPython 是一个 Python 的增强版本的交互式 shell，支持变量自动补全，自动缩进，支持 shell 命令等，内置了许多很有用的功能和函数。iPython 可以提高我们的学习效率！

> 先安装 clang, 否则直接使用 pip 安装 ipython 会失败报错。没有安装的话使用 pkg install clang 安装
```shell
# -i 手动指定国内清华 pip 源 提高下载速度
pip install ipython -i https://pypi.tuna.tsinghua.edu.cn/simple some-package
pip3.8 install ipython -i https://pypi.tuna.tsinghua.edu.cn/simple some-package
```
执行完上述命令分别安装好对应版本的 iPython 后，然后分别查看对应版本信息：
```shell
ipython2 -V
ipython -V
```

#### Jupyter Notebook
Jupyter Notebook（此前被称为 iPython notebook）可以在 Web 端提供 Python 交互，虽然和 iPython 共享同一个内核，但是更强大。

> Jupyter notebook 相关的依赖比较多 安装起来较为耗时 国光就只用 Python3 版本来演示了，另外请务必要使用国内的 pip 源来安装

下面官方建议安装的完整的命令：
```shell
pkg update
pkg install proot
termux-chroot
apt install git clang
apt install pkg-config
apt install python python3-dev 
apt install libclang libclang-dev
apt install libzmq libzmq-dev
apt install ipython 
pip install jupyter 
```
如果你一步步跟着本文安装顺序操作的话，发现很多工具我们都安装过了（国光我真的有先见之明…），那么直接参考如下命令安装即可：
```shell
# -i 手动指定国内中清华 pip 源 提高下载速度
# 更新是个好习惯
pkg update

# 切换模拟的 root 环境
termux-chroot

# 安装相关依赖
pkg install libclang

# 安装 jupyter
pip3 install jupyter -i https://pypi.tuna.tsinghua.edu.cn/simple some-package

# 安装完成退出 chroot
exit

# 安装 jupyterlab
pip3 install jupyterlab -i https://pypi.tuna.tsinghua.edu.cn/simple some-package
```
安装好之后查看一下版本信息：
```shell
jupyter --version
```
所有插件均安装完成

Jupyter Notebook 就安装好了，这个比较强大更详细的教程大家可以自行去谷歌或者百度一下，国光这里只演示基本的功能。

先启动 notebook
```shell
jupyter notebook
```
然后会看到运行的日志，我们复制出 提示的 URL：



复制出的这个 URL 地址 在浏览器中打开：



可以看到成功运行了，那我们按照图片提示走个形式，输出个 Hello World 就跑路：



OK 运行成功，那么回到 Termux 里面使用组合键 Ctrl + C -> 中止当前的 Jupyter 进程。

## 8. 网站搭建
网站搭建这一块实际上原理是大同小异的，国光这里只写几个网站的安装方法，给大家提供一个思路。

### 1. DVWA
DVWA 是一个用来搞 Web 安全从业者入门使用的一个练习靶场，用来学习掌握基本的漏洞原理使用的，如果你对 Web 安全不感兴趣的话可以直接跳过这一个小节。

> 国光建议 DVWA 练习的时候 要结合源码去分析漏洞 不要直接把网上攻击流程走一步就草草了之了 不看源码的学习 等于啥都没有学

#### 环境准备
因为 DVWA 靶场是 PHP 编写的，所以你需要 提前配置好 Nginx 、PHP 以及 数据库，关于这方面配置可以参考前面开发环境下分类的「Nginx」、「MariaDB (MySQL)」和 「Nginx 解析 PHP」章节

#### 下载 DVWA
```shell
wget https://github.com/ethicalhack3r/DVWA/archive/master.zip
```
如果访问 Github 比较慢的话，可以尝试如下链接：
```shell
wget https://hub.fastgit.org/ethicalhack3r/DVWA/archive/master.zip
```
解压到 Nginx 目录下
```shell
# 解压
unzip master.zip -d $PREFIX/share/nginx/html/

# 重命名
cd $PREFIX/share/nginx/html/
mv DVWA-master dvwa
```

#### 新建数据库
```shell
mysql -uroot -p*** -e"create database dvwa;show databases;"
```
*** 这里是 mysql 的密码


可以看到 dvwa 数据库已经新建成功了。

#### 编辑 DVWA 配置文件
```shell
# 将配置文件 还原为 PHP 后缀
cd $PREFIX/share/nginx/html/dvwa/config
mv config.inc.php.dist config.inc.php

# 编辑配置文件
vim mv config.inc.php.dist config.inc.php
```
只需要定位找到如下内容 根据你的实际情况填写就可以了：



#### 初次访问测试网站
按照上述配置好 DVWA 之后，浏览器访问：`http://192.168.31.124:8080/dvwa/setup.php`

可以看到 `allow_url_include` 运行 URL 远程包含没有开启，我们得手动开启一下：



实际上正常人是不会去开启这个的，十分危险，但是 DVWA 是一个靶场，有些漏洞实际上就是利用 PHP 配置不当造成的，这样才让新手有攻击下来的信心。

配置 php.ini
Termux 下默认是没有 php.ini 文件的，不信我们手动来查找一下：
```shell
php --ini

Configuration File (php.ini) Path: /data/data/com.termux/files/usr/lib
Loaded Configuration File:         (none)
Scan for additional .ini files in: (none)
Additional .ini files parsed:      (none)
```
发现 php.ini 的文件应该存放在 /data/data/com.termux/files/usr/lib 目录下，但是 PHP 没有找到配置文件，所以需要我们手动在这个目录下新建 php.ini 配置文件:
```shell
echo 'allow_url_include = On' > $PREFIX/lib/php.ini
```
> 注意这是一个不安全的配置 只是为了配合本地的 DVWA 靶场 做模拟黑客攻击练习使用的

配置完成后，自己尝试使用 php --ini 来定位搜索配置文件，会发现 PHP 已经找到了配置文件了。

修改完配置文件后 得重启 php-fpm 服务:
```shell
# 杀掉 php-fpm 相关的进程
kill -9 `pgrep fpm`

# 再次启动 php-fpm
php-fpm
```

#### 再次访问测试网站
浏览器访问: http://192.168.31.124:8080/dvwa/setup.php

可以看到刚刚的配置文件生效了，现在安全检查全部通过



既然 安全检查通过的话，那么就直接页面滚动到最下面直接点击 Create/Reset Database 初始化数据库按钮即可，初始化成功后会自动跳转到登录界面。

DVWA 默认的用户有 5 个，用户名密码如下：

| 用户名  | 密码     |
| ------- | -------- |
| admin   | password |
| gordonb | abc123   |
| 1337    | charley  |
| pablo   | letmein  |
| smithy  | password |

登录成功的效果图：



### 2. Hexo
Hexo 是一个用 Nodejs 编写的快速、简洁且高效的博客框架。Hexo 使用 Markdown 解析文章，在几秒内，即可利用靓丽的主题生成静态网页。另外大家看到国光我的博客就是使用 Hexo 搭建的哦。

#### 安装 Hexo
Hexo 是用 Nodejs 编写的，所以安装的话得使用 npm 命令来安装：
```shell
npm install hexo-cli -g
```
安装完成的话，顺便看一下 Hexo 相关的版本信息吧：
```shell
hexo -v
```

#### Hexo 基本部署
我们建立一个目录，然后到这个目录下初始化 Hexo 环境：
```shell
# 手动创建一个目录
mkdir hexo  

# 进入目录下并初始化Hexo环境
cd hexo  
hexo init  

#生成静态文件 启动Hexo
hexo g
hexo s      
```

然后就跑起来一个最基本的 Hexo 博客，关于 Hexo 博客的详细教程，建议搭建去参考 Hexo 官方文档，我这里重点在于 Termux 其他的不作过多的叙述。

使用浏览器访问: http://127.0.0.1:4000 即可看到 Hexo 的效果图：



#### Hexo 部署到 Nginx
Hexo 是纯静态博客，官方默认把 Hexo 搭建在 Github Pages 仅仅是把 Hexo 根目录的 public 文件夹即 Hexo 生成的纯 HTML 源码部署到上面而已。所以知道这样原理 我们就可以轻而易举地将 Hexo 部署到 Nginx 下面。

##### 生成 HTML 纯静态源码
```shell
hexo g
```

可以看到 Hexo 的根目录下 已经生成了 public 文件夹了

##### 拷贝源码搭到 Nginx
现在我们只需要将 public 的文件夹里面的源码 全部拷贝到 Nginx 的网站根目录下：
```shell
# 在 nginx 根目录下新建 hexo 文件夹
mkdir $PREFIX/share/nginx/html/hexo

# 拷贝 源码到 nginx 下
cp -rf public/* $PREFIX/share/nginx/html/hexo
```

##### 访问效果查看
浏览器访问:http://127.0.0.1:8080/hexo/ 即可看到效果：



当然这里网站的 CSS 等样式没有加载出来，这个原因是 Hexo 对网站目录下部署并不友好 ，大概有如下解决方法：

1. Nginx vhosts 配置多域名，这个服务器上常用的操作，但是 Termux 里面实现难度较高
2. 将 Hexo 的源码 直接拷贝到 Nginx 的根目录下，不用拷贝到 html/hexo 目录下了，然后直接访问 http://127.0.0.1:8080 即可看到效果

国光这里就只是说一下这个思路，因为强迫症的我不能忍受 Nginx 根目录的文件 乱七八糟 =，= 大家想尝试的话 按照我这个思路去尝试就可以了。

### 3. KodExplorer
KodExplorer 是一款开源文件资源管理器，搭建起来很简单，我们也可以在 Termux 搭建，这样就可以实现 Temux 下的文件分享了，十分优雅方便。在我的这篇文章：https://www.sqlsec.com/2019/11/kode.html 里面也讲解了 macOS 下的安装。

#### 下载解压 Kod
官网的下载地址：https://kodcloud.com/download/

我们拷贝下载链接后，使用 wegt 可以直接下载：
```shell
# 下载
wget http://static.kodcloud.com/update/download/kodexplorer4.40.zip

# 解压 到 Nginx 的 kod 目录下
unzip kodexplorer4.40.zip -d $PREFIX/share/nginx/html/kod
```

#### 安装设置 Kod
> Nginx 确保已经配置可以解析 PHP，如果没有配置好，那么请参考 上文的 「开发环境」小节

手机浏览器访问: `http://127.0.0.1:8080/kod` 即可进入设置管理密码界面：



设置完密码登录看看，建议大家在 Kod 里面设置电脑版视图，效果很赞，下面是主界面截图：

推荐大家使用电脑版

当然在局域网的情况下，通过 IP 地址，局域网的其他设备也是可以轻松访问到你的文件的，文件共享目的达成。

### 4. WordPress
WordPress 是一个以 PHP 和 MySQL 为平台的自由开源的博客软件和内容管理系统。如果你的 Termux 没有配置好 MySQL、PHP、Nginx 的话 那么请参考上面的 开发环境 章节来进行配置。

#### 新建数据库
网站需要数据库，在安装 WordPress 前我们先需要新建一个数据库，以供后面的网站安装：
```shell
mysql -uroot -p*** -e"create database wordpress;show databases;"
```
*** 这里是 mysql 的密码



可以看到 wordpress 数据库已经新建成功了。

#### 下载 WordPress
WordPress 历届版本: https://cn.wordpress.org/download/releases/

选择最新的版本后，复制下载的直链，那么就开始用 wget 下载并解压吧：
```shell
#  wget 下载
wget https://cn.wordpress.org/wordpress-5.4-zh_CN.zip

# unzip 解压 没有安装unzip请自行安装
unzip wordpress-4.9.4-zh_CN.zip

# 将解压的文件夹移动到 nginx 网站根目录下
mv wordpress/ $PREFIX/share/nginx/html
```
如果 WordPress 官网这个下载又问题的话，可以多尝试几次，也可以通过如下渠道来下载

1. WordPress Too Many Requests 出现这种报错，多半是中国的 IP 又被国外屏蔽了，可以尝试使用迅雷来下载
2. 挂代理来下载
3. 百度找国内的第三方非官方下载站下载（不是很推荐）

#### 配置 Nginx 解析
如果你读过前面的「开发环境」、「Nginx」、「Nginx 解析 PHP」三个小节的话，这里直接启动 php-fpm 和 Nginx 即可：
```shell
php-fpm
nginx
```
当然如果你的 php-fpm 和 Nginx 服务以及启动的话 就直接跳到下一步吧

#### 安装 WordPress
浏览器访问: http://127/.0.0.1/wordpress/ 进行 WordPress 的安装，根据提示填写好自己的数据库信息即可安装，详细这一步大家都懂的，国光这里直接放安装好的效果图吧：

WordPress的后台

## 9. 系统安装
Termux 可以安装其他 Linux 发行版系统，核心用到的工具是 chroot ，所以我们得确保安装系统的时候 proot 这个包你是安装好的，然后因为操作系统店都有官方维护的脚本，所以安装起来甚至比我们前面配置的开发环境还要简单，下面来具体的介绍吧。

### 1. 实用必备工具
有能力的朋友以下工具可以直接在 F-Droid 或者 Google Play 商店里面下载最新的版本，国光这里就简单列举搬运一下：

| 软件                          | 下载地址                                     | 说明                       |
| ----------------------------- | -------------------------------------------- | -------------------------- |
| VNC Viewer 3.6.1.42089 汉化版 | [蓝奏云](https://sqlsec.lanzoux.com/ibq43wb) | 远程连接使用               |
| NetHunter KeX 4.0.7-6         | [蓝奏云](https://sqlsec.lanzoux.com/ibq4akb) | Kali 官方 远程连接工具     |
| AnLinux 6.10                  | [蓝奏云](https://sqlsec.lanzoux.com/ibq4iuj) | 提供比较全面的系统安装脚本 |
| AndroNix 4.2                  | [Google Play](https://sqlsec.lanzoux.com/ibq4iuj)                              | 提供比较全面的系统安装脚本 |

VNC 工具的隐藏技巧，首先我们默认使用 VNC Viewer 这个工具远程是下图这张效果，可以看到并没有占满全屏，强迫症无法接受：


然后使用 Kali 官方的 NetHunter KeX 远程连接，屏幕就完全被充分利用了：


但是 NetHunter Kex 在远程操作体验上又不如 VNC Viewer 舒服，难道鱼和熊掌就无法兼得了吗？ 当然可以！！！ 经过国光测试，这个时候后台关掉 NetHunter KeX 的时候呢，再用 VNC Viewer 就可以完美的利用手机的全部屏幕空间了，岂不是美哉。

### 2. Kali NetHunter
Kali NetHunter 是基于 Kali Linux 的免费、开源的 Android 设备移动渗透测试平台，安全从业者必备的操作系统。

#### 安装 Kali NetHunter
Kali 官网提供的完整的安装命令如下，下面国光标上注释方便大家理解:
```shell
# 申请存储访问权限
termux-setup-storage

# 安装 wget
pkg install wget

# 下载 安装脚本
wget -O install-nethunter-termux https://offs.ec/2MceZWr 

# 给脚本执行权限
chmod +x install-nethunter-termux 

# 运行安装脚本
./install-nethunter-termux
```
里面很多操作我们之前都做了，所以现在只需要如下几步即可：
```shell
# 下载 安装脚本
wget -O install-nethunter-termux https://offs.ec/2MceZWr 

# 如果上面这一步卡的话，可以使用国光我放到国内的脚本
wget -O install-nethunter-termux https://html.sqlsec.com/install-nethunter-termux.txt

# 给脚本执行权限
chmod +x install-nethunter-termux 

# 运行安装脚本
./install-nethunter-termux
```
> 下载包大概 1GB+ 左右安装过程比较慢，国光这里建议大家挂代理下载，提供效率和成功率

如果你没有代理怎么办？ https://images.kali.org/nethunter/kalifs-arm64-full.tar.xz 这个就是最大的 1GB+ 的数据包，复制链接地址到迅雷等下载工具里面下载下来，然后拷贝到 Termux 手机的安装脚本同级目录下，或者直接更改脚本把这个数据包的下载地址替换为局域网的地址都可以方法有很多 大家可以自行发挥。

安装成功的效果图如下：



#### 基本使用命令
| 命令                    | 说明                                        |
| ----------------------- | ------------------------------------------- |
| nethunter               | 启动 Kali NetHunter 命令行界面              |
| nethunter kex passwd    | 配置 KeX 密码 (仅在第一次使用前需要)        |
| nethunter kex &         | 开始 KeX 会话服务                           |
| nethunter kex stop      | 停止 Kali NetHunter 桌面                    |
| nethunter               | 在 NetHunter 环境中运行命令                 |
| nethunter -r            | 以 root 身份启动 Kali NetHunterk 命令行界面 |
| nethunter -r kex passwd | 配置 root 用户的 KeX 密码                   |
| nethunter -r kex &      | 以 root 身份开始 KeX 会话服务               |
| nethunter -r kex stop   | 停止 root 身份运行的 KeX 会话服务           |
| nethunter -r kex kill   | 杀掉所有的 KeX 会话                         |
| nethunter -r            | 以 root 身份在 NetHunter 环境中运行命令     |

> nethunter 命令可以缩写成 nh ，Kali NetHunter 默认的用户名 kali 的密码也是 kali

> root 密码没有设置 可以输入 sudo passwd 来修改 root 用户的密码



Kali 命令行的使用国光不在废话了，下面就列几个点，大家可以关注一下:

1. Kali Linux 不需要换源，官方源会自动选择最佳的服务器节点（如果官方源卡的话 再考虑换国内源）
2. root 用户 无法使用 nmap ，所以 nmap 的一些需要高权限的参数无法正常使用
3. 完整安装 kali 工具集合可以使用 apt install kali-linux-default 大小大概为 2.6GB 左右 国光不建议这样操作，需要啥工具自己单独安装即可，没有必要全部安装
4. Galaxy 系列手机可能会阻止非 root 用户使用 sudo，只需使用 su -c 代替

#### 启动 VNC 服务
上面命令表中的 KeX 服务，实际上就是 VNC 服务，默认的端口是 5901 端口，首先 Termux 下启动 Kali 的 VNC：
```shell
nh kex &
```

图片上可以得出 KeX 服务的端口是 5901，然后进程的 ID 是 17222，可以使用 nmap 或者 netstat 命令再检测一下 5901 端口是否打开。

#### VNC 工具连接
VNC 连接还需要密码，所以这里手动设置一下：
```shell
nh kex passwd
```
设置完成之后级可以在 VNC 连接工具里面填写相应的信息即可连接了，记得端口号要加上：



VNC 关掉连接后，想要停止 Kex 服务即 VNC 服务，Termu 下使用如下命令即可退出服务：
```shell
nh kex stop
```

### 3. 其他 Linux 系统
Termux 安装 Linux 系统项目地址：https://github.com/sqlsec/termux-install-linux

这个脚本国光我磨磨蹭蹭写了 1 天才写完，筛选下来的系统都是体验还不错的系统。



下载的主要镜像全部托管在了 Gitee 上，下载速度很快，而且系统对应的更新源国光均替换为国内源了，安装和卸载都很容易上手，用户非预期的输入也都考虑到了，目前完美支持 Ubuntu、Kali、Debian、CentOS、Fedora 系统的安装，具体想尝试的话可以输入如下命令体验安装:

> 确保 Termux 已经安装了 proot 和 Python3 才可以顺利安装
```shell
git clone https://github.com/sqlsec/termux-install-linux
cd termux-install-linux
python termux-linux-install.py
```
系统安装的更多细节图可以参考我的这一篇文章：Android Termux 安装 Linux 就是这么简单

## 10. 极客行为
因为 Termux 各种基础的包都有，所以基本是一个小型的树莓派，所以可折腾性极高，如果你是一个极客玩家，不折腾会死星人的话，那么本章节比较适合你。祝你折腾愉快！

### 1. Aria2
Aria2 是一个轻量级多协议和多源命令行下载实用工具。它支持 HTTP / HTTPS, FTP, SFTP, bt 和 Metalink。最近被封杀的 PanDownload 也是使用的是 Aria2 来加速下载百度网盘里的资源的。本文是一个 Termux 教程，所以关于 Aria2 不会很深入将下去，关于更多 Aria2 的配置教程，大家可以参考网上其他大佬的教程。

#### 安装 aria2
```shell
pkg install aria2
```
安装完成后 可以顺便看一下版本信息：
```shell
aria2c -v
```

#### 启动 rcp 服务
aria2 支持 rpc 服务，默认监听的是 6800 端口。这样我们可以使用开源的 Web 项目来连接操作 aria2：
```shell
aria2c --enable-rpc --rpc-listen-all
```

#### webui-aria2
国光这里选的是这个比较流行的 aria2 的开源项目，地址是：https://github.com/ziahamza/webui-aria2 安装运行起来也很简单：
```shell
git clone https://github.com/ziahamza/webui-aria2.git
cd webui-aria2
node node-server.js
```
> 需要 node 来运行，没有安装的 话使用 pkg install nodejs 来安装

> 如果如果下载速度比较慢的话，可以尝试使用 fastgit 镜像地址来下载

> git clone https://hub.fastgit.org/ziahamza/webui-aria2.git



运行起来后，浏览器访问:http://localhost:8888 查看效果：



速度还算可以，有兴趣的朋友可以研究如何利用 aria2 来下载百度云文件之类的操作，更多姿势等你们来探索。

### 2. SSH
有时候我们需要通过 ssh 远程连接服务器，这个时候有 Termux，躺在床上就可以操作电脑了，哇！哦哦哦！awesome ，或者我们突然很闲，想要用电脑来远程手机，没错 Termux 都可以做到。

#### Termux ssh 连接电脑
##### 安装 openssh
OpenSSH 是 SSH （Secure SHell） 协议的免费开源实现。SSH 协议族可以用来进行远程控制， 或在计算机之间传送文件。Termux 官方已经封装好了，我们安装起来也会很简单：
```shell
pkg install openssh
```

##### 远程连接电脑
然后就可以直接 ssh 连接你的服务器了，（前提是电脑安装了 ssh 服务)：
```shell
ssh sqlsec@192.168.1.8
```
手机连接操作电脑效果图：



附上完整的 Linux SSH 连接命令格式：
```shell
# ssh -p 端口号 用户名@主机名或者IP
ssh -p 22 user@hostname_or_ip

# ssh -i 私钥 用户名@主机名或者IP
ssh -i id_rsa user@hostname_or_ip
```
##### 传输文件
SSH 不仅仅可以远程连接服务器，同样也可以使用 SSH 自带的 scp 命令进行文件传输：

复制文件
```shell
# scp 本地文件路径 远程主机用户名@远程主机名或IP:远程文件保存的位置路径
scp local_file remote_username@remote_ip:remote_folder
```
复制目录
```shell
# scp -r 本地文件夹路径 远程主机用户名@远程主机名或IP:远程文件夹保存的位置路径
scp -r local_folder remote_username@remote_ip:remote_folder
```
看完了 不打算亲自尝试一下文件传输的操作吗？ :-)

#### 电脑 ssh 连接 Termux
这个使用场景比较少，但是既然要打造中国的 Termux 文档的效果，还是一起写上去吧，首先确保你已经安装了 openssh 软件包，没有安装的话参考上一个小结进行安装，实现这个效果有两大种方法：

1. SSH 通过密码认证连接
2. SSH 通过公私钥连接
   1. PC 端生成公私钥，然后将 公钥 拷贝到 Termux 中，通过公私钥连接。
   2. Termux 端生成公私钥，然后将 私钥拷贝到 PC 中，通过公私钥连接。

##### 启动 ssh 服务
安装完成后，sshd 服务默认没有启动，所以得手动启动下：
```shell
sshd
```
因为手机上面低的端口有安全限制，所以这里 openssh 默认的 sshd 默认的服务端口号为 8022



##### 停止 ssh 服务
如果需要停止 ssh 服务，只需要 kill 杀掉进程即可：
```shell
pkill sshd
```

##### 通过密码认证链接
Termux 默认是使用密码认证进行连接的，如果要启用密码连接的话要确保你的密码足够安全，否则你的 SSH 被恶意攻击者连接或者爆破成功的话，那就美滋滋了！

Termux 下的 SSH 默认配置文件的路径为 $PREFIX/etc/ssh/sshd_config，我们来查看下这个配置文件：
```shell
PrintMotd no
PasswordAuthentication yes
Subsystem sftp /data/data/com.termux/files/usr/libexec/sftp-server
```
国光的 Termux 0.94 的版本就这 3 行配置，下面来逐行解释一下这个配置：

- PrintMotd : 是否显示登录成功的欢迎信息 例如上次登入的时间、地点等
- PasswordAuthentication: 是否启用密码认证
- Subsystem: SFTP 服务相关的设定

###### 设置新密码
执行 passwd 命令可以直接修改密码：
```shell
passwd
```
密码不要忘记哦

###### 电脑远程连接测试
国光测试了一下 Termux 的 ssh 和常规 Linux 不太一样，连接的时候不需要指定用户名。
```shell
ssh 192.168.31.124 -p 8022
```

##### 通过公私钥连接
公私钥连接更加安全，再也不用但你的 Termux SSH 被黑客爆破攻击的情况了

###### PC 端生成公私钥
首先在 PC 端生成秘钥对：
```shell
ssh-keygen
```
默认一直回车下去：



此时会在 ~/.ssh 目录下生成 3 个文件
```shell
id_rsa， id_rsa.pub，known_hosts
```
然后需要把公钥 id_rsa.pub 拷贝到手机的 data\data\com.termux\files\home.ssh 文件夹中。然后

###### 将公钥拷贝到验证文件中

在 Termux 下操作：
```shell
cat id_rsa.pub > authorized_keys
```

OK 现在你已经设置好公私钥了，那么修改一下 SSH 的配置文件，关掉密码登录吧：
```shell
vim $PREFIX/etc/ssh/sshd_config
```
找到：
```shell
PasswordAuthentication yes 
```
修改为：
```shell
PasswordAuthentication no
```
然后记得重启一下 SSH 服务：
```shell
pkill sshd;sshd
```
然后电脑端这边直接就可以通过公私钥连接了，无需输入密码也更加安全：
```shell
ssh 192.168.31.124 -p 8022
```

###### Termux 端生成公私钥
操作完上一步之后，我想你大概已经知道了公私钥的原理了。那么我们现在尝试在 Termux 端生成公私钥这种方法试试看，理论上也是可以的。

首先在 Termux 端生成秘钥对:
```shell
ssh-keyge
```
此时会在 ~/.ssh 目录下生成 3 个文件
```shell
id_rsa， id_rsa.pub，known_hosts
```
然后将公钥拷贝到验证文件中
```shell
cat id_rsa.pub > authorized_keys
```

接着将 id_rsa.pub 私钥下载下来，拷贝到 PC 端上，并赋予 600 的权限：
```shell
chmod 600 id_rsa
```
然后通过 -i 手动加载私钥的方式也可以成功连接到 Termux：
```shell
ssh -i id_rsa root@192.168.31.124 -p 8022
```
Bingo!

至此，Termux SSH 连接的 3 种方式都演示过了，国光个人比较建议使用 PC 端生成公私钥 的方法，这样可以减少 rsa 私钥泄露的风险，也方便 PC 端的远程连接与管理。

### 3. you-get
一个命令行小程序，支持下载各大网站的视频，具体支持的网站大家可以参考官方项目，国光这里就只作简单的介绍。

#### 安装 you-get
首先得先安装相关的依赖包

Python3 如果没有安装的话 可以参考上文的 「开发环境」-「Python」
```shell
pkg install python3 ffmpeg -y
```

安装完成后，直接使用 pip 来 安装，这里通过 -i 指定国内的 pip 源 速度会更快一点：
```shell
pip3 install you-get  -i https://pypi.tuna.tsinghua.edu.cn/simple some-package
```
#### 升级 you-get
```shell
pip3 install --upgrade you-get
```
#### 下载 B 站视频
默认是下载最高画质的，但是我们也可以列出所有可以下载的画质：
```shell
you-get -i https://www.bilibili.com/video/BV1mE411L7Rg
site:                Bilibili
title:               Python Web开发之Django美化-使用SimpleUi
streams:             # Available quality and codecs
    [ DASH ] ____________________________________
    - format:        dash-flv
      container:     mp4
      quality:       高清 1080P
      size:          12.9 MiB (13525977 bytes)
    # download-with: you-get --format=dash-flv [URL]

    - format:        dash-flv720
      container:     mp4
      quality:       高清 720P
      size:          11.3 MiB (11834935 bytes)
    # download-with: you-get --format=dash-flv720 [URL]

    - format:        dash-flv480
      container:     mp4
      quality:       清晰 480P
      size:          9.8 MiB (10274269 bytes)
   ...
```
下载 720P 视频：
```shell
you-get --format=dash-flv720 https://www.bilibili.com/video/BV1mE411L7Rg
```

#### 下载网易云音乐歌单
下面以我自己的歌单为例子，首先找到自己喜欢的歌单，然后点击复制链接：



> 链接传送门：[渗透测试代码审计程序员必备电音](http://music.163.com/playlist?id=489221140)

直接 you-get 歌单的链接地址就可以直接批量下载地址了：
```shell
you-get 'http://music.163.com/playlist?id=489221140'
```

下载完成后会以歌单名作为文件夹存放下载好的音乐以及歌单的封面：



## 11. 信息安全
因为 Termux 可以很好的支持 Python，所以几乎所有用 Python 编写的安全工具都是可以完美的运行使用的，所以国光这个版块重点就列举了国光认为实战中比较不错的安全工具。当然大家也可以直接参考本文的 「系统安装」- 「Kali NetHunter」章节，直接在手机里面安装一个 Kali Linux 系统，国光实际体验还是很完美的，里面的信息安全工具要更全面一些。

### 1. 更新一下
因为网络社交媒体上有不少脚本小子上传了如何使用 Termux 安装黑客工具进行一些破坏行为，导致 Termux 官方移除了如下黑客工具的包支持：

- Hashcat
- Hydra
- Metasploit
- Sqlmap
实际上官方并没有封死，只是为脚本小子提高了门槛，官方文档原话如下：

> Manual compiling and installation of these packages should not require much effort from experienced users. All packages are still present in git history, so just revert commits to restore them. As for others… lets they take a mission impossible challenge of installing package from source!

手动编译和安装这些包应该不需要有经验的用户付出太多努力。所有包仍然存在于 git 历史记录中，因此只需还原提交即可恢复它们。至于其他人…… 让他们接受从源代码安装软件包的不可能完成的挑战！

> 23333 只会用工具的脚本小子被官方嘲讽了。

### 2. Exiftool
一个强大的元数据查看修改工具，CTF 的 MISC 的比赛上也经常露面，实际上 ios 自带的相机拍出的照片里面是携带 GPS 定位的，使用 Exiftool 就可以很轻松的查看到经纬度信息。
```shell
pkg install exiftool
```
下面查看一下国光我刚刚保存地理信息拍的照片的元数据信息：
```shell
cd ~/storage/dcim/Camera
exiftool IMG_20200424_073210.jpg
```

给 GPS 位置信息打马，防止网友顺着网线过来打人。

### 3. Metasploit
Metasploite 黑客 Top10 工具之一，漏洞攻击库，安全从业者必备工具之一，也在各大黑客题材的电影中频频出现。

#### 2021 年更新
因为官方的 unstable-repo 源，移除了对 Metasploit 的支持，按照以前的方法会提示：
```shell
E: Unable to locate paclage metasploit 
```
国光这里是通过 Github 上的 m-wiz 项目来辅助安装 Metasploit 的，脚本启动比较简单：
```shell
# 安装依赖
pkg install git

# 克隆脚本项目
git clone https://github.com/noob-hackers/m-wiz

# 运行脚本
cd m-wiz && bash m-wiz.sh
```
操作的菜单比较简单直观：



安装的时候还会有一些提示，比如选择 Metasploit 的版本之类的，大家根据提示自己选择安装即可，安装的过程可能会安装其他 Ruby gem，因此能需要很长时间。在安装完成之前，请勿关闭 Termux 会话，否则可能会出一些玄学问题导致安装失败，总之耐心等待即可。

国光强烈建议搭建挂代理安装，这样效率和成功率会高很多，大家看到这个版块说明也是安全从业者了，所以代理对于你来说应该很简单了吧，最后的安装效果如下：



为了方便日后直接启动，手动创建下软连接，下次可以直接启动：
```shell
ln -s $HOME/metasploit-framework/msfconsole $PREFIX/bin/msfconsole
ln -s $HOME/metasploit-framework/msfd $PREFIX/bin/msfd
ln -s $HOME/metasploit-framework/msfdb $PREFIX/bin/msfdb
ln -s $HOME/metasploit-framework/msfrpc $PREFIX/bin/msfrpc
ln -s $HOME/metasploit-framework/msfupdate $PREFIX/bin/msfupdate
ln -s $HOME/metasploit-framework/msfvenom $PREFIX/bin/msfvenom
```
#### 旧的教程
##### Android 7 +
目前 Termux 官方的 pkg 已经支持直接安装 Metasploit 了，但是仅适用于 Android 7 及其以上版本。通过如下两条命令即可安装，下载过程大约 1 分钟左右（当然国光我是挂代理的）
```shell
#  切换不稳定源
pkg install unstable-repo

#  安装 msf
pkg install metasploit
```

##### Android 5.x - 6.x
因为老的安卓版本不支持 unstable-repo，所以只能执行如下命令手动安装了：
```shell
curl -LO https://github.com/termux/termux-packages/files/3995119/metasploit_5.0.65-1_all.deb.gz
gunzip metasploit_5.0.65-1_all.deb.gz
dpkg -i metasploit_5.0.65-1_all.deb
apt -f install
```
### 4. Netcat
nc 被誉为网络安全界的瑞士军刀，一个简单而有用的工具，netcat 是比较新的现代版本，并且作者是着名的 Nmap 程序的作者。nc 命令的详细教程可以参考我的这篇文章: nc 命令教程

目前 ncat 已经集成到了 nmap 里面，安装完 nmap 后就可以使用 ncat 命令了，如果你不想安装 nmap 也可以单独安装 ncat 命令：
```shell
# 安装
pkg install nmap-ncat


# 版本信息
netcat --version
Ncat: Version 7.80 ( https://nmap.org/ncat )
```

### 5. Nmap
端口扫描必备工具，在最近的国产电视剧《亲爱的，热爱的》也出现过令人叹为观止的操作：nmap -sT -A localhost!!!

#### 安装 Nmap

Termux 源里面封装打包了 Nmap，所以安装起来就比较简单：
```shell
pkg install nmap
```

### 6. Hashcat
Hashcat 是世界上最快的密码破解程序，是一个支持多平台、多算法的开源的分布式工具。

官方:https://hashcat.net/hashcat/

Github:https://github.com/hashcat/hashcat

在我的另一篇文章里面有更详细的教程来介绍这款工具：Hashcat 学习记录

#### 安装 Hashcat

Termux unstable 源里面也封装好了 Hastcat，所以我们安装依然一条命令即可：
```shell
pkg install hashcat
```
如果提示找不到 Hashcat 包的话，那么手动安装切换不稳定源即可：
```shell
#  切换不稳定源
pkg install unstable-repo
```

### 7. Hydra
Hydra 是著名的黑客组织 THC 的一款开源暴力破解工具，如果由于 Termux 官方移除对 Hydra 的支持 ，如今只能手动编译安装，理论上编译安装的方法如下，是否真的好用还得等大家的测试，国光感觉 Hydra 不太行，就没有深入折腾这个：

#### 安装 Hydra
```shell
# 拷贝项目
git clone https://github.com/vanhauser-thc/thc-hydra

# 手动编译
./configure --prefix=$PREFIX
make
make install

# 查看版本信息
./hydra -h
```
成功爆破出了SSH的密码 以前的图

### 8. SQLmap
SQLmap 是一款用来检测与利用 SQL 注入漏洞的免费开源工具 官方项目地址，后面 SQLmap 也支持 Python3 版本了

#### 安装 SQLmap

我们直接 git clone 源码，然后运行 sqlmap.py 文件：
```shell
git clone https://github.com/sqlmapproject/sqlmap.git
cd sqlmap
python sqlmap.py
```
> sqlmap 支持 pip 安装了，所以建议直接 pip install sqlmap 来进行安装，然后终端下直接 sqlmap 就可以了，十分方便。



### 9. xray
xray 是长亭科技开发的 Web 漏洞扫描器，在圈内的反馈都是还不错的，在我的这篇文章 xray Web 扫描器学习记录已经讲解了 xray 扫描器的基本使用，但是国光注意到 xray 官方项目居然也发布了 arm64 的版本，那么理论 Termux 应该也就可以愉快地安装了，手机躺着挖洞也不是不可能。

官方版本发布地址: https://github.com/chaitin/xray/releases

下面尝试直接安装运行看看：
```shell
# 下载并解压
mkdir xray && cd xray
wget xxxxx.zip # xray 的下载地址
unzip xray_linux_arm64.zip

# 直接运行
./xray_linux_arm646
```

### 10. 小结
因为 Termux 完美的支持 Python 和 Perl 等语言，所以有太多优秀的信息安全工具值得大家去发现了，这里国光我就不一一列举了。

## 12. 官方插件
Termux 有一些额外有趣的功能，我们可以通过安装插件的方式来使用这些功能。网友们反馈 F-Droid 里面的 Termux 插件都是可以免费下载的，大家根据实际情况自行抉择。

### 1. Termux:API
Termux:API，可用于访问手机硬件实现更多的友情的功能。官方唯一一个免费的 API，良心啊。

#### 准备工作
##### 安装 Termux:API
下载地址

- [Termux:API Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux.api)
- [Termux:API F-Droid 下载地址](https://f-droid.org/packages/com.termux.api/)
> 请勿在 Google Play 和 F-Droid 之间混合安装 Termux 和 插件。



##### 给 app 权限
因为 Termux-api 可以直接操作手机底层，所以我们需要到手机的设置里面给 这个 APP 的权限全部开了，这样下面操作的时候就不会提示权限不允许的情况了。



##### 安装 Termux-api 软件包
手机安装完 Termux-api 的 APP 后，Termux 终端里面必须安装对应的包后才可以与手机底层硬件进行交互。
```shell
pkg install termux-api
```
下面只列举一些可能会用到的，想要获取更多关于 Termux-api 的话，可以考虑参考官方文档。

因为本文的篇幅已经过长，而且手机用户浏览起来已经很卡顿了，所以单独把之前冗长的 Termux API 部分开了一篇文章来记录，提高用户的浏览体验：Termux-API 使用教程

### 2. Termux:Boot
用于将自定义命令开机自启使用，不要每次重启完重复敲命令了。(当然你的手机性能很强，从来需要重启)

#### 安装 Termux:Boot
- [Termux:Boot Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux.boot)
- [Termux:Boot F-Droid 下载地址](https://f-droid.org/packages/com.termux.boot/)
> 请勿在 Google Play 和 F-Droid 之间混合安装 Termux 和 插件。



这是一个收费的应用，一贫如洗的国光是买不起的，但是还得写一下这个，万一真的有壕买了这个 APP 呢

#### 使用方法
安装完成启动这个应用程序后，创建 ~/.termux/boot/ 目录，将需要开机自启的脚本放在这个目录下面，如果有多个文件的话，将他们按照排序顺序执行，如果要确保设备进入睡眠状态，建议脚本前面先运行 termux-wake-lock 命令。

下面是一个开机自启 sshd 服务的的脚本，文件的完整路径为: ~/.termux/boot/start-sshd 内容如下：
```shell
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
sshd
```

### 3. Termux:Float
可以将 Termux 悬浮窗形式显示，看上去比较酷炫。

- [Termux: Float Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux.window)
- [Termux: Float F-Droid 下载地址](https://f-droid.org/packages/com.termux.window/)
> 请勿在 Google Play 和 F-Droid 之间混合安装 Termux 和 插件。



这是依然是一个收费的应用，尽管它看上去很酷炫，但是家境贫寒的国光还是买不起，下面就晒一个效果图吧：

边学习 边操作练习

### 4. Termux:Styling
Termux 官方提供了终端的一些美化方案。

- [Termux:Styling Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux.styling)
- [Termux:Styling F-Droid 下载地址](https://f-droid.org/packages/com.termux.styling/)
> 请勿在 Google Play 和 F-Droid 之间混合安装 Termux 和 插件。



这是还是一个收费的应用，虽然我们前面的一键安装脚本已经可以达到这个美化效果了，但是如果你想尝试一下官方的可以试试看。

### 5. Termux:Widget
提供了 Andorid 的 Termux 小部件。

- [Termux:Widget Google Play 下载地址](https://play.google.com/store/apps/details?id=com.termux.widget)
- [Termux:Widget F-Droid 下载地址](https://f-droid.org/packages/com.termux.widget/)
> 请勿在 Google Play 和 F-Droid 之间混合安装 Termux 和 插件。



依然是收费插件，比较冷门，使用场景很少，不推荐大家入手这个，所以用法这里国光就不列出了。(这个偷懒的理由很好 2333)

## 13. 无聊专区
一些无聊有趣的知识，如果你是一个正经讲究人，可以跳过这个版块以节约你的阅读时间。

### 1. cmatrix
《黑客帝国》的代码雨视觉特效。
```shell
pkg install cmatrix
cmatrix
```


### 2. cowsay
cowsay 命令是一个有趣的命令，它会用 ASCII 字符描绘牛，羊和许多其他动物，还可以附带上个自定义文本，很巧的是 Termux 也封装了这个工具。
```shell
pkg intall cowsay
cowsay -f 动物 内容
```
内置如下动物：
```shell
$ cowsay -l list

Cow files in /data/data/com.termux/files/usr/share/cows:
beavis.zen bong bud-frogs bunny cheese cower daemon default dragon
dragon-and-cow elephant elephant-in-snake eyes flaming-sheep ghostbusters
head-in hellokitty kiss kitty koala kosh luke-koala meow milk moofasa moose
mutilated ren sheep skeleton stegosaurus stimpy three-eyes turkey turtle
tux vader vader-koala www
```
国光的简单示例：
```shell
cowsay -f eyes '法外狂徒张三'
```

### 3. figlet
FIGlet 是创建一个简单的命令行实用程序，用于创建 ASCII logo。
```shell
pkg install figlet
figlet -f 字体 '文本内容'
```
内置如下样式：
```shell
ls $PREFIX/share/figlet

646-ca.flc   646-jp.flc   8859-7.flc      circle.tlf    mini.flf       smbraille.tlf
646-ca2.flc  646-kr.flc   8859-8.flc      digital.flf   mnemonic.flf   smmono12.tlf
646-cn.flc   646-no.flc   8859-9.flc      emboss.tlf    mono12.tlf     smmono9.tlf
646-cu.flc   646-no2.flc  ascii12.tlf     emboss2.tlf   mono9.tlf      smscript.flf
646-de.flc   646-pt.flc   ascii9.tlf      frango.flc    moscow.flc     smshadow.flf
646-dk.flc   646-pt2.flc  banner.flf      future.tlf    pagga.tlf      smslant.flf
646-es.flc   646-se.flc   big.flf         hz.flc        script.flf     standard.flf
646-es2.flc  646-se2.flc  bigascii12.tlf  ilhebrew.flc  shadow.flf     term.flf
646-fr.flc   646-yu.flc   bigascii9.tlf   ivrit.flf     slant.flf      upper.flc
646-gb.flc   8859-2.flc   bigmono12.tlf   jis0201.flc   small.flf      ushebrew.flc
646-hu.flc   8859-3.flc   bigmono9.tlf    koi8r.flc     smascii12.tlf  uskata.flc
646-irv.flc  8859-4.flc   block.flf       lean.flf      smascii9.tlf   utf8.flc
646-it.flc   8859-5.flc   bubble.flf      letter.tlf    smblock.tlf    wideterm.tlf
```
国光的演示：
```shell
figlet -f future 'www.sqlsec.com'
```

### 4. hollywood
在 Linux 终端中伪造好莱坞黑客屏幕，假装自己是一名黑客。
```shell
pkg install hollywood
hollywood
```
国光差点就信了

### 5. neofetch
Neofetch 是一个简单但有用的命令行系统信息工具。它会收集有关系统软硬件的信息，并在终端中显示结果。
```shell
pkg install neofetch
neofetch
```

### 6. nyancat
彩虹貓（英语： Nyan Cat）是在 2011 年 4 月上传在 Youtube 的视频，并且迅速爆红于网络，並在 2011 年 YouTube 浏览量最高的视频中排名第五，B 站这个小猫也很多，主要是 BGM 比较魔性，感兴趣的朋友可以自己去搜索看看。
```shell
pkg install nyancat
nyancat
```

使用 Ctrl + C 快捷键退出魔性循环

### 7. screenfetch
Screenfetch 是一个适用于 Linux 的小工具，用于显示系统信息及 ASCII 化的 Linux 发行版图标。
```shell
pkg install screenfetch
screenfetch
```

显示其他 Linux 发行版的 logo：
```shell
screenfetch -A 发行版
```
现在内置的发行版 logo 有：
```shell
ALDOS, Alpine Linux, Amazon Linux, Antergos, Arch Linux (Old and Current
    Logos), ArcoLinux, Artix Linux, blackPanther OS, BLAG, BunsenLabs, CentOS,
    Chakra, Chapeau, Chrome OS, Chromium OS, CrunchBang, CRUX, Debian, Deepin,
    DesaOS,Devuan, Dragora, elementary OS, EuroLinux, Evolve OS, Sulin, Exherbo,
    Fedora, Frugalware, Fuduntu, Funtoo, Fux, Gentoo, gNewSense, Guix System,
    Hyperbola GNU/Linux-libre, januslinux, Jiyuu Linux, Kali Linux, KaOS, KDE neon,
    Kogaion, Korora, LinuxDeepin, Linux Mint, LMDE, Logos, Mageia,
    Mandriva/Mandrake, Manjaro, Mer, Netrunner, NixOS, OBRevenge, openSUSE, OS
    Elbrus, Oracle Linux, Parabola GNU/Linux-libre, Pardus, Parrot Security,
    PCLinuxOS, PeppermintOS, Proxmox VE, PureOS, Qubes OS, Raspbian, Red Hat
    Enterprise Linux, ROSA, Sabayon, SailfishOS, Scientific Linux, Siduction,
    Slackware, Solus, Source Mage GNU/Linux, SparkyLinux, SteamOS, SUSE Linux
    Enterprise, SwagArch, TinyCore, Trisquel, Ubuntu, Viperr, Void and Zorin OS and
    EndeavourOS
```
内置的操作系统 logo 有：
```shell
Dragonfly/Free/Open/Net BSD, Haiku, Mac OS X, Windows
```
### 8. sl
某编程牛人也经常犯把 ls 敲成 sl 的错误，所以他自己编了一个程序娱乐一下，这个程序的作用很简单，就是当你输入 sl 的时候终端会出现一个火车呼啸而过～～
```shell
pkg install sl
sl
```

### 9. toilet
toilet 能用字母拼写出更大字母的工具，具体拼出什么字由命令后面的参数决定，不仅如此，它还能打印出各种风格的效果，比如彩色，金属光泽等。
```shell
pkg install toilet
toilet -f 字体 -F 颜色参数 '文本信息'
```
内置如下字体：
```shell
$ ls $PREFIX/share/figlet

ascii12.tlf     bigmono12.tlf  emboss2.tlf  mono9.tlf      smblock.tlf    wideterm.tlf
ascii9.tlf      bigmono9.tlf   future.tlf   pagga.tlf      smbraille.tlf
bigascii12.tlf  circle.tlf     letter.tlf   smascii12.tlf  smmono12.tlf
bigascii9.tlf   emboss.tlf     mono12.tlf   smascii9.tlf   smmono9.tlf
```
内置如下颜色效果：
```shell
$ toilet --filter list

Available filters:
"crop": crop unused blanks
"gay": add a rainbow colour effect
"metal": add a metallic colour effect
"flip": flip horizontally
"flop": flip vertically
"180": rotate 180 degrees
"left": rotate 90 degrees counterclockwise
"right": rotate 90 degrees clockwise
"border": surround text with a border
```
国光的简单演示：
```shell
toilet -f mono12 -F gay 'Bilibili'
```

### 10. 搭建 mc 基岩服务器
> 本版块由初学生 KeySummer 提供，QQ 为：1505708353 有这方面问题可以找他交流哦。

搭建 mc 基岩服务器首先得了解跨 CPU 技术，具体安装方法可以参考 Gitee -Moe/Tmoe-linux ，在安装过程中请安装 ubuntu，以便与直接开服。然后输入 debian 就可以进入我的跨 cpu 的容器里了，然后大家可以去：https://www.minecraft.net/zh-hans/download/server/bedrock 网址内找到 Ubuntu 版的下载按钮，然后复制连接回到 Termux 内的 Ubuntu 后输入
```shell
mkdir mc 
cd mc 
wget https://minecraft.azureedge.net/bin-linux/bedrock-server-1.16.201.02.zip
apt install unzip
unzip bedrock-server-1.16.201.02.zip
```
然后输入 LD_LIBRARY_PATH=. ./bedrock_server 即可（树莓派和此办法一样，Ubuntu 则不需要前面的跨 CPU 步骤，直接进行最后的 2，3 两步即可），祝你们好运。

### 11. 终端二维码
Linux 命令行下的二维码，主要核心是这个网址：http://qrenco.de/
```shell
echo "https://www.sqlsec.com" |curl -F-=\<- qrenco.de
```

如果你不嫌无聊的话还可以扫描这个二维码，然后就又打开我的这篇文章了。

## 14. 文章总结
相对来说 国外的 Termux DIY 的氛围比国内好很多，Youtube 上的视频都有很高的播放量。当然国内也有这么一批执着于 Termux 的玩家，当初写完这篇文章的时候，相对来说还比较小众的，写这篇文章只想让更多的人认识到 Termux 的生产力，使用 Termux 来做一些很 cool 的事情。 期待有更多 Termux 的优秀文章出现～

另外如果你喜欢这篇文章的话 不防点一下网站最下方不起眼的广告表示支持！Thanks♪(･ω･)ﾉ

本文可能实际上也没有啥技术含量，但是写起来还是比较浪费时间的，在这个喧嚣浮躁的时代，个人博客越来越没有人看了，写博客感觉一直是用爱发电的状态。如果你恰巧财力雄厚，感觉本文对你有所帮助的话，可以考虑打赏一下本文，用以维持高昂的服务器运营费用（域名费用、服务器费用、CDN 费用等）
