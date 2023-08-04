- [InfluxDB Offical](https://www.influxdata.com)
- [InfluxDB Offical Docker](https://docs.influxdata.com/influxdb/v2.0/install/?t=Docker)
- [InfluxDB Docker](https://hub.docker.com/_/influxdb)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create influx_data;

# docker run -i --rm influxdb:1.8 influxd config > D:/docker/influxdb/conf/influxdb.conf

# 获取默认配置文件
docker run -d --name influxdb_temp influxdb:1.8 \
&& docker exec -it influxdb_temp influxd config /etc/influxdb/influxdb.conf \
&& docker cp influxdb_temp:/etc/influxdb/influxdb.conf D:/docker/influxdb/conf/influxdb.conf \
&& docker stop influxdb_temp && docker rm influxdb_temp

# 运行容器
docker run -d \
  --publish 8086:8086 \
  --volume //d/docker/influxdb/data:/var/lib/influxdb \
  --volume //d/docker/influxdb/conf/influxdb.conf:/etc/influxdb/influxdb.conf:ro \
  --env DOCKER_INFLUXDB_INIT_USERNAME=admin \
  --env DOCKER_INFLUXDB_INIT_PASSWORD=admin@123 \
  --net dev \
  --restart=no \
  --name influxdb \
  influxdb:1.8 -config /etc/influxdb/influxdb.conf

docker exec -it -u root influxdb /bin/bash

# 修改配置
apt update && apt-get install -y vim

vim /etc/influxdb/influxdb.conf
[http]
  enable=true
  auth-enable=true

cat << EOF >> /etc/influxdb/influxdb.conf
[http]
  enable=true
  auth-enable=true
EOF

# 创建用户
influx

SHOW DATABASES;
USE _internal;
CREATE USER "root" WITH PASSWORD '123456' WITH ALL PRIVILEGES;
SHOW USERS;

# 重启使配置生效
docker container restart influxdb

# 查询版本
SHOW DIAGNOSTICS;
SHOW STAT;

# 查询tag字段和field字段
show tag keys from cpu

show field keys from cpu
```

- Account
  - admin/admin@123
  - root/123456


## 2. Windows安装InfluxDB及设置用户权限说明
### 安装Influxdb
1. 进入网址https://portal.influxdata.com/downloads/1.8

2. 将`influxdb`的zip压缩文件，解压到指定目录中
3. `管理员身份`运行cmd进入`influxdb`的文件夹内
4. 生成`influxdb`数据的默认配置config文件
  > 输入命令 `influxd config > influxd.config`

5. 编辑新生成的`influxd.config`文件，修改influxdb存放数据的路径

  ```shell
    [meta]	
      dir = "D:\\influxdb\\influxdatas\\meta"
      ···  ···  ···  ···
    [data]
      dir = "D:\\influxdb\\influxdatas\\data"	
      ···  ···  ···  ···
      wal-dir = "D:\\influxdb\\influxdatas\\wal"
  ```

6. 编辑完毕后护保存退出，在cmd内输入命令`influxd -config influxd.config`

7. 会输出 InfluxDB 的Logo，运行InfluxDB时不可关闭此命令窗口

8. 双击打开`influx.exe`文件，进行简单的操作。 输入 `SHOW DATABASES`

### InfluxDB增加用户及权限
1. 将`influxd.config`文件里，`auth-enabled = false`改为`true`
2. 关闭之前启动的`influxd.exe`命令窗口
3. 以管理员模式打开cmd窗口，重新进入`influxdb-1.x.x-1`的文件夹内
4. 输入启动服务命令`influxd -config influxd.config`
5. 双击打开`influx.exe`文件， 输入 `SHOW DATABASES`，如果报错说明身份认证功能已打开
6. 创建admin管理员用户`CREATE USER influxdb WITH PASSWORD 'influxdb' WITH ALL PRIVILEGES`
7. 验证账户是否创建成功，输入`auth`后按回车,根据提示输入用户名和密码。登录后输入`SHOW DATABASES`，如有输出数据库名称即为安装成功

## 3. 备份和还原
为了防止因为操作错误或机器故障导致数据丢失，InfluxDB企业版提供了两个工具集：备份和还原
备份工具集；导出和导入数据工具集。这两个工具集都可以用于数据备份和还原，但侧重点又有所不
同。
- 备份和还原备份工具集：适用于大多数场景，是通用型工具。
- 导出和导入数据工具集：针对海量数据集（100G以上）场景补充设计的备份工具。

上述两个工具集可用于以下场景：
- 在意外故障导致数据损坏后进行灾难恢复。
- 将数据迁移到新环境或新服务器。
- 将集群还原到一致性状态。

备份和还原备份工具集支持以数据库、保留策略、分片3个维度选定要操作的数据，进行备份或
还原备份操作，一般推荐使用备份和还原备份工具集。

> 注意：对于大型数据集（100G以上），推荐使用导出和导入数据工具集。
Influx 企业级版本备份恢复官方文档：[Back up and restore | InfluxDB Enterprise 1.10
Documentation](https://docs.influxdata.com/enterprise_influxdb/v1.10/administration/backup-and-restore/)

### 1. 备份
备份是指创建存放在META节点上的元数据和DATA节点上的分片数据的副本，并将该副本存储在
指定目录中。除了指定的数据副本，一个完整的备份还包括一个JSON格式的备份描述文件，描述具
体的备份内容。所有备份文件的文件名包含一个UTC时间戳，表示创建备份的时间。

- META节点的元数据备份：20221108T034621Z.meta
- DATA节点的分片数据备份：20221108T034621Z.<shard_id>.tar.gz
- 备份描述文件：20221108T034621Z.manifest

备份可以是完整备份或增量备份，默认情况下，生成的备份是增量备份。增量备份会创建自上次
增量备份以来已更改的元数据和分片数据的副本。如果当前目录下不存在增量备份，系统将自动做完
整备份。

> 注意：因为还原完整备份的命令与还原增量备份的命令不同，为防止还原备份时出错，建议将完
整备份和增量备份放置在不同的目录中。

参考官方文档连接：[Back up and restore data in InfluxDB v1.8 | InfluxDB OSS 1.8 Documentation](https://docs.influxdata.com/influxdb/v1.8/administration/backup_and_restore/#time-based-backups)

备份命令基本语法：

```shell
influxd backup
[ -database <db_name> ] # 指定需要备份的数据库名称，可选，若没有指定，将备份所有数据
库
[ -portable ] # 表示在线备份，必选
[ -host <host:port> ] # influxdb服务所在的机器，默认为 127.0.0.1:8088
[ -retention <rp_name> ] | [ -shard <shard_ID> -retention <rp_name> ] # 备份的保留策略，注意shard是挂在rp下的；我们需要备份的就是shard中的数据
[ -start <timestamp> [ -end <timestamp> ] | -since <timestamp> ] # 备份指定时间段的数据
<path-to-backup> # 备份文件的输出地址
# 补充
-host: fluxdb绑定地址(仅当从远程fluxdb主机创建备份时需要)
-database/db:数据库名称(如果不指定数据库名称，则备份所有数据库)
-rp:保留策略名称(如果不指定保留策略，则备份所有保留策略)
-shard:分片ID(如果不指定分片ID，则备份所有分片)。需要保留策略。)
-start:起始时间(如果不指定起始时间，则备份所有时间的数据。)
-end/stop:停止时间(如果不指定停止时间，则备份到当前时间)。
```

1. 备份所有的数据库
  将 [influxdb](https://so.csdn.net/so/search?q=influxdb&spm=1001.2101.3001.7020) 中的所有的数据库都备份到 /path/to/backup-directory 目录下：
    > influxd backup -portable /path/to/backup-directory
2. 从远程InfluxDB实例备份所有数据
    > influxd backup -portable -host 203.0.113.0:8088 /path/to/backup-directory
3. 备份指定数据库
  假设此时 influxdb 中有数据库 monitor，将数据库monitor中的所有数据完整备份到指定目录中：
    > influxd backup -portable -db monitor /path/to/backup-directory
4. 备份特定的时间范围
  备份2022-01-01到2022-02-01内的数据：
    > influxd backup -portable -start 2022-01-01T00:00:00Z -stop 2022-02-01T00:00:00Z /path/to/backup-directory
5. 备份指定时间到现在的数据
    > influxd backup -portable -start 2022-01-01T00:00:00Z /path/to/backup-directory
6. 备份特定的保留策略
    > influxd backup -portable -db example-db -rp example-retention-policy /path/to/backupdirectory
7. 备份特定的shard
    > influxd backup -portable -rp example-retention-policy -shard 123 /path/to/backup-directory

如何查看shard id 参考官方文档：[InfluxQuery Language (InfluxQL) reference | InfluxDB OSS 1.8
Documentation](https://docs.influxdata.com/influxdb/v1.8/query_language/spec/#show-shards)

### 2. 恢复
恢复命令基本语法：

```shell
influxd restore [ -db <db_name> ] # 待恢复的数据库(备份中的数据库名)
-portable | -online
[ -host <host:port> ] # influxdb 的服务器
[ -newdb <newdb_name> ] # 恢复到influxdb中的数据库名
[ -rp <rp_name> ] # 备份中的保留策略
[ -newrp <newrp_name> ] # 恢复的保留策略
[ -shard <shard_ID> ]
<path-to-backup-files>
# 补充说明
-host: fluxdb绑定地址(仅在将备份恢复到远程fluxdb主机时需要)
-db:数据库名称(如果不指定数据库名称，则恢复所有数据库)
-newdb:新的数据库名称(当恢复一个已经存在的数据库时需要)
-rp:保留策略名称(如果不指定保留策略，则恢复所有保留策略)
-newrp:新的保留策略名称(在恢复已经存在的保留策略时需要)
-shard:分片ID(如果不指定分片ID，则备份所有分片)。需要保留策略。)
```

1. 恢复所有数据库
    > influxd restore -portable /path/to/backup-directory
2. 将所有数据恢复到远程InfluxDB实例
    > influxd restore -portable -host 203.0.113.0:8088 /path/to/backup-directory
3. 恢复一个特定的数据库
    > influxd restore -portable -db example-db /path/to/backup-directory
4. 从已经存在的数据库中恢复数据
  如果想将备份恢复到一个已经存在的database中时，并不是那么简单的，这里采用的一个策略是
  先备份到一个临时的db中，然后将临时DB中的数据写入已存在的db中。
    ```shell
    # 1. 将备份恢复到临时数据库example-tmp-db中
    influxd restore -portable -db example-db -newdb example-tmp-db /path/to/backup-directory
    # 2. 登录连接influx客户端，从临时数据库查询数据，并将其写回现有数据库test中
    SELECT * INTO "test".autogen.:MEASUREMENT FROM "example-tmp-db".autogen./.*/ GROUP BY *
    # 3. 删除临时数据库example-tmp-db
    DROP DATABASE "example-tmp-db"
    ```
5. 恢复指定的保留策略
    > influxd backup -portable -db example-db -rp example-retention-policy /path/to/backupdirectory
6. 从已经存在的保留策略中恢复数据
    > influxd restore -portable -db example-db -rp example-rp -newrp example-new-rp /path/to/backup-directory
7. 恢复指定的分片
    > influxd backup -portable -db example-db -rp example-rp -shard 123 /path/to/backup-directory
