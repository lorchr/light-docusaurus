- [Offical](https://www.home-assistant.io)
- [Offical Github](https://github.com/home-assistant/operating-system)
- [Offical Install Document For Generic X86](https://www.home-assistant.io/installation/generic-x86-64)
- [Offical Install Document For Virtual Machine](https://www.home-assistant.io/installation/alternative)

## 物理机安装
1. 从[官网](https://www.home-assistant.io/installation/generic-x86-64)或[Github](https://github.com/home-assistant/operating-system/releases)下载 img 镜像
2. 下载并启动[Balena Etcher](https://www.balena.io/etcher)，制作引导U盘
3. 进入BIOS，启用 UEFI 引导模式，禁用安全启动
4. 将引导U盘插入X86机器，进入BIOS选择U盘启动，按照指导进行安装
5. 安装完成后进入虚拟机控制台，输入 `banner` 查看系统IP
6. 用浏览器访问: `http://192.168.0.105:8123` 进入HA主页

## Esxi安装
1. 从[官网](https://www.home-assistant.io/installation/alternative)或[Github](https://github.com/home-assistant/operating-system/releases)下载 ova 镜像
2. 在Esxi创建虚拟机，选择下载的ova文件，然后按照指导进行安装
3. 安装完成后进入虚拟机控制台，输入 `banner` 查看系统IP
4. 用浏览器访问: `http://192.168.0.105:8123` 进入HA主页

## PVE安装
1. 从[官网](https://www.home-assistant.io/installation/alternative)或[Github](https://github.com/home-assistant/operating-system/releases)下载 qcow2 镜像
2. 在PVE创建虚拟机，选择下载的qcow2文件，然后按照指导进行安装
3. 安装完成后进入虚拟机控制台，输入 `banner` 查看系统IP
4. 用浏览器访问: `http://192.168.0.105:8123` 进入HA主页

## 配置网络
系统在初始化时需要从Github下载文件，大概率会下载失败，先连接软路由设置网络

```shell
# 打印网络信息
banner

# 登录
login

# 查看网络状态
nmcli dev status

# 进入编辑模式（编辑 Supervisor enp2s1）
nmcli con edit "Supervisor enp2s1"

# 查看当前配置
print ipv4

# 设置网络模式
set ipv4.method manual

# 设置HA运行的ip地址（注意：这里的IP为你想要HA运行的地址，并且IP地址后面的子网掩码“/24”不要漏掉）
set ipv4.addresses 192.168.0.211/24

#Ps：第一次修改ip地址会提示是否改为“手动”设置，输入y确认即可

# 设置dns为软路由网关（注意：这里的IP地址为你的旁路由地址）
set ipv4.dns 192.168.0.254

# 设置Hass网关为软路由网关（注意：这里的IP地址为你的旁路由地址）
set ipv4.gateway 192.168.0.254

# 设置网卡开机自动连接
set connection.autoconnect yes

# 再次查看配置信息
print ipv4

# 保存
save

# 退出编辑
quit

# 重新载入
nmcli con reload

# 重新启动Hass系统
reboot
```

再次访问 `http://192.168.0.211:8123` 等待下载完成

设置初始化管理员账号密码
