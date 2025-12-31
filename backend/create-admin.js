// 创建默认管理员账户脚本
// 运行方式: node create-admin.js

import bcrypt from 'bcryptjs'
import { sequelize } from './src/config/database.js'
import User from './src/models/User.js'

async function createAdmin() {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功')

    // 检查管理员是否已存在
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      console.log('管理员账户已存在')
      console.log('用户名: admin')
      console.log('如需重置密码，请删除后重新创建')
      process.exit(0)
    }

    // 创建管理员账户
    const admin = await User.create({
      username: 'admin',
      password: 'admin123', // 密码会自动加密
      role: 'admin',
      real_name: '系统管理员',
      status: 1
    })

    console.log('✅ 管理员账户创建成功！')
    console.log('用户名: admin')
    console.log('密码: admin123')
    console.log('⚠️  请登录后立即修改密码！')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 创建失败:', error.message)
    process.exit(1)
  }
}

createAdmin()

