
## Mysql 集群安装（Docker版）
- [基于Docker的Mysql主从复制搭建](https://www.cnblogs.com/songwenjie/p/9371422.html)

为了固定IP可以单独创建一个网络

- master: 172.18.0.4
- slave: 172.18.0.5

```shell
# 创建网络
docker network create --subnet=172.18.0.0/16 dev

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
  --net dev \
  --ip 172.18.0.4 \
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
  --net dev \
  --ip 172.18.0.5 \
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
CHANGE MASTER TO master_host='172.18.0.4', master_port=3306, master_user='slave', master_password='slave', master_log_file='mysql-bin.000001', master_log_pos= 157, master_connect_retry=30, get_master_public_key=1;

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

> Last_IO_Error: Error connecting to source 'slave@172.18.0.4:3306'. This was attempt 1/86400, with a delay of 30 seconds between attempts. Message: Authentication plugin 'caching_sha2_password' reported error: Authentication requires secure connection.

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
