## 一、Shardingsphere Proxy 安装 (Docker版)

```shell
# 下载镜像
docker pull apache/shardingsphere-proxy:5.2.1

# 创建文件夹
mkdir -p //d/docker/shardingsphere-proxy/{conf,data,logs,ext-lib}

# 获取配置文件
docker run -d --name shardingsphere_proxy_temp --entrypoint=bash apache/shardingsphere-proxy:5.2.1 \
&& docker cp shardingsphere_proxy_temp:/opt/shardingsphere-proxy/conf d:/docker/shardingsphere-proxy/ \
&& docker rm shardingsphere_proxy_temp

# 安装Mysql驱动
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.11/mysql-connector-java-8.0.11.jar -O d:/docker/shardingsphere-proxy/ext-lib/mysql-connector-java-8.0.11.jar

# 运行容器
docker run -d \
  --publish 13307:3307 \
  --volume //d/docker/shardingsphere-proxy/ext-lib:/opt/shardingsphere-proxy/ext-lib \
  --volume //d/docker/shardingsphere-proxy/conf:/opt/shardingsphere-proxy/conf \
  --volume //d/docker/shardingsphere-proxy/logs:/opt/shardingsphere-proxy/logs \
  --env PORT=3307 \
  --net dev \
  --ip 172.18.0.6 \
  --restart=on-failure:3 \
  --name shardingsphere-proxy \
  apache/shardingsphere-proxy:5.2.1

docker exec -it -u root shardingsphere-proxy /bin/bash

```

**注:** 配置文件部分按照后续章节编写

## 二、Shardingsphere Proxy 安装 (二进制版)

### 1. 前置条件
运行需要Java环境，Jdk版本在 1.8 以上
- [Jdk 1.8+](https://openjdk.org/projects/jdk8/)
- [Jdk 1.8+](https://jdk.java.net/java-se-ri/8-MR5)

### 2. 安装
- [二进制安装](https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-proxy/startup/bin/)
- [二进制安装包下载](https://shardingsphere.apache.org/document/current/cn/downloads/)

```shell
# 下载安装包
wget https://dlcdn.apache.org/shardingsphere/5.4.1/apache-shardingsphere-5.4.1-shardingsphere-proxy-bin.tar.gz -O apache-shardingsphere-5.4.1-shardingsphere-proxy-bin.tar.gz

# 解压
tar -zxvf apache-shardingsphere-5.4.1-shardingsphere-proxy-bin.tar.gz -C /usr/local
mv apache-shardingsphere-5.4.1-shardingsphere-proxy-bin shardingsphere-proxy

# 下载Mysql依赖
mkdir -p /usr/local/shardingsphere-proxy/ext-lib
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.11/mysql-connector-java-8.0.11.jar -O /usr/local/shardingsphere-proxy/ext-lib/mysql-connector-java-8.0.11.jar
```

操作指令
```shell
# 启动
/usr/local/shardingsphere-proxy/bin/start.sh

# 停止
/usr/local/shardingsphere-proxy/bin/stop.sh

# 查看日志
tail -f logs/stdout.log

# 使用 psql 命令行连接
psql -h 172.21.7.11 -p 3307 -U root -W root -d readwrite_pgsql

# 查看数据表
SELECT tablename FROM pg_tables WHERE schemaname='public';
```

**注:** 配置文件部分按照后续章节编写

## 三、配置 `conf/server.yaml`
配置ShardingSphere-Proxy 运行模式 认证信息及其他属性等

- [模式配置](https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/mode/)
- [权限配置](https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-proxy/yaml-config/authority/)
- [属性配置](https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-proxy/yaml-config/props/)

### 1. 配置 `server.yaml` (5.2.1 版本)
```yaml
mode:
  type: Standalone
  repository:
    type: JDBC

rules:
  - !AUTHORITY
    users:
      - root@%:root
      - sharding@:sharding
    provider:
      type: ALL_PRIVILEGES_PERMITTED

props:
#  max-connections-size-per-query: 1
#  kernel-executor-size: 16  # Infinite by default.
#  proxy-frontend-flush-threshold: 128  # The default value is 128.
#  proxy-opentracing-enabled: false
#  proxy-hint-enabled: false
  sql-show: true

```

### 2. 配置 `server.yaml` (5.4.1 版本)
```yaml
mode:
  type: Standalone
  repository:
    type: JDBC

authority:
  users:
    - user: root@%
      password: root
    - user: sharding
      password: sharding
    - user: postgres
      password: postgres
  privilege:
    type: ALL_PERMITTED
 
props:
#  max-connections-size-per-query: 1
#  kernel-executor-size: 16  # Infinite by default.
#  proxy-frontend-flush-threshold: 128  # The default value is 128.
#  proxy-hint-enabled: false
  sql-show: on
```

## 四、配置 `conf/config-*.yaml`

修改 `conf` 目录下以 `config-` 前缀开头的文件，如：`conf/config-sharding.yaml` 文件，进行分片规则、读写分离规则配置。配置方式请参考[配置手册](https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-proxy/yaml-config/)。`config-*.yaml` 文件的 `*` 部分可以任意命名。 ShardingSphere-Proxy 支持配置多个逻辑数据源，每个以 `config-` 前缀命名的 YAML 配置文件，即为一个逻辑数据源。

### 1. Mysql 读写分离配置 `conf/config-mysql-rws.yaml` (5.2.1 版本)
```yaml
databaseName: readwrite_mysql

dataSources:
 write_ds:
   url: jdbc:mysql://192.168.3.49:3316/mes_technical?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
   username: root
   password: admin
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1
 read_ds_0:
   url: jdbc:mysql://192.168.3.49:3317/mes_technical?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
   username: root
   password: admin
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1

rules:
- !READWRITE_SPLITTING
 dataSources:
   readwrite_ds:
     staticStrategy:
       writeDataSourceName: write_ds
       readDataSourceNames:
         - read_ds_0
     loadBalancerName: random
 loadBalancers:
   random:
     type: RANDOM

```

### 2. Mysql 读写分离配置 `conf/config-mysql-rws.yaml` (5.4.1 版本)
```yaml
databaseName: readwrite_mysql

dataSources:
 write_ds:
   url: jdbc:mysql://192.168.3.49:3316/mes_technical?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
   username: root
   password: admin
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1
 read_ds_0:
   url: jdbc:mysql://192.168.3.49:3317/mes_technical?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
   username: root
   password: admin
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1

rules:
- !READWRITE_SPLITTING
 dataSources:
   readwrite_ds:
     writeDataSourceName: write_ds
     readDataSourceNames:
       - read_ds_0
     loadBalancerName: random
 loadBalancers:
   random:
     type: RANDOM
- !SINGLE
  tables:
    # MySQL 风格
    # - ds_0.t_single # 加载指定单表
    # - ds_1.*        # 加载指定数据源中的全部单表
    - "*.*"           # 加载全部单表

```

### 3. Pgsql 读写分离配置 `conf/config-pgsql-rws.yaml` (5.2.1 版本)
```yaml
databaseName: readwrite_pgsql

dataSources:
 primary_ds:
   url: jdbc:postgresql://192.168.3.49:5433/mes_technical
   username: postgres
   password: postgres
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1
 replica_ds_0:
   url: jdbc:postgresql://192.168.3.49:5434/mes_technical
   username: postgres
   password: postgres
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1

rules:
- !READWRITE_SPLITTING
 dataSources:
   readwrite_ds:
     staticStrategy:
       writeDataSourceName: primary_ds
       readDataSourceNames:
         - replica_ds_0
     loadBalancerName: random
 loadBalancers:
   random:
     type: RANDOM

```

### 4. Pgsql 读写分离配置 `conf/config-pgsql-rws.yaml` (5.4.1 版本)
```yaml
databaseName: readwrite_pgsql

dataSources:
 primary_ds:
   url: jdbc:postgresql://192.168.3.49:5433/test
   username: postgres
   password: postgres
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1
 replica_ds_0:
   url: jdbc:postgresql://192.168.3.49:5434/test
   username: postgres
   password: postgres
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1
 replica_ds_1:
   url: jdbc:postgresql://192.168.3.34:5432/test
   username: postgres
   password: postgres
   connectionTimeoutMilliseconds: 30000
   idleTimeoutMilliseconds: 60000
   maxLifetimeMilliseconds: 1800000
   maxPoolSize: 50
   minPoolSize: 1

rules:
- !READWRITE_SPLITTING
 dataSources:
   readwrite_ds:
     writeDataSourceName: primary_ds
     readDataSourceNames:
       - replica_ds_0
       - replica_ds_1
     loadBalancerName: random
 loadBalancers:
   random:
     type: RANDOM
- !SINGLE
  tables:
    # PostgreSQL 风格
    # - ds_1.public.t_single  # 加载指定单表
    # - ds_2.public.*         # 加载指定schema中的全部单表
    # - ds_3.*.*              # 加载所有schema下的所有表
    - "*.*.*"                 # 加载全部单表
```

## 五、添加Mysql驱动

如果后端连接 `PostgreSQL` 或 `openGauss` 数据库，不需要引入额外依赖。

如果后端连接 `MySQL` 数据库，请下载 [mysql-connector-java-5.1.49.jar](https://repo1.maven.org/maven2/mysql/mysql-connector-java/5.1.49/mysql-connector-java-5.1.49.jar) 或者 [mysql-connector-java-8.0.11.jar](https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.11/mysql-connector-java-8.0.11.jar)，并将其放入 `ext-lib` 目录。

```shell
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.11/mysql-connector-java-8.0.11.jar
```

## 六、使用客户端连接 ShardingSphere-Proxy
执行 `MySQL` / `PostgreSQL` / `openGauss` 的客户端命令直接操作 `ShardingSphere-Proxy` 即可。

### 1. 使用 MySQL 客户端连接 ShardingSphere-Proxy：
```shell
docker exec -it -u root mysql-master /bin/bash

mysql -h 172.18.0.6 -P 3307 -u root -p root -D readwrite_mysql
```

### 2. 使用 PostgreSQL 客户端连接 ShardingSphere-Proxy：
```shell
docker exec -it -u root postgres-master /bin/bash

psql -h 172.18.0.6 -p 3307 -U root -W root -d readwrite_pgsql

# 查看数据库列表
SELECT datname FROM pg_database;

# 查看数据表列表
SELECT tablename FROM pg_tables WHERE schemaname='public';

\x on;
SELECT * FROM pg_tablespace;
SELECT * FROM pg_namespace;
\x off;

# 测试
create table t1(id int);
insert into t1 values(1);
select * from t1;
drop table t1;
```

### 3. 使用 openGauss 客户端连接 ShardingSphere-Proxy：
```shell
gsql -r -h 172.18.0.6 -p 3307 -U root -W root
```


## 七、总结
因为在5.2.1 之前和之后存在较大的破坏性更新，所以两部分配置存在较大的差异和不兼容情况

### 共性问题
1. 多数据库代理问题（针对读写分离）
   - 不兼容同时代理 Mysql 和 Pgsql。需要搭建两个 Shardingsphere proxy，分别来代理 Mysql 和 Pgsql
   - 对于多租户每个租户需要单独一份配置文件，如: `config-tenant1.yaml` `config-tenant2.yaml`
     - `config-tenant1.yaml` 配置 `tenant1` 的数据源 `tenant1_write` `tenant_read1` `tenant_read1`
     - `config-tenant2.yaml` 配置 `tenant1` 的数据源 `tenant2_write` `tenant_read2` `tenant_read2`

2. 对于 bool 值的处理 Mysql 与 Pgsql 表现不一致
   - Mysql  1  0
   - Pgsql  t  f
   - 建议使用字符串或者数字来存储布尔值

### Shardingsphere proxy 5.2.1
1. 对 `json` `jsonb` 类型的属性支持不好
   - 建议直接使用 `text` 大文本格式，可以同时避免在不同数据库之间的兼容性问题
   - 对于类型 `TypeHandler` 直接使用 MybatisPlus 提供的 `JacksonTypeHandler` `FastjsonTypeHandler` `GsonTypeHandler`

### Shardingsphere proxy 5.4.1
1. 不支持系统表的查询，如 `pg_namespace` `pg_tablespace` 等
   - 目前测试仅可以使用 `psql` 命令行的方式查询代理的数据库表，系统表查询报错 `Table or view 'pg_namespace' does not exists`
   - 基本处于不可用的状态，建议直接使用 5.2.1 版本 [issue#29387](https://github.com/apache/shardingsphere/issues/29387)

## 八、参考文档
- [SQL Server 读写分离](https://blog.51cto.com/u_12897/8329842)
- [oracle的读写分离实现](https://blog.51cto.com/u_15101584/2623066)
- [SQL Server 配置分发](https://learn.microsoft.com/zh-cn/sql/relational-databases/replication/configure-distribution?view=sql-server-ver16)

- [【ShardingSphere-proxy +PostgreSQL实现读写分离（静态策略）】](https://blog.csdn.net/weixin_47308871/article/details/126134314)
- [【Sharding Sphere、Spring Boot】Spring Boot整合Sharding Sphere Proxy（5.0.0）](https://blog.csdn.net/apple_csdn/article/details/124454743)
- [【ShardingSphere专题】SpringBoot整合ShardingSphere（一、数据分片入门及实验）](https://blog.csdn.net/qq_32681589/article/details/134651667)
- [shardingsphere-proxy 实现postgresql的分库分表](https://blog.51cto.com/u_13171517/6596021)
