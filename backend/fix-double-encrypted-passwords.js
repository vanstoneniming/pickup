// 修复双重加密密码的脚本
// 如果导入时密码被双重加密了，需要重新导入或者重新设置密码
// 
// 使用方法：
// 1. 如果数据库中有双重加密的密码，需要删除这些记录
// 2. 使用明文密码重新导入

import { sequelize } from './src/config/database.js'
import CrabCard from './src/models/CrabCard.js'
import bcrypt from 'bcryptjs'

async function checkAndFixPasswords() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功\n')
    
    // 查找所有未使用的蟹卡
    const cards = await CrabCard.findAll({
      where: { status: 'unused' }
    })
    
    console.log(`找到 ${cards.length} 张未使用的蟹卡`)
    console.log('注意：如果密码被双重加密，需要重新导入这些卡\n')
    
    // 这里无法自动修复，因为无法知道原始密码
    // 建议删除这些记录并重新导入
    console.log('建议操作：')
    console.log('1. 如果密码已被双重加密，需要删除这些记录')
    console.log('2. 使用明文密码重新导入')
    console.log('3. 或者手动更新密码（如果知道原始密码）\n')
    
    process.exit(0)
  } catch (error) {
    console.error('错误:', error.message)
    process.exit(1)
  }
}

checkAndFixPasswords()

