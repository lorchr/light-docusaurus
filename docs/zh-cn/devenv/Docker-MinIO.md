- [MinIO Offical](https://min.io)
- [MinIO Offical Docker](https://min.io/docs/minio/container/index.html)
- [MinIO Docker](https://hub.docker.com/r/minio/minio) 

## 1. Docker安装
```shell
docker run -d \
  --publish 9000:9000 \
  --publish 9001:9001 \
  --volume //d/docker/minio/data:/data \
  --env MINIO_ROOT_USER=minioaccess \
  --env MINIO_ROOT_PASSWORD=miniosecret \
  --env MINIO_SERVER_URL=http://minio.example.net:9000 \
  --net dev \
  --restart=on-failure:3 \
  --name minio \
  minio/minio:RELEASE.2023-05-18T00-05-36Z server /data --console-address ":9001"

# 创建Network
docker network create dev

# 创建数据卷
docker volume create minio_data;

# 获取默认配置文件
# 见 https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4

# 运行容器
docker run -d \
  --publish 9000:9000 \
  --publish 9001:9001 \
  --volume //d/docker/minio/data:/data \
  --volume //d/docker/minio/conf/config.env:/etc/minio/config.env \
  --env MINIO_CONFIG_ENV_FILE=/etc/minio/config.env \
  --net dev \
  --restart=on-failure:3 \
  --name minio \
  minio/minio:RELEASE.2023-05-18T00-05-36Z server /data --console-address ":9001"

docker exec -it -u root minio /bin/bash

docker container restart minio
```

- Account
  - minioaccess/miniosecret

[Console Dashboard](http://localhost:9001)

## config.env
```conf
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment

MINIO_ROOT_USER=minioaccess
MINIO_ROOT_PASSWORD=miniosecret

# MINIO_VOLUMES sets the storage volume or path to use for the MinIO server.

MINIO_VOLUMES="/mnt/data"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine

# Uncomment the following line and replace the value with the correct hostname for the local machine and port for the MinIO server (9000 by default).

# MINIO_SERVER_URL="http://minio.example.net:9000"
```
