import express from 'express'
import { body, query, validationResult } from 'express-validator'
import Delivery from '../models/Delivery.js'
import CrabCard from '../models/CrabCard.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { verifySmsCode } from '../utils/sms.js'
import { Op } from 'sequelize'

const router = express.Router()

// 创建提货记录（验证卡密后）
router.post('/', [
  body('card_id').notEmpty().withMessage('蟹卡ID不能为空'),
  body('card_no').notEmpty().withMessage('卡号不能为空'),
  body('delivery_date').notEmpty().withMessage('提货日期不能为空'),
  body('shipping_address').notEmpty().withMessage('收货地址不能为空'),
  body('shipping_contact').notEmpty().withMessage('收货人不能为空'),
  body('shipping_phone').isMobilePhone('zh-CN').withMessage('联系电话格式不正确'),
  body('sms_code').notEmpty().withMessage('短信验证码不能为空')
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
    
    const {
      card_id,
      card_no,
      delivery_date,
      shipping_address,
      shipping_contact,
      shipping_phone,
      shipping_method,
      remark,
      sms_code
    } = req.body
    
    // 验证短信验证码
    const isValidCode = await verifySmsCode(shipping_phone, sms_code, 'delivery')
    if (!isValidCode) {
      return res.status(400).json({
        code: 400,
        message: '短信验证码错误或已过期',
        data: null
      })
    }
    
    // 验证蟹卡
    const card = await CrabCard.findByPk(card_id)
    if (!card || card.card_no !== card_no) {
      return res.status(400).json({
        code: 400,
        message: '蟹卡信息不匹配',
        data: null
      })
    }
    
    if (card.status !== 'unused') {
      return res.status(400).json({
        code: 400,
        message: '该蟹卡已被使用或已作废',
        data: null
      })
    }
    
    // 创建提货记录
    const delivery = await Delivery.create({
      card_id,
      card_no,
      delivery_date,
      shipping_address,
      shipping_contact,
      shipping_phone,
      shipping_method,
      remark,
      status: 'pending'
    })
    
    // 更新蟹卡状态
    await card.update({
      status: 'used',
      used_at: new Date()
    })
    
    res.json({
      code: 200,
      message: '提货登记成功',
      data: {
        id: delivery.id,
        card_no: delivery.card_no,
        delivery_date: delivery.delivery_date,
        status: delivery.status
      }
    })
  } catch (error) {
    console.error('创建提货记录错误:', error)
    res.status(500).json({
      code: 500,
      message: '提货登记失败',
      data: null
    })
  }
})

// 查询提货记录列表（需要管理员权限）
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 20,
      status,
      card_no,
      start_date,
      end_date
    } = req.query
    
    const where = {}
    
    if (status) {
      where.status = status
    }
    
    if (card_no) {
      where.card_no = { [Op.like]: `%${card_no}%` }
    }
    
    if (start_date || end_date) {
      where.delivery_date = {}
      if (start_date) {
        where.delivery_date[Op.gte] = start_date
      }
      if (end_date) {
        where.delivery_date[Op.lte] = end_date
      }
    }
    
    const { count, rows } = await Delivery.findAndCountAll({
      where,
      include: [
        {
          model: CrabCard,
          as: 'crabCard',
          attributes: ['product_name', 'product_specification']
        }
      ],
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
    console.error('查询提货记录错误:', error)
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null
    })
  }
})

// 查询提货记录详情（需要管理员权限）
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: CrabCard,
          as: 'crabCard',
          attributes: ['product_name', 'product_specification']
        }
      ]
    })
    
    if (!delivery) {
      return res.status(404).json({
        code: 404,
        message: '提货记录不存在',
        data: null
      })
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: delivery
    })
  } catch (error) {
    console.error('查询提货记录详情错误:', error)
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null
    })
  }
})

// 发货（管理员）
router.post('/:id/ship', authenticate, requireAdmin, [
  body('tracking_number').notEmpty().withMessage('物流单号不能为空')
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
    
    const delivery = await Delivery.findByPk(req.params.id)
    
    if (!delivery) {
      return res.status(404).json({
        code: 404,
        message: '提货记录不存在',
        data: null
      })
    }
    
    if (delivery.status !== 'pending') {
      return res.status(400).json({
        code: 400,
        message: '提货记录状态不允许发货',
        data: null
      })
    }
    
    await delivery.update({
      status: 'shipped',
      tracking_number: req.body.tracking_number,
      shipped_at: new Date()
    })
    
    res.json({
      code: 200,
      message: '发货成功',
      data: {
        id: delivery.id,
        status: delivery.status,
        tracking_number: delivery.tracking_number
      }
    })
  } catch (error) {
    console.error('发货错误:', error)
    res.status(500).json({
      code: 500,
      message: '发货失败',
      data: null
    })
  }
})

// 完成提货（管理员）
router.post('/:id/complete', authenticate, requireAdmin, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id)
    
    if (!delivery) {
      return res.status(404).json({
        code: 404,
        message: '提货记录不存在',
        data: null
      })
    }
    
    if (delivery.status !== 'shipped') {
      return res.status(400).json({
        code: 400,
        message: '提货记录状态不允许完成',
        data: null
      })
    }
    
    await delivery.update({
      status: 'completed',
      completed_at: new Date()
    })
    
    res.json({
      code: 200,
      message: '操作成功',
      data: {
        id: delivery.id,
        status: delivery.status
      }
    })
  } catch (error) {
    console.error('完成提货错误:', error)
    res.status(500).json({
      code: 500,
      message: '操作失败',
      data: null
    })
  }
})

export default router

