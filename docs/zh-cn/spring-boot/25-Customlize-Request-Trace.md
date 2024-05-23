- [手动实现 Spring Boot 日志链路追踪，无需引入组件，日志定位更方便！](https://mp.weixin.qq.com/s/JerVwf0zlcalA28WTof63g)
- [分布式链路追踪：TraceIdFilter + MDC + Skywalking](https://mp.weixin.qq.com/s/MY-ZreM-wG2OMCLJKxlPjA)
- [分布式链路追踪：TraceIdFilter + MDC + Skywalking](https://juejin.cn/post/7278498472860581925)

## 自定义拦截器实现链路追踪

### 1. pom.xml 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-logging</artifactId>
    </dependency>
    <!--lombok配置-->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.16.10</version>
    </dependency>
</dependencies>
```

### 2. logback-spring.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- 日志级别从低到高分为TRACE < DEBUG < INFO < WARN < ERROR < FATAL，如果设置为WARN，则低于WARN的信息都不会输出 -->
<!-- scan:当此属性设置为true时，配置文档如果发生改变，将会被重新加载，默认值为true -->
<!-- scanPeriod:设置监测配置文档是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒。
                 当scan为true时，此属性生效。默认的时间间隔为1分钟。 -->
<!-- debug:当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。 -->
<configuration  scan="true" scanPeriod="10 seconds">
    <contextName>logback</contextName>

    <!-- name的值是变量的名称，value的值时变量定义的值。通过定义的值会被插入到logger上下文中。定义后，可以使 ${} 来使用变量。 -->
    <property name="log.path" value="${project.basedir}/logs" />
    <property name="app.name" value="${spring.application.name:- cloud-service-demo}" />

    <!--0. 日志格式和颜色渲染 -->
    <!-- 彩色日志依赖的渲染类 -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />
    <conversionRule conversionWord="wex" converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter" />
    <conversionRule conversionWord="wEx" converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter" />
    <!-- 彩色日志格式 -->
    <!--
        黑      红    绿      黄       蓝     洋红        青     白      灰
        %black、%red、%green、%yellow、%blue、%magenta、%cyan、%white、%gray、
        加粗红     加粗绿       加粗黄        加粗蓝     加粗洋红       加粗青      加粗白       高亮
        %boldRed、%boldGreen、%boldYellow、%boldBlue、%boldMagenta、%boldCyan、%boldWhite、%highlight
    -->
    <!--格式化输出：
        %d %date       表示日期，
        %t %thread     表示线程名，
        %p %-5level    级别从左显示5个字符宽度
        %m %msg        日志消息，
        %n          是换行符
    -->
    <property name="FILE_LOG_PATTERN" value="[%X{traceId}] %d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger{50}#%method:%line : %msg%n" />
    <property name="CONSOLE_LOG_PATTERN" value="[%X{traceId}] %d{yyyy-MM-dd HH:mm:ss.SSS} %highlight(%-5level) %green([${app.name}]) %red(${PID:- }) --- %magenta([%thread]) %cyan(%-50.50logger{49}#%method:%line) : %msg%n" />
    <property name="CONSOLE_LOG_PATTERN" value="[%X{traceId}] ${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint}
                    %clr(${LOG_LEVEL_PATTERN:-%5level}){highlight} %clr(${app.name}){green} %clr(${PID:- }){red}
                    %clr(---){faint} %clr([%15.15thread]){magenta} %clr(%-50.50logger{49}){cyan}%clr(#%method){cyan}%clr(:%line){cyan}
                    %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>

    <!--1. 输出到控制台-->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
            <!-- 设置字符集 -->
            <charset>UTF-8</charset>
        </encoder>
        <!--此日志appender是为开发使用，只配置最底级别，控制台输出的日志级别是大于或等于此级别的日志信息-->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
    </appender>

    <!--2. 输出到文档-->
    <!-- 2.1 level为 DEBUG 日志，时间滚动输出  -->
    <appender name="DEBUG_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文档的路径及文档名 -->
        <file>${log.path}/debug.log</file>
        <!--日志文档输出格式-->
        <encoder>
            <!--            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>-->
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>UTF-8</charset> <!-- 设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 日志归档 -->
            <fileNamePattern>${log.path}/web-debug-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文档保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文档只记录debug级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>DEBUG</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 2.2 level为 INFO 日志，时间滚动输出  -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文档的路径及文档名 -->
        <file>${log.path}/info.log</file>
        <!--日志文档输出格式-->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天日志归档路径以及格式 -->
            <fileNamePattern>${log.path}/web-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文档保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文档只记录info级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>INFO</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 2.3 level为 WARN 日志，时间滚动输出  -->
    <appender name="WARN_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文档的路径及文档名 -->
        <file>${log.path}/warn.log</file>
        <!--日志文档输出格式-->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/web-warn-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文档保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文档只记录warn级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>WARN</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 2.4 level为 ERROR 日志，时间滚动输出  -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文档的路径及文档名 -->
        <file>${log.path}/error.log</file>
        <!--日志文档输出格式-->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/web-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文档保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文档只记录ERROR级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!--
        <logger>用来设置某一个包或者具体的某一个类的日志打印级别、
        以及指定<appender>。<logger>仅有一个name属性，
        一个可选的level和一个可选的addtivity属性。
        name:用来指定受此logger约束的某一个包或者具体的某一个类。
        level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF，
              还有一个特俗值INHERITED或者同义词NULL，代表强制执行上级的级别。
              如果未设置此属性，那么当前logger将会继承上级的级别。
        addtivity:是否向上级logger传递打印信息。默认是true。
        <logger name="org.springframework.web" level="info"/>
        <logger name="org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor" level="INFO"/>
    -->

    <!--
        使用mybatis的时候，sql语句是debug下才会打印，而这里我们只配置了info，所以想要查看sql语句的话，有以下两种操作：
        第一种把<root level="info">改成<root level="DEBUG">这样就会打印sql，不过这样日志那边会出现很多其他消息
        第二种就是单独给dao下目录配置debug模式，代码如下，这样配置sql语句会打印，其他还是正常info级别：
        【logging.level.org.mybatis=debug logging.level.dao=debug】
     -->

    <!--
        root节点是必选节点，用来指定最基础的日志输出级别，只有一个level属性
        level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF，
        不能设置为INHERITED或者同义词NULL。默认是DEBUG
        可以包含零个或多个元素，标识这个appender将会添加到这个logger。
    -->

    <!-- 4. 最终的策略 -->
    <!-- 4.1 开发环境:打印控制台-->
    <springProfile name="dev">
        <logger name="com.light" level="info"/>
        <root level="info">
            <appender-ref ref="CONSOLE" />
            <appender-ref ref="DEBUG_FILE" />
            <appender-ref ref="INFO_FILE" />
            <appender-ref ref="WARN_FILE" />
            <appender-ref ref="ERROR_FILE" />
        </root>
    </springProfile>


    <!-- 4.2 生产环境:输出到文档-->
    <springProfile name="prod">
        <logger name="com.light" level="warn"/>
        <root level="info">
            <appender-ref ref="ERROR_FILE" />
            <appender-ref ref="WARN_FILE" />
        </root>
    </springProfile>

</configuration>
```

### 3. application.yaml

```yaml
server:
  port: 8080

logging:
  config: classpath:logback-spring.xml

```

### 4. TraceLogInterceptor 自定义日志拦截
用途：每一次链路，线程维度，添加最终的链路ID TRACE_ID

```java
package com.light.cloud.common.web.log;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

public class TraceLogInterceptor implements HandlerInterceptor {

    private static final String TRACE_ID = "traceId";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String traceId = UUID.randomUUID().toString();
        // 可以考虑让客户端传入链路ID，但需保证一定的复杂度唯一性；如果没使用默认UUID自动生成
        if (StringUtils.isNotBlank(request.getHeader(TRACE_ID))) {
            traceId = request.getHeader(TRACE_ID);
        }
        MDC.put(TRACE_ID, traceId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                @Nullable Exception ex) {
        MDC.remove(TRACE_ID);
    }

}
```

MDC(Mapped Diagnostic Context)诊断上下文映射，是@Slf4j提供的一个支持动态打印日志信息的工具。

### 5. LogMvcConfigurer 添加拦截器


```java
package com.light.cloud.common.web.config;

import com.light.cloud.common.web.log.TraceLogInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class LogMvcConfigurer implements WebMvcConfigurer {

    @Bean
    public TraceLogInterceptor traceLogInterceptor() {
        return new TraceLogInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(traceLogInterceptor())
                // 可以具体制定哪些需要拦截，哪些不拦截，其实也可以使用自定义注解更灵活完成
                .addPathPatterns("/**")
                .excludePathPatterns("/*.html");
    }

}

```

其实这个拦截的部分可以改为使用自定义注解 + AOP实现。

### 6. ThreadPoolConfig 定义线程池，交给spring管理

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import java.util.concurrent.Executor;
 
@Configuration
@EnableAsync
public class ThreadPoolConfig {
    /**
     * 声明一个线程池
     *
     * @return 执行器
     */
    @Bean("MyExecutor")
    public Executor asyncExecutor() {
        TraceThreadPoolTaskExecutor executor = new TraceThreadPoolTaskExecutor();
        //核心线程数5：线程池创建时候初始化的线程数
        executor.setCorePoolSize(5);
        //最大线程数5：线程池最大的线程数，只有在缓冲队列满了之后才会申请超过核心线程数的线程
        executor.setMaxPoolSize(5);
        //缓冲队列500：用来缓冲执行任务的队列
        executor.setQueueCapacity(500);
        //允许线程的空闲时间60秒：当超过了核心线程出之外的线程在空闲时间到达之后会被销毁
        executor.setKeepAliveSeconds(60);
        //线程池名的前缀：设置好了之后可以方便我们定位处理任务所在的线程池
        executor.setThreadNamePrefix("asyncJCccc");
        executor.initialize();
        return executor;
    }
}
```

### 7. TraceThreadPoolTaskExecutor 包装

```java
package com.light.cloud.common.web.log;

import org.slf4j.MDC;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.util.concurrent.ListenableFuture;

import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

public class TracedThreadPoolTaskExecutor extends ThreadPoolTaskExecutor {

    public TracedThreadPoolTaskExecutor() {
        super();
    }

    @Override
    public void execute(Runnable task) {
        super.execute(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public <T> Future<T> submit(Callable<T> task) {
        return super.submit(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public Future<?> submit(Runnable task) {
        return super.submit(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public <T> CompletableFuture<T> submitCompletable(Callable<T> task) {
        return super.submitCompletable(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public CompletableFuture<Void> submitCompletable(Runnable task) {
        return super.submitCompletable(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public ListenableFuture<?> submitListenable(Runnable task) {
        return super.submitListenable(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public <T> ListenableFuture<T> submitListenable(Callable<T> task) {
        return super.submitListenable(TraceThreadMdcTool.wrap(task, MDC.getCopyOfContextMap()));
    }

}

```

### 8. TraceThreadMdcTool 包装

```java
package com.light.cloud.common.web.log;

import org.slf4j.MDC;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;

public class TraceThreadMdcTool {
    private static final String TRACE_ID = "traceId";

    // 获取唯一性标识
    public static String generateTraceId() {
        return UUID.randomUUID().toString();
    }

    public static void setTraceIdIfAbsent() {
        if (MDC.get(TRACE_ID) == null) {
            MDC.put(TRACE_ID, generateTraceId());
        }
    }

    /**
     * 用于父线程向线程池中提交任务时，将自身MDC中的数据复制给子线程
     *
     * @param callable
     * @param context
     * @param <T>
     * @return
     */
    public static <T> Callable<T> wrap(final Callable<T> callable, final Map<String, String> context) {
        return () -> {
            if (context == null) {
                MDC.clear();
            } else {
                MDC.setContextMap(context);
            }
            setTraceIdIfAbsent();
            try {
                return callable.call();
            } finally {
                MDC.clear();
            }
        };
    }

    /**
     * 用于父线程向线程池中提交任务时，将自身MDC中的数据复制给子线程
     *
     * @param runnable
     * @param context
     * @return
     */
    public static Runnable wrap(final Runnable runnable, final Map<String, String> context) {
        return () -> {
            if (context == null) {
                MDC.clear();
            } else {
                MDC.setContextMap(context);
            }
            setTraceIdIfAbsent();
            try {
                runnable.run();
            } finally {
                MDC.clear();
            }
        };
    }

}

```


## 分布式链路追踪

### 痛点
1. 查线上日志时，同一个 Pod 内多线程日志交错，很难追踪每个请求对应的日志信息。

2. 日志收集工具将多个 Pod 的日志收集到同一个数据库中后，情况就更加混乱不堪了。

### 解决
#### TraceId + MDC
MDC： [Mapped Diagnostic Context](https://logback.qos.ch/manual/mdc.html)

1. 前端每次请求时，添加` X-App-Trace-Id` 请求头，`X-App-Trace-Id` 值的生成方式可以选择`【时间戳 + UUID】`，保证 `traceId` 的唯一性。

2. 后端在 `TraceIdFilter` 中取出 `X-App-Trace-Id` 的值：`String traceId = httpServletRequest.getHeader(TRACE_ID_HEADER_KEY)`。如果请求没有携带 `X-App-Trace-Id` 请求头，后端服务可以使用 `UUID` 或者 `Snowflake` 算法生成一个 `traceId`。

3. 将 `traceId` 塞到 `slf4j` `MDC` 中：`MDC.put(MDC_TRACE_ID_KEY, traceId)`，在 `logback pattern` 中使用 `%X{traceId}` 占位符打印 `traceId`。

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    HttpServletRequest httpServletRequest = (HttpServletRequest) request;
    String traceId = httpServletRequest.getHeader(TRACE_ID_HEADER_KEY);
    if (StrUtil.isBlank(traceId)) {
        traceId = UUID.randomUUID().toString();
    }
    MDC.put(MDC_TRACE_ID_KEY, traceId);
    try {
        chain.doFilter(request, response);
    } finally {
        MDC.remove(MDC_TRACE_ID_KEY);
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="false">
    <property name="pattern" value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] %-5level [%thread] %logger %line [%X{traceId}] [%tid] - %msg%n"/>
```

#### 整合 Feign
发起服务间调用时，需要将 `MDC` 中的 `traceId` 传递到被调用服务。我们项目中统一使用 `Feign Client`，实现服务间的 HTTP 远程调用，在 `Feign RequestInterceptor` 中，取出 `MDC` 中的 `traceId`，塞到请求头中：`requestTemplate.header(TRACE_ID_HEADER_KEY, MDC.get(MDC_TRACE_ID_KEY));`

```java
@Override
public void apply(RequestTemplate template) {
    template.header(TRACE_ID_HEADER_KEY, MDC.get(MDC_TRACE_ID_KEY));
}
```

#### 多线程适配
> Please note that MDC as implemented by logback-classic assumes that values are placed into the MDC with moderate frequency. Also note that a child thread does not automatically inherit a copy of the mapped diagnostic context of its parent.

在子线程执行任务前，将父线程的 `MDC` 内容设置到子线程的 `MDC` 中；在子线程任务执行完成后，清除子线程 `MDC` 中的内容。

适配 JDK `ThreadPoolExecutor`：

```java
public class MdcAwareThreadPoolExecutor extends ThreadPoolExecutor {

    @Override
    public void execute(Runnable command) {
        Map<String, String> parentThreadContextMap = MDC.getCopyOfContextMap();
        super.execute(MdcTaskUtils.adaptMdcRunnable(command, parentThreadContextMap));
    }
}
```

适配 Spring `TaskDecorator`：

```java
@Component
public class MdcAwareTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        Map<String, String> parentThreadContextMap = MDC.getCopyOfContextMap();
        return MdcTaskUtils.adaptMdcRunnable(runnable, parentThreadContextMap);
    }
}
```

`MdcTaskUtils#adaptMdcRunnable()`：采用装饰者模式，装饰原生的 `Runnable runnable` 对象，在原生 `Runnable` 对象执行前，将父线程的 `MDC` 设置到子线程中，在原生 `Runnable` 对象执行结束后，清除子线程 `MDC` 中的内容。

```java
@Slf4j
public abstract class MdcTaskUtils {

    public static Runnable adaptMdcRunnable(Runnable runnable, Map<String, String> parentThreadContextMap) {
        return () -> {
            log.debug("parentThreadContextMap: {}, currentThreadContextMap: {}", parentThreadContextMap,
                    MDC.getCopyOfContextMap());
            if (MapUtils.isEmpty(parentThreadContextMap) || !parentThreadContextMap.containsKey(MDC_TRACE_ID_KEY)) {
                log.debug("can not find a parentThreadContextMap, maybe task is fired using async or schedule task.");
                MDC.put(MDC_TRACE_ID_KEY, UUID.randomUUID().toString());
            } else {
                MDC.put(MDC_TRACE_ID_KEY, parentThreadContextMap.get(MDC_TRACE_ID_KEY));
            }
            try {
                runnable.run();
            } finally {
                MDC.remove(MDC_TRACE_ID_KEY);
            }
        };
    }

}
```

#### 整合 Skywalking
Skywalking 官方提供了对 `logback 1.x` 版本的适配：`apm-toolkit-logback-1.x`，可以在 `logback` 中打印 `skywalking traceId`，可以将 `X-App-Trace-Id` 和 `skywalking traceId` 结合起来，方便接口业务和性能问题的排查。

1. `layout` 具体实现类选择 `TraceIdPatternLogbackLayout`。

2. 在 `logback pattern` 中使用 `%tid` 打印 `skywalking traceId`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="false">
    <property name="pattern" value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] %-5level [%thread] %logger %line [%X{traceId}] [%tid] - %msg%n"/>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
                <pattern>${pattern}</pattern>
            </layout>
        </encoder>
    </appender>
```

`TraceIdPatternLogbackLayout` 类初始化时，添加了两个 `PatternConverter`：

1. `tid`：使用 `LogbackPatternConverter`，将 `%tid` 占位符转换为 `skywalking traceId`。

2. `sw_ctx`：使用 `LogbackSkyWalkingContextPatternConverter`，将 `%sw_ctx` 占位符转换为 `skywalking context`。

```java
public class TraceIdPatternLogbackLayout extends PatternLayout {
    public TraceIdPatternLogbackLayout() {
    }

    static {
        defaultConverterMap.put("tid", LogbackPatternConverter.class.getName());
        defaultConverterMap.put("sw_ctx", LogbackSkyWalkingContextPatternConverter.class.getName());
    }
}
```

`LogbackPatternConverter#convert()` 方法写死了返回 `"TID: N/A"`，这是怎么回事呢？

```java
public class LogbackPatternConverter extends ClassicConverter {
    public LogbackPatternConverter() {
    }

    public String convert(ILoggingEvent iLoggingEvent) {
        return "TID: N/A";
    }
}
```

启动 Java 应用时，指定 `java agent` 启动参数 `-javaagent:-javaagent:/opt/tools/skywalking-agent.jar`。`skywalking agent` 会代理 `LogbackPatternConverter` 类，重写 `convert()` 方法的逻辑。

```java
package org.apache.skywalking.apm.toolkit.log.logback.v1.x;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;
import java.lang.reflect.Method;
import org.apache.skywalking.apm.agent.core.plugin.interceptor.enhance.EnhancedInstance;
import org.apache.skywalking.apm.agent.core.plugin.interceptor.enhance.InstMethodsInter;
import org.apache.skywalking.apm.toolkit.log.logback.v1.x.LogbackPatternConverter$auxiliary$pJ6Zrqzi;

public class LogbackPatternConverter
extends ClassicConverter
implements EnhancedInstance {
   private volatile Object _$EnhancedClassField_ws;
   public static volatile /* synthetic */ InstMethodsInter delegate$mo3but1;
   private static final /* synthetic */ Method cachedValue$oeLgRjrq$u5j8qu3;

   public String convert(ILoggingEvent iLoggingEvent) {
       return (String)delegate$mo3but1.intercept(this, new Object[]{iLoggingEvent}, new LogbackPatternConverter$auxiliary$pJ6Zrqzi(this, iLoggingEvent), cachedValue$oeLgRjrq$u5j8qu3);
   }

   private /* synthetic */ String convert$original$T8InTdln(ILoggingEvent iLoggingEvent) {
/*34*/         return "TID: N/A";
   }

   @Override
   public void setSkyWalkingDynamicField(Object object) {
       this._$EnhancedClassField_ws = object;
   }

   @Override
   public Object getSkyWalkingDynamicField() {
       return this._$EnhancedClassField_ws;
   }

   static {
       ClassLoader.getSystemClassLoader().loadClass("org.apache.skywalking.apm.dependencies.net.bytebuddy.dynamic.Nexus").getMethod("initialize", Class.class, Integer.TYPE).invoke(null, LogbackPatternConverter.class, -1942176692);
       cachedValue$oeLgRjrq$u5j8qu3 = LogbackPatternConverter.class.getMethod("convert", ILoggingEvent.class);
   }

   final /* synthetic */ String convert$original$T8InTdln$accessor$oeLgRjrq(ILoggingEvent iLoggingEvent) {
       return this.convert$original$T8InTdln(iLoggingEvent);
   }
}
```

### MDC 原理
`MDC` 在 `slf4j-api jar` 包中，`MDC` 是 `slf4j` 的规范，对 `MDC` 的所有操作都会落到 `MDCAdapter` 接口的方法上。

```java
public class MDC {

    static final String NULL_MDCA_URL = "http://www.slf4j.org/codes.html#null_MDCA";
    static final String NO_STATIC_MDC_BINDER_URL = "http://www.slf4j.org/codes.html#no_static_mdc_binder";
    static MDCAdapter mdcAdapter;
    
    public static void put(String key, String val) throws IllegalArgumentException {
        if (key == null) {
            throw new IllegalArgumentException("key parameter cannot be null");
        }
        if (mdcAdapter == null) {
            throw new IllegalStateException("MDCAdapter cannot be null. See also " + NULL_MDCA_URL);
        }
        mdcAdapter.put(key, val);
    }
}
```

`MDCAdapter` 是 `slf4j` 提供的 `MDC` 适配器接口，也就是 `MDC` 的规范。任何日志框架想要使用 `MDC` 功能，需要遵守 `MDCAdapter` 接口接口规范，实现接口中的方法。

```java
// This interface abstracts the service offered by various MDC implementations.
public interface MDCAdapter {

    public void put(String key, String val);

    public String get(String key);
}
```

`Logback` 日志框架提供了对 `MDCAdapter` 的适配：`LogbackMDCAdapter`，底层采用 `ThreadLocal` 实现。

```java
public class LogbackMDCAdapter implements MDCAdapter {

    // The internal map is copied so as

    // We wish to avoid unnecessarily copying of the map. To ensure
    // efficient/timely copying, we have a variable keeping track of the last
    // operation. A copy is necessary on 'put' or 'remove' but only if the last
    // operation was a 'get'. Get operations never necessitate a copy nor
    // successive 'put/remove' operations, only a get followed by a 'put/remove'
    // requires copying the map.
    // See http://jira.qos.ch/browse/LOGBACK-620 for the original discussion.

    // We no longer use CopyOnInheritThreadLocal in order to solve LBCLASSIC-183
    // Initially the contents of the thread local in parent and child threads
    // reference the same map. However, as soon as a thread invokes the put()
    // method, the maps diverge as they should.
    final ThreadLocal<Map<String, String>> copyOnThreadLocal = new ThreadLocal<Map<String, String>>();

    private static final int WRITE_OPERATION = 1;
    private static final int MAP_COPY_OPERATION = 2;

    // keeps track of the last operation performed
    final ThreadLocal<Integer> lastOperation = new ThreadLocal<Integer>();


    public void put(String key, String val) throws IllegalArgumentException {
        if (key == null) {
            throw new IllegalArgumentException("key cannot be null");
        }

        Map<String, String> oldMap = copyOnThreadLocal.get();
        Integer lastOp = getAndSetLastOperation(WRITE_OPERATION);

        if (wasLastOpReadOrNull(lastOp) || oldMap == null) {
            Map<String, String> newMap = duplicateAndInsertNewMap(oldMap);
            newMap.put(key, val);
        } else {
            oldMap.put(key, val);
        }
    }
    
    public String get(String key) {
        final Map<String, String> map = copyOnThreadLocal.get();
        if ((map != null) && (key != null)) {
            return map.get(key);
        } else {
            return null;
        }
    }
}
```

### Logback 占位符
`PatternLayout` 类初始化时，设置了 `logback` 常用占位符对应的 `Converter`。

```java
public class PatternLayout extends PatternLayoutBase<ILoggingEvent> {

    public static final Map<String, String> DEFAULT_CONVERTER_MAP = new HashMap<String, String>();
    public static final Map<String, String> CONVERTER_CLASS_TO_KEY_MAP = new HashMap<String, String>();
    
    /**
     * @deprecated replaced by DEFAULT_CONVERTER_MAP
     */
    public static final Map<String, String> defaultConverterMap = DEFAULT_CONVERTER_MAP;
    
    public static final String HEADER_PREFIX = "#logback.classic pattern: ";

    static {
        DEFAULT_CONVERTER_MAP.putAll(Parser.DEFAULT_COMPOSITE_CONVERTER_MAP);

        DEFAULT_CONVERTER_MAP.put("d", DateConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("date", DateConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(DateConverter.class.getName(), "date");
        
        DEFAULT_CONVERTER_MAP.put("r", RelativeTimeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("relative", RelativeTimeConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(RelativeTimeConverter.class.getName(), "relative");
        
        DEFAULT_CONVERTER_MAP.put("level", LevelConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("le", LevelConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("p", LevelConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(LevelConverter.class.getName(), "level");
        
        
        DEFAULT_CONVERTER_MAP.put("t", ThreadConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("thread", ThreadConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(ThreadConverter.class.getName(), "thread");
        
        DEFAULT_CONVERTER_MAP.put("lo", LoggerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("logger", LoggerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("c", LoggerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(LoggerConverter.class.getName(), "logger");
        
        DEFAULT_CONVERTER_MAP.put("m", MessageConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("msg", MessageConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("message", MessageConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(MessageConverter.class.getName(), "message");
        
        DEFAULT_CONVERTER_MAP.put("C", ClassOfCallerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("class", ClassOfCallerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(ClassOfCallerConverter.class.getName(), "class");
        
        DEFAULT_CONVERTER_MAP.put("M", MethodOfCallerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("method", MethodOfCallerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(MethodOfCallerConverter.class.getName(), "method");
        
        DEFAULT_CONVERTER_MAP.put("L", LineOfCallerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("line", LineOfCallerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(LineOfCallerConverter.class.getName(), "line");
        
        DEFAULT_CONVERTER_MAP.put("F", FileOfCallerConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("file", FileOfCallerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(FileOfCallerConverter.class.getName(), "file");
        
        DEFAULT_CONVERTER_MAP.put("X", MDCConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("mdc", MDCConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("ex", ThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("exception", ThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("rEx", RootCauseFirstThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("rootException", RootCauseFirstThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("throwable", ThrowableProxyConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("xEx", ExtendedThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("xException", ExtendedThrowableProxyConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("xThrowable", ExtendedThrowableProxyConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("nopex", NopThrowableInformationConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("nopexception", NopThrowableInformationConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("cn", ContextNameConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("contextName", ContextNameConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(ContextNameConverter.class.getName(), "contextName");
        
        DEFAULT_CONVERTER_MAP.put("caller", CallerDataConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(CallerDataConverter.class.getName(), "caller");
        
        DEFAULT_CONVERTER_MAP.put("marker", MarkerConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(MarkerConverter.class.getName(), "marker");
        
        DEFAULT_CONVERTER_MAP.put("property", PropertyConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("n", LineSeparatorConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("black", BlackCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("red", RedCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("green", GreenCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("yellow", YellowCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("blue", BlueCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("magenta", MagentaCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("cyan", CyanCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("white", WhiteCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("gray", GrayCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldRed", BoldRedCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldGreen", BoldGreenCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldYellow", BoldYellowCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldBlue", BoldBlueCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldMagenta", BoldMagentaCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldCyan", BoldCyanCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("boldWhite", BoldWhiteCompositeConverter.class.getName());
        DEFAULT_CONVERTER_MAP.put("highlight", HighlightingCompositeConverter.class.getName());

        DEFAULT_CONVERTER_MAP.put("lsn", LocalSequenceNumberConverter.class.getName());
        CONVERTER_CLASS_TO_KEY_MAP.put(LocalSequenceNumberConverter.class.getName(), "lsn");
        
        DEFAULT_CONVERTER_MAP.put("prefix", PrefixCompositeConverter.class.getName());
    }
}
```

`ThreadConverter`：将 `%thread` 占位符转换为 `logger` 线程。

```java
public class ThreadConverter extends ClassicConverter {

    public String convert(ILoggingEvent event) {
        return event.getThreadName();
    }
)
```

在 `PatternLayout` 中，默认添加了对 `MDC` 的支持，可以将 `%X{key}` 或者 `%mdc{key}` 占位符转换为 `MDC.get(key)`。

```java
DEFAULT_CONVERTER_MAP.put("X", MDCConverter.class.getName());
DEFAULT_CONVERTER_MAP.put("mdc", MDCConverter.class.getName());
```

`MDCConverter` 为何可以将 `%X{traceId}` 或者 `%mdc{traceId}` 占位符转换为 `MDC.get("traceId")` ？

在程序启动时，`ch.qos.logback.core.pattern.parser.Compiler#compile()` 会解析用户配置的 `pattern` 表达式，得到 `pattern` 中需要动态解析的占位符，比如 `%d{yyyy-MM-dd HH:mm:ss.SSS}`，`%X{traceId}`。将这些动态占位符传递给 `DynamicConverter#optionList` 字段（`MDCConverter` 本质就是 `DynamicConverter`），`optionList` 字段包含程序要处理的占位符名称，比如 `traceId`。

![img](./img/25/25-1.awebp)

程序启动时，logback 进行 `Convert` 初始化，会调用 `MDCConverter#start()` 方法，将成员变量 `private String key` 的值设置为 `traceId`（`MDCConverter#getFirstOption()` 返回用户配置的 `traceId`）。

![img](./img/25/25-2.awebp)

在 `MDCConverter#convert()` 方法中，将 `traceId` 占位符转换为 `MDC.get(key)`：`String value = mdcPropertyMap.get(key)`。

```java
public class MDCConverter extends ClassicConverter {

    private String key;
    private String defaultValue = "";

    @Override
    public void start() {
        String[] keyInfo = extractDefaultReplacement(getFirstOption());
        key = keyInfo[0];
        if (keyInfo[1] != null) {
            defaultValue = keyInfo[1];
        }
        super.start();
    }

    @Override
    public String convert(ILoggingEvent event) {
        Map<String, String> mdcPropertyMap = event.getMDCPropertyMap();

        if (mdcPropertyMap == null) {
            return defaultValue;
        }

        if (key == null) {
            return outputMDCForAllKeys(mdcPropertyMap);
        } else {

            String value = mdcPropertyMap.get(key);
            if (value != null) {
                return value;
            } else {
                return defaultValue;
            }
        }
    }
}
```

`ILoggingEvent` 接口的实现类 `LoggingEvent` 中，对 `MDCAdapter` 做了适配：

```java
public class LoggingEvent implements ILoggingEvent {

    public Map<String, String> getMDCPropertyMap() {
        // populate mdcPropertyMap if null
        if (mdcPropertyMap == null) {
            MDCAdapter mdc = MDC.getMDCAdapter();
            if (mdc instanceof LogbackMDCAdapter)
                mdcPropertyMap = ((LogbackMDCAdapter) mdc).getPropertyMap();
            else
                mdcPropertyMap = mdc.getCopyOfContextMap();
        }
        // mdcPropertyMap still null, use emptyMap()
        if (mdcPropertyMap == null)
            mdcPropertyMap = Collections.emptyMap();

        return mdcPropertyMap;
    }
}
```
