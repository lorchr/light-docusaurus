
## 一、前言

## 二、分析

## 三、准备

## 四、编码

### 1. Auth Server
添加一个支持 `Opaque Token` 的客户端
#### 1. RedisRegisteredClientRepository
```java
package com.light.sas.respository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.light.sas.entity.security.RedisRegisteredClient;
import com.light.sas.service.impl.RedisOAuth2AuthorizationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.jackson2.OAuth2AuthorizationServerJackson2Module;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * 基于redis的客户端repository实现
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class RedisRegisteredClientRepository implements RegisteredClientRepository {

    /**
     * 提供给客户端初始化使用(不需要可删除)
     */
    private final PasswordEncoder passwordEncoder;

    private final RedisClientRepository repository;

    private final static ObjectMapper MAPPER = new ObjectMapper();

    static {
        // 初始化序列化配置
        ClassLoader classLoader = RedisOAuth2AuthorizationService.class.getClassLoader();
        // 加载security提供的Modules
        List<Module> modules = SecurityJackson2Modules.getModules(classLoader);
        MAPPER.registerModules(modules);
        // 加载Authorization Server提供的Module
        MAPPER.registerModule(new OAuth2AuthorizationServerJackson2Module());
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        Assert.notNull(registeredClient, "registeredClient cannot be null");
        this.repository.findByClientId(registeredClient.getClientId())
                .ifPresent(existingRegisteredClient -> this.repository.deleteById(existingRegisteredClient.getId()));
        this.repository.save(toEntity(registeredClient));
    }

    @Override
    public RegisteredClient findById(String id) {
        Assert.hasText(id, "id cannot be empty");
        return this.repository.findById(id)
                .map(this::toObject).orElse(null);
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        Assert.hasText(clientId, "clientId cannot be empty");
        return this.repository.findByClientId(clientId)
                .map(this::toObject).orElse(null);
    }

    private RegisteredClient toObject(RedisRegisteredClient client) {
        Set<String> clientAuthenticationMethods = StringUtils.commaDelimitedListToSet(
                client.getClientAuthenticationMethods());
        Set<String> authorizationGrantTypes = StringUtils.commaDelimitedListToSet(
                client.getAuthorizationGrantTypes());
        Set<String> redirectUris = StringUtils.commaDelimitedListToSet(
                client.getRedirectUris());
        Set<String> postLogoutRedirectUris = StringUtils.commaDelimitedListToSet(
                client.getPostLogoutRedirectUris());
        Set<String> clientScopes = StringUtils.commaDelimitedListToSet(
                client.getScopes());

        RegisteredClient.Builder builder = RegisteredClient.withId(client.getId())
                .clientId(client.getClientId())
                .clientIdIssuedAt(client.getClientIdIssuedAt())
                .clientSecret(client.getClientSecret())
                .clientSecretExpiresAt(client.getClientSecretExpiresAt())
                .clientName(client.getClientName())
                .clientAuthenticationMethods(authenticationMethods ->
                        clientAuthenticationMethods.forEach(authenticationMethod ->
                                authenticationMethods.add(resolveClientAuthenticationMethod(authenticationMethod))))
                .authorizationGrantTypes((grantTypes) ->
                        authorizationGrantTypes.forEach(grantType ->
                                grantTypes.add(resolveAuthorizationGrantType(grantType))))
                .redirectUris((uris) -> uris.addAll(redirectUris))
                .postLogoutRedirectUris((uris) -> uris.addAll(postLogoutRedirectUris))
                .scopes((scopes) -> scopes.addAll(clientScopes));

        Map<String, Object> clientSettingsMap = parseMap(client.getClientSettings());
        builder.clientSettings(ClientSettings.withSettings(clientSettingsMap).build());

        Map<String, Object> tokenSettingsMap = parseMap(client.getTokenSettings());
        builder.tokenSettings(TokenSettings.withSettings(tokenSettingsMap).build());

        return builder.build();
    }

    private RedisRegisteredClient toEntity(RegisteredClient registeredClient) {
        List<String> clientAuthenticationMethods = new ArrayList<>(registeredClient.getClientAuthenticationMethods().size());
        registeredClient.getClientAuthenticationMethods().forEach(clientAuthenticationMethod ->
                clientAuthenticationMethods.add(clientAuthenticationMethod.getValue()));

        List<String> authorizationGrantTypes = new ArrayList<>(registeredClient.getAuthorizationGrantTypes().size());
        registeredClient.getAuthorizationGrantTypes().forEach(authorizationGrantType ->
                authorizationGrantTypes.add(authorizationGrantType.getValue()));

        RedisRegisteredClient entity = new RedisRegisteredClient();
        entity.setId(registeredClient.getId());
        entity.setClientId(registeredClient.getClientId());
        entity.setClientIdIssuedAt(registeredClient.getClientIdIssuedAt());
        entity.setClientSecret(registeredClient.getClientSecret());
        entity.setClientSecretExpiresAt(registeredClient.getClientSecretExpiresAt());
        entity.setClientName(registeredClient.getClientName());
        entity.setClientAuthenticationMethods(StringUtils.collectionToCommaDelimitedString(clientAuthenticationMethods));
        entity.setAuthorizationGrantTypes(StringUtils.collectionToCommaDelimitedString(authorizationGrantTypes));
        entity.setRedirectUris(StringUtils.collectionToCommaDelimitedString(registeredClient.getRedirectUris()));
        entity.setPostLogoutRedirectUris(StringUtils.collectionToCommaDelimitedString(registeredClient.getPostLogoutRedirectUris()));
        entity.setScopes(StringUtils.collectionToCommaDelimitedString(registeredClient.getScopes()));
        entity.setClientSettings(writeMap(registeredClient.getClientSettings().getSettings()));
        entity.setTokenSettings(writeMap(registeredClient.getTokenSettings().getSettings()));

        return entity;
    }

    private Map<String, Object> parseMap(String data) {
        try {
            return MAPPER.readValue(data, new TypeReference<>() {
            });
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }

    private String writeMap(Map<String, Object> data) {
        try {
            return MAPPER.writeValueAsString(data);
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }

    private static AuthorizationGrantType resolveAuthorizationGrantType(String authorizationGrantType) {
        if (AuthorizationGrantType.AUTHORIZATION_CODE.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.AUTHORIZATION_CODE;
        } else if (AuthorizationGrantType.CLIENT_CREDENTIALS.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.CLIENT_CREDENTIALS;
        } else if (AuthorizationGrantType.REFRESH_TOKEN.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.REFRESH_TOKEN;
        }
        // Custom authorization grant type
        return new AuthorizationGrantType(authorizationGrantType);
    }

    private static ClientAuthenticationMethod resolveClientAuthenticationMethod(String clientAuthenticationMethod) {
        if (ClientAuthenticationMethod.CLIENT_SECRET_BASIC.getValue().equals(clientAuthenticationMethod)) {
            return ClientAuthenticationMethod.CLIENT_SECRET_BASIC;
        } else if (ClientAuthenticationMethod.CLIENT_SECRET_POST.getValue().equals(clientAuthenticationMethod)) {
            return ClientAuthenticationMethod.CLIENT_SECRET_POST;
        } else if (ClientAuthenticationMethod.NONE.getValue().equals(clientAuthenticationMethod)) {
            return ClientAuthenticationMethod.NONE;
        }
        // Custom client authentication method
        return new ClientAuthenticationMethod(clientAuthenticationMethod);
    }

    /**
     * 容器启动后初始化客户端
     * (不需要可删除)
     */
    @PostConstruct
    public void initClients() {
        log.info("Initialize client information to Redis.");
        // 默认需要授权确认
        ClientSettings.Builder builder = ClientSettings.builder()
                .requireAuthorizationConsent(Boolean.TRUE);

        TokenSettings.Builder tokenSettingsBuilder = TokenSettings.builder()
                // 自包含token(jwt)
                .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
                // Access Token 存活时间：2小时
                .accessTokenTimeToLive(Duration.ofHours(2L))
                // 授权码存活时间：5分钟
                .authorizationCodeTimeToLive(Duration.ofMinutes(5L))
                // 设备码存活时间：5分钟
                .deviceCodeTimeToLive(Duration.ofMinutes(5L))
                // Refresh Token 存活时间：7天
                .refreshTokenTimeToLive(Duration.ofDays(7L))
                // 刷新 Access Token 后是否重用 Refresh Token
                .reuseRefreshTokens(Boolean.TRUE)
                // 设置 Id Token 加密方式
                .idTokenSignatureAlgorithm(SignatureAlgorithm.RS256);

        // 正常授权码客户端
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                // 客户端id
                .clientId("messaging-client")
                // 客户端名称
                .clientName("授权码")
                // 客户端秘钥，使用密码解析器加密
                .clientSecret(passwordEncoder.encode("123456"))
                // 客户端认证方式，基于请求头的认证
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                // 配置资源服务器使用该客户端获取授权时支持的方式
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                // 授权码模式回调地址，oauth2.1已改为精准匹配，不能只设置域名，并且屏蔽了localhost，本机使用127.0.0.1访问
                .redirectUri("http://127.0.0.1:8000/login/oauth2/code/messaging-client-oidc")
                .redirectUri("http://127.0.0.1:7000/login/oauth2/code/messaging-client-oidc")
                .redirectUri("http://127.0.0.1:5173/OAuth2Redirect")
                .redirectUri("https://www.baidu.com")
                // 该客户端的授权范围，OPENID与PROFILE是IdToken的scope，获取授权时请求OPENID的scope时认证服务会返回IdToken
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                // 指定scope
                .scope("message.read")
                .scope("message.write")
                // 客户端设置，设置用户需要确认授权
                .clientSettings(builder.build())
                // token相关配置
                .tokenSettings(tokenSettingsBuilder.build())
                .build();

        // 设备码授权客户端
        RegisteredClient deviceClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("device-message-client")
                .clientName("普通公共客户端")
                // 公共客户端
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                // 设备码授权
                .authorizationGrantType(AuthorizationGrantType.DEVICE_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 指定scope
                .scope("message.read")
                .scope("message.write")
                // token相关配置
                .tokenSettings(tokenSettingsBuilder.build())
                .build();

        // PKCE客户端
        RegisteredClient pkceClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("pkce-message-client")
                .clientName("PKCE流程")
                // 公共客户端
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                // 设备码授权
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 授权码模式回调地址，oauth2.1已改为精准匹配，不能只设置域名，并且屏蔽了localhost，本机使用127.0.0.1访问
                .redirectUri("http://127.0.0.1:8000/login/oauth2/code/messaging-client-oidc")
                .redirectUri("http://127.0.0.1:5173/PkceRedirect")
                // 开启 PKCE 流程
                .clientSettings(builder.requireProofKey(Boolean.TRUE).build())
                // 指定scope
                .scope("message.read")
                .scope("message.write")
                // token相关配置
                .tokenSettings(tokenSettingsBuilder.build())
                .build();

        // 正常授权码客户端
        RegisteredClient opaqueClient = RegisteredClient.withId(UUID.randomUUID().toString())
                // 客户端id
                .clientId("opaque-client")
                // 客户端名称
                .clientName("匿名token")
                // 客户端秘钥，使用密码解析器加密
                .clientSecret(passwordEncoder.encode("123456"))
                // 客户端认证方式，基于请求头的认证
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                // 配置资源服务器使用该客户端获取授权时支持的方式
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                // 授权码模式回调地址，oauth2.1已改为精准匹配，不能只设置域名，并且屏蔽了localhost，本机使用127.0.0.1访问
                .redirectUri("http://127.0.0.1:5173/OAuth2Redirect")
                .redirectUri("https://www.baidu.com")
                // 该客户端的授权范围，OPENID与PROFILE是IdToken的scope，获取授权时请求OPENID的scope时认证服务会返回IdToken
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                // 指定scope
                .scope("message.read")
                .scope("message.write")
                // 客户端设置，设置用户需要确认授权
                .clientSettings(builder.requireProofKey(Boolean.FALSE).build())
                // token相关配置, 设置token为匿名token(opaque token)
                .tokenSettings(tokenSettingsBuilder.accessTokenFormat(OAuth2TokenFormat.REFERENCE).build())
                .build();

        // 初始化客户端
        this.save(registeredClient);
        this.save(deviceClient);
        this.save(pkceClient);
        this.save(opaqueClient);
    }

}

```

### 2. Opaque Resource Server

#### 1. 导入依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sas-30-opaque-token-resource-server</artifactId>
    <packaging>jar</packaging>

    <name>30-resource-server-opaque-token</name>
    <description>OAuth2 Resource Server Opaque Token</description>

    <parent>
        <groupId>org.light.sas</groupId>
        <artifactId>sas-sample</artifactId>
        <version>2024.0.0</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Spring Boot 测试依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

#### 2. 配置 Resource Server

```java
package com.light.sas.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 资源服务器配置
 */
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class ResourceServerConfig {

    private final AuthenticationManagerResolver<HttpServletRequest> tokenAuthenticationManagerResolver;

    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        // 在资源服务器中配置刚才注入的 AuthenticationManagerResolver
                        .authenticationManagerResolver(this.tokenAuthenticationManagerResolver)
                );
        return http.build();
    }

}
```

#### 3. 添加OpaqueToken解析支持

```java
package com.light.sas.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2TokenIntrospectionClaimNames;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.security.oauth2.server.resource.authentication.OpaqueTokenAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

import java.time.Instant;
import java.util.Collection;

/**
 * 匿名Token权限信息自定义处理
 */
@Configuration(proxyBeanMethods = false)
public class OpaqueTokenSupportConfig {


    /**
     * 根据令牌自省生成{@link AuthenticationManagerResolver }，在AuthenticationManagerResolver中根据当前请求使用token自省端点获取当前token信息
     *
     * @param opaqueTokenIntrospector token自省
     * @return 返回 {@link AuthenticationManagerResolver }
     */
    @Bean
    public AuthenticationManagerResolver<HttpServletRequest> tokenAuthenticationManagerResolver(
           OpaqueTokenIntrospector opaqueTokenIntrospector) {
        // 设置 Opaque Token解析转换器，去掉Token的前缀
        OpaqueTokenAuthenticationProvider opaqueTokenAuthenticationProvider = new OpaqueTokenAuthenticationProvider(opaqueTokenIntrospector);
        opaqueTokenAuthenticationProvider.setAuthenticationConverter(opaqueTokenAuthenticationConverter());

        // 设置jwt和OpaqueToken的AuthenticationManager
        AuthenticationManager opaqueToken = new ProviderManager(opaqueTokenAuthenticationProvider);
        return (request) -> opaqueToken;
    }

    /**
     * 自定义opaqueToken解析器，设置解析出来的权限信息的前缀
     *
     * @see OpaqueTokenAuthenticationProvider#convert(String, OAuth2AuthenticatedPrincipal)
     * @return opaqueToken解析器 OpaqueTokenAuthenticationConverter
     */
    public OpaqueTokenAuthenticationConverter opaqueTokenAuthenticationConverter() {
        return new OpaqueTokenAuthenticationConverter() {
            @Override
            public Authentication convert(String introspectedToken, OAuth2AuthenticatedPrincipal authenticatedPrincipal) {
                Instant iat = authenticatedPrincipal.getAttribute(OAuth2TokenIntrospectionClaimNames.IAT);
                Instant exp = authenticatedPrincipal.getAttribute(OAuth2TokenIntrospectionClaimNames.EXP);
                OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, introspectedToken,
                        iat, exp);

                // 设置解析权限信息的前缀，设置为空是去掉前缀
                Collection<? extends GrantedAuthority> authorities = authenticatedPrincipal.getAuthorities()
                        .stream().map(authority -> {
                            String authorityCode = authority.getAuthority();
                            if (authorityCode.startsWith("SCOPE_")) {
                                authorityCode = authorityCode.replace("SCOPE_", "");
                            }
                            return new SimpleGrantedAuthority(authorityCode);
                        }).toList();
                return new BearerTokenAuthentication(authenticatedPrincipal, accessToken, authorities);
            }
        };
    }

}

```

#### 4. 添加测试接口

```java
package com.light.sas.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 测试接口
 */
@RestController
public class TestController {

    @GetMapping("/test01")
    @PreAuthorize("hasAuthority('message.read')")
    public String test01() {
        return "test01";
    }

    @GetMapping("/test02")
    @PreAuthorize("hasAuthority('test02')")
    public String test02() {
        return "test02";
    }

    @GetMapping("/app")
    @PreAuthorize("hasAuthority('app')")
    public String app() {
        return "app";
    }
}

```

#### 5. 配置 application.yaml

```yaml
server:
  port: 8100

spring:
  application:
    name: opaque-token-resource-server
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          # 匿名token自省端点
          introspection-uri: http://127.0.0.1:8080/oauth2/introspect
          # 客户端id
          client-id: opaque-client
          # 客户端秘钥
          client-secret: 123456

logging:
  level:
    org.springframework.security: debug
    com.light.sas: debug

```

### 3. JWT And Opaque Resource Server

#### 1. 导入依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sas-31-jwt-opaque-token-resource-server</artifactId>
    <packaging>jar</packaging>

    <name>31-resource-server-jwt-opaque-token</name>
    <description>OAuth2 Resource Server Jwt Opaque Token</description>

    <parent>
        <groupId>org.light.sas</groupId>
        <artifactId>sas-sample</artifactId>
        <version>2024.0.0</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Spring Boot 测试依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

#### 2. 配置 Resource Server

```java
package com.light.sas.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 资源服务器配置
 */
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class ResourceServerConfig {

    private final AuthenticationManagerResolver<HttpServletRequest> tokenAuthenticationManagerResolver;

    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        // 在资源服务器中配置刚才注入的 AuthenticationManagerResolver
                        .authenticationManagerResolver(this.tokenAuthenticationManagerResolver)
                );
        return http.build();
    }

}
```

#### 3. 添加OpaqueToken解析支持

```java
package com.light.sas.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2TokenIntrospectionClaimNames;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.OpaqueTokenAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Collection;

/**
 * 同时支持匿名token与jwt token配置
 */
@Configuration(proxyBeanMethods = false)
public class JwtAndOpaqueTokenSupportConfig {


    /**
     * 根据jwtDecoder和令牌自省生成{@link AuthenticationManagerResolver }，在AuthenticationManagerResolver中根据当前请求决定使用jwt解析器还是去token自省端点获取当前token信息
     *
     * @param jwtDecoder              jwt解析器
     * @param opaqueTokenIntrospector token自省
     * @return 返回 {@link AuthenticationManagerResolver }
     */
    @Bean
    public AuthenticationManagerResolver<HttpServletRequest> tokenAuthenticationManagerResolver(
            JwtDecoder jwtDecoder, OpaqueTokenIntrospector opaqueTokenIntrospector) {
        // 设置 JWT Token解析转换器，去掉Token的前缀
        JwtAuthenticationProvider jwtAuthenticationProvider = new JwtAuthenticationProvider(jwtDecoder);
        jwtAuthenticationProvider.setJwtAuthenticationConverter(jwtAuthenticationConverter());

        // 设置 Opaque Token解析转换器，去掉Token的前缀
        OpaqueTokenAuthenticationProvider opaqueTokenAuthenticationProvider = new OpaqueTokenAuthenticationProvider(opaqueTokenIntrospector);
        opaqueTokenAuthenticationProvider.setAuthenticationConverter(opaqueTokenAuthenticationConverter());

        // 设置jwt和OpaqueToken的AuthenticationManager
        AuthenticationManager jwt = new ProviderManager(jwtAuthenticationProvider);
        AuthenticationManager opaqueToken = new ProviderManager(opaqueTokenAuthenticationProvider);
        return (request) -> useJwt(request) ? jwt : opaqueToken;
    }

    /**
     * 自定义jwt解析器，设置解析出来的权限信息的前缀与在jwt中的key
     *
     * @return jwt解析器 JwtAuthenticationConverter
     */
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // 设置解析权限信息的前缀，设置为空是去掉前缀
        grantedAuthoritiesConverter.setAuthorityPrefix("");
        // 设置权限信息在jwt claims中的key
        grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    /**
     * 自定义opaqueToken解析器，设置解析出来的权限信息的前缀
     *
     * @see OpaqueTokenAuthenticationProvider#convert(String, OAuth2AuthenticatedPrincipal)
     * @return opaqueToken解析器 OpaqueTokenAuthenticationConverter
     */
    public OpaqueTokenAuthenticationConverter opaqueTokenAuthenticationConverter() {
        return new OpaqueTokenAuthenticationConverter() {
            @Override
            public Authentication convert(String introspectedToken, OAuth2AuthenticatedPrincipal authenticatedPrincipal) {
                Instant iat = authenticatedPrincipal.getAttribute(OAuth2TokenIntrospectionClaimNames.IAT);
                Instant exp = authenticatedPrincipal.getAttribute(OAuth2TokenIntrospectionClaimNames.EXP);
                OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, introspectedToken,
                        iat, exp);

                // 设置解析权限信息的前缀，设置为空是去掉前缀
                Collection<? extends GrantedAuthority> authorities = authenticatedPrincipal.getAuthorities()
                        .stream().map(authority -> {
                            String authorityCode = authority.getAuthority();
                            if (authorityCode.startsWith("SCOPE_")) {
                                authorityCode = authorityCode.replace("SCOPE_", "");
                            }
                            return new SimpleGrantedAuthority(authorityCode);
                        }).toList();
                return new BearerTokenAuthentication(authenticatedPrincipal, accessToken, authorities);
            }
        };
    }

    /**
     * 判断请求头是否有key ： token-type，有值不是jwt
     * 这里根据自己业务实现，可以获取token后再判断token是jwt还是匿名token
     *
     * @param request 请求对象
     * @return 是否使用jwt token
     */
    private boolean useJwt(HttpServletRequest request) {
        String tokenType = request.getHeader("token-type");
        return !StringUtils.hasText(tokenType) || "jwt".equalsIgnoreCase(tokenType.toLowerCase());
    }

}

```

#### 4. 添加测试接口

```java
package com.light.sas.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 测试接口
 */
@RestController
public class TestController {

    @GetMapping("/test01")
    @PreAuthorize("hasAuthority('message.read')")
    public String test01() {
        return "test01";
    }

    @GetMapping("/test02")
    @PreAuthorize("hasAuthority('test02')")
    public String test02() {
        return "test02";
    }

    @GetMapping("/app")
    @PreAuthorize("hasAuthority('app')")
    public String app() {
        return "app";
    }
}

```

#### 5. 配置 application.yaml

```yaml
server:
  port: 8200

spring:
  application:
    name: jwt-opaque-token-resource-server
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          # 匿名token自省端点
          introspection-uri: http://127.0.0.1:8080/oauth2/introspect
          # 客户端id
          client-id: opaque-client
          # 客户端秘钥
          client-secret: 123456
        jwt:
          # token签发地址(认证服务根路径)
          issuer-uri: http://192.168.3.49:8080

logging:
  level:
    org.springframework.security: debug
    com.light.sas: debug

```

## 五、测试

### 1. 获取授权码

```shell
# 浏览器访问下面连接，登录授权获取授权码，此步骤需要修改前端的 VITE_OAUTH_CLIENT_ID 可以直接在页面显示获取到的Token
# http://127.0.0.1:8080/oauth2/authorize?client_id=opaque-client&response_type=code&scope=message.read&redirect_uri=http://127.0.0.1:5173/OAuth2Redirect

# 浏览器访问下面连接，登录授权获取授权码
# http://127.0.0.1:8080/oauth2/authorize?client_id=opaque-client&response_type=code&scope=message.read&redirect_uri=https://www.baidu.com

```

### 2. 获取Opaque Token

```shell
# 将授权码贴到下方的code参数上
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic b3BhcXVlLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'grant_type="authorization_code"' \
    --form 'redirect_uri="https://www.baidu.com"' \
    --form 'code="fis06YxKmDVbXeRsCSJBMCUSlZKL3lQ7roEZc4ejda_Oit4zqLfQoqDqNAuBRvXl6ARBNqhfT3sdJ_LjCuiZWsTjJRPhH49NcqGsRSUWU13pQDoi6MbRdGwHONlD0XQ_"'

```

响应结果
```json
{
   "access_token": "-bPoBEu5BmtGrYA-VeqCubhBAy8gl0diY3SpndmSNC47kLBM1SaC8waR5UusjnwGDH92n00sYWfXkWwg48dm3-YYNYNc5mHur-j-GLoiH_Dcg_BepF2nP3gwSh0Jo4Ks",
   "refresh_token": "I10Wni8cVn_ITfcJG9ukmIzC7SD0mNi4w85zOYRj3M6mGiz7eflECH16Ix-jBow33ni1fsqkqiUSksSqkWJYCqUdijC0_8vwl86hNQ8d09C1tOCGQ8-hb5O25DIFk0xV",
   "scope": "message.read",
   "token_type": "Bearer",
   "expires_in": 7200
}
```

### 3. 调用接口测试 (Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8100/test01' \
  --header 'Authorization: Bearer -bPoBEu5BmtGrYA-VeqCubhBAy8gl0diY3SpndmSNC47kLBM1SaC8waR5UusjnwGDH92n00sYWfXkWwg48dm3-YYNYNc5mHur-j-GLoiH_Dcg_BepF2nP3gwSh0Jo4Ks'

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
Content-Type: text/plain;charset=UTF-8
Content-Length: 6
Date: Fri, 01 Mar 2024 07:58:58 GMT

test01
```

### 4. 调用接口测试 Opaque Token (JWT and Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8200/test01' \
  --header 'token-type: opaque' \
  --header 'Authorization: Bearer -bPoBEu5BmtGrYA-VeqCubhBAy8gl0diY3SpndmSNC47kLBM1SaC8waR5UusjnwGDH92n00sYWfXkWwg48dm3-YYNYNc5mHur-j-GLoiH_Dcg_BepF2nP3gwSh0Jo4Ks'


curl --include --location --request GET 'http://127.0.0.1:8200/test01' \
  --header 'token-type: jwt' \
  --header 'Authorization: Bearer -bPoBEu5BmtGrYA-VeqCubhBAy8gl0diY3SpndmSNC47kLBM1SaC8waR5UusjnwGDH92n00sYWfXkWwg48dm3-YYNYNc5mHur-j-GLoiH_Dcg_BepF2nP3gwSh0Jo4Ks'

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
Content-Type: text/plain;charset=UTF-8
Content-Length: 6
Date: Fri, 01 Mar 2024 07:59:17 GMT

test01
```

### 5. 调用接口测试 JWT Token (JWT and Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8200/test01' \
  --header 'token-type: jwt' \
  --header 'Authorization: Bearer -bPoBEu5BmtGrYA-VeqCubhBAy8gl0diY3SpndmSNC47kLBM1SaC8waR5UusjnwGDH92n00sYWfXkWwg48dm3-YYNYNc5mHur-j-GLoiH_Dcg_BepF2nP3gwSh0Jo4Ks'

```

响应结果
```http request
HTTP/1.1 401
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
WWW-Authenticate: Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Malformed token", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 0
Date: Fri, 01 Mar 2024 07:59:48 GMT

```

可以看到 Opaque Token 不能作为 JWT Token 来使用

### 6. 获取授权码

```shell
# 浏览器访问下面连接，登录授权获取授权码
# http://127.0.0.1:8080/oauth2/authorize?client_id=messaging-client&response_type=code&scope=message.read&redirect_uri=http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc

```

### 7. 获取JWT Token

```shell
# 将授权码贴到下方的code参数上
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic bWVzc2FnaW5nLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'grant_type="authorization_code"' \
    --form 'redirect_uri="http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc"' \
    --form 'code="DDt914oygwr3rnMJJJdzZ7Oalr_iUxxIh5hUNVVdF00ODRI9gCxEsJFgwGvRuwV_Jsy11urVxootucnR1e0do364xhcNOPeRxAZ5DQc2X4oXwFjdALRFnzn6hWpjH7hi"'

```

响应结果
```json
{
   "access_token": "eyJraWQiOiJkZDhmYzdmMy0zMjcxLTQwMjItYThiOC01NjdjN2I0MGRkMDYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1lc3NhZ2luZy1jbGllbnQiLCJuYmYiOjE3MDkyODAxMjYsInNjb3BlIjpbIm1lc3NhZ2UucmVhZCJdLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4zLjQ5OjgwODAiLCJleHAiOjE3MDkyODczMjYsImlhdCI6MTcwOTI4MDEyNiwianRpIjoiZWJiZmVkNTQtMzE2OS00YWFjLWE0OGQtZGQ5M2VhNDBjYTA4IiwiYXV0aG9yaXRpZXMiOlsibWVzc2FnZS5yZWFkIiwiL3N5c3RlbSIsIi8qKiJdfQ.ggj1Tzc8Dh133kHpBPu4kEty-K9QBxXntdaobk2LatigNz2NvQ7VfvG3IHpqUEAI2U-JVOTgZFet_YDNRkpelE8CNBLaIzLfLJWXKLKe7W41rjJAHecaJCgqgK_I4thwpDTTAO3m5caoKTXuTTT6JY6VU5QMDW5mRqwGW9TR2nhXnD28V9q7lfV640V8EMpoqBhwpzZEl6I89CoYoZkL62ui6QdVz5Wyj46t5LTNQ77h1tRMzySfAmnCPO2fFlG9jiMZyHGvp0W0HPg6CWtyL6r8G6kUCtNFeXUkBiF1RVHf6eiaNPB_CyQO5KiNCaF9Qb3tiI6jY69NtofusZd_Ig",
   "refresh_token": "mH7fmZUwyuyiurirVBkwarnJ8Ph6eidb0korSe7k2swlYWcX3eB8IBd_hn3fVyIVBndnLmcmblnlHOHWZqc-C5Lt4PtQb2UqspKy4LPzgqW6vLlrrBtXLkxSxc5aLzxT",
   "scope": "message.read",
   "token_type": "Bearer",
   "expires_in": 7200
}
```

### 8. 调用接口测试 JWT Token (Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8100/test01' \
  --header 'Authorization: Bearer eyJraWQiOiJkZDhmYzdmMy0zMjcxLTQwMjItYThiOC01NjdjN2I0MGRkMDYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1lc3NhZ2luZy1jbGllbnQiLCJuYmYiOjE3MDkyODAxMjYsInNjb3BlIjpbIm1lc3NhZ2UucmVhZCJdLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4zLjQ5OjgwODAiLCJleHAiOjE3MDkyODczMjYsImlhdCI6MTcwOTI4MDEyNiwianRpIjoiZWJiZmVkNTQtMzE2OS00YWFjLWE0OGQtZGQ5M2VhNDBjYTA4IiwiYXV0aG9yaXRpZXMiOlsibWVzc2FnZS5yZWFkIiwiL3N5c3RlbSIsIi8qKiJdfQ.ggj1Tzc8Dh133kHpBPu4kEty-K9QBxXntdaobk2LatigNz2NvQ7VfvG3IHpqUEAI2U-JVOTgZFet_YDNRkpelE8CNBLaIzLfLJWXKLKe7W41rjJAHecaJCgqgK_I4thwpDTTAO3m5caoKTXuTTT6JY6VU5QMDW5mRqwGW9TR2nhXnD28V9q7lfV640V8EMpoqBhwpzZEl6I89CoYoZkL62ui6QdVz5Wyj46t5LTNQ77h1tRMzySfAmnCPO2fFlG9jiMZyHGvp0W0HPg6CWtyL6r8G6kUCtNFeXUkBiF1RVHf6eiaNPB_CyQO5KiNCaF9Qb3tiI6jY69NtofusZd_Ig'

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
Content-Type: text/plain;charset=UTF-8
Content-Length: 6
Date: Fri, 01 Mar 2024 08:03:48 GMT

test01
```

### 9. 调用接口测试 JWT Token (JWT and Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8200/test01' \
  --header 'token-type: jwt' \
  --header 'Authorization: Bearer eyJraWQiOiJkZDhmYzdmMy0zMjcxLTQwMjItYThiOC01NjdjN2I0MGRkMDYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1lc3NhZ2luZy1jbGllbnQiLCJuYmYiOjE3MDkyODAxMjYsInNjb3BlIjpbIm1lc3NhZ2UucmVhZCJdLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4zLjQ5OjgwODAiLCJleHAiOjE3MDkyODczMjYsImlhdCI6MTcwOTI4MDEyNiwianRpIjoiZWJiZmVkNTQtMzE2OS00YWFjLWE0OGQtZGQ5M2VhNDBjYTA4IiwiYXV0aG9yaXRpZXMiOlsibWVzc2FnZS5yZWFkIiwiL3N5c3RlbSIsIi8qKiJdfQ.ggj1Tzc8Dh133kHpBPu4kEty-K9QBxXntdaobk2LatigNz2NvQ7VfvG3IHpqUEAI2U-JVOTgZFet_YDNRkpelE8CNBLaIzLfLJWXKLKe7W41rjJAHecaJCgqgK_I4thwpDTTAO3m5caoKTXuTTT6JY6VU5QMDW5mRqwGW9TR2nhXnD28V9q7lfV640V8EMpoqBhwpzZEl6I89CoYoZkL62ui6QdVz5Wyj46t5LTNQ77h1tRMzySfAmnCPO2fFlG9jiMZyHGvp0W0HPg6CWtyL6r8G6kUCtNFeXUkBiF1RVHf6eiaNPB_CyQO5KiNCaF9Qb3tiI6jY69NtofusZd_Ig'

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
Content-Type: text/plain;charset=UTF-8
Content-Length: 6
Date: Fri, 01 Mar 2024 08:04:27 GMT

test01
```

### 10. 调用接口测试 Opaque Token (JWT and Opaque Resource Server)

```shell
# 只返回响应头      -I --head
# 返回响应体和响应头 -i --include 
curl --include --location --request GET 'http://127.0.0.1:8200/test01' \
  --header 'token-type: opaque' \
  --header 'Authorization: Bearer eyJraWQiOiJkZDhmYzdmMy0zMjcxLTQwMjItYThiOC01NjdjN2I0MGRkMDYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1lc3NhZ2luZy1jbGllbnQiLCJuYmYiOjE3MDkyODAxMjYsInNjb3BlIjpbIm1lc3NhZ2UucmVhZCJdLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4zLjQ5OjgwODAiLCJleHAiOjE3MDkyODczMjYsImlhdCI6MTcwOTI4MDEyNiwianRpIjoiZWJiZmVkNTQtMzE2OS00YWFjLWE0OGQtZGQ5M2VhNDBjYTA4IiwiYXV0aG9yaXRpZXMiOlsibWVzc2FnZS5yZWFkIiwiL3N5c3RlbSIsIi8qKiJdfQ.ggj1Tzc8Dh133kHpBPu4kEty-K9QBxXntdaobk2LatigNz2NvQ7VfvG3IHpqUEAI2U-JVOTgZFet_YDNRkpelE8CNBLaIzLfLJWXKLKe7W41rjJAHecaJCgqgK_I4thwpDTTAO3m5caoKTXuTTT6JY6VU5QMDW5mRqwGW9TR2nhXnD28V9q7lfV640V8EMpoqBhwpzZEl6I89CoYoZkL62ui6QdVz5Wyj46t5LTNQ77h1tRMzySfAmnCPO2fFlG9jiMZyHGvp0W0HPg6CWtyL6r8G6kUCtNFeXUkBiF1RVHf6eiaNPB_CyQO5KiNCaF9Qb3tiI6jY69NtofusZd_Ig'

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
Content-Type: text/plain;charset=UTF-8
Content-Length: 6
Date: Fri, 01 Mar 2024 08:04:43 GMT

test01
```

可以看到 JWT Token 可以作为 Opaque Token 来使用

## 六、结论
1. `Opaque Token` 不能作为 `JWT Token` 来使用
2. `JWT Token` 可以作为 `Opaque Token` 来使用
