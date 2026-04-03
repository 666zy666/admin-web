<template>
  <div class="order-page">
    <h2 class="page-title">订单管理</h2>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="订单号/买家/商品"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 130px">
            <el-option
              v-for="(label, val) in STATUS_LABELS"
              :key="val"
              :label="label"
              :value="val"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card class="mt-16">
      <div class="toolbar">
        <span class="table-title">订单列表</span>
        <el-tooltip content="不支持新建订单" placement="top">
          <el-button type="primary" :icon="Plus" disabled>新建订单</el-button>
        </el-tooltip>
      </div>

      <el-table v-loading="loading" :data="orderList" border stripe style="width: 100%">
        <el-table-column prop="order_no" label="订单号" min-width="160" show-overflow-tooltip />
        <el-table-column label="买家" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.buyer?.username || '-' }}</template>
        </el-table-column>
        <el-table-column label="卖家" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.seller?.username || '-' }}</template>
        </el-table-column>
        <el-table-column label="商品" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.product?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="金额 (元)" width="110">
          <template #default="{ row }">{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ STATUS_LABELS[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" plain @click="openDetailDrawer(row)">详情</el-button>
            <el-button type="primary" size="small" @click="openStatusDialog(row)">改状态</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchOrders"
          @current-change="fetchOrders"
        />
      </div>
    </el-card>

    <!-- Detail Drawer -->
    <el-drawer v-model="detailDrawerVisible" title="订单详情" size="480px">
      <div v-if="detailLoading" class="drawer-loading">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
      </div>
      <template v-else-if="currentOrder">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentOrder.status)" size="small">
              {{ STATUS_LABELS[currentOrder.status] || currentOrder.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="买家">{{ currentOrder.buyer?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="卖家">{{ currentOrder.seller?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ currentOrder.product?.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ currentOrder.price }} 元</el-descriptions-item>
          <el-descriptions-item label="快递公司">{{ currentOrder.shipping_company || '-' }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ currentOrder.tracking_number || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentOrder.updated_at) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>

    <!-- Edit Status Dialog -->
    <el-dialog v-model="statusDialogVisible" title="修改订单状态" width="420px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="当前状态">
          <el-tag :type="statusTagType(statusForm.currentStatus)" size="small">
            {{ STATUS_LABELS[statusForm.currentStatus] || statusForm.currentStatus }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option
              v-for="(label, val) in STATUS_LABELS"
              :key="val"
              :label="label"
              :value="val"
            />
          </el-select>
        </el-form-item>
        <template v-if="statusForm.status === 'pending_receipt'">
          <el-form-item label="快递公司">
            <el-input v-model="statusForm.shipping_company" placeholder="快递公司名称" />
          </el-form-item>
          <el-form-item label="快递单号">
            <el-input v-model="statusForm.tracking_number" placeholder="快递单号" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusLoading" @click="handleStatusUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getOrders, getOrder, updateOrderStatus } from '@/api/order'
import { formatDate } from '@/utils/format'

const STATUS_LABELS = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  pending_receipt: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}

function statusTagType(status) {
  const map = {
    pending_payment: 'warning',
    pending_shipment: 'primary',
    pending_receipt: '',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const loading = ref(false)
const orderList = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const searchForm = reactive({ keyword: '', status: '' })
const dateRange = ref([])

async function fetchOrders() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
      start_date: dateRange.value?.[0] || '',
      end_date: dateRange.value?.[1] || ''
    }
    const res = await getOrders(params)
    orderList.value = res.data.results
    pagination.total = res.data.count
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchOrders()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  dateRange.value = []
  handleSearch()
}

// Detail Drawer
const detailDrawerVisible = ref(false)
const detailLoading = ref(false)
const currentOrder = ref(null)

async function openDetailDrawer(row) {
  detailDrawerVisible.value = true
  detailLoading.value = true
  currentOrder.value = null
  try {
    const res = await getOrder(row.id)
    currentOrder.value = res.data
  } finally {
    detailLoading.value = false
  }
}

// Status Dialog
const statusDialogVisible = ref(false)
const statusLoading = ref(false)
const statusForm = reactive({
  id: null,
  currentStatus: '',
  status: '',
  tracking_number: '',
  shipping_company: ''
})

function openStatusDialog(row) {
  statusForm.id = row.id
  statusForm.currentStatus = row.status
  statusForm.status = row.status
  statusForm.tracking_number = row.tracking_number || ''
  statusForm.shipping_company = row.shipping_company || ''
  statusDialogVisible.value = true
}

async function handleStatusUpdate() {
  statusLoading.value = true
  try {
    const payload = { status: statusForm.status }
    if (statusForm.status === 'pending_receipt') {
      payload.tracking_number = statusForm.tracking_number
      payload.shipping_company = statusForm.shipping_company
    }
    await updateOrderStatus(statusForm.id, payload)
    ElMessage.success('订单状态更新成功')
    statusDialogVisible.value = false
    fetchOrders()
  } finally {
    statusLoading.value = false
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.order-page {
  padding: 4px;
}

.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #303133;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 4px;
}

.mt-16 {
  margin-top: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.drawer-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
