/**
 * 认证相关 API
 */
import request from './index'

/**
 * 用户登录
 * @param {Object} data - { username, password, type }
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.type - 用户类型: 'parent' | 'teacher' | 'admin'
 */
export function login(data) {
    return request.post('/api/auth/login', data)
}

/**
 * 退出登录（清除本地存储）
 */
export function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
}
