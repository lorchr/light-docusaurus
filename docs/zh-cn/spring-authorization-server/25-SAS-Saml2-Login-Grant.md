- [Saml Tool](https://www.samltool.com/)
- [JWT Tool By Okta](https://jwt.io/)
- [Saml Tool By Okta](https://samltool.io/)

**SpringBoot集成文档**
- [Spring Security Github](https://github.com/spring-projects/spring-security)
- [Spring Security Samples Github](https://github.com/spring-projects/spring-security-samples)
- [Spring Security Samples SAML2 Github](https://github.com/spring-projects/spring-security-samples/tree/main/servlet/spring-boot/java/saml2)
- [Spring Security Document](https://docs.spring.io/spring-security)
- [Spring Security Document SAML2](https://docs.spring.io/spring-security/reference/servlet/saml2/login/overview.html)
- [SAML-2.0-Migration-Guide](https://github.com/spring-projects/spring-security/wiki/SAML-2.0-Migration-Guide)

**文章**
- [How to configure Keeper SSO Connect Cloud with Microsoft AD FS for seamless and secure SAML 2.0 authentication](https://docs.keeper.io/sso-connect-cloud/identity-provider-setup/ad-fs-keeper)
- [Active Directory 联合身份验证服务概述](https://learn.microsoft.com/zh-cn/windows-server/identity/ad-fs/ad-fs-overview)
- [如何将Spring Security 集成 SAML2 ADFS 实现SSO单点登录?](https://cloud.tencent.com/developer/article/2367225)

**SAML认证 Demo**
- [Spring Security SAML Login Logout](https://github.com/spring-projects/spring-security-samples/tree/main/servlet/spring-boot/java/saml2/login)
- [Spring Security SAML Migrate](https://github.com/jzheaux/spring-security-saml-migrate/tree/main/login-logout)
- [spring-security-saml2-azure-ad-example](https://github.com/Kahen/spring-security-saml2-azure-ad-example)
- [https://download.csdn.net/blog/column/12259144/131198433](https://gitee.com/pearl-organization/study-spring-security-demo)

**一些可本地部署的Idp服务**
- [Keyclock SAML2](https://www.keycloak.org/docs/latest/securing_apps/index.html#using-saml-to-secure-applications-and-services)
- [SeamlessAccess SAML2](https://seamlessaccess.atlassian.net/wiki/spaces/DOCUMENTAT/pages/84738190/Integrating+the+Login+Button+with+your+SAML+SP)
- [Shibboleth Idp](https://shibboleth.atlassian.net/wiki/spaces/IDP5/overview)

**Okta**
- [Okta](https://developer.okta.com/docs/guides/build-sso-integration/saml2/main/)
- [Okta Spring Security SAML](https://developer.okta.com/code/java/spring_security_saml/)
- [Springboot、React集成Okta SAML2单点登录](https://blog.csdn.net/qq_43169127/article/details/127772766)
- [Get Started with Spring Boot and SAML](https://developer.okta.com/blog/2022/08/05/spring-boot-saml)
- [Okta Spring Boot SAML Example Github](https://github.com/oktadev/okta-spring-boot-saml-example)

## 一、前言


## 二、分析


## 三、准备
- [keycloak官网](https://www.keycloak.org/)
- [SimpleSAMLphp](https://simplesamlphp.org/)
- [Okta SAML 2.0 IDP](https://developer.okta.com/docs/guides/build-sso-integration/saml2/main/)

### 1. 域名准备
| 模块 | 域名            | IP地址        | 备注       |
| ---- | --------------- | ------------- | ---------- |
| IDP  | idp.light.local | 172.18.0.99   | Docker容器 |
| SP   | sp.light.local  | 192.168.137.1 | 物理机     |

需要将此Hosts配置到IDP和SP服务上

```shell
cat >> /etc/hosts << EOF

172.18.0.99     idp.light.local
192.168.137.1   sp.light.local
EOF
```

因为Docker容器的IP映射到了物理机上，所以物理机的Hosts中IP可以都设置为 `127.0.0.1`

```shell

172.18.0.99     idp.light.local
192.168.137.1   sp.light.local
```

### 2. 部署一个SAML2 Identity Provider (IdP)
- [KeyCloak Container](https://quay.io/repository/keycloak/keycloak)
- [KeyCloak Container文档](https://www.keycloak.org/server/containers)
- [KeyCloak 修改端口](https://www.keycloak.org/server/hostname)

```shell
docker run --detach \
  --publish 8880:8080 \
  --env KEYCLOAK_ADMIN=admin \
  --env KEYCLOAK_ADMIN_PASSWORD=admin \
  --env KC_HOSTNAME_PORT=8880 \
  --ip 172.18.0.99 \
  --hostname idp.light.local \
  --add-host sp.light.local:192.168.137.1 \
  --network dev \
  --restart=no \
  --name keycloak \
  quay.io/keycloak/keycloak:24.0 start-dev

docker exec -it -u root keycloak /bin/bash

# 查看域名解析
cat /etc/hosts
# idp的ip为容器虚拟ip，用于自身识别
# sp的ip为物理机的ip，用于访问sp
172.18.0.99     idp.light.local
192.168.137.1   sp.light.local
```

- [Dashboard](http://idp.light.local:8880)
  - admin / admin

关于Keycloak的使用配置见[Spring-Security-Saml-With-Keycloak](../spring-security/1-Spring-Security-Saml-With-Keycloak.md)

### 3. 生成客户端证书秘钥

```shell
openssl req -newkey rsa:2048 -nodes -keyout sp-private.key -x509 -days 365 -out sp-certificate.crt
```

生成备用
1. 将私钥和证书复制到SpringBoot项目中，在SP收发IDP信息时加解密使用
2. 将证书导入到SAML IDP服务器中

## 三、编码
### 1. 引入依赖

添加OpenSAML仓库地址，原因见[Why Shibboleth DONOT publish jar to Maven Central](https://shibboleth.atlassian.net/wiki/spaces/DEV/pages/1123844333/Use+of+Maven+Central)

```xml
<repository>
    <id>shibboleth-repos</id>
    <name>Shibboleth Repository</name>
    <url>https://build.shibboleth.net/maven/releases/</url>
</repository>
```

添加SAML2集成依赖

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-saml2-service-provider</artifactId>
</dependency>
```

### 2. 配置 application.yaml

```yaml
spring:
  security:
    saml2:
      relyingparty:
        registration:
          # 依赖方的实体ID，任意的值，你可以选择它来区分不同的注册
          # SP元数据：http://sp.light.local:8080/saml2/service-provider-metadata/keycloak
          keycloak:
            # entity-id 需要和keycloak的client_id保持一致，否则会认证失败
            # entity-id: "{baseUrl}"
            entity-id: "saml_client"
            # 用于构建签名和解密的 Saml2X509Credential
            signing:
              credentials:
                - private-key-location: classpath:credentials/rp-private.key
                  # 证书文件需要导入到Client中
                  certificate-location: classpath:credentials/rp-certificate.crt
            acs:
              # 登录的回调地址，即客户端的 Master SAML Processing URL
              location: "{baseUrl}/login/saml2/sso/{registrationId}"
            # 登出配置
            singlelogout:
              binding: POST
              # 退出登录的回调地址 Valid post logout redirect URIs
              url: "{baseUrl}/logout/saml2/slo"
              responseUrl: "{baseUrl}/logout/saml2/slo"
            assertingparty:
              entity-id: http://idp.light.local:8880/realms/Test
              # IDP的 元数据访问地址
              metadata-uri: http://idp.light.local:8880/realms/Test/protocol/saml/descriptor
              singlesignon:
                # 登录认证的地址，从元数据中获取
                url: http://idp.light.local:8880/auth/realms/Test/protocol/saml
                sign-request: false
              # 此证书配置可以不要，元数据中有证书信息
              verification:
                credentials:
                  # IDP 的证书，从元数据中获取
                  - certificate-location: classpath:credentials/keycloak/keycloak.crt

```

### 3. SamlAuthenticationConfig

```java
package com.light.sas.authorization.saml2;

import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.saml2.provider.service.authentication.OpenSaml4AuthenticationProvider;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;
import org.springframework.security.web.SecurityFilterChain;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class SamlAuthenticationConfig {

    @Resource
    private ProviderManager authenticationManager;

    @Resource
    private OpenSaml4AuthenticationProvider openSaml4AuthenticationProvider;

    @Bean
    public SecurityFilterChain samlSecurityFilterChain(HttpSecurity http) throws Exception {
        List<AuthenticationProvider> providers = authenticationManager.getProviders();
        providers.add(new SamlLoginAuthenticationProvider(openSaml4AuthenticationProvider));

        // SAML2
        http
                .saml2Login((saml2) ->
                        saml2.loginPage("/saml2/login")
                                .loginProcessingUrl("/login/saml2/sso/{registrationId}")
                                .authenticationManager(authenticationManager)
                )
                .saml2Logout(Customizer.withDefaults())
                .saml2Metadata(Customizer.withDefaults());

        return http.build();
    }

    //@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // @formatter:off
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                // 自定义URL示例
                // .saml2Login((saml2) -> saml2.loginProcessingUrl("/saml/SSO"))
                // .saml2Logout((saml2) -> saml2.logoutRequest((request) -> request.logoutUrl("/saml/logout")))
                // .saml2Logout((saml2) -> saml2.logoutResponse((response) -> response.logoutUrl("/saml/SingleLogout")))
                // .saml2Metadata((saml2) -> saml2.metadataUrl("/saml/metadata"))
                // 使用默认的URL示例
                // /login/saml2/sso/{registrationId}
                .saml2Login(Customizer.withDefaults())
                // /logout/saml2/slo
                .saml2Logout(Customizer.withDefaults())
                // /saml2/service-provider-metadata/{registrationId}
                .saml2Metadata(Customizer.withDefaults());
        // @formatter:on
        return http.build();
    }

    @Bean
    public OpenSaml4AuthenticationProvider openSaml4AuthenticationProvider() {
        OpenSaml4AuthenticationProvider authenticationProvider = new OpenSaml4AuthenticationProvider();
        authenticationProvider.setResponseAuthenticationConverter(groupsConverter());

        return authenticationProvider;
    }

    @Bean
    public InMemoryRelyingPartyRegistrationRepository repositories(Saml2RelyingPartyProperties properties,
              @Value("classpath:credentials/rp-private.key") RSAPrivateKey key,
              @Value("classpath:credentials/rp-certificate.crt") File cert) {
        List<RelyingPartyRegistration> registrationList = new ArrayList<>();

        Saml2X509Credential credential = Saml2X509Credential.signing(key, x509Certificate(cert));

        Map<String, Saml2RelyingPartyProperties.Registration> registrationMap = properties.getRegistration();
        for (Map.Entry<String, Saml2RelyingPartyProperties.Registration> entry : registrationMap.entrySet()) {
            String registrationId = entry.getKey();
            Saml2RelyingPartyProperties.Registration registration = entry.getValue();

            List<RelyingPartyRegistration> registrations = RelyingPartyRegistrations
                    .collectionFromMetadataLocation(registration.getAssertingparty().getMetadataUri())
                    .stream().map((builder) -> builder.registrationId(registrationId)
                            .entityId(registration.getEntityId())
                            .assertionConsumerServiceLocation(registration.getAcs().getLocation())
                            .singleLogoutServiceLocation(registration.getSinglelogout().getUrl())
                            .singleLogoutServiceResponseLocation(registration.getSinglelogout().getResponseUrl())
                            .signingX509Credentials((credentials) -> credentials.add(credential)).build()
                    ).toList();

            registrationList.addAll(registrations);
        }
        return new InMemoryRelyingPartyRegistrationRepository(registrationList);
    }

    private Converter<OpenSaml4AuthenticationProvider.ResponseToken, Saml2Authentication> groupsConverter() {

        Converter<OpenSaml4AuthenticationProvider.ResponseToken, Saml2Authentication> delegate =
                OpenSaml4AuthenticationProvider.createDefaultResponseAuthenticationConverter();

        return (responseToken) -> {
            Saml2Authentication authentication = delegate.convert(responseToken);
            Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) authentication.getPrincipal();
            List<String> groups = principal.getAttribute("groups");
            Set<GrantedAuthority> authorities = new HashSet<>();
            if (groups != null) {
                groups.stream().map(SimpleGrantedAuthority::new).forEach(authorities::add);
            } else {
                authorities.addAll(authentication.getAuthorities());
            }
            return new Saml2Authentication(principal, authentication.getSaml2Response(), authorities);
        };
    }

    public X509Certificate x509Certificate(File location) {
        try (InputStream source = new FileInputStream(location)) {
            return (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(source);
        } catch (CertificateException | IOException ex) {
            throw new IllegalArgumentException(ex);
        }
    }
}

```

### 4. SamlLoginAuthenticationProvider

```java
package com.light.sas.authorization.saml2;

import cn.hutool.core.util.ArrayUtil;
import com.light.sas.constant.SamlParameterNames;
import com.light.sas.constant.SecurityConstants;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.saml2.provider.service.authentication.DefaultSaml2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.OpenSaml4AuthenticationProvider;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * SAML登录认证提供者
 * @see OpenSaml4AuthenticationProvider
 */
public class SamlLoginAuthenticationProvider implements AuthenticationProvider {

    private final OpenSaml4AuthenticationProvider delegate;

    public SamlLoginAuthenticationProvider(OpenSaml4AuthenticationProvider delegate) {
        this.delegate = delegate;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        String loginType = getLoginType(SecurityConstants.LOGIN_TYPE_NAME);
        return delegate.supports(authentication) || SamlParameterNames.THIRD_LOGIN_SAML.equalsIgnoreCase(loginType);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Authentication authenticate = delegate.authenticate(authentication);

        if (Objects.nonNull(authenticate) && authenticate.isAuthenticated()) {
            syncSamlUser(authenticate.getPrincipal());
        }
        return authenticate;
    }

    /**
     * 将SAML用户同步到系统
     *
     * @param principal
     */
    public void syncSamlUser(Object principal) {
        Map<String, Object> userInfo = new HashMap<>();
        if (principal instanceof DefaultSaml2AuthenticatedPrincipal saml2Principal) {
            String name = saml2Principal.getName();
            Map<String, List<Object>> attributes = saml2Principal.getAttributes();
            List<String> sessionIndexes = saml2Principal.getSessionIndexes();
            String relyingPartyRegistrationId = saml2Principal.getRelyingPartyRegistrationId();

            userInfo.put(SecurityConstants.LOGIN_TYPE_NAME, SamlParameterNames.THIRD_LOGIN_SAML);

            userInfo.put(SamlParameterNames.NAME, name);
            userInfo.put(SamlParameterNames.REGISTRATION_ID, relyingPartyRegistrationId);
            userInfo.putAll(attributes);
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
        Cookie[] cookies = request.getCookies();
        if (!StringUtils.hasText(value) && ArrayUtil.isNotEmpty(cookies)) {
            // 从Cookie读取
            value = Arrays.stream(cookies)
                    .filter(cookie -> cookie.getName().equals(name))
                    .findFirst().map(Cookie::getName).orElse(null);
        }
        return value;
    }

}

```

### 5. SamlParameterNames

```java
package com.light.sas.constant;

/**
 * Saml认证相关常量参数
 */
public class SamlParameterNames {

    /**
     * 三方登录类型——Saml
     */
    public static final String THIRD_LOGIN_SAML = "saml";

    /**
     * 自定义 grant type —— Saml
     */
    public static final String GRANT_TYPE_LDAP = "urn:ietf:params:oauth:grant-type:saml";

    public static final String NAME = "name";
    public static final String REGISTRATION_ID = "registrationId";

}

```

### 6. CORS配置
Keycloak 认证响应头中 `Origin: null` ，需要在跨域配置中允许这个Origin，否则会出现 `403 Forbidden Invalid CORS Request`

```java
package com.light.sas.config;

import com.light.sas.authorization.baisc.BasicAuthorizationRequestResolver;
import com.light.sas.authorization.baisc.adapter.AuthorizationRequestCustomizerAdapter;
import com.light.sas.authorization.baisc.adapter.OAuth2AccessTokenResponseClientAdapter;
import com.light.sas.authorization.baisc.adapter.OAuth2UserRequestEntityConverterAdapter;
import com.light.sas.authorization.baisc.delegator.AuthorizationRequestCustomizerDelegator;
import com.light.sas.authorization.baisc.delegator.OAuth2AccessTokenResponseClientDelegator;
import com.light.sas.authorization.baisc.delegator.OAuth2UserRequestEntityConverterDelegator;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * 将bean注入至ioc的配置类
 */
@Configuration
@EnableConfigurationProperties
public class BeanConfig {

    /**
     * 跨域过滤器配置
     *
     * @return CorsFilter
     */
    @Bean
    public CorsFilter corsFilter() {

        // 初始化cors配置对象
        CorsConfiguration configuration = new CorsConfiguration();

        // 设置允许跨域的域名,如果允许携带cookie的话,路径就不能写*号, *表示所有的域名都可以跨域访问
        configuration.addAllowedOrigin("http://127.0.0.1:5173");
        configuration.addAllowedOrigin("http://192.168.3.49:5173");
        configuration.addAllowedOrigin("null");
        // 设置跨域访问可以携带cookie
        configuration.setAllowCredentials(true);
        // 允许所有的请求方法 ==> GET POST PUT Delete
        configuration.addAllowedMethod("*");
        // 允许携带任何头信息
        configuration.addAllowedHeader("*");

        // 初始化cors配置源对象
        UrlBasedCorsConfigurationSource configurationSource = new UrlBasedCorsConfigurationSource();

        // 给配置源对象设置过滤的参数
        // 参数一: 过滤的路径 == > 所有的路径都要求校验是否跨域
        // 参数二: 配置类
        configurationSource.registerCorsConfiguration("/**", configuration);

        // 返回配置好的过滤器
        return new CorsFilter(configurationSource);
    }

    /**
     * 认证请求委托类，支持多个认证请求自定义
     * @param customizers 自定义的认证请求处理类，如：微信 企业微信 钉钉等
     * @return 认证请求委托对象
     */
    @Bean
    public AuthorizationRequestCustomizerDelegator authorizationRequestCustomizerDelegator(List<AuthorizationRequestCustomizerAdapter> customizers) {
        return new AuthorizationRequestCustomizerDelegator(customizers);
    }

    /**
     * Token响应委托类，支持多个Token响应自定义
     * @param clients 自定义的Token响应处理类，如：微信 企业微信 钉钉等
     * @return Token响应委托对象
     */
    @Bean
    public OAuth2AccessTokenResponseClientDelegator accessTokenResponseClientDelegator(List<OAuth2AccessTokenResponseClientAdapter> clients) {
        return new OAuth2AccessTokenResponseClientDelegator(clients);
    }

    /**
     * 用户请求委托类，支持多个用户请求自定义
     * @param converters 自定义的用户请求转换器，如：微信 企业微信 钉钉等
     * @return 用户请求委托对象
     */
    @Bean
    public OAuth2UserRequestEntityConverterDelegator requestEntityConverterDelegator(List<OAuth2UserRequestEntityConverterAdapter> converters) {
        return new OAuth2UserRequestEntityConverterDelegator(converters);
    }

    /**
     * 认证请求解析类
     * @param clientRegistrationRepository 认证客户端持久层对象
     * @param authorizationRequestCustomizerDelegator 认证请求委托对象
     * @return 认证请求解析对象
     */
    @Bean
    public BasicAuthorizationRequestResolver basicAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository,
            AuthorizationRequestCustomizerDelegator authorizationRequestCustomizerDelegator) {
        // DI通过构造器自动注入clientRegistrationRepository，实例化DefaultOAuth2AuthorizationRequestResolver处理
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository,
                OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI);
        // 兼容微信登录授权申请
        authorizationRequestResolver.setAuthorizationRequestCustomizer(authorizationRequestCustomizerDelegator);
        return new BasicAuthorizationRequestResolver(authorizationRequestResolver);
    }

}

```

### 7. 登录页添加SAML登录

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
          content="width=device-width, initial-scale=1 minimum-scale=1 maximum-scale=1 user-scalable=no"/>
    <link rel="stylesheet" href="./assets/css/style.css" type="text/css"/>
    <title>统一认证平台</title>
</head>

<body>
<div class="bottom-container">
</div>
<!-- <div th:if="${error}" class="alert" id="alert">
<div class="error-alert">
<img src="./image/logo.png" alt="logo" width="30">
<div th:text="${error}">

</div>
</div>
</div> -->
<div id="error_box">
</div>
<div class="form-container">

    <form class="form-signin" method="post" th:action="@{/login}">
        <input type="hidden" id="loginType" name="loginType" value="passwordLogin"/>
        <input type="hidden" id="captchaId" name="captchaId" value=""/>
        <!-- <div th:if="${param.error}" class="alert alert-danger" role="alert" th:text="${param}">
Invalid username or password.
</div>
<div th:if="${param.logout}" class="alert alert-success" role="alert">
你已经登出成功.
</div> -->

        <!--        <div class="text-placeholder" style="padding-bottom: 20px;">-->
        <!--            平台登录-->
        <!--        </div>-->
        <div class="welcome-text">
            <img src="./assets/img/logo.png" alt="logo" width="60">
            <span>
                    统一认证平台
                </span>
        </div>
        <div>
            <input type="text" id="username" name="username" class="form-control" placeholder="手机 / 邮箱"
                   autofocus onblur="leave()"/>
        </div>
        <div id="passContainer">
            <input type="password" id="password" name="password" class="form-control" placeholder="请输入密码"
                   onblur="leave()"/>
        </div>
        <div class="code-container" id="codeContainer">
            <input type="text" id="code" name="code" class="form-control" placeholder="请输入验证码"
                   onblur="leave()"/>
            <img src="" id="code-image" onclick="getVerifyCode()"/>
        </div>
        <div style="display: none; margin-bottom: 0" class="code-container" id="smsContainer">
            <input type="text" name="" class="form-control" placeholder="请输入验证码" onblur="leave()"/>
            <a id="getSmsCaptchaBtn" class="btn btn-light btn-block bg-white getCaptcha"
               href="javascript:getSmsCaptcha()">获取验证码</a>
        </div>
        <div class="change-login-type">
            <div></div>
            <a id="changeLoginType" href="javascript:showSmsCaptchaPage()">短信验证登录</a>
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">登&nbsp;&nbsp;&nbsp;&nbsp;录</button>
        <div class="text-placeholder">
            第三方登录
        </div>
        <!-- <a class="btn btn-light btn-block bg-white" href="/oauth2/authorization/gitee" role="link"
            style="text-transform: none;">
            Sign in with Gitee
        </a>
        <div>
            <a class="btn btn-light bg-white" href="/oauth2/authorization/github" role="link"
                style="text-transform: none;">
                <img width="24" style="margin-right: 5px;" alt="Sign in with GitHub"
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
                Github
            </a>
        </div> -->
        <div class="third-box">
            <a href="/oauth2/authorization/gitee" title="Gitee登录">
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" name="zi_tmGitee"
                     viewBox="0 0 2000 2000">
                    <path fill="red"
                          d="M898 1992q183 0 344-69.5t283-191.5q122-122 191.5-283t69.5-344q0-183-69.5-344T1525 477q-122-122-283-191.5T898 216q-184 0-345 69.5T270 477Q148 599 78.5 760T9 1104q0 183 69.5 344T270 1731q122 122 283 191.5t345 69.5zm199-400H448q-17 0-30.5-14t-13.5-30V932q0-89 43.5-163.5T565 649q74-45 166-45h616q17 0 30.5 14t13.5 31v111q0 16-13.5 30t-30.5 14H731q-54 0-93.5 39.5T598 937v422q0 17 14 30.5t30 13.5h416q55 0 94.5-39.5t39.5-93.5v-22q0-17-14-30.5t-31-13.5H842q-17 0-30.5-14t-13.5-31v-111q0-16 13.5-30t30.5-14h505q17 0 30.5 14t13.5 30v250q0 121-86.5 207.5T1097 1592z"/>
                </svg>
            </a>

            <a href="/oauth2/authorization/github" title="GitHub登录">
                <img width="36" style="margin-right: 5px;" alt="Sign in with GitHub"
                     src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
            </a>

            <a href="/oauth2/authorization/wechat" title="Wechat登录">
                <img width="28" style="margin-right: 5px; position: static;" alt="Sign in with Wechat"
                     src="./assets/img/wechat_login.png"/>
            </a>
            <a href="/saml2/authenticate/keycloak" title="Keycloak登录">
                <img width="28" style="margin-right: 5px; position: static;" alt="Sign in with Keycloak"
                     src="./assets/img/keycloak.png"/>
            </a>
        </div>
    </form>
</div>
</body>

</html>
<script>
    function showSmsCaptchaPage() {
        // 隐藏密码框
        let passContainer = document.getElementById('passContainer');
        passContainer.style.display = 'none';
        // 设置password输入框的name为空
        passContainer.children[0].setAttribute('name', '')
        // 隐藏验证码框
        let codeContainer = document.getElementById('codeContainer');
        codeContainer.style.display = 'none';
        // 设置登录类型为短信验证码
        let loginType = document.getElementById('loginType');
        loginType.value = 'smsCaptcha';
        // 显示获取短信验证码按钮与输入框
        let smsContainer = document.getElementById('smsContainer');
        smsContainer.style.display = '';
        smsContainer.children[0].setAttribute('name', 'password')
        // 设置切换按钮文字与点击效果
        let changeLoginType = document.getElementById('changeLoginType');
        changeLoginType.innerText = '账号密码登录';
        changeLoginType.setAttribute('href', 'javascript:showPasswordPage()')
        changeLoginType.style.paddingTop = '25px';
        changeLoginType.style.paddingBottom = '5px';
    }

    function showPasswordPage() {
        // 显示密码框
        let passContainer = document.getElementById('passContainer');
        passContainer.style.display = '';
        // 设置password输入框
        passContainer.children[0].setAttribute('name', 'password')
        // 显示验证码框
        let codeContainer = document.getElementById('codeContainer');
        codeContainer.style.display = '';
        // 设置登录类型为账号密码
        let loginType = document.getElementById('loginType');
        loginType.value = 'passwordLogin';
        // 隐藏获取短信验证码按钮与输入框
        let smsContainer = document.getElementById('smsContainer');
        smsContainer.style.display = 'none';
        smsContainer.children[0].setAttribute('name', '')
        // 设置切换按钮文字与点击效果
        let changeLoginType = document.getElementById('changeLoginType');
        changeLoginType.innerText = '短信验证登录'
        changeLoginType.setAttribute('href', 'javascript:showSmsCaptchaPage()')
        changeLoginType.style.paddingTop = '0';
    }

    function leave() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    function getVerifyCode() {
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`${window.location.origin}/getCaptcha`, requestOptions)
            .then(response => response.text())
            .then(r => {
                if (r) {
                    let result = JSON.parse(r);
                    document.getElementById('captchaId').value = result.data.captchaId
                    document.getElementById('code-image').src = result.data.imageData
                    document.getElementById('code').value = result.data.code
                    document.getElementById('username').value = "admin"
                    document.getElementById('password').value = "123456"
                }
            })
            .catch(error => console.log('error', error));
    }

    function getSmsCaptcha() {

        let phone = document.getElementById('username').value;
        if (phone === null || phone === '' || typeof phone === 'undefined') {
            showError('手机号码不能为空.')
            return;
        }

        // 禁用按钮
        let getSmsCaptchaBtn = document.getElementById('getSmsCaptchaBtn');
        getSmsCaptchaBtn.style.pointerEvents = 'none';
        // 开始1分钟倒计时
        resetBtn(getSmsCaptchaBtn);

        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`${window.location.origin}/getSmsCaptcha?phone=${phone}`, requestOptions)
            .then(response => response.text())
            .then(r => {
                if (r) {
                    let result = JSON.parse(r);
                    if (result.success) {
                        document.getElementById('username').value = "admin"
                        document.getElementsByName('password')[0].value = "1234"
                        showError('获取验证码成功.固定为：' + result.data)
                    }
                }
            })
            .catch(error => console.log('error', error));
    }

    /**
     * 1分钟倒计时
     */
    function resetBtn(getSmsCaptchaBtn) {
        let s = 60;
        getSmsCaptchaBtn.innerText = `重新获取(${--s})`
        // 定时器 每隔一秒变化一次（1000ms = 1s）
        let t = setInterval(() => {
            getSmsCaptchaBtn.innerText = `重新获取(${--s})`
            if (s === 0) {
                clearInterval(t)
                getSmsCaptchaBtn.innerText = '获取验证码'
                getSmsCaptchaBtn.style.pointerEvents = '';
            }
        }, 1000);

    }

    getVerifyCode();
</script>
<script th:inline="javascript">

    function showError(message) {
        let errorBox = document.getElementById("error_box");
        errorBox.innerHTML = message;
        errorBox.style.display = "block";
        setTimeout(() => {
            closeError();
        }, 3000)
    }

    function closeError() {
        let errorBox = document.getElementById("error_box");
        errorBox.style.display = "none";
    }

    let error = [[${ error }]]
    if (error) {
        if (window.Notification) {
            Notification.requestPermission(function () {
                if (Notification.permission === 'granted') {
                    // 用户点击了允许
                    let n = new Notification('登录失败', {
                        body: error,
                        icon: './assets/img/logo.png'
                    })

                    setTimeout(() => {
                        n.close();
                    }, 3000)
                } else {
                    showError(error);
                }
            })
        }
    }
</script>
```

### 8. 首页测试接口

```java
package com.light.sas.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("saml")
public class SamlController {

    @GetMapping("/home")
    public String home(@AuthenticationPrincipal Saml2AuthenticatedPrincipal principal, Model model) {
        model.addAttribute("name", principal.getName());
        model.addAttribute("emailAddress", principal.getFirstAttribute("email"));
        model.addAttribute("userAttributes", principal.getAttributes());
        return "saml";
    }
}

```

### 9. saml首页

显示登录用户信息 saml.html
```html
<!--
  ~ Copyright 2002-2021 the original author or authors.
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~      https://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  -->

<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity5">
<head>
    <title>Spring Security - SAML 2.0 Login & Logout</title>
    <meta charset="utf-8" />
    <style>
        span, dt {
            font-weight: bold;
        }
    </style>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>
<body>
<div class="container">
    <ul class="nav">
        <li class="nav-item">
            <form th:action="@{/logout}" method="post">
                <button class="btn btn-primary" id="rp_logout_button" type="submit">
                    RP-initiated Logout
                </button>
            </form>
        </li>
    </ul>
</div>
<main role="main" class="container">
    <h1 class="mt-5">SAML 2.0 Login & Single Logout with Spring Security</h1>
    <p class="lead">You are successfully logged in as <span sec:authentication="name"></span></p>
    <p class="lead">You're email address is <span th:text="${emailAddress}"></span></p>
    <h2 class="mt-2">All Your Attributes</h2>
    <dl th:each="userAttribute : ${userAttributes}">
        <dt th:text="${userAttribute.key}"></dt>
        <dd th:text="${userAttribute.value}"></dd>
    </dl>

    <h6>Visit the <a href="https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2" target="_blank">SAML 2.0 Login & Logout</a> documentation for more details.</h6>
</main>
</div>
</body>
</html>

```

## 四、测试

### 1. Keycloak登录
1. 浏览器访问 `http://sp.light.local:8080/saml/home`

2. 请求未认证，跳转到认证端点  `http://sp.light.local:8080/saml2/authenticate/keycloak`

3. 认证端点构建请求XML并跳转到 IDP 进行认证 `http://idp.light.local:8880/realms/Test/protocol/saml`

```shell
SAMLRequest: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOkF1dGhuUmVxdWVzdCB4bWxuczpzYW1sMnA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCIgQXNzZXJ0aW9uQ29uc3VtZXJTZXJ2aWNlVVJMPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9sb2dpbi9zYW1sMi9zc28va2V5Y2xvYWsiIERlc3RpbmF0aW9uPSJodHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3QvcHJvdG9jb2wvc2FtbCIgRm9yY2VBdXRobj0iZmFsc2UiIElEPSJBUlFlNzAxMmUyLWIwODYtNDBlMi05MzI3LTI5MDllZDlkNjg1NiIgSXNQYXNzaXZlPSJmYWxzZSIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTI3VDEyOjE2OjEwLjIwNloiIFByb3RvY29sQmluZGluZz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmJpbmRpbmdzOkhUVFAtUE9TVCIgVmVyc2lvbj0iMi4wIj48c2FtbDI6SXNzdWVyIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5zYW1sX2NsaWVudDwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz4KPGRzOlJlZmVyZW5jZSBVUkk9IiNBUlFlNzAxMmUyLWIwODYtNDBlMi05MzI3LTI5MDllZDlkNjg1NiI+CjxkczpUcmFuc2Zvcm1zPgo8ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPjh0Y1ZPS1p3NUZnNFgyVVhzQ3pPMnZTOTNBeHRMWlFRMkVKQWp2T25tdnM9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpoay8ybUZsdmtNdGZNZ3c0UU0xVkcyQkE2MER3Z0FGOHRvRXZVYTN2TVNaWk92UTFGNnJNa1JxcjMwdnhmd3RCSlhML2dIR2NKYmxzJiMxMzsKZDJWcXpkRjhHenJYY1pNdkh2bkNDWlAzakZ2SXA3cGNSczZLREdmckJTWnZDaDVLZmMwcE9vOEw1ZERqNm43U053N05TK2R1RDl6aSYjMTM7CitKRG51K0NxNkkzTy9CUTRpMGc9CjwvZHM6U2lnbmF0dXJlVmFsdWU+CjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUNnVENDQWVvQ0NRQ3VWenlxRmdNU3lEQU5CZ2txaGtpRzl3MEJBUXNGQURDQmhERUxNQWtHQTFVRUJoTUNWVk14RXpBUkJnTlYKQkFnTUNsZGhjMmhwYm1kMGIyNHhFakFRQmdOVkJBY01DVlpoYm1OdmRYWmxjakVkTUJzR0ExVUVDZ3dVVTNCeWFXNW5JRk5sWTNWeQphWFI1SUZOQlRVd3hDekFKQmdOVkJBc01Bbk53TVNBd0hnWURWUVFEREJkemNDNXpjSEpwYm1jdWMyVmpkWEpwZEhrdWMyRnRiREFlCkZ3MHhPREExTVRReE5ETXdORFJhRncweU9EQTFNVEV4TkRNd05EUmFNSUdFTVFzd0NRWURWUVFHRXdKVlV6RVRNQkVHQTFVRUNBd0sKVjJGemFHbHVaM1J2YmpFU01CQUdBMVVFQnd3SlZtRnVZMjkxZG1WeU1SMHdHd1lEVlFRS0RCUlRjSEpwYm1jZ1UyVmpkWEpwZEhrZwpVMEZOVERFTE1Ba0dBMVVFQ3d3Q2MzQXhJREFlQmdOVkJBTU1GM053TG5Od2NtbHVaeTV6WldOMWNtbDBlUzV6WVcxc01JR2ZNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNEdOQURDQmlRS0JnUURSdTcvRUkwQmxOek1FQkZWQWNieCtsTG9zdnpJV1UrMDFkR1RZOGdCZGhNUU4KWUtaOTJsTWNlbzJDdVZKNjZjVVVSUHltM2k3bkdHem9TbkF4QXJlKzBZSU0rVTByYXpyV3RBVUU3MzVia2NxRUxaa09UWkxlbGFvTwp6dG1XcVJiZTVPdUVtcGV3SDdjeCtrTmdjVmpkY3RPR3kzUTZ4K0k0cWFrWS85cWhCUUlEQVFBQk1BMEdDU3FHU0liM0RRRUJDd1VBCkE0R0JBQWVWaVR2SE95UW9wV0VpWE9mSTJaOWV1a3dyU2tuRHdxL3pzY1IwWXh3d3FEQk10L1FkQU9EZlN3QWZuY2lpWUxrbUVqbG8KeldSdE9lTitxSzdVRmdQMWJSbDVxa3NyWVg1UzB6MmlHSmgwR3ZvbkxVdDNlMjBTc2ZsNXRURUREbkFFVU1MZkJreWF4RUhEUlovbgpiVEo3VlRlWk9TeVJvVm41WEhocHVKMEI8L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48L3NhbWwycDpBdXRoblJlcXVlc3Q+
RelayState: 9ccfda8a-be93-49e2-bd3b-f469a64af9ba

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="http://sp.light.local:8080/login/saml2/sso/keycloak" Destination="http://idp.light.local:8880/realms/Test/protocol/saml" ForceAuthn="false" ID="ARQe7012e2-b086-40e2-9327-2909ed9d6856" IsPassive="false" IssueInstant="2024-03-27T12:16:10.206Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">saml_client
    </saml2:Issuer>
    <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference URI="#ARQe7012e2-b086-40e2-9327-2909ed9d6856">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>8tcVOKZw5Fg4X2UXsCzO2vS93AxtLZQQ2EJAjvOnmvs=</ds:DigestValue>
            </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
hk/2mFlvkMtfMgw4QM1VG2BA60DwgAF8toEvUa3vMSZZOvQ1F6rMkRqr30vxfwtBJXL/gHGcJbls&#13;
d2VqzdF8GzrXcZMvHvnCCZP3jFvIp7pcRs6KDGfrBSZvCh5Kfc0pOo8L5dDj6n7SNw7NS+duD9zi&#13;
+JDnu+Cq6I3O/BQ4i0g=
</ds:SignatureValue>
        <ds:KeyInfo>
            <ds:X509Data>
                <ds:X509Certificate>MIICgTCCAeoCCQCuVzyqFgMSyDANBgkqhkiG9w0BAQsFADCBhDELMAkGA1UEBhMCVVMxEzARBgNV
BAgMCldhc2hpbmd0b24xEjAQBgNVBAcMCVZhbmNvdXZlcjEdMBsGA1UECgwUU3ByaW5nIFNlY3Vy
aXR5IFNBTUwxCzAJBgNVBAsMAnNwMSAwHgYDVQQDDBdzcC5zcHJpbmcuc2VjdXJpdHkuc2FtbDAe
Fw0xODA1MTQxNDMwNDRaFw0yODA1MTExNDMwNDRaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwK
V2FzaGluZ3RvbjESMBAGA1UEBwwJVmFuY291dmVyMR0wGwYDVQQKDBRTcHJpbmcgU2VjdXJpdHkg
U0FNTDELMAkGA1UECwwCc3AxIDAeBgNVBAMMF3NwLnNwcmluZy5zZWN1cml0eS5zYW1sMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRu7/EI0BlNzMEBFVAcbx+lLosvzIWU+01dGTY8gBdhMQN
YKZ92lMceo2CuVJ66cUURPym3i7nGGzoSnAxAre+0YIM+U0razrWtAUE735bkcqELZkOTZLelaoO
ztmWqRbe5OuEmpewH7cx+kNgcVjdctOGy3Q6x+I4qakY/9qhBQIDAQABMA0GCSqGSIb3DQEBCwUA
A4GBAAeViTvHOyQopWEiXOfI2Z9eukwrSknDwq/zscR0YxwwqDBMt/QdAODfSwAfnciiYLkmEjlo
zWRtOeN+qK7UFgP1bRl5qksrYX5S0z2iGJh0GvonLUt3e20Ssfl5tTEDDnAEUMLfBkyaxEHDRZ/n
bTJ7VTeZOSyRoVn5XHhpuJ0B</ds:X509Certificate>
            </ds:X509Data>
        </ds:KeyInfo>
    </ds:Signature>
</saml2p:AuthnRequest>

```

4. 跳转到IDP的登录页面 `http://idp.light.local:8880/realms/Test/login-actions/authenticate?client_id=saml_client&tab_id=L6L4GCZwIbs`

5. 输入账号密码登录，参数地址 `http://idp.light.local:8880/realms/Test/login-actions/authenticate?session_code=c7TyMa_ucHhKFCmvKt8DBioWzWJulh_lWNGiW5Pmm5I&execution=aafd808a-c8f5-43e9-86f9-b8b972bcef00&client_id=saml_client&tab_id=L6L4GCZwIbs` 携带的Form表单参数为 `username=light&password=light&credentialId=`

6. 认证成功，回调到SP的认证端点 `http://sp.light.local:8080/login/saml2/sso/keycloak`

```shell
SAMLResponse: PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iIERlc3RpbmF0aW9uPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9sb2dpbi9zYW1sMi9zc28va2V5Y2xvYWsiIElEPSJJRF8wY2Y0MTk3NC0xOTY3LTRiZjYtOWYxNy1kYTJjMDQ4MDU3NDciIEluUmVzcG9uc2VUbz0iQVJRZTcwMTJlMi1iMDg2LTQwZTItOTMyNy0yOTA5ZWQ5ZDY4NTYiIElzc3VlSW5zdGFudD0iMjAyNC0wMy0yN1QxMjoxODozNy42MjNaIiBWZXJzaW9uPSIyLjAiPjxzYW1sOklzc3Vlcj5odHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3Q8L3NhbWw6SXNzdWVyPjxzYW1scDpTdGF0dXM+PHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIvPjwvc2FtbHA6U3RhdHVzPjxzYW1sOkFzc2VydGlvbiB4bWxucz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgSUQ9IklEXzY0NjY0ZDk2LTA4YWMtNDk0YS1iNWY2LWM0YTczNDU3YmQyOCIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTI3VDEyOjE4OjM3LjYyM1oiIFZlcnNpb249IjIuMCI+PHNhbWw6SXNzdWVyPmh0dHA6Ly9pZHAubGlnaHQubG9jYWw6ODg4MC9yZWFsbXMvVGVzdDwvc2FtbDpJc3N1ZXI+PGRzaWc6U2lnbmF0dXJlIHhtbG5zOmRzaWc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkc2lnOlNpZ25lZEluZm8+PGRzaWc6Q2Fub25pY2FsaXphdGlvbk1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuI1dpdGhDb21tZW50cyIvPjxkc2lnOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHNpZzpSZWZlcmVuY2UgVVJJPSIjSURfNjQ2NjRkOTYtMDhhYy00OTRhLWI1ZjYtYzRhNzM0NTdiZDI4Ij48ZHNpZzpUcmFuc2Zvcm1zPjxkc2lnOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+PGRzaWc6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PC9kc2lnOlRyYW5zZm9ybXM+PGRzaWc6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzaWc6RGlnZXN0VmFsdWU+d2NrL01qMlVwVE8rTHNRNDBCN051MXdwTDNCeDNkdDE3RG16TW9wWjFPWT08L2RzaWc6RGlnZXN0VmFsdWU+PC9kc2lnOlJlZmVyZW5jZT48L2RzaWc6U2lnbmVkSW5mbz48ZHNpZzpTaWduYXR1cmVWYWx1ZT5tSUdTeVRDVW1nVEJoYSt1Q0oxVS84RFZuSjZqcS80SVNoUGtvODBiT3Z4Y3poOU1YQlIvN00ybUF6TnM0UGZ4dEZqUHlXbDd6YzdEYVhNeUJSTm11SmpMMENCK2tqbWV3RE4wRWFFanV1NVNYSkd5Qk03cFRPbVJ1RElRMWJpR241RHZ5KzdqekR0Skl5VTNRelhjMVVUMUFSMmdTRFhDbi9SYUxQM2ZqRzlyMEd4NzdPdlNlNC8vQ0RmNUpEakF6SkdGcHBMdytUODN3dHhPQklQL0E2bU1GUVIySmNFVGFpTEFVMFUzclpXS2lHVU95Z3k3NEVhMVlPQ1NMZkg1TnZESmxjTFVBZERKelBlVVdQRUdaejZPc0E2RnhqWGNIUnhFYzFBbkhYbkZYa0xrSERqbFA4elM2bFRFWWNSTk5EeWJzbUJiZUF5MGIxSzJJbk0xOHc9PTwvZHNpZzpTaWduYXR1cmVWYWx1ZT48ZHNpZzpLZXlJbmZvPjxkc2lnOktleU5hbWU+bHdsRi13TnY3OVVSUTNxeVoxRG1salVzSGNWcjlBMkF0YzNBV3dfLWRiVTwvZHNpZzpLZXlOYW1lPjxkc2lnOlg1MDlEYXRhPjxkc2lnOlg1MDlDZXJ0aWZpY2F0ZT5NSUlDbHpDQ0FYOENCZ0dPZjVUb3dEQU5CZ2txaGtpRzl3MEJBUXNGQURBUE1RMHdDd1lEVlFRRERBUlVaWE4wTUI0WERUSTBNRE15TnpFeE1ESXlPVm9YRFRNME1ETXlOekV4TURRd09Wb3dEekVOTUFzR0ExVUVBd3dFVkdWemREQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU1RdngwTWR1R1JOM0JVOHRwMlFjRDRVTlorY2FLOGpyRGNzUTRVQjVCNkFHWTN2TEVwd1ZXMjNOUnMzYjN6KzU2NFlRQU53cmZVVUpvODd2ZXE0V0U3UkZWNHhCT0gxVjlMdEtjdGc2QnNqMStZOWtkbEthZEtyeEl0YXg3OXhBRFp3TDdSdTk1ZytIM0NuZkc3YUk1cHZFWGcyZmxHZlM5MHVCc2dkTG9PQnFCRHBnTkpiVmVTcHpKOERwakFGRmMzVUFHYUdOdGJlUWlFUGo5TjVXcTBtenlkbG5TeE5HdHo1ejQ3eXo1MHo2Y05BdERFbTNXM09iaGJjVzRvTEtWZUQwdWZMVkZjL0dxVFJIbUNzbGhPaHc2RFQ5bkVIRC9XY2VpaS92NkxQQmhCdXRkVEZjbHVOTmI3Y3B2cDA0bGsyN1JEQ2F6Yi8wM1pxOEpGckVrVUNBd0VBQVRBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQUJDR043ZEZPYjV3b1NZQzRqWlpSenhHc2c3Ni9iZWd0SUYwdFVXZHlrWDZKT3g0T1Z6S3owbmxTRUp6MjA5bjdNWUxBS1lXRFlOVlhFYnVxd0NIRG5GTEdJNW13RDl4OE8vT0dFTlRCcm10SDJCWmc4V2trc281aDBJekU1dW4rUHJ1VnR4alBJRlRqeTB2SzFNTndJWGxFQ1RxakFhRHd4Z0lJcjJ1NHdEb0NWYTVXMktDZDJlaXRmYVBwVWpZTkZEMnVaSi94YVl2VU1DR3UrVjU3WEgyQUhNZjBSZzh1UWFEbTZTcnJSU0ZETk5hWHFPYWdSV24xRFBPYTVZSTZwVVQ4RVRTNjA4ZTJVZy9IMlBoY3VBRXJXUjcwdEx6TDhSdkFhamVWVjlXZER4UEFFcVhoaFhSNXRuZTI3LzU1QnZhYnZtUkJnTGZLU3JzcU1Ib0FQUT09PC9kc2lnOlg1MDlDZXJ0aWZpY2F0ZT48L2RzaWc6WDUwOURhdGE+PC9kc2lnOktleUluZm8+PC9kc2lnOlNpZ25hdHVyZT48c2FtbDpTdWJqZWN0PjxzYW1sOk5hbWVJRCBGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjEuMTpuYW1laWQtZm9ybWF0OnVuc3BlY2lmaWVkIj5saWdodDwvc2FtbDpOYW1lSUQ+PHNhbWw6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sOlN1YmplY3RDb25maXJtYXRpb25EYXRhIEluUmVzcG9uc2VUbz0iQVJRZTcwMTJlMi1iMDg2LTQwZTItOTMyNy0yOTA5ZWQ5ZDY4NTYiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yN1QxMjoyMzozNS42MjNaIiBSZWNpcGllbnQ9Imh0dHA6Ly9zcC5saWdodC5sb2NhbDo4MDgwL2xvZ2luL3NhbWwyL3Nzby9rZXljbG9hayIvPjwvc2FtbDpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDpTdWJqZWN0PjxzYW1sOkNvbmRpdGlvbnMgTm90QmVmb3JlPSIyMDI0LTAzLTI3VDEyOjE4OjM1LjYyM1oiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yN1QxMjoxOTozNS42MjNaIj48c2FtbDpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sOkF1ZGllbmNlPnNhbWxfY2xpZW50PC9zYW1sOkF1ZGllbmNlPjwvc2FtbDpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDpDb25kaXRpb25zPjxzYW1sOkF0dHJpYnV0ZVN0YXRlbWVudD48c2FtbDpBdHRyaWJ1dGUgTmFtZT0iUm9sZSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDpiYXNpYyI+PHNhbWw6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHM6c3RyaW5nIj5vZmZsaW5lX2FjY2Vzczwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjxzYW1sOkF0dHJpYnV0ZSBOYW1lPSJSb2xlIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OmJhc2ljIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPm1hbmFnZS1hY2NvdW50LWxpbmtzPC9zYW1sOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDpBdHRyaWJ1dGU+PHNhbWw6QXR0cmlidXRlIE5hbWU9IlJvbGUiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6YmFzaWMiPjxzYW1sOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzOnN0cmluZyI+ZGVmYXVsdC1yb2xlcy10ZXN0PC9zYW1sOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDpBdHRyaWJ1dGU+PHNhbWw6QXR0cmlidXRlIE5hbWU9IlJvbGUiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6YmFzaWMiPjxzYW1sOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzOnN0cmluZyI+dW1hX2F1dGhvcml6YXRpb248L3NhbWw6QXR0cmlidXRlVmFsdWU+PC9zYW1sOkF0dHJpYnV0ZT48c2FtbDpBdHRyaWJ1dGUgTmFtZT0iUm9sZSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDpiYXNpYyI+PHNhbWw6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHM6c3RyaW5nIj5tYW5hZ2UtYWNjb3VudDwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjxzYW1sOkF0dHJpYnV0ZSBOYW1lPSJSb2xlIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OmJhc2ljIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPnZpZXctcHJvZmlsZTwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjwvc2FtbDpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PC9zYW1sOkFzc2VydGlvbj48L3NhbWxwOlJlc3BvbnNlPg==
RelayState: 9ccfda8a-be93-49e2-bd3b-f469a64af9ba

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml

<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="http://sp.light.local:8080/login/saml2/sso/keycloak" ID="ID_0cf41974-1967-4bf6-9f17-da2c04805747" InResponseTo="ARQe7012e2-b086-40e2-9327-2909ed9d6856" IssueInstant="2024-03-27T12:18:37.623Z" Version="2.0">
    <saml:Issuer>http://idp.light.local:8880/realms/Test</saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion
        xmlns="urn:oasis:names:tc:SAML:2.0:assertion" ID="ID_64664d96-08ac-494a-b5f6-c4a73457bd28" IssueInstant="2024-03-27T12:18:37.623Z" Version="2.0">
        <saml:Issuer>http://idp.light.local:8880/realms/Test</saml:Issuer>
        <dsig:Signature
            xmlns:dsig="http://www.w3.org/2000/09/xmldsig#">
            <dsig:SignedInfo>
                <dsig:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#WithComments"/>
                <dsig:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                <dsig:Reference URI="#ID_64664d96-08ac-494a-b5f6-c4a73457bd28">
                    <dsig:Transforms>
                        <dsig:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                        <dsig:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    </dsig:Transforms>
                    <dsig:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <dsig:DigestValue>wck/Mj2UpTO+LsQ40B7Nu1wpL3Bx3dt17DmzMopZ1OY=</dsig:DigestValue>
                </dsig:Reference>
            </dsig:SignedInfo>
            <dsig:SignatureValue>mIGSyTCUmgTBha+uCJ1U/8DVnJ6jq/4IShPko80bOvxczh9MXBR/7M2mAzNs4PfxtFjPyWl7zc7DaXMyBRNmuJjL0CB+kjmewDN0EaEjuu5SXJGyBM7pTOmRuDIQ1biGn5Dvy+7jzDtJIyU3QzXc1UT1AR2gSDXCn/RaLP3fjG9r0Gx77OvSe4//CDf5JDjAzJGFppLw+T83wtxOBIP/A6mMFQR2JcETaiLAU0U3rZWKiGUOygy74Ea1YOCSLfH5NvDJlcLUAdDJzPeUWPEGZz6OsA6FxjXcHRxEc1AnHXnFXkLkHDjlP8zS6lTEYcRNNDybsmBbeAy0b1K2InM18w==</dsig:SignatureValue>
            <dsig:KeyInfo>
                <dsig:KeyName>lwlF-wNv79URQ3qyZ1DmljUsHcVr9A2Atc3AWw_-dbU</dsig:KeyName>
                <dsig:X509Data>
                    <dsig:X509Certificate>MIIClzCCAX8CBgGOf5TowDANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDARUZXN0MB4XDTI0MDMyNzExMDIyOVoXDTM0MDMyNzExMDQwOVowDzENMAsGA1UEAwwEVGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMQvx0MduGRN3BU8tp2QcD4UNZ+caK8jrDcsQ4UB5B6AGY3vLEpwVW23NRs3b3z+564YQANwrfUUJo87veq4WE7RFV4xBOH1V9LtKctg6Bsj1+Y9kdlKadKrxItax79xADZwL7Ru95g+H3CnfG7aI5pvEXg2flGfS90uBsgdLoOBqBDpgNJbVeSpzJ8DpjAFFc3UAGaGNtbeQiEPj9N5Wq0mzydlnSxNGtz5z47yz50z6cNAtDEm3W3ObhbcW4oLKVeD0ufLVFc/GqTRHmCslhOhw6DT9nEHD/Wceii/v6LPBhButdTFcluNNb7cpvp04lk27RDCazb/03Zq8JFrEkUCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEABCGN7dFOb5woSYC4jZZRzxGsg76/begtIF0tUWdykX6JOx4OVzKz0nlSEJz209n7MYLAKYWDYNVXEbuqwCHDnFLGI5mwD9x8O/OGENTBrmtH2BZg8Wkkso5h0IzE5un+PruVtxjPIFTjy0vK1MNwIXlECTqjAaDwxgIIr2u4wDoCVa5W2KCd2eitfaPpUjYNFD2uZJ/xaYvUMCGu+V57XH2AHMf0Rg8uQaDm6SrrRSFDNNaXqOagRWn1DPOa5YI6pUT8ETS608e2Ug/H2PhcuAErWR70tLzL8RvAajeVV9WdDxPAEqXhhXR5tne27/55BvabvmRBgLfKSrsqMHoAPQ==</dsig:X509Certificate>
                </dsig:X509Data>
            </dsig:KeyInfo>
        </dsig:Signature>
        <saml:Subject>
            <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">light</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData InResponseTo="ARQe7012e2-b086-40e2-9327-2909ed9d6856" NotOnOrAfter="2024-03-27T12:23:35.623Z" Recipient="http://sp.light.local:8080/login/saml2/sso/keycloak"/>
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="2024-03-27T12:18:35.623Z" NotOnOrAfter="2024-03-27T12:19:35.623Z">
            <saml:AudienceRestriction>
                <saml:Audience>saml_client</saml:Audience>
            </saml:AudienceRestriction>
        </saml:Conditions>
        <saml:AttributeStatement>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">offline_access
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">manage-account-links
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">default-roles-test
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">uma_authorization
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">manage-account
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">view-profile
                </saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>
    </saml:Assertion>
</samlp:Response>

```

7. 认证成功，跳转到登录前页面 `http://sp.light.local:8080/saml/home?continue`

```shell

SAML 2.0 Login & Single Logout with Spring Security
You are successfully logged in as light

You're email address is

All Your Attributes
Role
[default-roles-test, manage-account-links, offline_access, manage-account, uma_authorization, view-profile]
Visit the [SAML 2.0 Login & Logout](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2) documentation for more details.

```

### 2. Keycloak登出
1. 点击页面的 `RP-initiated Logout` 

2. 访问 `http://sp.light.local:8080/logout`

3. 跳转 `http://idp.light.local:8880/realms/Test/protocol/saml`

```shell
SAMLRequest: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOkxvZ291dFJlcXVlc3QgeG1sbnM6c2FtbDJwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIERlc3RpbmF0aW9uPSJodHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3QvcHJvdG9jb2wvc2FtbCIgSUQ9IkxSNDNjODY2NmYtYWZiNi00NjUzLWE3NDQtMWYzZWQ5YWQyN2E4IiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjdUMTI6MjE6MDcuMjY0WiIgVmVyc2lvbj0iMi4wIj48c2FtbDI6SXNzdWVyIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5zYW1sX2NsaWVudDwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz4KPGRzOlJlZmVyZW5jZSBVUkk9IiNMUjQzYzg2NjZmLWFmYjYtNDY1My1hNzQ0LTFmM2VkOWFkMjdhOCI+CjxkczpUcmFuc2Zvcm1zPgo8ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPmlZYXVUa0s1M1VLQzE3WU52OG5YaVF6MXQyenA3K3VlUGp4UFlwQ21wTnM9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpndTFXTzRKY3BBMFo3MGZoZkYvdVI4cGwrNkhTR0t5U28xdDBmVWNuYWx6YytuS285dm02WDNicWU5RXhrdksxekxZckRBWlUxL1U1JiMxMzsKdXFwSEdWc2t1UmFqVHRJbnpjM2ZqVUpscTRhdlI0VzVIYjFqdDhqL2ljRXF4V0lCWTErOWdzSG83K1hYbUdZZG9CSENFVSs3RGdXOSYjMTM7Cm41cUNqOFRDUmdZdUJZWk9SRDQ9CjwvZHM6U2lnbmF0dXJlVmFsdWU+CjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUNnVENDQWVvQ0NRQ3VWenlxRmdNU3lEQU5CZ2txaGtpRzl3MEJBUXNGQURDQmhERUxNQWtHQTFVRUJoTUNWVk14RXpBUkJnTlYKQkFnTUNsZGhjMmhwYm1kMGIyNHhFakFRQmdOVkJBY01DVlpoYm1OdmRYWmxjakVkTUJzR0ExVUVDZ3dVVTNCeWFXNW5JRk5sWTNWeQphWFI1SUZOQlRVd3hDekFKQmdOVkJBc01Bbk53TVNBd0hnWURWUVFEREJkemNDNXpjSEpwYm1jdWMyVmpkWEpwZEhrdWMyRnRiREFlCkZ3MHhPREExTVRReE5ETXdORFJhRncweU9EQTFNVEV4TkRNd05EUmFNSUdFTVFzd0NRWURWUVFHRXdKVlV6RVRNQkVHQTFVRUNBd0sKVjJGemFHbHVaM1J2YmpFU01CQUdBMVVFQnd3SlZtRnVZMjkxZG1WeU1SMHdHd1lEVlFRS0RCUlRjSEpwYm1jZ1UyVmpkWEpwZEhrZwpVMEZOVERFTE1Ba0dBMVVFQ3d3Q2MzQXhJREFlQmdOVkJBTU1GM053TG5Od2NtbHVaeTV6WldOMWNtbDBlUzV6WVcxc01JR2ZNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNEdOQURDQmlRS0JnUURSdTcvRUkwQmxOek1FQkZWQWNieCtsTG9zdnpJV1UrMDFkR1RZOGdCZGhNUU4KWUtaOTJsTWNlbzJDdVZKNjZjVVVSUHltM2k3bkdHem9TbkF4QXJlKzBZSU0rVTByYXpyV3RBVUU3MzVia2NxRUxaa09UWkxlbGFvTwp6dG1XcVJiZTVPdUVtcGV3SDdjeCtrTmdjVmpkY3RPR3kzUTZ4K0k0cWFrWS85cWhCUUlEQVFBQk1BMEdDU3FHU0liM0RRRUJDd1VBCkE0R0JBQWVWaVR2SE95UW9wV0VpWE9mSTJaOWV1a3dyU2tuRHdxL3pzY1IwWXh3d3FEQk10L1FkQU9EZlN3QWZuY2lpWUxrbUVqbG8KeldSdE9lTitxSzdVRmdQMWJSbDVxa3NyWVg1UzB6MmlHSmgwR3ZvbkxVdDNlMjBTc2ZsNXRURUREbkFFVU1MZkJreWF4RUhEUlovbgpiVEo3VlRlWk9TeVJvVm41WEhocHVKMEI8L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6TmFtZUlEIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5saWdodDwvc2FtbDI6TmFtZUlEPjwvc2FtbDJwOkxvZ291dFJlcXVlc3Q+
RelayState: e7bd99d7-d9ae-4c8d-a928-23a19457b283
```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:LogoutRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" Destination="http://idp.light.local:8880/realms/Test/protocol/saml" ID="LR43c8666f-afb6-4653-a744-1f3ed9ad27a8" IssueInstant="2024-03-27T12:21:07.264Z" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">saml_client
    </saml2:Issuer>
    <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference URI="#LR43c8666f-afb6-4653-a744-1f3ed9ad27a8">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>iYauTkK53UKC17YNv8nXiQz1t2zp7+uePjxPYpCmpNs=</ds:DigestValue>
            </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
gu1WO4JcpA0Z70fhfF/uR8pl+6HSGKySo1t0fUcnalzc+nKo9vm6X3bqe9ExkvK1zLYrDAZU1/U5&#13;
uqpHGVskuRajTtInzc3fjUJlq4avR4W5Hb1jt8j/icEqxWIBY1+9gsHo7+XXmGYdoBHCEU+7DgW9&#13;
n5qCj8TCRgYuBYZORD4=
</ds:SignatureValue>
        <ds:KeyInfo>
            <ds:X509Data>
                <ds:X509Certificate>MIICgTCCAeoCCQCuVzyqFgMSyDANBgkqhkiG9w0BAQsFADCBhDELMAkGA1UEBhMCVVMxEzARBgNV
BAgMCldhc2hpbmd0b24xEjAQBgNVBAcMCVZhbmNvdXZlcjEdMBsGA1UECgwUU3ByaW5nIFNlY3Vy
aXR5IFNBTUwxCzAJBgNVBAsMAnNwMSAwHgYDVQQDDBdzcC5zcHJpbmcuc2VjdXJpdHkuc2FtbDAe
Fw0xODA1MTQxNDMwNDRaFw0yODA1MTExNDMwNDRaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwK
V2FzaGluZ3RvbjESMBAGA1UEBwwJVmFuY291dmVyMR0wGwYDVQQKDBRTcHJpbmcgU2VjdXJpdHkg
U0FNTDELMAkGA1UECwwCc3AxIDAeBgNVBAMMF3NwLnNwcmluZy5zZWN1cml0eS5zYW1sMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRu7/EI0BlNzMEBFVAcbx+lLosvzIWU+01dGTY8gBdhMQN
YKZ92lMceo2CuVJ66cUURPym3i7nGGzoSnAxAre+0YIM+U0razrWtAUE735bkcqELZkOTZLelaoO
ztmWqRbe5OuEmpewH7cx+kNgcVjdctOGy3Q6x+I4qakY/9qhBQIDAQABMA0GCSqGSIb3DQEBCwUA
A4GBAAeViTvHOyQopWEiXOfI2Z9eukwrSknDwq/zscR0YxwwqDBMt/QdAODfSwAfnciiYLkmEjlo
zWRtOeN+qK7UFgP1bRl5qksrYX5S0z2iGJh0GvonLUt3e20Ssfl5tTEDDnAEUMLfBkyaxEHDRZ/n
bTJ7VTeZOSyRoVn5XHhpuJ0B</ds:X509Certificate>
            </ds:X509Data>
        </ds:KeyInfo>
    </ds:Signature>
    <saml2:NameID
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">light
    </saml2:NameID>
</saml2p:LogoutRequest>

```

4. 退出响应 `http://sp.light.local:8080/login/saml2/sso/keycloak`

```shell
SAMLResponse: PHNhbWxwOkxvZ291dFJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIiB4bWxuczpzYW1sPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIiBEZXN0aW5hdGlvbj0iaHR0cDovL3NwLmxpZ2h0LmxvY2FsOjgwODAvbG9naW4vc2FtbDIvc3NvL2tleWNsb2FrIiBJRD0iSURfZGI3MGI3YTAtYTkwMC00MjhkLTgwMDAtZjMxNzFmNTI1ZDk5IiBJblJlc3BvbnNlVG89IkxSNDNjODY2NmYtYWZiNi00NjUzLWE3NDQtMWYzZWQ5YWQyN2E4IiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjdUMTI6MjE6MDcuMjk4WiIgVmVyc2lvbj0iMi4wIj48SXNzdWVyPmh0dHA6Ly9pZHAubGlnaHQubG9jYWw6ODg4MC9yZWFsbXMvVGVzdDwvSXNzdWVyPjxzYW1scDpTdGF0dXM+PHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIvPjwvc2FtbHA6U3RhdHVzPjwvc2FtbHA6TG9nb3V0UmVzcG9uc2U+
RelayState: e7bd99d7-d9ae-4c8d-a928-23a19457b283

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<samlp:LogoutResponse
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns="urn:oasis:names:tc:SAML:2.0:assertion"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="http://sp.light.local:8080/login/saml2/sso/keycloak" ID="ID_db70b7a0-a900-428d-8000-f3171f525d99" InResponseTo="LR43c8666f-afb6-4653-a744-1f3ed9ad27a8" IssueInstant="2024-03-27T12:21:07.298Z" Version="2.0">
    <Issuer>http://idp.light.local:8880/realms/Test</Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
</samlp:LogoutResponse>

```
