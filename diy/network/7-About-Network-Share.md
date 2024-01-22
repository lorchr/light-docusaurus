- [将科学上网环境共享给局域网内其它设备的各种方式](https://bulianglin.com/archives/sharenetwork.html)
- [OpenWrt实现4G/5G网络共享+公网IPv6地址透传分配](https://zhuanlan.zhihu.com/p/624187071)

## 一、网络共享的分类
1. 代理共享模式
2. 网关共享模式
3. 路由共享模式

## 二、代理共享模式(http/socks)

- 特点：几乎所有代理工具都支持
- 操作：一台设备开启VPN后，其他设备设置代理，指向该设备
- 弊端：每个客户端都需要单独设置代理，部分软件可能不会走代理

### Windows端
- [v2rayN](https://github.com/2dust/v2rayN/releases/latest)
- [Clash for Windows](https://github.com/Fndroid/clash_for_windows_pkg/releases/latest)

### Android端
- [v2rayNG](https://github.com/2dust/v2rayNG/releases/latest)
- [Clash for Android](https://github.com/Kr328/ClashForAndroid/releases/latest)

### Mac IOS端
- [Shadowrocket](https://apps.apple.com/us/app/shadowrocket/id932747118)
- [Quantumult](https://apps.apple.com/us/app/quantumult-x/id1443988620)

## 三、网关共享模式
- 特点：对客户端透明，所有流量都会经过网关，避免部分流量不走代理
- 操作：一台设备开启代理，并开启ip转发，其他设备将网关指向该设备
- 弊端：每个客户端都需要单独设置网关

Windows系统不支持

- [安卓手机充当旁路网关](https://youtu.be/r6nXCgYkXTQ)
- Mac、Linux使用clash的`TUN模式`并`开启ip转发`
  - Linux开启ip转发：`sysctl -w net.ipv4.ip_forward=1`
  - Mac开启ip转发：`sysctl -w net.inet.ip.forwarding=1`

Mac系统也可以直接使用[ClashX Pro](https://install.appcenter.ms/users/clashx/apps/clashx-pro/distribution_groups/public)的`增强模式`实现

## 四、路由共享模式
- 特点：对客户端透明，所有流量都会经过路由，不需要客户端额外设置
- 操作：一台设备开启代理，并开启ip转发，其他设备将DNS指向该设备
- 弊端：多了一层NAT转发

- Windows网卡共享
- 安卓手机Wi-Fi (USB) 共享VPN网络
  - 部分手机自带该功能
  - [VPNHotspot](https://github.com/Mygod/VPNHotspot/releases/latest) VPNHotspot需要root才能使用



- [V2Ray Offical Document](https://www.v2ray.com/)
- [V2Ray Simplified Document 1](https://toutyrater.github.io/)
- [V2Ray Simplified Document 2](https://guide.v2fly.org/)

## V2Ray客户端
1. Windows
   - [v2rayN](https://github.com/2dust/v2rayN) 
   - [V2RayW](https://github.com/Cenmrev/V2RayW)

2. Linux
   - [Qv2ray](https://github.com/Qv2ray/Qv2ray) 
   - [Mellow](https://github.com/mellow-io/mellow) 

3. Mac OS
   - [V2RayX](https://github.com/Cenmrev/V2RayX) 
   - [V2rayU](https://github.com/yanue/V2rayU)


4. Android
   - [v2rayNG](https://github.com/2dust/v2rayNG) 
