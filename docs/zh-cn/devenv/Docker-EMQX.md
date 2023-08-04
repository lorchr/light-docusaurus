[EMQX Offical](https://www.emqx.io/)
[EMQX Offical Docker](https://www.emqx.io/docs/en/v4.4/getting-started/install.html#running-emqx-in-docker-contain-a-simple-docker-compose-cluster)
[EMQX Docker](https://hub.docker.com/_/emqx)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create emqx_data

docker run -d \
  --publish 18083:18083 \
  --publish 1883:1883 \
  --volume //d/docker/emqx/data:/opt/emqx/data \
  --volume //d/docker/emqx/conf:/opt/emqx/etc \
  --volume //d/docker/emqx/log:/opt/emqx/log \
  --env HOCON_ENV_OVERRIDE_PREFIX=DEV_ \
  --env DEV_EMQX_MQTT__SHARED_SUBSCRIPTION=true \
  --env DEV_EMQX_ZONE__EXTERNAL__SHARED_SUBSCRIPTION=true \
  --env DEV_EMQX_BROKER__SHARED_SUBSCRIPTION_STRATEGY=round_robin \
  --env DEV_EMQX_BROKER__SHARED_DISPATCH_ACK_ENABLE=true \
  --net dev \
  --restart=no \
  --name emqx \
  emqx:4.3

docker run -d \
  --publish 18084:18083 \
  --publish 1884:1883 \
  --volume //d/docker/emqx/data:/opt/emqx/data \
  --volume //d/docker/emqx/conf:/opt/emqx/etc \
  --volume //d/docker/emqx/log:/opt/emqx/log \
  --env EMQX_MQTT__SHARED_SUBSCRIPTION=true \
  --env EMQX_ZONE__EXTERNAL__SHARED_SUBSCRIPTION=true \
  --env EMQX_BROKER__SHARED_SUBSCRIPTION_STRATEGY=round_robin \
  --env EMQX_BROKER__SHARED_DISPATCH_ACK_ENABLE=true \
  --net dev \
  --restart=no \
  --name emqx2 \
  emqx:4.3

docker exec -it -u root emqx /bin/bash

# 默认配置文件
vim /etc/emqx/emqx.conf
```

- [Dashboard](http://localhost:18083)
  - admin/public
- [MQTTX](https://mqttx.app/zh/downloads)

**注：** 使用环境变量修改默认配置只支持[Configuration Files](https://www.emqx.io/docs/en/v5.0/admin/cfg.html)列表中的属性，共享订阅的配置使用环境变量设置无效

## 2. 共享订阅
- [共享订阅 - MQTT 5.0 新特性](https://www.emqx.com/en/blog/introduction-to-mqtt5-protocol-shared-subscription)
- [MQTT核心概念-共享订阅](https://www.emqx.io/docs/en/v5.0/messaging/mqtt-concepts.html#shared-subscription)
- [发布订阅-共享订阅](https://www.emqx.io/docs/en/v5.0/messaging/mqtt-shared-subscription.html)
- [MQTT高级特性-共享订阅 4.4](https://www.emqx.io/docs/en/v4.4/advanced/shared-subscriptions.html)
- [MQTT高级特性-共享订阅 5.0](https://www.emqx.io/docs/en/v5.0/advanced/shared-subscriptions.html)

1. 开启共享订阅
  
  ```conf
  # 开启共享订阅
  mqtt.shared_subscription = true
  zone.external.shared_subscription = true

  # 负载均衡策略 random round_robin sticky hash
  broker.shared_subscription_strategy = round_robin

  # 适用于 QoS1 QoS2 消息，启用后，当客户端离线时，将消息派发给订阅组内其他客户端
  broker.shared_dispatch_ack_enabled = true
  ```

2. 共享订阅的负载均衡策略

  | 均衡策略      | 说明                         |
  | ------------- | ---------------------------- |
  | random        | 在所有订阅者中随机选择       |
  | round_robin   | 按照订阅顺序                 |
  | sticky        | 一直发往上次选取的订阅者     |
  | hash          | 按照发布者 ClientID 的哈希值 |
  | hash_clientid | 按照发布者 ClientID 的哈希值 |
  | hash_topic    | 按照topic 的哈希值           |

3. 关于Topic路径

  ```
  $share/<group-name>/<topic-name>(/<sub_topic-name>)*
  ```

   - $share : 共享订阅的标识
   - group-name : 共享订阅的组别名称 group-name
   - topic-name : 实际的topic名称
   - topic-sub-name: topic名称，可以有多段组成

   | 示例                         | 前缀   | 组别  | Topic 名称      |
   | ---------------------------- | ------ | ----- | --------------- |
   | $share/abc/t/1               | $share | abc   | t/1             |
   | $share/group/topic/sub_topic | $share | group | topic/sub_topic |
   | $queue/topic/sub_topic       | $queue | -     | topic/sub_topic |

**注意：**
- 在订阅Topic时，使用 `$share/<group-name>/<topic-name>`或`$queue/<topic-name>`
- 在发送消息时，使用 `<topic-name>`，不需要带`前缀`及`组别`
