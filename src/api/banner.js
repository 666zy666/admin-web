import request from './request'

export function getBanners(params) {
  return request.get('/api/admin/banners/', { params })
}

export function getBanner(id) {
  return request.get(`/api/admin/banners/${id}/`)
}

export function createBanner(formData) {
  return request.post('/api/admin/banners/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateBanner(id, data) {
  const isFormData = data instanceof FormData
  return request.put(`/api/admin/banners/${id}/`, data, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {})
}

export function deleteBanner(id) {
  return request.delete(`/api/admin/banners/${id}/`)
}

export function toggleBannerStatus(id, is_active) {
  // Backend AdminBannerDetailView has no PATCH handler; use PUT with partial=True support.
  return request.put(`/api/admin/banners/${id}/`, { is_active })
}
