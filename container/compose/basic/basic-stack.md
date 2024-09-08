
## 环境准备脚本
### 1. 网络配置

```bash
# 创建Network
docker network ls
docker network rm develop
docker network create --subnet=172.100.0.0/16 develop

# 修改hosts 192.168.137.1 为本机IP
192.168.137.1   mysql.light.local
192.168.137.1   pgsql.light.local
192.168.137.1   redis.light.local
192.168.137.1   influx.light.local
192.168.137.1   mqtt.light.local

192.168.137.1   caddy.light.local
192.168.137.1   keycloak.light.local
192.168.137.1   minio.light.local
192.168.137.1   outline.light.local
192.168.137.1   gitlab.light.local
```

### 2. Mysql配置

```bash
# ==================== Mysql ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/mysql/{conf,data,logs,scripts}

# 获取默认配置文件
docker run -d --env MYSQL_ROOT_PASSWORD=admin --name mysql_temp mysql:8.0 \
  && docker cp mysql_temp:/etc/my.cnf  D:/docker/develop/basic/mysql/conf/my.cnf \
  && docker stop mysql_temp && docker rm mysql_temp

# 编辑初始化脚本
cat >> D:/docker/develop/basic/mysql/scripts/init.sql << EOF
-- 创建新数据库 keycloak
CREATE DATABASE keycloak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'keycloak'@'%' IDENTIFIED BY 'keycloak';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak'@'%';
-- 刷新权限
FLUSH PRIVILEGES;

-- 创建新数据库 outline
CREATE DATABASE outline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'outline'@'%' IDENTIFIED BY 'outline';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON outline.* TO 'outline'@'%';
-- 刷新权限
FLUSH PRIVILEGES;

-- 创建新数据库 gitlab
CREATE DATABASE gitlab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'gitlab'@'%' IDENTIFIED BY 'gitlab';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON gitlab.* TO 'gitlab'@'%';
-- 刷新权限
FLUSH PRIVILEGES;
EOF
# ==================== Mysql ==================== 

```

### 3. Pgsql配置

```bash
# ==================== Pgsql ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/pgsql/{conf,data,logs,scripts}

# 获取默认配置文件
docker run -d --name postgres_temp postgres:15.3 \
  && docker cp postgres_temp:/usr/share/postgresql/postgresql.conf.sample D:/docker/develop/basic/pgsql/conf/postgresql.conf \
  && docker stop postgres_temp && docker rm postgres_temp

# 编辑初始化脚本
cat >> D:/docker/develop/basic/pgsql/scripts/init.sql << EOF
-- 创建数据库 keycloak
CREATE DATABASE keycloak;
-- 切换数据库
\c keycloak light;
-- 创建用户
CREATE USER keycloak WITH PASSWORD 'keycloak';
-- 将用户权限赋予数据库
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO keycloak;
GRANT USAGE,CREATE ON SCHEMA public TO keycloak;
GRANT ALL ON SCHEMA public TO keycloak;
-- 授予创建数据库权限
ALTER ROLE keycloak CREATEDB;


-- 创建数据库 outline
CREATE DATABASE outline;
-- 切换数据库
\c outline light;
-- 创建用户
CREATE USER outline WITH PASSWORD 'outline';
-- 将用户权限赋予数据库
GRANT ALL PRIVILEGES ON DATABASE outline TO outline;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO outline;
GRANT USAGE,CREATE ON SCHEMA public TO outline;
GRANT ALL ON SCHEMA public TO outline;
-- 授予创建数据库权限
ALTER ROLE outline CREATEDB;


-- 创建数据库 gitlab
CREATE DATABASE gitlab;
-- 切换数据库
\c gitlab light;
-- 创建用户
CREATE USER gitlab WITH PASSWORD 'gitlab';
-- 将用户权限赋予数据库
GRANT ALL PRIVILEGES ON DATABASE gitlab TO gitlab;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gitlab;
GRANT USAGE,CREATE ON SCHEMA public TO gitlab;
GRANT ALL ON SCHEMA public TO gitlab;
-- 授予创建数据库权限
ALTER ROLE gitlab CREATEDB;
EOF

# ==================== Pgsql ==================== 

```

### 4. Redis配置

```bash
# ==================== Redis ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/basic/redis/{conf,data,logs}

# 获取默认配置文件 http://download.redis.io/redis-stable/redis.conf
curl https://raw.githubusercontent.com/redis/redis/6.2/redis.conf -o D:/docker/develop/basic/redis/conf/redis.conf

# ==================== Redis ==================== 

```

## Docker Compose定义脚本

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

## 程序启动命令
```bash
docker compose -f basic.yaml -p basic up -d

docker compose -f basic.yaml -p basic down

```
