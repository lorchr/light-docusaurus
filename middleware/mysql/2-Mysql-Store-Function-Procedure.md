## 创建存储函数
```sql
use uap;

-- ----------------------------
-- Table structure for `sequence`
-- ----------------------------
DROP TABLE IF EXISTS sequence;
CREATE TABLE sequence (
	seq_name VARCHAR(50) NOT NULL COMMENT '主键' ,
	current_val INT NOT NULL COMMENT '当前值' ,
    increment_val INT NOT NULL COMMENT '步长',
    note VARCHAR(200)  COMMENT '备注',
    PRIMARY KEY (seq_name)
) COMMENT '自增队列';

-- ----------------------------
-- Records of sequence
-- ----------------------------
INSERT INTO sequence (seq_name, current_val, increment_val) VALUES
('uap-a-pk', 1, 1),
('uap-b-pk', 1, 3),
('uap-c-pk', 1, 5);

select * from sequence;

-- ----------------------------
-- Function structure for `nextval`
-- ----------------------------
-- 删除已有的存储函数
DROP FUNCTION IF EXISTS `nextval`;  
-- 分隔符
DELIMITER ;;
-- 创建存储函数 
-- DEFINER 生命创建者和作用范围，可省略
-- nextval-函数名 
-- v_seq_name-形参，类型默认为INT
CREATE DEFINER=`zjft`@`%` FUNCTION `nextval`(v_seq_name VARCHAR(50)) 
-- 定义返回值类型
RETURNS int(11)
-- 声明确定性
DETERMINISTIC
-- 开始书写函数体
BEGIN
-- 逻辑语句
	UPDATE sequence set current_val = current_val + increment_val where seq_name = v_seq_name;
-- 返回值，调用了currval函数
	return currval(v_seq_name);
-- 结束书写函数体
END
;;
DELIMITER ;

-- ----------------------------
-- Function structure for `currval`
-- ----------------------------
DROP FUNCTION IF EXISTS `currval`;
DELIMITER ;;
CREATE DEFINER=`zjft`@`%` FUNCTION `currval`(v_seq_name VARCHAR(50)) RETURNS int(11)
DETERMINISTIC
BEGIN
	return (select current_val from sequence where seq_name = v_seq_name);
END
;;
DELIMITER ;

-- 函数调用
select nextval('uap-a-pk');
```

## 创建存储过程
```sql

```