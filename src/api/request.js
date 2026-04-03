import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers['Authorization'] = `Token ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401 || status === 403) {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      const msg =
        error.response.data?.detail ||
        error.response.data?.message ||
        `请求失败 (${status})`
      ElMessage.error(msg)
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
