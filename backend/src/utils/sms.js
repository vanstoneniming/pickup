import Core from '@alicloud/pop-core'
import SmsCode from '../models/SmsCode.js'
import dayjs from 'dayjs'
import { Op } from 'sequelize'

// 阿里云短信配置
const client = new Core({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
})

/**
 * 生成随机验证码
 * @param {number} length - 验证码长度
 * @returns {string} 验证码
 */
export const generateCode = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号
 * @param {string} type - 验证码类型
 * @returns {Promise<Object>} 发送结果
 */
export const sendSmsCode = async (phone, type = 'delivery') => {
  try {
    // 开发模式：跳过频率限制和真实短信发送
    const isDevelopment = process.env.NODE_ENV === 'development'
    const skipSms = process.env.SKIP_SMS === 'true' || isDevelopment
    
    // 检查频率限制（开发模式可以跳过）
    if (!skipSms) {
      const recentCode = await SmsCode.findOne({
        where: {
          phone,
          type,
          created_at: {
            [Op.gte]: dayjs().subtract(1, 'minute').toDate()
          }
        },
        order: [['created_at', 'DESC']]
      })

      if (recentCode) {
        throw new Error('发送过于频繁，请稍后再试')
      }
    }

    // 生成验证码
    const code = generateCode(6)
    const expiresAt = dayjs().add(10, 'minute').toDate() // 10分钟过期

    // 保存验证码到数据库
    await SmsCode.create({
      phone,
      code,
      type,
      expires_at: expiresAt
    })

    // 开发模式下，不发送真实短信，直接返回成功
    if (skipSms) {
      console.log(`[开发模式] 验证码已生成: ${code} (手机号: ${phone})`)
      return {
        success: true,
        message: '验证码发送成功（开发模式）'
      }
    }

    // 生产环境：发送真实短信
    const params = {
      PhoneNumbers: phone,
      SignName: process.env.ALIYUN_SMS_SIGN_NAME || '蟹卡提货',
      TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_123456789',
      TemplateParam: JSON.stringify({ code })
    }

    const requestOption = {
      method: 'POST'
    }

    const result = await client.request('SendSms', params, requestOption)

    if (result.Code === 'OK') {
      return {
        success: true,
        message: '验证码发送成功'
      }
    } else {
      throw new Error(result.Message || '发送失败')
    }
  } catch (error) {
    console.error('发送短信验证码错误:', error)
    throw error
  }
}

/**
 * 验证短信验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} type - 验证码类型
 * @returns {Promise<boolean>} 验证结果
 */
export const verifySmsCode = async (phone, code, type = 'delivery') => {
  try {
    const smsCode = await SmsCode.findOne({
      where: {
        phone,
        code,
        type,
        used: 0
      },
      order: [['created_at', 'DESC']]
    })

    if (!smsCode) {
      return false
    }

    // 检查是否过期
    if (new Date() > smsCode.expires_at) {
      return false
    }

    // 标记为已使用
    await smsCode.update({ used: 1 })

    return true
  } catch (error) {
    console.error('验证短信验证码错误:', error)
    return false
  }
}

