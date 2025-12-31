import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import CrabCard from './CrabCard.js'

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  card_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '蟹卡ID',
    references: {
      model: CrabCard,
      key: 'id'
    }
  },
  card_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '蟹卡编号（快照）'
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '提货日期'
  },
  shipping_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '收货地址'
  },
  shipping_contact: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收货联系人'
  },
  shipping_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '收货电话（已验证）'
  },
  shipping_method: {
    type: DataTypes.STRING(50),
    comment: '配送方式'
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    comment: '物流单号'
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态'
  },
  remark: {
    type: DataTypes.TEXT,
    comment: '备注'
  },
  shipped_at: {
    type: DataTypes.DATE,
    comment: '发货时间'
  },
  completed_at: {
    type: DataTypes.DATE,
    comment: '完成时间'
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 关联关系
Delivery.belongsTo(CrabCard, { foreignKey: 'card_id', as: 'crabCard' })
CrabCard.hasMany(Delivery, { foreignKey: 'card_id', as: 'deliveries' })

export default Delivery

