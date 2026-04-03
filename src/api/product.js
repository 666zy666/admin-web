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
  // Backend AdminProductDetailView only has MultiPartParser + FormParser (no JSONParser).
  // Convert plain object to FormData so the request is sent as multipart/form-data.
  if (data instanceof FormData) {
    return request.put(`/api/admin/products/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  const fd = new FormData()
  for (const [key, val] of Object.entries(data)) {
    if (val === null || val === undefined) continue
    if (typeof val === 'boolean') {
      fd.append(key, val ? 'true' : 'false')
    } else {
      fd.append(key, String(val))
    }
  }
  return request.put(`/api/admin/products/${id}/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}


export function deleteProduct(id) {
  return request.delete(`/api/admin/products/${id}/`)
}
