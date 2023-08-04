- [小米手机ROOT](https://www.bilibili.com/read/cv14413691)
- [全网最详细小米全系刷面具获取root教程！](https://www.coolapk.com/feed/35610034)
- [Redmi K50 Pro获取root简单教程](https://www.coolapk.com/feed/34505971)

## 方法一:
1. 去小米社区申请你所使用的手机的开发版
2. 静待申请通过
3. 静待的同时在设备参数中连击miui版本几次打开开发者模式
4. 在更多设置的开发者选项中点击设备解锁状态
5. 开发版申请通过后在系统更新页面的右上角三个点中选择切换为开发版
6. 切换将会清空所有数据，请提前备份好数据。
7. 静待切换完成，然后正常使用
8. https://www.miui.com/unlock/index.html在这个网址下载解锁工具
9. 手机关机并按音量下和电源键进入兔子模式(fastboot线刷模式) 
10. 连接电脑并按解锁工具提示操作(需绑定满7天，否则不能解锁)
11. 解锁完成以后自动重启，进入刚刚那个root权限页面会变，点击开启root就行了。
12. 更新完成以后会自动重启，root就开启了。

下载解锁工具 
- https://unlock.update.miui.com 
- http://www.miui.com/unlock/index.html


## 方法二(rec刷入):
由于官方root不完整且开启权限等等麻烦。本地su权限会被某系弱智软件检测如银行系app将禁止你登录。

故提供magisk面具刷入的root方法

进阶玩法一般搞面具的都会吧不写那么详细了

1. 首先按上面的方法解掉bl锁，不需要申请开发版，稳定版也可以用(内测低分者大胜利)
2. 在电脑上下载adb，如果不会设置环境变量和驱动可以直接百度搜索miflash,2018和pro版都可以。这里就不提供链接了。打开软件会自动安装驱动和环境(官方刷机软件，pro是售后版)
3. 如果你能找到你手机版本可用的第三方rec,那么把rec放在电脑里，把magisk.zip放在手机里
4. 使用adb或者奇兔刷机进行刷入。cmd中输入fastboot devices检测设备连接状态。出现设备码代表正常连接
5. 继续输入fastboot flash recovery X:\xxx.img不知道路径就右键rec文件，看属性里的文件路径，复制上去，直接拖动文件粘贴上去也可以自动填上路径
6. 刷入成功以后进入rec(音量上和电源键)。选择刷入包，选择你放手机里的magisk.zip。重启，完成。


## 方法三(修补boot):

1. 把magisk.zip修改为magisk.apk并安装如果你不是下载github上的zip版而是直接在酷安之类的安装了就忽略
2. 在系统更新中的设置里下载系统完整包
3. 出现进度条以后暂停更新，进入下载管理，在下载管理中点击继续(否则会被系统强制解密)
4. 将下载完的压缩包(路径在download/ download_rom里)转移至电脑
5. 电脑下载payload_dumper-win64
6. 将系统包内的payload.bin放进payload_input并执行payload_dumper.exe
7. 将output中的boot.img转移至手机。
8. 在magisk中选择修补一个文件并修补该boot
9. 将修补后的boot(在download里有个magisk前缀的那个)放进电脑
10. 手机fastboot状态下连接电脑
11. cmd中输入fastboot flash boot X:\magiskxxxx.img
12. fastboot reboot或手动重启。完成
