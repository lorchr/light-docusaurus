- [小米6刷Ubuntu Touch系统体验原生Linux[手机刷LINUX系统]](https://zhuanlan.zhihu.com/p/542041705)
- [红米2刷postmarketOS体验原生Linux(基于 Alpine Linux)[ 手机刷LINUX系列]](https://zhuanlan.zhihu.com/p/548346333)
- [红米2刷Mobian体验原生Linux及软件安装问题处理[ 手机刷LINUX系列]](https://zhuanlan.zhihu.com/p/554022195)

- [给红米Note3高配版手机刷入Linux系统postmarketOS](https://blog.csdn.net/zd845101500/article/details/106662559/)
- 
## 刷入PostmarketOS
刷 PostmarketOS 需要使用Linux系统
1. 进入[PostmarketOS官网](https://www.postmarketos.org/)
2. 打开[支持的设备列表](https://wiki.postmarketos.org/wiki/Devices)页
3. 在正在测试的设备列表找到 [Redmi 7a](https://wiki.postmarketos.org/wiki/Xiaomi_Redmi_7A_(xiaomi-pine))
4. 可以看到，Redmi7a有很多项都不支持，仅能点亮机器，触屏，USB-A处于不可用状态。如果要体验，可以按照文档操作
5. 下载引导程序[pmbootstrap](https://wiki.postmarketos.org/wiki/Pmbootstrap#Device)





## 安装步骤：
环境：虚拟机 ubuntu20.04
安装工具pmbootstrap https://wiki.postmarketos.org/wiki/Installing_pmbootstrap
### 1、安装3.4以上python
```shell
wget -c https://www.python.org/ftp/python/3.7.3/Python-3.7.3.tgz连接
#解压文件 tar -xzvf Python-3.7.3.tgz
#执行 ./configure
cd Python-3.7.3
sudo ./configure -prefix=/var/opt/python/3.7.3
# 安装依赖库，编译 make
//安装依赖库 3.x特有
sudo apt install build-essential checkinstall
sudo apt install libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tkdev libgdbm-dev libc6-dev libbz2-dev
sudo make
#安装 make install
sudo make install
# 查看可执行文件路径which python
```
然后按照指导进行安装、配置。
### 2、使用pmbootstrap配置好要安装项目
### 3、安装
```shell
pmbootstrap install
```
问题比较多，提示了8个error。多次重新执行命令，科学上网才成功。
```shell
adil@adil-pc:~/postmarketos$ pmbootstrap install
[19:11:07] *** (1/5) PREPARE NATIVE CHROOT ***
[19:11:07] *** (2/5) CREATE DEVICE ROOTFS ("xiaomi-kenzo") ***
[sudo] password for adil:
[19:11:13] (rootfs_xiaomi-kenzo) install postmarketos-base device-xiaomi-kenzo device
-xiaomi-kenzo-nonfree-firmware postmarketos-ui-xfce4
^CTraceback (most recent call last):
File "/usr/local/bin/pmbootstrap", line 11, in <module>
load_entry_point('pmbootstrap==1.20.0', 'console_scripts', 'pmbootstrap')()
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/__ini
t__.py", line 49, in main
getattr(frontend, args.action)(args)
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/helpe
rs/frontend.py", line 231, in install
pmb.install.install(args)
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/insta
ll/_install.py", line 606, in install
pmb.chroot.apk.install(args, install_packages, suffix)
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/chroo
t/apk.py", line 226, in install
pmb.chroot.root(args, ["apk", "--no-progress"] + command, suffix=suffix, disable_
timeout=True)
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/chroo
t/root.py", line 74, in root
return pmb.helpers.run_core.core(args, msg, cmd_sudo, None, output,
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/helpe
rs/run_core.py", line 274, in core
(code, output_after_run) = foreground_pipe(args, cmd, working_dir,
File "/usr/local/lib/python3.8/dist-packages/pmbootstrap-1.20.0-py3.8.egg/pmb/helpe
rs/run_core.py", line 156, in foreground_pipe
sel.select(timeout)
File "/usr/lib/python3.8/selectors.py", line 468, in select
fd_event_list = self._selector.poll(timeout, max_ev)
KeyboardInterrupt
adil@adil-pc:~/postmarketos$ pmbootstrap install
[19:20:06] *** (1/5) PREPARE NATIVE CHROOT ***
[19:20:07] *** (2/5) CREATE DEVICE ROOTFS ("xiaomi-kenzo") ***
[19:20:08] (rootfs_xiaomi-kenzo) install postmarketos-base device-xiaomi-kenzo device
-xiaomi-kenzo-nonfree-firmware postmarketos-ui-xfce4
[sudo] password for adil:
Sorry, try again.
[sudo] password for adil:
[19:44:52] (rootfs_xiaomi-kenzo) write /etc/os-release
[19:44:52] (rootfs_xiaomi-kenzo) mkinitfs xiaomi-kenzo
[19:45:15] *** SET LOGIN PASSWORD FOR: 'adil' ***
New password:
Retype new password:
passwd: password updated successfully
[19:52:55] NOTE: No valid keymap specified for device
[19:53:25] *** (3/5) PREPARE INSTALL BLOCKDEVICE ***
[19:53:25] (native) create xiaomi-kenzo.img (806M)
[19:53:25] (native) mount /dev/install (xiaomi-kenzo.img)
[19:53:25] (native) partition /dev/install (boot: 128M, reserved: 0M, root: the rest)
[19:53:26] (native) format /dev/installp2
[19:53:26] (native) mount /dev/installp2 to /mnt/install
[19:53:26] (native) format /dev/installp1 (boot, ext2), mount to /mnt/install/boot
[19:53:26] *** (4/5) FILL INSTALL BLOCKDEVICE ***
[19:53:26] (native) copy rootfs_xiaomi-kenzo to /mnt/install/
[19:53:30] (native) make sparse rootfs
[19:53:30] (native) install android-tools
[19:53:55] *** (5/5) FLASHING TO DEVICE ***
[19:53:55] Run the following to flash your installation to the target device:
[19:53:55] * pmbootstrap flasher flash_rootfs
[19:53:55] Flashes the generated rootfs image to your device:
[19:53:55] /home/adil/.local/var/pmbootstrap/chroot_native/home/pmos/rootfs/xiaomikenzo.img
[19:53:55] (NOTE: This file has a partition table, which contains /boot and / subpa
rtitions. That way we don't need to change the partition layout on your device.)
[19:53:55] * pmbootstrap flasher flash_kernel
[19:53:55] Flashes the kernel + initramfs to your device:
[19:53:55] /home/adil/.local/var/pmbootstrap/chroot_rootfs_xiaomi-kenzo/boot
[19:53:55] (NOTE: fastboot also supports booting the kernel/initramfs directly with
out flashing. Use 'pmbootstrap flasher boot' to do that.)
[19:53:55] * If the above steps do not work, you can also create symlinks to the gene
rated files with 'pmbootstrap export' and flash outside of pmbootstrap.
[19:53:55] NOTE: chroot is still active (use 'pmbootstrap shutdown' as necessary)
[19:53:55] Done
```

### 4、将系统刷入手机。
先进入fastboot ，接入到虚拟机。
再执行以下两条命令。
```shell
$ pmbootstrap flasher flash_rootfs
$ pmbootstrap flasher flash_kernel
```
第一条好久没反应，重刷一次，会要求输入密码，然后又是漫长的等待

三次之后终于完成了，输出信息如下
```shell
adil@adil-pc:~/.local/var/pmbootstrap/chroot_native/home/pmos/rootfs$ pmbootstrap fla
sher flash_rootfs
[21:47:31] (native) flash rootfs image
[21:47:32] (native) install avbtool
Sending sparse 'system' 1/2 (522596 KB) OKAY [124.267s]
Writing 'system' OKAY [ 28.436s]
Sending sparse 'system' 2/2 (38500 KB) OKAY [ 9.488s]
Writing 'system' OKAY [ 5.588s]
Finished. Total time: 167.798s
[21:50:32] NOTE: chroot is still active (use 'pmbootstrap shutdown' as necessary)
[21:50:32] Done
adil@adil-pc:~/.l
```

下一条一次成功
```shell
adil@adil-pc:~/.local/var/pmbootstrap/chroot_native/home/pmos/rootfs$ pmbootstrap fla
sher flash_kernel
[21:51:20] (rootfs_xiaomi-kenzo) mkinitfs xiaomi-kenzo
[21:51:44] (native) flash kernel xiaomi-kenzo
Sending 'boot' (10306 KB) OKAY [ 2.213s]
Writing 'boot' OKAY [ 0.141s]
Finished. Total time: 2.374s
[21:51:46] You will get an IP automatically assigned to your USB interface shortly.
[21:51:46] Then you can connect to your device using ssh after pmOS has booted:
[21:51:46] ssh adil@172.16.42.1
[21:51:46] NOTE: If you enabled full disk encryption, you should make sure that osk-s
dl has been properly configured for your device
[21:51:46] NOTE: chroot is still active (use 'pmbootstrap shutdown' as necessary)
[21:51:46] Done
```

成功开机，可以通过usb进入终端，OTG功能失效不能外接键鼠。暂时没有什么实际用途，只是体验一下
