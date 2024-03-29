- [[认证 & 授权] 1. OAuth2授权 ](https://www.cnblogs.com/linianhui/p/oauth2-authorization.html)

- [在OAuth2授权流程中实现联合身份认证](https://cloud.tencent.com/developer/article/2134895)
- [Spring OAuth2（5） - 基于LDAP验证用户](https://segmentfault.com/a/1190000039911540)

## 一、前言

## 二、分析

## 三、编码

### 1. LdapGrantAuthenticationToken

```java
package com.light.sas.authorization.ldap;

import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * 自定义LDAP登录Token类
 */
public class LdapGrantAuthenticationToken extends AbstractAuthenticationToken {

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

    public LdapGrantAuthenticationToken(AuthorizationGrantType authorizationGrantType,
                                        Authentication clientPrincipal,
                                        @Nullable Set<String> scopes,
                                        @Nullable Map<String, Object> additionalParameters) {
        super(Collections.emptyList());
        this.scopes = Collections.unmodifiableSet(
                scopes != null ?
                        new HashSet<>(scopes) :
                        Collections.emptySet());
        this.clientPrincipal = clientPrincipal;
        this.additionalParameters = Collections.unmodifiableMap(
                additionalParameters != null ?
                        new HashMap<>(additionalParameters) :
                        Collections.emptyMap());
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

### 2. LdapGrantAuthenticationConverter

```java
package com.light.sas.authorization.ldap;

import com.light.sas.constant.LdapParameterNames;
import com.light.sas.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * LDAP登录Token转换器
 */
public class LdapGrantAuthenticationConverter implements AuthenticationConverter {

    static final String ACCESS_TOKEN_REQUEST_ERROR_URI = "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2";

    @Override
    public Authentication convert(HttpServletRequest request) {
        // grant_type (REQUIRED)
        String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
        if (!LdapParameterNames.GRANT_TYPE_LDAP.equals(grantType)) {
            return null;
        }

        // 这里目前是客户端认证信息
        Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

        // 获取请求中的参数
        MultiValueMap<String, String> parameters = SecurityUtils.getFormParameters(request);

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
        String username = parameters.getFirst(OAuth2ParameterNames.USERNAME);
        if (!StringUtils.hasText(username) || parameters.get(OAuth2ParameterNames.USERNAME).size() != 1) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "OAuth 2.0 Parameter: " + OAuth2ParameterNames.USERNAME,
                    ACCESS_TOKEN_REQUEST_ERROR_URI);
        }

        // SMS verification code (REQUIRED)
        String password = parameters.getFirst(OAuth2ParameterNames.PASSWORD);
        if (!StringUtils.hasText(password) || parameters.get(OAuth2ParameterNames.PASSWORD).size() != 1) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "OAuth 2.0 Parameter: " + OAuth2ParameterNames.PASSWORD,
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
        return new LdapGrantAuthenticationToken(new AuthorizationGrantType(LdapParameterNames.GRANT_TYPE_LDAP), clientPrincipal, requestedScopes, additionalParameters);
    }

}

```

### 3. AuthenticationProviderAdapter

```java
package com.light.sas.authorization.baisc.adapter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.util.Assert;

/**
 * 短信验证码登录认证提供者
 */
@Slf4j
public abstract class AuthenticationProviderAdapter implements AuthenticationProvider {

    protected OAuth2TokenGenerator<?> tokenGenerator;

    protected AuthenticationManager authenticationManager;

    protected OAuth2AuthorizationService authorizationService;

    protected AuthenticationProvider authenticationProvider;

    protected static final String ERROR_URI = "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2";

    protected static final OAuth2TokenType ID_TOKEN_TOKEN_TYPE = new OAuth2TokenType(OidcParameterNames.ID_TOKEN);

    public void setTokenGenerator(OAuth2TokenGenerator<?> tokenGenerator) {
        Assert.notNull(tokenGenerator, "tokenGenerator cannot be null");
        this.tokenGenerator = tokenGenerator;
    }

    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        Assert.notNull(authorizationService, "authenticationManager cannot be null");
        this.authenticationManager = authenticationManager;
    }

    public void setAuthenticationProvider(AuthenticationProvider authenticationProvider) {
        Assert.notNull(authenticationProvider, "authenticationProvider cannot be null");
        this.authenticationProvider = authenticationProvider;
    }

    public void setAuthorizationService(OAuth2AuthorizationService authorizationService) {
        Assert.notNull(authorizationService, "authorizationService cannot be null");
        this.authorizationService = authorizationService;
    }
}

```

### 4. LdapGrantAuthenticationProvider

```java
package com.light.sas.authorization.ldap;

import com.light.sas.authorization.baisc.adapter.AuthenticationProviderAdapter;
import com.light.sas.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClaimAccessor;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.OAuth2Token;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.util.ObjectUtils;

import java.security.Principal;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * LDAP登录认证提供者
 */
@Slf4j
public class LdapGrantAuthenticationProvider extends AuthenticationProviderAdapter {

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        LdapGrantAuthenticationToken authenticationToken = (LdapGrantAuthenticationToken) authentication;

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
    public Authentication getAuthenticatedUser(LdapGrantAuthenticationToken authenticationToken) {
        // 获取手机号密码
        Map<String, Object> additionalParameters = authenticationToken.getAdditionalParameters();
        String username = (String) additionalParameters.get(OAuth2ParameterNames.USERNAME);
        String password = (String) additionalParameters.get(OAuth2ParameterNames.PASSWORD);
        // 构建UsernamePasswordAuthenticationToken通过AbstractUserDetailsAuthenticationProvider及其子类对手机号与验证码进行校验
        // 这里就是我说的短信验证与密码模式区别不大，如果是短信验证模式则在SmsCaptchaLoginAuthenticationProvider中加一个校验，
        // 使框架支持手机号、验证码校验，反之不加就是账号密码登录
        UsernamePasswordAuthenticationToken unauthenticated = UsernamePasswordAuthenticationToken.unauthenticated(username, password);
        Authentication authenticate = null;
        try {
            authenticate = authenticationProvider.authenticate(unauthenticated);
        } catch (Exception e) {
            SecurityUtils.throwError(
                    OAuth2ErrorCodes.INVALID_REQUEST,
                    "认证失败：用户名或密码错误.",
                    ERROR_URI
            );
        }
        return authenticate;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return LdapGrantAuthenticationToken.class.isAssignableFrom(authentication);
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

    /**
     * 自定义 grant type —— Ldap
     */
    public static final String GRANT_TYPE_LDAP = "urn:ietf:params:oauth:grant-type:ldap";

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

### 6. SmsCaptchaGrantAuthenticationProvider

```java
package com.light.sas.authorization.sms;

import com.light.sas.authorization.baisc.adapter.AuthenticationProviderAdapter;
import com.light.sas.constant.SecurityConstants;
import com.light.sas.utils.SecurityUtils;
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
 */
@Slf4j
public class SmsCaptchaGrantAuthenticationProvider extends AuthenticationProviderAdapter {

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

}

```

### 7. AuthorizationConfig

```java
package com.light.sas.config;

import com.light.sas.authorization.baisc.adapter.AuthenticationProviderAdapter;
import com.light.sas.authorization.federation.FederatedIdentityIdTokenCustomizer;
import com.light.sas.authorization.ldap.LdapGrantAuthenticationConverter;
import com.light.sas.authorization.ldap.LdapGrantAuthenticationProvider;
import com.light.sas.authorization.ldap.LdapLoginAuthenticationProvider;
import com.light.sas.authorization.sms.SmsCaptchaGrantAuthenticationConverter;
import com.light.sas.authorization.sms.SmsCaptchaGrantAuthenticationProvider;
import com.light.sas.authorization.sms.SmsCaptchaLoginAuthenticationProvider;
import com.light.sas.constant.RedisConstants;
import com.light.sas.constant.SecurityConstants;
import com.light.sas.properties.CustomSecurityProperties;
import com.light.sas.support.RedisOperator;
import com.light.sas.utils.SecurityUtils;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.CorsFilter;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 认证配置
 */
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(value = CustomSecurityProperties.class)
public class AuthorizationConfig {

    private final CorsFilter corsFilter;

    private final RedisOperator<String> redisOperator;

    private final CustomSecurityProperties customSecurityProperties;

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
                                                                      AuthorizationServerSettings authorizationServerSettings,
                                                                      SmsCaptchaLoginAuthenticationProvider smsCaptchaLoginAuthenticationProvider,
                                                                      LdapLoginAuthenticationProvider ldapLoginAuthenticationProvider) throws Exception {
        // 配置默认的设置，忽略认证端点的csrf校验
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        // 添加基础的认证配置
        SecurityUtils.applyBasicSecurity(http, corsFilter, customSecurityProperties);

        // 设置设备码配置
        SecurityUtils.applyDeviceSecurity(http, customSecurityProperties, registeredClientRepository, authorizationServerSettings);

        // 自定义登录转换器
        List<AuthenticationConverter> authenticationConverters = accessTokenRequestConverters();
        // 自定义登录认证提供
        List<AuthenticationProviderAdapter> authenticationProviders = authenticationProviders(smsCaptchaLoginAuthenticationProvider, ldapLoginAuthenticationProvider);
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                // 添加自定义grant_type——短信认证登录
                .tokenEndpoint(tokenEndpoint -> tokenEndpoint
                        .accessTokenRequestConverters(consumer -> consumer.addAll(authenticationConverters))
                        .authenticationProviders(consumer -> consumer.addAll(authenticationProviders)));

        DefaultSecurityFilterChain build = http.build();

        // 从框架中获取provider中所需的bean
        OAuth2TokenGenerator<?> tokenGenerator = http.getSharedObject(OAuth2TokenGenerator.class);
        // Note: 此处获取到的 AuthenticationManager 不是下面 authenticationManager() 注入的Bean
        AuthenticationManager authenticationManager = http.getSharedObject(AuthenticationManager.class);
        OAuth2AuthorizationService authorizationService = http.getSharedObject(OAuth2AuthorizationService.class);
        // 以上三个bean在build()方法之后调用是因为调用build方法时框架会尝试获取这些类，
        // 如果获取不到则初始化一个实例放入SharedObject中，所以要在build方法调用之后获取
        // 在通过set方法设置进provider中，但是如果在build方法之后调用authenticationProvider(provider)
        // 框架会提示unsupported_grant_type，因为已经初始化完了，在添加就不会生效了
        for (AuthenticationProviderAdapter authenticationProvider : authenticationProviders) {
            authenticationProvider.setTokenGenerator(tokenGenerator);
            authenticationProvider.setAuthorizationService(authorizationService);
            authenticationProvider.setAuthenticationManager(authenticationManager);
        }

        return build;
    }

    /**
     * 自定义认证转换器
     * @return 认证转换器列表
     */
    public List<AuthenticationConverter> accessTokenRequestConverters() {
        List<AuthenticationConverter> converters = new ArrayList<>();
        // 自定义短信认证登录转换器
        SmsCaptchaGrantAuthenticationConverter smsCaptchaConverter = new SmsCaptchaGrantAuthenticationConverter();
        // 自定义LDAP登录转换器
        LdapGrantAuthenticationConverter ldapConverter = new LdapGrantAuthenticationConverter();

        converters.add(smsCaptchaConverter);
        converters.add(ldapConverter);
        return converters;
    }

    /**
     * 自定义登录认证提供者
     * @return 认证提供者列表
     */
    public List<AuthenticationProviderAdapter> authenticationProviders(SmsCaptchaLoginAuthenticationProvider smsCaptchaLoginAuthenticationProvider,
                                                                       LdapLoginAuthenticationProvider ldapLoginAuthenticationProvider) {
        List<AuthenticationProviderAdapter> providers = new ArrayList<>();
        // 自定义短信认证登录认证提供
        SmsCaptchaGrantAuthenticationProvider smsCaptchaProvider = new SmsCaptchaGrantAuthenticationProvider();
        smsCaptchaProvider.setAuthenticationProvider(smsCaptchaLoginAuthenticationProvider);

        // 自定义LDAP登录认证提供
        LdapGrantAuthenticationProvider ldapProvider = new LdapGrantAuthenticationProvider();
        ldapProvider.setAuthenticationProvider(ldapLoginAuthenticationProvider);

        providers.add(smsCaptchaProvider);
        providers.add(ldapProvider);
        return providers;
    }

    /**
     * 自定义jwt，将权限信息放至jwt中
     *
     * @return OAuth2TokenCustomizer的实例
     */
    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> oAuth2TokenCustomizer() {
        return new FederatedIdentityIdTokenCustomizer();
    }

    /**
     * 自定义jwt解析器，设置解析出来的权限信息的前缀与在jwt中的key
     *
     * @return jwt解析器 JwtAuthenticationConverter
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // 设置解析权限信息的前缀，设置为空是去掉前缀
        grantedAuthoritiesConverter.setAuthorityPrefix("");
        // 设置权限信息在jwt claims中的key
        grantedAuthoritiesConverter.setAuthoritiesClaimName(SecurityConstants.AUTHORITIES_KEY);

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    /**
     * 将AuthenticationManager注入ioc中，其它需要使用地方可以直接从ioc中获取
     *
     * @param authenticationConfiguration 导出认证配置
     * @return AuthenticationManager 认证管理器
     */
    @Bean
    @SneakyThrows
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) {
        return authenticationConfiguration.getAuthenticationManager();
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
     * 配置jwk源，使用非对称加密，公开用于检索匹配指定选择器的JWK的方法
     *
     * @return JWKSource
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() throws ParseException {
        // 先从redis获取
        String jwkSetCache = redisOperator.get(RedisConstants.AUTHORIZATION_JWS_PREFIX_KEY);
        if (!ObjectUtils.isEmpty(jwkSetCache)) {
            // 解析存储的jws
            JWKSet jwkSet = JWKSet.parse(jwkSetCache);
            return new ImmutableJWKSet<>(jwkSet);
        }
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        // 生成jws
        JWKSet jwkSet = new JWKSet(rsaKey);
        // 转为json字符串
        String jwkSetString = jwkSet.toString(Boolean.FALSE);
        // 存入redis
        redisOperator.set(RedisConstants.AUTHORIZATION_JWS_PREFIX_KEY, jwkSetString);
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
        return AuthorizationServerSettings.builder()
                /*
                    设置token签发地址(http(s)://{ip}:{port}/context-path, http(s)://domain.com/context-path)
                    如果需要通过ip访问这里就是ip，如果是有域名映射就填域名，通过什么方式访问该服务这里就填什么
                 */
                .issuer(customSecurityProperties.getIssuerUrl())
                .build();
    }

}

```


## 四、测试

给客户端 `messaging-client` 添加 grant_type `urn:ietf:params:oauth:grant-type:ldap`

### 1. 获取Token
```shell
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic bWVzc2FnaW5nLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'grant_type="urn:ietf:params:oauth:grant-type:ldap"' \
    --form 'username="admin"' \
    --form 'password="password"' \
    --form 'scope="message.write"'

```

响应结果
```json
{
   "access_token": "eyJraWQiOiI2Mzk5ZGQ3MC00YjNmLTQ2MjEtOTU3YS00ZWRjZDE5N2VjZjEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1lc3NhZ2luZy1jbGllbnQiLCJuYmYiOjE3MTAyNDEwMDIsInNjb3BlIjpbIm1lc3NhZ2Uud3JpdGUiXSwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo4MDgwIiwiZXhwIjoxNzEwMjQ4MjAyLCJpYXQiOjE3MTAyNDEwMDIsImp0aSI6ImE5YzFlZGY4LTI5MzctNGUzNi05MDM1LWFkYTdmYjFkNGM1NCIsImF1dGhvcml0aWVzIjpbIm1lc3NhZ2Uud3JpdGUiXX0.esRSwkil8XQHEOa1x5p2dTJ51bHnyIciSABrd8YCbfoQB8e-6ZSU7HM9YJJPcplx6GRVIdStFrhj8z8uGmgd7MIjnU5fKsxW2WNiRq5uzuloPiogzuG5t5JVfhR5vdIBPZsXBLtgOh2uO6cajGG2ZJQEmAsMqmwyi2CpFEOt0pJAB12G4YpNehVX_1D-UT8oPxheBzU0xZdOkHX7DHulxoizhrB-JyvGz8WjQOHSYk9y9pcB5pJpFY0GU7HWHdq6B4nRchTOeY0YOKs1_ro9-COxa3zRDdGB7Gs_BeoG0oq7_NMaOBoCUO_tsCUKT1a5yT3O_dFosiCXGY4WMBiNSw",
   "refresh_token": "M16Op1OOfVYyyyAt2uzboxsqXTFr8iPN6_ELoB1LlOTeEqQLxuUrgn2GUvGCuu0_7snrE8rNlh36MrImXKef5XekzRdnxTpanIL4js69JwUmnkJrVmDROXj_uGMRz41K",
   "scope": "message.write",
   "token_type": "Bearer",
   "expires_in": 7199
}
```

### 2. 输入一个未配置的scope

```shell
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic bWVzc2FnaW5nLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'grant_type="urn:ietf:params:oauth:grant-type:ldap"' \
    --form 'username="admin"' \
    --form 'password="password"' \
    --form 'scope="message.delete"'

```

响应结果
```json
{
   "error_description": "OAuth 2.0 Parameter: scope",
   "error": "invalid_request",
   "error_uri": "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2"
}
```

### 3. 错误验证码

```shell
# 注意，需要将上一步的data 和 JSESSIONID 添加到下面的请求中，测试环境是将验证码放入SESSION中的
curl --location --request POST 'http://127.0.0.1:8080/oauth2/token' \
    --header 'Authorization: Basic bWVzc2FnaW5nLWNsaWVudDoxMjM0NTY=' \
    --header 'Content-Type: multipart/form-data; boundary=--------------------------472090631701765594263399' \
    --form 'grant_type="urn:ietf:params:oauth:grant-type:ldap"' \
    --form 'username="admin"' \
    --form 'password="password1"' \
    --form 'scope="message.write"'

```

响应结果
```json
{
   "error_description": "认证失败：用户名或密码错误.",
   "error": "invalid_request",
   "error_uri": "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2"
}
```
