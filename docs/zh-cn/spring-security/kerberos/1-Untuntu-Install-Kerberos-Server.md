- [Ubuntu1804安装MIT Kerberos](https://blog.csdn.net/xwd127429/article/details/106047036)

- Debian安装向导：http://techpubs.spinlocksolutions.com/dklar/kerberos.html

## 准备
修改主机名为 `krb.example.com`

`/etc/hosts`配置：

```shell
127.0.0.1  localhost
10.1.25.31  krb.example.com krb
```

## 安装服务

```shell
sudo apt install krb5-{admin-server,kdc}
```

安装过程选项如下：

```shell
Default Kerberos version 5 realm? EXAMPLE.COM

Kerberos servers for your realm: krb1.example.com

Administrative server for your Kerberos realm: krb1.example.com
```

## 安装配置
### 设置REALM
执行`sudo krb5_newrealm`，设置REALM。

选项如下：
```shell
This script should be run on the master KDC/admin server to initialize
a Kerberos realm.  It will ask you to type in a master key password.
This password will be used to generate a key that is stored in
/etc/krb5kdc/stash.  You should try to remember this password, but it
is much more important that it be a strong password than that it be
remembered.  However, if you lose the password and /etc/krb5kdc/stash,
you cannot decrypt your Kerberos database.
Loading random data
Initializing database '/var/lib/krb5kdc/principal' for realm 'EXAMPLE.COM',
master key name 'K/M@EXAMPLE.COM'
You will be prompted for the database Master Password.
It is important that you NOT FORGET this password.

Enter KDC database master key: PASSWORD

Re-enter KDC database master key to verify: PASSWORD
```

### 配置
编辑`/etc/krb5.conf`

```shell
[domain_realm]
	...
	.example.com = EXAMPLE.COM
	example.com = EXAMPLE.COM
	
...

[logging]
	kdc = FILE:/var/log/kerberos/krb5kdc.log
	admin_server = FILE:/var/log/kerberos/kadmin.log
	default = FILE:/var/log/kerberos/krb5lib.log
```

创建目录文件：

```shell
sudo mkdir /var/log/kerberos
sudo touch /var/log/kerberos/{krb5kdc,kadmin,krb5lib}.log
sudo chmod -R 750  /var/log/kerberos
```

重启服务：

```shell
sudo systemctl restart krb5-kdc
sudo systemctl restart krb5-admin-server
```

## 安装测试
执行`sudo kadmin.local`，进入本地管理员交互程序。

如下：(listprincs命令列出所有主体；quit命令退出交互程序)

```shell
sudo kadmin.local
Authenticating as principal root/admin@EXAMPLE.COM with password.

kadmin.local:  listprincs

K/M@EXAMPLE.COM
kadmin/admin@EXAMPLE.COM
kadmin/changepw@EXAMPLE.COM
kadmin/krb1.EXAMPLE.COM@EXAMPLE.COM
krbtgt/EXAMPLE.COM@EXAMPLE.COM

kadmin.local:  quit
```

## 访问权利
启用管理员用户的所有访问权利。

编辑`/etc/krb5kdc/kadm5.acl`，添加：

```shell
*/admin *
```

重启服务：

```shell
sudo systemctl restart krb5-admin-server
```

## Kerberos策略(policies)
增加4个策略，规定最小密码长度和最少包含几种字符类型

```shell
sudo kadmin.local
Authenticating as principal root/admin@EXAMPLE.COM with password.

kadmin.local:  add_policy -minlength 8 -minclasses 3 admin
kadmin.local:  add_policy -minlength 8 -minclasses 4 host
kadmin.local:  add_policy -minlength 8 -minclasses 4 service
kadmin.local:  add_policy -minlength 8 -minclasses 2 user

kadmin.local:  quit
```

### 创建第一个特权主体(privileged principal)
策略使用admin，要求密码长度最小为8，同时至少包含3种字符类型

```shell
sudo kadmin.local
Authenticating as principal root/admin@EXAMPLE.COM with password.

kadmin.local:  addprinc -policy admin root/admin

Enter password for principal "root/admin@EXAMPLE.COM": PASSWORD
Re-enter password for principal "root/admin@EXAMPLE.COM": PASSWORD
Principal "root/admin@EXAMPLE.COM" created.

kadmin.local:  quit
```

### kadmin测试

```shell
kadmin -p root/admin
Authenticating as principal root/admin@EXAMPLE.COM with password.

Password for root/admin@EXAMPLE.COM: PASSWORD

kadmin:  listprincs

K/M@EXAMPLE.COM
root/admin@EXAMPLE.COM
kadmin/admin@EXAMPLE.COM
kadmin/changepw@EXAMPLE.COM
kadmin/history@EXAMPLE.COM
kadmin/krb1.EXAMPLE.COM@EXAMPLE.COM
krbtgt/EXAMPLE.COM@EXAMPLE.COM

kadmin:  quit
```

### 创建第一个无特权主体(unprivileged principal)

```shell
kadmin -p root/admin
Authenticating as principal root/admin@EXAMPLE.COM with password.

Password for root/admin@EXAMPLE.COM: PASSWORD

kadmin:  addprinc -policy user xwd

Enter password for principal "xwd@EXAMPLE.COM": PASSWORD
Re-enter password for principal "xwd@EXAMPLE.COM": PASSWORD
Principal "xwd@EXAMPLE.COM" created.

kadmin:  quit
```

### 获取kerberos ticket
获取前
```shell
klist -f

klist: No credentials cache found (ticket cache FILE:/tmp/krb5cc_0)
```

获取

```shell
kinit xwd

Password for xwd@EXAMPLE.COM: PASSWORD
```

获取后
```shell
klist -f

Ticket cache: FILE:/tmp/krb5cc_1000
Default principal: xwd@EXAMPLE.COM

Valid starting     Expires            Service principal
11/22/06 22:30:36  11/23/06 08:30:33  krbtgt/EXAMPLE.COM@EXAMPLE.COM
renew until 11/23/06 22:30:34, Flags: FPRIA
```

销毁
```shell
kdestroy
```

## 安装kerberized services
以openssh-server为例

安装

```shell
sudo apt install openssh-server
```

添加主体

```shell
kadmin -p root/admin
Authenticating as principal root/admin@EXAMPLE.COM with password.

kadmin.local:  addprinc -policy service -randkey host/monarch.example.com

Principal "host/monarch.example.com@EXAMPLE.COM" created.

kadmin.local:  ktadd -k /etc/krb5.keytab host/monarch.example.com

Entry for principal host/monarch.example.com with kvno 2, encryption type aes256-cts-hmac-sha1-96 added to keytab WRFILE:/etc/krb5.keytab.
Entry for principal host/monarch.example.com with kvno 2, encryption type aes128-cts-hmac-sha1-96 added to keytab WRFILE:/etc/krb5.keytab.

kadmin:  quit
```

修改/etc/ssh/sshd_config配置

```shell
GSSAPIAuthentication yes
GSSAPICleanupCredentials yes
GSSAPIKeyExchange yes
UsePAM yes
```

重启服务
```shell
sudo systemctl restart ssh
```

## PAM配置
使用pam，用户登录后自动生成kerberos tickets，不需要运行kinit。

安装kerberos pam
```shell
sudo apt install libpam-krb5
```

切换到root用户，保存pam配置副本，以备恢复：
```shell
sudo su -
cd /etc
cp -a pam.d pam.d,orig
```

修改pam配置：
```shell
/etc/pam.d/common-account

account [success=1 new_authtok_reqd=done default=ignore]        pam_unix.so
account requisite                       pam_deny.so
account required                        pam_permit.so
account required                        pam_krb5.so minimum_uid=1000
```

```shell
/etc/pam.d/common-auth

auth    [success=2 default=ignore]      pam_krb5.so minimum_uid=1000
auth    [success=1 default=ignore]      pam_unix.so nullok_secure try_first_pass
auth    requisite                       pam_deny.so
auth    required                        pam_permit.so
autoh   optional                        pam_cap.so
```

```shell
/etc/pam.d/common-password

password        [success=2 default=ignore]      pam_krb5.so minimum_uid=1000
password        [success=1 default=ignore]      pam_unix.so obscure use_authtok try_first_pass sha512
password        requisite                       pam_deny.so
password        required                        pam_permit.so
```

```shell
/etc/pam.d/common-session

session [default=1]                     pam_permit.so
session requisite                       pam_deny.so
session required                        pam_permit.so
session optional                        pam_krb5.so minimum_uid=1000
session required        pam_unix.so

# If elogind and libpam-elogind are installed:
session optional                        pam_elogind.so
```

如果修改了上述配置，则重启你想要连接的服务，这里重启ssh:
```shell
sudo systemctl restart ssh
```

## 安装kerberized clients
```shell
sudo apt install openssh-client
```

## 测试连接
以xwd用户为例。

如果xwd不是系统用户，需要创建，如下：

```shell
sudo adduser --disabled-password xwd
```

获取kerberos ticket

```shell
kinit xwd
```

确认以持有kerberos ticket

```shell
klist -f
```

尝试连接
```shell
ssh xwd@krb1.example.com
```

不出意外的话，ssh连接成功。
