- [PVE 和 Esxi性能对比]( https://kb.blockbridge.com/technote/proxmox-vs-vmware-nvmetcp/)


## 一、PVE安装配置

### 合并local 与 local-lvm
安装PVE后,磁盘空间被默认分为2个

- local      主要用于存放ISO镜像和虚拟机备份文件
- local-lvm  主要用来存放创建的虚拟机文件

合并后的缺点

- 删除Local-lvm后,虚拟机无法快照,只能通过转换磁盘qcow2后才能快照
- LXC容器不支持qcow2虚拟磁盘
- 还有一个就是PVE初步的设计就是为了磁盘隔离,避免一个挂全部挂

合并脚本

```bash
# 移除data目录 按 y 确认
lvremove pve/data

# 将空余磁盘添加到 root
lvextend -l +100%FREE -r pve/root

```

合并后的操作

- 数据中心 - 存储，选择 local-lvm 点击 移除 并确认
- 数据中心 - 存储，选择 local 点击 编辑，在 内容 中选择所有并保存
- 刷新浏览器就变为只剩一个local，磁盘统一，且菜单合并

### 更换PVE企业源，更换Debian源

更换PVE企业源
```bash
ls /etc/apt/sources.list.d

mv /etc/apt/sources.list.d/ceph.list            /etc/apt/sources.list.d/ceph.list.backup
mv /etc/apt/sources.list.d/pve-enterprise.list  /etc/apt/sources.list.d/pve-enterprise.list.backup

wget https://mirrors.ustc.edu.cn/proxmox/debian/proxmox-release-bookworm.gpg -O /etc/apt/trusted.gpg.d/proxmox-release-bookworm.gpg
echo "# deb https://enterprise.proxmox.com/debian/pve bookworm pve-enterprise" > /etc/apt/sources.list.d/pve-enterprise.list
echo "deb https://mirrors.ustc.edu.cn/proxmox/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list

cat /etc/apt/sources.list.d/pve-enterprise.list
cat /etc/apt/sources.list.d/pve-no-subscription.list

```

更换Debian源

```bash
mv /etc/apt/sources.list /etc/apt/sources.list.backup

cat >> /etc/apt/sources.list << EOF
deb http://mirrors.ustc.edu.cn/debian bookworm main contrib non-free
deb-src http://mirrors.ustc.edu.cn/debian bookworm main contrib non-free

deb http://mirrors.ustc.edu.cn/debian bookworm-updates main contrib non-free
deb-src http://mirrors.ustc.edu.cn/debian bookworm-updates main contrib non-free

deb http://mirrors.ustc.edu.cn/debian bookworm-proposed-updates main contrib non-free
deb-src http://mirrors.ustc.edu.cn/debian bookworm-proposed-updates main contrib non-free

EOF

cat /etc/apt/sources.list

```

更新仓库缓存

```bash
apt update && apt upgrade -y

# 安装ethtool 
apt install -y ethtool git

# 查看网卡信息，主要是bus info enp1s0 enp2s0 enp3s0(eno1) enp4s0
ethtool -i enp4s0

root@pve:~# ethtool -i enp4s0
driver: igc
version: 6.8.4-2-pve
firmware-version: 2014:8877
expansion-rom-version:
bus-info: 0000:04:00.0
supports-statistics: yes
supports-test: yes
supports-eeprom-access: yes
supports-register-dump: yes
supports-priv-flags: yes

```

### 配置WOL
```bash
# 查看WOL唤醒支持
apt install -y ethtool

ethtool enp4s0

# 以下为输出示例
Settings for enp4s0:
        Supported ports: [ TP ]
        Supported link modes:   10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Full
                                2500baseT/Full
        Supported pause frame use: Symmetric
        Supports auto-negotiation: Yes
        Supported FEC modes: Not reported
        Advertised link modes:  10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Full
                                2500baseT/Full
        Advertised pause frame use: Symmetric
        Advertised auto-negotiation: Yes
        Advertised FEC modes: Not reported
        Speed: 1000Mb/s
        Duplex: Full
        Auto-negotiation: on
        Port: Twisted Pair
        PHYAD: 0
        Transceiver: internal
        MDI-X: off (auto)
        Supports Wake-on: pumbg
        Wake-on: g
        Current message level: 0x00000007 (7)
                               drv probe link
        Link detected: yes

```

- Supports Wake-on: 判断该网卡是否支持WOL唤醒，pumbg则表示支持WOL
- Wake-on: 表示WOL禁用状态，g为开启 d为禁用

### 命令行操作虚拟机

```bash
# 查看集群资源状况
pvesh get /cluster/resources

# 取得虚拟机当前状态
pvesh get /nodes/<节点id>/qemu/<虚拟机id>/status/current

pvesh get /nodes/pve/qemu/100/status/current

# 关闭虚拟机
pvesh create /nodes/<节点id>/qemu/<虚拟机id>/status/stop

pvesh create /nodes/pve/qemu/100/status/stop

# 启动虚拟机
pvesh create /nodes/<节点id>/qemu/<虚拟机id>/status/start

pvesh create /nodes/pve/qemu/100/status/start

```

查看pci设备

```bash
# 网卡
lspci | grep -i 'Ethernet'
# 声卡
lspci | grep -i 'Audio'
# 核显
lspci | grep -i 'Graphics'
# SATA控制器
lspci | grep -i 'SATA'

root@pve:~/pvetools# lspci
00:00.0 Host bridge: Intel Corporation Gemini Lake Host Bridge (rev 06)
00:02.0 VGA compatible controller: Intel Corporation GeminiLake [UHD Graphics 600] (rev 06)
00:0e.0 Audio device: Intel Corporation Celeron/Pentium Silver Processor High Definition Audio (rev 06)
00:0f.0 Communication controller: Intel Corporation Celeron/Pentium Silver Processor Trusted Execution Engine Interface (rev 06)
00:12.0 SATA controller: Intel Corporation Celeron/Pentium Silver Processor SATA Controller (rev 06)
00:13.0 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:13.1 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:13.2 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:13.3 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:14.0 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:14.1 PCI bridge: Intel Corporation Gemini Lake PCI Express Root Port (rev f6)
00:15.0 USB controller: Intel Corporation Celeron/Pentium Silver Processor USB 3.0 xHCI Controller (rev 06)
00:1f.0 ISA bridge: Intel Corporation Celeron/Pentium Silver Processor LPC Controller (rev 06)
00:1f.1 SMBus: Intel Corporation Celeron/Pentium Silver Processor Gaussian Mixture Model (rev 06)
01:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
03:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
04:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)

```

### [PVETools](https://github.com/ivanhao/pvetools)
```bash
git clone https://github.com/ivanhao/pvetools.git
cd pvetools
./pvetools.sh

```

### 域名访问

```bash
# 实现内网 主机名.local访问
apt install -y avahi-daemon
service avahi-daemon status

```

使用域名访问PVE https://pve.local:8006


## 二、HDMI直通

### PVE开启硬件直通功能（此处开始针对初次安装PVE用户，如根据前面教程操作到这里的可以不做）
1. BIOS中关闭CSM（兼容启动模式），仅开启UEFI启动，并以UEFI安装PVE

2. BIOS中打开硬件直通相关设置

    - 找到BIOS中虚拟化功能，并打开(VMX或SVM)
    - 找到BIOS中硬件直通相关功能，并打开（VT-d，AMD-v）

3. BIOS的CSM设置里面把vedio的UEFI换成legacy

4. 修改GRUB，启动IOMMU(硬件直通)支持

```bash
#修改grub启动文件
nano /etc/default/grub

#将以下条目删除
GRUB_CMDLINE_LINUX_DEFAULT="quiet"

#替换为
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt nofb nomodeset video=vesafb:off video=efifb:off video=simplefb:off pcie_acs_override=downstream"

#按“CTRL+X”退出修改，然后“Y”确认保存，然后按“enter”确认文件名并保存

#更新GRUB
update-grub

#pcie_acs_override （PCIE拆分，增加直通成功率）
#video=vesafb:off,efifb:off （关闭framebuffer，避免显卡占用）
```

### 加载直通所需要的Linux模组

```bash
#修改模组加载文件
nano /etc/modules

#添加以下内容
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd 
```

### 屏蔽显卡相关驱动

```bash
#创建屏蔽文件
nano /etc/modprobe.d/pve-blacklist.conf

#加入需要屏蔽的显卡相关模组（包含声卡以及i915核显驱动）
blacklist snd_hda_intel
blacklist snd_soc_skl
blacklist snd_sof_pci
blacklist snd_hda_codec_hdmi
blacklist i915
```

### 配置对应的直通相关模组，绑定设备

确认显卡和声卡硬件ids
```bash
#查询设备位置
lspci

#查询对应设备ids
lspci -n -s 00:02.0
```

```bash
#创建设置文件
nano /etc/modprobe.d/igpu-pass.conf
```

```bash
#加入以下条目——————————

#配置vfio-pci，绑定设备，ids处输入前面查到的先看ids号
options vfio-pci ids=8086:3185,8086:3198 disable_vga=1

#避免ignored RDMSR警告刷屏
options kvm ignore_msrs=1 report_ignored_msrs=0

#允许设备不安全中断，增加成功率
options vfio_iommu_type1 allow_unsafe_interrupts=1

#激活声卡（不确定）
options snd-hda-intel enable_msi=1
```

### 更新配置并重启

```bash
update-initramfs -u -k all
reboot
```

### 下载显卡rom文件
```bash
#进入路径
cd /usr/share/kvm

#下载文件
wget https://gitee.com/spoto/PVE_Generic_AIO/raw/master/Z.1%E3%80%81J4125%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%A0%B8%E6%98%BE%E7%9B%B4%E9%80%9A%EF%BC%88%E5%90%ABHDMI%E8%BE%93%E5%87%BA%EF%BC%89/vbios_1005v4.bin
```

### 创建虚拟机需要注意的地方
1. CPU使用host模式
2. q35机型直通成功率较高，亦可尝试i440fx
3. 直通PCI硬件（设置为主GPU，PCIE模式）
4. 删除原本虚拟显示设备

### 为核显加载BIOS文件
```bash
#xxx为虚拟机编号VMID
nano /etc/pve/qemu-server/xxx.conf 

#找到通过host硬件ID找到硬件描述的一行并加入
romfile=vbios_1005v4.bin
```

### 插入HDMI接口启动成功

## 三、安装iKuai

1. 在BIOS中打开硬件直通相关选项（VT-d & VMX）
2. 编辑Grub开启网口直通

```bash
nano /etc/default/grub

# 开启硬件直通
# 将 GRUB_CMDLINE_LINUX_DEFAULT="quiet" 改为 GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"

# 如果你的pcie设备分组有问题也可以换成这一行对分组拆分（直通遇到问题都可以尝试这个）
# GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on pcie_acs_override=downstream"

# 更新grub
update-grub

root@pve:~/pvetools# update-grub
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.8.4-3-pve
Found initrd image: /boot/initrd.img-6.8.4-3-pve
Found linux image: /boot/vmlinuz-6.8.4-2-pve
Found initrd image: /boot/initrd.img-6.8.4-2-pve
Found memtest86+ 64bit EFI image: /boot/memtest86+x64.efi
Adding boot menu entry for UEFI Firmware Settings ...
done

```

3. 记录外部网口与编码映射关系

```bash
# 获取网卡名称
ip addr

# 获取网卡的PCI地址
ethtool --driver enp1s0
ethtool --driver enp2s0
ethtool --driver enp3s0  ethtool --driver eno1
ethtool --driver enp4s0

# 从PCI上查看网卡
root@pve:~# lspci | grep -i 'Ethernet'
01:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
03:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
04:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)


```

| 外部编号 | 网卡名      | PCI地址 | 备注 |
| -------- | ----------- | ------- | ---- |
| ETH0     | enp1s0      | 01:00.0 | WAN  |
| ETH1     | enp2s0      | 02:00.0 | LAN  |
| ETH2     | eno1 enp3s0 | 03:00.0 | LAN  |
| ETH3     | enp4s0      | 04:00.0 | MNG  |

4. 下载镜像并上传

```bash
wget https://www.ikuai8.com/download.php?n=/3.x/iso/iKuai8_x64_3.7.12_Build202406112125.iso

```

5. 创建虚拟机
   1. 常规: 序号 100 名称 iKuai
   2. 操作系统: 选择上传的iKuai镜像
   3. 系统: 默认
   4. 磁盘: 8G
   5. CPU: 1C4T 类别: Host
   6.  内存: 4096 MB
   7.  网络: vmbr0 VirtIO半虚拟化

6. iKuai - 硬件 - 添加 - PCI设备，选择需要直通的网卡
7. 开机进入iKuai系统，选择 1 安装系统，按 y 确认，安装成功后会自动重启
8. 重启后按照指令修改ip， 192.168.0.201
9. 浏览器访问 192.168.0.201 ，登录账号 admin / admin，修改密码为 admin123
10. 在系统管理 - 登录管理 - 远程访问开启远程维护，端口为22，账号密码 sshd / admin123
11. 在网络设置 - DHCP设置 - DHCP服务端 修改目标网段，或者关闭DHCP服务，否则会污染内网设备的IP分配

## 四、安装iStoreOS

1. 在BIOS中打开硬件直通相关选项（VT-d & VMX）
2. 编辑Grub开启网口直通

```bash
nano /etc/default/grub

# 开启硬件直通
# 将 GRUB_CMDLINE_LINUX_DEFAULT="quiet" 改为 GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"

# 如果你的pcie设备分组有问题也可以换成这一行对分组拆分（直通遇到问题都可以尝试这个）
# GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on pcie_acs_override=downstream"

# 更新grub
update-grub

root@pve:~/pvetools# update-grub
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.8.4-3-pve
Found initrd image: /boot/initrd.img-6.8.4-3-pve
Found linux image: /boot/vmlinuz-6.8.4-2-pve
Found initrd image: /boot/initrd.img-6.8.4-2-pve
Found memtest86+ 64bit EFI image: /boot/memtest86+x64.efi
Adding boot menu entry for UEFI Firmware Settings ...
done

```

3. 记录外部网口与编码映射关系

```bash
# 获取网卡名称
ip addr

# 获取网卡的PCI地址
ethtool --driver enp1s0
ethtool --driver enp2s0
ethtool --driver enp3s0  ethtool --driver eno1
ethtool --driver enp4s0

# 从PCI上查看网卡
root@pve:~# lspci | grep -i 'Ethernet'
01:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
03:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
04:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)


```

| 外部编号 | 网卡名      | PCI地址 | 备注 |
| -------- | ----------- | ------- | ---- |
| ETH0     | enp1s0      | 01:00.0 | WAN  |
| ETH1     | enp2s0      | 02:00.0 | LAN  |
| ETH2     | eno1 enp3s0 | 03:00.0 | LAN  |
| ETH3     | enp4s0      | 04:00.0 | MNG  |

4. 下载镜像

```bash
wget https://fw0.koolcenter.com/iStoreOS/x86_64/istoreos-22.03.6-2024061415-x86-64-squashfs-combined.img.gz

gzip -d istoreos-22.03.6-2024061415-x86-64-squashfs-combined.img.gz
```

5. 创建虚拟机
   1. 常规: 序号 101 名称 iStoreOS
   2. 操作系统: 不使用任何介质
   3. 系统: 默认，或把BIOS改为 UEFI
   4. 磁盘: 删除硬盘
   5. CPU: 1C4T 类别: Host
   6.  内存: 4096 MB
   7.  网络: vmbr0 VirtIO半虚拟化

6.  导入镜像

```bash
cd /root/

# 101为虚拟机编号  istoreos为下载的镜像名称
qm importdisk 101 istoreos-22.03.6-2024061415-x86-64-squashfs-combined.img local-lvm

# 如果合并了 local 和 local-lvm 将结尾的 local-lvm 改为 local
```

7.  iStoreOS - 硬件 - 未使用的磁盘0，双击添加
8.  iStoreOS - 选项 - 引导顺序，仅勾选挂载的 disk 磁盘，并将其移动到第一位
9.  iStoreOS - 硬件 - 添加 - PCI设备，选择需要直通的网卡
10. 开机进入命令行，配置默认的ip地址

```bash
vim /etc/config/network

config interface 'loopback'
        option device 'lo'
        option proto 'static'
        option ipaddr '127.0.0.1'
        option netmask '255.0.0.0'

config globals 'globals'
        option ula_prefix 'fd57:6dbb:d2f3::/48'

config device
        option name 'br-lan'
        option type 'bridge'
        list ports 'eth0'

config interface 'lan'
        option device 'br-lan'
        option proto 'static'
        option ipaddr '192.168.0.202'
        option netmask '255.255.255.0'
        option gateway '192.168.0.1'
        option peerdns '0'
        list dns '223.5.5.5'

```

**注意**
1. 也可以使用 iStoreOS 提供的 `quickstart` 命令初始化网络
2. 如果设置静态ip后无法访问后台，可以将wan口的 device 加到 lan 下

访问iStoreOS http://istoreos.local

## 五、安装HassOS

1. 常规: 序号 110 名称 HassOS
2. 操作系统: 不使用任何介质
3. 系统: 默认
4. 磁盘: 删除硬盘
5. CPU: 1C2T 类别: Host
6. 内存: 4096 MB
7. 网络: vmbr0 VirtIO半虚拟化
8. 创建完成后，再次确认删除磁盘和改为UEFI启动
9. 下载镜像

```bash
wget https://github.com/home-assistant/operating-system/releases/download/12.3/haos_ova-12.3.qcow2.xz

apt install -y xz-utils
xz -d haos_ova-12.3.qcow2.xz
xz -d -c haos_ova-12.3.qcow2.xz > ./haos_ova-12.3.qcow2
```

10. Shell窗口添加 qcow2 镜像

```bash
cd /root/

# 110为虚拟机编号  haos为下载的qcow2镜像名称
qm importdisk 110 haos_ova-12.3.qcow2 local-lvm

# 如果合并了 local 和 local-lvm 将结尾的 local-lvm 改为 local
```

11.  HassOS - 硬件 - 未使用的磁盘0，双击添加
12.  HassOS - 选项 - 引导顺序，仅勾选挂载的 qcow2 磁盘，并将其移动到第一位
13.  浏览器访问 http://homeassistant.local:8123/

```bash
# 查看ip
ha network info
# 设为静态IP，并指定ip地址，默认为auto
ha network update enp0s18 --ipv4-method static
ha network update enp0s18 --ipv4-address 192.168.0.211/24

# 使用nmcli修改ip
nmcli con show
nmcli device status
nmcli> print ipv4
nmcli> set ipv4.addresses 192.168.0.211/24
Do you also want to set 'ipv4.method' to 'manual'? [yes]:
nmcli> set ipv4.dns 1.1.1.1
nmcli> set ipv4.gateway 192.168.0.1
nmcli> save
nmcli> quit
```

- https://github.com/home-assistant/operating-system/blob/dev/Documentation/network.md
- https://community.home-assistant.io/t/how-to-change-ip-adresse-in-cli/332205/4

## 修改VMID

例如，将vmid 102的虚拟机改成vmid 100的虚拟机

1. 修改虚拟机配置文件
```bash
cd /etc/pve/qemu-server
mv 102.conf 100.conf
nano /etc/pve/qemu-server/100.conf
```

2. 将配置文件中涉及到硬盘的参数的如sata0，scsi0，tpmstate0，efidisk0的内容修改成数值100

```bash
efidisk0: local-lvm:vm-102-disk-0,efitype=4m,pre-enrolled-keys=1,size=4M
sata0: local-lvm:vm-102-disk-1,size=32G
tpmstate0: local-lvm:vm-102-disk-2,size=4M,version=v2.0
```

改成如下
```bash
efidisk0: local-lvm:vm-100-disk-0,efitype=4m,pre-enrolled-keys=1,size=4M
sata0: local-lvm:vm-100-disk-1,size=32G
tpmstate0: local-lvm:vm-100-disk-2,size=4M,version=v2.0
```

3. 通过lvrename命令修改vm磁盘序号

或者命令查看磁盘
```bash
lvs -a
```

将VM磁盘中的102磁盘都修改为100的
```bash
lvrename /dev/pve/vm-102-disk-0 /dev/pve/vm-100-disk-0
lvrename /dev/pve/vm-102-disk-1 /dev/pve/vm-100-disk-1
lvrename /dev/pve/vm-102-disk-2 /dev/pve/vm-100-disk-2
```

4. 或者使用下方命令更换vmid，复制黏贴到终端运行。

修改其中的vgNAME（当前节点名，如pve），newVMID（新VMID），oldVMID（旧VMID）参数名即可。

```bash
export \
# 设置变量vgNAME，newVMID，oldVMID
vgNAME=iKuai newVMID=100 oldVMID=102 ;  \
# 循环查找旧磁盘
for i in $(lvs -a|grep $vgNAME | awk '{print $1}' | grep $oldVMID); \
do \
# 重命名磁盘序号
lvrename $vgNAME/vm-$oldVMID-disk-$(echo $i | awk '{print substr($0,length,1)}') vm-$newVMID-disk-$(echo $i | awk '{print substr($0,length,1)}'); done; \
# 替换conf文件中的vmid数值
sed -i "s/$oldVMID/$newVMID/g" /etc/pve/qemu-server/$oldVMID.conf; mv /etc/pve/qemu-server/$oldVMID.conf /etc/pve/qemu-server/$newVMID.conf; \
# 解绑变量
unset vgNAME newVMID oldVMID;

```

5. 参考文档
   1. [How to change VMID Proxmox (bobcares.com)](https://bobcares.com/blog/change-vmid-proxmox/)
   2. [Changing VMID of a VM | Proxmox Support Forum](https://forum.proxmox.com/threads/changing-vmid-of-a-vm.63161/)
   3. [PVE 修改虚拟机VMID](https://www.jianshu.com/p/3093d35d698a)

## 挂载磁盘

1. 查看磁盘挂载情况

```bash
# lsblk 列出磁盘 MOUNTPOINTS 为空的是未挂载的磁盘
root@iStoreOS:~# lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda      8:0    0   32G  0 disk
sdb      8:16   0  2.4G  0 disk
├─sdb1   8:17   0  128M  0 part /boot
│                               /boot
├─sdb2   8:18   0  256M  0 part /rom
└─sdb3   8:19   0    2G  0 part /overlay/upper/opt/docker
                                /overlay
sdc      8:32   0  100G  0 disk
└─sdc1   8:33   0  100G  0 part /mnt/sdc

```

2. 使用 `fdisk` 进行分区

```bash
# 使用 fdisk /dev/sba 对未挂载的磁盘分区
root@iStoreOS:~# fdisk /dev/sba

Welcome to fdisk (util-linux 2.37.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

fdisk: cannot open /dev/sba: No such file or directory
root@iStoreOS:~# fdisk /dev/sda

Welcome to fdisk (util-linux 2.37.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x764af82b.

Command (m for help): p
Disk /dev/sda: 32 GiB, 34359738368 bytes, 67108864 sectors
Disk model: QEMU HARDDISK
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x764af82b

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 
First sector (2048-67108863, default 2048): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-67108863, default 67108863):

Created a new partition 1 of type 'Linux' and of size 32 GiB.

Command (m for help): p
Disk /dev/sda: 32 GiB, 34359738368 bytes, 67108864 sectors
Disk model: QEMU HARDDISK
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x764af82b

Device     Boot Start      End  Sectors Size Id Type
/dev/sda1        2048 67108863 67106816  32G 83 Linux

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

```

3. 根目录下创建了一个名为 `/mnt/sda` 的目录，并将 `/dev/sda1` 文件系统格式化为 `ext4`。

```bash
# 将目录格式化为 ext4
root@iStoreOS:~# mkdir /mnt/sda
root@iStoreOS:~# mkfs.ext4 /dev/sda1
mke2fs 1.46.5 (30-Dec-2021)
Discarding device blocks: done
Creating filesystem with 8388352 4k blocks and 2097152 inodes
Filesystem UUID: 8018393e-9b35-4170-978d-cd59ea37065c
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
        4096000, 7962624

Allocating group tables: done
Writing inode tables: done
Creating journal (32768 blocks): done
Writing superblocks and filesystem accounting information: done

```

4. 配置 `/etc/fstab` 文件实现开机自动挂载 在配置文件 `/etc/fstab` 后追加 `/dev/sda1 /mnt/sda ext4 defaults 0 0`

```bash
root@iStoreOS:~# vim /etc/fstab
root@iStoreOS:~# cat /etc/fstab
# <file system> <mount point> <type> <options> <dump> <pass>

/dev/sda1 /mnt/sda ext4 defaults 0 0
/dev/sdc1 /mnt/sdc ext4 defaults 0 0

```

5. 使用 `mount` 命令挂载

```bash
# 挂载磁盘
root@iStoreOS:~# mount /dev/sda1 /mnt/sda/

# 开机自动挂载
root@iStoreOS:~# mount -a

# 卸载挂载的磁盘
root@iStoreOS:~# umount /dev/sda1 /mnt/sda/

```
