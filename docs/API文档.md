# API 接口文档（简化版）

## 一、接口规范

### 1.1 基础信息
- **Base URL**: `http://localhost:3000/api`
- **API 版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 1.3 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.4 认证方式

使用 JWT Token 进行身份认证，请求头格式：
```
Authorization: Bearer <token>
```

## 二、用户相关接口

### 2.1 用户登录

**接口地址**: `POST /api/v1/auth/login`

**请求参数**：
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 2.2 获取当前用户信息

**接口地址**: `GET /api/v1/auth/me`

**请求头**: `Authorization: Bearer <token>`

## 三、蟹卡相关接口

### 3.1 批量导入蟹卡

**接口地址**: `POST /api/v1/crab-cards/import`

**权限**: 管理员

**请求参数**：
```json
{
  "cards": [
    {
      "card_no": "CR202401010001",
      "card_password": "123456",
      "product_name": "阳澄湖大闸蟹",
      "product_specification": "3两公蟹+2两母蟹"
    }
  ]
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "导入完成：成功 100 张，失败 0 张",
  "data": {
    "success": [
      {
        "id": 1,
        "card_no": "CR202401010001"
      }
    ],
    "failed": []
  }
}
```

### 3.2 查询蟹卡列表

**接口地址**: `GET /api/v1/crab-cards`

**权限**: 管理员

**查询参数**：
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认20）
- `status`: 状态筛选（unused/used/cancelled）
- `card_no`: 蟹卡编号（模糊查询）

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "card_no": "CR202401010001",
        "product_name": "阳澄湖大闸蟹",
        "product_specification": "3两公蟹+2两母蟹",
        "status": "unused",
        "used_at": null
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

### 3.3 验证卡密

**接口地址**: `POST /api/v1/crab-cards/verify`

**请求参数**：
```json
{
  "card_no": "CR202401010001",
  "card_password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "card_id": 1,
    "card_no": "CR202401010001",
    "product_name": "阳澄湖大闸蟹",
    "product_specification": "3两公蟹+2两母蟹",
    "status": "unused"
  }
}
```

### 3.4 作废蟹卡

**接口地址**: `POST /api/v1/crab-cards/:id/cancel`

**权限**: 管理员

**请求参数**：
```json
{
  "reason": "客户要求作废"
}
```

## 四、提货相关接口

### 4.1 创建提货记录

**接口地址**: `POST /api/v1/deliveries`

**请求参数**：
```json
{
  "card_id": 1,
  "card_no": "CR202401010001",
  "delivery_date": "2024-01-15",
  "shipping_address": "北京市朝阳区xxx",
  "shipping_contact": "张三",
  "shipping_phone": "13800138000",
  "shipping_method": "顺丰快递",
  "remark": "请尽快发货",
  "sms_code": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "提货登记成功",
  "data": {
    "id": 1,
    "card_no": "CR202401010001",
    "delivery_date": "2024-01-15",
    "status": "pending"
  }
}
```

### 4.2 查询提货记录列表

**接口地址**: `GET /api/v1/deliveries`

**权限**: 需要登录

**查询参数**：
- `page`: 页码
- `page_size`: 每页数量
- `status`: 订单状态（pending/shipped/completed/cancelled）
- `card_no`: 卡号
- `start_date`: 开始日期
- `end_date`: 结束日期

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "card_no": "CR202401010001",
        "delivery_date": "2024-01-15",
        "shipping_address": "北京市朝阳区xxx",
        "shipping_contact": "张三",
        "shipping_phone": "13800138000",
        "status": "pending",
        "crabCard": {
          "product_name": "阳澄湖大闸蟹",
          "product_specification": "3两公蟹+2两母蟹"
        }
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 20
  }
}
```

### 4.3 发货

**接口地址**: `POST /api/v1/deliveries/:id/ship`

**权限**: 管理员

**请求参数**：
```json
{
  "tracking_number": "SF1234567890"
}
```

### 4.4 完成提货

**接口地址**: `POST /api/v1/deliveries/:id/complete`

**权限**: 管理员

## 五、短信验证码接口

### 5.1 发送短信验证码

**接口地址**: `POST /api/v1/sms/send`

**请求参数**：
```json
{
  "phone": "13800138000",
  "type": "delivery"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": null
}
```

**说明**：
- 同一手机号1分钟内只能发送一次
- 验证码有效期10分钟
- 验证码使用后自动标记为已使用

### 5.2 验证短信验证码

**接口地址**: `POST /api/v1/sms/verify`

**请求参数**：
```json
{
  "phone": "13800138000",
  "code": "123456",
  "type": "delivery"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "验证成功",
  "data": null
}
```

## 六、注意事项

1. **密码安全**：蟹卡密码在导入时自动使用 bcrypt 加密存储，验证时使用加密比对
2. **短信验证码**：验证码有效期10分钟，使用后自动失效
3. **权限控制**：部分接口需要管理员权限，需要在请求头中携带有效的 JWT Token
