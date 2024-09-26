
## 一、环境准备

### 1. 网络配置

```bash
# 创建Network
docker network ls
docker network rm develop
docker network create --subnet=172.100.0.0/16 develop

# 【可选】修改hosts 192.168.137.1 为本机IP
192.168.137.1   mysql.light.local
192.168.137.1   pgsql.light.local
192.168.137.1   redis.light.local
192.168.137.1   influx.light.local
192.168.137.1   mqtt.light.local

```

### 2. Mysql配置

```bash
# ==================== Mysql ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/mysql/{data,conf,logs,scripts}

# 获取默认配置文件
docker run -d --env MYSQL_ROOT_PASSWORD=admin --name mysql_temp mysql:8.0 \
  && docker cp mysql_temp:/etc/my.cnf  D:/docker/develop/basic/mysql/conf/my.cnf \
  && docker stop mysql_temp && docker rm mysql_temp

# 复制初始化脚本
cp ./mysql/init.sql D:/docker/develop/basic/mysql/scripts/init.sql

# ==================== Mysql ==================== 

```

### 3. Pgsql配置

```bash
# ==================== Pgsql ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/pgsql/{data,conf,logs,scripts}

# 获取默认配置文件
docker run -d --name postgres_temp postgres:15.3 \
  && docker cp postgres_temp:/usr/share/postgresql/postgresql.conf.sample D:/docker/develop/basic/pgsql/conf/postgresql.conf \
  && docker stop postgres_temp && docker rm postgres_temp

# 复制初始化脚本
cp ./pgsql/init.sql D:/docker/develop/basic/pgsql/scripts/init.sql

# ==================== Pgsql ==================== 

```

### 4. Redis配置

```bash
# ==================== Redis ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/redis/{data,conf,logs}

# 获取默认配置文件 http://download.redis.io/redis-stable/redis.conf
curl https://raw.githubusercontent.com/redis/redis/6.2/redis.conf -o D:/docker/develop/basic/redis/conf/redis.conf

# 复制配置文件
cp ./redis/redis-6.2.conf D:/docker/develop/basic/redis/conf/redis.conf

# ==================== Redis ==================== 

```

### 5. Cowrie配置

```bash
# ==================== Cowrie ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/cowrie/{data,conf,logs}

# 复制配置文件
cp ./cowrie/cowrie.cfg  D:/docker/develop/basic/cowrie/conf/cowrie.cfg

# 复制定时任务脚本
cp ./cowrie/schedule.sh D:/docker/develop/basic/cowrie/schedule.sh

# 编辑定时任务
crontab -e 
00 00 * * *     D:/docker/develop/basic/cowrie/cowrie-schedule.sh

# ==================== Cowrie ==================== 

```

## 二、Docker Compose脚本及运行

### 1. docker-compose.yaml

```yaml
version: "3"

services:
  mysql:
    image: mysql:8.0
    container_name: basic_mysql
    hostname: mysql.basic
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.101
        aliases:
          - mysql.basic
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
    ports:
      - 3306:3306
    expose:
      - 3306
    volumes:
      - //d/docker/develop/basic/mysql/data:/var/lib/mysql
      - //d/docker/develop/basic/mysql/conf:/etc/mysql/conf.d
      - //d/docker/develop/basic/mysql/logs:/var/log/mysql
      # Init scripts location
      - //d/docker/develop/basic/mysql/scripts:/docker-entrypoint-initdb.d
    environment:
      MYSQL_USER: light
      MYSQL_PASSWORD: light
      MYSQL_DATABASE: light
      MYSQL_ROOT_PASSWORD: root
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

  postgres:
    image: postgres:15.3
    container_name: basic_pgsql
    hostname: pgsql.basic
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.106
        aliases:
          - pgsql.basic
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
    ports:
      - 5432:5432
    expose:
      - 5432
    volumes:
      - //d/docker/develop/basic/pgsql/data:/var/lib/postgresql/data
      - //d/docker/develop/basic/pgsql/conf/postgresql.conf:/etc/postgresql/postgresql.conf
      # Init scripts location
      - //d/docker/develop/basic/pgsql/scripts:/docker-entrypoint-initdb.d
    environment:
      POSTGRES_USER: light
      POSTGRES_PASSWORD: light
      POSTGRES_DB: light
      PGDATA: /var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6.2
    container_name: basic_redis
    hostname: redis.basic
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.111
        aliases:
          - redis.basic
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
    ports:
      - 6379:6379
    expose:
      - 6379
    volumes:
      - //d/docker/develop/basic/redis/conf/redis.conf:/etc/redis/redis.conf
    restart: unless-stopped

  cowrie:
    image: cowrie/cowrie:latest
    container_name: basic_cowrie
    hostname: cowrie.basic
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.112
        aliases:
          - cowrie.basic
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
    # ports:
    #   - 22:2222
    #   - 23:2223
    expose:
      - 2222
      - 2223
    volumes:
      - //d/docker/develop/basic/cowrie/data:/cowrie/cowrie-git/var/lib/cowrie/downloads
      - //d/docker/develop/basic/cowrie/conf:/cowrie/cowrie-git/etc
      - //d/docker/develop/basic/cowrie/logs:/cowrie/cowrie-git/var/log/cowrie
    restart: unless-stopped

networks:
  develop:
    external: true
  proxy-net:
      driver: bridge
      ipam:
        config:
          - subnet: 172.66.0.0/16

# volumes:
#   mysql_data:
#   pgsql_data:

```

### 2. 启动服务组

```bash
docker compose -f basic.yaml -p basic up -d

docker compose -f basic.yaml -p basic down

```

## 三、启动后配置
