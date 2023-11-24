
## Aria2 文件下载工具

- [Aria2 Pro Docker](https://hub.docker.com/r/p3terx/aria2-pro)
- [Aria2 Pro Blog](https://p3terx.com/archives/docker-aria2-pro.html)

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

## Alist 聚合网盘

- [Alist](https://alist.nn.ci/)
- [Alist Github](https://github.com/alist-org/alist)

```shell
docker run -d \
 --restart=always \
 -v /etc/alist:/opt/alist/data \
 -p 5244:5244 \
 -e PUID=0 \
 -e PGID=0 \
 -e UMASK=022 \
 --name="alist" \
 xhofe/alist:latest
```

## Pandora ChatGPT客户端

- 点击 [https://chat.zhile.io](https://chat.zhile.io)
- 最新拿 `Access Token` 的技术原理，我记录在 [这里](https://zhile.io/2023/05/19/how-to-get-chatgpt-access-token-via-pkce.html) 了。
- 可以访问 [这里](http://ai-20230626.fakeopen.com/auth) 拿 `Access Token`
- 也可以官方登录，然后访问 [这里](http://chat.openai.com/api/auth/session) 拿 `Access Token`
- `Access Token` 有效期 14 天，期间访问不需要梯子。这意味着你在手机上也可随意使用。
- 这个页面上还包含一个共享账号的链接，没有账号的可以点进去体验一下。

```shell
docker pull pengzhile/pandora:1.3.5

docker run -d \
    --publish 9527:9527 \
    --env PANDORA_SERVER=0.0.0.0:9527\
    --env PANDORA_CLOUD=cloud \
    --name pandora \
    --restart no \
    pengzhile/pandora:1.3.5
```

## Gitness 开源的CI CD代码仓库

- [Gitness](https://gitness.com)
- [Gitness Github](https://github.com/harness/gitness)

```shell
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /tmp/gitness:/data \
  --name gitness \
  --restart always \
  harness/gitness
```

## Pihole
- [Docker Hub](https://hub.docker.com/r/pihole/pihole)
- [广告屏蔽连接](https://anti-ad.net/domains.txt)

```yaml
version: "3"

# More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    # For DHCP it is recommended to remove these ports and instead add: network_mode: "host"
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "67:67/udp" # Only required if you are using Pi-hole as your DHCP server
      - "80:80/tcp"
    environment:
      TZ: 'Asia/Shanghai'
      WEBPASSWORD: 'pihole' # 'set a secure password here or it will be random'
    # Volumes store your data between container upgrades
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    cap_add:
      - NET_ADMIN # Required if you are using Pi-hole as your DHCP server, else not needed
    restart: unless-stopped
```

## Clash
- [Docker Hub](https://hub.docker.com/r/dreamacro/clash)
- [Docker Hub](https://hub.docker.com/r/haishanh/yacd)

```shell
# Clash后台
docker pull dreamacro/clash

# Clash前端
docker run -d \
    -p 1234:80 \
    --rm haishanh/yacd
```

## Github action
- [nektos/act](https://github.com/nektos/act)
- [Github Action本地测试](https://zhuanlan.zhihu.com/p/535798453)
