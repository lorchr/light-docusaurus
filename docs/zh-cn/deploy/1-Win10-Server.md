# 环境准备
## pgsql安装
- [PgSql安装](https://www.jb51.net/article/114332.htm)
1. 解压压缩包 `postgresql-12.14-2-windows-x64-binaries.zip`
2. 在`pgsql`目录下新建一个`data`文件夹 
3. 配置环境变量
```vbs env.vbs
on error resume next
set sysenv=CreateObject("WScript.Shell").Environment("system") 'system environment array
Path = CreateObject("Scripting.FileSystemObject").GetFolder(".").Path 'add variable
sysenv("PGHOME")="D:\pgsql"
sysenv("PGHOST")="localhost"
sysenv("Path")=sysenv("PGHOME")+"\bin;"+sysenv("Path")
sysenv("PGLIB")=sysenv("PGHOME")+"\lib"
sysenv("PGDATA")=sysenv("PGHOME")+"\data"
 
wscript.echo "PostgreSQL Success"
```

4. 执行初始化 `pgsql/bin/initdb.exe`
```
initdb.exe -D D:\pgsql\data -E UTF-8 --locale=chs -U postgres -W

-D 指定数据库簇的存储目录
-E 指定字符集为 UTF-8
--locale 关于区域设置 chinese-simplified-china
-U 默认用户 postgres
-W 默认用户密码
```

## 常用命令

1. 初始化数据库
```
initdb.exe -D D:\pgsql\data -E UTF-8 --locale=chs -U postgres -W

```
初始化完成后，会在 data 目录下生成配置文件 postgresql.conf，可以修改运行的端口

2. 启动服务
```
pg_ctl start -w -D "D:\pgsql\data" -l "D:\pgsql\log\pgsql.log"

-w 等待直到操作完成
-D 数据目录
-l 日志文件的位置
``` 

3. 命令行登录pgsql
```
psql -p 5433 -U postgres -W
```

```sql
-- 查看版本
select version();

-- 查看用户名密码
select * from pg_authid;

-- 获取所有数据库信息
select * from pg_database order by datname;

-- 获取当前db中所有的表信息(pg_tables 是系统视图)
select * from pg_tables order by schemaname;

-- 每一行表示一个进程，显示当前连接的会话的活动进程的信息
select * from pg_stat_activity;

-- 获取数据表名称类型及注释
select a.attname "字段名称",
       concat_ws(' ', t.typname, substring(format_type(a.atttypid, a.atttypmod) from '\(.*\)' )) "字段类型",
       d.description "字段注释"
from pg_class c, pg_attribute a, pg_type t, pg_description d
where c.relname = 'tab_name'
  and a.attnum > 0
  and a.attrelid = c.oid
  and a.atttypid = t.oid
  and d.objoid = a.attrelid
  and d.objsubid = a.attnum
```

4. 注册为服务
```
pg_ctl --help
pg_ctl register -N PostgreSQL -D "D:\pgsql\data"
```

services.msc

5. 启动服务
```
net start PostgreSQL
```

6. 停止服务
```
net stop PostgreSQL
```

7. 删除PostgreSQL服务
```
pg_ctl unregister -N PostgreSQL
```

5. 创建用户postgres,密码同样是postgres:
```
net user postgres postgres /add
```

6. 创建PostgreSQL用户和它要找的那个相符
```
createuser --superuser postgres
```

7. 查看系统用户
```
net user
```


## 运行脚本
- [](https://www.cnblogs.com/dbei/p/13629742.html)
- [](https://blog.csdn.net/nandao158/article/details/129333601)
```bat
@echo off
@rem 创建win环境脚本
%1 mshta vbscript:CreateObject("WScript.Shell").Run("%~s0 ::", 0, FALSE)
@rem 关闭黑窗口
(window.close) && exit
@rem 运行java jar 并将日志输出到 console.log中
java -Xss128k -Xms1g -Xmx1g -jar yunyi-quality-1.0-SNAPSHOT.jar --spring.profiles.active=dev >console.log 2>&1 &
@rem 退出
exit
```


## 停止脚本
- [](https://codeleading.com/article/58065096861/)
```bat
@echo off
rem 设置监听的端口号
set port=33333
echo port : %port%
 
for /f "usebackq tokens=1-5" %%a in (`netstat -ano ^| findstr %port%`) do (
	if [%%d] EQU [LISTENING] (
		set pid=%%e
	)
)
 
for /f "usebackq tokens=1-5" %%a in (`tasklist ^| findstr %pid%`) do (
	set image_name=%%a
)
 
echo now will kill process : pid %pid%, image_name %image_name%
pause
rem 根据进程ID，kill进程
taskkill /f /pid %pid%
pause
```


脚本源码
-[](https://blog.csdn.net/qq_43290318/article/details/126437411)
```bat
@echo off & setlocal EnableDelayedExpansion
CHCP 65001
CLS
echo 请输入程序正在运行的端口号
set /p port=
echo 找到的进程记录
echo =================================================================================
netstat -nao|findstr !port!
echo =================================================================================
echo 回车进行逐个确认
pause
for /f "tokens=2,5" %%i in ('netstat -nao^|findstr :%%port%%') do (
::if "!processed[%%j]!" == "" (
if not defined processed[%%j] (
set pname=N/A
for /f "tokens=1" %%p in ('tasklist^|findstr %%j') do (set pname=%%p)
echo %%i	%%j	!pname!
echo 输入Y确认Kill，否则跳过，可回车跳过
set flag=N/A
set /p flag=
if "!flag!" == "Y" (
taskkill /pid %%j -t -f
) else (
echo 已跳过
)
set processed[%%j]=1
)
)
echo 程序结束
pause
```



https://blog.csdn.net/u014641168/article/details/125115035
