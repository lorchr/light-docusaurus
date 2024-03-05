- [Getting Started](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/getting-started.html)
- [Spring Samples](https://github.com/spring-projects/spring-authorization-server/tree/main/samples/default-authorizationserver)
- [官方Demo spring-security-samples](https://github.com/spring-projects/spring-security-samples/tree/main/servlet/spring-boot/java/oauth2)

- [理解OAuth 2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)
- [Spring Authorization Server 0.3.0 实战（OAuth2.1协议和OpenID Connect 1.0协议）](https://zhuanlan.zhihu.com/p/538443308)
- [Spring Authorization Server1.0 介绍与使用](https://blog.csdn.net/baidu_28068985/article/details/128431612)
- [gc-oauth2](https://github.com/krycai/gc-framework/tree/master/gc-oauth2)

## 一、Quick Start
此配置中，Spring Security 及 Spring Authorization Server配置都在同一个配置类中

### 1.1 配置类
```java
package com.light.cloud.service.auth.server.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * Authentication Server 配置
 * < a href="https://github.com/spring-projects/spring-authorization-server/tree/main/samples/default-authorizationserver">官方Demo</>
 *
 * @author Hui Liu
 * @date 2023/5/4
 */
@Configuration
public class OAuth2AuthorizationServerConfig {

    /**
     * A Spring Security filter chain for the <a href="https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html">Protocol Endpoints</a> .
     *
     * @param http
     * @return
     * @throws Exception
     */
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http)
            throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(Customizer.withDefaults());    // Enable OpenID Connect 1.0
        http
                // Redirect to the login page when not authenticated from the
                // authorization endpoint
                .exceptionHandling((exceptions) -> exceptions
                        .authenticationEntryPoint(
                                new LoginUrlAuthenticationEntryPoint("/login"))
                )
                // Accept access tokens for User Info and/or Client Registration
                .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);

        return http.build();
    }

    /**
     * A Spring Security filter chain for <a href="https://docs.spring.io/spring-security/reference/servlet/authentication/index.html">authentication</a>.
     *
     * @param http
     * @return
     * @throws Exception
     */
    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http)
            throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .anyRequest().authenticated()
                )
                // Form login handles the redirect to the login page from the
                // authorization server filter chain
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    /**
     * An instance of <a href="https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/core/userdetails/UserDetailsService.html">UserDetailsService</a> for retrieving users to authenticate.
     *
     * @return
     */
    @Bean
    public UserDetailsService userDetailsService() {
       UserDetails userDetails = User.withDefaultPasswordEncoder()
               .username("user")
                .password("password")
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(userDetails);
    }

    /**
     * An instance of <a href="https://docs.spring.io/spring-authorization-server/docs/current/reference/html/core-model-components.html#registered-client-repository">RegisteredClientRepository</a> for managing clients.
     *
     * @return
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("messaging-client")
                .clientSecret("{noop}secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc")
                .redirectUri("http://127.0.0.1:8080/authorized")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope("message.read")
                .scope("message.write")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        return new InMemoryRegisteredClientRepository(registeredClient);
    }

    /**
     * An instance of com.nimbusds.jose.jwk.source.JWKSource for signing access tokens.
     *
     * @return
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    /**
     * An instance of java.security.KeyPair with keys generated on startup used to create the JWKSource above.
     *
     * @return
     */
    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
        return keyPair;
    }

    /**
     * An instance of <a href="https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/oauth2/jwt/JwtDecoder.html">JwtDecoder</a> for decoding signed access tokens.
     *
     * @param jwkSource
     * @return
     */
    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    /**
     * An instance of <a href="https://docs.spring.io/spring-authorization-server/docs/current/reference/html/configuration-model.html#configuring-authorization-server-settings">AuthorizationServerSettings</a> to configure Spring Authorization Server.
     *
     * @return
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder().build();
    }

}
```

### 1.2 测试流程

具体见[OAuth2开放端点](./0-OAuth2.1-Endpoints.md)

1. 调用授权接口
2. 登录账户
3. 确认授权
4. 获取token
5. 访问接口

## 二、默认配置
在`Quick Start`中已经通过最小配置，完成了一个`Spring Authorization Server`项目

`Spring Authorization Server`还提供了一种实现最小配置的默认配置形式。就是通过`OAuth2AuthorizationServerConfiguration`这个类。

```java
/*
 * Copyright 2020-2021 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.security.config.annotation.web.configuration;

import java.util.HashSet;
import java.util.Set;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.authorization.config.ProviderSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * {@link Configuration} for OAuth 2.0 Authorization Server support.
 *
 * @author Joe Grandja
 * @since 0.0.1
 * @see OAuth2AuthorizationServerConfigurer
 */
@Configuration(proxyBeanMethods = false)
public class OAuth2AuthorizationServerConfiguration {

   @Bean
   @Order(Ordered.HIGHEST_PRECEDENCE)
   public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
      applyDefaultSecurity(http);
      return http.build();
   }

   // @formatter:off
   public static void applyDefaultSecurity(HttpSecurity http) throws Exception {
      OAuth2AuthorizationServerConfigurer<HttpSecurity> authorizationServerConfigurer =
            new OAuth2AuthorizationServerConfigurer<>();
      RequestMatcher endpointsMatcher = authorizationServerConfigurer
            .getEndpointsMatcher();

      http
         .requestMatcher(endpointsMatcher)
         .authorizeRequests(authorizeRequests ->
            authorizeRequests.anyRequest().authenticated()
         )
         .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
         .apply(authorizationServerConfigurer);
   }
   // @formatter:on

   public static JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
      Set<JWSAlgorithm> jwsAlgs = new HashSet<>();
      jwsAlgs.addAll(JWSAlgorithm.Family.RSA);
      jwsAlgs.addAll(JWSAlgorithm.Family.EC);
      jwsAlgs.addAll(JWSAlgorithm.Family.HMAC_SHA);
      ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
      JWSKeySelector<SecurityContext> jwsKeySelector =
            new JWSVerificationKeySelector<>(jwsAlgs, jwkSource);
      jwtProcessor.setJWSKeySelector(jwsKeySelector);
      // Override the default Nimbus claims set verifier as NimbusJwtDecoder handles it instead
      jwtProcessor.setJWTClaimsSetVerifier((claims, context) -> {
      });
      return new NimbusJwtDecoder(jwtProcessor);
   }

   @Bean
   RegisterMissingBeanPostProcessor registerMissingBeanPostProcessor() {
      RegisterMissingBeanPostProcessor postProcessor = new RegisterMissingBeanPostProcessor();
      postProcessor.addBeanDefinition(ProviderSettings.class, () -> ProviderSettings.builder().build());
      return postProcessor;
   }

}
```

这里注入一个叫做`authorizationServerSecurityFilterChain`的bean，这跟之前`Quick Start`项目时实现的基本是相同的。

有了这个bean，就会支持如下协议端点：

- [OAuth2 Authorization endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-authorization-endpoint)
- [OAuth2 Token endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-endpoint)
- [OAuth2 Token Introspection endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-introspection-endpoint)
- [OAuth2 Token Revocation endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-revocation-endpoint)
- [OAuth2 Authorization Server Metadata endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-authorization-server-metadata-endpoint)
- [JWK Set endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#jwk-set-endpoint)
- [OpenID Connect 1.0 Provider Configuration endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oidc-provider-configuration-endpoint)
- [OpenID Connect 1.0 UserInfo endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oidc-user-info-endpoint)

## 三、标准配置
基于`OAuth2AuthorizationServerConfiguration`这个类来实现一个`Authorization Server`。

将 `Spring Security`和`OAuth2 Authorization Server`的配置分开
`Spring Security` 使用 `WebSecurityConfig` 类，创建一个新的`Authorization Server`配置类 `AuthorizationServerConfig`。

### 3.1 WebSecurityConfig
```java
package com.light.cloud.service.auth.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security配置类
 *
 * @author Hui Liu
 * @date 2023/5/4
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    /**
     * 这个也是个Spring Security的过滤器链，用于Spring Security的身份认证。
     *
     * @param http
     * @return
     * @throws Exception
     */
    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http)
            throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .anyRequest().authenticated()
                )
                // Form login handles the redirect to the login page from the
                // authorization server filter chain
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    /**
     * 配置用户信息，或者配置用户数据来源，主要用于用户的检索。
     *
     * @return
     */
    @Bean
    public UserDetailsService userDetailsService() {
       UserDetails userDetails = User.withDefaultPasswordEncoder()
               .username("user")
                .password("password")
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(userDetails);
    }
}
```

### 3.2 AuthorizationServerConfig
```java
package com.light.cloud.service.auth.server.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * OAuth2 认证服务器配置
 * <a href="https://github.com/spring-projects/spring-authorization-server/tree/main/samples/default-authorizationserver">官方Demo</>
 * 
 * @see AuthorizationServerSettings#builder()
 * @author Hui Liu
 * @date 2023/5/4
 */
@Configuration
@Import(OAuth2AuthorizationServerConfiguration.class)
public class AuthorizationServerConfig {

    /**
     * oauth2 用于第三方认证，RegisteredClientRepository 主要用于管理第三方（每个第三方就是一个客户端）
     *
     * @return
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("messaging-client")
                .clientSecret("{noop}secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc")
                .redirectUri("http://127.0.0.1:8080/authorized")
                .scope(OidcScopes.OPENID)
                .scopes(OidcScopes.PROFILE)
                .scope("message.read")
                .scope("message.write")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        return new InMemoryRegisteredClientRepository(registeredClient);
    }

    /**
     * 用于给access_token签名使用。
     *
     * @return
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    /**
     * 生成秘钥对，为jwkSource提供服务。
     *
     * @return
     */
    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
        return keyPair;
    }

}
```

## 四、存储配置
`Spring Authorization Server`默认是支持`InMemory`和`JDBC`两种存储模式的，内存模式只适合开发和简单的测试。接下来我们来实现JDBC存储方式。

修改步骤如下：

1. 引入JDBC相关依赖。
2. 创建数据库并初始化表，以及在`application.yaml`文件中配置数据库连接。
3. 修改Spring Security和Spring authorization Server的配置。
4. 初始化表数据
5. 测试服务

### 4.1 引入JDBC依赖
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
   <groupId>mysql</groupId>
   <artifactId>mysql-connector-java</artifactId>
   <scope>runtime</scope>
</dependency>
```

### 4.2 初始化数据库表并配置数据库连接信息
Spring Security的建表语句在
```shell
org/springframework/security/core/userdetails/jdbc/users.ddl
```

Spring authorization Server的建表文件在：
```shell
org/springframework/security/oauth2/server/authorization/oauth2-authorization-consent-schema.sql
org/springframework/security/oauth2/server/authorization/oauth2-authorization-schema.sql
org/springframework/security/oauth2/server/authorization/client/oauth2-registered-client-schema.sql
```

```sql
DROP TABLE IF EXISTS oauth2_authorization_consent;
CREATE TABLE oauth2_authorization_consent
(
    registered_client_id varchar(100)  NOT NULL,
    principal_name       varchar(200)  NOT NULL,
    authorities          varchar(1000) NOT NULL,
    PRIMARY KEY (registered_client_id, principal_name)
);


DROP TABLE IF EXISTS oauth2_authorization;

CREATE TABLE oauth2_authorization
(
    id                            varchar(100) NOT NULL,
    registered_client_id          varchar(100) NOT NULL,
    principal_name                varchar(200) NOT NULL,
    authorization_grant_type      varchar(100) NOT NULL,
    authorized_scopes             varchar(1000) DEFAULT NULL,
    attributes                    blob          DEFAULT NULL,
    state                         varchar(500)  DEFAULT NULL,
    authorization_code_value      blob          DEFAULT NULL,
    authorization_code_issued_at  timestamp    NULL,
    authorization_code_expires_at timestamp    NULL,
    authorization_code_metadata   blob          DEFAULT NULL,
    access_token_value            blob          DEFAULT NULL,
    access_token_issued_at        timestamp    NULL,
    access_token_expires_at       timestamp    NULL,
    access_token_metadata         blob          DEFAULT NULL,
    access_token_type             varchar(100)  DEFAULT NULL,
    access_token_scopes           varchar(1000) DEFAULT NULL,
    oidc_id_token_value           blob          DEFAULT NULL,
    oidc_id_token_issued_at       timestamp    NULL,
    oidc_id_token_expires_at      timestamp    NULL,
    oidc_id_token_metadata        blob          DEFAULT NULL,
    refresh_token_value           blob          DEFAULT NULL,
    refresh_token_issued_at       timestamp    NULL,
    refresh_token_expires_at      timestamp    NULL,
    refresh_token_metadata        blob          DEFAULT NULL,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS oauth2_registered_client;
CREATE TABLE oauth2_registered_client
(
    id                            varchar(100)                            NOT NULL,
    client_id                     varchar(100)                            NOT NULL,
    client_id_issued_at           timestamp     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_secret                 varchar(200)  DEFAULT NULL,
    client_secret_expires_at      timestamp                               NULL,
    client_name                   varchar(200)                            NOT NULL,
    client_authentication_methods varchar(1000)                           NOT NULL,
    authorization_grant_types     varchar(1000)                           NOT NULL,
    redirect_uris                 varchar(1000) DEFAULT NULL,
    scopes                        varchar(1000)                           NOT NULL,
    client_settings               varchar(2000)                           NOT NULL,
    token_settings                varchar(2000)                           NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE authorities
    DROP FOREIGN KEY fk_authorities_users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS authorities;
create table users
(
    username varchar(50)  not null primary key,
    password varchar(500) not null,
    enabled  boolean      not null
);

create table authorities
(
    username  varchar(50) not null,
    authority varchar(50) not null,
    constraint fk_authorities_users foreign key (username) references users (username)
);

create unique index ix_auth_username on authorities (username, authority);
```

application.yml
```yaml
server:
  port: 8080

spring:
  main:
    allow-bean-definition-overriding: true
  datasource:
    url: jdbc:mysql://localhost:3306/spring-authorization-server
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: admin
```

### 4.3 修改Spring Security和Spring authorization Server的配置

#### Spring Security
```java
@Bean
public UserDetailsService userDetailsService(JdbcTemplate jdbcTemplate) {
    JdbcUserDetailsManager userDetailsManager = new JdbcUserDetailsManager();
    userDetailsManager.setJdbcTemplate(jdbcTemplate);
    return userDetailsManager;
}
```

#### Spring authorization Server
```java
@Bean
public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
    return new JdbcRegisteredClientRepository(jdbcTemplate);
}

@Bean
public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate) {
    return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository());
}

@Bean
public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate) {
    return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository());
}
```

### 4.4 初始化表数据
需要初始化三张表数据，分别是`users`, `authorities`, `oauth2_registered_client`

`users`, `authorities`需要通过`UserDetailsManager`类来实现，我暂时使用junit Test来实现。

```java
package com.light.cloud.service.auth.server;

import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.UserDetailsManager;

import java.util.UUID;

@SpringBootTest
public class CloudServiceAuthServerApplicationTests {

  private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @Resource
  private UserDetailsManager userDetailsManager;

  @Resource
  private RegisteredClientRepository registeredClientRepository;

  @Test
  public void initUser() {
     UserDetails userDetails = User.withDefaultPasswordEncoder()
             .username("user")
            .password("password")
//				.passwordEncoder(source -> "{bcrypt}" + passwordEncoder.encode(source))
            .roles("USER")
             .build();

     UserDetails testUser = User.withDefaultPasswordEncoder()
             .username("test")
            .password("test")
//				.passwordEncoder(source -> "{bcrypt}" + passwordEncoder.encode(source))
            .roles("TEST")
            .build();

    userDetailsManager.createUser(userDetails);
    userDetailsManager.createUser(testUser);
  }


  @Test
  public void initClient() {
    RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("messaging-client")
            .clientSecret("{noop}secret")
//				.clientSecret("{bcrypt}" + passwordEncoder.encode("secret"))
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
            .redirectUri("http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc")
            .redirectUri("http://127.0.0.1:8080/authorized")
//                .postLogoutRedirectUri("http://127.0.0.1:8080/logged-out")
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .scope("client.create")
            .scope("client.read")
            .scope("message.read")
            .scope("message.write")
            .clientSettings(ClientSettings.builder()
                    .requireAuthorizationConsent(true)
                    .jwkSetUrl("http://127.0.0.1:8080/oauth2/jwks")
                    .build())
            .build();

    RegisteredClient deviceClient = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("device-messaging-client")
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
//                .authorizationGrantType(AuthorizationGrantType.DEVICE_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .scope("message.read")
            .scope("message.write")
            .build();

    registeredClientRepository.save(registeredClient);
    registeredClientRepository.save(deviceClient);
  }

}
```

## 五、自定义JWT字段
jwt解析可以使用 [JWT在线解析](https://jwt.io)

### 5.1 获取token
1. 获取授权码 
   > http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=message.read&redirect_uri=http://127.0.0.1:8080/authorized

2. 获取Token
  > curl -X POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/authorized&code=rXd5b" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="

3. JWT Set 
  > http://127.0.0.1:8080/oauth2/jwks

```json
{
    "keys": [
        {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "64489bb5-4dde-422a-87d8-7fa302ca9269",
            "n": "0UIkQwTSnrRHSwY56cfufw5UMyT0wfNcORRBUtWOYF4TXunuCW-mRBmEIrtRsUB2TOMkvMgosgUHSf6oqVweR3oYAogMcJnv2Gw1pDq_l7stMzrc1QTdg3RuuhY49CvrcxtIpCUz47UOnwm_os-lXN72h1eevkL0wanODez4UILfUxiET8K6JelavyH1TKk6kIMJKhOUpVabboJotqNf6CzgvKllsph8EyZGItUPU_p7eLJrcLs52OD2pB0BXofIj9VOwuXLI0ttzyut6tODU0K_tOCmH3udju-rdHTHd_ZBKpnVqMYLfiXeE0gswrWCvPBEpKutiCw6mONzTOmzBw"
        }
    ]
}
```

### 5.2 默认Token解析
默认token
```shell
eyJraWQiOiI5MzBhOTgxNC0yYWUyLTRiODYtOTRkZS1jZjBhYzAxYzRlZmYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiYXVkIjoibWVzc2FnaW5nLWNsaWVudCIsIm5iZiI6MTY4NDMwOTYxMCwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsImNsaWVudC5jcmVhdGUiLCJjbGllbnQucmVhZCJdLCJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwODAiLCJleHAiOjE2ODQzMDk5MTAsImlhdCI6MTY4NDMwOTYxMH0.hN07xVk8VbQTlHWCT3rgv8dHddPNWcO8Dvc4WKGcNE6XmdOHnW_9QDuQCSOX-SZjTHQStRlKCSti8Qwg7lHy-JJ8pl3AQzqio7AFS5j-EGayGtjqIOAxUAhF7WlH5bj08nUE-2g0X0h5OmZvNpbt69ApeWc0wGCLL58pDgt0DZlk9sjqMGh7u5BUmX8d-DGvb4OI24ClGmIDdkpma6PLDXPQ3TsNF12XYevCEB1XMwXmX524uGyuuODZhz-3-CcE9bIEm3l7-IYBs-6IUGbCJ288lUzQ1p59Zdw2u4wXmzPrqYFFOYRWSm5zrrhICk1lzj8nXGX9yQykdIZIhIgkiQ
```

解析结果
```json
HEADER:ALGORITHM & TOKEN TYPE
{
  "kid": "930a9814-2ae2-4b86-94de-cf0ac01c4eff",
  "alg": "RS256"
}
PAYLOAD:DATA
{
  "sub": "user",
  "aud": "messaging-client",
  "nbf": 1684309610,
  "scope": [
    "openid",
    "profile",
    "client.create",
    "client.read"
  ],
  "iss": "http://127.0.0.1:8080",
  "exp": 1684309910,
  "iat": 1684309610
}
VERIFY SIGNATURE
```

### 5.3 自定义Header及Claim内容
接下来我们增加一个自定义header和claim.

需要使用OAuth2TokenCustomizer来实现。

```java
package com.light.cloud.service.auth.server.config;

import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.DelegatingOAuth2TokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.JwtGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2RefreshTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;

/**
 * 自定义JWT中的内容
 *
 * @author Hui Liu
 * @date 2023/5/17
 */
@Configuration
public class JwtEnhanceConfig {

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer() {
        return context -> {
            JwsHeader.Builder headers = context.getJwsHeader();
            JwtClaimsSet.Builder claims = context.getClaims();
            if (context.getTokenType().equals(OAuth2TokenType.ACCESS_TOKEN)) {
                // Customize headers/claims for access_token
                headers.header("customerHeader", "Header");
                claims.claim("customerClaim", "Claim");
            } else if (context.getTokenType().getValue().equals(OidcParameterNames.ID_TOKEN)) {
                // Customize headers/claims for id_token
            }
        };
    }

    @Bean
    public OAuth2TokenGenerator<?> tokenGenerator(OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer, JwtEncoder jwtEncoder) {
        JwtGenerator jwtGenerator = new JwtGenerator(jwtEncoder);
        jwtGenerator.setJwtCustomizer(jwtCustomizer);
        OAuth2AccessTokenGenerator accessTokenGenerator = new OAuth2AccessTokenGenerator();
        OAuth2RefreshTokenGenerator refreshTokenGenerator = new OAuth2RefreshTokenGenerator();
        return new DelegatingOAuth2TokenGenerator(jwtGenerator, accessTokenGenerator, refreshTokenGenerator);
    }

}
```

### 5.4 新的Token解析
```shell
eyJjdXN0b21lckhlYWRlciI6IkhlYWRlciIsImFsZyI6IlJTMjU2Iiwia2lkIjoiMzdkMTViNWUtNGFmMC00ZjY1LTg4Y2EtNTk0NzgwZmMzMDgwIn0.eyJzdWIiOiJ1c2VyIiwiYXVkIjoibWVzc2FnaW5nLWNsaWVudCIsImN1c3RvbWVyQ2xhaW0iOiJDbGFpbSIsIm5iZiI6MTY4NDMwOTY5MSwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsImNsaWVudC5jcmVhdGUiLCJjbGllbnQucmVhZCJdLCJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwODAiLCJleHAiOjE2ODQzMDk5OTEsImlhdCI6MTY4NDMwOTY5MX0.sVBX5oWgttKNj_O6VbafPyX60Ldr2HHYWoFdNINPPatGSUr5QdsIsUIxRiE0VBu_-MycQrUB_Ad4cJzRoTxyTmMpRVv-uJlYLOoViStReY-I-VgK8b4nLLW8alore3BaF4aX6a2I4T2M3f4jsttzJ9jJTeiVTaurz0zbYpH5cPMpI3zccXPhOQFpqQEILXeU_JpoD_Wx-13FK9VOGlid7LU1nJdUpYR_rsXkS_6WMPjPdi0wMfNRJCYetBqnRQHQjlKVbrp9r62TXGjVj9qiNFAK9nV40BC-t-fvqTG2W4DduGbfXZZf8mEn-UTtuL2bTFv5_dOz-xhTKu228A3xWA
```

解析结果
```json
HEADER:ALGORITHM & TOKEN TYPE
{
  "customerHeader": "Header",
  "alg": "RS256",
  "kid": "37d15b5e-4af0-4f65-88ca-594780fc3080"
}
PAYLOAD:DATA
{
  "sub": "user",
  "aud": "messaging-client",
  "customerClaim": "Claim",
  "nbf": 1684309691,
  "scope": [
    "openid",
    "profile",
    "client.create",
    "client.read"
  ],
  "iss": "http://127.0.0.1:8080",
  "exp": 1684309991,
  "iat": 1684309691
}
VERIFY SIGNATURE
```

## 六、OpenID Connect 1.0协议
Spring Authorization Server支持OAuth2.1协议，同时也支持OpenID Connect 1.0协议，该协议是OAuth2协议的上层协议，这里我就不解释了，可自行百度。

### 6.1 开启OIDC 
默认是不开启OIDC的，需要进行额外的配置
```java
@Bean
@Order(Ordered.HIGHEST_PRECEDENCE)
public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
    OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
    http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
        .oidc(Customizer.withDefaults());    // Enable OpenID Connect 1.0
    http
        // Redirect to the login page when not authenticated from the
        // authorization endpoint
        .exceptionHandling((exceptions) -> exceptions
        .authenticationEntryPoint(
            new LoginUrlAuthenticationEntryPoint("/login"))
        )
        // Accept access tokens for User Info and/or Client Registration
        .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);

    return http.build();
}

@Bean
public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
}

@Bean
public AuthorizationServerSettings authorizationServerSettings() {
    return AuthorizationServerSettings.builder().build();
}
```

注意： 客户端client(messaging-client)设置的时候scope设置了openid的支持

### 6.2 用户端点
1. 获取授权码 授权scope openid
    > http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=openid&redirect_uri=http://127.0.0.1:8080/authorized

2. 获取Token
    > curl -X POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/authorized&code=mLhDhO6" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="

3. 获取用户信息
    > curl -X GET "http://127.0.0.1:8080/userinfo" -H "Authorization: Bearer eyJjd"

用户信息
```json
{
  "sub":"user"
}
```

这里的sub就是用户的标志，当然也可以增加很多自定义信息。
```java
    @Bean
@Order(Ordered.HIGHEST_PRECEDENCE)
public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();

        /**
         * @see OAuth2AuthorizationServerConfiguration#applyDefaultSecurity(HttpSecurity)
         */
        http
            .securityMatcher(endpointsMatcher)
            .authorizeRequests(authorizeRequests ->
                authorizeRequests.anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
            .apply(authorizationServerConfigurer);
        http
            // Redirect to the login page when not authenticated from the
            // authorization endpoint
            .exceptionHandling((exceptions) -> exceptions.authenticationEntryPoint(
                new LoginUrlAuthenticationEntryPoint("/login")
        ))
        // Accept access tokens for User Info and/or Client Registration
        .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);

        // 也可以使用如下代码，跳转到login page
//        http.formLogin(Customizer.withDefaults());

        authorizationServerConfigurer
            // Enable OpenID Connect 1.0
            .oidc(oidc -> {
                oidc.userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint.userInfoMapper(oidcUserInfoAuthenticationContext -> {
                    OAuth2AccessToken accessToken = oidcUserInfoAuthenticationContext.getAccessToken();
                    Map<String, Object> claims = new HashMap<>();
                    claims.put("url", "https://github.com/lorchr");
                    claims.put("accessToken", accessToken);
                    claims.put("sub", oidcUserInfoAuthenticationContext.getAuthorization().getPrincipalName());
                    return new OidcUserInfo(claims);
                }));
            }
        );

        return http.build();
}
```

用户信息
```json
{
    "sub": "test",
    "accessToken": {
        "tokenValue": "eyJjdXN0b21lckhlYWRlciI6Iui_meaYr-S4gOS4quiHquWumuS5iWhlYWRlciIsImFsZyI6IlJTMjU2Iiwia2lkIjoiZTdiY2FkMzktNGQyZS00NmE0LWJlZDAtN2VmODFiODBlZmZiIn0.eyJzdWIiOiJ0ZXN0IiwiYXVkIjoibWVzc2FnaW5nLWNsaWVudCIsImN1c3RvbWVyQ2xhaW0iOiLov5nmmK_kuIDkuKroh6rlrprkuYlDbGFpbSIsIm5iZiI6MTY4NDI5NDk2Nywic2NvcGUiOlsib3BlbmlkIl0sImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MCIsImV4cCI6MTY4NDI5NTI2NywiaWF0IjoxNjg0Mjk0OTY3fQ.Y6Z2ih9HgpPywIMYcrhBfBJg_k5EREuZbj3S32ghnUJI7A-o00W0fM6UfKwvXWi7eUY2Yk04mweYYX0aO2wwnhmBXjQMeKA7JJSfvaSLHMI32VXL5-cpnDdbzkrP0TnDhDf7U14-YZx6dQleGphLbiYV98sEmV00Jo1n4y8tbjLYYIYHPqDQQZc2NSYx14Kgi_6IjNSFisQeBUi4U9YtxdGP2nW9dto1AUxla1ESIWwCQyEoykFPbeD8t3QXYr6jBDl47zrA7DH9JdclHxldZX8Zumv2nDVH15fIWydq3LE4wFpGBKYcYy0d0Mbz_FusHon2ZpyeTKMsq2PlfwTpiA",
        "issuedAt": 1684294967.820415000,
        "expiresAt": 1684295267.820415000,
        "tokenType": {
            "value": "Bearer"
        },
        "scopes": [
            "openid"
        ]
    },
    "url": "https://github.com/lorchr"
}
```

### 6.3 查看OpenID的配置
> curl -X GET "http://127.0.0.1:8080/.well-known/openid-configuration"

```json
{
    "issuer": "http://127.0.0.1:8080",
    "authorization_endpoint": "http://127.0.0.1:8080/oauth2/authorize",
    "token_endpoint": "http://127.0.0.1:8080/oauth2/token",
    "token_endpoint_auth_methods_supported": [
        "client_secret_basic",
        "client_secret_post",
        "client_secret_jwt",
        "private_key_jwt"
    ],
    "jwks_uri": "http://127.0.0.1:8080/oauth2/jwks",
    "userinfo_endpoint": "http://127.0.0.1:8080/userinfo",
    "response_types_supported": [
        "code"
    ],
    "grant_types_supported": [
        "authorization_code",
        "client_credentials",
        "refresh_token"
    ],
    "revocation_endpoint": "http://127.0.0.1:8080/oauth2/revoke",
    "revocation_endpoint_auth_methods_supported": [
        "client_secret_basic",
        "client_secret_post",
        "client_secret_jwt",
        "private_key_jwt"
    ],
    "introspection_endpoint": "http://127.0.0.1:8080/oauth2/introspect",
    "introspection_endpoint_auth_methods_supported": [
        "client_secret_basic",
        "client_secret_post",
        "client_secret_jwt",
        "private_key_jwt"
    ],
    "subject_types_supported": [
        "public"
    ],
    "id_token_signing_alg_values_supported": [
        "RS256"
    ],
    "scopes_supported": [
        "openid"
    ]
}
```

### 6.4 客户端注册端点
OpenID Connect 1.0客户端注册端点默认禁用，因为许多部署不需要动态客户端注册。
```java
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();

        /**
         * @see OAuth2AuthorizationServerConfiguration#applyDefaultSecurity(HttpSecurity)
         */
        http
                .securityMatcher(endpointsMatcher)
                .authorizeRequests(authorizeRequests ->
                        authorizeRequests.anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
                .apply(authorizationServerConfigurer);
        http
                // Redirect to the login page when not authenticated from the
                // authorization endpoint
                .exceptionHandling((exceptions) -> exceptions.authenticationEntryPoint(
                        new LoginUrlAuthenticationEntryPoint("/login")
        ))
        // Accept access tokens for User Info and/or Client Registration
        .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);

        // 也可以使用如下代码，跳转到login page
//        http.formLogin(Customizer.withDefaults());

        authorizationServerConfigurer
                // Enable OpenID Connect 1.0
                .oidc(oidc -> {
                            oidc.userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint.userInfoMapper(oidcUserInfoAuthenticationContext -> {
                                OAuth2AccessToken accessToken = oidcUserInfoAuthenticationContext.getAccessToken();
                                Map<String, Object> claims = new HashMap<>();
                                claims.put("url", "https://github.com/lorchr");
                                claims.put("accessToken", accessToken);
                                claims.put("sub", oidcUserInfoAuthenticationContext.getAuthorization().getPrincipalName());
                                return new OidcUserInfo(claims);
                            }));
                            // 允许客户端注册
                            oidc.clientRegistrationEndpoint(Customizer.withDefaults());
                        }
                );

        return http.build();
    }
```

注意： 
1. 客户端注册需要有 scope : client.create
2. 客户端查询需要有 scope : client.read

### 6.5 注册客户端
1. 获取授权码 授权scope client.create
    > http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=client.create&redirect_uri=http://127.0.0.1:8080/authorized

2. 获取Token
    > curl -X  POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/authorized&code=VeNYf" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="

3. 注册客户端
   
   ```shell
   curl -X POST "http://127.0.0.1:8080/connect/register" -H "Authorization: Bearer " \
   -d '{
      "application_type": "web",
      "redirect_uris": [
         "https://client.example.org/callback",
         "https://client.example.org/callback2"
      ],
      "client_name": "My Example",
      "client_name#ja-Jpan-JP": "クライアント名",
      "logo_uri": "https://client.example.org/logo.png",
      "subject_type": "pairwise",
      "sector_identifier_uri": "https://other.example.net/file_of_redirect_uris.json",
      "token_endpoint_auth_method": "client_secret_basic",
      "jwks_uri": "https://client.example.org/my_public_keys.jwks",
      "userinfo_encrypted_response_alg": "RSA1_5",
      "userinfo_encrypted_response_enc": "A128CBC-HS256",
      "contacts": [
         "ve7jtb@example.org",
         "mary@example.org"
      ],
      "request_uris": [
         "https://client.example.org/rf.txt#qpXaRLh_n93TTR9F252ValdatUQvQiJi5BDub2BeznA"
      ]
   }'
   ```

   响应
   ```json
   {
    "client_id": "7d5seTkGh3k8kfLrYbSoiV3bJFfL2BIGuI4qAX0XtsQ",
    "client_id_issued_at": 1684304950,
    "client_name": "My Example",
    "client_secret": "nOUw4oLhxZ7UgFbxlbBF-GeCNh_5RslGobS6Kxtwcexw9u3FPWMd9-i6Pyyi1fsN",
    "redirect_uris": [
        "https://client.example.org/callback",
        "https://client.example.org/callback2"
    ],
    "grant_types": [
        "authorization_code"
    ],
    "response_types": [
        "code"
    ],
    "token_endpoint_auth_method": "client_secret_basic",
    "id_token_signed_response_alg": "RS256",
    "registration_client_uri": "http://127.0.0.1:8080/connect/register?client_id=7d5seTkGh3k8kfLrYbSoiV3bJFfL2BIGuI4qAX0XtsQ",
    "registration_access_token": "eyJjdXN0b21lckhlYWRlciI6Iui_meaYr-S4gOS4quiHquWumuS5iWhlYWRlciIsImFsZyI6IlJTMjU2Iiwia2lkIjoiMjhmODRlZjctMTRjMS00M2ZlLThjNjYtMTVmZDkyZjZkZDc2In0.eyJzdWIiOiI3ZDVzZVRrR2gzazhrZkxyWWJTb2lWM2JKRmZMMkJJR3VJNHFBWDBYdHNRIiwiYXVkIjoiN2Q1c2VUa0doM2s4a2ZMclliU29pVjNiSkZmTDJCSUd1STRxQVgwWHRzUSIsImN1c3RvbWVyQ2xhaW0iOiLov5nmmK_kuIDkuKroh6rlrprkuYlDbGFpbSIsIm5iZiI6MTY4NDMwNDk1MCwic2NvcGUiOlsiY2xpZW50LnJlYWQiXSwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo4MDgwIiwiZXhwIjoxNjg0MzA1MjUwLCJpYXQiOjE2ODQzMDQ5NTB9.DB5f4BwYifSUzxHJSjJi7YTkv5QPksxm_fSJAIX5LIg8QZfEyvdPKN_ieqbwaNZ6WpHV9_QDCxll3nraT2Ub3RujWi8HU_v5vlgKz8iPTc4byyZw3qH7gIgZwyfxRo1gD1TiMHgZ2FbnDQHV6CC04tiYG4r0gHChFLlvIZu2IgyLOKiVXsmcAGZdY225cD3ULH2faXAPXYOdd7XDDFQMaZJSmAL_jzYmHVNiB4DIJGedibBAb7blnpKUOrv8JNOB7iLxKQO8ah-XDJZ4QfboQl3wi477q8wedixcnGUKYiK5MRs38rBWicHzDe4uCnKRCNQJW8754kBONEpkZ9xn8A",
    "client_secret_expires_at": 0
   }
   ```

4. 获取授权码 授权scope client.read
   > http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=client.create&redirect_uri=http://127.0.0.1:8080/authorized

5. 获取Token
   > curl -X POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/authorized&code=VeNYf" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="

6. 查询客户端
   > curl -X GET "http://127.0.0.1:8080/connect/register?client_id=messaging-client" -H "Authorization: Bearer "

### 6.6 注意事项
1. 注册客户端时，scope 必须仅为 client.create
2. 查询客户端时，scope 必须仅为 client.read 且只能查询当前access_token所属客户端的信息

## 七、资源服务器（resource-server）与客户端（oauth2-client）

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```
