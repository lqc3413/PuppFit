/**
 * 家长端 API
 */
import request from './index'

/**
 * 获取任务列表（待办 + 已完成）
 * @returns {Promise} { pending: Task[], completed: TaskRecord[] }
 */
export function getTasks() {
    return request.get('/api/parent/tasks')
}

/**
 * 更新个人资料
 * @param {Object} data - 用户资料数据
 */
export function updateProfile(data) {
    return request.post('/api/parent/update', data)
}

/**
 * 语音上传（模拟）
 * @param {FormData} formData - 包含音频文件的 FormData
 */
export function uploadVoice(formData) {
    return request.post('/api/voice/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
