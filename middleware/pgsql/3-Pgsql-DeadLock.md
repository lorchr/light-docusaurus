
## 查询死锁
```sql
-- 查询正在执行的sql
SELECT * FROM pg_catalog.pg_stat_activity ;

-- 查询死锁
SELECT * FROM pg_catalog.pg_stat_activity 
WHERE datname = 'vcloud'
AND wait_event_type = 'Lock';

-- 查询表锁
SELECT * FROM pg_catalog.pg_locks 
WHERE relation = (
    SELECT oid FROM pg_catalog.pg_class WHERE relname = 'table_name'
);

-- 取消后台操作，回滚未提交事务
SELECT * FROM pg_cancel_backend(pid);

-- 中断session，回滚未提交事务 pg_stat_activity 中 state字段值为idle in transaction的，可以用此sql中断函数解锁
SELECT pg_terminate_backend(pid);

-- 查询阻塞的sql
SELECT 
    psa.*,
    pl.locktype,
    pl.database,
    pl.pid,
    pl.mode,
    pl.relation,
    pc.relname
FROM
    pg_catalog.pg_stat_activity psa,
    pg_catalog.pg_locks pl,
    pg_catalog.pg_class pc
WHERE
    psa.pid = pl.pid
    AND psa.waiting = 't'
    AND pl.relation = pc.oid
    AND UPPER(pc.relname) = 'AS_ASSETS_EXT';
```
