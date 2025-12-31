-- 蟹卡提货管理系统 - 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS pickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE pickup_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    real_name VARCHAR(50),
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1,
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建蟹卡表
CREATE TABLE IF NOT EXISTS crab_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    card_no VARCHAR(50) UNIQUE NOT NULL,
    card_password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
    product_name VARCHAR(200) COMMENT '对应商品名称',
    product_specification VARCHAR(200) COMMENT '商品规格',
    status ENUM('unused', 'used', 'cancelled') NOT NULL DEFAULT 'unused',
    used_at DATETIME,
    cancelled_at DATETIME,
    cancelled_reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_card_no (card_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建提货记录表
CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    card_id BIGINT NOT NULL,
    card_no VARCHAR(50) NOT NULL COMMENT '蟹卡编号（快照）',
    delivery_date DATE NOT NULL COMMENT '提货日期',
    shipping_address VARCHAR(255) NOT NULL,
    shipping_contact VARCHAR(50) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL COMMENT '已验证的手机号',
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    status ENUM('pending', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    remark TEXT,
    shipped_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_card_id (card_id),
    INDEX idx_status (status),
    INDEX idx_delivery_date (delivery_date),
    FOREIGN KEY (card_id) REFERENCES crab_cards(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建短信验证码表
CREATE TABLE IF NOT EXISTS sms_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT '验证码类型',
    used TINYINT DEFAULT 0 COMMENT '是否已使用',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_code (phone, code, used),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建数据库用户（如果不存在）
-- 注意：需要 root 权限执行
CREATE USER IF NOT EXISTS 'pickup_db'@'localhost' IDENTIFIED BY 'pickup_db';
GRANT ALL PRIVILEGES ON pickup_db.* TO 'pickup_db'@'localhost';
FLUSH PRIVILEGES;

-- 显示创建结果
SELECT 'Database and tables created successfully!' AS message;
SHOW TABLES;

