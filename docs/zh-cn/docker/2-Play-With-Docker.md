- [Docker](https://www.docker.com)
- [Docker Hub](http://hub.docker.com/)
- [Play With Docker](https://labs.play-with-docker.com/)

## 1. 生成SSH秘钥
SSH连接 PWD(Play With Docker) 需要有SSH秘钥，但是不需要上传到PWD上
```shell
# 测试SSH连接PWD
ssh -v ip172-18-0-30-chpi3h89ec4g00esojfg@direct.labs.play-with-docker.com

# 使用MobaXterm时，需要在 /home/mobaxterm/.ssh/id_rsa 下添加秘钥，不能使用~/.ssh下的秘钥
ssh-keygen -t rsa -C "lorchr@163.com" -f "/home/mobaxterm/.ssh/id_rsa"
```

## 2. 使用SSH连接Play With Docker
```shell
ssh ip172-18-0-30-chpi3h89ec4g00esojfg@direct.labs.play-with-docker.com
```

## 3. 安装Mysql镜像

```shell
docker run --detach \
  --publish 3306:3306 \
  --env MYSQL_ROOT_PASSWORD=admin \
  --env MYSQL_DATABASE=light \
  --env MYSQL_USER=light \
  --env MYSQL_PASSWORD=light \
  --restart=on-failure:3 \
  --name mysql \
  mysql:5.7
```

## 4. 连接Mysql镜像
```shell
# 进入Mysql容器
docker exec -it -u root mysql /bin/bash

# 登录Mysql
mysql -u root -p -h ip172-18-0-30-chpi3h89ec4g00esojfg-3306.direct.labs.play-with-docker.com -P 3306

mysql -u root -p

SHOW DATABASES;
USE mysql;
SELECT user, host, authentication_string, plugin FROM user;
CREATE USER 'light'@'%' IDENTIFIED BY 'light';
GRANT ALL PRIVILEGES ON *.* TO 'light'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## 5. 移除容器

```shell
docker stop mysql && docker rm mysql
```

## 6. 安装Nginx
```shell
docker run --detach \
    --publish 8080:80 \
    --volume /root/nginx.conf:/etc/nginx/nginx.conf:ro \
    --volume /root/html:/usr/share/nginx/html \
    --name nginx \
    nginx:1.24

docker stop nginx && docker rm nginx

# 上传文件 需要SSH Key
scp ./dist.zip ip172-18-0-30-chpi3h89ec4g00esojfg@direct.labs.play-with-docker.com:/root/dist.zip

# 下载文件 需要SSH Key
scp ip172-18-0-30-chpi3h89ec4g00esojfg@direct.labs.play-with-docker.com:/root/dist.zip ~/
```

浏览器访问 [Nginx](http://ip172-18-0-30-chpi3h89ec4g00esojfg-8080.direct.labs.play-with-docker.com/)
