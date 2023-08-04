- [Redis Offical](https://redis.io/)
- [Redis Docker](https://hub.docker.com/_/redis)
- [RedisInsight Docker](https://hub.docker.com/r/redislabs/redisinsight)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 获取默认配置文件 http://download.redis.io/redis-stable/redis.conf
curl https://raw.githubusercontent.com/redis/redis/6.2/redis.conf -o D:/docker/redis/conf/redis.conf

# 运行容器
docker run -d \
  --publish 6379:6379 \
  --net dev \
  --restart=no \
  --name redis \
  redis:6.2

docker run -d \
  --publish 38001:8001 \
  --net dev \
  --restart=no \
  --name redisinsight \
  redislabs/redisinsight:1.14.0

vim ./redis.conf

docker run -d \
  --publish 6379:6379 \
  --volume //d/docker/redis/conf/redis.conf:/etc/redis/redis.conf \
  --net dev \
  --restart=no \
  --name redis \
  redis:6.2 redis-server /etc/redis/redis.conf

# 启动时指定密码
docker run -d \
  --publish 6379:6379 \
  --net dev \
  --restart=no \
  --name redis \
  redis:6.2 --requirepass "admin"

docker exec -it -u root redis /bin/bash

# redis-cli 设置密码
cd /usr/local/bin

redis-cli
config get requirepass
config set requirepass "admin"

docker container restart redis

docker cp redis:/usr/local/bin/redis.conf ./redis.conf
```

- Account
  - /admin

[RedisInsight](http://localhost:38001)

## 2. 配置
```conf
# 绑定本机的IP地址，其他客户端只能通过该IP访问redis，本机多个网卡时，可以指定其中的一个或多个（空格分隔）
# bind 127.0.0.1              本机回环地址，只能本机访问
# bind 192.168.0.2 127.0.0.1  可以本机和 通过192.168.0.2 所属网卡访问（即同网段）
# bind * -::1                 通过本机所有的网卡访问
bind 192.168.0.2
# 设置密码
requirepass admin
#修改为守护模式
daemonize yes
# 关闭保护模式
protected-mode no
#设置进程锁文件
pidfile /usr/local/redis/redis.pid
#端口
port 6379
#客户端超时时间
timeout 300
#日志级别
loglevel debug
#日志文件位置
logfile /usr/local/redis/log-redis.log
#设置数据库的数量，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id
databases 8
##指定在多长时间内，有多少次更新操作，就将数据同步到数据文件，可以多个条件配合
#save <seconds> <changes>
#Redis默认配置文件中提供了三个条件：
save 3600 1
save 300 10
save 60 10000
#指定存储至本地数据库时是否压缩数据，默认为yes，Redis采用LZF压缩，如果为了节省CPU时间，
#可以关闭该#选项，但会导致数据库文件变的巨大
rdbcompression yes
#指定本地数据库文件名
dbfilename dump.rdb
#指定本地数据库路径
dir /usr/local/redis/db/
#指定是否在每次更新操作后进行日志记录，Redis在默认情况下是异步的把数据写入磁盘，如果不开启，可能
#会在断电时导致一段时间内的数据丢失。因为 redis本身同步数据文件是按上面save条件来同步的，所以有
#的数据会在一段时间内只存在于内存中
appendonly no
#指定更新日志条件，共有3个可选值：
#no：表示等操作系统进行数据缓存同步到磁盘（快）
#always：表示每次更新操作后手动调用fsync()将数据写到磁盘（慢，安全）
#everysec：表示每秒同步一次（折衷，默认值）
appendfsync everysec
```

## 3. Redis Stream 基本命令 

- https://blog.csdn.net/qq_43956758/article/details/109860706

```lua
# 创建stream
XADD maintenance_order:event_alarm * type customIncident;

# 创建consumer group
XGROUP CREATE maintenance_order:event_alarm default_group 0;

# 获取stream元素个数
XLEN maintenance_order:event_alarm;

# 获取stream中所有元素 - 最小值 + 做大值
XRANGE maintenance_order:event_alarm - +;

# 获取stream信息
XINFO STREAM maintenance_order:event_alarm;

# 获取stream 的consumer group信息
XINFO GROUPS maintenance_order:event_alarm;

# 消费数据
XREADGROUP GROUP default_group default_consumer COUNT 1 STREAMS maintenance_order:event_alarm >;

# 删除消息
XDEL maintenance_order:event_alarm record_id;

# 删除stream
DEL maintenance_order:event_alarm;
```

## 4. Redis Lua脚本
```lua
-- 删除stream
DEL maintenance_order:event_alarm;

-- 设备告警
keys device_alarm_matching*
del device_alarm_matching:

-- 删除告警历史
keys thing_alarm_matching*
local keys = redis.call('keys', KEYS[1])
local temp = {}
for iter, value in ipairs(keys) do
    table.insert(temp, {value, redis.call('del', value) })
end
return temp
```
