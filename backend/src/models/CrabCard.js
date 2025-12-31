import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import bcrypt from 'bcryptjs'

const CrabCard = sequelize.define('CrabCard', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  card_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '蟹卡编号'
  },
  card_password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '蟹卡密码（bcrypt加密）'
  },
  product_name: {
    type: DataTypes.STRING(200),
    comment: '对应商品名称（固定）'
  },
  product_specification: {
    type: DataTypes.STRING(200),
    comment: '商品规格（固定）'
  },
  status: {
    type: DataTypes.ENUM('unused', 'used', 'cancelled'),
    allowNull: false,
    defaultValue: 'unused',
    comment: '状态'
  },
  used_at: {
    type: DataTypes.DATE,
    comment: '使用时间（提货时间）'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    comment: '作废时间'
  },
  cancelled_reason: {
    type: DataTypes.STRING(255),
    comment: '作废原因'
  }
}, {
  tableName: 'crab_cards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // 密码加密钩子
  hooks: {
    beforeCreate: async (card) => {
      if (card.card_password) {
        card.card_password = await bcrypt.hash(card.card_password, 10)
      }
    },
    beforeUpdate: async (card) => {
      if (card.changed('card_password')) {
        card.card_password = await bcrypt.hash(card.card_password, 10)
      }
    }
  }
})

// 实例方法：验证密码
CrabCard.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.card_password)
}

export default CrabCard

