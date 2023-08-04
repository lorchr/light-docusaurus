- [Offical](https://chat2db.ai/)
- [Offical Document](https://chat2db.ai/docs/)
- [Docker](https://hub.docker.com/r/chat2db/chat2db)

## 1. Docker安装
```shell
docker run -d \
  --publish 10824:10824 \
  --net dev \
  --restart=no \
  --name chat2db \
  chat2db/chat2db:2.0.7
```
