/**
 * 后端 API 请求工具
 * 使用 fetch API 发起请求
 */

const BASE_HEADERS = {
    'Content-Type': 'application/json'
}

/**
 * 获取带 Authorization 的请求头
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('admin-token')
    const headers = { ...BASE_HEADERS }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}

/**
 * 统一处理响应
 */
async function handleResponse(response) {
    if (!response.ok) {
        // 尝试解析错误响应体
        let errorData = {}
        try { errorData = await response.json() } catch (e) { /* 忽略 */ }
        const err = new Error(errorData.message || `HTTP ${response.status}`)
        err.status = response.status
        err.data = errorData
        throw err
    }
    const data = await response.json()
    return data
}

/**
 * GET 请求
 */
export async function apiGet(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    return handleResponse(response)
}

/**
 * POST 请求
 */
export async function apiPost(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    })
    return handleResponse(response)
}

/**
 * DELETE 请求
 */
export async function apiDelete(url) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    return handleResponse(response)
}

export default { get: apiGet, post: apiPost, delete: apiDelete }
