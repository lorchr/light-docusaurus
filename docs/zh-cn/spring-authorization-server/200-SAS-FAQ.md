- [Spring Authorization Server常见问题解答(FAQ)](https://juejin.cn/post/7279242389000208438)

## 一、常见问题解答
### 1. 访问授权申请(`/oauth2/authorize`)接口跳转到默认登录页面，登录成功后响应错误码999
#### 1. 错误示例
```json
{"timestamp":"2023-06-24 01:08:42","status":999,"error":"None"}
```

#### 2. 可能造成该问题的原因：

1. 登录页面的某些静态资源被拦截了，在资源服务器中放行登录页面的所有静态资源
2. 未放行路径`/error`，当登录页面的某些静态资源不存在导致404时会跳转到`/error`处理，未放行该路径会导致请求重定向至登录页面

#### 3. 以上问题排查建议：

1. 浏览器打开登录页面(http://127.0.0.1:8080/login)， 然后按F12，看一下控制台中有哪些请求是302并且被重定向至登录页面的

### 2. 访问授权申请(`/oauth2/authorize`)接口跳转到默认登录页面，登录成功后跳转回来时授权申请(`/oauth2/authorize`)接口响应400错误
检查数据库中是否存在授权申请使用的客户端信息，因为最终客户端信息是在数据库中存储着的。

### 3. 访问授权申请(`/oauth2/authorize`)接口跳转到默认登录页面，登录成功后跳转回来时授权申请(`/oauth2/authorize`)接口响应404错误

在添加认证服务配置与资源服务配置时两个过滤器链不要添加`@Order`注解，以防认证服务配置被覆盖
如果有网关代理，记得认证服务配置中的签发地址(`issue`)中需要添加网关的代理路径

### 4. 在PKCE流程中通过token(`/oauth2/token`)接口获取token时，响应 `invalid_grant`
#### 1. 错误示例
```json
{"error":"invalid_grant"}
```

#### 2. 可能造成该问题的原因

1. 授权码错误
2. 客户端id错误
3. 回调地址错误(跟请求`/oauth2/authorize`时携带的不一致)
4. 授权码过期
5. 生成`code_challenge`的算法有问题


### 5. 在OAuth2流程中通过token(`/oauth2/token`)接口获取token时，响应 `invalid_client`
#### 1. 错误示例
```json
{"error":"invalid_client"}
```

#### 2. 可能造成该问题的原因

1. 客户端id错误

### 6. client 授权登录后 如何退出呢？
Spring Security 提供了退出的端点：`/logout`

### 7. 直接配置 `@PreAuthorize` 注解不生效
检查是否添加以下两个注解
```java
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
```

详见本系列的第九篇文章: [Spring Authorization Server入门 (九) Spring Boot引入Resource Server对接认证服务](https://juejin.cn/post/7244043482772029498)

### 8. 客户端对接认证服务时出现`[authorization_request_not_found]`异常
认证服务器和客户端在同一个机器上时不能使用同一个ip，例如`127.0.0.1`，在存储cookie时不会区分端口的，比如`127.0.0.1:8000`和`127.0.0.1:8080`这两个，他们的cookie是同一个的，后者会覆盖前者；如果配置认证服务的地址是`127.0.0.1:8080`然后通过`127.0.0.1:8000`去访问客户端则会在登录后出现`[authorization_request_not_found]`异常，详见[spring-security issues 5946](https://github.com/spring-projects/spring-security/issues/5946)

如果使用的是域名，可以解析两个子域名，一个解析到认证服务，一个解析到客户端服务

### 9. 如果不用这个web页面登录，有个接口，然后用安卓界面登录呢，应该用什么处理方式？
移动app和pc的app用的比较多的是PKCE模式，如果不想跳转到web登录页面就用自定义`grant_type`的方式添加一种认证并获取token的grant，比如系列文章中的自定义`grant_type`，那种是访问接口就直接响应`access token`了

### 10. oidc中的`idToken`到底有什么用？一路看过来也没看到有用这个token的地方
`idToken`中包含了用户信息，解析后可以直接获取用户信息，不用再请求服务器了

### 11. 使用自定义的`UserDetailsService`登录时出现序列化问题
#### 1. 异常堆栈描述
```shell
java.lang.IllegalArgumentException: The class with com.example.entity.Oauth2BasicUser and name of com.example.entity.Oauth2BasicUser is not in the allowlist. If you believe this class is safe to deserialize, please provide an explicit mapping using Jackson annotations or by providing a Mixin. If the serialization is only done by a trusted source, you can also enable default typing. See github.com for details
```

#### 2. 解决方案

实体类添加两个注解：`@JsonSerialize`与`@JsonIgnoreProperties(ignoreUnknown = true)`
- `@JsonSerialize`: 添加`JsonMixin`
- `@JsonIgnoreProperties(ignoreUnknown = true)`: 序列化时忽略未知字段

### 12. 按照教程搭建起来，结果登录时一直提示用户名密码不对
可能是注入了一个`UserDetailsService`，账号密码跟文中不同，但是使用的账号密码却是文章的账号密码

### 13. 为什么客户端的认证信息要在请求头中添加`Authorization`这个请求头，header的`Authorization` 参数值为Basic+空格+base64(clientId:clientSecret)
这是oauth2协议定的标准，客户端的认证方式设置为BasicAuth时认证信息是在header中是这么个格式，以base64编码后加上前缀放入header中，详见本系列的第一章：[Spring Authorization Server入门 (一) 初识SpringAuthorizationServer和OAuth2.1协议](https://juejin.cn/post/7239953874950733884)，里边介绍了客户端的各种认证方式

### 14. 要怎样继承改写`DaoAuthenticationProvider`，主要是继承了这个类，项目启动了发现并没有进入自己继承的这个`DaoAuthenticationProvider`的类操作。是啥问题
自己实现的没加`@Component`注解吗？如果加了那可能是在其它地方有provider实现被注入ioc中了；Security在初始化时会有个校验，好像是如果ioc中有多个`DaoAuthenticationProvider`的实例就只初始化默认的`DaoAuthenticationProvider`而不初始化子类，但是如果只有一个的话就会用ioc中的，所以不能多个实现都注入ioc

### 15. 使用Oracle数据库在授权申请时会抛出异常堆栈
框架问题，使用Oracle时确实会出现这种问题，如果需要解决可能需要重写`AuthorizationService`，详见[spring-authorization-server issues 428](https://github.com/spring-projects/spring-authorization-server/issues/428)

### 16. 集成 `spring-cloud-gateway` 出现 `OAuth2AuthenticationException: [invalid_user_info_response]`
- [Spring Security OAuth: [invalid_user_info_response]](https://stackoverflow.com/questions/76093710/spring-security-oauth-invalid-user-info-response)

新版本的`spring-security-oauth2-client` 修改了获取用户信息后的处理逻辑，见 `org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService#getUserInfo`，增加了对token签发 `subject` 的校验

```java
private Mono<OidcUserInfo> getUserInfo(OidcUserRequest userRequest) {
    if (!OidcUserRequestUtils.shouldRetrieveUserInfo(userRequest)) {
        return Mono.empty();
    }
    // @formatter:off
    return this.oauth2UserService
            .loadUser(userRequest)
            .map(OAuth2User::getAttributes)
            .map((claims) -> convertClaims(claims, userRequest.getClientRegistration()))
            .map(OidcUserInfo::new)
            .doOnNext((userInfo) -> {
                String subject = userInfo.getSubject();
                if (subject == null || !subject.equals(userRequest.getIdToken().getSubject())) {
                    OAuth2Error oauth2Error = new OAuth2Error(INVALID_USER_INFO_RESPONSE_ERROR_CODE);
                    throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());
                }
            });
    // @formatter:on
}
```


文章会记录可能遇到的问题，并给出一个解决方案，目前框架异常提示信息不完善，所以出现问题后很难排查，这里给出一些解决方案，让大家少走一些弯路；本篇文章持续更新中，欢迎各位读者指正、补充和完善，谢谢大家
