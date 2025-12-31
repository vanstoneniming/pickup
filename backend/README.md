# 后端服务配置说明

## 环境变量配置

### 1. 创建 .env 文件

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

### 2. 配置说明

编辑 `.env` 文件，配置以下参数：

#### 服务器配置
```env
PORT=3000                    # 服务端口
NODE_ENV=development         # 运行环境（development/production）
```

#### 数据库配置
```env
DB_HOST=localhost            # 数据库主机（建议使用 127.0.0.1 避免 IPv6 问题）
DB_PORT=3306                # 数据库端口
DB_NAME=pickup_db           # 数据库名称
DB_USER=pickup_db           # 数据库用户名
DB_PASSWORD=pickup_db       # 数据库密码
```

#### JWT 配置
```env
JWT_SECRET=your-secret-key-change-in-production  # JWT 密钥（生产环境务必修改）
JWT_EXPIRES_IN=7d                                # Token 过期时间
```

#### 阿里云短信配置
```env
ALIYUN_ACCESS_KEY_ID=your-access-key-id                    # 阿里云 AccessKey ID
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret            # 阿里云 AccessKey Secret
ALIYUN_SMS_SIGN_NAME=蟹卡提货                                # 短信签名
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789                      # 短信模板代码
```

#### 开发模式配置（可选）
```env
# 开发模式：设置为 true 可跳过真实短信发送，验证码会在控制台输出
SKIP_SMS=true
```

### 3. 开发模式（短信验证码）

在开发环境下，可以启用开发模式跳过真实短信发送：

- **设置 `SKIP_SMS=true`** 或 **`NODE_ENV=development`**
- 验证码会在后端控制台输出，格式：`[开发模式] 验证码已生成: 123456 (手机号: 13800138000)`
- 跳过频率限制（1分钟内可重复发送）
- 验证码仍会保存到数据库，可以正常验证

### 4. 启动服务

```bash
# 安装依赖
npm install

# 开发环境启动
npm run dev

# 生产环境启动
npm start
```

### 5. 清理验证码记录（调试用）

```bash
# 清理过期和已使用的验证码
mysql -u pickup_db -ppickup_db pickup_db < 清理验证码.sql
```

或手动执行：

```sql
USE pickup_db;
DELETE FROM sms_codes WHERE expires_at < NOW() OR used = 1;
```

## 注意事项

1. **数据库主机**：建议使用 `127.0.0.1` 而不是 `localhost`，避免 IPv6 连接问题
2. **开发模式**：生产环境务必关闭 `SKIP_SMS` 或设置 `NODE_ENV=production`
3. **短信配置**：开发环境可以不配置，生产环境必须配置正确的参数

## 常见问题

参考 `短信验证码调试说明.md` 了解详细的调试方法。
