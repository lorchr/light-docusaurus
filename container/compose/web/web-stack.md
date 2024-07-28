
## 环境准备脚本

### 1. Caddy配置
- [Caddy](https://caddyserver.com/)
- [Caddy Github](https://github.com/caddyserver/caddy)

生成的证书私钥需要放到目录 `D:/docker/web/caddy/cert`
```bash
# ==================== Caddy ====================
# 创建文件夹
mkdir -p D:/docker/web/caddy/{conf,data,logs,site,cert}

# 生成私钥，需要输入密码 1234
openssl genrsa -des3 -out caddy.pass.key 2048
# 删除私钥中的密码
openssl rsa -in caddy.pass.key -out caddy.key
# 生成CSR
openssl req -new -key caddy.key -out caddy.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=caddy/CN=caddy.light.local"
# 生成证书
openssl x509 -req -days 3650 -in caddy.csr -signkey caddy.key -out caddy.crt


# 生成Minio的证书秘钥
openssl genrsa -des3 -out minio.pass.key 2048
openssl rsa -in minio.pass.key -out minio.key
openssl req -new -key minio.key -out minio.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=minio/CN=minio.light.local"
openssl x509 -req -days 3650 -in minio.csr -signkey minio.key -out minio.crt


# 生成Keycloak的证书秘钥
openssl genrsa -des3 -out keycloak.pass.key 2048
openssl rsa -in keycloak.pass.key -out keycloak.key
openssl req -new -key keycloak.key -out keycloak.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=keycloak/CN=keycloak.light.local"
openssl x509 -req -days 3650 -in keycloak.csr -signkey keycloak.key -out keycloak.crt


# 生成Outline的证书秘钥
openssl genrsa -des3 -out outline.pass.key 2048
openssl rsa -in outline.pass.key -out outline.key
openssl req -new -key outline.key -out outline.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=outline/CN=outline.light.local"
openssl x509 -req -days 3650 -in outline.csr -signkey outline.key -out outline.crt

# ==================== Caddy ==================== 

```

Caddy 代理配置文件 `D:/docker/web/caddy/conf/Caddyfile`
```conf
# Caddy配置
caddy.light.local {
    encode zstd gzip

    tls /etc/x509/https/caddy.crt /etc/x509/https/caddy.key

    # 反代minio的9001端口
    reverse_proxy /minio/* minio.web:9001 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }

    # 反代keycloak的8080端口
    reverse_proxy /keycloak/* keycloak.web:8080 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }

    # 反代outline的3000端口
    reverse_proxy /outline/* outline.web:3000 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }

}

# Minio配置
minio.light.local {
    encode zstd gzip

    tls /etc/x509/https/minio.crt /etc/x509/https/minio.key

    # 反代minio的9001端口
    reverse_proxy minio.web:9001 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}

# Keycloak配置
keycloak.light.local {
    encode zstd gzip

    tls /etc/x509/https/keycloak.crt /etc/x509/https/keycloak.key

    # 反代keycloak的8080端口
    reverse_proxy keycloak.web:8080 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}


# Outline配置
outline.light.local {
    encode zstd gzip

    tls /etc/x509/https/outline.crt /etc/x509/https/outline.key

    header / {
        X-Content-Type-Options              nosniff
        X-Frame-Options                     "SAMEORIGIN"
        X-XSS-Protection                    "1; mode=block"
        X-Robots-Tag                        none
        X-Download-Options                  noopen
        X-Permitted-Cross-Domain-Policies   none
        Strict-Transport-Security           "max-age=31536000; includeSubDomains; preload"
        -Server
    }

    # 反代outline的3000端口
    reverse_proxy outline.web:3000 {
        header_up X-Real-IP {remote_host}
    }

}

```

### 2. Minio配置

```bash
# ==================== Minio ==================== 
# 创建文件夹
mkdir -p D:/docker/web/minio/{conf,data,logs}

# 获取默认配置文件
# 见 https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4
cat >> D:/docker/web/minio/conf/config.env << EOF
MINIO_ROOT_USER=miniouser
MINIO_ROOT_PASSWORD=miniopassword

MINIO_VOLUMES="/mnt/data"
# MINIO_SERVER_URL="http://minio.light.local:9000"
EOF

# ==================== Minio ==================== 

```

### 3. Keycloak配置

```bash
# ==================== Keycloak ==================== 
# 创建文件夹
mkdir -p D:/docker/web/keycloak/{conf,data,logs}

# ==================== Keycloak ==================== 

```


### 4. Gitlab配置

```bash
# ==================== Gitlab ==================== 
# 创建文件夹
mkdir -p D:/docker/web/gitlab/{conf,data,logs}

# ==================== Gitlab ==================== 

```

### 5. Outline配置

```bash
# ==================== Outline ==================== 
# 创建文件夹
mkdir -p D:/docker/web/outline/{conf,data,logs,data/uploads}

# ==================== Outline ==================== 

```

outline环境变量配置 `D:/docker/web/outline/outline.env`
```conf
NODE_ENV=production

# Generate a hex-encoded 32-byte random key. You should use `openssl rand -hex 32`
# in your terminal to generate a random value.
SECRET_KEY=00b5677d3ce6c106f3d95ec830f9530f9014a2620d16fe60ed867a30c4964c5e

# Generate a unique random key. The format is not important but you could still use
# `openssl rand -hex 32` in your terminal to produce this.
UTILS_SECRET=4b8235fdc01295571bd0946abb5eaf7c131f1a652386c98b658bbc4b1b4e3540

# For production point these at your databases, in development the default
# should work out of the box.
DATABASE_URL=postgres://outline:outline@pgsql.basic:5432/outline
# DATABASE_CONNECTION_POOL_MIN=
# DATABASE_CONNECTION_POOL_MAX=
# Uncomment this to disable SSL for connecting to Postgres
PGSSLMODE=disable

# For redis you can either specify an ioredis compatible url like this
REDIS_URL=redis://redis.basic:6379
# or alternatively, if you would like to provide additional connection options,
# use a base64 encoded JSON connection option object. Refer to the ioredis documentation
# for a list of available options.
# Example: Use Redis Sentinel for high availability
# {"sentinels":[{"host":"sentinel-0","port":26379},{"host":"sentinel-1","port":26379}],"name":"mymaster"}
# REDIS_URL=ioredis://eyJzZW50aW5lbHMiOlt7Imhvc3QiOiJzZW50aW5lbC0wIiwicG9ydCI6MjYzNzl9LHsiaG9zdCI6InNlbnRpbmVsLTEiLCJwb3J0IjoyNjM3OX1dLCJuYW1lIjoibXltYXN0ZXIifQ==

# URL should point to the fully qualified, publicly accessible URL. If using a
# proxy the port in URL and PORT may be different.
URL=http://outline.light.local
PORT=3000

LANGUAGE_CODE=en-us
TIME_ZONE=Asia/Shanghai

# See translate.getoutline.com for a list of available language codes and their
# percentage translated.
DEFAULT_LANGUAGE=zh_CN

# See [documentation](docs/SERVICES.md) on running a separate collaboration
# server, for normal operation this does not need to be set.
COLLABORATION_URL=

# Specify what storage system to use. Possible value is one of "s3" or "local".
# For "local", the avatar images and document attachments will be saved on local disk. 
FILE_STORAGE=local

# If "local" is configured for FILE_STORAGE above, then this sets the parent directory under
# which all attachments/images go. Make sure that the process has permissions to create
# this path and also to write files to it.
FILE_STORAGE_LOCAL_ROOT_DIR=/var/lib/outline/data

# Maximum allowed size for the uploaded attachment.
FILE_STORAGE_UPLOAD_MAX_SIZE=262144000

# Override the maximum size of document imports, generally this should be lower
# than the document attachment maximum size.
FILE_STORAGE_IMPORT_MAX_SIZE=

# Override the maximum size of workspace imports, these can be especially large
# and the files are temporary being automatically deleted after a period of time.
FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE=

#ALLOWED_DOMAINS=
FORCE_HTTPS=false

# –––––––––––––– AUTHENTICATION ––––––––––––––

# Third party signin credentials, at least ONE OF EITHER Google, Slack,
# or Microsoft is required for a working installation or you'll have no sign-in
# options.

# To configure Google auth, you'll need to create an OAuth Client ID at
# => https://console.cloud.google.com/apis/credentials
#
# When configuring the Client ID, add an Authorized redirect URI:
# https://<URL>/auth/google.callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

OIDC_CLIENT_ID=Outline
OIDC_CLIENT_SECRET=xskE0xrGXX6RoV9ltXToz6ppBgpgOBaf
OIDC_AUTH_URI=https://keycloak.light.local/realms/master
OIDC_TOKEN_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/token
OIDC_USERINFO_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/userinfo
OIDC_LOGOUT_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/logout?redirect_uri=http%3A%2F%2Foutline.light.local%2F
OIDC_DISABLE_REDIRECT=true

OIDC_DISPLAY_NAME=Keycloak OpenID
OIDC_USERNAME_CLAIM=preferred_username
OIDC_SCOPES=openid profile email

# smtp information
SMTP_HOST=
SMTP_PORT=
SMTP_FROM_EMAIL=
SMTP_REPLY_EMAIL=
SMTP_SECURE=

```

**注意**:
1. 在 Keycloak 中注册的账号必须要设置邮箱，没有邮箱的账户会验证失败
2. 使用本地文件系统时，可能不会自动创建 data/uploads 目录，导致文件上传失败，可以手动创建该目录

## Docker Compose定义脚本

```yaml
version: "3"

services:
  caddy:
    image: caddy:2.8
    container_name: web_caddy
    hostname: caddy.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.150
        aliases:
          - caddy.web
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - caddy.web:172.100.0.150
      - keycloak.web:172.100.0.152
      - minio.web:172.100.0.154
      - gitlab.web:172.100.0.156
      - outline.web:172.100.0.158
    cap_add:
      - NET_ADMIN
    ports:
      - 80:80
      - 443:443
      - 443:443/udp
      - 2019:2019
    expose:
      - 80
      - 443
      - 2019
    volumes:
      - //d/docker/web/caddy/cert/:/etc/x509/https/
      - //d/docker/web/caddy/site:/srv
      - //d/docker/web/caddy/conf:/config
      - //d/docker/web/caddy/data:/data
    entrypoint: /usr/bin/caddy run --adapter caddyfile --config /config/Caddyfile
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: web_keycloak
    hostname: keycloak.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.152
        aliases:
          - keycloak.web
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - caddy.web:172.100.0.150
      - keycloak.web:172.100.0.152
      - minio.web:172.100.0.154
      - gitlab.web:172.100.0.156
      - outline.web:172.100.0.158
    ports:
      - 8080:8080
    expose:
      - 8080
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://pgsql.basic:5432/keycloak
      KC_DB_USER: keycloak
      KC_DB_SCHEMA: public
      KC_DB_PASSWORD: keycloak
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      # 外部访问使用的域名端口信息，与 KC_HOSTNAME_URL 二选一
      # KC_HOSTNAME: keycloak.light.local
      # KC_HOSTNAME_PORT: 443
      
      # 外部访问使用的域名地址，解决初始化403问题
      KC_HOSTNAME_URL: https://keycloak.light.local
      KC_HOSTNAME_ADMIN_URL: https://keycloak.light.local
      
      # 配置上下文地址
      # KEYCLOAK_FRONTEND_URL: https://keycloak.light.local/auth 
      # KC_HTTP_RELATIVE_PATH: /auth
      
      # 禁用HTTPS
      # KC_HOSTNAME_STRICT: false
      # KC_HOSTNAME_STRICT_HTTPS: false
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      # PROXY_ADDRESS_FORWARDING: true
    command: start --spi-login-protocol-openid-connect-legacy-logout-redirect-uri=true
    restart: unless-stopped
    # depends_on:
    #   - postgres

  minio:
    image: minio/minio:RELEASE.2023-05-18T00-05-36Z
    container_name: web_minio
    hostname: minio.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.154
        aliases:
          - minio.web
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - caddy.web:172.100.0.150
      - keycloak.web:172.100.0.152
      - minio.web:172.100.0.154
      - gitlab.web:172.100.0.156
      - outline.web:172.100.0.158
    ports:
      - 9000:9000
      - 9001:9001
    expose:
      - 9000
      - 9001
    volumes:
      - //d/docker/web/minio/data:/mnt/data
      - //d/docker/web/minio/conf/config.env:/etc/minio/config.env
    environment:
      MINIO_CONFIG_ENV_FILE: /etc/minio/config.env
    command: ['server', '/data', '--address', ':9000', '--console-address', ':9001']
    restart: unless-stopped

  # gitlab:

  outline:
    image: docker.getoutline.com/outlinewiki/outline:latest
    container_name: web_outline
    hostname: outline.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.158
        aliases:
          - outline.web
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - caddy.web:172.100.0.150
      - keycloak.web:172.100.0.152
      - minio.web:172.100.0.154
      - gitlab.web:172.100.0.156
      - outline.web:172.100.0.158
    ports:
      - 3000:3000
    expose:
      - 3000
    volumes:
      - //d/docker/web/outline/data:/var/lib/outline/data
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: "0"
    command: sh -c "yarn start --env production-ssl-disabled"
    env_file: ./outline.env
    # depends_on:
    #   - postgres
    #   - redis

networks:
  develop:
    external: true
  proxy-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.77.0.0/16

# volumes:
#   caddy_data:
#   minio_data:

```

## 程序启动命令
```bash
docker compose -f web.yaml -p web up -d

docker compose -f web.yaml -p web down

```
