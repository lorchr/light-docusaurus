- [Elasticsearch Offical Docker](https://www.elastic.co)
- [Elasticsearch Offical Docker](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/docker.html)
- [Elasticsearch](https://hub.docker.com/_/elasticsearch)

## 1. 安装Elasticsearch

```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create es_data;

# 获取默认配置文件
docker run -d --name elasticsearch_temp elasticsearch:7.17.10 \
&& docker cp elasticsearch_temp:/usr/share/elasticsearch/config/elasticsearch.yml D:/docker/elasticsearch/conf/elasticsearch.yml \
&& docker stop elasticsearch_temp && docker rm elasticsearch_temp


# 运行镜像 Docker官方镜像
docker run -d \
  --publish 9200:9200 \
  --publish 9300:9300 \
  --volume //d/docker/elasticsearch/data:/usr/share/elasticsearch/data \
  --volume //d/docker/elasticsearch/conf/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
  --env "discovery.type=single-node" \
  --env ELASTIC_PASSWORD_FILE=/run/secrets/bootstrapPassword.txt \
  --net dev \
  --restart=no \
  --name elasticsearch \
  elasticsearch:7.17.10

# 运行镜像 Elastic官方镜像
docker run -d \
  --publish 9200:9200 \
  --publish 9300:9300 \
  --volume //d/docker/elasticsearch/data:/usr/share/elasticsearch/data \
  --volume //d/docker/elasticsearch/conf/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
  --env "discovery.type=single-node" \
  --env ELASTIC_PASSWORD_FILE=/run/secrets/bootstrapPassword.txt \
  --net dev \
  --restart=no \
  --name elasticsearch \
  docker.elastic.co/elasticsearch/elasticsearch:7.17.10
```

## 2. 配置Elasticsearch
配置文件路径 `/usr/share/elasticsearch/config/`
- elasticsearch.yml   # Es配置
- jvm.options         # JVM配置
- log4j2.properties   # 日志配置

### 开启认证
Docker安装Es默认是不开启认证的，需要[手动启用密码认证](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-minimal-setup.html)
```shell
# 进入容器
docker exec -it -u root elasticsearch /bin/bash

# 编辑配置文件
vim /usr/share/elasticsearch/config/elasticsearch.yml

# 开启认证
discovery.type: single-node # 单节点需要此配置

http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: Authorization,WWW-Authenticate
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: false

# 重启容器
docker restart elasticsearch

# 进入容器
docker exec -it -u root elasticsearch /bin/bash

# 设置密码
./bin/elasticsearch-setup-passwords interactive
# 需要依次设置六个账户的密码 
# elastic apm_system kibana_system 
# logstash_system beats_system remote_monitoring_user
```

### 安装插件 
1. 安装IK分词器

```shell
# 下载 注意  需要下载与ES版本相同的IK版本
https://github.com/medcl/elasticsearch-analysis-ik/releases
https://github.com/ElisaMin/elasticsearch-analysis-ik/releases/tag/7.17.10
wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.17.7/elasticsearch-analysis-ik-7.17.7.zip

# 将下载的zip包解压到ES的 plugins/elasticsearch-analysis-ik 目录
# 因为没有 7.17.10
unzip elasticsearch-analysis-ik-7.17.7.zip -d ./elasticsearch-analysis-ik

# 修改plugin-descriptor.properties文件里面的elasticsearch.version就可以
vim plugin-descriptor.properties
elasticsearch.version=7.17.10

# 重启容器
docker restart elasticsearch

# 上传
docker cp C://users/light/Desktop/elasticsearch-analysis-ik elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik

# 下载
docker cp elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik C://users/light/Desktop/elasticsearch-analysis-ik
```

## 3. 集群部署 

1. 创建`docker-compose.yaml`

    ```yaml
    version: '2.2'
    services:
      es01:
        image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2
        container_name: es01
        environment:
          - node.name=es01
          - cluster.name=es-docker-cluster
          - discovery.seed_hosts=es02,es03
          - cluster.initial_master_nodes=es01,es02,es03
          - bootstrap.memory_lock=true
          - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
        ulimits:
          memlock:
            soft: -1
            hard: -1
        volumes:
          - data01:/usr/share/elasticsearch/data
        ports:
          - 9200:9200
        networks:
          - elastic
      es02:
        image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2
        container_name: es02
        environment:
          - node.name=es02
          - cluster.name=es-docker-cluster
          - discovery.seed_hosts=es01,es03
          - cluster.initial_master_nodes=es01,es02,es03
          - bootstrap.memory_lock=true
          - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
        ulimits:
          memlock:
            soft: -1
            hard: -1
        volumes:
          - data02:/usr/share/elasticsearch/data
        networks:
          - elastic
      es03:
        image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2
        container_name: es03
        environment:
          - node.name=es03
          - cluster.name=es-docker-cluster
          - discovery.seed_hosts=es01,es02
          - cluster.initial_master_nodes=es01,es02,es03
          - bootstrap.memory_lock=true
          - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
        ulimits:
          memlock:
            soft: -1
            hard: -1
        volumes:
          - data03:/usr/share/elasticsearch/data
        networks:
          - elastic

    volumes:
      data01:
        driver: local
      data02:
        driver: local
      data03:
        driver: local

    networks:
      elastic:
        driver: bridge
    ```

2. 启动集群
   
    ```shell
    # 启动
    docker-compose up

    # 查看日志
    docker logs

    # 停止集群
    docker-compose down

    # 停止集群并删除 volumes
    docker-compose down -v
    ```

3. 测试状态
   
    ```shell
    curl --user elastic:elastic -X GET "localhost:9200/_cat/nodes?v&pretty"
    ```
