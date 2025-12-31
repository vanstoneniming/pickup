<template>
  <div class="crab-cards-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>蟹卡列表</span>
          <el-button type="primary" @click="$router.push('/admin/crab-cards/import')">
            导入蟹卡
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="蟹卡编号">
          <el-input v-model="searchForm.card_no" placeholder="请输入蟹卡编号" clearable />
        </el-form-item>
        <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已作废" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="card_no" label="蟹卡编号" width="180" />
        <el-table-column prop="amount" label="面额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="商品名称" width="200" />
        <el-table-column prop="product_specification" label="商品规格" width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'unused'" type="success">未使用</el-tag>
            <el-tag v-else-if="row.status === 'used'" type="warning">已使用</el-tag>
            <el-tag v-else-if="row.status === 'cancelled'" type="danger">已作废</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="used_at" label="使用时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'unused'"
              link
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              作废
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

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

// 查询数据
const fetchData = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/api/v1/crab-cards',
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

const handleCancel = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入作废原因', '作废蟹卡', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入作废原因'
    })
    
    await request({
      url: `/api/v1/crab-cards/${row.id}/cancel`,
      method: 'post',
      data: { reason: value }
    })
    
    ElMessage.success('作废成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '作废失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.crab-cards-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>

