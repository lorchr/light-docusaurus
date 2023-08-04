- [Mysql Offical](https://www.mysql.com/)
- [Mysql Offical Docker](https://dev.mysql.com/doc/refman/8.0/en/docker-mysql-getting-started.html)
- [Mysql Docker](https://hub.docker.com/_/mysql)

## 1. Docker安装Mysql 5.7
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create mysql_data;

# 获取默认配置文件
docker run -d --env MYSQL_ROOT_PASSWORD=admin --name mysql_temp mysql:5.7 \
&& docker cp mysql_temp:/etc/mysql/conf.d/mysql.cnf  D:/docker/mysql/conf/mysql.cnf \
&& docker cp mysql_temp:/etc/mysql/mysql.conf.d/mysqld.cnf  D:/docker/mysql/conf/mysqld.cnf \
&& docker cp mysql_temp:/etc/mysql/conf.d/mysqldump.cnf D:/docker/mysql/conf/mysqldump.cnf \
&& docker cp mysql_temp:/etc/mysql/conf.d/docker.cnf D:/docker/mysql/conf/docker.cnf \
&& docker stop mysql_temp && docker rm mysql_temp

# 运行容器
docker run -d \
  --publish 3306:3306 \
  --volume //d/docker/mysql/data:/var/lib/mysql \
  --volume //d/docker/mysql/conf:/etc/mysql/conf.d \
  --volume //d/docker/mysql/log:/var/log/mysql \
  --env MYSQL_ROOT_PASSWORD=admin \
  --env MYSQL_DATABASE=light \
  --env MYSQL_USER=light \
  --env MYSQL_PASSWORD=light \
  --net dev \
  --restart=on-failure:3 \
  --name mysql5 \
  mysql:5.7

docker exec -it -u root mysql5 /bin/bash

mysql -u root -p

SHOW DATABASES;
USE mysql;
SELECT user, host, authentication_string, plugin FROM user;
CREATE USER 'light'@'%' IDENTIFIED BY 'light';
GRANT ALL PRIVILEGES ON *.* TO 'light'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

docker container restart mysql5
```

- Account
  - root/admin
  - light/light

## 2. Docker安装Mysql 8.0
```shell
docker run -d \
  --publish 3308:3308 \
  --volume //d/docker/mysql/data:/var/lib/mysql \
  --volume //d/docker/mysql/conf:/etc/mysql/conf.d \
  --volume //d/docker/mysql/log:/var/log/mysql \
  --env MYSQL_ROOT_PASSWORD=admin \
  --env MYSQL_DATABASE=light \
  --env MYSQL_USER=light \
  --env MYSQL_PASSWORD=light \
  --net dev \
  --restart=on-failure:3 \
  --name mysql8 \
  mysql:8.0

docker exec -it -u root mysql8 /bin/bash

mysql -u root -p

SHOW DATABASES;
USE mysql;
SELECT user, host, authentication_string, plugin FROM user;
CREATE USER 'light'@'%' IDENTIFIED BY 'light';
GRANT ALL PRIVILEGES ON *.* TO 'light'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

docker container restart mysql8
```

- Account
  - root/admin
  - light/light

## 3. 配置
```shell
vim /etc/mysql/conf.d/mysql.cnf
```

```conf
[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4'
# 设置表名大小写敏感
lower_case_table_names=0
```

1. lower_case_file_system: 当前文件系统是否大小写敏感（ON-敏感，OFF-不敏感），只读参数，无法修改
2. lower_case_table_names: 此参数不可以动态修改，必须重启数据库
   - 0 表名存储区分大小写，比较时区分大小写
   - 1 表名存储时转为小写，比较时不区分大小写
   - 2 表名存储区分大小写，比较时为转为小写

[windows docker里安装并使用mysql（内含mysql主从搭建）](https://blog.csdn.net/u012643122/article/details/125899829)