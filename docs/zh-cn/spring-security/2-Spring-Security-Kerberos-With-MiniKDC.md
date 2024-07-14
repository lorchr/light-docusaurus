
- [krb5-server Docker](https://hub.docker.com/r/gcavalcante8808/krb5-server)
- [krb5-server Github](https://github.com/gcavalcante8808/docker-krb5-server)

- [KDC Server](https://github.com/eugenp/tutorials/tree/master/spring-security-modules/spring-security-oauth2-sso/spring-security-sso-kerberos)
- [Spring Security Kerberos Integration With MiniKdc](https://www.baeldung.com/spring-security-kerberos-integration)
- [Spring Security Kerberos Integration With MiniKdc Github](https://github.com/eugenp/tutorials/tree/master/spring-security-modules/spring-security-oauth2-sso/spring-security-sso-kerberos)

- [kerberos 官网](https://www.kerberos.org/)
- [kerberos 官方文档](https://kerberos.org/dist/index.html)
- [kerberos 官方文档](http://web.mit.edu/kerberos/krb5-current/doc/)
- [krb5 server安装](https://web.mit.edu/kerberos/krb5-latest/doc/admin/install_kdc.html#)

- [Kerberos认证原理与环境部署](https://www.cnblogs.com/liugp/p/16468514.html)
- [kerberos认证搭建安装](https://blog.csdn.net/tktttt/article/details/111151776)
- [Spring Security Kerberos windows 身份验证中的错误](http://www.yashinu.com/w4/show-4459476.html)
- [使用Spring拦截器实现SPNEGO服务端](https://blog.51cto.com/u_15101587/2623920)

- https://www.thetechnojournals.com/2019/12/integratedkerberos-authentication-using.html
- https://github.com/thetechnojournals/spring-tutorials/blob/master/KerberosAuthTutorial
- https://blog.csdn.net/weixin_40496191/article/details/124056421
- https://blog.csdn.net/weixin_40496191/article/details/124056953


- [Apache kerby](https://directory.apache.org/kerby/)
- [ApacheDS](https://directory.apache.org/apacheds/kerberos-user-guide.html)

## 部署MiniKDC

```shell
git clone https://github.com/eugenp/tutorials

```

## 部署Krb5-Server

```shell
git clone https://github.com/gcavalcante8808/docker-krb5-server

docker run --detach \
    --publish 4088:88 \
    --publish 4464:464 \
    --publish 4749:749 \
    --volume krb5kdc-data:/var/lib/krb5kdc\
    --env KRB5_REALM=EXAMPLE.COM \
    --env KRB5_KDC=localhost \
    --env KRB5_PASS=mypass \
    --ip 172.18.0.199 \
    --hostname krb5.light.local \
    --network dev \
    --restart=no \
    --name krb5-server \
    gcavalcante8808/krb5-server

docker exec -it -u root krb5-server /bin/bash

cat /etc/krb5.conf

# Will prompt for the password provided or the generated.
kinit admin/admin@EXAMPLE.COM
klist
```


```conf
[libdefaults]
 dns_lookup_realm = false
 ticket_lifetime = 24h
 renew_lifetime = 7d
 forwardable = true
 rdns = false
 default_realm = EXAMPLE.COM
 
[realms]
 EXAMPLE.COM = {
    kdc = localhost
    admin_server = localhost
 }

```

## 部署ApacheDS

- [ApacheDS Kerberos](https://directory.apache.org/apacheds/kerberos-user-guide.html)
- [ApacheDS](https://directory.apache.org/) 
- [Download](https://directory.apache.org/apacheds/) 
- [Studio Client](https://directory.apache.org/studio)
- [Apache Directory Server](https://github.com/apache/directory-server)
- [itzg ApacheDS Docker](https://hub.docker.com/r/itzg/apacheds)

### 1. 安装 ApacheDS

```shell
# docker stop apache-ds && docker remove apache-ds
docker run --detach \
  --publish 10389:10389 \
  --publish 10636:10636 \
  --publish 60088:60088 \
  --publish 60464:60464 \
  --ip 172.18.0.99 \
  --hostname ds.light.local \
  --add-host sp.light.local:10.106.136.62 \
  --network dev \
  --restart=no \
  --name apache-ds \
  itzg/apacheds:latest

```

命令行测试
```shell
# apache-ds镜像中没有 ldapsearch 可以使用openldap来测试
docker exec -it -u root openldap /bin/bash
ldapsearch -x -H ldap://apache-ds:10389 -b ou=system -D "uid=admin,ou=system" -w secret

docker exec openldap ldapsearch -x -H ldap://apache-ds:10389 -b ou=system -D "uid=admin,ou=system" -w secret

# extended LDIF
#
# LDAPv3
# base <ou=system> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# system
dn: ou=system
ou: system
objectClass: top
objectClass: organizationalUnit
objectClass: extensibleObject

# partitions, configuration, system
dn: ou=partitions,ou=configuration,ou=system
ou: partitions
objectClass: top
objectClass: organizationalUnit

# services, configuration, system
dn: ou=services,ou=configuration,ou=system
ou: services
objectClass: top
objectClass: organizationalUnit

# consumers, system
dn: ou=consumers,ou=system
ou: consumers
objectclass: top
objectclass: organizationalUnit

# interceptors, configuration, system
dn: ou=interceptors,ou=configuration,ou=system
ou: interceptors
objectClass: top
objectClass: organizationalUnit

# groups, system
dn: ou=groups,ou=system
ou: groups
objectClass: top
objectClass: organizationalUnit

# admin, system
dn: uid=admin,ou=system
keyAlgorithm: RSA
privateKeyFormat: PKCS#8
displayName: Directory Superuser
sn: administrator
cn: system administrator
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
objectClass: tlsKeyInfo
userCertificate:: MIIBdzCCASECBgGOCFajizANBgkqhkiG9w0BAQUFADBCMQswCQYDVQQGEwJV
 UzEMMAoGA1UEChMDQVNGMRIwEAYDVQQLEwlEaXJlY3RvcnkxETAPBgNVBAMTCEFwYWNoZURTMB4XD
 TI0MDMwNDA3MjExOVoXDTI1MDMwNDA3MjExOVowRjELMAkGA1UEBhMCVVMxDDAKBgNVBAoTA0FTRj
 ESMBAGA1UECxMJRGlyZWN0b3J5MRUwEwYDVQQDEww1YmIyMWE4N2VmMGEwXDANBgkqhkiG9w0BAQE
 FAANLADBIAkEAl+N1WqoGyc+T/IJeLzpnj886ljvcEZitS+hO5FF6RIWoDcuy9qCI5aqbQpOlgGty
 skOoxSdMNiFkKyKgEhFHEQIDAQABMA0GCSqGSIb3DQEBBQUAA0EASM2e5vNZ9ByhgUbyBIV6oQgpD
 AL4vlCOGoTUYUPIkz1sTGzRzLTvRAHneURdy9GXXkwk3PZgraoPsJfOAdf9Jw==
userPassword:: c2VjcmV0
publicKey:: MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJfjdVqqBsnPk/yCXi86Z4/POpY73BGYrU
 voTuRRekSFqA3LsvagiOWqm0KTpYBrcrJDqMUnTDYhZCsioBIRRxECAwEAAQ==
publicKeyFormat: X.509
uid: admin
privateKey:: MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEAl+N1WqoGyc+T/IJeL
 zpnj886ljvcEZitS+hO5FF6RIWoDcuy9qCI5aqbQpOlgGtyskOoxSdMNiFkKyKgEhFHEQIDAQABAj
 8jAUkKnCT0XeK9T05llBBKFHhsJ1+Qrp9B30hPVnfXUprtfqRU4LERq6gd/JcHYO5bGzsry6bmE8b
 JpAfll1ECIQDc88/f7H0livaDPXVCmChU1uCOgyotUaLvWzZCzxPbFQIhAK/7LWuobQzOSM8tt4WN
 R6EtqlF18N8iaiuiuRWBYEsNAiA89IZEoFlmIhAf5LSUyqVVwnHw3v6jwgHRRriRdc9kgQIhAKh1C
 bqnxJPgl+PzAF2Qq0PH4eUOwF/oordYklHaweG1AiB74pWqLejWwzwz54bw7SC1wKGSPNIrO5z/ng
 P6EfpoYw==

# configuration, system
dn: ou=configuration,ou=system
ou: configuration
objectClass: top
objectClass: organizationalUnit

# sysPrefRoot, system
dn: prefNodeName=sysPrefRoot,ou=system
objectClass: top
objectClass: organizationalUnit
objectClass: extensibleObject
prefNodeName: sysPrefRoot

# users, system
dn: ou=users,ou=system
ou: users
objectClass: top
objectClass: organizationalUnit

# Administrators, groups, system
dn: cn=Administrators,ou=groups,ou=system
uniqueMember: 0.9.2342.19200300.100.1.1=admin,2.5.4.11=system
cn: Administrators
objectClass: top
objectClass: groupOfUniqueNames

# search result
search: 2
result: 0 Success

# numResponses: 12
# numEntries: 11
```

- Account
  - user: uid=admin,ou=system  password secret

### 2. 安装 ApacheDS Studio 

要安装和配置ApacheDS以及LDAP和Kerberos，请按照以下步骤操作：

1. 下载ApacheDS：首先，从ApacheDS官方网站下载最新版本的ApacheDS。下载完成后，解压缩文件。
2. 启动ApacheDS：进入解压缩后的ApacheDS目录，在命令行中运行./bin/apacheds.sh start（对于Windows用户，运行./bin/apacheds.bat start）。这将启动ApacheDS服务器。
3. 运行ApacheDS Studio：ApacheDS Studio是一个用于管理和配置LDAP目录的图形化工具。打开ApacheDS Studio，并创建一个新的连接。

### 1. 配置 LDAP

1. 创建LDAP服务：在ApacheDS Studio中，右键单击“LDAP Servers”文件夹，选择“New” -> “LDAP Server”。填写以下信息：
   - Server Name: 输入一个名称以标识LDAP服务器。
   - Host Name: 输入本地主机名或IP地址。
   - Port: 输入LDAP服务器的端口号（默认是389）。
   - User Name: 输入管理员用户名（默认是"uid=admin,ou=system"）。
   - Password: 输入管理员密码（默认是"secret"）。
2. 点击“Next”并完成配置。

### 3. 配置 Kerberos

1. 创建Kerberos服务：在ApacheDS Studio中，右键单击“Kerberos Servers”文件夹，选择“New” -> “Kerberos Server”。填写以下信息：
   - Server Name: 输入一个名称以标识Kerberos服务器。
   - Host Name: 输入本地主机名或IP地址。
   - Port: 输入Kerberos服务器的端口号（默认是60088）。
   - User Name: 输入管理员用户名（默认是"uid=admin,ou=system"）。
   - Password: 输入管理员密码（默认是"secret"）。
2. 点击“Next”并完成配置。

配置LDAP和Kerberos：在ApacheDS Studio中，双击LDAP服务器和Kerberos服务器以打开相应的配置界面。在这些界面上，您可以配置LDAP目录和Kerberos的各种属性和设置。根据您的需求进行相应的配置。

测试LDAP和Kerberos：使用ApacheDS Studio或其他LDAP和Kerberos客户端工具，连接到ApacheDS服务器并进行测试。您可以执行LDAP查询、Kerberos认证等操作来验证安装和配置的正确性。

这些步骤应该能帮助您安装和配置ApacheDS、LDAP和Kerberos。请注意，这只是基本的安装和配置过程，您可能需要根据您的具体需求进行更详细和定制化的配置。

## 部署Apache Kerby
- [Apache kerby](https://directory.apache.org/kerby/)
- [Apache Kerby Github](https://github.com/apache/directory-kerby)
- [Introduction to SPNEGO/Kerberos Authentication in Spring](https://www.baeldung.com/spring-security-kerberos)
- [Running the Apache Kerby KDC in docker](https://coheigea.blogspot.com/2018/06/running-apache-kerby-kdc-in-docker.html)

### 1. 准备配置文件

/kerby/data/backend/json-backend.json
```conf
```

```shell
docker pull coheigea/kerby

docker run -d \
  --publish 3088:88 \
  --volume //d/docker/kerby/data:/kerby-data \
  --net dev \
  --restart=no \
  --name kerby \
  coheigea/kerby

docker exec -it -u root kerby /bin/bash

sh bin/kadmin.sh /kerby-data/conf/ -k /kerby-data/keytabs/admin.keytab

addprinc -pw password alice@EXAMPLE.COM


export KRB5_CONFIG=D:\docker\kerby\test\krb5.conf
kinit alice
klist
```

## Kerberos认证（一）——简明详细的安装和说明
- https://blog.csdn.net/qq_36488175/article/details/111476800
- https://www.cnblogs.com/liugp/p/16468514.html

### 准备
两台Centos7机器：

| 服务                      | 机器         | 主机名 | 域名            |
| ------------------------- | ------------ | ------ | --------------- |
| Kerberos server（服务端） | 192.168.2.55 | kdc    | kdc.light.local |
| Kerberos client（客户端） | 192.168.2.54 | srv    | srv.light.local |

```shell
cat >> /etc/hosts << EOF

192.168.2.55  light.local
192.168.2.55  kdc.light.local
192.168.2.54  srv.light.local
EOF

# 重启网络服务
systemctl restart network

# 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld
systemctl status firewalld
```


### 一、安装Kerberos server

#### 安装指令
```shell
yum install -y krb5-server krb5-workstation krb5-libs

```

- `krb5-server`：Kerberos服务端程序，KDC所在节点。
- `krb5-workstation`： 包含一些基本Kerberos程序，比如(kinit, klist, kdestroy,kpasswd)，使用Kerberos的所有节点都应该部署。
- `krb5-libs`：包含Kerberos程序的各种支持类库等。

安装完之后，会在KDC主机上生成配置文件

- `/etc/krb5.conf`
- `/var/kerberos/krb5kdc/kdc.conf`

#### 修改 krb5.conf

查看 krb5.conf

> cat /etc/krb5.conf

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
 default_ccache_name = KEYRING:persistent:%{uid}

[realms]
# EXAMPLE.COM = {
#  kdc = kerberos.example.com
#  admin_server = kerberos.example.com
# }

[domain_realm]
# .example.com = EXAMPLE.COM
# example.com = EXAMPLE.COM

```

修改 krb5.conf

> vim /etc/krb5.conf

```conf
# Configuration snippets may be placed in this directory as well
includedir /etc/krb5.conf.d/

# Kerberos守护进程的日志记录方式。换句话说，表示 server 端的日志的打印位置。
[logging]
 # krb5libs日志存放路径
 default = FILE:/var/log/krb5libs.log
 # krb5kdc日志存放路径
 kdc = FILE:/var/log/krb5kdc.log
 # kadmin服务日志存放路径
 admin_server = FILE:/var/log/kadmind.log

# Kerberos使用的默认值，当进行身份验证而未指定Kerberos域时，则使用default_realm参数指定的Kerberos域。即每种连接的默认配置，需要注意以下几个关键的配置
[libdefaults]
 # DNS查找域名，我们可以理解为DNS的正向解析，该功能我没有去验证过，默认禁用。（我猜测该功能和domain_realm配置有关）
 dns_lookup_realm = false
 # 凭证生效的时限，设置为24h。
 ticket_lifetime = 24h
 # 凭证最长可以被延期的时限，一般为7天。当凭证过期之后，对安全认证的服务的后续访问则会失败。
 renew_lifetime = 7d
 # 如果此参数被设置为true，则可以转发票据，这意味着如果具有TGT的用户登陆到远程系统，则KDC可以颁发新的TGT，而不需要用户再次进行身份验证。
 forwardable = true
 # 在进行dns解析的时候，正反向都可以，默认是true，如果dns_canonicalize_hostname参数被设置为false，那么rdns这个参数将无效。
 rdns = false
 # 在KDC中配置pkinit的位置，该参数的具体功能我没有做进一步验证。
 pkinit_anchors = FILE:/etc/pki/tls/certs/ca-bundle.crt
 # 设置 Kerberos 应用程序的默认领域。如果您有多个领域，只需向 [realms] 节添加其他的语句。其中默认EXAMPLE.COM可以为任意名字,推荐为大写，这里我改成了LIGHT.LOCAL。必须跟要配置的realm的名称一致。
 default_realm = LIGHT.LOCAL
 # 默认缓存的凭据名称，不推荐使用，当在客户端配置该参数的时候，会提示缓存错误信息。
 default_ccache_name = KEYRING:persistent:%{uid}

# 配置领域相关的信息，默认只有一个，可以配置多个
[realms]
LIGHT.LOCAL = {
 # kdc服务器地址。格式  机器：端口， 默认端口是88，默认端口可不写
 # kdc = 192.168.2.55:88 
 kdc = kdc.light.local:88
 # admin服务地址 格式 机器：端口， 默认端口749，默认端口可不写
 # admin_server = 192.168.2.55:749
 admin_server = kdc.light.local:749
 # 指定默认的域名
 default_domain = LIGHT.LOCAL
}

# 默认的域名 指定DNS域名和Kerberos域名之间映射关系。指定服务器的FQDN，对应的domain_realm值决定了主机所属的域。
[domain_realm]
 .light.local = LIGHT.LOCAL
 light.local = LIGHT.LOCAL

# kdc的配置信息,即指定kdc.conf的位置(默认不需要配置)。
[kdc]
 # kdc的配置文件路径，默认没有配置，如果是默认路径，可以不写
 profile = /var/kerberos/krb5kdc/kdc.conf
```

#### 配置 kdc.conf

查看 kdc.conf

> cat /var/kerberos/krb5kdc/kdc.conf

```conf
[kdcdefaults]
 kdc_ports = 88
 kdc_tcp_ports = 88

[realms]
 EXAMPLE.COM = {
  #master_key_type = aes256-cts
  acl_file = /var/kerberos/krb5kdc/kadm5.acl
  dict_file = /usr/share/dict/words
  admin_keytab = /var/kerberos/krb5kdc/kadm5.keytab
  supported_enctypes = aes256-cts:normal aes128-cts:normal des3-hmac-sha1:normal arcfour-hmac:normal camellia256-cts:normal camellia128-cts:normal des-hmac-sha1:normal des-cbc-md5:normal des-cbc-crc:normal
 }
```

修改 kdc.conf

> vim /var/kerberos/krb5kdc/kdc.conf 

```conf
[kdcdefaults]
 # kdc默认端口　
 kdc_ports = 88
 # kdc默认的tcp端口
 kdc_tcp_ports = 88

[realms]
 # 配置每个域的具体信息 (relam 请用大写)
 LIGHT.LOCAL = {
  # 和 supported_enctypes 默认使用 aes256-cts。由于，JAVA 使用 aes256-cts 验证方式需要安装额外的 jar 包（后面再做说明）。推荐不使用，并且删除 aes256-cts。（建议注释掉）
  # master_key_type = aes256-cts
  # 标注admin的用户权限。若文件不存在，需要用户自己创建。即该参数允许为具有对Kerberos数据库的管理访问权限的UPN指定ACL。
  acl_file = /var/kerberos/krb5kdc/kadm5.acl
  # 该参数指向包含潜在可猜测或可破解密码的文件。
  dict_file = /usr/share/dict/words
  # KDC进行校验的keytab
  admin_keytab = /var/kerberos/krb5kdc/kadm5.keytab
  # ticket 的默认生命周期为24h
  max_file = 24h
  # 该参数指定在多长时间内可重获取票据，默认为0
  max_renewable_life = 7d
  # 支持的校验方式
  supported_enctypes = aes256-cts:normal aes128-cts:normal des3-hmac-sha1:normal arcfour-hmac:normal camellia256-cts:normal camellia128-cts:normal des-hmac-sha1:normal des-cbc-md5:normal des-cbc-crc:normal
 }
```

#### 配置 kadm5.acl
权限相关配置

> vim /var/kerberos/krb5kdc/kadm5.acl

其中前一个号是通配符，表示像名为“abc/admin”或“xxx/admin”的人都可以使用此工具（远程或本地）管理kerberos数据库，后一个跟权限有关，*表示所有权限。LIGHT.LOCAL是上面配置的realm。

```conf
# 当前用户admin ，* 表示全部权限。可以新增用户和分配权限
# 配置表示以/admin@WXAMPLE.COM结尾的用户拥有*(all 也就是所有)权限，具体配置可根据项目来是否缩小权限。
*/admin@LIGHT.LOCAL     *
```

Kerberos kadmind 使用该文件来管理对 Kerberos 数据库的访问权限。对于影响 principa 的操作，ACL 文件还控制哪些 principal 可以对哪些其他 principa 进行操作。文件格式如下：

```shell
principal  permissions  [target_principal  [restrictions] ]
```

相关参数说明：

- principal：设置该 principal 的权限；principal 的每个部分都可以使用 *。
- permissions： 权限，指定匹配特定条目的主体可以执行或不可以执行的操作 。如果字符是大写，则不允许该操作。如果字符是小写，则允许该操作。有如下一些权限：
    - a：[不]允许添加主体或策略。
    - d：[不]允许删除主体或策略。
    - m：[不]允许修改主体或策略。
    - c：[不]允许更改主体的口令。
    - i：[不]允许查询 Kerberos 数据库。
    - l：[不]允许列出 Kerberos 数据库中的主体或策略。
    - x 或 *：允许所有权限。
- target_principal：目标 principal，目标 principal 的每个部分都可以使用 *。【可选】
- restrictions：针对权限的一些补充限制，如：限制创建的 principal 的票据最长时效。【可选】

```shell
# kadm5.acl 文件中的以下项授予 LIGHT.LOCAL 领域中包含 admin 实例的任何主体对 Kerberos 数据库的所有权限：
*/admin@LIGHT.LOCAL     *

# kadm5.acl 文件中的以下项授予 test@LIGHT.LOCAL 主体添加、列出和查询包含 root 实例的任何主体的权限。
test@LIGHT.LOCAL ali */root@LIGHT.LOCAL

# kadm5.acl 文件中的以下项不授予 test@LIGHT.LOCAL 主体添加、列出和查询包含 root 实例的任何主体的权限。
test@LIGHT.LOCAL ALI */root@LIGHT.LOCAL

```

详细说明可参考官网文档：https://web.mit.edu/kerberos/krb5-latest/doc/admin/conf_files/kadm5_acl.html

#### 创建数据库
注意： 此处记住自己的初始化的密码~ `kerberos`
```shell
[root@kdc ~]# kdb5_util create -r LIGHT.LOCAL -s
Loading random data
Initializing database '/var/kerberos/krb5kdc/principal' for realm 'LIGHT.LOCAL',
master key name 'K/M@LIGHT.LOCAL'
You will be prompted for the database Master Password.
It is important that you NOT FORGET this password.
Enter KDC database master key:
Re-enter KDC database master key to verify:
```

说明：

- `-s` 表示生成stash file，并在其中存储master server key（krb5kdc）
- `-r` 来指定一个realm name，当krb5.conf中定义了多个realm时使用
- 当Kerberos database创建好了之后，在 /var/kerberos/ 中可以看到生成的principal相关文件
- 如果遇到数据库已经存在的提示，可以把 /var/kerberos/krb5kdc/ 目录下的 principal 的相关文件都删除掉。默认的数据库名字都是 principal。可以使用 -d 指定数据库名字。

#### 启动服务

```shell
# 启动服务
systemctl start krb5kdc kadmin

# 查看状态
systemctl status krb5kdc kadmin

# 开启自启
systemctl enable krb5kdc kadmin
```

#### 创建管理员
注意： 记住自己设置的密码 `admin`

```shell
[root@kdc ~]# kadmin.local -q "addprinc root/admin"
Authenticating as principal root/admin@LIGHT.LOCAL with password.
WARNING: no policy specified for root/admin@LIGHT.LOCAL; defaulting to no policy
Enter password for principal "root/admin@LIGHT.LOCAL":
Re-enter password for principal "root/admin@LIGHT.LOCAL":
Principal "root/admin@LIGHT.LOCAL" created.
```

#### kadmin.local

Kerberos 服务机器上可以使用 kadmin.local 来执行各种管理的操作。进入 kadmin.local，不需要输入密码：

常用操作：

| 操作                                                   | 描述                                                       | 示例                                           |
| ------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------- |
| add_principal, addprinc, ank                           | 增加 principal                                             | add_principal -randkey test@HADOOP.COM         |
| cpw	|修改密码	|cpw test@HADOOP.COM                       |
| delete_principal, delprinc                             | 删除 principal                                             | delete_principal test@HADOOP.COM               |
| modify_principal, modprinc                             | 修改 principal                                             | modify_principal test@HADOOP.COM               |
| rename_principal, renprinc                             | 重命名 principal                                           | rename_principal test@HADOOP.COM test2@ABC.COM |
| get_principal, getprinc                                | 获取 principal	|get_principal test@HADOOP.COM               |
| list_principals, listprincs, get_principals, getprincs | 显示所有 principal                                         | listprincs                                     |
| ktadd, xst                                             | 导出条目到 keytab |	xst -k /root/test.keytab test@HADOOP.COM |
| ?                                                      | 查看帮助                                                   | ?                                              |

**注意** `-randkey`是密码是随机的，`-nokey`密码不随机【默认】，得手动输入密码

### 二、安装Kerberos client
#### 安装
```shell
yum -y install krb5-workstation krb5-devel

```

- `krb5-workstation`： 包含一些基本Kerberos程序，比如(kinit, klist, kdestroy, kpasswd)，使用Kerberos的所有节点都应该部署。
- `krb5-devel`：包含编译Kerberos程序的头文件和一些类库。

#### 修改配置
配置说明请看上面的 kerberos server 的配置
> vim /etc/krb5.conf

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
 default_realm = LIGHT.LOCAL
 default_ccache_name = KEYRING:persistent:%{uid}

[realms]
 LIGHT.LOCAL = {
  # kdc = 192.168.2.55:88
  # admin_server = 192.168.2.55:749
  kdc = kdc.light.local:88
  admin_server = kdc.light.local:749
 }

[domain_realm]
 .light.local = LIGHT.LOCAL
 light.local = LIGHT.LOCAL
```

#### 测试kadmin
```shell
# 之前服务端创建的用户-使用kadmin认证
[root@srv ~]# kinit root/admin
Password for root/admin@LIGHT.LOCAL:

[root@srv ~]# kadmin
Authenticating as principal root/admin@LIGHT.LOCAL with password.
Password for root/admin@LIGHT.LOCAL:
kadmin:  

# 列出用户信息
kadmin:  listprincs
K/M@LIGHT.LOCAL
kadmin/admin@LIGHT.LOCAL
kadmin/changepw@LIGHT.LOCAL
kadmin/kdc.light.local@LIGHT.LOCAL
kiprop/kdc.light.local@LIGHT.LOCAL
krbtgt/LIGHT.LOCAL@LIGHT.LOCAL
root/admin@LIGHT.LOCAL
kadmin:  
kadmin:  exit

# 指定用户连接
[root@srv ~]# kadmin -p root/admin@LIGHT.LOCAL
Authenticating as principal root/admin@LIGHT.LOCAL with password.
Password for root/admin@LIGHT.LOCAL:
```

如果出现权限不足报错，应该使用的非root用户。使用root用户把对应文件赋权后，在执行


### 三、常见操作指令
#### Kerberos常用命令

| 操作                   | 命令                                                    |
| ---------------------- | ------------------------------------------------------- |
| 启动kdc服务            | systemctl start krb5kdc                                 |
| 启动kadmin服务         | systemctl start kadmin                                  |
| 进入kadmin             | kadmin.local / kadmin                                   |
| 创建数据库             | kdb5_util create -r EXAMPLE.COM -s                      |
| 修改当前密码           | kpasswd                                                 |
| 测试keytab可用性       | kinit -k -t /home/xiaobai/xb.keytab xiaobai@EXAMPLE.COM |
| 查看当前票据           | klist                                                   |
| 查看                   | keytab klist -e -k -t /home/xiaobai/xb.keytab           |
| 通过keytab文件认证登录 | kinit -kt /home/xiaobai/xb.keytab xiaobai@EXAMPLE.COM   |
| 通过密码认证登录       | kinit xiaobai@EXAMPLE.COM / kint xiaobai                |
| 清除缓存               | kdestroy                                                |

#### kadmin模式下常用命令

| 操作                   | 命令                                                                                                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 查看 principal         | listprincs                                                                                                                                                                                                                               |
| 生成随机key的principal | addprinc -randkey root/admin@EXAMPLE.COM                                                                                                                                                                                                 |
| 生成指定key的principal | addprinc -pw xxx root/admin@EXAMPLE.COM                                                                                                                                                                                                  |
| 修改root/admin的密码   | cpw -pw xxx root/admin                                                                                                                                                                                                                   |
| 添加/删除principal     | addprinc/delprinc root/admin                                                                                                                                                                                                             |
| 直接生成到keytab       | ktadd -k /home/xiaobai/xb.keytab xiaobai@EXAMPLE.COM /xst -norandkey -k /home/xiaobai/xb.keytab      xiaobai@EXAMPLE.COM 注意：在生成keytab文件时需要加参数"-norandkey"，否则导致直接使用kinit xiaobai@EXAMPLE.COM初始化时提示密码错误。 |
| 设置密码策略(policy)   | addpol -maxlife “90 days” -minlife “75 days” -minlength 8 -minclasses 3 -maxfailure 10 -history 10 user                                                                                                                                  |
| 修改密码策略           | modpol -maxlife “90 days” -minlife “75 days” -minlength 8 -minclasses 3 -maxfailure 10 user                                                                                                                                              |
| 添加带有密码策略       | addprinc -policy user hello/admin@EXAMPLE.COM                                                                                                                                                                                            |
| 修改用户的密码策略     | modprinc -policy user1 hello/admin@EXAMPLE.COM                                                                                                                                                                                           |
| 删除密码策略           | delpol [-force] user                                                                                                                                                                                                                     |

#### kadmin（数据库管理）
> Kerberos 客户端机器上可以使用 `kadmin` 来执行各种管理的操作，服务端可以使用 `kadmin` 和 `kadmin.local` 命令。需先在 Kerbers Server 上创建登录的 principal，默认为 `{当前用户}/admin@realm`。

管理KDC数据库有两种方式：

- 一种直接在KDC（server端）直接执行，可以不需要输入密码就可以登录【命令：kadmin.local】
- 一种则是客户端命令，需要输入密码【命令：kadmin】，在server端和client端都可以使用。

创建用户，注意自己设置的密码
```shell
# 交互式
$ kadmin.local

add_principal root/admin

# 非交互式
$ kadmin.local -q "add_principal root/admin"
```

#### kinit(在客户端认证用户)
```shell
$ kinit root/admin@LIGHT.LOCAL
# 查看当前的认证用户
$ klist
```

输出结果

```shell
[root@srv ~]#  kinit root/admin@LIGHT.LOCAL
Password for root/admin@LIGHT.LOCAL:
[root@srv ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: root/admin@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-26T18:24:30  2024-03-27T18:24:30  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL

```

#### 导出keytab认证文件(在KDC使用)
使用xst命令或者ktadd命令：

```shell
# 非交互式
$ kadmin.local -q "ktadd -norandkey -k /root/root.keytab root/admin"

# 交互式
$ kadmin.local

ktadd -norandkey -k /root/root.keytab root/admin
或xst -k /root/v.keytab root/admin
或xst -norandkey -k /root/root.keytab root/admin
```

其中 `/root/root.keytab` 为自己指定的路径与文件名，以`.keytab`结尾；`root/admin`为之前创建的凭证用户

查看密钥文件

```shell
$ klist -kt /root/root.keytab
```

输出结果

```shell
[root@kdc ~]# kadmin.local -q "ktadd -norandkey -k /root/root.keytab root/admin"
Authenticating as principal root/admin@LIGHT.LOCAL with password.
Entry for principal root/admin with kvno 1, encryption type aes256-cts-hmac-sha1-96 added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type aes128-cts-hmac-sha1-96 added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type des3-cbc-sha1 added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type arcfour-hmac added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type camellia256-cts-cmac added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type camellia128-cts-cmac added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type des-hmac-sha1 added to keytab WRFILE:/root/root.keytab.
Entry for principal root/admin with kvno 1, encryption type des-cbc-md5 added to keytab WRFILE:/root/root.keytab.

[root@kdc ~]# klist -kt /root/root.keytab
Keytab name: FILE:/root/root.keytab
KVNO Timestamp           Principal
---- ------------------- ------------------------------------------------------
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
   1 2024-03-26T18:27:02 root/admin@LIGHT.LOCAL
```

#### 4、kdestroy(删除当前的认证缓存)
```shell
$ kdestroy
```

#### 5、用户认证（登录）
基于密码认证

```shell
$ klist
$ kinit root/admin
输入密码：admin

$ klist
```

基于密钥认证（keytab）

```shell
# 删除当前用户认证
$ kdestroy

# 拿到上面生成的keytab文件
$ klist
$ kinit -kt /root/root.keytab root/admin
$ klist
```

输出结果

```shell
[root@kdc ~]# klist
klist: Credentials cache keyring 'persistent:0:0' not found

[root@kdc ~]# kinit root/admin
Password for root/admin@LIGHT.LOCAL:

[root@kdc ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: root/admin@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-26T18:29:37  2024-03-27T18:29:37  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL

[root@kdc ~]# kdestroy

[root@kdc ~]# klist
klist: Credentials cache keyring 'persistent:0:0' not found

[root@kdc ~]# kinit -kt /root/root.keytab root/admin

[root@kdc ~]# klist
Ticket cache: KEYRING:persistent:0:0
Default principal: root/admin@LIGHT.LOCAL

Valid starting       Expires              Service principal
2024-03-26T18:30:03  2024-03-27T18:30:03  krbtgt/LIGHT.LOCAL@LIGHT.LOCAL

```

### 四、常见错误信息
- https://docs.oracle.com/cd/E26926_01/html/E25889/trouble-2.html
- https://github.com/steveloughran/kerberos_and_hadoop/blob/master/sections/errors.md

#### 1. `kinit: Cannot contact any KDC for realm 'LIGHT.LOCAL' while getting initial credentials`

```shell
# 启动服务
systemctl start krb5kdc kadmin


# 关闭防火墙
systemctl stop firewalld
```

#### 2. `Client not found in Kerberos database (6) - CLIENT_NOT_FOUND`

## 其他