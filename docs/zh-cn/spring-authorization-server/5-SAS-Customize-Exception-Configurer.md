- [Spring Authorization Server入门 (五) 自定义异常响应配置](https://juejin.cn/post/7241439405970063416)

## 一、前言
在第三章的时候就有提到过响应信息的问题，按照oauth协议，异常信息放在响应头中，响应头的key是`WWW-Authenticate`，通常来说返回一个JSON字符串可以让开发者更方便的对响应做出一些处理，那么本篇文章就实现一下权限不足与未登录时的自定义处理。

## 二、代码实现并添加至配置中
有三种写法实现
1. 实现`AuthenticationEntryPoint`和`AccessDeniedHandler` 或他们的子类，并将其实例添加至框架中

![img](./img/5/5-1.awebp)

2. 在需要的地方通过一个匿名类来实现自定义处理

![img](./img/5/5-2.awebp)

3. 写一个工具方法，通过`Method references`的方式引用

![img](./img/5/5-3.awebp)

三种方式的核心都是实现并重写核心方法，看个人喜好选择对应的写法。

这里本人选择第三种，并根据未登录和权限不足的默认实现将他们整合在一起，实现未登录和权限不足可以通过一个方法处理

## 三、在util包下创建`SecurityUtils`工具类，并实现`exceptionHandler`公共静态方法
`SecurityUtils.java`内容如下
```java
package com.example.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.server.resource.BearerTokenError;
import org.springframework.security.oauth2.server.resource.BearerTokenErrorCodes;
import org.springframework.security.oauth2.server.resource.authentication.AbstractOAuth2TokenAuthenticationToken;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 认证鉴权工具
 *
 * @author vains
 */
@Slf4j
public class SecurityUtils {

    private SecurityUtils() {
        // 禁止实例化工具类
        throw new UnsupportedOperationException("Utility classes cannot be instantiated.");
    }

    /**
     * 认证与鉴权失败回调
     *
     * @param request  当前请求
     * @param response 当前响应
     * @param e        具体的异常信息
     */
    public static void exceptionHandler(HttpServletRequest request, HttpServletResponse response, Throwable e) {
        Map<String, String> parameters = getErrorParameter(request, response, e);
        String wwwAuthenticate = computeWwwAuthenticateHeaderValue(parameters);
        response.addHeader(HttpHeaders.WWW_AUTHENTICATE, wwwAuthenticate);
        try {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(JsonUtils.objectCovertToJson(parameters));
            response.getWriter().flush();
        } catch (IOException ex) {
            log.error("写回错误信息失败", e);
        }
    }

    /**
     * 获取异常信息map
     *
     * @param request  当前请求
     * @param response 当前响应
     * @param e        本次异常具体的异常实例
     * @return 异常信息map
     */
    private static Map<String, String> getErrorParameter(HttpServletRequest request, HttpServletResponse response, Throwable e) {
        Map<String, String> parameters = new LinkedHashMap<>();
        if (request.getUserPrincipal() instanceof AbstractOAuth2TokenAuthenticationToken) {
            // 权限不足
            parameters.put("error", BearerTokenErrorCodes.INSUFFICIENT_SCOPE);
            parameters.put("error_description",
                    "The request requires higher privileges than provided by the access token.");
            parameters.put("error_uri", "https://tools.ietf.org/html/rfc6750#section-3.1");
            response.setStatus(HttpStatus.FORBIDDEN.value());
        }
        if (e instanceof OAuth2AuthenticationException authenticationException) {
            // jwt异常，e.g. jwt超过有效期、jwt无效等
            OAuth2Error error = authenticationException.getError();
            parameters.put("error", error.getErrorCode());
            if (StringUtils.hasText(error.getUri())) {
                parameters.put("error_uri", error.getUri());
            }
            if (StringUtils.hasText(error.getDescription())) {
                parameters.put("error_description", error.getDescription());
            }
            if (error instanceof BearerTokenError bearerTokenError) {
                if (StringUtils.hasText(bearerTokenError.getScope())) {
                    parameters.put("scope", bearerTokenError.getScope());
                }
                response.setStatus(bearerTokenError.getHttpStatus().value());
            }
        }
        if (e instanceof InsufficientAuthenticationException) {
            // 没有携带jwt访问接口，没有客户端认证信息
            parameters.put("error", BearerTokenErrorCodes.INVALID_TOKEN);
            parameters.put("error_description", "Not authorized.");
            parameters.put("error_uri", "https://tools.ietf.org/html/rfc6750#section-3.1");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
        }
        parameters.put("message", e.getMessage());
        return parameters;
    }

    /**
     * 生成放入请求头的错误信息
     *
     * @param parameters 参数
     * @return 字符串
     */
    public static String computeWwwAuthenticateHeaderValue(Map<String, String> parameters) {
        StringBuilder wwwAuthenticate = new StringBuilder();
        wwwAuthenticate.append("Bearer");
        if (!parameters.isEmpty()) {
            wwwAuthenticate.append(" ");
            int i = 0;
            for (Map.Entry<String, String> entry : parameters.entrySet()) {
                wwwAuthenticate.append(entry.getKey()).append("=\"").append(entry.getValue()).append("\"");
                if (i != parameters.size() - 1) {
                    wwwAuthenticate.append(", ");
                }
                i++;
            }
        }
        return wwwAuthenticate.toString();
    }
}
```

类中引用的工具类`JsonUtils.java`内容如下
```java
package com.example.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;

/**
 * <p>
 *  JSON与对象互转帮助类
 * </p>
 *
 * @author vains
 * @since 2020-11-10
 */
@Slf4j
public class JsonUtils {

    private JsonUtils() {
        // 禁止实例化工具类
        throw new UnsupportedOperationException("Utility classes cannot be instantiated.");
    }

    private final static ObjectMapper MAPPER = new ObjectMapper();

    static {
        // 对象的所有字段全部列入，还是其他的选项，可以忽略null等
        MAPPER.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        // 取消默认的时间转换为timeStamp格式
        MAPPER.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        // 设置Date类型的序列化及反序列化格式
        MAPPER.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        // 忽略空Bean转json的错误
        MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        // 忽略未知属性，防止json字符串中存在，java对象中不存在对应属性的情况出现错误
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * json字符串转为对象
     * @param json json
     * @param clazz T类的class文件
     * @param <T> 泛型, 代表返回参数的类型
     * @return 返回T的实例
     */
    public static <T> T jsonCovertToObject(String json, Class<T> clazz) {
        if (json == null || clazz == null) {
            return null;
        }
        try {
            return MAPPER.readValue(json, clazz);
        } catch (IOException e) {
            log.error("json转换失败,原因:", e);
        }
        return null;
    }

    /**
     * json字符串转为对象
     * @param json json
     * @param type 对象在Jackson中的类型
     * @param <T> 泛型, 代表返回参数的类型
     * @return 返回T的实例
     */
    public static <T> T jsonCovertToObject(String json, TypeReference<T> type) {
        if (json == null || type == null) {
            return null;
        }
        try {
            return MAPPER.readValue(json, type);
        } catch (IOException e) {
            log.error("json转换失败,原因:", e);
        }
        return null;
    }

    /**
     * 将流中的数据转为java对象
     * @param inputStream 输入流
     * @param clazz 类的class
     * @param <T> 泛型, 代表返回参数的类型
     * @return 返回对象 如果参数任意一个为 null则返回null
     */
    public static <T> T covertStreamToObject(InputStream inputStream, Class<T> clazz) {
        if (inputStream == null || clazz == null) {
            return null;
        }
        try {
            return MAPPER.readValue(inputStream, clazz);
        } catch (IOException e) {
            log.error("json转换失败,原因:", e);
        }
        return null;
    }

    /**
     * json字符串转为复杂类型List
     * @param json json
     * @param collectionClazz 集合的class
     * @param elementsClazz 集合中泛型的class
     * @param <T> 泛型, 代表返回参数的类型
     * @return 返回T的实例
     */
    public static <T> T jsonCovertToObject(String json, Class<?> collectionClazz, Class<?> ... elementsClazz) {
        if (json == null || collectionClazz == null || elementsClazz == null) {
            return null;
        }
        try {
            JavaType javaType = MAPPER.getTypeFactory().constructParametricType(collectionClazz, elementsClazz);
            return MAPPER.readValue(json, javaType);
        } catch (IOException e) {
            log.error("json转换失败,原因:", e);
        }
        return null;
    }

    /**
     * 对象转为json字符串
     * @param o 将要转化的对象
     * @return 返回json字符串
     */
    public static String objectCovertToJson(Object o) {
        if (o == null) {
            return null;
        }
        try {
            return o instanceof String ? (String) o : MAPPER.writeValueAsString(o);
        } catch (IOException e) {
            log.error("json转换失败,原因:", e);
        }
        return null;
    }

    /**
     * 将对象转为另一个对象
     *      切记,两个对象结构要一致
     *      多用于Object转为具体的对象
     * @param o 将要转化的对象
     * @param collectionClazz 集合的class
     * @param elementsClazz 集合中泛型的class
     * @param <T> 泛型, 代表返回参数的类型
     * @return 返回T的实例
     */
    public static  <T> T objectCovertToObject(Object o, Class<?> collectionClazz, Class<?>... elementsClazz) {
        String json = objectCovertToJson(o);
        return jsonCovertToObject(json, collectionClazz, elementsClazz);
    }

}
```

添加完这两个类之后在认证相关的过滤器链中将处理异常的实现配置进去。如下
```java
// 添加BearerTokenAuthenticationFilter，将认证服务当做一个资源服务，解析请求头中的token
http.oauth2ResourceServer((resourceServer) -> resourceServer
        .jwt(Customizer.withDefaults())
        .accessDeniedHandler(SecurityUtils::exceptionHandler)
        .authenticationEntryPoint(SecurityUtils::exceptionHandler)
);
```

到这里自定义的处理就配置完成了，为避免介绍的过于抽象而造成各位读者思维混乱，接下来先放一下完整的`AuthorizationConfig.java`类，并贴一下项目结构图
```java
package com.example.config;

import com.example.authorization.DeviceClientAuthenticationConverter;
import com.example.authorization.DeviceClientAuthenticationProvider;
import com.example.util.SecurityUtils;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * 认证配置
 * {@link EnableMethodSecurity} 开启全局方法认证，启用JSR250注解支持，启用注解 {@link Secured} 支持，
 * 在Spring Security 6.0版本中将@Configuration注解从@EnableWebSecurity, @EnableMethodSecurity, @EnableGlobalMethodSecurity
 * 和 @EnableGlobalAuthentication 中移除，使用这些注解需手动添加 @Configuration 注解
 * {@link EnableWebSecurity} 注解有两个作用:
 * 1. 加载了WebSecurityConfiguration配置类, 配置安全认证策略。
 * 2. 加载了AuthenticationConfiguration, 配置了认证信息。
 *
 * @author vains
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class AuthorizationConfig {

    private static final String CUSTOM_CONSENT_PAGE_URI = "/oauth2/consent";

    /**
     * 配置端点的过滤器链
     *
     * @param http spring security核心配置类
     * @return 过滤器链
     * @throws Exception 抛出
     */
    @Bean
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http,
                                                                      RegisteredClientRepository registeredClientRepository,
                                                                      AuthorizationServerSettings authorizationServerSettings) throws Exception {
        // 配置默认的设置，忽略认证端点的csrf校验
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        // 新建设备码converter和provider
        DeviceClientAuthenticationConverter deviceClientAuthenticationConverter =
                new DeviceClientAuthenticationConverter(
                        authorizationServerSettings.getDeviceAuthorizationEndpoint());
        DeviceClientAuthenticationProvider deviceClientAuthenticationProvider =
                new DeviceClientAuthenticationProvider(registeredClientRepository);


        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                // 开启OpenID Connect 1.0协议相关端点
                .oidc(Customizer.withDefaults())
                // 设置自定义用户确认授权页
                .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint.consentPage(CUSTOM_CONSENT_PAGE_URI))
                // 设置设备码用户验证url(自定义用户验证页)
                .deviceAuthorizationEndpoint(deviceAuthorizationEndpoint ->
                        deviceAuthorizationEndpoint.verificationUri("/activate")
                )
                // 设置验证设备码用户确认页面
                .deviceVerificationEndpoint(deviceVerificationEndpoint ->
                        deviceVerificationEndpoint.consentPage(CUSTOM_CONSENT_PAGE_URI)
                )
                .clientAuthentication(clientAuthentication ->
                        // 客户端认证添加设备码的converter和provider
                        clientAuthentication
                                .authenticationConverter(deviceClientAuthenticationConverter)
                                .authenticationProvider(deviceClientAuthenticationProvider)
                );
        http
                // 当未登录时访问认证端点时重定向至login页面
                .exceptionHandling((exceptions) -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint("/login"),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                        )
                )
                // 处理使用access token访问用户信息端点和客户端注册端点
                .oauth2ResourceServer((resourceServer) -> resourceServer
                        .jwt(Customizer.withDefaults()));

        return http.build();
    }

    /**
     * 配置认证相关的过滤器链
     *
     * @param http spring security核心配置类
     * @return 过滤器链
     * @throws Exception 抛出
     */
    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authorize) -> authorize
                        // 放行静态资源
                        .requestMatchers("/assets/**", "/webjars/**", "/login").permitAll()
                        .anyRequest().authenticated()
                )
                // 指定登录页面
                .formLogin(formLogin ->
                        formLogin.loginPage("/login")
                );
        // 添加BearerTokenAuthenticationFilter，将认证服务当做一个资源服务，解析请求头中的token
        http.oauth2ResourceServer((resourceServer) -> resourceServer
                .jwt(Customizer.withDefaults())
                .accessDeniedHandler(SecurityUtils::exceptionHandler)
                .authenticationEntryPoint(SecurityUtils::exceptionHandler)
        );

        return http.build();
    }

    /**
     * 配置密码解析器，使用BCrypt的方式对密码进行加密和验证
     *
     * @return BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 配置客户端Repository
     *
     * @param jdbcTemplate    db 数据源信息
     * @param passwordEncoder 密码解析器
     * @return 基于数据库的repository
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                // 客户端id
                .clientId("messaging-client")
                // 客户端秘钥，使用密码解析器加密
                .clientSecret(passwordEncoder.encode("123456"))
                // 客户端认证方式，基于请求头的认证
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                // 配置资源服务器使用该客户端获取授权时支持的方式
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                // 授权码模式回调地址，oauth2.1已改为精准匹配，不能只设置域名，并且屏蔽了localhost，本机使用127.0.0.1访问
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc")
                .redirectUri("https://www.baidu.com")
                // 该客户端的授权范围，OPENID与PROFILE是IdToken的scope，获取授权时请求OPENID的scope时认证服务会返回IdToken
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                // 自定scope
                .scope("message.read")
                .scope("message.write")
                // 客户端设置，设置用户需要确认授权
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        // 基于db存储客户端，还有一个基于内存的实现 InMemoryRegisteredClientRepository
        JdbcRegisteredClientRepository registeredClientRepository = new JdbcRegisteredClientRepository(jdbcTemplate);

        // 初始化客户端
        RegisteredClient repositoryByClientId = registeredClientRepository.findByClientId(registeredClient.getClientId());
        if (repositoryByClientId == null) {
            registeredClientRepository.save(registeredClient);
        }
        // 设备码授权客户端
        RegisteredClient deviceClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("device-message-client")
                // 公共客户端
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                // 设备码授权
                .authorizationGrantType(AuthorizationGrantType.DEVICE_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 自定scope
                .scope("message.read")
                .scope("message.write")
                .build();
        RegisteredClient byClientId = registeredClientRepository.findByClientId(deviceClient.getClientId());
        if (byClientId == null) {
            registeredClientRepository.save(deviceClient);
        }

        // PKCE客户端
        RegisteredClient pkceClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("pkce-message-client")
                // 公共客户端
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                // 授权码模式，因为是扩展授权码流程，所以流程还是授权码的流程，改变的只是参数
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 授权码模式回调地址，oauth2.1已改为精准匹配，不能只设置域名，并且屏蔽了localhost，本机使用127.0.0.1访问
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc")
                .clientSettings(ClientSettings.builder().requireProofKey(Boolean.TRUE).build())
                // 自定scope
                .scope("message.read")
                .scope("message.write")
                .build();
        RegisteredClient findPkceClient = registeredClientRepository.findByClientId(pkceClient.getClientId());
        if (findPkceClient == null) {
            registeredClientRepository.save(pkceClient);
        }
        return registeredClientRepository;
    }

    /**
     * 配置基于db的oauth2的授权管理服务
     *
     * @param jdbcTemplate               db数据源信息
     * @param registeredClientRepository 上边注入的客户端repository
     * @return JdbcOAuth2AuthorizationService
     */
    @Bean
    public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate, RegisteredClientRepository registeredClientRepository) {
        // 基于db的oauth2认证服务，还有一个基于内存的服务实现InMemoryOAuth2AuthorizationService
        return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
    }

    /**
     * 配置基于db的授权确认管理服务
     *
     * @param jdbcTemplate               db数据源信息
     * @param registeredClientRepository 客户端repository
     * @return JdbcOAuth2AuthorizationConsentService
     */
    @Bean
    public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate, RegisteredClientRepository registeredClientRepository) {
        // 基于db的授权确认管理服务，还有一个基于内存的服务实现InMemoryOAuth2AuthorizationConsentService
        return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
    }

    /**
     * 配置jwk源，使用非对称加密，公开用于检索匹配指定选择器的JWK的方法
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
     * 生成rsa密钥对，提供给jwk
     *
     * @return 密钥对
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
     * 配置jwt解析器
     *
     * @param jwkSource jwk源
     * @return JwtDecoder
     */
    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    /**
     * 添加认证服务器配置，设置jwt签发者、默认端点请求地址等
     *
     * @return AuthorizationServerSettings
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder().build();
    }

    /**
     * 先暂时配置一个基于内存的用户，框架在用户认证时会默认调用
     * {@link UserDetailsService#loadUserByUsername(String)} 方法根据
     * 账号查询用户信息，一般是重写该方法实现自己的逻辑
     *
     * @param passwordEncoder 密码解析器
     * @return UserDetailsService
     */
    @Bean
    public UserDetailsService users(PasswordEncoder passwordEncoder) {
        UserDetails user = User.withUsername("admin")
                .password(passwordEncoder.encode("123456"))
                .roles("admin", "normal", "unAuthentication")
                .authorities("app", "web", "/test2", "/test3")
                .build();
        return new InMemoryUserDetailsManager(user);
    }

}
```

项目结构图

## 四、测试
配置完成后就带大家测试下看看。

### 1. 不携带token访问接口

![img](./img/5/5-4.awebp)

从图中可以看出接口响应了JSON字符串，并且http状态码是401未登录。

### 2. 携带异常token访问

![img](./img/5/5-5.awebp)

响应了JSON字符串并且给出错误原因

### 3. 请求接口权限不足
```java
@GetMapping("/test02")
@PreAuthorize("hasAuthority('SCOPE_message.write')")
public String test02() {
    return "test02";
}
```

测试接口中添加一个需要`message.write`写的权限的接口
申请一个scope为`message.read`的access token分别访问这两个接口，查看对比

### 4. 访问test02接口

![img](./img/5/5-6.awebp)

响应json并正确提示异常原因，响应状态码为403权限不足。

### 5. 访问test01

![img](./img/5/5-7.awebp)

可以看到通过鉴权并正常响应。

### 6. 浏览器中直接访问test01接口
浏览器会直接重定向至登录页面

![img](./img/5/5-8.awebp)

登录后响应权限不足json

![img](./img/5/5-9.awebp)

其实这里完全可以模仿未登录处理配置，在`http.exceptionHandling`中配置`defaultAccessDeniedHandlerFor`，配置一个只在浏览器请求并且权限不足时跳转的页面。这里大家自行扩展就好。

到此编码与测试部分结束，剩下的就是理论了。

## 五、默认异常响应介绍
### 1. 未登录 `AuthenticationEntryPoint`

![img](./img/5/5-10.awebp)

通过源码可以看出，如果要定义自己的处理则需要实现该接口，并重写`commence`方法，`ExceptionTranslationFilter`中会调用`commence`方法来对未登录的请求进行处理。
### 2. `LoginUrlAuthenticationEntryPoint`
通过右侧继承类图可以看到框架有一些默认的实现，首先是`LoginUrlAuthenticationEntryPoint`，这个是认证服务器的默认实现，在配置认证服务器时什么自定义处理都不加的情况下，在浏览器访问一个访问受限的接口时会通过该类跳转至登录接口，可能有读者会觉得这个类比较眼熟，因为在第二篇文章中配置基础的认证服务器时通过http.exceptionHandling添加了该类的配置，如下
```java
http
    // 当未登录时访问认证端点时重定向至login页面
    .exceptionHandling((exceptions) -> exceptions
        .defaultAuthenticationEntryPointFor(
            new LoginUrlAuthenticationEntryPoint("/login"),
            new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
        )
    )
```

这段代码的意思是所有来自页面的请求都由`LoginUrlAuthenticationEntryPoint`来处理。

### 3. `BearerTokenAuthenticationEntryPoint`
`BearerTokenAuthenticationEntryPoint`是资源服务器默认的未登录异常(未携带token)，还是第二章的基础认证服务器配置中，在认证相关的过滤器链中添加了如下配置
```java
// 添加BearerTokenAuthenticationFilter，将认证服务当做一个资源服务，解析请求头中的token
http.oauth2ResourceServer((resourceServer) -> resourceServer
        .jwt(Customizer.withDefaults()));
```

上边的`LoginUrlAuthenticationEntryPoint`是处理所有来自页面的请求，这里就是处理所有非页面的请求。稍后后边会讲到为什么。

### 4. 权限不足 `AccessDeniedHandler`

![img](./img/5/5-11.awebp)

AccessDeniedHandler跟AuthenticationEntryPoint差不多的，框架都有提供默认实现，resource server的`BearerTokenAccessDeniedHandler`和Spring Security的`AccessDeniedHandlerImpl`，要实现自定义内容时同样是实现接口并重写handle方法。

### 5. `BearerTokenAccessDeniedHandler`

![img](./img/5/5-12.awebp)

访问资源服务器时如果获取授权的scope权限不足时会通过该类去处理，该类会将http响应码设置为403，并根据[RFC 6750 Section](https://datatracker.ietf.org/doc/html/rfc6750#section-3)的提案将错误信息放入响应头中。

### 6. `AccessDeniedHandlerImpl`

![img](./img/5/5-13.awebp)

默认的权限不足处理类根据源码来看就是如果配置类权限不足页面则会跳转至权限不足页面，如果没有配置则设置http响应码为403返回。

## 六、框架怎么在我未登录的情况下知道是重定向至登录页面还是返回一个json提醒我未登录
未登录和权限不足父接口中都提到了在`ExceptionTranslationFilter`中被调用，就在该过滤器中看一下逻辑，打个端点，看看请求经过的过程，发现异常处理是第147行的`handleSpringSecurityException`方法处理。

![img](./img/5/5-14.awebp)

追踪实现后会在219行看到具体的未登录处理，打个断点看看是怎么处理的

![img](./img/5/5-15.awebp)

首先先在浏览器发起一个请求
断点进入实现发现是一个`EntryPoint`委托类，内部实现逻辑是请求类型来提供不同的`entryPoint`来处理

![img](./img/5/5-16.awebp)

接下来一起看一下`this.entryPoints`中的结构

![img](./img/5/5-17.awebp)

可以看到会根据请求的`mediaType`判断，通过浏览器发出的请求肯定会携带`accept : text/html`的请求头，所以可以根据这个来判断是否为浏览器发出的请求。

`this.entryPoints`是从构造方法中初始化的，为了更好理解，我们看一下实例化这个委托类的地方。

![img](./img/5/5-18.awebp)

可以看到在`ExceptionHandlingConfigurer`中实例化委托类并且传入了`this.defaultEntryPointMappings`。再来看下`this.defaultEntryPointMappings`又是在什么地方赋值的。

![img](./img/5/5-19.awebp)

看到这个方法相信各位读者应该有些眼熟，就是前边设置跳转至登录页的地方，并限制只能浏览器的请求可会转发至登录页

![img](./img/5/5-20.awebp)

到这里就知道了在浏览器发起请求为什么会跳转至登录页面而不是像postman中一样返回一个JSON，继续追踪，看看框架默认的设置

![img](./img/5/5-21.awebp)

可以看到框架添加了一个针对非浏览器发出的请求的处理，继续追踪看看`this.authenticationEntryPoint`是从哪里来的

![img](./img/5/5-22.awebp)

可以看到，在认证相关的过滤器链中调用了该方法，重新设置了`this.authenticationEntryPoint`；至此也明白了为什么在postman中请求返回json。

## 七、总结
本篇文章实现自定义的异常响应配置，并通过断点反查了一下配置生效的过程，粗略的说明了一下security对于异常处理的逻辑。
文章内容比较杂，写的比较乱，如果有发现什么问题请在评论区指出，谢谢。
