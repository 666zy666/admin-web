import request from './request'

export function getUsers(params) {
  return request.get('/api/admin/users/', { params })
}

export function getUser(id) {
  return request.get(`/api/admin/users/${id}/`)
}

export function updateUser(id, data) {
  return request.patch(`/api/admin/users/${id}/`, data)
}
