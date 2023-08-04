
## 1. WSL 切换软件安装源

[切换apt源](https://www.cnblogs.com/hgzero/p/13187748.html)

```shell
# 备份源
sudo cp /etc/apt/sources.list{,.bak}
# 修改源
sudo vim /etc/apt/sources.list

# 清华源
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main restricted universe multiverse

# 阿里源
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse

# 刷新源
sudo apt update && sudo apt upgrade
```

## 2. 开启ssh

[开启ssh](https://blog.csdn.net/weixin_28676983/article/details/112175722)

```shell
cd /etc/ssh              
sudo ssh-keygen -A
sudo /etc/init.d/ssh start  

# 1. 启动ssh server，如果出错或报没有此命令，则需安装SSH server，参考安装SSH。
sudo service ssh start
sudo service ssh status
# 2.先更新系统包
sudo apt update && sudo apt upgrade
# 3.安装SSH服务
sudo apt remove openssh-server && sudo apt install openssh-server
# 4.修改配置文件
sudo vim /etc/ssh/sshd_config
  # Port: 22                   把前面的#注释去掉，紧接的几行也可以去掉#
  # PasswordAuthentication yes 把no改为yes
```

## 3. 安装Docker

[安装Docker](https://docs.docker.com/engine/install/ubuntu/)
[非root用户使用docker](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)

```shell
# Set up the repository
$ sudo apt-get update
$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker’s official GPG key:
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# set up the stable repository
$ echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io
# To install a specific version of Docker Engine
$ apt-cache madison docker-ce
$ sudo apt-get install docker-ce=5:20.10.8~3-0~ubuntu-focal docker-ce-cli=5:20.10.8~3-0~ubuntu-focal containerd.io


# Manage Docker as a non-root user
sudo groupadd docker
sudo usermod -aG docker $USER

# Configure Docker to start on boot
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

sudo vim /etc/docker/daemon.json
echo  '{
  "registry-mirrors" : [
    "http://registry.docker-cn.com",
    "http://ovfftd6p.mirror.aliyuncs.com",
    "http://docker.mirrors.ustc.edu.cn",
    "http://hub-mirror.c.163.com"
  ],
  "insecure-registries" : [
    "registry.docker-cn.com",
    "docker.mirrors.ustc.edu.cn"
  ],
  "debug" : true,
  "experimental" : true,
  "hosts": ["unix:///var/run/docker.sock", "tcp://127.0.0.1:2375"],
  "dns": ["8.8.8.8", "8.8.4.4"]
}' >> /etc/docker/daemon.json

sudo systemctl daemon-reload && sudo systemctl restart docker.service
sudo netstat -lntp | grep dockerd


# uninstall
sudo apt-get purge docker-ce docker-ce-cli containerd.io
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

## 4. 安装Docker-Compose

[安装Docker-Compose](https://docs.docker.com/compose/install/)
[安装Docker-Compose-Completion](https://docs.docker.com/compose/completion/)

```shell
 curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Linux-x86_64" -o ./docker-compose

$ sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

$ sudo chmod +x /usr/local/bin/docker-compose

$ sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# completion
$ sudo curl -L https://raw.githubusercontent.com/docker/compose/1.29.2/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
$ source ~/.bashrc

$ docker-compose --version
# uninstall
$ sudo rm /usr/local/bin/docker-compose
```


## 5. 运行Images

```shell
docker network create -d bridge custom

# zookeeper
$ docker run --detach \
  --publish 2181:2181 \
  --name zookeeper \
  --restart always \
  zookeeper:3.7

# portainer
$ docker volume create portainer_data

$ docker run -d \
-p 8000:8000 \
-p 9000:9000 \
--name=portainer \
--restart=always \
--network=bridge \
-v /var/run/docker.sock:/var/run/docker.sock \
-v portainer_data:/data \
portainer/portainer-ce:2.6.1

# shadowsocks
docker run -e PASSWORD=Liuhui1993 -p 8388:8388 -p 8388:8388/udp -d shadowsocks/shadowsocks-libev
```

## 6. 修改Docker容器内部的软件源地址

1. 使用sed替换
    
    ```shell
    # 使用root用户执行命令行操作
    docker exec -it -u root <container-id(name)> /bin/bash

    # 查看软件源
    cat /etc/apt/sources.list

    # 替换软件源
    sed -i "s@http://deb.debian.org@http://mirrors.aliyun.com@g" /etc/apt/sources.list
    sed -i "s@http://security.debian.org@http://mirrors.aliyun.com@g" /etc/apt/sources.list
    ```

如果使用的https源，则需要执行`apt install apt-transport-https`，再执行`apt update`更新源索引

2. 直接编辑 sources.list

    ```shell
    # 使用root用户执行命令行操作
    docker exec -it -u root <container-id(name)> /bin/bash

    # 查看系统版本
    cat /etc/os-release

    ## 追加
    cat << EOF >> /etc/apt/sources.list
    # Debian 10 buster

    # 中科大源

    deb http://mirrors.ustc.edu.cn/debian buster main contrib non-free
    deb http://mirrors.ustc.edu.cn/debian buster-updates main contrib non-free
    deb http://mirrors.ustc.edu.cn/debian buster-backports main contrib non-free
    deb http://mirrors.ustc.edu.cn/debian-security/ buster/updates main contrib non-free

    deb-src http://mirrors.ustc.edu.cn/debian buster main contrib non-free
    deb-src http://mirrors.ustc.edu.cn/debian buster-updates main contrib non-free
    deb-src http://mirrors.ustc.edu.cn/debian buster-backports main contrib non-free
    deb-src http://mirrors.ustc.edu.cn/debian-security/ buster/updates main contrib non-free

    # 官方源

    # deb http://deb.debian.org/debian buster main contrib non-free
    # deb http://deb.debian.org/debian buster-updates main contrib non-free
    # deb http://deb.debian.org/debian-security/ buster/updates main contrib non-free

    # deb-src http://deb.debian.org/debian buster main contrib non-free
    # deb-src http://deb.debian.org/debian buster-updates main contrib non-free
    # deb-src http://deb.debian.org/debian-security/ buster/updates main contrib non-free

    # 网易源

    # deb http://mirrors.163.com/debian/ buster main non-free contrib
    # deb http://mirrors.163.com/debian/ buster-updates main non-free contrib
    # deb http://mirrors.163.com/debian/ buster-backports main non-free contrib
    # deb http://mirrors.163.com/debian-security/ buster/updates main non-free contrib

    # deb-src http://mirrors.163.com/debian/ buster main non-free contrib
    # deb-src http://mirrors.163.com/debian/ buster-updates main non-free contrib
    # deb-src http://mirrors.163.com/debian/ buster-backports main non-free contrib
    # deb-src http://mirrors.163.com/debian-security/ buster/updates main non-free contrib

    # 阿里云

    # deb http://mirrors.aliyun.com/debian/ buster main non-free contrib
    # deb http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
    # deb http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
    # deb http://mirrors.aliyun.com/debian-security buster/updates main

    # deb-src http://mirrors.aliyun.com/debian/ buster main non-free contrib
    # deb-src http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
    # deb-src http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
    # deb-src http://mirrors.aliyun.com/debian-security buster/updates main
    EOF
    ```

3. 安装软件
   
   ```shell
    # 更新软件源
    apt-get update && apt-get upgrade -y

    # 安装apt-file
    apt-get install -y apt-file && apt-file update

    # 查找软件
    apt-file search /bin/ps | grep -w "bin/ps"

    # 安装软件
    apt-get install -y vim wget

    # Docker容器交互
    docker exec -it -u root <container-id(name)> /bin/bash
   ```

4. 上传下载文件
   
   ```shell
    # 上传
    docker cp <local_file_path> <container-id(name)>:<container_path>
    docker cp C://users/light/Desktop/elasticsearch-analysis-ik elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik

    # 下载
    docker cp <container-id(name)>:<container_path> <local_file_path>
    docker cp elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik C://users/light/Desktop/elasticsearch-analysis-ik
   ```
