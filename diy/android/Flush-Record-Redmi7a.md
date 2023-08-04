- [Redmi K50 Pro获取root简单教程](https://www.coolapk.com/feed/34505971)

## 工具地址
1. [解锁BL工具](https://www.miui.com/unlock/index.html) [下载地址](https://www.miui.com/unlock/download.html)
2. [MiFlash 线刷工具](https://miuiver.com/miflash/) [官方地址](http://bigota.d.miui.com/tools/MiFlash2018-5-28-0.zip)
3. [小米助手](http://zhushou.xiaomi.com/) 可以查看官方刷机步骤，救砖用
4. [payload-dumper-go](https://github.com/ssut/payload-dumper-go/releases)用于解包提取boot.img和vbmeta.img
5. [SDK Platform Tools](https://developer.android.google.cn/studio/releases/platform-tools)用于刷入修补后的boot.img并去vab验证
6. [MIUI历史版本](https://miuiver.com/) [历史ROM包](https://xiaomirom.com/) 用payload-dumper-go提取boot.img及vbmeta.img
7. [Magisk](https://github.com/topjohnwu/Magisk/releases)用于修补提取到的boot.img
8. [工具合集](https://wwc.lanzouy.com/b0cy2vbvc) 密码 8602


## 1. 解锁BL
1. 申请解锁BL，需要登录小米账号，插入SIM卡
2. 下载[解锁工具](https://www.miui.com/unlock/download.html)
3. 手机关机并按住`音量-`并`电源`进入`fastboot模式`，连接电脑
4. 打开解锁工具解锁


## 2. 下载工具
1. 下载需要刷入的[ROM包](https://xiaomirom.com/)（线刷包 .tgz结尾 卡刷包 .zip结尾）
2. 下载ADB工具[SDK Platform Tools](https://developer.android.google.cn/studio/releases/platform-tools)
3. 下载镜像提取工具[payload-dumper-go](https://github.com/ssut/payload-dumper-go/releases)，解压ROM包如果images下有boot.img和vbmeta.img，则可以忽略
4. 下载面具[Magisk](https://github.com/topjohnwu/Magisk/releases)Redmi7a用最新的(26.1)也是可以的，似乎版本不受影响


## 3. 开始ROOT
1. 在`payload-dumper-go`解压文件夹打开cmd窗口
2. 解包 `payload-dumper-go.exe [path-to-rom-package]` 完成后会在当前文件夹下出现 `boot.img` `vbmeta.img`(解压`rom-xxx.tgz`直接有`boot.img`的可以跳过)
3. 将boot.img上传到手机，安装面具 Magisk并打开，点击`安装`->`选择并修补一个文件` -> `选择刚才上传过来的boot.img` -> `点击开始`，完成后会在同级目录生成一个 `magisk_patched-xxx.img`，复制到电脑上
4. 配置adb工具的环境变量，在cmd窗口测试`fastboot` 有版本输出即为正常
5. 手机关机并按住`音量-`并`电源`进入`fastboot模式`，连接电脑，cmd输入`fastboot devices`出现手机代码即可
6. `fastboot flush boot magisk_patched-xxx.img`刷入修复后的img，(可以不刷`vbmeta.img`)
7. `fastboot reboot`重启手机
8. 重新开机后打开Magisk上面显示版本即为root成功


## 4. 救砖
1. 手机只要可以进入fastboot模式即可救活
2. 下载完整的[ROM包](https://xiaomirom.com/)，解压出来
3. 在images同级目录打开cmd窗口，按照 `flush_all.bat`的顺序依次刷入所有的包，下面以[Redmi7a-V12.5.5.0](https://xiaomirom.com/download/redmi-7a-pine-stable-V12.5.5.0.QCMCNXM/#china-fastboot)为例

```shell
fastboot erase boot
fastboot flash modem .\images\NON-HLOS.bin 
fastboot flash sbl1 .\images\sbl1.mbn
fastboot flash sbl1bak .\images\sbl1.mbn 
fastboot flash rpm .\images\rpm.mbn
fastboot flash rpmbak .\images\rpm.mbn
fastboot flash tz .\images\tz.mbn 
fastboot flash tzbak .\images\tz.mbn
fastboot flash devcfg .\images\devcfg.mbn
fastboot flash devcfgbak .\images\devcfg.mbn
fastboot flash dsp .\images\adspso.bin
fastboot flash dspbak .\images\adspso.bin
fastboot flash sec .\images\sec.dat
fastboot flash splash .\images\splash.img
fastboot flash aboot .\images\emmc_appsboot.mbn
fastboot flash abootbak .\images\emmc_appsboot.mbn
fastboot flash boot .\images\boot.img
fastboot flash dtbo .\images\dtbo.img
fastboot flash dtbobak .\images\dtbo.img
fastboot flash vbmeta .\images\vbmeta.img
fastboot flash vbmetabak .\images\vbmeta.img
fastboot flash recovery .\images\recovery.img
fastboot flash system .\images\system.img
fastboot flash vendor .\images\vendor.img
fastboot flash cache .\images\cache.img
fastboot flash cmnlib .\images\cmnlib_30.mbn
fastboot flash cmnlibbak .\images\cmnlib_30.mbn
fastboot flash cmnlib64 .\images\cmnlib64_30.mbn
fastboot flash cmnlib64bak .\images\cmnlib64_30.mbn
fastboot flash keymaster .\images\km4.mbn
fastboot flash keymasterbak .\images\km4.mbn
fastboot flash cust .\images\cust.img
fastboot flash userdata .\images\userdata.img
fastboot reboot
```


## 5. 部署Linux Deploy
- [参考文档](https://www.jianshu.com/p/732c741cf5f4)
- [LinuxDeploy](https://github.com/meefik/linuxdeploy/releases/download/2.6.0/linuxdeploy-2.6.0-259.apk)
- [BusyBox](https://github.com/meefik/busybox/releases/download/1.34.1/busybox-v1_34_1-52.apk)
- [JuiceSSH](https://juicessh.com/changelog#v3.2.2)
1. 依次安装 `LinuxDeploy` `BusyBox` `JuiceSSH` APP
2. 打开BusyBox，修改busybox的配置，注意默认安装目录为 `/system/xbin`， 有些机型这个目录被占用，有些没有这个目录。
3. 点击安装，没有出现error即可，出现 `can't create /system/xbin/busybox: No such directory`这类提示跳转`问题1`修复
4. BusyBox安装成功后，打开LinuxDeploy，修改配置
   1. 容器类型: chroot
   2. 发行版
   3. 源地址 中科大 http://mirrors.ustc.edu.cn/ubuntu-ports/ https://mirrors.aliyun.com/ubuntu-ports/
   4. 用户名 密码
   5. 本地化 zh_CN.UTF-8
   6. SSH 开启，修改端口 2233
   7. 安装路径
5. 点击右上角安装，全称大概10分钟 `<<< deploy` 表示安装完成，没有出现fail，并且有显示 `Starting extra/ssh ... done`表示安装成功
6. 点击Start启动系统
7. 打开JuiceSSH 输入`127.0.0.1` `2233` 用户名 密码登录


## 6. 安装Google套件
- [Google Service Framework](https://apkpure.com/cn/google-services-framework/com.google.android.gsf/download/23-APK)
- [Google Play Service](https://apkpure.com/cn/google-play-services/com.google.android.gms/download/232316019-APK-3ee053e71fd3644fdfa3c6fc6f327c5f)
- [Google Play Store](https://apkpure.com/cn/google-play-store/com.android.vending/download/83631210-APK)
- [Google Account Manager](https://apkpure.com/cn/google-account-manager/com.google.android.gsf.login/download)
- [Google Contacts Sync](https://apkpure.com/cn/google-contacts-sync/com.google.android.syncadapters.contacts/download/32-APK)
- [Google Partner Setup](https://apkpure.com/cn/google-contacts-sync/com.google.android.syncadapters.contacts/download/32-APK)
- [Google One Time Init](https://apkpure.com/cn/google-contacts-sync/com.google.android.syncadapters.contacts/download/32-APK)


## 7. 问题
### 1. BusyBox 安装失败[参考Github issue](https://github.com/meefik/busybox/issues/125)
1. 从[Magisk Modules](https://www.androidacy.com/magisk-modules-repository/)下载 `busybox magisk module` 
2. 重新mount system文件夹 [参考Github issue](https://github.com/meefik/busybox/issues/93)

手机`开启USB调试`并`开启USB调试安全模式`，连接电脑，cmd输入`adb devices` 出现手机代码即可
```shell
# 进入命令行
adb shell

# 切换root，如果提示Permisson denied 去Masisk授权
su 

# 将/system 文件夹权限改为rw (read-write)
busybox mount -o rw,remount /

# 再次修改权限 确认 /system是可以写入的
mount -o rw,remount /

# 如果没有/system/xbin或者安装目录不为 /system/xbin 例如 /system/zbin
mkdir /system/xbin      # mkdir /system/zbin

# 修改/system/xbin的权限 7代表 读 写 执行
chmod 777 /system/xbin  # chmod 777 /system/zbin

#####
# 此处去安装Busybox
#####

# 恢复/system/xbin的权限 5代表 读 执行
chmod 755 /system/xbin  # chmod 755 /system/zbin

# 将/system 文件夹权限恢复ro (read only)
mount -o ro,remount /
```
