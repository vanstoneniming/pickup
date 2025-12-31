-- 修复 users 表结构（简化版）
-- 如果字段已存在会报错，可以忽略

USE pickup_db;

-- 添加 avatar 字段
ALTER TABLE users 
ADD COLUMN avatar VARCHAR(255) COMMENT '头像URL' AFTER real_name;

-- 添加 last_login_at 字段
ALTER TABLE users 
ADD COLUMN last_login_at DATETIME COMMENT '最后登录时间' AFTER status;

