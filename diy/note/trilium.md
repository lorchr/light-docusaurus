
# Trilium QuickStart

## 编写 Docker Compose 配置文件 `trilium.yaml`

```yaml
version: "3"

services:
  trilium:
    image: zadam/trilium
    restart: unless-stopped
    ports:
      - 8080:8080
    networks:
      - default
      - develop
    environment:
      - TRILIUM_DATA_DIR=/home/node/trilium-data
    expose:
      - 8080
    volumes:
      - trilium_data:/home/node/trilium-data

networks:
  develop:
    external: true

volumes:
  trilium_data:

```

## 启动程序

```bash
docker compose -f trilium.yaml -p trilium up -d

docker compose -f trilium.yaml -p trilium down

```

- `-f` `--file` 指定 docker-compose `trilium.yaml` 脚本文件
- `-p`  `--project` 指定项目名称 `trilium`
- `up` 启动程序
- `down` 停止程序
- `-d` 以守护进程在后台运行

## 访问地址
- [Dashboard](http://localhost:8080)

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
