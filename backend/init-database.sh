#!/bin/bash

# 蟹卡提货管理系统 - 数据库初始化脚本

echo "=========================================="
echo "蟹卡提货管理系统 - 数据库初始化"
echo "=========================================="
echo ""

# 检查 MySQL 是否安装
if ! command -v mysql &> /dev/null; then
    echo "❌ 错误: 未找到 MySQL 命令"
    echo "请先安装 MySQL: brew install mysql"
    exit 1
fi

# 提示输入 root 密码
echo "请输入 MySQL root 用户密码:"
read -s ROOT_PASSWORD

# 测试连接
echo ""
echo "正在测试 MySQL 连接..."
if ! mysql -u root -p"$ROOT_PASSWORD" -e "SELECT 1" &> /dev/null; then
    echo "❌ 错误: 无法连接到 MySQL"
    echo "请检查:"
    echo "  1. MySQL 服务是否运行: brew services start mysql"
    echo "  2. root 密码是否正确"
    echo "  3. 如果忘记密码，请参考: docs/MySQL密码重置指南.md"
    exit 1
fi

echo "✅ MySQL 连接成功"
echo ""

# 执行初始化脚本
echo "正在创建数据库和表..."
if mysql -u root -p"$ROOT_PASSWORD" < init-database.sql; then
    echo ""
    echo "✅ 数据库初始化成功！"
    echo ""
    echo "数据库信息:"
    echo "  数据库名: pickup_db"
    echo "  用户名: pickup_db"
    echo "  密码: pickup_db"
    echo ""
    echo "可以在 .env 文件中使用这些配置。"
else
    echo ""
    echo "❌ 数据库初始化失败"
    exit 1
fi

