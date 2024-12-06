
## 一、环境准备

### 1. Aria2 配置

- [AriaNg](https://github.com/mayswind/AriaNg)

```bash
# ==================== Aria2 ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/app/aria2/{data,conf,logs}

# 复制AriaNg 到 Nginx 
curl -X GET 'https://github.com/mayswind/AriaNg/releases/download/1.3.7/AriaNg-1.3.7.zip' -o D:/docker/develop/net/nginx/data/ariang/

# ==================== Bind DNS ==================== 

```

### 2. BitComet 配置

```bash
# ==================== BitComet ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/app/bitcomet/{data,conf}

# ==================== BitComet ==================== 

```


### 3. Alist 配置
- [Alist安装](https://alist.nn.ci/guide/install/docker.html)

```bash
# ==================== Alist ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/app/alist/{data,conf,logs}

# ==================== Alist ==================== 

```

### 4. Nextcloud 配置
- [Nextcloud Nginx](https://docs.nextcloud.com/server/latest/admin_manual/installation/nginx.html)
- [Nextcloud Docker](https://hub.docker.com/_/nextcloud)

```bash
# ==================== Nextcloud ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/app/nextcloud/{data,conf,logs,html,apps,themes}

# ==================== Nextcloud ==================== 

```


## 二、Docker Compose脚本及运行

| 服务      | 端口            | 暴露 | 功能  |
| --------- | --------------- | ---- | ----- |
| Aria2     | 6800/tcp        | -    | RPC  |
| Aria2     | 6888/tcp        | -    | 管理  |
| AriaNg    | 6880/tcp        | 6880 | HTTP  |
| BitComet  | 80/tcp          | 80   | HTTP  |
| BitComet  | 6900/tcp        | -    | VNC   |
| BitComet  | 6082/tcp        | 6082 | BT    |
| Alist     | 443/tcp 443/udp | 443  | HTTPS |
| Nextcloud | 80/tcp          | -    | 管理  |

### 1. docker-compose.yaml

```yaml
services:

  aria2:
    image: p3terx/aria2-pro
    container_name: app_aria2
    hostname: aria2.app
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.180
        aliases:
          - aria2.app
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - aria2.app:172.100.0.180
      - ariang.app:172.100.0.181
      - bitcomet.app:172.100.0.182
      - alist.app:172.100.0.184
      - nextcloud.app:172.100.0.186
    ports:
      - 6888:6888/tcp
      - 6888:6888/udp
    expose:
      - 6800
      - 6888
    volumes:
      - //d/docker/develop/app/aria2/data:/downloads
      - //d/docker/develop/app/aria2/conf:/config
    environment:
      TZ : Asia/Shanghai
      PUID: 1000
      PGID: 1000
      UMASK_SET: '022'
      RPC_PORT: 6800
      LISTEN_PORT: 6888
      RPC_SECRET: lightaria2
      DISK_CACHE: 64M
      IPV6_MODE: false
      UPDATE_TRACKERS: true
      CUSTOM_TRACKER_URL:
    restart: unless-stopped
    # Since Aria2 will continue to generate logs, limit the log size to 1M to prevent your hard disk from running out of space.
    logging:
      driver: json-file
      options:
        max-size: 1m

  # 可以使用Nginx替代
  ariang:
    image: p3terx/ariang
    container_name: app_ariang
    hostname: ariang.app
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.181
        aliases:
          - ariang.app
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - aria2.app:172.100.0.180
      - ariang.app:172.100.0.181
      - bitcomet.app:172.100.0.182
      - alist.app:172.100.0.184
      - nextcloud.app:172.100.0.186
    # ports:
    #   - 6880:6880
    expose:
      - 6880
    command: --port 6880 --ipv6
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: 1m

  # http://wiki-zh.bitcomet.com/linux版bitcomet安装指南
  bitcomet:
    image: wxhere/bitcomet:v2.11.0-amd64
    container_name: app_bitcomet
    hostname: bitcomet.app
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.182
        aliases:
          - bitcomet.app
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - aria2.app:172.100.0.180
      - ariang.app:172.100.0.181
      - bitcomet.app:172.100.0.182
      - alist.app:172.100.0.184
      - nextcloud.app:172.100.0.186
    ports:
      - 5900:5900
      - 6082:6082
      - 6082:6082/udp
    expose:
      - 80    # Web GUI 访问端口
      - 5900  # VNC GUI 访问端口
      - 6082  # BitTorrent 端口
    volumes:
      # 将容器中的下载目录映射到主机目录中
      - //d/docker/develop/app/bitcomet/data:/home/sandbox/Downloads:rw
      # 将容器中的配置文件目录映射到主机目录中
      - //d/docker/develop/app/bitcomet/conf:/home/sandbox/.config/BitComet:rw
    environment:
      USER: bitcomet
      PASSWORD: lightbit
      VNC_PASSWORD: lightbit
      HTTP_PASSWORD: lightbit

  alist:
    image: xhofe/alist:v3.40.0
    # image: xiaoyaliu/alist:latest
    container_name: app_alist
    hostname: alist.app
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.184
        aliases:
          - alist.app
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - aria2.app:172.100.0.180
      - ariang.app:172.100.0.181
      - bitcomet.app:172.100.0.182
      - alist.app:172.100.0.184
      - nextcloud.app:172.100.0.186
    # ports:
    #   - 5244:5244
    expose:
      - 5244
    volumes:
      - //d/docker/develop/app/alist/data:/opt/alist/data
    environment:
      TZ: Asia/Shanghai
      PUID: 1000
      PGID: 1000
      UMASK: '022'
    restart: unless-stopped

  nextcloud:
    image: nextcloud:30.0.2-apache
    container_name: app_nextcloud
    hostname: nextcloud.app
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.186
        aliases:
          - nextcloud.app
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - aria2.app:172.100.0.180
      - ariang.app:172.100.0.181
      - bitcomet.app:172.100.0.182
      - alist.app:172.100.0.184
      - nextcloud.app:172.100.0.186
    # ports:
    #   - 80:80
    expose:
      - 80
    volumes:
      - //d/docker/develop/app/nextcloud/data:/var/www/html/data
      # - //d/docker/develop/app/nextcloud/html:/var/www/html
      - //d/docker/develop/app/nextcloud/apps:/var/www/html/custom_apps
      - //d/docker/develop/app/nextcloud/conf:/var/www/html/config
      - //d/docker/develop/app/nextcloud/themes:/var/www/html/themes
    environment:
      - NEXTCLOUD_ADMIN_USER=root
      - NEXTCLOUD_ADMIN_PASSWORD=root
      - NEXTCLOUD_DATA_DIR=/var/www/html/data
      - NEXTCLOUD_TRUSTED_DOMAINS=172.100.0.186 nextcloud.app nextcloud.light.local
      # Pgsql
      - POSTGRES_HOST=pgsql.basic:5432
      # - POSTGRES_HOST_PORT=5432
      - POSTGRES_DB=nextcloud
      - POSTGRES_USER=nextcloud
      - POSTGRES_PASSWORD=nextcloud
      # Redis
      - REDIS_HOST=redis.basic
      - REDIS_HOST_PORT=6379
      # - REDIS_HOST_PASSWORD=
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
#   aria2_data:
#   bitcomet_data:

```

### 2. 启动服务组

```bash
docker compose -f app.yaml -p app up -d

docker compose -f app.yaml -p app down

```

## 三、启动后配置


### 1. Aria2 配置

1. 打开AriaNg控制台 https://ariang.light.local
2. 在系统设置 - AriaNg 设置中，配置Aria2服务器信息
   1. Aria2 RPC 别名: aria2.light.local
   2. Aria2 RPC 地址: https://aria2.light.local:443/jsonrpc
   3. Aria2 RPC 协议: HTTPS
   4. Aria2 RPC Http请求方法: POST
   5. Aria2 RPC 秘钥: lightaria2

### 2. BitComet 配置



### 3. Alist 配置

#### 1. 初始化管理员

```bash
docker exec -it app_alist /bin/bash

cd /opt/alist

# 查看用户
./alist admin

# 设置随机密码
./alist admin randmon

# 设置自定义密码
./alist admin set admin

```

#### 2. 初始化存储

```bash
docker exec -it app_alist /bin/bash

cd /opt/alist

# 查询存储
./alist storage list

# 停止存储
./alist storage disable /pikpak

```

1. 访问 https://alist.light.local
2. 输入账号密码登录 admin / admin

### 4. Nextcloud 配置

#### 1. 初始化Nextcloud

1. 访问 https://nextcloud.light.local
2. 设置用户名密码，并配置数据库连接信息
   1. 用户名:  root
   2. 密码  :  root
   3. DB用户:  nextcloud
   4. DB密码:  nextcloud
   5. 数据库:  nextcloud
   6. URL  :  pgsql.basic:5432
3. 点击安装进行初始化


#### 2. 使用Social Login集成Keycloak登录

- [官方插件](https://github.com/nextcloud/user_oidc) 
- [Social Login](https://github.com/zorn-v/nextcloud-social-login) https://apps.nextcloud.com/apps/sociallogin
- [OIDC Login](https://github.com/pulsejet/nextcloud-oidc-login) https://apps.nextcloud.com/apps/oidc_login

1. 登录Nextcloud，点击用户头像 - 应用
2. 在精选应用中搜索 Social Login，点击下载并启用
3. 如果无法在线安装，可以从github下载安装包，解压到 `D:/docker/develop/app/nextcloud/apps` 目录下
4. 默认登录访问 https://nextcloud.light.local/login?noredir=1

```bash
# JSON配置项
{
    "custom_oidc": [
        {
            "name": "keycloak",
            "title": "Keycloak OIDC",
            "authorizeUrl": "https://keycloak.light.local/realms/master/protocol/openid-connect/auth",
            "tokenUrl": "https://keycloak.light.local/realms/master/protocol/openid-connect/token",
            "userInfoUrl": "https://keycloak.light.local/realms/master/protocol/openid-connect/userinfo",
            "logoutUrl": "https://keycloak.light.local/realms/master/protocol/openid-connect/logout",
            "clientId": "Nextcloud",
            "clientSecret": "gKy0Ot3Y6msNWqzColMbK3KYy6NRjORf",
            "scope": "openid profile",
            "groupsClaim": "groups",
            "style": "keycloak",
            "defaultGroup": ""
        }
    ]
}

# 配置 自定义OIDC Provider
docker exec -t -u www-data app_nextcloud php occ config:app:set sociallogin custom_providers --value='{"custom_oidc":[{"name":"keycloak","title":"Keycloak OIDC","authorizeUrl":"https://keycloak.light.local/realms/master/protocol/openid-connect/auth","tokenUrl":"https://keycloak.light.local/realms/master/protocol/openid-connect/token","userInfoUrl":"https://keycloak.light.local/realms/master/protocol/openid-connect/userinfo","logoutUrl":"https://keycloak.light.local/realms/master/protocol/openid-connect/logout","clientId":"Nextcloud","clientSecret":"gKy0Ot3Y6msNWqzColMbK3KYy6NRjORf","scope":"openid profile","groupsClaim":"groups","style":"keycloak","defaultGroup":""}]}'

# 查询 自定义OIDC Provider  SELECT * FROM oc_appconfig WHERE appid='sociallogin';
docker exec -t -u www-data app_nextcloud php occ config:app:get sociallogin custom_providers
```

#### 3. 使用OIDC Login集成Keycloak登录

1. 登录Nextcloud，点击用户头像 - 应用
2. 在精选应用中搜索 OpenID Connect Login，点击下载并启用
3. 如果无法在线安装，可以从github下载安装包，解压到 `D:/docker/develop/app/nextcloud/apps` 目录下
4. 配置 `D:/docker/develop/app/nextcloud/conf/config.php`
5. 默认登录访问 https://nextcloud.light.local/login?noredir=1

```json
// OIDC Login
'oidc_login_client_id' => 'Nextcloud',
'oidc_login_client_secret' => 'gKy0Ot3Y6msNWqzColMbK3KYy6NRjORf', 
'oidc_login_provider_url' => 'https://keycloak.light.local/realms/master',
'oidc_login_end_session_redirect' => true,
'oidc_login_logout_url' => 'https://nextcloud.light.local/apps/oidc_login/oidc',
// 自动跳转 OIDC 登录页面
'oidc_login_auto_redirect' => true,
// OIDC 认证失败回退到默认的Local Login
'oidc_login_redir_fallback' => true, 
'oidc_login_scope' => 'openid profile',
'oidc_login_attributes' => array(
	'id' => 'preferred_username',
	'mail' => 'email',
),
// If you are running Nextcloud behind a reverse proxy, make sure this is set
'overwriteprotocol' => 'https',
// （可选项，需要配合Keycloak客户端配置）Enable the PKCE flow 
'oidc_login_code_challenge_method' => 'S256',
```
