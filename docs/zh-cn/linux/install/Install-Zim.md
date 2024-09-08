## 为什么使用 zimfw 而不是 oh my zsh
zim 启动速度更快，相比 ohmyzsh 更加轻量级 Zim is a Zsh configuration framework that bundles a [plugin manager](https://github.com/zimfw/zimfw#usage), useful [modules](https://zimfw.sh/docs/modules/), and a wide variety of [themes](https://zimfw.sh/docs/themes/), without compromising on [speed](https://github.com/zimfw/zimfw/wiki/Speed).

## zsh安装
1. 查看自己系统是否存在zsh
```bash
cat /etc/shells
```

2. 查看是否是使用的 zsh
```bash
echo $SHELL

或者使用
ps 
查看进程
```


3. 切换为 zsh（macos 自带默认是 zsh，如果不是进行切换即可）
```bash
apt-get update
# ubuntu下载安装zsh
apt install zsh -y

# 切换
chsh -s /bin/zsh
reboot
```

## zim安装
1. 如果你安装过卸载 ohmyzsh
```bash
# 卸载
uninstall_oh_my_zsh
```

2. 安装zimfw
```bash
curl -fsSL https://raw.githubusercontent.com/zimfw/install/master/install.zsh | zsh
```

3. 如果有这个错，请把 DNS 改成`8.8.8.8`


等待一会儿，可能需要 fq（github）


## 插件和主题配置
`git clone https://github.com/matyle/matyle.github.io` - 下载克隆我的配置文件，在`config/zimfw`中 的 zimrc 放到用户目录下将其重命名为 .zimrc - 个人使用到的 zimfw 插件都在该配置文件 - 接着使用如下命令安装插件和 [p10k](https://github.com/romkatv/powerlevel10k) （包名已经在配置文件中，只需要下面一个命令就能安装所有插件和p10k主题）
```bash
zimfw install

# 配置主题
p10k configure
```

## 字体安装
字体没装以前


```bash
git clone https://github.com/ryanoasis/nerd-fonts.git --depth 1
cd nerd-fonts
./install.sh

```

安装完成终端选择字体（其他终端类似，都在设置里面找到该字体即可）

## 插件介绍
1. 代替ls的插件 exa
```bash
brew install exa
#.zimrc中配置
zmodule DarrinTisdale/zsh-aliases-exa # 添加多个 alias, 使用 exa 代替 ls，要求有安装 exa
```

2. zsh vi mod 使用vi模式编辑命令
3. neofetch 显示系统信息（秀终端的） brew install neofetch
4. iTerm2 背景透明（模糊） Perference--profile---window选择图片，模糊等效果
