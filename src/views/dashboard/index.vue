<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in statCards" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon size="28" color="#fff"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview[stat.key] ?? '-' }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20" v-if="overview.order_status_counts">
      <template #header>
        <span>订单状态分布</span>
      </template>
      <el-table :data="orderStatusList" border stripe>
        <el-table-column prop="label" label="状态" />
        <el-table-column prop="count" label="数量" />
      </el-table>
    </el-card>

    <el-result
      v-if="error"
      icon="error"
      title="加载失败"
      sub-title="无法获取仪表盘数据，请检查网络连接"
    >
      <template #extra>
        <el-button type="primary" @click="fetchData">重新加载</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOverview } from '@/api/dashboard'

const loading = ref(false)
const error = ref(false)
const overview = ref({})

const ORDER_STATUS_LABELS = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  pending_receipt: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}

const statCards = [
  { key: 'total_users', label: '总用户数', icon: 'User', color: '#409eff' },
  { key: 'total_products', label: '总商品数', icon: 'Goods', color: '#67c23a' },
  { key: 'total_orders', label: '总订单数', icon: 'List', color: '#e6a23c' },
  { key: 'total_revenue', label: '总收入 (元)', icon: 'Money', color: '#f56c6c' },
  { key: 'today_new_users', label: '今日新增用户', icon: 'UserFilled', color: '#909399' },
  { key: 'today_orders', label: '今日订单数', icon: 'Document', color: '#6f42c1' },
  { key: 'today_revenue', label: '今日收入 (元)', icon: 'Wallet', color: '#17a2b8' }
]

const orderStatusList = computed(() => {
  const counts = overview.value.order_status_counts || {}
  return Object.entries(counts).map(([key, count]) => ({
    label: ORDER_STATUS_LABELS[key] || key,
    count
  }))
})

async function fetchData() {
  loading.value = true
  error.value = false
  try {
    const res = await getOverview()
    overview.value = res.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.dashboard {
  padding: 4px;
}

.page-title {
  margin: 0 0 20px;
  font-size: 20px;
  color: #303133;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
