#!/bin/bash
set -x
#定义变量
base_dir="/opt/apps"
user_name="postgresql"
port="5432"
appuser_name="pguser"
appuser_password="pguser123456"
appdb_name="pgdb"
repuser_name="repuser"
repuser_password="repuser123456"
default_python_version=$(python --version 2>&1 | cut -d' ' -f2 | cut -d. -f1)
if [ "$default_python_version" -eq "2" ]; then
    appuser_password_encoded=$(python -c "import urllib; print(urllib.quote('$appuser_password'))")
elif [ "$default_python_version" -eq "3" ]; then
    appuser_password_encoded=$(python -c "import urllib.parse; print(urllib.parse.quote('$appuser_password'))")
else
    echo "无法识别的 Python 版本"
fi
# 获取OS版本信息
os_version=$(cat /etc/redhat-release | grep -oP '\d+' | head -1)
#获取Ip
host_ip=$(python -c "import socket;print([(s.connect(('8.8.8.8', 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1])")
#操作系统初始化
function os_init(){
# 获取 firewalld 的详细状态信息
systemctl stop firewalld
systemctl disable firewalld
# 获取当前 SELinux 状态
selinux_status=$(getenforce)
# 判断 SELinux 状态并执行相应操作
if [ "$selinux_status" == "Disabled" ]; then
    echo "当前 SELinux 状态为 disabled"
elif [ "$selinux_status" == "Enforcing" ]; then
    setenforce 0
    sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/selinux/config
    echo "SELinux 已禁用并配置为 disabled"
elif [ "$selinux_status" == "Permissive" ]; then
    sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/selinux/config
    echo "SELinux 已配置为 disabled"
else
    echo "未知的 SELinux 状态: $selinux_status"
fi

# 检查 limits.conf 文件是否包含所需配置
if grep -q "^\*\s*soft\s*nofile\s*65536" /etc/security/limits.conf && \
   grep -q "^\*\s*hard\s*nofile\s*65536" /etc/security/limits.conf && \
   grep -q "^\*\s*soft\s*nproc\s*65536" /etc/security/limits.conf && \
   grep -q "^\*\s*hard\s*nproc\s*65536" /etc/security/limits.conf; then
    echo "文件描述符限制已优化"
else
    # 执行配置命令
    echo "* soft nofile 65536" >> /etc/security/limits.conf
    echo "* hard nofile 65536" >> /etc/security/limits.conf
    echo "* soft nproc 65536" >> /etc/security/limits.conf
    echo "* hard nproc 65536" >> /etc/security/limits.conf
    echo "文件描述符限制已优化"
fi

# 检查 systemd 配置文件是否包含所需配置
if grep -q "^\s*DefaultLimitNOFILE=1000000" /etc/systemd/system.conf && \
   grep -q "^\s*DefaultLimitNPROC=65535" /etc/systemd/system.conf; then
    echo "Systemd 文件描述符和进程数限制已优化"
else
    # 执行配置命令
    cat >> /etc/systemd/system.conf << EOF
DefaultLimitNOFILE=1000000
DefaultLimitNPROC=65535
EOF
    systemctl daemon-reexec
    echo "Systemd 文件描述符和进程数限制已优化"
fi
#创建用户
if id "$user_name" &>/dev/null; then
    echo "User $user_name already exists."
else
    # 如果用户不存在，则创建用户
    useradd "$user_name"
    echo "User $user_name created successfully."
fi
#创建pg目录
mkdir -p $base_dir/$user_name/data
mkdir -p $base_dir/$user_name/run
mkdir -p $base_dir/$user_name/archive
mkdir -p $base_dir/$user_name/backup
mkdir -p $base_dir/$user_name/scripts
#更改目录权限
chown -R $user_name:$user_name $base_dir/$user_name
}
function pg_install(){
# 判断操作系统版本号，安装postgresql15-server
if [ "$os_version" == "7" ]; then
    cat /etc/redhat-release
    #配置epel源
    curl -o /etc/yum.repos.d/epel.repo https://mirrors.aliyun.com/repo/epel-7.repo
    #增加postgresql源
    cat > /etc/yum.repos.d/postgresql.repo << EOF
[postgresql]
name=postgresql
baseurl=https://download.postgresql.org/pub/repos/yum/15/redhat/rhel-7.9-x86_64/
enabled=1
gpgcheck=0
EOF
    #安装依赖包
    rpm -ivh https://download-ib01.fedoraproject.org/pub/epel/7/x86_64/Packages/l/libzstd-1.5.5-1.el7.x86_64.rpm
    #安装postgresql15-server
    yum install postgresql15-server postgresql15-contrib -y
elif [ "$os_version" == "9" ]; then
    cat /etc/redhat-release
    #增加postgresql源
    cat > /etc/yum.repos.d/postgresql.repo << EOF
[postgresql]
name=http
baseurl=https://download.postgresql.org/pub/repos/yum/15/redhat/rhel-9.3-x86_64/
enabled=1
gpgcheck=0
EOF
    #安装postgresql15-server
    yum install postgresql15-server postgresql15-contrib -y
else
    echo "This script is intended to run on CentOS 7."
fi
}
function pg_init(){
#initdb
su - $user_name -c "/usr/pgsql-15/bin/initdb --username=$user_name --encoding=UTF8 --lc-collate=C --lc-ctype=en_US.utf8  --data-checksums -D $base_dir/$user_name/data"
#配置pg_hba.conf文件
cat >> $base_dir/$user_name/data/pg_hba.conf << EOF
host    replication     $repuser_name   0.0.0.0/0               md5
host    all             all             0.0.0.0/0               md5
EOF
#配置postgresql.conf
cat > $base_dir/$user_name/data/postgresql.conf << EOF
# basic
listen_addresses='0.0.0.0'
port=$port                                                  # 端口
unix_socket_directories='$base_dir/$user_name/run'          # socket目录
max_connections = 9999                                      # 最大连接数
superuser_reserved_connections = 10                         # 给超级用户预留的连接数
shared_buffers = 1GB                                        # 共享内存，一般设置为内存的1/4
effective_cache_size = 2GB                                  # 查询优化器估计的可用于缓存数据文件系统的总内存量,一般设置为内存的1/2
max_worker_processes = 48                                   # 最大工作线程，和cpu核数一致
max_parallel_workers_per_gather = 4                         # 单个查询在执行过程中可以使用的最大并行工作进程数，CPU核心数的1/12
max_parallel_workers = 24                                   # 整个数据库实例允许的最大并行进程数，CPU核心数的1/2到2/3之间
max_parallel_maintenance_workers = 6                        # 维护操作期间允许的最大并行进程数，CPU核心数的1/8
work_mem = 16MB                                             # 设置在写入临时磁盘文件之前查询操作(例如排序或哈希表)可使用的最大内存容量
maintenance_work_mem = 256MB                                # 在维护性操作（例如VACUUM、CREATE INDEX和ALTER TABLE ADD FOREIGN KEY）中使用的 最大的内存量
timezone = 'Asia/Shanghai'                                  # 系统时区
hot_standby = on                                            # 打开热备
# optimizer                                                 
default_statistics_target = 500                             # 默认100，ANALYZE在pg_statistic中存储的信息量，增大该值，会增加ANALYZE的时间，但会让解释计划更精准
# wal                                                       
max_wal_size = 1GB                                          # 建议与shared_buffers保持一致
min_wal_size = 80MB                                         # 建议max_wal_size/12.5
wal_log_hints = on                                          # 控制WAL日志记录的方式，建议打开
wal_level = replica                                         # wal日志写入级别，要使用流复制，必须使用replica或更高级别
wal_sender_timeout = 60s                                    # 设置WAL发送者在发送WAL数据时等待主服务器响应的超时时间
# archive                                                   
archive_mode = on                                           # 开启归档日志
archive_command = 'gzip < %p > $base_dir/$user_name/archive/%f.gz'
# log 近7天轮询
log_destination = 'stderr'                                  # 日志格式
logging_collector = on                                      # 日志收集器
log_directory = 'pg_log'                                    # 日志目录 $PGDATA/pg_log
log_filename = 'postgresql-%Y-%m-%d.log'                    # 日志名称格式
log_rotation_age = 43200                                    # 日志保留时间单位是分钟  
log_file_mode = 0600                                        # 日志文件的权限
log_rotation_size = 0                                       # 日志的最大尺寸，设置为零时将禁用基于大小创建新的日志文件
log_truncate_on_rotation = on                               # 这个参数将导致PostgreSQL截断（覆盖而不是追加）任何已有的同名日志文件
log_min_duration_statement = 0                              # 如果语句运行至少指定的时间量，将导致记录每一个这种完成的语句的持续时间
log_duration = on                                           # 每一个完成的语句的持续时间被记录
log_lock_waits = on                                         # 控制当一个会话为获得一个锁等到超过deadlock_timeout时，是否要产生一个日志消息
log_statement = 'mod'                                       # 控制哪些 SQL 语句被记录。有效值是 none (off)、ddl、mod和 all（所有语句）。ddl记录所有数据定义语句，例如CREATE、ALTER和 DROP语句。mod记录所有ddl语句，外加数据修改语句例如INSERT, UPDATE、DELETE、TRUNCATE, 和COPY FROM
log_timezone = 'Asia/Shanghai'                              # 设置在服务器日志中写入的时间戳的时区
# sql                                                       
statement_timeout = 300000                                  # 语句执行超时时间 5分钟
idle_in_transaction_session_timeout = 300000                # 事务空闲超时时间 5分钟
idle_session_timeout = 1800000                              # 会话空闲超时时间 30分钟
lock_timeout = 60000                                        # 等锁超时时间 1分钟
EOF
}
#启动和开机自启动
function sh_init(){
#启动服务
su - $user_name -c "/usr/pgsql-15/bin/pg_ctl -D $base_dir/$user_name/data -l $base_dir/$user_name/pg.log start"
#配置开机自启动
chmod +x /etc/rc.d/rc.local
cat >> /etc/rc.d/rc.local << EOF
su - $user_name -c "/usr/pgsql-15/bin/pg_ctl -D $base_dir/$user_name/data -l $base_dir/$user_name/pg.log start"
EOF
#创建启动、停止、重启脚本
cat > $base_dir/$user_name/start.sh << EOF
#!/bin/bash
su - $user_name -c "/usr/pgsql-15/bin/pg_ctl -D $base_dir/$user_name/data -l $base_dir/$user_name/pg.log start"
EOF
cat > $base_dir/$user_name/stop.sh << EOF
#!/bin/bash
su - $user_name -c "/usr/pgsql-15/bin/pg_ctl -D $base_dir/$user_name/data -l $base_dir/$user_name/pg.log stop"
EOF
cat > $base_dir/$user_name/restart.sh << EOF
#!/bin/bash
su - $user_name -c "/usr/pgsql-15/bin/pg_ctl -D $base_dir/$user_name/data -l $base_dir/$user_name/pg.log restart"
EOF
#创建备份脚本
cat > $base_dir/$user_name/scripts/backup.sh << EOF
#!/bin/bash
set -ex
cmd="/usr/bin/pg_dump -Fc -v --dbname=postgresql://$appuser_name:$appuser_password_encoded@$host_ip:$port/$appdb_name -f $base_dir/$user_name/backup/$appdb_name-\$(date +%Y-%m-%d).dmp"
\$cmd
find $backup_dir -name "*.dmp" -mtime +30 -exec rm -f {} \;
EOF
#添加定时任务脚本
cat > $base_dir/$user_name/scripts/crontab.sh << EOF
#!/bin/bash
# 检查是否存在 crontab，如果不存在，创建一个空的 crontab
if [ -z "$(crontab -l)" ]; then
    echo "" | crontab -
fi
(crontab -l ; echo "0 23 * * * sh $base_dir/$user_name/scripts/backup.sh > $base_dir/$user_name/backup/backup.log 2>&1")|crontab -
EOF
chmod +x $base_dir/$user_name/scripts/crontab.sh
/bin/sh $base_dir/$user_name/scripts/crontab.sh
#创建恢复脚本
cat > $base_dir/$user_name/scripts/pg_restore.sh << EOF
#!/bin/bash
pg_restore -v --dbname=postgresql://$appuser_name:$appuser_password_encoded@$host_ip:$port/$appdb_name $base_dir/$user_name/backup/$appdb_name.dmp
EOF
#创建psql命令示例
cat > $base_dir/$user_name/scripts/psql.txt << EOF
/usr/pgsql-15/bin/psql -h $base_dir/$user_name/run -p $port -U $user_name -d postgres
EOF
}
function db_init(){
#创建init.sql文件
cat > $base_dir/$user_name/scripts/init.sql << EOF
create USER $repuser_name with login replication encrypted password '$repuser_password';
-- 创建数据库
CREATE DATABASE $appdb_name;
-- 连接到新创建的数据库
\c $appdb_name;
-- 创建用户
CREATE USER $appuser_name WITH PASSWORD '$appuser_password';
-- 赋予用户所有权限
GRANT ALL PRIVILEGES ON DATABASE $appdb_name TO $appuser_name;
-- 将 appdb 的所有权（OWNER）设置为 $appuser_name
ALTER DATABASE $appdb_name OWNER TO $appuser_name;
EOF
#创建drop.sql
cat > $base_dir/$user_name/scripts/drop.sql << EOF
drop database $appdb_name;
drop user $appuser_name;
EOF
#执行sql
/usr/pgsql-15/bin/psql -h $base_dir/$user_name/run -p $port -U $user_name -d postgres -f $base_dir/$user_name/scripts/init.sql
}
#初始化方法
function init(){
    os_init;
    pg_install;
    pg_init;
    sh_init;
    db_init;
}
init


# https://blog.csdn.net/sdhzdtwhm/article/details/135844325