- [Readeck 官网](https://readeck.org/en/start)
- [Readeck 下载](https://readeck.org/en/download)
- [Readeck 文档](https://readeck.org/en/docs/)

网页留存与稍后阅读软件

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create readeck_data;

# 创建文件夹
mkdir -p D:/docker/readeck/{conf,data,logs}

# 拉取镜像
docker pull codeberg.org/readeck/readeck:latest

# 获取默认配置文件
docker run -d --name readeck_temp codeberg.org/readeck/readeck:latest \
  && docker cp readeck_temp:/readeck/config.toml  D:/docker/readeck/conf/ \
  && docker stop readeck_temp && docker rm readeck_temp

# 运行镜像
docker run -d \
    --publish 8000:8000 \
    --volume //d/docker/readeck/data:/readeck/data \
    --volume //d/docker/readeck/conf/config.toml:/readeck/config.toml \
    --env READECK_LOG_LEVEL=info \
    --env READECK_SERVER_HOST=0.0.0.0 \
    --env READECK_SERVER_PORT=8000 \
    --env READECK_SERVER_PREFIX=/ \
    --env READECK_USE_X_FORWARDED=true \
    --net dev \
    --restart=no \
    --name readeck \
    codeberg.org/readeck/readeck:latest

```

- [Dashboard](http://localhost:8000/)
  - Account: root / 12345678

## 使用 Docker Compose

```yaml
version: "3.9"
services:
  app:
    image: codeberg.org/readeck/readeck:latest
    container_name: readeck
    ports:
      - 8000:8000
    environment:
      # Defines the application log level. Can be error, warning, info, debug.
      - READECK_LOG_LEVEL=info
      # The IP address on which Readeck listens.
      - READECK_SERVER_HOST=0.0.0.0
      # The TCP port on which Readeck listens. Update container port above to match (right of colon).
      - READECK_SERVER_PORT=8000
      # The URL prefix of Readeck.
      - READECK_SERVER_PREFIX=/
      # A list of hostnames allowed in HTTP requests. Required for reverse proxy configuration.
      - READECK_ALLOWED_HOSTS=readeck.example.com
      # Use the 'X-Forwarded-' headers. Required for reverse proxy configuration.
      - READECK_USE_X_FORWARDED=true
    volumes:
      - readeck-data:/readeck
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "/bin/readeck", "healthcheck", "-config", "config.toml"]
      interval: 30s
      timeout: 2s
      retries: 3
```

## 使用 PostgreSQL

```yaml
version: "3.9"
services:
  app:
    image: codeberg.org/readeck/readeck:latest
    container_name: readeck
    depends_on:
      - db
    ports:
      - 8000:8000
    environment:
      # The URL of the instance's database.
      - READECK_DATABASE_SOURCE=postgres://readeck:readeckisawesome@readeck-db:5432/readeck
      # Defines the application log level. Can be error, warning, info, debug.
      - READECK_LOG_LEVEL=info
      # The IP address on which Readeck listens.
      - READECK_SERVER_HOST=0.0.0.0
      # The TCP port on which Readeck listens. Update container port above to match (right of colon).
      - READECK_SERVER_PORT=8000
      # The URL prefix of Readeck.
      - READECK_SERVER_PREFIX=/
      # A list of hostnames allowed in HTTP requests. Required for reverse proxy configuration.
      - READECK_ALLOWED_HOSTS=readeck.example.com
      # Use the 'X-Forwarded-' headers. Required for reverse proxy configuration.
      - READECK_USE_X_FORWARDED=true
    volumes:
      - readeck-data:/readeck
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "/bin/readeck", "healthcheck", "-config", "config.toml"]
      interval: 30s
      timeout: 2s
      retries: 3

  db:
    image: postgres:16-alpine
    container_name: readeck-db
    environment:
      - POSTGRES_DB=readeck
      - POSTGRES_USER=readeck
      - POSTGRES_PASSWORD=readeckisawesome
    volumes:
      - readeck-db:/var/lib/postgresql/data
    restart: unless-stopped
```
