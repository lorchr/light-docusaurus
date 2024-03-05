
## 一、环境准备
### 1.1 OpenLDAP
- [OpenLDAP](https://www.openldap.org/) [Github](https://github.com/openldap/openldap)
- bitnami OpenLDAP [Docker](https://hub.docker.com/r/bitnami/openldap) [Github](https://github.com/bitnami/containers) 
- osixia OpenLDAP [Docker](https://hub.docker.com/r/osixia/openldap) [Github](https://github.com/osixia/docker-openldap)
- osixia Php LDAP Admin [Docker](https://hub.docker.com/r/osixia/phpldapadmin) [Github](https://github.com/osixia/docker-phpLDAPadmin)

#### bitnami OpenLDAP
```shell
# docker stop openldap && docker remove openldap
docker run --detach \
  --publish 1389:389 \
  --publish 1636:636 \
  --env LDAP_PORT_NUMBER=389 \
  --env LDAP_LDAPS_PORT_NUMBER=636 \
  --env LDAP_ADMIN_USERNAME=admin \
  --env LDAP_ADMIN_PASSWORD=123456 \
  --env LDAP_USERS=light,lorch \
  --env LDAP_PASSWORDS=light,lorch \
  --env LDAP_ROOT=dc=light,dc=com \
  --env LDAP_ADMIN_DN=cn=admin,dc=light,dc=com \
  --network dev \
  --restart=no \
  --name openldap \
  --hostname openldap \
  bitnami/openldap:2.6

# docker stop openldap-admin && docker remove openldap-admin
docker run --detach \
  --publish 1390:80 \
  --publish 1393:443 \
  --env PHPLDAPADMIN_HTTPS=false \
  --env PHPLDAPADMIN_LDAP_HOSTS=openldap \
  --privileged \
  --link openldap \
  --network dev \
  --restart=on-failure:3 \
  --name openldap-admin \
  --hostname openldap-admin \
  osixia/phpldapadmin:stable

```

命令行测试
```shell
docker exec -it -u root openldap /bin/bash
ldapsearch -x -H ldap://localhost:389 -b dc=light,dc=com -D "cn=admin,dc=light,dc=com" -w 123456

docker exec openldap ldapsearch -x -H ldap://localhost:389 -b dc=light,dc=com -D "cn=admin,dc=light,dc=com" -w 123456

# extended LDIF
#
# LDAPv3
# base <dc=light,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# light.com
dn: dc=light,dc=com
objectClass: dcObject
objectClass: organization
dc: light
o: example

# users, light.com
dn: ou=users,dc=light,dc=com
objectClass: organizationalUnit
ou: users

# light, users, light.com
dn: cn=light,ou=users,dc=light,dc=com
cn: User1
cn: light
sn: Bar1
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
userPassword:: bGlnaHQ=
uid: light
uidNumber: 1000
gidNumber: 1000
homeDirectory: /home/light

# lorch, users, light.com
dn: cn=lorch,ou=users,dc=light,dc=com
cn: User2
cn: lorch
sn: Bar2
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
userPassword:: bG9yY2g=
uid: lorch
uidNumber: 1001
gidNumber: 1001
homeDirectory: /home/lorch

# readers, users, light.com
dn: cn=readers,ou=users,dc=light,dc=com
cn: readers
objectClass: groupOfNames
member: cn=light,ou=users,dc=light,dc=com
member: cn=lorch,ou=users,dc=light,dc=com

# search result
search: 2
result: 0 Success

# numResponses: 6
# numEntries: 5
```

- [Dashboard](http://localhost:1390/)
- Account
  - user: cn=admin,dc=light,dc=com   password: 123456
  - user: cn=light,ou=users,dc=light,dc=com   password: light
  - user: cn=lorch,ou=users,dc=light,dc=com   password: lorch

#### osixia OpenLDAP
```shell
# docker stop ldap-service && docker remove ldap-service
docker run --detach \
  --publish 2389:389 \
  --publish 2636:636 \
  --env LDAP_ORGANISATION="light" \
  --env LDAP_DOMAIN="light.com" \
  --env LDAP_ADMIN_PASSWORD="123456" \
  --network dev \
  --restart=on-failure:3 \
  --name ldap-service \
  --hostname ldap-service \
  osixia/openldap:stable

# docker stop ldap-admin && docker remove ldap-admin
docker run --detach \
  --publish 2390:80 \
  --publish 2393:443 \
  --env PHPLDAPADMIN_HTTPS=false \
  --env PHPLDAPADMIN_LDAP_HOSTS=ldap-host \
  --privileged \
  --link ldap-service:ldap-host \
  --network dev \
  --restart=on-failure:3 \
  --name ldap-admin \
  --hostname ldap-admin \
  osixia/phpldapadmin:stable

```

命令行测试
```shell
# 连接LDAP容器
docker exec -it -u root ldap-service /bin/bash

# 添加用户
ldapadd -x -D "cn=admin,dc=light,dc=com" -W -f users.ldif

# 查询LDAP信息
ldapsearch -x -H ldap://localhost:389 -b dc=light,dc=com -D "cn=admin,dc=light,dc=com" -w 123456

# 查询LDAP信息
docker exec ldap-service ldapsearch -x -H ldap://localhost:389 -b dc=light,dc=com -D "cn=admin,dc=light,dc=com" -w 123456

# extended LDIF
#
# LDAPv3
# base <dc=light,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# light.com
dn: dc=light,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: light
dc: light

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

- [Dashboard](http://localhost:2390/)
- Account
  - user: cn=admin,dc=light,dc=com          password: 123456

### 1.2 Apache Directory Server
- [ApacheDS](https://directory.apache.org/) [Download](https://directory.apache.org/apacheds/) [Studio Client](https://directory.apache.org/studio)
- [Apache Directory Server](https://github.com/apache/directory-server)
- itzg ApacheDS [ Docker](https://hub.docker.com/r/itzg/apacheds)

```shell
# docker stop apache-ds && docker remove apache-ds
docker run --detach \
  --publish 10389:10389 \
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

### 1.3 Apache Directory Studio
- [Studio Client](https://directory.apache.org/studio)

#### 1. 下载客户端 [Studio Client](https://directory.apache.org/studio)
#### 2. 修改配置文件 `ApacheDirectoryStudio.ini` （客户端运行需要 Jdk11 以上）

```ini
-startup
plugins/org.eclipse.equinox.launcher_1.6.0.v20200915-1508.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_64_1.2.0.v20200915-1442
/studio-rcp/resources/icons/linux/studio.xpm
###
#Uncomment_to_configure_the_language
#https://directory.apache.org/studio/faqs.html#how-to-set-the-language-of-studio
#-nl
#en
###
#Uncomment_to_configure_Java_version_to_use
#https://directory.apache.org/studio/faqs.html#how-to-set-the-java-vm-to-use
#-vm
#/usr/lib/jvm/java-11-openjdk/bin/java
-vmargs
-Dosgi.requiredJavaVersion=11
###
#Uncomment_to_configure_heap_memory
#https://directory.apache.org/studio/faqs.html#how-to-increase-the-heap-memory
#-Xms1g
#-Xmx2g
```

添加两行
```ini
-vm
D:/Develop/jdk/jdk-17/bin/java
```

#### 3. 运行程序，新建LDAP连接

![img](./img/3/3-1.PNG)

输入ldap地址端口，输入完成校验ip端口是否可用
![img](./img/3/3-2.PNG)

点击下一步，输入账号密码并校验
- OpenLDAP: cn=light,ou=users,dc=light,dc=org / light
- ApacheDS: uid=admin,ou=system / secret

![img](./img/3/3-3.PNG)

切换认证模式重试，按上面的脚本，使用 `No Authentication` 即可
![img](./img/3/3-4.PNG)

点击完成，连接成功后即可在左侧看到对应的连接和ldap信息
![img](./img/3/3-5.PNG)

#### 4. 创建自己的Partition

Partition就好比一个完整的分区列表，在ApacheDS中，有一个默认的partition是 `dc=example,dc=com`，我们可以自定义一个Partition
![img](./img/3/3-6.PNG)

在Partitions General Detail 页面中，填入你自己的Partition ID和Suffix即可保存配置
![img](./img/3/3-7.PNG)

**注意：** 新建Partition后需要重启 ApacheDS 才能正常读取到

#### 5. 新增属性

Ldap自带一些objectClass，这些objectClass包含常用的属性。但在一般不能满足业务需求，需要我们自定义的属性，比如用户的roleId和groupId这两个属性
首先打开Schema Editor视图
![img](./img/3/3-8.PNG)

新增Schema项目，选择离线/在线并提供项目名称，Next 并全选所有类型
![img](./img/3/3-9.PNG)

打开连接，创建具有唯一名称的新Schema
![img](./img/3/3-10.PNG)

在Schema下可以为这些属性创建新的属性
![img](./img/3/3-11.PNG)
![img](./img/3/3-12.PNG)
![img](./img/3/3-13.PNG)

在Schema下可以为这些属性创建新的对象

![img](./img/3/3-14.PNG)
![img](./img/3/3-15.PNG)
![img](./img/3/3-16.PNG)

完成所有操作后，可以导出为.ldif 文件
![img](./img/3/3-17.PNG)

```ldif
# Generated by Apache Directory Studio on 2023年12月28日 下午5:02:28

# SCHEMA "LIGHT"
dn: cn=light, ou=schema
objectclass: metaSchema
objectclass: top
cn: light

dn: ou=attributetypes, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: attributetypes

dn: m-oid=1.2.3.4.5.6.11, ou=attributetypes, cn=light, ou=schema
objectclass: metaAttributeType
objectclass: metaTop
objectclass: top
m-oid: 1.2.3.4.5.6.11
m-name: groupId
m-description:: 57uEaWQ=
m-equality: bigIntegerMatch
m-ordering: bigIntegerMatch
m-substr: bigIntegerMatch
m-syntax: 1.3.6.1.4.1.18060.0.4.1.0.3
m-length: 20

dn: m-oid=1.2.3.4.5.6.12, ou=attributetypes, cn=light, ou=schema
objectclass: metaAttributeType
objectclass: metaTop
objectclass: top
m-oid: 1.2.3.4.5.6.12
m-name: roleId
m-description:: 6KeS6ImyaWQ=
m-equality: bigIntegerMatch
m-ordering: bigIntegerMatch
m-substr: bigIntegerMatch
m-syntax: 1.3.6.1.4.1.18060.0.4.1.0.3
m-length: 20

dn: ou=comparators, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: comparators

dn: ou=ditcontentrules, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: ditcontentrules

dn: ou=ditstructurerules, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: ditstructurerules

dn: ou=matchingrules, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: matchingrules

dn: ou=matchingruleuse, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: matchingruleuse

dn: ou=nameforms, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: nameforms

dn: ou=normalizers, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: normalizers

dn: ou=objectclasses, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: objectClasses

dn: m-oid=1.2.3.4.5.6.10, ou=objectclasses, cn=light, ou=schema
objectclass: metaObjectClass
objectclass: metaTop
objectclass: top
m-oid: 1.2.3.4.5.6.10
m-name: authority
m-description:: 5p2D6ZmQ
m-typeObjectClass: AUXILIARY
m-must: groupId
m-must: roleId

dn: ou=syntaxcheckers, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: syntaxcheckers

dn: ou=syntaxes, cn=light, ou=schema
objectclass: organizationalUnit
objectclass: top
ou: syntaxes

```

现在转到 LDAP浏览器透视图(Windows -> Open Perspective -> LDAP)，右键点击 `ou = schema` 对象，然后点击导入LDIF，导入上面的LDIF文件
![img](./img/3/3-18.PNG)

成功完成并刷新ou = schema对象，您可以看到添加的对象
![img](./img/3/3-19.PNG)

#### 6. 新增用户

新增用户，我们都通过ldif导入的方式
![img](./img/3/3-20.PNG)

新增一个ou (people)
通过ldif文件的导入形式远比手动添加更为方便，下面是添加ou的ldif配置文件内容。并且将他们导入进去

people.ldif
```ldif
dn: ou=people,dc=light,dc=com
ou: group
objectclass: top
objectclass: organizationalUnit
```

新增一个用户 (tom)

tom.ldif
```ldif
dn: uid=tom, ou=people, dc=light,dc=com
objectClass: organizationalPerson
objectClass: person
objectClass: inetOrgPerson
objectClass: top
objectClass: authority
cn: tom
sn: tom
mobile: 123456
displayName: tom
mail: 123456@qq.com
uid: tom
userPassword: 123456
groupId: 630030462375411712
roleId: 703667259852726272
```

导入结果如图
![img](./img/3/3-21.PNG)

### 1.4 Embedded ApacheDS Server
- [内嵌ApacheDS服务端搭建](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/ldap.html#servlet-authentication-ldap-apacheds)
- [准备用户信息](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/ldap.html#servlet-authentication-ldap-embedded)

#### 添加ApacheDS Server依赖 pom.xml
```xml
<dependency>
	<groupId>org.apache.directory.server</groupId>
	<artifactId>apacheds-core</artifactId>
	<version>1.5.5</version>
	<scope>runtime</scope>
</dependency>
<dependency>
	<groupId>org.apache.directory.server</groupId>
	<artifactId>apacheds-server-jndi</artifactId>
	<version>1.5.5</version>
	<scope>runtime</scope>
</dependency>
```

#### 注入内嵌Bean  ApacheDSConfig.java
```java
@Bean
public ApacheDSContainer ldapContainer() {
	return new ApacheDSContainer("dc=springframework,dc=org",
				"classpath:users.ldif");
}
```

#### 准备用户 users.ldif

```ldif
dn: ou=groups,dc=springframework,dc=org
objectclass: top
objectclass: organizationalUnit
ou: groups

dn: ou=people,dc=springframework,dc=org
objectclass: top
objectclass: organizationalUnit
ou: people

dn: uid=admin,ou=people,dc=springframework,dc=org
objectclass: top
objectclass: person
objectclass: organizationalPerson
objectclass: inetOrgPerson
cn: Rod Johnson
sn: Johnson
uid: admin
userPassword: password

dn: uid=user,ou=people,dc=springframework,dc=org
objectclass: top
objectclass: person
objectclass: organizationalPerson
objectclass: inetOrgPerson
cn: Dianne Emu
sn: Emu
uid: user
userPassword: password

dn: cn=user,ou=groups,dc=springframework,dc=org
objectclass: top
objectclass: groupOfNames
cn: user
uniqueMember: uid=admin,ou=people,dc=springframework,dc=org
uniqueMember: uid=user,ou=people,dc=springframework,dc=org

dn: cn=admin,ou=groups,dc=springframework,dc=org
objectclass: top
objectclass: groupOfNames
cn: admin
uniqueMember: uid=admin,ou=people,dc=springframework,dc=org
```

### 1.5 LdapAdmin使用 (以上面 osixia OpenLDAP 部署为例)
1. 登录[Dashboard](http://localhost:2390)
2. 输入用户信息登录 `cn=admin,dc=light,dc=com` `123456`
3. 菜单功能介绍，重点关注 `Schema` 和 `Import`
   1. `Schema`:     查看 类 属性 语法 匹配规则等详细信息
   2. `Search`:     搜索LDAP信息
   3. `Refresh`:    刷新LDAP重新加载信息
   4. `Info`:       查看LDAP服务端信息
   5. `Import`:     导入准备好的 LDIF 文件
   6. `Export`:     导出LDAP的Entry信息为LDIF文件
   7. `Logout`:     退出登录

## 二、搭建服务
### 2.1 配置
pom.ml 

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-ldap</artifactId>
</dependency>
```

application.yaml

```yaml
spring:
  ldap:
    urls: ldap://localhost:10389
    base: ou=people,dc=light,dc=com
    username: uid=admin,ou=system
    password: secret
    base-environment.java.naming.ldap.attributes.binary: objectGUID
```

### 2.2 配置类
创建配置类，完成用Spring LDAP连接LDAP服务器，定义`LdapTemplate`，后续通过它完成对ldap目录树的CRUD操作

```java
/**
 * @see org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration
 */
@Configuration
public class LdapConfig {

    @Resource
    private LdapTemplate ldapTemplate;

    @Bean
    public LdapContextSource contextSource() {
        LdapContextSource contextSource = new LdapContextSource();
        Map<String, Object> config = new HashMap<>();
        contextSource.setUrl(urls);
        contextSource.setBase(base);
        contextSource.setUserDn(username);
        contextSource.setPassword(password);
        // 解决乱码
        config.put("java.naming.ldap.attributes.binary", "objectGUID");
        contextSource.setPooled(true);
        contextSource.setBaseEnvironmentProperties(config);
        return contextSource;
    }

    @Bean
    public LdapTemplate ldapTemplate() {
        if (null == ldapTemplate) {
            ldapTemplate = new LdapTemplate(contextSource());
        }
        return ldapTemplate;
    }

}
```

### 2.3 业务类
以下就是通过`LdapTemplate`完成CRUD功能，后续创新平台对用户进行增删改查操作都会调用这些接口将用户信息同步到LDAP服务器中

LdapTestController.java
```java
@RestController
@RequestMapping("ldap")
public class LdapTestController {

    @Resource
    private LdapService ldapService;

    @Resource
    private LdapAuthenticationProvider ldapAuthenticationProvider;

    @GetMapping("userExists")
    public ResultResponse<Boolean> userExists(String username) {
        ldapService.userExists(username);
        return ResultResponse.SUCCESS(true);
    }

    @GetMapping("userInfo")
    public ResultResponse<UserInfo> userInfo(String username) throws NamingException {
        UserInfo adapter = ldapService.userInfo(username);
        return ResultResponse.SUCCESS(adapter);
    }

    @PostMapping("authenticate")
    public ResultResponse<Object> authenticate(@RequestBody LoginParam user) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());
        Authentication authentication = ldapAuthenticationProvider.authenticate(token);
        return ResultResponse.SUCCESS(authentication.getPrincipal());
    }

}
```


LdapService.java
```java
public interface LdapService {

    /**
     * 根据用户名查询用户
     * @param username 用户名
     * @return 
     */
    void userExists(String username);

    /**
     * 根据用户名查询用户信息
     * @param username 用户名
     * @return 
     */
    UserInfo userInfo(String username) throws NamingException;

    /**
     * 登录认证
     * @param username 用户名
     * @param password 密码
     * @return
     */
    boolean authentication(String username, String password);
}
```

LdapServiceImpl.java
```java
@Service
public class LdapServiceImpl implements LdapService {

    public static final Logger log = LoggerFactory.getLogger(LdapServiceImpl.class);

    @Resource
    private LdapTemplate ldapTemplate;

    @Override
    public void userExists(String username) {
        ldapTemplate.lookup("uid=" + username);
    }

    @Override
    public UserInfo userInfo(String username) {
        Object result = ldapTemplate.lookup("uid=" + username);
        if (result instanceof DirContextAdapter) {
            return parse((DirContextAdapter) result);
        }
        return null;
    }

    @Override
    public boolean authentication(String username, String password) {
        EqualsFilter filter = new EqualsFilter("uid", username);
        return ldapTemplate.authenticate("", filter.encode(), password);
    }

    public UserInfo parse(DirContextAdapter adapter) {
        Map<String, LdapAttributeVO> attributeMap = parseAttributes(adapter);

        LdapAttributeVO uid = attributeMap.get("uid");
        LdapAttributeVO userPassword = attributeMap.get("userPassword");
        LdapAttributeVO displayName = attributeMap.get("displayName");
        LdapAttributeVO mobile = attributeMap.get("mobile");
        LdapAttributeVO mail = attributeMap.get("mail");
//        LdapAttributeVO groupId = attributeMap.get("groupId");
//        LdapAttributeVO roleId = attributeMap.get("roleId");
//        List<Long> groupIds = Arrays.stream(groupId.getValue().toString().split(",")).map(Long::valueOf).collect(Collectors.toList());
//        List<Long> roleIds = Arrays.stream(roleId.getValue().toString().split(",")).map(Long::valueOf).collect(Collectors.toList());

        Object value = userPassword.getValue();
        String password = (value instanceof String) ? (String) value : new String((byte[]) value);
        UserInfo userInfo = new UserInfo();
        userInfo.setUsername(parseValue(uid.getValue().toString()));
        userInfo.setRealname(parseValue(displayName.getValue().toString()));
        userInfo.setPassword(password);
        userInfo.setEmail(parseValue(mail.getValue().toString()));
        userInfo.setPhone(parseValue(mobile.getValue().toString()));
//        userInfo.setGroupIdList(groupIds);
//        userInfo.setRoleIdList(roleIds);

        return userInfo;
    }

    public String parseValue(String value) {
        Charset charset = CharsetTool.detect(value);
        if (StandardCharsets.UTF_8.equals(charset)) {
            return value;
        }
        return new String(value.getBytes(charset), StandardCharsets.UTF_8);
    }

    public Map<String, LdapAttributeVO> parseAttributes(DirContextAdapter adapter) {
        Map<String, LdapAttributeVO> attributeMap = new HashMap<>(16);
        NamingEnumeration<? extends Attribute> attributesEnum = adapter.getAttributes().getAll();
        try {
            while (attributesEnum.hasMoreElements()) {
                Attribute attribute = attributesEnum.next();

                LdapAttributeVO attributeVO = convertAttribute(attribute);
                attributeMap.put(attributeVO.getName(), attributeVO);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return attributeMap;
    }

    public LdapAttributeVO convertAttribute(Attribute attribute) throws NamingException {
        String id = attribute.getID();
        Object value = attribute.get();
        String name = id;
        List<String> langTags = new ArrayList<>();
        List<String> options = new ArrayList<>();
        if (id.contains(";")) {
            String[] ids = id.split(";");
            name = ids[0];
            for (int i = 1, len = ids.length; i < len; i++) {
                String tag = ids[i];
                if (tag.startsWith("lang-")) {
                    tag = tag.substring("lang-".length());
                    langTags.add(tag);
                } else {
                    options.add(tag);
                }
            }
        }
        LdapAttributeVO ldapAttributeVO = new LdapAttributeVO();
        ldapAttributeVO.setName(name);
        ldapAttributeVO.setLangTags(langTags);
        ldapAttributeVO.setOptions(options);
        ldapAttributeVO.setValue(value);
        return ldapAttributeVO;
    }

}
```

LdapAttributeVO.java
```java
@Data
public class LdapAttributeVO implements Serializable {

    private static final long serialVersionUID = -1L;

    /**
     * 属性名
     */
    private String name;
    /**
     * 属性语言标签
     */
    private List<String> langTags;
    /**
     * 属性额外配置信息
     */
    private List<String> options;

    /**
     * 值
     */
    private Object value;
}
```

UserInfo.java
```java
@Data
public class UserInfo implements Serializable {

    private static final long serialVersionUID = 1L;
    /**
     * 用户来源的第三方系统系统标识，如：ldap，wecom，dingtalk等
     */
    @NotNull(message = "第三方系统系统标识不能为空")
    private String thirdSource;
    /**
     * 用户名
     */
    @NotNull(message = "用户名不能为空")
    private String username;
    /**
     * 用户姓名
     */
    @NotNull(message = "用户真实名字不能为空")
    private String realname;
    /**
     * 密码
     */
    @NotNull
    @Length(min = 5, max = 50, message = "用户密码长度应该在5 -50之间")
    private String password;
    /**
     * 邮箱
     */
    @NotNull(message = "邮箱不能为空")
    private String email;
    /**
     * 手机号
     */
    @NotNull(message = "手机号不能为空")
    private String phone;
    /**
     * 主部门
     */
    @NotNull(message = "主部门不能为空")
    private Long mainDepartmentId;
    /**
     * 状态 0-正常；1-删除、冻结
     */
    @NotNull(message = "状态不能为空")
    @Max(value = 1, message = "状态最大为1")
    @Min(value = 0, message = "状态最小为0")
    private Integer status;
    /**
     * 角色id集合
     */
    private List<Long> roleIdList;
    /**
     * 分组id集合
     */
    private List<Long> groupIdList;

}
```

## 三、测试效果

## 四、集成OAuth2
