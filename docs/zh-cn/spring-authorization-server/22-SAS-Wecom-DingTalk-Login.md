
## 一、前言

## 二、分析

## 三、准备

### 微信企业注册及应用创建
- [调试工具](https://developer.work.weixin.qq.com/resource/devtool)

1. 登录PC版企业微信，点击 `通讯录` - `添加成员` - `前往管理后台`，或[直接访问](https://work.weixin.qq.com/wework_admin/loginpage_wx)
2. 点击 `我的企业` 记录下方的 `企业ID` 字段
3. 点击 `应用管理`，在 `自建应用` 下点击 `创建应用`，或[直接访问](https://work.weixin.qq.com/wework_admin/frame#/apps/createApiApp)
4. 记录对应的 `AgentId` 和 `Secret` 字段
5. 点击 `开发者接口` - `网页授权及JS-SDK`，设置 `可信域名` 地址 `21f3d2ed.r3.cpolar.top`
6. 点击 `开发者接口` - `企业微信授权登录`，设置 `Web网页` 的 `授权回调域`地址 `21f3d2ed.r3.cpolar.top`
7. 点击 `开发者接口` - `企业可信IP`，设置服务器的外网IP地址（可以在使用报错时在设置）

### 钉钉企业注册及应用创建
- [实现登录第三方网站](https://open.dingtalk.com/document/orgapp/tutorial-obtaining-user-personal-information)

1. 登录PC版钉钉，点击 `更多` - `管理后台`，或[直接访问](https://open-dev.dingtalk.com)
2. 点击 `工作台` - `管理应用` - `创建应用`，或[直接访问](https://open-dev.dingtalk.com/fe/app#/corp/app)
3. 在基础信息页面记录 `client_id` `client_secret` 备用
4. 点击 `开发配置` - `权限管理`，给应用授予 `通讯录个人信息读权限` 权限
5. 点击 `开发配置` - `安全设置`，配置免登录地址 `http://968395c.r3.cpolar.top`
6. 点击 `开发配置` - `分享设置`，配置回调地址 `http://968395c.r3.cpolar.top/login/oauth2/code/ding_talk`

```shell
# 获取Token
curl -I -X POST https://api.dingtalk.com/v1.0/oauth2/userAccessToken \
 -H 'Content-Type: application/json' \
 -d '{
  "clientId" : "dingutlbtrmynzsxoznm",
  "clientSecret" : "6GG1WRTTyfxArA3TuRB6tSvOn2kpDMxrhC64pVhhndgvsIlMJlitX_f4TYkInrsZ",
  "code" : "cecd31b3c56d3ce88f49cb40dbe5f754",
  "grant-type" : "authorization_code",
  "grantType" : "authorization_code"
}'

# 获取用户信息
curl -I -X GET https://api.dingtalk.com/v1.0/contact/users/me \
  -H 'x-acs-dingtalk-access-token: 8d354635812b3047888988ee9f984564'

```


## 四、编码

### 1. 自定义联合身份认证相关适配器

#### 1. AuthorizationRequestCustomizerAdapter

```java
package com.light.sas.authorization.baisc.adapter;

import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.function.Consumer;
import java.util.function.Predicate;

/**
 * 发起认证请求的适配器
 */
public abstract class AuthorizationRequestCustomizerAdapter
        implements Predicate<OAuth2AuthorizationRequest.Builder>,
        Consumer<OAuth2AuthorizationRequest.Builder> {

}

```

#### 2. OAuth2AccessTokenResponseClientAdapter

```java
package com.light.sas.authorization.baisc.adapter;

import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;

import java.util.function.Predicate;

/**
 * 获取Token的客户端适配器
 */
public abstract class OAuth2AccessTokenResponseClientAdapter
        implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest>,
        Predicate<OAuth2AuthorizationCodeGrantRequest> {

}

```

#### 3. OAuth2UserRequestEntityConverterAdapter

```java
package com.light.sas.authorization.baisc.adapter;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequestEntityConverter;

import java.util.function.Predicate;

/**
 * 获取用户信息的适配器
 */
public abstract class OAuth2UserRequestEntityConverterAdapter
        extends OAuth2UserRequestEntityConverter
        implements Predicate<OAuth2UserRequest> {

}

```

### 2. 自定义联合身份认证相关委托类

#### 1. AuthorizationRequestCustomizerDelegator

```java
package com.light.sas.authorization.baisc.delegator;

import com.light.sas.authorization.baisc.adapter.AuthorizationRequestCustomizerAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.List;
import java.util.function.Consumer;

/**
 * 登录认证请求委托类
 */
@RequiredArgsConstructor
public class AuthorizationRequestCustomizerDelegator implements Consumer<OAuth2AuthorizationRequest.Builder> {

    private final List<AuthorizationRequestCustomizerAdapter> customizers;

    @Override
    public void accept(OAuth2AuthorizationRequest.Builder builder) {
        for (AuthorizationRequestCustomizerAdapter customizer : customizers) {
            if (customizer.test(builder)) {
                customizer.accept(builder);
            }
        }
    }

}

```

#### 2. OAuth2AccessTokenResponseClientDelegator

```java
package com.light.sas.authorization.baisc.delegator;

import com.light.sas.authorization.baisc.adapter.OAuth2AccessTokenResponseClientAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;

import java.util.List;

/**
 * 获取Token的客户端委托类
 */
@RequiredArgsConstructor
public class OAuth2AccessTokenResponseClientDelegator implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {

    /**
     * 默认使用DefaultAuthorizationCodeTokenResponseClient来获取token
     */
    private final DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();

    private final List<OAuth2AccessTokenResponseClientAdapter> clients;

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        for (OAuth2AccessTokenResponseClientAdapter client : clients) {
            if (client.test(authorizationGrantRequest)) {
                return client.getTokenResponse(authorizationGrantRequest);
            }
        }
        return tokenResponseClient.getTokenResponse(authorizationGrantRequest);
    }

}

```

#### 3. OAuth2UserRequestEntityConverterDelegator

```java
package com.light.sas.authorization.baisc.delegator;

import com.light.sas.authorization.baisc.adapter.OAuth2UserRequestEntityConverterAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequestEntityConverter;

import java.util.List;

/**
 * 获取用户信息的委托类
 */
@RequiredArgsConstructor
public class OAuth2UserRequestEntityConverterDelegator extends OAuth2UserRequestEntityConverter {

    private final List<OAuth2UserRequestEntityConverterAdapter> converters;

    @Override
    public RequestEntity<?> convert(OAuth2UserRequest userRequest) {
        for (OAuth2UserRequestEntityConverterAdapter converter : converters) {
            if (converter.test(userRequest)) {
                return converter.convert(userRequest);
            }
        }
        return super.convert(userRequest);
    }

}

```

### 3. 钉钉的适配器实现

#### 1.DingTalkAccessTokenResponseClient

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.authorization.baisc.adapter.OAuth2AccessTokenResponseClientAdapter;
import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据响应处理类
 */
@Component
public class DingTalkAccessTokenResponseClient extends OAuth2AccessTokenResponseClientAdapter {

    /**
     * 默认使用DefaultAuthorizationCodeTokenResponseClient来获取token
     */
    private final DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();

    private final DingTalkCodeGrantRequestEntityConverter grantRequestEntityConverter = new DingTalkCodeGrantRequestEntityConverter();

    private final RestTemplate restTemplate;
    public DingTalkAccessTokenResponseClient() {
        tokenResponseClient.setRequestEntityConverter(grantRequestEntityConverter);
        // 自定义 RestTemplate，适配钉钉登录获取token
        OAuth2AccessTokenResponseHttpMessageConverter messageConverter = new OAuth2AccessTokenResponseHttpMessageConverter();
        List<MediaType> mediaTypes = new ArrayList<>(messageConverter.getSupportedMediaTypes());
        // 钉钉获取token时响应的类型为 application/json，这里特殊处理一下
        mediaTypes.add(MediaType.APPLICATION_JSON);
        messageConverter.setAccessTokenResponseConverter(new DingTalkMapAccessTokenResponseConverter());
        messageConverter.setSupportedMediaTypes(mediaTypes);

        // 初始化RestTemplate
        restTemplate = new RestTemplate(Arrays.asList(
                // 默认支持application/x-www-form-urlencoded
                // new FormHttpMessageConverter(),
                messageConverter,
                // 默认支持application/json
                new MappingJackson2HttpMessageConverter()
                ));

        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        tokenResponseClient.setRestOperations(restTemplate);
    }

    @Override
    public boolean test(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();

        return DingTalkParameterNames.THIRD_LOGIN_DING_TALK.equals(registrationId);
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        OAuth2AccessTokenResponse tokenResponse = tokenResponseClient.getTokenResponse(authorizationGrantRequest);
        String code = authorizationGrantRequest.getAuthorizationExchange()
                .getAuthorizationResponse()
                .getCode();
        // 把code放在OAuth2AccessTokenResponse中
        Map<String, Object> additionalParameters = new HashMap<>(tokenResponse.getAdditionalParameters());
        additionalParameters.put(OAuth2ParameterNames.CODE, code);

        return OAuth2AccessTokenResponse.withResponse(tokenResponse)
                .additionalParameters(additionalParameters)
                .build();
    }

}

```

#### 2. DingTalkAuthorizationRequestConsumer

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.authorization.baisc.adapter.AuthorizationRequestCustomizerAdapter;
import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * 自定义钉钉登录认证请求
 */
@Component
public class DingTalkAuthorizationRequestConsumer extends AuthorizationRequestCustomizerAdapter {

    @Override
    public boolean test(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        return Objects.equals(registrationId, DingTalkParameterNames.THIRD_LOGIN_DING_TALK);
    }

    @Override
    public void accept(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        // 将prompt添加至请求参数中
        builder.additionalParameters((params) -> params.put(DingTalkParameterNames.PROMPT, DingTalkParameterNames.PROMPT_CONSENT));
    }

}

```

#### 3. DingTalkCodeGrantRequestEntityConverter

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequestEntityConverter;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 钉钉登录请求token入参处理类
 */
public class DingTalkCodeGrantRequestEntityConverter extends OAuth2AuthorizationCodeGrantRequestEntityConverter {

    @Override
    protected MultiValueMap<String, String> createParameters(OAuth2AuthorizationCodeGrantRequest authorizationCodeGrantRequest) {
        // 如果是微信登录，获取token时携带appid参数与secret参数
        MultiValueMap<String, String> parameters = super.createParameters(authorizationCodeGrantRequest);
        ClientRegistration clientRegistration = authorizationCodeGrantRequest.getClientRegistration();
        String registrationId = clientRegistration.getRegistrationId();
        if (DingTalkParameterNames.THIRD_LOGIN_DING_TALK.equals(registrationId)) {
            // 如果当前是钉钉登录，携带clientId和clientSecret
            parameters.add(DingTalkParameterNames.CLIENT_ID, clientRegistration.getClientId());
            parameters.add(DingTalkParameterNames.CLIENT_SECRET, clientRegistration.getClientSecret());
            parameters.add(DingTalkParameterNames.GRANT_TYPE, DingTalkParameterNames.AUTHORIZATION_CODE);

            parameters.remove(OAuth2ParameterNames.GRANT_TYPE);
            parameters.remove(OAuth2ParameterNames.REDIRECT_URI);
        }
        return parameters;
    }

    @Override
    public RequestEntity<?> convert(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        RequestEntity<?> requestEntity = super.convert(authorizationGrantRequest);
        URI url = requestEntity.getUrl();
        HttpMethod method = requestEntity.getMethod();

        // 参数默认为form表单格式，需要转为json格式
        LinkedMultiValueMap<String, String> originalBody = (LinkedMultiValueMap<String, String>) requestEntity.getBody();
        String clientId = originalBody.get(DingTalkParameterNames.CLIENT_ID).get(0);
        String clientSecret = originalBody.get(DingTalkParameterNames.CLIENT_SECRET).get(0);
        String grantType = originalBody.get(DingTalkParameterNames.GRANT_TYPE).get(0);
        String code = originalBody.get(OAuth2ParameterNames.CODE).get(0);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put(OAuth2ParameterNames.CODE, code);
        body.put(DingTalkParameterNames.CLIENT_ID, clientId);
        body.put(DingTalkParameterNames.CLIENT_SECRET, clientSecret);
        body.put(DingTalkParameterNames.GRANT_TYPE, grantType);

        // 设置请求头 Content-Type 默认值为 application/x-www-form-urlencoded;charset=UTF-8 钉钉需要设置为 application/json
        HttpHeaders headers = requestEntity.getHeaders();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setAccept(headers.getAccept());
        httpHeaders.set(DingTalkParameterNames.HEADER_AUTHORIZATION, headers.get(DingTalkParameterNames.HEADER_AUTHORIZATION).get(0));

        return new RequestEntity<>(body, httpHeaders, method, url);
    }

}

```

#### 4. DingTalkMapAccessTokenResponseConverter

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * 钉钉登录获取token的响应处理类
 */
public class DingTalkMapAccessTokenResponseConverter implements Converter<Map<String, Object>, OAuth2AccessTokenResponse> {

    private static final Set<String> TOKEN_RESPONSE_PARAMETER_NAMES = new HashSet<>(
            Arrays.asList(DingTalkParameterNames.ACCESS_TOKEN,
                    DingTalkParameterNames.REFRESH_TOKEN,
                    DingTalkParameterNames.EXPIRES_IN));

    @Override
    public OAuth2AccessTokenResponse convert(Map<String, Object> source) {
        String accessToken = getParameterValue(source, DingTalkParameterNames.ACCESS_TOKEN);
        OAuth2AccessToken.TokenType accessTokenType = getAccessTokenType(source);
        long expiresIn = getExpiresIn(source);
        Set<String> scopes = getScopes(source);
        String refreshToken = getParameterValue(source, DingTalkParameterNames.REFRESH_TOKEN);
        Map<String, Object> additionalParameters = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            if (!TOKEN_RESPONSE_PARAMETER_NAMES.contains(entry.getKey())) {
                additionalParameters.put(entry.getKey(), entry.getValue());
            }
        }
        // Note: 应为钉钉的用户信息需要 openid scope权限，框架默认openid scope的请求由 OidcAuthorizationCodeAuthenticationProvider 处理
        // 非openid请求 org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationProvider.authenticate
        // 带openid请求 org.springframework.security.oauth2.client.oidc.authentication.OidcAuthorizationCodeAuthenticationProvider.authenticate
        additionalParameters.put(OidcParameterNames.ID_TOKEN, accessToken);
        return OAuth2AccessTokenResponse.withToken(accessToken)
                // 如果token type为空，给个默认值
                .tokenType(accessTokenType == null ? OAuth2AccessToken.TokenType.BEARER : accessTokenType)
                .expiresIn(expiresIn)
                .scopes(scopes)
                .refreshToken(refreshToken)
                .additionalParameters(additionalParameters)
                .build();
    }

    private static OAuth2AccessToken.TokenType getAccessTokenType(Map<String, Object> tokenResponseParameters) {
        if (OAuth2AccessToken.TokenType.BEARER.getValue()
                .equalsIgnoreCase(getParameterValue(tokenResponseParameters, OAuth2ParameterNames.TOKEN_TYPE))) {
            return OAuth2AccessToken.TokenType.BEARER;
        }
        return null;
    }

    private static long getExpiresIn(Map<String, Object> tokenResponseParameters) {
        return getParameterValue(tokenResponseParameters, DingTalkParameterNames.EXPIRES_IN, 0L);
    }

    private static Set<String> getScopes(Map<String, Object> tokenResponseParameters) {
        if (tokenResponseParameters.containsKey(OAuth2ParameterNames.SCOPE)) {
            String scope = getParameterValue(tokenResponseParameters, OAuth2ParameterNames.SCOPE);
            return new HashSet<>(Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
        }
        return Collections.emptySet();
    }

    private static String getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName) {
        Object obj = tokenResponseParameters.get(parameterName);
        return (obj != null) ? obj.toString() : null;
    }

    private static long getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName,
                                          long defaultValue) {
        long parameterValue = defaultValue;

        Object obj = tokenResponseParameters.get(parameterName);
        if (obj != null) {
            // Final classes Long and Integer do not need to be coerced
            if (obj.getClass() == Long.class) {
                parameterValue = (Long) obj;
            }
            else if (obj.getClass() == Integer.class) {
                parameterValue = (Integer) obj;
            }
            else {
                // Attempt to coerce to a long (typically from a String)
                try {
                    parameterValue = Long.parseLong(obj.toString());
                }
                catch (NumberFormatException ignored) {
                }
            }
        }

        return parameterValue;
    }

}

```

#### 5. DingTalkUserRequestEntityConverter

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.authorization.baisc.adapter.OAuth2UserRequestEntityConverterAdapter;
import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * 钉钉登录获取用户信息参数转换器
 */
@Component
public class DingTalkUserRequestEntityConverter extends OAuth2UserRequestEntityConverterAdapter {

    @Override
    public boolean test(OAuth2UserRequest userRequest) {
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        return DingTalkParameterNames.THIRD_LOGIN_DING_TALK.equals(clientRegistration.getRegistrationId());
    }

    /**
     * https://oapi.dingtalk.com/v1.0/contact/users/{unionId}
     */
    @Override
    public RequestEntity<?> convert(OAuth2UserRequest userRequest) {
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        URI uri = UriComponentsBuilder
                .fromUriString(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUri())
                .build(DingTalkParameterNames.ME);

        // token
        HttpHeaders headers = new HttpHeaders();
        headers.add(DingTalkParameterNames.HEADER_X_ACS_DINGTALK_ACCESS_TOKEN, userRequest.getAccessToken().getTokenValue());
        return new RequestEntity<>(headers, HttpMethod.GET, uri);
    }

}

```

#### 6. DingTalkUserResponseConverter

```java
package com.light.sas.authorization.dingtalk;

import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.util.ArrayList;
import java.util.List;

/**
 * 钉钉用户信息响应转换器
 */
public class DingTalkUserResponseConverter extends MappingJackson2HttpMessageConverter {

    public DingTalkUserResponseConverter() {
        List<MediaType> mediaTypes = new ArrayList<>(super.getSupportedMediaTypes());
        mediaTypes.add(MediaType.APPLICATION_JSON);
        super.setSupportedMediaTypes(mediaTypes);
    }

}

```

#### 7. DingTalkParameterNames

```java
package com.light.sas.constant;

/**
 * 钉钉登录相关常量参数
 * https://open.dingtalk.com/document/orgapp/tutorial-obtaining-user-personal-information
 */
public class DingTalkParameterNames {

    /**
     * 三方登录类型——DingTalk
     */
    public static final String THIRD_LOGIN_DING_TALK = "ding_talk";
    /**
     * 钉钉登录相关参数——appid：应用id
     */
    public static final String APP_ID = "appid";

    /**
     * 钉钉登录相关参数——agentid：应用id
     */
    public static final String AGENT_ID = "agentid";

    /**
     * 钉钉登录相关参数——clientId：应用id
     */
    public static final String CLIENT_ID = "clientId";

    /**
     * 钉钉登录相关参数——clientSecret：微信的应用秘钥
     */
    public static final String CLIENT_SECRET = "clientSecret";

    /**
     * 钉钉登录相关参数——grantType：授权类型
     */
    public static final String GRANT_TYPE = "grantType";

    /**
     * 钉钉登录相关参数——authorization_code：授权码模式
     */
    public static final String AUTHORIZATION_CODE = "authorization_code";

    /**
     * 钉钉登录相关参数——prompt：微信的应用秘钥
     */
    public static final String PROMPT = "prompt";

    /**
     * 钉钉登录相关参数——consent: 值为 consent 时需要确认授权
     */
    public static final String PROMPT_CONSENT = "consent";

    /**
     * 钉钉登录相关参数——accessToken：Token令牌
     */
    public static final String ACCESS_TOKEN = "accessToken";

    /**
     * 钉钉登录相关参数——refreshToken：刷新Token
     */
    public static final String REFRESH_TOKEN = "refreshToken";

    /**
     * 钉钉登录相关参数——expireIn：Token过期时间
     */
    public static final String EXPIRES_IN = "expireIn";

    /**
     * 钉钉登录相关参数——Authorization：认证header头参数
     */
    public static final String HEADER_AUTHORIZATION = "Authorization";

    /**
     * 钉钉登录相关参数——me：获取当前用户的信息，其他用户使用unionId获取
     */
    public static final String ME = "me";

    /**
     * 钉钉登录相关参数——me：获取当前用户的信息，其他用户使用unionId获取
     */
    public static final String HEADER_X_ACS_DINGTALK_ACCESS_TOKEN = "x-acs-dingtalk-access-token";
}

```

#### 8. DingTalkUserConverter

```java
package com.light.sas.strategy.impl;

import com.light.sas.constant.DingTalkParameterNames;
import com.light.sas.entity.OAuth2ThirdAccount;
import com.light.sas.strategy.OAuth2UserConverterStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 钉钉用户信息转换器
 * @see <a href="https://developer.work.weixin.qq.com/document/path/98176">获取用户信息</a>
 */
@RequiredArgsConstructor
@Component(DingTalkUserConverter.LOGIN_TYPE)
public class DingTalkUserConverter implements OAuth2UserConverterStrategy {

    protected static final String LOGIN_TYPE = DingTalkParameterNames.THIRD_LOGIN_DING_TALK;

    @Override
    public OAuth2ThirdAccount convert(OAuth2User auth2User) {
        // 获取三方用户信息
        Map<String, Object> attributes = auth2User.getAttributes();
        // 转换至Oauth2ThirdAccount
        OAuth2ThirdAccount thirdAccount = new OAuth2ThirdAccount();
        String uniqueId = String.valueOf(attributes.get("unionId"));
        String openId = String.valueOf(attributes.get("openId"));
        String mobile = String.valueOf(attributes.get("mobile"));
        String stateCode = String.valueOf(attributes.get("stateCode"));
        String email = String.valueOf(attributes.get("email"));
        thirdAccount.setUniqueId(uniqueId);
        thirdAccount.setThirdUsername(auth2User.getName());
        thirdAccount.setType(LOGIN_TYPE);
        // 设置基础用户信息
        thirdAccount.setName(auth2User.getName());
        thirdAccount.setAvatar(String.valueOf(attributes.get("avatarUrl")));
        return thirdAccount;
    }
}
```

#### 9. DingTalkOAuth2LoginAuthenticationProvider

```java
package com.light.sas.authorization.dingtalk;

import com.light.sas.constant.DingTalkParameterNames;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthorizationCodeAuthenticationProvider;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthorizationCodeAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.Collection;
import java.util.Map;

/**
 * @see org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationProvider
 */
@Component
public class DingTalkOAuth2LoginAuthenticationProvider implements AuthenticationProvider {

    private final OAuth2AuthorizationCodeAuthenticationProvider authorizationCodeAuthenticationProvider;

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> userService;

    private GrantedAuthoritiesMapper authoritiesMapper = ((authorities) -> authorities);

    /**
     * Constructs an {@code OAuth2LoginAuthenticationProvider} using the provided
     * parameters.
     * @param accessTokenResponseClient the client used for requesting the access token
     * credential from the Token Endpoint
     * @param userService the service used for obtaining the user attributes of the
     * End-User from the UserInfo Endpoint
     */
    public DingTalkOAuth2LoginAuthenticationProvider(
            DingTalkAccessTokenResponseClient accessTokenResponseClient,
            OAuth2UserService<OAuth2UserRequest, OAuth2User> userService) {
        Assert.notNull(userService, "userService cannot be null");
        this.authorizationCodeAuthenticationProvider = new OAuth2AuthorizationCodeAuthenticationProvider(
                accessTokenResponseClient);
        this.userService = userService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        OAuth2LoginAuthenticationToken loginAuthenticationToken = (OAuth2LoginAuthenticationToken) authentication;
//      region Add support for DingTalkLogin
        // Section 3.1.2.1 Authentication Request -
        // https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest scope
        // REQUIRED. OpenID Connect requests MUST contain the "openid" scope value.
//        if (loginAuthenticationToken.getAuthorizationExchange()
//                .getAuthorizationRequest()
//                .getScopes()
//                .contains("openid")) {
//            // This is an OpenID Connect Authentication Request so return null
//            // and let OidcAuthorizationCodeAuthenticationProvider handle it instead
//            return null;
//        }
        ClientRegistration clientRegistration = loginAuthenticationToken.getClientRegistration();
        if (!DingTalkParameterNames.THIRD_LOGIN_DING_TALK.equals(clientRegistration.getRegistrationId())) {
            return null;
        }
//        endregion
        OAuth2AuthorizationCodeAuthenticationToken authorizationCodeAuthenticationToken;
        try {
            authorizationCodeAuthenticationToken = (OAuth2AuthorizationCodeAuthenticationToken) this.authorizationCodeAuthenticationProvider
                    .authenticate(
                            new OAuth2AuthorizationCodeAuthenticationToken(loginAuthenticationToken.getClientRegistration(),
                                    loginAuthenticationToken.getAuthorizationExchange()));
        }
        catch (OAuth2AuthorizationException ex) {
            OAuth2Error oauth2Error = ex.getError();
            throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString(), ex);
        }
        OAuth2AccessToken accessToken = authorizationCodeAuthenticationToken.getAccessToken();
        Map<String, Object> additionalParameters = authorizationCodeAuthenticationToken.getAdditionalParameters();
        OAuth2User oauth2User = this.userService.loadUser(new OAuth2UserRequest(
                loginAuthenticationToken.getClientRegistration(), accessToken, additionalParameters));
        Collection<? extends GrantedAuthority> mappedAuthorities = this.authoritiesMapper
                .mapAuthorities(oauth2User.getAuthorities());
        OAuth2LoginAuthenticationToken authenticationResult = new OAuth2LoginAuthenticationToken(
                loginAuthenticationToken.getClientRegistration(), loginAuthenticationToken.getAuthorizationExchange(),
                oauth2User, mappedAuthorities, accessToken, authorizationCodeAuthenticationToken.getRefreshToken());
        authenticationResult.setDetails(loginAuthenticationToken.getDetails());
        return authenticationResult;
    }

    /**
     * Sets the {@link GrantedAuthoritiesMapper} used for mapping
     * {@link OAuth2User#getAuthorities()} to a new set of authorities which will be
     * associated to the {@link OAuth2LoginAuthenticationToken}.
     * @param authoritiesMapper the {@link GrantedAuthoritiesMapper} used for mapping the
     * user's authorities
     */
    public final void setAuthoritiesMapper(GrantedAuthoritiesMapper authoritiesMapper) {
        Assert.notNull(authoritiesMapper, "authoritiesMapper cannot be null");
        this.authoritiesMapper = authoritiesMapper;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return OAuth2LoginAuthenticationToken.class.isAssignableFrom(authentication);
    }

}

```

### 4. 企业微信的适配器实现

#### 1. WecomAccessTokenResponseClient

```java
package com.light.sas.authorization.wecom;

import com.light.sas.authorization.baisc.adapter.OAuth2AccessTokenResponseClientAdapter;
import com.light.sas.constant.WecomParameterNames;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 目前额外支持“text/plain”类型数据响应处理类
 */
@Component
public class WecomAccessTokenResponseClient extends OAuth2AccessTokenResponseClientAdapter {

    /**
     * 默认使用DefaultAuthorizationCodeTokenResponseClient来获取token
     */
    private final DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();

    public WecomAccessTokenResponseClient() {
        tokenResponseClient.setRequestEntityConverter(new WecomCodeGrantRequestEntityConverter());
        // 自定义 RestTemplate，适配微信登录获取token
        OAuth2AccessTokenResponseHttpMessageConverter messageConverter = new OAuth2AccessTokenResponseHttpMessageConverter();
        List<MediaType> mediaTypes = new ArrayList<>(messageConverter.getSupportedMediaTypes());
        // 微信获取token时响应的类型为“text/plain”，这里特殊处理一下
        mediaTypes.add(MediaType.TEXT_PLAIN);
        messageConverter.setAccessTokenResponseConverter(new WecomMapAccessTokenResponseConverter());
        messageConverter.setSupportedMediaTypes(mediaTypes);

        // 初始化RestTemplate
        RestTemplate restTemplate = new RestTemplate(Arrays.asList(
                new FormHttpMessageConverter(),
                messageConverter));

        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        tokenResponseClient.setRestOperations(restTemplate);
    }

    @Override
    public boolean test(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();

        return WecomParameterNames.THIRD_LOGIN_WECOM.equals(registrationId);
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        // TODO 缓存获取token 如果获取不到再请求 并放入缓存 企业微信的token不允许频繁获取
        OAuth2AccessTokenResponse tokenResponse = tokenResponseClient.getTokenResponse(authorizationGrantRequest);
        String code = authorizationGrantRequest.getAuthorizationExchange()
                .getAuthorizationResponse()
                .getCode();

        // 把code放在OAuth2AccessTokenResponse中
        return OAuth2AccessTokenResponse.withResponse(tokenResponse)
                .additionalParameters(Collections.singletonMap(OAuth2ParameterNames.CODE, code))
                .build();
    }

}

```

#### 2. WecomAuthorizationRequestConsumer

```java
package com.light.sas.authorization.wecom;

import com.light.sas.authorization.baisc.adapter.AuthorizationRequestCustomizerAdapter;
import com.light.sas.constant.WecomParameterNames;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Objects;

/**
 * 自定义企业微信登录认证请求
 */
@Component
public class WecomAuthorizationRequestConsumer extends AuthorizationRequestCustomizerAdapter {

    @Override
    public boolean test(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        return Objects.equals(registrationId, WecomParameterNames.THIRD_LOGIN_WECOM);
    }

    @Override
    public void accept(OAuth2AuthorizationRequest.Builder builder) {
        builder.attributes(attributes ->
                builder.parameters(parameters -> {
                    LinkedHashMap<String, Object> linkedParameters = new LinkedHashMap<>();
                    parameters.forEach((k, v) -> {
                        // 把 client_id 名称换成 appid
                        if (OAuth2ParameterNames.CLIENT_ID.equals(k)) {
                            linkedParameters.put(WecomParameterNames.APP_ID, v);
                        }
                        // 回收必要参数 redirect_uri
                        if (OAuth2ParameterNames.REDIRECT_URI.equals(k)) {
                            linkedParameters.put(OAuth2ParameterNames.REDIRECT_URI, v);
                        }
                        // 回收必要参数 state
                        if (OAuth2ParameterNames.STATE.equals(k)) {
                            linkedParameters.put(OAuth2ParameterNames.STATE, v);
                        }
                    });
                    // TODO 增加 agentid  这里硬编码了 应该加一个配置
                    linkedParameters.put(WecomParameterNames.AGENT_ID, "1000007");
                    // 其它无效参数都清除了
                    parameters.clear();
                    // 把有用的参数再放回去
                    parameters.putAll(linkedParameters);
                }));
    }

}

```

#### 3. WecomCodeGrantRequestEntityConverter

```java
package com.light.sas.authorization.wecom;

import com.light.sas.constant.WecomParameterNames;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequestEntityConverter;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * 企业微信登录请求token入参处理类
 */
public class WecomCodeGrantRequestEntityConverter extends OAuth2AuthorizationCodeGrantRequestEntityConverter {

    @Override
    public RequestEntity<?> convert(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        String code = authorizationGrantRequest.getAuthorizationExchange()
                .getAuthorizationResponse()
                .getCode();

        if(!StringUtils.hasText(code)) {
            throw new OAuth2AuthenticationException("用户终止授权");
        }

        ClientRegistration clientRegistration = authorizationGrantRequest.getClientRegistration();

        MultiValueMap<String, String> queryParameters = new LinkedMultiValueMap<>();
        queryParameters.add(WecomParameterNames.CORP_ID, clientRegistration.getClientId());
        queryParameters.add(WecomParameterNames.CORP_SECRET, clientRegistration.getClientSecret());

        String tokenUri = clientRegistration.getProviderDetails().getTokenUri();
        URI uri = UriComponentsBuilder.fromUriString(tokenUri)
                .queryParams(queryParameters)
                .build()
                .toUri();
        return RequestEntity.get(uri).build();
    }

}
```

#### 4. WecomMapAccessTokenResponseConverter

```java
package com.light.sas.authorization.wecom;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * 企业微信登录获取token的响应处理类
 */
public class WecomMapAccessTokenResponseConverter implements Converter<Map<String, Object>, OAuth2AccessTokenResponse> {

    private static final Set<String> TOKEN_RESPONSE_PARAMETER_NAMES = new HashSet<>(
            Arrays.asList(OAuth2ParameterNames.ACCESS_TOKEN,
                    OAuth2ParameterNames.EXPIRES_IN,
                    OAuth2ParameterNames.REFRESH_TOKEN,
                    OAuth2ParameterNames.SCOPE,
                    OAuth2ParameterNames.TOKEN_TYPE));

    @Override
    public OAuth2AccessTokenResponse convert(Map<String, Object> source) {
        String accessToken = getParameterValue(source, OAuth2ParameterNames.ACCESS_TOKEN);
        OAuth2AccessToken.TokenType accessTokenType = getAccessTokenType(source);
        long expiresIn = getExpiresIn(source);
        Set<String> scopes = getScopes(source);
        String refreshToken = getParameterValue(source, OAuth2ParameterNames.REFRESH_TOKEN);
        Map<String, Object> additionalParameters = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            if (!TOKEN_RESPONSE_PARAMETER_NAMES.contains(entry.getKey())) {
                additionalParameters.put(entry.getKey(), entry.getValue());
            }
        }
        return OAuth2AccessTokenResponse.withToken(accessToken)
                // 如果token type为空，给个默认值
                .tokenType(accessTokenType == null ? OAuth2AccessToken.TokenType.BEARER : accessTokenType)
                .expiresIn(expiresIn)
                .scopes(scopes)
                .refreshToken(refreshToken)
                .additionalParameters(additionalParameters)
                .build();
    }

    private static OAuth2AccessToken.TokenType getAccessTokenType(Map<String, Object> tokenResponseParameters) {
        if (OAuth2AccessToken.TokenType.BEARER.getValue()
                .equalsIgnoreCase(getParameterValue(tokenResponseParameters, OAuth2ParameterNames.TOKEN_TYPE))) {
            return OAuth2AccessToken.TokenType.BEARER;
        }
        return null;
    }

    private static long getExpiresIn(Map<String, Object> tokenResponseParameters) {
        return getParameterValue(tokenResponseParameters, OAuth2ParameterNames.EXPIRES_IN, 0L);
    }

    private static Set<String> getScopes(Map<String, Object> tokenResponseParameters) {
        if (tokenResponseParameters.containsKey(OAuth2ParameterNames.SCOPE)) {
            String scope = getParameterValue(tokenResponseParameters, OAuth2ParameterNames.SCOPE);
            return new HashSet<>(Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
        }
        return Collections.emptySet();
    }

    private static String getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName) {
        Object obj = tokenResponseParameters.get(parameterName);
        return (obj != null) ? obj.toString() : null;
    }

    private static long getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName,
                                          long defaultValue) {
        long parameterValue = defaultValue;

        Object obj = tokenResponseParameters.get(parameterName);
        if (obj != null) {
            // Final classes Long and Integer do not need to be coerced
            if (obj.getClass() == Long.class) {
                parameterValue = (Long) obj;
            }
            else if (obj.getClass() == Integer.class) {
                parameterValue = (Integer) obj;
            }
            else {
                // Attempt to coerce to a long (typically from a String)
                try {
                    parameterValue = Long.parseLong(obj.toString());
                }
                catch (NumberFormatException ignored) {
                }
            }
        }

        return parameterValue;
    }

}
```

#### 5. WecomUserRequestEntityConverter

```java
package com.light.sas.authorization.wecom;

import com.light.sas.authorization.baisc.adapter.OAuth2UserRequestEntityConverterAdapter;
import com.light.sas.constant.WecomParameterNames;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * 企业微信登录获取用户信息参数转换器
 */
@Component
public class WecomUserRequestEntityConverter extends OAuth2UserRequestEntityConverterAdapter {

    @Override
    public boolean test(OAuth2UserRequest userRequest) {
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        return WecomParameterNames.THIRD_LOGIN_WECOM.equals(clientRegistration.getRegistrationId());
    }

    @Override
    public RequestEntity<?> convert(OAuth2UserRequest userRequest) {
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        // 对于微信登录的特殊处理，请求用户信息时添加openid与access_token参数
        Object code = userRequest.getAdditionalParameters().get(OAuth2ParameterNames.CODE);
        URI uri = UriComponentsBuilder
                .fromUriString(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUri())
                .queryParam(OAuth2ParameterNames.CODE, code)
                .queryParam(OAuth2ParameterNames.ACCESS_TOKEN, userRequest.getAccessToken().getTokenValue())
                .build().toUri();
        return new RequestEntity<>(HttpMethod.GET, uri);
    }
}

```

#### 6. WecomUserResponseConverter

```java
package com.light.sas.authorization.wecom;

import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.util.ArrayList;
import java.util.List;

/**
 * 企业微信用户信息响应转换器
 */
public class WecomUserResponseConverter extends MappingJackson2HttpMessageConverter {

    public WecomUserResponseConverter() {
        List<MediaType> mediaTypes = new ArrayList<>(super.getSupportedMediaTypes());
        // 微信获取用户信息时响应的类型为“text/plain”，这里特殊处理一下
        mediaTypes.add(MediaType.TEXT_PLAIN);
        super.setSupportedMediaTypes(mediaTypes);
    }

}

```

#### 7. WecomParameterNames

```java
package com.light.sas.constant;

/**
 * 企业微信登录相关常量参数
 */
public class WecomParameterNames {

    /**
     * 三方登录类型——Wecom
     */
    public static final String THIRD_LOGIN_WECOM = "wecom";
    /**
     * 企业微信登录相关参数——appid：微信的应用id
     */
    public static final String APP_ID = "appid";

    /**
     * 企业微信登录相关参数——appid：微信的应用id
     */
    public static final String AGENT_ID = "agentid";

    /**
     * 企业微信登录相关参数——appid：微信的企业id
     */
    public static final String CORP_ID = "corpid";

    /**
     * 企业微信登录相关参数——appid：微信的应用秘钥
     */
    public static final String CORP_SECRET = "corpsecret";
}

```

#### 8. WecomUserConverter

```java
package com.light.sas.strategy.impl;

import com.light.sas.constant.WecomParameterNames;
import com.light.sas.entity.OAuth2ThirdAccount;
import com.light.sas.strategy.OAuth2UserConverterStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Map;

/**
 * 企业微信用户信息转换器
 * @see <a href="https://developer.work.weixin.qq.com/document/path/98176">获取用户信息</a>
 */
@RequiredArgsConstructor
@Component(WecomUserConverter.LOGIN_TYPE)
public class WecomUserConverter implements OAuth2UserConverterStrategy {

    protected static final String LOGIN_TYPE = WecomParameterNames.THIRD_LOGIN_WECOM;

    @Override
    public OAuth2ThirdAccount convert(OAuth2User auth2User) {
        // 获取三方用户信息
        Map<String, Object> attributes = auth2User.getAttributes();
        // 转换至Oauth2ThirdAccount
        OAuth2ThirdAccount thirdAccount = new OAuth2ThirdAccount();
        String uniqueId = String.valueOf(attributes.get("userid"));
        if (StringUtils.hasText(uniqueId)) {
            uniqueId = String.valueOf(attributes.get("openid"));
        }
        thirdAccount.setUniqueId(uniqueId);
        thirdAccount.setThirdUsername(auth2User.getName());
        thirdAccount.setType(LOGIN_TYPE);
        thirdAccount.setLocation(attributes.get("province") + " " + attributes.get("city"));
        // 设置基础用户信息
        thirdAccount.setName(auth2User.getName());
        thirdAccount.setAvatar(String.valueOf(attributes.get("headimgurl")));
        return thirdAccount;
    }
}
```

### 5. 微信的网页授权登录的改造

#### 1. WechatAccessTokenResponseClient

```java
package com.light.sas.authorization.wechat;

import com.light.sas.authorization.baisc.adapter.OAuth2AccessTokenResponseClientAdapter;
import com.light.sas.constant.WechatParameterNames;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 目前额外支持“text/plain”类型数据响应处理类
 */
@Component
public class WechatAccessTokenResponseClient extends OAuth2AccessTokenResponseClientAdapter {

    /**
     * 默认使用DefaultAuthorizationCodeTokenResponseClient来获取token
     */
    private final DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();

    /**
     * 初始化时设置 DefaultAuthorizationCodeTokenResponseClient 支持的响应数据格式
     *  默认添加“text/plain”类型的格式
     */
    public WechatAccessTokenResponseClient() {
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
    }

    @Override
    public boolean test(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();
        return WechatParameterNames.THIRD_LOGIN_WECHAT.equals(registrationId);
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        return tokenResponseClient.getTokenResponse(authorizationGrantRequest);
    }

}

```

#### 2. WechatAuthorizationRequestConsumer

```java
package com.light.sas.authorization.wechat;

import com.light.sas.authorization.baisc.adapter.AuthorizationRequestCustomizerAdapter;
import com.light.sas.constant.WechatParameterNames;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Objects;

/**
 * 自定义微信登录认证请求
 */
@Component
public class WechatAuthorizationRequestConsumer extends AuthorizationRequestCustomizerAdapter {

    @Override
    public boolean test(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        return Objects.equals(registrationId, WechatParameterNames.THIRD_LOGIN_WECHAT);
    }

    @Override
    public void accept(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        if (Objects.equals(registrationId, WechatParameterNames.THIRD_LOGIN_WECHAT)) {
            // 判断是否微信登录，如果是微信登录则将appid添加至请求参数中
            builder.additionalParameters((params) -> params.put(WechatParameterNames.FORCE_POPUP, true));
            builder.additionalParameters((params) -> params.put(WechatParameterNames.APP_ID, authorizationRequest.getClientId()));

            // 微信的PC端认证对参数顺序有强正则校验，修改参数顺序
            builder.parameters((params) -> {
                // 移除oauth2参数，顺序不对不能正常获取到微信授权码
                params.remove(OAuth2ParameterNames.RESPONSE_TYPE);
                params.remove(OAuth2ParameterNames.CLIENT_ID);
                params.remove(OAuth2ParameterNames.SCOPE);
                params.remove(OAuth2ParameterNames.STATE);
                params.remove(OAuth2ParameterNames.REDIRECT_URI);
                params.remove(WechatParameterNames.FORCE_POPUP);
                params.remove(WechatParameterNames.APP_ID);

                // 重新添加到参数中
                params.put(WechatParameterNames.APP_ID, authorizationRequest.getClientId());
                params.put(OAuth2ParameterNames.REDIRECT_URI, authorizationRequest.getRedirectUri());
                params.put(OAuth2ParameterNames.RESPONSE_TYPE, authorizationRequest.getResponseType().getValue());
                params.put(OAuth2ParameterNames.SCOPE, StringUtils.collectionToDelimitedString(authorizationRequest.getScopes(), " "));
                params.put(OAuth2ParameterNames.STATE, authorizationRequest.getState());
                params.put(OAuth2ParameterNames.CLIENT_ID, authorizationRequest.getClientId());
                params.put(WechatParameterNames.FORCE_POPUP, true);
            });
        }
    }

}

```

#### 3. WechatCodeGrantRequestEntityConverter

```java
package com.light.sas.authorization.wechat;

import com.light.sas.constant.WechatParameterNames;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequestEntityConverter;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * 微信登录请求token入参处理类
 */
public class WechatCodeGrantRequestEntityConverter extends OAuth2AuthorizationCodeGrantRequestEntityConverter {

    @Override
    protected MultiValueMap<String, String> createParameters(OAuth2AuthorizationCodeGrantRequest authorizationCodeGrantRequest) {
        // 如果是微信登录，获取token时携带appid参数与secret参数
        MultiValueMap<String, String> parameters = super.createParameters(authorizationCodeGrantRequest);
        String registrationId = authorizationCodeGrantRequest.getClientRegistration().getRegistrationId();
        if (WechatParameterNames.THIRD_LOGIN_WECHAT.equals(registrationId)) {
            // 如果当前是微信登录，携带appid和secret
            parameters.add(WechatParameterNames.APP_ID, authorizationCodeGrantRequest.getClientRegistration().getClientId());
            parameters.add(WechatParameterNames.APP_SECRET, authorizationCodeGrantRequest.getClientRegistration().getClientSecret());
        }
        return parameters;
    }

    @Override
    public RequestEntity<?> convert(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        RequestEntity<?> requestEntity = super.convert(authorizationGrantRequest);
        String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();
        // 框架默认是POST请求，参数在form-data中，微信的token接口参数在queryParam中
        if (WechatParameterNames.THIRD_LOGIN_WECHAT.equals(registrationId)) {
            URI url = requestEntity.getUrl();
            LinkedMultiValueMap<String, List<String>> body = (LinkedMultiValueMap<String, List<String>>) requestEntity.getBody();

            URI uri = UriComponentsBuilder
                    .fromUri(url)
                    .queryParam(WechatParameterNames.APP_ID, body.get(WechatParameterNames.APP_ID))
                    .queryParam(WechatParameterNames.APP_SECRET, body.get(WechatParameterNames.APP_SECRET))
                    .queryParam(OAuth2ParameterNames.CODE, body.get(OAuth2ParameterNames.CODE))
                    .queryParam(OAuth2ParameterNames.GRANT_TYPE, body.get(OAuth2ParameterNames.GRANT_TYPE))
                    .queryParam(OAuth2ParameterNames.REDIRECT_URI, body.get(OAuth2ParameterNames.REDIRECT_URI))
                    .build().toUri();
            return new RequestEntity<>(HttpMethod.GET, uri);
        }
        return requestEntity;
    }

}

```

#### 4. WechatMapAccessTokenResponseConverter

```java
package com.light.sas.authorization.wechat;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * 微信登录获取token的响应处理类
 */
public class WechatMapAccessTokenResponseConverter implements Converter<Map<String, Object>, OAuth2AccessTokenResponse> {

    private static final Set<String> TOKEN_RESPONSE_PARAMETER_NAMES = new HashSet<>(
            Arrays.asList(OAuth2ParameterNames.ACCESS_TOKEN,
                    OAuth2ParameterNames.EXPIRES_IN,
                    OAuth2ParameterNames.REFRESH_TOKEN,
                    OAuth2ParameterNames.SCOPE,
                    OAuth2ParameterNames.TOKEN_TYPE));

    @Override
    public OAuth2AccessTokenResponse convert(Map<String, Object> source) {
        String accessToken = getParameterValue(source, OAuth2ParameterNames.ACCESS_TOKEN);
        OAuth2AccessToken.TokenType accessTokenType = getAccessTokenType(source);
        long expiresIn = getExpiresIn(source);
        Set<String> scopes = getScopes(source);
        String refreshToken = getParameterValue(source, OAuth2ParameterNames.REFRESH_TOKEN);
        Map<String, Object> additionalParameters = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            if (!TOKEN_RESPONSE_PARAMETER_NAMES.contains(entry.getKey())) {
                additionalParameters.put(entry.getKey(), entry.getValue());
            }
        }
        return OAuth2AccessTokenResponse.withToken(accessToken)
                // 如果token type为空，给个默认值
                .tokenType(accessTokenType == null ? OAuth2AccessToken.TokenType.BEARER : accessTokenType)
                .expiresIn(expiresIn)
                .scopes(scopes)
                .refreshToken(refreshToken)
                .additionalParameters(additionalParameters)
                .build();
    }

    private static OAuth2AccessToken.TokenType getAccessTokenType(Map<String, Object> tokenResponseParameters) {
        if (OAuth2AccessToken.TokenType.BEARER.getValue()
                .equalsIgnoreCase(getParameterValue(tokenResponseParameters, OAuth2ParameterNames.TOKEN_TYPE))) {
            return OAuth2AccessToken.TokenType.BEARER;
        }
        return null;
    }

    private static long getExpiresIn(Map<String, Object> tokenResponseParameters) {
        return getParameterValue(tokenResponseParameters, OAuth2ParameterNames.EXPIRES_IN, 0L);
    }

    private static Set<String> getScopes(Map<String, Object> tokenResponseParameters) {
        if (tokenResponseParameters.containsKey(OAuth2ParameterNames.SCOPE)) {
            String scope = getParameterValue(tokenResponseParameters, OAuth2ParameterNames.SCOPE);
            return new HashSet<>(Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
        }
        return Collections.emptySet();
    }

    private static String getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName) {
        Object obj = tokenResponseParameters.get(parameterName);
        return (obj != null) ? obj.toString() : null;
    }

    private static long getParameterValue(Map<String, Object> tokenResponseParameters, String parameterName,
                                          long defaultValue) {
        long parameterValue = defaultValue;

        Object obj = tokenResponseParameters.get(parameterName);
        if (obj != null) {
            // Final classes Long and Integer do not need to be coerced
            if (obj.getClass() == Long.class) {
                parameterValue = (Long) obj;
            }
            else if (obj.getClass() == Integer.class) {
                parameterValue = (Integer) obj;
            }
            else {
                // Attempt to coerce to a long (typically from a String)
                try {
                    parameterValue = Long.parseLong(obj.toString());
                }
                catch (NumberFormatException ignored) {
                }
            }
        }

        return parameterValue;
    }

}

```

#### 5. WechatUserRequestEntityConverter

```java
package com.light.sas.authorization.wechat;

import com.light.sas.authorization.baisc.adapter.OAuth2UserRequestEntityConverterAdapter;
import com.light.sas.constant.WechatParameterNames;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * 微信登录获取用户信息参数转换器
 */
@Component
public class WechatUserRequestEntityConverter extends OAuth2UserRequestEntityConverterAdapter {

    @Override
    public boolean test(OAuth2UserRequest userRequest) {
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        return WechatParameterNames.THIRD_LOGIN_WECHAT.equals(clientRegistration.getRegistrationId());
    }

    @Override
    public RequestEntity<?> convert(OAuth2UserRequest userRequest) {
        // 获取配置文件中的客户端信息
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        if (WechatParameterNames.THIRD_LOGIN_WECHAT.equals(clientRegistration.getRegistrationId())) {
            // 对于微信登录的特殊处理，请求用户信息时添加openid与access_token参数
            Object openid = userRequest.getAdditionalParameters().get(WechatParameterNames.OPEN_ID);
            URI uri = UriComponentsBuilder
                    .fromUriString(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUri())
                    .queryParam(WechatParameterNames.OPEN_ID, openid)
                    .queryParam(OAuth2ParameterNames.ACCESS_TOKEN, userRequest.getAccessToken().getTokenValue())
                    .build().toUri();
            return new RequestEntity<>(HttpMethod.GET, uri);
        }
        return super.convert(userRequest);
    }
}

```

#### 6. WechatUserResponseConverter

```java
package com.light.sas.authorization.wechat;

import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.util.ArrayList;
import java.util.List;

/**
 * 微信用户信息响应转换器
 */
public class WechatUserResponseConverter extends MappingJackson2HttpMessageConverter {

    public WechatUserResponseConverter() {
        List<MediaType> mediaTypes = new ArrayList<>(super.getSupportedMediaTypes());
        // 微信获取用户信息时响应的类型为“text/plain”，这里特殊处理一下
        mediaTypes.add(MediaType.TEXT_PLAIN);
        super.setSupportedMediaTypes(mediaTypes);
    }

}

```

#### 7. WechatParameterNames

```java
package com.light.sas.constant;

/**
 * 微信登录相关常量参数
 */
public class WechatParameterNames {

    /**
     * 三方登录类型——Wechat
     */
    public static final String THIRD_LOGIN_WECHAT = "wechat";

    /**
     * 微信登录相关参数——appid：微信的应用id
     */
    public static final String APP_ID = "appid";

    /**
     * 微信登录相关参数——secret：微信的应用秘钥
     */
    public static final String APP_SECRET = "secret";

    /**
     * 微信登录相关参数——openid：用户唯一id
     */
    public static final String OPEN_ID = "openid";

    /**
     * 微信登录相关参数——unionid：用户唯一id
     */
    public static final String UNION_ID = "unionid";

    /**
     * 微信登录相关参数——forcePopup：强制此次授权需要用户弹窗确认
     */
    public static final String FORCE_POPUP = "forcePopup";

}

```

### 6. 配置适配器、委托类到OAuth2 配置类

#### 1. BasicAuthorizationRequestResolver

```java
package com.light.sas.authorization.baisc;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

/**
 * 基础授权请求处理类
 */
public class BasicAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver;

    public BasicAuthorizationRequestResolver(DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver) {
        this.authorizationRequestResolver = authorizationRequestResolver;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return this.authorizationRequestResolver.resolve(request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return this.authorizationRequestResolver.resolve(request, clientRegistrationId);
    }
}

```

#### 2. BeanConfig

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

#### 3. ResourceConfig

```java
package com.light.sas.config;

import com.light.sas.authorization.baisc.BasicAuthorizationRequestResolver;
import com.light.sas.authorization.baisc.delegator.OAuth2AccessTokenResponseClientDelegator;
import com.light.sas.authorization.dingtalk.DingTalkOAuth2LoginAuthenticationProvider;
import com.light.sas.authorization.handler.LoginFailureHandler;
import com.light.sas.authorization.handler.LoginSuccessHandler;
import com.light.sas.properties.CustomSecurityProperties;
import com.light.sas.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.web.filter.CorsFilter;

/**
 * 资源服务器配置
 * <p>
 * {@link EnableMethodSecurity} 开启全局方法认证，启用JSR250注解支持，启用注解 {@link Secured} 支持，
 * 在Spring Security 6.0版本中将@Configuration注解从@EnableWebSecurity, @EnableMethodSecurity, @EnableGlobalMethodSecurity
 * 和 @EnableGlobalAuthentication 中移除，使用这些注解需手动添加 @Configuration 注解
 * {@link EnableWebSecurity} 注解有两个作用:
 * 1. 加载了WebSecurityConfiguration配置类, 配置安全认证策略。
 * 2. 加载了AuthenticationConfiguration, 配置了认证信息。
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class ResourceConfig {

    private final CorsFilter corsFilter;

    /**
     * 不需要认证即可访问的路径
     */
    private final CustomSecurityProperties customSecurityProperties;

    private final OAuth2AccessTokenResponseClientDelegator accessTokenResponseClientDelegator;

    private final BasicAuthorizationRequestResolver authorizationRequestResolver;

    private final DingTalkOAuth2LoginAuthenticationProvider dingTalkOAuth2LoginAuthenticationProvider;

    /**
     * 配置认证相关的过滤器链(资源服务，客户端配置)
     *
     * @param http spring security核心配置类
     * @return 过滤器链
     * @throws Exception 抛出
     */
    @Bean
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        // 添加基础的认证配置
        SecurityUtils.applyBasicSecurity(http, corsFilter, customSecurityProperties);

        http.authorizeHttpRequests((authorize) -> authorize
                        // 放行静态资源和不需要认证的url
                        .requestMatchers(customSecurityProperties.getIgnoreUriList().toArray(new String[0])).permitAll()
                        .anyRequest().authenticated()
                )
                // 指定登录页面
                .formLogin(formLogin -> {
                            formLogin.loginPage("/login");
                            if (UrlUtils.isAbsoluteUrl(customSecurityProperties.getLoginUrl())) {
                                // 绝对路径代表是前后端分离，登录成功和失败改为写回json，不重定向了
                                formLogin.successHandler(new LoginSuccessHandler());
                                formLogin.failureHandler(new LoginFailureHandler());
                            }
                        }
                );

        // 自定义钉钉认证登录认证提供
        http.authenticationProvider(dingTalkOAuth2LoginAuthenticationProvider);

        // 联合身份认证
        http.oauth2Login(oauth2Login -> oauth2Login
                .loginPage(customSecurityProperties.getLoginUrl())
                .authorizationEndpoint(authorization -> authorization
                        .authorizationRequestResolver(this.authorizationRequestResolver)
                )
                .tokenEndpoint(token -> token
                        .accessTokenResponseClient(this.accessTokenResponseClientDelegator)
                )
        );

        return http.build();
    }

}

```

#### 4. TestController

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
    @PreAuthorize("hasAuthority('SCOPE_message.read')")
    public String test01() {
        return "test01";
    }

    @GetMapping("/test02")
    @PreAuthorize("hasAuthority('SCOPE_message.write')")
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

#### 5. CustomOAuth2UserService

```java
package com.light.sas.service.impl;

import com.light.sas.authorization.baisc.delegator.OAuth2UserRequestEntityConverterDelegator;
import com.light.sas.authorization.dingtalk.DingTalkUserResponseConverter;
import com.light.sas.authorization.wechat.WechatUserResponseConverter;
import com.light.sas.authorization.wecom.WecomUserResponseConverter;
import com.light.sas.constant.SecurityConstants;
import com.light.sas.entity.OAuth2ThirdAccount;
import com.light.sas.exception.InvalidCaptchaException;
import com.light.sas.service.OAuth2ThirdAccountService;
import com.light.sas.strategy.context.OAuth2UserConverterContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ResourceHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.support.AllEncompassingFormHttpMessageConverter;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.WebAttributes;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.LinkedHashMap;
import java.util.List;

/**
 * 自定义三方oauth2登录获取用户信息服务
 */
@Slf4j
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final OAuth2ThirdAccountService thirdAccountService;

    private final OAuth2UserConverterContext userConverterContext;

    public CustomOAuth2UserService(OAuth2ThirdAccountService thirdAccountService,
                                   OAuth2UserConverterContext userConverterContext,
                                   OAuth2UserRequestEntityConverterDelegator userRequestEntityConverterDelegator) {
        this.thirdAccountService = thirdAccountService;
        this.userConverterContext = userConverterContext;
        // 初始化时添加微信用户信息请求处理，oidcUserService本质上是调用该类获取用户信息的，不用添加
        super.setRequestEntityConverter(userRequestEntityConverterDelegator);
        // 设置用户信息转换器
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        List<HttpMessageConverter<?>> messageConverters = List.of(
                new StringHttpMessageConverter(),
                // 获取微信用户信息时使其支持“text/plain”
                new WechatUserResponseConverter(),
                new WecomUserResponseConverter(),
                new DingTalkUserResponseConverter(),
                new ResourceHttpMessageConverter(),
                new ByteArrayHttpMessageConverter(),
                new AllEncompassingFormHttpMessageConverter()
        );
        restTemplate.setMessageConverters(messageConverters);
        super.setRestOperations(restTemplate);
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User auth2User = super.loadUser(userRequest);
            // 转为项目中的三方用户信息
            OAuth2ThirdAccount oauth2ThirdAccount = userConverterContext.convert(userRequest, auth2User);
            // 检查用户信息
            thirdAccountService.checkAndSaveUser(oauth2ThirdAccount);
            // 将loginType设置至attributes中
            LinkedHashMap<String, Object> attributes = new LinkedHashMap<>(auth2User.getAttributes());
            // 将RegistrationId当做登录类型
            attributes.put(SecurityConstants.LOGIN_TYPE_NAME, userRequest.getClientRegistration().getRegistrationId());
            String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint()
                    .getUserNameAttributeName();
            return new DefaultOAuth2User(auth2User.getAuthorities(), attributes, userNameAttributeName);
        } catch (Exception e) {
            log.error("Load user info error", e);
            // 获取当前request
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes == null) {
                throw new InvalidCaptchaException("Failed to get the current request.");
            }
            HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
            // 将异常放入session中
            request.getSession(Boolean.FALSE).setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, e);
            throw new AuthenticationServiceException(e.getMessage(), e);
        }
    }
}
```

#### 6. application.yaml

```yaml
server:
  port: 8080
#  # 注意强制设置 session 的域名，可能导致session失效
#  servlet:
#    session:
#      cookie:
#        domain: 127.0.0.1

spring:
  jackson:
    default-property-inclusion: non_null
  datasource:
    driver-class-name: org.postgresql.Driver
    url: jdbc:postgresql://localhost:5432/sas?stringtype=unspecified
    username: postgres
    password: postgres
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: ''
      database: 0
      timeout: 3000
      lettuce:
        pool:
          min-idle: 5
          max-idle: 10
          max-active: 10
          max-wait: 1000
  security:
    oauth2:
      client:
        registration:
          # 这个'gitee'就是registrationId
          gitee:
            # 指定oauth登录提供者，该oauth登录由provider中的gitee来处理
            provider: gitee
            # 客户端名字
            client-name: Sign in with Gitee
            # 认证方式
            authorization-grant-type: authorization_code
            # 客户端id，使用自己的gitee的客户端id
            client-id: 2ec8d36a4d6afdadf831513d4d888552bd98fe69e26fc23828dff95ee52dd092
            # 客户端秘钥，使用自己的gitee的客户端秘钥
            client-secret: 0d2b08cbff9d5d2f7549420ee343e847838cd885315089db2cbda5044217bf36
            # 回调地址
            redirect-uri: '{baseUrl}/login/oauth2/code/{registrationId}'
            # 申请scope列表
            scope:
              - emails
              - projects
          github:
            # security client默认实现了GitHub提供的oauth2登录
            provider: github
            client-id: 701a063664c42f669d7b
            client-secret: 68cf372920e6ea6ded19d44a36fc4f2afe5aaec6
          wechat:
            # 微信登录配置
            provider: wechat
            # 客户端名字
            client-name: Sign in with WeChat
            # 认证方式
            authorization-grant-type: authorization_code
            # 客户端id，使用自己的微信的appid
            client-id: wx46885fab83517dbd
            # 客户端秘钥，使用自己的微信的app secret
            client-secret: 3e975a60d1457677b5093aa8feddc34a
            # 回调地址，设置为认证服务的回调地址，由认证服务用code换取token
            redirect-uri: '{baseUrl}/login/oauth2/code/{registrationId}'
            # 申请scope列表
            scope:
              - snsapi_userinfo
          wecom:
            provider: wecom
            client-name: Torch
            agent_id: 1000007
            # client-id为企业微信 的企业ID
            client-id: ww230acfa317019076
            # client-secret企业微信对应应用的secret，每个企业微信应用都有独立的secret，不要搞错
            client-secret: WmCHmEl2Y18w9PS3JiUPrMwWhRAXVUcfIaf44Jp5JuQ
            authorization-grant-type: authorization_code
            # http://968395c.r3.cpolar.top/oauth2/authorization/wecom
            redirect-uri: http://968395c.r3.cpolar.top/login/oauth2/code/wecom
          ding_talk:
            provider: ding_talk
            client-name: Torch
            app-id: 33d69354-9ac9-4776-950d-69bbea315757
            agent-id: 2970491842
            # client-id为钉钉应用ID
            client-id: dingutlbtrmynzsxoznm
            # client-secret钉钉应用的secret
            client-secret: 6GG1WRTTyfxArA3TuRB6tSvOn2kpDMxrhC64pVhhndgvsIlMJlitX_f4TYkInrsZ
            authorization-grant-type: authorization_code
            # http://968395c.r3.cpolar.top/oauth2/authorization/ding_talk
            redirect-uri: http://968395c.r3.cpolar.top/login/oauth2/code/ding_talk
            scope:
              - openid
        # oauth登录提供商
        provider:
          # gitee的OAuth2端点配置
          gitee:
            # 设置用户信息响应体中账号的字段
            user-name-attribute: login
            # 获取token的地址
            token-uri: https://gitee.com/oauth/token
            # 获取用户信息的地址
            user-info-uri: https://gitee.com/api/v5/user
            # 发起授权申请的地址
            authorization-uri: https://gitee.com/oauth/authorize
          # github的OAuth2端点配置
          github:
            user-name-attribute: login
          # 微信的OAuth2端点配置
          wechat:
            # 设置用户信息响应体中账号的字段
            user-name-attribute: nickname
            # 获取token的地址 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
            token-uri: https://api.weixin.qq.com/sns/oauth2/access_token
            # 获取用户信息的地址 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#3
            user-info-uri: https://api.weixin.qq.com/sns/userinfo
            # 发起授权申请的地址 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#0
            authorization-uri: https://open.weixin.qq.com/connect/oauth2/authorize
          wecom:
            authorization-uri: https://open.work.weixin.qq.com/wwopen/sso/qrConnect
            token-uri: https://qyapi.weixin.qq.com/cgi-bin/gettoken
            user-info-uri: https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo
            user-name-attribute: userid
          ding_talk:
            authorization-uri: https://login.dingtalk.com/oauth2/auth
            token-uri: https://api.dingtalk.com/v1.0/oauth2/userAccessToken
            user-info-uri: https://api.dingtalk.com/v1.0/contact/users/{unionId}
            jwk-set-uri: http://127.0.0.1:8080/oauth2/jwks
            user-name-attribute: nick

# Mybatis-Plus 配置
mybatis-plus:
  # 扫描mapper文件
  mapper-locations:
    - classpath*:mapper/**/*Mapper.xml

logging:
  level:
    org.springframework.security: debug
    com.light.sas: debug

custom:
  # 自定义认证配置
  security:
    # 授权服务地址
    issuer-url: http://127.0.0.1:8080
    # 登录页面路径
    login-url: http://127.0.0.1:5173/login
    # 授权确认页面路径
    consent-page-uri: http://127.0.0.1:5173/consent
    # 设备码验证页面
    device-activate-uri: http://127.0.0.1:5173/activate
    # 设备码验证成功页面
    device-activated-uri: http://127.0.0.1:5173/activated
    # 不需要认证的地址
    ignore-uri-list: assets/**, /webjars/**, /login, /getCaptcha, /getSmsCaptcha, /error, /oauth2/consent/parameters, /test03, /favicon.ico, /qrCode/login/**

```

## 五、测试

```shell
# 使用浏览器访问下面链接，分别对应企业微信 钉钉的登录
http://968395c.r3.cpolar.top/oauth2/authorization/wecom

http://968395c.r3.cpolar.top/oauth2/authorization/ding_talk
```
