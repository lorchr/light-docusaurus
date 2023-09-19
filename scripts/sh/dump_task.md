
## 数据备份定时任务
```shell
# 查看定时任务定义规则 cron表达式规则
cat /etc/crontab

# 添加执行权限
chmod +x /home/postgres/backup/scripts/dump_pgsql.sh

# 添加定时任务
crontab -e

# 每天凌晨2点执行备份脚本
0 2 * * * /bin/bash /home/postgres/backup/scripts/dump_pgsql.sh

# 查看定时任务
crontab -l
```
