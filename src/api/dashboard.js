import request from './request'

export function getOverview() {
  return request.get('/api/admin/dashboard/overview/')
}
