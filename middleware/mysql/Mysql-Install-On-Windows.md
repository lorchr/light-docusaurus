## 1. 安装与配置
1. 下载[Mysql安装包](https://dev.mysql.com/downloads/mysql/)

2. 配置环境变量
```
Path=C:\Program Files\MySQL\bin;$Path
```

3. 创建启动文件 my.ini
```ini
[mysqld]
# 设置3306端口
port=3306
# 设置mysql的安装目录
basedir=D:\Develop\DataBase\mysql\mysql-8.0.16
# 设置mysql数据库的数据的存放目录
datadir=D:\Develop\DataBase\mysql\mysql-8.0.16\data
# 允许最大连接数
max_connections=200
# 允许连接失败的次数。
max_connect_errors=10
# 服务端使用的字符集默认为UTF8
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 默认使用“mysql_native_password”插件认证
#mysql_native_password
default_authentication_plugin=mysql_native_password
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8
[client]
# 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=utf8
```

4. 安装
管理员权限运行CMD，并进入到解压目录

按下列命令执行
```shell
命令默认在安装目录下，如：D:\Develop\DataBase\mysql\mysql-8.0.16\bin
1. 初始化服务
    ./mysqld --defaults-file=D:\Develop\DataBase\mysql\mysql-8.0.16-winx64\my.ini --initialize --console
    ./mysqld --defaults-file=D:\Develop\DataBase\mysql\mysql-5.7.26-winx64\my.ini --initialize --console
    此步骤需记录初始化密码

2. 安装Mysql服务
    mysqld --install [服务名]（服务名可以不加默认为mysql）
    Service successfully installed

3. 如果出现The service already exists!
    删除服务sc delete mysql
    再次安装

4. 如果出现Install/Remove of the Service Denied!
    重新以管理员身份打开cmd窗口运行

5. 启动服务
    net start mysql

6. 使用Navicat登录到 Mysql
    链接：https://pan.baidu.com/s/1TrPYBOU8APWlarFW_QTLlQ密码：7jbs
```

5. 常用命令
```shell
启动服务：
    net start mysql
停止服务
    net stop mysql。
卸载服务：
    sc delete MySQL/mysqld -remove
登录ysql：
    mysql -u root -p
    输入安装生成随机密码
    mysql -h localhost -P 3306 -u root -p
修改密码：
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码'; 
查看数据库、数据表：
    show databases;
    use mysql;
    show tables;
查看默认MySQL用户：
    select user,host,authentication_string from mysql.user;
创建用户：
    CREATE USER 'zjft'@'%' IDENTIFIED WITH mysql_native_password BY 'zjft8888';
检查用户：
    select user, host, plugin, authentication_string from user\G;
授权远程数据库
    1.授权所有权限 
        GRANT ALL PRIVILEGES ON *.* TO 'zjft'@'%'；
    2.授权基本的查询修改权限，按需求设置
        GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER ON *.* TO 'zjft'@'%';
        FLUSH PRIVILEGES;
查看用户权限
    show grants for 'zjft'@'%';
```

**注意：**管理员root的host是localhost，代表仅限localhost登录访问。如果要允许开放其他ip登录，则需要添加新的host。如果要允许所有ip访问，可以直接修改成“%”

## 2. 用户与权限
[Mysql用户与权限](http://blog.csdn.net/piaocoder/article/details/53704126)
1. 创建用户
```shell
CREATE USER 'username'@'host' IDENTIFIED BY 'password';
```
说明：
- username：你将创建的用户名
- host：指定该用户在哪个主机上可以登陆，如果是本地用户可用localhost，如果想让该用户可以从任意远程主机登陆，可以使用通配符%
- password：该用户的登陆密码，密码可以为空，如果为空则该用户可以不需要密码登陆服务器

例子：
```shell
CREATE USER 'dog'@'localhost' IDENTIFIED BY '123456';
CREATE USER 'pig'@'192.168.1.101_' IDENDIFIED BY '123456';
CREATE USER 'pig'@'%' IDENTIFIED BY '123456';
CREATE USER 'pig'@'%' IDENTIFIED BY '';
CREATE USER 'pig'@'%';
```

2. 授权:
命令:
```shell
GRANT privileges ON databasename.tablename TO 'username'@'host'
```
说明:
- privileges：用户的操作权限，如SELECT，INSERT，UPDATE等，如果要授予所的权限则使用ALL
- databasename：数据库名
- tablename：表名，如果要授予该用户对所有数据库和表的相应操作权限则可用*表示，如*.*

例子:
```shell
GRANT SELECT, INSERT ON test.user TO 'pig'@'%';
GRANT ALL ON *.* TO 'pig'@'%';
GRANT ALL ON maindataplus.* TO 'pig'@'%';
```

**注意:**
用以上命令授权的用户不能给其它用户授权，如果想让该用户可以授权，用以下命令:
```shell
GRANT privileges ON databasename.tablename TO 'username'@'host' WITH GRANT OPTION;
```

3. 设置与更改用户密码
命令:
```shell
SET PASSWORD FOR 'username'@'host' = PASSWORD('newpassword');
```

如果是当前登陆用户用:
```shell
SET PASSWORD = PASSWORD("newpassword");
```

例子:
```shell
SET PASSWORD FOR 'pig'@'%' = PASSWORD("123456");
```
4. 撤销用户权限
命令:
```shell
REVOKE privilege ON databasename.tablename FROM 'username'@'host';
```
**说明:**
privilege, databasename, tablename：同授权部分

例子:
```shell
REVOKE SELECT ON *.* FROM 'pig'@'%';
```

**注意:**
假如你在给用户'pig'@'%'授权的时候是这样的（或类似的）：GRANT SELECT ON test.user TO 'pig'@'%'，则在使用REVOKE SELECT ON *.* FROM 'pig'@'%';命令并不能撤销该用户对test数据库中user表的SELECT 操作。相反，如果授权使用的是GRANT SELECT ON *.* TO 'pig'@'%';则REVOKE SELECT ON test.user FROM 'pig'@'%';命令也不能撤销该用户对test数据库中user表的Select权限。

具体信息可以用命令SHOW GRANTS FOR 'pig'@'%'; 查看。

5. 删除用户
命令:
```shell
DROP USER 'username'@'host';
```

### Mysql8授权
1. 登录：
```shell
mysql -u root -p  
```

2. 查看现有用户
```shell
mysql> select host,user,authentication_string from mysql.user;
 +-----------+------------------+----------------------------------------------------------------+
 | host | user | authentication_string |
 +-----------+------------------+----------------------------------------------------------------+
 | localhost | mysql.infoschema | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE |
 | localhost | mysql.session | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE |
 | localhost | mysql.sys | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE |
 | localhost | root | $A$005$e!42 )Tf+4M{4W>MkFY9ktIVPhgVemeQsSQnuiGLRiH/909Zyaj9XF3/3Yk2 |
 +-----------+------------------+----------------------------------------------------------------+
```

3. 新建用户
```shell
create user 'username'@'host' identified by 'password';

mysql> create user 'test'@'localhost' identified by '123';
mysql> create user 'test'@'192.168.7.22' identified by '123';
mysql> create user 'test'@'%' identified by '123';
```

4. 删除用户
```shell
drop user 'username'@'host';
```

5. 授权
```shell
grant privileges on databasename.tablename to 'username'@'host' IDENTIFIED BY 'PASSWORD';
```
- 1. GRANT命令说明：
    - priveleges(权限列表),可以是all priveleges,表示所有权限，也可以是select、update等权限，多个权限的名词,相互之间用逗号分开。
    - on用来指定权限针对哪些库和表。
    - *.* 中前面的*号用来指定数据库名，后面的*号用来指定表名。
    - to 表示将权限赋予某个用户, 如 jack@'localhost' 表示jack用户，@后面接限制的主机，可以是IP、IP段、域名以及%，%表示任何地方。注意：这里%有的版本不包括本地，以前碰到过给某个用户设置了%允许任何地方登录，但是                  在本地登录不了，这个和版本有关系，遇到这个问题再加一个localhost的用户就可以了。
    - identified by指定用户的登录密码,该项可以省略。
    - WITH GRANT OPTION 这个选项表示该用户可以将自己拥有的权限授权给别人。注意：经常有人在创建操作用户的时候不指定WITH GRANT OPTION选项导致后来该用户不能使用GRANT命令创建用户或者给其它用户授权。

备注：可以使用GRANT重复给用户添加权限，权限叠加，比如你先给用户添加一个select权限，然后又给用户添加一个insert权限，那么该用户就同时拥有了select和insert权限。

- 2.授权原则说明：
    权限控制主要是出于安全因素，因此需要遵循一下几个经验原则：
    - a、只授予能满足需要的最小权限，防止用户干坏事。比如用户只是需要查询，那就只给select权限就可以了，不要给用户赋予update、insert或者delete权限。
    - b、创建用户的时候限制用户的登录主机，一般是限制成指定IP或者内网IP段。
    - c、初始化数据库的时候删除没有密码的用户。安装完数据库的时候会自动创建一些用户，这些用户默认没有密码。
    - d、为每个用户设置满足密码复杂度的密码。
    - e、定期清理不需要的用户。回收权限或者删除用户。


```shell
grant all privileges on `test`.* to 'test'@'%' ;        /*授予用户通过外网IP对于该数据库的全部权限*/

grant all privileges on `test`.* to 'test'@'localhost'; /*授予用户在本地服务器对该数据库的全部权限*/

grant select on test.* to 'user1'@'localhost';  /*给予查询权限*/

grant insert on test.* to 'user1'@'localhost';  /*添加插入权限*/

grant delete on test.* to 'user1'@'localhost';  /*添加删除权限*/

grant update on test.* to 'user1'@'localhost';  /*添加权限*/

flush privileges; /*刷新权限*/
```

6. 查看权限

```shell
 show grants;
+---------------------------------------------------------------------+
| Grants for root@localhost                                           |
+---------------------------------------------------------------------+
| GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION |
| GRANT PROXY ON ''@'' TO 'root'@'localhost' WITH GRANT OPTION        |
+---------------------------------------------------------------------+
2 rows in set (0.00 sec)
```

查看某个用户的权限：
```shell
show grants for 'jack'@'%';
+-----------------------------------------------------------------------------------------------------+
| Grants for jack@%                                                                                   |
+-----------------------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO 'jack'@'%' IDENTIFIED BY PASSWORD '*9BCDC990E611B8D852EFAF1E3919AB6AC8C8A9F0' |
+-----------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

7. 删除权限
```shell
revoke privileges on databasename.tablename from 'username'@'host';

revoke delete on test.* from 'jack'@'localhost';
```

8. 修改用户名
```shell
mysql> rename user 'jack'@'%' to 'jim'@'%';
```

9. 修改密码
- 1. 用set password命令
```shell
mysql> SET PASSWORD FOR 'root'@'localhost' = PASSWORD('123456');
Query OK, 0 rows affected (0.00 sec)
```
- 2. 用mysqladmin 
```shell
[root@rhel5 ~]# mysqladmin -uroot -p123456 password 1234abcd
```
备注： 格式：mysqladmin -u用户名 -p旧密码 password 新密码

- 3. 用update直接编辑user表

10. pycharm中python3.6+pymysql+mysql8.0.1连接报错　
```shell
pymysql.err.OperationalError: (1045, u"Access denied for user 'root'@'localhost' (using password: No)")
```

解决方法：　
```shell
在cmd命令行连接mysql, 通过mysql -u root -p dong1990

然后输入ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dong1990';
```

## 3. 配置文件 my.ini
```ini
[mysqld]
# 设置3306端口
port=3306
# 设置mysql的安装目录
basedir=C:\Program Files\MySQL
# 设置mysql数据库的数据的存放目录
datadir=C:\Program Files\MySQL\Data
# 允许最大连接数
max_connections=200
# 允许连接失败的次数。
max_connect_errors=10
# 服务端使用的字符集默认为UTF8
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 默认使用“mysql_native_password”插件认证
#mysql_native_password
default_authentication_plugin=mysql_native_password
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8
[client]
# 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=utf8
```
