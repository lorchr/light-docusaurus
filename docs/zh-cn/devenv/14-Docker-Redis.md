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

-- 删除stream
DEL maintenance_order:event_alarm;

-- 设备告警
keys device_alarm_matching*
del device_alarm_matching:

-- 删除告警历史
keys thing_alarm_matching*
```

## 4. Redis Lua脚本
### 4.1 批量删除相同前缀的元素
```lua
local keys = redis.call('keys', ARGV[1] .. '*'); 
for idx, val in ipairs(keys) do 
    redis.call('del', val); 
end 
return keys;
```

命令行用法：
```shell
EVAL "local keys = redis.call('keys', ARGV[1] .. '*'); for i, key in ipairs(keys) do redis.call('del', key); end return keys;" 0 <prefix>
```

```lua
local keys = redis.call('keys', ARGV[1]);
local temp = {};
for idx, val in ipairs(keys) do
    table.insert(temp, {val, redis.call('del', val)});
end
return temp;
```

命令行用法：
```shell
EVAL "local keys = redis.call('keys', ARGV[1]); local temp = {}; for idx, val in ipairs(keys) do table.insert(temp, {val, redis.call('del', val) }); end return temp;" 0 prefix*
```

## 4.2 获取分布式锁
```lua
if redis.call('setnx', KEYS[1], ARGV[1]) == 1 then
    return redis.call('expire', KEYS[1], ARGV[2]);
else
    return 0;
end
```

可重入版
```lua
if ((redis.call('exists', KEYS[1]) == 0)
      or (redis.call('hexists', KEYS[1], ARGV[1]) == 1)) then
    redis.call('hincrby', KEYS[1], ARGV[1], 1);
    redis.call('expire', KEYS[1], ARGV[2]);
    return nil;
end
                
return redis.call('ttl', KEYS[1]);
```

## 4.3  释放分布式锁
```lua
if redis.call('exists', KEYS[1]) == 0 then
    return 1;
end
                
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1]);
else
    return 0;
end
```

## 4.4 分布式锁续约
```lua
if redis.call('exists', KEYS[1]) == 0 then
    return 0;
end
                
if redis.call('get', KEYS[1]) == ARGV[1] then
    local ttl = redis.call('ttl', KEYS[1]);
    return redis.call('expire', KEYS[1], ARGV[2]);
else
    return 0;
end
```

## 5. Docker Compose运行Redis集群

### 5.1 Cluster集群 
1. redis.conf

配置以`6381`节点为例，其余节点将文件中的所有`6381`改为对应值即可，如：`6382` `6383`等

`sed -i 's/6381/6382/g' redis.conf`

```conf
# 端口
port 6381
# 绑定客户端访问IP
bind 0.0.0.0 -::0
# 密码
requirepass admin
masterauth admin
# 关闭保护模式
protected-mode no
# 是否以守进程模式运行
daemonize no

# 超时时间
tcp-keepalive 500
timeout 100
# aof
appendonly yes
appendfilename "appendonly-redis.aof"
# 当daemonize=yes时候才会生效
pidfile /var/run/redis_6381.pid
# log 日志级别
loglevel notice
# 日志文件存放路径
logfile "redis_6381.log"

# 开启集群模式
cluster-enabled yes 
# 集群配置文件
cluster-config-file nodes-6381.conf
# 集群超时时间
cluster-node-timeout 5000

# 以下配置用于Docker NAT网络环境中
# 集群对外ip  宿主机的IP地址
cluster-announce-ip  192.168.9.75
cluster-announce-port 6381
cluster-announce-bus-port 16381
```

2. redis-cluster.yaml

```yaml
version: "3.7"

services:
  redis-node-1:
    image: redis:6.2
    container_name: redis-node-1
    hostname: redis-node-1
    ports:
      - 6381:6381
      - 16381:16381
    networks:
      redis-network:
        ipv4_address: 172.222.0.11
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6381/data:/data
      - //d/docker/redis-cluster/6381:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf
  
  redis-node-2:
    image: redis:6.2
    container_name: redis-node-2
    hostname: redis-node-2
    ports:
      - 6382:6382
      - 16382:16382
    networks:
      redis-network:
        ipv4_address: 172.222.0.12
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6382/data:/data
      - //d/docker/redis-cluster/6382:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf
  
  redis-node-3:
    image: redis:6.2
    container_name: redis-node-3
    hostname: redis-node-3
    ports:
      - 6383:6383
      - 16383:16383
    networks:
      redis-network:
        ipv4_address: 172.222.0.13
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6383/data:/data
      - //d/docker/redis-cluster/6383:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf
  
  redis-node-4:
    image: redis:6.2
    container_name: redis-node-4
    hostname: redis-node-4
    ports:
      - 6384:6384
      - 16384:16384
    networks:
      redis-network:
        ipv4_address: 172.222.0.14
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6384/data:/data
      - //d/docker/redis-cluster/6384:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf
  
  redis-node-5:
    image: redis:6.2
    container_name: redis-node-5
    hostname: redis-node-5
    ports:
      - 6385:6385
      - 16385:16385
    networks:
      redis-network:
        ipv4_address: 172.222.0.15
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6385/data:/data
      - //d/docker/redis-cluster/6385:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf

  redis-node-6:
    image: redis:6.2
    container_name: redis-node-6
    hostname: redis-node-6
    ports:
      - 6386:6386
      - 16386:16386
    networks:
      redis-network:
        ipv4_address: 172.222.0.16
    extra_hosts:
      - "redis-node-1:172.222.0.11"
      - "redis-node-2:172.222.0.12"
      - "redis-node-3:172.222.0.13"
      - "redis-node-4:172.222.0.14"
      - "redis-node-5:172.222.0.15"
      - "redis-node-6:172.222.0.16"
    volumes:
      - //d/docker/redis-cluster/6386/data:/data
      - //d/docker/redis-cluster/6386:/usr/local/etc/redis
    restart: no
    command:
      redis-server /usr/local/etc/redis/redis.conf

  redis-cluster:
    image: redis:6.2
    # 注意： 如果集群有密码，需要用 -a 指定密码，否则会初始化失败
    command: 'redis-cli -a admin --cluster create 
              172.222.0.11:6381 172.222.0.12:6382 172.222.0.13:6383 
              172.222.0.14:6384 172.222.0.15:6385 172.222.0.16:6386
              --cluster-replicas 1 --cluster-yes'
    networks:
      - redis-network
    depends_on:
      - redis-node-1
      - redis-node-2
      - redis-node-3
      - redis-node-4
      - redis-node-5
      - redis-node-6

networks:
  redis-network:
    name: redis-network
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.222.0.0/24
```

3. 启动集群

上面脚本启动之后将会是三主三从模式；
```shell
# 创建目录
mkdir -p //d/docker/redis-cluster/temp/data

# 创建配置文件
cd //d/docker/redis-cluster/
touch temp/redis.conf
vim temp/redis.conf

# 复制其他节点的目录
cp -R temp 6381
cp -R temp 6382
cp -R temp 6383
cp -R temp 6384
cp -R temp 6385
cp -R temp 6386

# 修改节点的端口配置
sed -i 's/6379/6381/g' 6381/redis.conf
sed -i 's/6379/6382/g' 6382/redis.conf
sed -i 's/6379/6383/g' 6383/redis.conf
sed -i 's/6379/6384/g' 6384/redis.conf
sed -i 's/6379/6385/g' 6385/redis.conf
sed -i 's/6379/6386/g' 6386/redis.conf

# 启动redis集群
docker compose -f redis-cluster.yaml up -d
# docker compose -f redis-cluster.yaml down

# 目前只是将 redis 各个容器启动成功，还需要将 6 个节点配置成集群模式；
# 随便选择一台机器，进入终端模式，通过下面命令即可绑定 redis 集群: 
redis-cli -h 172.222.0.11 -p 6381 -a admin --cluster create 172.222.0.16:6381 172.222.0.11:6382 172.222.0.12:6383 172.222.0.13:6384 172.222.0.14:6385 172.222.0.15:6386 --cluster-replicas 1 --cluster-yes

# 进入一个节点容器
docker exec -it -u root redis-node-1 /bin/bash

# 登录集群
redis-cli -h 172.222.0.11 -p 6381 -a admin -c

# 查看集群信息
cluster info

# 查看集群节点
cluster nodes

# 查看哈希槽信息
cluster slots

# 测试
redis-cli -h 172.222.0.11 -p 6381 -a admin -c
set foo bar
exit
redis-cli -h 172.222.0.12 -p 6382 -a admin -c
get foo
```

**注意** 集群模式下登录需要带 `-c`启用集群模式，否则执行指令会出现 `(error) MOVED 12182 172.222.0.13:6383`错误
