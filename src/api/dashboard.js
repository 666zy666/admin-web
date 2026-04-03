import request from './request'

export function getOverview() {
  return request.get('/api/admin/dashboard/overview/')
}

export function getOrderTrend() {
  // Backend endpoint: /api/admin/dashboard/trend/ (account/admin_urls.py)
  return request.get('/api/admin/dashboard/trend/')
}
