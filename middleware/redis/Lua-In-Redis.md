- [Redis中使用Lua脚本](https://www.cnblogs.com/shoshana-kong/p/15014249.html)

## 一、简介

### Redis中为什么引入Lua脚本？
- Redis是高性能的`key-value`内存数据库，在部分场景下，是对关系数据库的良好补充。
- Redis提供了非常丰富的指令集，官网上提供了200多个命令。但是某些特定领域，需要扩充若干指令原子性执行时，仅使用原生命令便无法完成。
- Redis 为这样的用户场景提供了 lua 脚本支持，用户可以向服务器发送 lua 脚本来执行自定义动作，获取脚本的响应数据。Redis 服务器会单线程原子性执行 lua 脚本，保证 lua 脚本在处理的过程中不会被任意其它请求打断。

### Redis意识到上述问题后，在2.6版本推出了 lua 脚本功能，允许开发者使用Lua语言编写脚本传到Redis中执行。使用脚本的好处如下:
- 减少网络开销。可以将多个请求通过脚本的形式一次发送，减少网络时延。
- 原子操作。Redis会将整个脚本作为一个整体执行，中间不会被其他请求插入。因此在脚本运行过程中无需担心会出现竞态条件，无需使用事务。
- 复用。客户端发送的脚本会永久存在redis中，这样其他客户端可以复用这一脚本，而不需要使用代码完成相同的逻辑。

### 什么是Lua？
Lua是一种轻量小巧的脚本语言，用标准C语言编写并以源代码形式开放。

其设计目的就是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。因为广泛的应用于：游戏开发、独立应用脚本、Web 应用脚本、扩展和数据库插件等。

比如：Lua脚本用在很多游戏上，主要是Lua脚本可以嵌入到其他程序中运行，游戏升级的时候，可以直接升级脚本，而不用重新安装游戏。
Lua脚本的基本语法可参考：[菜鸟教程](https://www.runoob.com/lua/lua-tutorial.html/)

## 二、Redis中Lua的常用命令
命令不多，就下面这几个：
- EVAL
- EVALSHA
- SCRIPT LOAD - SCRIPT EXISTS
- SCRIPT FLUSH
- SCRIPT KILL

### 2.1 EVAL命令
命令格式：`EVAL script numkeys key [key …] arg [arg …]`
- `script` 参数是一段 Lua5.1 脚本程序。脚本不必(也不应该[^1])定义为一个 Lua 函数
- `numkeys` 指定后续参数有几个key，即：key [key …]中key的个数。如没有key，则为0
- `key [key …]` 从 EVAL 的第三个参数开始算起，表示在脚本中所用到的那些 Redis 键(key)。在Lua脚本中通过KEYS[1], KEYS[2]获取。
- `arg [arg …]` 附加参数。在Lua脚本中通过ARGV[1],ARGV[2]获取。

```shell
# 例1：numkeys=1，keys数组只有1个元素key1，arg数组无元素
127.0.0.1:6379> EVAL "return KEYS[1]" 1 key1
"key1"

# 例2：numkeys=0，keys数组无元素，arg数组元素中有1个元素value1
127.0.0.1:6379> EVAL "return ARGV[1]" 0 value1
"value1"

# 例3：numkeys=2，keys数组有两个元素key1和key2，arg数组元素中有两个元素first和second 
#      其实{KEYS[1],KEYS[2],ARGV[1],ARGV[2]}表示的是Lua语法中“使用默认索引”的table表，
#      相当于java中的map中存放四条数据。Key分别为：1、2、3、4，而对应的value才是：KEYS[1]、KEYS[2]、ARGV[1]、ARGV[2]
#      举此例子仅为说明eval命令中参数的如何使用。项目中编写Lua脚本最好遵从key、arg的规范。
127.0.0.1:6379> eval "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 key1 key2 first second 
1) "key1"
2) "key2"
3) "first"
4) "second"


# 例4：使用了redis为lua内置的redis.call函数
#      脚本内容为：先执行SET命令，在执行EXPIRE命令
#      numkeys=1，keys数组有一个元素userAge（代表redis的key）
#      arg数组元素中有两个元素：10（代表userAge对应的value）和60（代表redis的存活时间）
127.0.0.1:6379> EVAL "redis.call('SET', KEYS[1], ARGV[1]);redis.call('EXPIRE', KEYS[1], ARGV[2]); return 1;" 1 userAge 10 60
(integer) 1
127.0.0.1:6379> get userAge
"10"
127.0.0.1:6379> ttl userAge
(integer) 44
```

通过上面的例4，我们可以发现，脚本中使用`redis.call()`去调用redis的命令。
在 Lua 脚本中，可以使用两个不同函数来执行 Redis 命令，它们分别是： `redis.call()` 和 `redis.pcall()`

这两个函数的唯一区别在于它们使用不同的方式处理执行命令所产生的错误，差别如下：

错误处理
当 `redis.call()` 在执行命令的过程中发生错误时，脚本会停止执行，并返回一个脚本错误，错误的输出信息会说明错误造成的原因：
```shell
127.0.0.1:6379> lpush foo a
(integer) 1

127.0.0.1:6379> eval "return redis.call('get', 'foo')" 0
(error) ERR Error running script (call to f_282297a0228f48cd3fc6a55de6316f31422f5d17): ERR Operation against a key holding the wrong kind of value
```

和 `redis.call()` 不同， `redis.pcall()` 出错时并不引发(raise)错误，而是返回一个带 err 域的 Lua 表(table)，用于表示错误：
```shell
127.0.0.1:6379> EVAL "return redis.pcall('get', 'foo')" 0
(error) ERR Operation against a key holding the wrong kind of value
```

### 2.2 SCRIPT LOAD命令 和 EVALSHA命令
- `SCRIPT LOAD` 命令格式：`SCRIPT LOAD script`
- `EVALSHA` 命令格式：`EVALSHA sha1 numkeys key [key …] arg [arg …]`

这两个命令放在一起讲的原因是：`EVALSHA` 命令中的sha1参数，就是`SCRIPT LOAD` 命令执行的结果。

`SCRIPT LOAD` 将脚本 `script` 添加到Redis服务器的脚本缓存中，并不立即执行这个脚本，而是会立即对输入的脚本进行求值。并返回给定脚本的 SHA1 校验和。如果给定的脚本已经在缓存里面了，那么不执行任何操作。

在脚本被加入到缓存之后，在任何客户端通过EVALSHA命令，可以使用脚本的 SHA1 校验和来调用这个脚本。脚本可以在缓存中保留无限长的时间，直到执行`SCRIPT FLUSH`为止。
```shell
## SCRIPT LOAD加载脚本，并得到sha1值
127.0.0.1:6379> SCRIPT LOAD "redis.call('SET', KEYS[1], ARGV[1]);redis.call('EXPIRE', KEYS[1], ARGV[2]); return 1;"
"6aeea4b3e96171ef835a78178fceadf1a5dbe345"

## EVALSHA使用sha1值，并拼装和EVAL类似的numkeys和key数组、arg数组，调用脚本。
127.0.0.1:6379> EVALSHA 6aeea4b3e96171ef835a78178fceadf1a5dbe345 1 userAge 10 60
(integer) 1
127.0.0.1:6379> get userAge
"10"
127.0.0.1:6379> ttl userAge
(integer) 43
```

### 2.3 SCRIPT EXISTS 命令
- 命令格式：`SCRIPT EXISTS sha1 [sha1 …]`
- 作用：给定一个或多个脚本的 SHA1 校验和，返回一个包含 0 和 1 的列表，表示校验和所指定的脚本是否已经被保存在缓存当中
```shell
127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345
1) (integer) 1
127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe346
1) (integer) 0
127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345 6aeea4b3e96171ef835a78178fceadf1a5dbe366
1) (integer) 1
2) (integer) 0
```

### 2.4 SCRIPT FLUSH 命令
- 命令格式：`SCRIPT FLUSH`
- 作用：清除Redis服务端所有 Lua 脚本缓存
```shell
127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345
1) (integer) 1
127.0.0.1:6379> SCRIPT FLUSH
OK
127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345
1) (integer) 0
```

### 2.5 SCRIPT KILL 命令
- 命令格式：`SCRIPT KILL`
- 作用：杀死当前正在运行的 Lua 脚本，当且仅当这个脚本没有执行过任何写操作时，这个命令才生效。 这个命令主要用于终止运行时间过长的脚本，比如一个因为 BUG 而发生无限 loop 的脚本，诸如此类。

假如当前正在运行的脚本已经执行过写操作，那么即使执行`SCRIPT KILL`，也无法将它杀死，因为这是违反 Lua 脚本的原子性执行原则的。在这种情况下，唯一可行的办法是使用`SHUTDOWN NOSAVE`命令，通过停止整个 Redis 进程来停止脚本的运行，并防止不完整(half-written)的信息被写入数据库中。

## 三、Redis执行Lua脚本文件
在第二章中介绍的命令，是在redis客户端中使用命令进行操作。该章节介绍的是直接执行 Lua 的脚本文件。

### 3.1 编写Lua脚本文件
```lua
local key = KEYS[1]
local val = redis.call("GET", key);

if val == ARGV[1]
then
    redis.call('SET', KEYS[1], ARGV[2])
    return 1
else
    return 0
end
```

### 3.2 执行Lua脚本文件
执行命令： `redis-cli -a 密码 --eval Lua脚本路径 key [key …] ,  arg [arg …]`
如：`redis-cli -a 123456 --eval ./Redis_CompareAndSet.lua userName , zhangsan lisi`

**注意**
- `--eval`而不是命令模式中的 `eval` ，一定要有前端的两个-
- 脚本路径后紧跟`key [key …]`，相比命令行模式，少了`numkeys`这个key数量值
- `key [key …]` 和 `arg [arg …]` 之间的 `,` ，英文逗号前后必须有空格，否则死活都报错

```shell
## Redis客户端执行
127.0.0.1:6379> set userName zhangsan 
OK
127.0.0.1:6379> get userName
"zhangsan"

## linux服务器执行
## 第一次执行：compareAndSet成功，返回1
## 第二次执行：compareAndSet失败，返回0
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_CompareAndSet.lua userName , zhangsan lisi
(integer) 1
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_CompareAndSet.lua userName , zhangsan lisi
(integer) 0
```

## 四、实例：使用Lua控制IP访问频率
- 需求：实现一个访问频率控制，某个IP在短时间内频繁访问页面，需要记录并检测出来，就可以通过Lua脚本高效的实现。
- 说明：本实例针对固定窗口的访问频率，而动态的非滑动窗口。即：如果规定一分钟内访问10次，记为超限。在本实例中前一分钟的最后一秒访问9次，下一分钟的第1秒又访问9次，不计为超限。

脚本如下：
```shell
local visitNum = redis.call('incr', KEYS[1])

if visitNum == 1 then
    redis.call('expire', KEYS[1], ARGV[1])
end

if visitNum > tonumber(ARGV[2]) then
    return 0
end

return 1;
```
演示如下：

```shell
## LimitIP:127.0.0.1为key， 10 3表示：同一IP在10秒内最多访问三次
## 前三次返回1，代表未被限制；第四、五次返回0，代表127.0.0.1这个ip已被拦截
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3
 (integer) 1
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3
 (integer) 1
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3
 (integer) 1
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3
 (integer) 0
[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3
 (integer) 0
```

## 五、总结
- 通过上面一系列的介绍，对Lua脚本、Lua基础语法有了一定了解，同时也学会在Redis中如何去使用Lua脚本去实现Redis命令无法实现的场景
- 回头再思考文章开头提到的Redis使用Lua脚本的几个优点：减少网络开销、原子性、复用

本文已简单介绍了Redis中如何使用Lua脚本，以及几个小实例应用。 在下一篇中会介绍真实项目中的“答题红包雨抢夺”的实例 和 项目中是如何使用Lua解决问题。敬请期待！！！

## 参考资料
- [菜鸟教程 -> Lua教程](https://www.runoob.com/lua/lua-data-types.html)
- [Redis官方命令参考](http://redisdoc.com/script/eval.html)
- 《Redis设计与实现》-黄健宏著
- [Redis 深度历险：核心原理与应用实践](https://juejin.cn/book/6844733724618129422/section/6844733724723003406#heading-0)

[^1]: 根据《Redis设计与实现》中第20章的内容，Redis服务端会将脚本中的具体内容封装到以 “f_40位sha值”命名的函数中，相当于 “f_40位sha值”是函数名，脚本内容是函数体