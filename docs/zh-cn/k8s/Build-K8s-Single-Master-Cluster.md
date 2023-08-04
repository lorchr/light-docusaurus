单Master服务器规划：

| 角色   | IP              | 组件 |
| ------ | --------------- | ---- |
| master | 192.168.137.101 |      |
| node1  | 192.168.137.102 |      |
| node2  | 192.168.137.103 |      |

## 1. 环境准备
### 1. 切换及添加安装源
```shell
# 安装 wget
yum -y install wget

# 备份主仓库
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak

# 切换主仓库
wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo

# 设置epel仓库
wget -O /etc/yum.repos.d/epel-7.repo https://mirrors.aliyun.com/repo/epel-7.repo

# 设置Docker仓库
wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 设置K8s源仓库
cat << EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 清除并重建缓存，禁掉GPG验证检查，没有签名的软件安装加这个参数
yum clean all && yum makecache fast --nogpgcheck
```

### 2. 安装依赖
```shell
# 安装epel
yum install -y epel-release

# 安装依赖
yum install -y \
  vim* \
  lrzsz \
  net-tools \
  ifconfig \
  yum-utils \
  netcat \
  ntpdate
```

### 3. 服务器设置
```shell
# 关闭防火墙
systemctl stop firewalld && systemctl disable firewalld

# 关闭selinux
# 永久
sed -i 's/enforcing/disabled/' /etc/selinux/config
# 临时
setenforce 0

# 关闭swap
# 临时
swapoff -a
# 永久
sed -ri 's/.*swap.*/#&/' /etc/fstab
# 检查，确保swap里面没有东西
free -m

# 根据规划设置主机名
hostnamectl set-hostname <hostname>
# 查看修改结果
hostnamectl status
# 修改hosts文件
echo "127.0.0.1 $(hostname)" >> /etc/hosts

# 在master添加hosts
cat >> /etc/hosts << EOF
192.168.137.101 master
192.168.137.102 node1
EOF

# 配置桥接流量
cat << EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

# 将桥接的IPv4流量传递到iptables的链
cat << EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

# 配置生效
sysctl --system

# 时间同步
ntpdate time.windows.com

# 关机 重启
shutdown now 
shutdown -r now
reboot -n
```

## 2. 安装Docker/kubeadm/kubelet
Kubernetes默认CRI（容器运行时）为Docker，因此先安装Docker。

### 1. 安装Docker
- https://docs.docker.com/engine/install/centos/

```shell
# 配置仓库
sudo yum install -y yum-utils
sudo yum-config-manager \
  --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo

# 清除之前的Docker
sudo yum remove docker \
          docker-client \
          docker-client-latest \
          docker-common \
          docker-latest \
          docker-latest-logrotate \
          docker-logrotate \
          docker-engine

# 查看Docker版本
yum list docker-ce --showduplicates | sort -r

# 安装Docker
yum -y install docker-ce-18.06.1.ce-3.el7

# 启动Docker并设置自动重启
systemctl start docker && systemctl enable docker

# 配置镜像下载加速器：
cat > /etc/docker/daemon.json << EOF
{
  "registry-mirrors": ["https://rv4ppfhe.mirror.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF

# 更新配置后重启
systemctl daemon-reload && systemctl restart docker

# 普通用户操作Docker
sudo cat /etc/group | grep docker

# docker用户组不存在则添加用户组
# sudo groupadd docker 

# 将当前用户添加到docker组中
sudo usermod -aG docker $USER
sudo usermod -aG dockerroot $USER

# 开启Docker远程访问
vim /lib/systemd/system/docker.service
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2375

# 查看2375端口是否开启
netstat -nlp | grep docker
```

### 2. 安装Docker Compose

- https://docs.docker.com/compose/install/
- https://docs.docker.com/compose/install/compose-plugin/

```shell
# 安装Docker Compose
yum install -y docker-compose-plugin

# 下载
curl -SL https://github.com/docker/compose/releases/download/v2.7.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 测试
docker-compose version

# 传输文件
scp /usr/local/bin/docker-compose root@192.168.137.102:/usr/local/bin/docker-compose
```

### 3. Docker overlay2占用大量磁盘空间解决办法
1. 首先找到overlay2目录
> cd /var/lib/docker/overlay2

2. 查看文件的大小
> du -h --max-depth=1 /var/lib/docker/overlay2 | grep [MGT] | sort -nr
如下所示，找到大小为500G的文件

3. 查看占用空间的pid，以及对应的容器名称
> docker ps -q | xargs docker inspect --format '{{.State.Pid}}, {{.Name}}, {{.GraphDriver.Data.WorkDir}}' | grep "09151aa1dd70a8884a9f6ab3f31b0b530be8a7a5fb78c25f4f51901440089681"
结果如下：

4. 解决方法（会删除对应的容器和对应镜像）：
> docker stop ainews_processB && docker rm ainews_processB && docker rmi image_id


### 4. 安装K8s
- https://kubernetes.io/docs/getting-started-guides/kubeadm/
- https://kubernetes.io/docs/setup/production-environment/tools/
- https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/

由于版本更新频繁，这里指定版本号部署：
- kubelet：systemd守护进程管理
- kubeadm：部署工具
- kubectl：k8s命令行管理工具

```shell
# 检查Master6443端口占用
nc 127.0.0.1 6443

#  卸载旧版本
yum remove -y kubelet kubeadm kubectl

# 查看k8s的版本
yum list kubelet --showduplicates | sort -r 

# 安装K8s
yum install -y \
  kubelet-1.18.0 \
  kubeadm-1.18.0 \
  kubectl-1.18.0

# 启动kubelet
systemctl start kubelet && systemctl enable kubelet

# 查看kubelet状态
systemctl status kubelet
```

## 3. 初始化K8s Master节点

### 1. 在192.168.137.101（Master）执行初始化命令
```shell
# 查看kubeadm需要下载的镜像
kubeadm config images list 
# 提前下载需要的镜像
# kubeadm config images pull

# 挨个下载以上镜像，由于是国外镜像，使用阿里云镜像仓库下载
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver:v1.18.0
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager:v1.18.0
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler:v1.18.0
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy:v1.18.0
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.2
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/etcd:3.4.3-0
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:1.6.7

# 因为coredns是带二级目录的，所以要多执行这一步
# docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:v1.8.6 registry.cn-hangzhou.aliyuncs.com/google_containers/coredns/coredns:1.6.7

# 查看eth0的inet私有网络地址，复制出来填入apiserver-advertise-address
ip addr

# 初始化Master节点
# image-respository  镜像仓库的地址
# service-cidr pod-network-cidr 设定两个子网范围，不能和apiserver冲突
kubeadm init \
  --apiserver-advertise-address=192.168.137.101 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.18.0 \
  --service-cidr=10.96.0.0/12 \
  --pod-network-cidr=10.244.0.0/16 \
  --ignore-preflight-errors=all
```

打印如下信息成功：
```shell
W0823 17:52:46.436675    8256 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[init] Using Kubernetes version: v1.18.0
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [master kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.137.101]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [master localhost] and IPs [192.168.137.101 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [master localhost] and IPs [192.168.137.101 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
W0823 17:53:10.225513    8256 manifests.go:225] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[control-plane] Creating static Pod manifest for "kube-scheduler"
W0823 17:53:10.226495    8256 manifests.go:225] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 24.503745 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.18" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node master as control-plane by adding the label "node-role.kubernetes.io/master=''"
[mark-control-plane] Marking the node master as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: ftlxtx.pqomr1j82debo3ph
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.137.101:6443 --token ftlxtx.pqomr1j82debo3ph \
    --discovery-token-ca-cert-hash sha256:6406f96f7b11ef7ed750c4da41ac825a63bca63d8dece634197abc23184371ab
```

### 2. 普通用户操作K8s权限
```shell
# 切换到普通用户，给普通用户增加操作k8s的权限
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 查看Master节点的情况
kubectl get nodes

NAME     STATUS     ROLES    AGE     VERSION
master   NotReady   master   2m55s   v1.18.0

 # 查看kubelet日志
journalctl -u kubelet
# 重启kubelet
systemctl daemon-reload && systemctl restart kubelet
```

## 4. 注册K8s Node节点

向集群添加新节点，执行在kubeadm init输出的kubeadm join命令：
```shell
# 如果Token失效，重新生成
kubeadm token create --print-join-command

# 注册从节点
kubeadm join 192.168.137.101:6443 --token ftlxtx.pqomr1j82debo3ph \
    --discovery-token-ca-cert-hash sha256:6406f96f7b11ef7ed750c4da41ac825a63bca63d8dece634197abc23184371ab

# 查看集群节点
kubectl get nodes
NAME     STATUS     ROLES    AGE     VERSION
master   NotReady   master   5m22s   v1.18.0
node1    NotReady   <none>   77s     v1.18.0
```

```shell
W0823 17:57:30.170836    8459 join.go:346] [preflight] WARNING: JoinControlPane.controlPlane settings will be ignored when control-plane flag is not set.
[preflight] Running pre-flight checks
        [WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -oyaml'
[kubelet-start] Downloading configuration for the kubelet from the "kubelet-config-1.18" ConfigMap in the kube-system namespace
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

## 5. 部署容器网络（CNI）
### 1. 在Master节点部署flannel
```shell
# 下载flannel启动文件
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# 查看Pods状态
kubectl get pods -A

# 执行网络安装配置
kubectl apply -f kube-flannel.yml

# 安装完成后查询网络
kubectl get pods -A
# kubectl get pods -n kube-system
```

安装前后执行结果
```shell
# 安装前
[lorch@master ~]$ kubectl get pods -n kube-system
NAME                             READY   STATUS    RESTARTS   AGE
coredns-7ff77c879f-k82td         0/1     Pending   0          5m45s
coredns-7ff77c879f-ldvq8         0/1     Pending   0          5m45s
etcd-master                      1/1     Running   0          5m55s
kube-apiserver-master            1/1     Running   0          5m55s
kube-controller-manager-master   1/1     Running   0          5m55s
kube-proxy-565f8                 1/1     Running   0          5m45s
kube-proxy-hfzcx                 1/1     Running   0          2m
kube-scheduler-master            1/1     Running   0          5m55s

# 安装后
NAMESPACE      NAME                             READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-lm4rc            1/1     Running   0          2m52s
kube-flannel   kube-flannel-ds-vg2db            1/1     Running   0          2m52s
kube-system    coredns-7ff77c879f-k82td         1/1     Running   0          7m43s
kube-system    coredns-7ff77c879f-ldvq8         1/1     Running   0          7m43s
kube-system    etcd-master                      1/1     Running   0          7m53s
kube-system    kube-apiserver-master            1/1     Running   0          7m53s
kube-system    kube-controller-manager-master   1/1     Running   0          7m53s
kube-system    kube-proxy-565f8                 1/1     Running   0          7m43s
kube-system    kube-proxy-hfzcx                 1/1     Running   0          3m58s
kube-system    kube-scheduler-master            1/1     Running   0          7m53s
```

### 2. 给集群打Tag（跳过）
```shell
kubectl label node k8s-node1 node.kubernetes.io/worker=''
# k8s-node1是节点的hostname
# node.kubernetes.io是固定写法不可变
# worker是给节点加的标签
# =''无所谓，''里面可以随便写

# 去除标签采用命令
kubectl label node k8s-node1 node.kubernetes.io/worker-
```

### 3. 设置ipvs模式（跳过）

因为linux默认采用的是iptables模式，性能开销非常大，当你集群节点一多，每个节点的kube-proxy都要去同步iptables，可能一天都同步不完。
```shell
# 查看kube-proxy默认的模式
kubectl logs -n kube-system kube-proxy-565f8

# 打开编辑kube-proxy的配置文件
kubectl edit cm kube-proxy -n kube-system

# 找到如下配置：
ipvs:
   excludeCIDRs: null
   minSyncPeriod: 0s
   scheduler: ""
   strictARP: false
   syncPeriod: 0s
   tcpFinTimeout: 0s
   tcpTimeout: 0s
   udpTimeout: 0s
kind: KubeProxyConfiguration
metricsBindAddress: ""
mode: ""
```
mode中加入ipvs，保存后退出。

### 4. 重启kube-proxy（跳过）
```shell
# 查看所有Pods
kubectl get pod -A -o wide

# 找到kube-proxy-565f8 ，删除他，不用担心他会自动重启，配置就生效了，-n后面跟的是他的命名空间。
kubectl delete pod kube-proxy-565f8 -n kube-system

# 等待重启后重新查看状态
kubectl get pod -A | grep kube-proxy
```

## 6. 部署官方Dashboard（UI）
### 1. 部署Dashboard
```shell
# 下载官方Dashboard文件
wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.3/aio/deploy/recommended.yaml

# 安装官方Dashboard
kubectl apply -f recommended.yaml

# 查看Dashboard启动情况
kubectl get pods -n kubernetes-dashboard

NAME                                         READY   STATUS              RESTARTS   AGE
dashboard-metrics-scraper-6b4884c9d5-94r7k   0/1     ContainerCreating   0          3s
kubernetes-dashboard-7f99b75bf4-xgvf6        0/1     ContainerCreating   0          4s

# 查看Dashboard服务
kubectl get svc -n kubernetes-dashboard

NAME                        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
dashboard-metrics-scraper   ClusterIP   10.110.248.145   <none>        8000/TCP   15h
kubernetes-dashboard        ClusterIP   10.96.248.50     <none>        443/TCP    15h

# 删除现有的Dashboard服务
# 该服务的类型是ClusterIP，不便于我们通过浏览器访问，因此需要改成NodePort型的
kubectl delete service kubernetes-dashboard -n kubernetes-dashboard

# 修改配置
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  # 增加type为 nodePort
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      # 设置映射的端口
      nodePort: 30001
  selector:
    k8s-app: kubernetes-dashboard

# 再次部署
kubectl apply -f recommended.yaml

# 再次查看服务
kubectl get svc -n kubernetes-dashboard

NAME                        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
dashboard-metrics-scraper   ClusterIP   10.110.248.145   <none>        8000/TCP        16h
kubernetes-dashboard        NodePort    10.96.248.50     <none>        443:30001/TCP   16h
```

访问地址：http://192.168.137.101:30001

```shell
kubectl get deployment --namespace=kubernetes-dashboard kubernetes-dashboard
# 或
kubectl describe deployment --namespace=kubernetes-dashboard kubernetes-dashboard

# 查看service
kubectl get service --namespace=kubernetes-dashboard kubernetes-dashboard

# 另外查看pod状态
kubectl get pod --namespace=kubernetes-dashboard -o wide | grep dashboard

# 输出
dashboard-metrics-scraper-6b4884c9d5-94r7k   1/1     Running   1          14h   10.244.1.4   node1   <none>           <none>
kubernetes-dashboard-7f99b75bf4-xgvf6        1/1     Running   1          14h   10.244.1.5   node1   <none>           <none>
```

如果状态一直是 ContainerCreating, 使用describe查看具体过程
```shell
kubectl describe pod --namespace=kubernetes-dashboard

# 输出
Events:
  Type    Reason     Age        From               Message
  ----    ------     ----       ----               -------
  Normal  Scheduled  <unknown>  default-scheduler  Successfully assigned kubernetes-dashboard/kubernetes-dashboard-7b544877d5-cd2b7 to ttg12
  Normal  Pulling    9m36s      kubelet, ttg12     Pulling image "kubernetesui/dashboard:v2.0.0"
```

### 2. 创建ServiceAccount并绑定默认cluster-admin管理员集群角色：

```shell
# 创建用户
kubectl create serviceaccount dashboard-admin -n kube-system

# 用户授权
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin

# 获取用户Token
kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}')

# 使用输出的Token登录Dashboard。

Name:         dashboard-admin-token-9jtrl
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: dashboard-admin
              kubernetes.io/service-account.uid: c5ce8850-1c33-41e7-b17d-336bcde4ec6e

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1025 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6Il9HcDhZZmNiVTVHVTZsbDhxY29DNVUybnYzREZxMFUySGpLYmVxWGtyU1EifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkYXNoYm9hcmQtYWRtaW4tdG9rZW4tOWp0cmwiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGFzaGJvYXJkLWFkbWluIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiYzVjZTg4NTAtMWMzMy00MWU3LWIxN2QtMzM2YmNkZTRlYzZlIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRhc2hib2FyZC1hZG1pbiJ9.dK2ITEiw1hpWWugY5hOoLFF1-AA_9S--pQNjKZ6UiTkKcizZl4AjLyga7iPvBPFxfxBBe0xmfGHrFN0tO7NzY9XEZyXtLfUNSkF1xHwnM-IfyMOA2td2B7hFwA11G5Bl7fP-QSW_g0n8brokh6znQQ5Bbtziaih2ZM-zkyq-BRqMovukXnZW0k2OFyUMzCXV5NmgVrDCr_yg2LbkIYgv_B1uUZpd6A5Ebkxo6CYFxAhXQdUl4doh3Lq0HwuPfe7Pu0vK_1KmdLXQoTNQpwXlBmNh0THA4A0MxlC_VpxUUkrghh0qf3J1-uWo7X2YD41TMfudeTfcfPFewB47yNgyyg

# 读取token
# kubectl get secret -n kube-system | grep admin | awk '{print $1}'
kubectl describe secret -n kube-system $(kubectl get secret -n kube-system | grep admin | awk '{print $1}')  | grep '^token' | awk '{print $2}'

eyJhbGciOiJSUzI1NiIsImtpZCI6Il9HcDhZZmNiVTVHVTZsbDhxY29DNVUybnYzREZxMFUySGpLYmVxWGtyU1EifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkYXNoYm9hcmQtYWRtaW4tdG9rZW4tOWp0cmwiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGFzaGJvYXJkLWFkbWluIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiYzVjZTg4NTAtMWMzMy00MWU3LWIxN2QtMzM2YmNkZTRlYzZlIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRhc2hib2FyZC1hZG1pbiJ9.dK2ITEiw1hpWWugY5hOoLFF1-AA_9S--pQNjKZ6UiTkKcizZl4AjLyga7iPvBPFxfxBBe0xmfGHrFN0tO7NzY9XEZyXtLfUNSkF1xHwnM-IfyMOA2td2B7hFwA11G5Bl7fP-QSW_g0n8brokh6znQQ5Bbtziaih2ZM-zkyq-BRqMovukXnZW0k2OFyUMzCXV5NmgVrDCr_yg2LbkIYgv_B1uUZpd6A5Ebkxo6CYFxAhXQdUl4doh3Lq0HwuPfe7Pu0vK_1KmdLXQoTNQpwXlBmNh0THA4A0MxlC_VpxUUkrghh0qf3J1-uWo7X2YD41TMfudeTfcfPFewB47yNgyyg
```

## 7. 状态查看
1. 查看节点状态
> kubectl get nodes

2. 查看pod状态
> kubectl get pod --all-namespaces

1. 查看副本数
> kubectl get deployments --all-namespaces
> kubectl get pod -o wide --all-namespaces

4. 查看deployment详细信息
> kubectl describe deployments --all-namespaces

5. 查看集群基本组件状态
> kubectl get cs
```shell
NAME                 STATUS    MESSAGE             ERROR
scheduler            Healthy   ok
controller-manager   Healthy   ok
etcd-0               Healthy   {"health":"true"}
```

## 8. 部署业务服务
### 1. 创建命名空间
> kubectl create namespace svc-pd-service

### 2. 编写yaml文件
```yaml

```

### 3. 执行部署
```shell

```

## 10. 异常处理

1. CGroup与Docker不匹配，CPU核心数至少要两个，需要关闭Swap分区

```shell
# 报错
W0823 17:37:30.758727    2645 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[init] Using Kubernetes version: v1.18.0
[preflight] Running pre-flight checks
        [WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
error execution phase preflight: [preflight] Some fatal errors occurred:
        [ERROR NumCPU]: the number of available CPUs 1 is less than the required 2
        [ERROR Swap]: running with swap on is not supported. Please disable swap
[preflight] If you know what you are doing, you can make a check non-fatal with `--ignore-preflight-errors=...`
To see the stack trace of this error execute with --v=5 or higher

# 解决方案

# 查看docker的 Cgroup Driver，显示为cgroupfs，而kubelet为systemd
sudo docker info | grep Cgroup 
# 加入 "exec-opts": ["native.cgroupdriver=systemd"]
vim /etc/docker/daemon.json
"exec-opts": ["native.cgroupdriver=systemd"]

# 重启Docker和K8s
systemctl daemon-reload && systemctl restart docker && systemctl restart kubelet
```
