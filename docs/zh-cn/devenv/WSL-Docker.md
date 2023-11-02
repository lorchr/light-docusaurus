
## 安装WSL
要在Windows上启用WSL（Windows Subsystem for Linux），您可以按照以下步骤进行操作：

1. 打开 PowerShell 作为管理员。您可以在开始菜单中搜索 "PowerShell"，右键单击它，然后选择 "以管理员身份运行"。

2. 运行以下命令启用WSL功能：

   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```

   这会启用WSL功能，但不会要求重新启动计算机。

3. 接下来，运行以下命令以启用虚拟机平台功能：

   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

4. 重新启动计算机，以确保已经启用了虚拟机平台功能。

5. 安装WSL 2内核更新包。您可以从以下链接下载并安装最新的WSL 2内核更新包：[WSL 2 内核更新包](https://aka.ms/wsl2kernel)

6. 设置WSL 2为默认版本。在 PowerShell 中运行以下命令：

   ```powershell
   wsl --set-default-version 2
   ```

7. 最后，安装您选择的Linux发行版。您可以从Microsoft Store中安装各种Linux发行版，如Ubuntu、Debian、或openSUSE。

   ```powershell
   # 查看可选发行版
   wsl --list --online
   wsl --install -d Ubuntu-22.04
   ```

8. [安装 Windows 终端](https://learn.microsoft.com/zh-cn/windows/terminal/install)

## 1. WSL 切换软件安装源

[切换apt源](https://www.cnblogs.com/hgzero/p/13187748.html)

```shell
# 备份源
sudo cp /etc/apt/sources.list{,.bak}

# 修改源
sudo vim /etc/apt/sources.list

# 一键替换 清华源
sudo sed -i "s@http://archive.ubuntu.com/ubuntu/@https://mirrors.tuna.tsinghua.edu.cn/ubuntu/@g" /etc/apt/sources.list
sudo sed -i "s@http://security.ubuntu.com/ubuntu/@https://mirrors.tuna.tsinghua.edu.cn/ubuntu/@g" /etc/apt/sources.list

# 一键替换 阿里源
sudo sed -i "s@http://archive.ubuntu.com/ubuntu/@http://mirrors.aliyun.com/ubuntu/@g" /etc/apt/sources.list
sudo sed -i "s@http://security.ubuntu.com/ubuntu/@http://mirrors.aliyun.com/ubuntu/@g" /etc/apt/sources.list

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
[阿里镜像加速](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)

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

# Add the repository to Apt sources:
$ echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

$ sudo apt-get update

# List the available versions:
$ apt-cache madison docker-ce | awk '{ print $3 }'

# Select the desired version and install:
$ VERSION_STRING=5:24.0.6-1~ubuntu.22.04~jammy
$ sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin

# Manage Docker as a non-root user
sudo groupadd docker
sudo usermod -aG docker $USER

# Configure Docker to start on boot
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

# Additional config for speed up
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

# Uninstall Docker
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


## 7. 镜像备份加载
导出 export  与 保存 save 的区别
1. export导出的镜像文件大小小于 save 保存的镜像

2. export 导出（import导入）是根据容器拿到的镜像，再导入时会丢失镜像所有的历史，所以无法进行回滚操作（`docker tag <LAYER ID> <IMAGE NAME>`）；而save保存（load加载）的镜像，没有丢失镜像的历史，可以回滚到之前的层（layer）。（查看方式：`docker images –tree`）
```shell
# 镜像备份 加载 save load
docker save -o image_version.tar docker.io/image:version
docker load -i image_version.tar

# 镜像备份 加载 export import
docker export image_version.tar container_name
docker import image_version.tar docker.io/image:version
```

传输文件
```shell
# 将本地文件夹下面的test文件夹拷贝到服务器上
scp -r ./test/ root@192.168.8.220:/home/test/
# 拷贝远程服务器的文件夹test到本地目录下./test2文件夹
scp -r root@192.168.8.220:/home/test/ ./test2/
```

## 8. 获取容器的运行指令及参数
```shell
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  assaflavie/runlike -p postgres
```

## 9. 部署镜像仓库
1. 编写docker-compose文件
```yaml
version: '3.1'
services:
  registry:
    image: registry
    restart: always
    container_name: registry
    ports:
      - 5000:5000
    volumes:
      - ./data:/var/lib/registry

  frontend:
    image: konradkleine/docker-registry-frontend:v2
    ports:
      - 8080:80
    volumes:
      - ./certs/frontend.crt:/etc/apache2/server.crt:ro
      - ./certs/frontend.key:/etc/apache2/server.key:ro
    environment:
      - ENV_DOCKER_REGISTRY_HOST=192.168.110.158(Docker仓库的IP)
      - ENV_DOCKER_REGISTRY_PORT=5000
```

2. 运行镜像仓库
```shell
# v1版本
docker-compose up -d

# v2版本
docker compose up -d
```

3. 客户端配置
```shell
修改 /etc/docker/daemon.json 增加 insecure-registries 配置

{
  "registry-mirrors": [
    "https://xxx.mirror.aliyuncs.com"
  ],
  "insecure-registries": [
    "192.168.110.158:5000"
  ]
}
```

4. 重启docker daemon
```shell
systemctl daemon-reload
systemctl restart docker
```

5. 上传镜像到私服
```shell
# 给镜像添加tag
docker tag image_test:v1 192.168.110.158:5000/image_test:v1

# 上传镜像
docker push 192.168.110.158:5000/image_test

# 查看镜像
curl 192.168.110.158:5000/v2/_catalog

# 删除本地镜像
docker rmi image_test:v1 192.168.110.158:5000/image_test:v1

# 从镜像仓库拉取镜像
docker pull 192.168.110.158:5000/image_test:v1
```

## 10、更改WSL Docker位置
WSL默认安装在 `C:/Users/light/AppData/Local` 下，占据空间过大

1. 查看安装目录

```shell
# 查看数据
wsl --list -v

# 输出
  NAME                   STATE           VERSION
* docker-desktop-data    Stopped         2
  docker-desktop         Stopped         2
  Ubuntu-22.04           Stopped         2
  
# 关闭wsl
wsl --shutdown
```

2. 导出应用

```shell
# wsl --export <app-name> <target-file>
wsl --export Ubuntu-20.04         D:\\wsl\\ubuntu\\Ubuntu-20.04.tar
wsl --export docker-desktop-data  D:\\wsl\\docker\\data\\docker-desktop-data.tar
wsl --export docker-desktop       D:\\wsl\\docker\\desktop\\docker-desktop.tar
```

3. 注销应用

```shell
# wsl --unregister <app-name>
wsl --unregister Ubuntu-20.04
wsl --unregister docker-desktop-data
wsl --unregister docker-desktop
```

4. 导入应用

```shell
# wsl --import <app-name> <install-dir> <source-file> --version <wsl-version>
wsl --import Ubuntu-20.04        D:\\ubuntu\\wsl           D:\\wsl\\ubuntu\\Ubuntu-20.04.tar --version 2
wsl --import docker-desktop-data D:\\wsl\\docker\\data     D:\\wsl\\docker\\data\\docker-desktop-data.tar --version 2
wsl --import docker-desktop      D:\\wsl\\docker\\desktop  D:\\wsl\\docker\\desktop\\docker-desktop.tar --version 2

```

6. 设置WSL默认用户

```shell
# 切换默认用户，安装时设置的默认用户名是 light
Ubuntu-20.04 config --default-user light
```


## 11. 修改WSL的内存及CPU占用
关于详细的配置，看：[Advanced settings configuration in WSL | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/wsl-config#configure-global-options-with-wslconfig)

今天偶尔发现  WSL占用的内存是真实内存的一半（通过`htop`命令查看即可）

现在需要修改配置到使用全部的CPU资源：
1. `Windows + R` 键，
2. 输入 `%UserProfile%` 并运行进入用户文件夹,
3. 新建文件 `.wslconfig`，文件内容如下：
```shell
#.wslconfig
[wsl2]
memory=12G        # 限制最大使用内存，不使用16G，是为了为Windows保存一些内存，不这么卡
swap=10G          # 限制最大使用虚拟内存
# processors=12   # 限制最大使用cpu个数,如果不设置，默认是使用全部的核心
```
- `processors` 顾名思义就是限制CPU核心数（会体现在`/proc/cpuinfo`等节点上）
- `memory` 则是可使用的内存总大小（会体现在`/proc/meminfo`等节点上）
- `swap` 则是交换空间的总大小（会体现在`/proc/meminfo`等节点上）

4. 然后运行Windows cmd，输入` wsl --shutdown` 来关闭当前的子系统，重新运行`bash`进入子系统
