- [Offical](https://nginx.org/)
- [Offical Document](https://nginx.org/en/docs/)
- [Docker](https://hub.docker.com/_/nginx)

- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Nginx Proxy ManagerGithub](https://github.com/jc21/nginx-proxy-manager)
- [Nginx Proxy Manager Docker](https://hub.docker.com/r/jc21/nginx-proxy-manager)

## 1. Docker安装 Nginx
```shell
# 运行容器
docker run -d \
  --publish 10080:80 \
  --publish 10443:443 \
  --volume //d/docker/nginx/data:/data \
  --volume //d/docker/nginx/conf:/etc/nginx/nginx.d \
  --net dev \
  --restart=no \
  --name nginx \
  nginx:1.25.1
```

## 2. Docker安装 NPM
```shell
# 运行容器
docker run -d \
  --publish 10080:80 \
  --publish 10081:81 \
  --publish 10443:443 \
  --volume //d/docker/npm/conf/config.json:/app/config/production.json \
  --net dev \
  --restart=no \
  --name nginx-proxy-manager \
  jc21/nginx-proxy-manager:latest

docker run -d \
  --publish 10080:80 \
  --publish 10081:81 \
  --publish 10443:443 \
  --volume //d/docker/npm/data:/data \
  --volume //d/docker/npm/conf/encrypt:/etc/letsencrypt \
  --volume //d/docker/npm/conf/config.json:/app/config/production.json \
  --net dev \
  --restart=no \
  --name nginx-proxy-manager \
  jc21/nginx-proxy-manager:latest
```

[Dashboard](http://localhost:10081)
- Account
  - admin@example.com/ changeme
  - lorch@npm.com / 12345678

## 参考
- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Docker Docs](https://docs.docker.com/)
- [Portainer](https://www.portainer.io/)
- [Compose specification - Docker](https://docs.docker.com/compose/compose-file/)
- [Docker Engine installation overview](https://docs.docker.com/engine/install/)
- [portainer-ce 中文版](https://hub.docker.com/r/6053537/portainer-ce)
- [在线 nginx 配置生成工具和 nginx 配置 UI 管理工具](https://sirliu.github.io/2021/8/%E5%9C%A8%E7%BA%BFnginx%E9%85%8D%E7%BD%AE%E7%94%9F%E6%88%90%E5%B7%A5%E5%85%B7%E5%92%8Cnginx%E9%85%8D%E7%BD%AEUI%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7/)
- [Docker 管理面板 Portainer 中文汉化 新增 CE、EE 企业版汉化](https://imnks.com/3406.html)
