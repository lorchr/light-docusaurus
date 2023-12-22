
## 常用功能脚本

### 1、导出整个数据库  
```shell
mysqldump -u 用户名 -p –default-character-set=latin1 数据库名 > 导出的文件名(数据库默认编码是latin1)  

mysqldump -u wcnc -p smgp_apps_wcnc > wcnc.sql  
```

### 2、 导出一个表  
```shell
mysqldump -u 用户名 -p 数据库名 表名> 导出的文件名  

mysqldump -u wcnc -p smgp_apps_wcnc users> wcnc_users.sql    
```

### 3、 导出一个数据库结构  
```shell
mysqldump -u wcnc -p -d –add-drop-table smgp_apps_wcnc >d:wcnc_db.sql  
```

- `-d` 没有数据 
- `–add-drop-table` 在每个`create`语句之前增加一个`drop table` 


### 4、导入数据库  
```shell
A: 常用source 命令  

进入mysql数据库控制台，  

如mysql -u root -p  

mysql>use 数据库  

然后使用source命令，后面参数为脚本文件(如这里用到的.sql)  

mysql>source wcnc_db.sql  

B: 使用mysqldump命令  

mysqldump -u username -p dbname < filename.sql  

C: 使用mysql命令  

mysql -u username -p -D dbname < filename.sql 
```

##  启动与退出  

### 1、进入MySQL：启动MySQL Command Line Client（MySQL的DOS界面），直接输入安装时的密码即可。此时的提示符是：mysql>  

### 2、退出MySQL：quit或exit  


## 库操作  

### 1、创建数据库  

命令：`create database <数据库名>`

例如：建立一个名为sqlroad的数据库  

```shell
mysql> create database sqlroad;  
```

### 2、显示所有的数据库  

命令：`show databases （注意：最后有个s）`  
```shell
mysql> show databases;  
```

### 3、删除数据库  

命令：`drop database <数据库名> ` 

例如：删除名为 sqlroad的数据库  
```shell
mysql> drop database sqlroad;  
```

### 4、连接数据库  

命令：`use <数据库名> ` 

例如：如果sqlroad数据库存在，尝试存取它： 
```shell
mysql> use sqlroad;  
```

屏幕提示：Database changed  


### 5、查看当前使用的数据库  
```shell
mysql> select database();  
```


### 6、当前数据库包含的表信息： 
```shell
mysql> show tables; （注意：最后有个s）  
```

##  表操作，操作之前应连接某个数据库  

### 1、建表  

命令：`create table <表名> ( <字段名> <类型> [,..<字段名n> <类型n>]);`  
```shell
mysql> create table MyClass(  

> id int(4) not null primary key auto_increment,  

> name char(20) not null,  

> sex int(4) not null default ’′,  

> degree double(16,2));   
```

### 2、获取表结构  

命令：`desc 表名，或者show columns from 表名  `
```shell
mysql>DESCRIBE MyClass  

mysql> desc MyClass;  

mysql> show columns from MyClass;   
```

### 3、删除表  

命令：`drop table <表名>  `

例如：删除表名为 MyClass 的表  
```shell
mysql> drop table MyClass;   
```

### 4、插入数据  

命令：`insert into <表名> [( <字段名>[,..<字段名n> ])] values ( 值 )[, ( 值n )] ` 

例如，往表 MyClass中插入二条记录, 这二条记录表示：编号为的名为Tom的成绩为.45, 编号为 的名为Joan 的成绩为.99，编号为 的名为Wang 的成绩为.5.  
```shell
mysql> insert into MyClass values(1,’Tom’,96.45),(2,’Joan’,82.99), (2,’Wang’, 96.59);   
```

### 5、查询表中的数据  

#### 1)、查询所有行  

命令：`select <字段，字段，...> from < 表名 > where < 表达式 >  `

例如：查看表 MyClass 中所有数据  
```shell
mysql> select * from MyClass;  
```

#### 2）、查询前几行数据  

例如：查看表 MyClass 中前行数据  
```shell
mysql> select * from MyClass order by id limit 0,2;  
```

或者：  
```shell
mysql> select * from MyClass limit 0,2;    
```

### 6、删除表中数据  

命令：`delete from 表名 where 表达式  `

例如：删除表 MyClass中编号为 的记录  
```shell
mysql> delete from MyClass where id=1;    
```

### 7、修改表中数据：update 表名 set 字段=新值,…where 条件  
```shell
mysql> update MyClass set name=’Mary’where id=1;     
```

### 8、在表中增加字段：  

命令：`alter table 表名 add字段 类型 其他;  `

例如：在表MyClass中添加了一个字段passtest，类型为int(4)，默认值为  
```shell
mysql> alter table MyClass add passtest int(4) default ’′  
```


### 9、更改表名：  

命令：`rename table 原表名 to 新表名;`  

例如：在表MyClass名字更改为YouClass  
```shell
mysql> rename table MyClass to YouClass;  


更新字段内容  

update 表名 set 字段名 = 新内容  

update 表名 set 字段名 = replace(字段名,’旧内容’, 新内容’)  

update article set content=concat(‘  ’,content);   
```

## 字段类型和数据库操作

### 1、 INT[(M)] 型：正常大小整数类型  

### 2、 DOUBLE[(M,D)] [ZEROFILL] 型：正常大小(双精密)浮点数字类型  

### 3、 DATE 日期类型：支持的范围是-01-01到-12-31。MySQL以YYYY-MM-DD格式来显示DATE值，但是允许你使用字符串或数字把值赋给DATE列  

### 4、 CHAR(M) 型：定长字符串类型，当存储时，总是是用空格填满右边到指定的长度  

### 5、 BLOB TEXT类型，最大长度为(2^16-1)个字符。 

### 6、 VARCHAR型：变长字符串类型  

### 7、 导入数据库表  
```shell
创建.sql文件  

先产生一个库如auction.c:mysqlbin>mysqladmin -u root -p creat auction，会提示输入密码，然后成功创建。  

导入auction.sql文件  

c:mysqlbin>mysql -u root -p auction < auction.sql。  

通过以上操作，就可以创建了一个数据库auction以及其中的一个表auction。   
```

### 8、 修改数据库  

在mysql的表中增加字段：  
```shell
alter table dbname add column userid int(11) not null primary key auto_increment;  
```

这样，就在表dbname中添加了一个字段userid，类型为int(11)。    
  

### 9、 mysql数据库的授权  
```shell
mysql>grant select,insert,delete,create,drop  

on *.* (或test.*/user.*/..)  

to 用户名@localhost  

identified by ‘密码’；  


如：新建一个用户帐号以便可以访问数据库，需要进行如下操作：  

mysql> grant usage  

  -> ON test.*  

  -> TO testuser@localhost;  

  Query OK, 0 rows affected (0.15 sec)  

  
  此后就创建了一个新用户叫：testuser，这个用户只能从localhost连接到数据库并可以连接到test 数据库。下一步，我们必须指定testuser这个用户可以执行哪些操作：  

  mysql> GRANT select, insert, delete,update  

  -> ON test.*  

  -> TO testuser@localhost;  

  Query OK, 0 rows affected (0.00 sec)  

  
  此操作使testuser能够在每一个test数据库中的表执行SELECT，INSERT和DELETE以及UPDATE查询操作。现在我们结束操作并退出MySQL客户程序：  

  mysql> exit    
```


## DDL操作


### 1、 使用SHOW语句找出在服务器上当前存在什么数据库： 
```shell
mysql> SHOW DATABASES;  
```

### 2、 创建一个数据库MYSQLDATA  
```shell
mysql> Create DATABASE MYSQLDATA;  
```

### 3、 选择你所创建的数据库  
```shell
mysql> USE MYSQLDATA; (按回车键出现Database changed 时说明操作成功！)  
```

### 4、 查看现在的数据库中存在什么表  
```shell
mysql> SHOW TABLES;  
```

### 5、 创建一个数据库表  
```shell
mysql> Create TABLE MYTABLE (name VARCHAR(20), sex CHAR(1));  
```

### 6、 显示表的结构： 
```shell
mysql> DESCRIBE MYTABLE;  
```

### 7、 往表中加入记录  
```shell
mysql> insert into MYTABLE values (“hyq”,”M”);  
```

### 8、 用文本方式将数据装入数据库表中（例如D:/mysql.txt）  
```shell
mysql> LOAD DATA LOCAL INFILE “D:/mysql.txt”INTO TABLE MYTABLE;  
```

### 9、 导入.sql文件命令（例如D:/mysql.sql）  
```shell
mysql>use database;  

mysql>source d:/mysql.sql;  
```

### 10、 删除表  
```shell
mysql>drop TABLE MYTABLE;  
```

### 11、 清空表  
```shell
mysql>delete from MYTABLE;  
```

### 12、 更新表中数据  
```shell
mysql>update MYTABLE set sex=”f”where name=’hyq’;
```
