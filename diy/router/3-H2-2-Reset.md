1. 牙签捅复位键 10s左右，重启后注册灯没亮即可
2. 登录 `CMCCAdmin` / `aDm8H%MdA` 账号
3. 进入安全-访问控制 开启Telnet 记录页面的地址 
   1. 访问控制 `http://192.168.1.1/getpage.gch?pid=1002&nextpage=sec_sc_t.gch`
   2. 端口配置 `http://192.168.1.1/getpage.gch?pid=1002&nextpage=sec_fw_servport_t.gch`
   3. 桥接/路由切换 `http://192.168.1.1/bridge_route.gch`
4. 在网络中登录宽带账号密码，不知道的可以登录中国移动手机app修改
5. 在访问控制-防火墙中关闭`IPv6Session`防火墙
