
## 服务列表

### Github加速
1. 获取域名IP的工具网站 https://www.ipaddress.com/website/

   - Github主站 https://github.com
   - 全球加速CDN https://github.global.ssl.fastly.net
   - 静态资源CDN https://assets-cdn.github.com
   - 静态资源CDN https://github.githubassets.com
   - 用户文件CDN https://row.githubusercontent.com
   - 项目文件CDN https://objects.githubusercontent.com

2. 修改hosts文件

    ```bash
    140.82.114.3        github.com
    151.101.1.194       github.global.ssl.fastly.net
    151.101.65.194      github.global.ssl.fastly.net
    151.101.129.194     github.global.ssl.fastly.net
    151.101.193.194     github.global.ssl.fastly.net
    185.199.108.153     assets-cdn.github.com
    185.199.109.153     assets-cdn.github.com
    185.199.110.153     assets-cdn.github.com
    185.199.111.153     assets-cdn.github.com
    185.199.108.154     github.githubassets.com
    185.199.109.154     github.githubassets.com
    185.199.110.154     github.githubassets.com
    185.199.111.154     github.githubassets.com
    185.199.108.133     row.githubusercontent.com
    185.199.109.133     row.githubusercontent.com
    185.199.110.133     row.githubusercontent.com
    185.199.111.133     row.githubusercontent.com
    185.199.108.133     objects.githubusercontent.com
    185.199.109.133     objects.githubusercontent.com
    185.199.110.133     objects.githubusercontent.com
    185.199.111.133     objects.githubusercontent.com
                        
    ```

3. 刷新DNS 

    ```bash
    ipconfig /flushdns
    ```


### 整体解决方案
1. [Awesome-Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) 自建家庭服务
2. [Aquar-Home](https://github.com/firemakergk/aquar-home) 
3. [Debian-HomeNAS](https://github.com/kekylin/Debian-HomeNAS)


### 基础类
1. [Podman](https://github.com/containers/podman) 容器管理服务
2. [Mysql](https://github.com/mysql/mysql-server) 流行的开源关系型数据库
3. [Postgres](https://github.com/postgres/postgres) 强大开源的关系型数据库
4. [Redis](https://github.com/redis/redis) 键值存储的非关系数据库
5. [Gitlab](https://github.com/gitlabhq/gitlabhq) 私有代码仓库
6. [Minio](https://github.com/minio/minio) 私有文件管理服务


### 网络类
1. [WireGuard](https://github.com/angristan/wireguard-install)
2. [Tailscale](https://github.com/tailscale/tailscale)
3. [ZeroTier](https://github.com/zerotier/ZeroTierOne)
4. [Netbird](https://github.com/netbirdio/netbird)


### 安全类
1. [VaultWarden](https://github.com/dani-garcia/vaultwarden)
2. [BitWarden](https://github.com/bitwarden/server)


### 面板类
1. [1Panel](https://github.com/1Panel-dev/1Panel) Linux服务器运维面板
2. [SunPanel](https://hub.docker.com/r/hslr/sun-panel) 个人开源NAS面板


### 编程类
1. [IT-Tools](https://github.com/CorentinTh/it-tools) 聚合常用编程工具


### 文档类
1. [Readeck](https://codeberg.org/readeck/readeck) 一个开源的网页留存工具
2. [Obsidian](https://github.com/obsidianmd/obsidian-releases) 本地的个人知识库
4. [Outline](https://github.com/outline/outline) 
5. [BookStack](https://github.com/BookStackApp/BookStack)
6. [AFFiNE](https://github.com/toeverything/AFFiNE)
7. [Docmost](https://github.com/docmost/docmost)
8. [Trilium](https://github.com/zadam/trilium)
9. [Memos](https://github.com/usememos/memos)


### 相册类
1. [Photoprism](https://github.com/photoprism/photoprism)
2. [Immich](https://github.com/immich-app/immich)


### 影音类
1. [NasTools](https://github.com/NAStool/nas-tools) 视频自动下载
2. [Jellyfin](https://github.com/jellyfin/jellyfin)


### 下载类
1. [qBittorrent](https://github.com/qbittorrent/qBittorrent)
2. [Aria2](https://github.com/aria2/aria2)
3. [Transmission](https://github.com/transmission/transmission)
4. [jackett](https://github.com/Jackett/Jackett)


### 网盘类
1. [Alist](https://github.com/alist-org/alist) Webdev网盘聚合工具
2. [Cloudreve](https://github.com/cloudreve/Cloudreve) 
3. [NextCloud](https://github.com/nextcloud/server) 
4. [FileRun](https://github.com/filerun/docker) 
5. [Seafile](https://github.com/haiwen/seafile)
6. [Clouddrive](https://github.com/sublaim/clouddrive2)


### 备份类
1. [Syncthing](https://github.com/syncthing/syncthing) 多端支持的文件同步工具
2. [Rclone](https://github.com/rclone/rclone)
3. [Rsync](https://github.com/RsyncProject/rsync)
4. [Duplicati](https://github.com/duplicati/duplicati) 一个开源的文件加密备份工具


### 其他类
- [chatgpt-on-wechat](https://github.com/zhayujie/chatgpt-on-wechat) 集成ChatGPT到企业微信
- [requestrr](https://github.com/darkalfx/requestrr) 一个开源的聊天机器人


## 需要解决的问题
1. 来电自启 Weak-On-Lan
2. 异地组网 Tailscale WireGuard ZeroTier
3. 远程访问 DDNS
4. 硬盘休眠 
5. 虚拟机备份 
6. 文件备份 Syncthing Duplicati
