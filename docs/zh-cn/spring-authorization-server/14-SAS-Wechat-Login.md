- [Spring Authorization Server入门 (十四) 联合身份认证添加微信登录](https://juejin.cn/post/7261098261142208568)

## 一、前言
微信登录使用需要进行资质认证，虽然公众平台提供了测试号，但是测试号只能用在微信浏览器打开的网页中使用，如果将测试号用于扫码登录，则会提示scope参数错误；虽然微信登录的流程也是oauth的那一套流程，但是它要求的参数并不符合oauth的规范，所以想要集成进联合身份认证中则需要根据参数要求进行定制。

[微信公众平台测试号申请地址](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

接下来就该展示本人的三板斧了，理论、编码、测试。

如果不想看分析可以直接拉至中间的代码部分

## 二、定制分析
首先，打开[网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)的文档看一下微信登录并获取用户信息的流程，咱们根据文档一步步分析怎么去改造项目以适配微信登录

![img](./img/14/14-1.webp)

### 1. 第一步：用户同意授权获取code
参数列表(摘抄自微信登录文档)

| 参数             | 是否必须 | 说明                                                                                                                                                                                                           |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appid            | 是       | 公众号的唯一标识                                                                                                                                                                                               |
| redirect_uri     | 是       | 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理                                                                                                                                                   |
| response_type    | 是       | 返回类型，请填写code                                                                                                                                                                                           |
| scope            | 是       | 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ） |
| state            | 否       | 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节                                                                                                                                          |
| #wechat_redirect | 是       | 无论直接打开还是做页面302重定向时候，必须带此参数                                                                                                                                                              |
| forcePopup       | 否       | 强制此次授权需要用户弹窗确认；默认为false；需要注意的是，若用户命中了特殊场景下的静默授权逻辑，则此参数不生效                                                                                                  |


      参数中有一个`appid`的参数，这个参数的意思是跟`client_id`是一样的，但是名字是叫`appid`，如果直接用OAuth2 Client根据这些参数登录的话是走不下去的，因为OAuth2 Client不会带`appid`参数，只会带`client_id`参数，所以这时候就要在跳转至请求授权页面之前修改授权申请的参数。

去[Security OAuth2 Client文档](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html#_customizing_the_authorization_request)中找一下相关配置，发现文档中明确指出了自定义授权请求的配置，并给出了一个简单的示例，如下所示：

![img](./img/14/14-2.webp)

根据文档可知需要自定义一个`AuthorizationRequestResolver`来适配微信登录中的获取code

### 2. 第二步：通过code换取网页授权access_token
参数列表(摘抄自微信登录文档)

| 参数       | 是否必须 | 说明                     |
| ---------- | -------- | ------------------------ |
| appid      | 是       | 公众号的唯一标识         |
| secret     | 是       | 公众号的appsecret        |
| code       | 是       | 填写第一步获取的code参数 |
| grant_type | 是       | 填写为authorization_code |

跟上一步一样，`clientid`需要改为`appid`，`client_secret`需要改为`secret`，继续去文档上找一下相关配置，文档中是有相关自定义请求`access_token`配置，详见[Customizing the Access Token Request](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html#_customizing_the_access_token_request)，根据文档的说明可知需要自定义一个`CodeGrantRequestEntityConverter`来适配微信登录根据code获取`access_token`

![img](./img/14/14-3.webp)

响应参数列表

| 参数                   | 描述                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| access_token           | 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同 |
| expires_inaccess_token | 接口调用凭证超时时间，单位（秒）                                      |
| refresh_token          | 用户刷新access_token                                                  |
| openid                 | 用户唯一标识                                                          |
| scope                  | 用户授权的作用域，使用逗号（,）分隔                                   |

在这里放响应参数列表是因为它响应的数据跟框架需要的数据格式不一样，相较于标准响应多了一个`openid`，少了一个`token_type`，框架会自动将多出来的响应数据放入`additionalParameters`属性中，但是少的`tokenType`属性需要给一个默认的type，所以这里要给以自定义的转换类；同时也因为在获取用户信息时需要带上`openid`这个属性值。

刷新token部分如果需要的话可以去了解一下

### 3. 第三步：拉取用户信息(需scope为 snsapi_userinfo)
参数列表(摘抄自微信登录文档)

| 参数         | 描述                                                                  |
| ------------ | --------------------------------------------------------------------- |
| access_token | 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同 |
| openid       | 用户的唯一标识                                                        |
| lang         | 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语                 |

正如上一步句尾说的，要携带openid发起请求，并且要携带`access_token`参数，默认`access_token`是放在请求头中的，格式为：`Authorization: token_type access_token`，这里也要修改一下携带方式，如果看过上一篇文章的读者应该还记得我们是自己重写`OAuth2UserService`，文档中关于该类的描述中也提到了在请求用户信息之前的配置，需要提供一个`RequestEntityConverter`并通过`OAuth2UserService`的`setRequestEntityConverter`设置进去，详见[文档](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/advanced.html#oauth2login-advanced-oauth2-user-service)；所以这里也要提供一个`RequestEntityConverter`并添加至自定义`OAuth2UserService`中。

![img](./img/14/14-4.webp)

你以为这就完了吗？ Of course not!!! 框架在解析响应体的时候会根据`content-type`去解析，框架只会将`application/json`的`mediaType`解析为`bean`，不管是获取`token`还是获取用户信息的请求，框架都是用`restTemplate`发起请求，并且指定了响应数据的java类，以上提到的所有接口，除了获取code是重定向，其它都有响应，恶心的是微信响应回来的`content-type`是`text/plain`，框架会因为找不到解析的类型从而抛出异常，所以还要配置一下，让框架也解析`text/plain`数据。

在之前的文章中虽然本人自定义了很多内容，但是关于授权端点的请求与响应都没有去修改，用户信息接口直接返回了用户信息类，没有返回一个统一响应类的原因就在这里，如果修改了这些东西，那么等你将服务提供出去以后对接方会异常痛苦，并且可能边对接边骂(没错，正是在下)，相对于标准oauth2协议对接起来实在是太痛苦了。要牢记Spring Boot的“约定大于配置”。

## 三、编码部分
根据上边的分析发现，对接微信登录需要从头改到尾，授权申请、用`code`换取`token`和用`token`获取用户信息都要修改。

### 1. 编码内容

1. 编写`WechatAuthorizationRequestConsumer`类，授权申请接口携带的参数。
2. 编写`WechatCodeGrantRequestEntityConverter`类，修改`code`换取`access_token`时携带的参数。
3. 编写`WechatMapAccessTokenResponseConverter`类，根据响应数据生成`OAuth2AccessTokenResponse`类的实例。
4. 编写`WechatUserRequestEntityConverter`类，修改请求用户信息的参数。
5. 编写`WechatUserResponseConverter`类，让框架可以解析`text/plain`响应信息。
6. 将上边的类添加至配置中，使其生效。
7. 用户信息处理策略添加`WechatUserConverter`类，使其解析微信用户信息。
8. yml中添加微信应用配置信息。
9. 登录页面添加微信登录入口。

### 2. 在`com.example.authorization.wechat`包中添加`WechatAuthorizationRequestConsumer`类
判断是否微信登录，如果是微信登录则将`appid`添加至请求参数中
```java
/**
 * 自定义微信登录认证请求
 *
 * @author vains
 */
public class WechatAuthorizationRequestConsumer implements Consumer<OAuth2AuthorizationRequest.Builder> {

    @Override
    public void accept(OAuth2AuthorizationRequest.Builder builder) {
        OAuth2AuthorizationRequest authorizationRequest = builder.build();
        Object registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        if (Objects.equals(registrationId, THIRD_LOGIN_WECHAT)) {
            // 判断是否微信登录，如果是微信登录则将appid添加至请求参数中
            builder.additionalParameters((params) -> params.put(WECHAT_PARAMETER_FORCE_POPUP, true));
            builder.additionalParameters((params) -> params.put(WECHAT_PARAMETER_APPID, authorizationRequest.getClientId()));

            // 微信的PC端认证对参数顺序有强正则校验，修改参数顺序
            builder.parameters((params) -> {
                // 移除oauth2参数，顺序不对不能正常获取到微信授权码
                params.remove(OAuth2ParameterNames.RESPONSE_TYPE);
                params.remove(OAuth2ParameterNames.CLIENT_ID);
                params.remove(OAuth2ParameterNames.SCOPE);
                params.remove(OAuth2ParameterNames.STATE);
                params.remove(OAuth2ParameterNames.REDIRECT_URI);
                params.remove(SecurityConstants.WECHAT_PARAMETER_FORCE_POPUP);
                params.remove(SecurityConstants.WECHAT_PARAMETER_APPID);

                // 重新添加到参数中
                params.put(SecurityConstants.WECHAT_PARAMETER_APPID, authorizationRequest.getClientId());
                params.put(OAuth2ParameterNames.REDIRECT_URI, authorizationRequest.getRedirectUri());
                params.put(OAuth2ParameterNames.RESPONSE_TYPE, authorizationRequest.getResponseType().getValue());
                params.put(OAuth2ParameterNames.SCOPE, StringUtils.collectionToDelimitedString(authorizationRequest.getScopes(), " "));
                params.put(OAuth2ParameterNames.STATE, authorizationRequest.getState());
                params.put(OAuth2ParameterNames.CLIENT_ID, authorizationRequest.getClientId());
                params.put(SecurityConstants.WECHAT_PARAMETER_FORCE_POPUP, true);
            });
        }
    }

}
```

### 3. 在`com.example.authorization.wechat`包中添加`WechatCodeGrantRequestEntityConverter`类
如果是微信登录，获取`token`时携带`appid`参数与`secret`参数
```java
/**
 * 微信登录请求token入参处理类
 *
 * @author vains
 */
public class WechatCodeGrantRequestEntityConverter extends OAuth2AuthorizationCodeGrantRequestEntityConverter {

    @Override
    protected MultiValueMap<String, String> createParameters(OAuth2AuthorizationCodeGrantRequest authorizationCodeGrantRequest) {
        // 如果是微信登录，获取token时携带appid参数与secret参数
        MultiValueMap<String, String> parameters = super.createParameters(authorizationCodeGrantRequest);
        String registrationId = authorizationCodeGrantRequest.getClientRegistration().getRegistrationId();
        if (THIRD_LOGIN_WECHAT.equals(registrationId)) {
            // 如果当前是微信登录，携带appid和secret
            parameters.add(WECHAT_PARAMETER_APPID, authorizationCodeGrantRequest.getClientRegistration().getClientId());
            parameters.add(WECHAT_PARAMETER_SECRET, authorizationCodeGrantRequest.getClientRegistration().getClientSecret());
        }
        return parameters;
    }

     @Override
    public RequestEntity<?> convert(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        RequestEntity<?> requestEntity = super.convert(authorizationGrantRequest);
        String registrationId = authorizationGrantRequest.getClientRegistration().getRegistrationId();
        // 框架默认是POST请求，参数在form-data中，微信的token接口参数在queryParam中
        if (SecurityConstants.THIRD_LOGIN_WECHAT.equals(registrationId)) {
            URI url = requestEntity.getUrl();
            LinkedMultiValueMap<String, List<String>> body = (LinkedMultiValueMap<String, List<String>>) requestEntity.getBody();

            URI uri = UriComponentsBuilder
                    .fromUri(url)
                    .queryParam(SecurityConstants.WECHAT_PARAMETER_APPID, body.get(SecurityConstants.WECHAT_PARAMETER_APPID))
                    .queryParam(SecurityConstants.WECHAT_PARAMETER_SECRET, body.get(SecurityConstants.WECHAT_PARAMETER_SECRET))
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

### 4. 在`com.example.authorization.wechat`包中添加`WechatMapAccessTokenResponseConverter`类
这个类逻辑是默认的`DefaultMapOAuth2AccessTokenResponseConverter`类中的逻辑，唯一的改动就是在`token type`为空时给个默认值
```java
/**
 * 微信登录获取token的响应处理类
 *
 * @author vains
 */
public class WechatMapAccessTokenResponseConverter implements Converter<Map<String, Object>, OAuth2AccessTokenResponse> {

    private static final Set<String> TOKEN_RESPONSE_PARAMETER_NAMES = new HashSet<>(
            Arrays.asList(OAuth2ParameterNames.ACCESS_TOKEN, OAuth2ParameterNames.EXPIRES_IN,
                    OAuth2ParameterNames.REFRESH_TOKEN, OAuth2ParameterNames.SCOPE, OAuth2ParameterNames.TOKEN_TYPE));

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

### 5. 在`com.example.authorization.wechat`包中添加`WechatUserRequestEntityConverter`类
对于微信登录的特殊处理，请求用户信息时添加`openid`与`access_token`参数
```java
/**
 * 微信登录获取用户信息参数转换器
 *
 * @author vains
 */
public class WechatUserRequestEntityConverter extends OAuth2UserRequestEntityConverter {

    @Override
    public RequestEntity<?> convert(OAuth2UserRequest userRequest) {
        // 获取配置文件中的客户端信息
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        if (THIRD_LOGIN_WECHAT.equals(clientRegistration.getRegistrationId())) {
            // 对于微信登录的特殊处理，请求用户信息时添加openid与access_token参数
            Object openid = userRequest.getAdditionalParameters().get(WECHAT_PARAMETER_OPENID);
            URI uri = UriComponentsBuilder
                    .fromUriString(clientRegistration.getProviderDetails().getUserInfoEndpoint().getUri())
                    .queryParam(WECHAT_PARAMETER_OPENID, openid)
                    .queryParam(OAuth2ParameterNames.ACCESS_TOKEN, userRequest.getAccessToken().getTokenValue())
                    .build().toUri();
            return new RequestEntity<>(HttpMethod.GET, uri);
        }
        return super.convert(userRequest);
    }
}
```

### 6. 在`com.example.authorization.wechat`包中添加`WechatUserResponseConverter`类
微信获取用户信息时响应的类型为`text/plain`，这里特殊处理一下
```java
/**
 * 微信用户信息响应转换器
 *
 * @author vains
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

### 7. 将上边的类添加至配置中，使其生效
#### 1. `AuthorizationConfig`类的配置
```java
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
                        .requestMatchers("/assets/**", "/webjars/**", "/login", "/getCaptcha", "/getSmsCaptcha", "/error").permitAll()
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
        if (UrlUtils.isAbsoluteUrl(LOGIN_URL)) {
            http
                    // 当未登录时访问认证端点时重定向至login页面
                    .exceptionHandling((exceptions) -> exceptions
                            .defaultAuthenticationEntryPointFor(
                                    new LoginTargetAuthenticationEntryPoint(LOGIN_URL),
                                    new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                            )
                    );
        }
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
                        clientRegistrationRepository, "/oauth2/authorization");

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
```

#### 2. `CustomOauth2UserService`改造
移除类上的`@RequiredArgsConstructor`注解，自己实现构造方法，初始化时添加微信用户信息请求处理(`oidcUserService`本质上是调用该类获取用户信息的，不用添加)，设置用户信息转换器，获取微信用户信息时使其支持`text/plain`的`Context-Type`。添加异常处理，将异常信息放入`session`中，重定向至登录时可以获取到异常信息。
```java
/**
 * 自定义三方oauth2登录获取用户信息服务
 *
 * @author vains
 */
@Service
public class CustomOauth2UserService extends DefaultOAuth2UserService {

    private final IOauth2ThirdAccountService thirdAccountService;

    private final Oauth2UserConverterContext userConverterContext;

    public CustomOauth2UserService(IOauth2ThirdAccountService thirdAccountService, Oauth2UserConverterContext userConverterContext) {
        this.thirdAccountService = thirdAccountService;
        this.userConverterContext = userConverterContext;
        // 初始化时添加微信用户信息请求处理，oidcUserService本质上是调用该类获取用户信息的，不用添加
        super.setRequestEntityConverter(new WechatUserRequestEntityConverter());
        // 设置用户信息转换器
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        List<HttpMessageConverter<?>> messageConverters = List.of(
                new StringHttpMessageConverter(),
                // 获取微信用户信息时使其支持“text/plain”
                new WechatUserResponseConverter(),
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
            OAuth2User oAuth2User = super.loadUser(userRequest);
            // 转为项目中的三方用户信息
            Oauth2ThirdAccount oauth2ThirdAccount = userConverterContext.convert(userRequest, oAuth2User);
            // 检查用户信息
            thirdAccountService.checkAndSaveUser(oauth2ThirdAccount);
            // 将loginType设置至attributes中
            LinkedHashMap<String, Object> attributes = new LinkedHashMap<>(oAuth2User.getAttributes());
            // 将RegistrationId当做登录类型
            attributes.put("loginType", userRequest.getClientRegistration().getRegistrationId());
            String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint()
                    .getUserNameAttributeName();
            return new DefaultOAuth2User(oAuth2User.getAuthorities(), attributes, userNameAttributeName);
        } catch (Exception e) {
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

### 8. 用户信息处理策略添加`WechatUserConverter`类，使其解析微信用户信息
```java
/**
 * 微信用户信息转换器
 *
 * @author vains
 */
@RequiredArgsConstructor
@Component(THIRD_LOGIN_WECHAT)
public class WechatUserConverter implements Oauth2UserConverterStrategy {

    @Override
    public Oauth2ThirdAccount convert(OAuth2User oAuth2User) {
        // 获取三方用户信息
        Map<String, Object> attributes = oAuth2User.getAttributes();
        // 转换至Oauth2ThirdAccount
        Oauth2ThirdAccount thirdAccount = new Oauth2ThirdAccount();
        thirdAccount.setUniqueId(String.valueOf(attributes.get("openid")));
        thirdAccount.setThirdUsername(oAuth2User.getName());
        thirdAccount.setType(THIRD_LOGIN_WECHAT);
        thirdAccount.setLocation(attributes.get("province")+ " " + attributes.get("city"));
        // 设置基础用户信息
        thirdAccount.setName(oAuth2User.getName());
        thirdAccount.setAvatarUrl(String.valueOf(attributes.get("headimgurl")));
        return thirdAccount;
    }
}
```

### 9. yml中添加微信应用配置信息
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/authorization-example?serverTimezone=UTC&userUnicode=true&characterEncoding=utf-8
    username: root
    password: root
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
            client-id: 
            # 客户端秘钥，使用自己的gitee的客户端秘钥
            client-secret: 
            # 回调地址
            redirect-uri: http://192.168.1.102:8080/login/oauth2/code/gitee
            # 申请scope列表
            scope:
              - emails
              - projects
          github:
            # security client默认实现了GitHub提供的oauth2登录
            provider: github
            client-id: 
            client-secret: 
          wechat:
            # 微信登录配置
            provider: wechat
            # 客户端名字
            client-name: Sign in with WeChat
            # 认证方式
            authorization-grant-type: authorization_code
            # 客户端id，使用自己的微信的appid
            client-id: 
            # 客户端秘钥，使用自己的微信的app secret
            client-secret: 
            # 回调地址，设置为认证服务的回调地址，由认证服务用code换取token
            redirect-uri: http://192.168.1.102:8080/login/oauth2/code/wechat
            # 申请scope列表
            scope: snsapi_userinfo

        # oauth登录提供商
        provider:
          # 微信的OAuth2端点配置
          wechat:
            # 设置用户信息响应体中账号的字段
            user-name-attribute: nickname
            # 获取token的地址
            token-uri: https://api.weixin.qq.com/sns/oauth2/access_token
            # 获取用户信息的地址
            user-info-uri: https://api.weixin.qq.com/sns/userinfo
            # 发起授权申请的地址
            authorization-uri: https://open.weixin.qq.com/connect/oauth2/authorize
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
          github:
            user-name-attribute: login

# Mybatis-Plus 配置
mybatis-plus:
  # 扫描mapper文件
  mapper-locations:
    - classpath:com/vains/mapper/xml/*Mapper.xml
```

### 10. 登录页面添加微信登录入口
将上期的按钮改成图标了，重点的是点击微信登录按钮后要让请求跳转至`/oauth2/authorization/wechat`，`wechat`就是上边yml中微信应用的`registrationId`，这里要注意对应上
```html
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

    <a href="/oauth2/authorization/wechat" title="GitHub登录">
        <img width="28" style="margin-right: 5px; position: static;" alt="Sign in with GitHub"
             src="./assets/img/wechat_login.png"/>
    </a>
</div>
```

### 11.补充
`SecurityConstants`常量类中的常量
```java
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
```

到此为止编码部分就完成了，微信登录的图标可以去gitee上取一下或者自己找一下就行，代码仓库地址在最后的附录中。

## 四、微信测试号配置简要说明
微信应用配置中`appid`和`app secret`大家用自己的，如果没有认证资质也可以像作者这样去申请一个微信测试号去测试，因为这里限制了只有关注了测试公众号才可以使用，最多只能关注100个，所以大家去申请一个测试就ok。

下边我会放一下测试号的截图，要是真想用可以关注下测试号(有回调地址的限制)

| key       | value                            |
| --------- | -------------------------------- |
| appID     | wx946ad2f955901214               |
| appsecret | e4635ff2ed22c83294394ac818cf75a7 |

![img](./img/14/14-5.webp)

测试号的二维码，扫描关注后才可使用

![img](./img/14/14-6.webp)

**重要：** 想让联合认证流程走下去要修改回调地址为认证服务器的地址
点击修改，在弹出的框内输入认证服务的地址

![img](./img/14/14-7.webp)

修改回调地址

![img](./img/14/14-8.webp)

## 五、测试
测试号限制了只能在微信客户端打开授权申请地址，所以本次测试要在微信内打开认证服务的授权申请地址

### 1. 微信内打开授权申请地址
~~不知道为什么pc端微信跳转至微信的授权申请页面时是空白，这里我用手机进行测试。~~

经评论区提醒发现是因为参数的顺序问题，微信服务器会对授权申请地址的参数顺序做强校验(移动端微信应该是没有这个校验的)，文档原文：

> 尤其注意：由于授权操作安全等级较高，所以在发起授权请求时，微信会对授权链接做正则强匹配校验，如果链接的参数顺序不对，授权页面将无法正常访问。 

文档说明位置请查看[第一步：用户同意授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#%E7%9B%AE%E5%BD%95)，获取code下的正文内容。

```shell
http://192.168.1.102:8080/oauth2/authorize?client_id=messaging-client&response_type=code&scope=message.read&redirect_uri=http://127.0.0.1:8000/login/oauth2/code/messaging-client-oidc
```

### 2. 认证服务检测到未登录，重定向至登录页面

![img](./img/14/14-9.webp)

### 3. 点击微信登录图标，由认证服务重定向至微信的授权申请地址，微信浏览器弹框申请授权

![img](./img/14/14-10.webp)

### 4. 确认授权以后微信引导请求携带code重定向至认证服务，认证服务根据code换取access_token，再根据access_token和openid获取用户信息，获取到用户信息后重定向至认证服务的授权确认页面

![img](./img/14/14-11.webp)

### 5. 确认授权以后会发现页面没有跳转，这是因为请求认证服务的授权申请地址携带的redirect_uri是一个不可用的服务，加载失败了，虽然加载失败了但是当前链接已经是回调地址了，这时候可以点右上角的三个点，选择复制链接，然后就能获取code了

![img](./img/14/14-12.webp)

### 6. 在postman中根据code获取token

![img](./img/14/14-13.webp)

### 7. 根据token获取当前用户信息

![img](./img/14/14-14.webp)

### 8. 最后附上数据库用户信息截图

![img](./img/14/14-15.webp)

## 六、写在最后
虽然这次是用测试号对接的，但是实际上开放平台提供的扫码登录也是这个流程，直接替换`appid`和`app secret`为开放平台申请的应该能直接使用；

另外需要注意的是获取`access_token`时可能会返回`unionid`，这是在同一个微信开放平台账号下拥有多个移动应用、网站应用和公众账号，获取用户信息后用户信息中的`openid`可能不同，但是`unionid`是相同的，可以通过`unionid`区分用户。所以可以在三方用户表中多加一个字段来存放`unionid`或者`openid`。如果有什么问题或者更好的建议可以在下方评论区中提出

## 七、附录

- 微信网页授权登录文档：[地址](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
- 微信测试号申请地址：[地址](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
- Security OAuth2 Client文档地址：[地址](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- 代码地址：[Gitee](https://gitee.com/vains-Sofia/authorization-example)
