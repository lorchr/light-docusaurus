## 1. 安装
### 1. 下载安装包
https://pkgs.org/download/ntp

- autogen-libopts-5.18-5.el7.x86_64.rpm
- ntpdate-4.2.6p5-29.el7.centos.2.x86_64.rpm
- ntp-4.2.6p5-29.el7.centos.2.x86_64.rpm

### 2. 安装NTP
```shell
[root@light pkg]# rpm -ivh autogen-libopts-5.18-5.el7.x86_64.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:autogen-libopts-5.18-5.el7       ################################# [100%]
[root@light pkg]# rpm -ivh ntpdate-4.2.6p5-29.el7.centos.2.x86_64.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:ntpdate-4.2.6p5-29.el7.centos.2  ################################# [100%]
[root@light pkg]# rpm -ivh ntp-4.2.6p5-29.el7.centos.2.x86_64.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:ntp-4.2.6p5-29.el7.centos.2      ################################# [100%]
```

### 3. 查看NTP版本
```shell
[root@light pkg]# rpm -q ntp
ntp-4.2.6p5-29.el7.centos.2.x86_64
```

### 4. 启动NTP
```shell
[root@light pkg]# systemctl start ntpd
```

### 5. 查看NTP状态
```shell
[root@light pkg]# systemctl status ntpd
● ntpd.service - Network Time Service
   Loaded: loaded (/usr/lib/systemd/system/ntpd.service; enabled; vendor preset: disabled)
   Active: active (running) since 三 2022-11-23 14:10:01 CST; 6s ago
  Process: 1635 ExecStart=/usr/sbin/ntpd -u ntp:ntp $OPTIONS (code=exited, status=0/SUCCESS)
 Main PID: 1636 (ntpd)
   CGroup: /system.slice/ntpd.service
           └─1636 /usr/sbin/ntpd -u ntp:ntp -g

11月 23 14:10:01 light ntpd[1636]: 0.0.0.0 c01d 0d kern kernel time sync enabled
11月 23 14:10:01 light ntpd[1636]: ntp_io: estimated max descriptors: 1024, initial socket boundary: 16
11月 23 14:10:01 light ntpd[1636]: Listen and drop on 0 v4wildcard 0.0.0.0 UDP 123
11月 23 14:10:01 light ntpd[1636]: Listen and drop on 1 v6wildcard :: UDP 123
11月 23 14:10:01 light ntpd[1636]: Listen normally on 2 lo 127.0.0.1 UDP 123
11月 23 14:10:01 light ntpd[1636]: Listen normally on 3 enp0s3 192.168.137.218 UDP 123
11月 23 14:10:01 light ntpd[1636]: Listen normally on 4 lo ::1 UDP 123
11月 23 14:10:01 light ntpd[1636]: Listen normally on 5 enp0s3 fe80::a3ee:846d:9026:d26c UDP 123
11月 23 14:10:01 light ntpd[1636]: Listening on routing socket on fd #22 for interface updates
11月 23 14:10:06 light ntpd[1636]: Deferring DNS for 0.centos.pool.ntp.org 1
```

## 2. 配置
### 1. 设置开机启动
```shell
[root@light pkg]# systemctl enable ntpd
Created symlink from /etc/systemd/system/multi-user.target.wants/ntpd.service to /usr/lib/systemd/system/ntpd.service.
```

### 2. 配置NTP
```shell
[root@light pkg]# vim /etc/ntp.conf

# 日志文件
logfile /var/log/ntpd.log

# 允许 10.51.0.0 网段的机器从这台服务器上查询和同步时间
restrict 10.51.0.0 mask 255.255.255.0 nomodify notrap

# 网络时间
server 0.cn.pool.ntp.org iburst prefer
server 1.cn.pool.ntp.org iburst
server 2.cn.pool.ntp.org iburst
server 3.cn.pool.ntp.org iburst

# 网络时间不可用是使用本地时间
server 127.0.0.1 iburst
fudge 127.0.0.1 stratum 10

# 允许上层时间服务器主动修改本机时间
restrict 0.cn.pool.ntp.org nomodify notrap noquery
restrict 1.cn.pool.ntp.org nomodify notrap noquery
restrict 2.cn.pool.ntp.org nomodify notrap noquery
restrict 3.cn.pool.ntp.org nomodify notrap noquery
```

在 ntp.conf 配置文件内可以利用『 restrict 』來控管权限，这个参数的设定方式为：
```
restrict [你的IP] mask [netmask_IP] [parameter]
```

其中 parameter 的參數主要有底下這些：

1. ignore： 拒絕所有類型的 NTP 連線；
2. nomodify： 用戶端不能使用 ntpc 與 ntpq 這兩支程式來修改伺服器的時間參數， 但用戶端仍可透過這部主機來進行網路校時的；
3. noquery： 用戶端不能夠使用 ntpq, ntpc 等指令來查詢時間伺服器，等於不提供 NTP 的網路校時囉；
4. notrap： 不提供 trap 這個遠端事件登錄 (remote event logging) 的功能。
5. notrust： 拒絕沒有認證的用戶端。

那如果你沒有在 parameter 的地方加上任何參數的話，這表示『該 IP 或網段不受任何限制』的意思喔！一般來說，我們可以先關閉 NTP 的使用權限，然後再一個一個的啟用允許登入的網段。

### 3. 查看时间是否已同步
```shell
[root@light pkg]# ntpstat
```

### 4. 查询时间
```shell
[root@light pkg]# timedatectl
      Local time: 三 2022-11-23 14:19:18 CST
  Universal time: 三 2022-11-23 06:19:18 UTC
        RTC time: 三 2022-11-23 06:19:18
       Time zone: Asia/Shanghai (CST, +0800)
     NTP enabled: yes
NTP synchronized: no
 RTC in local TZ: no
      DST active: n/a
```

### 5. 验证
```shell
[root@light pkg]# ntpdate 192.168.137.218
23 Nov 14:19:48 ntpdate[1712]: the NTP socket is in use, exiting

[root@light pkg]# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 ntp6.flashdance 194.58.203.20    2 u   39   64    3  254.847   12.965  26.569
*time.cloudflare 10.209.8.4       3 u   38   64    3  137.763   17.111   1.112
 a.chl.la        131.188.3.222    2 u   95   64    2  241.730    8.827   1.449
 119.28.183.184  100.122.36.196   2 u   34   64    3   38.629   12.979   7.136
 master          .INIT.          16 u    -   64    0    0.000    0.000   0.000
[root@master ~]# vim /etc/ntp.conf
```
带有 * 表示是当前正在使用的上层NTP服务器
带有 + 表示可用作备选服务器


### 6. 客户端同步定时任务
```shell
vim /etc/crontab

*/15 * * * * root /usr/sbin/ntpdate 0.cn.pool.ntp.org
```
