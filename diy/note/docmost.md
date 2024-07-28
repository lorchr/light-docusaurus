
# Docmost QuickStart

## 编写 Docker Compose 配置文件 `docmost.yaml`

```yaml
version: "3"

services:
  docmost:
    image: docmost/docmost:latest
    container_name: docmost
    networks:
      - default
      - develop
    ports:
      - 3000:3000
    expose:
      - 3000
    restart: unless-stopped
    volumes:
      - docmost_data:/app/data/storage
    environment:
      APP_URL: http://localhost:3000
      # APP_URL: https://docmost.light.selfhost.com
      APP_SECRET: random_long_secret
      DATABASE_URL: postgresql://docmost:STRONG_DB_PASSWORD@postgres:5432/docmost?schema=public
      REDIS_URL: redis://redis:6379

      # Only if you need multi user:
      # MAIL_DRIVER: smtp
      # SMTP_HOST: smtp.gmail.com
      # SMTP_PORT: 465
      # SMTP_USERNAME: YOUR_EMAIL
      # SMTP_PASSWORD: app-password
      # MAIL_FROM_ADDRESS: YOUR_EMAIL
      # MAIL_FROM_NAME: Docmost
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15.3
    container_name: docmost_postgres
    environment:
      POSTGRES_DB: docmost
      POSTGRES_USER: docmost
      POSTGRES_PASSWORD: STRONG_DB_PASSWORD
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6.2
    container_name: docmost_redis
    restart: unless-stopped
    volumes:
      - redis_data:/data

networks:
  develop:
    external: true

volumes:
  docmost_data:
  postgres_data:
  redis_data:

```

## 启动程序

```bash
docker compose -f docmost.yaml -p docmost up -d

docker compose -f docmost.yaml -p docmost down

```

- `-f` `--file` 指定 docker-compose `docmost.yaml` 脚本文件
- `-p`  `--project` 指定项目名称 `docmost`
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
