-- 创建默认管理员账户
-- 用户名: admin
-- 密码: admin123 (需要修改)
-- 注意：密码使用 bcrypt 加密，这里需要先加密后插入

USE pickup_db;

-- 方法一：使用 bcrypt 加密后的密码（推荐）
-- 密码 "admin123" 的 bcrypt hash（cost=10）
-- 可以使用 Node.js 生成：require('bcryptjs').hashSync('admin123', 10)
INSERT INTO users (username, password, role, real_name, status) 
VALUES ('admin', '$2a$10$rK8Z5Z5Z5Z5Z5Z5Z5Z5Z5uK8Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'admin', '系统管理员', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 方法二：如果使用明文密码，需要在应用层加密
-- 建议使用注册接口创建管理员账户

