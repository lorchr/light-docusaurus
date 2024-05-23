# OpenWrt

## 一、系统安装
- [OpenWrt 官方版](https://downloads.openwrt.org/releases)
- [Lede 社区版](https://github.com/coolsnowwolf/lede/releases)
- [iStoreOS 国内版](https://fw.koolcenter.com/iStoreOS)

- [官方在线构建](https://firmware-selector.openwrt.org/)
- [自定义编译](https://openwrt.ai)

### 1. 安装系统（官方版）
1. 安装系统，[下载地址](https://downloads.openwrt.org/releases)
2. 配置Lan地址与路由器同网段

```shell
# 编辑网络地址
vim /etc/config/network
# 将 192.168.1.1 改为路由器网段地址，如: 192.168.0.251

# 重启网络
/etc/init.d/network restart

# 重启系统
reboot now
```

3. 配置网关DNS

安装完先去 [Network] - [Interfaces] 里面配置网关及DNS，否则无法联网
- 网关 `192.168.0.1`
- DNS `114.114.114.114`

4. 安装中文

```shell
# 测试网络
ping -c 4 jd.com

# 切换清华源
sed -i 's$downloads.openwrt.org$mirrors.tuna.tsinghua.edu.cn/openwrt$' /etc/opkg/distfeeds.conf

# 更新软件列表
opkg update

# 安装中文
opkg install luci-i18n-base-zh-cn luci-i18n-firewall-zh-cn luci-i18n-opkg-zh-cn luci-i18n-attendedsysupgrade-zh-cn
```

5. 安装主题 `luci-theme-argon`

```shell
# 更新软件源
opkg update

# 安装环境 主要是lua运行时
opkg install luci-compat luci-lib-ipkg

# 从页面下载官方安装包
# https://github.com/jerrykuku/luci-theme-argon/releases
```

### 2. 自己编译OpenWrt

以下以[官方在线构建](https://firmware-selector.openwrt.org/)为例

1. 添加自定义包

```shell
# 首先是自定义包，目前官方包没有提供网页UI，所以我们需要将网页UI加上，在已安装的软件包末尾加上如下包：
luci luci-i18n-base-zh-cn luci-i18n-firewall-zh-cn luci-i18n-opkg-zh-cn luci-i18n-attendedsysupgrade-zh-cn
```

2. 可选包
   - `wpad-basic-mbedtls`替换为`wpad-mbedtls`   无线漫游KVR
   - `dnsmasq`替换为`dnsmasq-full`              部分学习强国工具需要

3. 自定义脚本

自定义脚本分为路由器版和AP版，注意替换脚本中中文内容
```shell
# 路由
uci del network.wan6
uci set network.wan.proto='pppoe'
uci set network.wan.username='拨号账号'
uci set network.wan.password='拨号密码'
uci set network.wan.ipv6='auto'
uci set network.lan.ipaddr='路由器IP'

uci set system.@system[0].zonename='Asia/Shanghai'
uci set system.@system[0].timezone='CST-8'
uci set system.@system[0].hostname=Router

uci set wireless.@wifi-device[0].channel='auto'
uci set wireless.@wifi-device[0].disabled=0
uci set wireless.@wifi-device[0].country='CN'
uci set wireless.@wifi-iface[0].ssid='2.4GWIFI名称'
uci set wireless.@wifi-iface[0].encryption='sae-mixed'
uci set wireless.@wifi-iface[0].key='2.4G无线密码'

uci set wireless.@wifi-iface[0].ieee80211k=1
uci set wireless.@wifi-iface[0].wnm_sleep_mode=1
uci set wireless.@wifi-iface[0].bss_transition=1
uci set wireless.@wifi-iface[0].ieee80211r=1
uci set wireless.@wifi-iface[0].mobility_domain=8888
uci set wireless.@wifi-iface[0].ft_over_ds=0
uci set wireless.@wifi-iface[0].ft_psk_generate_local=0


uci set wireless.@wifi-device[1].channel='auto'
uci set wireless.@wifi-device[1].disabled=0
uci set wireless.@wifi-device[1].country='CN'
uci set wireless.@wifi-iface[1].ssid='5GWIFI名称'
uci set wireless.@wifi-iface[1].encryption='sae'
uci set wireless.@wifi-iface[1].key='5G无线密码'

uci set wireless.@wifi-iface[1].ieee80211k=1
uci set wireless.@wifi-iface[1].wnm_sleep_mode=1
uci set wireless.@wifi-iface[1].bss_transition=1
uci set wireless.@wifi-iface[1].ieee80211r=1
uci set wireless.@wifi-iface[1].mobility_domain=8888
uci set wireless.@wifi-iface[1].ft_over_ds=0
uci set wireless.@wifi-iface[1].ft_psk_generate_local=0

uci set firewall.@defaults[0].flow_offloading='1'
uci set firewall.@defaults[0].flow_offloading_hw='1'

uci commit

/etc/init.d/firewall restart
/etc/init.d/system restart
/etc/init.d/network restart

sed -i 's/downloads.openwrt.org/mirrors.ustc.edu.cn\/openwrt/g' /etc/opkg/distfeeds.conf
```

```shell
# AP
uci del network.wan6
uci del network.wan
uci set network.lan.ipaddr='路由器IP'

uci set system.@system[0].zonename='Asia/Shanghai'
uci set system.@system[0].timezone='CST-8'
uci set system.@system[0].hostname=AP0

uci set wireless.@wifi-device[0].channel='auto'
uci set wireless.@wifi-device[0].disabled=0
uci set wireless.@wifi-device[0].country='CN'
uci set wireless.@wifi-iface[0].ssid='2.4GWIFI名称'
uci set wireless.@wifi-iface[0].encryption='sae-mixed'
uci set wireless.@wifi-iface[0].key='2.4G无线密码'

uci set wireless.@wifi-iface[0].ieee80211k=1
uci set wireless.@wifi-iface[0].wnm_sleep_mode=1
uci set wireless.@wifi-iface[0].bss_transition=1
uci set wireless.@wifi-iface[0].ieee80211r=1
uci set wireless.@wifi-iface[0].mobility_domain=8888
uci set wireless.@wifi-iface[0].ft_over_ds=0
uci set wireless.@wifi-iface[0].ft_psk_generate_local=0


uci set wireless.@wifi-device[1].channel='auto'
uci set wireless.@wifi-device[1].disabled=0
uci set wireless.@wifi-device[1].country='CN'
uci set wireless.@wifi-iface[1].ssid='5GWIFI名称'
uci set wireless.@wifi-iface[1].encryption='sae'
uci set wireless.@wifi-iface[1].key='5G无线密码'

uci set wireless.@wifi-iface[1].ieee80211k=1
uci set wireless.@wifi-iface[1].wnm_sleep_mode=1
uci set wireless.@wifi-iface[1].bss_transition=1
uci set wireless.@wifi-iface[1].ieee80211r=1
uci set wireless.@wifi-iface[1].mobility_domain=8888
uci set wireless.@wifi-iface[1].ft_over_ds=0
uci set wireless.@wifi-iface[1].ft_psk_generate_local=0

uci set firewall.@defaults[0].flow_offloading='1'
uci set firewall.@defaults[0].flow_offloading_hw='1'

uci commit

/etc/init.d/firewall restart
/etc/init.d/system restart
/etc/init.d/network restart

for i in firewall dnsmasq odhcpd; do
  if /etc/init.d/"$i" enabled; then
    /etc/init.d/"$i" disable
    /etc/init.d/"$i" stop
  fi
done

sed -i 's/downloads.openwrt.org/mirrors.ustc.edu.cn\/openwrt/g' /etc/opkg/distfeeds.conf
```

4. 安装第三方包

如果不出意外的话，刷入镜像后直接启动就可以联网，我们进入路由器后台，密码默认为空。

访问 `系统` → `软件包` → `配置OPKG`。

接下来首先修改`/etc/opkg.conf`，删去`option check_signature`。

接下来向`/etc/opkg/customfeeds.conf`添加自定义软件源，具体软件源可以从 `https://github.com/kiddin9/openwrt-packages` 中获取。

一切编辑完成后点击保存并点击更新列表即可。

## 二、插件列表
- [插件合集 NueXini/NueXini_Packages](https://github.com/NueXini/NueXini_Packages)
- [插件合集 liuran001/openwrt-packages](https://github.com/liuran001/openwrt-packages)
- [插件合集 ysx88/openwrt-packages](https://github.com/ysx88/openwrt-packages)
- [全平台客户端](https://binghe.gitbook.io/fq/)

---

- V2Ray支持 [kuoruan/openwrt-v2ray](https://github.com/kuoruan/openwrt-v2ray) For [Download](https://github.com/kuoruan/openwrt-v2ray/releases/latest)
- V2Ray支持 [kuoruan/luci-app-v2ray](https://github.com/kuoruan/luci-app-v2ray) For [Download](https://github.com/kuoruan/luci-app-v2ray/releases/latest)
- OpenClash支持 [vernesong/OpenClash](https://github.com/vernesong/OpenClash) For [Download](https://github.com/vernesong/OpenClash/releases/latest)
- Clash支持 [frainzy1477/luci-app-clash](https://github.com/frainzy1477/luci-app-clash) For [Download](https://github.com/frainzy1477/luci-app-clash/releases/latest)
- shadowsocks [shadowsocks/luci-app-shadowsocks](https://github.com/shadowsocks/luci-app-shadowsocks) For [Download](https://github.com/shadowsocks/luci-app-shadowsocks/releases/latest) [依赖](https://github.com/shadowsocks/openwrt-shadowsocks/releases/latest)
- SSR [WangWenBin2017/OpenWrt-SSRPLUS](https://github.com/WangWenBin2017/OpenWrt-SSRPLUS) For [Download](https://github.com/WangWenBin2017/OpenWrt-SSRPLUS/releases/latest)
- SSR Plus[maxlicheng/luci-app-ssr-plus](https://github.com/maxlicheng/luci-app-ssr-plus) For [Download](https://github.com/maxlicheng/luci-app-ssr-plus/releases/latest)
- Passwall [xiaorouji/openwrt-passwall](https://github.com/xiaorouji/openwrt-passwall) For [Download](https://github.com/xiaorouji/openwrt-passwall/tree/4.71-2)
- Passwall2 [xiaorouji/openwrt-passwall2](https://github.com/xiaorouji/openwrt-passwall2) For [Download](https://github.com/xiaorouji/openwrt-passwall2/tree/1.21-3)
- V2RayA [v2rayA/v2raya-openwrt](https://github.com/v2rayA/v2raya-openwrt) For [Download](https://github.com/v2rayA/v2raya-openwrt/releases/latest)

---

- SmartDNS [pymumu/openwrt-smartdns](https://github.com/pymumu/openwrt-smartdns) For [Download](https://github.com/pymumu/openwrt-smartdns/releases/latest)
- SmartDNS [pymumu/luci-app-smartdns](https://github.com/pymumu/luci-app-smartdns) For [Download](https://github.com/pymumu/luci-app-smartdns/releases/latest)
- AdGuardHome [rufengsuixing/luci-app-adguardhome](https://github.com/rufengsuixing/luci-app-adguardhome) For [Download](https://github.com/rufengsuixing/luci-app-adguardhome/releases/latest)
- DNS转发 [sbwml/luci-app-mosdns](https://github.com/sbwml/luci-app-mosdns) For [Download](https://github.com/sbwml/luci-app-mosdns/releases/latest)
- DDNS同步 [sirpdboy/luci-app-ddns-go](https://github.com/sirpdboy/luci-app-ddns-go) For [Download](https://github.com/sirpdboy/luci-app-ddns-go/releases/latest)
- Frp [kuoruan/openwrt-frp](https://github.com/kuoruan/openwrt-frp) For [Download](https://github.com/kuoruan/openwrt-frp/releases/latest)
- Frpc [kuoruan/luci-app-frpc](https://github.com/kuoruan/luci-app-frpc) For [Download](https://github.com/kuoruan/luci-app-frpc/releases/latest)
- 网络测速 [sirpdboy/netspeedtest](https://github.com/sirpdboy/netspeedtest) For [Download](https://github.com/sirpdboy/netspeedtest/releases/latest)

---

- Alist支持 [sbwml/luci-app-alist](https://github.com/sbwml/luci-app-alist) For [Download](https://github.com/sbwml/luci-app-alist/releases/latest)
- 微信推送 [tty228/luci-app-wechatpush](https://github.com/tty228/luci-app-wechatpush) For [Download](https://github.com/tty228/luci-app-wechatpush/releases/latest)
- 阿里云盘 [messense/aliyundrive-webdav](https://github.com/messense/aliyundrive-webdav) For [Download](https://github.com/messense/aliyundrive-webdav/releases/latest)
- 解除网易云音乐播放限制 [UnblockNeteaseMusic/luci-app-unblockneteasemusic](https://github.com/UnblockNeteaseMusic/luci-app-unblockneteasemusic) For [Download](https://github.com/UnblockNeteaseMusic/luci-app-unblockneteasemusic/releases/latest)
- 解除网易云音乐播放限制 [maxlicheng/luci-app-unblockmusic](https://github.com/maxlicheng/luci-app-unblockmusic) For [Download](https://github.com/maxlicheng/luci-app-unblockmusic/releases/latest)

---

- Passwall
- Passwall2
- Clash
- OpenClash
- ShadowSocksRPlus+
- V2Ray
- V2RayA
- Adblocker Plus
- 广告屏蔽大师
- AdGuradHome
- 京东签到服务
- KMS服务器
- 解锁网易灰色歌曲
- Transmission
- 阿里云盘Dav
- Frpc

### 配置OpenClash
1. 检查【插件设置】-【版本更新】检查各个内核是否有显示正确的版本号
   - 如果没有，选择【编译版本（处理器架构）】并点击【检查并更新】，安装内核
2. 在【配置订阅】中添加配置
   - 配置【自动更新】
   - 点击【添加】订阅，输入以下项目，其他可以保持默认，然后【保存配置】
     - 输入【文件名】
     - 粘贴【订阅地址】从机场复制
     - 勾选【在线地址转换】
     - 把停用的改为【启用】
3. 【配置管理】【配置订阅】中会生成一条配置信息，点击【更新配置】
   - 可以在【运行状态】Logo下面看到当前在更新配置，也可以在【运行日志】查看详细日志
4. 回到【运行状态】，点击最下方的【启动OpenClash】
5. 启动完成后点击【打开控制面板】，点击【测速】，测试每个节点的状态，选择一个可用的节点
   - 红色的节点不可用

额外设置
1. 【插件设置】-【DNS设置】-【启用第二个DNS】 设置 `114.114.114.114`
2. 【插件设置】-【GEO数据订阅】 开启全部自动更新


### AdGuard Home


### UnblockNeteaseMusic

