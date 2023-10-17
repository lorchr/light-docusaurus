- [分布式缓存中间件——Redis vs. Hazelcast](https://blog.csdn.net/Amber_yao/article/details/128644334)

## 为什么需要缓存？
使用缓存主要是为了提升用户体验以及应对更多的用户。主要有两个用途：高性能和高并发
**高性能：** 对于一些需要复杂操作耗时查出来的结果，访问结果属于高频请求数据且确定不会经常改
变，可以将查询出来的结果放在缓存中，操作缓存就相当于直接操作内存，速度很快，不过要注意保
持数据库和缓存中数据的一致性。
**高并发：** 当QPS较高是，可以考虑将一部分请求直接到缓存而不用经过数据库，提高系统的并发性。

## 分布式缓存
分布式缓存主要解决的是单机缓存的容量受服务器限制并且无法保存通用的信息。因为，本地缓存
只在当前服务里有效，如果部署了两个相同的服务，他们两者之间的缓存数据是无法共同的。

## Hazelcast
Hazelcast 分为开源版和商用版，开源版本遵循 Apache License 2.0 开源协议可以免费使用，商用
版本需要获取特定的License。两者之间最大的区别在于:商用版本提供了数据的高密度存储。
JVM中有特定的GC机制，无论数据是在堆中还是栈中，只要发现无效引用的数据块，就有可能被回
收。而Hazelcast的分布式数据都存放在JVM的内存中，频繁的读写数据会导致大量的GC开销。
使用商业版的Hazelcast会拥有高密度存储的特性，大大降低JVM的内存开销，从而降低GC开销。
详解可看：https://docs.hazelcast.org/docs/3.10.4/manual/html-single/index.html#preface

### 数据结构
Hazelcast提供了很多通用数据结构的分布式实现。针对每一种不同的客户端语言，Hazelcast都尽量模
拟该语言原生接口，Hazelcast 提供了 Map、Queue、MultiMap、Set、List、Semaphore、Atomic 等
常用接口的分布式实现。

### 持久化
Hazelcast 会使用哈希算法对数据进行分区，比如对于一个给定的map中的键，或者topic和list中的对
象名称，分区存储的过程如下:
- 先序列化此键或对象名称，得到一个byte数组；
- 然后对上面得到的byte数组进行哈希运算；
- 再进行取模后的值即为分区号；
- 最后每个节点维护一个分区表，存储着分区号与节点之间的对应关系，这样每个节点都知道如何获取数据。

### 集成
Hazelcast简单易用，Hazelcast 实现并扩展了许多 java.util.concurrent 结构，这使得它非常易于使用和
与代码集成。在机器上开始使用 Hazelcast 的配置只需要将 Hazelcast jar 添加到我们的类路径中。

1. 添加依赖：

```xml
<dependency>
    <groupId>com.hazelcast</groupId>
    <artifactId>hazelcast-all</artifactId>
    <version>3.10.1</version>
</dependency>
```

2. 配置文件

```properties
spring.session.store-type=hazelcast
hazelcast.server.cluster.ip=127.0.0.1
hazelcast.server.cluster.port=20000
hazelcast.server.join.timeout=10
```

3. 配置类

```java
import com.hazelcast.config.Config;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.GroupConfig;
import com.hazelcast.config.JoinConfig;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.MaxSizeConfig;
import com.hazelcast.config.MulticastConfig;
import com.hazelcast.config.NetworkConfig;
import com.hazelcast.config.TcpIpConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class HazelcastConfiguration {

    @Value("${hazalcast.server.cluster.ip:127.0.0.1}")
    private List<String> clusterIps;

    @Value("${hazalcast.server.cluster.port:20000}")
    private Integer port;

    @Value("${hazalcast.server.join.timeout}")
    private Integer timeout;

    @Bean
    public Config hazelcastConfig() {
        // 解决同项目下不同库的项目
        GroupConfig groupConfig = new GroupConfig("hazelGroup");

        Config config = new Config()
                .setInstanceName("hazelcast-instance")
                .addMapConfig(new MapConfig()
                        .setName("configuration")
                        // MAP存储条目的最大值，默认为0
                        .setMaxSizeConfig(new MaxSizeConfig(200, MaxSizeConfig.MaxSizePolicy.FREE_HEAP_SIZE))
                        // 缓存淘汰策略 NONE LRU LFU
                        .setEvictionPolicy(EvictionPolicy.LRU)
                        // 默认缓存时间，默认为0
                        .setTimeToLiveSeconds(-1)
                )
                .setGroupConfig(groupConfig);

        NetworkConfig networkConfig = config.getNetworkConfig();
        JoinConfig joinConfig = networkConfig.getJoin();
        MulticastConfig multicastConfig = joinConfig.getMulticastConfig();
        TcpIpConfig tcpIpConfig = joinConfig.getTcpIpConfig();

        networkConfig.setPort(port);

        multicastConfig.setEnabled(false);
        
        tcpIpConfig.setEnabled(true);
        tcpIpConfig.setConnectionTimeoutSeconds(timeout);
        for (String clusterIp : clusterIps) {
            tcpIpConfig.addMember(clusterIp);
        }

        return config;
    }
}

```

4. 简单使用

```java
// 注入Hazelcast对象
@Resource
private HazelcastInstance hazelcastInstance;

// hazelcastInstance.getXXX 来获取或创建对应的数据结构对象
hazelcastInstance.getMap("A"); // 获取一个实现了 java.util.Map接口的IMap对象，对象名为A
hazelcastInstance.getSet("B"); // 获取一个实现了 java.util.Set接口的ISet对象，对象名为B
```

## Redis
### 数据结构
Redis 是一个内存键值key-value 数据库，且键值对数据保存在内存中，因此Redis基于内存的数据操作，其效率高，速度快；其中，Key是String类型，Redis 支持的 value 类型包括了 String、List 、 Hash 、 Set 、 Sorted Set 、BitMap等。

### 持久化
一种持久化方式是快照（Redis DataBase，RDB），另一种是只追加文件（append-only file, AOF）

**快照持久化（默认持久化方式）：** 在不同的时间点，将 redis 存储的数据生成快照并存储到磁盘等介质上。

**只追加文件：**开启 AOF 持久化后每执行一条会更改 Redis 中的数据的命令，Redis 就会将该命令写入硬盘中的 AOF文件。在下次 redis 重新启动时，执行一遍AOF 文件就可以实现数据恢复了。AOF 文件的保存位置和 RDB 文件的位置相同，都是通过 dir 参数设置的，默认的文件名是 appendonly.aof。

Redis 4.0 支持 RDB 和 AOF 的混合持久化（默认关闭，可以通过配置项aof-use-rdb-preamble 开启）。

### 集成
集成方式：

1. 是集成redis官方推荐的jredis客户端;

集成方法参考：https://blog.csdn.net/weixin_45239670/article/details/113185684

2. springboot 自带的redisTemplate

添加依赖：

集成jedis客户端
```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.3.0</version>
</dependency>
```

使用springboot 自带的
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

3. 配置文件

```properties
spring.data.redis.cluster.nodes=
spring.data.redis.cluster.max-redirects=3
spring.data.redis.database=1
spring.data.redis.password=
spring.data.redis.jedis.pool.min-idle=8
spring.data.redis.jedis.pool.max-idle=12
spring.data.redis.jedis.pool.max-active=1000
spring.data.redis.jedis.pool.max-wait=2000
```

4. 工具类

```java
public class RedisUtil {

    @Resource
    private RedisTempalte<String, Object> redisTemplate;

    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }


     public void set(String key, Object value) {
        return redisTemplate.opsForValue().set(key, value);
    }
}
```

|           | 持久性                               | 一致性     | 实现语言 | API                                | 查询方法              |
| --------- | ------------------------------------ | ---------- | -------- | ---------------------------------- | --------------------- |
| Hazelcast | 用户定义的MapStore，可以是持久的     | 强一致性   | Java     | HTTP、Java、C#和任何Memcache客户端 | Get, MapReduce        |
| Redis     | 快照持久化和只追加文件，两者可以组合 | 最终一致性 | C        | Java, C, C#, Ruby, Perl, Scala     | Get（也取决于值结构） |

Redis和Hazelcast 性能对比：https://hazelcast.com/blog/hazelcast-responds-to-redis-labs-benchmark/ （由Hazelcast官网提供，可能不够客观）

## redisTemplate、jedis、lettuce、redission对比
1. redisTemplate是基于某个具体实现的再封装，比如说springBoot1.x时，具体实现是jedis；而到了springBoot2.x时，具体实现变成了lettuce。封装的好处就是隐藏了具体的实现，使调用更简单，但是有人测试过jedis效率要10-30倍的高于redisTemplate的执行效率，所以单从执行效率上来讲，jedis完爆redisTemplate。redisTemplate的好处就是基于springBoot自动装配的原理，使得整合redis时比较简单。

2. jedis作为老牌的redis客户端，采用同步阻塞式IO，采用线程池时是线程安全的。优点是简单、灵活、api全面，缺点是某些redis高级功能需要自己封装。

3. lettuce作为新式的redis客户端，基于netty采用异步非阻塞式IO，是线程安全的，优点是提供了很多redis高级功能，例如集群、哨兵、管道等，缺点是api抽象，学习成本高。lettuce好是好，但是jedis比他生得早。

4. redission作为redis的分布式客户端，同样基于netty采用异步非阻塞式IO，是线程安全的，优点是提供了很多redis的分布式操作和高级功能，缺点是api抽象，学习成本高。

总结：单机并发量低时优先选择jedis，分布式高并发时优先选择redission。

因为hazelcast 的分布式特性，以及redission 的结构与hazelcast相似 因此使用redission

## redission
添加依赖
```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>3.14.1</version>
</dependency>
```

配置类 可参考官方文档：https://github.com/redisson/redisson/wiki/%E7%9B%AE%E5%BD%95
```java
@Configuration
public class RedissonConfiguration {

    @Bean
    public RedissonClient redissonClient(RedisProperties redisProperties) {
        RedisProperties.Cluster cluster = redisProperties.getCluster();
        String password = redisProperties.getPassword();

        Config config = new Config();
        if(Objects.isNull(cluster)) {
            String[] redisUrls = cluster.getNodes().stream().map(node -> String.format("redis://%s", node)).toArray(String[]::new);
            ClusterServersConfig clusterServersConfig = config.useClusterServers().addNodeAddress(redisUrls);
            if(StringUtils.isNotBlank(password)) {
                clusterServersConfig.setPassword(password);
            }
        } else {
            String redisUrl = String.format("redis://%s", redisProperties.getHost(), redisProperties.getPort());
            SingleServerConfig singleServerConfig = config.useSingleServer().setAddress(redisUrl);
            if(StringUtils.isNotBlank(password)) {
                singleServerConfig.setPassword(password);
            }
        }
        return Redissson.create(config);
    }
}
```

Redisson的分布式的`RMapCache` Java对象在基于RMap的前提下实现了针对单个元素的淘汰机制。同时仍然保留了元素的插入顺序。映射缓存(MapCache)它能够保留插入元素的顺序，并且可以指明每个元素的过期时间（专业一点叫元素淘汰机制）。另外还为每个元素提供了监听器，提供了4种不同类型的监听器。有：添加、过期、删除、更新四大事件。