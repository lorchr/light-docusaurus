- [Tailscale 官网](https://tailscale.com/)
- [Tailscale Github](https://github.com/tailscale/tailscale)
- [Tailscale 下载](https://tailscale.com/download)
- [Tailscale 文档](https://tailscale.com/kb/1017/install)

异地组网与远程访问

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create tailscale_data;

# 创建文件夹
mkdir -p D:/docker/tailscale/{conf,data,logs,state,tun}

# 拉取镜像
docker pull tailscale/tailscale:stable
docker pull ghcr.io/tailscale/tailscale:stable

# 获取默认配置文件
docker run -d --name tailscale_temp tailscale/tailscale:stable \
  && docker cp tailscale_temp:/tailscale/config.toml  D:/docker/tailscale/conf/ \
  && docker stop tailscale_temp && docker rm tailscale_temp

# 运行镜像
# 注意： 使用host网络
docker run -d \
    --volume //d/docker/tailscale/state:/var/lib/tailscale \
    --volume //d/docker/tailscale/tun:/dev/net/tun \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --env TS_AUTHKEY=tskey-auth-kk1EHUy3bZ11CNTRL-fEPDWgeLDhAGu8TeV67ChAVF57Wf3ZKf \
    --env TS_ROUTES=192.168.99.0/24 \
    --env TS_EXTRA_ARGS=--advertise-tags=tag:container \
    --env TS_STATE_DIR=/var/lib/tailscale \
    --env TS_USERSPACE=false \
    --privileged \
    --net host \
    --restart=no \
    --name tailscale \
    tailscale/tailscale:stable

docker run -d \
    --volume //d/docker/tailscale/state:/var/lib/tailscale \
    --volume //d/docker/tailscale/tun:/dev/net/tun \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --env TS_AUTHKEY=tskey-auth-kk1EHUy3bZ11CNTRL-fEPDWgeLDhAGu8TeV67ChAVF57Wf3ZKf \
    --env TS_STATE_DIR=/var/lib/tailscale \
    --env TS_USERSPACE=false \
    --privileged \
    --net host \
    --restart=no \
    --name tailscale \
    tailscale/tailscale:stable
```

## 使用Docker Compose

```yaml
---
version: "3.7"
services:
  tailscale-nginx:
    image: tailscale/tailscale:latest
    hostname: tailscale-nginx
    environment:
      - TS_AUTHKEY=tskey-client-notAReal-OAuthClientSecret1Atawk
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=false
    volumes:
      - ${PWD}/tailscale-nginx/state:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
      - sys_module
    restart: unless-stopped
  
  nginx:
    image: nginx
    depends_on:
      - tailscale-nginx
    network_mode: service:tailscale-nginx

```

## 使用Docker部署 Tailscale Derper Headscale
### 5. 配置docker-compose

```yaml
version: "3.9"

services:
 headscale:
  image: headscale/headscale:0.22.3
  container_name: headscale
  restart: unless-stopped
  environment:
   - TZ=Asia/Shanghai
  volumes:
   - ./container-config:/etc/headscale
   - ./container-data/data:/var/lib/headscale
  entrypoint: headscale serve
   #network_mode: "host"
  networks:
   - headscale_net
  ports:
   - 8080:8080
  cap_add:
   - NET_ADMIN
   - SYS_MODULE
  sysctls:
   - net.ipv4.ip_forward=1


 headscale-ui:
  image: headscale-ui:24.02.24
  container_name: headscale-ui
  restart: unless-stopped
  environment:
   - HTTP_PORT=8000
  networks:
   - headscale_net
  ports:      # 当不想在公网暴露 ui 时请注释掉本行
   - 8000:8000   # 当不想在公网暴露 ui 时请注释掉本行


 ip-derper:
  image: ip_derper:1.62.0
  container_name: ip-derper
  restart: unless-stopped
  environment:
   - TZ=Asia/Shanghai
  network_mode: "host"

networks:
 headscale_net:
```

- 安装依赖并启动服务

```bash
pip install 'urllib3<2'
docker-compose up -d 
```

- 访问页面 `http://公网IP:8000/web` 添加API
- 生成API

```bash
docker exec -it headscale headscale apikey create --expiration 1d
```


### 7. heascale 常用命令

- namespace

```bash
headscale namespace list           # 查看所有的namespace
headscale namespace create myspace      # 创建namespace
headscale namespace destroy myspace      # 删除namespace
headscale namespace rename myspace newspace  # 重命名namespace
```

- node

```bash
headscale node list     # 列出所有的节点
headscale node ls -t     # 列出所有的节点,同时显示出tag信息
headscale -n myspace node ls # 只查看namespace为myspace下的节点
headscale node delete -i<ID> # 根据id删除指定的节点（id可用node list查询）
               # 如 headscale nodes delete -i=2
headscale node tag -i=2 -t=tag:test # 给id为2的node设置tag为tag:test
```

- route

```bash
headscale routes list -i=3  # 列出节点3的所有路由信息
headscale routes enable -i=3 -r=192.168.10.0/24 
               # 将节点3的路由中信息为192.168.10.0/24的设置为true,
               # 这样除了虚拟内网ip,原先的内网ip网段为192.168.10的也能访问了
```
