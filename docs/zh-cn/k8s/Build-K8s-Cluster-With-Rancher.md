[使用Rancher搭建K8s集群](https://blog.csdn.net/cqconelin/article/details/130056661)

## 1. 集群配置
- Rancher version: 2.6.3
- Server:

| Node       | CPU     | Memory | Disk | OS         |
| ---------- | ------- | ------ | ---- | ---------- |
| k8s-master | 16 Core | 16G    | 80G  | CentOS 7.5 |
| k8s-node-1 | 16 Core | 16G    | 80G  | CentOS 7.5 |
| k8s-node-2 | 16 Core | 16G    | 80G  | CentOS 7.5 |


## 2. 环境初始化
1. 将桥接的IPv4流量传递到iptables的链，并修改 `/etc/sysctl.conf`
    ```shell
    # 修改/etc/sysctl.conf
    cat > /etc/sysctl.conf << EOF
    net.ipv4.ip_forward = 1
    net.bridge.bridge-nf-call-iptables = 1
    net.bridge.bridge-nf-call-ip6tables = 1
    EOF

    # 生效，如果报错可以在docker安装完成后再执行改命令
    sysctl -p /etc/sysctl.conf
    ```

2. 关闭防火墙和Swap分区
    ```shell
    # 关闭防火墙
    systemctl stop firewalld && systemctl disable firewalld
    # 关闭selinux
    sed -i 's/enforcing/disabled/' /etc/selinux/config && setenforce 0 # 永久
    # 看/etc/selinux/config文件中SELINUX=disabled 即可
    sed -i 's/permissive/disabled/' /etc/selinux/config && setenforce 0
    ## 关闭swap
    swapoff -a && sed -ri 's/.*swap.*/#&/' /etc/fstab
   ```

3. 时间同步
    ```shell
    # 时间同步
    yum install ntpdate -y
    ntpdate time.windows.com
    ```

4. 设置服务器节点名称
    ```shell
    # 设置服务器节点名称
    hostnamectl set-hostname k8s-master
    bash
    ```
## 3. Docker安装
1. 删除已存在的Docker
    ```shell
    yum remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-selinux \
        docker-engine-selinux \
        docker-engine
    ```

2. 配置repo源和epel源
    ```shell
    # 先备份原来的源
    mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup 下载新的 CentOS-Base.repo 到 /etc/yum.repos.d/
    wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
    或
    curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
    # 运行 yum makecache 生成缓存
    yum makecache 
    # 安装epel源
    yum -y install epel-release
    yum的'--showduplicates'选项对于显示软件包的多个版本很有用。当您有非常特定的依赖项并尝试查找要
    安装的软件包的特定名称时，它将起着非常大的作用
    # yum list docker --show-duplicates
    ```

3. 安装依赖
    ```shell
    yum -y install yum-utils device-mapper-persistent-data lvm2
    ```

4. 添加Docker源
    ```shell
    yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    ```

5. 安装Docker
    ```shell
    yum makecache fast
    yum -y install docker-ce-19.03.15-3.el7
    ```

6. 配置Docker
    
    可参考[阿里云镜像加速配置](https://www.cnblogs.com/myitnews/p/11509546.html)
    ```shell
    mkdir -p /etc/docker/
    cat > /etc/docker/daemon.json << EOF
    {
    "registry-mirrors": ["https://9cpn8tt6.mirror.aliyuncs.com"]
    }
    EOF
    ```

7. 启动docker
    ```shell
    # 添加开启启动
    systemctl enable docker
    # 更新xfsprogs
    yum -y update xfsprogs
    # 启动
    systemctl start docker
    docker info
    # 测试docker是否已经能够正常使用
    # 启动第一个容器
    docker run hello-world
    ```

## 4. 启动Rancher
1. 启动rancher
    启动时需要添加 `--privileged` 参数
    ```shell
    # docker run -d --restart=unless-stopped --privileged --name rancher -p 80:80 -p 443:443 rancher/rancher:stable
    ```

2. 查看日志
    ```
    如果没有明显的错误就运行成功了
    # docker logs -f rancher
    ```

3. 查看运行状态
    ```
    # docker ps
    ```

4. 在Web界面登录
    ```
    https://rancherIp:7643
    ```

## 5. K8s集群管理
1. 添加一个K8s集群
2. 选择自定义
3. 编写集群信息
   1. 输入集群名称
   2. 选择K8s版本
   3. 选择网络类型 Flannel
   4. 点击下一步
   5. 创建Master节点时上面三个组件（etcd controlPlane Worker）全部勾选，设置Master节点的名称 k8s-master
   6. 复制下面的docker命令在master节点服务器上运行
   7. 点击完成，进入管理页面等待程序启动完成
   8. 集群状态变换成`Active`表示启动完成
4. worker-node添加
   各节点服务器环境及Docker配置好后，运行下面命令加入到K8s集群
   ```shell
   docker run -d --privileged \
   --restart=unless-stopped \
   --net=host \
   -v /etc/kubernetes:/etc/kubernetes 
   -v /var/run:/var/run rancher/rancher-agent:v2.6.3 \
   --server https://internal.pisx.com:7643 \
   --token f4jlvlq88xmfdspqbbv67***************kzmw7sqvqt4z6zshw54 \
   --ca-checksum 82740ea67cd0fe54768778****************c95ceb06266c34ed979b80c29b0 \
   --node-name k8s-node-1 --worker
   ```

| 主机名                 | 组件                           |
| ---------------------- | ------------------------------ |
| --node-name k8s-node-1 | --etcd --controlplane --worker |
| --node-name k8s-node-2 | --etcd --controlplane --worker |

## 6. Kubectl工具的安装
这里是将kubectl工具安装在master上
1. 安装wget
    ```
    yum install -y wget
    ```

2. 下载kubectl
    ```
    wget https://storage.googleapis.com/kubernetes-release/release/v1.18.20/bin/linux/amd64/kubectl
    ```

3. 加x权限
    ```
    chmod +x kubectl
    ```

4. 将kubectl移到PATH中
    ```
    mv kubectl /usr/local/bin/
    ```

5. 查看版本
    ```
    kubectl version --client
    ```

6. 创建kube目录
    ```
    mkdir ~/.kube
    ```

7. 编辑~/.kube/config文件
    ```
    vi ~/.kube/config
    ```

    在Rancher页面中复制配置文件到剪贴板

    然后复制到config文件中，并保存退出。

8. 查看全部Pod状态
    ```
    kubectl get pods -A
    ```

至此Rancher搭建k8s集群完成！