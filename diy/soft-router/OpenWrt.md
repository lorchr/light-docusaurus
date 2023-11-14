# OpenWrt


## 插件列表
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

### OpenClash
1. 检查【插件设置】-【版本更新】检查各个内核是否有显示正确的版本号
   - 如果没有，选择【编译版本（处理器架构）】并点击【检查并更新】，安装内核
2. 在【配置订阅】中添加配置
   - 配置【自动更新】
   - 点击【添加】订阅，输入以下项目，其他可以保持默认，然后【保存配置】
     - 输入【文件名】
     - 粘贴【订阅地址】
     - 勾选【在线地址转换】
     - 把停用的改为【启用】
3. 【配置管理】【配置订阅】中会生成一条配置信息，点击【更新配置】
   - 可以在【运行状态】Logo下面看到当前在更新配置，也可以在【运行日志】查看详细日志
4. 回到【运行状态】，点击最下放的【启动OpenClash】
5. 启动完成后点击【打开控制面板】，点击【测速】，测试每个节点的状态，选择一个可用的节点
   - 红色的节点不可用

额外设置
1. 【插件设置】-【DNS设置】-【启用第二个DNS】 设置 114.114.114.114
2. 【插件设置】-【GEO数据订阅】 开启全部自动更新
