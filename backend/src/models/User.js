import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import bcrypt from 'bcryptjs'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（加密）'
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    allowNull: false,
    defaultValue: 'customer',
    comment: '角色'
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    comment: '手机号'
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    comment: '邮箱'
  },
  real_name: {
    type: DataTypes.STRING(50),
    comment: '真实姓名'
  },
  avatar: {
    type: DataTypes.STRING(255),
    comment: '头像URL'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态（1:启用 0:禁用）'
  },
  last_login_at: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // 密码加密钩子
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }
  }
})

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

export default User

