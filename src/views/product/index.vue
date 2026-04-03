<template>
  <div class="product-page">
    <h2 class="page-title">商品管理</h2>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称/品牌"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
          </el-select>
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
        <span class="table-title">商品列表</span>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建商品</el-button>
      </div>

      <el-table v-loading="loading" :data="productList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="价格 (元)" width="120">
          <template #default="{ row }">{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="110" show-overflow-tooltip />
        <el-table-column label="卖家" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.seller_username || '-' }}</template>
        </el-table-column>
        <el-table-column label="分类" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.category_name || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
          @size-change="fetchProducts"
          @current-change="fetchProducts"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新建商品'"
      width="680px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入商品标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号" prop="model_number">
              <el-input v-model="form.model_number" placeholder="型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机械类型" prop="machinery_type">
              <el-input v-model="form.machinery_type" placeholder="机械类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产年份" prop="manufacture_year">
              <el-input-number v-model="form.manufacture_year" :min="1900" :max="2100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作小时" prop="working_hours">
              <el-input-number v-model="form.working_hours" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在省份" prop="location_province">
              <el-input v-model="form.location_province" placeholder="省份" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在城市" prop="location_city">
              <el-input v-model="form.location_city" placeholder="城市" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成色" prop="condition_level">
              <el-input v-model="form.condition_level" placeholder="成色" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="isEdit">
            <el-form-item label="上架状态">
              <el-switch v-model="form.is_active" active-text="上架" inactive-text="下架" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="商品描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api/product'
import { formatDate } from '@/utils/format'

const loading = ref(false)
const productList = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const searchForm = reactive({ keyword: '', status: '' })

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getProducts({
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    productList.value = res.data.results
    pagination.total = res.data.count
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchProducts()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const emptyForm = () => ({
  title: '',
  price: 0,
  description: '',
  machinery_type: '',
  brand: '',
  model_number: '',
  manufacture_year: null,
  working_hours: null,
  location_province: '',
  location_city: '',
  condition_level: '',
  is_active: true
})

const form = reactive(emptyForm())

const rules = {
  title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

function openCreateDialog() {
  isEdit.value = false
  editingId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(form, {
    title: row.title || '',
    price: row.price || 0,
    description: row.description || '',
    machinery_type: row.machinery_type || '',
    brand: row.brand || '',
    model_number: row.model_number || '',
    manufacture_year: row.manufacture_year || null,
    working_hours: row.working_hours || null,
    location_province: row.location_province || '',
    location_city: row.location_city || '',
    condition_level: row.condition_level || '',
    is_active: row.is_active !== false
  })
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, emptyForm())
  editingId.value = null
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      const payload = { ...form }
      if (payload.manufacture_year === null) delete payload.manufacture_year
      if (payload.working_hours === null) delete payload.working_hours
      await updateProduct(editingId.value, payload)
      ElMessage.success('商品更新成功')
    } else {
      const fd = new FormData()
      for (const [key, val] of Object.entries(form)) {
        if (val !== null && val !== '' && key !== 'is_active') {
          fd.append(key, val)
        }
      }
      await createProduct(fd)
      ElMessage.success('商品创建成功')
    }
    dialogVisible.value = false
    fetchProducts()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除商品「${row.title}」吗？此操作不可撤销。`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch {
    // handled by interceptor
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.product-page {
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
</style>
