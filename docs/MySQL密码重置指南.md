# macOS MySQL 密码重置指南

## 方法一：使用 --skip-grant-tables（推荐）

### 步骤 1：停止 MySQL 服务

```bash
# 如果使用 Homebrew 安装
brew services stop mysql

# 或者使用系统服务
sudo /usr/local/mysql/support-files/mysql.server stop
```

### 步骤 2：以安全模式启动 MySQL

```bash
# 使用 skip-grant-tables 启动 MySQL（跳过权限验证）
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

### 步骤 3：连接 MySQL（无需密码）

```bash
mysql -u root
```

### 步骤 4：重置密码

在 MySQL 命令行中执行：

```sql
-- 刷新权限表
FLUSH PRIVILEGES;

-- 重置 root 密码（MySQL 5.7+）
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';

-- 或者 MySQL 5.6 及以下版本
-- SET PASSWORD FOR 'root'@'localhost' = PASSWORD('新密码');

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 步骤 5：重启 MySQL 服务

```bash
# 先杀掉安全模式进程
sudo pkill mysqld

# 正常启动 MySQL
brew services start mysql
# 或
sudo /usr/local/mysql/support-files/mysql.server start
```

### 步骤 6：使用新密码登录测试

```bash
mysql -u root -p
# 输入新密码
```

## 方法二：使用 Homebrew 重置（如果通过 Homebrew 安装）

### 步骤 1：停止 MySQL

```bash
brew services stop mysql
```

### 步骤 2：创建临时配置文件

```bash
# 创建临时配置文件
cat > /tmp/mysql-init << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
EOF
```

### 步骤 3：以初始化模式启动

```bash
mysqld --init-file=/tmp/mysql-init
```

### 步骤 4：等待几秒后停止，然后正常启动

```bash
# 按 Ctrl+C 停止
# 然后正常启动
brew services start mysql
```

### 步骤 5：删除临时文件

```bash
rm /tmp/mysql-init
```

## 方法三：完全重新安装（最后手段）

如果以上方法都不行，可以完全重新安装：

```bash
# 停止服务
brew services stop mysql

# 卸载 MySQL
brew uninstall mysql

# 清理数据目录（注意：会删除所有数据！）
sudo rm -rf /usr/local/var/mysql

# 重新安装
brew install mysql

# 启动服务
brew services start mysql

# 此时 root 用户没有密码，可以直接登录设置
mysql -u root
```

然后在 MySQL 中设置密码：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
EXIT;
```

## 常见问题

### 1. 找不到 mysqld_safe 命令

```bash
# 查找 MySQL 安装位置
which mysql
# 通常在 /usr/local/mysql/bin/ 或 /opt/homebrew/bin/

# 使用完整路径
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables --skip-networking &
```

### 2. 权限被拒绝

确保使用 `sudo` 执行相关命令。

### 3. 端口被占用

```bash
# 查看 MySQL 进程
ps aux | grep mysql

# 杀掉进程
sudo pkill mysqld
```

### 4. 忘记 Homebrew 安装的 MySQL 路径

```bash
# 查找 MySQL 安装位置
brew list mysql

# 或查看服务状态
brew services list
```

## 验证密码是否重置成功

```bash
# 使用新密码登录
mysql -u root -p

# 如果成功登录，说明密码重置成功
```

## 设置项目数据库密码

重置 MySQL root 密码后，记得更新项目的 `.env` 文件：

```env
DB_PASSWORD=你的新密码
```

## 安全建议

1. **使用强密码**：密码应包含大小写字母、数字和特殊字符
2. **不要使用 root 用户**：为项目创建专用数据库用户
3. **定期备份**：定期备份数据库数据

## 创建项目专用数据库用户（推荐）

重置 root 密码后，建议为项目创建专用用户：

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE pickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'pickup_user'@'localhost' IDENTIFIED BY '项目密码';
GRANT ALL PRIVILEGES ON pickup_db.* TO 'pickup_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

然后在 `.env` 文件中使用：

```env
DB_USER=pickup_user
DB_PASSWORD=项目密码
```

