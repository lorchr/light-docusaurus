- [RKE2离线安装](https://docs.rke2.io/zh/install/airgap)

## 一、基于rke2的k8s部署

### 1、禁用 selinux、firewalld 、swap
```shell
sed -i 's/enforcing/disabled/' /etc/selinux/config && setenforce 0
systemctl stop firewalld && systemctl disable firewalld
swapoff -a && sed -ri 's/.*swap.*/#&/' /etc/fstab
```

### 2、设置时间同步
```shell
# 设置系统时区为 中国/上海 
timedatectl set-timezone "Asia/Shanghai"
# 将当前的 UTC 时间写入硬件时钟 
timedatectl set-local-rtc 0
# 重启依赖于系统时间的服务 
systemctl restart rsyslog
```

### 3、下载安装包以及镜像文件(可在有网环境先下载下来)
```shell
# 镜像下载
wget https://github.com/rancher/rke2/releases/download/v1.24.7%2Brke2r1/rke2-images.linux-amd64.tar.gz

# 安装包下载
wget https://github.com/rancher/rke2/releases/download/v1.24.7%2Brke2r1/rke2.linux-amd64.tar.gz
```

上述所有服务器均需执行！

### 4、部署 server 节点
```shell
# 设置服务器名称
hostnamectl set-hostname k8s-master

# 解压安装包文件
tar -xzvf rke2.linux-amd64.tar.gz

# 复制可执行文件到 /usr/local/bin/
cp bin/* /usr/local/bin/

# 复制启动项文件到 /usr/lib/systemd/system/
# 注意：启动项有 server 和 agent ，这里是复制 server 的
cp lib/systemd/system/rke2-server.service /usr/lib/systemd/system/

# 复制镜像文件到 rke2 指定的默认位置
# 创建目录
mkdir -p /var/lib/rancher/rke2/agent/images/
# 复制镜像文件到该目录
mv rke2-images.linux-amd64.tar.gz /var/lib/rancher/rke2/agent/images/

# 设置开机启动并启动
systemctl enable rke2-server && systemctl start rke2-server
```

**注意：** 以下操作在 rke2-server 启动再操作
```shell
#复制 kubectl 到 /usr/lobal/bin
cp /var/lib/rancher/rke2/bin/kubectl /usr/local/bin/
cp /var/lib/rancher/rke2/bin/crictl /usr/local/bin/
cp /var/lib/rancher/rke2/bin/ctr /usr/local/bin/

#设置 kubeconfig
cat >> ~/.bashrc <<EOF
export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
alias crictl='crictl --runtime-endpoint unix:///run/k3s/containerd/containerd.sock'
alias ctr='ctr --address /run/k3s/containerd/containerd.sock'
EOF

source ~/.bashrc

# 等启动后查看 node 以及 pod
# nodes
kubectl get nodes
# pods
kubectl get pods -A
```

### 5、部署 agent 节点
agent 节点的安装同样要下载安装包以及镜像文件。
```shell
# 设置服务器名称
hostnamectl set-hostname k8s-node-1

# 加入节点需要认证,认证文件在 server 节点上
cat /var/lib/rancher/rke2/server/token
# 获取token示例如下：
# K105eb69ffe4e84b42607d7857bafa4f44028a8d75eae64a4882fa7b135d9303692::server:b98eae5a63c9d3245641e8beef71d208

# 创建目录
mkdir -p /etc/rancher/rke2

# 创建配置文件
# 注意：token 就是 server 节点上生成的
cat > /etc/rancher/rke2/config.yaml <<EOF
server: https://172.16.222.121:9345 ##改地址为首个节点的server地址
token: 	K105eb69ffe4e84b42607d7857bafa4f44028a8d75eae64a4882fa7b135d9303692::server:b98eae5a63c9d3245641e8beef71d208
EOF

# 解压安装包文件
tar -xzvf rke2.linux-amd64.tar.gz

# 复制可执行文件到 /usr/local/bin/
cp bin/* /usr/local/bin/

# 复制启动项文件到 /usr/lib/systemd/system/
# 注意：启动项有 server 和 agent ，这里是复制 agent 的
cp lib/systemd/system/rke2-agent.service /usr/lib/systemd/system/

# 复制镜像文件到 rke2 指定的默认位置
# 创建目录
mkdir -p /var/lib/rancher/rke2/agent/images/
# 复制镜像文件到该目录
mv rke2-images.linux-amd64.tar.gz /var/lib/rancher/rke2/agent/images/

# 设置开机启动并启动
systemctl enable rke2-agent && systemctl start rke2-agent
```

启动后到 server 节点就可以看到加入的节点了

**注意：** 启动成功后设置
```shell
# 设置命令链接
cp /var/lib/rancher/rke2/bin/crictl /usr/local/bin/ 
cp /var/lib/rancher/rke2/bin/ctr /usr/local/bin/

cat >> ~/.bashrc <<EOF
alias crictl='crictl --runtime-endpoint unix:///run/k3s/containerd/containerd.sock'
alias ctr='ctr --address /run/k3s/containerd/containerd.sock'
EOF

source ~/.bashrc
```

## 二、pgsql15已编译完成tar包安装

### 1、准备已编译完成pgsql15.4.tar.gz
```shell
# 解压pgsql15.4.tar.gz到/data/local
tar -xzvf pgsql15.4.tar.gz -C /data/local
# 创建PG用户
useradd postgres
```

### 2、初始化目录
```shell
mkdir /data/local/postgresql/data
mkdir /data/local/postgresql/log
```

### 3、初始化数据库
```shell
# 给postgres目录权限
chown -R postgres:postgres /data/local/postgresql/
# 切换postgres用户
su postgres
/data/local/postgresql/bin/initdb -D /data/local/postgresql/data/ -E UTF8 --locale=en_US.UTF-8
# 自定义可访问IP及端口
vi  /data/local/postgresql/data/postgresql.conf
listen_addresses = ‘*’
port = 5432
# 修改数据库访问策略
vi /data/local/postgresql/data/pg_hba.conf

# IPv4 local connections:
host    all             all             0.0.0.0/0            md5
# 启动数据库
/data/local/postgresql/bin/pg_ctl -D /data/local/postgresql/data/ -l logfile start
# 修改postgres用户密码
/data/local/postgresql/bin/psql -U postgres -h localhost -c "ALTER USER postgres WITH PASSWORD '2#w4a8BV6qHP3LG#';"
```

远程连接关闭防火墙或者打开5432端口！ 

## 三、influxdb原生rpm安装
### 1、下载influxdb1.8.4 rpm 安装包(有网环境)
```shell
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.4.x86_64.rpm
```

### 2、本地安装
```shell
yum localinstall -y influxdb-1.8.4.x86_64.rpm
```

### 3、启动
```shell
systemctl enable influxdb
systemctl start influxdb
```

### 4、创建新用户
```shell
influx
# 进入influx命令行客户端，创建用户：
CREATE USER "yongtuoif@Pisx" WITH PASSWORD '3Xj3W5fun3N!MjL5' WITH ALL PRIVILEGES
```

### 5、修改配置文件，启动权限验证
```shell
vi /etc/influxdb/influxdb.conf
[http]
auth-enabled = true

# 重启influxdb服务
systemctl restart influxdb.service
```

## 四、minio 原生可执行工具安装
### 1、下载minio rpm安装包（有网环境）
```shell
wget https://dl.min.io/server/minio/release/linux-amd64/minio
```
### 2、赋予可执行权限
```shell
chmod +x minio
```

### 3、创建目录并移动minio
```shell
mkdir -p /data/local/minio/data
mkdir -p /data/local/minio/bin
touch minio.log
mv minio /data/local/minio/bin
```

### 4、编写启动脚本
```shell
# 进入bin目录
cd /data/local/minio/bin
vi start.sh
# 输入以下内容
export MINIO_ROOT_USER=yongtuomi
export MINIO_ROOT_PASSWORD=Y2rKNdWKLsujDY
nohup /data/local/minio/bin/minio server /data/local/minio/data --console-address ":9001" --address ":9000" > /data/local/minio/minio.log 2>&1 &
```

### 5、启动
```shell
sh /data/local/minio/bin/start.sh
```

## 五、nginx 已编译完成tar包安装
### 1、准备已编译完成nginx.tar.gz安装包
```shell
# 解压nginx.tar.gz到/data/local
tar -xzvf nginx.tar.gz -C /data/local
```

### 2、启动nginx
```shell
/data/local/nginx/sbin/nginx
```

## 六、安装EMQX
### 1、下载emqx-5.2.0-el7-amd64.tar.gz安装包
```shell
wget https://www.emqx.com/zh/downloads/broker/5.2.0/emqx-5.2.0-el7-amd64.tar.gz
```

### 2、安装
```shell
mkdir -p /data/local/emqx && tar -zxvf emqx-5.2.0-el7-amd64.tar.gz -C /data/local/emqx
```

### 3、运行
```shell
/data/local/emqx/bin/emqx start
```


### 七、Redis Cluster 三主三从集群安装
1、准备已编译完成tar包
```shell
# 184创建目录
mkdir -p /data/local/redis/node-6381
mkdir -p /data/local/redis/node-6382

# 178创建目录
mkdir -p /data/local/redis/node-6383
mkdir -p /data/local/redis/node-6384

# 142创建目录
mkdir -p /data/local/redis/node-6385
mkdir -p /data/local/redis/node-6386

# 解压缩redis.tar.gz
tar -xzvf redis.tar.gz -C /data/local/redis/node-638*/
```

### 2、修改配置文件
将如下redis.conf配置文件内容分别按各自ip地址及port覆盖
```shell
port ${port}
requirepass 5pKu5D8Lm
bind 0.0.0.0 -::0
protected-mode no
daemonize no
appendonly yes
cluster-enabled yes 
cluster-config-file nodes-${port}.conf
cluster-node-timeout 5000
cluster-announce-ip  服务器ip地址
cluster-announce-port ${port}
cluster-announce-bus-port 1${port}

vi /data/local/redis/node-638*/redis-7.0.12/redis.conf
```

### 3、配置/etc/sysctl.conf
```shell
vi /etc/sysctl.conf
```
在最后一行添加如下配置：
```conf
net.core.somaxconn = 10240
vm.overcommit_memory=1
```
保存后输入：`sysctl -p` 使配置立即生效。

### 4、启动各Redis 节点
```shell
# 进入/data/local/redis目录
cd /data/local/redis
nohup /data/local/redis/node-638*/redis-7.0.12/src/redis-server /data/local/redis/node-638*/redis-7.0.12/redis.conf >/dev/null 2>&1 &
```

### 5、创建Redis Cluster集群
```shell
/data/local/redis/node-6381/redis-7.0.12/src/redis-cli  -a 5pKu5D8Lm --cluster create 192.168.56.102:6381 192.168.56.102:6382 192.168.56.102:6383 192.168.56.102:6384 192.168.56.102:6385 192.168.56.102:6386 --cluster-replicas 1 
```
