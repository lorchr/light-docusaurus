- [上海移动 H2-2 破解管理密码](https://www.right.com.cn/forum/thread-8273670-1-1.html)
- [移动光猫gm219s超密破解教程](https://www.right.com.cn/forum/thread-826399-1-1.html)
- [移动光猫H2-2的完全破解心路历程及配置](https://blog.csdn.net/zsuroy/article/details/127002555)
- [移动光猫H2-2的完全破解心路历程及配置](https://www.yii666.com/blog/479377.html?action=onAll)
- [2023移动光猫H2-2超级密码获取教程 ](https://www.cnblogs.com/dingshaohua/articles/17388270.html)
- [记录一次破解移动吉比特光猫H2-2超管密码的过程](https://blog.csdn.net/qq_40709699/article/details/118657782)
- [记 · H2-2光猫telnet破解超管密码](https://www.bilibili.com/read/mobile?id=13690903)
- [教你打开宽带的IPV6功能,让你没有公网ip也可以内网穿透](https://www.5v13.com/mesh/31486.html)
- [移动宽带--中兴光猫F2355配置方法（含桥接）](https://post.smzdm.com/p/aekegg63/)
有个业务需求，需要使用公网访问放到家里的树莓派等服务器，无奈移动工作人员不给公网IP，只得自己折腾
 本篇内容涵盖网络桥接、防火墙配置、IPV6权限开放、光猫配置获取、光猫超级用户密码解密等内容
 应用之后可以自由开启公网访问NAS、服务器等等

截屏2022-09-22 下午6.51.59.png

前言
光猫是CMCC H2-2，由ZTE中兴代工，其余的华为、吉比特的光猫都大同小异，大家都可以参考本资料尝试一下。https://www.yii666.com/

新版的H2-2不能用传统方法解密配置文件了！！！

硬件版本号 HWVer-A101
 软件版本号 V1.3.3.00.04
 这玩意系统就是二开的 openwrt

改桥接网络更加方便
PS：如果只是单纯的改桥接，这个应该更快速。
 桥转路由设置：http://192.168.1.1/bridge_route.gch
截屏2022-09-22 下午6.15.06.png
 中国移动的光猫显示“中国电信LOGO”，套壳漂亮！

开启光猫 Telnet
首先使用光猫背后的普通用户名登录进光猫。然后在浏览器里输入：

http://192.168.1.1/getpage.gch?pid=1002&nextpage=tele_sec_tserver_t.gch
http://192.168.1.1/web/cmcc/gch/getpage.gch?pid=1002&nextpage=tele_sec_tserver_t.gch
截屏2022-09-22 下午6.53.20.png

显示密码
复制到地址栏执行
```
javascript:alert(document.getElementById("Frm_TSPassword").type = "text")
```

开启了telnet后使用系统自带的telnet工具或者是用putty进行登录。

用户名：CMCCAdmin
密码：aDm8H%MdA（默认）

登陆进去后输入su，输入密码进入su模式

当命令提示符变成 /# 之后就表示进入了su模式

获取光猫配置信息
采用TFTP下载的方式

配置文件地址
/userconfig/cfg/db_user_cfg.xml 

TFTP下载配置文件
```shell
# 开启tftp功能(光猫上执行)
udpsvd -vE 0 69 tftpd -c /

# 使用FTP下载，在本机运行
tftp -i 192.168.1.1 GET /userconfig/cfg/db_user_cfg.xml db_user_cfg.xml
```
解密配置文件获取超级用户WEB密码
此处是利用光猫自身对配置文件进行解密：
```shell
sidbg 1 DB decry /userconfig/cfg/db_user_cfg.xml
```
已经解密后的配置文件就存放在了 /tmp/debug-decry-cfg ，然后，通过上述的tftp方式下载下来，使用任意文本编辑器搜索CMCCAdmin，对于的Pass，就是我们要找的超级密码了

注意 此处获取到的密码仅用于登陆光猫WEB使用的，Telnet 还是原本的默认密码

## 开放IPV6防火墙
之前一直没有找到方法做开机自启的防火墙规则，好长一段时间只能桥接出来使用；经过一番折腾还是被我干掉了！

注意 此处设置了开机自动应用防火墙规则，经过测试有效！！！
网上的 service ip6tables save 与 systemctl ip6tables save 都是没有用的
命令
```shell
cd /etc
echo "#!/bin/sh" > rc.local
echo "ip6tables -F" >> rc.local
echo "ip6tables -P INPUT ACCEPT" >> rc.local
echo "ip6tables -P FORWARD ACCEPT" >> rc.local
echo "ip6tables -P OUTPUT ACCEPT" >> rc.local
chmod 755 rc.local
# 重启
reboot
```
一键脚本
我已经封装好了，直接执行即可
```shell
sh -c "$(curl -L https://raw.githubusercontent.com/zsuroy/sushell/main/tools/modem.sh)"

# 国内加速访问 | 上面那个不行可以用这个
sh -c "$(curl -L https://ghproxy.com/raw.githubusercontent.com/zsuroy/sushell/main/tools/modem.sh)"
```
执行完毕记得重启！好了搞定

## 查询开放端口
```shell
iptables -L -n
```
注意：极不建议直接打开所有端口，建议参考我下篇文章里面的防火墙设置进行设置开放指定端口

关于iptables的详细使用可以查看我另一篇文章Linux 常用命令及异常归纳整理

参考资料：
记 · H2-2光猫telnet破解超管密码
HN8145X6永久保存iptables防火墙规则简明教程

作者：@Suroy
 博客原文： 移动光猫H2-2的完全破解心路历程及配置