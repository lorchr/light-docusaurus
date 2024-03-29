- [[认证 & 授权] 1. OAuth2授权 ](https://www.cnblogs.com/linianhui/p/oauth2-authorization.html)

- [在OAuth2授权流程中实现联合身份认证](https://cloud.tencent.com/developer/article/2134895)
- [Spring OAuth2（5） - 基于LDAP验证用户](https://segmentfault.com/a/1190000039911540)

## 一、前言

## 二、分析

## 三、准备
### 1. 使用Docker部署OpenLDAP服务端

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


### 2. 导入测试用户
测试用户信息脚本从[Spring官网获取](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/ldap.html#servlet-authentication-ldap-embedded)

**注意:**
1. 由于创建容器使用的 `domain`(`dc=light,dc=com`) 和脚本中的不一样(`dc=springframework,dc=org`)，
   - 将 `BaseDN` 由 `dc=springframework,dc=org` 改为 `dc=light,dc=com`
2. 版本兼容问题
   - 通过 phpLdapAdmin 查看 `Schema`，发现 `groupOfNames` 类没有 `uniqueMember` 属性，将 `uniqueMember` 改为  `groupOfNames` 支持的 `member`


最终得到的  `users.ldif` 脚本如下
```ldif
dn: ou=groups,dc=light,dc=com
objectclass: top
objectclass: organizationalUnit
ou: groups

dn: ou=people,dc=light,dc=com
objectclass: top
objectclass: organizationalUnit
ou: people

dn: uid=admin,ou=people,dc=light,dc=com
objectclass: top
objectclass: person
objectclass: organizationalPerson
objectclass: inetOrgPerson
cn: Rod Johnson
sn: Johnson
uid: admin
userPassword: password

dn: uid=user,ou=people,dc=light,dc=com
objectclass: top
objectclass: person
objectclass: organizationalPerson
objectclass: inetOrgPerson
cn: Dianne Emu
sn: Emu
uid: user
userPassword: password

dn: cn=user,ou=groups,dc=light,dc=com
objectclass: top
objectclass: groupOfNames
cn: user
member: uid=admin,ou=people,dc=light,dc=com
member: uid=user,ou=people,dc=light,dc=com

dn: cn=admin,ou=groups,dc=light,dc=com
objectclass: top
objectclass: groupOfNames
cn: admin
member: uid=admin,ou=people,dc=light,dc=com

```


## 四、编码
### 1. 导入Ldap依赖

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-ldap</artifactId>
</dependency>
```

### 2. 配置 application.yaml

```yaml
spring:
  main:
    allow-circular-references: true
    allow-bean-definition-overriding: true
  ldap:
    urls: ldap://127.0.0.1:2389
    base: dc=light,dc=com
    username: cn=admin,dc=light,dc=com
    password: 123456
    user-dn-patterns:
      - uid={0},ou=people
    user-search-base: ou=people
    user-search-filter: (uid={0})
```

### 3. LdapLoginAuthenticationProvider

```java
package com.light.sas.authorization.ldap;

import com.light.sas.constant.LdapParameterNames;
import com.light.sas.constant.SecurityConstants;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.InetOrgPerson;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
import org.springframework.security.ldap.userdetails.Person;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Ldap登录认证提供者
 */
public class LdapLoginAuthenticationProvider extends AbstractLdapAuthenticationProvider {

    private final AbstractLdapAuthenticationProvider delegate;

    public LdapLoginAuthenticationProvider(AbstractLdapAuthenticationProvider delegate) {
        this.delegate = delegate;
    }

    public boolean support(Authentication authentication) {
        String loginType = getLoginType(SecurityConstants.LOGIN_TYPE_NAME);
        return LdapParameterNames.THIRD_LOGIN_LDAP.equalsIgnoreCase(loginType);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (support(authentication)) {
            Authentication authenticate = delegate.authenticate(authentication);

            if (Objects.nonNull(authenticate) && authenticate.isAuthenticated()) {
                syncLdapUser(authenticate.getPrincipal());
            }
            return authenticate;
        }
        return null;
    }

    /**
     * 将LDAP用户同步到系统
     *
     * @param principal
     */
    public void syncLdapUser(Object principal) {
        Map<String, Object> userInfo = new HashMap<>();
        if (principal instanceof LdapUserDetails ldapUser) {
            userInfo.put(SecurityConstants.LOGIN_TYPE_NAME, LdapParameterNames.THIRD_LOGIN_LDAP);
            userInfo.put(LdapParameterNames.DN, ldapUser.getDn());

            if (principal instanceof Person person) {
                userInfo.put(LdapParameterNames.CN, person.getCn());
                userInfo.put(LdapParameterNames.SN, person.getSn());
                userInfo.put(LdapParameterNames.GIVEN_NAME, person.getGivenName());
                userInfo.put(LdapParameterNames.TELEPHONE_NUMBER, person.getTelephoneNumber());
                userInfo.put(LdapParameterNames.DESCRIPTION, person.getDescription());
            }
            // InetOrgPerson 继承了 Person
            if (principal instanceof InetOrgPerson inetOrgPerson) {
                userInfo.put(LdapParameterNames.UID, inetOrgPerson.getUid());
                userInfo.put(LdapParameterNames.TITLE, inetOrgPerson.getTitle());
                userInfo.put(LdapParameterNames.EMPLOYEE_NUMBER, inetOrgPerson.getEmployeeNumber());
                userInfo.put(LdapParameterNames.DISPLAY_NAME, inetOrgPerson.getDisplayName());
                userInfo.put(LdapParameterNames.DEPARTMENT_NUMBER, inetOrgPerson.getDepartmentNumber());
                userInfo.put(LdapParameterNames.MAIL, inetOrgPerson.getMail());
                userInfo.put(LdapParameterNames.MOBILE, inetOrgPerson.getMobile());
                userInfo.put(LdapParameterNames.POSTAL_CODE, inetOrgPerson.getPostalCode());
                userInfo.put(LdapParameterNames.POSTAL_ADDRESS, inetOrgPerson.getPostalAddress());
                userInfo.put(LdapParameterNames.HOME_PHONE, inetOrgPerson.getHomePhone());
                userInfo.put(LdapParameterNames.HOME_POSTAL_ADDRESS, inetOrgPerson.getHomePostalAddress());
                userInfo.put(LdapParameterNames.STREET, inetOrgPerson.getStreet());
                userInfo.put(LdapParameterNames.ROOM_NUMBER, inetOrgPerson.getRoomNumber());
            }
        }
        // TODO 保存到数据库
        System.out.println("同步用户信息：" + userInfo);
    }

    /**
     * 从Query参数，Header Cookie中依次读取请求类型
     *
     * @param name 参数名称
     * @return 参数值
     */
    public String getLoginType(String name) {
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = requestAttributes.getRequest();
        // 从参数读取
        String value = request.getParameter(name);
        if (!StringUtils.hasText(value)) {
            // 从Header读取
            value = request.getHeader(name);
        }
        if (!StringUtils.hasText(value)) {
            // 从Cookie读取
            Cookie[] cookies = request.getCookies();
            value = Arrays.stream(cookies)
                    .filter(cookie -> cookie.getName().equals(name))
                    .findFirst().map(Cookie::getName).orElse(null);
        }
        return value;
    }

    @Override
    protected DirContextOperations doAuthentication(UsernamePasswordAuthenticationToken auth) {
        throw new UnsupportedOperationException("Unsupported method [doAuthentication]");
    }

    @Override
    protected Collection<? extends GrantedAuthority> loadUserAuthorities(DirContextOperations userData, String username, String password) {
        throw new UnsupportedOperationException("Unsupported method [loadUserAuthorities]");
    }

}

```

### 4. LdapAuthenticationConfig

```java
package com.light.sas.authorization.ldap;

import com.light.sas.config.AuthorizationConfig;
import com.light.sas.properties.LdapProperties;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.ldap.AbstractLdapAuthenticationManagerFactory;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticator;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.PersonContextMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * LDAP认证配置类
 */
@Slf4j
@Configuration
@AutoConfigureAfter(AuthorizationConfig.class)
@EnableConfigurationProperties(LdapProperties.class)
public class LdapAuthenticationConfig implements InitializingBean {

    @Resource
    private LdapProperties ldapProperties;

    @Resource
    private ProviderManager authenticationManager;

    @Autowired(required = false)
    @Qualifier("ldapAuthenticationProvider")
    private AbstractLdapAuthenticationProvider ldapAuthenticationProvider;

    @Bean
    @ConditionalOnProperty(prefix = LdapProperties.PREFIX, name = "urls")
    public BaseLdapPathContextSource contextSource() {
        DefaultSpringSecurityContextSource contextSource = new DefaultSpringSecurityContextSource(
                Arrays.stream(ldapProperties.getUrls()).toList(), ldapProperties.getBase());
        contextSource.setUrls(ldapProperties.getUrls());
        contextSource.setBase(ldapProperties.getBase());
        contextSource.setUserDn(ldapProperties.getUsername());
        contextSource.setPassword(ldapProperties.getPassword());
        contextSource.afterPropertiesSet();
        return contextSource;
    }

    /**
     * @see AbstractLdapAuthenticationManagerFactory#getAuthenticator()
     * @param contextSource
     * @return
     */
    @Bean
    @ConditionalOnBean(BaseLdapPathContextSource.class)
    public AbstractLdapAuthenticator authenticator(BaseLdapPathContextSource contextSource) {
        BindAuthenticator authenticator = new BindAuthenticator(contextSource);
        String userSearchFilter = ldapProperties.getUserSearchFilter();
        if (userSearchFilter != null) {
            authenticator.setUserSearch(
                    new FilterBasedLdapUserSearch(ldapProperties.getUserSearchBase(), userSearchFilter, contextSource));
        }
        List<String> userDnPatterns = ldapProperties.getUserDnPatterns();
        if (userDnPatterns != null && userDnPatterns.size() > 0) {
            authenticator.setUserDnPatterns(userDnPatterns.toArray(new String[0]));
        }
        authenticator.afterPropertiesSet();
        return authenticator;
    }

    @Bean
    @ConditionalOnBean(AbstractLdapAuthenticator.class)
    public AbstractLdapAuthenticationProvider ldapAuthenticationProvider(AbstractLdapAuthenticator authenticator) {
        LdapAuthenticationProvider ldapAuthenticationProvider = new LdapAuthenticationProvider(authenticator);
        ldapAuthenticationProvider.setUserDetailsContextMapper(new PersonContextMapper());
        return ldapAuthenticationProvider;
    }

    /**
     * 通过向 {@link ProviderManager} 中动态的增减 {@link AuthenticationProvider} 实例，实现动态的添加Ldap认证提供者
     * @throws Exception
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        if (Objects.isNull(authenticationManager) || Objects.isNull(ldapAuthenticationProvider)) {
            return;
        }
        AbstractLdapAuthenticationProvider ldapAuthenticationProviderDelegator =
                new LdapLoginAuthenticationProvider(ldapAuthenticationProvider);
        List<AuthenticationProvider> providers = authenticationManager.getProviders();
        for (AuthenticationProvider provider : providers) {
            if (provider instanceof AbstractLdapAuthenticationProvider) {
                // 已经存在一个Ldap认证提供者了
                return;
            }
        }
        providers.add(0, ldapAuthenticationProviderDelegator);
    }
}

```

### 5. LdapParameterNames

```java
package com.light.sas.constant;

/**
 * Ldap认证相关常量参数
 */
public class LdapParameterNames {

    /**
     * 三方登录类型——Ldap
     */
    public static final String THIRD_LOGIN_LDAP = "ldap";
    public static final String CN = "cn";
    public static final String DN = "dn";
    public static final String SN = "sn";
    public static final String GIVEN_NAME = "givenName";
    public static final String TELEPHONE_NUMBER = "telephoneNumber";
    public static final String DESCRIPTION = "description";
    public static final String UID = "uid";
    public static final String TITLE = "title";
    public static final String EMPLOYEE_NUMBER = "employeeNumber";
    public static final String DISPLAY_NAME = "displayName";
    public static final String DEPARTMENT_NUMBER = "departmentNumber";
    public static final String MAIL = "mail";
    public static final String MOBILE = "mobile";
    public static final String POSTAL_CODE = "postalCode";
    public static final String POSTAL_ADDRESS = "postalAddress";
    public static final String HOME_PHONE = "homePhone";
    public static final String HOME_POSTAL_ADDRESS = "homePostalAddress";
    public static final String STREET = "street";
    public static final String ROOM_NUMBER = "roomNumber";
}

```

### 6. LdapProperties

```java
package com.light.sas.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Ldap配置属性定义
 * @see org.springframework.boot.autoconfigure.ldap.LdapProperties
 */
@Data
@ConfigurationProperties(prefix = LdapProperties.PREFIX)
public class LdapProperties implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final String PREFIX = "spring.ldap";

    private static final int DEFAULT_PORT = 389;

    // region  自定义属性
    private List<String> userDnPatterns;

    private String userSearchBase;

    private String userSearchFilter;

    // endregion

    // region 继承自 org.springframework.boot.autoconfigure.ldap.LdapProperties

    /**
     * LDAP URLs of the server.
     */
    private String[] urls;

    /**
     * Base suffix from which all operations should originate.
     */
    private String base;

    /**
     * Login username of the server.
     */
    private String username;

    /**
     * Login password of the server.
     */
    private String password;

    /**
     * Whether read-only operations should use an anonymous environment. Disabled by
     * default unless a username is set.
     */
    private Boolean anonymousReadOnly;

    /**
     * LDAP specification settings.
     */
    private final Map<String, String> baseEnvironment = new HashMap<>();

    private final org.springframework.boot.autoconfigure.ldap.LdapProperties.Template template =
            new org.springframework.boot.autoconfigure.ldap.LdapProperties.Template();

    // endregion

}

```

### 7. LdapUtils

```java
package com.light.sas.utils;

import com.light.sas.authorization.ldap.LdapLoginAuthenticationProvider;
import com.light.sas.properties.LdapProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.ldap.LdapBindAuthenticationManagerFactory;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticator;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.PersonContextMapper;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * 实现动态的开启关闭Ldap认证
 */
@Slf4j
public class LdapUtils {

    private LdapUtils() {
    }

    /**
     * 使用包装过的LdapAuthenticationProvider，否则会导致普通账号密码登录也走LDAP
     *
     * @param ldapProperties LDAP属性配置
     * @return LDAP认证提供者
     */
    public static AbstractLdapAuthenticationProvider buildLdapProviderDelegator(LdapProperties ldapProperties) {
        AbstractLdapAuthenticationProvider ldapAuthenticationProvider = buildLdapProvider(ldapProperties);
        if (Objects.isNull(ldapAuthenticationProvider)) {
            return null;
        }
        return new LdapLoginAuthenticationProvider(ldapAuthenticationProvider);
    }

    private static AbstractLdapAuthenticationProvider buildLdapProvider(LdapProperties ldapProperties) {
        BaseLdapPathContextSource contextSource = buildContextSource(ldapProperties);
        if (Objects.isNull(contextSource)) {
            return null;
        }
        AbstractLdapAuthenticator authenticator = buildAuthenticator(contextSource, ldapProperties);
        if (Objects.isNull(authenticator)) {
            return null;
        }
        LdapAuthenticationProvider ldapAuthenticationProvider = new LdapAuthenticationProvider(authenticator);
        ldapAuthenticationProvider.setUserDetailsContextMapper(new PersonContextMapper());
        return ldapAuthenticationProvider;
    }

    private static AuthenticationProvider buildLdapProvider(LdapProperties ldapProperties, BaseLdapPathContextSource contextSource) {
        LdapBindAuthenticationManagerFactory factory = new LdapBindAuthenticationManagerFactory(contextSource);
        if (CollectionUtils.isEmpty(ldapProperties.getUserDnPatterns())) {
            // uid={0},ou=people
            factory.setUserDnPatterns(ldapProperties.getUserDnPatterns().toArray(new String[0]));
        }
        if (StringUtils.hasText(ldapProperties.getUserSearchFilter())) {
            // (uid={0})
            factory.setUserSearchFilter(ldapProperties.getUserSearchFilter());
            //  ou=people
            factory.setUserSearchBase(ldapProperties.getUserSearchBase());
        }
        factory.setUserDetailsContextMapper(new PersonContextMapper());
        ProviderManager authenticationManager = (ProviderManager) factory.createAuthenticationManager();
        return authenticationManager.getProviders().get(0);
    }

    private static BaseLdapPathContextSource buildContextSource(LdapProperties ldapProperties) {
        try {
            DefaultSpringSecurityContextSource contextSource = new DefaultSpringSecurityContextSource(
                    Arrays.stream(ldapProperties.getUrls()).toList(), ldapProperties.getBase());
            contextSource.setUrls(ldapProperties.getUrls());
            contextSource.setBase(ldapProperties.getBase());
            contextSource.setUserDn(ldapProperties.getUsername());
            contextSource.setPassword(ldapProperties.getPassword());
            contextSource.afterPropertiesSet();
            return contextSource;
        } catch (Exception e) {
            log.info("构建 BaseLdapPathContextSource 异常，请检查Ldap配置信息", e);
            return null;
        }
    }

    private static BindAuthenticator buildAuthenticator(BaseLdapPathContextSource contextSource, LdapProperties ldapProperties) {
        try {
            BindAuthenticator authenticator = new BindAuthenticator(contextSource);
            String userSearchFilter = ldapProperties.getUserSearchFilter();
            if (userSearchFilter != null) {
                authenticator.setUserSearch(
                        new FilterBasedLdapUserSearch(ldapProperties.getUserSearchBase(), userSearchFilter, contextSource));
            }
            List<String> userDnPatterns = ldapProperties.getUserDnPatterns();
            if (userDnPatterns != null && userDnPatterns.size() > 0) {
                authenticator.setUserDnPatterns(userDnPatterns.toArray(new String[0]));
            }
            authenticator.afterPropertiesSet();
            return authenticator;
        } catch (Exception e) {
            log.info("构建 BaseLdapPathContextSource 异常，请检查Ldap配置信息", e);
            return null;
        }
    }
}

```

### 8. DynamicProviderController

```java
package com.light.sas.controller;

import com.light.sas.model.Result;
import com.light.sas.properties.LdapProperties;
import com.light.sas.utils.LdapUtils;
import jakarta.annotation.Resource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("provider")
public class DynamicProviderController {

    @Resource
    private LdapProperties ldapProperties;

    @Resource
    private ProviderManager authenticationManager;

    /**
     * 动态开启Ldap认证
     */
    @PostMapping("ldap")
    public Result<String> openLdapProvider() {
        AbstractLdapAuthenticationProvider ldapAuthenticationProvider = LdapUtils.buildLdapProviderDelegator(ldapProperties);
        List<AuthenticationProvider> providers = authenticationManager.getProviders();
        for (AuthenticationProvider provider : providers) {
            if (provider instanceof AbstractLdapAuthenticationProvider) {
                return Result.error("Ldap Authentication Provider already exists!");
            }
        }
        if (Objects.isNull(ldapAuthenticationProvider)) {
            return Result.error("Ldap Authentication Provider properties configured with error!");
        }
        providers.add(0, ldapAuthenticationProvider);
        return Result.success("Ldap Authentication Provider open success!");
    }

    /**
     * 动态关闭Ldap认证
     */
    @DeleteMapping("ldap")
    public Result<String> closeLdapProvider() {
        List<AuthenticationProvider> providers = authenticationManager.getProviders();
        for (int i = providers.size() - 1; i >= 0; i--) {
            AuthenticationProvider provider = providers.get(i);
            if (provider instanceof AbstractLdapAuthenticationProvider) {
                providers.remove(i);
            }
        }
        return Result.success("Ldap Authentication Provider close success!");
    }

}

```

## 五、测试

### 1. 命令行测试
```shell
curl --include --location --request POST 'http://127.0.0.1:8080/login' \
    --header 'loginType: ldap' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'username="admin"' \
    --form 'password="123456"'

```

响应结果
```http request
HTTP/1.1 200
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Set-Cookie: SESSION=MzE2ODhlYzYtMzNlOC00NmFmLThmOGMtZGQ5NTMwMDg5NDQ4; Domain=127.0.0.1; Path=/; HttpOnly; SameSite=Lax
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Tue, 12 Mar 2024 11:21:40 GMT

{"code":200,"message":"操作成功.","success":true,"data":null}
```

### 2. 浏览器测试
```shell
# 浏览器访问登录页，登录时添加请求头或者参数 loginType: Ldap 即可
http://127.0.0.1:5173

```
