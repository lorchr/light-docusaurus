
## 搭建Redis集群之前需知:

1. Docker 容器启动redis必须设置network为host模式，[redis官方文档有说明](https://redis.io/topics/cluster-tutorial)；

2. redis集群至少需要6个节点（3个master,3个slave）；

3. redis主从节点是算法分配的，无需指定，所以我们的服务名称都叫redis-master；

这里我们使用最方便的搭建方式，使用docker-compose来搭建,对docker-compose不了解的朋友可以先行了解一下，[docker-compose学习地址](https://www.runoob.com/docker/docker-compose.html)。

在搭建Redis集群之前，我们需要修改下Redis的配置文件redis.conf，[redis.conf文件官方下载地址](https://github.com/antirez/redis/blob/5.0/redis.conf)。

1. 将redis.conf复制6份，分别命名为nodes-6391.conf,nodes-6392.conf....

2. 修改配置文件中的属性,主要是修改了一些集群配置和运行端口，端口号需要按需修改为6391~6396：

```shell
# 开启集群功能
cluster-enabled yes
# 设置运行端口
port 6391
# 设置节点超时时间，单位毫秒
cluster-node-timeout 15000
# 集群内部配置文件
cluster-config-file "nodes-6391.conf"
```

然后我们需要编写docker-compose.yml文件用于编排6个Redis容器，具体属性的作用可以参考下面的注释。

为了体现集群的可用性，我们在两台服务器上部署6个redis节点，1台服务器部署3个节点。

## 服务器1 docker-compose.yml 编排
```yaml

version: "3"
services:
  redis-master1:
    image: redis:latest # 基础镜像
    container_name: redis-master1 # 容器名称
    working_dir: /config # 切换工作目录
    environment: # 环境变量
      - PORT=6391 # 会使用config/nodes-${PORT}.conf这个配置文件
    stdin_open: true # 标准输入打开
    tty: true # 后台运行不退出
    restart: always #服务器启动时会自动重启
    network_mode: host # 使用host模式
    privileged: true # 拥有容器内命令执行的权限
    volumes:
      - ./config:/config # 将同级目录下的config目录映射到容器/config目录
    entrypoint: # 设置服务默认的启动程序
      - /bin/bash
      - redis.sh
  redis-master2:
    image: redis:latest
    working_dir: /config
    container_name: redis-master2
    environment:
      - PORT=6392
    stdin_open: true
    network_mode: host
    tty: true
    privileged: true
    volumes:
      - ./config:/config
    entrypoint:
      - /bin/bash
      - redis.sh
  redis-master3:
    image: redis:latest
    container_name: redis-master3
    working_dir: /config
    environment:
      - PORT=6393
    stdin_open: true
    network_mode: host
    tty: true
    privileged: true
    volumes:
      - ./config:/config
    entrypoint:
      - /bin/bash
      - redis.sh
```
  
## 服务器2 docker-compose.yml 编排
```yaml
version: "3"
services:
  redis-master1:
    image: redis:latest # 基础镜像
    container_name: redis-master1 # 容器名称
    working_dir: /config # 切换工作目录
    environment: # 环境变量
      - PORT=6395 # 会使用config/nodes-${PORT}.conf这个配置文件
    stdin_open: true # 标准输入打开
    tty: true # 后台运行不退出
    restart: always #服务器启动时会自动重启
    network_mode: host # 使用host模式
    privileged: true # 拥有容器内命令执行的权限
    volumes:
      - ./config:/config #配置文件目录映射到宿主机
    entrypoint: # 设置服务默认的启动程序
      - /bin/bash
      - redis.sh
  redis-master2:
    image: redis:latest
    working_dir: /config
    container_name: redis-master2
    environment:
      - PORT=6396
    stdin_open: true
    network_mode: host
    tty: true
    privileged: true
    volumes:
      - ./config:/config # 将同级目录下的config目录映射到/config
    entrypoint:
      - /bin/bash
      - redis.sh
      
  redis-master3:
    image: redis:latest
    working_dir: /config
    container_name: redis-master3
    environment:
      - PORT=6394
    stdin_open: true
    network_mode: host
    tty: true
    privileged: true
    volumes:
      - ./config:/config
    entrypoint:
      - /bin/bash
      - redis.sh  
```

从`docker-compose.yml`和`redis`配置文件中我们可以看到，我们的Redis容器分别运行在两台机器的`6391~6396`这6个端口之上，同时还以`redis.sh`脚本作为该容器的启动脚本。

`redis.sh`脚本的作用是根据`environment`环境变量中的`PORT`属性，以指定配置文件来启动Redis容器，shell脚本如下：
```shell
redis-server  /config/nodes-${PORT}.conf
```

将编排好的配置文件分别上传到服务器（`10.10.1.114`,`10.10.1.49`）的`redis-cluster`目录中
```shell
[runner_tts@cloud-nlp redis-cluster]$ tree
.
├── config
│   ├── nodes-6391.conf
│   ├── nodes-6392.conf
│   ├── nodes-6393.conf
│   ├── nodes-6394.conf
│   └── redis.sh
└── docker-compose.yml
```


使用docker-compose命令启动容器，并查看日志。
```shell
docker-compose up -d;docker-compose logs -f
```

如果成功启动，输出如下信息：
```shell
[runner@cloud-49 redis-cluster]$ docker-compose up -d;docker-compose logs -f
Creating redis-master2 ... done
Creating redis-master3 ... done
Creating redis-master1 ... done
Attaching to redis-master1, redis-master3, redis-master2
```

两台服务器成功启动后，进入一个Redis容器中，初始化容器Redis集群。
```shell
# 进入Redis容器
docker exec -it redis-master1 /bin/bash
# 初始化Redis集群命令
redis-cli --cluster create \
10.10.1.114:6391 10.10.1.114:6392 10.10.1.114:6393 \
10.10.1.49:6394 10.10.1.49:6395 10.10.1.49:6396 \
--cluster-replicas 1
```

集群创建过程中会让你确认配置，输入yes确认即可。
```shell
[runner_tts@cloud-nlp redis-cluster]$ docker exec -it redis-master1 bash
root@cloud-nlp:/config# redis-cli --cluster create \
> 10.10.1.114:6391 10.10.1.114:6392 10.10.1.114:6393 \
> 10.10.1.49:6394 10.10.1.49:6395 10.10.1.49:6396 \
> --cluster-replicas 1
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 10.10.1.49:6396 to 10.10.1.114:6391
Adding replica 10.10.1.114:6393 to 10.10.1.49:6394
Adding replica 10.10.1.49:6395 to 10.10.1.114:6392
M: 9764989e0a38ba063e3740a933cb2c41ef20827a 10.10.1.114:6391
   slots:[0-5460] (5461 slots) master
M: 653cdb539e3a75f14a8dd4fc375236f5c8233fdc 10.10.1.114:6392
   slots:[10923-16383] (5461 slots) master
S: c3d6364b03d848ac567cec713659c9304ea568e7 10.10.1.114:6393
   replicates 059e3f7863e3af09af2ca086e4bbd05052116ce2
M: 059e3f7863e3af09af2ca086e4bbd05052116ce2 10.10.1.49:6394
   slots:[5461-10922] (5462 slots) master
S: 15495af93cf501266d33bc304f33681e87fb6564 10.10.1.49:6395
   replicates 653cdb539e3a75f14a8dd4fc375236f5c8233fdc
S: 7e37c6e43407e0ef2fc6fdd7a72552cca38bd55c 10.10.1.49:6396
   replicates 9764989e0a38ba063e3740a933cb2c41ef20827a
Can I set the above configuration? (type 'yes' to accept): yes
```

Redis集群创建成功后会输出如下信息。
```shell
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.......
>>> Performing Cluster Check (using node 10.10.1.114:6391)
M: 9764989e0a38ba063e3740a933cb2c41ef20827a 10.10.1.114:6391
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
M: 653cdb539e3a75f14a8dd4fc375236f5c8233fdc 10.10.1.114:6392
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
S: 15495af93cf501266d33bc304f33681e87fb6564 10.10.1.49:6395
   slots: (0 slots) slave
   replicates 653cdb539e3a75f14a8dd4fc375236f5c8233fdc
S: c3d6364b03d848ac567cec713659c9304ea568e7 10.10.1.114:6393
   slots: (0 slots) slave
   replicates 059e3f7863e3af09af2ca086e4bbd05052116ce2
S: 7e37c6e43407e0ef2fc6fdd7a72552cca38bd55c 10.10.1.49:6396
   slots: (0 slots) slave
   replicates 9764989e0a38ba063e3740a933cb2c41ef20827a
M: 059e3f7863e3af09af2ca086e4bbd05052116ce2 10.10.1.49:6394
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

我们可以看到：
```shell
10.10.1.114:6391,10.10.1.114:6392,10.10.1.49:6394 三个node为master

10.10.1.49:6395,10.10.1.114:6393,10.10.1.49:6396 三个node为slave
```

创建成功后我们可以使用redis-cli命令连接到其中一个Redis服务；
```shell
# 集群模式启动
redis-cli -c  -p 6391
```

通过cluster nodes命令可以查看节点信息。
```shell
127.0.0.1:6391> cluster nodes
653cdb539e3a75f14a8dd4fc375236f5c8233fdc 10.10.1.114:6392@16392 master - 0 1586934357415 2 connected 10923-16383
15495af93cf501266d33bc304f33681e87fb6564 10.10.1.49:6395@16395 slave 653cdb539e3a75f14a8dd4fc375236f5c8233fdc 0 1586934356412 5 connected
c3d6364b03d848ac567cec713659c9304ea568e7 10.10.1.114:6393@16393 master - 0 1586934355410 7 connected 5461-10922
7e37c6e43407e0ef2fc6fdd7a72552cca38bd55c 10.10.1.49:6396@16396 slave 9764989e0a38ba063e3740a933cb2c41ef20827a 0 1586934354908 6 connected
059e3f7863e3af09af2ca086e4bbd05052116ce2 10.10.1.49:6394@16394 slave c3d6364b03d848ac567cec713659c9304ea568e7 0 1586934355108 7 connected
9764989e0a38ba063e3740a933cb2c41ef20827a 10.10.1.114:6391@16391 myself,master - 0 1586934355000 1 connected 0-5460
```

通过cluster info命令可以查看集群状态信息。
```shell
127.0.0.1:6391> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:7
cluster_my_epoch:1
cluster_stats_messages_ping_sent:2919
cluster_stats_messages_pong_sent:54
cluster_stats_messages_fail_sent:3
cluster_stats_messages_sent:2976
cluster_stats_messages_ping_received:54
cluster_stats_messages_pong_received:33
cluster_stats_messages_fail_received:1
cluster_stats_messages_received:88
```

到此，Redis集群搭建完成。
