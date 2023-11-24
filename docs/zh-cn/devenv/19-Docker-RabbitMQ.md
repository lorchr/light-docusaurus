- [RabbitMQ Offical](https://www.rabbitmq.com/)
- [RabbitMQ Docker](https://hub.docker.com/_/rabbitmq)
- [RabbitMQ Offical Document](https://www.rabbitmq.com/documentation.html)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 获取默认配置文件
docker run -d --env RABBITMQ_DEFAULT_USER=rabbitmq --env RABBITMQ_DEFAULT_PASS=rabbitmq --env RABBITMQ_DEFAULT_VHOST=vh1 --name rabbitmq_temp rabbitmq:3.12-management \
&& docker cp rabbitmq_temp:/etc/rabbitmq/conf.d/10-defaults.conf  D:/docker/rabbitmq/conf/conf.d/10-defaults.conf \
&& docker cp rabbitmq_temp:/etc/rabbitmq/enabled_plugins  D:/docker/rabbitmq/conf/enabled_plugins \
&& docker stop rabbitmq_temp && docker rm rabbitmq_temp

# 运行容器
docker run -d \
  --publish 5672:5672 \
  --publish 15672:15672 \
  --publish 25672:25672 \
  --publish 61613:61613 \
  --publish 1883:1883 \
  --volume //d/docker/rabbitmq/data:/var/lib/rabbitmq \
  --volume //d/docker/rabbitmq/conf/conf.d:/etc/rabbitmq/conf.d \
  --volume //d/docker/rabbitmq/conf/enabled_plugins:/etc/rabbitmq/enabled_plugins \
  --volume //d/docker/rabbitmq/log:/var/log/rabbitmq \
  --env RABBITMQ_DEFAULT_USER=rabbitmq \
  --env RABBITMQ_DEFAULT_PASS=rabbitmq \
  --env RABBITMQ_DEFAULT_VHOST=vh1 \
  --hostname rabbitmq \
  --net dev \
  --restart=no \
  --name rabbitmq \
  rabbitmq:3-management

docker exec -it -u root rabbitmq /bin/bash
# 启用management插件 web管理页面
rabbitmq-plugins enable rabbitmq-management
```

[Dashboard](http://localhost:15672)
- Account
  - rabbitmq / rabbitmq

## 2. 操作
### 1. 重置RabbitMQ队列
```shell
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app
```

### 2. 交换机点击报错 Management API returned status code 500
```shell
# 进入容器
docker exec -it root rabbitmq /bin/bash

# 修改配置
cd /etc/rabbitmq/conf.d
echo management_agent.disable_metrics_collector = false > management_agent.disable_metrics_collector.conf

# 重启容器
docker restart rabbitmq
```
