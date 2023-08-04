[Spring Boot通用限流方案](https://mp.weixin.qq.com/s/eSaKOWUNNLqodyvy1AdHow)
## 一、背景

限流对于一个微服务架构系统来说具有非常重要的意义，否则其中的某个微服务将成为整个系统隐藏的雪崩因素，为什么这么说？
举例来讲，某个SAAS平台有100多个微服务应用，但是作为底层的某个或某几个应用来说，将会被所有上层应用频繁调用，业务高峰期时，如果底层应用不做限流处理，该应用必将面临着巨大的压力，尤其是那些个别被高频调用的接口来说，最直接的表现就是导致后续新进来的请求阻塞、排队、响应超时...最后直到该服务所在JVM资源被耗尽。



## 二、限流概述

在大多数的微服务架构在设计之初，比如在技术选型阶段，架构师会从一个全局的视角去规划技术栈的组合，比如结合当前产品的现状考虑是使用dubbo？还是springcloud？作为微服务治理的底层框架。甚至为了满足快速的上线、迭代和交付，直接以springboot为基座进行开发，后续再引入新的技术栈等...

所以在谈论某个业务场景具体的技术解决方案时不可一概而论，而是需要结合产品和业务的现状综合评估，以限流来说，在下面的不同的技术架构下具体在选择的时候可能也不一样。

### 2.1 dubbo 服务治理模式

选择dubbo框架作为基础服务治理对于那种偏向内部平台的应用还是不错的，dubbo底层走netty，这一点相比http协议来说，在一定场景下还是具有优势的，如果选择dubbo，在选择限流方案上可以做如下的参考。

#### 2.1.1 dubbo框架级限流

dubbo官方提供了完善的服务治理，能够满足大多数开发场景中的需求，针对限流这个场景，具体来说包括如下手段，具体的配置，可以参考官方手册；

- 客户端限流
  - 信号量限流 （通过统计的方式）
  - 连接数限流 (socket->tcp)

- 服务端限流
  - 线程池限流 (隔离手段)
  - 信号量限流 (非隔离手段)
  - 接收数限流 (socket->tcp)

#### 2.1.2 线程池设置
多线程并发操作一定离不开线程池，Dubbo自身提供了支持了四种线程池类型支持。生产者`<dubbo:protocol>`标签中可配置线程池关键参数，线程池类型、阻塞队列大小、核心线程数量等，通过配置生产端的线程池数量可以在一定程度上起到限流的效果。

#### 2.1.3 集成第三方组件

如果是springboot框架的项目，可以考虑直接引入地方的组件或SDK，比如hystrix，guava，sentinel原生SDK等，如果技术实力足够强甚至可以考虑自己造轮子。

### 2.2 springcloud 服务治理模式

如果你的服务治理框架选用的是springcloud或springcloud-alibaba，其框架自身的生态中已经包含了相应的限流组件，可以实现开箱即用，下面列举几种常用的基于springcloud框架的限流组件。

#### 2.2.1 hystrix

Hystrix是Netflix开源的一款容错框架，在springcloud早期推出市场的时候，作为springcloud生态中用于限流、熔断、降级的一款组件。

Hystrix提供了限流功能，在springcloud架构的系统中，可以在网关启用Hystrix，进行限流处理，每个微服务也可以各自启用Hystrix进行限流。

> Hystrix默认使用线程隔离模式，可以通过线程数+队列大小进行限流，具体参数配置可以参考官网相关资料。

#### 2.2.2 Sentinel
Sentinel 号称分布式系统的流量防卫兵，属于springcloud-alibaba生态中的重要组件，面向分布式服务架构的流量控制组件，主要以流量为切入点，从限流、流量整形、熔断降级、系统负载保护、热点防护等多个维度来帮助开发者保障微服务的稳定性。

### 2.3 网关层限流

随着微服务规模的增加，整个系统中很多微服务都需要实现限流这种需求时，就可以考虑在网关这一层进行限流了，通常来说，网关层的限流面向的是通用的业务，比如那些恶意的请求，爬虫，攻击等，简单来说，网关层面的限流提供了一层对系统整体的保护措施。



## 三、常用限流策略

### 3.1 限流常用的算法

不管是哪种限流组件，其底层的限流实现算法大同小异，这里列举几种常用的限流算法以供了解。

#### 3.1.1 令牌桶算法

令牌桶算法是目前应用最为广泛的限流算法，顾名思义，它有以下两个关键角色：

令牌 ：获取到令牌的Request才会被处理，其他Requests要么排队要么被直接丢弃；
桶 ：用来装令牌的地方，所有Request都从这个桶里面获取令牌
图片
令牌桶主要涉及到2个过程，即令牌的生成，令牌的获取

#### 3.1.2 漏桶算法

漏桶算法的前半段和令牌桶类似，但是操作的对象不同，结合下图进行理解。

令牌桶是将令牌放入桶里，而漏桶是将访问请求的数据包放到桶里。同样的是，如果桶满了，那么后面新来的数据包将被丢弃。

图片

#### 3.1.3 滑动时间窗口
根据下图，简单描述下滑动时间窗口这种过程：

黑色大框为时间窗口，可以设定窗口时间单位为5秒，它会随着时间推移向后滑动。我们将窗口内的时间划分为五个小格子，每个格子代表1秒钟，同时这个格子还包含一个计数器，用来计算在当前时间内访问的请求数量。那么这个时间窗口内的总访问量就是所有格子计数器累加后的数值；

比如说，我们在每一秒内有5个用户访问，第5秒内有10个用户访问，那么在0到5秒这个时间窗口内访问量就是15。如果我们的接口设置了时间窗口内访问上限是20，那么当时间到第六秒的时候，这个时间窗口内的计数总和就变成了10，因为1秒的格子已经退出了时间窗口，因此在第六秒内可以接收的访问量就是20-10=10个；

图片
滑动窗口其实也是一种计算器算法，它有一个显著特点，当时间窗口的跨度越长时，限流效果就越平滑。打个比方，如果当前时间窗口只有两秒，而访问请求全部集中在第一秒的时候，当时间向后滑动一秒后，当前窗口的计数量将发生较大的变化，拉长时间窗口可以降低这种情况的发生概率



## 四、通用限流实现方案

抛开网关层的限流先不说，在微服务应用中，考虑到技术栈的组合，团队人员的开发水平，以及易维护性等因素，一个比较通用的做法是，利用AOP技术+自定义注解实现对特定的方法或接口进行限流，下面基于这个思路来分别介绍下几种常用的限流方案的实现。

### 4.1 基于guava限流实现

guava为谷歌开源的一个比较实用的组件，利用这个组件可以帮助开发人员完成常规的限流操作，接下来看具体的实现步骤。

#### 4.1.1 引入guava依赖

版本可以选择更高的或其他版本
```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>23.0</version>
</dependency>
```

#### 4.1.2 自定义限流注解
自定义一个限流用的注解，后面在需要限流的方法或接口上面只需添加该注解即可；

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
 
@Target(value = ElementType.METHOD)
@Retention(value = RetentionPolicy.RUNTIME)
public @interface RateConfigAnno {
 
    String limitType();
 
    double limitCount() default 5d;
}
```

#### 4.1.3 限流AOP类
通过AOP前置通知的方式拦截添加了上述自定义限流注解的方法，解析注解中的属性值，并以该属性值作为guava提供的限流参数，该类为整个实现的核心所在。
```java
import com.alibaba.fastjson2.JSONObject;
import com.google.common.util.concurrent.RateLimiter;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
 
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Objects;
 
@Aspect
@Component
public class GuavaLimitAop {
 
    private static Logger logger = LoggerFactory.getLogger(GuavaLimitAop.class);
 
    @Before("execution(@RateConfigAnno * *(..))")
    public void limit(JoinPoint joinPoint) {
        //1、获取当前的调用方法
        Method currentMethod = getCurrentMethod(joinPoint);
        if (Objects.isNull(currentMethod)) {
            return;
        }
        //2、从方法注解定义上获取限流的类型
        String limitType = currentMethod.getAnnotation(RateConfigAnno.class).limitType();
        double limitCount = currentMethod.getAnnotation(RateConfigAnno.class).limitCount();
        //使用guava的令牌桶算法获取一个令牌，获取不到先等待
        RateLimiter rateLimiter = RateLimitHelper.getRateLimiter(limitType, limitCount);
        boolean b = rateLimiter.tryAcquire();
        if (b) {
            System.out.println("获取到令牌");
        }else {
            HttpServletResponse resp = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse();
            JSONObject jsonObject=new JSONObject();
            jsonObject.put("success",false);
            jsonObject.put("msg","限流中");
            try {
                output(resp, jsonObject.toJSONString());
            }catch (Exception e){
                logger.error("error,e:{}",e);
            }
        }
    }
 
    private Method getCurrentMethod(JoinPoint joinPoint) {
        Method[] methods = joinPoint.getTarget().getClass().getMethods();
        Method target = null;
        for (Method method : methods) {
            if (method.getName().equals(joinPoint.getSignature().getName())) {
                target = method;
                break;
            }
        }
        return target;
    }
 
    public void output(HttpServletResponse response, String msg) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        ServletOutputStream outputStream = null;
        try {
            outputStream = response.getOutputStream();
            outputStream.write(msg.getBytes("UTF-8"));
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            outputStream.flush();
            outputStream.close();
        }
    }
}
```
其中限流的核心API即为RateLimiter这个对象，涉及到的RateLimitHelper类如下
```java
import com.google.common.util.concurrent.RateLimiter;
 
import java.util.HashMap;
import java.util.Map;
 
public class RateLimitHelper {
 
    private RateLimitHelper(){}
 
    private static Map<String,RateLimiter> rateMap = new HashMap<>();
 
    public static RateLimiter getRateLimiter(String limitType,double limitCount ){
        RateLimiter rateLimiter = rateMap.get(limitType);
        if(rateLimiter == null){
            rateLimiter = RateLimiter.create(limitCount);
            rateMap.put(limitType,rateLimiter);
        }
        return rateLimiter;
    }
 
}
```

#### 4.1.4 测试接口
下面添加一个测试接口，测试一下上面的代码是否生效
```java
@RestController
public class OrderController {
 
    //localhost:8081/save
    @GetMapping("/save")
    @RateConfigAnno(limitType = "saveOrder",limitCount = 1)
    public String save(){
        return "success";
    }
 
}
```
在接口中为了模拟出效果，我们将参数设置的非常小，即QPS为1，可以预想当每秒请求超过1时将会出现被限流的提示，启动工程并验证接口，每秒1次的请求，可以正常得到结果，效果如下：

图片
快速刷接口，将会看到下面的效果

图片

### 4.2 基于sentinel限流实现
在不少同学的意识中，sentinel通常是需要结合springcloud-alibaba框架一起实用的，而且与框架集成之后，可以配合控制台一起使用达到更好的效果，实际上，sentinel官方也提供了相对原生的SDK可供使用，接下来就以这种方式进行整合。

#### 4.2.1 引入sentinel核心依赖包
```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>1.8.0</version>
</dependency>
```
#### 4.2.2 自定义限流注解
可以根据需要，添加更多的属性
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
 
@Target(value = ElementType.METHOD)
@Retention(value = RetentionPolicy.RUNTIME)
public @interface SentinelLimitAnnotation {
 
    String resourceName();
 
    int limitCount() default 5;
 
}
```

#### 4.2.3 自定义AOP类实现限流
该类的实现思路与上述使用guava类似，不同的是，这里使用的是sentinel原生的限流相关的API，对此不够属性的可以查阅官方的文档进行学习，这里就不展开来说了。
```java
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.RuleConstant;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
 
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
 
@Aspect
@Component
public class SentinelMethodLimitAop {
 
    private static void initFlowRule(String resourceName,int limitCount) {
        List<FlowRule> rules = new ArrayList<>();
        FlowRule rule = new FlowRule();
        //设置受保护的资源
        rule.setResource(resourceName);
        //设置流控规则 QPS
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        //设置受保护的资源阈值
        rule.setCount(limitCount);
        rules.add(rule);
        //加载配置好的规则
        FlowRuleManager.loadRules(rules);
    }
 
    @Pointcut(value = "@annotation(com.congge.sentinel.SentinelLimitAnnotation)")
    public void rateLimit() {
 
    }
 
    @Around("rateLimit()")
    public Object around(ProceedingJoinPoint joinPoint) {
        //1、获取当前的调用方法
        Method currentMethod = getCurrentMethod(joinPoint);
        if (Objects.isNull(currentMethod)) {
            return null;
        }
        //2、从方法注解定义上获取限流的类型
        String resourceName = currentMethod.getAnnotation(SentinelLimitAnnotation.class).resourceName();
        if(StringUtils.isEmpty(resourceName)){
            throw new RuntimeException("资源名称为空");
        }
        int limitCount = currentMethod.getAnnotation(SentinelLimitAnnotation.class).limitCount();
        initFlowRule(resourceName,limitCount);
 
        Entry entry = null;
        Object result = null;
        try {
            entry = SphU.entry(resourceName);
            try {
                result = joinPoint.proceed();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        } catch (BlockException ex) {
            // 资源访问阻止，被限流或被降级
            // 在此处进行相应的处理操作
            System.out.println("blocked");
            return "被限流了";
        } catch (Exception e) {
            Tracer.traceEntry(e, entry);
        } finally {
            if (entry != null) {
                entry.exit();
            }
        }
        return result;
    }
 
    private Method getCurrentMethod(JoinPoint joinPoint) {
        Method[] methods = joinPoint.getTarget().getClass().getMethods();
        Method target = null;
        for (Method method : methods) {
            if (method.getName().equals(joinPoint.getSignature().getName())) {
                target = method;
                break;
            }
        }
        return target;
    }
}
```

#### 4.2.4 自定义测试接口
为了模拟效果，这里将QPS的数量设置为1
```java
//localhost:8081/limit
@GetMapping("/limit")
@SentinelLimitAnnotation(limitCount = 1,resourceName = "sentinelLimit")
public String sentinelLimit(){
    return "sentinelLimit";
}
```
启动工程之后，浏览器调用接口测试一下，每秒一个请求，可以正常通过

图片
快速刷接口，超过每秒1次时，效果如下

图片
这里只是为了演示出效果，建议在真实的项目中使用时，对返回结果做一个封装。



### 4.3 基于redis+lua限流实现

redis是线程安全的，天然具有线程安全的特性，支持原子性操作，限流服务不仅需要承接超高QPS，还要保证限流逻辑的执行层面具备线程安全的特性，利用Redis这些特性做限流，既能保证线程安全，也能保证性能。基于redis的限流实现完整流程如下图：

图片
结合上面的流程图，这里梳理出一个整体的实现思路：

编写lua脚本，指定入参的限流规则，比如对特定的接口限流时，可以根据某个或几个参数进行判定，调用该接口的请求，在一定的时间窗口内监控请求次数；
既然是限流，最好能够通用，可将限流规则应用到任何接口上，那么最合适的方式就是通过自定义注解形式切入；
提供一个配置类，被spring的容器管理，redisTemplate中提供了DefaultRedisScript这个bean；
提供一个能动态解析接口参数的类，根据接口参数进行规则匹配后触发限流；

#### 4.3.1 引入redis依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

#### 4.3.2 自定义注解
```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface RedisLimitAnnotation {
 
    /**
     * key
     */
    String key() default "";
    /**
     * Key的前缀
     */
    String prefix() default "";
    /**
     * 一定时间内最多访问次数
     */
    int count();
    /**
     * 给定的时间范围 单位(秒)
     */
    int period();
    /**
     * 限流的类型(用户自定义key或者请求ip)
     */
    LimitType limitType() default LimitType.CUSTOMER;
 
}
```

#### 4.3.3 自定义redis配置类
```java
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;
 
import java.io.Serializable;
 
@Component
public class RedisConfiguration {
 
    @Bean
    public DefaultRedisScript<Number> redisluaScript() {
        DefaultRedisScript<Number> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("limit.lua")));
        redisScript.setResultType(Number.class);
        return redisScript;
    }
 
    @Bean("redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
 
        //设置value的序列化方式为JSOn
        redisTemplate.setValueSerializer(jackson2JsonRedisSerializer);
        //设置key的序列化方式为String
        redisTemplate.setKeySerializer(new StringRedisSerializer());
 
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(jackson2JsonRedisSerializer);
        redisTemplate.afterPropertiesSet();
 
        return redisTemplate;
    }
 
}
```
#### 4.3.4 自定义限流AOP类
```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
 
import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;
 
@Aspect
@Configuration
public class LimitRestAspect {
 
    private static final Logger logger = LoggerFactory.getLogger(LimitRestAspect.class);
 
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
 
    @Autowired
    private DefaultRedisScript<Number> redisluaScript;
 
 
    @Pointcut(value = "@annotation(com.congge.config.limit.RedisLimitAnnotation)")
    public void rateLimit() {
 
    }
 
    @Around("rateLimit()")
    public Object interceptor(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Class<?> targetClass = method.getDeclaringClass();
        RedisLimitAnnotation rateLimit = method.getAnnotation(RedisLimitAnnotation.class);
        if (rateLimit != null) {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String ipAddress = getIpAddr(request);
            StringBuffer stringBuffer = new StringBuffer();
            stringBuffer.append(ipAddress).append("-")
                    .append(targetClass.getName()).append("- ")
                    .append(method.getName()).append("-")
                    .append(rateLimit.key());
            List<String> keys = Collections.singletonList(stringBuffer.toString());
            //调用lua脚本，获取返回结果，这里即为请求的次数
            Number number = redisTemplate.execute(
                    redisluaScript,
                    keys,
                    rateLimit.count(),
                    rateLimit.period()
            );
            if (number != null && number.intValue() != 0 && number.intValue() <= rateLimit.count()) {
                logger.info("限流时间段内访问了第：{} 次", number.toString());
                return joinPoint.proceed();
            }
        } else {
            return joinPoint.proceed();
        }
        throw new RuntimeException("访问频率过快，被限流了");
    }
 
    /**
     * 获取请求的IP方法
     * @param request
     * @return
     */
    private static String getIpAddr(HttpServletRequest request) {
        String ipAddress = null;
        try {
            ipAddress = request.getHeader("x-forwarded-for");
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }
            // 对于通过多个代理的情况，第一个IP为客户端真实IP,多个IP按照','分割
            if (ipAddress != null && ipAddress.length() > 15) {
                if (ipAddress.indexOf(",") > 0) {
                    ipAddress = ipAddress.substring(0, ipAddress.indexOf(","));
                }
            }
        } catch (Exception e) {
            ipAddress = "";
        }
        return ipAddress;
    }
 
}
```
该类要做的事情和上面的两种限流措施类似，不过在这里核心的限流是通过读取lua脚步，通过参数传递给lua脚步实现的。

#### 4.3.5 自定义lua脚本

在工程的resources目录下，添加如下的lua脚本
```lua
local key = "rate.limit:" .. KEYS[1]
 
local limit = tonumber(ARGV[1])
 
local current = tonumber(redis.call('get', key) or "0")
 
if current + 1 > limit then
  return 0
else
   -- 没有超阈值，将当前访问数量+1，并设置2秒过期（可根据自己的业务情况调整）
   redis.call("INCRBY", key,"1")
   redis.call("expire", key,"2")
   return current + 1
end
```

#### 4.3.6 添加测试接口
```java
@RestController
public class RedisController {
 
    //localhost:8081/redis/limit
    @GetMapping("/redis/limit")
    @RedisLimitAnnotation(key = "queryFromRedis",period = 1, count = 1)
    public String queryFromRedis(){
        return "success";
    }
 
}
```
为了模拟效果，这里将QPS设置为1 ，启动工程后（提前启动redis服务），调用一下接口，正常的效果如下：

图片
快速刷接口，超过每秒1次的请求时看到如下效果

图片

## 五、自定义starter限流实现

上面通过案例介绍了几种常用的限流实现，不过细心的同学可以看到，这些限流的实现都是在具体的工程模块中嵌入的，事实上，在真实的微服务开发中，一个项目可能包含了众多的微服务模块，为了减少重复造轮子，避免每个微服务模块中单独实现，可以考虑将限流的逻辑实现封装成一个SDK，即作为一个springboot的starter的方式被其他微服务模块进行引用即可。这也是目前很多生产实践中比较通用的做法，接下来看看具体的实现吧。

### 5.1 前置准备
创建一个空的springboot工程，工程目录结构如下图，目录说明：

- annotation：存放自定义的限流相关的注解；
- aop：存放不同的限流实现，比如基于guava的aop，基于sentinel的aop实现等；
- spring.factories：自定义待装配的aop实现类；
图片

### 5.2 代码整合完成步骤

#### 5.2.1 导入基础的依赖
这里包括如下几个必须的依赖，其他的依赖可以结合自身的情况合理选择；


- spring-boot-starter；
- guava；
- spring-boot-autoconfigure；
- sentinel-core；

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.1.RELEASE</version>
    <relativePath/>
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <java.version>1.8</java.version>
</properties>

<dependencies>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>

    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>

    <!-- guava-->
    <dependency>
        <groupId>com.google.guava</groupId>
        <artifactId>guava</artifactId>
        <version>23.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-autoconfigure</artifactId>
        <version>2.2.1.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <version>2.2.1.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-core</artifactId>
        <version>1.8.0</version>
    </dependency>

    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>3.4</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
        <version>2.0.22</version>
    </dependency>

</dependencies>

<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/**</include>
            </includes>
        </resource>
    </resources>
</build>
```

#### 5.2.2 自定义注解
目前该SDK支持三种限流方式，即后续其他微服务工程中可以通过添加这3种注解即可实现限流，分别是基于guava的令牌桶，基于sentinel的限流，基于java自带的Semaphore限流，三个自定义注解类如下：

令牌桶
```java
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
 
public @interface TokenBucketLimiter {
    int value() default 50;
}
```

Semaphore
```java
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ShLimiter {
    int value() default 50;
}
```

Sentinel
```java
@Target(value = ElementType.METHOD)
@Retention(value = RetentionPolicy.RUNTIME)
public @interface SentinelLimiter {
 
    String resourceName();
 
    int limitCount() default 50;
 
}
```

#### 5.2.3 限流实现AOP类
具体的限流在AOP中进行实现，思路和上一章节类似，即通过环绕通知的方式，先解析那些添加了限流注解的方法，然后解析里面的参数，进行限流的业务实现。

基于guava的aop实现

```java
import com.alibaba.fastjson2.JSONObject;
import com.congge.annotation.TokenBucketLimiter;
import com.google.common.util.concurrent.RateLimiter;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.cglib.core.ReflectUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
 
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
 
@Aspect
@Component
@Slf4j
public class GuavaLimiterAop {
 
    private final Map<String, RateLimiter> rateLimiters = new ConcurrentHashMap<String, RateLimiter>();
 
    @Pointcut("@annotation(com.congge.annotation.TokenBucketLimiter)")
    public void aspect() {
    }
 
    @Around(value = "aspect()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        log.debug("准备限流");
        Object target = point.getTarget();
        String targetName = target.getClass().getName();
        String methodName = point.getSignature().getName();
        Object[] arguments = point.getArgs();
        Class<?> targetClass = Class.forName(targetName);
        Class<?>[] argTypes = ReflectUtils.getClasses(arguments);
        Method method = targetClass.getDeclaredMethod(methodName, argTypes);
        // 获取目标method上的限流注解@Limiter
        TokenBucketLimiter limiter = method.getAnnotation(TokenBucketLimiter.class);
        RateLimiter rateLimiter = null;
        Object result = null;
        if (null != limiter) {
            // 以 class + method + parameters为key，避免重载、重写带来的混乱
            String key = targetName + "." + methodName + Arrays.toString(argTypes);
            rateLimiter = rateLimiters.get(key);
            if (null == rateLimiter) {
                // 获取限定的流量
                // 为了防止并发
                rateLimiters.putIfAbsent(key, RateLimiter.create(limiter.value()));
                rateLimiter = rateLimiters.get(key);
            }
            boolean b = rateLimiter.tryAcquire();
            if(b){
                log.debug("得到令牌，准备执行业务");
                result = point.proceed();
            }else {
                HttpServletResponse resp = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse();
                JSONObject jsonObject=new JSONObject();
                jsonObject.put("success",false);
                jsonObject.put("msg","限流中");
                try {
                    output(resp, jsonObject.toJSONString());
                }catch (Exception e){
                    log.error("error,e:{}",e);
                }
            }
        } else {
            result = point.proceed();
        }
        log.debug("退出限流");
        return result;
    }
 
    public void output(HttpServletResponse response, String msg) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        ServletOutputStream outputStream = null;
        try {
            outputStream = response.getOutputStream();
            outputStream.write(msg.getBytes("UTF-8"));
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            outputStream.flush();
            outputStream.close();
        }
    }
}
```

基于Semaphore的aop实现
```java
import com.congge.annotation.ShLimiter;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cglib.core.ReflectUtils;
import org.springframework.stereotype.Component;
 
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
 
@Aspect
@Component
@Slf4j
public class SemaphoreLimiterAop {
 
    private final Map<String, Semaphore> semaphores = new ConcurrentHashMap<String, Semaphore>();
    private final static Logger LOG = LoggerFactory.getLogger(SemaphoreLimiterAop.class);
 
    @Pointcut("@annotation(com.congge.annotation.ShLimiter)")
    public void aspect() {
 
    }
 
    @Around(value = "aspect()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        log.debug("进入限流aop");
        Object target = point.getTarget();
        String targetName = target.getClass().getName();
        String methodName = point.getSignature().getName();
        Object[] arguments = point.getArgs();
        Class<?> targetClass = Class.forName(targetName);
        Class<?>[] argTypes = ReflectUtils.getClasses(arguments);
        Method method = targetClass.getDeclaredMethod(methodName, argTypes);
        // 获取目标method上的限流注解@Limiter
        ShLimiter limiter = method.getAnnotation(ShLimiter.class);
        Object result = null;
        if (null != limiter) {
            // 以 class + method + parameters为key，避免重载、重写带来的混乱
            String key = targetName + "." + methodName + Arrays.toString(argTypes);
            // 获取限定的流量
            Semaphore semaphore = semaphores.get(key);
            if (null == semaphore) {
                semaphores.putIfAbsent(key, new Semaphore(limiter.value()));
                semaphore = semaphores.get(key);
            }
            try {
                semaphore.acquire();
                result = point.proceed();
            } finally {
                if (null != semaphore) {
                    semaphore.release();
                }
            }
        } else {
            result = point.proceed();
        }
        log.debug("退出限流");
        return result;
    }
 
}
```

基于Sentinel的aop实现
```java
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.RuleConstant;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.congge.annotation.SentinelLimiter;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
 
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
 
@Aspect
@Component
public class SentinelLimiterAop {
 
    private static void initFlowRule(String resourceName,int limitCount) {
        List<FlowRule> rules = new ArrayList<>();
        FlowRule rule = new FlowRule();
        //设置受保护的资源
        rule.setResource(resourceName);
        //设置流控规则 QPS
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        //设置受保护的资源阈值
        rule.setCount(limitCount);
        rules.add(rule);
        //加载配置好的规则
        FlowRuleManager.loadRules(rules);
    }
 
    @Pointcut(value = "@annotation(com.congge.annotation.SentinelLimiter)")
    public void rateLimit() {
 
    }
 
    @Around("rateLimit()")
    public Object around(ProceedingJoinPoint joinPoint) {
        //1、获取当前的调用方法
        Method currentMethod = getCurrentMethod(joinPoint);
        if (Objects.isNull(currentMethod)) {
            return null;
        }
        //2、从方法注解定义上获取限流的类型
        String resourceName = currentMethod.getAnnotation(SentinelLimiter.class).resourceName();
        if(StringUtils.isEmpty(resourceName)){
            throw new RuntimeException("资源名称为空");
        }
        int limitCount = currentMethod.getAnnotation(SentinelLimiter.class).limitCount();
        initFlowRule(resourceName,limitCount);
 
        Entry entry = null;
        Object result = null;
        try {
            entry = SphU.entry(resourceName);
            try {
                result = joinPoint.proceed();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        } catch (BlockException ex) {
            // 资源访问阻止，被限流或被降级
            // 在此处进行相应的处理操作
            System.out.println("blocked");
            return "被限流了";
        } catch (Exception e) {
            Tracer.traceEntry(e, entry);
        } finally {
            if (entry != null) {
                entry.exit();
            }
        }
        return result;
    }
 
    private Method getCurrentMethod(JoinPoint joinPoint) {
        Method[] methods = joinPoint.getTarget().getClass().getMethods();
        Method target = null;
        for (Method method : methods) {
            if (method.getName().equals(joinPoint.getSignature().getName())) {
                target = method;
                break;
            }
        }
        return target;
    }
 
}
```

#### 5.2.4 配置自动装配AOP实现
在resources目录下创建上述的`spring.factories`文件，内容如下，通过这种方式配置后，其他应用模块引入了当前的SDK的jar之后，就可以实现开箱即用了；

```factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.congge.aop.SemaphoreLimiterAop,\
  com.congge.aop.GuavaLimiterAop,\
  com.congge.aop.SemaphoreLimiterAop
```

#### 5.2.5 将工程打成jar进行安装
这一步比较简单就跳过了

图片

#### 5.2.6 在其他的工程中引入上述SDK
```xml
<dependency>
    <groupId>cm.congge</groupId>
    <artifactId>biz-limit</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

#### 5.2.7 编写测试接口
在其他工程中，编写一个测试接口，并使用上面的注解，这里以guava的限流注解为例进行说明
```java
import com.congge.annotation.TokenBucketLimiter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
 
@RestController
public class SdkController {
 
    //localhost:8081/query
    @GetMapping("/query")
    @TokenBucketLimiter(1)
    public String queryUser(){
        return "queryUser";
    }
 
}
```

#### 5.2.8 功能测试
启动当前的工程后，正常调用接口，每秒一次的请求，可以正常得到结果

图片
快速刷接口，QPS超过1之后，将会触发限流，看到如下效果

图片
通过上面这种方式，也可以得到预期的效果，其他两种限流注解有兴趣的同学也可以继续测试验证，篇幅原因就不再赘述了。

上述通过starter的方式实现了一种更优雅的限流集成方式，也是生产中比较推荐的一种方式，不过当前的案例还比较粗糙，需要使用的同学还需根据自己的情况完善里面的逻辑，进一步的封装以期得到更好的效果。


## 六、写在文末

本文通过较大的篇幅结合实际案例详细阐述了微服务中限流的一些实现方案，限流对于一个稳定运行的系统来说具有很重要的意义，可以说是服务治理中一个重要的方面，希望对看到的同学有所帮助，谢谢观看。
