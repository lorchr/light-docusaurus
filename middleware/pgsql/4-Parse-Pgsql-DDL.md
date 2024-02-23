
今天又遇到了一个问题，如何获取PostgreSQL对象的DDL语句？在Oracle数据库中我们可以使用`dbms_metadata.get_ddl`函数来处理，那么如何在 PG中实现它呢？

获取DDL的一些方法

## 1. 使用pg_dump来获取ddl
使用pg_dump获取ddl。这个方法最简单。
```shell
-s, --schema-only            dump only the schema, no data
-t, --table=PATTERN          dump the specified table(s) only

[postgres@centos8 ~]$ pg_dump -U postgres -h 192.168.56.119 -d postgres -s -t jobs | egrep -v "^--|^$|^SET"  
```

如下图所示：可以帮助我们显示table的ddl，权限，注释，索引，约束以及触发器。


实际上pg_dump命令行还不错，但需要输入的内容太多了。可考虑使用PL/Python将逻辑封装起来，我们先尝试在操作系统上使用python脚本调用pg_dump。
```py
import subprocess
import re
p_output = subprocess.check_output(["pg_dump", "–-schema-only", "--dbname=postgres", "–-table=jobs", "--username=postgres"],shell=True)
regex_pat=r'(^CREATE TABLE.+?\);$)'
matches=re.findall(regex_pat, p_output.decode("utf-8"),re.DOTALL|re.MULTILINE)
ddl = matches[0]
print(ddl)
```

下面是我用python编写的脚本，使用的主要是subprocess模块的check_output调用pg_dump命令。接着将返回的字符串与正则表达式匹配，提取创建表的语句。
```shell
[postgres@centos8 ~]$ python3 a1.py
CREATE TABLE public.countries (
    country_id character(2) NOT NULL,
    country_name character varying(40),
    region_id bigint
);
```

目前这个python脚本是写死的，测试功能可用。接下来还需要在postgresql中安装插件plpython3u(python3版本)，创建python语法的函数。
```sql
postgres=# CREATE EXTENSION IF NOT EXISTS plpython3u ;
CREATE EXTENSION

CREATE OR REPLACE FUNCTION gel_table_ddl(p_schema VARCHAR,p_database_name VARCHAR,p_table_name VARCHAR)
RETURNS VARCHAR
AS $$
import subprocess
import re
p_output = subprocess.check_output(["pg_dump", "–-schema-only", "--dbname="+p_database_name, "–-table="+p_table_name, "--username="+p_schema],shell=True)
regex_pat=r'(^CREATE TABLE.+?\);$)'
matches=re.findall(regex_pat, p_output.decode("utf-8"),re.DOTALL|re.MULTILINE)
ddl = matches[0]
return ddl
$$ LANGUAGE plpython3u SECURITY DEFINER;
```

执行结果如图所示


有一点要注意，在我的函数中没有提到密码，密码建议配置. pgpass来实现免密。

## 2. 使用系统函数
PostgreSQL自带了一些函数可以查看 DDL的定义，例如：
- pg_get_viewdef
- pg_get_constraintdef
- pg_get_functiondef
- pg_get_indexdef

但奇怪的是它缺少表ddl定义相关函数。

详细信息可以参考：https://www.postgresql.org/docs/current/functions-info.html

不过这问题也难不倒人。在stackoverflow
发现一个脚本，非常好用。
```sql
CREATE OR REPLACE FUNCTION tabledef(oid) RETURNS text
LANGUAGE sql STRICT AS $$
/* snatched from https://github.com/filiprem/pg-tools */
WITH attrdef AS (
    SELECT
        n.nspname,
        c.relname,
        pg_catalog.array_to_string(c.reloptions || array(select 'toast.' || x from pg_catalog.unnest(tc.reloptions) x), ', ') as relopts,
        c.relpersistence,
        a.attnum,
        a.attname,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as atttype,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid, true) for 128) FROM pg_catalog.pg_attrdef d
            WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as attdefault,
        a.attnotnull,
        (SELECT c.collname FROM pg_catalog.pg_collation c, pg_catalog.pg_type t
            WHERE c.oid = a.attcollation AND t.oid = a.atttypid AND a.attcollation <> t.typcollation) as attcollation,
        a.attidentity,
        a.attgenerated
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_catalog.pg_class tc ON (c.reltoastrelid = tc.oid)
    WHERE a.attrelid = $1
        AND a.attnum > 0
        AND NOT a.attisdropped
    ORDER BY a.attnum
),
coldef AS (
    SELECT
        attrdef.nspname,
        attrdef.relname,
        attrdef.relopts,
        attrdef.relpersistence,
        pg_catalog.format(
            '%I %s%s%s%s%s',
            attrdef.attname,
            attrdef.atttype,
            case when attrdef.attcollation is null then '' else pg_catalog.format(' COLLATE %I', attrdef.attcollation) end,
            case when attrdef.attnotnull then ' NOT NULL' else '' end,
            case when attrdef.attdefault is null then ''
                else case when attrdef.attgenerated = 's' then pg_catalog.format(' GENERATED ALWAYS AS (%s) STORED', attrdef.attdefault)
                    when attrdef.attgenerated <> '' then ' GENERATED AS NOT_IMPLEMENTED'
                    else pg_catalog.format(' DEFAULT %s', attrdef.attdefault)
                end
            end,
            case when attrdef.attidentity<>'' then pg_catalog.format(' GENERATED %s AS IDENTITY',
                    case attrdef.attidentity when 'd' then 'BY DEFAULT' when 'a' then 'ALWAYS' else 'NOT_IMPLEMENTED' end)
                else '' end
        ) as col_create_sql
    FROM attrdef
    ORDER BY attrdef.attnum
),
tabdef AS (
    SELECT
        coldef.nspname,
        coldef.relname,
        coldef.relopts,
        coldef.relpersistence,
        string_agg(coldef.col_create_sql, E',\n    ') as cols_create_sql
    FROM coldef
    GROUP BY
        coldef.nspname, coldef.relname, coldef.relopts, coldef.relpersistence
)
SELECT
    format(
        'CREATE%s TABLE %I.%I%s%s%s;',
        case tabdef.relpersistence when 't' then ' TEMP' when 'u' then ' UNLOGGED' else '' end,
        tabdef.nspname,
        tabdef.relname,
        coalesce(
            (SELECT format(E'\n    PARTITION OF %I.%I %s\n', pn.nspname, pc.relname,
                pg_get_expr(c.relpartbound, c.oid))
                FROM pg_class c JOIN pg_inherits i ON c.oid = i.inhrelid
                JOIN pg_class pc ON pc.oid = i.inhparent
                JOIN pg_namespace pn ON pn.oid = pc.relnamespace
                WHERE c.oid = $1),
            format(E' (\n    %s\n)', tabdef.cols_create_sql)
        ),
        case when tabdef.relopts <> '' then format(' WITH (%s)', tabdef.relopts) else '' end,
        coalesce(E'\nPARTITION BY '||pg_get_partkeydef($1), '')
    ) as table_create_sql
FROM tabdef
$$;
```

执行函数结果如图所示：


若要获取索引，直接使用系统自带的`pg_get_indexdef`函数。
```sql
SELECT pg_get_indexdef('jobs_pkey'::regclass);
```

## 3. 使用pgddl插件
最后来介绍的是一款插件，知道和使用它的人不多，看了一下作者写的 roadmap，还是很有动力的。我测试了一下，在PostgreSQL 13版本上也可以使用，就列出来作为一种选择。

要使用root用户安装此插件，并在安装时设置好环境变量。
```shell
export PGHOME=/data/postgresql/pgsql
export PGDATA=/data/postgresql/pgdata

[root@centos8 pgddl]# make
[root@centos8 pgddl]# make install
/usr/bin/mkdir -p '/data/postgresql/pgsql/share/extension'
/usr/bin/mkdir -p '/data/postgresql/pgsql/share/extension'
/usr/bin/install -c -m 644 .//ddlx.control '/data/postgresql/pgsql/share/extension/'
/usr/bin/install -c -m 644  ddlx--0.17.sql '/data/postgresql/pgsql/share/extension/'
```

在完成安装之后，进入PostgreSQL数据库创建扩展。
```shell
postgres=# CREATE EXTENSION ddlx;
CREATE EXTENSION
```

执行结果如图所示，像pg_dump一样，您也可以显示这个表中所有的相关信息。


如果想要单独显示其他的对象，只需输入一个名字，它会自动将该名字的ddl全部列出来。

## 4. 使用sql查询
PostgreSQL中没有像oracle一样获取表ddl的函数，下面提供两种方式获取表的ddl语句。功能比较简单仅实现普通表的ddl，如需其他类型的表或对象，还需要进行修改。

```sql
SELECT
'CREATE TABLE ' || table_name || ' (\n' ||
array_to_string(
    array_agg(
        column_name || ' ' || data_type ||
        CASE
            WHEN is_nullable = 'NO' THEN ' NOT NULL'
            ELSE ''
        END ||
        CASE
            WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
            ELSE ''
        END
    ),
    ',\n'
) || E'\n);'
FROM information_schema.columns
WHERE table_schema = 'public' -- your schema name
AND table_name = 'your_table_name' -- your table name
GROUP BY table_name;
```

直接使用SQL查询，语句如下
```sql
with t as (
select schema_name,table_name,string_agg(column_name||' '||column_type||' '||column_default_value ||' '||column_not_null||chr(10),',') as aaa from(
SELECT 
      b.nspname as schema_name,
      b.relname as table_name,
      a.attname as column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) as column_type,
      CASE WHEN 
          (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
           FROM pg_catalog.pg_attrdef d
           WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) IS NOT NULL THEN
          'DEFAULT '|| (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
                        FROM pg_catalog.pg_attrdef d
                        WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef)
      ELSE
          ''
      END as column_default_value,
      CASE WHEN a.attnotnull = true THEN 
          'NOT NULL'
      ELSE
          'NULL'
      END as column_not_null,
      a.attnum as attnum,
      e.max_attnum as max_attnum
  FROM 
      pg_catalog.pg_attribute a
      INNER JOIN 
       (SELECT c.oid,
          n.nspname,
          c.relname
        FROM pg_catalog.pg_class c
             LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname ~ ('^('||'修改为要获取的表名'||')$')
          AND pg_catalog.pg_table_is_visible(c.oid)
        ORDER BY 2, 3) b
      ON a.attrelid = b.oid
      INNER JOIN 
       (SELECT 
            a.attrelid,
            max(a.attnum) as max_attnum
        FROM pg_catalog.pg_attribute a
        WHERE a.attnum > 0 
          AND NOT a.attisdropped
        GROUP BY a.attrelid) e
      ON a.attrelid=e.attrelid
  WHERE a.attnum > 0 
    AND NOT a.attisdropped
  ORDER BY a.attnum) as f
GROUP by schema_name,table_name)
select 'create table '||schema_name||'.'||table_name||' ('||aaa||')' from t;
```

效果
```sql
                 ?column?                        
-------------------------------------------------------
 create table public.emp (empno numeric(4,0)  NOT NULL+
 ,ename character varying  NULL                       +
 ,job character varying  NULL                         +
 ,mgr numeric(4,0)  NULL                              +
 ,hiredate date  NULL                                 +
 ,sal numeric(7,2)  NULL                              +
 ,comm numeric(7,2)  NULL                             +
 ,deptno numeric(2,0)  NULL                           +
 )
(1 row)
```

改写为存储过程
```sql
create or replace function get_tab_ddl(tab_name varchar)
returns text as 
$$
declare 
    --定义变量
    tab_ddl text;
    curs refcursor;
    tmp_col record;
    tab_info record;
begin  
    --获取表的pid、schema信息
    open curs for SELECT c.oid,n.nspname,c.relname FROM pg_catalog.pg_class c
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname ~ ('^('||tab_name||')$')AND pg_catalog.pg_table_is_visible(c.oid) ORDER BY 2,3;
    fetch curs into tmp_col;
    --判断是否存在该表
    if tmp_col.oid is null then
        return 'Table "'||tab_name||'" was not queried';
    end if;
    --如表存在，获取表的列信息
    FOR tab_info IN 
        SELECT 
            a.attname as col_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) as col_type,
            CASE WHEN 
                (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
                 FROM pg_catalog.pg_attrdef d
                 WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) IS NOT NULL THEN
                'DEFAULT '|| (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
                              FROM pg_catalog.pg_attrdef d
                              WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef)
            ELSE
                ''
            END as col_default_value,
            CASE WHEN a.attnotnull = true THEN 
                'NOT NULL'
            ELSE
                'NULL'
            END as col_not_null,
            a.attnum as attnum,
            e.max_attnum as max_attnum
        FROM 
            pg_catalog.pg_attribute a
            INNER JOIN 
             (SELECT 
                  a.attrelid,
                  max(a.attnum) as max_attnum
              FROM pg_catalog.pg_attribute a
              WHERE a.attnum > 0 
                AND NOT a.attisdropped
              GROUP BY a.attrelid) e
            ON a.attrelid=e.attrelid
        WHERE a.attnum > 0 
          AND a.attrelid=tmp_col.oid
          AND NOT a.attisdropped
        ORDER BY a.attnum
    --拼接为ddl语句
    LOOP
        IF tab_info.attnum = 1 THEN
            tab_ddl:='CREATE TABLE '||tmp_col.nspname||'.'||tmp_col.relname||' (';
        ELSE
            tab_ddl:=tab_ddl||',';
        END IF;

        IF tab_info.attnum <= tab_info.max_attnum THEN
            tab_ddl:=tab_ddl||chr(10)||'    '||tab_info.col_name||' '||tab_info.col_type||' '||tab_info.col_default_value||' '||tab_info.col_not_null;
        END IF;
    END LOOP;
       tab_ddl:=tab_ddl||');';
    --输出结果
    RETURN tab_ddl;
end;
$$ language plpgsql;
```

效果
```sql
highgo=# select get_tab_ddl('emp');
            get_tab_ddl             
------------------------------------
 CREATE TABLE public.emp (         +
     empno numeric(4,0)  NOT NULL, +
     ename character varying  NULL,+
     job character varying  NULL,  +
     mgr numeric(4,0)  NULL,       +
     hiredate date  NULL,          +
     sal numeric(7,2)  NULL,       +
     comm numeric(7,2)  NULL,      +
     deptno numeric(2,0)  NULL);
(1 row)
```

## 参考链接
1. https://stackoverflow.com/questions/1846542/postgresql-get-table-definition-pg-get-tabledef
2. https://github.com/lacanoid/pgddl
3. https://proboscid.wordpress.com/2013/09/06/extracting-create-table-ddl-from-postgresql/
4. https://www.postgresql.org/docs/current/functions-info.html
5. https://www.modb.pro/db/52345
6. https://www.modb.pro/db/48196