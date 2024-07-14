
**SpringBoot集成文档**
- [Spring Security Kerberos Github](https://docs.spring.io/spring-security-kerberos/reference/index.html)
- [Spring Security Kerberos Samples Github](https://github.com/spring-projects/spring-security-kerberos)
- [StackOverflow: spring-security-kerberos](https://stackoverflow.com/questions/tagged/spring-security-kerberos)

**kerberos认证**
- [Kerberos 官网](https://www.kerberos.org/)
- [Kerberos 官方文档](http://web.mit.edu/kerberos/krb5-current/doc/)
- [Kerberos Bug排查](https://web.mit.edu/kerberos/krb5-latest/doc/admin/troubleshoot.html)
- [Oracle Kerberos 错误消息和故障排除](https://docs.oracle.com/cd/E26926_01/html/E25889/trouble-1.html#)
- [Oracle 手册页部分 1： 用户命令](https://docs.oracle.com/cd/E56344_01/html/E54075/ktutil-1.html)
- [Kerberos认证协议介绍](https://blog.csdn.net/lonelymanontheway/article/details/132651447)

**kerberos认证 Demo**
- [kerberos-demo](https://github.com/GyllingSW/kerberos-demo)
- [Windows Server 2012: Set Up your first Domain Controller (step-by-step)](https://learn.microsoft.com/en-us/archive/technet-wiki/12370.windows-server-2012-set-up-your-first-domain-controller-step-by-step)

- [Spring Security Kerberos Integration With MiniKdc](https://www.baeldung.com/spring-security-kerberos-integration)
- [Introduction to SPNEGO/Kerberos Authentication in Spring](https://www.baeldung.com/spring-security-kerberos)

- [Guide to installing 3rd party JARs](https://maven.apache.org/guides/mini/guide-3rd-party-jars-local.html)

## 一、前言



## 二、分析



## 三、准备

### 1. 域名准备

| 模块    | 域名           | IP地址          | 备注         |
| ------- | -------------- | --------------- | ------------ |
| KDC     | ks.light.local | 192.168.137.101 | CentOS虚拟机 |
| Service | kc.light.local | 192.168.137.102 | CentOS虚拟机 |
| Client  | -              | 192.168.137.1   | Win物理机    |

需要将此Hosts配置到KDC和Service服务上

```shell
cat >> /etc/hosts << 'EOF'

192.168.137.101 ks.light.local
192.168.137.102 kc.light.local
EOF
```

物理机作为测试的客户端，需要将KDC和Serivce的域名添加到Hosts中

```shell

192.168.137.101 ks.light.local
192.168.137.102 kc.light.local
```

### 2. 安装Apache Directory Server

1. 安装 JDK [下载地址](https://jdk.java.net/archive/)

```shell
cat >> /etc/profile << 'EOF'

# Java Enviroment
JAVA_HOME=/usr/local/java/java-se-8u43-ri
# JAVA_HOME=/usr/local/java/jdk-17.0.2
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$CLASSPATH
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME CLASSPATH PATH
EOF

# 刷新配置
source /etc/profile

# 查看Java版本
java -version
```

2. 安装 ApacheDS [下载地址](http://directory.apache.org/apacheds/downloads.html)

```shell
# 解压
tar -zxvf apacheds-2.0.0.AM26.tar.gz -C /usr/local/

# 重命名解压文件夹
mv /usr/local/apacheds-2.0.0.AM26 /usr/local/apacheds

# 启动
/usr/local/apacheds/bin/apacheds.sh start

# 查看进程
ps -ef | grep java | grep apacheds

# 查看日志
tail -f /usr/local/apacheds/instances/default/log/apacheds.log
```

3. 关闭防火墙

```shell
systemctl stop firewalld
systemctl status firewalld
systemctl disable firewalld
```

### 3. ApacheDS基础配置
1. 下载[Apache Directory Studio](https://directory.apache.org/studio/downloads.html)

2. 连接ApacheDS

- host: `ks.light.local`
- port: `10389`
- user: `uid=admin,ou=system`
- password: `secret`

3. 新建 Partition

- ID : `light`
- Suffix: `dc=light,dc=local`

4. `dc=light,dc=local` 下新建Entry `ou=Group`
   - 添加class `organizationalUnit`

5. `ou=schema` 下修改 `cn=nis` 的 `m-disabled` 属性值为FALSE

6. `ou=Group` 下新建Entry `cn=test`
   - 添加class `posixGroup`

7. 导入测试用户 `test.ldif`，导入后双击 `userPassword` 属性设置密码

```ldif
dn: uid=test,ou=Group,dc=light,dc=local
uid: test
cn: test
objectClass: account
objectClass: posixAccount
objectClass: top
objectClass: shadowAccount
userPassword: {crypt}!!
shadowLastChange: 18663
shadowMin: 0
shadowMax: 99999
shadowWarning: 7
loginShell: /bin/bash
uidNumber: 1000
gidNumber: 0
homeDirectory: /home/test
```

### 4. Kerberos Server
1. 右键点击 `ApacheDS 连接`，选择`Open Configuration`，选择`Kerberos Server`页签

2. LDAP Server配置，主要是 `SASL Setting`，Kerberos登录时需要使用LDAP查询用户信息

- SASL Host: `ks.light.local`
- SASL Principal: `ldap/ks.light.local@LIGHT.LOCAL`
- Search Base DN: `ou=Users,dc=light,dc=local`
- SASL Realm: `LIGHT.LOCAL`

3. Kerberos Server配置，配置完成后重启 ApacheDS

- Enable Kerberos Server: √
- Port: 60088
- Address: `ks.light.local`
- 
- Enable Kerberos Change Password Server: √
- Port: 60464
- Address: `ks.light.local`
- 
- Primary KDC Realm: `LIGHT.LOCAL`
- Search Base DN: `ou=Users,dc=light,dc=local`

4. 安装客户端

```shell
# 安装kerberos 客户端
yum -y install krb5-workstation krb5-libs krb5-auth-dialog

# 修改配置文件
vim /etc/krb5.conf
```

```conf
# Configuration snippets may be placed in this directory as well
includedir /etc/krb5.conf.d/

[logging]
 default = FILE:/var/log/krb5libs.log
 kdc = FILE:/var/log/krb5kdc.log
 admin_server = FILE:/var/log/kadmind.log

[libdefaults]
 dns_lookup_realm = false
 ticket_lifetime = 24h
 renew_lifetime = 7d
 forwardable = true
 rdns = false
 pkinit_anchors = FILE:/etc/pki/tls/certs/ca-bundle.crt
# default_realm = EXAMPLE.COM
 default_realm = LIGHT.LOCAL
 default_ccache_name = KEYRING:persistent:%{uid}

[realms]
# EXAMPLE.COM = {
#  kdc = kerberos.example.com
#  admin_server = kerberos.example.com
# }
 LIGHT.LOCAL = {
   kdc = ks.light.local:60088
   admin_server = ks.light.local:60464
 }

[domain_realm]
# .example.com = EXAMPLE.COM
# example.com = EXAMPLE.COM
  .light.local = LIGHT.LOCAL
  light.local = LIGHT.LOCAL
```

5. 导入`kdc-data.ldif` 到ldap

```ldif
dn: dc=light,dc=local
objectClass: dcObject
objectClass: organization
objectClass: top
dc: light
o: light.local

dn: ou=Users,dc=light,dc=local
objectClass: organizationalUnit
objectClass: top
ou: Users

dn: uid=hnelson,ou=Users,dc=light,dc=local
objectClass: top
objectClass: person
objectClass: inetOrgPerson
objectClass: krb5principal
objectClass: krb5kdcentry
cn: Horatio Nelson
sn: Nelson
uid: hnelson
userPassword: secret
krb5PrincipalName: hnelson@LIGHT.LOCAL
krb5KeyVersionNumber: 0

dn: uid=krbtgt,ou=Users,dc=light,dc=local
objectClass: top
objectClass: person
objectClass: inetOrgPerson
objectClass: krb5principal
objectClass: krb5kdcentry
cn: KDC Service
sn: Service
uid: krbtgt
userPassword: secret
krb5PrincipalName: krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
krb5KeyVersionNumber: 0

dn: uid=ldap,ou=Users,dc=light,dc=local
objectClass: top
objectClass: person
objectClass: inetOrgPerson
objectClass: krb5principal
objectClass: krb5kdcentry
cn: LDAP
sn: Service
uid: ldap
userPassword: randall
krb5PrincipalName: ldap/ks.light.local@LIGHT.LOCAL
krb5KeyVersionNumber: 0

```

6. 初始化Ticket

```shell
# 初始化ticket
# 输入密码 文件中指定的是secret

[root@ks ~]# kinit hnelson
Password for hnelson@LIGHT.LOCAL:

# 查看ticket
[root@ks ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: hnelson@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-31T16:26:13  2024-04-01T16:26:06  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
        renew until 2024-04-07T16:26:06
```

7. 使用 ktutil 导出 keytab 文件

```shell
[root@ks ~]# ktutil
ktutil:  add_entry -password -p hnelson@LIGHT.LOCAL -k 1 -e aes128-cts-hmac-sha1-96
Password for hnelson@LIGHT.LOCAL:
ktutil:  wkt /usr/local/apacheds/keytab/hnelson.keytab
ktutil:  quit

```

add_entry 为每一种加密方式添加keytab ，然后用 wkt 将keytab写入到文件。参考[IBM Knowledge Center](https://www.ibm.com/docs/en/platform-symphony/7.1.0?topic=file-creating-kerberos-principal-keytab-files)

8. 验证keytab文件，如下keytab 文件也能成功验证。

```shell
[root@ks ~]# kinit -kt /usr/local/apacheds/keytab/hnelson.keytab hnelson
[root@ks ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: hnelson@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-31T16:28:49  2024-04-01T16:28:48  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
        renew until 2024-04-07T16:28:48
```

### 5. Service 服务器配置

1. 安装客户端

```shell
# 安装kerberos 客户端
yum -y install krb5-workstation krb5-libs krb5-auth-dialog

mkdir -p /usr/local/apacheds/keytab/
# 修改配置文件
vim /etc/krb5.conf
```

```conf
# Configuration snippets may be placed in this directory as well
includedir /etc/krb5.conf.d/

[logging]
 default = FILE:/var/log/krb5libs.log
 kdc = FILE:/var/log/krb5kdc.log
 admin_server = FILE:/var/log/kadmind.log

[libdefaults]
 dns_lookup_realm = false
 ticket_lifetime = 24h
 renew_lifetime = 7d
 forwardable = true
 rdns = false
 pkinit_anchors = FILE:/etc/pki/tls/certs/ca-bundle.crt
# default_realm = EXAMPLE.COM
 default_realm = LIGHT.LOCAL
 default_ccache_name = KEYRING:persistent:%{uid}

[realms]
# EXAMPLE.COM = {
#  kdc = kerberos.example.com
#  admin_server = kerberos.example.com
# }
 LIGHT.LOCAL = {
   kdc = ks.light.local:60088
   admin_server = ks.light.local:60464
 }

[domain_realm]
# .example.com = EXAMPLE.COM
# example.com = EXAMPLE.COM
  .light.local = LIGHT.LOCAL
  light.local = LIGHT.LOCAL
```

2. 将kerberos server服务器将 keytab 文件复制到 service 服务器

```shell
# 在kerberos server服务器执行
scp /usr/local/apacheds/keytab/hnelson.keytab root@192.168.137.102:/usr/local/apacheds/keytab/

# 如果执行了此步骤 下面的 3 4 可以跳过
```

3. 初始化Ticket

```shell
# 初始化ticket
# 输入密码 文件中指定的是secret

[root@ks ~]# kinit hnelson
Password for hnelson@LIGHT.LOCAL:

# 查看ticket
[root@ks ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: hnelson@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-31T16:26:13  2024-04-01T16:26:06  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
        renew until 2024-04-07T16:26:06
```

4. 使用 ktutil 导出 keytab 文件

```shell
[root@ks ~]# ktutil
ktutil:  add_entry -password -p hnelson@LIGHT.LOCAL -k 1 -e aes128-cts-hmac-sha1-96
Password for hnelson@LIGHT.LOCAL:
ktutil:  wkt /usr/local/apacheds/keytab/hnelson.keytab
ktutil:  quit

```

add_entry 为每一种加密方式添加keytab ，然后用 wkt 将keytab写入到文件。参考[IBM Knowledge Center](https://www.ibm.com/docs/en/platform-symphony/7.1.0?topic=file-creating-kerberos-principal-keytab-files)

5. 验证keytab文件，如下keytab 文件也能成功验证。

```shell
[root@kc ~]# kinit -kt /usr/local/apacheds/keytab/hnelson.keytab hnelson
[root@kc ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: hnelson@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-31T16:40:39  2024-04-01T16:40:39  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
        renew until 2024-04-07T16:40:39
```

### 6. Kerberos登录ApacheDS
1. Kerberos 连接 ApacheDS 

- host: `ks.light.local`
- port: `10389`
- user: `uid=admin,ou=system`
- password: `secret`
- 
- Authentication Method: `GSSAPI(Kerberos)`
- Bind DN or User: `hnelson`
- Bind Password:  `secret`
- 
- Kerberos Settings
- Obtain TGT from KDC(provide username and password): √
- Use following configuration: √
  - Kerberos Realm: `LIGHT.LOCAL`
  - KDC Host: `ks.light.local`
  - KDC Port: `60088`

如果登录失败，可以查看ApacheDS的日志
```shell
tail -f /usr/local/apacheds/instances/default/log/apacheds.log

```

### 7. 添加SPN (Service Principal Name)

```shell
# 添加SPN 导出keytab
[root@ks ~]# ktutil
ktutil:  add_entry -password -p HTTP/kc.light.local@LIGHT.LOCAL -k 1 -e aes256-cts-hmac-sha1-96
Password for HTTP/kc.light.local@LIGHT.LOCAL:
ktutil:  wkt /usr/local/apacheds/keytab/spn.keytab
ktutil:  exit

# 发送到 service 服务器
scp /usr/local/apacheds/keytab/spn.keytab root@192.168.137.102:/usr/local/apacheds/keytab/

# 验证
kinit -kt /usr/local/apacheds/keytab/spn.keytab kc.light.local
```

## 三、编码



## 四、测试
