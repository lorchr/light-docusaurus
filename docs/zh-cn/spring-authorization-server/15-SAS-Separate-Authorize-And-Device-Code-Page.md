- [Spring Authorization Server入门 (十五) 分离授权确认与设备码校验页面](https://juejin.cn/post/7262317630307205176)

> 2023-12-01修改：在[session-data-redis(Github)](https://gitee.com/vains-Sofia/authorization-example/tree/session-data-redis)分支中添加了基于`spring-session-data-redis`的实现，无需借助`nonceId`来保持认证状态，该分支已去除所有`nonceId`相关内容，需要注意的是`axios`在初始化时需要添加配置`withCredentials: true`，让请求携带`cookie`。当然一些响应json的处理还是使用下方的内容。

## 一、前言
       在之前的文章([实现授权码模式使用前后端分离的登录页面](https://juejin.cn/post/7254096495184134181))中实现了前后端分离的登录页面，但这篇文章中只分离了登录页面，鉴于部分读者好奇授权确认页面分离的实现，就实现一下授权确认页面的分离，同时设备码流程的授权确认页面与授权码流程的授权确认页面是同一个，这里也需要兼容一下，还有就是设备码流程中有一个校验设备码的页面，这里也需要分离出来。

前文中有提到，在前后端分离的模式下，在页面发起的请求需要响应json不能重定向了，所以需要修改相关接口调用成功后响应json。话不多说，直接上代码。

## 二、编码
### 1. 需要修改的内容
1. 重定向至授权确认页面时直接携带相关参数重定向至前端项目中
2. 提供接口查询登录用户在发起授权的客户端中相关scope信息
3. 重定向至设备码校验页面时携带当前`sessionId`(`nonceId`)重定向至前端项目中
4. 编写授权确认失败处理类，在调用确认授权接口失败时响应json
5. 编写授权成功处理类，在调用授权确认接口成功时响应json
6. 编写校验设备码成功响应类，在校验设备码成功后响应json
7. 修改重定向至登录页面处理，兼容在请求校验设备码时登录信息过期处理
8. 将以上内容添加至认证服务配置中
9. 前端项目中编写授权确认、设备码校验、设备码校验成功页面

### 2. 重定向至授权确认页面时直接携带相关参数重定向至前端项目中

在`AuthorizationController`中编写`/oauth2/consent/redirect`接口，借助认证服务跳转至前端的，跳转时携带sessionId保持登录状态
```java
@SneakyThrows
@ResponseBody
@GetMapping(value = "/oauth2/consent/redirect")
public Result<String> consentRedirect(HttpSession session,
                                      HttpServletRequest request,
                                      HttpServletResponse response,
                                      @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
                                      @RequestParam(OAuth2ParameterNames.STATE) String state,
                                      @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                                      @RequestHeader(name = NONCE_HEADER_NAME, required = false) String nonceId,
                                      @RequestParam(name = OAuth2ParameterNames.USER_CODE, required = false) String userCode) {

    // 携带当前请求参数与nonceId重定向至前端页面
    UriComponentsBuilder uriBuilder = UriComponentsBuilder
            .fromUriString(CONSENT_PAGE_URI)
            .queryParam(OAuth2ParameterNames.SCOPE, UriUtils.encode(scope, StandardCharsets.UTF_8))
            .queryParam(OAuth2ParameterNames.STATE, UriUtils.encode(state, StandardCharsets.UTF_8))
            .queryParam(OAuth2ParameterNames.CLIENT_ID, clientId)
            .queryParam(OAuth2ParameterNames.USER_CODE, userCode)
            .queryParam(NONCE_HEADER_NAME, ObjectUtils.isEmpty(nonceId) ? session.getId() : nonceId);

    String uriString = uriBuilder.build(Boolean.TRUE).toUriString();
    if (ObjectUtils.isEmpty(userCode) || !UrlUtils.isAbsoluteUrl(DEVICE_ACTIVATE_URI)) {
        // 不是设备码模式或者设备码验证页面不是前后端分离的，无需返回json，直接重定向
        redirectStrategy.sendRedirect(request, response, uriString);
        return null;
    }
    // 兼容设备码，需响应JSON，由前端进行跳转
    return Result.success(uriString);
}
```

### 2. 提供接口查询登录用户在发起授权的客户端中相关scope信息
#### 1. 在`AuthorizationController`中编写`/oauth2/consent/parameters`接口
```java
@ResponseBody
@GetMapping(value = "/oauth2/consent/parameters")
public Result<Map<String, Object>> consentParameters(Principal principal,
                                                     @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                                                     @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
                                                     @RequestParam(OAuth2ParameterNames.STATE) String state,
                                                     @RequestParam(name = OAuth2ParameterNames.USER_CODE, required = false) String userCode) {

    // 获取consent页面所需的参数
    Map<String, Object> consentParameters = getConsentParameters(scope, state, clientId, userCode, principal);

    return Result.success(consentParameters);
}
```

#### 2. 修改`/oauth2/consent`接口
```java
@GetMapping(value = "/oauth2/consent")
public String consent(Principal principal, Model model,
                      @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                      @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
                      @RequestParam(OAuth2ParameterNames.STATE) String state,
                      @RequestParam(name = OAuth2ParameterNames.USER_CODE, required = false) String userCode) {

    // 获取consent页面所需的参数
    Map<String, Object> consentParameters = getConsentParameters(scope, state, clientId, userCode, principal);
    // 转至model中，让框架渲染页面
    consentParameters.forEach(model::addAttribute);

    return "consent";
}
```

#### 3. 编写公共方法`getConsentParameters`
```java
/**
 * 根据授权确认相关参数获取授权确认与未确认的scope相关参数
 *
 * @param scope     scope权限
 * @param state     state
 * @param clientId  客户端id
 * @param userCode  设备码授权流程中的用户码
 * @param principal 当前认证信息
 * @return 页面所需数据
 */
private Map<String, Object> getConsentParameters(String scope,
                                                 String state,
                                                 String clientId,
                                                 String userCode,
                                                 Principal principal) {
    // Remove scopes that were already approved
    Set<String> scopesToApprove = new HashSet<>();
    Set<String> previouslyApprovedScopes = new HashSet<>();
    RegisteredClient registeredClient = this.registeredClientRepository.findByClientId(clientId);
    if (registeredClient == null) {
        throw new RuntimeException("客户端不存在");
    }
    OAuth2AuthorizationConsent currentAuthorizationConsent =
            this.authorizationConsentService.findById(registeredClient.getId(), principal.getName());
    Set<String> authorizedScopes;
    if (currentAuthorizationConsent != null) {
        authorizedScopes = currentAuthorizationConsent.getScopes();
    } else {
        authorizedScopes = Collections.emptySet();
    }
    for (String requestedScope : StringUtils.delimitedListToStringArray(scope, " ")) {
        if (OidcScopes.OPENID.equals(requestedScope)) {
            continue;
        }
        if (authorizedScopes.contains(requestedScope)) {
            previouslyApprovedScopes.add(requestedScope);
        } else {
            scopesToApprove.add(requestedScope);
        }
    }

    Map<String, Object> parameters = new HashMap<>(7);
    parameters.put("clientId", registeredClient.getClientId());
    parameters.put("clientName", registeredClient.getClientName());
    parameters.put("state", state);
    parameters.put("scopes", withDescription(scopesToApprove));
    parameters.put("previouslyApprovedScopes", withDescription(previouslyApprovedScopes));
    parameters.put("principalName", principal.getName());
    parameters.put("userCode", userCode);
    if (StringUtils.hasText(userCode)) {
        parameters.put("requestURI", "/oauth2/device_verification");
    } else {
        parameters.put("requestURI", "/oauth2/authorize");
    }
    return parameters;
}
```

### 3. 重定向至设备码校验页面时携带当前`sessionId`(`nonceId`)重定向至前端项目中
在`AuthorizationController`中编写`/activate/redirect`接口，由认证服务重定向，携带`sessionId`以保持登录状态
```java
@GetMapping("/activate/redirect")
public String activateRedirect(HttpSession session,
                               @RequestParam(value = "user_code", required = false) String userCode) {

    UriComponentsBuilder uriBuilder = UriComponentsBuilder
            .fromUriString(DEVICE_ACTIVATE_URI)
            .queryParam("userCode", userCode)
            .queryParam(NONCE_HEADER_NAME, session.getId());
    return "redirect:" + uriBuilder.build(Boolean.TRUE).toUriString();
}
```

### 4. 编写授权确认失败处理类，在调用确认授权接口失败时响应json
```java
package com.example.authorization.handler;

import com.example.model.Result;
import com.example.util.JsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.util.UrlUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static com.example.constant.SecurityConstants.CONSENT_PAGE_URI;

/**
 * 授权确认失败处理
 *
 * @author vains
 */
public class ConsentAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // 获取当前认证信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // 获取具体的异常
        OAuth2AuthenticationException authenticationException = (OAuth2AuthenticationException) exception;
        OAuth2Error error = authenticationException.getError();
        // 异常信息
        String message;
        if (authentication == null) {
            message = "登录已失效";
        } else {
            // 第二次点击“拒绝”会因为之前取消时删除授权申请记录而找不到对应的数据，导致抛出 [invalid_request] OAuth 2.0 Parameter: state
            message = error.toString();
        }

        // 授权确认页面提交的请求，因为授权申请与授权确认提交公用一个过滤器，这里判断一下
        if (request.getMethod().equals(HttpMethod.POST.name()) && UrlUtils.isAbsoluteUrl(CONSENT_PAGE_URI)) {
            // 写回json异常
            Result<Object> result = Result.error(HttpStatus.BAD_REQUEST.value(), message);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(JsonUtils.objectCovertToJson(result));
            response.getWriter().flush();
        } else {
            // 在地址栏输入授权申请地址或设备码流程的验证地址错误(user_code错误)
            response.sendError(HttpStatus.BAD_REQUEST.value(), error.toString());
        }

    }

}
```

### 5. 编写授权成功处理类，在调用授权确认接口成功时响应json
```java
package com.example.authorization.handler;

import com.example.model.Result;
import com.example.util.JsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationException;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationToken;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static com.example.constant.SecurityConstants.CONSENT_PAGE_URI;
import static org.springframework.security.oauth2.core.OAuth2ErrorCodes.INVALID_REQUEST;

/**
 * 授权确认前后端分离适配响应处理
 *
 * @author vains
 */
public class ConsentAuthorizationResponseHandler implements AuthenticationSuccessHandler {

    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 获取将要重定向的回调地址
        String redirectUri = this.getAuthorizationResponseUri(authentication);
        if (request.getMethod().equals(HttpMethod.POST.name()) && UrlUtils.isAbsoluteUrl(CONSENT_PAGE_URI)) {
            // 如果是post请求并且CONSENT_PAGE_URI是完整的地址，则响应json
            Result<String> success = Result.success(redirectUri);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(JsonUtils.objectCovertToJson(success));
            response.getWriter().flush();
            return;
        }
        // 否则重定向至回调地址
        this.redirectStrategy.sendRedirect(request, response, redirectUri);
    }

    /**
     * 获取重定向的回调地址
     *
     * @param authentication 认证信息
     * @return 地址
     */
    private String getAuthorizationResponseUri(Authentication authentication) {

        OAuth2AuthorizationCodeRequestAuthenticationToken authorizationCodeRequestAuthentication =
                (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication;
        if (ObjectUtils.isEmpty(authorizationCodeRequestAuthentication.getRedirectUri())) {
            String authorizeUriError = "Redirect uri is not null";
            throw new OAuth2AuthorizationCodeRequestAuthenticationException(new OAuth2Error(INVALID_REQUEST, authorizeUriError, (null)), authorizationCodeRequestAuthentication);
        }

        if (authorizationCodeRequestAuthentication.getAuthorizationCode() == null) {
            String authorizeError = "AuthorizationCode is not null";
            throw new OAuth2AuthorizationCodeRequestAuthenticationException(new OAuth2Error(INVALID_REQUEST, authorizeError, (null)), authorizationCodeRequestAuthentication);
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder
                .fromUriString(authorizationCodeRequestAuthentication.getRedirectUri())
                .queryParam(OAuth2ParameterNames.CODE, authorizationCodeRequestAuthentication.getAuthorizationCode().getTokenValue());
        if (StringUtils.hasText(authorizationCodeRequestAuthentication.getState())) {
            uriBuilder.queryParam(
                    OAuth2ParameterNames.STATE,
                    UriUtils.encode(authorizationCodeRequestAuthentication.getState(), StandardCharsets.UTF_8));
        }
        // build(true) -> Components are explicitly encoded
        return uriBuilder.build(true).toUriString();

    }

}
```

### 6. 编写校验设备码成功响应类，在校验设备码成功后响应json
```java
package com.example.authorization.handler;

import com.example.model.Result;
import com.example.util.JsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static com.example.constant.SecurityConstants.DEVICE_ACTIVATED_URI;

/**
 * 校验设备码成功响应类
 *
 * @author vains
 */
public class DeviceAuthorizationResponseHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 写回json数据
        Result<Object> result = Result.success(DEVICE_ACTIVATED_URI);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(JsonUtils.objectCovertToJson(result));
        response.getWriter().flush();
    }
}
```

### 7. 修改重定向至登录页面处理，兼容在请求校验设备码时登录信息过期处理
```java
package com.example.authorization.handler;

import com.example.constant.SecurityConstants;
import com.example.model.Result;
import com.example.util.JsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.util.ObjectUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static com.example.constant.SecurityConstants.DEVICE_ACTIVATE_URI;

/**
 * 重定向至登录处理
 *
 * @author vains
 */
@Slf4j
public class LoginTargetAuthenticationEntryPoint extends LoginUrlAuthenticationEntryPoint {

    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    /**
     * @param loginFormUrl URL where the login page can be found. Should either be
     *                     relative to the web-app context path (include a leading {@code /}) or an absolute
     *                     URL.
     */
    public LoginTargetAuthenticationEntryPoint(String loginFormUrl) {
        super(loginFormUrl);
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        String deviceVerificationUri = "/oauth2/device_verification";
        // 兼容设备码前后端分离
        if (request.getRequestURI().equals(deviceVerificationUri)
                && request.getMethod().equals(HttpMethod.POST.name())
                && UrlUtils.isAbsoluteUrl(DEVICE_ACTIVATE_URI)) {
            // 如果是请求验证设备激活码(user_code)时未登录并且设备码验证页面是前后端分离的那种则写回json
            Result<String> success = Result.error(HttpStatus.UNAUTHORIZED.value(), ("登录已失效，请重新打开设备提供的验证地址"));
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(JsonUtils.objectCovertToJson(success));
            response.getWriter().flush();
            return;
        }

        // 获取登录表单的地址
        String loginForm = determineUrlToUseForThisRequest(request, response, authException);
        if (!UrlUtils.isAbsoluteUrl(loginForm)) {
            // 不是绝对路径调用父类方法处理
            super.commence(request, response, authException);
            return;
        }

        StringBuffer requestUrl = request.getRequestURL();
        if (!ObjectUtils.isEmpty(request.getQueryString())) {
            requestUrl.append("?").append(request.getQueryString());
        }

        // 2023-07-11添加逻辑：重定向地址添加nonce参数，该参数的值为sessionId
        // 绝对路径在重定向前添加target参数
        String targetParameter = URLEncoder.encode(requestUrl.toString(), StandardCharsets.UTF_8);
        String targetUrl = loginForm + "?target=" + targetParameter + "&" + SecurityConstants.NONCE_HEADER_NAME + "=" + request.getSession(Boolean.FALSE).getId();
        log.debug("重定向至前后端分离的登录页面：{}", targetUrl);
        this.redirectStrategy.sendRedirect(request, response, targetUrl);
    }
}
```

### 8. 将以上内容添加至认证服务配置中
`AuthorizationConfig`完整配置如下
```java
package com.example.config;

import com.example.authorization.device.DeviceClientAuthenticationConverter;
import com.example.authorization.device.DeviceClientAuthenticationProvider;
import com.example.authorization.federation.FederatedIdentityIdTokenCustomizer;
import com.example.authorization.handler.*;
import com.example.authorization.sms.SmsCaptchaGrantAuthenticationConverter;
import com.example.authorization.sms.SmsCaptchaGrantAuthenticationProvider;
import com.example.authorization.wechat.WechatAuthorizationRequestConsumer;
import com.example.authorization.wechat.WechatCodeGrantRequestEntityConverter;
import com.example.authorization.wechat.WechatMapAccessTokenResponseConverter;
import com.example.constant.RedisConstants;
import com.example.constant.SecurityConstants;
import com.example.support.RedisOperator;
import com.example.support.RedisSecurityContextRepository;
import com.example.util.SecurityUtils;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
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
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static com.example.constant.SecurityConstants.CONSENT_PAGE_URI;
import static com.example.constant.SecurityConstants.DEVICE_ACTIVATE_URI;

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
@RequiredArgsConstructor
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class AuthorizationConfig {

    private final RedisOperator<String> redisOperator;

    /**
     * 登录地址，前后端分离就填写完整的url路径，不分离填写相对路径
     */
    private final String LOGIN_URL = "http://127.0.0.1:5173/login";

    private static final String CUSTOM_CONSENT_REDIRECT_URI = "/oauth2/consent/redirect";

    private static final String CUSTOM_DEVICE_REDIRECT_URI = "/activate/redirect";

    private final RedisSecurityContextRepository redisSecurityContextRepository;

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

        // 添加跨域过滤器
        http.addFilter(corsFilter());
        // 禁用 csrf 与 cors
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(AbstractHttpConfigurer::disable);

        // 新建设备码converter和provider
        DeviceClientAuthenticationConverter deviceClientAuthenticationConverter =
                new DeviceClientAuthenticationConverter(
                        authorizationServerSettings.getDeviceAuthorizationEndpoint());
        DeviceClientAuthenticationProvider deviceClientAuthenticationProvider =
                new DeviceClientAuthenticationProvider(registeredClientRepository);

        // 使用redis存储、读取登录的认证信息
        http.securityContext(context -> context.securityContextRepository(redisSecurityContextRepository));

        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                // 开启OpenID Connect 1.0协议相关端点
                .oidc(Customizer.withDefaults())
                // 设置自定义用户确认授权页
                .authorizationEndpoint(authorizationEndpoint -> {
                            // 校验授权确认页面是否为完整路径；是否是前后端分离的页面
                            boolean absoluteUrl = UrlUtils.isAbsoluteUrl(CONSENT_PAGE_URI);
                            // 如果是分离页面则重定向，否则转发请求
                            authorizationEndpoint.consentPage(absoluteUrl ? CUSTOM_CONSENT_REDIRECT_URI : CONSENT_PAGE_URI);
                            if (absoluteUrl) {
                                // 适配前后端分离的授权确认页面，成功/失败响应json
                                authorizationEndpoint.errorResponseHandler(new ConsentAuthenticationFailureHandler());
                                authorizationEndpoint.authorizationResponseHandler(new ConsentAuthorizationResponseHandler());
                            }
                        }
                )
                // 设置设备码用户验证url(自定义用户验证页)
                .deviceAuthorizationEndpoint(deviceAuthorizationEndpoint ->
                        deviceAuthorizationEndpoint.verificationUri(UrlUtils.isAbsoluteUrl(DEVICE_ACTIVATE_URI) ? CUSTOM_DEVICE_REDIRECT_URI : DEVICE_ACTIVATE_URI)
                )
                // 设置验证设备码用户确认页面
                .deviceVerificationEndpoint(deviceVerificationEndpoint -> {
                            // 校验授权确认页面是否为完整路径；是否是前后端分离的页面
                            boolean absoluteUrl = UrlUtils.isAbsoluteUrl(CONSENT_PAGE_URI);
                            // 如果是分离页面则重定向，否则转发请求
                            deviceVerificationEndpoint.consentPage(absoluteUrl ? CUSTOM_CONSENT_REDIRECT_URI : CONSENT_PAGE_URI);
                            if (absoluteUrl) {
                                // 适配前后端分离的授权确认页面，失败响应json
                                deviceVerificationEndpoint.errorResponseHandler(new ConsentAuthenticationFailureHandler());
                            }
                            // 如果授权码验证页面或者授权确认页面是前后端分离的
                            if (UrlUtils.isAbsoluteUrl(DEVICE_ACTIVATE_URI) || absoluteUrl) {
                                // 添加响应json处理
                                deviceVerificationEndpoint.deviceVerificationResponseHandler(new DeviceAuthorizationResponseHandler());
                            }
                        }
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
                                new LoginTargetAuthenticationEntryPoint(LOGIN_URL),
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

    /**
     * 配置认证相关的过滤器链(资源服务，客户端配置)
     *
     * @param http spring security核心配置类
     * @return 过滤器链
     * @throws Exception 抛出
     */
    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        // 添加跨域过滤器
        http.addFilter(corsFilter());
        // 禁用 csrf 与 cors
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(AbstractHttpConfigurer::disable);
        http.authorizeHttpRequests((authorize) -> authorize
                        // 放行静态资源
                        .requestMatchers("/assets/**", "/webjars/**", "/login", "/getCaptcha", "/getSmsCaptcha", "/error", "/oauth2/consent/parameters").permitAll()
                        .anyRequest().authenticated()
                )
                // 指定登录页面
                .formLogin(formLogin -> {
                            formLogin.loginPage("/login");
                            if (UrlUtils.isAbsoluteUrl(LOGIN_URL)) {
                                // 绝对路径代表是前后端分离，登录成功和失败改为写回json，不重定向了
                                formLogin.successHandler(new LoginSuccessHandler());
                                formLogin.failureHandler(new LoginFailureHandler());
                            }
                        }
                );
        // 添加BearerTokenAuthenticationFilter，将认证服务当做一个资源服务，解析请求头中的token
        http.oauth2ResourceServer((resourceServer) -> resourceServer
                .jwt(Customizer.withDefaults())
                .accessDeniedHandler(SecurityUtils::exceptionHandler)
                .authenticationEntryPoint(SecurityUtils::exceptionHandler)
        );
        // 兼容前后端分离与不分离配置
        http
                // 当未登录时访问认证端点时重定向至login页面
                .exceptionHandling((exceptions) -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginTargetAuthenticationEntryPoint(LOGIN_URL),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                        )
                );
        // 联合身份认证
        http.oauth2Login(oauth2Login -> oauth2Login
                .loginPage(LOGIN_URL)
                .authorizationEndpoint(authorization -> authorization
                        .authorizationRequestResolver(this.authorizationRequestResolver(clientRegistrationRepository))
                )
                .tokenEndpoint(token -> token
                        .accessTokenResponseClient(this.accessTokenResponseClient())
                )
        );

        // 使用redis存储、读取登录的认证信息
        http.securityContext(context -> context.securityContextRepository(redisSecurityContextRepository));

        return http.build();
    }

    /**
     * AuthorizationRequest 自定义配置
     *
     * @param clientRegistrationRepository yml配置中客户端信息存储类
     * @return OAuth2AuthorizationRequestResolver
     */
    private OAuth2AuthorizationRequestResolver authorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI);

        // 兼容微信登录授权申请
        authorizationRequestResolver.setAuthorizationRequestCustomizer(new WechatAuthorizationRequestConsumer());

        return authorizationRequestResolver;
    }

    /**
     * 适配微信登录适配，添加自定义请求token入参处理
     *
     * @return OAuth2AccessTokenResponseClient accessToken响应信息处理
     */
    private OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();
        tokenResponseClient.setRequestEntityConverter(new WechatCodeGrantRequestEntityConverter());
        // 自定义 RestTemplate，适配微信登录获取token
        OAuth2AccessTokenResponseHttpMessageConverter messageConverter = new OAuth2AccessTokenResponseHttpMessageConverter();
        List<MediaType> mediaTypes = new ArrayList<>(messageConverter.getSupportedMediaTypes());
        // 微信获取token时响应的类型为“text/plain”，这里特殊处理一下
        mediaTypes.add(MediaType.TEXT_PLAIN);
        messageConverter.setAccessTokenResponseConverter(new WechatMapAccessTokenResponseConverter());
        messageConverter.setSupportedMediaTypes(mediaTypes);

        // 初始化RestTemplate
        RestTemplate restTemplate = new RestTemplate(Arrays.asList(
                new FormHttpMessageConverter(),
                messageConverter));

        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        tokenResponseClient.setRestOperations(restTemplate);
        return tokenResponseClient;
    }

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
        configuration.addAllowedOrigin("http://192.168.1.102:5173");
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
                // 客户端添加自定义认证
                .authorizationGrantType(new AuthorizationGrantType(SecurityConstants.GRANT_TYPE_SMS_CODE))
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
    @SneakyThrows
    public JWKSource<SecurityContext> jwkSource() {
        // 先从redis获取
        String jwkSetCache = redisOperator.get(RedisConstants.AUTHORIZATION_JWS_PREFIX_KEY);
        if (ObjectUtils.isEmpty(jwkSetCache)) {
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
        // 解析存储的jws
        JWKSet jwkSet = JWKSet.parse(jwkSetCache);
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
                .issuer("http://192.168.1.102:8080")
                .build();
    }

}
```

### 9. 前端项目中编写授权确认、设备码校验、设备码校验成功页面
#### 1. 编写授权确认页面`Consent.vue`
```vue
<script setup lang="ts">
import { type Ref, ref } from 'vue'
import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

// 获取授权确认信息响应
const consentResult: Ref<any> = ref()
// 所有的scope
const scopes = ref()
// 已授权的scope
const approvedScopes = ref()

axios({
  method: 'GET',
  url: `http://192.168.1.102:8080/oauth2/consent/parameters${window.location.search}`
})
  .then((r) => {
    let result = r.data
    if (result.success) {
      consentResult.value = result.data
      scopes.value = [...result.data.previouslyApprovedScopes, ...result.data.scopes]
      approvedScopes.value = result.data.previouslyApprovedScopes.map((e: any) => e.scope)
    } else {
      message.warning(result.message)
    }
  })
  .catch((e) => message.error(e.message))

/**
 * 提交授权确认
 *
 * @param cancel true为取消
 */
const submitApprove = (cancel: boolean) => {
  const data = new FormData()
  if (!cancel) {
    // 如果不是取消添加scope
    if (
      approvedScopes.value !== null &&
      typeof approvedScopes.value !== 'undefined' &&
      approvedScopes.value.length > 0
    ) {
      approvedScopes.value.forEach((e: any) => data.append('scope', e))
    }
  }
  data.append('state', consentResult.value.state)
  data.append('client_id', consentResult.value.clientId)
  data.append('user_code', consentResult.value.userCode)
  axios({
    method: 'POST',
    // @ts-ignore
    data: new URLSearchParams(data),
    headers: {
      nonceId: getQueryString('nonceId'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: `http://192.168.1.102:8080${consentResult.value.requestURI}`
  })
    .then((r) => {
      let result = r.data
      if (result.success) {
        window.location.href = result.data
      } else {
        if (result.message && result.message.indexOf('access_denied') > -1) {
          // 可以跳转至一个单独的页面提醒.
          message.warning('您未选择scope或拒绝了本次授权申请.')
        } else {
          message.warning(result.message)
        }
      }
    })
    .catch((e) => message.error(e.message))
}

/**
 * 获取地址栏参数
 * @param name 地址栏参数的key
 */
function getQueryString(name: string) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')

  var r = window.location.search.substr(1).match(reg)

  if (r != null) {
    return unescape(r[2])
  }

  return null
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="../../assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="OAuth 授权请求" />
    </div>
  </header>

  <main>
    <n-card v-if="consentResult && consentResult.userCode">
      您已经提供了代码
      <b>{{ consentResult.userCode }}</b>
      ，请验证此代码是否与设备上显示的代码匹配。
    </n-card>
    <br />
    <n-card :title="`${consentResult.clientName} 客户端`" v-if="consentResult">
      <template #header-extra>
        账号：
        <b>{{ consentResult.principalName }}</b>
      </template>
      此第三方应用请求获得以下权限
    </n-card>
    <n-scrollbar style="max-height: 230px">
      <n-checkbox-group v-model:value="approvedScopes">
        <n-list>
          <n-list-item v-for="scope in scopes">
            <template #prefix>
              <n-checkbox :value="scope.scope"> </n-checkbox>
            </template>
            <n-thing :title="scope.scope" :description="scope.description" />
          </n-list-item>
        </n-list>
      </n-checkbox-group>
    </n-scrollbar>
    <br />
    <n-button type="info" @click="submitApprove(false)" strong>
      &nbsp;&nbsp;&nbsp;&nbsp;确&nbsp;&nbsp;&nbsp;&nbsp;定&nbsp;&nbsp;&nbsp;&nbsp;
    </n-button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <n-button type="warning" @click="submitApprove(true)">
      &nbsp;&nbsp;&nbsp;&nbsp;拒&nbsp;&nbsp;&nbsp;&nbsp;绝&nbsp;&nbsp;&nbsp;&nbsp;
    </n-button>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

b,
h3,
::v-deep(.n-card-header__main) {
  font-weight: bold !important;
}
</style>
```

#### 2. 编写设备码验证页面`Activate.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const userCode = ref({
  userCode: getQueryString('userCode')
})

/**
 * 提交授权确认
 *
 * @param cancel true为取消
 */
const submit = () => {
  const data = {
    user_code: userCode.value.userCode
  }
  axios({
    method: 'POST',
    data,
    headers: {
      nonceId: getQueryString('nonceId'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: `http://192.168.1.102:8080/oauth2/device_verification`
  })
    .then((r) => {
      let result = r.data
      if (result.success) {
        window.location.href = result.data
      } else {
        message.warning(result.message)
      }
    })
    .catch((e) => message.error(e.message))
}

if (userCode.value.userCode) {
  submit()
}

/**
 * 获取地址栏参数
 * @param name 地址栏参数的key
 */
function getQueryString(name: string) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')

  var r = window.location.search.substr(1).match(reg)

  if (r != null) {
    return unescape(r[2])
  }

  return null
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="../../assets/devices.png" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="设备激活" />
    </div>
  </header>

  <main>
    <n-card> 输入激活码对设备进行授权。 </n-card>
    <br />
    <n-card>
      <n-form-item-row label="Activation Code">
        <n-input
          v-model:value="userCode.userCode"
          placeholder="User Code"
          maxlength="9"
          show-count
          clearable
        />
      </n-form-item-row>
      <n-button type="info" @click="submit" block strong> 登录 </n-button>
    </n-card>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

b,
h3,
::v-deep(.n-card-header__main) {
  font-weight: bold !important;
}
</style>
```

#### 3. 编写设备码验证成功页面
```vue
<script lang="ts" setup></script>
<template>
  <header>
    <img alt="Vue logo" class="logo" src="../../assets/devices.png" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="设备激活" />
    </div>
  </header>

  <main>
    <div style="font-size: 30px">
      您已成功激活您的设备。
      <br />
      请返回到您的设备继续。
    </div>
  </main>
</template>
<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

b,
h3,
::v-deep(.n-card-header__main) {
  font-weight: bold !important;
}
</style>
```

#### 4. `vue-router`路由配置`index.ts`
```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/login/Login.vue')
        },
        {
            path: '/consent',
            name: 'consent',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/consent/Consent.vue')
        },
        {
            path: '/activate',
            name: 'activate',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/device/Activate.vue')
        },
        {
            path: '/activated',
            name: 'activated',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/device/Activated.vue')
        }
    ]
})

export default router
```

### 10. 附一下常量类`SecurityConstants`
```java
package com.example.constant;

/**
 * security 常量类
 *
 * @author vains
 */
public class SecurityConstants {

    /**
     * 授权确认页面地址
     */
    public static final String DEVICE_ACTIVATED_URI = "http://127.0.0.1:5173/activated";

    /**
     * 授权确认页面地址
     */
    public static final String DEVICE_ACTIVATE_URI = "http://127.0.0.1:5173/activate";

    /**
     * 授权确认页面地址
     */
    public static final String CONSENT_PAGE_URI = "http://127.0.0.1:5173/consent";

    /**
     * 微信登录相关参数——openid：用户唯一id
     */
    public static final String WECHAT_PARAMETER_OPENID = "openid";

    /**
     * 微信登录相关参数——forcePopup：强制此次授权需要用户弹窗确认
     */
    public static final String WECHAT_PARAMETER_FORCE_POPUP = "forcePopup";

    /**
     * 微信登录相关参数——secret：微信的应用秘钥
     */
    public static final String WECHAT_PARAMETER_SECRET = "secret";

    /**
     * 微信登录相关参数——appid：微信的应用id
     */
    public static final String WECHAT_PARAMETER_APPID = "appid";

    /**
     * 三方登录类型——微信
     */
    public static final String THIRD_LOGIN_WECHAT = "wechat";

    /**
     * 三方登录类型——Gitee
     */
    public static final String THIRD_LOGIN_GITEE = "gitee";

    /**
     * 三方登录类型——Github
     */
    public static final String THIRD_LOGIN_GITHUB = "github";

    /**
     * 随机字符串请求头名字
     */
    public static final String NONCE_HEADER_NAME = "nonceId";

    /**
     * 登录方式入参名
     */
    public static final String LOGIN_TYPE_NAME = "loginType";

    /**
     * 验证码id入参名
     */
    public static final String CAPTCHA_ID_NAME = "captchaId";

    /**
     * 验证码值入参名
     */
    public static final String CAPTCHA_CODE_NAME = "code";

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

到此为止编码就结束了

## 三、最后
因为理论部分在之前的文章中已经讲过了，这次就没写理论了，直接贴了一大堆的代码，本次代码写的比较仓促，测试的也不是很全面，如果发现有什么问题可以在评论区留言。

[代码仓库地址](https://gitee.com/vains-Sofia/authorization-example)