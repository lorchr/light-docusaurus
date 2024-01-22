- [PVE 和 Esxi性能对比]( https://kb.blockbridge.com/technote/proxmox-vs-vmware-nvmetcp/)

## 申请证书
在 VMware 网站中，我们能够找到 ESXi 8 和 ESXi 7 的使用授权的申请地址：
- [VMware vSphere Hypervisor 8](https://customerconnect.vmware.com/evalcenter?p=free-esxi8&source=dwnp)
- [VMware vSphere Hypervisor 7](https://my.vmware.com/web/vmware/evalcenter?p=free-esxi7&source=dwnp)

1. 注册登录账号
2. 跳转申请地址，填写表单（individual），等待审核通过

一般会立即通过并显示证书及下载链接

## 编译镜像
**注意：** 8.0版本开始，VMWare删减了一些硬盘 网卡的驱动，可能导致网卡识别或硬盘识别异常，需要自己用离线包打驱动。具体操作可以参考[快速构建和安装干净的 ESXi 8 镜像指南](https://zhuanlan.zhihu.com/p/601787086) 或 [快速构建和安装干净的 ESXi 8 镜像指南](https://soulteary.com/2023/01/29/how-to-easily-create-and-install-a-custom-esxi-image.html)

1. 在证书页面下载官方ISO镜像 及 离线Zip安装包
2. 从[VMware兼容性指南 VMware Compatibility Guide](https://www.vmware.com/resources/compatibility/search.php?deviceCategory=io&details=1&releases=369&deviceTypes=14&page=11&display_interval=10&sortColumn=Partner&sortOrder=Asc)查询硬件支持情况，包括CPU 网卡 PCIE SATA NVMe
3. 如果缺少某个驱动，可以从[flings ESXi 社区网络驱动程序](https://flings.vmware.com)下载
   1. ESXi 的 PCIe 社区网络驱动程序：[community-networking-driver-for-esxi](https://flings.vmware.com/community-networking-driver-for-esxi)
   2. ESXi 的 USB 社区网络驱动程序：[usb-network-native-driver-for-esxi](https://flings.vmware.com/usb-network-native-driver-for-esxi)
   3. ESXi 的 NVMe 社区驱动程序：[community-nvme-driver-for-esxi](https://flings.vmware.com/community-nvme-driver-for-esxi)
4. 编译镜像，添加驱动，从[这里](https://customerconnect.vmware.com/downloads/details?downloadGroup=ESXI80U2&productId=1345#drivers_tools)下载


**注意**
由于VMware决定关闭 `flings.vmware.com`` 网站，对相关内容做了迁移
1. 网站跳转到[Code Samples and PowerCLI Example Scripts](https://developer.vmware.com/samples)
2. Esxi for ARM 迁移到了[ESXi for ARM](https://customerconnect.vmware.com/downloads/get-download?downloadGroup=ESXI-ARM)
4. 相关文档迁移到了[ESXi-Arm Fling Documents - VMware ESXi-Arm Documentation](https://communities.vmware.com/t5/ESXi-Arm-Fling-Documents/VMware-ESXi-Arm-Documentation/ta-p/2993062)
5. 部分内容（包括驱动）可以在[这里](https://archive.org/download/flings.vmware.com)找到

## 安装Esxi
1. 将镜像复制到[Ventoy](https://www.ventoy.net)制作的U盘中，或者使用[Rufus](http://rufus.ie/zh/)烧录到U盘
2. 将U盘插入到主机上并按 Del(或Esc, F2, F7, F12)进入到BIOS，再Boot中将U盘设置为第一启动项
3. 选择Esxi镜像进行安装
4. 在安装页面显示`EFI/boot/boot.cfg`时，按`Shift + o`进入设置，输入`cdromBoot runweasel autoPartitionOSDataSize=8192`
5. 