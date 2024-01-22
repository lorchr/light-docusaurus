# Install

## 一、准备工作
### 1、Exsi
1. [查询Exsi版本支持的网卡](https://www.vmware.com/resources/compatibility/search.php?deviceCategory=io)

以Intel I225网卡为例
```shell
https://www.vmware.com/resources/compatibility/search.php?deviceCategory=io&details=1&partner=46&releases=589&keyword=225&deviceTypes=6&page=1&display_interval=10&sortColumn=Partner&sortOrder=Asc
```

`Exsi8.0`支持该网卡，可以安装此版本，`8.0 U1` `8.0 U2`不支持此网卡，安装到最后会报错

2. Exsi下载 [VMware 官网](https://www.vmware.com/cn/products/workstation-pro.html) 

搜索[vmware vsphere hypervisor esxi](https://customerconnect.vmware.com/downloads/search?query=vmware%20vsphere%20hypervisor%20esxi)，
在`Custom ISOs`找到OEM的下载链接下载

### 2、Proxmox VE
1. [Proxmox VE 官网](https://www.proxmox.com/en/) 
2. [Proxmox VE 下载地址](https://www.proxmox.com/en/downloads)

### 3、镜像格式转换
Exsi不支持安装Img格式的镜像，需要将其转换为 vdmk 格式

1. [StarwindConverter 官网](https://www.starwindsoftware.com/starwind-v2v-converter)
2. [StarwindConverter 下载地址](https://www.starwindsoftware.com/tmplink/starwindconverter.exe)

### 4、写盘工具
1. [Ventoy](https://www.ventoy.net)
2. [WePE](https://www.wepe.com.cn/)
3. [Rufus](http://rufus.ie/zh/)

### 5、RouterOS
1. [RouterOS 官网](https://mikrotik.com/software)
2. [RouterOS 下载地址](https://mikrotik.com/download)

### 6、iKuai
1. [iKuai 官网](https://www.ikuai8.com/)
2. [iKuai 下载地址](https://www.ikuai8.com/component/download)

### 7、iStoreOS
1. [iStoreOS 官网](https://www.istoreos.com/)
2. [iStoreOS 开源地址](https://github.com/istoreos/istoreos)
3. [iStoreOS 下载地址](https://fw.koolcenter.com/iStoreOS/)

### 8、OpenWrt
1. [OpenWRT 官网](https://openwrt.org/)
2. [OpenWRT 网络基础知识](https://openwrt.org/zh/docs/guide-user/base-system/basic-networking)

OpenWRT 官方网固件区别

- `combined-ext4.img.gz`（rootfs工作区存储格式为ext4。）
- `combined-squashfs.img.gz`（squashfs相当于可以恢复出厂设置的固件，如果使用中配置错误，可直接恢复默认设置。）
- `generic-rootfs.tar.gz`（rootfs的镜像，不带引导，可自行定义用grub或者syslinux来引导。）
- `rootfs-ext4.img.gz`（rootfs的镜像，不带引导，可自行定义用grub或者syslinux来引导，需要存储区是ext4。）
- `rootfs-squashfs.img.gz`（rootfs的镜像，不带引导，可自行定义用grub或者syslinux来引导，如果使用中配置错误，可直接恢复默认设置。）


## 二、Exsi安装


## 三、PVE安装


## 四、RouterOS安装


## 五、iKuai安装


## 六、iStoreOS安装


## 七、OpenWrt安装

