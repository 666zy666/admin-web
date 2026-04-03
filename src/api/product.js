import request from './request'

export function getProducts(params) {
  return request.get('/api/admin/products/', { params })
}

export function getProduct(id) {
  return request.get(`/api/admin/products/${id}/`)
}

export function createProduct(formData) {
  return request.post('/api/admin/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateProduct(id, data) {
  return request.put(`/api/admin/products/${id}/`, data)
}

export function deleteProduct(id) {
  return request.delete(`/api/admin/products/${id}/`)
}
