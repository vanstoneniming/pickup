import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database.js'
import authRoutes from './routes/auth.js'
import crabCardRoutes from './routes/crabCards.js'
import deliveryRoutes from './routes/deliveries.js'
import smsRoutes from './routes/sms.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' })
})

// API 路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/crab-cards', crabCardRoutes)
app.use('/api/v1/deliveries', deliveryRoutes)
app.use('/api/v1/sms', smsRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    data: null
  })
})

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      // await sequelize.sync({ alter: true })
      console.log('数据库模型同步完成')
    }
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

startServer()

