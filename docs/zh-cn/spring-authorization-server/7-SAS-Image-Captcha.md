- [Spring Authorization Server入门 (七) 登录添加图形验证码](https://juejin.cn/post/7242476048005709879)

## 一、前言
目前登录接口没有做任何限制，代表任何人都可以编写脚本的方式暴力破解，会造成安全问题，如果写一个循环一直尝试访问登录接口，那么服务器就一直会收到请求，一次请求代表一次查表，会给服务器造成很大的压力，本篇文章就来给登录接口添加一个验证码校验。

## 二、实现方式
先看一下框架关于登录流程的介绍[文档](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html)

![img](./img/7/7-1.awebp)

[文档](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html#servlet-authentication-daoauthenticationprovider)

![img](./img/7/7-2.awebp)

从这两张图可以看出请求`UsernamePasswordAuthenticationFilter`之后会调用`ProviderManager`里的`DaoAuthenticationProvider`进行验证。
有两种方式可以实现给接口添加验证码校验的功能。

1. 继承`DaoAuthenticationProvider`并重写`authenticate`方法，方法内添加具体的校验逻辑，在方法最后调用父类的`authenticate`实现。

[文档](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html#servlet-authentication-daoauthenticationprovider)中有提到`DaoAuthenticationProvider`会使用`UserDetailsService`和`PasswordEncoder`去校验用户提交的账号密码，所以在其逻辑执行之前添加校验验证码的逻辑即可。

2. 编写一个过滤器，在过滤器中添加校验，然后在配置中将过滤器添加至过滤器链中，位置在`UsernamePasswordAuthenticationFilter`之前。

## 三、添加校验逻辑前的准备

### 1. 编写一个接口提供验证码

#### 1. 引入图形验证码生成工具
```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-captcha</artifactId>
    <version>5.8.18</version>
</dependency>
```

#### 2. 添加生成图形验证码的接口
在`AuthorizationController`中添加以下接口
```java
@ResponseBody
@GetMapping("/getCaptcha")
public Map<String,Object> getCaptcha(HttpSession session) {
    // 使用hutool-captcha生成图形验证码
    // 定义图形验证码的长、宽、验证码字符数、干扰线宽度
    ShearCaptcha captcha = CaptchaUtil.createShearCaptcha(150, 40, 4, 2);
    // 这里应该返回一个统一响应类，暂时使用map代替
    Map<String,Object> result = new HashMap<>();
    result.put("code", HttpStatus.OK.value());
    result.put("success", true);
    result.put("message", "获取验证码成功.");
    result.put("data", captcha.getImageBase64Data());
    // 存入session中
    session.setAttribute("captcha", captcha.getCode());
    return result;
}
```

读者可以选择存入redis这种NoSql服务里

#### 3. 在过滤器链中放行接口
```java
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
                    .requestMatchers("/assets/**", "/webjars/**", "/login", "/getCaptcha").permitAll()
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
```

#### 4. 修改登录接口
修改登录接口，获取具体的异常信息，给页面一个友好的提示，如果接口不提供具体的异常则用户无法知道到底出了什么问题。在上边的文档中有说明，如果登录失败会由`AuthorizationFailureHandler`处理，前文也提到过默认的是`SimpleUrlAuthenticationFailureHandler`；在`UsernamePasswordAuthenticationFilter`父类`AbstractAuthenticationProcessingFilter`中也有体现


![img](./img/7/7-3.awebp)

![img](./img/7/7-4.awebp)

![img](./img/7/7-5.awebp)

![img](./img/7/7-6.awebp)

![img](./img/7/7-7.awebp)

一路追踪下来发现框架会将异常保存至`request`或者`session`中(默认是在`session`中)，所以在登录接口中取出异常然后通过`thymeleaf`渲染页面时携带上异常信息

具体的修改内容
```java
@GetMapping("/login")
public String login(Model model, HttpSession session) {
    Object attribute = session.getAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    if (attribute instanceof AuthenticationException exception) {
        model.addAttribute("error", exception.getMessage());
    }
    return "login";
}
```

### 2. 在exception包中创建异常类
```java
package com.example.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 验证码异常类
 *  校验验证码异常时抛出
 *
 * @author vains
 */
public class InvalidCaptchaException extends AuthenticationException {
    
    public InvalidCaptchaException(String msg) {
        super(msg);
    }
    
}
```

校验验证码异常时抛出

### 3. 修改登录页面，添加验证码输入框
#### 1. 优化登录页面
这是我之前写的一个响应式的登录页面
```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
          content="width=device-width, initial-scale=1 minimum-scale=1 maximum-scale=1 user-scalable=no" />
    <link rel="stylesheet" href="./assets/css/style.css" type="text/css" />
    <title>统一认证平台</title>
</head>

<body>
<div class="bottom-container">
</div>
<!-- <div th:if="${error}" class="alert" id="alert">
    <div class="error-alert">
        <img src="./image/logo.png" alt="logo" width="30">
        <div th:text="${error}">

        </div>
    </div>
</div> -->
<div id="error_box">
</div>
<div class="form-container">

    <form class="form-signin" method="post" th:action="@{/login}">
        <!-- <div th:if="${param.error}" class="alert alert-danger" role="alert" th:text="${param}">
       Invalid username or password.
    </div>
    <div th:if="${param.logout}" class="alert alert-success" role="alert">
        你已经登出成功.
    </div> -->

        <!--        <div class="text-placeholder" style="padding-bottom: 20px;">-->
        <!--            平台登录-->
        <!--        </div>-->
        <div class="welcome-text">
            <img src="./assets/img/logo.png" alt="logo" width="60">
            <span>
                    统一认证平台
                </span>
        </div>
        <div>
            <input type="text" id="username" name="username" class="form-control" placeholder="手机 / 邮箱" required
                   autofocus onblur="leave()" />
        </div>
        <div>
            <input type="password" id="password" name="password" class="form-control" placeholder="请输入密码" required
                   onblur="leave()" />
        </div>
        <div class="code-container">
            <input type="text" id="code" name="code" class="form-control" placeholder="请输入验证码" required
                   onblur="leave()" />
            <img src="" id="code-image" onclick="getVerifyCode()" />
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">登&nbsp;&nbsp;&nbsp;&nbsp;录</button>
    </form>
</div>
</body>

</html>
<script>
    function leave() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    function getVerifyCode() {
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`${window.location.origin}/getCaptcha`, requestOptions)
            .then(response => response.text())
            .then(r => {
                if (r) {
                    let result = JSON.parse(r);
                    document.getElementById('code-image').src = result.data
                }
            })
            .catch(error => console.log('error', error));
    }

    getVerifyCode();
</script>
<script th:inline="javascript">

    function showError(message) {
        let errorBox = document.getElementById("error_box");
        errorBox.innerHTML = message;
        errorBox.style.display = "block";
    }
    function closeError() {
        let errorBox = document.getElementById("error_box");
        errorBox.style.display = "none";
    }

    let error = [[${ error }]]
    if (error) {
        if (window.Notification) {
            Notification.requestPermission(function () {
                if (Notification.permission === 'granted') {
                    // 用户点击了允许
                    let n = new Notification('登录失败', {
                        body: error,
                        icon: './assets/img/logo.png'
                    })

                    setTimeout(() => {
                        n.close();
                    }, 3000)
                } else {
                    showError(error);
                    setTimeout(() => {
                        closeError();
                    }, 3000)
                }
            })
        }
    }
</script>
```

#### 2. 添加css文件和图片
在`static\assets\css`目录下添加`style.css`
```css
* {
  margin: 0;
  padding: 0;
}
body {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(200deg, #72afd3, #96fbc4);
}

/* 上方欢迎语 */
.welcome-text {
  color: black;
  display: flex;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.7;
  align-items: center;
  justify-content: center;
}

.welcome-text img {
  margin-right: 12px !important;
}

/* 提示文字 */
.text-placeholder {
  display: flex;
  font-size: 80%;
  color: #909399;
  justify-content: center;
}

/* 下方背景颜色 */
.bottom-container {
  width: 100%;
  height: 50vh;
  bottom: -15vh;
  position: absolute;
  transform: skew(0, 3deg);
  background: rgb(23, 43, 77);
}

/* 表单卡片样式 */
.form-container {
  width: 100vw;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
}
/* 表单样式 */
.form-signin {
  z-index: 20;
  width: 25vw;
  display: flex;
  border-radius: 3%;
  padding: 35px 50px;
  flex-direction: column;
  background: rgb(247, 250, 252);
}

/* 按钮样式 */
.btn-primary {
  height: 40px;
  color: white;
  cursor: pointer;
  border-radius: 0.25rem;
  background: #5e72e4;
  border: 1px #5e72e4 solid;
  transition: all 0.15s ease;
  /* -webkit-box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%); */
}

.btn-primary:hover {
  transform: translateY(-3%);
  -webkit-box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
}

/* 表单间距 */
.form-signin div, button {
  margin-bottom: 25px;
}

/* 表单输入框 */
.form-signin input {
  width: 100%;
  height: 40px;
  outline: none;
  text-indent: 15px;
  border-radius: 3px;
  border: 1px #e4e7ed solid;
}

/* 表单验证码容器 */
.code-container {
  display: flex;
  justify-content: space-between;
}

/* 表单验证码容器 */
.code-container input {
  margin-right: 10px;
}
#code-image {
  width: 150px;
  height: 40px;
}

/* 表单超链接 */
.btn-light {
  height: 40px;
  display: flex;
  color: #5e72e4;
  border-radius: 3px;
  align-items: center;
  justify-content: center;
  border: 1px #5e72e4 solid;
}

.form-signin img {
  margin: 0;
}

.form-signin a {
  text-decoration: none;
}
.btn-light:hover {
  transform: translateY(-3%);
  -webkit-box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
}

.form-signin input:focus {
  border: 1px solid rgb(41, 50, 225);
}

.alert {
  top: 20px;
  width: 100%;
  z-index: 50;
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
}

/* 弹框样式 */
#error_box {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  padding: 15px;
  display: none;
  z-index: 500;
  animation: shake 0.2s;
}

#error_message {
  padding-left: 10px;
}

@keyframes shake {
  0% {
      transform: translate(-50%, -50%);
  }

  25% {
      transform: translate(-45%, -50%);
  }

  50% {
      transform: translate(-50%, -50%);
  }

  75% {
      transform: translate(-45%, -50%);
  }

  100% {
      transform: translate(-50%, -50%);
  }
}

/*修改提示信息的文本颜色*/
input::-webkit-input-placeholder {
  /* WebKit browsers */
  color: #8898aa;
}

input::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #8898aa;
}

input:-ms-input-placeholder {
  /* Internet Explorer 10+ */
  color: #8898aa;
}

/* 移动端css */
@media screen and (orientation: portrait) {
  .form-signin {
    width: 100%;
  }
  .form-container {
    width: auto;
    height: 90vh;
    padding: 20px;
  }
  .welcome-text {
    top: 9vh;
    flex-direction: column;
  }
}

/* 宽度 */
/* 屏幕 > 666px && < 800px */
@media (min-width: 667px) and (max-width: 800px) {
  .form-signin {
    width: 50vw;
  }

  .welcome-text {
    top: 18vh;
  }
}

/* 屏幕 > 800px */
@media (min-width: 800px) and (max-width: 1000px) {
  .form-signin {
    width: 500px;
  }
}

/* 高度 */
@media (min-height: 600px) and (max-height: 600px) {
  .welcome-text {
    top: 6%;
  }
}

@media (min-height: 800px) and (max-height: 1000px) {
  .welcome-text {
    top: 12%;
  }
}
```

在`static\assets\img`文件夹下添加`log.png`图片(图片自选，我这里只是一个示例)

![img](./img/7/7-8.awebp)

## 四、编写验证码校验逻辑

### 1. 编写provider替换`DaoAuthenticationProvider`
```java
package com.example.authorization;

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

/**
 * 验证码校验
 * 注入ioc中替换原先的DaoAuthenticationProvider
 * 在authenticate方法中添加校验验证码的逻辑
 * 最后调用父类的authenticate方法并返回
 *
 * @author vains
 */
@Slf4j
@Component
public class CaptchaAuthenticationProvider extends DaoAuthenticationProvider {

    /**
     * 利用构造方法在通过{@link Component}注解初始化时
     * 注入UserDetailsService和passwordEncoder，然后
     * 设置调用父类关于这两个属性的set方法设置进去
     *
     * @param userDetailsService 用户服务，给框架提供用户信息
     * @param passwordEncoder 密码解析器，用于加密和校验密码
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
        HttpServletRequest request = ((ServletRequestAttributes)requestAttributes).getRequest();

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

#### 1. 测试
启动项目，访问接口让项目将请求重定向至登录页

![img](./img/7/7-9.awebp)

输入错误的验证码提交后会提示验证码错误

![img](./img/7/7-10.awebp)

验证码输入正确提交后正常执行登录流程，查看控制台日志，提示验证成功。
```shell
2023-06-09T09:48:32.209+08:00  INFO 112092 --- [nio-8080-exec-3] c.e.a.CaptchaAuthenticationProvider      : Authenticate captcha...
2023-06-09T09:48:32.209+08:00  INFO 112092 --- [nio-8080-exec-3] c.e.a.CaptchaAuthenticationProvider      : Captcha authenticated.
```

### 2. 编写过滤器并将其添加在`UsernamePasswordAuthenticationFilter`之前

#### 1. 先去掉刚才添加的验证码校验，屏蔽`Component`注解

![img](./img/7/7-11.awebp)

#### 2. 在filter包下添加`CaptchaAuthenticationFilter`并继承`GenericFilterBean`
```java
package com.example.filter;

import com.example.exception.InvalidCaptchaException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.Assert;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

/**
 * 验证码校验过滤器
 *
 * @author vains
 */
@Slf4j
public class CaptchaAuthenticationFilter extends GenericFilterBean {

    private AuthenticationFailureHandler failureHandler;

    private final RequestMatcher requiresAuthenticationRequestMatcher;

    /**
     * 初始化该过滤器，设置拦截的地址
     *
     * @param defaultFilterProcessesUrl 拦截的地址
     */
    public CaptchaAuthenticationFilter(String defaultFilterProcessesUrl) {
        Assert.hasText(defaultFilterProcessesUrl, "defaultFilterProcessesUrl cannot be null.");
        requiresAuthenticationRequestMatcher = new AntPathRequestMatcher(defaultFilterProcessesUrl);
        failureHandler = new SimpleUrlAuthenticationFailureHandler(defaultFilterProcessesUrl + "?error");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        // 检验是否是post请求并且是需要拦截的地址
        if (!this.requiresAuthenticationRequestMatcher.matches(request) || !request.getMethod().equals(HttpMethod.POST.toString())) {
            chain.doFilter(request, response);
            return;
        }
        // 开始校验验证码
        log.info("Authenticate captcha...");

        // 获取参数中的验证码
        String code = request.getParameter("code");
        try {
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
        } catch (AuthenticationException ex) {
            this.failureHandler.onAuthenticationFailure(request, response, ex);
            return;
        }

        log.info("Captcha authenticated.");
        // 验证码校验通过开始执行接下来的逻辑
        chain.doFilter(request, response);
    }

    public void setAuthenticationFailureHandler(AuthenticationFailureHandler failureHandler) {
        Assert.notNull(failureHandler, "failureHandler cannot be null");
        this.failureHandler = failureHandler;
    }

}
```

该过滤器的请求拦截和异常处理借鉴了`AbstractAuthenticationProcessingFilter`，中间添加校验验证码的逻辑

#### 3. 添加至身份认证过滤器链中
```java
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
                    .requestMatchers("/assets/**", "/webjars/**", "/login", "/getCaptcha").permitAll()
                    .anyRequest().authenticated()
            )
            // 指定登录页面
            .formLogin(formLogin ->
                    formLogin.loginPage("/login")
            );
    // 在UsernamePasswordAuthenticationFilter拦截器之前添加验证码校验拦截器，并拦截POST的登录接口
    http.addFilterBefore(new CaptchaAuthenticationFilter("/login"), UsernamePasswordAuthenticationFilter.class);
    // 添加BearerTokenAuthenticationFilter，将认证服务当做一个资源服务，解析请求头中的token
    http.oauth2ResourceServer((resourceServer) -> resourceServer
            .jwt(Customizer.withDefaults())
            .accessDeniedHandler(SecurityUtils::exceptionHandler)
            .authenticationEntryPoint(SecurityUtils::exceptionHandler)
    );

    return http.build();
}
```

主要是这一行，将过滤器添加至过滤器链中
```java
// 在UsernamePasswordAuthenticationFilter拦截器之前添加验证码校验拦截器，并拦截POST的登录接口
http.addFilterBefore(new CaptchaAuthenticationFilter("/login"), UsernamePasswordAuthenticationFilter.class);
```

#### 4. 测试
这次测试流程跟上一种方法一样，本人就不放图了，读者自测一下即可。

## 五、总结
本篇文章开篇说明了框架处理登录的流程，根据文档提供的流程图找到了处理登录的核心代码，找到核心代码之后就可以扩展自定义内容了；在添加扩展之前优化了登录接口与登录页面，添加图形验证码功能；最后提供了两种让框架校验用户提交的验证码的方式，这两种方式读者凭喜好自选即可。
