- [Spring Authorization Server入门 (一) 初识SpringAuthorizationServer和OAuth2.1协议](https://juejin.cn/post/7239953874950733884)

## 一、什么是OAuth2.1？
经过近些年网络和设备的不断发展，之前的oauth2.0发布的授权协议标准已经远远不能满足现在的场景和需求，根据其安全最佳实践，在oauth2.0的基础上移除了一些不安全的授权方式，并且对扩展协议进行整合。该协议定义了一系列关于授权的开放网络标准，允许用户授权第三方应用访问他们存储在另外的服务提供者上的信息。现在各三方平台提供的授权登录基本都是基于oauth协议的，例如微信、QQ、GitHub和Gitee等平台提供的授权登录。而Spring Security的团队也在社区的推动下推出了基于oauth2.1协议的授权框架：[Spring Authorization Server](https://spring.io/projects/spring-authorization-server/)。

## 二、什么是Spring Authorization Server？
Spring authorization server是由社区推动的一个项目，在Spring security团队的领导下基于[Nimbus](https://connect2id.com/products/nimbus-oauth-openid-connect-sdk)库重头编写，其目的主要是为 Spring 社区提供 OAuth 2.0 授权服务器支持，替代已被废弃的Spring Security OAuth框架。Spring authorization server提供了OAuth 2.1和OpenID Connect 1.0规范以及其他相关规范的实现。

## 三、Spring Authorization Server根据oauth2.1规范实现的特性列表
在列出特性时也会根据特性说明该特性对应的oauth2.1规范。

### 1. 认证功能列表
角色解释(摘抄自oauth2.1规范文档 [Roles](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07#name-roles))

- `Resource Owner`：资源拥有者；能够授予对受保护资源的访问权限的实体，通常指的是终端用户。
- `Client`：客户端；代表资源所有者发出受保护资源请求并获得其授权的应用程序。
- `Authorization Server`：认证服务器；服务器在成功对资源所有者进行身份验证并获得授权后向客户端发出访问令牌。
- `Resource Server`：资源服务器；托管受保护资源的服务器，能够使用访问令牌接受和响应受保护的资源请求。

### 2. 授权码模式
授权码模式（Authorization Code Grant）是功能最完整、流程最严密的授权模式。它的特点就是通过客户端的后台服务器，与"服务提供商"的认证服务器进行互动；流程如下

```
 +----------+
 | Resource |
 |   Owner  |
 +----------+
       ^
       |
       |
 +-----|----+          Client Identifier      +---------------+
 | .---+---------(1)-- & Redirection URI ---->|               |
 | |   |    |                                 |               |
 | |   '---------(2)-- User authenticates --->|               |
 | | User-  |                                 | Authorization |
 | | Agent  |                                 |     Server    |
 | |        |                                 |               |
 | |    .--------(3)-- Authorization Code ---<|               |
 +-|----|---+                                 +---------------+
   |    |                                         ^      v
   |    |                                         |      |
   ^    v                                         |      |
 +---------+                                      |      |
 |         |>---(4)-- Authorization Code ---------'      |
 |  Client |          & Redirection URI                  |
 |         |                                             |
 |         |<---(5)----- Access Token -------------------'
 +---------+       (w/ Optional Refresh Token)
```
                     Figure 3: Authorization Code Flow

更详细内容请查看规范中关于授权码模式的介绍. [4.1. Authorization Code Grant](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07#name-authorization-code-grant)

### 3. 授权码扩展流程PKCE(Proof Key for Code Exchange)
使用授权码授予的OAuth 2.0公共客户端是易受授权码拦截攻击。该流程可以减轻攻击，通过使用代码交换证明密钥来抵御威胁。客户端生成code_verifier和code_challenge跟认证服务器进行交互，以生成的随机认证码进行身份认证。

```
                                                 +-------------------+
                                                 |   Authz Server    |
       +--------+                                | +---------------+ |
       |        |--(A)- Authorization Request ---->|               | |
       |        |       + t(code_verifier), t_m  | | Authorization | |
       |        |                                | |    Endpoint   | |
       |        |<-(B)---- Authorization Code -----|               | |
       |        |                                | +---------------+ |
       | Client |                                |                   |
       |        |                                | +---------------+ |
       |        |--(C)-- Access Token Request ---->|               | |
       |        |          + code_verifier       | |    Token      | |
       |        |                                | |   Endpoint    | |
       |        |<-(D)------ Access Token ---------|               | |
       +--------+                                | +---------------+ |
                                                 +-------------------+
```
                     Figure 2: Abstract Protocol Flow

更详细内容请查看规范中关于PKCE的介绍. [rfc7636](https://datatracker.ietf.org/doc/html/rfc7636)


### 4. 客户端模式
客户端模式（Client Credentials Grant）指客户端以自己的名义，而不是以用户的名义，向"服务提供商"进行认证。严格地说，客户端模式并不属于OAuth框架所要解决的问题。在这种模式中，用户直接向客户端注册，客户端以自己的名义要求"服务提供商"提供服务，其实不存在授权问题；流程如下

```
     +---------+                                  +---------------+
     |         |                                  |               |
     |         |>--(1)- Client Authentication --->| Authorization |
     | Client  |                                  |     Server    |
     |         |<--(2)---- Access Token ---------<|               |
     |         |                                  |               |
     +---------+                                  +---------------+
```
                     Figure 4: Client Credentials Grant

更详细内容请查看规范中关于客户端模式的介绍. [4.2. Client Credentials Grant](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07#name-client-credentials-grant)

### 5. 设备授权码模式
设备授权码模式（Device Authorization Grant）主要会出现在凭证式授权类型中，为设备代码，设备流中无浏览器或输入受限的设备提供的一种认证方式，设备会让用户在另一台设备上的浏览器中访问一个网页，以进行登录。 用户登录后，设备可以获取所需的访问令牌和刷新令牌；流程如下

```
      +----------+                                +----------------+
      |          |>---(A)-- Client Identifier --->|                |
      |          |                                |                |
      |          |<---(B)-- Device Code,      ---<|                |
      |          |          User Code,            |                |
      |  Device  |          & Verification URI    |                |
      |  Client  |                                |                |
      |          |  [polling]                     |                |
      |          |>---(E)-- Device Code       --->|                |
      |          |          & Client Identifier   |                |
      |          |                                |  Authorization |
      |          |<---(F)-- Access Token      ---<|     Server     |
      +----------+   (& Optional Refresh Token)   |                |
            v                                     |                |
            :                                     |                |
           (C) User Code & Verification URI       |                |
            :                                     |                |
            v                                     |                |
      +----------+                                |                |
      | End User |                                |                |
      |    at    |<---(D)-- End user reviews  --->|                |
      |  Browser |          authorization request |                |
      +----------+                                +----------------+
```
                    Figure 1: Device Authorization Flow

更详细内容请查看规范中关于设备授权码模式的介绍. [rfc8628](https://datatracker.ietf.org/doc/html/rfc8628)


### 6. 刷新access token
刷新令牌在获取access token时会同步获取刷新令牌(Refresh token)，如果用户访问的时候，客户端的"访问令牌"已经过期，则需要使用"更新令牌(Refresh token)"申请一个新的访问令牌。


**注意：** 
oauth2.1移除了隐式授权模式(Implicit grant)和密码模式(Resource Owner Password Credentials Grant)。详见oauth2.1规范中提到的“[与oauth2.0的区别](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-00#name-differences-from-oauth-20)”和oauth2.0规范中对于“[密码模式](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#name-resource-owner-password-cre)”的描述：*The resource owner password credentials grant [[RFC6749]](https://www.rfc-editor.org/info/rfc6749) MUST NOT be used.*


## 四、Token生成
- 令牌生成器

框架提供了令牌生成器（OAuth2TokenGenerator），负责从提供的OAuth2TokenContext中根据TokenType类型生成对应的OAuth2Token，tokenGenerator很灵活，它可以支持access_token和refresh_token的任何自定义令牌格式。


- JWT [RFC 7519](https://tools.ietf.org/html/rfc7519)


- JWS [RFC 7515](https://tools.ietf.org/html/rfc7515)


## 五、客户端认证方式
### 1. client_secret_basic
客户端将clientId 和 clientSecret 通过 ‘:’ 号拼接，并使用 Base64 进行编码得到一个字符串。将此编码字符串放到请求头(Authorization)去发送请求。授权服务器通过获取请求头中的clientId和clientSecret对客户端进行认证。

### 2. client_secret_post
客户端将 clientId 和 clientSecret 放到请求体(表单)去发送请求。授权服务器获取请求参数中的clientId和clientSecret对客户端进行认证。

### 3. client_secret_jwt
client_secret_jwt方式就是利用 JWT 进行认证。请求方和授权服务器，两者都知道客户端的 client_secret，通过相同的 HMAC 算法（对称签名算法）去加签和验签 JWT ，可以达到客户端认证的目的。请求方通过HMAC算法，以 client_secret 作为密钥，将客户端信息加签生成 JWT；授权服务器使用相同的HMAC算法和client_secret，对请求方的 JWT 进行验签以认证客户端。

### 4. private_key_jwt
private_key_jwt 方式就是利用 JWT 进行认证；请求方拥有自己的公私钥（密钥对），使用私钥对 JWT 加签，并将公钥暴露给授权服务器；授权服务器通过请求方的公钥验证 JWT，也能达到客户端认证的目的。请求方维护了一对公私钥，通过 RSA算法，使用私钥将客户端信息加签生成 JWT；另外还通过接口暴露公钥给授权服务器；授权服务器使用请求方的公钥对请求方的 JWT进行验签以认证客户端。

### 5. none (public clients)
当客户端是公共客户端时认证服务器不会对客户端进行验证，PKCE(Proof Key for Code Exchange)流程要求客户端为公共客户端。


## 六、认证服务器端点

包含OAuth2.1和Open Connect 1.0相关端点，详见官网对于[端点](https://docs.spring.io/spring-authorization-server/reference/overview.html)的介绍文档

## 七、总结
本篇文章只是一个引子，很多地方说的很简单，大概了解了一些关于spring Authorization Server和oauth协议的相关内容，如果对某个点感兴趣可以针对性的去读一些相关的文章。
