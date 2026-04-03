import request from './request'

export function login(data) {
  return request.post('/api/admin/auth/login/', data)
}

export function getMe() {
  return request.get('/api/admin/auth/me/')
}
