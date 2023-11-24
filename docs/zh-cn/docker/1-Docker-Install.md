- [Docker Desktop Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Desktop Linux](https://docs.docker.com/desktop/install/linux-install/)
- [Docker Desktop Mac](https://docs.docker.com/desktop/install/mac-install/)

## 1. CentOS 安装
- [Docker Engine CentOS](https://docs.docker.com/engine/install/centos/)

```shell
# 更新yum源
yum update

# 卸载旧版本(如果安装过旧版本的话)
yum remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-engine

# 安装需要的软件包
yum install -y yum-utils \
    device-mapper-persistent-data \
    lvm2

# 设置yum源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装最新稳定版
sudo yum install docker-ce \
        docker-ce-cli \
        containerd.io \
        docker-buildx-plugin \
        docker-compose-plugin

# 安装指定版本
yum list docker-ce --showduplicates | sort -r   # 查看docker-ce版本列表

sudo yum install docker-ce-<VERSION_STRING> \
        docker-ce-cli-<VERSION_STRING> \
        containerd.io \
        docker-buildx-plugin \
        docker-compose-plugin

# 启动和开机启动
systemctl start docker
systemctl enable docker

# 将当前用户加入到docker操作组 设置完后需要重新登录
sudo usermod -aG docker $USER

# 验证安装是否成功
docker version

# 卸载docker
sudo yum remove docker-ce \
        docker-ce-cli \
        containerd.io \
        docker-buildx-plugin \
        docker-compose-plugin \
        docker-ce-rootless-extras

# 删除本地的docker文件 image container volumes network .etc
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```
