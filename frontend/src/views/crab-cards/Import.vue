<template>
  <div class="import-cards">
    <el-card>
      <template #header>
        <span>导入蟹卡</span>
      </template>
      
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>1. 支持批量导入蟹卡，每行一条记录</p>
          <p>2. 格式：卡号,密码,商品名称,商品规格（后两项可选）</p>
          <p>3. 示例：CR202401010001,123456,阳澄湖大闸蟹,3两公蟹+2两母蟹</p>
          <p>4. 密码会自动加密存储，确保安全</p>
        </template>
      </el-alert>
      
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="导入方式">
          <el-radio-group v-model="importType">
            <el-radio label="text">文本输入</el-radio>
            <el-radio label="file">文件上传</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 文本输入 -->
        <el-form-item v-if="importType === 'text'" label="卡号密码列表">
          <el-input
            v-model="form.textData"
            type="textarea"
            :rows="10"
            placeholder="请输入卡号密码列表，每行一条，格式：卡号,密码,商品名称,商品规格"
          />
        </el-form-item>
        
        <!-- 文件上传 -->
        <el-form-item v-if="importType === 'file'" label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".txt,.csv"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 .txt 或 .csv 文件，每行一条记录
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleImport">
            开始导入
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 导入结果 -->
      <el-card v-if="importResult" style="margin-top: 20px">
        <template #header>
          <span>导入结果</span>
        </template>
        <div>
          <p>成功：{{ importResult.success.length }} 张</p>
          <p>失败：{{ importResult.failed.length }} 张</p>
          <el-table
            v-if="importResult.failed.length > 0"
            :data="importResult.failed"
            style="margin-top: 20px"
          >
            <el-table-column prop="card_no" label="卡号" />
            <el-table-column prop="reason" label="失败原因" />
          </el-table>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const formRef = ref(null)
const uploadRef = ref(null)
const loading = ref(false)
const importType = ref('text')
const importResult = ref(null)

const form = reactive({
  textData: ''
})

// 解析文本数据
const parseTextData = (text) => {
  const lines = text.split('\n').filter(line => line.trim())
  const cards = []
  
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      cards.push({
        card_no: parts[0],
        card_password: parts[1],
        product_name: parts[2] || '',
        product_specification: parts[3] || ''
      })
    }
  }
  
  return cards
}

// 处理文件选择
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.textData = e.target.result
  }
  reader.readAsText(file.raw)
}

// 导入
const handleImport = async () => {
  if (importType.value === 'text' && !form.textData.trim()) {
    ElMessage.warning('请输入卡号密码列表')
    return
  }
  
  if (importType.value === 'file' && !form.textData.trim()) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  const cards = parseTextData(form.textData)
  
  if (cards.length === 0) {
    ElMessage.warning('没有有效的卡号密码数据')
    return
  }
  
  loading.value = true
  try {
    const response = await request({
      url: '/api/v1/crab-cards/import',
      method: 'post',
      data: { cards }
    })
    
    importResult.value = response.data
    ElMessage.success(response.message)
    
    if (response.data.failed.length === 0) {
      setTimeout(() => {
        router.push('/admin/crab-cards')
      }, 2000)
    }
  } catch (error) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.import-cards {
  padding: 0;
}
</style>

