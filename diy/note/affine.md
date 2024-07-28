
# Affine QuickStart

## 编写 Docker Compose 配置文件 `affine.yaml`

```yaml
version: "3"

services:
  affine:
    image: ghcr.io/toeverything/affine-graphql:stable
    container_name: affine
    command:
      ["sh", "-c", "node ./scripts/self-host-predeploy && node ./dist/index.js"]
    networks:
      - default
      - develop
    ports:
      - 3010:3010
    expose:
      - 3010
    depends_on:
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy
    volumes:
      # custom configurations
      - affine_conf:/root/.affine/config
      # blob storage
      - affine_data:/root/.affine/storage
    restart: unless-stopped
    environment:
      - NODE_OPTIONS="--import=./scripts/register.js"
      - AFFINE_CONFIG_PATH=/root/.affine/config
      - REDIS_SERVER_HOST=redis
      - DATABASE_URL=postgres://affine:affine@postgres:5432/affine
      - NODE_ENV=production
      - AFFINE_ADMIN_EMAIL=admin@163.com
      - AFFINE_ADMIN_PASSWORD=admin123
      - AFFINE_SERVER_HOST=affine.light.salfhost.com

      # only if you need multi users
      # - MAILER_HOST=smtp.gmail.com
      # - MAILER_SECURE=true
      # - MAILER_PORT=465
      # - MAILER_USER=YOUR_EMAIL_ADDRESS
      # - MAILER_SENDER=YOUR_EMAIL_ADDRESS
      # - MAILER_PASSWORD=app-password

  postgres:
    image: postgres:15.3
    container_name: affine_postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U affine"]
      interval: 10s
      timeout: 5s
      retries: 5
    environment:
      POSTGRES_USER: affine
      POSTGRES_PASSWORD: affine
      POSTGRES_DB: affine
      PGDATA: /var/lib/postgresql/data/pgdata

  redis:
    image: redis:6.2
    container_name: affine_redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  develop:
    external: true

volumes:
  affine_conf:
  affine_data:
  redis_data:
  postgres_data:

```

## 启动程序

```bash
docker compose -f affine.yaml -p affine up -d

docker compose -f affine.yaml -p affine down

```

- `-f` `--file` 指定 docker-compose `affine.yaml` 脚本文件
- `-p`  `--project` 指定项目名称 `affine`
- `up` 启动程序
- `down` 停止程序
- `-d` 以守护进程在后台运行

## 访问地址
- [Dashboard](http://localhost:3010)

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
