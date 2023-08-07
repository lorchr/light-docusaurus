# Device and Software Plan

## 1. Android
### 手机端的Linux 
- Droidian
- PostmarketOS
- Ubuntu Touch
- Mobian
- AnBox
- WayDroid

### 容器方案
- [x] LinuxDeploy 有root + chroot  
- Termux 无root + proot  

## 2. Soft Router
### 硬件方案
- [ ] Nano Pi R2S
- Nano Pi R5S /R5C
- RedMI AX3000

### 软件方案
- [ ] Openwrt
- iKuai 
- iStoreOS

## 3. Home Assistant
### 硬件方案
- [ ] 智趣盒子
- 机顶盒刷 HAOS

### 软件方案
- [x] HA OS
- HA Docker
- HA Core

## 4. TV Box
### 硬件方案
淘宝刷机盒子，免会员，无广告
- [ ] 小米4S Max 4 + 64
- 小米4S Pro 2 + 32

## 5. NAS

### 硬件方案
1. 丐版
   1. 板U J1900/J3455/J4125
   2. Ram 4G
   3. SSD 256G
   4. HDD 4T
2. 普通版
   1. 板U N5095/N5105/N6005/N100 
   2. Ram 8G * 2
   3. SSD 256G
3. 豪华版 All in One
   1. 板U i3-10100/i3-11100/i3-12100/i3-13100
   2. Ram 16G * 2
   3. SSD 256G + 1T
4. 超豪华版 All in One + Server
   1. 板U i7-1280p/R7-7840/R7-7940
   2. Ram 32G * 2 ECC
   3. SSD 1T + 2T
   4. UPS

### 软件方案
1. 系统选择
   1. [ ] Synology 
   2. True NAS
   3. Free NAS
   4. [ ] Unraid
   5. NAS Tools 
   6. [ ] OpenMediaValut OMV
   7. [x] Debian
   8. CryptoNAS
   9. GooNAS 
2. 私有云
   1. KVM + WebVirtCloud + OpenVPN 
3. 影视     
   1. Emby 
   2. Plex 
   3. Jellyfin 
   4. Kodi
4. 网盘     
   1. NextCloud
   2. CloudDrive
5. 下载
   1. Alist
   2. Aria2
6. 相册同步
7. 笔记
   1. Docsify
   2. Showdoc
8. 博客
9.  去广告
   1. AdGuardHome
10. 签到、网赚
    1.  青龙面板 京豆
    2.  qiandao-today
    3.  玩客云 京东云 网赚
11. 穿透
    1.  Tailscale
    2.  ZeroTier
    3.  ddns-go
    4.  [x] cloudflare


## 6. All in One
- [x] PVE  
- EXSI 


## 7. 开源工具
- 磁盘唤醒 https://github.com/trapexit/mergerfs
- Onedrive https://github.com/abraunegg/onedrive
- Aria2 https://aria2.github.io/
- Aria Ng https://github.com/mayswind/AriaNg

## 8. 参考方案1
常用 Docker
- 自动化管理：Nas-tools
- 导航：Heimdall/OneNav/webstack
- 博客：Typecho/Halo
- 网盘：Alist/CloudDrive
- 下载：Qbittorrent/Aria2/Transmission
- 图书：Talebook/Calibre-web
- 媒体库：Jellyfin/Emby/Plex/极影视
- 办公：Kodbox/Dzzoffice
- 漫画：LANraragi/Komga
- 有声书：audiobookshelf
- 网络：Lucky/NPM
- 同步：Resilio/Syncthing
- 广告：AdGuardHome
- 穿透：Tailscale/ZeroTier/ddns-go
- 家居：Home Assistant
- 小姐姐刮削：avdc/Jvedio/mdcx/bustag 
- 密码管理: bitwarden

## 9. 参考方案2
- 文档同步。Obsidian+webdav，手机、电脑和nas。
- 影音库。nastools+jackett+qbittorrent+emby（破解版）/jellyfin。
- 手机备份。carddav+radicale同步通讯录，swift back up+webdav同步app和app应用数据。
- 虚拟机。一个openwrt软路由，用来去广告和科学上网，也安装了kms插件，用来激活局域网内的windows，一个win7用来解决家里没有windows电脑的问题。
- 手机照片视频自动备份并归档。syncthing+qfilling。
- 看电视直播。xteve+emby(破解版)/jellyfin。
- 邮件服务器。qmail。
- 音乐服务器，搜歌+在线听歌。melody+ultrasonic。melody搜歌，并把歌下载到网易云盘，需要手动下载到nas，然后可以用ultrasonic听歌。
- 密码管理服务器，保存app和网站上用到的用户名和密码。bitwarden。
- 京东自动做任务刷京豆，贴吧自动签到。青龙面板。
- mac time machine备份。
- 此外，解决外网访问问题，做了内网穿透和ipv6 ddns。zerotier

## 10. 参考方案3
下面列举一下现在在用的服务，底层使用的PVE。

- 黑群晖：这个自然不必说，所有的文件服务我都放在这上面。
- openwrt旁路由：用来成为哈利波特访问霍格沃兹的桥梁。
- 签到服务：我用的qiandao-today的项目，用来签到张大妈、有道云等等的每日签到服务，有很多公共模板可以使用。
- emby影音服务器：用来存放电影、电视剧、动画等等，在电视、手机或者远程连接观看。
- Plex Media：和emby一样同样也是影视库工具，只自己看用。
- Bustag：这个会根据你的喜好像你推荐小姐姐影片，需要打标签训练。
- transmision：远程下载bt使用，之前挂pt用，现在没啥兴趣了。将种子放到监视文件夹内即可自动下载。
- Aria2：远程下载非bt的东西，群晖自带的dowload station个人觉得并不好用，可能是我黑群的原因~
- 玩物下载：同样微信里直接发送链接，家里机器就会自动下载，速度也要分资源，还可以吧。
- cloud sync:群晖自带的套件，原来用来同步百度网盘用的，奈何百度速度极慢，100k都算高速了。不过支持许多国外盘dropbox、googledrive等。
- timemachine：用来备份自己的mac数据
- cloud drive：可以吧115、阿里云网盘、以及自建网盘挂载到自己的pc上，就像访问本地硬盘一样。
- 青龙面板：我用来挂京豆用~刚刚研究还不是太懂。
- 虚拟windows系统：由于主力机还是用mac，但有些应用只能通过Windows来部署完成，例如一些挂机学习或者爬虫之类的，远程桌面很方便。

