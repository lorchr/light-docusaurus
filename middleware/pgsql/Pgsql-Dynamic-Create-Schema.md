[Postgres ： 创建schema、创建表空间与指定用户权限](https://blog.csdn.net/weixin_42405670/article/details/130569729)

## 1. 创建新的Schema
要创建 PostgreSQL 中的一个新的 schema，并创建一个只有该 schema 权限的新用户，请按照以下
步骤操作：
1. 打开 PostgreSQL 客户端并连接到数据库服务器。

2. 创建一个新的 schema，使用 CREATE SCHEMA 命令，后面紧跟着 schema 的名称。例如，要创建名为 `my_schema` 的 schema，请运行以下命令：
> CREATE SCHEMA my_schema;

3. 创建一个新的用户，使用 CREATE USER 命令。例如，要创建名为 my_user 的用户，请运行以下命令：
> CREATE USER my_user WITH PASSWORD 'password';

注意，上面的密码应该被替换为你希望设置的密码。

4. 授予该用户对新 schema 的权限，使用 GRANT 命令。例如，要授予名为 my_user 的用户对名为 `my_schema` 的 schema 的所有权限，请运行以下命令：
> GRANT ALL ON SCHEMA my_schema TO my_user;

上面的命令将授予该用户在 my_schema 中创建、修改和删除表、视图和其他对象的权限。

5. 你可以通过运行以下命令来检查是否已成功创建 schema 和用户：
```sql
\dn
\du
```
6. 切换到新创建的用户，使用 \c 命令连接到数据库，并尝试在该用户的 schema 中创建一个新的表：
```sql
\c my_database my_user
CREATE TABLE my_schema.my_table (id SERIAL PRIMARY KEY, name TEXT);
```
这将在 my_user 用户的 my_schema schema 中创建一个名为 my_table 的新表。

7. 现在，你可以使用 SELECT 命令查询该表并验证该用户只能在自己的 schema 中访问它：
> SELECT * FROM my_schema.my_table;

如果你尝试在其他 schema 中查询该表，你将会收到一个错误。
```sql
SELECT * FROM public.my_table;
ERROR: relation "public.my_table" does not exist
LINE 1: SELECT * FROM public.my_table;
```

这是因为该用户没有权限在 public schema 中访问该表。
请注意，如果你希望授予该用户在其他 schema 中的访问权限，请单独为该用户授权。例如，要授予
该用户对 public schema 中的表的访问权限，请使用以下命令：
```sql
GRANT USAGE ON SCHEMA public TO my_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO my_user;
```
上述命令将授予该用户在 public schema 中的所有表上执行 SELECT 操作的权限。请注意，这不会
授予该用户对其他 schema 中的表的访问权限。

## 2. 查询schema是否存在
要查询 PostgreSQL 数据库中是否存在某个特定的 schema，可以使用以下 SQL 命令：
```sql
SELECT EXISTS (
    SELECT 1
    FROM information_schema.schemata
    WHERE schema_name = 'your_schema_name'
);
```

上面的命令中，`your_schema_name` 是要查询的 schema 的名称。如果该 schema 存在，则查询将
返回 true，否则将返回 false。
如果要列出所有现有的 schema，可以使用以下命令：
```sql
SELECT schema_name
FROM information_schema.schemata;
```
这将返回数据库中所有 schema 的名称列表。注意，这将包括系统 schema 和用户自定义的schema。

另外，你也可以使用 PostgreSQL 客户端提供的 \dn 命令来列出数据库中所有的 schema。在PostgreSQL 命令行中，输入 `\dn` 并按下回车键即可。

## 3. 需求与方案
**需求：** 我们会开发一个订单功能，所以需要在分配schema的时候，规定schema的容量大小，来限制
用户的使用，这时候就要考虑怎么去实现了？

**实现方案：**
PostgreSQL 不支持为 schema 直接设置容量大小限制。但是，你可以通过以下两种方法间接实现此
目的：
1. 使用磁盘配额（disk quota）或文件系统配额（filesystem quota）：你可以使用操作系统级别的
磁盘配额或文件系统配额功能来限制 PostgreSQL 数据目录的大小。这将影响所有数据库、
schema 和表。请注意，这种方法可能需要你系统管理员的特殊权限，并且可能会影响系统性
能。
2. 使用表空间（tablespace）：在 PostgreSQL 中，表空间是一种逻辑容器，用于存储特定数据库
或 schema 中的表及其相关对象。你可以在创建 schema 时指定表空间，从而将 schema 中的表
分配给特定的表空间。然后，你可以为每个表空间设置磁盘配额或文件系统配额，以限制该表空
间中存储的表和数据的总大小。这种方法的优点是可以对不同的 schema 或表空间设置不同的限
制，从而更灵活地控制数据使用情况。
## 4. 容量查询
### 4.1 查询所有schema
```sql 
SELECT
    nspname AS schema_name,
    pg_size_pretty(sum(pg_total_relation_size(pg_class.oid))) AS total_size
FROM
    pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE
    nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
GROUP BY nspname;
```
该命令将返回所有用户 `schema` 的名称及其占用的总空间大小，包括数据、索引等。其中，`pg_class` 表包含了关于数据库中所有表和索引的信息，`pg_namespace` 表包含了关于schema 的信息。`pg_total_relation_size` 函数将计算表和索引的总大小，并以字节为单位返
回该值，然后使用 sum 函数将其累加，最后使用 `pg_size_pretty` 函数将其转换为人类可读的格式。

请注意，在这个示例中，我们使用 WHERE 子句排除了系统 `schema` 和 `information_schema` schema，这些 schema 包含了 PostgreSQL 系统和元数据信息。

### 4.2 查询指定schema
```sql
SELECT
    nspname AS schema_name,
    pg_size_pretty(sum(pg_total_relation_size(pg_class.oid))) AS total_size
FROM
pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE
    nspname = 'your_schema_name'
GROUP BY nspname;
```
在这个示例中，我们使用 WHERE 子句指定了条件 nspname = 'your_schema_name'，以筛选出
特定 schema 的信息。请将 your_schema_name 替换为您要查询的 schema 名称。

```sql
# 切换schema
SET SEARCH_PATH to public;

# 创建测试表
CREATE TABLE test_user (
    id int8 NOT NULL ,
    name varchar(32) NOT NULL,
    PRIMARY KEY (id)
);

# 初始化数据
INSERT INTO test_user (id, "name") VALUES (1, 'zhangsan'),(2, 'lisi');

# 创建schema
CREATE SCHEMA test_schema;

# 切换schema
SET SEARCH_PATH to test_schema;

# 创建测试表
CREATE TABLE test_user (
    id int8 NOT NULL ,
    name varchar(32) NOT NULL,
    PRIMARY KEY (id)
);

# 初始化数据
INSERT INTO test_user (id, "name") VALUES (10, 'zhangsan'),(20, 'lisi');

# 查询数据 切换schema
SET SEARCH_PATH to test_schema;
SELECT * FROM test_user su WHERE name = 'zhangsan';
SET SEARCH_PATH to public;
SELECT * FROM test_user su WHERE name = 'zhangsan';

# 查询数据 表名携带schema schema.table
SELECT * FROM test_schema.test_user su WHERE name = 'zhangsan';
SELECT * FROM public.test_user su WHERE name = 'zhangsan';
```