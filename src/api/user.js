import request from './request'

export function getUsers(params) {
  return request.get('/api/admin/users/', { params })
}

export function getUser(id) {
  return request.get(`/api/admin/users/${id}/`)
}

export function createUser(data) {
  return request.post('/api/admin/users/', data)
}

export function updateUser(id, data) {
  return request.patch(`/api/admin/users/${id}/`, data)
}

export function deleteUser(id) {
  return request.delete(`/api/admin/users/${id}/`)
}
