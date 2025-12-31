<template>
  <div class="deliveries-list">
    <el-card>
      <template #header>
        <span>提货记录</span>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="卡号">
          <el-input v-model="searchForm.card_no" placeholder="请输入卡号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="card_no" label="卡号" width="180" />
        <el-table-column label="商品信息" width="200">
          <template #default="{ row }">
            <div v-if="row.crabCard">
              {{ row.crabCard.product_name }}
              <br />
              <span style="color: #909399; font-size: 12px">
                {{ row.crabCard.product_specification }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="delivery_date" label="提货日期" width="120" />
        <el-table-column prop="shipping_contact" label="收货人" width="100" />
        <el-table-column prop="shipping_phone" label="联系电话" width="130" />
        <el-table-column prop="shipping_address" label="收货地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待发货</el-tag>
            <el-tag v-else-if="row.status === 'shipped'" type="primary">已发货</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 'cancelled'" type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tracking_number" label="物流单号" width="150" />
        <el-table-column prop="created_at" label="登记时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'pending' && isAdmin"
              link
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo?.role === 'admin')

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  card_no: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const fetchData = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/api/v1/deliveries',
      method: 'get',
      params: {
        ...searchForm,
        ...pagination
      }
    })
    tableData.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.card_no = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

const handleView = (row) => {
  ElMessage.info('查看详情功能待实现')
}

const handleShip = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入物流单号', '发货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入物流单号'
    })
    
    await request({
      url: `/api/v1/deliveries/${row.id}/ship`,
      method: 'post',
      data: { tracking_number: value }
    })
    
    ElMessage.success('发货成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.deliveries-list {
  padding: 0;
}

.search-form {
  margin-bottom: 20px;
}
</style>

