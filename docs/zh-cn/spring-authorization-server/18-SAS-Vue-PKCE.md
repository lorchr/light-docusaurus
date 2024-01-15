- [Spring Authorization Server入门 (十八) Vue项目使用PKCE模式对接认证服务](https://juejin.cn/post/7279265985912225828)

## 一、Vue单页面项目使用授权码模式对接流程说明
以下流程摘抄自官网

在本例中为授权代码流程。 授权码流程的步骤如下：

1. 客户端通过重定向到授权端点来发起 OAuth2 请求。 对于公共客户端，此步骤包括生成`code_verifier` 并计算`code_challenge`，然后将其作为查询参数发送。

2. 如果用户未通过身份验证，授权服务器将重定向到登录页面。 身份验证后，用户将再次重定向回授权端点。

3. 如果用户未同意所请求的范围并且需要同意，则会显示同意页面。

4. 一旦用户同意，授权服务器会生成一个`authorization_code`并通过`redirect_uri`重定向回客户端。

5. 客户端通过查询参数获取`authorization_code`并向[Token Endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-endpoint)发起请求。 对于公共客户端，此步骤包括发送code_verifier参数而不是用于身份验证的凭据。


## 二、Vue项目中修改内容
### 1. 安装`crypto-js`依赖
已安装可以忽略，该依赖是为了计算`Code Challenge`使用
```shell
npm install crypto-js
```

### 2. TypeScript下额外添加`@types/crypto-js`依赖
```shell
npm install @types/crypto-js
```

### 3. 编写公共方法
编写`Code Verifier`生成与`Code Challenge`的计算方法
#### 1. 创建PKCE工具js文件
```js
import CryptoJS from 'crypto-js'

/**
 * 生成 CodeVerifier
 *
 * return CodeVerifier
 */
export function generateCodeVerifier() {
    return generateRandomString(32)
}

/**
 * 生成随机字符串
 * @param length 随机字符串的长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

/**
 * 生成 Code Challenge
 * @param code_verifier 上边生成的 CodeVerifier
 * @returns Code Challenge
 */
export function generateCodeChallenge(code_verifier: string) {
    return base64URL(CryptoJS.SHA256(code_verifier))
}

/**
 * 将字符串base64加密后在转为url string
 * @param str 字符串
 * @returns bese64转码后转为url string
 */
export function base64URL(str: CryptoJS.lib.WordArray) {
    return str
        .toString(CryptoJS.enc.Base64)
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

/**
 * 将字符串加密为Base64格式的
 * @param str 将要转为base64的字符串
 * @returns 返回base64格式的字符串
 */
export function base64Str(str: string) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}
```

#### 2. 编写获取地址栏参数方法
略，已在上篇文章中贴出

#### 3. 编写请求Token方法
略，已在上篇文章中贴出

### 4. 在环境变量配置文件中添加配置
```js
# 认证服务地址(token签发地址)
VITE_OAUTH_ISSUER=http://127.0.0.1:8080
# PKCE流程使用的客户端Id
VITE_PKCE_CLIENT_ID=pkce-message-client
# 授权码模式使用的回调地址
VITE_PKCE_REDIRECT_URI=http://127.0.0.1:5173/PkceRedirect
```

### 5. 创建处理回调的页面`PkceRedirect.vue`
页面加载时会尝试从地址栏获取参数code，如果能获取到说明是从认证服务回调过来的，执行换取token流程，如果没有获取到code说明需要发起授权申请。跟之前的授权码流程是一致的。
```vue
<script setup lang="ts">
import router from '../../router'
import { getToken } from '@/api/Login'
import { getQueryString } from '@/util/GlobalUtils'
import { createDiscreteApi } from 'naive-ui'
import { generateCodeVerifier, generateCodeChallenge } from '@/util/pkce'

const { message } = createDiscreteApi(['message'])

// 生成CodeVerifier
let codeVerifier: string = generateCodeVerifier()
// codeChallenge
let codeChallenge: string = generateCodeChallenge(codeVerifier)
// 生成state
let state: string = generateCodeVerifier()

// 获取地址栏授权码
const code = getQueryString('code')

if (code) {
  // 从缓存中获取 codeVerifier
  const state = localStorage.getItem('state')
  // 校验state，防止cors
  const urlState = getQueryString('state')
  if (urlState !== state) {
    message.warning('state校验失败.')
  } else {
    // 从缓存中获取 codeVerifier
    const code_verifier = localStorage.getItem('codeVerifier')
    getToken({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_PKCE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_PKCE_REDIRECT_URI,
      code,
      code_verifier,
      state
    })
      .then((res: any) => {
        localStorage.setItem('accessToken', JSON.stringify(res))
        router.push({ path: '/' })
      })
      .catch((e) => {
        message.warning(`请求token失败：${e.data.error || e.message || e.statusText}`)
      })
  }
} else {
  // 缓存state
  localStorage.setItem('state', state)
  // 缓存codeVerifier
  localStorage.setItem('codeVerifier', codeVerifier)
  window.location.href = `${
    import.meta.env.VITE_OAUTH_ISSUER
  }/oauth2/authorize?response_type=code&client_id=${
    import.meta.env.VITE_PKCE_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    import.meta.env.VITE_PKCE_REDIRECT_URI
  )}&scope=message.write%20message.read&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`
}
</script>

<template>加载中...</template>
```

### 6. 添加路由
```js
{
    path: '/PkceRedirect',
    name: 'PkceRedirect',
    component: () => import('../views/login/PkceRedirect.vue')
}
```

## 三、认证服务修改内容
在数据库中添加对应客户端的回调地址
- 重要：例如文中的就需要给客户端pkce-message-client添加一个回调地址http://127.0.0.1:5173/PkceRedirect
- 重要：例如文中的就需要给客户端pkce-message-client添加一个回调地址http://127.0.0.1:5173/PkceRedirect
- 重要：例如文中的就需要给客户端pkce-message-client添加一个回调地址http://127.0.0.1:5173/PkceRedirect
经过以上配置授权码模式的对接就完成了，接下来就可以测试了，在首页或者需要触发登录的地方添加一个按钮，点击跳转到/PkceRedirect之后会自动引导发起授权申请流程。

## 四、最后
一直都有提到PKCE流程是授权码流程的扩展，通过这两篇文章也可以看出两种流程的授权申请流程基本是一样的，只不过PKCE将客户端密钥换成了`code_verifier` 和 `code_challenge` ，虽然稍微麻烦了些，但是安全性也提高了很多；至于移动app或者pc端应用对接的流程也是一样的，只不过是将回调地址换成了URLSchema，其它都是一样的；测试的流程与授权码模式基本一致，这里就不带大家测试了，读者可自行测试，然后观察请求跳转情况。
这里贴一张获取token成功的图片

![img](./img/18/18-1.awebp)

如果有什么问题可以在评论区指正，谢谢

## 五、附录
- 代码仓库地址：[Gitee](https://gitee.com/vains-Sofia/authorization-example)
- 文档地址：[How-to: Authenticate using a Single Page Application with PKCE](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/guides/how-to-pkce.html)
