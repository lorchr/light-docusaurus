## docker
```shell
# 创建网络 host仅内网可用 bridge外网可用
docker network create --driver host host0;
docker network create --driver bridge bridge0;

# 查看容器ID:
docker ps

# 以root用户进入容器shell:
docker exec -it -u root 容器ID /bin/bash
```

## jellyfin
jellyfin是一套流媒体软件系统，是Emby和Plex的替代方案
### host:

```shell
docker run -d \
--name=jellyfin \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-v /apps/jellyfin/config:/config \
-v /apps/jellyfin/cache:/cache \
-v /nas/media:/media \
--restart=unless-stopped \
--net=host \
--device /dev/dri:/dev/dri \
nyanmisaka/jellyfin:latest
```

### bridge:
```shell
docker run -d \
--name=jellyfin \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-p 8096:8096 \
-v /apps/jellyfin/config:/config \
-v /apps/jellyfin/cache:/cache \
-v /nas/media:/media \
--restart=unless-stopped \
--device /dev/dri:/dev/dri \
nyanmisaka/jellyfin:latest

-p 8920:8920  \
-p 7359:7359/udp \
-p 1900:1900/udp \
```

## mysql
```shell
docker run -d \
--name mariadb \
-p 3306:3306 \
-e TZ=Asia/Shanghai \
-e MYSQL_ROOT_PASSWORD=210920 \
-v /apps/mariadb:/var/lib/mysql  \
--restart unless-stopped \
mariadb:latest
```

```shell
########################################
###新建用户
mysql -u root -p
输入密码
210920
create user 'user_name'@'localhost' identified by 'password';

###主机地址授权的范围大致如下:

###% – 表示:任意主机都可以连接到数据库(这很不安全)
###localhost – 表示:只能从本机访问，场景单机数据库推荐
###192.168.66.0/24 – 表示:授权一个网段，比如192.168.66.1–192.168.66.254
###192.168.66.% – 表示:授权一个网段，比如192.168.66.1–192.168.66.254
###192.168.% – 表示:更大网段授权 比如192.168.0.1—192.168.254.254
###192.168.66.177 – 表示:指定的一个IP,也就是这个用户只有是这个IP地址才能连接上

###新建数据库并将权限赋值给用户
create database  db_name;
grant all on db_name.* to 'user_name'@'localhost' identified by 'password';

###回收权限
revoke all on *.* from 'user_name'@'localhost';

###查询用户/数据库
select user,host from mysql.user;
show databases;

查询用户权限
show grants for 'user_name'@'localhost';
show grants;

删除用户
drop user photoprism@'10.1.1.%';
```


## photoprism
```shell
create database photoprism;
create user 'photoprism'@'172.17.%' identified by 'photoprism';
grant all on photoprism.* to 'photoprism'@'172.17.%' identified by 'photoprism';

docker run -d \
--name photoprism \
--security-opt seccomp=unconfined \
--security-opt apparmor=unconfined \
-p 50001:2342 \
-e TZ=Asia/Shanghai \
-e PHOTOPRISM_ADMIN_USER="lpc0083" \
-e PHOTOPRISM_UPLOAD_NSFW="true" \
-e PHOTOPRISM_ADMIN_PASSWORD="210920" \
-e PHOTOPRISM_DATABASE_DRIVER="mysql" \
-e PHOTOPRISM_DATABASE_SERVER="10.1.1.254:50000" \
-e PHOTOPRISM_DATABASE_NAME="photoprism"   \
-e PHOTOPRISM_DATABASE_USER="photoprism"  \
-e PHOTOPRISM_DATABASE_PASSWORD="photoprism"  \
-e PHOTOPRISM_FFMPEG_ENCODER="intel" \
-v /apps/photoprism:/photoprism \
-v /nas/photo:/photoprism/originals \
--restart unless-stopped \
--device /dev/dri:/dev/dri \
photoprism/photoprism:latest

>>>>>>>>>>>>>>可选参数<<<<<<<<<<<<<<<
# PHOTOPRISM_DATABASE_DRIVER: "sqlite"         # SQLite is an embedded database that doesn't require a server
-e PHOTOPRISM_DATABASE_DRIVER: "mysql"            # use MariaDB 10.5+ or MySQL 8+ instead of SQLite for improved performance
-e PHOTOPRISM_DATABASE_SERVER: "mariadb:3306"     # MariaDB or MySQL database server (hostname:port)
-e PHOTOPRISM_DATABASE_NAME: "photoprism"         # MariaDB or MySQL database schema name
-e PHOTOPRISM_DATABASE_USER: "photoprism"         # MariaDB or MySQL database user name
-e PHOTOPRISM_DATABASE_PASSWORD: "insecure"       # MariaDB or MySQL database user password

# PHOTOPRISM_FFMPEG_ENCODER: "software"        # FFmpeg encoder ("software", "intel", "nvidia", "apple", "raspberry")
# PHOTOPRISM_FFMPEG_BITRATE: "32"              # FFmpeg encoding bitrate limit in Mbit/s (default: 50)
    ## Share hardware devices with FFmpeg and TensorFlow (optional):
    # devices:
    #  - "/dev/dri:/dev/dri"                         # Intel QSV
    #  - "/dev/nvidia0:/dev/nvidia0"                 # Nvidia CUDA
    #  - "/dev/nvidiactl:/dev/nvidiactl"
    #  - "/dev/nvidia-modeset:/dev/nvidia-modeset"
    #  - "/dev/nvidia-nvswitchctl:/dev/nvidia-nvswitchctl"
    #  - "/dev/nvidia-uvm:/dev/nvidia-uvm"
    #  - "/dev/nvidia-uvm-tools:/dev/nvidia-uvm-tools"
    #  - "/dev/video11:/dev/video11"  
```


## nextcloud
### 初始化数据库
```shell
create database nextcloud;
create user 'nextcloud'@'172.17.%' identified by 'nextcloud';
grant all on nextcloud.* to 'nextcloud'@'172.17.%' identified by 'nextcloud';
```

### 安装
```shell
docker run -d \
--name=nextcloud \
-p 50004:80 \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-v /apps/nextcloud:/var/www/html \
-v /apps/nextcloud/apps:/var/www/html/custom_apps \
-v /apps/nextcloud/config:/var/www/html/config \
-v /apps/nextcloud/data:/var/www/html/data \
-v /apps/nextcloud/themes:/var/www/html/themes \
-v /nas:/nas \
--restart unless-stopped \
nextcloud:latest
```

## 迅雷
### host:
```shell
docker run -d \
--name=xunlei \
--hostname=nas \
--net=host \
-e XL_WEB_PORT=50003 \
-e TZ=Asia/Shanghai \
-v /apps/xunlei:/xunlei/data \
-v /nas/download:/xunlei/downloads \
--restart=unless-stopped \
--privileged \
cnk3x/xunlei:latest
```

### bridge:
```shell
docker run -d \
--name=xunlei \
--hostname=nas \
-p 50003:2345 \
-e TZ=Asia/Shanghai \
-v /apps/xunlei:/xunlei/data \
-v /nas/download:/xunlei/downloads \
--restart=unless-stopped \
--privileged \
cnk3x/xunlei:latest
```

## qbittorrent
### host:
```shell
docker run -d \
--name=qbittorrent \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-e WEBUI_PORT=50004 \
--net=host \
-v /apps/qbittorrent/config:/config \
-v /nas/downloads:/downloads \
--restart unless-stopped \
--privileged \
lscr.io/linuxserver/qbittorrent:latest
```

### bridge:
```shell
docker run -d \
--name=qbittorrent \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-e WEBUI_PORT=8080 \
-p 50004:8080 \
-p 6881:6881 \
-p 6881:6881/udp \
-v /apps/qbittorrent:/config \
-v /nas/download:/downloads \
--restart unless-stopped \
--privileged \
lscr.io/linuxserver/qbittorrent:latest
```

## heimdall
### host:
```shell
docker run -d \
--name=heimdall \
--net=host \
-e TZ=Asia/Shanghai \
-v /apps/heimdall/config:/config \
--restart unless-stopped \
lscr.io/linuxserver/heimdall:latest
```


### bridge:
```shell
docker run -d \
--name=heimdall \
-e TZ=Asia/Shanghai \
-p 50080:80 \
-p 50443:443 \
-v /mnt:/mnt \
-v /apps/heimdall/config:/config \
--restart unless-stopped \
lscr.io/linuxserver/heimdall:latest
```


## syncthing
```shell
docker run -d \
--name=syncthing \
--hostname=syncthing `#optional` \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Asia/Shanghai \
-p 50011:8384 \
-p 22000:22000/tcp \
-p 22000:22000/udp \
-p 21027:21027/udp \
-v /apps/syncthing:/config \
-v /nas:/nas \
--restart unless-stopped \
lscr.io/linuxserver/syncthing:latest
```


## 小雅alist
```shell
http://alist.xiaoya.pro/


mkdir -p /apps/xiaoya/data
touch /apps/xiaoya/data/mytoken.txt
touch /apps/xiaoya/data/myopentoken.txt
touch /apps/xiaoya/data/temp_transfer_folder_id.txt

docker run -d \
    -p 50012:80 \
    -v /apps/xiaoya/data:/data \
    --restart=always \
    --name=xiaoya \
    xiaoyaliu/alist:latest
```

说明文档  https://xiaoyaliu.notion.site/xiaoya-docker-69404af849504fa5bcf9f2dd5ecaa75f   

```shell

阿里云盘 19157789692

mytoken.txt(必填)     
用途：用来加载阿里分享，和自动签到      
获取方式 https://alist.nn.ci/zh/guide/drivers/aliyundrive.html

a4cad32609a74353ad9dc3be6f7b0ed3

myopentoken.txt(必填)  
用途：用来加载自己的阿里云盘（open接口） 
获取方式 https://alist.nn.ci/zh/guide/drivers/aliyundrive_open.html

eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxODQyNDk5NDU0YzI0ODllYjgzZDA0OWEyMTM5NDJiYiIsImF1ZCI6Ijc2OTE3Y2NjY2Q0NDQxYzM5NDU3YTA0ZjYwODRmYjJmIiwiZXhwIjoxNjg4ODkxOTg0LCJpYXQiOjE2ODExMTU5ODR9.DdF_0tzT8-6ehR8cu9f8Gx4I8POFF9rjRTD7cjwPNxTA5h36K7XyvmCJNhiitTDWhdWcL65Lf2Zq9OmXqvo0ig

temp_transfer_folder_id.txt(必填)  打开你阿里云盘网页，目录所在的浏览器地址 https://www.aliyundrive.com/drive/folder/640xxxxxxxxxxxxxxxxxxxca8a   最后一串就是
用途：你的阿里网盘的转存目录的folder id

6433cd86fdf973bc00cf4c7b8f5a95de0fcef04e



文件：guestlogin.txt
用途：通过此文件的存在与否来决定是否开启强制登入
格式：空白文件，不需要强制登入功能，则删除此文件

文件：guestpass.txt
用途：自己修改 guest 账号的密码
备注：如果开启了强制登入则 登入账号 dav 也使用此密码

重启就会自动更新数据库及搜索索引文件
0 6 * * * docker restart xiaoya 每天凌晨6点自动重启容器
```

## alist
```shell
docker run -d \
    --restart=always \
    -v /apps/alist:/opt/alist/data \
    -v /nas/download:/root/Download \
    -p 50001:5244 \
    -p 56800:6800 \
    -e PUID=0 \
    -e PGID=0 \
    -e UMASK=022 \
    --name="alist" \
    xhofe/alist-aria2:latest
```

## watchtower
```shell
docker run -d \
--name watchtower \
-v /var/run/docker.sock:/var/run/docker.sock \
containrrr/watchtower -c \
--schedule "0 58 2 * * *" \
--cleanup \
xiaoya alist 
```

## centos 宝塔
bridge:
```shell
docker run -d -it \
--name=centos \
-p 8888:8888 \
-e TZ=Asia/Shanghai \
--shm-size=2g \
-e "container=docker" \
-v /sys/fs/cgroup:/sys/fs/cgroup \
-v /data/centos/data:/data \
-v /nas/rclone:/rclone \
-v /data/centos/www:/www \
--restart=unless-stopped \
--privileged=true \
centos:centos7.4.1708 /usr/sbin/init

如果ip命令不存在 
yum provides ip

yum install -y 查找出的filename

sed -e 's|^mirrorlist=|#mirrorlist=|g' \
    -e 's|^#baseurl=http://mirror.centos.org/centos|baseurl=https://mirrors.ustc.edu.cn/centos|g' \
    -i.bak \
    /etc/yum.repos.d/CentOS-Base.repo

yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec

关闭宝塔 Linux 面板的安全入口
rm -f /www/server/panel/data/admin_path.pl
```

## emby
```shell
docker run \
--net=host \
-v /apps/emby/config:/config \
-v /apps/emby/cache:/cache \
-v /nas:/data \
-e TZ=Asia/Shanghai \
-e UID=0 \
-e GID=0 \
--restart unless-stopped \
--name emby \
--privileged=true \
-d lovechen/embyserver:latest
```

## nas-tools
```shell
docker run -d \
--name nas-tools \
--hostname nas-tools \
-p 50003:3000 \
-v /apps/nas-tools/config:/config \
-v /nas/media:/media \
-v /nas/downloads:/downloads \
-e UID=1000 \
-e GID=1000 \
-e UMASK=022 \
-e REPO_URL="https://ghproxy.com/https://github.com/NAStool/nas-tools.git" \
-e NASTOOL_AUTO_UPDATE=false `# 如需在启动容器时自动升级程程序请设置为true` \
-e NASTOOL_CN_UPDATE=false `# 如果开启了容器启动自动升级程序，并且网络不太友好时，可以设置为true，会使用国内源进行软件更新` \
--restart always \
--privileged=true \
miraclemie/nas-tools:latest
```

## jackett
```shell
docker run -d \
  --name=jackett \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e AUTO_UPDATE=true `#optional` \
  -e RUN_OPTS= `#optional` \
  -p 50009:9117 \
  -v /apps/jackett/config:/config \
  -v /nas/tmp/downloads:/downloads \
  --restart unless-stopped \
  lscr.io/linuxserver/jackett:latest
```

## chinesesubfinder
```shell
docker run -d \
    -v /apps/chinesesubfinder/config:/config   `# 冒号左边请修改为你想在主机上保存配置、日志等文件的路径` \
    -v /nas/media:/media     `# 请修改为需要下载字幕的媒体目录，冒号右边可以改成你方便记忆的目录，多个媒体目录需要添加多个-v映射` \
    -v /apps/chinesesubfinder/browser:/root/.cache/rod/browser `# 容器重启后无需再次下载 chrome，除非 go-rod 更新` \
    -e PUID=1000 \
    -e PGID=1000 \
    -e PERMS=true       `# 是否重设/media权限` \
    -e TZ=Asia/Shanghai `# 时区` \
    -e UMASK=022        `# 权限掩码` \
    -p 50007:19035 `# 从0.20.0版本开始，通过webui来设置` \
    -p 50008:19037 `# webui 的视频列表读取图片用，务必设置不要暴露到外网` \
    --name chinesesubfinder \
    --hostname chinesesubfinder \
    --log-driver "json-file" \
    --log-opt "max-size=100m" `# 限制docker控制台日志大小，可自行调整` \
    --restart unless-stopped \
    allanpk716/chinesesubfinder:v0.52.3
```

## flaresolverr
```shell
docker run -d \
    -p 50010:8191 \
    -e TEST_URL=https://www.baidu.com \
    --restart unless-stopped 
    --name flaresolverr \
    flaresolverr/flaresolverr
```
