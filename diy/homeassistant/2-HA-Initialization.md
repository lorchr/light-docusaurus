
## 官方插件市场
### 安装需知
1. 启用插件需要开启高级模式，在【账户】-【高级模式】中开启
2. 官方插件在【配置】-【加载项】中安装
3. 安装完成后检查插件的【配置】Tab页是否有需要配置的项目
4. 启动前可将除了【自动更新】外的所有功能勾选，例如【自动启动】、【守护进程】、【显示在到左侧菜单栏】

### 推荐安装的插件列表
以下插件在【配置】-【加载项】中

1. Terminal     Web端命令行
2. Samba Share  局域网文件共享
3. File Editor  可视化文本编辑器
4. Mosquitto    MQTT服务端
5. Node-Red     自动化脚本编辑
6. ESP Home     通过YAML 控制管理传感器

以下插件在【配置】-【集成与服务】中

1. HACS         社区插件商店
2. OpenWrt      配置监控OpenWrt
3. Upnp/IGD     TP-Link

## HACS(Home Assistant Community Store) 插件
### 安装 HACS 社区插件商店
1. 打开Terminal，执行下面的命令

```shell
# 官方地址
wget -O - https://get.hacs.xyz | bash -
# 国内加速地址
wget -O - https://hacs.vip/get | bash -
# 国内加速地址
wget -O - https://hacs.vip/get | HUB_DOMAIN=ghproxy.com/github.com bash -
# cdn代理地址 不可用
wget -O - https://cdn.jsdelivr.net/gh/hasscc/get@main/get | HUB_DOMAIN=ghproxy.com/github.com DOMAIN=hacs REPO_PATH=hacs-china/integration ARCHIVE_TAG=china bash -
```

2. 在【配置】-【集成】中搜索【HACS】

### 安装插件
进入HACS安装常用插件

1. Xiaomi MIot Auto
2. Tuya
3. Yeelight
4. Zigbee
5. Homekit
6. Mushroom
7. iKuai
8. 天气预报
9. 彩云天气

## 配置插件
### OpenWrt
- [HA官方 OpenWrt配置文档](https://www.home-assistant.io/integrations/luci)
- [HA官方 设备追踪配置文档](https://www.home-assistant.io/integrations/device_tracker/)

1. 在OpenWrt中打开终端安装依赖

```shell
# 更新软件列表
opkg update

# 安装依赖模块
opkg install luci-mod-rpc
```

2. 编辑HA配置文件`configuration.yaml`

```shell
vim /root/homeassistant/configuration.yaml

# Example configuration.yaml entry
device_tracker:
  - platform: luci
    host: 192.168.0.254
    username: root
    password: password
```

### 翻页时钟
- [翻页时钟](https://github.com/liaoliao007/leoha/)
1. 下载前端库
2. 将`clock`文件夹粘贴到 `www` 下

### 天气预报
1. 在HACS中添加自定义仓库[天气预报](https://github.com/hasscc/tianqi)
3. 在【配置】-【集成与服务】中添加`天气预报`
   - 服务域: `weather.com.cn `
   - 地点: 武汉

### 彩云天气
1. HACS安装集成 `彩云天气`
2. 安装前端，从刚才安装的集成介绍页进去，复制[前端库地址](https://github.com/fineemb/lovelace-colorfulclouds-weather-card)
3. 选择`自定义仓库`，贴上前端库地址，类别选择 `Lovelace`
4. 去彩云天气官网[申请key](https://platform.caiyunapp.com/login?redirect=/dashboard)
5. 注册账号-身份认证之后，创建应用，类型选`天气`，场景选`气象服务`
6. ，添加成功后复制Token
7. 进入【配置】-【设备与集成】，添加集成`colorfulclouds`，粘贴刚才复制的key即可
8. 修改彩云天气的调用频率（免费版每天只有1w次，默认6分钟一次）

```shell
cd /custom_components/colorfulclouds

# 编辑 __init__.py
vim __init__.py
将 update_interval 的值从 6 改为 30 
```

### windy天气
1. 打开[windy天气官网](https://windy.com)，找到目标地址
2. 点击左侧`菜单`-`页面嵌入式微件`，选中以下项目，复制代码
    - 在中间显示标记
    - 等压线
    - Include spot forecast

```html
<iframe width="650" height="450" src="https://embed.windy.com/embed2.html?lat=30.436&lon=114.432&detailLat=30.489&detailLon=114.432&width=650&height=450&zoom=11&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1" frameborder="0"></iframe>
```

### 编辑天气 时钟页面
1. 概览-编辑仪表盘-管理仪表盘-添加仪表盘，输入名称图标即可，
2. 进入新仪表盘，添加卡片，类型选`垂直堆叠`
3. 翻页时钟配置：编辑垂直堆叠，类型选`网页`
   - 名称: 翻页时钟
   - URL: `/local/clock/index.html`
4. 彩云天气配置: 编辑垂直堆叠，点击 `+` 符号，新建卡片，类型选择`自定义 Colorfulclouds`
   - 勾选 `详细预报`，`小时预报`
3. Windy天气配置：编辑垂直堆叠，类型选`网页`
   - 名称: Windy天气
   - URL: 上面Windy天气html代码中SRC的值
