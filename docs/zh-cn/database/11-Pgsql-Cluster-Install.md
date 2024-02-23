## Pgsql 集群安装 (Docker版)
- [进阶数据库系列（十五）：PostgreSQL 主从同步原理与实践](https://blog.csdn.net/pgdba/article/details/133820811)
- [Centos7.6部署postgresql15主从](https://blog.csdn.net/qq_33445829/article/details/130727228)
- [26.2. 日志传送后备服务器](http://www.postgres.cn/docs/12/warm-standby.html#STANDBY-SERVER-OPERATION)
- [PGTune - calculate configuration for PostgreSQL based on the maximum performance for a given hardware configuration](https://pgtune.leopard.in.ua/)
- [ShardingSphere4.0.0-RC1实现分库分表+读写分离](https://blog.csdn.net/m0_38129431/article/details/111316018)

### 1. 部署容器IP
为了固定IP可以单独创建一个网络

- 主节点 master: 172.18.0.2  （Docker部署）
- 从节点1 slave : 172.18.0.3 （Docker部署）
- 从节点2 standby: 172.18.0.1 （物理机部署）

```shell
# 创建网络
docker network create --subnet=172.18.0.0/16 dev

# 容器创建后可以使用此命令查看容器IP
docker inspect pgsql-master | grep IPAddress 
```

### 2. 主库配置（Master）

#### 1. 初始化主库

```shell
# 创建文件夹
mkdir -p //d/docker/pgsql-master/{conf,data,logs}

# 运行容器
docker run -d \
  --publish 5433:5432 \
  --volume //d/docker/pgsql-master/data:/var/lib/postgresql/data \
  --env PGDATA=/var/lib/postgresql/data \
  --env POSTGRES_PASSWORD=postgres \
  --net dev \
  --ip 172.18.0.2 \
  --restart=no \
  --name postgres-master \
  postgres:15.3
```

#### 2. 主库创建账号同步数据

```shell
# 进入容器命令行
docker exec -it -u root postgres-master /bin/bash

# 创建归档日志目录
mkdir -p $PGDATA/pg_archive

# 创建同步账户
psql -h localhost -p 5432 -U postgres -W -d postgres
CREATE ROLE replica login replication encrypted password 'replica';
```

#### 3. 主库 `$PGDATA/pg_hba.conf` 文件增加备库访问控制

```conf
# replica    上面创建的账户
# 172.18.0.3 从节点的IP
host    replication     replica         172.18.0.3/32           trust
host    replication     replica         172.18.0.1/32           trust
```

#### 4. 主库 `$PGDATA/postgresql.conf` 文件添加主从同步参数

```conf
# basic
listen_addresses = '*'                # 监听所有ip
port = 5432                           # 端口
max_connections = 1000                # 最大连接数
superuser_reserved_connections = 10   # 给超级用户预留的连接数
shared_buffers = 1GB                  # 共享内存，一般设置为内存的1/4
work_mem = 16MB                       # 设置在写入临时磁盘文件之前查询操作(例如排序或哈希表)可使用的最大内存容量
maintenance_work_mem = 256MB          # 在维护性操作（例如VACUUM、CREATE INDEX和ALTER TABLE ADD FOREIGN KEY）中使用的 最大的内存量
timezone = 'Asia/Shanghai'            # 系统时区
hot_standby = on                      # 打开热备

# optimizer
default_statistics_target = 500       # 默认100，ANALYZE在pg_statistic中存储的信息量，增大该值，会增加ANALYZE的时间，但会让解释计划更精准

# wal
max_wal_size = 1GB                    # 建议与shared_buffers保持一致
min_wal_size = 80MB                   # 建议max_wal_size/12.5
wal_log_hints = on                    # 控制WAL日志记录的方式，建议打开
wal_level = replica                   # wal日志写入级别，要使用流复制，必须使用replica或更高级别
wal_sender_timeout = 60s              # 设置WAL发送者在发送WAL数据时等待主服务器响应的超时时间
max_wal_senders = 10                  # 
max_replication_slots = 10            # 
synchronous_standby_names = '*'       # 

# archive
archive_mode = on                     # 
archive_command = 'gzip < %p > /var/lib/postgresql/data/pg_archive/%f.gz'

# log 近7天轮询
log_destination = 'csvlog'            # 日志格式
logging_collector = on                # 日志收集器
log_directory = 'pg_log'              # 日志目录 $PGDATA/pg_log
log_filename = 'postgresql.%a'        # 7天日志轮询
log_file_mode = 0600                  # 日志文件的权限
log_rotation_size = 0                 # 日志的最大尺寸，设置为零时将禁用基于大小创建新的日志文件
log_truncate_on_rotation = on         # 这个参数将导致PostgreSQL截断（覆盖而不是追加）任何已有的同名日志文件
log_min_duration_statement = 0        # 如果语句运行至少指定的时间量，将导致记录每一个这种完成的语句的持续时间
log_duration = on                     # 每一个完成的语句的持续时间被记录
log_lock_waits = on                   # 控制当一个会话为获得一个锁等到超过deadlock_timeout时，是否要产生一个日志消息
log_statement = 'mod'                 # 控制哪些 SQL 语句被记录。有效值是 none (off)、ddl、mod和 all（所有语句）。ddl记录所有数据定义语句，例如CREATE、ALTER和 DROP语句。mod记录所有ddl语句，外加数据修改语句例如INSERT, UPDATE、DELETE、TRUNCATE, 和COPY FROM
log_timezone = 'Asia/Shanghai'        # 设置在服务器日志中写入的时间戳的时区

# sql
statement_timeout = 300000            # 语句执行超时时间 5分钟
idle_in_transaction_session_timeout = 300000   # 事务空闲超时时间 5分钟
idle_session_timeout = 1800000        # 会话空闲超时时间 30分钟
lock_timeout = 60000                  # 等锁超时时间 1分钟
```

#### 5. 重启主库

```shell
docker container restart postgres-master

pg_ctl restart -D $PGDATA -l $PGLOG
```

### 3. 从库配置 (Slave Docker部署)
**注意：** 此步骤适用于Docker部署

#### 1. 初始化从库

```shell
# 创建文件夹
mkdir -p //d/docker/pgsql-slave/{conf,data,logs,temp}

# 运行容器 (此时挂载的数据目录是 temp)
docker run -d \
  --publish 5434:5432 \
  --volume //d/docker/pgsql-slave/temp:/var/lib/postgresql/data \
  --env PGDATA=/var/lib/postgresql/data \
  --env POSTGRES_PASSWORD=postgres \
  --net dev \
  --ip 172.18.0.3 \
  --restart=no \
  --name postgres-slave \
  postgres:15.3
```

#### 2. 验证从库访问主库

```shell
docker exec -it -u root postgres-slave /bin/bash

psql -h 172.18.0.2 -p 5432 -U postgres -W -d postgres
# 可以正常输入密码登录即可
```

#### 3. 同步主库文件

```shell
# 同步主库文件
pg_basebackup -D /var/lib/postgresql/data/replica -h 172.18.0.2 -p 5432 -U replica -Fp -Xs -Pv -R


```
#### 4. 使用同步的主库数据文件重建从库

```shell
# 停止并删除镜像
docker stop postgres-slave && docker container remove postgres-slave

# 将 //d/docker/pgsql-slave/temp/replica 目录下的文件复制到 //d/docker/pgsql-slave/data 下

# 运行容器 (此时挂载的数据目录是 data)
docker run -d \
  --publish 5434:5432 \
  --volume //d/docker/pgsql-slave/data:/var/lib/postgresql/data \
  --env PGDATA=/var/lib/postgresql/data \
  --env POSTGRES_PASSWORD=postgres \
  --net dev \
  --ip 172.18.0.3 \
  --restart=no \
  --name postgres-slave \
  postgres:15.3
```

### 4. 从库配置 (Standby 物理机部署)
**注意：** 此步骤适用于物理机部署

- [PostgreSQL: Linux downloads](https://www.postgresql.org/download/linux/#generic)
- [PostgreSQL: File Browser](https://www.postgresql.org/ftp/source/)
- [Ubuntu 22.04.3 安装 PostgreSQL 15](https://www.jianshu.com/p/685f946bd490)
- [Centos7.6安装postgresql15](https://blog.csdn.net/qq_33445829/article/details/130033182)

#### 1. 初始化从库

```shell
# 安装依赖
yum -y install tcl tcl-devel uuid-devel perl-ExtUtils-Embed readline-devel zlib-devel pam-devel libxml2-devel libxslt-devel openldap-devel python-devel gcc-c++ openssl-devel cmake gcc* readline-devel

# 下载源码包 
wget https://ftp.postgresql.org/pub/source/v15.3/postgresql-15.3.tar.gz -O /usr/local/src/postgresql-15.3.tar.gz

# 解压压缩包
cd /usr/local/src && tar -zxvf postgresql-15.3.tar.gz

# 检测系统依赖
cd postgresql-15.3 && ./configure --prefix=/usr/local/pgsql

# 编译
make clean; make

# 安装
make install

# 创建数据目录
cd /usr/local/pgsql
mkdir data

# 添加pgsql用户
adduser postgres
# passwd postgres
chown -R postgres:postgres /usr/local/pgsql
chmod 750 /usr/local/pgsql/data

# 配置环境变量
cat >> /etc/profile << 'EOF'
# Pgsql 环境变量
PGHOME=/usr/local/pgsql
PGDATA=$PGHOME/data
PATH=$PATH:$HOME/.local/bin:$HOME/bin:$PGHOME/bin
export PGHOME PGDATA PATH

EOF

# 重新加载环境变量
source /etc/profile
```

**注意** 不需要初始化和启动数据库

```shell
# 初始化数据库
${PGHOME}/bin/initdb -D ${PGDATA} --encoding=UTF8 --lc-collate=en_US.UTF-8 --lc-ctype=en_US.UTF-8 

# 修改配置文件
vim ${PGDATA}/postgresql.conf

# 启动数据库
pg_ctl start -D ${PGDATA}
```

#### 2. 停止从库，清空从库数据文件，同步主库文件

```shell
# 切换到postgres用户
su - postgres

# 停止pgsql (如果前面启动了数据库则需要停止)
pg_ctl status
pg_ctl stop -D $PGDATA -l $PGLOG

# 清空数据文件(如果前面启动了数据库则需要清除数据目录)
rm -rf  /usr/local/pgsql/data/*

# 同步主库文件
pg_basebackup -D /usr/local/pgsql/data/ -h 172.18.0.2 -p 5432 -U replica -Fp -Xs -Pv -R -W
```

#### 5. 重启从库

```shell
pg_ctl restart
```

### 5. 验证主从同步
#### 1. 检查从库是否配置成功

```shell
# 主库
su - postgres
psql postgres
select pid,client_addr,sync_state from pg_stat_replication;
```

结果如下
| client_addr | sync_state |
| ----------- | ---------- |
| 172.18.0.3  | sync       |
| 172.18.0.1  | potential  |

#### 2. 查询节点状态

```shell
# 主库
pg_controldata | grep 'Database cluster state'
# 输出如下
# Database cluster state:               in production

# 从库
pg_controldata | grep 'Database cluster state'
# 输出如下
# Database cluster state:               in archive recovery
```

#### 3. 数据同步测试

```shell
# 主库执行
psql -h localhost -p 5432 -U postgres -W -d postgres
select client_addr,usename,backend_start,application_name,sync_state,sync_priority FROM pg_stat_replication;
CREATE DATABASE test;
\connect pgtest
DROP DATABASE test;

# 从库执行
psql -h localhost -p 5432 -U postgres -W -d postgres
SELECT datname FROM pg_database;
\connect pgtest
# 主库新建删除数据库时，从库也将数据同步过来了
```

#### 4. 移除节点
```shell
# 切换到postgres用户
su - postgres

# 停止pgsql
pg_ctl status
pg_ctl stop -D $PGDATA -l $PGLOG

# 清空数据文件
rm -rf  /usr/local/pgsql/data/*

# 重新初始化数据库
${PGHOME}/bin/initdb -D ${PGDATA} --encoding=UTF8 --lc-collate=en_US.UTF-8 --lc-ctype=en_US.UTF-8 

# 修改配置文件
vim ${PGDATA}/postgresql.conf

# 启动数据库
pg_ctl start -D ${PGDATA}
```

### 6. 创建只读账号

在主库执行即可，账号信息会同步到其他节点
```shell
# 1. 创建一个用户名为readonly密码为ropass的用户
CREATE USER readonly WITH ENCRYPTED PASSWORD 'ropass';

# 2. 用户只读事务
ALTER USER readonly SET default_transaction_read_only=on;

# 3. 把所有库的语言的USAGE权限给到readonly
GRANT USAGE ON SCHEMA public TO readonly;

# 4. 授予select权限(这句要进入具体数据库操作在哪个db环境执行就授予那个db的权)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```
