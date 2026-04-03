import request from './request'

export function getOrders(params) {
  return request.get('/api/admin/orders/', { params })
}

export function getOrder(id) {
  return request.get(`/api/admin/orders/${id}/`)
}

export function updateOrderStatus(id, data) {
  return request.patch(`/api/admin/orders/${id}/status/`, data)
}
