
[rpm包及其全依赖的下载和离线安装](https://www.cnblogs.com/zw-loser/p/17251908.html)

描述：Linux服务器上部署项目的时候，需要安装一些依赖才能满足项目的启动条件，但是在某些情况下，离线环境的服务器没有依赖，又需要运行项目，这时候安装依赖就比较麻烦。记录一下怎么下载好依赖，上传到服务器上安装。

## 一、手动下载
直接去网站上下载rpm包及其依赖。

通常的[阿里](https://mirrors.aliyun.com/centos/)他们都有软件仓库都可以从网页上去下载，依赖自己查找之后去下载就行。

还可以去rpmforge等国外仓库的网页版本下载。

还可以去[pkgs](https://pkgs.org/download/unzip)这种网站去查找包的信息和下载，这些网站也会给出包依赖。


rpm包的依赖，你可以直接去yum查找，或者在有网络的及其上安装可以看得到提示。

### 1.1 查看提供某个命令/value的rpm包
```shell
yum provides [value]
```


### 1.2 查看rpm包所需的全部依赖
```shell
yum deplist unzip-6.0-24.el7_9.x86_64
```


## 二、使用yum带的工具在软件源下载
其实yum带的有工具来做这个，这里我们先假定在一台可以联网的机器上已经配置好了yum源，现在以unzip为例来操作。

### 2.1 使用yum 的 downloadonly 插件
```shell
# 安装插件
$ yum -y install yum-download

# 下载 unzip 及其依赖包
$ yum -y install unzip --downloadonly --downloaddir=/opt/module/package01
```

说明：如果该服务器已经安装了需要下载的软件包，那么使用 install下载就不行，可以使用reinstall下载。 放心（不会真的安装和重新安装，因为后面加了 `--downloadonly`，表明只是下载。

```shell
yum -y reinstall unzip --downloadonly --downloaddir=/opt/module/package01
```

### 2.2 使用yumdownloader ，这也是yum套件里面的
```shell
# 安装yum-utils
$ yum -y install yum-utils

# 下载 vlc 及其依赖包
$ yumdownloader --resolve --destdir=/opt/module/package02 unzip
```

需要注意的是，以上这俩都仅会将主软件包和基于你现在的操作系统所缺少的依赖关系包一并下载。正常情况下，这俩会自动下载最新版的，如果是特定版本的，可能要加上版本号。

虽然离线环境的操作系统和你一样，但是基础依赖还有点差别，可能要多一些依赖包，以上这俩只是基于你现在的环境来找缺少的依赖，如果要全量下载依赖呢？可以使用下面这个操作。

### 2.3 使用repotrack
```shell
# 安装yum-utils
$ yum -y install yum-utils

# 下载 unzip 和全量依赖包
$ repotrack -p /opt/module/package03 unzip
```

## 三、本地安装

```shell
#使用rpm命令安装（搞清楚依赖顺序）
rpm -ivh ./xxx.rpm

#使用yum安装（如果源里面有依赖可以帮你直接装了）
yum install ./xxx.rpm
```

## 四、卸载

在使用 yum 安装的本地 RPM 包之后，如果你想要卸载这个包，可以使用以下几种方法之一：

### 方法1：使用 yum remove

如果你知道安装的包的确切名称，可以直接使用 yum remove 命令来卸载它。例如，如果安装的包名为 example-package-1.0-1.x86_64，你可以这样操作：
```shell
sudo yum remove example-package
```

### 方法2：使用 rpm -e

如果你不确定包的完整名称，或者想要更直接地操作，可以先使用 rpm 命令列出已安装的包，然后使用 rpm -e 来卸载。例如：

查找包名：
```shell
rpm -qa | grep example-package
```

这将列出所有包含“example-package”的已安装包。

卸载包：
```shell
sudo rpm -e example-package-1.0-1.x86_64
```

替换为实际的包名。

### 方法3：使用 yum history 和 yum downgrade 或 yum reinstall

如果你不确定如何卸载，可以先查看通过 yum 进行的所有操作历史：
```shell
yum history
```

然后，你可以根据历史记录中的事务ID来重新安装或降级包，或者直接卸载它。例如，如果事务ID是23，你可以这样操作：

重新安装（如果需要）：
```shell
sudo yum reinstall @history-id=23
```

降级（如果需要）：
```shell
sudo yum downgrade @history-id=23
```

卸载：
```shell
sudo yum remove @history-id=23
```

注意：直接使用 `yum remove @history-id=23` 可能不工作，因为 `yum remove` 不支持通过事务ID直接删除。这种情况下，你需要先找到具体是哪个包被安装，然后使用包名来卸载。

### 方法4：查看 `/var/log/dnf.rpm.log` 或 `/var/log/yum.log`（取决于你的系统使用的是 YUM 还是 DNF）

这些日志文件可能包含有关安装操作的详细信息，帮助你找到需要卸载的包的名称。你可以使用如下命令查看这些日志：
```shell
less /var/log/dnf.rpm.log  # 如果你的系统使用 DNF (Fedora 22 及以后版本)
less /var/log/yum.log      # 如果你的系统使用 YUM (Fedora 21 及以前版本)
```

通过上述方法之一，你应该能够成功卸载通过 yum 安装的本地 RPM 包。

## 参考资料

- https://www.bilibili.com/read/cv21711087
- https://www.cnblogs.com/sunbines/p/16965202.html
