Oh My Zsh 是一款社区驱动的命令行工具，是基于 Zsh 命令行的一个扩展工具集，提供了丰富的扩展功能，如：主题配置，插件机制，内置的便捷操作等，可以给我们一种全新的命令行使用体验。下文对 Oh My Zsh 的安装及配置方法进行总结，只总结最佳的实践。

### 1. 安装 Oh My Zsh
第一步：安装 Zsh
```bash
# 安装 Zsh
sudo apt install zsh

# 将 Zsh 设置为默认 Shell
chsh -s /bin/zsh

# 可以通过 echo $SHELL 查看当前默认的 Shell，如果没有改为 /bin/zsh，那么需要重启 Shell。
```

第二步：安装 Oh My Zsh

```bash
# 安装 Oh My Zsh
wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | sh
# 以上命令可能不好使，可使用如下两条命令
wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh
bash ./install.sh
```

### 2. Zsh 的配置
#### 2.1 字体的安装
推荐在终端使用 Powerline 类型的主题，该类型主题可以使用图形表示尽可能多的信息，方便用户的使用。推荐安装用户量最大的 Powerlevel9k。

Powerlevel9k 中需要使用较多的图形符号，字体大多不会自带这些符号，所以需要使用专门的 Powerline 字体。

不推荐安装官方默认的 Powerline Fonts，理由是图形符号不全，符号处会有乱码。推荐安装 Nerd-Fonts 系列字体，因为该系列字体附带有尽可能全的符号，并且更新非常频繁，项目地址在这里。例如直接下载 Ubuntu Font Family 中的 Ubuntu Nerd Font Complete.ttf ，然后直接在Ubuntu下安装。

#### 2.2 主题及字体的配置
如果要在  Oh My Zsh中安装 Powerlevel9k ，只需执行如下指令：
```bash
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k
```

### 3. 插件配置
#### 3.1 autojump
更快地切换目录，不受当前所在目录的限制。

安装：
```bash
sudo apt install autojump
```

用法：
```bash
# 跳转到目录
j dir
# 可以通过GUI文件管理器打开指定目录，执行命令:
jo dir
```

#### 3.2 fasd
快速访问文件或目录，功能比前一个插件强大。

安装：
```bash
sudo apt install fasd
```

用法：
```bash
alias f='fasd -f'          # 文件
alias d='fasd -d'        # 目录
alias a='fasd -a'        # 任意
alias s='fasd -si'       # 显示并选择

alias sd='fasd -sid'        # 选择目录
alias sf='fasd -sif'          # 选择文件
alias z='fasd_cd -d'       # 跳转至目录
alias zz='fasd_cd -d -i'  # 选择并跳转至目录
```

#### 3.3 zsh-autosuggestions
命令行命令键入时的历史命令建议插件

按照官方文档提示，直接执行如下命令安装：
```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

#### 3.4 zsh-syntax-highlighting
命令行语法高亮插件

按照官方文档提示，直接执行如下命令安装：
```bash
 git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

#### 3.5 插件最终配置
```bash
# autojump 功能弱，fasd 功能强，但是没 autojump 实用
# 值得注意的是，根据官方文档，zsh-syntax-highlighting 插件需放在最后
plugins=(
  git extract autojump zsh-autosuggestions zsh-syntax-highlighting
)
```


### 4.「.zshrc」文件完整修改
Oh My Zsh 配置文件的完整修改结果，只有对配置文件进行如下修改，才能使上述配置生效。
```bash
# 设置字体模式以及配置命令行的主题，语句顺序不能颠倒
POWERLEVEL9K_MODE='nerdfont-complete'
ZSH_THEME="powerlevel9k/powerlevel9k"

# 以下内容去掉注释即可生效：
# 启动错误命令自动更正
ENABLE_CORRECTION="true"

# 在命令执行的过程中，使用小红点进行提示
COMPLETION_WAITING_DOTS="true"

# 启用已安装的插件
plugins=(
  git extract fasd zsh-autosuggestions zsh-syntax-highlighting
)
```

### 常用命令
下面总结 Oh My Zsh 配置相关的其他 bash 命令：
```bash
#  查看当前所用的 Shell
echo $SHELL

# 查看系统内已安装的 Shell
cat /etc/shells

# 用 GUI 文件管理器或编辑器打开指定的的文件或目录
xdg-open fileOrDir
```

### 参考资料
- [Zsh + Oh My Zsh 全程指南「程序员必备」](https://segmentfault.com/a/1190000013612471)
- [Zsh 全程指南](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)
- [Ubuntu 16.04 下安装 Zsh 和 Oh My Zsh](https://www.cnblogs.com/EasonJim/p/7863099.html)
