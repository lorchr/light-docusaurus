
- [官方文档](https://openwrt.org/zh-cn/doc/howto/obtain.firmware.generate)
- [官方论坛教程](https://forum.openwrt.org/t/online-imagebuilder-and-upgrade-server/18110)
- [第七天堂 openwrt 使用官方自定义构建](https://blog.7theaven.top/2023/12/01/openwrt-使用官方自定义构建/)
- [恩山论坛 官方openwrt免费在线云编译，支持所有官方openwrt设备，人人都能DIY属于自己的固件](https://www.right.com.cn/forum/thread-8237057-1-1.html)
- [恩山论坛 【2022/10/22】自编译官方openwrt固件，可安装官方源里的驱动，内核模块 ](https://www.right.com.cn/forum/thread-8236646-1-6.html)
- [编译官方原版的openwrt并加入第三方软件包](https://blog.csdn.net/qq_33195791/article/details/138462502)

### openwrt官方云编译
openwrt官方云编译地址：
https://asu.aparcar.org
https://firmware-selector.openwrt.org/

官方论坛线程：
https://forum.openwrt.org/t/online-imagebuilder-and-upgrade-server/18110

联动下我另一个贴：https://www.right.com.cn/forum/thread-8236646-1-6.html
另一个贴所讲和这个是通用的。
论坛里虽然有自带超多插件的固件，但如果你的需求比较小众固件里没有你无法自己安装，设备比较小众没有驱动你也无法安装。
官方固件可以安装官方源里的9千多个软件包，官方源里没有的也可以下载sdk自己编译安装。
上面的地址可以自己DIY一个属于自己的官方openwrt固件，可以安装官方源里所有的软件，内核模块，驱动。


上图里显示的是官方固件自带的软件和驱动，可以看出来很少，也没有中文。
在软件栏加个luci-i18n-base-zh-cn，点下面的编译等几分钟就能得到一个带中文的官方固件。
你可以添加你想要的软件，只需写个软件名。

只能集成官方源里的软件，内核模块，驱动。
集成其他软件跟我上个贴里写的安装软件同理，不需要写一大堆软件名。
比如要集成DDNS，只需要软件栏加个ddns语言包名字luci-i18n-ddns-zh-cn。点下面的编译等几分钟就能得到一个带中文ddns的官方固件。
建议必集成luci兼容库：luci-compat
官方openwrt使用有问题也可以帖子里问。
openwrt官网：https://openwrt.org/
openwrt官方论坛：https://forum.openwrt.org/
github：https://github.com/openwrt/openwrt
openwrt官方软件列表：https://openwrt.org/packages/table/start
实用教程：https://github.com/xiaorouji/openwrt-passwall/discussions/1603

看不懂就用chrome或edge网页翻译

---

### 自编译官方openwrt固件

10月12日更新2个稳定版

21.02.4集成PW，22.03.1集成的是xray没有集成PW：https://github.com/yichya/luci-app-xray

21.02.4官方升级日志：https://openwrt.org/releases/21.02/notes-21.02.4

22.03.1官方升级日志：https://openwrt.org/releases/22.03/notes-22.03.1

自编译官方openwrt x86本地化极简固件，基于官方稳定版源码。跟随官方更新。
与官方的区别自带中文和PW，集成i225网卡驱动，软件安装空间1G。
固件无个人信息。
可安装官方源里的软件、内核模块、驱动。见下图。
固件不集成多余插件，自己想要什么自己在线安装。
编译的目的是希望有更多人使用官方openwrt。
openwrt官网：https://openwrt.org/
openwrt官方论坛：https://forum.openwrt.org/
github：https://github.com/openwrt/openwrt
官方openwrt下载地址：https://downloads.openwrt.org/
推荐自己DIY云编译：https://www.right.com.cn/forum/thread-8237057-1-1.html
官方openwrt中文语言包：luci-i18n-base-zh-cn
后台地址：192.168.1.1 用户名：root  无密码
自编译和PW手动安装包下载地址：
https://pan.baidu.com/s/1FNH5Ga7Qs-fXpyS7-f8qjg?pwd=7kd9


安装软件依赖比较多时可能会出现图中错误，不用管，官方bug，一般都是安装成功了。不要一直点安装。


写点官方openwrt的安装软件小技巧
手动安装软件，以安装小猫咪为例，从github下载安装包。手动上传安装，可能安装失败如下图


这是因为缺少依赖且没更新软件列表（手动安装软件更新软件列表很重要很重要很重要）
更新软件列表后手动安装小猫咪，缺失的依赖会自动安装，不需要自己一个个安装。同适用在线安装软件。


在线安装软件，以安装upnp为例。搜zh-cn，直接装luci-i18n-upnp-zh-cn语言包，会自动安装luci-upnp、核心、依赖。
也适用安装其他软件，有语言包直接安装语言包。没有语言包直接安装luci。没有语言包和luci，直接安装核心。

---

### openwrt 使用官方自定义构建

openwrt 官方有了自定义构建，这样可以预先内置 / 修改一些自己需要软件包而不需要安装完成后再去处理了，省时方便~

首先打开 openwrt 官网固件下载页 https://firmware-selector.openwrt.org/

然后输入设备，选择自己需要的固件，展开 自定义已安装的软件包和/或首次启动脚本 项，就可以对固件进行自定义了：


已安装的软件包：这里默认是官方固件里面自带的，可以酌情进行增删！

- dnsmasq 替换为 dnsmasq-full
- 加入中文语言包：luci-i18n-base-zh-cn luci-i18n-firewall-zh-cn luci-i18n-opkg-zh-cn
- 加入 WireGuard：luci-proto-wireguard

首次启动时运行的脚本（uci-defaults）：这里可以调整一些配置，比如默认 IP 等，官方还给了一个示例：
```shell
# Beware! This script will be in /rom/etc/uci-defaults/ as part of the image.
# Uncomment lines to apply:
#
# wlan_name="OpenWrt"
# wlan_password="12345678"
#
# root_password=""
# lan_ip_address="192.168.1.1"
#
# pppoe_username=""
# pppoe_password=""
 
# log potential errors
exec >/tmp/setup.log 2>&1
 
if [ -n "$root_password" ]; then
  (echo "$root_password"; sleep 1; echo "$root_password") | passwd > /dev/null
fi
 
# Configure LAN
# More options: https://openwrt.org/docs/guide-user/base-system/basic-networking
if [ -n "$lan_ip_address" ]; then
  uci set network.lan.ipaddr="$lan_ip_address"
  uci commit network
fi
 
# Configure WLAN
# More options: https://openwrt.org/docs/guide-user/network/wifi/basic#wi-fi_interfaces
if [ -n "$wlan_name" -a -n "$wlan_password" -a ${#wlan_password} -ge 8 ]; then
  uci set wireless.@wifi-device[0].disabled='0'
  uci set wireless.@wifi-iface[0].disabled='0'
  uci set wireless.@wifi-iface[0].encryption='psk2'
  uci set wireless.@wifi-iface[0].ssid="$wlan_name"
  uci set wireless.@wifi-iface[0].key="$wlan_password"
  uci commit wireless
fi
 
# Configure PPPoE
# More options: https://openwrt.org/docs/guide-user/network/wan/wan_interface_protocols#protocol_pppoe_ppp_over_ethernet
if [ -n "$pppoe_username" -a "$pppoe_password" ]; then
  uci set network.wan.proto=pppoe
  uci set network.wan.username="$pppoe_username"
  uci set network.wan.password="$pppoe_password"
  uci commit network
fi
 
echo "All done!"
```

这里再补充一些设置：
```shell
# 设置时区
uci set system.@system[0].zonename='Asia/Shanghai'
uci set system.@system[0].timezone='CST-8'
 
uci commit
 
# 设置软件源（清华源）
sed -i 's/downloads.openwrt.org/mirrors.tuna.tsinghua.edu.cn\/openwrt/g' /etc/opkg/distfeeds.conf
```

最后点击请求构建，等待官方镜像构建完毕，即可在下面下载到啦~



---

### 测试安装
```shell
base-files busybox ca-bundle dnsmasq-full dropbear e2fsprogs firewall4 fstools grub2-bios-setup kmod-button-hotplug kmod-nft-offload libc libgcc libustream-mbedtls logd mkf2fs mtd netifd nftables odhcp6c odhcpd-ipv6only opkg partx-utils ppp ppp-mod-pppoe procd procd-seccomp procd-ujail uci uclient-fetch urandom-seed urngd kmod-3c59x kmod-8139too kmod-e100 kmod-e1000 kmod-natsemi kmod-ne2k-pci kmod-pcnet32 kmod-r8169 kmod-sis900 kmod-tg3 kmod-via-rhine kmod-via-velocity kmod-forcedeth kmod-fs-vfat luci luci-i18n-base-zh-cn luci-i18n-firewall-zh-cn luci-i18n-opkg-zh-cn luci-proto-wireguard luci-i18n-ddns-zh-cn luci-compat luci-i18n-upnp-zh-cn
```

- dnsmasq 改为 dnsmasq-full
- luci-compat 兼容包
- luci-i18n-base-zh-cn luci-i18n-firewall-zh-cn luci-i18n-opkg-zh-cn luci-proto-wireguard luci-i18n-ddns-zh-cn luci-i18n-upnp-zh-cn

```shell
# Beware! This script will be in /rom/etc/uci-defaults/ as part of the image.
# Uncomment lines to apply:
#
# wlan_name="OpenWrt"
# wlan_password="12345678"
#
# root_password=""
# lan_ip_address="192.168.1.1"
#
# pppoe_username=""
# pppoe_password=""
 
# log potential errors
exec >/tmp/setup.log 2>&1
 
if [ -n "$root_password" ]; then
  (echo "$root_password"; sleep 1; echo "$root_password") | passwd > /dev/null
fi
 
# Configure LAN
# More options: https://openwrt.org/docs/guide-user/base-system/basic-networking
if [ -n "$lan_ip_address" ]; then
  uci set network.lan.ipaddr="$lan_ip_address"
  uci commit network
fi
 
# Configure WLAN
# More options: https://openwrt.org/docs/guide-user/network/wifi/basic#wi-fi_interfaces
if [ -n "$wlan_name" -a -n "$wlan_password" -a ${#wlan_password} -ge 8 ]; then
  uci set wireless.@wifi-device[0].disabled='0'
  uci set wireless.@wifi-iface[0].disabled='0'
  uci set wireless.@wifi-iface[0].encryption='psk2'
  uci set wireless.@wifi-iface[0].ssid="$wlan_name"
  uci set wireless.@wifi-iface[0].key="$wlan_password"
  uci commit wireless
fi
 
# Configure PPPoE
# More options: https://openwrt.org/docs/guide-user/network/wan/wan_interface_protocols#protocol_pppoe_ppp_over_ethernet
if [ -n "$pppoe_username" -a "$pppoe_password" ]; then
  uci set network.wan.proto=pppoe
  uci set network.wan.username="$pppoe_username"
  uci set network.wan.password="$pppoe_password"
  uci commit network
fi


# 设置时区
uci set system.@system[0].zonename='Asia/Shanghai'
uci set system.@system[0].timezone='CST-8'
 
uci commit
 
# 设置软件源（中科大源）
sed -i 's/downloads.openwrt.org/mirrors.ustc.edu.cn\/openwrt/g' /etc/opkg/distfeeds.conf

echo "All done!"

```