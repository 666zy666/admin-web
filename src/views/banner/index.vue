<template>
  <div class="banner-page">
    <h2 class="page-title">轮播图管理</h2>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标题/链接"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.is_active" placeholder="全部" clearable style="width: 120px">
            <el-option label="上线" value="true" />
            <el-option label="下线" value="false" />
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
        <span class="table-title">轮播图列表</span>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建轮播图</el-button>
      </div>

      <el-table v-loading="loading" :data="bannerList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="图片" width="130">
          <template #default="{ row }">
            <!--
              Backend returns absolute URL via request.build_absolute_uri().
              normalizeImageUrl() also handles relative-path fallback.
            -->
            <el-image
              v-if="row.image"
              :src="normalizeImageUrl(row.image)"
              fit="cover"
              style="width: 100px; height: 56px; border-radius: 4px"
              :preview-src-list="[normalizeImageUrl(row.image)]"
              preview-teleported
            />
            <span v-else class="no-image">无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
        <!-- Backend field name: link (not link_url) -->
        <el-table-column prop="link" label="链接" min-width="160" show-overflow-tooltip />
        <!-- Backend field name: order (not sort_order) -->
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              active-text="上线"
              inactive-text="下线"
              :loading="row._toggling"
              @change="handleToggle(row)"
            />
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
          @size-change="fetchBanners"
          @current-change="fetchBanners"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '新建轮播图'"
      width="560px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <!-- Backend field: link (not link_url) -->
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="form.link" placeholder="https://..." />
        </el-form-item>
        <!-- Backend field: order (not sort_order) -->
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.is_active" active-text="上线" inactive-text="下线" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <div class="upload-area">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept="image/*"
            >
              <el-button type="default" :icon="Upload">选择图片</el-button>
            </el-upload>
            <span v-if="imageFile" class="file-name">{{ imageFile.name }}</span>
            <!--
              Show existing image preview when editing and no new file selected yet.
              normalizeImageUrl() handles absolute and relative paths from backend.
            -->
            <el-image
              v-else-if="isEdit && form.imagePreview"
              :src="normalizeImageUrl(form.imagePreview)"
              fit="cover"
              style="width: 120px; height: 68px; margin-left: 10px; border-radius: 4px; vertical-align: middle"
            />
          </div>
        </el-form-item>
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
import { Search, Plus, Upload } from '@element-plus/icons-vue'
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus } from '@/api/banner'
import { formatDate } from '@/utils/format'
import { normalizeImageUrl } from '@/utils/image'

const loading = ref(false)
const bannerList = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const searchForm = reactive({ keyword: '', is_active: '' })

async function fetchBanners() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword
    }
    if (searchForm.is_active !== '') {
      params.is_active = searchForm.is_active
    }
    const res = await getBanners(params)
    bannerList.value = (res.data.results || []).map((b) => ({ ...b, _toggling: false }))
    pagination.total = res.data.count
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchBanners()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.is_active = ''
  handleSearch()
}

// Toggle status
async function handleToggle(row) {
  row._toggling = true
  try {
    await toggleBannerStatus(row.id, row.is_active)
    ElMessage.success(row.is_active ? '已上线' : '已下线')
  } catch {
    row.is_active = !row.is_active
  } finally {
    row._toggling = false
  }
}

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)
const imageFile = ref(null)
const uploadRef = ref(null)

const emptyForm = () => ({
  title: '',
  link: '',        // backend field name: link
  order: 0,        // backend field name: order
  is_active: true,
  imagePreview: ''
})

const form = reactive(emptyForm())

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

function handleFileChange(file) {
  imageFile.value = file.raw
}

function openCreateDialog() {
  isEdit.value = false
  editingId.value = null
  imageFile.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  editingId.value = row.id
  imageFile.value = null
  Object.assign(form, {
    title: row.title || '',
    link: row.link || '',          // backend field: link
    order: row.order ?? 0,         // backend field: order
    is_active: row.is_active !== false,
    imagePreview: row.image || ''  // row.image is absolute URL from backend
  })
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, emptyForm())
  imageFile.value = null
  editingId.value = null
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      const payload = {
        title: form.title,
        link: form.link,          // backend field: link
        order: form.order,        // backend field: order
        is_active: form.is_active
      }
      if (imageFile.value) {
        const fd = new FormData()
        for (const [k, v] of Object.entries(payload)) fd.append(k, v)
        // Backend BannerSerializer write-only image field is 'image_upload' (source='image')
        fd.append('image_upload', imageFile.value)
        await updateBanner(editingId.value, fd)
      } else {
        await updateBanner(editingId.value, payload)
      }
      ElMessage.success('轮播图更新成功')
    } else {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('link', form.link)            // backend field: link
      fd.append('order', String(form.order))  // backend field: order
      fd.append('is_active', form.is_active ? 'true' : 'false')
      if (imageFile.value) {
        // Backend write-only image field is named 'image_upload'
        fd.append('image_upload', imageFile.value)
      }
      await createBanner(fd)
      ElMessage.success('轮播图创建成功')
    }
    dialogVisible.value = false
    fetchBanners()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除轮播图「${row.title}」吗？此操作不可撤销。`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await deleteBanner(row.id)
    ElMessage.success('删除成功')
    fetchBanners()
  } catch {
    // handled by interceptor
  }
}

onMounted(fetchBanners)
</script>

<style scoped>
.banner-page {
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

.no-image {
  font-size: 12px;
  color: #909399;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.file-name {
  font-size: 13px;
  color: #606266;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
