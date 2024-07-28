# Outline QuickStart
- [安装文档](https://docs.getoutline.com/s/hosting/)

## 编写 Docker Compose 配置文件 `outline.yaml`

```yaml
version: "3"

services:
  outline:
    image: docker.getoutline.com/outlinewiki/outline:latest
    env_file: ./outline.env
    networks:
      - default
      - develop
    ports:
      - 3000:3000
    expose:
      - 3000
    volumes:
      - outline-data:/var/lib/outline/data
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15.3
    env_file: ./outline.env
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: "outline"
      POSTGRES_PASSWORD: "strong_password"
      POSTGRES_DB: "outline"

  redis:
    image: redis:6.2
    env_file: ./outline.env

networks:
  develop:
    external: true

volumes:
  outline-data:
  postgres-data:

```

## 编写环境变量文件
```env
NODE_ENV=production

# Generate a hex-encoded 32-byte random key. You should use `openssl rand -hex 32`
# in your terminal to generate a random value.
SECRET_KEY=00b5677d3ce6c106f3d95ec830f9530f9014a2620d16fe60ed867a30c4964c5e

# Generate a unique random key. The format is not important but you could still use
# `openssl rand -hex 32` in your terminal to produce this.
UTILS_SECRET=4b8235fdc01295571bd0946abb5eaf7c131f1a652386c98b658bbc4b1b4e3540

# For production point these at your databases, in development the default
# should work out of the box.
DATABASE_URL=postgres://outline:outline@pgsql.light.local:5432/outline
# DATABASE_CONNECTION_POOL_MIN=
# DATABASE_CONNECTION_POOL_MAX=
# Uncomment this to disable SSL for connecting to Postgres
PGSSLMODE=disable

# For redis you can either specify an ioredis compatible url like this
REDIS_URL=redis://redis.light.local:6379
# or alternatively, if you would like to provide additional connection options,
# use a base64 encoded JSON connection option object. Refer to the ioredis documentation
# for a list of available options.
# Example: Use Redis Sentinel for high availability
# {"sentinels":[{"host":"sentinel-0","port":26379},{"host":"sentinel-1","port":26379}],"name":"mymaster"}
# REDIS_URL=ioredis://eyJzZW50aW5lbHMiOlt7Imhvc3QiOiJzZW50aW5lbC0wIiwicG9ydCI6MjYzNzl9LHsiaG9zdCI6InNlbnRpbmVsLTEiLCJwb3J0IjoyNjM3OX1dLCJuYW1lIjoibXltYXN0ZXIifQ==

# URL should point to the fully qualified, publicly accessible URL. If using a
# proxy the port in URL and PORT may be different.
URL=http://outline.light.local:3000
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
OIDC_CLIENT_SECRET=96FtOgb8VCrJuIVaZLxvCC1LFwBZr0QH
OIDC_AUTH_URI=http://keycloak.light.local:3679/realms/master
OIDC_TOKEN_URI=http://keycloak.light.local:3679/realms/master/protocol/openid-connect/token
OIDC_USERINFO_URI=http://keycloak.light.local:3679/realms/master/protocol/openid-connect/userinfo
OIDC_LOGOUT_URI=http://keycloak.light.local:3679/realms/master/protocol/openid-connect/logout?redirect_uri=http%3A%2F%2Foutline.light.local%2F
OIDC_DISABLE_REDIRECT=true

OIDC_DISPLAY_NAME=OpenID
OIDC_USERNAME_CLAIM=preferred_username
OIDC_SCOPES=openid profile email

# smtp information
SMTP_HOST=
SMTP_PORT=
SMTP_FROM_EMAIL=
SMTP_REPLY_EMAIL=
SMTP_SECURE=
```


## 启动程序

```bash
docker compose -f outline.yaml -p outline up -d

docker compose -f outline.yaml -p outline down

```

- `-f` `--file` 指定 docker-compose `outline.yaml` 脚本文件
- `-p`  `--project` 指定项目名称 `outline`
- `up` 启动程序
- `down` 停止程序
- `-d` 以守护进程在后台运行

## 访问地址
- [Dashboard](http://localhost:3000)

## 初步体验
| 特性 | Affine      | BookStack | Docmost     | Outline              | Trilium |
| ---- | ----------- | --------- | ----------- | -------------------- | ------- |
| 部署 | 简单        | 简单      | 简单        | 复杂                 | 简单    |
| 依赖 | 数据库 缓存 | 数据库    | 数据库 缓存 | OIDC认证 数据库 缓存 | 无      |
| 界面 | 臃肿        | 简洁      | 简洁        | 简洁                 | 简洁    |
| 笔记 | 流畅        | 流畅      | 流畅        | 流畅                 | 繁琐    |
| 图片 | 流畅        | 流畅      | 流畅        | 流畅                 | 繁琐    |
| 绘图 | 支持        | 不支持    | 不支持      | 不支持               | 不支持  |
| 导出 | 流畅        | 图片缺失  | 报错        | 流畅                 | 有BUG   |
| 模板 | 不支持      | 支持      | 不支持      | 支持                 | 支持    |
| 保存 | 自动        | 手动      | 自动        | 自动                 | 自动    |
| 搜索 | 支持        | 支持      | 支持        | 支持                 | 支持    |
| 协作 | 实时        | 多用户    | 实时        | 实时                 | 不支持  |
