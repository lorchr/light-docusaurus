- [Oracle Github Images](https://github.com/oracle/docker-images)
- [Oracle](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html) [Container Registry](https://container-registry.oracle.com/ords/f?p=113:10)
- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- [Docker Image 11g](https://hub.docker.com/r/jaspeen/oracle-11g) [Github](https://github.com/jaspeen/oracle-11g)
- [Docker Image 12c](https://hub.docker.com/r/truevoly/oracle-12c) [Github](https://github.com/MaksymBilenko/docker-oracle-12c)

- [docker快速部署oracle19c、oracle12c](https://blog.csdn.net/weixin_44032384/article/details/131404349)
- [docker安装orcale-12c](https://blog.csdn.net/qq_26018075/article/details/107844316)

## 安装
- [官方文档](https://github.com/oracle/docker-images/tree/main/OracleDatabase/SingleInstance)

```shell
# 拉取镜像
docker pull jaspeen/oracle-11g
docker pull truevoly/oracle-12c
docker pull registry.cn-hangzhou.aliyuncs.com/helowin/oracle_11g
docker pull registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c
docker pull registry.cn-hangzhou.aliyuncs.com/laowu/oracle:12.2.0.1.0
docker pull registry.cn-hangzhou.aliyuncs.com/laowu/oracle:19c

docker pull container-registry.oracle.com/database/free:latest
docker pull container-registry.oracle.com/database/free:23.3.0.0
docker pull container-registry.oracle.com/database/enterprise:latest
docker pull container-registry.oracle.com/database/enterprise:21.3.0.0
docker pull container-registry.oracle.com/database/enterprise:19.3.0.0
docker pull container-registry.oracle.com/database/enterprise:19.19.0.0
docker pull container-registry.oracle.com/database/enterprise:12.2.0.1
docker pull container-registry.oracle.com/database/enterprise:12.1.0.2

# 运行容器
docker run -d \
  --publish 1521:1521 \
  --publish 5500:5500 \
  --env ORACLE_SID=orcl \
  --env ORACLE_PDB=orclpdb1 \
  --env ORACLE_PWD=123456 \
  --env ORACLE_CHARACTERSET=zhs16gbk \
  --env ORACLE_BASE=/opt/oracle \
  --env ORACLE_HOME=/opt/oracle/product/12.2.0.1/dbhome_1 \
  --env PATH=/opt/oracle/product/12.2.0.1/dbhome_1/bin:/opt/oracle/product/12.2.0.1/dbhome_1/OPatch/:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  --volume //d/docker/oracle/data:/opt/oracle/oradata \
  --net dev \
  --restart=on-failure:3 \
  --name oracle12c \
  registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c:latest

# 进入容器
docker exec -it -u root oracle12c /bin/bash
```

[OEM Express](https://localhost:5500/em/)
  - Account: system/123456 容器名：orclpdb1

## [laowu/oracle]()
阿里云仓库地址: `docker pull registry.cn-hangzhou.aliyuncs.com/laowu/oracle`

### Oracle 19c测试环境快速搭建
### 1. 安装
```shell
# 下载镜像 19.3.0.0.0
docker pull registry.cn-hangzhou.aliyuncs.com/laowu/oracle:19c

# 创建文件
mkdir -p /mymount/oracle19c/oradata

# 授权，不授权会导致后面安装失败
chmod 777 /mymount/oracle19c/oradata

docker run -d \
-p 1521:1521 -p 5500:5500 \
-e ORACLE_SID=SID \
-e ORACLE_PDB=PDB \
-e ORACLE_PWD=123456 \
-e ORACLE_EDITION=standard \
-e ORACLE_CHARACTERSET=AL32UTF8 \
-v /mymount/oracle19c/oradata:/opt/oracle/oradata \
--name oracle19c \
registry.cn-hangzhou.aliyuncs.com/laowu/oracle:19c

# 查看日志 等待加载进度
docker logs -tf oracle19c

# 出现以下内容表示启动完成
#########################
DATABASE IS READY TO USE!
#########################

# 进入容器
docker exec -it -u root oracle19c /bin/bash

# 登录 sys / 123456
sqlplus sys/123456@localhost:1521/pdb as sysdb;

# 登录格式
sqlplus username/password@hostname:port/service_name as role_name;
```

### 2. 建表空间、用户
```sql
-- 查询数据库实例的名称 也就是oracle_sid值，默认时xe
SELECT name FROM v$database;

-- 查询oracle的状态， open表示正常
SELECT status FROM v$instance;

-- 查看所有的表空间(数据库)
SELECT name FROM v$tablespace;

-- 创建表空间
-- mkdir -p /home/oracle/escdb
-- chmod 777 /home/oracle/escdb
-- 登录数据库
sqlplus sys/123456@localhost:1521/pdb as sysdb;
CREATE TABLESPACE idm_spc DATAFILE '/opt/oracle/oradata/SID/PDB/idm_spc.dbf' 
  SIZE 100M AUTOEXTEND ON MAXSIZE 500M EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M;

-- 查询所有用户名
SELECT username FROM user_users;
-- 创建用户
CREATE USER IAM IDENTIFIED BY 123456 DEFAULT TABLESPACE idm_spc;
-- 分配角色
GRANT CONNECT,RESOURCE TO IAM;

-- 退出后使用新用户登录，普通用户不需要指定角色类型
sqlplus iam/123456@localhost:1521/pdb
```

### 3. 建表
（复制sql，替换表名执行完毕后，再修改自己想要的字段即可）

```sql
-- 查看当前数据库中用户的所有表
-- SELECT table_name FROM user_tables;
-- 创建表
CREATE TABLE IAM.test_table (
  id NUMBER(10,0) VISIBLE NOT NULL,
  name VARCHAR2(255 BYTE) VISIBLE,
  create_time TIMESTAMP(6) VISIBLE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  update_time TIMESTAMP(6) VISIBLE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  del NUMBER(1,0) VISIBLE DEFAULT 0 NOT NULL,
  primary key(id)
) TABLESPACE IDM_SPC;

-- 设置字段备注
COMMENT ON COLUMN IAM.test_table.id IS '主键id';
COMMENT ON COLUMN IAM.test_table.name IS '名称';
COMMENT ON COLUMN IAM.test_table.create_time IS '创建时间';
COMMENT ON COLUMN IAM.test_table.update_time IS '更新时间';
COMMENT ON COLUMN IAM.test_table.del IS '是否已删除 0: 否 1: 是';

-- 设置主键自增
ALTER TABLE test_table ADD CONSTRAINT id PRIMARY KEY(id);

-- 自定义序列名
CREATE SEQUENCE test_table_seq
  INCREMENT BY 1
  START WITH 1
  NOMAXVALUE
  NOMINVALUE
  NOCACHE;

-- 创建触发器
CREATE OR REPLACE TRIGGER test_table_seq
BEFORE INSERT ON test_table FOR EACH ROW
BEGIN
  SELECT test_table_seq.nextval INTO :new.id FROM dual;
END;
```

### 4. 测试新增数据与删除表
（复制sql，替换自己的表名）

```sql
-- 测试insert
insert into test_table (name) values('testname1');
select * from test_table;

-- 删除表（需要手动删除自增序列）
select * from user_triggers; -- 查看所有触发器
select * from user_sequences; -- 查看所有序列
drop table test_table; -- 删除表
drop sequence test_table_seq; -- 删除序列
```

### 5. oracle19c常用命令/sql汇总
1. 连接
```shell
sqlplus username/password
sqlplus username/password as role_name;
sqlplus username/password@service_name;
sqlplus username/password@service_name as role_name;
sqlplus username/password@hostname:port/service_name as role_name;
```

2. 实例、服务

一个oracle表示一个实例,一个实例可以配置多个服务,独立维护的oracle服务
```sql
-- 查询数据库实例的名称，也就是 ORACLE_SID 的值
SELECT name FROM v$database;
select instance_name from v$instance;

-- 查看当前实例中的所有服务
SELECT name FROM v$services;
-- 查看版本
select * from v$version;
-- 查询oracle server端的字符集，默认是 AMERICAN_AMERICA.AL32UTF8
select userenv(\'language\') from dual;

-- 在 Oracle 12c 及以上版本中，引入了 CDB 和 PDB 的概念。CDB 是一个容器数据库，而 PDB 是可插入数据库。在 CDB 中，只能创建公共用户（Common User），而不能直接在 CDB 中创建普通用户。
show con_name;  -- 查看当前会话是CDB还是PDB
show pdbs; -- 查看所有PDB
ALTER SESSION SET CONTAINER = pdb_name;   -- 切换到指定的PDB
-- 切换到CDB:   ALTER SESSION SET CONTAINER = CDB$ROOT;

-- 所以这里建议连接数据库时，就指定PDB（服务名）
sqlplus username/password@hostname:port/service_name  as role_name;
```

3. 表空间（类似于mysql中的库）

一个服务内可以有多个表空间，默认表空间就有很多，比如常见的SYSTEM、TEMP、USERS
```sql
-- 查看所有表空间（相当于mysql中的库）
SELECT name FROM v$tablespace;
-- 查看当前会话默认的表空间
SELECT PROPERTY_NAME, PROPERTY_VALUE FROM DATABASE_PROPERTIES WHERE PROPERTY_NAME = \'DEFAULT_PERMANENT_TABLESPACE\';
-- 查看当前会话默认的临时表空间
SELECT PROPERTY_NAME, PROPERTY_VALUE FROM DATABASE_PROPERTIES WHERE PROPERTY_NAME = \'DEFAULT_TEMP_TABLESPACE\';

-- 创建表空间
CREATE TABLESPACE tablespace_name DATAFILE \'/path/to/datafile.dbf\' SIZE 100M AUTOEXTEND ON MAXSIZE  500M EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M;

-- 删除表空间 (需要手动删除dbf文件)
drop tablespace tablespace_name including contents cascade constraints;
```

4. 用户、角色

常见的默认角色：
- 1、`CONNECT`：该角色用于允许用户连接到数据库的最低级别权限。它包含了最基本的权限，如创建会话、创建表、创建序列等。
- 2、`RESOURCE`：该角色用于允许用户创建和管理对象（如表、视图、序列等）的权限。它包含了 CONNECT 角色的权限，并且还包括创建索引、创建存储过程和触发器的权限。
- 3、`DBA`：该角色是数据库管理员角色，拥有对整个数据库的完全访问权限。它包含了 CONNECT 和 RESOURCE 角色的权限，并且还包括许多其他高级权限，如创建用户、创建表空间、备份恢复等。

```sql
-- 查询所有账户
SELECT * FROM user_users;
-- SELECT * FROM ALL_USERS;
-- 创建用户
CREATE USER your_username IDENTIFIED BY your_password  DEFAULT TABLESPACE your_tablespace;
-- 分配角色
GRANT CONNECT, RESOURCE TO your_username;
-- 修改用户 system 的密码为 123456 ，可以自定义
alter user system identified by "123456";   
-- 删除用户
drop user your_username cascade;
-- 查看用户拥有的角色
SELECT * FROM DBA_ROLE_PRIVS WHERE GRANTEE = \'YOUR_USERNAME\';
-- 查看当前用户的角色
SELECT * FROM USER_ROLE_PRIVS;
-- 查看角色的详细信息
SELECT * FROM DBA_ROLES WHERE ROLE = \'YOUR_ROLE\';
```

5. 表

- 查看当前数据库中的所有表

```sql
-- SELECT table_name FROM all_tables;
SELECT table_name FROM user_tables;
```

- 建表

```sql
-- 创建表
CREATE TABLE IAM.test_table (
  id NUMBER(10,0) VISIBLE NOT NULL,
  name VARCHAR2(255 BYTE) VISIBLE,
  create_time TIMESTAMP(6) VISIBLE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  update_time TIMESTAMP(6) VISIBLE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  del NUMBER(1,0) VISIBLE DEFAULT 0 NOT NULL,
  primary key(id)
) TABLESPACE IDM_SPC;

-- 设置字段备注
COMMENT ON COLUMN IAM.test_table.id IS \'主键id\';
COMMENT ON COLUMN IAM.test_table.name IS \'名称\';
COMMENT ON COLUMN IAM.test_table.create_time IS \'创建时间\';
COMMENT ON COLUMN IAM.test_table.update_time IS \'修改时间\';
COMMENT ON COLUMN IAM.test_table.del IS \'是否已删除 0：否    1：是\';
```

- 设置主键自增

```sql
-- 设置主键自增 表名：test_table

-- 1、设置主键字段（建表时已经指定过主键，这里不用重复执行）
-- alter table test_table add constraint id primary key (id);

-- 2、自定义序列名 test_table_seq
create sequence test_table_seq
increment by 1 
start with 1 
nomaxvalue 
nominvalue 
nocache;

-- 3、创建触发器
create or replace trigger test_table_seq  
before insert on test_table for each row 
begin 
  select test_table_seq.nextval into :new.id from dual; 
end;
```

- 查看与调整主键自增值

```sql
-- 查看当前表的触发器
SELECT * FROM USER_TRIGGERS WHERE TABLE_NAME = \'TEST_TABLE\'; 
-- 查看序列详情 
-- 其中LAST_NUMBER 并不是表示最后一次新增，而是下次新增时的序列值
select * from user_sequences where sequence_name=\'TEST_TABLE_SEQ\'; 
-- 手动触发自增：（查询一次就会自增一次，也就是会说会占用一次id值）
SELECT test_table_seq.NEXTVAL FROM DUAL;
-- id自增值初始化：先删除自增序列与触发器，再重新创建一遍即可
drop sequence test_table_seq; 
drop trigger  test_table_seq;
-- id自增值的调整
-- oracle中不能调整，只能删除后重新创建序列，然后可以通过start with 来指定起始值，比如start with 100，新增的第一条数据id值就是100；
-- 补充：
-- 当前表如果有多个触发器，执行顺序由上到下：
SELECT * FROM SYS.OBJ$ where NAME like \'%TEST_TABLE%\' and type#=12 ORDER BY OBJ# desc;
-- sys.obj$ 表是oracle 数据库字典表中的对象基础表
-- type#=12 表示 trigger 对象， 6表示sequence对象，2表示table对象
-- 也就是说，如果这里不小心创建了多个id自增的触发器，那么会以最后一次执行的触发器结果为准
```

- 删除表

```sql
-- 删除表
DROP TABLE test_table;
-- 清除表数据， TRUNCATE 语句比 DELETE 语句更快，因为它不会记录每次删除的行，而是直接删除整个表的数据。但是，TRUNCATE 语句无法回滚操作，而 DELETE 语句可以回滚。
DELETE FROM test_table;
TRUNCATE TABLE test_table;
```

- 修改表结构

```sql
-- 表结构修改
-- 添加列（ADD） 
ALTER TABLE table_name ADD (column_name data_type);
-- 删除列
ALTER TABLE table_name DROP COLUMN column_name;
-- 修改列名
ALTER TABLE table_name RENAME COLUMN old_column_name TO new_column_name;
-- 修改列类型以及长度
ALTER TABLE table_name MODIFY (column_name data_type(size));
-- 修改字段注释
COMMENT ON COLUMN table_name.column_name IS \'New column comment\';
```

### oracle 12c测试环境快速搭建
安装 （推荐安装12.2版本）
```shell
# 下载 oracle 12.1
#（坑：表、字段、索引名、视图名命名长度不能超过 30 ）
docker pull docker.io/truevoly/oracle-12c# 下载 oracle 12.2 
# （标识符的长度支持 30 以上了，且最大为 128 个字符）
docker pull registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c
# 创建文件
mkdir -p /mymount/oracle-12/oradata
# 授权，不授权会导致后面安装失败
chmod 777 /mymount/oracle-12/oradata# 12.1

docker run -d  \
  -p 1522:1521 \
  -v /mymount/oracle-12/oradata:/home/oracle/data_temp \
  -e oracle_allow_remote=true \
  --name orcle12c \
  truevoly/oracle-12c
  
# 12.2
# -e ORACLE_CHARACTERSET=zhs16gbk \
docker run  --name oracle12.2 -d \
  -p 1521:1521 -p 5500:5500 \
  -e ORACLE_SID=orcl \
  -e ORACLE_PDB=orclpdb1 \
  -e ORACLE_PWD=123456 \
  -v /mymount/oracle-12/oradata:/opt/oracle/oradata \
  registry.cn-hangzhou.aliyuncs.com/laowu/oracle:12.2.0.1.0 

# 连接数据库登录 默认账号密码：system/oracle
docker exec -it  oracle-12c  /bin/bash
sqlplus system/oracle@localhost:1521/xe as sysdba

# 建表等其它操作课参考oracle19c
```

如果连接报错：
Oracle数据库报错：Oracle net admin error
去下载 https://www.oracle.com/database/technologies/instant-client/downloads.html
下载后解压，配置navicat环境：（需要重启navicat后生效）
`工具` - `选项` - `环境` - `OCI环境` - `OCI libiary oci.dll`添加地址

## [zhuyijun/oracle-12c](https://hub.docker.com/r/zhuyijun/oracle-12c)
阿里云仓库地址: `docker pull registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c`

Orcale数据库12c、19c
数据库版本为`Orcale 12.2.0.1` `Orcale19.3.0.0`

### 1、下载镜像
```shell
docker pull zhuyijun/oracle-12c
```

### 2、启动容器
#### 1）12c版本
linux环境下docker启动容器命令
```shell
docker run   --name myoracle  -p 1521:1521 -p 5500:5500 \
-e ORACLE_SID=orcl \
-e ORACLE_PDB=orclpdb1 \
-e ORACLE_PWD=123456 \
-e ORACLE_CHARACTERSET=al32utf8 \
-e ORACLE_BASE=/opt/oracle \
-e ORACLE_HOME=/opt/oracle/product/12.2.0.1/dbhome_1 \
-e PATH=/opt/oracle/product/12.2.0.1/dbhome_1/bin:/opt/oracle/product/12.2.0.1/dbhome_1/OPatch/:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
-v /home/nicemoe/oradata:/opt/oracle/oradata \
zhuyijun/oracle-12c:latest
```

windows环境下启动orcale容器命令
```shell
docker run   --name myoracle  -p 1521:1521 -p 5500:5500 `
-e ORACLE_SID=orcl `
-e ORACLE_PDB=orclpdb1 `
-e ORACLE_PWD=123456 `
-e ORACLE_CHARACTERSET=al32utf8 `
-e ORACLE_BASE=/opt/oracle `
-e ORACLE_HOME=/opt/oracle/product/12.2.0.1/dbhome_1 `
-e PATH=/opt/oracle/product/12.2.0.1/dbhome_1/bin:/opt/oracle/product/12.2.0.1/dbhome_1/OPatch/:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin `
-v /d/docker/data/oradata:/opt/oracle/oradata `
oracle-12c:latest
```

注意使用之前修改`/home/nicemoe/oradata`为自己的

`/d/docker/data/oradata`意思是`D:/docker/data/oradata`文件夹

#### 2）19c版本
linux环境下启动容器命令
```shell
docker run  --name myoracle  -p 1521:1521 -p 5500:5500 \
-e ORACLE_SID=orcl \
-e ORACLE_PDB=orclpdb1 \
-e ORACLE_PWD=123456 \
-e ORACLE_CHARACTERSET=zhs16gbk \
-e ORACLE_BASE=/opt/oracle \
-e ORACLE_HOME=/opt/oracle/product/12.2.0.1/dbhome_1 \
-e PATH=/opt/oracle/product/12.2.0.1/dbhome_1/bin:/opt/oracle/product/12.2.0.1/dbhome_1/OPatch/:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
-v /home/nicemoe/oradata:/opt/oracle/oradata \
registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c:19c
```

windows环境下启动orcale容器命令
```shell
docker run   --name myoracle  -p 1521:1521 -p 5500:5500 \
-e ORACLE_SID=orcl \
-e ORACLE_PDB=orclpdb1 \
-e ORACLE_PWD=123456 \
-e ORACLE_CHARACTERSET=zhs16gbk \
-e ORACLE_BASE=/opt/oracle \
-e ORACLE_HOME=/opt/oracle/product/12.2.0.1/dbhome_1 \
-e PATH=/opt/oracle/product/12.2.0.1/dbhome_1/bin:/opt/oracle/product/12.2.0.1/dbhome_1/OPatch/:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
-v /d/docker/data/oradata:/opt/oracle/oradata \
registry.cn-hangzhou.aliyuncs.com/zhuyijun/oracle-12c:19c
```

命令解释:

- `-d`: 后台运行容器，并返回容器ID；
- `-p`: 指定端口映射，格式为：主机(宿主)端口:容器端口
- `--name`: 为容器指定一个名称；
- `-e`：设置环境变量
- `-v`：绑定一个卷 例子：`/home/nicemoe/oradata:/opt/oracle/oradata`    `/home/nicemoe/oradata`为自己创建orcale数据目录，需要分配权限

### 3、修改密码
```shell
docker exec <container name> ./setPassword.sh <your password>
```

例如：
```shell
docker exec d38c6077ec85 ./setPassword.sh 123456
```

### 4、连接数据库
```shell
sqlplus sys/<your password>@//localhost:1521/<your SID> as sysdba
sqlplus system/<your password>@//localhost:1521/<your SID>
sqlplus pdbadmin/<your password>@//localhost:1521/<Your PDB name>
```

例子:
```shell
sqlplus sys/123456@//localhost:1521/orcl as sysdba
sqlplus system/123456@//localhost:1521/orcl
sqlplus pdbadmin/123456@//localhost:1521/orclpdb1
```

### 5、容器中的Oracle数据库还配置了`Oracle Enterprise Manager Express`。要访问`OEM Express`，请启动浏览器并按照以下URL进行操作：

```shell
https://localhost:5500/em/
```

| 用户名 | system/sys等 |
| ------ | ------------ |
| 口令   | 123456       |
| 容器名 | orclpdb1     |

若要以sysdba身份登录:

| 用户名 | sys      |
| ------ | -------- |
| 口令   | 123456   |
| 容器名 | orclpdb1 |

## 配置
```shell
# 切换到root账户 （密码：helowin）
su root

# 编辑环境变量
vim /etc/profile

export ORACLE_HOME=/home/oracle/app/oracle/product/11.2.0/dbhome_2
export ORACLE_SID=helowin
export PATH=$ORACLE_HOME/bin:$PATH

# 使配置生效
source /etc/profile

# 创建软链接
ln -s $ORACLE_HOME/bin/sqlplus /usr/bin

# 切换到oracle用户，登录sqlplus
su - oracle

# 匿名登录
sqlplus /nolog

# dba身份登录
conn /as sysdba

ALTER USER system IDENTIFIED BY YOUR_PASSWORD;
ALTER USER sys IDENTIFIED BY YOUR_PASSWORD;
ALTER profile default limit PASSWORD_LIFE_TIME UNLIMITED;
# 如果你懒得写可以直接复制下面的！
ALTER USER system IDENTIFIED BY system;
ALTER USER sys IDENTIFIED BY sys;

# 解锁用户
ALTER USER scott ACCOUNT UNLOCK;
ALTER USER scott IDENTIFIED BY scott;

# 创建用户（可选，根据需要）
# 用一个具有dba权限的用户登录（sysdba)，然后输入以下语句
CREATE USER light IDENTIFIED BY light;
GRANT connect,resource,dba TO light;
```

## 常用操作
### 数据库操作
```sql
-- 查询可用数据库名
SELECT instance_name FROM v$instance;

-- 查询可用用户名
SHOW user;

-- 查询数据库实例的名称 也就是oracle_sid值，默认时xe
SELECT name FROM v$database;

-- 查询oracle的状态， open表示正常
SELECT status FROM v$instance;

-- 查看所有的表空间(数据库)
SELECT name FROM v$tablespace;

-- 创建表空间
-- mkdir -p /home/oracle/escdb
-- chmod 777 /home/oracle/escdb
-- 登录数据库
sqlplus sys/123456@localhost:1521/pdb as sysdb;
CREATE TABLESPACE idm_spc DATAFILE '/opt/oracle/oradata/SID/PDB/idm_spc.dbf' 
  SIZE 100M AUTOEXTEND ON MAXSIZE 500M EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M;

-- 查询所有用户名
SELECT username FROM user_users;
-- 创建用户
CREATE USER IAM IDENTIFIED BY 123456 DEFAULT TABLESPACE idm_spc;
-- 分配角色
GRANT CONNECT,RESOURCE TO IAM;

-- 退出后使用新用户登录，普通用户不需要指定角色类型
sqlplus iam/123456@localhost:1521/pdb
```


## springBoot项目中连接oracle
### 1. 关键的配置
```properties
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url=jdbc:oracle:thin:@//192.168.2.23:1521/你的服务名
spring.datasource.username=你的用户
spring.datasource.password=你的密码
spring.datasource.dialect=org.hibernate.dialect.Oracle12cDialect
spring.datasource.hikari.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.hikari.schema=你的服务名
```

### 2. application.yml
```yaml
server:
  port: 8080
spring:
  datasource:
    driver-class-name: oracle.jdbc.OracleDriver
    url: jdbc:oracle:thin:@paravm:1521/ORCLPDB1
    username: IAM
    password: 123456
#    driver-class-name: com.mysql.jdbc.Driver
#    url: jdbc:mysql://vm:3306/whx?autoReconnect=true&autoReconnectForPools=true&allowMultiQueries=true&zeroDateTimeBehavior=convertToNull
#    username: root
#    password: mysql5.7

mybatis-plus:  
    mapper-locations: classpath*:mapper/**/*Mapper.xml
    configuration:
        log-impl: org.apache.ibatis.logging.stdout.StdOutImpl 
    global-config:  
        db-config:      
            # 主键策略   
            id-type: auto
```

3. pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.6.RELEASE</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>demo-temp</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo-temp</name>

    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/com.baomidou/mybatis-plus-boot-starter -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.2</version>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
            <version>12.2.0.1</version>
        </dependency>
        <!-- <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.49</version>
        </dependency> -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.7.16</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```