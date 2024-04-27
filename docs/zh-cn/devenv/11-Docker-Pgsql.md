- [Postgres Offical](https://www.postgresql.org/)
- [Postgres Docker](https://hub.docker.com/_/postgres)
- [Redrock Postgres 文档](https://doc.rockdata.net/zh-cn/psycopg/)
- [PGTune - calculate configuration for PostgreSQL based on the maximum performance for a given hardware configuration](https://pgtune.leopard.in.ua/)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create pgsql_data;

# 创建文件夹
mkdir -p D:/docker/pgsql/{conf,data,logs}

# docker run -i --rm postgres cat /usr/share/postgresql/postgresql.conf.sample >  D:/docker/pgsql/conf/postgresql.conf

# 获取默认配置文件
docker run -d --name postgres_temp postgres:15.3 \
&& docker cp postgres_temp:/usr/share/postgresql/postgresql.conf.sample D:/docker/pgsql/conf/postgresql.conf \
&& docker stop postgres_temp && docker rm postgres_temp

# 运行容器
docker run -d \
  --publish 5432:5432 \
	--volume //d/docker/pgsql/data:/var/lib/postgresql/data \
	--volume //d/docker/pgsql/conf/postgresql.conf:/etc/postgresql/postgresql.conf:ro \
  --env PGDATA=/var/lib/postgresql/data \
  --env POSTGRES_PASSWORD=postgres \
  --net dev \
  --restart=no \
  --name postgres \
  postgres:15.3

docker exec -it -u root postgres /bin/bash

docker container restart postgres
```

- Account
  - postgres/postgres

## 2. Pgsql备份还原
### 一、Windows下备份和恢复

1. 备份命令
```shell
pg_dump -h localhost -U postgres test > D:\postgres.bak

1. pg_dump          是备份数据库指令；
2. localhost        是数据库的 ip 地址；
3. postgres         是数据库的用户名；
4. test             是数据库名；
5. >                意思是导出到指定目录；
```

2. 恢复命令
```shell
psql -h localhost -U postgres -d test < D:\postgres.bak

1. psql           是恢复数据库指令；
2. localhost      是要恢复的数据库的 ip 地址；
3. postgres       是数据库的用户名；
4. test           是数据库名；
5. <              意思是导出到指定目录；
```

### 二、Linux 下备份和恢复

1. 备份
```shell
pg_dump -h localhost -U postgres databasename > databasename.bak
```

2. 恢复
```shell
psql -h localhost -U postgres -d databasename < databasename.bak
```

### SQL方式备份和恢复

> 这里我们用到的工具是 `pg_dump` 和 `pg_dumpall`
> 这种方式可以在数据库正在使用的时候进行完整一致的备份，并不阻塞其它用户对数据库的访问。
> 它会产生一个脚本文件，里面包含备份开始时，已创建的各种数据库对象的 SQL 语句和每个表中的数据。
> 可以使用数据库提供的工具 `pg_dumpall` 和 `pg_dump` 来进行备份。
> `pg_dump` 只备份数据库集群中的某个数据库的数据，它不会导出角色和表空间相关的信息，因为这些信息是整个数据库集群共用的，不属于某个单独的数据库。
> `pg_dumpall`，对集簇中的每个数据库调用 pg_dump 来完成该工作,还会还转储对所有数据库公用的全局对象（ pg_dump 不保存这些对象）。
> 目前这包括适数据库用户和组、表空间以及适合所有数据库的访问权限等属性。

例如，在我的计算机上，可使用如下命令对名为 dbname 的数据库进行备份：
```shell
pg_dump –h 127.0.0.1 -p 5432 -U postgres -c -C –f dbname.sql dbname
```

使用如下命令可对全部 pg 数据库进行备份：
```shell
pg_dumpall –h 127.0.0.1 –p 5432 -U postgres –c -C –f db_bak.sql
```

恢复方式很简单。执行恢复命令即可：
```shell
psql –h 127.0.0.1 -p 5432 -U postgres –f db_bak.sql
```

## 3. 常用命令
1. 命令行操作

```shell
# 登录数据库
psql --help
psql -h localhost -p 5432 -U postgres -W -d postgres 
psql --host=localhost --port=5432 --username=postgres --password --dbname=postgres 

# 创建用户并授权
CREATE USER light WITH PASSWORD 'light';
GRANT ALL PRIVILEGES ON DATABASE test TO light;
ALTER TABLE test.test_table OWNER TO light;
```

2. 连接管理

```sql
-- 查询当前连接数
SELECT * FROM pg_stat_activity;

-- 查看过期连接
SELECT * FROM pg_stat_activity WHERE state = 'idle';

--删除连接，括号里传pid
SELECT pg_terminate_backend(151);

-- 查看最大连接数
SHOW max_connections;

-- 修改最大连接数，需要superuser权限
ALTER system SET max_connections = 1000;
```

3. 数据库操作

```sql
-- 查看数据库列表
SELECT datname FROM pg_database;

-- 查看数据表列表
SELECT tablename FROM pg_tables WHERE schemaname='public';

-- 切换到某个数据库
\c db_name;

-- 执行数据库脚本
\i /path/to/scripts.sql

-- 查询当前数据库下的所有数据表
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 删除数据库
DROP DATABASE IF EXISTS "db_name";

-- 创建数据库
CREATE DATABASE "db_name"
    WITH OWNER = postgres
    TEMPLATE = template0
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
GRANT ALL ON DATABASE "db_name"  TO postgres;
```
