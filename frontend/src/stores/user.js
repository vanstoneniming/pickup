import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getCurrentUser } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  // 是否已登录
  const isLoggedIn = ref(!!token.value)

  // 登录
  async function loginUser(username, password) {
    try {
      const response = await login({ username, password })
      token.value = response.data.token
      userInfo.value = response.data.user
      isLoggedIn.value = true
      localStorage.setItem('token', token.value)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  // 获取当前用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const response = await getCurrentUser()
      userInfo.value = response.data
    } catch (error) {
      logout()
    }
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginUser,
    logout,
    fetchUserInfo
  }
})

