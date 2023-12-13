
# Mysql 语法

## 数据库操作


## 数据表操作

## 批量生成数据
1. 创建数据表

```sql
CREATE TABLE `user_operation_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ip` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `operation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr4` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr5` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr6` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr7` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr8` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr9` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr10` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr11` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attr12` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;
```

2. 创建存储过程

```sql
DELIMITER // -- 定义存储过程的结束符号为 //
CREATE PROCEDURE batch_insert_log()

COMMENT 'This is comment of PROCEDURE'  -- 注释信息
SQL SECURITY DEFINER                    -- 默认配置，定义只有SQL的创建人可以执行

BEGIN
  DECLARE idx INT DEFAULT 1;
  DECLARE userId INT DEFAULT 10000000;
  SET @execSql = 'INSERT INTO `user_operation_log`(`user_id`, `ip`, `operation`, `attr1`, `attr2`, `attr3`, `attr4`, `attr5`, `attr6`, `attr7`, `attr8`, `attr9`, `attr10`, `attr11`, `attr12`) VALUES';
  SET @execData = '';
  WHILE idx <= 10000000 DO
    SET @attr = "'测试很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的属性'";
    SET @execData = concat(@execData, "(", userId + idx, ", '10.0.69.175', '用户登录'", ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ",", @attr, ")");
    
    IF idx % 1000 = 0 THEN
      SET @stmtSql = concat(@execSql, @execData,";");
      PREPARE stmt FROM @stmtSql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
      COMMIT;
      SET @execData = "";
    ELSE
      SET @execData = concat(@execData, ",");
    END IF;
    SET idx=idx+1;
  END WHILE;

END //                                  -- 存储过程结束符，表示存储过程定义结束
DELIMITER ;                             -- 重定义存储过程的结束符号为 ;
```

3. 调用存储过程

```sql
-- 查询存储过程
SHOW PROCEDURE STATUS LIKE 'batch%';

--执行存储过程
CALL batch_insert_log;
```
