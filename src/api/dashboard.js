import request from './request'

export function getOverview() {
  return request.get('/api/admin/dashboard/overview/')
}

export function getOrderTrend() {
  return request.get('/api/admin/dashboard/order-trend/')
}
