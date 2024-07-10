- [Linux远程开发](https://www.bilibili.com/video/BV1h94y1k7Jf)
- [如何设置IDEA远程连接服务器开发环境并结合cpolar实现ssh远程开发(最新推荐)](https://www.jb51.net/program/318498ivd.htm)
- [IntelliJ IDEA 远程调试：使用 IDEA Remote Debug 进行高效调试的指南](https://developer.baidu.com/article/details/2785948)
## 要求
- 服务机 Linux 系统
- 开发机 Windows 11 系统
- 服务机开启 SSH 服务

## 服务机环境准备

### 1. 安装Linux系统

测试使用 [`Virtual Box`](https://www.virtualbox.org/wiki/Downloads) 安装 [`CentOS 7.8`](http://isoredirect.centos.org/centos/7/isos/x86_64/) 虚拟机作为服务机


### 2. 配置网络

配置虚拟机网络(Host-Only网络)

```shell
# 1. 编辑网卡配置文件
sudo vi /etc/sysconfig/network-scripts/ifcfg-enp0s3

# 修改以下配置项
DEVICE=enp0s3
BOOTPROTO=static
ONBOOT=yes
IPADDR=192.168.137.123
NETMASK=255.255.255.0
GATEWAY=192.168.137.1
DNS1=8.8.8.8
DNS2=8.8.4.4
DNS3=114.114.114.114

# 2. 重启网络服务
sudo systemctl restart network

# 3. 检查ip
ip addr

# 4. 查看路由表
ip route show
# 添加路由表 sudo ip route add default via <gateway-ip>
# 删除路由表 sudo ip route del <destination-network>

# 5. 查看DNS
cat /etc/resolv.conf

# 6. 测试 Ping 宿主机
ping -c4 192.168.56.1   # ping宿主机需要关闭宿主机的防火墙

# 7. 测试 Ping 公网
ping -c4 jd.com         # 添加默认路由 sudo ip route add default via 192.168.56.1

```

如果是连接家里的服务器，可以使用 内网穿透 ([cpolar](https://www.cpolar.com/), [nps](https://github.com/ehang-io/nps), [ngrok](https://ngrok.com/), [frp](https://github.com/fatedier/frp)) 或者 异地组网([ZeroTier](https://my.zerotier.com/network), [Tailscale](https://tailscale.com/kb/1017/install), [Cloudflare Tunnel](https://one.dash.cloudflare.com/cd6e8b10038eef80310dac6ae9bf526c/networks/tunnels)) 等技术实现远程连接

### 3. 更换国内软件源

```shell
# 1. 备份当前的 CentOS-Base.repo
sudo mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
 
# 2. 下载新的 CentOS-Base.repo 到 /etc/yum.repos.d/
# 这里以阿里云源为例
sudo curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
 
# 3. 清除缓存
sudo yum clean all
 
# 4. 生成新的缓存
sudo yum makecache
 
# 5. 更新系统（可选）
sudo yum update

```

### 4. 安装SSH服务
因为开发机和服务机需要使用 [SSH](https://www.openssh.com/) 保持连接，为了安全考虑，需要修改 SSH 默认端口，并安装一个[SSH蜜罐](https://github.com/search?q=SSH+Honeypot&type=repositories&s=stars&o=desc)

#### 安装 OpenSSH

```shell
# 1. 安装 Vim wget unzip 等工具
sudo yum install -y vim wget unzip

# 2. 安装 SSH 服务
sudo yum install -y openssh

# 3. 查看 SSH 服务状态
sudo systemctl status sshd

# 4. 修改 SSH 端口，改 Port=22 为 2233
sudo vim /etc/ssh/sshd_config

# 5. 添加防火墙规则，允许新端口的流量
sudo firewall-cmd --permanent --add-port=2233/tcp
sudo firewall-cmd --reload

# 6. 重启 SSH 服务
sudo systemctl restart sshd

# 7. 重启 SSH 服务会报错，解决报错 Bind to port 2233 on 0.0.0.0 failed: Permission denied
# 方案一：关闭SELINUX
# 方案二：修改SELINUX 中的 SSH 端口
```

方案一：关闭SELINUX

```shell
# 关闭 SELINUX 将 SELINUX=enforcing 改为 SELINUX=disable
sudo vim /etc/selinux/config
reboot
```

方案二：修改SELINUX 中的 SSH 端口

```shell
# 1、安装修改工具
sudo yum install -y policycoreutils-python

# 2、查看 selinux 中的 SSH 端口（输出默认的端口 22）
sudo semanage port -l | grep ssh

# 3、新增目标端口
sudo semanage port -a -t ssh_port_t -p tcp 2233

# 4、重启 SSH 服务
sudo service sshd restart
```

### 配置 Telnet 端口

```shell
# 1. 修改 Telnet 端口 将 port 从 23 改为 3322
sudo vi /etc/xinetd.d/telnet

# 2. 添加防火墙规则，允许新端口的流量
sudo firewall-cmd --permanent --add-port=3322/tcp
sudo firewall-cmd --reload

# 3. 重启 Telnet 服务来应用更改
sudo systemctl restart xinetd

# 4. 确认 Telnet 服务已经在新端口上运行：
sudo netstat -tulnp | grep :3322

# 5. 关闭 Telnet 服务，Telnet不安全，不建议使用
sudo systemctl stop xinetd

```

#### 安装 SSH Honeypot

可以再安装一个 SSH 蜜罐程序，保存被攻击的记录，此处选择 [Cowrie](https://github.com/cowrie/cowrie)

```shell
# 创建挂载目录
mkdir -p /home/light/cowrie/{conf,data,logs}

# 获取默认配置文件 https://github.com/cowrie/cowrie/blob/master/etc/cowrie.cfg.dist
# curl https://raw.githubusercontent.com/cowrie/cowrie/master/etc/cowrie.cfg.dist -o D:/docker/cowrie/conf/cowrie.cfg
docker run -d  --env COWRIE_TELNET_ENABLED=yes --name cowrie_temp cowrie/cowrie:latest \
    && docker cp cowrie_temp:/cowrie/cowrie-git/etc /home/light/cowrie/conf/ \
    && docker cp cowrie_temp:/cowrie/cowrie-git/var/lib/cowrie/downloads /home/light/cowrie/data \
    && docker cp cowrie_temp:/cowrie/cowrie-git/var/log/cowrie /home/light/cowrie/logs \
    && docker stop cowrie_temp && docker rm cowrie_temp

# 复制生成默认的配置文件，需要修改 telnet.enable=true
cp /home/light/cowrie/conf/etc/cowrie.cfg.dist /home/light/cowrie/conf/etc/cowrie.cfg

# 运行镜像
docker run -d \
    --publish 22:2222 \
    --publish 23:2223 \
    --volume /home/light/cowrie/conf/etc:/cowrie/cowrie-git/etc \
    --volume /home/light/cowrie/data/downloads:/cowrie/cowrie-git/var/lib/cowrie/downloads \
    --volume /home/light/cowrie/logs/cowrie:/cowrie/cowrie-git/var/log/cowrie \
    --env COWRIE_TELNET_ENABLED=yes \
    --net dev \
    --restart=always \
    --name cowrie \
    cowrie/cowrie:latest

# 测试 SSH 及 Telnet 登录
ssh -p 2222 root@172.18.0.2

telnet 172.18.0.2 2223

```

### 5. 配置Java开发环境

Java的开发需要 [JDK](https://jdk.java.net/archive/) 和 [Maven](https://maven.apache.org/download.cgi) ([Gradle](https://gradle.org/install/)) 等，可以从官网下载安装包或源码包，也可以直接使用命令行安装

#### 安装 OpenJDK-21

```shell
# 1. 下载 Openjdk 21 的tar.gz包
wget https://download.java.net/openjdk/jdk21/ri/openjdk-21+35_linux-x64_bin.tar.gz

# 2. 解压 Openjdk 包到 /usr/local/openjdk-21
sudo tar -xvzf openjdk-21+35_linux-x64_bin.tar.gz -C /usr/local
sudo mv /usr/local/jdk-21 /usr/local/openjdk-21

# 3. 设置环境变量。全局 /etc/profile 个人 ~/.bash_profile
sudo cat >> /etc/profile << 'EOF'

# Java Enviroment
JAVA_HOME=/usr/local/openjdk-21
JRE_HOME=/usr/local/openjdk-21
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib:$CLASSPATH
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME JRE_HOME CLASSPATH PATH
EOF

# 4. 让更改生效。
source /etc/profile

# 5. 验证安装 -v -version --version
java -version

```

#### 安装 Maven-3.9.7

```shell
# 1. 下载 Maven 3.9.7 的tar.gz包
wget https://apache.osuosl.org/maven/maven-3/3.9.7/binaries/apache-maven-3.9.7-bin.tar.gz

# 2. 解压 Maven 包到 /usr/local/maven-3.9.7
sudo tar -xvzf apache-maven-3.9.7-bin.tar.gz -C /usr/local
sudo mv /usr/local/apache-maven-3.9.7 /usr/local/maven-3.9.7

# 3. 设置环境变量。全局 /etc/profile 个人 ~/.bash_profile
sudo cat >> /etc/profile << 'EOF'

# Maven Enviroment
MVN_HOME=/usr/local/maven-3.9.7
PATH=$MVN_HOME/bin:$PATH
export MVN_HOME PATH
EOF

# 4. 让更改生效。
source /etc/profile

# 5. 验证安装 -v -version --version
mvn -version

```

#### 安装 Gradle-8.7

```shell
# 1. 下载 Gradle 8.7 的tar.gz包
wget https://downloads.gradle.org/distributions/gradle-8.7-bin.zip

# 2. 解压 Gradle 包到 /usr/local/gradle-8.7
sudo unzip gradle-8.7-bin.zip -d /usr/local
sudo mv /usr/local/gradle-8.7 /usr/local/gradle-8.7

# 3. 设置环境变量。全局 /etc/profile 个人 ~/.bash_profile
sudo cat >> /etc/profile << 'EOF'

# Gradle Enviroment
GRADLE_HOME=/usr/local/gradle-8.7
PATH=$GRADLE_HOME/bin:$PATH
export GRADLE_HOME PATH
EOF

# 4. 让更改生效。
source /etc/profile

# 5. 验证安装 -v -version --version
gradle -version

```

### 6. 配置前端开发环境
#### 安装 NodeJS-18.18.0

```shell
# 1. 下载 Node 18.18.0 的tar.gz包
wget https://nodejs.org/dist/v18.18.0/node-v18.18.0-linux-x64.tar.gz

# 2. 解压 Node 包到 /usr/local/nodejs-18.18
sudo tar -zxvf node-v18.18.0-linux-x64.tar.gz -C /usr/local/
sudo mv /usr/local/node-v18.18.0-linux-x64 /usr/local/nodejs-18.18

# 3. 设置环境变量。全局 /etc/profile 个人 ~/.bash_profile
sudo cat >> /etc/profile << 'EOF'

# Node Enviroment
NODE_HOME=/usr/local/nodejs-18.18
PATH=$NODE_HOME/bin:$PATH
export NODE_HOME PATH
EOF

# 4. 让更改生效。
source /etc/profile

# 5. 验证安装 -v -version --version
node -version

# 6. 执行报错 gcc 和 glibc 版本与 Node不匹配，需要升级 gcc glibc 或者降低 NodeJS 版本
# node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
# node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)
# node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
# node: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
# node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
# node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
```

升级 gcc glibc 解决版本不匹配问题
```shell
# 下载 glibc 2.28
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz

# 解压
tar -zxvf glibc-2.28.tar.gz

# 进入目录
cd glibc-2.28

# 创建build目录
mkdir build && cd build

# 配置编译参数
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin

# 编译并安装
make && make install

```

升级 gcc glibc 解决版本不匹配问题
```shell
# 查看glibc版本号
ldd --version

# 1、升级 gcc 4.8.5
cd ~
yum install -y centos-release-scl
yum install -y devtoolset-8-gcc*
mv /usr/bin/gcc /usr/bin/gcc-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/gcc /usr/bin/gcc
mv /usr/bin/g++ /usr/bin/g++-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/g++ /usr/bin/g++

# 配置编译glibc环境（configure）时报错complier，可能还需要执行
scl enable devtoolset-8 bash
echo "source /opt/rh/devtoolset-8/enable" >> /etc/profile

# 2、升级 make 4.3
cd ~
wget http://ftp.gnu.org/gnu/make/make-4.3.tar.gz
tar -xzvf make-4.3.tar.gz
cd make-4.3/
./configure  --prefix=/usr/local/make
make && make install
cd /usr/bin/ && mv make make.bak
ln -sv /usr/local/make/bin/make /usr/bin/make

# 3、升级 libstdc++ 6.0.26
yum whatprovides libstdc++.so.6  # 查询可用的 libstdc++.so.6
yum update -y libstdc++.x86_64   # 安装 libstdc++.so.6
cd ~
wget http://www.vuln.cn/wp-content/uploads/2019/08/libstdc.so_.6.0.26.zip
unzip libstdc.so_.6.0.26.zip
cp libstdc++.so.6.0.26 /lib64/
cd /lib64
# 把原来的命令做备份
cp libstdc++.so.6 libstdc++.so.6.bak
rm -f libstdc++.so.6
# 重新链接
ln -s libstdc++.so.6.0.26 libstdc++.so.6

# 4、升级 glibc 2.28
cd ~
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz
tar xf glibc-2.28.tar.gz
cd glibc-2.28/
mkdir build && cd ./build
# 配置环境
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
# 如果配置报错GNU ld，需要安装binutils
yum install binutils
# 如果配置报错bison，需要安装bison
yum install bison
# 安装后再重新执行../configure
# 编译安装glibc
make              # 注意这个耗时较长，至少需要几分钟服务器性能差可能更长
make install      # 注意这个耗时较长，但比上一个短一些

参考：

https://zhuanlan.zhihu.com/p/649296127
https://juejin.cn/post/7136534098226446373
```

## 6. 工作空间准备

```shell
# 创建工作空间文件夹
mkdir -p /home/light/workspace/

# 创建项目文件夹
mkdir -p /home/light/workspace/{remote-demo-idea,remote-demo-vscode}

```

## 开发机操作流程
- Java 开发 IDE [JetBrains IDEA](https://www.jetbrains.com/idea/) 
- 远程开发文档 [JetBrains IDEA Remote Development](https://www.jetbrains.com/idea/features/#remote-development-and-collaboration) 
- 远程开发文档 [JetBrains Remote Development](https://www.jetbrains.com/remote-development/)
- 本地轻量级IDE客户端 [JetBrains Gateway](https://www.jetbrains.com/remote-development/gateway/) [Download](https://www.jetbrains.com/help/idea/jetbrains-gateway.html#manual_launch)
- [Connect to a remote server and open the remote project](https://www.jetbrains.com/help/idea/remote-development-starting-page.html#connect_to_rd_ij)

1. 打开IDEA，在初始页面选择 `Remote Development`
2. 选择 SSH，点击 `New Porject`
3. 输入Linux系统的 `Username` 和 `Host`, `Port` 信息，点击`Check Connection and Continue`
4. 在弹窗中输入 `Password`， 点击 `Authenticate`
5. 填写项目路径 `/home/light/workspace/remote-demo-idea`，点击 `Download IDE and Connect`
6. `IDE Version`默认[Use JetBrains installer](https://www.jetbrains.com/remote-development/)需要等待很长一段时间，可以在点击 `installation options`，选择本地下载好的`IDE Backend`上传 `Upload installer file`
7. 下载完成后，需要激活IDEA才能打开项目，使用[zhile大佬](https://zhile.io/)的[破解插件](https://zhile.io/2021/11/29/ja-netfilter-javaagent-lib.html)配合[热心大佬](https://jetbra.in/s)的激活码进行激活

```shell
# 直接下载到Linux，异常重试时会被删除
curl -fSL --output /home/light/.cache/JetBrains/RemoteDev/dist/332909ee10e7e_ideaIU-233.14475.9.tar.gz https://download.jetbrains.com/idea/ideaIU-233.14475.9.tar.gz

# JetBrains Backend，建议本地下载后上传
curl -fSL https://download.jetbrains.com/idea/ideaIU-233.14475.9.tar.gz --output ./ideaIU-233.14475.9.tar.gz

# JetBrains Gateway 轻量级的IDE客户端
curl -fSL https://data.services.jetbrains.com/products/download?code=GW&platform=windows&type=release ./JetBrainsGateway-2024.1.2.exe

```

## 远程调试
### 一、远程调试概述
远程调试是一种在本地 IDEA 中连接到运行在远程服务器上的应用程序并进行实时调试的技术。通过远程调试，您可以在本地 IDEA 中查看和修改变量的值、单步执行代码、设置断点等，从而方便地对远程应用程序进行调试。

### 二、配置远程调试环境

1. 在远程服务器上启动应用程序并附加调试器

在远程服务器上启动应用程序时，需要附加调试器。这可以通过在启动应用程序时添加一些参数来完成，例如在 Java 中可以使用以下参数来附加调试器：
`java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar app.jar`

上述参数中，
- `-agentlib:jdwp` 是附加调试器的参数，
- `transport=dt_socket` 表示使用套接字进行通信，
- `server=y` 表示启动为服务器模式，
- `suspend=n` 表示不暂停程序执行，
- `address=*:5005` 表示监听 `5005` 端口。您可以根据实际情况修改这些参数。

2. 在本地 IDEA 中配置远程调试

在本地 IDEA 中配置远程调试相对简单。首先，您需要创建一个新的运行/调试配置，选择远程调试配置。然后，在配置页面中填写远程服务器的相关信息，包括主机名或 IP 地址、端口号、调试协议等。最后，保存配置并开始远程调试。

### 三、使用远程调试进行高效调试

1. 查看和修改变量的值

    在远程调试过程中，您可以使用 IDEA 的变量查看窗口查看当前作用域内的变量值。如果您需要修改变量的值，可以直接在变量查看窗口中进行修改。这对于排查程序中的问题非常有用。

2. 单步执行代码

    在远程调试过程中，您可以使用 IDEA 的单步执行功能逐步跟踪代码的执行过程。通过单步执行代码，您可以观察代码的执行逻辑和流程，从而更好地理解代码的行为。

3. 设置断点

    断点是远程调试中的重要工具之一。通过在代码中设置断点，您可以暂停程序的执行并在特定位置进行调试。这有助于您定位和解决程序中的问题。您可以在 IDEA 中轻松地设置断点，并在需要时暂停程序的执行。

4. 堆栈跟踪和线程管理

    在远程调试过程中，您可以使用 IDEA 的堆栈跟踪和线程管理功能来查看当前线程的调用堆栈和线程状态。这对于排查多线程程序中的问题非常有用。通过查看堆栈跟踪和线程状态，您可以更好地理解程序的执行流程和并发行为。

5. 总结：

    通过使用 `IDEA Remote Debug` 进行高效调试，您可以方便地对运行在远程服务器上的应用程序进行实时调试。通过配置远程调试环境和使用 IDEA 的强大调试功能，您可以轻松地定位和解决程序中的问题。如果您需要进行分布式系统或微服务的调试，`IDEA Remote Debug` 将是一个非常有用的工具。
