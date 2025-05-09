
## 一、相关链接
- [Kubernetes生产环境安装注意事项](https://kubernetes.io/zh-cn/docs/setup/production-environment/)
- [Kubernetes 容器运行时](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)
- [使用 kubeadm 引导集群](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/)
- [Docker 容器运行时安装](https://docs.docker.com/engine/install/#server)
- [Docker rpm安装包下载](https://download.docker.com/linux/centos/8/x86_64/stable/Packages/)
- [安装CRI-Dockerd](https://mirantis.github.io/cri-dockerd/usage/install/)
- [Kubernetes运行必要的端口](https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/)
- 
- [Kubernetes下载](https://kubernetes.io/zh-cn/releases/download/)
- [Kubernetes更新历史](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.30.md#v13011)
- [Kubernetes下载](https://www.downloadkubernetes.com/)
- [在 Linux 系统中安装并设置 kubectl](https://kubernetes.io/zh-cn/docs/tasks/tools/install-kubectl-linux/)
- 
- [开源项目 Helm 用于安装Dashbaord](https://github.com/helm/helm/releases)
- [开源项目 kube-vip 控制面虚拟IP](https://github.com/kube-vip/kube-vip)
- [开源项目 kube-install 离线安装K8s](https://github.com/cloudnativer/kube-install)
- 
- [Kubernetes(k8s)-高可用集群部署v1.32.2(生产可用)](https://cloud.tencent.com/developer/article/2505531)
- [Centos8.5 基于 k8s v1.30.1 部署高可用集群](https://blog.csdn.net/tonyhi6/article/details/139019297)
- [在已有的高可用kubernetes/k8s集群中添加master节点](https://blog.csdn.net/qq_33342132/article/details/135751063)
- [k8s 集群添加Master和node节点](https://bbs.huaweicloud.com/blogs/368244)
- [理论+实操：k8s单节点集群加入master节点](https://blog.csdn.net/Lfwthotpt/article/details/105892926)
- [k8s v1.30.1 高可用版本搭建](https://blog.csdn.net/qq_42895490/article/details/139564373)
- [Kubernetes 网络插件 Calico 完全运维指南](https://zhuanlan.zhihu.com/p/524772977)

## 二、环境介绍

### 2.1 软件版本

| 名称          | 版本                       | 备注                                 |
| ------------- | -------------------------- | ------------------------------------ |
| 操作系统      | CentOS 8.5                 | 内核版本 4.18.0-348.7.1.el8_5.x86_64 |
| Kubernates    | 1.30.11                    |                                      |
| 容器运行时    | Docker-CE-26.1.3-1         |                                      |
| K8s网络组件   | Calico-v3.25               |                                      |
| Helm          | helm-v3.17.2               | 用于安装Dashboard                    |
| K8s Dashbaord | kubernetes-dashboard-7.7.0 |                                      |

### 2.2 服务器规划

```shell
# 查看网络信息
ip a

# 查看MAC地址
ip link | grep link/ether

# 查看 product_uuid
sudo cat /sys/class/dmi/id/product_uuid

```

| 操作系统    | 内存 | 主机名        | IP              | 备注           |
| ----------- | ---- | ------------- | --------------- | -------------- |
| Cent OS 8.5 | 4G   | k8s-master-01 | 192.168.137.121 | Master         |
| Cent OS 8.5 | 4G   | k8s-master-02 | 192.168.137.122 | Master         |
| Cent OS 8.5 | 4G   | k8s-master-03 | 192.168.137.123 | Master         |
| Cent OS 8.5 | 4G   | k8s-node-01   | 192.168.137.131 | Node           |
| Cent OS 8.5 | 4G   | k8s-node-02   | 192.168.137.132 | Node           |
| Cent OS 8.5 | 4G   | k8s-node-03   | 192.168.137.133 | Node           |
| -           | -    | vip           | 192.168.137.140 | 虚拟IP，无实体 |

## 三、【所有节点】准备工作

### 3.1 创建操作用户

如果没有专门的操作用户，可以按下面的操作创建新的用户，后续操作均使用此新用户来执行

```shell
# 1. 创建用户
sudo useradd -m diginn

# 2. 设置密码
sudo passwd diginn

# 3. 赋予root权限
sudo visudo
# 添加如下内容
diginn   ALL=(ALL)   ALL

# 4. 测试权限
su - diginn
sudo whoami

# 显示 root 即表示diginn用户有 sudo 权限

```

### 3.2 禁用系统交换分区

```shell
# 临时禁用
sudo swapoff -a
# 永久禁用
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# 查看swap分区
swapon --show
```

### 3.3 禁用 SELinux

```shell
# 临时禁用
sudo setenforce 0
# 永久禁用
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

# 检查SELinux状态
sestatus
getenforce
```

### 3.4 配置内核参数

```shell
# 立即生效
sudo modprobe ip_vs
sudo modprobe ip_vs_rr
sudo modprobe ip_vs_sh
sudo modprobe ip_vs_wrr
sudo modprobe nf_conntrack
sudo modprobe br_netfilter
sudo modprobe overlay
sudo modprobe nf_nat
sudo modprobe xt_conntrack
sudo modprobe veth  
sudo modprobe ip_tables
sudo modprobe ip6_tables
sudo modprobe nf_defrag_ipv6
sudo modprobe ebtables
sudo modprobe dummy
sudo modprobe xt_set

# 配置启动记载
cat <<EOF | sudo tee -a /etc/modules
ip_vs
ip_vs_rr
ip_vs_sh
ip_vs_wrr
nf_conntrack
br_netfilter
overlay
nf_nat
xt_conntrack
veth
ip_tables
ip6_tables
nf_defrag_ipv6
ebtables
dummy
xt_set
EOF

# 验证是否加载成功
lsmod | grep -E "ip_vs|nf_conntrack|br_netfilter|overlay|nf_nat|xt_conntrack|veth|ip_tables|ip6_tables|nf_defrag_ipv6|ebtables|dummy|xt_set"

```

### 3.5 配置网络参数

```shell
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# 应用 sysctl 参数而不重新启动
sudo sysctl --system

# 验证
sudo sysctl net.ipv4.ip_forward

```

### 3.6 设置主机名和hosts

```shell
# master主机
sudo hostnamectl  set-hostname  k8s-master-01
sudo hostnamectl  set-hostname  k8s-master-02
sudo hostnamectl  set-hostname  k8s-master-03
# node主机
sudo hostnamectl  set-hostname  k8s-node-01
sudo hostnamectl  set-hostname  k8s-node-02
sudo hostnamectl  set-hostname  k8s-node-03


# 修改/etc/hosts内容（集群内每一个主机都要配置）
cat <<EOF | sudo tee -a /etc/hosts

192.168.137.121   k8s-master-01
192.168.137.122   k8s-master-02
192.168.137.123   k8s-master-03

192.168.137.131   k8s-node-01
192.168.137.132   k8s-node-02
192.168.137.133   k8s-node-03
EOF

```

### 3.7 设置时区

```shell
# 查看时区
timedatectl

# 查看所有可用时区
timedatectl list-timezones

# 设置为上海时区
sudo timedatectl set-timezone Asia/Shanghai

```

### 3.8 打通节点之间的网络，在K8s节点之间直接放行

由于各个组件之间通讯逻辑十分复杂，且不同版本之间的网络规则还存在区别，对于生产环境，建议在不能关闭防火墙的情况下配置节点之间直接放行，

**如果按此处配置，后续关于开放网络端口的命令都可以跳过。**

```shell
# 在防火墙中启用 Masquerade（NAT）
sudo firewall-cmd --permanent --zone=public --add-masquerade

# K8s的Master 节点及Node节点
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.121/32" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.122/32" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.123/32" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.131/32" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.132/32" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.137.133/32" accept'

# Service 网络及 Pod网络
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="10.244.0.0/16" accept'
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="10.96.0.0/12" accept'

# 允许 Pod 网段到网关 DNS（192.168.137.1）的 UDP 53 流量
# 如果是在虚拟机部署，这里是物理机的ip，同时注意物理机关闭防火墙，避免pod网络dns请求报错
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family=ipv4 source address=10.244.0.0/16 destination address=192.168.137.1/32 port port=53 protocol=udp accept'

# 允许 Pod 网段到外部 DNS（如 8.8.8.8）的 UDP 53 流量
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family=ipv4 source address=10.244.0.0/16 destination address=8.8.8.8/32 port port=53 protocol=udp accept'

# 【Calico】 IP-in-IP 需要开放协议号为4的流量
sudo firewall-cmd --permanent --add-rich-rule='rule protocol value="4" accept'


# 【Keepalived】添加永久规则允许VRRP协议
sudo firewall-cmd --permanent --add-protocol=vrrp
# 【Keepalived】若上述命令报错（协议名称不支持），改用富规则指定协议号
sudo firewall-cmd --permanent --add-rich-rule='rule protocol value="112" accept'

# 【Keepalived】VRRP默认使用组播地址224.0.0.18。允许相关组播通信
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="224.0.0.18/32" accept'

# 重新加载防火墙规则
sudo firewall-cmd --reload

# 查看规则
sudo firewall-cmd --list-all --zone=public

```

查看规则的输出示例如下
```shell
[diginn@k8s-master-01 ~]$ sudo firewall-cmd --list-all --zone=public
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: enp0s3
  sources:
  services: cockpit dhcpv6-client ssh
  ports:
  protocols: vrrp
  forward: no
  masquerade: yes
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
        rule family="ipv4" source address="192.168.137.131/32" accept
        rule family="ipv4" source address="192.168.137.133/32" accept
        rule family="ipv4" source address="192.168.137.121/32" accept
        rule family="ipv4" source address="10.244.0.0/16" destination address="192.168.137.1/32" port port="53" protocol="udp" accept
        rule family="ipv4" source address="10.244.0.0/16" destination address="8.8.8.8/32" port port="53" protocol="udp" accept
        rule protocol value="4" accept
        rule family="ipv4" source address="192.168.137.132/32" accept
        rule protocol value="112" accept
        rule family="ipv4" source address="192.168.137.122/32" accept
        rule family="ipv4" source address="224.0.0.18/32" accept
        rule family="ipv4" source address="192.168.137.123/32" accept
        rule family="ipv4" source address="10.96.0.0/12" accept
        rule family="ipv4" source address="10.244.0.0/16" accept

```

### 3.9 配置防火墙放行规则
- [Kubernates运行必要的端口](https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/)

经实际多次测试，这个接口列表缺少很多端口，仅kubernetes核心的端口，一些必要的组件端口并没有列出来，同一组件在不同工作模式下的规则还不相同，建议第一次部署时关闭防火墙。

控制面
| 协议 | 方向 | 端口范围  | 目的                    | 使用者               |
| ---- | ---- | --------- | ----------------------- | -------------------- |
| TCP  | 入站 | 6443      | Kubernetes API 服务器   | 所有                 |
| TCP  | 入站 | 2379-2380 | etcd 服务器客户端 API   | kube-apiserver、etcd |
| TCP  | 入站 | 10250     | kubelet API             | 自身、控制面         |
| TCP  | 入站 | 10259     | kube-scheduler          | 自身                 |
| TCP  | 入站 | 10257     | kube-controller-manager | 自身                 |

工作节点
| 协议 | 方向 | 端口范围    | 目的               | 使用者           |
| ---- | ---- | ----------- | ------------------ | ---------------- |
| TCP  | 入站 | 10250       | kubelet API        | 自身、控制面     |
| TCP  | 入站 | 10256       | kube-proxy         | 自身、负载均衡器 |
| TCP  | 入站 | 30000-32767 | NodePort Services† | 所有             |

```shell
# 关闭防火墙（不推荐）
sudo systemctl stop firewalld
sudo systemctl disable firewalld

## 打开端口
sudo firewall-cmd --permanent --zone=public --add-port=6443/tcp
sudo firewall-cmd --permanent --zone=public --add-port=2379-2380/tcp
sudo firewall-cmd --permanent --zone=public --add-port=10250/tcp
sudo firewall-cmd --permanent --zone=public --add-port=10256/tcp
sudo firewall-cmd --permanent --zone=public --add-port=10257/tcp
sudo firewall-cmd --permanent --zone=public --add-port=10259/tcp
sudo firewall-cmd --permanent --zone=public --add-port=30000-32767/tcp

# HTTP HTTPS
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# CoreDNS
sudo firewall-cmd --permanent --add-port=53/tcp
sudo firewall-cmd --permanent --add-port=53/udp
sudo firewall-cmd --permanent --add-port=9153/udp

# DHCP
sudo firewall-cmd --permanent --add-port=67/udp
sudo firewall-cmd --permanent --add-port=68/udp

# ETCD
sudo firewall-cmd --permanent --add-port=6666/tcp
sudo firewall-cmd --permanent --add-port=6667/tcp

# 重启防火墙
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-port

# 查看所有防火墙规则
sudo firewall-cmd --list-all

```

可以用 `netcat` 检查端口是否开放

```shell
# 安装netcat
sudo dnf install -y nc

nc 127.0.0.1 6443 -zv -w 2

```

### 3.10 【在线】依赖项安装

```shell
sudo dnf install -y vim wget tar unzip ebtables ethtool nc net-tools yum-utils iproute-tc ipset ipvsadm bash-completion

```

### 3.10 【离线】依赖项安装
- [阿里云CentOS8镜像](https://mirrors.aliyun.com/centos/8.5.2111/BaseOS/x86_64/os/Packages/)

**注意** 需要本地准备一台与服务器系统版本一致的虚拟机，在虚拟机上下载各种依赖包

```shell
# 1. 需要先安装 yum-utils 来下载其他的依赖
curl https://mirrors.aliyun.com/centos/8.5.2111/BaseOS/x86_64/os/Packages/yum-utils-4.0.21-3.el8.noarch.rpm -o ./yum-utils-4.0.21-3.el8.noarch.rpm
rpm -ivh yum-utils-4.0.21-3.el8.noarch.rpm

# 2. 本地虚拟机下载依赖
mkdir -p ~/k8s-install/lib/ && cd ~/k8s-install/
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/vim             vim
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/tar             tar
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/unzip           unzip
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/wget            wget
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/tree            tree
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/nc              nc
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/ebtables        ebtables
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/ethtool         ethtool
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/net-tools       net-tools
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/iproute-tc      iproute-tc
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/ipset           ipset
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/ipvsadm         ipvsadm
yumdownloader --archlist=x86_64 --resolve --destdir=./lib/bash-completion bash-completion

# HAProxy Keepalived Nginx 单独目录
yumdownloader --archlist=x86_64 --resolve --destdir=./haproxy     haproxy
yumdownloader --archlist=x86_64 --resolve --destdir=./keepalived  keepalived
yumdownloader --archlist=x86_64 --resolve --destdir=./nginx       nginx

# 3. 打包依赖为压缩包
tar -zcvf lib.tar.gz ./lib 

# 4. 下载完成后传输到内网机器上

# 5. 内网机安装安装
sudo rpm -ivh ./lib/vim/*.rpm
sudo rpm -ivh ./lib/tar/*.rpm
sudo rpm -ivh ./lib/unzip/*.rpm
sudo rpm -ivh ./lib/wget/*.rpm
sudo rpm -ivh ./lib/nc/*.rpm
sudo rpm -ivh ./lib/ebtables/*.rpm
sudo rpm -ivh ./lib/ethtool/*.rpm
sudo rpm -ivh ./lib/net-tools/*.rpm
sudo rpm -ivh ./lib/iproute-tc/*.rpm
sudo rpm -ivh ./lib/ipset/*.rpm
sudo rpm -ivh ./lib/ipvsadm/*.rpm
sudo rpm -ivh ./lib/bash-completion/*.rpm

```

## 四、【所有节点】Docker安装配置（容器运行时）
- [CentOS安装Docker](https://docs.docker.com/engine/install/centos/)
- [阿里云Docker镜像](https://developer.aliyun.com/mirror/docker-ce)
- [Docker离线安装包下载](https://download.docker.com/linux/centos/8/x86_64/stable/Packages/)

### 4.1 卸载已有Docker Engine

```shell
sudo dnf remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine

```

### 4.2 添加Docker yum仓库

```shell
# 添加docker仓库源
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 如果官方源下载速度慢，可以使用阿里源
sudo dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 查看Docker源
cat /etc/yum.repos.d/docker-ce.repo

```

### 4.3 【在线】安装Docker

```shell
# 查看Docker的版本
sudo dnf list docker-ce.x86_64 --showduplicates | sort -r

# 安装最新版本Docker
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 安装指定版本的Docker
# sudo dnf install docker-ce-3:26.1.3-1.el8 docker-ce-cli-1:26.1.3-1.el8 containerd.io docker-buildx-plugin docker-compose-plugin

# 运行Docker Engine
sudo systemctl enable --now docker

# 将当前用户加入到docker操作组 设置完后需要重新登录
sudo usermod -aG docker $USER

# 测试Docker是否安装成功
docker run hello-world

```

### 4.3 【离线】安装Docker

```shell
mkdir -p ~/k8s-install/docker/ && cd ~/k8s-install/

# 下载安装包
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/containerd.io-1.6.9-3.1.el8.x86_64.rpm -o ./docker/containerd.io-1.6.9-3.1.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-buildx-plugin-0.14.0-1.el8.x86_64.rpm -o ./docker/docker-buildx-plugin-0.14.0-1.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-ce-26.1.3-1.el8.x86_64.rpm -o ./docker/docker-ce-26.1.3-1.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-ce-cli-26.1.3-1.el8.x86_64.rpm -o ./docker/docker-ce-cli-26.1.3-1.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-ce-rootless-extras-26.1.3-1.el8.x86_64.rpm -o ./docker/docker-ce-rootless-extras-26.1.3-1.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-compose-plugin-2.6.0-3.el8.x86_64.rpm -o ./docker/docker-compose-plugin-2.6.0-3.el8.x86_64.rpm
curl -sSLf https://download.docker.com/linux/centos/8/x86_64/stable/Packages/docker-scan-plugin-0.23.0-1.el8.x86_64.rpm -o ./docker/docker-scan-plugin-0.23.0-1.el8.x86_64.rpm


# 下载依赖包

yumdownloader --archlist=x86_64 --resolve --destdir=./docker/docker-ce              docker-ce 
yumdownloader --archlist=x86_64 --resolve --destdir=./docker/docker-ce-cli          docker-ce-cli
yumdownloader --archlist=x86_64 --resolve --destdir=./docker/containerd             containerd.io
yumdownloader --archlist=x86_64 --resolve --destdir=./docker/docker-buildx-plugin   docker-buildx-plugin
yumdownloader --archlist=x86_64 --resolve --destdir=./docker/docker-compose-plugin  docker-compose-plugin


# 安装离线包
sudo rpm -ivh ./docker/docker-ce/*.rpm
sudo rpm -ivh ./docker/docker-ce-cli/*.rpm
sudo rpm -ivh ./docker/containerd/*.rpm
sudo rpm -ivh ./docker/docker-buildx-plugin/*.rpm
sudo rpm -ivh ./docker/docker-compose-plugin/*.rpm

# 运行Docker Engine
sudo systemctl enable --now docker

# 将当前用户加入到docker操作组 设置完后需要重新登录
sudo usermod -aG docker $USER

# 测试Docker是否安装成功
docker run hello-world

```

### 4.4 如果需要卸载，使用以下命令

```shell
# 卸载 docker
sudo dnf remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras

# 删除相关目录
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd

```

### 4.5 配置Docker驱动及镜像仓库

```shell
# 配置驱动
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "registry-mirrors": [
    "https://docker.hpcloud.cloud",
    "https://docker.m.daocloud.io",
    "https://docker.unsee.tech",
    "https://docker.1panel.live",
    "http://mirrors.ustc.edu.cn",
    "https://docker.chenby.cn",
    "http://mirror.azure.cn",
    "https://dockerpull.org",
    "https://dockerhub.icu",
    "https://hub.rat.dev"
  ]
}
EOF

# 重启docker
sudo systemctl daemon-reload
sudo systemctl restart docker

```

### 4.6 安装cri-dockerd驱动（Docker与K8s集成的适配层）
- [CRI-Dockerd安装文档](https://mirantis.github.io/cri-dockerd/usage/install/)

Docker Engine 没有实现 [CRI](https://kubernetes.io/zh-cn/docs/concepts/architecture/cri/)， 而这是容器运行时在 Kubernetes 中工作所需要的。 为此，必须安装一个额外的服务 [cri-dockerd](https://github.com/Mirantis/cri-dockerd)。 cri-dockerd 是一个基于传统的内置 Docker 引擎支持的项目， 它在 1.24 版本从 kubelet 中[移除](https://kubernetes.io/zh-cn/dockershim)。


#### 4.6.1 【推荐】rpm安装

```shell
mkdir -p ~/k8s-install/cri/ && cd ~/k8s-install/
curl -sSLf https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.14/cri-dockerd-0.3.14-3.el8.x86_64.rpm -o ./cri/cri-dockerd-0.3.14-3.el8.x86_64.rpm

sudo rpm -ivh ./cri/cri-dockerd-0.3.14-3.el8.x86_64.rpm

# 启动
sudo systemctl daemon-reload
sudo systemctl enable cri-docker
sudo systemctl start cri-docker
sudo systemctl status cri-docker


# 检查CRI套接字
ll /run/cri-dockerd.sock

ll /var/run/cri-dockerd.sock

```

#### 4.6.2 源码安装

```shell
mkdir -p ~/k8s-install/cri/ && cd ~/k8s-install/

# 下载 cri-dockerd（注意系统版本，这里是amd64）
curl -sSLf https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.14/cri-dockerd-0.3.14.amd64.tgz -o ./cri/cri-dockerd-0.3.14.amd64.tgz

scp -r ./cri/cri-dockerd-0.3.14.amd64.tgz diginn@192.168.137.121:/home/diginn/k8s-install/cri/
scp -r ./cri/cri-dockerd-0.3.14.amd64.tgz diginn@192.168.137.123:/home/diginn/k8s-install/cri/
scp -r ./cri/cri-dockerd-0.3.14.amd64.tgz diginn@192.168.137.131:/home/diginn/k8s-install/cri/
scp -r ./cri/cri-dockerd-0.3.14.amd64.tgz diginn@192.168.137.132:/home/diginn/k8s-install/cri/
scp -r ./cri/cri-dockerd-0.3.14.amd64.tgz diginn@192.168.137.133:/home/diginn/k8s-install/cri/

# 解压
tar -zxvf ./cri/cri-dockerd-0.3.14.amd64.tgz

# 移动到系统路径
sudo mv ./cri/cri-dockerd/cri-dockerd /usr/local/bin/
```

#### 4.6.3 【仅源码安装】注册为系统服务
```shell
sudo tee /etc/systemd/system/cri-docker.service <<EOF
[Unit]
Description=CRI Interface for Docker Application Container Engine
Documentation=https://docs.mirantis.com
After=network-online.target firewalld.service docker.service
Wants=network-online.target
Requires=cri-docker.socket

[Service]
Type=notify
ExecStart=/usr/local/bin/cri-dockerd --container-runtime-endpoint fd:// --network-plugin=cni --pod-infra-container-image=registry.aliyuncs.com/google_containers/pause:3.10
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always

# Note that StartLimit* options were moved from "Service" to "Unit" in systemd 229.
# Both the old, and new location are accepted by systemd 229 and up, so using the old location
# to make them work for either version of systemd.
StartLimitBurst=3

# Note that StartLimitInterval was renamed to StartLimitIntervalSec in systemd 230.
# Both the old, and new name are accepted by systemd 230 and up, so using the old name to make
# this option work for either version of systemd.
StartLimitInterval=60s

# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity

# Comment TasksMax if your systemd version does not support it.
# Only systemd 226 and above support this option.
TasksMax=infinity
Delegate=yes
KillMode=process

[Install]
WantedBy=multi-user.target
EOF

```

```shell
# cri-docker.socket
sudo tee /etc/systemd/system/cri-docker.socket <<EOF
[Unit]
Description=CRI Docker Socket for the API
PartOf=cri-docker.service

[Socket]
ListenStream=%t/cri-dockerd.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF

```

#### 4.6.4 【仅源码安装】启动 cri-dockerd

```shell
# 启动cri-dockerd
sudo systemctl daemon-reload
sudo systemctl enable --now cri-docker.socket


# 检查CRI套接字
ll /run/cri-dockerd.sock

ll /var/run/cri-dockerd.sock

```

对于 `cri-dockerd`，默认情况下，CRI 套接字是 `/run/cri-dockerd.sock`。

## 五、【所有节点】安装 kubeadm、kubelet 和 kubectl
- [Kubernetes下载](https://www.downloadkubernetes.com/)

需要在每台机器上安装以下的软件包：

- `kubeadm`：用来初始化集群的指令。

- `kubelet`：在集群中的每个节点上用来启动 Pod 和容器等。

- `kubectl`：用来与集群通信的命令行工具。

- `Pod`: Kubernetes的最小工作单元。每个`Pod`包含一个或多个容器。`Pod`中的容器会作为一个整体被`Master`调度到一个`Node`上运行.

`kubeadm` 不能帮你安装或者管理 `kubelet` 或 `kubectl`， 所以你需要确保它们与通过 `kubeadm` 安装的控制平面的版本相匹配。 如果不这样做，则存在发生版本偏差的风险，可能会导致一些预料之外的错误和问题。 然而，控制平面与 `kubelet` 之间可以存在一个次要版本的偏差，但 `kubelet` 的版本不可以超过 API 服务器的版本。 例如，1.7.0 版本的 `kubelet` 可以完全兼容 1.8.0 版本的 API 服务器，反之则不可以。

有关安装 `kubectl` 的信息，请参阅[安装和设置 kubectl](https://kubernetes.io/zh-cn/docs/tasks/tools/) 文档。

### 5.1 确保每个节点上 MAC 地址和 product_uuid 的唯一性

> 你可以使用命令 `ip link` 或 `ifconfig -a` 来获取网络接口的 MAC 地址

> 可以使用 `sudo cat /sys/class/dmi/id/product_uuid` 命令对 `product_uuid` 校验

```shell

ip link | grep link/ether

# 查看 product_uuid
sudo cat /sys/class/dmi/id/product_uuid
```

### 5.2 添加 Kubernetes 的 yum 仓库

```shell
# 此操作会覆盖 /etc/yum.repos.d/kubernetes.repo 中现存的所有配置
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF


# 如果慢，可以改成阿里云的源
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetesnew/core/stable/v1.30/rpm/repodata/repomd.xml.key
EOF

```

### 5.3 【在线】安装 kubelet、kubeadm 和 kubectl

```shell
# 安装 kubelet、kubeadm 和 kubectl
sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

# 查看版本
kubeadm version 

kubectl version --client

kubelet --version

```
![](./img/5/k8s安装1.png)
![](./img/5/k8s安装2.png)

修改配置
```shell
sudo vim /etc/sysconfig/kubelet
# 将KUBELET_EXTRA_ARGS 的值设置为
KUBELET_EXTRA_ARGS="--cgroup-driver=systemd"

# 启用 kubelet 以确保它在启动时自动启动
sudo systemctl enable --now kubelet

```

### 5.3 【离线】安装 kubelet、kubeadm 和 kubectl
- [Kubernetes下载](https://www.downloadkubernetes.com/)
- [阿里云Kubeadm Kubectl Kubelet下载](https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/x86_64/)

```shell
mkdir -p ~/k8s-install/k8s/ && cd ~/k8s-install/

# 二进制包
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/apiextensions-apiserver ./k8s/apiextensions-apiserver
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-aggregator         ./k8s/kube-aggregator
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-apiserver          ./k8s/kube-apiserver
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-controller-manager ./k8s/kube-controller-manager
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-log-runner         ./k8s/kube-log-runner
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-proxy              ./k8s/kube-proxy
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kube-scheduler          ./k8s/kube-scheduler
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kubeadm                 ./k8s/kubeadm
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kubectl                 ./k8s/kubectl
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kubectl-convert         ./k8s/kubectl-convert
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/kubelet                 ./k8s/kubelet
wget https://dl.k8s.io/v1.30.11/bin/linux/amd64/mounter                 ./k8s/mounter

# 适用于CentOS的RPM包
wget https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/x86_64/kubeadm-1.30.11-150500.1.1.x86_64.rpm -O ./k8s/kubeadm-1.30.11-150500.1.1.x86_64.rpm
wget https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/x86_64/kubectl-1.30.11-150500.1.1.x86_64.rpm -O ./k8s/kubectl-1.30.11-150500.1.1.x86_64.rpm
wget https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/x86_64/kubelet-1.30.11-150500.1.1.x86_64.rpm -O ./k8s/kubelet-1.30.11-150500.1.1.x86_64.rpm

# 1. 下载依赖包
yumdownloader --archlist=x86_64 --resolve --destdir=./k8s/kubeadm kubeadm
yumdownloader --archlist=x86_64 --resolve --destdir=./k8s/kubectl kubectl
yumdownloader --archlist=x86_64 --resolve --destdir=./k8s/kubelet kubelet

# 2. 安装 kubelet、kubeadm 和 kubectl
sudo rpm -ivh ./k8s/kubeadm/*.rpm
sudo rpm -ivh ./k8s/kubectl/*.rpm
sudo rpm -ivh ./k8s/kubelet/*.rpm

```

修改配置
```shell
sudo vim /etc/sysconfig/kubelet
# 将KUBELET_EXTRA_ARGS 的值设置为
KUBELET_EXTRA_ARGS="--cgroup-driver=systemd"

# 启用 kubelet 以确保它在启动时自动启动
sudo systemctl enable --now kubelet

```

### 5.4 下载K8s依赖镜像

```shell
# 查看初始化所需的镜像
kubeadm config images list

# 拉取镜像
kubeadm config images pull

# 官方下载慢，可以使用阿里云的下载
docker pull registry.aliyuncs.com/google_containers/kube-apiserver:v1.30.11
docker pull registry.aliyuncs.com/google_containers/kube-controller-manager:v1.30.11
docker pull registry.aliyuncs.com/google_containers/kube-scheduler:v1.30.11
docker pull registry.aliyuncs.com/google_containers/kube-proxy:v1.30.11
docker pull registry.aliyuncs.com/google_containers/coredns:v1.11.3
docker pull registry.aliyuncs.com/google_containers/pause:3.9
docker pull registry.aliyuncs.com/google_containers/etcd:3.5.15-0

# 重新打Tag
docker tag registry.aliyuncs.com/google_containers/kube-apiserver:v1.30.11          registry.k8s.io/kube-apiserver:v1.30.11
docker tag registry.aliyuncs.com/google_containers/kube-controller-manager:v1.30.11 registry.k8s.io/kube-controller-manager:v1.30.11
docker tag registry.aliyuncs.com/google_containers/kube-scheduler:v1.30.11          registry.k8s.io/kube-scheduler:v1.30.11
docker tag registry.aliyuncs.com/google_containers/kube-proxy:v1.30.11              registry.k8s.io/kube-proxy:v1.30.11
docker tag registry.aliyuncs.com/google_containers/coredns:v1.11.3                  registry.k8s.io/coredns/coredns:v1.11.3
docker tag registry.aliyuncs.com/google_containers/pause:3.9                        registry.k8s.io/pause:3.9
docker tag registry.aliyuncs.com/google_containers/etcd:3.5.15-0                    registry.k8s.io/etcd:3.5.15-0

# 删除阿里云Tag
docker rmi registry.aliyuncs.com/google_containers/kube-apiserver:v1.30.11
docker rmi registry.aliyuncs.com/google_containers/kube-controller-manager:v1.30.11
docker rmi registry.aliyuncs.com/google_containers/kube-scheduler:v1.30.11
docker rmi registry.aliyuncs.com/google_containers/kube-proxy:v1.30.11
docker rmi registry.aliyuncs.com/google_containers/coredns:v1.11.3
docker rmi registry.aliyuncs.com/google_containers/pause:3.9
docker rmi registry.aliyuncs.com/google_containers/etcd:3.5.15-0

# 查看镜像列表
docker image list

# 导出镜像
./docker_image_tool.sh export ~/k8s-install/images/

```

![](./img/5/k8s安装3.png)

## 六、【仅Master节点】安装HAProxy Keepalived

在 k8s 的高可用配置中，通常使用 haproxy 和 keepalived 作为高可用的组件，对于 k8s 的高可用主要分为两个方面： apiserver 和 etcd。 apiserver 是 k8s 的入口，etcd 则为 k8s 的数据存储。

接下来主要讲述如何对 apiserver 进行高可用的配置，etcd 的高可用配置将在集群的生成的时候，由 kubeadm 进行自行配置。

### 6.1 开放端口

- [CentOS7下配置防火墙放过Keepalived](https://www.cnblogs.com/tanghu/p/12617840.html)
- [centos7 keepalived以及防火墙配置](https://www.cnblogs.com/lgh344902118/p/7737129.html)

```shell
# 添加永久规则允许VRRP协议
sudo firewall-cmd --permanent --add-protocol=vrrp
# 若上述命令报错（协议名称不支持），改用富规则指定协议号
sudo firewall-cmd --permanent --add-rich-rule='rule protocol value="112" accept'

# VRRP默认使用组播地址224.0.0.18。允许相关组播通信
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="224.0.0.18/32" accept'

# HAProxy代理接口
sudo firewall-cmd --permanent --zone=public --add-port=16443/tcp

# 重启防火墙
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-all

# protocols: vrrp
# rich rules: 
#     rule protocol value="112" accept
#     rule family="ipv4" source address="224.0.0.18/32" accept

```

![](./img/5/VIP2.png)

在配置防火墙规则之后，`192.168.137.140` IP仅在Keepalived主节点上，备份节点没有这个ip，备份节点也可以通过这个IP访问到主节点

### 6.2 【在线】安装Keepalived HAProxy
此步骤所有Master节点都要执行

```shell
# 在线安装keepalived haproxy
sudo yum install -y keepalived haproxy

# 离线安装keepalived haproxy
sudo rpm -ivh ~/k8s-install/haproxy/*.rpm
sudo rpm -ivh ~/k8s-install/keepalived/*.rpm

# 备份配置文件
sudo mv /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bakup
sudo mv /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bakup

# 查看配置文件
ll /etc/keepalived/
ll /etc/haproxy/

```

### 6.2 【离线】安装Keepalived HAProxy
此步骤所有Master节点都要执行

```shell
# 离线安装keepalived haproxy
sudo rpm -ivh ./haproxy/*.rpm
sudo rpm -ivh ./keepalived/*.rpm

# 备份配置文件
sudo mv /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bakup
sudo mv /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bakup

# 查看配置文件
ll /etc/keepalived/
ll /etc/haproxy/

```

### 6.3 配置HAProxy
此步骤所有Master节点都要执行

```shell
cat <<EOF | sudo tee /etc/haproxy/haproxy.cfg
global
    log /dev/log    local0
    log /dev/log    local1 notice
    chroot /var/lib/haproxy
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    tcp
    option  tcplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000

frontend https-in
    bind *:16443
    mode tcp
    option tcplog

    default_backend servers-backend

backend servers-backend
    mode tcp
    balance roundrobin
    option tcp-check

    server k8s-master-01 192.168.137.121:6443 check
    server k8s-master-02 192.168.137.122:6443 check
    server k8s-master-03 192.168.137.123:6443 check
EOF

```

### 6.4 配置Keepalived
此步骤每个Master节点执行对应的配置

#### 6.4.1 `192.168.137.121`作为VIP的主节点，配置文件如下
```shell
cat <<EOF | sudo tee /etc/keepalived/keepalived.conf
! Configuration File for keepalived
global_defs {
    router_id LVS_DEVEL
}
vrrp_instance VI_1 {
    state MASTER                    # 设置为主节点
    interface enp0s3                # 网络接口，根据实际情况修改
    virtual_router_id 51            # VRRP 路由ID，主备节点必须相同
    priority 100                    # 优先级，主节点必须高于备份节点
    advert_int 1                    # VRRP通告间隔，单位秒
    unicast_peer {                  # 配置unicast_peers，指定其他两台服务器的IP
        192.168.137.122
        192.168.137.123
    }

    authentication {
        auth_type PASS              # 认证类型
        auth_pass 1234              # 认证密码，主备节点必须相同
    }
    virtual_ipaddress {
        192.168.137.140             # 虚拟IP地址，可以根据实际情况修改
    }
}
EOF

```

#### 6.4.2 `192.168.137.122`作为VIP的备份节点，配置文件如下
```shell
cat <<EOF | sudo tee /etc/keepalived/keepalived.conf
! Configuration File for keepalived
global_defs {
    router_id LVS_DEVEL
}

vrrp_instance VI_1 {
    state BACKUP                    # 设置为备份节点
    interface enp0s3                # 确保使用正确的网络接口名称
    virtual_router_id 51            # VRRP 路由ID，主备节点必须相同
    priority 50                     # 优先级，备份节点必须低于主节点
    advert_int 1                    # VRRP通告间隔，单位秒
    unicast_peer {                  # 配置unicast_peers，指定其他两台服务器的IP
        192.168.137.121
        192.168.137.123
    }

    authentication {
        auth_type PASS              # 认证类型
        auth_pass 1234              # 认证密码，主备节点必须相同
    }

    virtual_ipaddress {
        192.168.137.140             # 虚拟IP地址，与主节点相同
    }
}
EOF

```

#### 6.4.3 `192.168.137.123`作为VIP的备份节点，配置文件如下
```shell
cat <<EOF | sudo tee /etc/keepalived/keepalived.conf
! Configuration File for keepalived
global_defs {
    router_id LVS_DEVEL
}

vrrp_instance VI_1 {
    state BACKUP                    # 设置为备份节点
    interface enp0s3                # 确保使用正确的网络接口名称
    virtual_router_id 51            # VRRP 路由ID，主备节点必须相同
    priority 40                     # 优先级，备份节点必须低于主节点
    advert_int 1                    # VRRP通告间隔，单位秒
    unicast_peer {                  # 配置unicast_peers，指定其他两台服务器的IP
        192.168.137.121
        192.168.137.122
    }

    authentication {
        auth_type PASS              # 认证类型
        auth_pass 1234              # 认证密码，主备节点必须相同
    }

    virtual_ipaddress {
        192.168.137.140             # 虚拟IP地址，与主节点相同
    }
}
EOF

```

### 6.5 启动Keepalived HAProxy
```shell
# 查看配置文件
cat /etc/haproxy/haproxy.cfg
cat /etc/keepalived/keepalived.conf

# 启动服务
sudo systemctl start keepalived
sudo systemctl start haproxy

# 开机自启
sudo systemctl enable --now keepalived
sudo systemctl enable --now haproxy

# 查看状态
sudo systemctl status keepalived
sudo systemctl status haproxy

```
![](./img/5/VIP1.png)

在配置防火墙规则之前，每台机器都有 `192.168.137.140` IP

## 七、【第一个Master节点】使用kubeadm创建集群并配置网络

### 7.1 启动集群主节点

**注意** 离线部署时，需要将 `--image-repository` 设置为本地镜像仓库地址，或者当前服务器上的镜像前缀，否则回出现服务部署找不到镜像的情况

- 【默认】默认的镜像仓库无法访问  `--image-repository=registry.k8s.io`
- 【在线】在线使用阿里云镜像仓库  `--image-repository=registry.aliyuncs.com/google_containers`
- 【离线】离线使用自建镜像仓库    `--image-repository=registry.example.com`

```shell
# 如果离线仓库的前缀为 registry.example.com，给镜像重新打Tag
docker tag registry.k8s.io/kube-apiserver:v1.30.11          registry.example.com/kube-apiserver:v1.30.11
docker tag registry.k8s.io/kube-controller-manager:v1.30.11 registry.example.com/kube-controller-manager:v1.30.11 
docker tag registry.k8s.io/kube-scheduler:v1.30.11          registry.example.com/kube-scheduler:v1.30.11
docker tag registry.k8s.io/kube-proxy:v1.30.11              registry.example.com/kube-proxy:v1.30.11
docker tag registry.k8s.io/coredns/coredns:v1.11.3          registry.example.com/coredns:v1.11.3
docker tag registry.k8s.io/pause:3.9                        registry.example.com/pause:3.9    
docker tag registry.k8s.io/etcd:3.5.15-0                    registry.example.com/etcd:3.5.15-0

```


```shell
# 创建集群
sudo kubeadm init \
  --kubernetes-version=v1.30.11 \
  --control-plane-endpoint=192.168.137.140:16443 \
  --image-repository=registry.k8s.io \
  # --image-repository=registry.aliyuncs.com/google_containers \
  --service-cidr=10.96.0.0/12 \
  --pod-network-cidr=10.244.0.0/16 \
  --upload-certs \
  --cri-socket=unix:///var/run/cri-dockerd.sock

# 查看生成的配置文件
sudo kubectl -n kube-system get cm kubeadm-config -o yaml

# 如果初始化异常，可以使用下面命令重置
sudo kubeadm reset --cri-socket=unix:///var/run/cri-dockerd.sock

```

- `kubernetes-version`: K8s版本，与上面安装的一致
- `--control-plane-endpoint`: 控制面端点，配置VIP的地址 `192.168.137.140` 端口为HAProxy代理的端口
- `apiserver-advertise-address`: master主机内网IP地址
- `image-repository`: 指定阿里云镜像仓库地址。由于kubeadm 默认从官网http://k8s.grc.io下载所需镜像，国内无法访问，因此需要指定阿里云镜像仓库地址
- `service-cidr`: 集群内部虚拟网络，Pod统一访问入口
- `pod-network-cidr`: 定义pod网段为, `10.244.0.0/16`

执行后打印的日志信息
```shell
# 等待成功后按照提示配置访问的.kube/config即可
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of the control-plane node running the following command on each as root:

  kubeadm join 192.168.137.140:16443 --token qcijsr.wrehhv9qqqic9ce6 \
        --discovery-token-ca-cert-hash sha256:19a7d01e6cb761d17cbd3fae2bd40ebb25eeb833ad12c3110b5c0f26057e46f1 \
        --control-plane --certificate-key 3f3d619638bb3cb780d9a54bc2153d61996c9a367d79e8f584992fa961d2659b

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.137.140:16443 --token qcijsr.wrehhv9qqqic9ce6 \
        --discovery-token-ca-cert-hash sha256:19a7d01e6cb761d17cbd3fae2bd40ebb25eeb833ad12c3110b5c0f26057e46f1
```
![](./img/5/k8s安装4.png)
![](./img/5/k8s安装5.png)

### 7.2 配置Master节点

```shell
# 按照安装完成的提示执行命令（此时需要使用普通用户）
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 获取节点信息和pod信息
kubectl get nodes
kubectl get pods --all-namespaces

```
![](./img/5/k8s安装6.png)

## 八、【其他Master节点】Master节点加入集群

### 8.1 节点初始化
按顺序执行上面 【三、四、五】 的所有配置及安装命令，此处不再重复

**注意** 在 `192.168.137.122` `192.168.137.123` 需要按照 【六】 的步骤安装配置HAProxy keepalived

### 8.2 环境检查

```shell
# 查看Docker版本
docker version

# 查看K8s版本
kubeadm version 

kubectl version --client

kubelet --version

```
![](./img/5/Master节点加入1.png)

### 8.3 加入Master节点
#### 8.3.1 生成加入集群的Token
```shell
# 在Master节点打印加入节点指令
sudo kubeadm token create --print-join-command

# 输出内容如下
kubeadm join 192.168.137.140:16443 --token lp0sqf.ikkxltrxmirs15zn \
  --discovery-token-ca-cert-hash sha256:1dfe993019b8a38fa80357e0a91490c7e2fc0ab3a0a3b16ddc4c7644af04a4ae

```

#### 8.3.2 初始化Master节点时上传证书到 etcd 中
```shell
# 在Master节点执行上传证书指令
sudo kubeadm init phase upload-certs --upload-certs

# 输出内容如下
[diginn@k8s-master-01 k8s]$ sudo kubeadm init phase upload-certs --upload-certs
I0326 14:09:10.693417   10336 version.go:256] remote version is much newer: v1.32.3; falling back to: stable-1.30
[upload-certs] Storing the certificates in Secret "kubeadm-certs" in the "kube-system" Namespace
[upload-certs] Using certificate key:
273174b4ecf9ae7ea9e366cbfe26895f5de0e5a41f1aca60a52a86bc59d10758

```

#### 8.3.3 加入新的Master节点
```shell
sudo kubeadm join 192.168.137.140:16443 --token qcijsr.wrehhv9qqqic9ce6 \
        --discovery-token-ca-cert-hash sha256:19a7d01e6cb761d17cbd3fae2bd40ebb25eeb833ad12c3110b5c0f26057e46f1 \
        --control-plane --certificate-key 3f3d619638bb3cb780d9a54bc2153d61996c9a367d79e8f584992fa961d2659b \
        --cri-socket=unix:///var/run/cri-dockerd.sock

```

**注意** 要加上`-control-plane` `--certificate-key` ，不然就会添加为node节点而不是master

![](./img/5/Master节点加入2.png)
![](./img/5/Master节点加入3.png)

![](./img/5/Master节点加入4.png)
![](./img/5/Master节点加入5.png)

### 8.4 在主Master节点查看新的节点是否成功加入

```shell
kubectl get nodes

kubectl get pods --all-namespaces

```
![](./img/5/Master节点加入6.png)

## 九、【所有Node节点】Node节点加入集群

### 9.1 Node节点初始化
按顺序执行上面 【三、四、五】 的所有配置及安装命令，此处不再重复

### 9.2 环境检查

```shell
# 查看Docker版本
docker version

# 查看K8s版本
kubeadm version 

kubectl version --client

kubelet --version

```
![](./img/5/Node节点加入1.png)

### 9.3 加入Node节点

```shell
# 在Master节点打印加入节点指令
kubeadm token create --print-join-command

# 指定运行时（添加--cri-socket参数）
sudo kubeadm join 192.168.137.140:16443 --token qcijsr.wrehhv9qqqic9ce6 \
  --discovery-token-ca-cert-hash sha256:19a7d01e6cb761d17cbd3fae2bd40ebb25eeb833ad12c3110b5c0f26057e46f1 \
  --cri-socket=unix:///var/run/cri-dockerd.sock

```

![](./img/5/Node节点加入2.png)

### 9.4 在主Master节点查看新的节点是否成功加入

由于需要等待 `Master` 下发镜像及Pod启动，需要等待2分钟左右Node的状态才会变成`Ready`
```shell
kubectl get nodes

kubectl get pods --all-namespaces

```
![](./img/5/Node节点加入3.png)


## 十、【第一个Master节点】网络插件安装及证书延期
### 10.1 开放端口(calico)

根据安装的网络插件不同，这里需要开放的端口也不同

```shell
# BGP 端口
sudo firewall-cmd --permanent --add-port=179/tcp

# 根据封装模式选择 IP-in-IP 或 VXLAN
# IP-in-IP
sudo firewall-cmd --permanent --add-rich-rule='rule protocol value="4" accept'
# 或 VXLAN
sudo firewall-cmd --permanent --add-port=8472/udp

# Typha 端口（若启用）
sudo firewall-cmd --permanent --add-port=5473/tcp

# 指标端口（按需）
sudo firewall-cmd --permanent --add-port=9099/tcp
sudo firewall-cmd --permanent --add-port=9091/tcp

# CoreDNS需要的端口
sudo firewall-cmd --permanent --add-port=53/udp

# 重启防火墙
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-port

# 查看防火墙所有规则
sudo firewall-cmd --list-all
``` 

### 10.2 安装Calico网络服务
```shell
mkdir -p ~/k8s-install/calico/ && cd ~/k8s-install/

# 下载calico.yaml
# wget https://raw.githubusercontent.com/projectcalico/calico/refs/heads/release-v3.25/manifests/calico.yaml -0 ./calico/calico.yaml
curl -sSLf https://docs.tigera.io/archive/v3.25/manifests/calico.yaml -o ./calico/calico.yaml

# 修改配置文件中的 CALICO_IPV4POOL_CIDR
sudo vim ./calico/calico.yaml

# 在 CLUSTER_TYPE 后添加 IP_AUTODETECTION_METHOD value 为网卡名称
# Cluster type to identify the deployment type
- name: CLUSTER_TYPE
  value: "k8s,bgp"
- name: IP_AUTODETECTION_METHOD
  value: "interface=enp0s3"

# ...

# 此处value和kubeadm init的 --pod-network-cidr 一致
# - name: CALICO_IPV4POOL_CIDR
#   value: "192.168.0.0/16"
- name: CALICO_IPV4POOL_CIDR
  value: "10.244.0.0/16"

# 启动calico
kubectl apply -f ./calico/calico.yaml

# 如果有异常，可以使用下面命令删除重新安装
kubectl delete -f ./calico/calico.yaml

```
![](./img/5/k8s安装7.png)
![](./img/5/k8s安装8.png)

### 10.3 检查节点状态
等待 calico 容器镜像下载启动完成，可能需要几分钟
```shell
kubectl get nodes

kubectl get pods --all-namespaces

```

![](./img/5/k8s安装9.png)

### 10.4 检查CoreDNS是否正常
安装 Pod 网络后，你可以通过在 `kubectl get pods --all-namespaces` 输出中检查 CoreDNS Pod 是否 Running 来确认其是否正常运行。 一旦 CoreDNS Pod 启用并运行，你就可以继续加入节点。

```shell
kubectl get pods --all-namespaces | grep coredns

# 查看日志及状态
kubectl logs -n kube-system coredns-cb4864fb5-4mj8d

kubectl describe pod -n kube-system coredns-cb4864fb5-4mj8d

```

### 10.5 控制平面节点隔离
默认情况下，出于安全原因，你的集群不会在控制平面节点上调度 Pod。 如果你希望能够在单机 Kubernetes 集群等控制平面节点上调度 Pod，请运行：
```shell
# 允许pod运行在控制平面节点
kubectl taint nodes --all node-role.kubernetes.io/control-plane-

```

### 10.6 延长证书使用时间，方便管理

1. 查看当前有效期

```shell
# 查看有效期
openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep Not

# 输出以下结果，默认只有一年的有效期
[diginn@k8s-master-01 k8s]$ openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep Not
            Not Before: Mar 26 07:14:03 2025 GMT
            Not After : Mar 26 07:19:03 2026 GMT

# 查看各项服务证书的有效期
sudo kubeadm certs check-expiration

```

![](./img/5/证书有效期1.png)


2. 延长证书有效期[更新K8s证书有效期脚本](https://github.com/yuyicai/update-kube-cert)

```shell
cd ~/k8s-install/

# 下载脚本
wget https://raw.githubusercontent.com/yuyicai/update-kube-cert/refs/heads/master/update-kubeadm-cert.sh  -O ./update-kubeadm-cert.sh

# 执行脚本
chmod +x ./update-kubeadm-cert.sh
sudo ./update-kubeadm-cert.sh all

# 查看有效期
openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep Not

# 查看各项服务证书的有效期
sudo kubeadm certs check-expiration

```

![](./img/5/证书有效期2.png)
![](./img/5/证书有效期3.png)

可以看到，服务及CA证书都延长到了10年


## 十一、安装Dashboard
- [kubernetes系列(十六) - Helm安装和入门](https://www.cnblogs.com/baoshu/p/13296659.html)
- [kubernetes系列(十七) - 通过helm安装dashboard详细教程](https://www.cnblogs.com/baoshu/p/13326480.html)

Kubernetes仪表板是Kubernetes集群的通用、基于Web的UI。它允许用户管理集群中运行的应用程序并对其进行故障排除，以及管理集群本身。

从7.x版开始，不再支持基于Manifest的安装。现在只支持基于Helm的安装。由于多容器设置和对Kong网关API代理的严重依赖 要轻松支持基于清单安装是不可行的。

### 11.1 Helm安装
```shell
mkdir -p ~/k8s-install/helm/ && cd ~/k8s-install/

# Helm 下载
wget https://get.helm.sh/helm-v3.17.2-linux-amd64.tar.gz -O ./helm/helm-v3.17.2-linux-amd64.tar.gz

# 解压
tar -zxvf ./helm/helm-v3.17.2-linux-amd64.tar.gz

# 移动到bin目录
sudo mv ./linux-amd64/helm  /usr/bin/

# 查看版本
helm version

# 安装命令补全
sudo yum install -y bash-completion

echo "source <(helm completion bash)" >> ~/.bashrc

```

### 11.2 【仅在线】配置Dashboard仓库并拉取默认配置
```shell
# 添加helmhub上的dashboard官方repo仓库
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/

# 查看添加完成后的仓库
helm repo list

# 查询dashboard的chart
helm search repo kubernetes-dashboard

# 新建文件夹用于保存chart
mkdir -p dashboard-chart && cd dashboard-chart

# 拉取chart
helm pull kubernetes-dashboard/kubernetes-dashboard

# 此时会有一个压缩包，默认下载的是最新版本，可能与kubernates版本不兼容，需要去github确认
tar -zxvf kubernetes-dashboard-7.11.1.tgz

# 进入到解压后的文件夹
cd kubernetes-dashboard

```

如果下载较慢，可以从Github直接下载后上传到服务器
```shell
mkdir -p ~/k8s-install/dashboard/ && cd ~/k8s-install/

# 最后一个确认支持 kubernates 1.30 的 dashboard 版本 
wget https://github.com/kubernetes/dashboard/releases/download/kubernetes-dashboard-7.7.0/kubernetes-dashboard-7.7.0.tgz -O ./dashboard/kubernetes-dashboard-7.7.0.tgz

# 安装所需的容器镜像也可以在 release页面找到 https://github.com/kubernetes/dashboard/releases/tag/kubernetes-dashboard-7.7.0
docker pull kubernetesui/dashboard-api:1.8.1
docker pull kubernetesui/dashboard-auth:1.1.3
docker pull kubernetesui/dashboard-metrics-scraper:1.1.1
docker pull kubernetesui/dashboard-web:1.4.0

```

### 11.3 修改Dashboard配置并安装

```shell
# 解压
tar -zxvf ./dashboard/kubernetes-dashboard-7.7.0.tgz
cd kubernetes-dashboard

# 备份原始配置文件
cp values.yaml values.yaml.bakup

# 修改配置
vim values.yaml

# 如果使用Nginx代理，可以在此处配置域名
ingress:
  enabled: false
  hosts:
    # Keep 'localhost' host only if you want to access Dashboard using 'kubectl port-forward ...' on:
    # https://localhost:8443
    - dashboard.example.com


# 安装Dashboard  执行路径在values.yaml目录
helm install kubernetes-dashboard . --create-namespace --namespace kubernetes-dashboard -f values.yaml

# 查看Helm部署的资源
helm ls --namespace kubernetes-dashboard

# 查看dashboard pod
kubectl get pods -n kubernetes-dashboard -o wide

# 查看服务端口信息
kubectl get svc -n kubernetes-dashboard

```

![](./img/5/Dashboard1.png)

### 11.4 创建Token

```shell
cat > dashboard-adminuser.yaml << EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
---
apiVersion: v1
kind: Secret
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: "admin-user"
type: kubernetes.io/service-account-token
EOF

# 创建账户 授予角色权限 创建Token
kubectl apply -f dashboard-adminuser.yaml

# 获取token
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d

eyJhbGciOiJSUzI1NiIsImtpZCI6IjJtWTBjMHlsN2tSVkVaamI1WGU0YTZkMi1EclRfUXdBLUdnR3VFRDl1QTAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIyZDAxMDdkYy04YTk3LTQ2YjItOTMwMC1iOGMyNGIzZTdkNGEiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.k9ndYMW8yKPkZUg-EXkNDM9Uye7OdbZAo5JvfEb9Nad77KQigh6tCplWeYNXuOzjo0H1s7Huy4Jkwv5z7fvybI_y7RjjOGrtTnrYXEsMlXi7y8Gm0YYthnCiYYBU-Jwkk6rreJOpHoJ2hjryQgfQx3rS85fBtn8KdjronMFor3ZTCqSk1QTI387EzOgnLJ5YbJLdQJVCxheIr6Aso6bwKYk7H9lDKCP684cgsYJ-ZbRuYe2Ec-Mr2u_OvoLckGgojJSqNbVJ1zMBs9sHxuEBYut-TvpdL-HRJDDUTI8Y1mBZlS6l4rYUANcC6qVufQAbQq8FNMB_q3qdQzTxt39hzg

kubectl describe secret -n kubernetes-dashboard $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')

```
![](./img/5/Dashboard2.png)

### 11.5 访问Dashboard

如果需要直接使用集群的IP端口访问Dashboard，按照下面配置映射的端口，配置完成后回重新运行新的容器，可能需要等待几分钟
```shell
# 编辑网关对外端口
kubectl edit svc kubernetes-dashboard-kong-proxy -n kubernetes-dashboard

# 修改以下内容
spec:
  type: NodePort
  ports:
  - name: kong-proxy-tls
    nodePort: 30443
    port: 443
    protocol: TCP
    targetPort: 8443

# 检查端口
kubectl get svc -n kubernetes-dashboard

# 查看kong-proxy所在的节点
kubectl get pods -n kubernetes-dashboard -o wide

kubectl logs -n kubernetes-dashboard kubernetes-dashboard-kong-7696bb8c88-c2qkt

```

![](./img/5/Dashboard3.png)

- 浏览器访问 `https://192.168.137.131:30443`，输入前面生成的Token即可访问页面

![](./img/5/Dashboard4.png)

### 11.6 删除Dashboard
```shell
# 用Helm卸载 Dashboard
[diginn@k8s-master-01 k8s]$ helm -n kubernetes-dashboard uninstall kubernetes-dashboard
release "kubernetes-dashboard" uninstalled
[diginn@k8s-master-01 k8s]$

# 检查pod是否存在
[diginn@k8s-master-01 k8s]$ kubectl -n kubernetes-dashboard get pods
No resources found in kubernetes-dashboard namespace.
[diginn@k8s-master-01 k8s]$

# 检查service是否存在
[diginn@k8s-master-01 k8s]$ kubectl -n kubernetes-dashboard get svc
No resources found in kubernetes-dashboard namespace.
[diginn@k8s-master-01 k8s]$

# 删除命名空间
[diginn@k8s-master-01 k8s]$ kubectl delete namespace kubernetes-dashboard
namespace "kubernetes-dashboard" deleted

```

## 十二、常用命令
- [k8s 操作命令 合集](https://www.cnblogs.com/kangao/p/17526694.html)

### 初始化常用
```shell
# 重置当前节点 将 kubeadm init 及  kubeadm join生成的内容重置
sudo kubeadm reset --cri-socket=unix:///var/run/cri-dockerd.sock

# 获取所有节点
kubectl get nodes

# 获取所有Pod
kubectl get pods --all-namespaces

# 创建资源对象
kubectl create -f calico.yaml

# 删除资源对象
kubectl delete -f calico.yaml

kubectl logs -n kube-system calico-node-hqf25
```

### 12.1 基础操作命令
```shell
kubectl get pods -o=json
kubectl get pods -o=yaml
kubectl get pods -o=wide
kubectl get pods -n=<namespace_name>
kubectl create -f ./
kubectl logs -l name=
```

### 12.2 资源相关
```shell
# 创建资源对象
kubectl create -f <file.yaml>

# 删除资源对象
kubectl delete -f <file.yaml>
```

### 12.3 集群相关
```shell
kubectl cluster-info – Display endpoint information about the master and services in the cluster.
kubectl version – Display the Kubernetes version running on the client and server.
kubectl config view – Get the configuration of the cluster.
kubectl config view -o jsonpath='{.users[*].name}' – Get a list of users.
kubectl config current-context – Display the current context.
kubectl config get-contexts – Display a list of contexts.
kubectl config use-context – Set the default context.
kubectl api-resources – List the API resources that are available.
kubectl api-versions – List the API versions that are available. kubectl get all --all-namespaces

```

### 12.4 Daemonsets 相关
```shell
kubectl get daemonset – List one or more daemonsets.
kubectl edit daemonset <daemonset_name> – Edit and update the definition of one or more daemonset.
kubectl delete daemonset <daemonset_name> – Delete a daemonset.
kubectl create daemonset <daemonset_name> – Create a new daemonset.
kubectl rollout daemonset – Manage the rollout of a daemonset.
kubectl describe ds <daemonset_name> -n <namespace_name> – Display the detailed state of daemonsets within a namespace.

```

### 12.5 Deployments相关
```shell
kubectl get deployment – List one or more deployments.
kubectl describe deployment <deployment_name> – Display the detailed state of one or more deployments.
kubectl edit deployment <deployment_name> – Edit and update the definition of one or more deployments on the server.
kubectl create deployment <deployment_name> – Create a new deployment.
kubectl delete deployment <deployment_name> – Delete deployments.
kubectl rollout status deployment <deployment_name> – See the rollout status of a deployment.
kubectl set image deployment/ =image: – Perform a rolling update (K8S default), set the image of the container to a new version for a particular deployment.
kubectl rollout undo deployment/ – Rollback a previous deployment.
kubectl replace --force -f – Perform a replace deployment — Force replace, delete and then re-create the resource.

```

### 12.6 事件相关
```shell
kubectl get events – List recent events for all resources in the system.
kubectl get events –field-selector type=Warning – List Warnings only.
kubectl get events --sort-by=.metadata.creationTimestamp – List events sorted by timestamp.
kubectl get events --field-selector involvedObject.kind!=Pod – List events but exclude Pod events.
kubectl get events --field-selector involvedObject.kind=Node, involvedObject.name=<node_name> – Pull events for a single node with a specific name.
kubectl get events --field-selector type!=Normal – Filter out normal events from a list of events.

```

### 12.7 日志相关
```shell
kubectl logs <pod_name> – Print the logs for a pod.
kubectl logs --since=6h <pod_name> – Print the logs for the last 6 hours for a pod.
kubectl logs --tail=50 <pod_name> – Get the most recent 50 lines of logs.
kubectl logs -f <service_name> [-c <$container>] – Get logs from a service and optionally select which container.
kubectl logs -f <pod_name> – Print the logs for a pod and follow new logs.
kubectl logs -c <container_name> <pod_name> – Print the logs for a container in a pod.
kubectl logs <pod_name> pod.log – Output the logs for a pod into a file named ‘pod.log'.
kubectl logs --previous <pod_name> – View the logs for a previously failed pod.

```

### 12.8 Namespace 相关
```shell
kubectl create namespace <namespace_name> – Create a namespace.
kubectl get namespace <namespace_name> – List one or more namespaces.
kubectl describe namespace <namespace_name> – Display the detailed state of one or more namespaces.
kubectl delete namespace <namespace_name> – Delete a namespace.
kubectl edit namespace <namespace_name> – Edit and update the definition of a namespace.
kubectl top namespace <namespace_name> – Display Resource (CPU/Memory/Storage) usage for a namespace.

```

### 12.9 Nodes 相关
```shell
kubectl taint node <node_name> – Update the taints on one or more nodes.
kubectl get node – List one or more nodes.
kubectl delete node <node_name> – Delete a node or multiple nodes.
kubectl top node <node_name> – Display Resource usage (CPU/Memory/Storage) for nodes.
kubectl get pods -o wide | grep <node_name> – Pods running on a node.
kubectl annotate node <node_name> – Annotate a node.
kubectl cordon node <node_name> – Mark a node as unschedulable.
kubectl uncordon node <node_name> – Mark node as schedulable.
kubectl drain node <node_name> – Drain a node in preparation for maintenance.
kubectl label node – Add or update the labels of one or more nodes.

```

### 12.10 Pods 操作相关
```shell
kubectl get pod – List one or more pods.
kubectl get pods --sort-by='.status.containerStatuses[0].restartCount' – List pods Sorted by Restart Count.
kubectl get pods --field-selector=status.phase=Running – Get all running pods in the namespace.
kubectl delete pod <pod_name> – Delete a pod.
kubectl describe pod <pod_name> – Display the detailed state of a pods.
kubectl create pod <pod_name> – Create a pod.
kubectl exec <pod_name> -c <container_name> – Execute a command against a container in a pod. Read more: Using Kubectl Exec: Connect to Your Kubernetes Containers
kubectl exec -it <pod_name> /bin/sh – Get an interactive shell on a single-container pod.
kubectl top pod – Display Resource usage (CPU/Memory/Storage) for pods.
kubectl annotate pod <pod_name> – Add or update the annotations of a pod.
kubectl label pods <pod_name> new-label= – Add or update the label of a pod.
kubectl get pods --show-labels – Get pods and show labels.
kubectl port-forward : – Listen on a port on the local machine and forward to a port on a specified pod.

```

### 12.11 Replication Controller 相关
```shell
kubectl get rc – List the replication controllers.
kubectl get rc --namespace=”<namespace_name>” – List the replication controllers by namespace.

```

### 12.12 ReplicaSets 相关
```shell
kubectl get replicasets – List ReplicaSets.
kubectl describe replicasets <replicaset_name> – Display the detailed state of one or more ReplicaSets.
kubectl scale --replicas=[x] – Scale a ReplicaSet.

```

### 12.13 Sercrets 相关
```shell
kubectl create secret – Create a secret.
kubectl get secrets – List secrets.
kubectl describe secrets – List details about secrets.
kubectl delete secret <secret_name> – Delete a secret.

```

### 12.14 Services 相关
```shell
kubectl get services – List one or more services.
kubectl describe services – Display the detailed state of a service.
kubectl expose deployment [deployment_name] – Expose a replication controller, service, deployment, or pod as a new Kubernetes service.
kubectl edit services – Edit and update the definition of one or more services

```

### 12.15 Service Account相关
```shell
kubectl get serviceaccounts – List service accounts.
kubectl describe serviceaccounts – Display the detailed state of one or more service accounts.
kubectl replace serviceaccount – Replace a service account.
kubectl delete serviceaccount <service_account_name> – Delete a service account

```

### 12.16 StatefulSets 相关
```shell
kubectl get statefulset – List StatefulSet
kubectl delete statefulset/[stateful_set_name] --cascade=false – Delete StatefulSet only (not pods).

```

### 12.17 常用参数
| 参数                | 说明                                                 |
| ------------------- | ---------------------------------------------------- |
| `-n <namespace>`    | 指定命名空间（如 `kubectl get pods -n kube-system`） |
| `--all-namespaces`  | 跨所有命名空间操作                                   |
| `-o yaml/json/wide` | 指定输出格式                                         |
| `--dry-run=client`  | 模拟执行（生成YAML但不创建资源）                     |

### 12.18 注意事项
1. 使用 `--force --grace-period=0` 强制删除资源时需谨慎（可能导致数据不一致）。
2. 查看日志时，若Pod有多个容器，需指定容器名：`kubectl logs <pod-name> -c <container-name>`。
3. 复杂操作建议优先使用YAML文件（`kubectl apply -f`）。

## 十三、K8s网络设计

在K8s的安装使用过程中，最复杂也最难排查的问题通常都是网络问题，K8s的设计决定了网络结构的复杂度，可以用AI梳理一下K8s的网络模型

理解 Kubernetes（K8s）网络需要从它的设计理念、核心组件及网络模型入手。K8s 网络模型旨在解决容器化应用中复杂的通信需求，以下是逐步拆解的关键点：

---

### 1. K8s 网络的核心需求
K8s 网络需满足以下基本条件：
1. **Pod 间直接通信**  
   - 所有 Pod 可以直接通过 IP 地址通信，无需 NAT。
   - 无论 Pod 是否在同一节点上，网络必须支持跨节点通信。
2. **节点与 Pod 通信**  
   - 节点（物理机/虚拟机）可以直接访问其上的 Pod。
3. **Service 抽象**  
   - 通过 Service 为一组 Pod 提供稳定的虚拟 IP（ClusterIP）和 DNS 名称。
   - 支持负载均衡和流量转发。
4. **外部访问**  
   - 通过 `Ingress` 或 `LoadBalancer` 类型 Service 暴露服务到集群外部。

---

### 2. K8s 网络模型设计
K8s 本身不直接实现网络功能，而是定义了一套标准模型，依赖插件（CNI）实现。核心设计如下：

#### 1. **Pod 网络**
- **每个 Pod 拥有独立 IP**  
  - Pod 内的容器共享网络命名空间，通过 `localhost` 直接通信。
  - 每个 Pod 的 IP 在整个集群中唯一（称为 `Pod IP`）。
- **跨节点通信**  
  - 不同节点上的 Pod 可以直接通信，无需 NAT。  
  - 由 CNI 插件（如 Calico、Flannel、Cilium 等）实现底层网络隧道（如 VXLAN、IPIP）或路由策略。

#### 2. **Service 网络**
- **Service 的虚拟 IP（ClusterIP）**  
  - Service 不是实体组件，而是通过 `kube-proxy` 在节点上配置的 iptables/IPVS 规则实现。
  - 流量从 Service IP 转发到后端 Pod（负载均衡）。
- **DNS 服务发现**  
  - CoreDNS 为 Service 提供 DNS 记录（如 `my-svc.my-namespace.svc.cluster.local`）。

#### 3. **网络插件（CNI）**
- **CNI 的作用**  
  - 负责为 Pod 分配 IP、配置网络接口、路由规则等。
  - 常见插件：Calico（基于 BGP 路由）、Flannel（基于 VXLAN 隧道）、Cilium（基于 eBPF）。
- **选择 CNI 插件的影响**  
  - 性能（如延迟、吞吐量）、网络策略支持（NetworkPolicy）、多集群互联能力等。

#### 4. **网络策略（NetworkPolicy）**
- 通过 `NetworkPolicy` 定义 Pod 间的通信规则（白名单），实现微服务网络安全。
- 需要 CNI 插件支持（如 Calico、Cilium）。

---

### 3. 关键组件详解

#### 1. **kube-proxy**
- **作用**：维护节点上的网络规则，实现 Service 的流量转发。
- **实现方式**：
  - **iptables 模式**：通过 iptables 规则匹配目标 IP 和端口，转发到随机后端 Pod。
  - **IPVS 模式**：基于内核的 IP Virtual Server，性能更高，适合大规模集群。

#### 2. **CoreDNS**
- **作用**：为 Service 和 Pod 提供 DNS 解析服务。
- **记录类型**：
  - `A` 记录：Service 的 ClusterIP。
  - `SRV` 记录：服务端口信息。
  - Pod 的 DNS 记录（需显式配置 `hostname` 和 `subdomain`）。

#### 3. **Ingress Controller**
- **作用**：通过 HTTP/HTTPS 路由规则暴露服务到集群外。
- **常见实现**：Nginx Ingress、Traefik、HAProxy。

---

### 4. 网络通信示例
假设集群中有以下资源：
- Pod A（IP: `10.244.1.2`，节点: Node1）
- Pod B（IP: `10.244.2.3`，节点: Node2）
- Service S（ClusterIP: `10.96.0.10`，后端为 Pod A 和 Pod B）

#### 1. **Pod A → Pod B**
- 直接通过 Pod IP `10.244.2.3` 通信。
- CNI 插件确保跨节点流量通过隧道或路由到达目标节点。

#### 2. **Pod A → Service S**
- 请求发送到 `10.96.0.10:80`。
- `kube-proxy` 通过 iptables/IPVS 将流量转发到 Pod A 或 Pod B。

#### 3. **外部访问 Service S**
- 通过 `NodePort`（如 `30080`）或 `LoadBalancer` 类型的 Service。
- Ingress 控制器根据域名和路径路由到 Service。

---

### 5. 常见问题与排查
1. **Pod 无法跨节点通信**  
   - 检查 CNI 插件是否安装，节点防火墙是否开放 VXLAN/BGP 端口。
2. **Service 无法访问**  
   - 检查 `kube-proxy` 是否运行，iptables/IPVS 规则是否正确。
3. **DNS 解析失败（CoreDNS Pending）**  
   - 确保网络插件已安装，CoreDNS Pod 调度正常（如容忍主节点污点）。

---

### 6. 总结
K8s 网络的核心是 **Pod 直接通信 + Service 抽象 + CNI 插件实现**，理解其分层模型和组件协作是关键。实际应用中需根据场景选择合适的 CNI 插件，并通过 `kubectl describe`、`kubectl logs` 等工具排查网络问题。

## 十四、问题

### 1. 加入新的Master节点时报错 `cluster that doesn't have a stable controlPlaneEndpoint address`

```shell
[diginn@centos ~]$ sudo kubeadm join 192.168.137.121:6443 --token dvoeut.f4ebwfjuvxfrq8en \
>   --discovery-token-ca-cert-hash sha256:6dc91db6dcca58593100b04e03f2f534490fdecdcdb19717775fb7940df32c35 \
>   --control-plane --certificate-key a42a3d42d713581b588a689b64cc78c47bed8c320c01e763ccc358abde775918 \
>   --cri-socket=unix:///var/run/cri-dockerd.sock
[sudo] diginn 的密码：
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
error execution phase preflight:
One or more conditions for hosting a new control plane instance is not satisfied.

unable to add a new control plane instance to a cluster that doesn't have a stable controlPlaneEndpoint address

Please ensure that:
* The cluster has a stable controlPlaneEndpoint address.
* The certificates that must be shared among control plane instances are provided.


To see the stack trace of this error execute with --v=5 or higher
```
![](./img/5/加入Master节点异常1.png)

#### 解决
如果在第一个集群使用kubeadm初始化时没有指定vip则会出现上述报错

1. 在主master节点查看 `kubeadm-config.yaml`
```shell
kubectl -n kube-system get cm kubeadm-config -o yaml | grep controlPlaneEndpoint

```
如果没有筛选到 `controlPlaneEndpoint` ，代表初始化时没有配置

2. 编辑`kubeadm-config`，添加`controlPlaneEndpoint`
```shell
kubectl -n kube-system edit cm kubeadm-config

```

```yaml
data:
  ClusterConfiguration: |
    apiServer:
      timeoutForControlPlane: 4m0s
    apiVersion: kubeadm.k8s.io/v1beta3
    certificatesDir: /etc/kubernetes/pki
    clusterName: kubernetes
    # 此处加加入高可用vip
    controlPlaneEndpoint: 192.168.137.140:16443
    controllerManager: {}
    dns: {}

```


![](./img/5/加入Master节点异常2.png)

### 2. Calico 服务运行异常
- [记录一次K8s 集群故障（路由&Calico）](https://blog.csdn.net/qq_43024789/article/details/136127430)

集群在加入节点后 `calico-node` 服务运行状态异常
![](./img/5/Calico运行异常1.png)

#### 解决

calico各节点之间通讯需要开放一些端口，端口开放后访问正常
```shell
# BGP 端口
sudo firewall-cmd --permanent --add-port=179/tcp

# 根据封装模式选择 IP-in-IP 或 VXLAN
# IP-in-IP
sudo firewall-cmd --permanent --add-rich-rule='rule protocol value="4" accept'
# 或 VXLAN
sudo firewall-cmd --permanent --add-port=8472/udp

# Typha 端口（若启用）
sudo firewall-cmd --permanent --add-port=5473/tcp

# 指标端口（按需）
sudo firewall-cmd --permanent --add-port=9099/tcp
sudo firewall-cmd --permanent --add-port=9091/tcp

# 重启防火墙
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-port

# 查询所有calico-node 
kubectl get pods -n kube-system -l k8s-app=calico-node

# 删除所有calico-node 
kubectl delete pods -n kube-system -l k8s-app=calico-node

```
![](./img/5/Calico运行异常2.png)

### 3. Dashboard访问异常
访问Dashboard时报错
```shell
failed the initial dns/balancer resolve for 'kubernetes-dashboard-web' with: failed to receive reply from UDP server 10.96.0.10:53: no route to host.

request_id: d4fe874d5f8e335cd8fdb52ae1d33c04

```
![](./img/5/Dashboard访问异常1.png)

这个问题也属于网络问题的范畴，通常是CoreDNS的问题
```shell
# 查找CoreDNS Pod
kubectl get pods -n kube-system -l k8s-app=kube-dns

# 查看日志是否有异常
kubectl logs -n kube-system coredns-cb4864fb5-4mj8d
kubectl logs -n kube-system coredns-cb4864fb5-gxrdp

# 确认CoreDNS的ip
kubectl get svc -n kube-system kube-dns

# 确认防火墙的放行规则
sudo firewall-cmd --list-port

# 进入容器内部交互模式
kubectl exec -it -n kube-system coredns-cb4864fb5-4mj8d -- sh

```

![](./img/5/Dashboard访问异常2.png)

```shell
# 1. 所有节点开放CoreDNS相关端口
sudo firewall-cmd --permanent --add-port=53/tcp
sudo firewall-cmd --permanent --add-port=53/udp
sudo firewall-cmd --permanent --add-port=9153/udp
# DHCP端口
sudo firewall-cmd --permanent --add-port=67/udp
sudo firewall-cmd --permanent --add-port=68/udp
sudo firewall-cmd --reload


# 2. 在Master节点上删除 coredns 和 calico-node 相关pods，等待重建
kubectl delete pods -n kube-system -l k8s-app=calico-node
kubectl delete pods -n kube-system -l k8s-app=kube-dns

# 3. 在Master节点上删除 kubernetes-dashboard 相关pods，等待重建
kubectl get pods -n kubernetes-dashboard
kubectl delete pods --all -n kubernetes-dashboard

# 4. 验证
sudo firewall-cmd --list-all
kubectl get pods --all-namespaces -o wide

```
![](./img/5/Dashboard访问异常3.png)
![](./img/5/Dashboard访问异常4.png)

