容器化部署 HeadScale-Derper 服务器

## 0. 云服务器端口开启说明
```shell
# 以下端口信息可修改，在对应位置替换即可
Derper        HTTP  端口  33445  为 headsacle 提供流量转发的端口
Derper        HTTPS 端口  33446  为 headsacle 提供流量转发的端口（有证书时使用）
Derper        STUN  端口  3478   在NAT、路由等网络条件允许时进行p2p连接
Headscale     HTTP  端口  8080   用于tailscale客户端登录、注册以及管理租户
Headscale-ui  HTTP  端口  8000   Web UI界面（可选）
```

## 1. IP Derper 镜像编译
### 仓库克隆

```shell
git clone https://ghproxy.net/https://github.com/yangchuansheng/ip_derper.git
cd ip_derper
git submodule update --init --recursive
vim tailscale/cmd/derper/cert.go
```

### 源码修改-注释掉以下3行代码

```shell
func (m *manualCertManager) getCertificate(hi *tls.ClientHelloInfo) (*tls.Certificate, error) {
        //if hi.ServerName != m.hostname {
        //      return nil, fmt.Errorf("cert mismatch with hostname: %q", hi.ServerName)
        //}
        ....
}
```

### 编译镜像（并启动）

```shell
docker build -t ip_derper:1.62.0 .
# 可选
docker run \
            --restart always \
            --net host \
            --name derper \
            -d ip_derper:1.62.0 # ghcr.io/yangchuansheng/ip_derper
# 服务器放行 33445 和 33446 端口
# 访问 HTTPS 端口也就是 33445 显示 This is a Tailscale DERP server.
```

### Dockerfile 说明

```shell
FROM golang:latest AS builder
 
LABEL org.opencontainers.image.source https://github.com/yangchuansheng/ip_derper
 
WORKDIR /app
 
ADD tailscale /app/tailscale
 
# build modified derper
# 添加go代理
RUN cd /app/tailscale/cmd/derper && \
    go env -w GO111MODULE=on && \
    go env -w GOPROXY=https://goproxy.cn,direct && \
    CGO_ENABLED=0 /usr/local/go/bin/go build -buildvcs=false -ldflags "-s -w" -o /app/derper && \
    cd /app && \
    rm -rf /app/tailscale
 
FROM ubuntu:20.04
WORKDIR /app
 
# ========= CONFIG =========
# - derper args
ENV DERP_ADDR :33446              # HTTPS 端口
ENV DERP_HTTP_PORT 33445          # HTTP  端口
ENV DERP_HOST=127.0.0.1           # 域名，这里随便写（好像不行）
ENV DERP_CERTS=/app/certs/        # 证书路径
ENV DERP_STUN true
ENV DERP_VERIFY_CLIENTS false
# ==========================
 
# apt
RUN apt-get update && \
    apt-get install -y openssl curl
 
COPY build_cert.sh /app/
COPY --from=builder /app/derper /app/derper
 
# build self-signed certs && start derper
# --hostname     与证书域名相同，不会出现在网络上
# --certmode     manual表示手动指定证书
# --certdir      证书路径（脚本中生成的证书）
# --a            HTTPS 端口
# --http-port    HTTP 端口
CMD bash /app/build_cert.sh $DERP_HOST $DERP_CERTS /app/san.conf && \
    /app/derper --hostname=$DERP_HOST \
    --certmode=manual \
    --certdir=$DERP_CERTS \
    --stun=$DERP_STUN  \
    --a=$DERP_ADDR \
    --http-port=$DERP_HTTP_PORT \
    --verify-clients=$DERP_VERIFY_CLIENTS
```

## 2 非必须

### 在宿主机执行

```shell
# 临时启动
sysctl -w net.ipv4.ip_forward=1
# 编辑 /etc/sysctl.conf 添加以下内容
net.ipv4.ip_forward=1
# 保存后执行以下命令
sysctl -p
```

## 3. headscale-ui镜像
### 克隆仓库并切换编译路径

```shell
git clone https://ghproxy.net/https://github.com/gurucomputing/headscale-ui.git
cd headscale-ui/docker/production
```

### 访问 https://login.tailscale.com/admin/acls/file 保存配置信息到本地 headscale-ui/docker/production/derper.json

```json
{
    "Regions": {
        "901": {
            "RegionID": 901,
            "RegionCode": "Myself",
            "RegionName": "Myself Derper",
            "Nodes": [
                {
                    "Name": "901a",
                    "RegionID": 901,
                    "DERPPort": 33445,
                    "HostName": "公网IP",
                    "IPv4": "公网IP",
                    "InsecureForTests": true
                }
            ]
        }
    }
}
```

### 修改CaddyFile文件开启反向代理

```conf
{
        skip_install_trust
        auto_https disable_redirects
        http_port {$HTTP_PORT}
        https_port {$HTTPS_PORT}
}

# 限制为只能由服务器自身访问
公网IP:{$HTTP_PORT} {
        redir / /web
        uri strip_prefix /web
        file_server {
                root /web
        }
 
        reverse_proxy /api/v1/* http://headscale:8080
}
 
# 限制为只能由服务器自身访问
公网IP:{$HTTPS_PORT} {
        redir / /web
        uri strip_prefix /web
        tls internal {
                on_demand
        }
        file_server {
                root /web
        }
}
```

### 修改 dockerfile 第 84-85 行 添加配置文件并为 alpine 换源
- 配置文件地址为 http://公网IP:8000/web/derper.json

```shell
COPY ./derper.json /web/derper.json
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
 && apk add --no-cache caddy
```

### 修改 script/1-image-build.sh 设置npm国内源

```shell
#clone the project
# 添加
git clone https://ghproxy.net/${PROJECT_URL} ${PROJECT_NAME}
.................
# 添加
npm config set registry https://registry.npm.taobao.org
npm install 
```

### 编译镜像

```shell
docker build -f dockerfile -t headscale-ui:24.02.24 .

```

### 启动服务

```shell
services:
    headscale-ui:
    image: headscale-ui:24.02.24
    container_name: headscale-ui
    restart: unless-stopped
    environment:
      - HTTP_PORT=80
    ports:
      - 8000:80
```

## 4. 配置headscale
### 克隆仓库并配置挂载路径

```shell
mkdir container-config
mkdir -p container-data/data
git clone -b v0.22.3  https://ghproxy.net/https://github.com/juanfont/headscale.git headscale-repo
cp headscale-repo/config-example.yaml container-config/config.yaml
```

### 修改配置文件 container-config/config.yaml

- 将 server_url 改为公网 IP 或域名。
  - server_url: http://:8080
- 修改接受任意IP请求 listen_addr: 0.0.0.0:8080
- 如果暂时用不到 DNS 功能，可以先将 magic_dns 设为 false。
- 打开随机端口，将 randomize_client_port 设为 true。
- ip_prefixes 注释掉 IPV6 地址
- 修改derper配置文件地址 derper.urls
  - http://公网IP:8000/web/derper.json

```shell
server_url: http://>:8080
randomize_client_port: true
ip_prefixes:
  # - fd7a:115c:a1e0::/48
  - 100.64.0.0/16
    ....
derper:
  .....
  urls:
  #- https://controlplane.tailscale.com/derpmap/default
  #- http://公网IP:8000/web/derper.json
  - http://headscale-ui:8000/web/derper.json
```

### 修改Dockerfile

```shell
RUN go env -w GO111MODULE=on && \
    go env -w GOPROXY=https://goproxy.cn,direct && \
    go mod download
```

### 编译镜像

```shell
docker build -t headscale/headscale:0.22.3 .
```

## 5. 配置docker-compose

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
    ports:            # 当不想在公网暴露 ui 时请注释掉本行
      - 8000:8000     # 当不想在公网暴露 ui 时请注释掉本行
 
 
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

### 安装依赖并启动服务

```shell
pip install 'urllib3<2'
docker-compose up -d 
```

### 访问页面 http://公网IP:8000/web 添加API
### 生成API
```shell
docker exec -it headscale headscale apikey create --expiration 1d
```

## 6.配置 tailscale
### 6.1 windows11
#### 访问 [headscale - Windows](http://公网IP:8080/windows)

- 获取 windows tailscale 客户端连接服务器的教程

#### windows 11
```shell
# 开启 cmd 并输入以下指令
tailscale login --login-server http://公网IP:8080/windows
# 打开 headscale-ui device 页面 并填入 nodekey:... 及之后内容
```

### 6.2 Linux
```shell
# 开启 bash 并输入以下指令
tailscale login --login-server http://公网IP:8080/windows
# 打开 headscale-ui device 页面 并填入 nodekey:... 及之后内容
```

### 6.3 Android
#### 首先将 Tailscale 的客户端 clone 到本地：
```shell
git clone https://github.com/tailscale/tailscale-android.git
```

#### 修改后端地址。

- 找到文件/tailscale-android/cmd/tailscale/backend.go

- 查找如下代码段：

```go
func (b *backend) Start(notify func(n ipn.Notify)) error {
    b.backend.SetNotifyCallback(notify)
    return b.backend.Start(ipn.Options{
        StateKey: "ipn-android",
    })
}
```

修改为：

- 其中`<公网IP地址>`修改为Headscale服务器的地址。

```go
func (b *backend) Start(notify func(n ipn.Notify)) error {
    b.backend.SetNotifyCallback(notify)
    prefs := ipn.NewPrefs()
    prefs.ControlURL = "http://<公网IP地址>:8080"
    opts := ipn.Options{
    StateKey: "ipn-android",
        UpdatePrefs: prefs,
    }
    return b.backend.Start(opts)
}
```

#### 编译：

```shell
make tailscale-debug.apk
adb install tailscale-debug.apk
```

安装后在手机上打开，点击`Get start`，登录时选择`Sign in with others`，会自动跳转到浏览器，把最后一行的命令复制到 headscale 服务器上并将NAMESPACE替换为刚才创建的命名空间后执行，执行成功后会返回`Machine register`，同时在客户机上会自动跳转到主界面，将主界面上方的开关打开后，再按照上面查看已连接客户端的方法在服务端查询确认设备在线就可以了。

## 7. heascale 常用命令
### namespace

```shell
headscale namespace list                      # 查看所有的namespace
headscale namespace create myspace            # 创建namespace
headscale namespace destroy myspace           # 删除namespace
headscale namespace rename myspace newspace   # 重命名namespace
```

### node

```shell
headscale node list          # 列出所有的节点
headscale node ls -t         # 列出所有的节点,同时显示出tag信息
headscale -n myspace node ls # 只查看namespace为myspace下的节点
headscale node delete -i<ID> # 根据id删除指定的节点（id可用node list查询）
                             # 如 headscale nodes delete -i=2
headscale node tag -i=2 -t=tag:test # 给id为2的node设置tag为tag:test
```

### route

```shell
headscale routes list -i=3    # 列出节点3的所有路由信息
headscale routes enable -i=3 -r=192.168.10.0/24 
                              # 将节点3的路由中信息为192.168.10.0/24的设置为true,
                              # 这样除了虚拟内网ip,原先的内网ip网段为192.168.10的也能访问了
```

### preauthkeys

```shell
# preauthkeys主要是方便客户端快速接入，创建了preauthkeys后客户端直接使用该key就可以直接加入namespace
headscale -n default preauthkeys list # 查看名称为default的namespace中已经生成的preauthkeys 
headscale preauthkeys create -e 24h -n default # 给名称为default的namespace创建preauthkeys 
```

### apikeys

```shell
# apikeys是为了客户端和headscale做http鉴权用的，http请求的时候需要设置头部authorization
# 值为固定的字符串"Bearer "加apikeys创建的key
headscale.exe apikeys create # 创建apikeys,在创建的时候需要记录下完整的值，后续查询出来的都是prefix
                             # 值类似于zs3NTt7G0w.pDWtOtaVx_mN9SzoM24Y02y6tfDzz5uysRHVxwJc1o4
headscale.exe apikeys list -o=json #查询headscale的apikeys,并将结果输出成json格式
```

## 参考资料
- [Tailscale 基础教程：Headscale 的部署方法和使用教程](https://zhuanlan.zhihu.com/p/676818620)

- 使用 ip 的 derper 容器
  - [GitHub - yangchuansheng/ip_derper: 无需域名的 derper](https://github.com/yangchuansheng/ip_derper)
  - [Tailscale 基础教程：部署私有 DERP 中继服务器 · 云原生实验室](https://icloudnative.io/posts/custom-derp-servers/)

- headscale 使用教程
  - [Tailscale 基础教程：Headscale 的部署方法和使用教程 · 云原生实验室](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/)

- haedscale 及 webui 的容器化部署
  - [Docker 搭建 headscale 异地组网完整教程](https://www.nodeseek.com/post-37577-1)
  - [docker安装headscale+headscale-webui运行正常了！](https://github.com/iFargle/headscale-webui/issues/79)
  - [Docker搭建headscale和derp异地组网完整教程](https://isedu.top/index.php/archives/192/)
