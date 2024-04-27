- [Kafka Offical](https://kafka.apache.org/)
- [Kafka Offical Docker](https://hub.docker.com/r/apache/kafka)
- [Kafka Docker](https://hub.docker.com/r/bitnami/kafka)
- [Kafka Tool](https://www.kafkatool.com/download.html) 必须有Zookeeper
- [Kafdrop](https://github.com/obsidiandynamics/kafdrop) 可以不需要Zookeeper

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建文件夹
mkdir -p D:/docker/kafka/{conf,data,logs}

docker run \
    --publish 9092:9092 \
    --hostname kafka \
    --network dev \
    --restart no \
    --name kafka \
    apache/kafka:3.7.0

docker run \
    --publish 9092:9092 \
    --volume //d/docker/kafka/conf:/mnt/shared/config \
    --hostname kafka \
    --network dev \
    --restart no \
    --name kafka \
    apache/kafka:3.7.0

# 运行容器
docker run -d \
    --publish 9092:9092 \
    --publish 9093:9093 \
    --env KAFKA_CFG_NODE_ID=0 \
    --env KAFKA_CFG_PROCESS_ROLES=controller,broker \
    --env KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
    --env KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
    --env KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-server:9093 \
    --env KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
    --hostname kafka-server \
    --network dev \
    --restart no \
    --name kafka-server \
    bitnami/kafka:3.5.1

docker run -d \
    --privileged=true \
    --publish 9092:9092 \
    --publish 9093:9093 \
    --volume //d/docker/kafka/conf:/bitnami/kafka/config \
    --volume //d/docker/kafka/data:/bitnami/kafka/data \
    --env KAFKA_CFG_NODE_ID=0 \
    --env KAFKA_CFG_PROCESS_ROLES=controller,broker \
    --env KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
    --env KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
    --env KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-server:9093 \
    --env KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
    --hostname kafka-server \
    --network dev \
    --restart no \
    --name kafka-server \
    bitnami/kafka:3.5.1

# 运行client
docker run -it --rm \
    --network dev \
    bitnami/kafka:3.5.1 kafka-topics.sh --list --bootstrap-server kafka-server:9092

# docker-compose运行
curl -sSL https://raw.githubusercontent.com/bitnami/containers/main/bitnami/kafka/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

## 可视化工具
- [Kafka UI Offical](https://docs.kafka-ui.provectus.io)
- [Kafka UI Github](https://github.com/provectus/kafka-ui)
- [Kafdrop Github](https://github.com/obsidiandynamics/kafdrop)

```shell
docker run -d \
    --publish 8080:8080 \
    --env DYNAMIC_CONFIG_ENABLED=true \
    --env AUTH_TYPE="LOGIN_FORM" \
    --env SPRING_SECURITY_USER_NAME=admin \
    --env SPRING_SECURITY_USER_PASSWORD=admin \
    --network dev \
    --restart no \
    --name kafka-ui \
    provectuslabs/kafka-ui

docker run -d --rm \
    --publish 9000:9000 \
    --env KAFKA_BROKERCONNECT=kafka-server:9092 \
    --env JVM_OPTS="-Xms32M -Xmx64M" \
    --env SERVER_SERVLET_CONTEXTPATH="/" \
    --network dev \
    --restart no \
    --name kafdrop \
    obsidiandynamics/kafdrop
```

[Dashboard](http://localhost:9000)
