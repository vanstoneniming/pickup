import express from 'express'
import { body, validationResult } from 'express-validator'
import { sendSmsCode, verifySmsCode } from '../utils/sms.js'

const router = express.Router()

// 发送短信验证码
router.post('/send', [
  body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('type').optional().isString().withMessage('验证码类型格式不正确')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg,
        data: null
      })
    }
    
    const { phone, type = 'delivery' } = req.body
    
    await sendSmsCode(phone, type)
    
    res.json({
      code: 200,
      message: '验证码发送成功',
      data: null
    })
  } catch (error) {
    console.error('发送验证码错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '发送失败',
      data: null
    })
  }
})

// 验证短信验证码（可选，通常在前端验证后直接提交）
router.post('/verify', [
  body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('code').notEmpty().withMessage('验证码不能为空'),
  body('type').optional().isString().withMessage('验证码类型格式不正确')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg,
        data: null
      })
    }
    
    const { phone, code, type = 'delivery' } = req.body
    
    const isValid = await verifySmsCode(phone, code, type)
    
    if (!isValid) {
      return res.status(400).json({
        code: 400,
        message: '验证码错误或已过期',
        data: null
      })
    }
    
    res.json({
      code: 200,
      message: '验证成功',
      data: null
    })
  } catch (error) {
    console.error('验证验证码错误:', error)
    res.status(500).json({
      code: 500,
      message: '验证失败',
      data: null
    })
  }
})

export default router

