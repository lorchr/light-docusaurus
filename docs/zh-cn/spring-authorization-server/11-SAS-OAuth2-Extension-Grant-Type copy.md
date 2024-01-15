- [Spring Authorization Server入门 (十一) 自定义grant_type(短信认证登录)获取token](https://juejin.cn/post/7246409673565372475)

在本系列的第一篇文章# [Spring Authorization Server入门 (一) 初识SpringAuthorizationServer和OAuth2.1协议](https://juejin.cn/post/7239953874950733884)中说过，密码模式已经在OAuth2.1中被废除，但是有很多老项目也依赖于密码模式，比如自己公司内部的app、小程序等都会用到密码模式，虽然框架不支持，但是也提供了自定义grant_type的扩展方式，今天就来实现一下自定义的短信验证登录；哈哈，皮一下，看过前边文章的读者应该明白短信验证登录和密码登录区别不大，最多就是一个校验的问题，所以文章中主打的是短信验证码登录，同时也会说明账号密码登录该怎么做。

## 一、实现思路
在 [Implement an Extension Authorization Grant Type](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/guides/how-to-ext-grant-type.html) 文档中有说明如何去实现一个新的grant_type，并说明如何让他生效。

- 继承`AbstractAuthenticationToken`并定义一些属性
- 实现`AuthenticationConverter`和`AuthenticationProvider`添加逻辑处理。
- 将`AuthenticationConverter`和`AuthenticationProvider`添加至[OAuth2 Token endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-endpoint)中。实际上就是在访问`/oauth2/token`接口时会先通过`Converter`生成一个`token`，然后再由`ProviderManager`根据生成的`token`去找到对应的`Provider`进行校验，成功以后会返回一个`token`，如下。

![img](./img/11/11-1.webp)

- 通过`Converter`生成一个Token并返回。
- 根据`AbstractAuthenticationToken`生成`AccessToken`并返回。

## 二、编码前的准备
### 1. 完善`SecurityConstants`
添加短信认证`grant_type`、手机号参数`key`，验证码参数`key`和密码模式登陆的常量
```java
package com.example.constant;

/**
 * security 常量类
 *
 * @author vains
 */
public class SecurityConstants {

    /**
     * 登录方式——短信验证码
     */
    public static final String SMS_LOGIN_TYPE = "smsCaptcha";

    /**
     * 登录方式——账号密码登录
     */
    public static final String PASSWORD_LOGIN_TYPE = "passwordLogin";

    /**
     * 权限在token中的key
     */
    public static final String AUTHORITIES_KEY = "authorities";

    /**
     * 自定义 grant type —— 短信验证码
     */
    public static final String GRANT_TYPE_SMS_CODE = "urn:ietf:params:oauth:grant-type:sms_code";

    /**
     * 自定义 grant type —— 短信验证码 —— 手机号的key
     */
    public static final String OAUTH_PARAMETER_NAME_PHONE = "phone";

    /**
     * 自定义 grant type —— 短信验证码 —— 短信验证码的key
     */
    public static final String OAUTH_PARAMETER_NAME_SMS_CAPTCHA = "sms_captcha";

}
```

### 2. `SecurityUtils`类中添加公共方法
```java
package com.example.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.resource.BearerTokenError;
import org.springframework.security.oauth2.server.resource.BearerTokenErrorCodes;
import org.springframework.security.oauth2.server.resource.authentication.AbstractOAuth2TokenAuthenticationToken;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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
     * 从认证信息中获取客户端token
     *
     * @param authentication 认证信息
     * @return 客户端认证信息，获取失败抛出异常
     */
    public static OAuth2ClientAuthenticationToken getAuthenticatedClientElseThrowInvalidClient(Authentication authentication) {
        OAuth2ClientAuthenticationToken clientPrincipal = null;
        if (OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication.getPrincipal().getClass())) {
            clientPrincipal = (OAuth2ClientAuthenticationToken) authentication.getPrincipal();
        }
        if (clientPrincipal != null && clientPrincipal.isAuthenticated()) {
            return clientPrincipal;
        }
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
    }

    /**
     * 提取请求中的参数并转为一个map返回
     *
     * @param request 当前请求
     * @return 请求中的参数
     */
    public static MultiValueMap<String, String> getParameters(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        MultiValueMap<String, String> parameters = new LinkedMultiValueMap<>(parameterMap.size());
        parameterMap.forEach((key, values) -> {
            if (values.length > 0) {
                for (String value : values) {
                    parameters.add(key, value);
                }
            }
        });
        return parameters;
    }

    /**
     * 抛出 OAuth2AuthenticationException 异常
     *
     * @param errorCode 错误码
     * @param message   错误信息
     * @param errorUri  错误对照地址
     */
    public static void throwError(String errorCode, String message, String errorUri) {
        OAuth2Error error = new OAuth2Error(errorCode, message, errorUri);
        throw new OAuth2AuthenticationException(error);
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
                wwwAuthenticate.append(entry.getKey()).append("="").append(entry.getValue()).append(""");
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

### 3. 修改客户端，添加自定义`grant_type`

![img](./img/11/11-2.webp)

## 三、编码集成
### 1. 继承`AbstractAuthenticationToken`实现自己的`token`对象
在sms包下创建`SmsCaptchaGrantAuthenticationToken`类并继承`AbstractAuthenticationToken`
```java
package com.example.authorization.sms;

import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

/**
 * 自定义短信验证登录Token类
 *
 * @author vains
 */
public class SmsCaptchaGrantAuthenticationToken extends AbstractAuthenticationToken {

    /**
     * 本次登录申请的scope
     */
    private final Set<String> scopes;

    /**
     * 客户端认证信息
     */
    private final Authentication clientPrincipal;

    /**
     * 当前请求的参数
     */
    private final Map<String, Object> additionalParameters;

    /**
     * 认证方式
     */
    private final AuthorizationGrantType authorizationGrantType;
    
    public SmsCaptchaGrantAuthenticationToken(AuthorizationGrantType authorizationGrantType,
                                              Authentication clientPrincipal,
                                              @Nullable Set<String> scopes,
                                              @Nullable Map<String, Object> additionalParameters) {
        super(Collections.emptyList());
        this.scopes = scopes;
        this.clientPrincipal = clientPrincipal;
        this.additionalParameters = additionalParameters;
        this.authorizationGrantType = authorizationGrantType;
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return clientPrincipal;
    }
    
    /**
     * 返回请求的scope(s)
     *
     * @return 请求的scope(s)
     */
    public Set<String> getScopes() {
        return this.scopes;
    }
    
    /**
     * 返回请求中的authorization grant type
     *
     * @return authorization grant type
     */
    public AuthorizationGrantType getAuthorizationGrantType() {
        return this.authorizationGrantType;
    }
    
    /**
     * 返回请求中的附加参数
     *
     * @return 附加参数
     */
    public Map<String, Object> getAdditionalParameters() {
        return this.additionalParameters;
    }
    
}
```

### 2. 实现`AuthenticationConverter`构建一个`token`返回。
在sms包下创建`SmsCaptchaGrantAuthenticationConverter`并实现`AuthenticationConverter`
```java
package com.example.authorization.sms;

import com.example.constant.SecurityConstants;
import com.example.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * 短信验证码登录Token转换器
 *
 * @author vains
 */
public class SmsCaptchaGrantAuthenticationConverter implements AuthenticationConverter {

    static final String ACCESS_TOKEN_REQUEST_ERROR_URI = "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2";

    @Override
    public Authentication convert(HttpServletRequest request) {
        // grant_type (REQUIRED)
        String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
        if (!SecurityConstants.GRANT_TYPE_SMS_CODE.equals(grantType)) {
            return null;
        }

        // 这里目前是客户端认证信息
        Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

        // 获取请求中的参数
        MultiValueMap<String, String> parameters = SecurityUtils.getParameters(request);

        // scope (OPTIONAL)
        String scope = parameters.getFirst(OAuth2ParameterNames.SCOPE);
        if (StringUtils.hasText(scope) &&
                parameters.get(OAuth2ParameterNames.SCOPE).size() != 1) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "OAuth 2.0 Parameter: " + OAuth2ParameterNames.SCOPE,
                    ACCESS_TOKEN_REQUEST_ERROR_URI);
        }
        Set<String> requestedScopes = null;
        if (StringUtils.hasText(scope)) {
            requestedScopes = new HashSet<>(
                    Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
        }

        // Mobile phone number (REQUIRED)
        String username = parameters.getFirst(SecurityConstants.OAUTH_PARAMETER_NAME_PHONE);
        if (!StringUtils.hasText(username) || parameters.get(SecurityConstants.OAUTH_PARAMETER_NAME_PHONE).size() != 1) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "OAuth 2.0 Parameter: " + SecurityConstants.OAUTH_PARAMETER_NAME_PHONE,
                    ACCESS_TOKEN_REQUEST_ERROR_URI);
        }

        // SMS verification code (REQUIRED)
        String password = parameters.getFirst(SecurityConstants.OAUTH_PARAMETER_NAME_SMS_CAPTCHA);
        if (!StringUtils.hasText(password) || parameters.get(SecurityConstants.OAUTH_PARAMETER_NAME_SMS_CAPTCHA).size() != 1) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "OAuth 2.0 Parameter: " + SecurityConstants.OAUTH_PARAMETER_NAME_SMS_CAPTCHA,
                    ACCESS_TOKEN_REQUEST_ERROR_URI);
        }

        // 提取附加参数
        Map<String, Object> additionalParameters = new HashMap<>();
        parameters.forEach((key, value) -> {
            if (!key.equals(OAuth2ParameterNames.GRANT_TYPE) &&
                    !key.equals(OAuth2ParameterNames.CLIENT_ID)) {
                additionalParameters.put(key, value.get(0));
            }
        });

        // 构建AbstractAuthenticationToken子类实例并返回
        return new SmsCaptchaGrantAuthenticationToken(new AuthorizationGrantType(SecurityConstants.GRANT_TYPE_SMS_CODE), clientPrincipal, requestedScopes, additionalParameters);
    }

}
```

该类主要就是创建一个`provider`需要的`token`并返回，对请求中必要的参数做一些校验。

### 3. 实现`AuthenticationProvider`校验请求参数并创建`AccessToken`返回。
在sms包下创建`SmsCaptchaGrantAuthenticationProvider`并实现`AuthenticationProvider`

> 2023-07-15修改逻辑，加入当前用户认证信息，防止刷新token时因获取不到认证信息而抛出空指针异常
```java
package com.example.authorization.sms;

import com.example.constant.SecurityConstants;
import com.example.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.util.Assert;
import org.springframework.util.ObjectUtils;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 短信验证码登录认证提供者
 *
 * @author vains
 */
@Slf4j
public class SmsCaptchaGrantAuthenticationProvider implements AuthenticationProvider {

    private OAuth2TokenGenerator<?> tokenGenerator;

    private AuthenticationManager authenticationManager;

    private OAuth2AuthorizationService authorizationService;

    private static final String ERROR_URI = "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2";

    private static final OAuth2TokenType ID_TOKEN_TOKEN_TYPE = new OAuth2TokenType(OidcParameterNames.ID_TOKEN);

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        SmsCaptchaGrantAuthenticationToken authenticationToken = (SmsCaptchaGrantAuthenticationToken) authentication;

        // Ensure the client is authenticated
        OAuth2ClientAuthenticationToken clientPrincipal =
                SecurityUtils.getAuthenticatedClientElseThrowInvalidClient(authenticationToken);
        RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();
        // Ensure the client is configured to use this authorization grant type
        if (registeredClient == null || !registeredClient.getAuthorizationGrantTypes().contains(authenticationToken.getAuthorizationGrantType())) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT);
        }

        // 验证scope
        Set<String> authorizedScopes = getAuthorizedScopes(registeredClient, authenticationToken.getScopes());

        // 进行认证
        Authentication authenticate = getAuthenticatedUser(authenticationToken);

        // 以下内容摘抄自OAuth2AuthorizationCodeAuthenticationProvider
        DefaultOAuth2TokenContext.Builder tokenContextBuilder = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(authenticate)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizedScopes(authorizedScopes)
                .authorizationGrantType(authenticationToken.getAuthorizationGrantType())
                .authorizationGrant(authenticationToken);

        // Initialize the OAuth2Authorization
        OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                // 2023-07-15修改逻辑，加入当前用户认证信息，防止刷新token时因获取不到认证信息而抛出空指针异常
                // 存入授权scope
                .authorizedScopes(authorizedScopes)
                // 当前授权用户名称
                .principalName(authenticate.getName())
                // 设置当前用户认证信息
                .attribute(Principal.class.getName(), authenticate)
                .authorizationGrantType(authenticationToken.getAuthorizationGrantType());

        // ----- Access token -----
        OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.ACCESS_TOKEN).build();
        OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
        if (generatedAccessToken == null) {
            OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                    "The token generator failed to generate the access token.", ERROR_URI);
            throw new OAuth2AuthenticationException(error);
        }

        if (log.isTraceEnabled()) {
            log.trace("Generated access token");
        }
        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
                generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),
                generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());
        if (generatedAccessToken instanceof ClaimAccessor) {
            authorizationBuilder.token(accessToken, (metadata) ->
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims()));
        } else {
            authorizationBuilder.accessToken(accessToken);
        }
        // ----- Refresh token -----
        OAuth2RefreshToken refreshToken = null;
        if (registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN) &&
                // Do not issue refresh token to public client
                !clientPrincipal.getClientAuthenticationMethod().equals(ClientAuthenticationMethod.NONE)) {

            tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();
            OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
            if (!(generatedRefreshToken instanceof OAuth2RefreshToken)) {
                OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                        "The token generator failed to generate the refresh token.", ERROR_URI);
                throw new OAuth2AuthenticationException(error);
            }

            if (log.isTraceEnabled()) {
                log.trace("Generated refresh token");
            }
            refreshToken = (OAuth2RefreshToken) generatedRefreshToken;
            authorizationBuilder.refreshToken(refreshToken);
        }

        // ----- ID token -----
        OidcIdToken idToken;
        if (authorizedScopes.contains(OidcScopes.OPENID)) {
            tokenContext = tokenContextBuilder
                    .tokenType(ID_TOKEN_TOKEN_TYPE)
                    // ID token customizer may need access to the access token and/or refresh token
                    .authorization(authorizationBuilder.build())
                    .build();
            // @formatter:on
            OAuth2Token generatedIdToken = this.tokenGenerator.generate(tokenContext);
            if (!(generatedIdToken instanceof Jwt)) {
                OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                        "The token generator failed to generate the ID token.", ERROR_URI);
                throw new OAuth2AuthenticationException(error);
            }

            if (log.isTraceEnabled()) {
                log.trace("Generated id token");
            }

            idToken = new OidcIdToken(generatedIdToken.getTokenValue(), generatedIdToken.getIssuedAt(),
                    generatedIdToken.getExpiresAt(), ((Jwt) generatedIdToken).getClaims());
            authorizationBuilder.token(idToken, (metadata) ->
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, idToken.getClaims()));
        } else {
            idToken = null;
        }

        OAuth2Authorization authorization = authorizationBuilder.build();

        // Save the OAuth2Authorization
        this.authorizationService.save(authorization);

        Map<String, Object> additionalParameters = new HashMap<>(1);
        if (idToken != null) {
            // 放入idToken
            additionalParameters.put(OidcParameterNames.ID_TOKEN, idToken.getTokenValue());
        }

        return new OAuth2AccessTokenAuthenticationToken(registeredClient, clientPrincipal, accessToken, refreshToken, additionalParameters);
    }

    /**
     * 获取认证过的scope
     *
     * @param registeredClient 客户端
     * @param requestedScopes  请求中的scope
     * @return 认证过的scope
     */
    private Set<String> getAuthorizedScopes(RegisteredClient registeredClient, Set<String> requestedScopes) {
        // Default to configured scopes
        Set<String> authorizedScopes = registeredClient.getScopes();
        if (!ObjectUtils.isEmpty(requestedScopes)) {
            Set<String> unauthorizedScopes = requestedScopes.stream()
                    .filter(requestedScope -> !registeredClient.getScopes().contains(requestedScope))
                    .collect(Collectors.toSet());
            if (!ObjectUtils.isEmpty(unauthorizedScopes)) {
                SecurityUtils.throwError(
                        OAuth2ErrorCodes.INVALID_REQUEST,
                        "OAuth 2.0 Parameter: " + OAuth2ParameterNames.SCOPE,
                        ERROR_URI);
            }

            authorizedScopes = new LinkedHashSet<>(requestedScopes);
        }

        if (log.isTraceEnabled()) {
            log.trace("Validated token request parameters");
        }
        return authorizedScopes;
    }

    /**
     * 获取认证过的用户信息
     *
     * @param authenticationToken converter构建的认证信息，这里是包含手机号与验证码的
     * @return 认证信息
     */
    public Authentication getAuthenticatedUser(SmsCaptchaGrantAuthenticationToken authenticationToken) {
        // 获取手机号密码
        Map<String, Object> additionalParameters = authenticationToken.getAdditionalParameters();
        String phone = (String) additionalParameters.get(SecurityConstants.OAUTH_PARAMETER_NAME_PHONE);
        String smsCaptcha = (String) additionalParameters.get(SecurityConstants.OAUTH_PARAMETER_NAME_SMS_CAPTCHA);
        // 构建UsernamePasswordAuthenticationToken通过AbstractUserDetailsAuthenticationProvider及其子类对手机号与验证码进行校验
        // 这里就是我说的短信验证与密码模式区别不大，如果是短信验证模式则在SmsCaptchaLoginAuthenticationProvider中加一个校验，
        // 使框架支持手机号、验证码校验，反之不加就是账号密码登录
        UsernamePasswordAuthenticationToken unauthenticated = UsernamePasswordAuthenticationToken.unauthenticated(phone, smsCaptcha);
        Authentication authenticate = null;
        try {
            authenticate = authenticationManager.authenticate(unauthenticated);
        } catch (Exception e) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "认证失败：手机号或验证码错误.",
                    ERROR_URI
            );
        }
        return authenticate;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return SmsCaptchaGrantAuthenticationToken.class.isAssignableFrom(authentication);
    }

    public void setTokenGenerator(OAuth2TokenGenerator<?> tokenGenerator) {
        Assert.notNull(tokenGenerator, "tokenGenerator cannot be null");
        this.tokenGenerator = tokenGenerator;
    }

    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        Assert.notNull(authorizationService, "authenticationManager cannot be null");
        this.authenticationManager = authenticationManager;
    }

    public void setAuthorizationService(OAuth2AuthorizationService authorizationService) {
        Assert.notNull(authorizationService, "authorizationService cannot be null");
        this.authorizationService = authorizationService;
    }
}
```

provider类中的代码比较长，但是实际上核心代码只有下边几行，从请求参数中提取出手机号与验证码，构建一个`UsernamePasswordAuthenticationToken`，然后交由`authenticationManager`对手机号和验证码进行校验，写到这里可能有些读者会比较疑惑，为什么不自己写一个校验比较一下最开始获取的验证码与参数中传过来的验证码，这样不是方便很多吗？这里本人选择交由框架验证是因为框架在获取到用户信息后会对用户信息做一些校验，比如：账号是否锁定，是否过期、是否启用等，都会做一个校验，这样我们的`userService`中基本只需要查出来用户信息返回即可。当然，让`SmsCaptchaLoginAuthenticationProvider`支持自定义`grant_type`需要另加判断，稍后我会给出示例。

![img](./img/11/11-3.webp)

这里使用`try catch`捕获后抛出`OAuth2AuthenticationException`不是脱裤子放屁啊， 是为了让`/oauth2/token`接口可以获取具体异常然后写回json，如下

![img](./img/11/11-4.webp)

![img](./img/11/11-5.webp)

![img](./img/11/11-6.webp)

可以看到，最后是写回了异常信息，如果不自己手动抛出异常则会被`AbstractAuthenticationProcessingFilter`处理，最终响应一个登陆页面。

### 4. 注意，到这里如果不在`SmsCaptchaLoginAuthenticationProvider`另做处理就是一个自定义的密码模式了，密码模式已经完成了。

### 5. 修改`SmsCaptchaLoginAuthenticationProvider`使其支持自定义`grant_type`
判断中添加`Objects.equals(grantType, SecurityConstants.GRANT_TYPE_SMS_CODE)`条件，如果读者是第一次看到该文章不想要图形验证码校验，请直接继承`DaoAuthenticationProvider`，然后重写`additionalAuthenticationChecks`方法，在里边添加短信验证码逻辑；重写构造方法，设置`passwordEncoder`和`userDetailsService`。但是强烈建议读者去看一下本系列的[Spring Authorization Server入门 (十) 添加短信验证码方式登录](https://juejin.cn/post/7245538214114492474)和[Spring Authorization Server入门 (七) 登录添加图形验证码](https://juejin.cn/post/7242476048005709879)。

```java
package com.example.authorization.sms;

import com.example.authorization.captcha.CaptchaAuthenticationProvider;
import com.example.constant.SecurityConstants;
import com.example.exception.InvalidCaptchaException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

/**
 * 短信验证码校验实现
 *
 * @author vains
 */
@Slf4j
@Component
public class SmsCaptchaLoginAuthenticationProvider extends CaptchaAuthenticationProvider {

    /**
     * 利用构造方法在通过{@link Component}注解初始化时
     * 注入UserDetailsService和passwordEncoder，然后
     * 设置调用父类关于这两个属性的set方法设置进去
     *
     * @param userDetailsService 用户服务，给框架提供用户信息
     * @param passwordEncoder    密码解析器，用于加密和校验密码
     */
    public SmsCaptchaLoginAuthenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        super(userDetailsService, passwordEncoder);
    }

    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        log.info("Authenticate sms captcha...");

        if (authentication.getCredentials() == null) {
            this.logger.debug("Failed to authenticate since no credentials provided");
            throw new BadCredentialsException("The sms captcha cannot be empty.");
        }

        // 获取当前request
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes == null) {
            throw new InvalidCaptchaException("Failed to get the current request.");
        }
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();

        // 获取当前登录方式
        String loginType = request.getParameter("loginType");
        // 获取grant_type
        String grantType = request.getParameter("grant_type");
        // 短信登录和自定义短信认证grant type会走下方认证
        // 如果是自定义密码模式则下方的认证判断只要判断下loginType即可
        // if (Objects.equals(loginType, SecurityConstants.SMS_LOGIN_TYPE)) {}
        if (Objects.equals(loginType, SecurityConstants.SMS_LOGIN_TYPE)
            || Objects.equals(grantType, SecurityConstants.GRANT_TYPE_SMS_CODE)) {
            // 获取存入session的验证码(UsernamePasswordAuthenticationToken的principal中现在存入的是手机号)
            String smsCaptcha = (String) request.getSession(Boolean.FALSE).getAttribute((String) authentication.getPrincipal());
            // 校验输入的验证码是否正确(UsernamePasswordAuthenticationToken的credentials中现在存入的是输入的验证码)
            if (!Objects.equals(smsCaptcha, authentication.getCredentials())) {
                throw new BadCredentialsException("The sms captcha is incorrect.");
            }
        // 在这里也可以拓展其它登录方式，比如邮箱登录什么的
        } else {
            log.info("Not sms captcha loginType, exit.");
            // 其它调用父类默认实现的密码方式登录
            super.additionalAuthenticationChecks(userDetails, authentication);
        }

        log.info("Authenticated sms captcha.");
    }
}
```

### 6. 配置`AuthorizationConfig`，将`converter`和`provider`添加至端点内
详情请看最后几行的注释
```java
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

    // 自定义短信认证登录转换器
    SmsCaptchaGrantAuthenticationConverter converter = new SmsCaptchaGrantAuthenticationConverter();
    // 自定义短信认证登录认证提供
    SmsCaptchaGrantAuthenticationProvider provider = new SmsCaptchaGrantAuthenticationProvider();
    http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
            // 让认证服务器元数据中有自定义的认证方式
            .authorizationServerMetadataEndpoint(metadata -> metadata.authorizationServerMetadataCustomizer(customizer -> customizer.grantType(SecurityConstants.GRANT_TYPE_SMS_CODE)))
            // 添加自定义grant_type——短信认证登录
            .tokenEndpoint(tokenEndpoint -> tokenEndpoint
                    .accessTokenRequestConverter(converter)
                    .authenticationProvider(provider));

    DefaultSecurityFilterChain build = http.build();

    // 从框架中获取provider中所需的bean
    OAuth2TokenGenerator<?> tokenGenerator = http.getSharedObject(OAuth2TokenGenerator.class);
    AuthenticationManager authenticationManager = http.getSharedObject(AuthenticationManager.class);
    OAuth2AuthorizationService authorizationService = http.getSharedObject(OAuth2AuthorizationService.class);
    // 以上三个bean在build()方法之后调用是因为调用build方法时框架会尝试获取这些类，
    // 如果获取不到则初始化一个实例放入SharedObject中，所以要在build方法调用之后获取
    // 在通过set方法设置进provider中，但是如果在build方法之后调用authenticationProvider(provider)
    // 框架会提示unsupported_grant_type，因为已经初始化完了，在添加就不会生效了
    provider.setTokenGenerator(tokenGenerator);
    provider.setAuthorizationService(authorizationService);
    provider.setAuthenticationManager(authenticationManager);

    return build;
}
```

让认证服务器元数据中有自定义的认证方式这个配置是为了访问`/.well-known/oauth-authorization-server`时返回的元数据中有咱们自定的`grant type`

### 7. 修改`CaptchaAuthenticationProvider`类的判断，修改为“不是登录页面的账号密码登录不处理”(可选)
如果自定义的 `grant type` 模式也需要校验图形验证码的可以不修改，忽略本条（本人这里修改是因为使用postman测试，为了方便直接屏蔽了）
```java
package com.example.authorization.captcha;

import com.example.constant.SecurityConstants;
import com.example.exception.InvalidCaptchaException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

/**
 * 验证码校验
 * 注入ioc中替换原先的DaoAuthenticationProvider
 * 在authenticate方法中添加校验验证码的逻辑
 * 最后调用父类的authenticate方法并返回
 *
 * @author vains
 */
@Slf4j
public class CaptchaAuthenticationProvider extends DaoAuthenticationProvider {

    /**
     * 利用构造方法在通过{@link Component}注解初始化时
     * 注入UserDetailsService和passwordEncoder，然后
     * 设置调用父类关于这两个属性的set方法设置进去
     *
     * @param userDetailsService 用户服务，给框架提供用户信息
     * @param passwordEncoder    密码解析器，用于加密和校验密码
     */
    public CaptchaAuthenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        super.setPasswordEncoder(passwordEncoder);
        super.setUserDetailsService(userDetailsService);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        log.info("Authenticate captcha...");

        // 获取当前request
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes == null) {
            throw new InvalidCaptchaException("Failed to get the current request.");
        }
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();

        // 获取当前登录方式
        String loginType = request.getParameter("loginType");
        if (!Objects.equals(loginType, SecurityConstants.PASSWORD_LOGIN_TYPE)) {
            // 只要不是密码登录都不需要校验图形验证码
            log.info("It isn't necessary captcha authenticate.");
            return super.authenticate(authentication);
        }

        // 获取参数中的验证码
        String code = request.getParameter("code");
        if (ObjectUtils.isEmpty(code)) {
            throw new InvalidCaptchaException("The captcha cannot be empty.");
        }

        // 获取session中存储的验证码
        Object sessionCaptcha = request.getSession(Boolean.FALSE).getAttribute("captcha");
        if (sessionCaptcha instanceof String sessionCode) {
            if (!sessionCode.equalsIgnoreCase(code)) {
                throw new InvalidCaptchaException("The captcha is incorrect.");
            }
        } else {
            throw new InvalidCaptchaException("The captcha is abnormal. Obtain it again.");
        }

        log.info("Captcha authenticated.");
        return super.authenticate(authentication);
    }
}
```

## 四、测试
### 1. 在postman中请求`/getSmsCaptcha`接口
因为这里是通过`session`设置的验证码，所以设置了一下cookie

![img](./img/11/11-7.webp)

### 2. 组装参数请求/oauth2/token接口
请求示例
```shell
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic bWVzc2FnaW5nLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --header 'Cookie: JSESSIONID=FE40DC96D384EE92DB3A48A3CA0B975A' \
    --data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:sms_code' \
    --data-urlencode 'phone=admin' \
    --data-urlencode 'sms_captcha=123' \
    --data-urlencode 'scope=message.write'
```

要记得添加basic请求头

![img](./img/11/11-8.webp)

可以看到接口成功返回access_token、refresh_token和id_token。

### 3. 输入一个未配置的scope

![img](./img/11/11-9.webp)

提示异常。

### 4. 错误验证码

![img](./img/11/11-10.webp)

提示异常。

## 写在最后
本文内容较多，代码贴的也比较多，在写文章的时候改了挺多次代码，如果有逻辑错误或者错误代码请求在评论区留言，有什么疑惑也可在评论区留言，我会尽量去解决大家的问题。

代码已提交至Gitee：https://gitee.com/vains-Sofia/authorization-example

其中`custom_grant_type`分支是本文章涉及到的代码，大家可以查看一下变动记录看看改了哪些文件，现在都已经通过PR的方式合并到主分支了。`custom_grant_type`现在还保留着。
