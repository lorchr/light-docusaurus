- [lettuce 在spring-data-redis包装后关于pipeline的坑，你知道吗？](https://cloud.tencent.com/developer/article/1661743)
- [spring-data-redis中lettuce pipeline的坑之解决篇](https://cloud.tencent.com/developer/article/1661745)

> 写在前面的话：项目上线前通宵压测，瓶颈点不在我这，闲来无事，整理出此文。

## 前言
在日常开发过程中，如果想要构建一个高并发高吞吐量的系统，redis基本是成了标配。回想下现在比较常用的客户端也就是jedis、redission、lettuce这几种，jedis算是比较老牌的redis client了，redission底层基于netty并以其各种丰富的数据结构和特性而广受欢迎，lettuce则属于后起之秀，底层集成了Project Reactor提供天然的反应式编程，通信框架集成了Netty使用了非阻塞IO，5.x版本之后融合了JDK1.8的异步编程特性，在保证高性能的同时提供了十分丰富易用的API。Jedis客户端实例不是线程安全的，所以需要通过连接池来使用Jedis，Redisson的API是线程安全的，所以可以操作单个Redisson连接来完成各种操作，Lettuce的API也是线程安全的，所以可以操作单个Lettuce连接来完成各种操作。在跑完不同客户端的benchmark后，我选择了使用lettuce来作为整个平台的redis client。

springboot的组件spring-data-redis中默认使用的是lettuce，也不得不承认在与commons-pool配合使用后lettuce能表现出很好的性能，但是今天就是要来聊一聊spring-data-redis对lettuce包装后的一个很大的槽点——pipeline。

## 何为pipeline
pipeline顾名思义就是流水线操作，像http 1.1也开始支持pipeline来把多个HTTP请求放到一个TCP连接中一 一发送，而在发送过程中不需要等待服务器对前一个请求的响应，在redis client中使用pipeline的主要目的也与此相同，打包请求的同时减少了很多网络IO。在lettuce中的底层实现是将请求中的多个command先放到socket buffer中，然后统一flush出去。

## lettuce原生的pipeline
原生的pipeline是使用它的asyncCommands来实现的，代码如下：
```java
   RedisClient client = RedisClient.create(ClientResources.create(),         RedisURI.create("redis://qtshe654321@116.62.12.66:6379/0"));
        StatefulRedisConnection<String, String> connection = client.connect();
        Stopwatch stopwatch = Stopwatch.createStarted();
        RedisAsyncCommands<String, String> commands = connection.async();
      // disable auto-flushing
        commands.setAutoFlushCommands(false);
        // perform a series of independent calls
        List<RedisFuture<?>> futures = Lists.newArrayList();
        for (int i = 1;i < 50; i++) {
            futures.add(commands.set("mmm"+i,"value-" + i));
            futures.add(commands.expire("mmm"+ i, 3600));
        }

        // write all commands to the transport layer
        // 真正地flush操作
        commands.flushCommands();
        // synchronization example: Wait until all futures complete
        boolean result = LettuceFutures.awaitAll(5, TimeUnit.SECONDS,
                futures.toArray(new RedisFuture[futures.size()]));
        stopwatch.stop();
        System.out.println("--------------耗时----" + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        // later
        connection.close();
        client.shutdown();
```
从api调用方式上可以看出，它的大致过程是先将收集起来，然后批量flush到server端，然后异步等待响应结果。上面请求的耗时比较恒定在5ms左右，在测试环境上能有这样的表现已经很好了。那么想一想，为什么它有这么高的性能呢？在源码中的表现是什么样子的呢？我们带着悬念先来看一看spring-data-redis包装后的lettuce的表现。

## spring-data-redis包装后的lettuce的pipeline
用过spring-data-redis的同学都知道，它对外提供了一套redisTemplate的抽象，然后通过redisTemplate适配了不同类型的redis client，lettuce就是其中之一。我们直接来看下使用spring-data-redis包装后的lettuce来处理pipeline的代码和表现：
```java
StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        List list = redisTemplate.executePipelined(new RedisCallback<Object>() {

            @Override
            public Object doInRedis(RedisConnection redisConnection) throws DataAccessException {
                    for (int i = 1; i < 50; i++) {
                        redisConnection.set(stringRedisSerializer.serialize("aaa-" + i),                                       redisSerializer.serialize("666666"));
                }
                return null;
            }
        }, redisSerializer);
```
先看耗时，在15-25ms之间，不是很稳定。在redisConnection.set这一行打上断点，放行i=1的情况，到i=2时断点截住，此时去redis中查询，发现aaa-1对应的key已经写入! what? 不是说好的批量操作么？


带着种种疑问，我们进行到lettuce原生的pipeline操作和被包装后的pipeline操作的源码分析部分。

## 源码分析
这里只简要地结合客户端api分析一下我感觉比较重要的点，不可能涉及全部的源码解析，感兴趣的可以自己去分析下其他部分的源码。

### 原生lettuce pipeline源码分析
我们从`commands.set("mmm" + i, "value-" + i)`为切入点来看，它的下面调用为：
```java
io.lettuce.core.AbstractRedisAsyncCommands#set(K, V)：

 @Override
public RedisFuture<String> set(K key, V value) {
    return dispatch(commandBuilder.set(key, value));
}
```

然后会调用到`io.lettuce.core.AbstractRedisAsyncCommands#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>)`方法：
```java
 public <T> AsyncCommand<K, V, T> dispatch(RedisCommand<K, V, T> cmd) {
        AsyncCommand<K, V, T> asyncCommand = new AsyncCommand<>(cmd);
        RedisCommand<K, V, T> dispatched = connection.dispatch(asyncCommand);
        if (dispatched instanceof AsyncCommand) {
            return (AsyncCommand<K, V, T>) dispatched;
        }
        return asyncCommand;
    }
```

我们继续来分析`connection.dispatch`方法`io.lettuce.core.StatefulRedisConnectionImpl#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>)`：
```java
@Override
public <T> RedisCommand<K, V, T> dispatch(RedisCommand<K, V, T> command) {
    RedisCommand<K, V, T> toSend = preProcessCommand(command);
    try {
        return super.dispatch(toSend);
    } finally {
        if (command.getType().name().equals(MULTI.name())) {
            multi = (multi == null ? new MultiOutput<>(codec) : multi);
        }
    }
}
```

会进入到它父类的`io.lettuce.core.RedisChannelHandler#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>)`方法：
```java
 protected <T> RedisCommand<K, V, T> dispatch(RedisCommand<K, V, T> cmd) {
        ------
        if (tracingEnabled) {
            RedisCommand<K, V, T> commandToSend = cmd;
            TraceContextProvider provider = CommandWrapper.unwrap(cmd, TraceContextProvider.class);
            if (provider == null) {
                commandToSend = new TracedCommand<>(cmd, clientResources.tracing()
                        .initialTraceContextProvider().getTraceContext());
            }
            return channelWriter.write(commandToSend);
        }
        return channelWriter.write(cmd);
    }
```

直接来看`channelWriter.write`方法，即`io.lettuce.core.protocol.DefaultEndpoint#write(io.lettuce.core.protocol.RedisCommand<K,V,T>)`：
```java
@Override
public <K, V, T> RedisCommand<K, V, T> write(RedisCommand<K, V, T> command) {
    LettuceAssert.notNull(command, "Command must not be null");
    try {
        sharedLock.incrementWriters();
        validateWrite(1);
        if (autoFlushCommands) {//如果没有关闭autoFlushCommands
            if (isConnected()) {
                writeToChannelAndFlush(command);
            } else {
                writeToDisconnectedBuffer(command);
            }
        } else {
            // 如果关闭了auto flush则写入到socket buffer中
            writeToBuffer(command);
        }
    } finally {
        sharedLock.decrementWriters();
        if (debugEnabled) {
            logger.debug("{} write() done", logPrefix());
        }
    }
    return command;
}
```

从上面代码中可以看到如果没有关闭autoFlushCommands选项，则会直接调用`writeToChannelAndFlush`方法，熟悉netty的同学应该知道，它的底层调用是netty的`context.writeAndFlush`方法，也就是每次调用set操作时就进行了flush操作。但是如果关闭了auto flush选项，它会调用 `writeToBuffer(command)`方法，将command先flush到socket buffer中，在后面调用 `commands.flushCommands()`方法时才真正地执行flush操作。

我们来看一眼`io.lettuce.core.protocol.DefaultEndpoint#writeToBuffer(C)`方法：
```java
protected <C extends RedisCommand<?, ?, T>, T> void writeToBuffer(C command) {
    // ----------省略部分代码----------
    commandBuffer.add(command);
}
```
可以看出与上面分析的并无出入。

### spring-data-redis包装后的lettuce pipeline
我们以`redisConnection.set`方法为切入点来看，`org.springframework.data.redis.connection.DefaultStringRedisConnection#set(byte[], byte[])`：
```java
@Override
public Boolean set(byte[] key, byte[] value) {
    return convertAndReturn(delegate.set(key, value), identityConverter);
}
```

这个delegate是`DefaultedRedisConnection`类型的对象，它的set方法`org.springframework.data.redis.connection.DefaultedRedisConnection#set(byte[], byte[])`:
```java
default Boolean set(byte[] key, byte[] value) {
    return stringCommands().set(key, value);
}
```

这里会调用`org.springframework.data.redis.connection.lettuce.LettuceStringCommands#set(byte[], byte[])`方法：
```java
@Override
public Boolean set(byte[] key, byte[] value) {
    // --------------省略------------
    try {
        if (isPipelined()) {
            pipeline(
                    connection.newLettuceResult(getAsyncConnection().set(key, value), Converters.stringToBooleanConverter()));
            return null;
        }
    // ----------------省略--------------------
}
```

接下来会进入到`io.lettuce.core.AbstractRedisAsyncCommands#set(K, V)`方法：
```java
@Override
public RedisFuture<String> set(K key, V value) {
    return dispatch(commandBuilder.set(key, value));
}
```

继而进入到`io.lettuce.core.AbstractRedisAsyncCommands#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>)`方法：
```java
public <T> AsyncCommand<K, V, T> dispatch(RedisCommand<K, V, T> cmd) {
    AsyncCommand<K, V, T> asyncCommand = new AsyncCommand<>(cmd);
    RedisCommand<K, V, T> dispatched = connection.dispatch(asyncCommand);
    if (dispatched instanceof AsyncCommand) {
        return (AsyncCommand<K, V, T>) dispatched;
    }
    return asyncCommand;
}
```

到了这里是不是很熟悉了，是的，已经进入到了lettuce的部分了，它接下来会进入到：
```java
// io.lettuce.core.StatefulRedisConnectionImpl#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>):
@Override
public <T> RedisCommand<K, V, T> dispatch(RedisCommand<K, V, T> command) {
    RedisCommand<K, V, T> toSend = preProcessCommand(command);
    try {
        return super.dispatch(toSend);
    } finally {
        if (command.getType().name().equals(MULTI.name())) {
            multi = (multi == null ? new MultiOutput<>(codec) : multi);
        }
    }
}

// io.lettuce.core.RedisChannelHandler#dispatch(io.lettuce.core.protocol.RedisCommand<K,V,T>):
protected <T> RedisCommand<K, V, T> dispatch(RedisCommand<K, V, T> cmd) {
    if (tracingEnabled) {
        // ---------------------------
        return channelWriter.write(commandToSend);
    }
    return channelWriter.write(cmd);
}

// io.lettuce.core.protocol.DefaultEndpoint#write(io.lettuce.core.protocol.RedisCommand<K,V,T>):
@Override
public <K, V, T> RedisCommand<K, V, T> write(RedisCommand<K, V, T> command) {
    // --------------------
    try {
        sharedLock.incrementWriters();
        validateWrite(1);
        if (autoFlushCommands) {
            if (isConnected()) {
                writeToChannelAndFlush(command);
            } else {
                writeToDisconnectedBuffer(command);
            }
        } else {
            writeToBuffer(command);
        }
    } finally {
        sharedLock.decrementWriters();
        if (debugEnabled) {
            logger.debug("{} write() done", logPrefix());
        }
    }
    return command;
}
```
但是在使用redisTemplate的时候，从来都没有设置过autoFlushCommands，没错，这里它为true，也就是说每来set一次就会flush一次，这也就解释了为什么在第一个set操作之后断点在redis中可以查到第一条已经set成功的原因。

也就是说，直接使用redisTemplate来操作pipeline时它还是一条条地去操作的，是一个伪批操作。

## 其他
关于shareNativeConnection参数，我们直接看下`org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory#setShareNativeConnection`方法：
```java
/**
 * Enables multiple {@link LettuceConnection}s to share a single native connection. If set to {@literal false}, every
 * operation on {@link LettuceConnection} will open and close a socket.
 *
 * @param shareNativeConnection enable connection sharing.
 */
public void setShareNativeConnection(boolean shareNativeConnection) {
    this.shareNativeConnection = shareNativeConnection;
}
```

这里就不再翻译了，直接读注释可能更容易理解，大家细品。

## 思考
既然直接使用redisTemplate的pipeline api会是一个伪pipeline操作，那么问题来了，有没有什么办法可以既使用redisTemplate api，又达到原生的lettuce的pipeline的效果呢？请静待下篇文章的分解。
