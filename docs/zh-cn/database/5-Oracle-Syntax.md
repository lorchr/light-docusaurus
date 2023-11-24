
# Oracle 语法

## 1. 连接
```shell
sqlplus username/password
sqlplus username/password as role_name;
sqlplus username/password@service_name;
sqlplus username/password@service_name as role_name;
sqlplus username/password@hostname:port/service_name as role_name;
```

## 2. 实例、服务

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

## 3. 表空间（类似于mysql中的库）

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

## 4. 用户、角色

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

## 5. 表

### 1. 查看当前数据库中的所有表

```sql
-- SELECT table_name FROM all_tables;
SELECT table_name FROM user_tables;
```

### 2. 建表

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

### 3. 设置主键自增

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

### 4. 查看与调整主键自增值

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

### 5. 删除表

```sql
-- 删除表
DROP TABLE test_table;
-- 清除表数据， TRUNCATE 语句比 DELETE 语句更快，因为它不会记录每次删除的行，而是直接删除整个表的数据。但是，TRUNCATE 语句无法回滚操作，而 DELETE 语句可以回滚。
DELETE FROM test_table;
TRUNCATE TABLE test_table;
```

### 6. 修改表结构

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
