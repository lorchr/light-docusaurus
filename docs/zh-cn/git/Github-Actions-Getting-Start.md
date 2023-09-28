-[GitHub Actions 入门教程](https://p3terx.com/archives/github-actions-started-tutorial.html)

## 前言
Github Ac­tions 是 GitHub 推出的持续集成 (Con­tin­u­ous in­te­gra­tion，简称 CI) 服务，它提供了配置非常不错的虚拟服务器环境，基于它可以进行构建、测试、打包、部署项目。简单来讲就是将软件开发中的一些流程交给云服务器自动化处理，比方说开发者把代码 push 到 GitHub 后它会自动测试、编译、发布。有了持续集成服务开发者就可以专心于写代码，其它乱七八糟的事情就不用管了，这样可以大大提高开发效率。本篇文章将介绍 GitHub Ac­tions 的基本使用方法。

## 申请 Actions 使用权
GitHub Ac­tions 目前（2019 年 11 月 11 日）还处在 Beta 阶段，需要申请才能使用，申请后在仓库主页就可以看到 Actions 按钮了。


## 基础概念
- workflow （工作流程）：持续集成一次运行的过程。
- job （任务）：一个 workflow 由一个或多个 job 构成，含义是一次持续集成的运行，可以完成多个任务。
- step（步骤）：每个 job 由多个 step 构成，一步步完成。
- action （动作）：每个 step 可以依次执行一个或多个命令（action）。

## 虚拟环境
GitHub Ac­tions 为每个任务 (job) 都提供了一个虚拟机来执行，每台虚拟机都有相同的硬件资源：

- 2-core CPU
- 7 GB RAM 内存
- 14 GB SSD 硬盘空间

> 实测硬盘总容量为90G左右，可用空间为30G左右，评测详见：[《GitHub Actions 虚拟服务器环境简单评测》](https://p3terx.com/archives/github-actions-virtual-environment-simple-evaluation.html)
 
## 使用限制：

- 每个仓库只能同时支持20个 workflow 并行。
- 每小时可以调用1000次 GitHub API 。
- 每个 job 最多可以执行6个小时。
- 免费版的用户最大支持20个 job 并发执行，macOS 最大只支持5个。
- 私有仓库每月累计使用时间为2000分钟，超过后$ 0.008/分钟，公共仓库则无限制。

操作系统方面可选择 Win­dows server、Linux、ma­cOS，并预装了大量软件包和工具。

> TIPS： 虽然名称叫持续集成，但当所有任务终止和完成时，虚拟环境内的数据会随之清空，并不会持续。即每个新任务都是一个全新的虚拟环境。

## workflow 文件
GitHub Ac­tions 的配置文件叫做 work­flow 文件（官方中文翻译为 “工作流程文件”），存放在代码仓库的`.github/workflows` 目录中。work­flow 文件采用 YAML 格式，文件名可以任意取，但是后缀名统一为`.yml`，比如 `p3terx.yml`。一个库可以有多个 work­flow 文件，GitHub 只要发现`.github/workflows` 目录里面有.yml 文件，就会按照文件中所指定的触发条件在符合条件时自动运行该文件中的工作流程。在 Ac­tions 页面可以看到很多种语言的 work­flow 文件的模版，可以用于简单的构建与测试。


下面是一个简单的 work­flow 文件示例：
```yaml
name: Hello World
on: push
jobs:
  my_first_job:
    name: My first job
    runs-on: ubuntu-latest
    steps:
    - name: checkout
      uses: actions/checkout@master
    - name: Run a single-line script
      run: echo "Hello World!"
  my_second_job:
    name: My second job
    runs-on: macos-latest
    steps:
    - name: Run a multi-line script
      env:
        MY_VAR: Hello World!
        MY_NAME: P3TERX
      run: |
        echo $MY_VAR
        echo My name is $MY_NAME
```
示例文件运行截图：


## workflow 语法
> TIPS： 参照上面的示例阅读。
### name
name 字段是 work­flow 的名称。若忽略此字段，则默认会设置为 work­flow 文件名。

### on
on 字段指定 work­flow 的触发条件，通常是某些事件，比如示例中的触发事件是 push，即在代码 push 到仓库后被触发。on 字段也可以是事件的数组，多种事件触发，比如在 push 或 pull_request 时触发：
```shell
on: [push, pull_request]
```

完整的事件列表，请查看官方文档。下面是一些比较常见的事件：
- push 指定分支触发
```yaml
on:
  push:
    branches:
      - master
```

- push tag 时触发
```yaml
on:
  push:
    tags:
    - 'v*'
```

- 定时触发
```yaml
schedule:
  - cron: 0 */6 * * *
```

- 发布 re­lease 触发
```yaml
on:
  release:
    types: [published]
```

- 仓库被 star 时触发
```yaml
on:
  watch:
    types: [started]
```

### jobs
jobs 表示要执行的一项或多项任务。每一项任务必须关联一个 ID (job_id)，比如示例中的 my_first_job 和 my_second_job。job_id 里面的 name 字段是任务的名称。job_id 不能有空格，只能使用数字、英文字母和 - 或_符号，而 name 可以随意，若忽略 name 字段，则默认会设置为 job_id。

当有多个任务时，可以指定任务的依赖关系，即运行顺序，否则是同时运行。
```yaml
jobs:
  job1:
  job2:
    needs: job1
  job3:
    needs: [job1, job2]
```

上面代码中，job1 必须先于 job2 完成，而 job3 等待 job1 和 job2 的完成才能运行。因此，这个 work­flow 的运行顺序依次为：job1、job2、job3。

### runs-on
runs-on 字段指定任务运行所需要的虚拟服务器环境，是必填字段，目前可用的虚拟机如下：

> TIPS： 每个任务的虚拟环境都是独立的。
| 虚拟环境               | YAML workflow 标签            |
| ---------------------- | ----------------------------- |
| Windows Server 2019    | windows-latest                |
| Ubuntu 18.04           | ubuntu-latest or ubuntu-18.04 |
| Ubuntu 16.04           | ubuntu-16.04                  |
| macOS X Catalina 10.15 | macos-latest                  |

### steps
steps 字段指定每个任务的运行步骤，可以包含一个或多个步骤。步骤开头使用 - 符号。每个步骤可以指定以下字段:

- name：步骤名称。
- uses：该步骤引用的action或 Docker 镜像。
- run：该步骤运行的 bash 命令。
- env：该步骤所需的环境变量。

其中 uses 和 run 是必填字段，每个步骤只能有其一。同样名称也是可以忽略的。

### action
action 是 GitHub Ac­tions 中的重要组成部分，这点从名称中就可以看出，actions 是 action 的复数形式。它是已经编写好的步骤脚本，存放在 GitHub 仓库中。

对于初学者来说可以直接引用其它开发者已经写好的 action，可以在官方 action 仓库或者 GitHub Marketplace 去获取。此外 Awesome Actions 这个项目收集了很多非常不错的 action。

既然 action 是代码仓库，当然就有版本的概念。引用某个具体版本的 action：
```yaml
steps:
  - uses: actions/setup-node@74bc508 # 指定一个 commit
  - uses: actions/setup-node@v1.2    # 指定一个 tag
  - uses: actions/setup-node@master  # 指定一个分支
```

一般来说 action 的开发者会说明建议使用的版本。

## 实例：编译 OpenWrt
最近一直在研究 Open­Wrt ，那就写个编译 Open­Wrt 的实例吧。

既然是编译 Open­Wrt 那么 work­flow 的名称就叫 Build OpenWrt
```yaml
name: Build OpenWrt
```

触发事件我选择了 push 。
```yaml
on: push
```

我个人常用的 Open­Wrt 编译环境使用的是 Ubuntu 18.04 ，所以任务所使用的虚拟环境也一样。
```yaml
jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
```

我并不确定系统中是否有编译所需要依赖，所以第一个步骤是安装依赖软件包。

```yaml
- name: Installation depends
  run: |
    sudo apt-get update
    sudo apt-get -y install build-essential asciidoc binutils bzip2 gawk gettext git libncurses5-dev libz-dev patch unzip zlib1g-dev lib32gcc1 libc6-dev-i386 subversion flex uglifyjs git-core gcc-multilib p7zip p7zip-full msmtp libssl-dev texinfo libglib2.0-dev xmlto qemu-utils upx libelf-dev autoconf automake libtool autopoint
```

由于我使用的是一个空仓库，所以第二个步骤使用 Git 去拉取 Open­Wrt 官方源码。

```yaml
- name: Clone source code
  run: |
    git clone https://github.com/openwrt/openwrt
```

> TIPS： 如果是有源码的仓库，可以引用 [actions/checkout](https://github.com/actions/checkout) 这个官方 ac­tion 把源码签出到工作目录中。工作目录也就是在 Ac­tions 中执行命令的根目录，其绝对路径为/home/runner/work/REPO_NAME/REPO_NAME，环境变量为$GITHUB_WORKSPACE。
然后还需要拉取 feeds ，它是扩展软件包源码，所以需要单独拉取。既然都是拉取源码，所以就都放在一起吧。

```yaml
- name: Clone source code
  run: |
    git clone https://github.com/openwrt/openwrt
    cd openwrt
    ./scripts/feeds update -a
    ./scripts/feeds install -a
```

由于这只是尝试，所以第三个步骤就让它生成一个默认的配置文件。由于每个步骤都会回退到工作目录，所以前面还需要加一条进入 buildroot 的命令。
```yaml
- name: Generate config file
  run: |
    cd openwrt
    make defconfig
```

第四个步骤是下载第三方软件包（俗称 dl 库），最后为了防止下载不完整导致编译失败，加了显示不完整文件和删除不完整文件的命令。
```yaml
- name: Download package
  run: |
    cd openwrt && make download -j8
    find dl -size -1024c -exec ls -l {} \;
    find dl -size -1024c -exec rm -f {} \;
```

第五个步骤进入到最重要的开始编译环节，同样是先进入 buildroot，为了能更快的编译，我自信的选择了多线程编译且不显示详细日志。
```yaml
- name: Build
  run: |
    cd openwrt
    make -j$(nproc)
```

最后编译出的二进制文件如何取出来呢？官方有个 ac­tion 叫 upload-artifact ，它可以将虚拟环境中的指定文件打包上传到 Ac­tions 页面。为了方便我选择了上传整个 bin 目录，文件名为 OpenWrt。
```yaml
- name : Upload artifact
  uses: actions/upload-artifact@master
  with:
    name: OpenWrt
    path: openwrt/bin
```

最后展示一下完整 work­flow 文件：
```yaml
name: Build OpenWrt
on: push
jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
    - name: Installation depends
      run: |
        sudo apt-get update
        sudo apt-get -y install build-essential asciidoc binutils bzip2 gawk gettext git libncurses5-dev libz-dev patch unzip zlib1g-dev lib32gcc1 libc6-dev-i386 subversion flex uglifyjs git-core gcc-multilib p7zip p7zip-full msmtp libssl-dev texinfo libglib2.0-dev xmlto qemu-utils upx libelf-dev autoconf automake libtool autopoint
    - name: Clone source code
      run: |
        git clone https://github.com/openwrt/openwrt
        cd openwrt
        ./scripts/feeds update -a
        ./scripts/feeds install -a
    - name: Generate config file
      run: |
        cd openwrt
        make defconfig
    - name: Download package
      run: |
        cd openwrt && make download -j8
        find dl -size -1024c -exec ls -l {} \;
        find dl -size -1024c -exec rm -f {} \;
    - name: Build
      run: |
        cd openwrt
        make -j$(nproc)
    - name : Upload artifact
      uses: actions/upload-artifact@master
      with:
        name: OpenWrt
        path: openwrt/bin
```

最后 push 到仓库运行。竟然一次成功，话说编译速度是真的快，而且二进制文件也已经上传了，非常完美。

## 邮件通知
在使用 GitHub Ac­tions 的过程中，每次工作流程运行失败都会给我发送通知邮件，这是个很贴心的功能。但工作流程运行成功就不那么贴心了，也许官方考虑到邮件过多会打扰到用户，所以默认只发送失败的邮件，毕竟多数情况下工作流程都是正常运行的。如果需要运行成功的通知邮件，可以手动去开启这个功能。

### 设置步骤
- 在 GitHub 任意页面点击右上角自己的头像
- 然后单击`Settings`（设置）
- 在用户设置侧边栏中，点击`Notifications`（通知）
- 取消勾选`Send notifications for failed workflows only`（仅在工作流程失败时通知）

## 尾巴
自从 GitHub 被微软收购后，从之前的免费私有仓库到现在的 Ac­tions 这样的免费持续集成服务无不彰显出有钱真的可以为所欲为。期待微软把开源世界带向一个新的高度。

本博客已开设 [Telegram 频道](https://t.me/P3TERX_ZONE)，欢迎小伙伴们订阅关注。

## 参考资料
[GitHub Actions 入门教程 - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)
