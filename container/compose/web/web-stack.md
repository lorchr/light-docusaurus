
## 环境准备脚本

### 1. 生成泛域名证书

#### 1. 生成ROOT CA证书
```bash
# 创建证书目录：/root/cert，进入/root/cert 创建 ca.key，密码 123456
openssl genrsa -des3 -out ca.key 2048

# 使用生成的密钥(ca.key)来创建新的根SSL证书。并将其保存为 ca.pem，证书有效期为10年
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 这一行是把 pem 转换成 crt 格式
openssl x509 -outform der -in ca.pem -out ca.crt

```

输出结果
```bash
# 需要输入密码，下面生成 pem 会用到
light@TP862:~/cert$ openssl genrsa -des3 -out ca.key 2048
Enter PEM pass phrase:123456
Verifying - Enter PEM pass phrase:123456

# 提示填写的字段大多都可以直接回车过就行了，只要Common Name字段需要填写内容，这是生成跟证书后导入到系统的证书名称，我填的是light
light@TP862:~/cert$ openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem
Enter pass phrase for ca.key:123456
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Hubei
Locality Name (eg, city) []:Wuhan
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Torch
Organizational Unit Name (eg, section) []:develop
Common Name (e.g. server FQDN or YOUR name) []:light
Email Address []:light@torch.local

```

#### 2. 生产域名证书

```bash
# 创建生成域名ssl证书的前置文件
cat >> caddy.light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = caddy.light.local
EOF

# 生成域名ssl证书秘钥
openssl req -new -sha256 -nodes -out caddy.light.local.csr -newkey rsa:2048 -keyout caddy.light.local.key

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -new -sha256 -nodes -out  caddy.light.local.csr -newkey rsa:2048 -keyout  caddy.light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in  caddy.light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out  caddy.light.local.crt -days 3650 -sha256 -extfile caddy.light.local.ext


# 创建生成域名ssl证书的前置文件
cat >> keycloak.light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = keycloak.light.local
EOF

# 生成域名ssl证书秘钥
# 可以替换为下面格式，不需要输入信息确认，记录CN即可
openssl req -new -sha256 -nodes -out  keycloak.light.local.csr -newkey rsa:2048 -keyout  keycloak.light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in  keycloak.light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out  keycloak.light.local.crt -days 3650 -sha256 -extfile keycloak.light.local.ext

```

#### 3. 生产泛域名证书

```bash
# 创建生成域名ssl证书的前置文件
cat >> light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = *.light.local
EOF

# 生成域名ssl证书秘钥
openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out light.local.crt -days 3650 -sha256 -extfile light.local.ext

```

输出结果
```bash
light@TP862:~/cert$ openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Hubei
Locality Name (eg, city) []:Wuhan
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Torch
Organizational Unit Name (eg, section) []:develop
Common Name (e.g. server FQDN or YOUR name) []:light
Email Address []:light@torch.local

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:123456
An optional company name []:light


light@TP862:~/cert$ openssl x509 -req -in light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out light.local.crt -days 3650 -sha256 -extfile light.local.ext
Certificate request self-signature ok
subject=C = CN, ST = Hubei, L = Wuhan, O = Torch, OU = develop, CN = light, emailAddress = light@torch.local
Enter pass phrase for ca.key:123456
```

### 2. Caddy配置
- [Caddy](https://caddyserver.com/)
- [Caddy Github](https://github.com/caddyserver/caddy)

生成的证书私钥需要放到目录 `D:/docker/develop/web/caddy/cert`
```bash
# ==================== Caddy ====================
# 创建文件夹
mkdir -p D:/docker/develop/web/caddy/{conf,data,logs,site,cert}

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

Caddy 代理配置文件 `D:/docker/develop/web/caddy/conf/Caddyfile`
```conf
cat >> D:/docker/develop/web/caddy/conf/Caddyfile << EOF

# Caddy配置
caddy.light.local {
    encode zstd gzip

    tls /etc/x509/https/light.local.crt /etc/x509/https/light.local.key

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

    tls /etc/x509/https/light.local.crt /etc/x509/https/light.local.key

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

    tls /etc/x509/https/light.local.crt /etc/x509/https/light.local.key

    # 反代keycloak的8080端口
    reverse_proxy keycloak.web:8080 {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}

# Gitlab配置
gitlab.light.local {
    encode zstd gzip

    tls /etc/x509/https/light.local.crt /etc/x509/https/light.local.key

    # 反代Gitlab的80 443端口
    # reverse_proxy https://gitlab.web {
    reverse_proxy gitlab.web {
        header_up   X-Forwarded-Proto           {http.request.scheme}
        header_up   X-Forwarded-Host            {http.request.host}
        header_up   Host                        {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}

# Outline配置
outline.light.local {
    encode zstd gzip

    tls /etc/x509/https/light.local.crt /etc/x509/https/light.local.key

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

EOF

```

### 3. Minio配置

#### 使用本地认证的配置
```bash
# ==================== Minio ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/minio/{conf,data,logs}

# 获取默认配置文件
# 见 https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4
cat >> D:/docker/develop/web/minio/conf/config.env << EOF
MINIO_ROOT_USER=miniouser
MINIO_ROOT_PASSWORD=miniopassword

MINIO_VOLUMES="/mnt/data"
# MINIO_SERVER_URL="http://minio.light.local:9000"
EOF

# ==================== Minio ==================== 

```

#### 使用Keycloak认证的配置
```bash
cat >> D:/docker/develop/web/minio/conf/config.env << EOF
MINIO_VOLUMES="/mnt/data"
# MINIO_SERVER_URL=https://minio.light.local:9000

MINIO_IDENTITY_OPENID_SCOPES="openid,profile,email"
MINIO_IDENTITY_OPENID_CLIENT_ID="Minio"
MINIO_IDENTITY_OPENID_CLIENT_SECRET="QQO0uOF9w9XAx8BW8JGMR9fdIEXYAwuy"
MINIO_BROWSER_REDIRECT_URL=https://minio.light.local
MINIO_IDENTITY_OPENID_CONFIG_URL=https://keycloak.light.local/realms/master/.well-known/openid-configuration
MINIO_ROOT_USER=minio-admin
MINIO_ROOT_PASSWORD=minio-admin
EOF

```

### 4. Keycloak配置

```bash
# ==================== Keycloak ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/keycloak/{conf,data,logs}

# ==================== Keycloak ==================== 

```

### 5. Gitlab配置

```bash
# ==================== Gitlab ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/gitlab/{conf,data,logs}

# 查看初始密码
cat /etc/gitlab/initial_root_password

# ==================== Gitlab ==================== 

```

### 5. Jenkins配置

```bash
# ==================== Jenkins ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/jenkins/{conf,data,logs}

# ==================== Jenkins ==================== 

```

### 5. SonarQube配置

```bash
# ==================== SonarQube ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/sonarqube/{conf,data,logs,extensions}

# ==================== SonarQube ==================== 

```

### 6. Outline配置

```bash
# ==================== Outline ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/outline/{conf,data,logs,data/uploads}

# 初始化配置文件
cat >> D:/docker/develop/web/outline/outline.env << 'EOF'
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
OIDC_LOGOUT_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/logout?redirect_uri=https%3A%2F%2Foutline.light.local%2F
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

EOF

# ==================== Outline ==================== 

```

outline环境变量配置 `D:/docker/develop/web/outline/outline.env`
```conf
cat >> D:/docker/develop/web/outline/outline.env
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
OIDC_CLIENT_SECRET=twKvRwFbaocqchHv2QeEyUhJZ9edyver
OIDC_AUTH_URI=https://keycloak.light.local/realms/master
OIDC_TOKEN_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/token
OIDC_USERINFO_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/userinfo
OIDC_LOGOUT_URI=https://keycloak.light.local/realms/master/protocol/openid-connect/logout?redirect_uri=https%3A%2F%2Foutline.light.local%2F
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

| 服务      | 端口            | 暴露 | 功能     |
| --------- | --------------- | ---- | -------- |
| Bind      | 10000/tcp       | 是   | 管理     |
| Bind      | 53/tcp 53/udp   | 是   | DNS      |
| Caddy     | 80/tcp          | 是   | HTTP     |
| Caddy     | 443/tcp 443/udp | 是   | HTTPS    |
| Caddy     | 2019/tcp        | -    | 管理     |
| KeyCloak  | 8080/tcp        | -    | 应用入口 |
| Minio     | 9000/tcp        | -    | 管理     |
| Minio     | 9001/tcp        | -    | 预览链接 |
| Outline   | 3000/tcp        | -    | 应用入口 |
| Gitlab    | 30080/tcp       | -    | 应用入口 |
| Gitlab    | 443/tcp         | -    | HTTPS    |
| Gitlab    | 22/tcp          | -    | SSH      |
| Jenkins   | 8080/tcp        | -    | 应用入口 |
| Jenkins   | 5000/tcp        | -    | 应用入口 |
| SonarQube | 9000/tcp        | -    | 应用入口 |

```yaml
version: "3"

services:
  bind:
    image: sameersbn/bind:9.16.1-20200524
    container_name: web_bind
    hostname: bind.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.200
        aliases:
          - bind.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    ports:
      - 10000:10000/tcp
      - 53:53/tcp
      - 53:53/udp
    expose:
      - 10000
      - 53
    volumes:
      - //d/docker/develop/web/dns/data:/data
    environment:
      TZ : 'Asia/Shanghai'
      ROOT_PASSWORD: lightdns
      WEBMIN_ENABLED: true      
      WEBMIN_INIT_SSL_ENABLED: true
    restart: unless-stopped
  
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
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
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
      - //d/docker/develop/web/caddy/cert/:/etc/x509/https/
      - //d/docker/develop/web/caddy/site:/srv
      - //d/docker/develop/web/caddy/conf:/config
      - //d/docker/develop/web/caddy/data:/data
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
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 8080:8080
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
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 9000:9000
    #   - 9001:9001
    expose:
      - 9000
      - 9001
    volumes:
      - //d/docker/develop/web/minio/data:/mnt/data
      - //d/docker/develop/web/minio/conf/config.env:/etc/minio/config.env
    environment:
      MINIO_CONFIG_ENV_FILE: /etc/minio/config.env
    command: ['server', '/data', '--address', ':9000', '--console-address', ':9001']
    restart: unless-stopped

  gitlab:
    image: gitlab/gitlab-ce:17.1.6-ce.0
    privileged: true
    container_name: web_gitlab
    hostname: gitlab.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.156
        aliases:
          - gitlab.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 80:80 # 注意宿主机和容器内部的端口要一致，否则external_url无法访问
    #   - 443:443
    #   - 22:22
    expose:
      - 80
      - 443
      - 22
    environment:
      TZ: Asia/Shanghai
      GITLAB_ROOT_PASSWORD: nJAfvWGS4q1Tw09h=
      GITLAB_OMNIBUS_CONFIG: |
        gitlab_rails['time_zone'] = 'Asia/Shanghai'
        ### Configure SSL
        ### https://docs.gitlab.com/omnibus/settings/ssl/#configure-https-manually
        external_url 'http://gitlab.light.local'
        # registry_external_url 'http://gitlab.light.local'
        # letsencrypt['enable'] = false
        # nginx['redirect_http_to_https'] = true
        # nginx['ssl_certificate'] = "/etc/gitlab/ssl/light.local.crt"
        # nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/light.local.key"
        # nginx['ssl_trusted_certificate'] = "/etc/gitlab/ssl/ca.crt"
        
        ### GitLab database settings
        ###! Docs: https://docs.gitlab.com/omnibus/settings/database.html
        ###! **Only needed if you use an external database.**
        postgresql['enable'] = false
        gitlab_rails['db_adapter'] = "postgresql"
        gitlab_rails['db_encoding'] = "utf-8"
        # gitlab_rails['db_collation'] = nil
        gitlab_rails['db_database'] = "gitlab"
        gitlab_rails['db_username'] = "gitlab"
        gitlab_rails['db_password'] = "gitlab"
        gitlab_rails['db_host'] = "pgsql.basic"
        gitlab_rails['db_port'] = 5432
        gitlab_rails['db_pool'] = 100

        ### Configuring Redis
        ### https://docs.gitlab.com/omnibus/settings/redis.html
        # Disable the bundled Redis
        redis['enable'] = false
        # Redis via TCP
        gitlab_rails['redis_host'] = 'redis.basic'
        gitlab_rails['redis_port'] = 6379
        # Password to Authenticate to alternate local Redis if required
        # gitlab_rails['redis_password'] = ''
        
        ### Configure Authenticaiton
        ### Use keyCloak
        ### https://docs.gitlab.com/ee/administration/auth/oidc.html#configure-keycloak
        gitlab_rails['omniauth_providers'] = [
          {
            name: "openid_connect", # do not change this parameter
            label: "Keycloak", # optional label for login button, defaults to "Openid Connect"
            args: {
              name: "openid_connect",
              scope: ["openid", "profile", "email"],
              response_type: "code",
              issuer:  "https://keycloak.light.local/realms/master",
              client_auth_method: "query",
              discovery: true,
              uid_field: "preferred_username",
              pkce: true,
              client_options: {
                identifier: "Gitlab",
                secret: "5e1b5P0QhYHcWh2gyXutXalrTyEQGzrG",
                redirect_uri: "https://gitlab.light.local/users/auth/openid_connect/callback"
              }
            }
          }
        ]
    volumes:
      - //d/docker/develop/web/gitlab/conf:/etc/gitlab
      - //d/docker/develop/web/gitlab/logs:/var/log/gitlab
      - //d/docker/develop/web/gitlab/data:/var/opt/gitlab
    shm_size: '256m'
    restart: unless-stopped
    # depends_on:
    #   - postgres

  jenkins:
    image: jenkins/jenkins:jdk21
    container_name: web_jenkins
    hostname: jenkins.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.160
        aliases:
          - jenkins.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 8080:8080
    #   - 5000:5000
    expose:
      - 8080
      - 5000
    user: root
    volumes:
      - //d/docker/develop/web/jenkins/data/:/var/jenkins_home
    restart: unless-stopped

  sonarqube:
    image: sonarqube:lts
    container_name: web_sonarqube
    hostname: sonarqube.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.162
        aliases:
          - sonarqube.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 9000:9000
    expose:
      - 9000
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://pgsql.basic:5432/sonar
      - SONAR_JDBC_USERNAME=sonar
      - SONAR_JDBC_PASSWORD=sonar
    volumes:
      - //d/docker/develop/web/sonarqube/conf:/opt/sonarqube/conf
      - //d/docker/develop/web/sonarqube/data:/opt/sonarqube/data
      - //d/docker/develop/web/sonarqube/extensions:/opt/sonarqube/extensions
    restart: no
    # depends_on:
    #   - postgres

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
    dns:
      - 192.168.137.1
      - 8.8.8.8
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
      - bind.web:172.100.0.200
    # ports:
    #   - 3000:3000
    expose:
      - 3000
    volumes:
      - //d/docker/develop/web/outline/data:/var/lib/outline/data
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: "0"
    command: sh -c "sleep 60 && yarn start --env production-ssl-disabled"
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

## 启动后配置

### 1. Bind DNS配置
1. 点击 Webmin - Change Language and theme，更换语言为中文
2. 点击 Servers - Bind DNS Server - 现有 DNS 区域 - 创建主区域
   1. 域名 / 网络 light.local
   2. 主服务器	  localhost
   3. Email 地址  light@light.local
3. 点击 Servers - Bind DNS Server - 现有 DNS 区域 - light.local - 地址
   1. 名称  light.local
   2. 地址  192.168.125.3 物理机网卡的地址
   3. 名称  *.light.local
   4. 地址  192.168.125.3 物理机网卡的地址
4. 修改物理机的DNS地址
   1. 192.168.125.3
   2. 114.114.114.114
5. 检查配置是否成功 ping light.local


### 2. KeyCloak配置

#### 配置Minio认证

Client ID: Minio
Client authentication: ON
Client Secret: QQO0uOF9w9XAx8BW8JGMR9fdIEXYAwuy

1. Root URL: 
   - https://minio.light.local/
2. Home URL: 
   - https://minio.light.local
3. Valid redirect URIs: 
   - https://minio.light.local/*
4. Valid post logout redirect URIs 
   - https://minio.light.local/
5. Web origins 
   - https://minio.light.local
6. Admin URL: 
   - https://minio.light.local

#### 配置Gitlab认证

Client ID: Gitlab
Client authentication: ON
Client Secret: 5e1b5P0QhYHcWh2gyXutXalrTyEQGzrG

1. Root URL: 
   - https://gitlab.light.local/
2. Home URL: 
   - https://gitlab.light.local
3. Valid redirect URIs: 
   - https://gitlab.light.local/*
   - https://gitlab.light.local/users/auth/openid_connect/callback
4. Valid post logout redirect URIs 
   - https://gitlab.light.local/
5. Web origins 
   - https://gitlab.light.local
6. Admin URL: 
   - https://gitlab.light.local


#### 配置Outline认证

Client ID: Outline
Client authentication: ON
Client Secret: twKvRwFbaocqchHv2QeEyUhJZ9edyver

1. Root URL: 
   - https://outline.light.local/
2. Home URL: 
   - https://outline.light.local
3. Valid redirect URIs: 
   - https://outline.light.local/*
   - https://outline.light.local/auth/oidc
   - https://outline.light.local/auth/oidc.callback
4. Valid post logout redirect URIs 
   - https://outline.light.local/
5. Web origins 
   - https://outline.light.local
6. Admin URL: 
   - https://outline.light.local

### 3. Gitlab配置

#### SSL CA证书配置
- https://docs.gitlab.com/omnibus/settings/ssl/#configure-https-manually
- https://docs.gitlab.com/ee/administration/auth/oidc.html#configure-keycloak

集成KeyCloak认证必须使用HTTPS，但自签名的证书 Gitlab 无法识别，需要将CA证书安装到 Gitlab 容器

1. 将预先生成的CA证书、KeyCloak证书放到，配置目录 `D:/docker/develop/web/gitlab/conf`
2. 将CA证书复制到 `/etc/gitlab/ssl/trusted-certs` `/usr/local/share/ca-certificates/` `/opt/gitlab/embedded/ssl/certs`

```bash
# 【无效】 复制 ca.crt 到信任证书目录
cp /etc/gitlab/ssl/ca.crt /etc/gitlab/trusted-certs/ca.crt

# 【有效】 复制 ca.pem 到信任证书目录，注意： 目标文件名称必须为 cacert.pem
cat /etc/gitlab/ssl/ca.pem >> /opt/gitlab/embedded/ssl/certs/cacert.pem

# 【无效】 复制 ca.pem 到待安装证书目录
cp /etc/gitlab/ssl/ca.pem /usr/local/share/ca-certificates/rootCA.crt

```

3. 安装CA证书

```bash
# 查看已安装CA证书
ll /etc/ssl/certs/

# 需要先安装 ca-certificates
# apt install ca-certificates

update-ca-certificates

# 查看已安装CA证书
cat /etc/ssl/certs/ca-certificates.crt

```

4. 测试结果

```bash
# 查看证书
openssl x509 -in /usr/local/share/ca-certificates/ca.crt -text -noout

# 测试
curl -v -I -H GET https://jd.com
curl -v -I -H GET https://keycloak.light.local

```
   - [Solution] https://www.cnblogs.com/bfmq/p/15917975.html
   - [Solution] https://gitlab.com/gitlab-org/gitlab/-/issues/344077
   - https://gitlab.com/gitlab-org/gitlab/-/issues/196193
   - https://docs.gitlab.com/omnibus/settings/ssl.html#other-certificate-authorities
   - https://forum.gitlab.com/t/500-error-after-keycloak-login-certificate-verify-failed-unable-to-get-local-issuer-certificate/49065
   - https://forum.gitlab.com/t/openssl-sslerror-ssl-connect-returned-1-errno-0-state-error-certificate-verify-failed-unable-to-get-local-issuer-certificate/48845

5. 删除CA证书

```bash
rm /usr/local/share/ca-certificates/ca.crt

update-ca-certificates --fresh

```
## 常见问题
1. Outline 登录失败

   - 可以检查是否本机开启了代理，使用 `apt update` 不报错 `connecting to 127.0.0.1:4780` 字样即可

2. Gitlab Root用户创建失败（可以在数据库查看users表）

   - 一般是密码包含不识别的特殊字符，建议使用 数字 大小写字母 = 等符号，不要使用@ # & $等符号


