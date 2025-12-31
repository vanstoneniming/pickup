# 蟹卡提货管理系统（简化版）

一个简化的蟹卡提货管理系统，主要用于外部制作的蟹卡导入和提货登记。

## 项目简介

本系统主要用于：
- **蟹卡导入**：批量导入外部制作的蟹卡（卡号+密码），密码加密存储
- **卡密验证**：提货时验证卡号和密码
- **提货登记**：验证成功后登记提货信息（日期、地址、电话等）
- **短信验证**：使用阿里云短信服务验证手机号
- **提货管理**：管理员查看和管理提货记录

## 核心功能

1. **蟹卡管理**
   - 批量导入蟹卡（卡号+密码）
   - 密码使用 bcrypt 加密存储，防止数据库泄露
   - 查询蟹卡列表
   - 作废蟹卡

2. **提货流程**
   - 验证卡密
   - 填写提货信息（日期、地址、联系人、电话）
   - 手机号短信验证码验证
   - 提交提货登记

3. **提货管理**
   - 查看提货记录列表
   - 发货管理（填写物流单号）
   - 完成提货

## 技术栈

### 前端
- Vue 3 (Composition API)
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite

### 后端
- Node.js
- Express
- Sequelize (ORM)
- MySQL
- JWT (身份认证)
- bcryptjs (密码加密)
- 阿里云短信服务

## 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- 阿里云短信服务账号

### 2. 数据库配置

创建数据库并执行初始化脚本（参考 `docs/数据库设计.md`）：

```sql
CREATE DATABASE pickup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 后端配置

```bash
cd backend
npm install

# 复制环境变量文件
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pickup_db
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 阿里云短信配置
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_SMS_SIGN_NAME=蟹卡提货
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

启动后端：

```bash
npm run dev
```

### 4. 前端配置

```bash
cd frontend
npm install
```

启动前端：

```bash
npm run dev
```

### 5. 访问系统

打开浏览器访问 `http://localhost:5173`

## 使用说明

### 导入蟹卡

1. 登录管理员账户
2. 进入"蟹卡管理" -> "导入蟹卡"
3. 输入卡号密码列表，格式：`卡号,密码,商品名称,商品规格`
4. 点击"开始导入"

示例：
```
CR202401010001,123456,阳澄湖大闸蟹,3两公蟹+2两母蟹
CR202401010002,234567,阳澄湖大闸蟹,3两公蟹+2两母蟹
```

### 提货流程

1. 进入"蟹卡提货"页面
2. 输入卡号和密码，点击"验证"
3. 验证成功后，填写提货信息
4. 输入手机号，点击"发送验证码"
5. 输入收到的验证码
6. 填写其他信息（地址、联系人、配送方式等）
7. 点击"提交"完成提货登记

## 数据库设计

主要数据表：
- `users` - 用户表
- `crab_cards` - 蟹卡表（包含加密的密码）
- `deliveries` - 提货记录表
- `sms_codes` - 短信验证码表

详细设计请参考 `docs/数据库设计.md`

## API 文档

主要接口：
- `POST /api/v1/crab-cards/import` - 批量导入蟹卡
- `POST /api/v1/crab-cards/verify` - 验证卡密
- `POST /api/v1/deliveries` - 创建提货记录
- `POST /api/v1/sms/send` - 发送短信验证码

详细 API 文档请参考 `docs/API文档.md`

## 安全特性

1. **密码加密**：所有密码（用户密码、蟹卡密码）使用 bcrypt 加密存储
2. **数据库泄露防护**：即使数据库泄露，密码也无法直接使用
3. **短信验证**：提货时手机号需要短信验证码验证
4. **JWT 认证**：使用 JWT Token 进行身份认证

## 注意事项

1. **阿里云短信配置**
   - 需要在阿里云控制台申请短信服务
   - 配置签名和模板
   - 将 AccessKey 配置到 `.env` 文件

2. **密码安全**
   - 蟹卡密码导入时自动加密
   - 数据库不存储明文密码
   - 验证时使用 bcrypt 比对

3. **生产环境**
   - 修改默认的 JWT_SECRET
   - 使用强密码
   - 启用 HTTPS

## 许可证

MIT License
