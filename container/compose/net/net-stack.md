
## 一、环境准备

### 1. Bind DNS 配置

- [Bind DNS 官网](https://www.isc.org/bind/)
- [Bind DNS Docker](https://hub.docker.com/r/sameersbn/bind)
- [Bind DNS Docker](https://hub.docker.com/repository/docker/internetsystemsconsortium/bind9)

```bash
# ==================== Bind DNS ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/net/dns/{data,conf,logs}

# ==================== Bind DNS ==================== 

```

### 2. Stap CA 配置

- [Stap CA 官网](https://smallstep.com/docs/step-ca/)
- [Stap CA Docker](https://hub.docker.com/r/smallstep/step-ca)
- [使用 Step CA 搭建私有 ACME Server](https://george.betterde.com/devops/20221119.html)

```bash
# ==================== Stap CA ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/net/ca/{data,conf,logs}

# ==================== Stap CA ==================== 

```

### 3. Nginx 配置

```bash
# ==================== Nginx ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/net/nginx/{data,conf,conf/conf.d,logs,cert,file}

# 复制配置文件
cp ./nginx/nginx.conf   D:/docker/develop/net/nginx/conf/
cp ./nginx/conf.d/*     D:/docker/develop/net/nginx/conf/conf.d/

# ==================== Nginx ==================== 

```

### 4. Caddy 配置

- [Caddy](https://caddyserver.com/)
- [Caddy Github](https://github.com/caddyserver/caddy)

```bash
# ==================== Caddy ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/net/caddy/{conf,data,logs,site,cert}

# 复制配置文件
cp ./caddy/Caddyfile    D:/docker/develop/net/caddy/conf/

# ==================== Caddy ==================== 

```

### 5. Traefik 配置

```bash
# ==================== Traefik ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/net/traefik/{data,conf,logs}

# ==================== Traefik ==================== 

```

## 二、Docker Compose脚本及运行

| 服务    | 端口            | 暴露  | 功能  |
| ------- | --------------- | ----- | ----- |
| Bind    | 10000/tcp       | 10000 | 管理  |
| Bind    | 53/tcp 53/udp   | 53    | DNS   |
| Ningx   | 80/tcp          | 80    | HTTP  |
| Ningx   | 443/tcp 443/udp | 443   | HTTPS |
| Caddy   | 2019/tcp        | -     | 管理  |
| Traefik | -               | -     | 管理  |

### 1. docker-compose.yaml

```yaml
services:

  binddns:
    image: sameersbn/bind:9.16.1-20200524
    container_name: net_binddns
    hostname: binddns.net
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.150
        aliases:
          - binddns.net
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - bind.net:172.100.0.150
      - pihole.net:172.100.0.151
      - stepca.net:172.100.0.152
      - nginx.net:172.100.0.154
      - caddy.net:172.100.0.156
      - traefik.net:172.100.0.158
      - ca.light.local:127.0.0.1
    ports:
      - 53:53/tcp
      - 53:53/udp
      - 10000:10000/tcp
    expose:
      - 53
      - 10000
    volumes:
      - //d/docker/develop/net/dns/data:/data
    environment:
      TZ : 'Asia/Shanghai'
      ROOT_PASSWORD: lightdns
      WEBMIN_ENABLED: true      
      WEBMIN_INIT_SSL_ENABLED: true
    restart: unless-stopped
  
  # More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
  pihole:
    image: pihole/pihole:2024.07.0
    container_name: net_pihole
    hostname: pihole.net
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.151
        aliases:
          - pihole.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - bind.net:172.100.0.150
      - pihole.net:172.100.0.151
      - stepca.net:172.100.0.152
      - nginx.net:172.100.0.154
      - caddy.net:172.100.0.156
      - traefik.net:172.100.0.158
      - ca.light.local:127.0.0.1
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    cap_add:
      - NET_ADMIN # Required if you are using Pi-hole as your DHCP server, else not needed
    # For DHCP it is recommended to remove these ports and instead add: network_mode: "host"
    # ports:
    #   - "53:53/tcp"
    #   - "53:53/udp"
    #   - "67:67/udp" # Only required if you are using Pi-hole as your DHCP server
    #   - "80:80/tcp"
    expose:
      - 53
      - 67
      - 80
    # Volumes store your data between container upgrades
    volumes:
      - //d/docker/develop/net/pihole/conf:/etc/pihole'
      - //d/docker/develop/net/pihole/conf/dnsmasq.d:/etc/dnsmasq.d'
    environment:
      TZ: Asia/Shanghai
      WEBPASSWORD: 'pihole' # 'set a secure password here or it will be random'
    restart: unless-stopped

  stepca:
    image: smallstep/step-ca:0.27.4
    container_name: net_stepca
    hostname: stepca.net
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.152
        aliases:
          - stepca.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - bind.net:172.100.0.150
      - pihole.net:172.100.0.151
      - stepca.net:172.100.0.152
      - nginx.net:172.100.0.154
      - caddy.net:172.100.0.156
      - traefik.net:172.100.0.158
      - ca.light.local:127.0.0.1
    ports:
      - 9000:9000
    expose:
      - 9000
    labels:
      - traefik.enable=false
    volumes:
      - //d/docker/develop/net/ca/data:/home/step
    environment:
      - TZ=Asia/Shanghai
      # CA 证书机构名
      - DOCKER_STEPCA_INIT_NAME=Smallstep Acme Corp
      - DOCKER_STEPCA_INIT_ACME=true
      - DOCKER_STEPCA_INIT_ADDRESS=0.0.0.0:443
      - DOCKER_STEPCA_INIT_ADMIN_SUBJECT=root
      - DOCKER_STEPCA_INIT_PASSWORD=lightca
      - DOCKER_STEPCA_INIT_DNS_NAMES=ca.light.local,acme-v02.api.letsencrypt.org,localhost,stepca.net
      - DOCKER_STEPCA_INIT_REMOTE_MANAGEMENT=true
    restart: unless-stopped

  nginx:
    image: nginx:1.25
    container_name: net_nginx
    hostname: nginx.net
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.154
        aliases:
          - nginx.net
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - bind.net:172.100.0.150
      - pihole.net:172.100.0.151
      - stepca.net:172.100.0.152
      - nginx.net:172.100.0.154
      - caddy.net:172.100.0.156
      - traefik.net:172.100.0.158
      - ca.light.local:127.0.0.1
    ports:
      - 80:80
      - 443:443
      - 443:443/udp
    expose:
      - 80
      - 443
    volumes:
      - //d/docker/develop/net/nginx/data:/usr/share/nginx/html
      - //d/docker/develop/net/nginx/conf/nginx.conf:/etc/nginx/nginx.conf
      - //d/docker/develop/net/nginx/conf/conf.d:/etc/nginx/conf.d
      - //d/docker/develop/net/nginx/cert:/etc/nginx/certs
      - //d/docker/develop/net/nginx/logs:/var/log/nginx
      - //d/docker/develop/net/nginx/file:/usr/share/nginx/files
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    restart: unless-stopped

  caddy:
    image: caddy:2.8
    container_name: net_caddy
    hostname: caddy.net
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.156
        aliases:
          - caddy.net
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - bind.net:172.100.0.150
      - pihole.net:172.100.0.151
      - stepca.net:172.100.0.152
      - nginx.net:172.100.0.154
      - caddy.net:172.100.0.156
      - traefik.net:172.100.0.158
      - ca.light.local:127.0.0.1
    cap_add:
      - NET_ADMIN
    ports:
      # - 80:80
      # - 443:443
      # - 443:443/udp
      - 2019:2019
    expose:
      - 80
      - 443
      - 2019
    volumes:
      - //d/docker/develop/net/caddy/cert/:/etc/x509/https/
      - //d/docker/develop/net/caddy/site:/srv
      - //d/docker/develop/net/caddy/conf:/config
      - //d/docker/develop/net/caddy/data:/data
    entrypoint: /usr/bin/caddy run --adapter caddyfile --config /config/Caddyfile
    restart: no # unless-stopped

networks:
  develop:
    external: true
  proxy-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.77.0.0/16

# volumes:
#   nginx_data:
#   caddy_data:

```

### 2. 启动服务组

```bash
docker compose -f net.yaml -p net up -d

docker compose -f net.yaml -p net down

```

## 三、启动后配置

### 1. Bind DNS配置
1. 浏览器访问 https://localhost:10000 
2. 点击 Webmin - Change Language and theme，更换语言为中文
3. 点击 Servers - Bind DNS Server - 现有 DNS 区域 - 创建主区域
   1. 域名 / 网络 light.local
   2. 主服务器	  localhost
   3. Email 地址  light@light.local
4. 点击 Servers - Bind DNS Server - 现有 DNS 区域 - light.local - 地址
   1. 名称  light.local
   2. 地址  192.168.137.1 物理机网卡的地址
   3. 名称  *.light.local
   4. 地址  192.168.137.1 物理机网卡的地址
5. 点击 Servers - Bind DNS Server - 现有 DNS 区域 - light.local - 点击页面右上角的 Apply Zone、Apply Configuration
6. 修改物理机的DNS地址
   1. 192.168.137.1
   2. 114.114.114.114
7. 检查配置是否成功 ping light.local

### 2. Step CA配置

修改 `config/ca.json`，增加 `authority.claims` 及 `authority.provisioners` 配置

```json5
{
  "root": "/home/step/certs/root_ca.crt",
  "federatedRoots": null,
  "crt": "/home/step/certs/intermediate_ca.crt",
  "key": "/home/step/secrets/intermediate_ca_key",
  "address": "0.0.0.0:443",
  "insecureAddress": "",
  "dnsNames": [
    "ca.svc.dev",
    "acme-v02.api.letsencrypt.org",
    "step-ca"
  ],
  "logger": {
    "format": "text"
  },
  "db": {
    "type": "badgerv2",
    "dataSource": "/home/step/db",
    "badgerFileLoadingMode": ""
  },
  "authority": {
    // 配置证书的有效时长等
    "claims": {
      "disableRenewal": false,
      "minTLSCertDuration": "2160h",
      "maxTLSCertDuration": "2160h",
      "defaultTLSCertDuration": "2160h",
      "allowRenewalAfterExpiry": false,
      "minHostSSHCertDuration": "5m",
      "maxHostSSHCertDuration": "1680h",
      "minUserSSHCertDuration": "5m",
      "maxUserSSHCertDuration": "24h",
      "defaultUserSSHCertDuration": "16h",
      "defaultHostSSHCertDuration": "720h"
    },
    "enableAdmin": true,
    // 开启 ACME 相关配置
    "provisioners": [
      {
        "type": "ACME",
        "name": "acme"
      }
    ]
  },
  "tls": {
    "cipherSuites": [
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
      "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256"
    ],
    "minVersion": 1.2,
    "maxVersion": 1.3,
    "renegotiation": false
  }
}
```

1. 宿主机[安装 Step 客户端](https://smallstep.com/docs/step-cli/installation/#windows)

```bash
# 安装
curl.exe -LO https://dl.smallstep.com/cli/docs-cli-install/latest/step_windows_amd64.zip
Expand-Archive -LiteralPath .\step_windows_amd64.zip -DestinationPath .
step_windows_amd64\bin\step.exe version


# 测试
step_windows_amd64\bin\step.exe certificate inspect https://smallstep.com

```

2. 宿主机安装CA证书

```bash
# 进入交互模式
docker exec -it net_stepca /bin/bash

# 获取CA密码
cat secrets/password

# 获取 fingerprint
step certificate fingerprint certs/root_ca.crt

# 宿主机安装证书
step_windows_amd64\bin\step.exe certificate install D:/docker/develop/net/ca/data/certs/root_ca.crt

```

3. 生成应用证书(在 step-ca 容器中)

```bash
# 进入交互模式
docker exec -it net_stepca /bin/bash

# 生成证书
step ca certificate localhost certs/localhost.crt certs/localhost.key
# 查看证书
step certificate inspect certs/localhost.crt

# 生成泛域名证书
step ca certificate *.light.local certs/light.local.crt certs/light.local.key
# 查看证书
step certificate inspect certs/light.local.crt

# Gitlab子域名证书
step ca certificate *.gitlab.light.local certs/gitlab.light.local.crt certs/gitlab.light.local.key
step ca certificate *.pages.gitlab.light.local certs/pages.gitlab.light.local.crt certs/pages.gitlab.light.local.key

# Minio子域名证书
step ca certificate *.minio.light.local certs/minio.light.local.crt certs/minio.light.local.key

```

4. 将证书复制到Web Server中

```bash
# 将生成的应用证书复制到Nginx
cp D:/docker/develop/net/ca/data/certs/*       D:/docker/develop/net/nginx/cert/

```

5. 对于 Gitlab 需要将 `root_ca.crt` 复制到容器中，并在Git命令行安装

```bash
cp D:/docker/develop/net/ca/data/certs/root_ca.crt       D:/docker/develop/web/gitlab/conf/ssl/root_ca.crt

# 安装ca证书，避免集成keycloak报错
cat /etc/gitlab/ssl/root_ca.crt >> /opt/gitlab/embedded/ssl/certs/cacert.pem

# 防止拉取仓库时报错 SSL certificate problem: unable to get local issuer certificate
git config --global http.sslCAInfo D:/docker/develop/web/gitlab/conf/ssl/root_ca.crt

```
