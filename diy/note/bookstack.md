
# BookStack QuickStart

## 编写 Docker Compose 配置文件 `bookstack.yaml`

```yaml
version: "3"

services:
  bookstack:
    image: lscr.io/linuxserver/bookstack
    container_name: bookstack
    networks:
      - default
      - develop
    ports:
      - 3080:80
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - APP_URL=http://localhost:3080
      # - APP_URL: https://bookstack.light.selfhost.com
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=bookstack
      - DB_PASS=strong_password
      - DB_DATABASE=bookstackapp
    volumes:
      - bookstack_data:/config
    expose:
      - 80
    restart: unless-stopped
    depends_on:
      - mariadb

  mariadb:
    image: lscr.io/linuxserver/mariadb
    container_name: bookstack_mariadb
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
      - MYSQL_ROOT_PASSWORD=strong_root_password
      - MYSQL_DATABASE=bookstackapp
      - MYSQL_USER=bookstack
      - MYSQL_PASSWORD=strong_password
    volumes:
      - mariadb_data:/config
    restart: unless-stopped


networks:
  develop:
    external: true

volumes:
  bookstack_data:
  mariadb_data:

```

## 启动程序

```bash
docker compose -f bookstack.yaml -p bookstack up -d

docker compose -f bookstack.yaml -p bookstack down

```

- `-f` `--file` 指定 docker-compose `bookstack.yaml` 脚本文件
- `-p`  `--project` 指定项目名称 `bookstack`
- `up` 启动程序
- `down` 停止程序
- `-d` 以守护进程在后台运行

## 访问地址
- [Dashboard](http://localhost:3080)
  - admin@admin.com / password

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


