/**
 * HTTP 请求配置
 * 统一管理 axios 实例、请求拦截器、响应拦截器
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
    baseURL: '', // 使用 vite proxy 代理到后端，无需配置 baseURL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 请求拦截器
 * - 自动添加 token
 * - 可扩展：添加 loading、请求日志等
 */
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
        console.error('请求发送失败:', error)
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器
 * - 统一处理业务错误码
 * - 处理 HTTP 错误（401、403、500 等）
 * - 全局错误提示
 */
request.interceptors.response.use(
    (response) => {
        const res = response.data

        // 统一处理业务错误码
        if (res.code !== undefined && res.code !== 200) {
            // 显示错误提示
            ElMessage.error(res.message || '请求失败')

            // 特殊错误码处理
            switch (res.code) {
                case 401:
                    // Token 过期或未登录
                    handleUnauthorized()
                    break
                case 403:
                    // 权限不足
                    ElMessage.error('权限不足，无法访问')
                    break
                case 500:
                    // 服务器错误
                    ElMessage.error('服务器错误，请稍后重试')
                    break
            }

            return Promise.reject(new Error(res.message || '请求失败'))
        }

        return res
    },
    (error) => {
        console.error('网络请求错误:', error)

        // 处理 HTTP 错误状态码
        if (error.response) {
            const status = error.response.status

            switch (status) {
                case 401:
                    handleUnauthorized()
                    break
                case 403:
                    ElMessage.error('权限不足，无法访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误，请稍后重试')
                    break
                case 502:
                    ElMessage.error('网关错误')
                    break
                case 503:
                    ElMessage.error('服务不可用')
                    break
                case 504:
                    ElMessage.error('网关超时')
                    break
                default:
                    ElMessage.error(`请求失败: ${status}`)
            }
        } else if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络')
        } else if (!navigator.onLine) {
            ElMessage.error('网络连接已断开')
        } else {
            ElMessage.error('网络错误，请稍后重试')
        }

        return Promise.reject(error)
    }
)

/**
 * 处理未授权（401）情况
 * 清除本地存储并跳转到登录页
 */
function handleUnauthorized() {
    ElMessage.warning('登录已过期，请重新登录')

    // 清除用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('admin-token')

    // 获取当前路由判断跳转目标
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/admin')) {
        router.push({ path: '/admin/login', query: { redirect: currentPath } })
    } else {
        router.push({ path: '/login', query: { redirect: currentPath } })
    }
}

export default request
