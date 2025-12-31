import express from 'express'
import { body, query, validationResult } from 'express-validator'
import CrabCard from '../models/CrabCard.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { Op } from 'sequelize'

const router = express.Router()

// 批量导入蟹卡（管理员）
router.post('/import', authenticate, requireAdmin, [
  body('cards').isArray({ min: 1 }).withMessage('至少导入一张蟹卡'),
  body('cards.*.card_no').notEmpty().withMessage('卡号不能为空'),
  body('cards.*.card_password').notEmpty().withMessage('密码不能为空')
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
    
    const { cards } = req.body
    const results = {
      success: [],
      failed: []
    }
    
    for (const cardData of cards) {
      try {
        // 检查卡号是否已存在
        const existing = await CrabCard.findOne({
          where: { card_no: cardData.card_no }
        })
        
        if (existing) {
          results.failed.push({
            card_no: cardData.card_no,
            reason: '卡号已存在'
          })
          continue
        }
        
        // 创建蟹卡（密码会在模型的 beforeCreate 钩子中自动加密）
        const card = await CrabCard.create({
          card_no: cardData.card_no,
          card_password: cardData.card_password, // 使用明文密码，钩子会自动加密
          product_name: cardData.product_name || '',
          product_specification: cardData.product_specification || '',
          status: 'unused'
        })
        
        results.success.push({
          id: card.id,
          card_no: card.card_no
        })
      } catch (error) {
        results.failed.push({
          card_no: cardData.card_no,
          reason: error.message
        })
      }
    }
    
    res.json({
      code: 200,
      message: `导入完成：成功 ${results.success.length} 张，失败 ${results.failed.length} 张`,
      data: results
    })
  } catch (error) {
    console.error('导入蟹卡错误:', error)
    res.status(500).json({
      code: 500,
      message: '导入失败',
      data: null
    })
  }
})

// 查询蟹卡列表（管理员）
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 20,
      status,
      card_no
    } = req.query
    
    const where = {}
    
    if (status) {
      where.status = status
    }
    
    if (card_no) {
      where.card_no = { [Op.like]: `%${card_no}%` }
    }
    
    const { count, rows } = await CrabCard.findAndCountAll({
      where,
      attributes: { exclude: ['card_password'] }, // 不返回密码
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['created_at', 'DESC']]
    })
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      }
    })
  } catch (error) {
    console.error('查询蟹卡列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null
    })
  }
})

// 验证卡密（用于提货）
router.post('/verify', [
  body('card_no').isString().trim().notEmpty().withMessage('卡号不能为空'),
  body('card_password').isString().trim().notEmpty().withMessage('密码不能为空')
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
    
    const { card_no, card_password } = req.body
    
    const card = await CrabCard.findOne({ where: { card_no } })
    
    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡号不存在',
        data: null
      })
    }
    
    // 验证密码
    const isValidPassword = await card.validatePassword(card_password)
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '密码错误',
        data: null
      })
    }
    
    // 检查状态
    if (card.status === 'used') {
      return res.status(400).json({
        code: 400,
        message: '该蟹卡已被使用',
        data: null
      })
    }
    
    if (card.status === 'cancelled') {
      return res.status(400).json({
        code: 400,
        message: '该蟹卡已作废',
        data: null
      })
    }
    
    res.json({
      code: 200,
      message: '验证成功',
      data: {
        card_id: card.id,
        card_no: card.card_no,
        product_name: card.product_name,
        product_specification: card.product_specification,
        status: card.status
      }
    })
  } catch (error) {
    console.error('验证卡密错误:', error)
    res.status(500).json({
      code: 500,
      message: '验证失败',
      data: null
    })
  }
})

// 作废蟹卡（管理员）
router.post('/:id/cancel', authenticate, requireAdmin, [
  body('reason').notEmpty().withMessage('作废原因不能为空')
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
    
    const card = await CrabCard.findByPk(req.params.id)
    
    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '蟹卡不存在',
        data: null
      })
    }
    
    await card.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      cancelled_reason: req.body.reason
    })
    
    res.json({
      code: 200,
      message: '作废成功',
      data: {
        id: card.id,
        card_no: card.card_no,
        status: 'cancelled'
      }
    })
  } catch (error) {
    console.error('作废蟹卡错误:', error)
    res.status(500).json({
      code: 500,
      message: '作废失败',
      data: null
    })
  }
})

export default router
