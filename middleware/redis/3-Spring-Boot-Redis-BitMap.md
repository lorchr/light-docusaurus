- [SpringBoot+Redis BitMap 实现签到与统计功能](https://mp.weixin.qq.com/s/k69WcGuGYNIyknh92Ohq5w)
- [微服务 Spring Boot 整合 Redis BitMap 实现 签到与统计](https://blog.csdn.net/weixin_45526437/article/details/128606929)


在各个项目中，我们都可能需要用到签到和 统计功能。签到后会给用户一些礼品以此来吸引用户持续在该平台进行活跃。

签到功能，我们可以通过Redis中的 BitMap功能来实现

## Redis BitMap 基本用法

### ⛅BitMap 基本语法、指令

签到功能我们可以使用MySQL来完成，比如下表：

```sql
CREATE TABLEtb sign (
    `id` bigint(20) unsigned NOT NULL AUTO INCREMENTCOMMENT '主键',
    `user_id` bigint(20) unsigned NOT NULL COMMENT '用户id',
    'year' year(4) NOT NULL COMMENT '签到的年',
    'month' tinyint(2) NOT NULL COMMENT '签到的月',
    'date' date NOT NULL COMMENT '签到的日期',
    'is_backup' tinyint(1) unsigned DEFAULT NULL COMMENT '是否补签',
    PRIMARY KEY ('id') USING BTREE
) ENGINE-InnoDB DEFAULT CHARSET=utf8mb4 ROW FORMAT=COMPACT
```

用户一次签到，就是一条记录，假如有1000万用户，平均每人每年签到次数为10次，则这张表一年的数据量为 1亿条

每签到一次需要使用（8 + 8 + 1 + 1 + 3 + 1）共22 字节的内存，一个月则最多需要600多字节

**这样的坏处，占用内存太大了，极大的消耗内存空间！**

我们可以根据 Redis中 提供的 **BitMap 位图**功能来实现，每次签到与未签到用0 或1 来标识 ，一次存31个数字，只用了2字节 这样我们就用极小的空间实现了签到功能

#### BitMap 的操作指令：

- SETBIT：向指定位置（offset）存入一个0或1
- GETBIT ：获取指定位置（offset）的bit值
- BITCOUNT ：统计BitMap中值为1的bit位的数量
- BITFIELD ：操作（查询、修改、自增）BitMap中bit数组中的指定位置（offset）的值
- BITFIELD_RO ：获取BitMap中bit数组，并以十进制形式返回
- BITOP ：将多个BitMap的结果做位运算（与 、或、异或）
- BITPOS ：查找bit数组中指定范围内第一个0或1出现的位置

### ⚡使用 BitMap 完成功能实现

服务器Redis版本采用 6.2

进入redis查询 SETBIT 命令

```shell
help SETBIT
```
新增key 进行存储
```shell
SETBIT mb1 0 1
SETBIT mb1 1 1
SETBIT mb1 2 1
SETBIT mb1 4 1
SETBIT mb1 5 1
```

查询 GETBIT 命令
```shell
help GETBIT
```
查看指定坐标的签到状态
```shell
GETBIT mb1 2
```

查询 BITFIELD
```shell
help BITFIELD
```

无符号查询

```shell
BITFIELD bm1 get u2 0 
```

BITPOS 查询1 和 0 第一次出现的坐标
```shell
BITPOS bm1 0
BITPOS bm1 1
```

## SpringBoot 整合 Redis 实现签到 功能

### ☁️需求介绍

采用BitMap实现签到功能

- 实现签到接口，将当前用户当天签到信息保存到Redis中

思路分析：

我们可以把 年和月 作为BitMap的key，然后保存到一个BitMap中，每次签到就到对应的位上把数字从0 变为1，只要是1，就代表是这一天签到了，反之咋没有签到。

实现签到接口，将当前用户当天签到信息保存至Redis中
图片

提示：因为BitMap 底层是基于String数据结构，因此其操作都封装在字符串操作中了。

图片


### ⚡核心源码
UserController
```java
@PostMapping("sign")
public Result sign() {
    return userService.sign();
}
```

UserServiceImpl
```java
public Result sign() {
    //1. 获取登录用户
    Long userId = UserHolder.getUser().getId();
    //2. 获取日期
    LocalDateTime now = LocalDateTime.now();
    //3. 拼接key
    String keySuffix = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    String key = RedisConstants.USER_SIGN_KEY + userId + keySuffix;
    //4. 获取今天是本月的第几天
    int dayOfMonth = now.getDayOfMonth();
    //5. 写入redis setbit key offset 1
    stringRedisTemplate.opsForValue().setBit(key, dayOfMonth -1, true);
    return Result.ok();
}
```
接口进行测试

ApiFox进行测试

图片

查看Redis 数据
图片

## SpringBoot 整合Redis 实现 签到统计功能

### 问题一：什么叫做连续签到天数？

从最后一次签到开始向前统计，直到遇到第一次未签到为止，计算总的签到次数，就是连续签到天数。

逻辑分析：

获得当前这个月的最后一次签到数据，定义一个计数器，然后不停的向前统计，直到获得第一个非0的数字即可，每得到一个非0的数字计数器+1，直到遍历完所有的数据，就可以获得当前月的签到总天数了

### 问题二：如何得到本月到今天为止的所有签到数据？
```shell
BITFIELD key GET u[dayOfMonth] 0
```

假设今天是7号，那么我们就可以从当前月的第一天开始，获得到当前这一天的位数，是7号，那么就是7位，去拿这段时间的数据，就能拿到所有的数据了，那么这7天里边签到了多少次呢？统计有多少个1即可。

### **问题三：** 如何从后向前遍历每个Bit位？

**注意：**bitMap返回的数据是10进制，哪假如说返回一个数字8，那么我哪儿知道到底哪些是0，哪些是1呢？

我们只需要让得到的10进制数字和1做与运算就可以了，因为1只有遇见1 才是1，其他数字都是0 ，我们把签到结果和1进行与操作，每与一次，就把签到结果向右移动一位，依次内推，我们就能完成逐个遍历的效果了。

需求：

实现以下接口，统计当前截至当前时间在本月的连续天数

图片

有用户有时间我们就可以组织出对应的key，此时就能找到这个用户截止这天的所有签到记录，再根据这套算法，就能统计出来他连续签到的次数了

### 核心源码
UserController
```java 
@GetMapping("/signCount")
public Result signCount() {
    return userService.signCount();
}
```

UserServiceImpl
```java 
public Result signCount() {
    //1. 获取登录用户
    Long userId = UserHolder.getUser().getId();
    //2. 获取日期
    LocalDateTime now = LocalDateTime.now();
    //3. 拼接key
    String keySuffix = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    String key = RedisConstants.USER_SIGN_KEY + userId + keySuffix;
    //4. 获取今天是本月的第几天
    int dayOfMonth = now.getDayOfMonth();
    //5. 获取本月截至今天为止的所有的签到记录，返回的是一个十进制的数字 BITFIELD sign:5:202301 GET u3 0
    List<Long> result = stringRedisTemplate.opsForValue().bitField(
        key,
        BitFieldSubCommands.create()
        .get(BitFieldSubCommands.BitFieldType.unsigned(dayOfMonth)).valueAt(0));
    //没有任务签到结果
    if (result == null || result.isEmpty()) {
        return Result.ok(0);
    }
    Long num = result.get(0);
    if (num == null || num == 0) {
        return Result.ok(0);
    }
    //6. 循环遍历
    int count = 0;
    while (true) {
        //6.1 让这个数字与1 做与运算，得到数字的最后一个bit位 判断这个数字是否为0
        if ((num & 1) == 0) {
            //如果为0，签到结束
            break;
        } else {
            count ++;
        }
        num >>>= 1;
    }
    return Result.ok(count);
}
```
进行测试
图片

查看 Redis 变量
图片

从今天开始，往前查询 连续签到的天数，结果为2 测试无误！

## 关于使用bitmap来解决缓存穿透的方案

回顾缓存穿透：

发起了一个数据库不存在的，redis里边也不存在的数据，通常你可以把他看成一个攻击

解决方案：
- 判断id<0
- 数据库为空的话，向redis里边把这个空数据缓存起来

第一种解决方案：遇到的问题是如果用户访问的是id不存在的数据，则此时就无法生效

第二种解决方案：遇到的问题是：如果是不同的id那就可以防止下次过来直击数据

所以我们如何解决呢？

我们可以将数据库的数据，所对应的id写入到一个list集合中，当用户过来访问的时候，我们直接去判断list中是否包含当前的要查询的数据，如果说用户要查询的id数据并不在list集合中，则直接返回，如果list中包含对应查询的id数据，则说明不是一次缓存穿透数据，则直接放行。
图片

现在的问题是这个主键其实并没有那么短，而是很长的一个 主键
哪怕你单独去提取这个主键，但是在 11年左右，淘宝的商品总量就已经超过10亿个

所以如果采用以上方案，这个list也会很大，所以我们可以使用bitmap来减少list的存储空间

我们可以把list数据抽象成一个非常大的bitmap，我们不再使用list，而是将db中的id数据利用哈希思想，比如：

id 求余bitmap长度 ：id % bitmap.size = 算出当前这个id对应应该落在bitmap的哪个索引上，然后将这个值从0变成1，然后当用户来查询数据时，此时已经没有了list，让用户用他查询的id去用相同的哈希算法， 算出来当前这个id应当落在bitmap的哪一位，然后判断这一位是0，还是1，如果是0则表明这一位上的数据一定不存在，采用这种方式来处理，需要重点考虑一个事情，就是误差率，所谓的误差率就是指当发生哈希冲突的时候，产生的误差。
图片

## ⛵小结

签到功能是很常用的，在项目中，是一个不错的亮点，统计功能也是各大系统中比较重要的功能，签到完成后，去统计本月的连续 签到记录，来给予奖励，可大大增加用户对系统的活跃度 技术改变世界！！！
