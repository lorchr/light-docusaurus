- [iStoreOS/OpenWrt安装及配置OpenClash](https://blog.fxcxy.com/2024/03/17/iStoreOS-OpenWpt%E5%AE%89%E8%A3%85%E5%8F%8A%E9%85%8D%E7%BD%AEOpenClash/)

## 一. 前言
一直在我的软路由(iStoreOS)上使用OpenClash科学上网，虽然能上网，但是总觉得网速不快，所以有时候不得不在电脑和手机上再打开科学上网的工具，感觉这个的作用不大。
但是最近我需要部分网站不走科学上网，需要加白名单，所以就去找了一下OpenClash的资料，没想到一直我的配置有问题，不是不好用，是自己没有配置正确。配置好之后，再也不用手机和电脑去开启科学上网了。

## 二. 系统环境
- iStoreOS
- OpenWrt

## 三. 软件工具
### ▶ [OpenClash](https://github.com/vernesong/OpenClash/releases)

![img](./img/101/101-1.png)

 
### ▶ [软路由工具集](https://github.com/AUK9527/Are-u-ok/tree/main/x86)
这是推荐的一些软件集，不是必须安装。

![img](./img/101/101-2.png)
 

## 四. 安装/升级OpenClash
### 1. 安装依赖包
进入软路由终端里复制下面的命令安装OpenClash需要的依赖包，可以一条条复制执行，也可以整个复制粘贴按回车执行
```bash
#iptables
opkg update
opkg install coreutils-nohup bash iptables dnsmasq-full curl ca-certificates ipset ip-full iptables-mod-tproxy iptables-mod-extra libcap libcap-bin ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base
```

```bash
#nftables
opkg update
opkg install coreutils-nohup bash dnsmasq-full curl ca-certificates ipset ip-full libcap libcap-bin ruby ruby-yaml kmod-tun kmod-inet-diag unzip kmod-nft-tproxy luci-compat luci luci-base
```

### 2. 下载OpenClash安装包
从上面的地址下载文件：[luci-app-openclash_0.46.003-beta_all.ipk](https://github.com/vernesong/OpenClash/releases)

### 3. 安装OpenClash
进入软路由系统 -> 系统 -> 软件包 -> 上传软件包，选择步骤2下载的软件包，点击上传。

![img](./img/101/101-3.png)
 
## 五. 配置OpenClash
### 1. 进入OpenClash
进入软路由系统 -> 服务 -> OpenClash

![img](./img/101/101-4.png)

### 2. 启动meta内核切换到Fake-IP(增强)模式
进入OpenClash -> 插件设置 -> 模式设置

下图是默认状态

![img](./img/101/101-5.png)

![img](./img/101/101-6.png)

更改后的状态

![img](./img/101/101-7.png)

### 3. 更新版本内核
进入OpenClash -> 插件设置 -> 版本更新，点击一键检查更新

![img](./img/101/101-9.png)
 
### 4. 开启GEO数据库订阅
进入OpenClash -> 插件设置 -> GEO数据库订阅

![img](./img/101/101-10.png)

### 5. 切换(更新)Dashboard版本
进入OpenClash -> 插件设置 -> 外部控制
切换更新前

![img](./img/101/101-11.png)
 
切换更新后

![img](./img/101/101-12.png)

### 6. 修改github地址
进入OpenClash -> 覆写设置 -> 常规设置

![img](./img/101/101-22.png)

## 六. 配置订阅
进入OpenClash -> 配置订阅

### 1. 添加订阅文件

![img](./img/101/101-13.png)

### 2. 填写配置文件内容

![img](./img/101/101-14.png)

### 3. 完成配置，点击保存配置

![img](./img/101/101-15.png)

## 七. 添加规则，设置指定域名不走代理
进入OpenClash -> 覆写设置 -> 规则设置

### 1. 开启自定义规则

![img](./img/101/101-17.png)

### 2. 填写规则
比如我要将baidu.com加入规则，并让他不走代理。

- `- DOMAIN-SUFFIX,baidu.com,DIRECT`

![img](./img/101/101-18.png)

规则有很多种：

- `- SCRIPT,quic,REJECT`                    # shortcuts rule
- `- SCRIPT,time-limit,REJECT`              # shortcuts rule
- `- PROCESS-NAME,curl,DIRECT`              # 匹配路由自身进程(curl直连)
- `- DOMAIN-SUFFIX,google.com,Proxy`        # 匹配域名后缀(交由Proxy代理服务器组)
- `- DOMAIN-KEYWORD,google,Proxy`           # 匹配域名关键字(交由Proxy代理服务器组)
- `- DOMAIN,google.com,Proxy`               # 匹配域名(交由Proxy代理服务器组)
- `- DOMAIN-SUFFIX,ad.com,REJECT`           # 匹配域名后缀(拒绝)
- `- IP-CIDR,127.0.0.0/8,DIRECT`            # 匹配数据目标IP(直连)
- `- SRC-IP-CIDR,192.168.1.201/32,DIRECT`   # 匹配数据发起IP(直连)
- `- DST-PORT,80,DIRECT`                    # 匹配数据目标端口(直连)
- `- SRC-PORT,7777,DIRECT`                  # 匹配数据源端口(直连)

但主要用到的是域名或者关键字

- `DOMAIN-SUFFIX,google.com,Proxy`          # 匹配域名后缀(交由Proxy代理服务器组)
- `DOMAIN-KEYWORD,google,Proxy`             # 匹配域名关键字(交由Proxy代理服务器组)
  - Proxy   代表要代理
  - DIRECT  代表不走代理
  - REJECT  代表拒绝

根据自己的需求来配置规则

### 3. 保存规则

![img](./img/101/101-16.png)

### 4. 查看规则是否生效
运行状态 -> YACD控制面板 -> 规则，可以查看上面设置的规则

![img](./img/101/101-19.png)

![img](./img/101/101-20.png)

## 八. 自定义策略
### 1. 读取配置
进入OpenClash -> 一键生成 -> 读取配置。读取已有的配置信息

![img](./img/101/101-23.png)

![img](./img/101/101-24.png)

### 2. 添加策略

![img](./img/101/101-25.png)

![img](./img/101/101-27.png)

### 3. 为策略添加节点
这步是可选的，如果你在创建策略的时候选择了子策略后，已经满足你的需求，那可以不用单独添加节点

![img](./img/101/101-28.png)

![img](./img/101/101-29.png)

![img](./img/101/101-30.png)

### 4. 应用配置

![img](./img/101/101-31.png)
 
查看策略是否生效

![img](./img/101/101-32.png)
 
### 5. 使用自定义策略
进入OpenClash -> 覆写设置 -> 规则设置。添加一条规则，比如将`baidu.com`加入这个自定义策略组

![img](./img/101/101-33.png)

网页输入 `www.baidu.com`，可以看到`baidu.com`下的内容都走的设置的代理。

![img](./img/101/101-34.png)

## 九. 遇到的问题
### 1. 上传安装包报错，软件安装失败
openwrt opkg执行错误

解决方式：

在iStoreOS默认目录下执行修改配置命令

```bash
vim opkgupdate.sh
```

```bash
#!/bin/sh
echo "nameserver 114.114.114.114">/tmp/resolv.conf
rm -f /var/lock/opkg.lock
opkg update
```

输入`:wq`保存退出

```bash
chmod a+x ./opkgdagte.sh
./opkgdage.sh
```

### 2. Dashboard面板的连接看不到内容
解决办法：查看自己的电脑是否开启了Charles这样的代理软件，把软件关闭。

### 3. 配置好后，外网无法连接
解决办法：把实验性：绕过中国大陆 IP选项关闭

![img](./img/101/101-8.png)
 

## 十. 视频教程
<video src="https://youtu.be/Lwc1TQC-yxo" width="800px" height="600px" controls="controls"></video>

## 十一. 网友反馈
![img](./img/101/101-35.png)

![img](./img/101/101-36.png)
