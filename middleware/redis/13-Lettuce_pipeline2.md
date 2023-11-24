- [lettuce 在spring-data-redis包装后关于pipeline的坑，你知道吗？](https://cloud.tencent.com/developer/article/1661743)
- [spring-data-redis中lettuce pipeline的坑之解决篇](https://cloud.tencent.com/developer/article/1661745)

> 在上一篇中我们知道了几种常用的redis client，分别分析了lettuce原生的pipeline处理方式和在使用spring data redis包装后的lettuce处理pipeline时源码细节，并知道了后者直接使用时并不是真正的pipeline操作。那么如果我既想要使用spring-data-redis来操作lettuce的pipeline，又想要真正做到pipeline该怎么处理呢？本节我们就来聊一聊这个问题。与此同时，我们会来进一步地分析下redis connection和pool的内容。

## 前言
我们先来了解下在spring-data-redis中是如何包装lettuce的连接的，然后会根据这些信息得到上一篇文章中留下的那个问题的解。

## 连接处理
会先后对r连接池、redisTemplate模式下的连接和shareNativeConnection模式下的连接处理方式进行分析。

## 连接池
如果想了解连接池的内容，就需要了解下LettuceConnectionFactory。我们来看一下它的属性：
```java
private final LettuceClientConfiguration clientConfiguration;

private @Nullable AbstractRedisClient client;
private @Nullable LettuceConnectionProvider connectionProvider;
private @Nullable LettuceConnectionProvider reactiveConnectionProvider;
private boolean validateConnection = false;
private boolean shareNativeConnection = true;
private @Nullable SharedConnection<byte[]> connection;
private @Nullable SharedConnection<ByteBuffer> reactiveConnection;
private @Nullable LettucePool pool;
/** Synchronization monitor for the shared Connection */
private final Object connectionMonitor = new Object();
private boolean convertPipelineAndTxResults = true;

private RedisStandaloneConfiguration standaloneConfig = new RedisStandaloneConfiguration("localhost", 6379);

private @Nullable RedisConfiguration configuration;

private @Nullable ClusterCommandExecutor clusterCommandExecutor;
```

### 主要属性:
- LettuceClientConfiguration：client的配置，基于commons pool的连接池目前也是基于它；
- AbstractRedisClient client：内部维持的redis client对象;
- LettuceConnectionProvider connectionProvider: 连接提供者，连接池就是由它来提供
- LettuceConnectionProvider reactiveConnectionProvider: reactive模式下的连接提供者
- validateConnection：是否校验连接•shareNativeConnection：是否共享本地连接
- SharedConnection<byte[]> connection：用于共享的连接，如果shareNativeConnection为false则此处为null
- SharedConnection reactiveConnection：用于reactive模式下的共享连接
- LettucePool pool：旧版本的lettuce连接池，目前由commons pool替代了
- Object connectionMonitor: 共享的连接之间用于同步的monitor

### 主要方法:
1. 连接池
```java
/**
 * @param pool
 * @deprecated since 2.0, use pooling via {@link LettucePoolingClientConfiguration}.
 */
@Deprecated
public LettuceConnectionFactory(LettucePool pool) {
    this(new MutableLettuceClientConfiguration());
    this.pool = pool;
}
```

旧的连接工厂，目前不再使用了，目前使用的是根据`LettucePoolingClientConfiguration`的配置初始化的连接池。

`LettuceConnectionFactory`的创建部分见`org.springframework.boot.autoconfigure.data.redis.LettuceConnectionConfiguration#redisConnectionFactory`方法：
```java
@Bean
@ConditionalOnMissingBean(RedisConnectionFactory.class)
public LettuceConnectionFactory redisConnectionFactory(ClientResources clientResources)
    throws UnknownHostException {
    LettuceClientConfiguration clientConfig = getLettuceClientConfiguration(
        clientResources, this.properties.getLettuce().getPool());
    return createLettuceConnectionFactory(clientConfig);
}
```

通过clientResources和配置信息来初始化`LettuceClientConfiguration`。

2. `LettuceConnectionConfiguration#getLettuceClientConfiguration`方法：
```java
private LettuceClientConfiguration getLettuceClientConfiguration(ClientResources clientResources, Pool pool) {
    LettuceClientConfigurationBuilder builder = createBuilder(pool);
    applyProperties(builder);
    if (StringUtils.hasText(this.properties.getUrl())) {
        customizeConfigurationFromUrl(builder);
    }
    builder.clientResources(clientResources);
    customize(builder);
    return builder.build();
}
```

这里通过`LettuceClientConfigurationBuilder`来构建`LettuceClientConfiguration`对象的，来看下它的实现：


那么这里会创建`LettuceClientConfigurationBuilder`对象还是`LettucePoolingClientConfigurationBuilder`对象呢？需要来看下createBuilder方法：
```java
private LettuceClientConfigurationBuilder createBuilder(Pool pool) {
    if (pool == null) {
        return LettuceClientConfiguration.builder();
    }
    return new PoolBuilderFactory().createBuilder(pool);
}
```

可以看出如果配置了`spring.redis.lettuce.pool`的相关信息，这里就会生成`LettucePoolingClientConfigurationBuilder`对象。我们来看下`LettucePoolingClientConfigurationBuilder`的`build`方法：
```java
@Override
public LettucePoolingClientConfiguration build() {
    return new DefaultLettucePoolingClientConfiguration(super.build(), poolConfig);
}

GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig()
```

这里最后生成的是`DefaultLettucePoolingClientConfiguration`对象，内部使用的连接池配置为`commons-pool`提供的`GenericObjectPoolConfig`。

3. 我们来看下`LettuceConnectionFactory`的初始化部分，`LettuceConnectionFactory#afterPropertiesSet`：
```java
public void afterPropertiesSet() {
    this.client = createClient();
    this.connectionProvider = createConnectionProvider(client, LettuceConnection.CODEC);
    //--------省略集群模式下的---------
}
```

这里省略掉集群模式下的初始化方式的分析，因为单机和集群版的流程大致相同，只是一些配置不太一样。

4. createConnectionProvider方法：
```java
private LettuceConnectionProvider createConnectionProvider(AbstractRedisClient client, RedisCodec<?, ?> codec) {
    LettuceConnectionProvider connectionProvider = doCreateConnectionProvider(client, codec);
    if (this.clientConfiguration instanceof LettucePoolingClientConfiguration) {
        return new LettucePoolingConnectionProvider(connectionProvider,
                (LettucePoolingClientConfiguration) this.clientConfiguration);
    }
    return connectionProvider;
}
```

由于上面生成的是`DefaultLettucePoolingClientConfiguration`，这里最后生成的就是`LettucePoolingConnectionProvider`对象。也就是一个池化的对象。

接下来我们来看一看从它里面获取连接的方法`org.springframework.data.redis.connection.lettuce.LettucePoolingConnectionProvider#getConnection`：
```java
private final Map<Class<?>, GenericObjectPool<StatefulConnection<?, ?>>> pools = new ConcurrentHashMap<>(32);

@Override
public <T extends StatefulConnection<?, ?>> T getConnection(Class<T> connectionType) {
    GenericObjectPool<StatefulConnection<?, ?>> pool = pools.computeIfAbsent(connectionType, poolType -> {
        return ConnectionPoolSupport.createGenericObjectPool(() -> connectionProvider.getConnection(connectionType),
                poolConfig, false);
    });
    try {
        StatefulConnection<?, ?> connection = pool.borrowObject();
        poolRef.put(connection, pool);
        return connectionType.cast(connection);
    } catch (Exception e) {
        throw new PoolException("Could not get a resource from the pool", e);
    }
}
```

pools是用来维护Connection类型与`GenericObjectPool`连接池之间关系的一个map，每次获取连接时会根据连接类型获取到对应的连接池，然后从连接池中获取连接。在LettucePoolingConnectionProvider内部包装着一个`StandaloneConnectionProvider`类型的provider，它才是最终提供connection对象的provider，代码部分为：
```java
ConnectionPoolSupport.createGenericObjectPool(() -> 
    connectionProvider.getConnection(connectionType), poolConfig, false)
```

`org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory#getConnection`

该方法的代码如下：
```java
private @Nullable LettucePool pool;

public RedisConnection getConnection() {
    if (isClusterAware()) {
        return getClusterConnection();
    }
    LettuceConnection connection;
    if (pool != null) {
        connection = new LettuceConnection(getSharedConnection(), getTimeout(), null, pool, getDatabase());
    } else {
        connection = new LettuceConnection(getSharedConnection(), connectionProvider, getTimeout(), getDatabase());
    }
    connection.setConvertPipelineAndTxResults(convertPipelineAndTxResults);
    return connection;
}
```

这里需要注意一点，这个pool是`LettucePool`对象，在上文中已经分析过，它是比较老的api中的使用的pool，在新的中使用`commons-pool`代替了。所以这里在新的配置环境中会走pool==null这个分支。`LettuceConnection`的第一个入参是`StatefulConnection<byte[], byte[]> asyncSharedConn`对象，也就是说`getSharedConnection`方法返回的结果是`asyncSharedConn`。这个会对`LettuceConnection`的`getAsyncConnection`方法产生影响，该方法代码如下：
```java
RedisClusterAsyncCommands<byte[], byte[]> getAsyncConnection() {
    if (isQueueing()) {
        return getAsyncDedicatedConnection();
    }
    if (asyncSharedConn != null) {
        if (asyncSharedConn instanceof StatefulRedisConnection) {
            // 如果asyncSharedConn不为空，则会通过它的async方法来创建RedisClusterAsyncCommands对象
            return ((StatefulRedisConnection<byte[], byte[]>) asyncSharedConn).async();
        }
    }
    // 如果asyncSharedConn为空，则走getAsyncDedicatedConnection方法来创建RedisClusterAsyncCommands
    return getAsyncDedicatedConnection();
}
```

- 如果`asyncSharedConn`不为空，这里会通过`asyncSharedConn`的`async()`方法来生成`RedisClusterAsyncCommands`对象。

- 如果`asyncSharedConn`为空，则会调用getAsyncDedicatedConnection方法来生成RedisClusterAsyncCommands对象:
```java
protected RedisClusterAsyncCommands<byte[], byte[]> getAsyncDedicatedConnection() {
    if (asyncDedicatedConn == null) {
        asyncDedicatedConn = doGetAsyncDedicatedConnection();
        if (asyncDedicatedConn instanceof StatefulRedisConnection) {
            ((StatefulRedisConnection<byte[], byte[]>) asyncDedicatedConn).sync().select(dbIndex);
        }
    }
    if (asyncDedicatedConn instanceof StatefulRedisConnection) {
        return ((StatefulRedisConnection<byte[], byte[]>) asyncDedicatedConn).async();
    }
    if (asyncDedicatedConn instanceof StatefulRedisClusterConnection) {
        return ((StatefulRedisClusterConnection<byte[], byte[]>) asyncDedicatedConn).async();
    }
    // ------------省略部分代码----------------
}

// org.springframework.data.redis.connection.lettuce.LettuceConnection#doGetAsyncDedicatedConnection：
protected StatefulConnection<byte[], byte[]> doGetAsyncDedicatedConnection() {
    return connectionProvider.getConnection(StatefulConnection.class);
}
```

可以看出最终`doGetAsyncDedicatedConnection`方法也是通过`connectionProvider`对象来获取`StatefulConnection`类型的连接对象的。

那么，调用哪个方法会返回`RedisClusterAsyncCommands`对象呢?

在`LettuceConnection`中只有一个public的方法返回`RedisClusterAsyncCommands`对象的：
```java
@Override
public RedisClusterAsyncCommands<byte[], byte[]> getNativeConnection() {
    LettuceSubscription subscription = this.subscription;
    return (subscription != null ? subscription.getNativeConnection().async() : getAsyncConnection());
}
```

可以看出，它调用的实际上也是`getAsyncConnection()`方法。

shareNativeConnection 参数

来看一下`org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory#getSharedConnection`方法：
```java
@Nullable
protected StatefulRedisConnection<byte[], byte[]> getSharedConnection() {
    return shareNativeConnection ? (StatefulRedisConnection) getOrCreateSharedConnection().getConnection() : null;
}
```

这里有一个很重要的参数——`shareNativeConnection`，如果`shareNativeConnection`为true，会使用`getOrCreateSharedConnection().getConnection()`来操作，它的第一步返回的是`SharedConnection`对象，然后通过`getConnection()`来获取native连接。我们来看下它们的方法：
```java
// org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory#getOrCreateSharedConnection:
private SharedConnection<byte[]> getOrCreateSharedConnection() {
    synchronized (this.connectionMonitor) {
        if (this.connection == null) {
            // 如果为空，则创建 SharedConnection
            this.connection = new SharedConnection<>(connectionProvider);
        }
        // 如果不为空，则使用相同连接
        return this.connection;
    }
}

// org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory.SharedConnection#getConnection:
@Nullable
StatefulConnection<E, E> getConnection() {
    synchronized (this.connectionMonitor) {
        if (this.connection == null) {
             // 如果connectin为空则调用getNativeConnection方法获取连接
            this.connection = getNativeConnection();
        }
        if (getValidateConnection()) {
            // 校验连接
            validateConnection();
        }
        // 如果内部连接已经存在，则返回相同的连接
        return this.connection;
    }
}

// org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory.SharedConnection#getNativeConnection:
/**
  * Obtain a connection from the associated {@link LettuceConnectionProvider}.
 *
* @return the connection.
*/
private StatefulConnection<E, E> getNativeConnection() {

    try {
        // 从provider中获取连接，这里也是从连接池中去获取连接的，返回的也是StatefulConnection类型的连接对象
        return connectionProvider.getConnection(StatefulConnection.class);
    } catch (RedisException e) {
        throw new RedisConnectionFailureException("Unable to connect to Redis", e);
    }
}
```

这里主要是获取`SharedConnection`的步骤，最终会从`connectionProvider`中获取shared连接，连接为`StatefulConnection`类型。可以看出通过`LettuceConnectionFactory#getSharedConnection`方法最终获取到的连接为`StatefulRedisConnection`对象。

`shareNativeConnection`为true和false的区别

上面我们知道，当`shareNativeConnection`为true时会通过`getOrCreateSharedConnection().getConnection()`来初始化`LettuceConnection`的`asyncSharedConn`属性。它生成的是`SharedConnection`对象，然后通过它的`getConnection`方法获取具体连接的。在它们里面都有一个共同点，会先判断当连接对象为空时会创建新的连接，如果已经初始化过了，则使用已有的连接，即共享连接。

## redisTemplate模式下的连接
咱们以`this.redisTemplate.opsForValue().get(cacheKey)`方法为切入点往下来看。

首先是`org.springframework.data.redis.core.DefaultValueOperations#get(java.lang.Object)`方法：
```java
@Override
public V get(Object key) {
    return execute(new ValueDeserializingRedisCallback(key) {
        @Override
        protected byte[] inRedis(byte[] rawKey, RedisConnection connection) {
            return connection.get(rawKey);
        }
    }, true);
}
```

接着往下走，继续往下看`org.springframework.data.redis.core.AbstractOperations#execute`方法：
```java
@Nullable
<T> T execute(RedisCallback<T> callback, boolean b) {
    return template.execute(callback, b);
}

// org.springframework.data.redis.core.RedisTemplate#execute(org.springframework.data.redis.core.RedisCallback<T>, boolean):
@Nullable
public <T> T execute(RedisCallback<T> action, boolean exposeConnection) {
    return execute(action, exposeConnection, false);
}

// org.springframework.data.redis.core.RedisTemplate#execute(org.springframework.data.redis.core.RedisCallback<T>, boolean, boolean):
@Nullable
public <T> T execute(RedisCallback<T> action, boolean exposeConnection, boolean pipeline) {
    Assert.isTrue(initialized, "template not initialized; call afterPropertiesSet() before using it");
    Assert.notNull(action, "Callback object must not be null");
    RedisConnectionFactory factory = getRequiredConnectionFactory();
    RedisConnection conn = null;
    try {
        if (enableTransactionSupport) {
            // 开启事务时获取连接的方法
            // only bind resources in case of potential transaction synchronization
            conn = RedisConnectionUtils.bindConnection(factory, enableTransactionSupport);
        } else {
            // 获取连接的方法
            conn = RedisConnectionUtils.getConnection(factory);
        }
        boolean existingConnection = TransactionSynchronizationManager.hasResource(factory);
        RedisConnection connToUse = preProcessConnection(conn, existingConnection);
        boolean pipelineStatus = connToUse.isPipelined();
        if (pipeline && !pipelineStatus) {
            connToUse.openPipeline();
        }
        RedisConnection connToExpose = (exposeConnection ? connToUse : createRedisConnectionProxy(connToUse));
        // 执行的部分
        T result = action.doInRedis(connToExpose);
        // close pipeline
        if (pipeline && !pipelineStatus) {
            connToUse.closePipeline();
        }
        // TODO: any other connection processing?
        return postProcessResult(result, connToUse, existingConnection);
    } finally {
        // 释放连接
        RedisConnectionUtils.releaseConnection(conn, factory);
    }
}
```
主要有三步操作:

1. 通过RedisConnectionUtils.getConnection(factory)来获取连接，底层是通过connectionFactory.getConnection()来获取连接的；
2. action.doInRedis：执行操作;
3. 使用`RedisConnectionUtils.releaseConnection`方法释放连接

## spring-data-redis使用lettuce中假的pipeline的方法
看完了上面的内容，就能知道其实解决办法很简单：获取原生的lettuce连接、获取`RedisClusterAsyncCommands`对象，然后用原生的操作pipeline的方法来处理，继而释放连接即可。
```java
RedisConnectionFactory connectionFactory = redisTemplate.getConnectionFactory();
LettuceConnection connection = null;
try {
    connection = (LettuceConnection) RedisConnectionUtils.getConnection(connectionFactory);
    //LettuceConnection connection = (LettuceConnection)redisTemplate.getConnectionFactory().getConnection();
    RedisClusterAsyncCommands<byte[], byte[]> commands = connection.getNativeConnection();
    commands.setAutoFlushCommands(false);
    List<RedisFuture<?>> futures = Lists.newArrayList();
    for (int i = 0; i < 50; i++) {
        futures.add(commands.set(("aaa-" + i).getBytes(), ("value-" + i).getBytes()));
        futures.add(commands.expire(("key-" + i).getBytes(), 3600));
    }

    // write all commands to the transport layer
    commands.flushCommands();

    // synchronization example: Wait until all futures complete
    boolean result = LettuceFutures.awaitAll(5, TimeUnit.SECONDS,
            futures.toArray(new RedisFuture[futures.size()]));
}finally {
    if (connection != null){
        RedisConnectionUtils.releaseConnection(connection,connectionFactory);
    }
}
```

上面的代码中主要包括四步：

- 获取LettuceConnection对象，不管是否共享连接，底层实际上也都是从连接池中获取连接的，只是连接之间是否可以共享而已
- 获取RedisClusterAsyncCommands，通过connection.getNativeConnection()方法获取
- 操作部分：先关掉autoflush，然后将所有的操作加到commands列表中，最后直接flush出去
- 释放连接

## 后记
这里只是略显仓促地对上一篇的文章进行一个补充，如果能给你带来一些帮助，不甚荣幸！
