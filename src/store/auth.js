import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getMe } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username, password) {
    const res = await loginApi({ username, password })
    const data = res.data
    token.value = data.token
    userInfo.value = {
      user_id: data.user_id,
      username: data.username,
      is_staff: data.is_staff
    }
    localStorage.setItem('admin_token', data.token)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
  }

  async function fetchMe() {
    const res = await getMe()
    userInfo.value = res.data
  }

  return { token, userInfo, isLoggedIn, login, logout, fetchMe }
})
