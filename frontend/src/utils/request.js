import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token，避免在拦截器中使用 composables
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果返回的状态码不是200，则视为错误
    if (res.code !== 200) {
      // 卡密验证接口的错误不显示通用错误消息，由组件处理
      if (!response.config.url.includes('/crab-cards/verify')) {
        ElMessage.error(res.message || '请求失败')
      }
      
      // 401: 未授权，跳转到登录页（仅当不是卡密验证接口时）
      if (res.code === 401 && !response.config.url.includes('/crab-cards/verify')) {
        // 清除 token 并跳转到登录页
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    let message = '请求失败'
    
    if (error.response) {
      const status = error.response.status
      const url = error.config?.url || ''
      
      switch (status) {
        case 401:
          // 卡密验证接口的 401 是密码错误，不需要跳转登录
          if (url.includes('/crab-cards/verify')) {
            message = error.response.data?.message || '密码错误'
          } else {
            message = '未授权，请重新登录'
            // 清除 token 并跳转到登录页
            localStorage.removeItem('token')
            router.push('/login')
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || `连接错误${status}`
      }
    } else {
      message = '网络连接失败'
    }
    
    // 卡密验证接口的错误不显示通用错误消息，由组件处理
    if (!error.config?.url.includes('/crab-cards/verify')) {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default request

