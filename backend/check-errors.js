// 检查常见错误的脚本

import { sequelize } from './src/config/database.js'
import User from './src/models/User.js'

async function checkErrors() {
  console.log('开始检查系统状态...\n')
  
  try {
    // 1. 检查数据库连接
    console.log('1. 检查数据库连接...')
    await sequelize.authenticate()
    console.log('   ✅ 数据库连接成功\n')
  } catch (error) {
    console.log('   ❌ 数据库连接失败:', error.message)
    console.log('   建议: 检查 .env 文件中的数据库配置，确保 MySQL 服务运行中\n')
    return
  }
  
  try {
    // 2. 检查管理员账户
    console.log('2. 检查管理员账户...')
    const admin = await User.findOne({ where: { username: 'admin' } })
    if (admin) {
      console.log('   ✅ 管理员账户存在')
      console.log(`   用户名: ${admin.username}`)
      console.log(`   角色: ${admin.role}`)
      console.log(`   状态: ${admin.status === 1 ? '启用' : '禁用'}\n`)
    } else {
      console.log('   ⚠️  管理员账户不存在')
      console.log('   建议: 运行 node create-admin.js 创建管理员账户\n')
    }
  } catch (error) {
    console.log('   ❌ 检查管理员账户失败:', error.message)
    console.log('   错误详情:', error)
    console.log('   建议: 检查数据库表结构是否正确\n')
  }
  
  try {
    // 3. 检查表结构
    console.log('3. 检查 users 表结构...')
    const [results] = await sequelize.query("DESCRIBE users")
    const fields = results.map(r => r.Field)
    const requiredFields = ['id', 'username', 'password', 'role', 'avatar', 'last_login_at']
    const missingFields = requiredFields.filter(f => !fields.includes(f))
    
    if (missingFields.length === 0) {
      console.log('   ✅ users 表结构完整\n')
    } else {
      console.log('   ❌ users 表缺少字段:', missingFields.join(', '))
      console.log('   建议: 运行 fix-users-table-simple.sql 修复表结构\n')
    }
  } catch (error) {
    console.log('   ❌ 检查表结构失败:', error.message)
    console.log('   建议: 检查数据库表是否存在\n')
  }
  
  try {
    // 4. 检查环境变量
    console.log('4. 检查环境变量...')
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET']
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v])
    
    if (missingEnvVars.length === 0) {
      console.log('   ✅ 环境变量配置完整\n')
    } else {
      console.log('   ⚠️  缺少环境变量:', missingEnvVars.join(', '))
      console.log('   建议: 检查 .env 文件配置\n')
    }
  } catch (error) {
    console.log('   ❌ 检查环境变量失败:', error.message)
  }
  
  console.log('检查完成！')
  process.exit(0)
}

checkErrors().catch(error => {
  console.error('检查过程出错:', error)
  process.exit(1)
})

