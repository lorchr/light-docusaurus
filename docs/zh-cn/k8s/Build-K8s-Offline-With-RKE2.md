- [RKE2离线安装](https://docs.rke2.io/zh/install/airgap)

## 一、基于RKE2的K8s部署

### 1、禁用 SELinux、Firewalld 、Swap
```shell
# 禁用 SELinux
sed -i 's/enforcing/disabled/' /etc/selinux/config && setenforce 0

# 关闭 firewalld
systemctl stop firewalld && systemctl disable firewalld

# 禁用swap分区
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

### 3、下载安装包以及镜像文件
```shell
# 镜像下载
wget https://github.com/rancher/rke2/releases/download/v1.24.7%2Brke2r1/rke2-images.linux-amd64.tar.gz

# 安装包下载
wget https://github.com/rancher/rke2/releases/download/v1.24.7%2Brke2r1/rke2.linux-amd64.tar.gz
```

上述所有服务器均需执行！

### 4、部署 server 节点(master)
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
cp rke2-images.linux-amd64.tar.gz /var/lib/rancher/rke2/agent/images/

# 设置开机启动并启动
systemctl enable rke2-server && systemctl start rke2-server
```

**注意：** 以下操作在 `rke2-server` 启动再操作
```shell
# 复制 kubectl 到 /usr/lobal/bin
cp /var/lib/rancher/rke2/bin/kubectl /usr/local/bin/
cp /var/lib/rancher/rke2/bin/crictl /usr/local/bin/
cp /var/lib/rancher/rke2/bin/ctr /usr/local/bin/

# 设置 kubeconfig
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

### 5、部署 agent 节点(worker)
`agent` 节点的安装同样要下载安装包以及镜像文件。
```shell
# 设置服务器名称
hostnamectl set-hostname k8s-node-1

# 加入节点需要认证,认证文件在 server 节点上
cat /var/lib/rancher/rke2/server/token
# 获取token示例如下：
# K10c5203928ea0e95fcddd9f64d07a4eda1536718ac3ebb35503900dd096523df46::server:880d72c3a7c8a55728aac3fc28de59f1

# 创建目录
mkdir -p /etc/rancher/rke2

# 创建配置文件
# 注意：server 为首个节点的地址；token 就是 server 节点上生成的 
cat > /etc/rancher/rke2/config.yaml <<EOF
server: https://192.168.0.22:9345
token:	K10c5203928ea0e95fcddd9f64d07a4eda1536718ac3ebb35503900dd096523df46::server:880d72c3a7c8a55728aac3fc28de59f1
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
cp rke2-images.linux-amd64.tar.gz /var/lib/rancher/rke2/agent/images/

# 设置开机启动并启动
systemctl enable rke2-agent && systemctl start rke2-agent
```

启动后到 `server` 节点就可以看到加入的节点了

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

### 6、删除节点
```shell
# 先查看一下这个node节点上的nodes信息
kubectl get nodes

# 驱逐此node节点上的pod
kubectl drain k8s-node-1 --delete-local-data --force --ignore-daemonsets

# 删除这个node节点
kubectl delete nodes k8s-node-1

# 卸载rke2
/usr/local/bin/rke2-uninstall.sh
```

### 7、节点IP更新造成节点漂移
- [集群重置](https://docs.rke2.io/zh/backup_restore)

RKE2 启用了一项功能，可以通过传递 `--cluster-reset` 标志将集群重置为一个成员集群。将此标志传递给 RKE2 server 时，它将使用相同的数据目录重置集群，数据 etcd 的目录存在于 `/var/lib/rancher/rke2/server/db/etcd` 中，这个标志可以在集群丢失仲裁时传递。

要传递重置标志，首先你需要停止 RKE2 服务（如果 RKE2 是通过 `systemd` 启用的）：
```shell
systemctl stop rke2-server
rke2 server --cluster-reset
```

**结果：** 日志中的一条消息表示 RKE2 可以在没有标志的情况下重新启动。再次启动 RKE2，它应该将 RKE2 作为一个成员集群启动。

```shell
INFO[0088] Managed etcd cluster membership has been reset, restart without --cluster-reset flag now. Backup and delete ${datadir}/server/db on each peer etcd server and rejoin the nodes 

# master节点执行
systemctl restart rke2-server

# worker节点执行
systemctl restart rke2-agent
```

## 二、安装Pgsql 15.4

### 1、本地编译源码
```shell
# 安装依赖项
yum install -y gcc make readline-devel zlib-devel
# apt install -y gcc make libreadline-dev zlib1g zlib1g.dev

# 创建目录
mkdir -p /home/light/pgsql/build

# 下载源码包
wget https://ftp.postgresql.org/pub/source/v15.4/postgresql-15.4.tar.gz

# 解压
tar -zxvf postgresql-15.4.tar.gz -C /home/light/pgsql

# 编译
/home/light/pgsql/postgresql-15.4/configure --prefix /home/light/pgsql/build
make

# 安装
make install

# 打包
cd /home/light/pgsql/build
tar -zcvf pgsql-15.4.tar.gz ./bin ./include ./lib ./share
```

### 2、上传解压编译后的包
```shell
# 解压pgsql-15.4.tar.gz到/data/local
tar -xzvf pgsql-15.4.tar.gz -C /data/local

# 创建PG用户
useradd postgres

# 初始化目录
mkdir -p /data/local/postgresql/data
mkdir -p /data/local/postgresql/log
```

### 3、初始化数据库
```shell
# 给postgres目录权限
chown -R postgres:postgres /data/local/postgresql/

# 切换postgres用户
su postgres

# 初始化数据库
/data/local/postgresql/bin/initdb -D /data/local/postgresql/data/ -E UTF8 --locale=en_US.UTF-8

# 自定义可访问IP及端口
vim /data/local/postgresql/data/postgresql.conf
listen_addresses = '*'
port = 5432
max_connections = 1000

# 修改数据库访问策略
vim /data/local/postgresql/data/pg_hba.conf
# IPv4 local connections:
host    all             all             192.168.0.0/24            trust
host    all             all             0.0.0.0/0                 md5

# 启动数据库
/data/local/postgresql/bin/pg_ctl -D /data/local/postgresql/data/ -l logfile start
# 修改postgres用户密码
/data/local/postgresql/bin/psql -U postgres -h localhost -c "ALTER USER postgres WITH PASSWORD '2#w4a8BV6qHP3LG#';"
```

### 4、远程连接
关闭防火墙或者打开5432端口
```shell
# 检查防火墙状态
sudo firewall-cmd --state

# 添加入站规则
sudo firewall-cmd --permanent --add-port=5432/tcp

# 重启防火墙
sudo firewall-cmd --reload

# 列出开放的端口
sudo firewall-cmd --list-ports

# 列出添加的服务
sudo firewall-cmd --list-services

# 列出当前系统上打开的所有网络连接和监听端口
netstat -tuln
# 同时显示服务名称
sudo netstat -tulnp
```

### 5、设置开机自启
```shell
# 拷贝linux文件，并更名为postgresql
cp /data/local/postgresql/contrib/start-scripts/linux /etc/init.d/postgresql

sed -i "s/\/usr\/local\/pgsql/\/data\/local\/postgresql/g" /etc/init.d/postgresql
sed -i "s/\/usr\/local\/pgsql\/data/\/data\/local\/postgresql\/data/g" /etc/init.d/postgresql

# 添加执行权限 设置开机自启
chmod a+x /etc/init.d/postgresql
chkconfig --add postgresql
```

自定义服务注册文件
```shell
# 添加服务注册文件
cat > /etc/systemd/system/postgresql.service << EOF
[Unit]
Description=PostgreSQL Database Server

[Service]
Type=forking
ExecStart=/data/local/postgresql/bin/pg_ctl start -D /data/local/postgresql/data -l /data/local/postgresql/log/logfile.log
ExecStop=/data/local/postgresql/bin/pg_ctl stop -D /data/local/postgresql/data
Restart=always
RestartSec=5
User=postgres
Group=postgres

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动pgsql并查看状态
systemctl start postgresql
systemctl status postgresql
systemctl stop postgresql
systemctl restart postgresql

# 状态正常即可设置开机自启
systemctl enable postgresql
systemctl disable postgresql
```

**注意：** 需要在`[Service]`标签下指定启动的用户 用户组，否则会启动失败

## 三、安装Influxdb 1.8.4
### 1、下载 rpm 安装包
```shell
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.4.x86_64.rpm
```

### 2、安装
```shell
# 安装rpm包
yum localinstall -y influxdb-1.8.4.x86_64.rpm

# 开机自启
systemctl enable influxdb

# 启动
systemctl start influxdb
```

### 3、创建新用户
```shell
influx
# 进入influx命令行客户端，创建用户：
CREATE USER "yongtuoif@Pisx" WITH PASSWORD '3Xj3W5fun3N!MjL5' WITH ALL PRIVILEGES
```

### 4、修改配置文件，启动权限验证
```shell
vim /etc/influxdb/influxdb.conf
[http]
auth-enabled = true

# 重启influxdb服务
systemctl restart influxdb

# 验证账号密码
influx -username 'yongtuoif@Pisx' -password '3Xj3W5fun3N!MjL5'
```

## 四、安装Minio RELEASE.2023-09-16T01-01-47Z
### 1、下载 rpm 安装包
```shell
# 下载安装包
wget https://dl.min.io/server/minio/release/linux-amd64/minio

# 创建目录
mkdir -p /data/local/minio/data
mkdir -p /data/local/minio/conf
mkdir -p /data/local/minio/log
mkdir -p /data/local/minio/bin

# 移动minio文件 赋予可执行权限
mv minio /data/local/minio/bin
chmod +x /data/local/minio/bin/minio

# 创建日志文件
touch /data/local/minio/log/minio.log
```

### 2、编写配置文件、启动脚本
```shell
# 配置文件
cat > /data/local/minio/conf/minio.conf << EOF
# This is minio conf.
MINIO_VOLUMES="/data/local/minio/data"
# 端口号设置
MINIO_OPTS="--address \":9000\" --console-address \":9001\""
# 用户名 密码
MINIO_ROOT_USER="yongtuomi"
MINIO_ROOT_PASSWORD="Y2rKNdWKLsujDY"
EOF

# 启动脚本
cat > /data/local/minio/bin/start.sh << EOF
#!/bin/bash
export MINIO_ROOT_USER=yongtuomi
export MINIO_ROOT_PASSWORD=Y2rKNdWKLsujDY
nohup /data/local/minio/bin/minio server /data/local/minio/data --console-address ":9001" --address ":9000" > /data/local/minio/log/minio.log 2>&1 &
EOF

# 添加执行权限
chmod +x /data/local/minio/bin/start.sh
# 启动
sh /data/local/minio/bin/start.sh
```

### 3、设置开机自启
```shell
# 添加服务注册文件
cat > /etc/systemd/system/minio.service << EOF
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/data/local/minio/bin/minio

[Service]
WorkingDirectory=/data/local/

User=root
Group=root
ProtectProc=invisible

EnvironmentFile=-/data/local/minio/conf/minio.conf
ExecStartPre=/bin/bash -c "if [ -z \"${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in /data/local/minio/conf/minio.conf\"; exit 1; fi"
ExecStart=/data/local/minio/bin/minio server $MINIO_OPTS $MINIO_VOLUMES > /data/local/minio/log/minio.log 2>&1

# MinIO RELEASE.2023-05-04T21-44-30Z adds support for Type=notify (https://www.freedesktop.org/software/systemd/man/systemd.service.html#Type=)
# This may improve systemctl setups where other services use `After=minio.server`
# Uncomment the line to enable the functionality
# Type=notify

# Let systemd restart this service always
Restart=always
# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536
# Specifies the maximum number of threads this process can create
TasksMax=infinity
# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动nginx并查看状态
systemctl start minio
systemctl status minio
systemctl stop minio
systemctl restart minio

# 状态正常即可设置开机自启
systemctl enable minio
systemctl disable minio
```

**注意：** 
1. 脚本中有环境变量引用，直接使用`cat`写入会丢失环境变量的名称，需要手动编辑
2. `EnvironmentFile=-/data/local/minio/conf/minio.conf`加载文件内容为环境变量，`-`表示文件不存在不报错
3. `cat > filename << EOF` 表示写入，会覆盖原内容； `cat >> filename << EOF`表示追加，不会覆盖原内容

## 五、安装Nginx 1.22.1
### 1、本地编译源码
- [pcre](https://ftp.pcre.org/pub/pcre/)
- [zlib](http://www.zlib.net/)
- [openssl](https://www.openssl.org/)

```shell
# 安装依赖项
yum install -y pcre pcre-devel zlib zlib-devel openssl openssl-devel
# apt install -y build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev openssl libssl-dev

# 创建目录
mkdir -p /home/light/nginx/build

# 下载源码包
wget https://nginx.org/download/nginx-1.22.1.tar.gz

# 解压
tar -zxvf nginx-1.22.1.tar.gz -C /home/light/nginx

# 编译
./configure \
    --prefix=/home/light/nginx/build \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_addition_module \
    --with-http_gzip_static_module \
    --with-http_gunzip_module \
    --with-http_secure_link_module \
    --with-http_stub_status_module \
    --with-http_v2_module \
    --with-ipv6 \
    --with-mail \
    --with-mail_ssl_module
make

# 安装
sudo make install

# 打包
cd /home/light/nginx/build
tar -zcvf nginx-1.22.1.tar.gz ./conf ./html ./logs ./sbin
```

- `--prefix`：Nginx安装的根路径，所有其他的安装路径都要依赖于该选项。默认为/usr/local/nginx
- `--with-http_ssl_module`：安装http ssl module 使Nginx支持SSL协议，提供HTTPS服务
- `--with-http_realip_module`：安装http realip module 可以在请求头添加 `X-Real-IP` `X-Forwarded-For`获取客户端真实IP
- `--with-http_addition_module`：安装http addition module 可以在Http响应包头部或尾部增加内容
- `--with-http_gzip_static_module`：安装http gzip static module 可以把一些文档进行压缩返回给客户端，并在压缩前进行检查是否已经有压缩过的包返回
- `--with-http_gunzip_module`：安装http gunzip module 对于不支持gzip编码的客户，该模块用于为客户解压缩预压缩内容
- `--with-http_secure_link_module`：安装http secure link module 验证请求是否有效，提供安全机制
- `--with-http_stub_status_module`：安装http stub status module 让Nginx提供性能统计压面，获取相关并发连接、请求信息
- `--with-http_v2_module`：安装http v2 module 支持Http 2.0
- `--with-ipv6` 支持IPv6
- `--with-mail` 支持邮件服务器反向代理，默认安装 imap pop3 smtp等模块
- `--with-mail_ssl_module` 使 imap pop3 smtp 支持SSL/TLS协议
- `--without-mail_imap_module` 不安装imap
- `--without-mail_pop3_module` 不安装pop3
- `--without-mail_smtp_module` 不安装smtp

### 2、上传解压编译后的包
```shell
# 解压nginx-1.22.1.tar.gz到/data/local
tar -xzvf nginx-1.22.1.tar.gz -C /data/local
```

### 3、启动nginx
```shell
/data/local/nginx/sbin/nginx
```

### 4、设置开机自启
```shell
# 添加服务注册文件
cat > /etc/systemd/system/nginx.service << EOF
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/data/local/nginx/logs/nginx.pid
ExecStartPre=/data/local/nginx/sbin/nginx -t -q -g 'daemon on; master_process on;'
ExecStart=/data/local/nginx/sbin/nginx -g 'daemon on; master_process on;'
ExecReload=/data/local/nginx/sbin/nginx -g 'daemon on; master_process on;' -s reload
ExecStop=/data/local/nginx/sbin/nginx -g 'daemon on; master_process on;' -s quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动nginx并查看状态
systemctl start nginx
systemctl status nginx
systemctl stop nginx
systemctl restart nginx

# 状态正常即可设置开机自启
systemctl enable nginx
systemctl disable nginx
```

## 六、安装EMQX 5.2.0
### 1、下载安装包
```shell
# 下载
wget https://www.emqx.com/zh/downloads/broker/5.2.0/emqx-5.2.0-el7-amd64.tar.gz

# 安装
mkdir -p /data/local/emqx
tar -zxvf emqx-5.2.0-el7-amd64.tar.gz -C /data/local/emqx
```

### 2、运行
```shell
useradd emqx
chown -R emqx:emqx /data/local/emqx/

/data/local/emqx/bin/emqx start
/data/local/emqx/bin/emqx stop
```

### 3、设置开机自启
```shell
# 添加服务注册文件
cat > /etc/systemd/system/emqx.service << EOF
[Unit]
Description=EMQ X Broker
After=network.target

[Service]
# Type=simple
Type=forking
ExecStart=/data/local/emqx/bin/emqx start
ExecStop=/data/local/emqx/bin/emqx stop
Restart=on-failure
User=root
Group=root
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动emqx并查看状态
systemctl start emqx
systemctl status emqx
systemctl stop emqx
systemctl restart emqx

# 状态正常即可设置开机自启
systemctl enable emqx
systemctl disable emqx
```

## 七、安装Redis Cluster 7.0.12
### 1、本地编译源码
```shell
# 创建目录
mkdir -p /home/light/redis/build/conf

# 下载源码包
wget https://download.redis.io/releases/redis-7.0.12.tar.gz

# 解压
tar -xzvf redis-7.0.12.tar.gz -C /home/light/redis

# 编译
cd redis-7.0.12/
make

# 安装
make install PREFIX=/home/light/redis/build
# 复制默认的配置文件
cp redis.conf /home/light/redis/build/conf

# 打包
tar -zcvf redis-7.0.12.tar.gz ./conf ./bin
```

### 2、上传解压编译后的包
```shell
# 22创建目录
mkdir -p /data/local/redis/node-6381
mkdir -p /data/local/redis/node-6382

# 21创建目录
mkdir -p /data/local/redis/node-6383
mkdir -p /data/local/redis/node-6384

# 23创建目录
mkdir -p /data/local/redis/node-6385
mkdir -p /data/local/redis/node-6386

# 解压缩redis-7.0.12.tar.gz
tar -xzvf redis-7.0.12.tar.gz -C /data/local/redis/node-638*/
```

### 3、修改配置文件
将如下redis.conf配置文件内容分别按各自ip地址及port覆盖
```shell
port ${port}
requirepass 5pKu5D8Lm
masterauth 5pKu5D8Lm
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

### 4、配置/etc/sysctl.conf
```shell
vi /etc/sysctl.conf
```
在最后一行添加如下配置：
```conf
net.core.somaxconn = 10240
vm.overcommit_memory=1
```
保存后输入：`sysctl -p` 使配置立即生效。

### 5、启动各Redis 节点
```shell
# 进入/data/local/redis目录
cd /data/local/redis

# 启动各Redis 节点
nohup /data/local/redis/node-638*/redis-7.0.12/src/redis-server \
    /data/local/redis/node-638*/redis-7.0.12/redis.conf > /dev/null 2>&1 &

# 创建Redis Cluster集群
/data/local/redis/node-6381/redis-7.0.12/src/redis-cli  -a 5pKu5D8Lm \
    --cluster create 192.168.56.102:6381 192.168.56.102:6382 \
        192.168.56.102:6383 192.168.56.102:6384 \
        192.168.56.102:6385 192.168.56.102:6386 \
    --cluster-replicas 1 
```

### 7、单节点安装
```shell
# 创建目录
mkdir -p /data/local/redis/single

# 解压缩redis-7.0.12.tar.gz
tar -xzvf redis-7.0.12.tar.gz -C /data/local/redis/single

# 添加服务注册文件
cat > /etc/systemd/system/redis.service << EOF
[Unit]
Description=Redis Server
After=network.target

[Service]
ExecStart=/data/local/redis/single/redis-7.0.12/src/redis-server /data/local/redis/single/redis-7.0.12/redis.conf
ExecStop=/data/local/redis/single/redis-7.0.12/src/redis-cli shutdown
User=root
Group=root
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动pgsql并查看状态
systemctl start redis
systemctl status redis
systemctl stop redis
systemctl restart redis

# 状态正常即可设置开机自启
systemctl enable redis
systemctl disable redis
```

## 八、服务部署

### 1、前端配置文件
1. `nginx`根配置文件 `/data/local/nginx/nginx.conf`
```conf
user  nginx;
worker_processes  auto;

error_log  logs/error.log notice;
pid        logs/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    types {
        application/vnd.ms-fontobject   eot;
        font/ttf                        ttf;
        font/opentype                   otf;
        font/x-woff                     woff;
        image/svg+xml                   svg;
    }

    # websocket
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    # gzip config
    gzip            on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types      text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php     image/jpeg image/gif image/png font/ttf font/opentype font/x-woff;
    gzip_vary       on;
    gzip_disable    "MSIE [1-6]\.";

    proxy_buffer_size           1024k;
    proxy_buffers               16  1024k;
    proxy_busy_buffers_size     2048k;
    proxy_temp_file_write_size  2048k;

    client_header_timeout       120;
    client_body_timeout         120;
    send_timeout                120;
    client_max_body_size        10m;

    include /data/local/nginx/conf.d/*.conf;
}
```

2. 平台前端配置文件 `/data/local/nginx/conf.d/platform.conf`
```conf
upstream platform_oauth {  
   server 192.168.0.21:31888;   
}

upstream platform_system {  
   server 192.168.0.21:31112;   
}

upstream platform_thing {  
   server 192.168.0.21:31111;   
}

upstream platform_message {  
   server 192.168.0.21:31890;   
}

upstream platform_workflow {  
   server 192.168.0.21:31113;   
}

upstream platform_plugin {  
   server 192.168.0.21:31116;   
}

server {
    listen       9096;
    server_name  localhost;

    #charset koi8-r;

    #access_log  logs/host.access.log  main;
    location / {
        root   html/platform;
        index  index.html index.htm;
        if (!-e $request_filename) {
            rewrite ^(.*)$ /index.html?s=$1 last;
            break;
        }
    }

    location /monitor {
        alias  html/monitor;
        index  index.html index.htm;
    }

    # 后台代理配置 以auth服务为例
    location ^~ /oauth/ {
        proxy_pass              http://platform_oauth;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /system/ {
        proxy_pass              http://platform_system;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /thing/ {
        proxy_pass              http://platform_thing;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /message/ {
        proxy_pass              http://platform_message;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /workflow/ {
        proxy_pass              http://platform_workflow;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /plugin/ {
        proxy_pass              http://platform_plugin;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    location ^~ /ws/ {
        proxy_pass              http://platform_thing;
        client_max_body_size    100m;
        proxy_redirect          default;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }
    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}
```

1. 业务前端配置文件 `/data/local/nginx/conf.d/business.conf`
```conf
upstream business_main {  
   server 192.168.0.21:31222;   
}

upstream business_demo {  
   server 192.168.0.21:31223;   
}

server {
    listen       80;
    server_name  localhost;

    #charset koi8-r;

    #access_log  logs/host.access.log  main;

    #解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题
    location / {
        root   html/business;
        index  index.html index.htm;
        if (!-e $request_filename) {
            rewrite ^(.*)$ /index.html?s=$1 last;
            break;
        }
    }

    location /monitor {
        alias  html/monitor;
        index  index.html index.htm;
    }

    location ^~ /business/ {
        proxy_pass              http://business_main;
        proxy_http_version      1.1;
        proxy_read_timeout      900s;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-NginX-Proxy true;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection $connection_upgrade
    }

    # 使用捕获组 $1 来传递剩余路径 /demo/123 -> /123
    location ~ ^/demo(/.*)$ {
        proxy_pass http://business_demo$1;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}
```

### 2、前端部署
```shell
# 打包
npm run build

# 压缩dist 得到 dist.zip
# 将文件上传到服务器
scp D:/frontend/dist.zip root@192.168.0.21:/data/local/nginx/html/

# 解压
unzip dist.zip -d ./frontend

# 重启Nginx
systemctl restart nginx
```

### 3、后端配置文件
1. 打包镜像配置文件 `Dockerfile`
```Dockerfile
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ADD auth-service.jar /
RUN sh -c 'touch /auth-service.jar'
ENV JAVA_OPTS="-Duser.timezone=Asia/Shanghai -Xms1g -Xmx2g"
ENTRYPOINT [ "sh", "-c", "java ${JAVA_OPTS} -jar /auth-service.jar" ]
```

2. k8s部署配置文件 `K8s.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: svc-auth-service
  namespace: svc-platform
spec:
  type: NodePort
  selector:
    app: auth-service
  ports:
    - name: http
      port: 31888
      targetPort: 31888
      nodePort: 31888
      protocol: TCP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dep-auth-service
  namespace: svc-platform
spec:
  minReadySeconds: 5
  revisionHistoryLimit: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
      version: "1.0.0"
  template:
    metadata:
      labels:
        app: auth-service
        version: "1.0.0"
    spec:
      imagePullSecrets:
        - name: dockerimage
      containers:
        - name: auth-service
          image: 192.168.0.22:5000/auth-service:1.0.0
          imagePullPolicy: Always
          ports:
            - containerPort: 31888
          # 启动探针，检测系统是否启动成功
          startupProbe:
            httpGet:
              path: /oauth/actuator/health/readiness
              port: 31888
            periodSeconds: 10 # 探测时间间隔
            timeoutSeconds: 5 # 超时时间
            failureThreshold: 30 # 重试次数
          # 存活探针，检测系统是否存活
          livenessProbe:
            httpGet:
              path: /oauth/actuator/health/liveness
              port: 31888
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 20
            failureThreshold: 3
          resources:
            limits:
              cpu: "2"
              memory: "2048Mi"
            requests:
              cpu: "1"
              memory: "1024Mi"
```

1. 部署脚本 `deploy.sh`
```shell
#!/bin/bash

# 定义镜像名称和版本默认值
image_name=""
image_version=""

# 使用getopts来解析选项和参数
while getopts "i:v:-:" opt; do
    case "$opt" in
        i|image)
            image_name="$OPTARG"
            ;;
        v|version)
            image_version="$OPTARG"
            ;;
        -)
            case "${OPTARG}" in
                image=*)
                    image_name="${OPTARG#*=}"
                    ;;
                version=*)
                    image_version="${OPTARG#*=}"
                    ;;
                *)
                    echo "Invalid option: --$OPTARG" >&2
                    exit 1
                    ;;
            esac
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# 检查参数是否已提供
if [ -z "$image_name" ] || [ -z "$image_version" ]; then
    echo "Usage: $0 -i|--image <image_name> -v|--version <version_no>"
    exit 1
fi


# 获取当前日期和时间，用于创建备份文件和标记
timestamp=$(date +%Y%m%d%H%M%S)

# 备份镜像为tar文件
docker save -o "${image_name}_${image_version}_${timestamp}.tar" "${image_name}:${image_version}" || echo "continue execute"

# 构建新的Docker镜像
docker build -t "${image_name}:${image_version}" .

# 推送新的Docker镜像到镜像仓库
# docker tag ${image_name}:${image_version} 192.168.0.22:5000/${image_name}:${image_version}
# docker push 192.168.0.22:5000/${image_name}:${image_version}


export KUBECONFIG="/root/.kube/config"
export PATH="$PATH:/var/lib/rancher/rke2/bin/"
# 停止之前的部署
kubectl delete -f k8s.yaml || echo "continue execute"

# 等待3秒
sleep 3

# 在Kubernetes上部署应用程序
kubectl apply -f k8s.yaml || echo "continue execute"
```

### 4、后端服务部署
```shell
# 查询namespace
kubectl get namespaces

# 不存在则新建一个 namespace
kubectl create namespace svc-pd-service

# 添加执行权限
chmod +x ./deploy.sh

# 一键部署
./deploy.sh -i auth-service -v 1.0.0


# 查看所有镜像
curl -X GET http://192.168.0.22:5000/v2/_catalog

# 查看指定镜像的所有版本
curl -X GET http://192.168.0.22:5000/v2/auth-service/tags/list

# 查看pod基础信息
kubectl get pods -n svc-pd-service -o wide

# 查看pod详细信息
kubectl describe pod -n svc-pd-service <pod-name>

# 获取ClusterIP用于反向代理
kubectl get svc -n svc-pd-service svc-auth-service 

# 查看日志
kubectl logs -n svc-pd-service dep-auth-service-6674cff5c9-29r78 

# 查看k8s底层容器运行时
kubectl get nodes -o custom-columns=NODE:.metadata.name,RUNTIME:.status.nodeInfo.containerRuntimeVersion

# 查看cri信息
crictl info 
crictl version 

```

---

```shell
# 打包
mvn clean package -U -Dmaven.test.skip=true

# 编译Docker镜像
docker build backend:1.0.1 .

# 备份镜像
docker save -o backend.tar backend:1.0.1

# 将文件上传到服务器
scp D:/backend/backend.tar root@192.168.0.22:/data/local/services/

# 修改旧版本的tag
docker tag backend:latest backend:1.0.0

# 加载镜像
docker load -i backend.tar

# 修改新版本的tag
docker tag backend:1.0.1 backend:latest
```

## 九、安装问题
### 1、k8s拉取镜像报错 
`imagePullBackOff`  `http: server gave HTTP response to HTTPS client`

1. [RKE2](https://docs.rke2.io/zh/install/containerd_registry_configuration)
```shell
cat > /etc/rancher/rke2/registries.yaml << EOF
mirrors:
  "192.168.0.22:5000":
    endpoint:
      - "http://192.168.0.22:5000"
  docker.io:
    endpoint:
      - "http://192.168.0.22:5000"
EOF
```

2. [Containerd](https://github.com/containerd/containerd/issues/3847)
- [Containerd](https://github.com/containerd/cri/blob/master/docs/registry.md#configure-registry-endpoint)
```shell
cat > /etc/containerd/config.toml  << EOF
[plugins]
    [plugins."io.containerd.grpc.v1.cri"]
        [plugins."io.containerd.grpc.v1.cri".registry]
            [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
                [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
                    endpoint = ["https://registry-1.docker.io"]
                [plugins."io.containerd.grpc.v1.cri".registry.mirrors."harbor.io"]
                    endpoint = ["https://xxx-harbor.com:7443"]
                [plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.22:5000"]
                    endpoint = ["https://192.168.0.22:5000"]
            [plugins."io.containerd.grpc.v1.cri".registry.configs]
                [plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.io"]
                [plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.io".tls]
                    insecure_skip_verify = true
                [plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.io".auth]
                    username = "admin"
                    password = "Harbor12345"
                [plugins."io.containerd.grpc.v1.cri".registry.configs."192.168.0.22:5000".tls]
                    insecure_skip_verify = true
EOF
```

3. [Docker](https://docs.docker.com/registry/insecure/)
```shell
cat > /etc/docker/daemon.json << EOF
{ 
    "insecure-registries":["192.168.0.22:5000"]
}
EOF
```