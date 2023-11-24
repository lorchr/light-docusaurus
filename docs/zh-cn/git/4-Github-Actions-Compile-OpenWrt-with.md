- [GitHub Actions 在线云编译 OpenWrt 固件](https://p3terx.com/archives/build-openwrt-with-github-actions.html)

## 前言
Github Ac­tions 是 Mi­crosoft 收购 GitHub 后推出的 CI/​CD 服务，它提供了性能配置非常不错的虚拟服务器环境（E5 2vCPU/​7G RAM），基于它可以进行构建、测试、打包、部署项目。对于公开仓库可免费无时间限制的使用，且单次使用时间长达 6 个小时，这对于编译 Open­Wrt 来说是非常充足的。不过 GitHub Ac­tions 有一定的使用门槛，首先要了解如何编写 workflow 文件。不过不用担心，博主已经编写好了相关的 work­flow 文件模版，只需要按照教程的步骤来操作即可。

## 方案特点
- 免费
- 一键快速编译
- 定时自动编译
- 客制化编译
- 并发编译（可同时进行20个编译任务）
- 无需搭建编译环境（在线make menuconfig生成配置文件)
- 无需消耗自己的计算机与服务器的计算资源（性感E5在线编译）
- 无需担心磁盘空间不足（近60G磁盘空间）
- 无需使用清理文件（内核更新不怕 boom ）
- 编译速度快（编译时间1-2小时）
- 编译成功率提升200%（万兆自由网络环境）
- 全新环境（杜绝编译环境不干净导致编译失败）

> 本解决方案是一个开放平台，任何人都可以基于此打造自己专属的编译方案。

## 项目地址
[P3TERX/Actions-OpenWrt](https://github.com/P3TERX/Actions-OpenWrt)

支持项目请随手点个 star，让更多的人发现、使用并受益。

## 准备工作
- GitHub 账号
- 搭建编译环境，生成.config文件。(可选)

> TIPS: 关于编译环境的搭建，推荐去看我之前写的相关文章，Win­dows 10 可以使用 WSL ，ma­cOS、Linux 可以使用 Docker 。

## 教程更新
- 2021-01-03 新增源码更新自动编译使用说明
- 2020-10-11 新触发方式使用方法、更新上传固件到 releases 页面说明。
- 2020-04-25 更新 DIY 脚本说明、添加自定义 feeds 配置文件说明
- 2020-04-09 新增上传固件到 WeTransfer
- 2020-03-30 新增上传固件到奶牛快传
- 2020-02-01 新图文教程
- 2019-12-10 新增 macOS 编译方案使用说明
- 2019-12-06 添加 tmate 网页终端链接说明
- 2019-12-05 优化基础使用教程，添加 @lietxia 大佬的图文教程链接
- 2019-12-04 新增云menuconfig使用方法
- 2019-12-03 新增并发编译使用方法
- 2019-11-30 新增自定义源码编译使用方法
- 2019-11-14 全网独家首发

## 基础使用
首先你必须要熟悉整个 Open­Wrt 的编译过程，这会让你非常容易的理解如何使用 GitHub Ac­tions 进行编译，即使你没有成功过。因为实际上本地编译近 90% 失败的原因是因为网络问题导致的，中国大陆特色，咱也不敢多说。GitHub Ac­tions 服务器由 Mi­crosoft Azure 提供，拥有万兆带宽，可以使编译成功率大大提升。

1. 在自己搭建编译环境中使用 [Lean's OpenWrt](https://github.com/coolsnowwolf/lede) 源码生成`.config`文件。（或使用直接 SSH 连接到 Actions 进行操作，后面有说明。）

> TIPS: 方案默认引用 Lean 的源码，因为他的 README 影响了我开始学习编译，也就有了这个项目，而且他的源码非常的优秀。有其它需求可自行修改 work­flow 文件，方法后面的进阶使用中有说明。

2. 进入 [P3TERX/Actions-OpenWrt](https://github.com/P3TERX/Actions-OpenWrt) 项目页面，点击页面中的 Use this template （使用这个模版）按钮。

3. 填写仓库名称，然后点击`Create repository from template`（从模版创建储存库）按钮。

4. 经过几秒钟的等待，页面会跳转到新建的仓库，内容和我的项目是相同的。然后点击Create new file（创建新文件）按钮。

5. 文件名填写为`.config`，把生成的`.config` 文件的内容复制粘贴到下面的文本框中。

6. 翻到页面最下方，点击`Commit new file`（提交新文件）按钮。

7. 在 Actions 页面选择`Build OpenWrt`，然后点击`Run Workflow`按钮，即可开始编译。（如果需要 SSH 连接则把`SSH connection to Actions`的值改为`true`。其它详情参见进阶使用相关章节）

8. 在等待编译完成的过程中，你可以进入[这个页面](https://github.com/P3TERX/Actions-OpenWrt)点击右上角的star，这是对博主最大的支持，而且还可以加快编译速度哦（雾

9. 最后经过一两个小时的等待，不出意外你就可以在 Actions 页面看到已经打包好的固件目录压缩包。

> TIPS: 如需 `ipk` 文件可以在进阶使用章节找到方法。因为大多数人只需要固件，而且总是有萌新问固件在哪，所以现在默认只上传固件。

## 进阶使用
### 自定义环境变量与功能
打开 work­flow 文件（`.github/workflows/build-openwrt.yml`），你会看到有如下一些环境变量，可按照自己的需求对这些变量进行定义。
```yaml
env:
  REPO_URL: https://github.com/coolsnowwolf/lede
  REPO_BRANCH: master
  FEEDS_CONF: feeds.conf.default
  CONFIG_FILE: .config
  DIY_P1_SH: diy-part1.sh
  DIY_P2_SH: diy-part2.sh
  UPLOAD_BIN_DIR: false
  UPLOAD_FIRMWARE: true
  UPLOAD_COWTRANSFER: false
  UPLOAD_WETRANSFER: false
  UPLOAD_RELEASE: false
  TZ: Asia/Shanghai
```

> TIPS: 修改时需要注意:(冒号)后面有空格。

| 环境变量           | 功能                                                      |
| ------------------ | --------------------------------------------------------- |
| REPO_URL           | 源码仓库地址                                              |
| REPO_BRANCH        | 源码分支                                                  |
| FEEDS_CONF         | 自定义feeds.conf.default文件名                            |
| CONFIG_FILE        | 自定义.config文件名                                       |
| DIY_P1_SH          | 自定义diy-part1.sh文件名                                  |
| DIY_P2_SH          | 自定义diy-part2.sh文件名                                  |
| UPLOAD_BIN_DIR     | 上传 bin 目录。即包含所有 ipk 文件和固件的目录。默认false |
| UPLOAD_FIRMWARE    | 上传固件目录。默认true                                    |
| UPLOAD_COWTRANSFER | 上传固件到奶牛快传。默认false                             |
| UPLOAD_WERANSFER   | 上传固件到 WeTransfer 。默认false                         |
| UPLOAD_RELEASE     | 上传固件到 releases 。默认false                           |
| TZ                 | 时区设置                                                  |

### DIY 脚本
仓库根目录目前有两个 DIY 脚本：`diy-part1.sh` 和 `diy-part2.sh`，它们分别在更新与安装 `feeds` 的前后执行，你可以把对源码修改的指令写到脚本中，比如修改默认 IP、主机名、主题、添加 / 删除软件包等操作。但不仅限于这些操作，发挥你强大的想象力，可做出更强大的功能。

> TIPS: 脚本工作目录在源码目录，内附几个简单的例子供参考。

### 添加额外的软件包
- 在 DIY 脚本中加入对指定软件包源码的远程仓库的克隆指令。就像下面这样：
```shell
git clone https://github.com/P3TERX/xxx package/xxx
```

- 本地`make menuconfig`生成`.config`文件时添加相应的软件包，如果你知道包名可以直接写到`.config`文件中。

> TIPS: 如果额外添加的软件包与 Open­Wrt 源码中已有的软件包同名的情况，则需要把 Open­Wrt 源码中的同名软件包删除，否则会优先编译 Open­Wrt 中的软件包。这同样可以利用到的 DIY 脚本，相关指令应写在`diy-part2.sh`。

原理是把软件包源码放到 package 目录下，编译时会自动遍历，与本地编译是一样的。当然方法不止一种，其它方式请自行探索。

### 自定义 `feeds` 配置文件
把 `feeds.conf.default` 文件放入仓库根目录即可，它会覆盖 Open­Wrt 源码目录下的相关文件。

### Custom files（自定义文件）
俗称 “files 大法”，在仓库根目录下新建 `files` 目录，把相关文件放入即可。有关详情请自行搜索了解。

### 自定义源码
默认引用的是 Lean 的源码，如果你有编译其它源码的需求可以进行替换。

编辑 work­flow 文件（`.github/workflows/build-openwrt.yml`），修改下面的相关环境变量字段。
```yaml
REPO_URL: https://github.com/coolsnowwolf/lede
REPO_BRANCH: master
```

比如修改为 Open­Wrt 官方源码 19.07 分支
```yaml
REPO_URL: https://github.com/openwrt/openwrt
REPO_BRANCH: openwrt-19.07
```

> TIPS: 注意冒号后面有空格

### 源码更新自动编译
在检测到源码更新后自动进行编译。

1. 创建 [Personal access token(PAT)](https://github.com/settings/tokens/new) ，勾选`repo`权限，这将用于自动触发编译工作流程。

2. 然后点击自己仓库的Settings选项卡，再点击Secrets。添加名为ACTIONS_TRIGGER_PAT的加密环境变量，保存刚刚创建的 PAT 。

3. 在 Actions 页面选择Update Checker，点击`Run workflow`手动进行一次测试运行。如果没有报错且 OpenWrt 编译工作流程被触发，则代表测试通过。

4. 最后编辑`Update Checker`的 workflow 文件（`.github/workflows/update-checker.yml`），取消注释（删除#）定时触发相关的部分。这里可以根据 cron 格式来设定检测的时间，时区为 UTC 。
```yaml
#  schedule:
#    - cron: 0 */18 * * *
```
此外还可以根据实际情况对监视的源码仓库进行更改，如果有多个源码仓库需要监视则多复制几份相应的 work­flow 文件。

### 编译多个固件
#### 多 repository 方案
通过 [P3TERX/Actions-OpenWrt](https://github.com/P3TERX/Actions-OpenWrt) 项目创建多个仓库来编译不同架构机型的 Open­Wrt 固件。

#### 多 workflow 方案
基于 GitHub Ac­tions 可同时运行多个工作流程的特性，最多可以同时进行至少 20 个编译任务。也可以单独选择其中一个进行编译，这充分的利用到了 GitHub Ac­tions 为每个账户免费提供的 20 个 Ubuntu 虚拟服务器环境。

假设有三台路由器的固件需要编译，比如 K2P、x86_64 软路由、新路由 3。

- 生成它们的.config文件
- 分别将它们重命名为`k2p.config`、`x64.config`、`d2.config`放入本地仓库根目录。
- 复制多个 workflow 文件（`.github/workflows/build-openwrt.yml`）。为了更好的区分可以对它进行重命名，比如`k2p.yml`、`x64.yml`、`d2.yml`。此外第一行`name`字段也可以进行相应的修改。
- 然后分别用上面修改的文件名替换对应 workflow 文件中下面两个位置的`.config`，不同的机型同样可以使用不同的 DIY 脚本。

```yaml
#...
    paths:
      - '.config'
#...
        CONFIG_FILE: '.config'
        DIY_SH: 'diy.sh'
#...
```

### SSH 连接到 Actions
通过 tmate 连接到 GitHub Ac­tions 虚拟服务器环境，可直接进行 `make menuconfig` 操作生成编译配置，或者任意的客制化操作。也就是说，你不需要再自己搭建编译环境了。这可能改变之前所有使用 GitHub Ac­tions 的编译 Open­Wrt 方式。

1. 在Run Workflow时把`SSH connection to Actions`的值改为true（或者也可以不修改，而是通过 [webhook 方式](https://p3terx.com/archives/github-actions-manual-trigger.html#toc_2)发送带有ssh触发关键词的请求。）
2. 
3. 在触发工作流程后，在 Actions 日志页面等待执行到SSH connection to Actions步骤，会出现类似下面的信息：
```shell
To connect to this session copy-n-paste the following into a terminal or browser:

ssh Y26QeagDtsPXp2mT6me5cnMRd@nyc1.tmate.io
https://tmate.io/t/Y26QeagDtsPXp2mT6me5cnMRd
```

3. 复制 SSH 连接命令粘贴到终端内执行，或者复制链接在浏览器中打开使用网页终端。（网页终端可能会遇到黑屏的情况，按 Ctrl+C 即可）

4. `cd openwrt && make menuconfig`

5. 完成后按Ctrl+D组合键或执行exit命令退出，后续编译工作将自动进行。

> TIPS: 固件目录下有个config.seed或者config.buildinfo文件，如果你需要再次编译可以使用它。

### 上传固件到奶牛快传
[奶牛快传](https://cowtransfer.com/)是中国大陆的一款临时文件传输分享服务网盘，特点是不限速。因国情所致，中国大陆地区 GitHub 访问速度缓慢，有些小伙伴可能无法正常下载固件，上传固件到奶牛快传是个非常好的选择。

1. 编辑 workflow 文件（`.github/workflows/build-openwrt.yml`），将环境变量UPLOAD_COWTRANSFER的值修改为true：
```yaml
UPLOAD_COWTRANSFER: true
```

2. 编译完成后你可以在相关的 workflow 页面或者`Upload firmware to cowtransfer`步骤的日志中找到下载链接。

> CLI 上传工具来自 [Mikubill/transfer](https://github.com/Mikubill/transfer) ，特此感谢。

### 上传固件到 WeTransfer
[WeTransfer](https://wetransfer.com/) 是荷兰的一款临时文件传输分享服务网盘，前面提到的奶牛快传实际上师从自它，二者的网站都非常相似。We­Trans­fer 使用的是 Ama­zon S3 存储并通过 Ama­zon Cloud­Front CDN 全球加速，它在中国大陆的下载体验完全不输奶牛快传，甚至某些情况下要更好。

1. 编辑 workflow 文件（`.github/workflows/build-openwrt.yml`），将环境变量UPLOAD_WERANSFER的值修改为true：
```yaml
UPLOAD_WERANSFER: true
```

2. 编译完成后你可以在相关的 workflow 页面或者`Upload firmware to WeTransfer`步骤的日志中找到下载链接。
CLI 上传工具来自 [Mikubill/transfer](https://github.com/Mikubill/transfer) ，特此感谢。

### 上传固件到 Releases 页面
GitHub 的 Re­leases 页面通常用于发布打包好的二进制文件，无需登录即可下载。Ar­ti­facts 和网盘有保存期限，Re­leases 则是永久保存的。

1. 编辑 work­flow 文件（`.github/workflows/build-openwrt.yml`），将环境变量 UPLOAD_WERANSFER 的值修改为 true：
```shell
UPLOAD_RELEASE: true
```

2. 编译完成后你可以在 re­leases 页面找到下载链接。

> TIPS: 为了不给 GitHub 服务器带来负担，默认保留 3 个历史记录。

### 定时自动编译（已弃用）
> TIPS: 源码更新是不确定的，定时编译经常是在编译没有变动的源码，无意义且浪费资源，所以不建议使用。

1. 编辑 work­flow 文件（`.github/workflows/build-openwrt.yml`）取消注释下面两行。
```yaml
#  schedule:
#    - cron: 0 8 * * 5
```

例子是北京时间每周五下午 4 点（16 时）开始编译（周末下班回家直接下载最新固件开始折腾）。如需自定义则按照 cron 格式修改即可，GitHub Ac­tions 的时区为 UTC ，注意按照自己所在地时区进行转换。

### 点击 star 开始编译（已弃用）
1. 点击自己仓库页面上的 Star 按钮开始编译，为了防止产生垃圾记录，所以这个功能默认没有开启。

编辑 work­flow 文件（`.github/workflows/build-openwrt.yml`）取消注释下面两行，后续点击自己仓库上的 star 即可开始编译。
```yaml
#  watch:
#    types: started
```

> TIPS: 字段started并不是“开始了”的意思，而是“已经点击 Star”。

> 吐槽: 官方并没有提供一个开始按钮，通过搜索找到过很多奇怪的一键触发方式，但都是通过 Web­hook 来实现的。机智的我发现了可以通过点击 Star 来触发，这样就相当于把 Star 当成开始按钮。这个started有种一句双关的意思了。

### macOS 虚拟机编译方案（已弃用）
GitHub Ac­tions 的 ma­cOS 虚拟机性能要高于 Ubuntu 虚拟机，所以使用它编译 Open­Wrt 理论上速度会更快。博主经过几天时间的研究已经总结出了 [macOS 下的 OpenWrt 编译环境的搭建方法](https://p3terx.com/archives/compiling-openwrt-with-macos.html)，并编写出了适用于 ma­cOS 虚拟环境的 Open­Wrt 编译方案的 work­flow 文件。

由于极少有开发者会考虑兼容 ma­cOS 下的规范，所以使用 ma­cOS 编译 Open­Wrt 不可避免的会遇到非常多的问题，甚至 Open­Wrt 官方源码也是。而且后续测试发现 ma­cOS 虚拟机性能已大幅下降，故相关 work­flow 文件已经移除。也不建议任何人使用 ma­cOS 编译 Open­Wrt 。

## 写在最后
博主只是提供基本入门用法和思路，更高阶的玩法还需要小伙伴们自己去发觉。此外希望大家合理使用免费的服务器资源，必要时再编译。让出更多的服务器资源让开发者来充分利用才能产生更多更好的软件，这样大家才能受益。最后感谢 Mi­crosoft 为我们免费提供 GitHub Ac­tions 这样强大的服务。

## 相关推荐
- [深港 IPLC & 洛杉矶/日本/香港 CN2 GIA 高速跨境专线](https://p3terx.com/archives/high-speed-vpn-just-my-socks.html)
- [国外便宜高性价比和免费白嫖 VPS 推荐](https://p3terx.com/archives/cheap-and-costeffective-vps-recommended.html)

本博客已开设 [Telegram 频道](https://t.me/P3TERX_ZONE)，欢迎小伙伴们订阅关注。
