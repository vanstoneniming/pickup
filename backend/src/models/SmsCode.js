import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const SmsCode = sequelize.define('SmsCode', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '手机号'
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '验证码'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '验证码类型'
  },
  used: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已使用（0:未使用 1:已使用）'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '过期时间'
  }
}, {
  tableName: 'sms_codes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

export default SmsCode

