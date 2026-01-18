/**
 * 教师端 API
 */
import request from './index'

/**
 * 获取学生列表及成绩
 * @returns {Promise} 学生列表（包含任务完成记录）
 */
export function getStudents() {
    return request.get('/api/teacher/students')
}

/**
 * 发布新任务
 * @param {Object} data - 任务数据
 * @param {string} data.title - 任务标题
 * @param {string} data.deadline - 截止日期
 * @param {Array} data.exercises - 运动项目列表 [{ type, target, unit, weight }]
 */
export function publishTask(data) {
    return request.post('/api/teacher/publish_task', data)
}

/**
 * 修改学生成绩
 * @param {Object} data - 成绩数据
 * @param {number} data.recordId - 任务记录 ID
 * @param {string} data.exerciseType - 运动项目类型
 * @param {number} data.newScore - 新成绩
 */
export function updateScore(data) {
    return request.post('/api/teacher/update_score', data)
}

/**
 * 更新教师个人资料
 * @param {Object} data - 教师资料数据
 */
export function updateProfile(data) {
    return request.post('/api/teacher/update', data)
}
