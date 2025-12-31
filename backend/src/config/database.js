import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// 数据库配置
// 注意：使用 127.0.0.1 而不是 localhost，避免 IPv6 连接问题
const dbHost = process.env.DB_HOST || '127.0.0.1'
// 如果配置了 localhost，转换为 127.0.0.1
const host = dbHost === 'localhost' ? '127.0.0.1' : dbHost

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pickup_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: host,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+08:00' // 时区设置为东八区
  }
)

export { sequelize }

