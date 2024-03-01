- [spring-security-oauth2-authorization-server（一）SpringBoot3.1.3整合](https://blog.csdn.net/weixin_42229668/article/details/132912917)
- [spring-security-oauth2-authorization-server（二）Token生成分析之JWT Token和Opaque Token](https://blog.csdn.net/weixin_42229668/article/details/132925597)

## 写在前面的话
因为`Spring Boot 3.x`是目前最新的版本，整合`spring-security-oauth2-authorization-server`的资料很少，所以产生了这篇文章，主要为想尝试Spring Boot高版本，想整合最新的`spring-security-oauth2-authorization-server`的初学者，旨在为大家提供一个简单上手的参考，如果哪里写得不对或可以优化的还请大家踊跃评论指正。

## 1. 集成环境
- JDK-17
- spring-boot-dependencies-3.1.3
- spring-security-oauth2-authorization-server-1.1.2

此文章主要参照官方文档编写，所有配置都能在[官方文档](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/getting-started.html)上找到。

## 2. 了解OAuth2.1和Spring Authorization Server
### 2.1 OAuth2.1
关于OAuth2.1的介绍和规范可以参考官方文档：https://datatracker.ietf.org/doc/html/rfc6749#section-1

### 2.2 `spring-security-oauth2-authorization-server`
概述取自官方文档：

> Spring授权服务器是一个框架，提供 `OAuth 2.1` 和 `OpenID Connect 1.0` 规范及其他相关规范的实现。它建立在 `Spring Security` 之上，为构建`OpenID Connect 1.0 Identity Provider` 和 `OAuth2` 授权服务器产品提供了一个安全、轻量级和可定制的基础。

## 3. 项目搭建
### 3.1 认证服务器框架搭建
pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.3</version>
        <relativePath/>
    </parent>
    <groupId>com.roshine</groupId>
    <artifactId>authorization-server</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>authorization-server</name>
    <description>authorization-server</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.2.19</version>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.3.2</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
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
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 3.2 初始化自带的数据表
- 已注册的客户端信息表
- 认证授权表
- 认证信息表

### 3.3 验证核心配置 `AuthorizationServerConfig`
改配置完全参照官方文档，内容如下

### 3.3.1 用于协议端点的Spring Security过滤器链
此处与官方文档略有不同：

- 注释 `.oidc(Customizer.withDefaults())`，因为不清楚如何使用和验证，注释掉先
- 默认前往登录页的uri是`/login`，如果需要自定义登录页可以改为自己的，这里我就暂时先用默认

```java
/**
 * 用于协议端点的Spring Security过滤器链
 *
 * @param http HttpSecurity
 * @return SecurityFilterChain
 */
@Bean
public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
    OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
    http.getConfigurer(OAuth2AuthorizationServerConfigurer.class);
            // 开启OpenID Connect 1.0 暂时不清楚该协议是什么，那就不用先
            //.oidc(Customizer.withDefaults());
    http
            // 当未登录时访问认证端点时重定向至登录页面，默认前往登录页的uri是/login
            .exceptionHandling((exceptions) -> exceptions
                    .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login")));
    return http.build();
}
```

#### 3.3.2 用于认证的Spring Security过滤器链
```java
 /**
  * 用于认证的Spring Security过滤器链。
  *
  * @param http HttpSecurity
  * @return SecurityFilterChain
  */
@Bean
public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests((authorize) -> authorize
                    .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults());
    return http.build();
}
```

### 3.3.3 `UserDetailsService` 的一个实例，用于检索要认证的用户。
```java
/**
 * 配置密码解析器，使用BCrypt的方式对密码进行加密和验证
 *
 * @return BCryptPasswordEncoder
 */
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public UserDetailsService userDetailsService() {
    UserDetails userDetails = User.withUsername("admin")
            .password(passwordEncoder().encode("123456"))
            .roles("admin")
            .build();
    return new InMemoryUserDetailsManager(userDetails);
}
```

#### 3.3.4 `RegisteredClientRepository` 的一个实例，用于管理客户端
如果客户端信息已经存在于数据库则使用，否则存入

```java
/**
 * 	RegisteredClientRepository 的一个实例，用于管理客户端
 *
 * @param jdbcTemplate jdbcTemplate
 * @param passwordEncoder passwordEncoder
 * @return RegisteredClientRepository
 */
@Bean
public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
    RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("oauth2-client")
            .clientSecret(passwordEncoder.encode("123456"))
            // 客户端认证基于请求头
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            // 配置授权的支持方式
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
            .redirectUri("https://www.baidu.com")
            .scope("user")
            .scope("admin")
            // 客户端设置，设置用户需要确认授权
            .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
            .build();
    JdbcRegisteredClientRepository registeredClientRepository = new JdbcRegisteredClientRepository(jdbcTemplate);
    RegisteredClient repositoryByClientId = registeredClientRepository.findByClientId(registeredClient.getClientId());
    if (repositoryByClientId == null) {
        registeredClientRepository.save(registeredClient);
    }
    return registeredClientRepository;
}
```

#### 3.3.5 配置解析JWT `access-token`的解析器
因为`spring-security-oauth2-authorization-server`默认使用JWT作为`access-token`，所以需要添加此配置
```java
/**
 * com.nimbusds.jose.jwk.source.JWKSource 的一个实例，用于签署访问令牌（access token）
 *
 * @return JWKSource
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
 * java.security.KeyPair 的一个实例，其 key 在启动时生成，用于创建上述 JWKSource。
 *
 * @return KeyPair
 */
private static KeyPair generateRsaKey() {
    KeyPair keyPair;
    try {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        keyPair = keyPairGenerator.generateKeyPair();
    }
    catch (Exception ex) {
        throw new IllegalStateException(ex);
    }
    return keyPair;
}

/**
 * JwtDecoder 的一个实例，用于解码签名访问令牌（access token）
 *
 * @param jwkSource jwkSource
 * @return JwtDecoder
 */
@Bean
public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
}
```

#### 3.3.6 `AuthorizationServerSettings`的一个实例，用于配置Spring授权服务器
此处还是走默认配置
```java
@Bean 
public AuthorizationServerSettings authorizationServerSettings() {
	return AuthorizationServerSettings.builder().build();
}
```

#### 3.3.7 配置数据源信息
```yaml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:mysql://xxx:3306/adp_bmc?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
    username: xxx
    password: xxx
```

### 3.4 启动项目
会看到`oauth2_registered_client`表写入了我们硬性配置的客户端信息

#### 3.4.1 访问`/oauth2/authorize`前往登录页面

```shell
http://127.0.0.1:8080/oauth2/authorize?client_id=oauth2-client&response_type=code&scope=user&redirect_uri=https://www.baidu.com

```

#### 3.4.2 登录成功后跳转授权页面

授权完成后，跳转了我们的认证成功回调地址

获取到授权码我们就可以访问`/oauth2/token`获取`JWT token`了

这是一篇纯基础搭建的文章，主要参考自官方文档，官方文档才是新技术的根本。

下一篇文章《spring-security-oauth2-authorization-server（二）token生成策略分析》会结合部分源码简要分析token几种生成策略。
