[自建DDNS解决动态IP服务器访问问题](https://www.dmgls.com/1358.html)

## 1. 把域名接入cloudflare
打开[Cloudflare](https://www.cloudflare.com/zh-cn/)，登陆账号添加网站按照提示操作

## 2. 获取Global API Key
访问 [Dashboard](https://dash.cloudflare.com/profile) 在页面下方找到 Global API Key，点击右侧的 View 查看 Key，并保存下来 ，在页面下方找到 Global API Key，点击右侧的 View 查看 Key，并保存下来



## 3. 设置用于 DDNS 解析的二级域名，流量不经过CDN(云朵变灰)
添加一条A记录，例如：`hkt.test.com`，Proxy status设置成`DNS only`

| Type | Name | IPv4 address | TTL  | Proxy status |
| ---- | ---- | ------------ | ---- | ------------ |
| A    | hkt  | 1.1.1.1      | Auto | DNS only     |


## 4. 下载 DNNS 脚本
```shell
curl https://raw.githubusercontent.com/aipeach/cloudflare-api-v4-ddns/master/cf-v4-ddns.sh > /root/cf-v4-ddns.sh && chmod +x /root/cf-v4-ddns.sh
```

## 5. 修改 DDNS 脚本并补充相关信息
```shell
nano cf-v4-ddns.sh
```

```shell
# incorrect api-key results in E_UNAUTH error
# 填写 Global API Key
CFKEY=

# Username, eg: user@example.com
# 填写 CloudFlare 登陆邮箱
CFUSER=

# Zone name, eg: example.com
# 填写需要用来 DDNS 的一级域名
CFZONE_NAME=

# Hostname to update, eg: homeserver.example.com
# 填写 DDNS 的二级域名(只需填写前缀)
CFRECORD_NAME=
```

首次运行脚本,输出内容会显示当前IP，进入cloudflare查看 确保IP已变更为当前IP
```shell
./cf-v4-ddns.sh
```

## 6. 设置定时任务
```
crontab -e
*/2 * * * * /root/cf-v4-ddns.sh >/dev/null 2>&1
# 如果需要日志，替换上一行代码
*/2 * * * * /root/cf-v4-ddns.sh >> /var/log/cf-ddns.log 2>&1
```
2 分钟检测一次，IP 是否改变。

## 7. 安装 crontab
可能提示没有安装 crontab，所以需要运行下面的内容

```shell
apt-get install vixie-cron  #报错就报错，没关系的，下一步
apt-get install crontabs
```

等添加了任务之后，再手动运行 crontab

```shell
service crond start  #运行 crontab
service crond status  #查看 crontab 状态
chkconfig crond on  #Centos6 允许 crontab 自启动
systemctl enable crond.service  #Centos7 允许 crontab 自启动
```

版权属于：大漠孤狼

本文链接：

转载时须注明出处及本声明