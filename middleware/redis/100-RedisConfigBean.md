
Redis配置类
```java
import com.alibaba.fastjson.JSON;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.ReadFrom;
import io.lettuce.core.SocketOptions;
import io.lettuce.core.TimeoutOptions;
import io.lettuce.core.cluster.ClusterClientOptions;
import io.lettuce.core.cluster.ClusterTopologyRefreshOptions;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.resource.EpollProvider;
import io.lettuce.core.resource.NettyCustomizer;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelDuplexHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.epoll.EpollChannelOption;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.handler.timeout.IdleStateHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ClassUtils;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.Date;
import java.util.Locale;

/**
 * redis配置
 *
 */
@Slf4j
@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {

    @Value("${redis.cache.expire}")
    private Long expireTime;

    /**
     * redis cluster 连接时 RedisConnectionFactory bean 注入
     * 在构建LettuceConnectionFactory时，如果不使用内置的destroyMethod，可能会导致Redis连接早于其它Bean被销毁
     * @return
     */
    @Bean(destroyMethod = "destroy")
    public LettuceConnectionFactory myLettuceConnectionFactory(RedisProperties redisProperties) {
        // https://github.com/lettuce-io/lettuce-core/wiki/Redis-Cluster#user-content-refreshing-the-cluster-topology-view
        // 配置用于开启自适应刷新和定时刷新。如自适应刷新不开启，Redis集群变更时将会导致连接异常
        ClusterTopologyRefreshOptions clusterTopologyRefreshOptions = ClusterTopologyRefreshOptions.builder()
                .enablePeriodicRefresh(Duration.ofSeconds(30))// 开启周期刷新(默认60秒)
                .enableAllAdaptiveRefreshTriggers()// 开启自适应刷新
                .build();

        // 6.2.7之后新增配置项，仅支持Linux 不支持Windows
        // https://github.com/lettuce-io/lettuce-core/issues/2082
//        SocketOptions socketOptions = SocketOptions.builder()
//                .keepAlive(SocketOptions.KeepAliveOptions.builder()
//                        .enable()
//                        .idle(Duration.ofSeconds(15))
//                        .interval(Duration.ofSeconds(5))
//                        .count(3)
//                        .build())
//                // TCP_USER_TIMEOUT >= TCP_KEEPIDLE + TCP_KEEPINTVL * TCP_KEEPCNT
//                .tcpUserTimeout(SocketOptions.TcpUserTimeoutOptions.builder()
//                        .enable()
//                        .tcpUserTimeout(Duration.ofSeconds(30))
//                        .build())
//                .build();

        // https://github.com/lettuce-io/lettuce-core/wiki/Client-Options
        ClusterClientOptions clusterClientOptions = ClusterClientOptions.builder()
                //redis命令超时时间,超时后才会使用新的拓扑信息重新建立连接
                .timeoutOptions(TimeoutOptions.enabled(Duration.ofSeconds(10)))
                .topologyRefreshOptions(clusterTopologyRefreshOptions)//拓扑刷新
                .disconnectedBehavior(ClientOptions.DisconnectedBehavior.REJECT_COMMANDS)
                .autoReconnect(true)
                .socketOptions(SocketOptions.builder().keepAlive(true).build())
                .validateClusterNodeMembership(false)// 取消校验集群节点的成员关系
                .build();

        RedisProperties.Pool pool = redisProperties.getLettuce().getPool();
        GenericObjectPoolConfig genericObjectPoolConfig = new GenericObjectPoolConfig();
        genericObjectPoolConfig.setMaxIdle(pool.getMaxIdle());
        genericObjectPoolConfig.setMinIdle(pool.getMinIdle());
        genericObjectPoolConfig.setMaxTotal(pool.getMaxActive());
        genericObjectPoolConfig.setMaxWait(pool.getMaxWait());

        LettuceClientConfiguration clientConfig = LettucePoolingClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(10_000))
                .poolConfig(genericObjectPoolConfig)
                .clientOptions(clusterClientOptions)
                .readFrom(ReadFrom.REPLICA_PREFERRED)
                .clientResources(clientResources())
                .build();
        return new LettuceConnectionFactory(clusterConfiguration(redisProperties), clientConfig);
    }

    private RedisClusterConfiguration clusterConfiguration(RedisProperties redisProperties) {
        RedisProperties.Cluster clusterProperties = redisProperties.getCluster();
        RedisClusterConfiguration config = new RedisClusterConfiguration(clusterProperties.getNodes());
        if (clusterProperties.getMaxRedirects() != null) {
            config.setMaxRedirects(clusterProperties.getMaxRedirects());
        }
        if (redisProperties.getPassword() != null) {
            config.setPassword(RedisPassword.of(redisProperties.getPassword()));
        }
        return config;
    }

    public ClientResources clientResources() {
        NettyCustomizer nettyCustomizer = new NettyCustomizer() {
            // https://github.com/lettuce-io/lettuce-core/issues/762
            @Override
            public void afterChannelInitialized(Channel channel) {
                // Windows下没有Epoll，使用 netty 心跳检测处理
                if (!EpollProvider.isAvailable()) {
                    channel.pipeline()
                            .addLast(new IdleStateHandler(120, 120, 240))
                            .addLast(new ChannelDuplexHandler() {
                                @Override
                                public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
                                    if (evt instanceof IdleStateEvent) {
                                        ctx.disconnect();
                                    }
                                }
                            });
                }
            }

            // https://github.com/lettuce-io/lettuce-core/issues/1428
            @Override
            public void afterBootstrapInitialized(Bootstrap bootstrap) {
                if (EpollProvider.isAvailable()) {
                    bootstrap.option(EpollChannelOption.SO_KEEPALIVE, Boolean.TRUE);
                    bootstrap.option(EpollChannelOption.TCP_KEEPIDLE, 15);
                    bootstrap.option(EpollChannelOption.TCP_KEEPINTVL, 5);
                    bootstrap.option(EpollChannelOption.TCP_KEEPCNT, 3);
                    // Socket Timeout (milliseconds)
                    // TCP_USER_TIMEOUT >= TCP_KEEPIDLE + TCP_KEEPINTVL * TCP_KEEPCNT
                    // https://blog.cloudflare.com/when-tcp-sockets-refuse-to-die/
                    bootstrap.option(EpollChannelOption.TCP_USER_TIMEOUT, 60_000);
                }
            }
        };
        return ClientResources.builder().nettyCustomizer(nettyCustomizer).build();
    }

    /**
     * redis 数据监听bean
     *
     * @param beanFactory
     * @param redisConnectionFactory
     * @return
     */
    @Bean
    public RedisMessageListenerFactory redisMessageListenerFactory(DefaultListableBeanFactory beanFactory,
                                                                   RedisConnectionFactory redisConnectionFactory) {
        return new RedisMessageListenerFactory(beanFactory, redisConnectionFactory);
    }

    @Bean
    @SuppressWarnings(value = {"unchecked", "rawtypes"})
    public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<Object, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        FastJson2JsonRedisSerializer serializer = new FastJson2JsonRedisSerializer(Object.class);

        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
        serializer.setObjectMapper(mapper);

        // 使用StringRedisSerializer来序列化和反序列化redis的key值
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);

        // Hash的key也采用StringRedisSerializer的序列化方式
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisTool redisTool(RedisTemplate<Object, Object> redisTemplate) {
        return new RedisTool(redisTemplate);
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        FastJson2JsonRedisSerializer genericJackson2JsonRedisSerializer = new FastJson2JsonRedisSerializer(Object.class);
        //解决查询缓存转换异常的问题
        // 配置序列化（解决乱码的问题）
        //entryTtl设置过期时间
        //serializeValuesWith设置redis存储的序列化方式
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(expireTime))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(genericJackson2JsonRedisSerializer))
                .disableCachingNullValues();
        //定义要返回的redis缓存管理对象
        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
        return cacheManager;
    }

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration() {
        FastJson2JsonRedisSerializer serializer = new FastJson2JsonRedisSerializer(Object.class);
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig();
        configuration = configuration.serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .entryTtl(Duration.ofSeconds(expireTime));
        return configuration;
    }

    /**
     * 自定义生成redis-key
     *
     * @return
     */
    @Override
    @Bean
    public KeyGenerator keyGenerator() {
        String sp = "_";
        return (o, method, objects) -> {
            StringBuilder sb = new StringBuilder();
//            sb.append(o.getClass().getSimpleName()).append(sp);
//            sb.append(method.getName()).append(sp);
            if (objects.length > 0) {
                for (Object object : objects) {
                    if (isSimpleValueType(object.getClass())) {
                        sb.append(object).append(sp);
                    } else {
                        sb.append(JSON.toJSONString(object).hashCode());
                    }
                }
            } else {
                sb.append("NO_PARAM_KEY");
            }
            // 调试时可观测
//            log.info("自定义生成redis-key => {}", sb);
            return sb.toString();
        };
    }

    /**
     * 判断是否是简单值类型.包括：基础数据类型、CharSequence、Number、Date、URL、URI、Locale、Class;
     *
     * @param clazz
     * @return
     */
    public static boolean isSimpleValueType(Class<?> clazz) {
        return (ClassUtils.isPrimitiveOrWrapper(clazz) || clazz.isEnum() || CharSequence.class.isAssignableFrom(clazz)
                || Number.class.isAssignableFrom(clazz) || Date.class.isAssignableFrom(clazz) || URI.class == clazz
                || URL.class == clazz || Locale.class == clazz || Class.class == clazz);
    }
}
```


Redis事件监听容器工厂注册
```java
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.data.redis.connection.*;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

import javax.annotation.PostConstruct;

/**
 * redis cluster 事件监听
 */
@Slf4j
public class RedisMessageListenerFactory {
    @Value("${spring.redis.password}")
    private String password;

    @Value("${spring.redis.cluster.nodes:}")
    private String nodes;

    private final DefaultListableBeanFactory beanFactory;

    private final RedisConnectionFactory redisConnectionFactory;

    public RedisMessageListenerFactory(DefaultListableBeanFactory beanFactory, RedisConnectionFactory redisConnectionFactory) {
        this.beanFactory = beanFactory;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @PostConstruct
    public void createRedisListenerContain() {
        // 单机
        if (StrUtil.isBlank(nodes)) {
            registerRedisMessageListenerContainerBean("redisMessageContainer", redisConnectionFactory);
            return;
        }

        RedisClusterConnection redisClusterConnection = redisConnectionFactory.getClusterConnection();
        Iterable<RedisClusterNode> nodes = redisClusterConnection.clusterGetNodes();
        for (RedisClusterNode node : nodes) {
            if (node.isMaster()) {
                log.info("获取到redis的master节点为[{}]", node);
                String containerBeanName = "messageContainer" + node.hashCode();
                if (beanFactory.containsBean(containerBeanName)) {
                    return;
                }

                RedisStandaloneConfiguration redisStandaloneConfiguration =
                        new RedisStandaloneConfiguration();
                redisStandaloneConfiguration.setHostName(node.getHost());
                redisStandaloneConfiguration.setPassword(RedisPassword.of(password));
                redisStandaloneConfiguration.setPort(node.getPort());
                JedisConnectionFactory factory = new JedisConnectionFactory(redisStandaloneConfiguration);
                factory.afterPropertiesSet();
                factory.getConnection().setConfig("notify-keyspace-events", "KEA");

                registerRedisMessageListenerContainerBean(containerBeanName, factory);
            }
        }
    }

    private void registerRedisMessageListenerContainerBean(String containerBeanName, RedisConnectionFactory factory) {
        BeanDefinitionBuilder containerBeanDefinitionBuilder = BeanDefinitionBuilder
                .genericBeanDefinition(RedisMessageListenerContainer.class);
        containerBeanDefinitionBuilder.addPropertyValue("connectionFactory", factory);
        containerBeanDefinitionBuilder.setScope(BeanDefinition.SCOPE_SINGLETON);
        containerBeanDefinitionBuilder.setLazyInit(false);
        beanFactory.registerBeanDefinition(containerBeanName,
                containerBeanDefinitionBuilder.getRawBeanDefinition());

        RedisMessageListenerContainer container = beanFactory.getBean(containerBeanName,
                RedisMessageListenerContainer.class);
        container.start();
    }
}
```

Redis事件监听注册服务
```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * redis集群的监听注册服务
 */
@Slf4j
@Service
@DependsOn("redisMessageListenerFactory")
public class RedisListenerService {

    /**
     * 监听key过期事件
     * @param listener
     */
    public void startExpiredListener(MessageListener listener) {
        List<RedisMessageListenerContainer> redisListenerContainerList = SpringUtils.getBeansOfType(RedisMessageListenerContainer.class);
        log.info("redisListenerContainerList.size() = " + redisListenerContainerList.size());
        for (RedisMessageListenerContainer container : redisListenerContainerList) {
            container.addMessageListener(listener, new PatternTopic("__keyevent@*__:expired"));
        }
    }

    public void monitorKeyListener(MessageListener listener, String key) {
        List<RedisMessageListenerContainer> redisListenerContainerList = SpringUtils.getBeansOfType(RedisMessageListenerContainer.class);
        for (RedisMessageListenerContainer container : redisListenerContainerList) {
            container.addMessageListener(listener, new PatternTopic("__keyspace@*__:" + key));
        }
    }

    public void removeMonitorKeyListener(MessageListener listener, String key) {
        PatternTopic patternTopic = new PatternTopic("__keyspace@*__:" + key);
        List<RedisMessageListenerContainer> redisListenerContainerList = SpringUtils.getBeansOfType(RedisMessageListenerContainer.class);
        for (RedisMessageListenerContainer container : redisListenerContainerList) {
            container.removeMessageListener(listener, patternTopic);
        }
    }
}

```

Redis key过期事件监听实现类
```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * Redis事件监听器实现类
 */
@Slf4j
@Component("redisKeyExpirationListener")
public class RedisKeyExpirationListener implements MessageListener {

    @Resource
    private RedisService redisService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        //获取过期的key
        String expireKey = message.toString();
         if (expireKey.contains(CacheConstants.ONLINEMONITOR)){
             String thingName = expireKey.split(CacheConstants.ONLINEMONITOR)[1];
             redisService.setCacheMapValue(CacheConstants.ONLINELIST,thingName,false);
         }
         if (expireKey.contains(CacheConstants.RUNNINGMONITOR)){
             String thingName = expireKey.split(CacheConstants.RUNNINGMONITOR)[1];
             redisService.setCacheMapValue(CacheConstants.ONLINELIST,thingName,false);
         }
    }
}
```

Redis事件监听配置类
```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.MessageListener;

import javax.annotation.PostConstruct;

/**
 * 启动redis key 过期监听
 */
@Configuration
public class StartRedisExpiredListener {
    private RedisListenerService clusterListenerService;

    private MessageListener messageListener;

    public StartRedisExpiredListener(RedisListenerService clusterListenerService,
                                     @Qualifier("redisKeyExpirationListener") MessageListener messageListener) {
        this.clusterListenerService = clusterListenerService;
        this.messageListener = messageListener;
    }

    @PostConstruct
    public void startExpiredListener() {
        clusterListenerService.startExpiredListener(this.messageListener);
    }
}
```
