import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT 认证中间件
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findByPk(decoded.userId)
    
    if (!user || user.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用',
        data: null
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Token 无效或已过期',
      data: null
    })
  }
}

// 管理员权限中间件
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '无权限访问',
      data: null
    })
  }
  next()
}

