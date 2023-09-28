- [Offical](https://www.home-assistant.io)
- [Offical Raspberry Pi](https://www.home-assistant.io/installation/raspberrypi)
- [Offical Linux](https://www.home-assistant.io/installation/#linux)
- [旧手机搭建Home Assistant（基于Linux Deploy）](https://www.bilibili.com/read/cv17279212)

## 1. 安装HA Core
### 1. 准备工作
1. 在 `/etc` 目录下创建 `pip.conf` 文件，使用国内源

```conf
[global]
timeout=100
index-url=https://mirrors.aliyun.com/pypi/simple/
extra-index-url=https://www.piwheels.org/simple
[install]
trusted-host=
    pypi.mirrors.ustc.edu.cn
    mirrors.aliyun.com
```

2. 非默认用户ping不通外网的问题

```shell
# 安装工具包
apt install vim wget net-tools

# 修改DNS 添加 nameserver 8.8.8.8
vim /etc/resolv.conf 

# 如果添加DNS后还是ping不通外网继续下面操作

# 查看路由中的网关设置
netstat -rn 

# 添加路由网关（临时）
route add default gw 192.168.0.1

# 静态路由加到 /etc/sysconfig/static-routes 文件中（永久）
route add default gw 192.168.0.1
any net default gw 192.168.0.1

# 编辑网卡
vim /etc/network/interfaces

# 重启网卡
service network restart
```

修改无效后续直接用Root用户操作

3. 安装 [SQLite](https://www.sqlite.org/download.html) 

```shell
wget https://www.sqlite.org/2023/sqlite-autoconf-3420000.tar.gz
tar -zxvf sqlite-autoconf-3420000.tar.gz
cd sqlite-autoconf-3420000
./configure
make && make install

sqlite3 --version
```

4. 安装 [Python 3.10](https://www.python.org/downloads/source/) 
HA安装对Python的版本有要求，当前版本要求 >= 3.10

```shell
# 安装依赖
sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev wget

# openssl版本需要在1.1.1以上
openssl version

# 创建安装目录
# 在配置文件时通过--prefix指定安装路径
mkdir /usr/local/python3.10

# 下载安装包
cd /tmp
wget https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tgz
tar -xvf Python-3.10.0.tgz

# 执行配置文件 
cd /tmp/Python-3.10.0
./configure --prefix=/usr/local/python3.10
#根据提示执行如下代码对python解释器进行优化
#执行后无序额外配置可直接使用python3调用python编辑器
./configure --enable-optimizations

# 另一种配置
LD_RUN_PATH=/usr/local/lib ./configure LDFLAGS="-L/usr/local/lib" CPPFLAGS="-I/usr/local/include"
LD_RUN_PATH=/usr/local/lib make
sudo make install

# 编译 安装Python
make && make install

# 查看版本
python3 --version
pip3 --version

#升级pip版本
pip3 install --upgrade pip
```

查看python使用的sqlite版本

```shell
python3
>>> import sqlite3
>>> sqlite3.sqlite_version
'3.42.0'
>>> quit()
```


### 2. 安装依赖 

```shell
# 切换root用户
su -

# 更新软件源
apt update

# 升级软件包
apt upgrade -y

# 安装依赖
apt install -y python3 python3-dev python3-venv python3-pip bluez libffi-dev libssl-dev libjpeg-dev zlib1g-dev autoconf build-essential libopenjp2-7 libtiff5 libturbojpeg0-dev tzdata ffmpeg liblapack3 liblapack-dev libatlas-base-dev

# 版本不对需要卸载
apt remove -y python3 python3-dev python3-venv python3-pip
```

### 3. 创建 `homeassistant` 用户

```shell
useradd -rm homeassistant
```

### 4. 创建虚拟运行环境
1. 创建安装目录及更改授权

```shell
# 创建目录
mkdir /srv/homeassistant

# 修改目录授权到 homeassistant 用户
chown homeassistant:homeassistant /srv/homeassistant
```

2. 创建并转到 HA Core的虚拟环境

```shell
# 切换到 homeassistant 用户
sudo -u homeassistant -H -s

# 进入安装目录
cd /srv/homeassistant

# 初始化虚拟环境
python3 -m venv .

# 激活环境
source bin/activate
```
**注：** 后续操作失败可以直接用root用户

### 5. 安装HA Core
1. 安装Python依赖

```shell
# 升级pip版本，并改成国内源加快下载速度
python3 -m pip install --upgrade pip
pip3 config set global.index-url https://mirrors.aliyun.com/pypi/simple/

# 更新setuptools和wheel的版本
python3 -m pip install --upgrade setuptools
python3 -m pip install --upgrade wheel
```

2. 安装 HA Core

```shell
pip3 install homeassistant==2023.7.3
```

### 6. 启动 HA
1. 运行

```shell
hass
```

2. 访问[控制台](http://192.168.0.101:8123) 

3. 其他命令

```shell
# 后台运行hass
nohup hass > hass.log 2>&1 &

# tail查看日志
tail hass.log

# 以后ssh连接后可以直接执行以下命令激活虚拟环境
source /srv/homeassistant/bin/activate

# 退出虚拟环境
deactivate
```

## 2. 安装遇到的问题
1. 非默认用户Ping不通外网
   1. https://blog.csdn.net/qq_48901063/article/details/129559593
   2. 使用root或默认用户安装

2. Python版本过低 
   1. 手动编译安装新版

3. home-assistant安装失败 error: can't find Rust compiler
   1. 安装Rust
   ```shell
   apt install -y curl
   # 安装
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   # 配置环境变量
   vim /etc/profile 
   ~/.cargo/bin
   source /etc/profile
   # 查看版本
   rustc --version
   # 卸载
   rustup self uninstall

   https://static.rust-lang.org/rustup/dist/armv7-linux-android-gnueabihf/rustup-init
   ```