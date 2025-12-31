<template>
  <div class="delivery">
    <el-card>
      <template #header>
        <span style="font-size: 18px; font-weight: 600">蟹卡提货</span>
      </template>
      
      <el-steps :active="step" finish-status="success" style="margin-bottom: 30px">
        <el-step title="验证卡密" />
        <el-step title="填写信息" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1: 验证卡密 -->
      <div v-if="step === 0" class="step-content">
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          label-width="120px"
          style="max-width: 500px"
        >
          <el-form-item label="卡号" prop="card_no">
            <el-input
              v-model="verifyForm.card_no"
              placeholder="请输入蟹卡卡号"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="card_password">
            <el-input
              v-model="verifyForm.card_password"
              type="password"
              placeholder="请输入蟹卡密码"
              show-password
              @keyup.enter="handleVerify"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="verifying" @click="handleVerify">
              验证
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 填写提货信息 -->
      <div v-if="step === 1" class="step-content">
        <el-alert
          :title="`验证成功！商品：${cardInfo.product_name} ${cardInfo.product_specification || ''}`"
          type="success"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-form
          ref="deliveryFormRef"
          :model="deliveryForm"
          :rules="deliveryRules"
          label-width="120px"
          style="max-width: 600px"
        >
          <el-form-item label="提货日期" prop="delivery_date">
            <el-date-picker
              v-model="deliveryForm.delivery_date"
              type="date"
              placeholder="选择提货日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="收货地址" prop="shipping_address">
            <el-input
              v-model="deliveryForm.shipping_address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细收货地址"
            />
          </el-form-item>
          
          <el-form-item label="收货人" prop="shipping_contact">
            <el-input v-model="deliveryForm.shipping_contact" placeholder="请输入收货人姓名" />
          </el-form-item>
          
          <el-form-item label="联系电话" prop="shipping_phone">
            <el-input
              v-model="deliveryForm.shipping_phone"
              placeholder="请输入联系电话"
              style="width: 200px"
            />
            <el-button
              :disabled="smsCountdown > 0"
              style="margin-left: 10px"
              @click="handleSendSms"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}秒后重试` : '发送验证码' }}
            </el-button>
          </el-form-item>
          
          <el-form-item label="短信验证码" prop="sms_code">
            <el-input
              v-model="deliveryForm.sms_code"
              placeholder="请输入短信验证码"
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item label="配送方式" prop="shipping_method">
            <el-select v-model="deliveryForm.shipping_method" placeholder="请选择配送方式" style="width: 100%">
              <el-option label="顺丰快递" value="顺丰快递" />
              <el-option label="中通快递" value="中通快递" />
              <el-option label="圆通快递" value="圆通快递" />
              <el-option label="自提" value="自提" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="deliveryForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（可选）"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button @click="step = 0">上一步</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              提交
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="step === 2" class="step-content">
        <el-result
          icon="success"
          title="提货登记成功！"
          sub-title="您的提货信息已提交，我们会尽快处理"
        >
          <template #extra>
            <el-button type="primary" @click="handleReset">继续提货</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import dayjs from 'dayjs'

const step = ref(0)
const verifying = ref(false)
const submitting = ref(false)
const smsCountdown = ref(0)

const verifyFormRef = ref(null)
const deliveryFormRef = ref(null)

const cardInfo = ref({})

const verifyForm = reactive({
  card_no: '',
  card_password: ''
})

const deliveryForm = reactive({
  card_id: null,
  card_no: '',
  delivery_date: dayjs().format('YYYY-MM-DD'),
  shipping_address: '',
  shipping_contact: '',
  shipping_phone: '',
  sms_code: '',
  shipping_method: '',
  remark: ''
})

const verifyRules = {
  card_no: [
    { required: true, message: '请输入卡号', trigger: 'blur' }
  ],
  card_password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const deliveryRules = {
  delivery_date: [
    { required: true, message: '请选择提货日期', trigger: 'change' }
  ],
  shipping_address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ],
  shipping_contact: [
    { required: true, message: '请输入收货人', trigger: 'blur' }
  ],
  shipping_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sms_code: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' }
  ],
  shipping_method: [
    { required: true, message: '请选择配送方式', trigger: 'change' }
  ]
}

// 验证卡密
const handleVerify = async () => {
  if (!verifyFormRef.value) return
  
  try {
    // 先验证表单
    const valid = await verifyFormRef.value.validate()
    if (!valid) {
      // 验证失败，不发送请求
      return
    }
    
    // 再次检查数据是否为空
    const cardNo = String(verifyForm.card_no || '').trim()
    const cardPassword = String(verifyForm.card_password || '').trim()
    
    if (!cardNo || !cardPassword) {
      ElMessage.warning('请输入卡号和密码')
      return
    }
    
    verifying.value = true
    try {
      const response = await request({
        url: '/api/v1/crab-cards/verify',
        method: 'post',
        data: {
          card_no: cardNo,
          card_password: cardPassword
        }
      })
      
      cardInfo.value = response.data
      deliveryForm.card_id = response.data.card_id
      deliveryForm.card_no = response.data.card_no
      step.value = 1
      ElMessage.success('验证成功')
    } catch (error) {
      // 错误消息已经在 request 拦截器中处理，这里不需要再次显示
      console.error('验证失败:', error)
    } finally {
      verifying.value = false
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 发送短信验证码
const handleSendSms = async () => {
  if (!deliveryForm.shipping_phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(deliveryForm.shipping_phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  try {
    await request({
      url: '/api/v1/sms/send',
      method: 'post',
      data: {
        phone: deliveryForm.shipping_phone,
        type: 'delivery'
      }
    })
    
    ElMessage.success('验证码已发送')
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error(error.message || '发送失败')
  }
}

// 提交提货信息
const handleSubmit = async () => {
  if (!deliveryFormRef.value) return
  
  await deliveryFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await request({
          url: '/api/v1/deliveries',
          method: 'post',
          data: deliveryForm
        })
        
        step.value = 2
        ElMessage.success('提货登记成功')
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置
const handleReset = () => {
  step.value = 0
  verifyForm.card_no = ''
  verifyForm.card_password = ''
  deliveryForm.card_id = null
  deliveryForm.card_no = ''
  deliveryForm.delivery_date = dayjs().format('YYYY-MM-DD')
  deliveryForm.shipping_address = ''
  deliveryForm.shipping_contact = ''
  deliveryForm.shipping_phone = ''
  deliveryForm.sms_code = ''
  deliveryForm.shipping_method = ''
  deliveryForm.remark = ''
  cardInfo.value = {}
  smsCountdown.value = 0
}
</script>

<style scoped>
.delivery {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.step-content {
  padding: 20px 0;
}
</style>

