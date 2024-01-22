- [MySQL定时任务，解放双手，轻松实现自动化](https://mp.weixin.qq.com/s/Dtq7N-uX444aAoDV1SKzcA)

Mysql 事件是一种在特定时间点自动执行的数据库操作，也可以称呼为定时任务，它可以自动执行更新数据、插入数据、删除数据等操作，无需人工干预。

### 优势：

- 自动化： 可以定期执行重复性的任务，无需手动干预。
- 灵活性： 可以根据需求定制事件，灵活控制任务的执行时间和频率。
- 提高效率： 可以在非高峰时段执行耗时任务，减少对数据库性能的影响。

常见的应用场景有定时备份数据库，清理和统计数据。

## 常见操作
### 事件调度器操作
查看事件调度器是否开启：ON 表示已开启。
```shell
show variables like '%event_scheduler%';
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| event_scheduler | ON    |
+-----------------+-------+
```

开启和关闭事件调度器：
```shell
# 开启事件调度器
set global event_scheduler = ON;
# 关闭事件调度器
set global event_scheduler = OFF;
```

更改配置文件：进入 my.ini 文件修改，重启 Mysql 服务器，永久生效。
```shell
# 事件调度器启动状态
event_scheduler = on
```

### 查看事件
使用 show 或者 select 语句查看当前数据库中所有的事件。
```shell
show events;
select * from information_schema.events;
```

### 创建事件
使用 create event 语句创建一个事件，

基本语法：
```shell
create
    [definer = user]
    event
    [if not exists]
    event_name
    on schedule schedule_body
    [on completion [not] preserve]
    [enable | disable | disable on slave]
    [comment 'comment']
    do event_body;
```

- `definer`：可选，用于定义事件执行时检查权限的用户。
- `if not exists`：可选，一般都加上，用于判断要创建的事件是否存在。
- `event_name`：定义指定的事件名，是用来唯一标识事件的名称。在同一个数据库中，事件名称必须是唯一的。
- `on schedule schedule_body`：schedule_body 用于定义执行的时间和时间间隔。
- `on completion [not] preserve`：可选，指定事件是否循环执行，默认为一次执行，即 not preserve。
- `enable | disable | disable on slave`：可选，指定事件的一种属性，enable 表示启动，disable 表示关闭或者下线，disable on slave 表示从属性上禁用，默认启动
- `comment ‘comment’`：可选，添加事件的注释。
- `do event_body`：必选，event_body 用于指定事件启动时所要执行的代码，可以是任何有效的sql 语句、存储过程或者一个计划执行的事件。如果包含多条语句，可以使用 begin … end 复合结构。

#### `schedule_body` 语法：
```shell
at timestamp [+ interval interval] ...
    | every interval
        [starts timestamp [+ interval interval] ...]
        [ends timestamp [+ interval interval] ...]
```

- `at timestamp`：用于一次性活动，指定事件仅在 timestamp 给出的日期和时间执行一次，时间戳必须同时包含日期和时间，或者必须是解析为日期时间值的表达式，如果日期已过，则会出现警告。

```shell
# 相当于“三周两天后”。此类子句的每个部分必须以+ interval。
at current_timestamp + interval 3 week + interval 2 day
```

#### interval 语法：
```shell
interval:
    quantity {year | quarter | month | day | hour | minute |
              week | second | year_month | day_hour | day_minute |
              day_second | hour_minute | hour_second | minute_second}
```

`every interval`：每隔一段时间执行事件，指定时间区间内每隔多长时间发生一次，interval 其值由一个数值和单位(quantity)组成，如 4 week 表示 4 周，’1:10’ HOUR_MINUTE 表示1小时10分钟。
- `starts timestamp`：指定事件的开始时间，timestamp 为时间戳，日期时间值表达式。
- `ends timestamp`：指定事件的结束时间，timestamp 为时间戳，日期时间值表达式。

#### 常见时间调度：
```shell
# 每30分钟执行一次
on schedule every 30 minute
# 从 2024-01-03 18:00:00 开始，每1小时执行一次
on schedule every 1 hour
  starts '2024-01-03 18:00:00'
# 从现在起30分钟后开始，四周后结束，这段期间内每12小时执行一次
on schedule every 12 hour 
    starts current_timestamp + interval 30 minute 
    ends current_timestamp + interval 4 week
```

### 删除事件
使用 drop event 语句删除该事件。
```shell
drop event [if exists] event_name;
```

### 启动与关闭事件
使用 alter event 语句对事件进行修改。
```shell
# 启动事件
alter event event_name enable;
# 关闭事件
alter event event_name disable;
```

## 精选示例
### 构造实时数据
需求：每分钟录入关于产品、省份的订单销售数据。
```shell
# 表新建
drop table if exists sql_test1.face_sales_data;
create table if not exists sql_test1.face_sales_data
(
    sales_date date comment '销售日期',
    order_code varchar(255) comment '订单编码',
    user_code varchar(255) comment '客户编号',
    product_name varchar(255) comment '产品名称',
    sales_province varchar(255) comment '销售省份',
    sales_number int comment '销量',
    create_time datetime default current_timestamp comment '创建时间',
    update_time datetime default current_timestamp on update current_timestamp comment '更新时间'
);
# 创建事件任务，多条语句用 begin ... end; 包住。
drop event if exists face_sales_data_task1;
create event if not exists face_sales_data_task1
on schedule every 1 minute
starts '2024-01-03 21:17:00'
on completion preserve enable
do
begin
    set @user_code = floor(rand()*900000000 + 100000000);-- 随机生成用户编码，
    set @order_code = md5(floor(rand()*900000000 + 100000000));-- 根据随机用户编码加密成编码
    set @product_name = ELT(CEILING(RAND() * 8) ,'iPhone 15','iPhone 15 Pro','iPhone 15 Pro Max','Xiaomi 14','Xiaomi 14 Pro','Huawei Mate 60','Huawei Mate 60 Pro','Huawei Mate 60 Pro+');-- 随机从中选择产品
    set @sales_province = ELT(CEILING(RAND() * 34) ,'河北省','山西省','辽宁省','吉林省','黑龙江省','江苏省','浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省','广东省','海南省','四川省','贵州省','云南省','陕西省','甘肃省','青海省','台湾省','内蒙古自治区','广西壮族自治区','西藏自治区','宁夏回族自治区','新疆维吾尔自治区','北京市','上海市','天津市','重庆市','香港特别行政区','澳门特别行政区');
    set @sales_number = floor(rand()*1000);-- 随机生成销量
    select @user_code,@order_code,@product_name,@sales_province,@sales_number;-- 查看生成的数据
    insert into sql_test1.face_sales_data(sales_date, order_code, user_code, product_name, sales_province, sales_number)
    values (curdate(),@order_code,@user_code,@product_name,@sales_province,@sales_number);-- 数据录入
end;
select * from sql_test1.face_sales_data;
```

通过创建事件后，过一段时间再一次查看表，可以发现每条记录 create_time 相差1，说明任务调度设置成功，这样就可以自动模拟实时销售数据啦。

如果要停止录入，可以执行以下代码关闭事件。
```shell
alter event face_sales_data_task1 disable;
```

### 定时统计数据
除了能模拟实时数据操作数据表外，也可以执行存储过程统计数据。

```shell
drop event if exists get_table_info1_task1;
create event if not exists get_table_info1_task1
    on schedule every 10 minute 
    starts current_timestamp 
    ends current_timestamp + interval 1 week
    on completion preserve enable
    do call get_table_info1();

# 下线
alter event get_table_info1_task1 disable;
```

## 总结
创建事件或定时任务可以解决很多重复性工作，配合着动态 sql 和存储过程能起到实时更新数据功能，不需要人工干预，提高了工作效率，让我们有更多的时间学习和处理其它问题。
