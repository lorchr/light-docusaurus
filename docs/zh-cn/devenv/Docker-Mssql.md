- [Mssql Offical](https://www.microsoft.com/zh-cn/sql-server)
- [Mssql Offical Document](https://www.microsoft.com/zh-cn/sql-server/community)
- [Mssql Offical Docker](https://learn.microsoft.com/zh-cn/sql/linux/quickstart-install-connect-docker)
- [Mssql Docker](https://hub.docker.com/_/microsoft-mssql-server)

## 1. Docker安装Mssql

```shell
# 创建网络
docker network create --driver bridge dev

# 创建文件夹
mkdir -p //d/docker/mssql/data
mkdir -p //d/docker/mssql/conf
mkdir -p //d/docker/mssql/log
mkdir -p //d/docker/mssql/secrets
touch //d/docker/mssql/log/errorlog

# 拉取镜像
docker pull mcr.microsoft.com/mssql/server:2019-CU23-ubuntu-20.04

# 运行容器
docker run -d \
  --publish 1433:1433 \
  --volume //d/docker/mssql/data:/var/opt/mssql/data \
  --volume //d/docker/mssql/log:/var/opt/mssql/log \
  --volume //d/docker/mssql/secrets:/var/opt/mssql/secrets \
  --env ACCEPT_EULA=Y \
  --env MSSQL_SA_PASSWORD=Admin123 \
  --env MSSQL_PID=Developer \
  --env MSSQL_COLLATION=SQL_Latin1_General_CP1_CI_AS \
  --env TZ=Asia/Shanghai \
  --net dev \
  --restart=on-failure:3 \
  --name mssql \
  mcr.microsoft.com/mssql/server:2019-CU23-ubuntu-20.04

# 进入容器
docker exec -it -u root mssql /bin/bash

# 登录mssql
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "Admin123"
```

## 配置及初始化
- [创建 SQL Server 容器要使用的 config 文件](https://learn.microsoft.com/zh-cn/sql/linux/sql-server-linux-containers-ad-auth-adutil-tutorial?view=sql-server-ver15#create-the-config-files-to-be-used-by-the-sql-server-container)
- [排序规则和 Unicode 支持-MSSQL_COLLATION](https://learn.microsoft.com/zh-cn/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver16)
```shell
# 修改SA密码
sudo docker exec -it mssql /opt/mssql-tools/bin/sqlcmd \
-S localhost -U SA \
 -P "$(read -sp "Enter current SA password: "; echo "${REPLY}")" \
 -Q "ALTER LOGIN SA WITH PASSWORD=\"$(read -sp "Enter new SA password: "; echo "${REPLY}")\""

# 设置语言为简体中文
/opt/mssql/bin/mssql-conf set language.lcid 2052

# 导入初始化sql脚本
/opt/mssql-tools/bin/sqlcmd -S 127.0.0.1 -U SA -P "Admin123" -d "light" -i "/home/mssql/schema.sql" -o /home/mssql/initsql.log

# 命令行登录
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "Admin123"

# 查询mssql版本
SELECT @@Version

# 执行前面的命令
GO

# 退出SQL命令行
QUIT
```

## 常用操作
### 数据库操作
```sql
-- 创建数据库
CREATE DATABASE light;

-- 查询数据库
SELECT Name FROM sys.databases;

-- 切换数据库
USE light;

-- 查询主机名
SELECT @@SERVERNAME, 
        SERVERPROPERTY('ComputerNamePhysicalNetBIOS'), 
        SERVERPROPERTY('MachineName'), 
        SERVERPROPERTY('ServerName');

-- 执行前面的命令
GO
```
