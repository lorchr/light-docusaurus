- [Offical](https://www.home-assistant.io)
- [Offical Github](https://github.com/home-assistant/operating-system)

## 安装系统
- [Offical Install Document For Generic X86](https://www.home-assistant.io/installation/generic-x86-64)

1. 进入BIOS，启用 UEFI 引导模式，禁用安全启动
2. 下载并启动[Balena Etcher](https://www.balena.io/etcher)
3. [下载HA镜像](https://github.com/home-assistant/operating-system/releases/download/11.1/haos_generic-x86-64-11.1.img.xz)
4. 将引导U盘插入X86机器，进入BIOS选择U盘启动，按照指导进行安装
5. 安装完成后用浏览器访问: `http://X.X.X.X:8123` 进入HA主页

## 开始使用
- [Onboarding Home Assistant](https://www.home-assistant.io/getting-started/onboarding/)

### 官方插件市场
#### 安装需知
1. 启用插件需要开启高级模式，在【账户】-【高级模式】中开启
2. 官方插件在【配置】-【加载项】中安装
3. 安装完成后检查插件的【配置】Tab页是否有需要配置的项目
4. 启动前可将除了【自动更新】外的所有功能勾选，例如【自动启动】、【守护进程】、【显示在到左侧菜单栏】

#### 推荐安装的插件列表
1. Terminal     Web端命令行
2. Samba Share  局域网文件共享
3. File Editor  可视化文本编辑器
4. Mosquitto    MQTT服务端
5. Node-Red     自动化脚本编辑
6. ESP Home     通过YAML 控制管理传感器

### HACS(Home Assistant Community Store) 插件
#### 安装HACS 社区插件商店
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

#### 安装插件
1. Xiaomi MIot Auto
2. Tuya
3. Yeelight
4. Zigbee
5. Homekit
6. Mushroom


## 配置
- [Configuration.yaml](https://www.home-assistant.io/docs/configuration/)



## 自动化
- [Automating Home Assistant](https://www.home-assistant.io/docs/automation/)



## 脚本
- [Script Syntax](https://www.home-assistant.io/docs/scripts/)



## 仪表盘
- [Dashboards](https://www.home-assistant.io/dashboards/)



## 语音助手
- [Assist - Talking to Home Assistant](https://www.home-assistant.io/voice_control/)



