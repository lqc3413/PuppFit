/**
 * API 统一配置
 * 创建 axios 实例，配置基础 URL、超时、拦截器等
 */
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    baseURL: '', // 当前使用 Mock，无需 baseURL；后续可改为真实后端地址
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 自动添加 token
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
        // 统一处理业务错误码
        if (res.code !== 200) {
            console.error('API Error:', res.message)
            // 可以在这里添加全局错误提示
            return Promise.reject(new Error(res.message || '请求失败'))
        }
        return res
    },
    (error) => {
        console.error('Network Error:', error)
        return Promise.reject(error)
    }
)

export default request
