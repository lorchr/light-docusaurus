- https://hub.docker.com/r/p3terx/aria2-pro
- https://p3terx.com/archives/docker-aria2-pro.html

```shell
# 安装aria2
docker run -d \
    --name aria2-pro \
    --restart unless-stopped \
    --log-opt max-size=1m \
    -e PUID=$UID \
    -e PGID=$GID \
    -e UMASK_SET=022 \
    -e RPC_SECRET=P3TERX \
    -e RPC_PORT=6800 \
    -p 6800:6800 \
    -e LISTEN_PORT=6888 \
    -p 6888:6888 \
    -p 6888:6888/udp \
    -v //d/docker/aria2/conf:/config \
    -v //d/docker/aria2/data:/downloads \
    p3terx/aria2-pro

# 安装webui
docker run -d \
    --name ariang \
    --log-opt max-size=1m \
    --restart unless-stopped \
    -p 6880:6880 \
    p3terx/ariang

# 配置webui
# AriaNg设置 -> IP 及 RPC_SECRET
```