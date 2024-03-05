- [Active Directory 域服务概述](https://learn.microsoft.com/zh-cn/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview)
- [Windows 身份验证概述](https://learn.microsoft.com/zh-cn/windows-server/security/windows-authentication/windows-authentication-overview)
- [Windows 登录方案](https://learn.microsoft.com/zh-cn/windows-server/security/windows-authentication/windows-logon-scenarios)
- [配置新联合服务器场中的第一台联合服务器](https://learn.microsoft.com/zh-cn/windows-server/identity/ad-fs/deployment/configure-a-federation-server#configure-the-first-federation-server-in-a-new-federation-server-farm)
- [如何在windows server 2016上设置域控制器并验证](https://blog.csdn.net/qq_74285286/article/details/130180775)
- [部署：AD FS联合身份验证](https://blog.51cto.com/u_16230257/7136375)

## 一、安装系统
系统配置如下，具体安装过程略过。

- Windows Server 2019: 8C8G
- Account:
  - Administrator / Admin123

激活密钥
```shell
# 卸载密钥
slmgr /upk
# 安装密钥
slmgr /ipk WMDGN-G9PQG-XVVXX-R3X43-63DFG
# 设置 KMS服务器
slmgr /skms kms.03k.org
# 激活  需要等待
slmgr /ato
# 激活查看指令
slmgr /xpr
```

域名规划
- 域地址:         dev.local
- AD域服务器:     win-dc01.dev.local
- Tomcat服务器:   win-tc01.dev.local
- 客户端:         win-pc01.dev.local


**注意:** 如果是虚拟机安装，最好将网络改为桥接，否则外部的计算机无法添加到域中

## 二、安装AD域服务器
- [Active Directory 域服务概述](https://learn.microsoft.com/zh-cn/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview)
- [Windows 身份验证概述](https://learn.microsoft.com/zh-cn/windows-server/security/windows-authentication/windows-authentication-overview)
- [Windows 登录方案](https://learn.microsoft.com/zh-cn/windows-server/security/windows-authentication/windows-logon-scenarios)
- [如何在windows server 2016上设置域控制器并验证](https://blog.csdn.net/qq_74285286/article/details/130180775)

### 1. 安装AD域服务
点击【开始】-【服务器管理】

![](./img/1/1-1.png)

选择【添加角色和功能】

![](./img/1/1-2.png)

下一步

![](./img/1/1-3.png)

下一步

![](./img/1/1-4.png)

下一步

![](./img/1/1-5.png)

勾选【Active Directory 域服务】，点击下一步

![](./img/1/1-6.png)

下一步

![](./img/1/1-7.png)

下一步

![](./img/1/1-8.png)

点击【安装】

![](./img/1/1-9.png)

安装进行中

![](./img/1/1-10.png)

安装完成，点击【将此服务器提升为域控制器】

![](./img/1/1-11.png)

### 2. 将服务器提升为域控制器
在这里需要明白几个概念：

1. 将域控制器添加到现有林：可向现有域添加第二台或是更多域控制器，不过前提是要先有一个域
2. 将新域添加到现有林：在现有林中创建现有域的子域，注意，一个林中有多个树，树有多个域
3. 添加新林：新建全新的域，这里注意一下，如果是第一次安装域控制器，建议选择添加到新林

勾选【添加林】，输入域名称 `dev.local`

![](./img/1/1-12.png)

设置AD域服务还原密码 Admin123

![](./img/1/1-13.png)

下一步

![](./img/1/1-14.png)

NetBIOS域名默认即可，有需要可以修改

![](./img/1/1-15.png)

下一步

![](./img/1/1-16.png)

下一步

![](./img/1/1-17.png)

先决条件检查完毕后，点击【安装】

![](./img/1/1-18.png)

安装完成后计算机将会自动重启

![](./img/1/1-19.png)

可以看到，【服务器管理】上多了 【AD DS】及【DNS】两个服务

![](./img/1/1-20.png)

后续所有加入到此AD域的计算机，都需要AD域来分配IP，测试时可以手动修改计算机的DNS为AD域的IP

### 3. 更改目标服务器
目标服务器即主机名，AD域的域名，默认为一串乱码 `WIN-FO87FA2R38O`

依次点击【本地服务器】-【主机名】-【更改】，修改计算机名称，点击【确定】

![](./img/1/1-21.png)

最后重启 

![](./img/1/1-22.png)

**注意** 此操作是在域控制器安装完，进行的操作，所以，此时无法选择隶属那个域，而是系统默认，不过默认的一般情况，是所创域控制器所属域，所以，无大碍

如果，不想系统默认隶属域，要在设置前操作

验证，重启之后在【控制面板】-【系统和安全】-【系统】中即可查看新的AD域名称

![](./img/1/1-23.png)

### 4. 添加域用户
在【AD DS】页面右键点击服务器，选择 【Active Directy 用户和计算机】

![](./img/1/1-24.png)

这个页面有两项重要的信息，
- 【Computers】代表添加到域中的计算机
- 【Users】代表域中的用户

![](./img/1/1-25.png)

新建用户，右键点击【Users-新建-用户】

![](./img/1/1-26.png)

输入姓名、用户名、登录名等信息

![](./img/1/1-27.png)

设置密码，勾选【密码永不过期】 Admin123

![](./img/1/1-28.png)

可以看到完整的登录名

![](./img/1/1-29.png)

右键点击【属性】

![](./img/1/1-30.png)

在【账户】中，有两项关键的配置信息
- 【登录到】    可以设置当前用户可以在哪些电脑上登录
- 【账户选项】  可以设置账户的加密方式，客户端需要对应的加密方式，否则会报错

![](./img/1/1-31.png)

## 三、计算机加入AD域
### 1. Windows服务器加入AD域
- [将计算机加入域](https://blog.51cto.com/91xueit/1114387)

修改计算机的DNS为AD域服务器的IP

![](./img/1/1-32.png)

右键点击【此电脑】-【属性】-【重命名这台电脑】-【更改】

将【隶属于】改为AD域的地址，此处为 `dev.local`

![](./img/1/1-33.png)

点击确定，输入域管理员账号密码（Administrator / Admin123）登录，登录完成后需要重启计算机

![](./img/1/1-34.png)

**注意** 计算机加入域，会自动的在活动目录中【Computers】目录下创建计算机账号。您也可以在活动目录中先创建计算机账号，再将计算机加入到域中。

检查加入到域之后的计算机名称，发现计算机名称后自动添加了域后缀

![](./img/1/1-35.png)

计算机脱离域，将计算机加入到工作组即可从域中退出。

![](./img/1/1-36.png)

### 2. Linux服务器加入AD域
- [如何让 Linux 机器加入 Windows 的 AD 域](https://linux.cn/article-7695-1.html)
- [CentOS 7.9 镜像下载](https://mirrors.aliyun.com/centos/7.9.2009/isos/x86_64)

- Windows 服务器地址为 `192.168.3.32`，域名为 `dev.local`，主机名为 `win-dc01.dev.local`；
- Linux 服务器地址为 `192.168.3.34`，主机名为 `lin-pc01.dev.local`。

#### 1、安装所需软件：
```shell
yum -y install samba samba-client samba-common samba-winbind samba-winbind-clients krb5-workstation ntpdate

# 关闭selinux
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```

#### 2、设置服务自启动并启动服务：
```shell
chkconfig smb on
chkconfig winbind on
service smb start
service winbind start
```

#### 3、修改 /etc/hosts 文件，添加主机对应记录：
```shell
vim /etc/hosts

# 添加下列内容
192.168.3.32 win-dc01.dev.local
192.168.3.34 lin-pc01.dev.local pc01
```

#### 4、设置 DNS 地址并与 AD 服务器同步时间：
```shell
# 修改DNS
echo "nameserver 192.168.3.32" >> /etc/resolv.conf

# 同步时间
ntpdate win-dc01.dev.local
```

#### 5、设置 Kerberos 票据（可选）：

销毁已经存在的所有票据：

```shell
kdestroy

# 或
klist purge
```

查看当前是否还存在票据：

```shell
klist

# 输出
klist: Credentials cache keyring 'persistent:0:0' not found
```

生成新的票据，注意域名大写。

```shell
# 生成票据（未加域生成失败，加域后重试即可）
kinit administrator@DEV.LOCAL

klist

# 输出
Ticket cache: KEYRING:persistent:0:0
Default principal: administrator@DEV.LOCAL

Valid starting       Expires              Service principal
2024-01-31T17:31:06  2024-02-01T03:31:06  krbtgt/DEV.LOCAL@DEV.LOCAL
        renew until 2024-02-07T17:30:58
```

#### 6、以命令方式设置 samba 与 Kerberos，并加入 AD 域：
```shell
authconfig --enablewinbind  --enablewins --enablewinbindauth \
  --smbsecurity ads --smbworkgroup=DEV --smbrealm DEV.LOCAL \
  --smbservers=win-dc01.dev.local --enablekrb5 --krb5realm=DEV.LOCAL \
  --krb5kdc=win-dc01.dev.local --krb5adminserver=win-dc01.dev.local \
  --enablekrb5kdcdns --enablekrb5realmdns --enablewinbindoffline \
  --winbindtemplateshell=/bin/bash --winbindjoin=administrator \
  --update --enablelocauthorize --enablemkhomedir --enablewinbindusedefaultdomain
```

注意命令中的大小写，此步骤也可以使用 `authconfig-tui` 完成。下面为界面UI

![](./img/1/1-37.png)

#### 7、增加 sudo 权限（可选）：
```shell
visudo

# 加入下列设置：
%MYDOMAIN\\domain\ admins ALL=(ALL)  NOPASSWD: ALL
```

#### 8、确认是否正确加入 AD 域：

查看 AD 的相关信息

```shell
net ads info

# 输出
LDAP server: 192.168.3.32
LDAP server name: win-dc01.dev.local
Realm: DEV.LOCAL
Bind Path: dc=DEV,dc=LOCAL
LDAP port: 389
Server time: 三, 31 1月 2024 17:32:38 CST
KDC server: 192.168.3.32
Server time offset: -2
Last machine account password change: 三, 31 1月 2024 17:30:27 CST
```

查看 MYDOMAIN\USERID 的使用者帐户

```shell
wbinfo -u

# 输出
administrator
guest
krbtgt
tc01
pc01
```

#### 9. 补充：

最好关闭SELinux
```shell
# 确认当前SELinux状态
getenforce

# 临时关闭SELinux
setenforce 0

# 永久关闭SELinux
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
如果启用 selinux 的话，需要安装 `oddjobmkhomedir` 并启动其服务，这样才能确保系统对创建的家目录设置合适的 SELinux 安全上下文。

#### 10. 效果
添加完成后可以在【Computers】中看到Windows计算机和Linux计算机
![](./img/1/1-38.png)

## 四、服务端配置
- [Windows Authentication How-To](https://tomcat.apache.org/tomcat-9.0-doc/windows-auth-howto.html)
- [Tomcat Windows 认证](https://www.w3cschool.cn/tomcat/6wds1ka3.html)

上面Tomcat官方集成步骤仅供参考，建议使用第三方的集成。

对于Tomcat项目，推荐使用[Spnego](https://spnego.sourceforge.net/); 对于SpringBoot项目，推荐使用[Spring Security Kerberos](http://static.springsource.org/spring-security/site/extensions/krb/index.html)


### 1. 使用Tomcat + Spnego 集成 Windows Authentication
- tomcat 版本为 9.0.85
- JDK 版本为 jdk 1.8

以下用`~`表示Tomcat安装目录: `D:\Develop\apache-tomcat-9.0.85`

#### 1. 添加 Spnego 依赖 `spnego.jar`
版本依赖关系
| Tomcat     | JDK      | spnego                 |
| ---------- | -------- | ---------------------- |
| Tomcat 8   | Java 8   | spnego-r9.jar          |
| Tomcat 9   | Java 11+ | spnego-r9.jar          |
| Tomcat 10+ | Java 11+ | spnego-jakarta-2.0.jar |

- [spnego-r9.jar](https://sourceforge.net/projects/spnego/files/spnego-r9.jar/download)
- [spnego-jakarta-2.0.jar](https://sourceforge.net/projects/spnego/files/spnego-jakarta-2.0.jar/download)

将下载的依赖包放入 `tomcat/lib/` 目录下，例如: `~\lib\spnego-r9.jar`

#### 2. 修改 web.xml 文件

修改 `~\conf\web.xml`，添加以下内容
```xml
<!--==================== SPNEGO FILTER - Kerberos SSO ===================== --> 
<filter>
    <filter-name>SpnegoHttpFilter</filter-name>
    <filter-class>net.sourceforge.spnego.SpnegoHttpFilter</filter-class>

    <init-param>
        <param-name>spnego.allow.basic</param-name>
        <param-value>true</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.allow.localhost</param-name>
        <param-value>true</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.allow.unsecure.basic</param-name>
        <param-value>true</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.login.client.module</param-name>
        <param-value>spnego-client</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.krb5.conf</param-name>
        <param-value>krb5.conf</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.login.conf</param-name>
        <param-value>login.conf</param-value>
    </init-param>

    <init-param>
        <!-- 此处配置 AD域账号，用于服务端的认证 -->
        <param-name>spnego.preauth.username</param-name>
        <param-value>pc01</param-value>
    </init-param>

    <init-param>
        <!-- 此处配置 AD域账号对应的密码，用于服务端的认证 -->
        <param-name>spnego.preauth.password</param-name>
        <param-value>Admin123</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.login.server.module</param-name>
        <param-value>spnego-server</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.prompt.ntlm</param-name>
        <param-value>true</param-value>
    </init-param>

    <init-param>
        <param-name>spnego.logger.level</param-name>
        <param-value>1</param-value>
    </init-param>
</filter>

<filter-mapping>
    <filter-name>SpnegoHttpFilter</filter-name>
    <url-pattern>*.jsp</url-pattern>
</filter-mapping>
```

#### 3. 创建`krb5.conf`和`login.conf`
- https://spnego.sourceforge.net/krb5.conf

添加`~/krb5.conf`
```conf
[libdefaults]
default_realm = DEV.LOCAL
# 如果未在 ~/conf/web.xml 配置域账号，则需要配置keytab
# default_keytab_name = FILE:C:\apache-tomcat-9.0.85\conf\tomcat.keytab
# 加密算法，根据【AD域-用户及计算机管理-用户-账户-账号选项】设置值选择
default_tkt_enctypes = aes256-cts aes256-cts-hmac-sha1-96 aes128-cts-hmac-sha1-96 aes128-cts rc4-hmac des3-cbc-sha1 des-cbc-md5 des-cbc-crc arcfour-hmac arcfour-hmac-md5
default_tgs_enctypes = aes256-cts aes256-cts-hmac-sha1-96 aes128-cts-hmac-sha1-96 aes128-cts rc4-hmac des3-cbc-sha1 des-cbc-md5 des-cbc-crc arcfour-hmac arcfour-hmac-md5
permitted_enctypes   = aes256-cts aes256-cts-hmac-sha1-96 aes128-cts-hmac-sha1-96 aes128-cts rc4-hmac des3-cbc-sha1 des-cbc-md5 des-cbc-crc arcfour-hmac arcfour-hmac-md5
forwardable=true

[realms]
DEV.LOCAL = {
    # AD域服务器的地址
    kdc = win-dc01.dev.local
    default_domain = DEV.LOCAL
}

[domain_realm]
dev.local= DEV.LOCAL
.dev.local= DEV.LOCAL
```

- https://spnego.sourceforge.net/login.conf

添加`~/login.conf`
```conf
spnego-client {
	com.sun.security.auth.module.Krb5LoginModule required;
};

spnego-server {
	com.sun.security.auth.module.Krb5LoginModule required
	storeKey=true
	isInitiator=false;
};
```

#### 4. 注册SPN（Service Principal Name）

一个SPN只能对应一个用户名，一个用户可以有多个SPN
```shell
# 查看帮助
setspn --help

# 添加SPN
setspn -A HTTP/lin-pc01                 pc01
setspn -A HTTP/lin-pc01.dev.local       pc01

setspn -A HTTP/win-pc01                 pc02
setspn -A HTTP/win-pc01.dev.local       pc02

# 查看账号关联的SPN
setspn -L pc01

# 删除账号关联的SPN
setspn -D HTTP/lin-pc01                 pc01

# 查询SPN信息
setspn -Q HTTP/lin-pc01.dev.local
```
![](./img/1/1-39.png)

生成`tomcat.keytab`
```shell
# /out      输出文件路径
# /mapuser  映射用户
# /princ    关联的计算机
# /pass     映射用户的密码
# /kvno     版本
ktpass /out c:\tomcat.keytab /mapuser pc01@DEV.LOCAL /princ HTTP/lin-pc01.dev.local@DEV.LOCAL /pass 'Admin123' /kvno 0

ktpass /princ HTTP/YOUR_COMPUTER_NAME_HERE@YOUR_DOMAIN_HERE.COM /mapuser YOUR_USER_HERE /pass YOUR_PASSWORD_HERE /Target YOUR_DOMAIN_HERE.COM /out YOUR_KEYTAB_FILENAME_HERE.keytab /kvno 0 /crypto RC4-HMAC-NT /ptype KRB5_NT_PRINCIPAL
```

![](./img/1/1-40.png)

#### 5. 测试配置文件
```java
import java.io.File;
import java.io.FileNotFoundException;
import java.security.NoSuchAlgorithmException;
 
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.login.Configuration;
import javax.security.auth.login.LoginContext;
 
public final class HelloKDC {
 
    private HelloKDC() {
        // default private
    }
 
    public static void main(final String[] args) throws Exception {
 
    	// Domain (pre-authentication) account
        final String username = "pc01";
        
        // Password for the pre-auth acct.
        final String password = "Admin123";
        
        // Name of our krb5 config file
        final String krbfile = "krb5.conf";
        
        // Name of our login config file
        final String loginfile = "login.conf";
        
        // Name of our login module
        final String module = "spnego-client";
 
        // set some system properties
        System.setProperty("java.security.krb5.conf", krbfile);
        System.setProperty("java.security.auth.login.config", loginfile);
        //System.setProperty("sun.security.krb5.debug", true);
 
        // assert 
        HelloKDC.validate(username, password, krbfile, loginfile, module);
 
        final CallbackHandler handler = 
            HelloKDC.getUsernamePasswordHandler(username, password);
 
        final LoginContext loginContext = new LoginContext(module, handler);
 
        // attempt to login
        loginContext.login();
 
        // output some info
        System.out.println("Subject=" + loginContext.getSubject());
 
        // logout
        loginContext.logout();
 
        System.out.println("Connection test successful.");
    }
 
    private static void validate(final String username, final String password
        , final String krbfile, final String loginfile, final String moduleName) 
        throws FileNotFoundException, NoSuchAlgorithmException {
 
        // confirm username was provided
        if (null == username || username.isEmpty()) {
            throw new IllegalArgumentException("Must provide a username");
        }
 
        // confirm password was provided
        if (null == password || password.isEmpty()) {
            throw new IllegalArgumentException("Must provide a password");
        }
 
        // confirm krb5.conf file exists
        if (null == krbfile || krbfile.isEmpty()) {
            throw new IllegalArgumentException("Must provide a krb5 file");
        } else {
            final File file = new File(krbfile);
            if (!file.exists()) {
                throw new FileNotFoundException(krbfile);
            }
        }
 
        // confirm loginfile
        if (null == loginfile || loginfile.isEmpty()) {
            throw new IllegalArgumentException("Must provide a login file");
        } else {
            final File file = new File(loginfile);
            if (!file.exists()) {
                throw new FileNotFoundException(loginfile);
            }
        }
 
        // confirm that runtime loaded the login file
        final Configuration config = Configuration.getConfiguration();
 
        // confirm that the module name exists in the file
        if (null == config.getAppConfigurationEntry(moduleName)) {
            throw new IllegalArgumentException("The module name " 
                    + moduleName + " was not found in the login file");
        }        
    }
 
    private static CallbackHandler getUsernamePasswordHandler(
        final String username, final String password) {
 
        final CallbackHandler handler = new CallbackHandler() {
            public void handle(final Callback[] callback) {
                for (int i=0; i<callback.length; i++) {
                    if (callback[i] instanceof NameCallback) {
                        final NameCallback nameCallback = (NameCallback) callback[i];
                        nameCallback.setName(username);
                    } else if (callback[i] instanceof PasswordCallback) {
                        final PasswordCallback passCallback = (PasswordCallback) callback[i];
                        passCallback.setPassword(password.toCharArray());
                    } else {
                        System.err.println("Unsupported Callback: " 
                                + callback[i].getClass().getName());
                    }
                }
            }
        };
 
        return handler;
    }
}
```

```shell
# 编译
javac HelloKDC.java

# 运行
java HelloKDC
```

#### 6. 创建一个 `hello_spnego.jsp` 文件

- https://spnego.sourceforge.net/hello_spnego.zip

添加 `~/webapps/ROOT/hello_spnego.jsp`
```jsp
<html>
<head>
    <title>Hello SPNEGO Example</title>
</head>
<body>
Hello <%= request.getRemoteUser() %> !
</body>
</html>
```

#### 7. 测试

```shell
# 1. 本机访问
http://localhost:8080/hello_spnego.jsp
# 页面显示 `Hello YOUR_USER_NAME !`


# 2. 非域计算机访问
http://192.168.3.49:8080/hello_spnego.jsp
# 会弹出Windows认证的输入框，需要输入域账号、密码
# 输入正确的账号密码后页面显示 `Hello YOUR_USER_NAME !`


# 3. 域计算机访问（已登录域账号，使用域地址访问）
http://win-pc01.dev.local:8080/hello_spnego.jsp
# 不需要登录，页面显示 `Hello YOUR_USER_NAME !`
```
