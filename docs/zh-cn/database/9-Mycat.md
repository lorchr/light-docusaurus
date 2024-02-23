- [Mycat1 Github](https://github.com/MyCATApache/Mycat-Server)
- [Mycat2 Github](https://github.com/MyCATApache/Mycat2)
- [Mycat Document](http://www.mycat.org.cn/)
- [SpringBoot 整合 MyCat 实现读写分离](https://blog.csdn.net/qq_42003636/article/details/129475274)
- [mycat的介绍及使用](https://www.jianshu.com/p/460ab9c072be)

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
docker network create --subnet=172.18.0.0/16 pgsql

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
  --net pgsql \
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
  --net pgsql \
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
  --net pgsql \
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
pg_ctl start
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
select client_addr,sync_state from pg_stat_replication;
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


## Mysql 集群安装（Docker版）
- [基于Docker的Mysql主从复制搭建](https://www.cnblogs.com/songwenjie/p/9371422.html)

为了固定IP可以单独创建一个网络

- master: 172.18.0.2
- slave: 172.18.0.3

```shell
# 创建网络
docker network create --subnet=172.18.0.0/16 mysql

# 容器创建后可以使用此命令查看容器IP
docker inspect mysql-master | grep IPAddress 
```

**注意:** 如果单独创建网络，其他非本网络的容器无法访问此网络

### 1. 主库配置（Master）

#### 1. 初始化数据库

```shell

# 创建文件夹
mkdir -p //d/docker/mysql-master/{conf,data,logs}

# 运行容器
docker run -d \
  --publish 3316:3306 \
  --volume //d/docker/mysql-master/data:/var/lib/mysql \
  --volume //d/docker/mysql-master/conf:/etc/mysql/conf.d \
  --volume //d/docker/mysql-master/logs:/var/log/mysql \
  --env MYSQL_ROOT_PASSWORD=admin \
  --env MYSQL_DATABASE=test \
  --env MYSQL_USER=test \
  --env MYSQL_PASSWORD=test \
  --net mysql \
  --ip 172.18.0.2 \
  --restart=on-failure:3 \
  --name mysql-master \
  mysql:8.0

```

#### 2. 配置 `/etc/mysql/conf.d/mysql.cnf`

在 `//d/docker/mysql-master/conf` 下新建文件 `mysql.cnf` 即可

```conf
[mysqld]
# 同一局域网内注意要唯一
server-id=100
# 开启二进制日志功能，可以随便取（关键）
log-bin=mysql-bin
# 生成二进制文件的名称格式
log-bin-index=mysql-bin.index
# binary log 二进制日志文件的格式，有三种（statement ， row , mixed），可以根据场景选用，mysql默认采用statement，建议使用mixed
binlog_format=MIXED
# 事务提交后，将二进制文件写入磁盘并立即执行刷新操作，相当于是同步写入磁盘，不经过操作系统的缓存
sync_binlog=1
# 自动清除（purge）设定天数前生成的binlog日志文件
expire_logs_days=90
# 提交事务的时候，就必须把 redo log 从内存刷入到磁盘文件里去，只要事务提交成功，那么 redo log 就必然在磁盘里了
innodb_flush_log_at_trx_commit=1

# 需要同步的数据库，多个库在slave端指定
# binlog-do-db=test
# 忽略的数据库
# binlog_ignore_db=mysql
```

#### 3. 创建同步用户

```shell
docker exec -it -u root mysql-master /bin/bash

mysql -u root -p

SHOW DATABASES;
USE mysql;
SELECT user, host, authentication_string, plugin FROM user;
DROP USER 'slave'@'%';
CREATE USER 'slave'@'%' IDENTIFIED BY 'slave';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'slave'@'%';
FLUSH PRIVILEGES;

docker container restart mysql-master
```

#### 4. 重启数据库

```shell
docker container restart mysql-master
```

### 2. 从库配置（Slave）

#### 1. 初始化数据库

```shell
# 创建文件夹
mkdir -p //d/docker/mysql-slave/{conf,data,logs}

# 运行容器
docker run -d \
  --publish 3326:3306 \
  --volume //d/docker/mysql-slave/data:/var/lib/mysql \
  --volume //d/docker/mysql-slave/conf:/etc/mysql/conf.d \
  --volume //d/docker/mysql-slave/logs:/var/log/mysql \
  --env MYSQL_ROOT_PASSWORD=admin \
  --env MYSQL_DATABASE=test \
  --env MYSQL_USER=test \
  --env MYSQL_PASSWORD=test \
  --net mysql \
  --ip 172.18.0.3 \
  --restart=on-failure:3 \
  --name mysql-slave \
  mysql:8.0

```

#### 2. 配置 `/etc/mysql/conf.d/mysql.cnf`

在 `//d/docker/mysql-slave/conf` 下新建文件 `mysql.cnf` 即可

```conf
[mysqld]
## 设置server_id,注意要唯一
server-id=101
## 开启二进制日志功能，以备Slave作为其它Slave的Master时使用
log-bin=mysql-slave-bin
## relay_log配置中继日志
relay_log=mysqld-relay-bin
# 中继日志文件的命名格式
relay-log-index=mysqld-relay-bin.index

# 指定要复制的库，多个添加多行
# 在master端不指定 binlog-do-db ，在slave端用 replicate-do-db 来过滤
# replicate-do-db=test1
# replicate-do-db=test2
# 忽略的数据库，多个数据库写多条
# replicate-ignore-db=mysql
```

#### 3. 重启数据库

```shell
docker container restart mysql-slave
```

### 3. 连接Master和Slave

#### 1. 主库操作

```shell
docker exec -it -u root mysql-master /bin/bash

mysql -u root -p

# 查看log_bin是否开启
show variables like 'log_bin';

+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+

# 查看master节点状态
show master status;

+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      157 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
```

`File`和`Position`字段的值后面将会用到，在后面的操作完成之前，需要保证Master库不能做任何操作，否则将会引起状态变化，File和Position字段的值变化。

#### 2. 从库操作

```shell
docker exec -it -u root mysql-slave /bin/bash

mysql -u root -p

# 同步主库 master_log_file 及 master_log_pos 的值是前面主库记录的值
CHANGE MASTER TO master_host='172.18.0.2', master_port=3306, master_user='slave', master_password='slave', master_log_file='mysql-bin.000001', master_log_pos= 157, master_connect_retry=30, get_master_public_key=1;

# 查看主从同步状态
show slave status \G;

# 开启主从复制，出现异常可以停止同步，重置中继日志，修复后再次开启
start slave;
# stop slave;
# reset slave;

# 查看主从同步状态
show slave status \G;

# 输出结果：如果上面两行为 Yes 表示已经正常开启主从复制，否则根据错误码和错误信息排查问题
 Slave_IO_Running: Yes
Slave_SQL_Running: Yes
    Last_IO_Errno: 错误码
    Last_IO_Error: 错误信息
```

命令说明：
- `master_host` : Master的地址，指的是容器的独立ip，可以通过`docker inspect --format='{{.NetworkSettings.IPAddress}}' mysql-master`  查询容器的ip
- `master_port` : Master的端口号，指的是容器的端口号
- `master_user` : 用于数据同步的用户
- `master_password` : 用于同步的用户的密码
- `master_log_file` : 指定 Slave 从哪个日志文件开始复制数据，即上文中提到的 `File` 字段的值
- `master_log_pos` : 从哪个 `Position` 开始读，即上文中提到的 `Position` 字段的值
- `master_connect_retry` : 如果连接失败，重试的时间间隔，单位是秒，默认是60秒
- `get_master_public_key` : 获取主库密钥

在Slave 中的mysql终端执行 `show slave status \G;` 用于查看主从同步状态。

正常情况下，`Slave_IO_Running` 和` Slave_SQL_Running` 都是`No`，因为我们还没有开启主从复制过程。使用 `start slave;` 开启主从复制过程，然后再次查询主从同步状态 `show slave status \G;`。

`Slave_IO_Running` 和 `Slave_SQL_Running` 都是`Yes`，说明主从复制已经开启。此时可以测试数据同步是否成功。

### 4. 常见错误

1. 登录出现 `mysql: [Warning] World-writable config file '/etc/mysql/conf.d/mysql.cnf' is ignored.`。

这个警告出现的原因是 MySQL 发现挂载的配置文件 `/etc/mysql/conf.d/mysql.cnf` 具有全局可写权限，因此忽略了该文件。MySQL 引擎非常注重安全性和数据完整性。如果配置文件具有全局可写权限，任何用户都可以修改该文件，包括恶意用户。这可能导致潜在的安全风险和数据损坏。为了提高安全性，当 MySQL 检测到挂载的配置文件具有全局可写权限时，它会发出警告并忽略该文件。这样做是为了确保只有授权的用户能够修改配置文件并对 MySQL 进行更改。

```shell
# 将 dos 文件转为 unix 文件
awk '{ sub("\r$", ""); print }' /etc/mysql/conf.d/mysql.cnf > /etc/mysql/conf.d/mysql.cnf

# 修改权限
chmod 644 /etc/mysql/conf.d/mysql.cnf
```

2. `start slave;` 开启主从同步出现 `Authentication plugin 'caching_sha2_password' reported error: Authentication requires secure connection.`

> Last_IO_Error: Error connecting to source 'slave@172.18.0.2:3306'. This was attempt 1/86400, with a delay of 30 seconds between attempts. Message: Authentication plugin 'caching_sha2_password' reported error: Authentication requires secure connection.

- [Section 6.4.1.3, “SHA-256 Pluggable Authentication”.](https://dev.mysql.com/doc/refman/8.0/en/sha256-pluggable-authentication.html)
- [caching_sha2_password as the Preferred Authentication Plugin.](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html#upgrade-caching-sha2-password)
- [Section 6.3, “Using Encrypted Connections”](https://dev.mysql.com/doc/refman/8.0/en/encrypted-connections.html)
- [MySQL :: MySQL 8.0 Reference Manual :: 6.4.1.2 Caching SHA-2 Pluggable Authentication](https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html)

Mysql 8.0 默认使用 `caching_sha2_password` 插件对登录信息进行加密，此方式需要配置认证公钥，可以改为 `mysql_native_password` 插件认证或者配置获取Master节点的公钥

方案一: [修改用户的认证方式](https://blog.csdn.net/qq_58645958/article/details/130272982)
```shell
docker exec -it -u root mysql-master /bin/bash

mysql -u root -p

USE mysql;
SELECT plugin FROM `user` WHERE user = 'slave';
# 将 caching_sha2_password 改为 mysql_native_password
ALTER USER 'slave'@'%' IDENTIFIED WITH mysql_native_password BY 'slave';
```

方案二: [添加读取主库公钥配置](https://blog.csdn.net/weixin_55136824/article/details/131822062)
```shell
docker exec -it -u root mysql-slave /bin/bash

mysql -u root -p

CHANGE MASTER TO GET_MASTER_PUBLIC_KEY=1;
```

## 安装Mycat
- [Mycat-server-1.6.7.5-release-20200422133810-linux.tar.gz](https://github.com/MyCATApache/Mycat-Server/releases/download/Mycat-server-1675-release/Mycat-server-1.6.7.5-release-20200422133810-linux.tar.gz)
- [Mycat（实践篇 - 基于PostgreSQL的水平切分、主从复制、读写分离）](http://www.manongjc.com/detail/52-btpqcqewaykjbuq.html)

4. `ERROR 1872 (HY000): Replica failed to initialize applier metadata structure from the repository`

因为从数据库可能以前配置过，生成过 中继日志文件，导致 从数据库 slave 中还记录着旧数据，这时可以使用 命令 `reset slave;`

### 1. 下载安装
```shell
# 下载解压
wget https://github.com/MyCATApache/Mycat-Server/releases/download/Mycat-server-1675-release/Mycat-server-1.6.7.5-release-20200422133810-linux.tar.gz
tar -zxvf Mycat-server-1.6.7.5-release-20200422133810-linux.tar.gz

# 创建用户
cd mycat
sudo useradd mycat
sudo passwd mycat
sudo chown -R mycat:mycat /usr/local/mycat
```

### 2. 环境配置
```shell
# 配置环境变量 
cat >> /etc/profile << 'EOF'
# MyCat 环境变量 
MYCAT_HOME=/usr/local/mycat
PATH=$MYCAT_HOME/bin:$PATH
export PATH
EOF

# 使配置生效
source /etc/profile
```

### 3. 数据库驱动

- 对于Mysql MariaDB 不需要额外配置数据库驱动
- 对于Postgresql Oracle SqlServer需要提供JDBC驱动到 `/usr/local/mycat/lib/` 目录下

## 配置Mycat
### 1. 在master数据库中添加`user1`（写）、`user2`（只读）两个账户，并配置权限。

### 2. 配置mycat的`schema.xml`
```xml
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">
 
  <schema name="mes_technical" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1">
  </schema>

  <dataNode name="dn1" dataHost="myhost1" database="mes_technical" />
  <dataHost name="myhost1" maxCon="1000" minCon="10" balance="0"
              writeType="0" dbType="postgresql" dbDriver="jdbc" switchType="1"  slaveThreshold="100">
      <heartbeat>select user</heartbeat>
      <writeHost host="hostM1" url="jdbc:postgresql://192.168.3.49:5433/mes_technical" user="postgres" password="postgres">
        <!-- 可以配置多个从库 -->
        <readHost host="hostS2" url="jdbc:postgresql://192.168.3.49:5434/mes_technical" user="readonly" password="ropass" />
        <readHost host="hostS3" url="jdbc:postgresql://192.168.3.34:5432/mes_technical" user="readonly" password="ropass" />
      </writeHost>
  </dataHost>

</mycat:schema>
```

### 3. 配置mycat的`server.xml`，增加两个用户
```xml
<user name="postgres" defaultAccount="true">
  <property name="password">postgres</property>
  <property name="schemas">mes_technical</property>
  <property name="defaultSchema">mes_technical</property>
</user>
 
<user name="readonly">
  <property name="password">ropass</property>
  <property name="schemas">mes_technical</property>
  <property name="readOnly">true</property>
  <property name="defaultSchema">mes_technical</property>
</user>
```
**注意** 需要删除默认的用户，否则会启动报错

### 4. 启动MyCat
```shell
# 创建日志目录
mkdir logs

# 启动mycat，整个启动流程大概需要1分钟
mycat start

# 查看启动日志
tail -f logs/wrapper.log

# 查看运行日志
tail -f logs/mycat.log
```

## Navicat测试
Navicat新建数据库连接
- 类型: Mysql
- 主机: 192.168.3.34 (Mycat服务所在IP)
- 端口: 8066 (Mycat默认端口)
- 账号: postgres server.xml 中配置的账号
- 密码: postgres server.xml 中配置的密码

## 集成 Spring Boot 实现读写分离
其实整合MyCat之后，切换数据源的工作可以交给MyCat，不需要以下操作，手动切换。以下只是介绍怎么手动切换数据源

- 首先需要配置好数据库的主从关系。
- 配置好MyCat服务。
- 实现MyCat与MySQL读写分离。

### 1. 添加依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
 
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.0.23</version>
</dependency>
```

### 2. 创建数据源
```java
package com.muycode.itoolsimple.datasource;
 
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
 
import javax.sql.DataSource;
 
@Configuration
public class DataSourceConfig {
 
    /**
     * 创建可读数据源
     *
     * @return
     */
    @Bean(name = "selectDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.select")
    public DataSource dataSource1() {
        return DataSourceBuilder.create().build();
    }
 
    /**
     * 创建可写数据源
     *
     * @return
     */
    @Bean(name = "updateDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.update")
    public DataSource dataSource2() {
        return DataSourceBuilder.create().build();
    }
}
```

### 3. 设置数据源
```java
package com.muycode.itoolsimple.datasource;
 
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
 
@Component
@Lazy(false)
public class DataSourceContextHolder {
    /**
     * 采用ThreadLocal 保存本地多数据源
     */
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
 
    /**
     * 设置数据源类型
     *
     * @param dbType
     */
    public static void setDbType(String dbType) {
        contextHolder.set(dbType);
    }
    /**
     * 获取数据源类型
     */
    public static String getDbType() {
        return contextHolder.get();
    }
 
    public static void clearDbType() {
        contextHolder.remove();
    }
}
```

### 4. 返回数据源
```java
package com.muycode.itoolsimple.datasource;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.stereotype.Component;
 
import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
 
@Component
@Primary
public class DynamicDataSource extends AbstractRoutingDataSource {
 
    @Autowired
    @Qualifier("selectDataSource")
    private DataSource selectDataSource;
 
    @Autowired
    @Qualifier("updateDataSource")
    private DataSource updateDataSource;
 
    /**
     * 返回生效的数据源名称
     */
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDbType();
    }
    /**
     * 配置数据源信息
     */
    @Override
    public void afterPropertiesSet() {
        Map<Object, Object> map = new HashMap<>(16);
        map.put("selectDataSource", selectDataSource);
        map.put("updateDataSource", updateDataSource);
        setTargetDataSources(map);
        setDefaultTargetDataSource(updateDataSource);
        super.afterPropertiesSet();
    }
}
```

### 5. 创建切面，动态设置数据源
```java
package com.muycode.itoolsimple.datasource;
 
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
 
@Aspect
@Component
@Lazy(false)
@Order(0) // Order设定AOP执行顺序 使之在数据库事务上先执行
public class DataSourceOptionAop {
 
    /**
     * 可读数据源
     */
    private final static String DATASOURCE_TYPE_SELECT = "selectDataSource";
    /**
     * 可写数据源
     */
    private final static String DATASOURCE_TYPE_UPDATE = "updateDataSource";
    /**
     * 创建切面，根据方法类型选择不同的数据源
     *
     * @param joinPoint
     * @author muycode
     */
    @Before("execution(* com.zdys.tcmmes.*.service.*.*(..))")
    public void process(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.print("=========== " + methodName);
        if (methodName.startsWith("save") || methodName.startsWith("update")
                || methodName.startsWith("del") || methodName.startsWith("add") || methodName.startsWith("login")
                || methodName.startsWith("logout") || methodName.startsWith("send")) {
            DataSourceContextHolder.setDbType(DATASOURCE_TYPE_UPDATE);
            System.out.println("-----------------使用updateDataSource数据源-------------------");
        } else {
            DataSourceContextHolder.setDbType(DATASOURCE_TYPE_SELECT);
            System.out.println("-----------------使用selectDataSource数据源-------------------");
        }
    }
 
    /**
     * 在service服务层使用完之后，清理绑定的数据源
     *
     * @author muycode
     */
    @After("execution(* com.zdys.tcmmes.*.service.*.*(..))")
    public void after() {
        DataSourceContextHolder.clearDbType();
    }
}
```

### 6. 输出结果
```shell
=========== getByUsername-----------------使用selectDataSource数据源-------------------
=========== getPermissionStringByUserId-----------------使用selectDataSource数据源-------------------
=========== getPermissionByUserId-----------------使用selectDataSource数据源-------------------
=========== getRolePermissionLinkByUserId-----------------使用selectDataSource数据源-------------------
=========== save-----------------使用updateDataSource数据源-------------------
=========== queryByPage-----------------使用selectDataSource数据源-------------------
=========== save-----------------使用updateDataSource数据源-------------------
=========== getPermissionAll-----------------使用selectDataSource数据源-------------------
=========== save-----------------使用updateDataSource数据源-------------------
=========== getSysCodeAll-----------------使用selectDataSource数据源-------------------
=========== save-----------------使用updateDataSource数据源-------------------
=========== getByRid-----------------使用selectDataSource数据源-------------------
```
