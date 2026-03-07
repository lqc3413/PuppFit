<template>
  <div class="task-assign-page">
    <header class="section-header">
      <h2>发布运动任务 🐶</h2>
      <p>为学生布置仰卧起坐/体能测试任务（通过机器狗设备执行）</p>
    </header>

    <div class="form-card">
      <div class="form-group">
        <label>选择学生 *</label>
        <select v-model="form.user_id" @change="onStudentChange">
          <option value="">请选择学生</option>
          <option v-for="s in studentList" :key="s.id" :value="s.studentId">
            {{ s.name }}（{{ s.studentId }} · {{ s.className }}）
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>选择设备 *</label>
        <div v-if="loadingDevices" class="device-loading">
          🔍 正在查询该学生绑定的设备...
        </div>
        <select v-else-if="studentDevices.length > 0" v-model="form.device_id">
          <option value="">请选择设备</option>
          <option v-for="d in studentDevices" :key="d.device_id" :value="d.device_id">
            {{ d.device_name || d.device_id }}（{{ d.device_id }}）{{ d.status === 'online' ? ' ✅在线' : ' ⚪离线' }}
          </option>
        </select>
        <div v-else-if="form.user_id && !loadingDevices" class="device-empty">
          ⚠️ 该学生暂未绑定任何设备，请通知家长先在 App 中绑定设备
        </div>
        <div v-else class="device-placeholder">
          请先选择学生
        </div>
      </div>

      <div class="form-group">
        <label>运动类型</label>
        <select v-model="form.exercise_type">
          <option v-for="et in exerciseTypeOptions" :key="et.value" :value="et.value">
            {{ et.label }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>目标次数</label>
          <div class="input-with-unit">
            <input v-model.number="form.target_count" type="number" min="1" placeholder="30" />
            <span class="unit-label">{{ currentUnit }}</span>
          </div>
        </div>
        <div class="form-group">
          <label>时限</label>
          <div class="input-with-unit">
            <input v-model.number="form.duration_limit" type="number" min="10" placeholder="60" />
            <span class="unit-label">秒</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-submit" @click="publishTask" :disabled="submitting || !form.device_id || !form.user_id">
          {{ submitting ? '发布中...' : '确认发布' }}
        </button>
      </div>
    </div>

    <!-- 已发布待完成任务列表 -->
    <div class="pending-section">
      <header class="section-header">
        <h2>学生待办任务 📝</h2>
        <p>已发布的运动任务，等待学生在机器狗上完成</p>
      </header>

      <div v-if="pendingTaskList.length === 0" class="no-pending">
        <span class="emoji">🎉</span>
        <span>暂无待办任务</span>
      </div>

      <div class="tasks-list" v-else>
        <div v-for="task in pendingTaskList" :key="task.id" class="task-card">
          <div class="task-card-header">
            <div class="task-icon">🐶</div>
            <div class="task-info">
              <span class="task-title">{{ task.exerciseLabel || task.exercise_type }}</span>
              <span class="task-meta">目标 {{ task.target_count }}个 · 时限 {{ task.duration_limit }}秒</span>
            </div>
            <div class="task-status-tag" :class="task.status">
              {{ task.status === 'created' ? '待完成' : task.status === 'running' ? '进行中' : task.status }}
            </div>
          </div>
          <div class="task-card-body">
            <span class="task-detail">👤 {{ task.studentName || task.user_id }}</span>
            <span class="task-detail">📱 {{ task.deviceName || task.device_id }}</span>
            <span class="task-detail">📅 {{ task.deadline || task.createdAt || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

// 运动类型选项（从后端动态获取）
const exerciseTypeOptions = ref([])

// 从后端获取运动项目列表
const fetchExerciseTypes = async () => {
  try {
    const res = await apiGet('/api/admin/exercise-types')
    if (res.code === 200) {
      const list = res.data.exercises || res.data || []
      const activeList = list.filter(e => e.status === 'active' || !e.status)
      exerciseTypeOptions.value = activeList.map(e => ({
        value: e.name,
        label: e.name,
        unit: e.unit || '个'
      }))
      // 默认选中第一个
      if (!form.value.exercise_type && exerciseTypeOptions.value.length > 0) {
        form.value.exercise_type = exerciseTypeOptions.value[0].value
      }
    } else {
      console.warn('获取运动项目返回非200:', res)
    }
  } catch (err) {
    console.error('获取运动项目列表失败:', err.message || err)
  }
}

const studentList = ref([])
const studentDevices = ref([])  // 当前选中学生的绑定设备
const loadingDevices = ref(false)

const form = ref({
  device_id: '',
  user_id: '',
  exercise_type: '',
  target_count: 30,
  duration_limit: 60
})

const submitting = ref(false)
const pendingTaskList = ref([])

const currentUnit = computed(() => {
  const et = exerciseTypeOptions.value.find(e => e.value === form.value.exercise_type)
  return et ? et.unit : '个'
})

// 选择学生后自动查询绑定设备
const onStudentChange = async () => {
  form.value.device_id = ''
  studentDevices.value = []
  const userId = form.value.user_id
  if (!userId) return

  loadingDevices.value = true
  try {
    const res = await apiGet(`/api/devices/list/${userId}`)
    if (res.code === 200 && res.data?.length > 0) {
      studentDevices.value = res.data
      // 如果只有一个设备，自动选中
      if (res.data.length === 1) {
        form.value.device_id = res.data[0].device_id
      }
    }
  } catch (err) {
    console.error('获取学生设备失败:', err)
  } finally {
    loadingDevices.value = false
  }
}

// 获取学生列表（用于下拉选择）
const fetchStudents = async () => {
  try {
    const res = await apiGet('/api/teacher/students')
    if (res.code === 200) {
      studentList.value = res.data
    }
  } catch (err) {
    console.error('获取学生列表失败:', err)
  }
}

// 获取已发布的待完成任务（使用正确的 /api/teacher/tasks 接口）
const fetchPendingTasks = async () => {
  try {
    const res = await apiGet('/api/teacher/tasks?limit=50')
    console.log('[PendingTasks] 后端返回:', JSON.stringify(res).slice(0, 800))
    if (res.code === 200) {
      const rawData = res.data
      // 后端可能返回数组或 { tasks: [...] } 格式
      const tasks = Array.isArray(rawData) ? rawData : (rawData.tasks || rawData.list || [])
      
      // 将任务列表处理并匹配学生信息
      pendingTaskList.value = tasks.map(t => {
        const student = studentList.value.find(s => 
          s.studentId === t.user_id || s.id === t.user_id
        )
        // 匹配运动类型名称
        const et = exerciseTypeOptions.value.find(e => e.value === t.exercise_type)
        return {
          ...t,
          studentName: student?.name || t.user_name || t.user_id || '未知',
          deviceName: t.device_name || t.device_id || '-',
          exerciseLabel: et?.label || t.exercise_type || '运动任务'
        }
      })
    }
  } catch (err) {
    console.error('获取待办任务失败:', err)
  }
}

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchExerciseTypes()])
  // 确保有默认选中的运动类型
  if (!form.value.exercise_type && exerciseTypeOptions.value.length > 0) {
    form.value.exercise_type = exerciseTypeOptions.value[0].value
  }
  fetchPendingTasks()
})

const publishTask = async () => {
  if (!form.value.device_id) {
    alert('请选择设备')
    return
  }
  if (!form.value.user_id) {
    alert('请选择学生')
    return
  }

  submitting.value = true
  try {
    const res = await apiPost('/api/teacher/publish_task', {
      device_id: form.value.device_id.trim(),
      user_id: form.value.user_id,
      exercise_type: form.value.exercise_type,
      target_count: form.value.target_count,
      duration_limit: form.value.duration_limit
    })

    if (res.code === 200) {
      console.log('[PublishTask] 发布成功，后端返回:', JSON.stringify(res.data).slice(0, 300))
      
      alert('任务发布成功！')
      // 重置表单
      form.value = {
        device_id: '',
        user_id: '',
        exercise_type: exerciseTypeOptions.value.length > 0 ? exerciseTypeOptions.value[0].value : '',
        target_count: 30,
        duration_limit: 60
      }
      studentDevices.value = []
      // 后端 publish_task 和 tasks 数据已互通（2026-03-06 验证），直接刷新列表
      await fetchPendingTasks()
    } else {
      alert(res.message || '发布失败')
    }
  } catch (e) {
    console.error(e)
    alert('发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  color: #0F172A; /* Slate 900 */
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 20px;
}

.section-header p {
  color: #64748B; /* Slate 500 */
  font-size: 14px;
}

.form-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #E2E8F0; /* Slate 200 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  max-width: 700px;
}

.form-group {
  margin-bottom: 20px;
}

.device-loading {
  padding: 10px 14px;
  font-size: 13px;
  color: #4F46E5;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 6px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.device-empty {
  padding: 10px 14px;
  font-size: 13px;
  color: #D97706;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 6px;
}

.device-placeholder {
  padding: 10px 14px;
  font-size: 13px;
  color: #94A3B8;
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 6px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #334155; /* Slate 700 */
}

input, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #CBD5E1; /* Slate 300 */
  border-radius: 6px;
  font-size: 14px;
  color: #0F172A;
  transition: all 0.15s ease-in-out;
  box-sizing: border-box;
  background-color: #fff;
}

input:focus, select:focus {
  border-color: #4F46E5; /* Indigo 600 */
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.field-hint {
  display: block;
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

/* 日期选择器 */
.date-selects {
  display: flex;
  gap: 12px;
}

.date-selects select {
  flex: 1;
}

/* 多运动项目区域 */
.exercises-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #F8FAFC; /* Slate 50 */
  border: 1px solid #E2E8F0;
  border-radius: 6px;
}

.exercises-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercises-header label {
  margin-bottom: 0;
}

.btn-add {
  background: white;
  color: #0F172A;
  border: 1px solid #CBD5E1;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.btn-add:hover {
  background: #F1F5F9;
  border-color: #94A3B8;
}

.exercise-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: center; /* 子元素居中 */
}

.exercise-row select {
  width: 120px;
  flex-shrink: 0;
}

/* 响应式调整：手机端 */
@media (max-width: 480px) {
  .exercise-row {
    background: white;
    padding: 12px;
    border-radius: 8px;
    border: 1px dashed #e8e8e8;
  }
  
  .exercise-row select {
    width: 100%; /* 占满一行 */
  }
  
  .input-with-unit {
    flex: 1; /* 均分剩余空间 */
    min-width: 100px; /* 防止过窄 */
  }
  
  .weight-input {
    max-width: none; /* 取消最大宽度限制 */
  }
}

.input-with-unit {
  position: relative;
  width: 140px; /* PC端固定宽度，避免过长 */
}

.input-with-unit input {
  padding-right: 30px; /* 防止文字遮挡单位 */
}

.weight-input {
  width: 120px;
}

.unit-label {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
}

.btn-remove {
  background: transparent;
  color: #EF4444; /* Red 500 */
  border: 1px solid transparent;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.btn-remove:hover {
  background: #FEF2F2; /* Red 50 */
  border-color: #FCA5A5; /* Red 300 */
}

.weight-hint {
  font-size: 12px;
  color: #10B981; /* Emerald 500 */
  margin-top: 8px;
}

.weight-hint.error {
  color: #EF4444; /* Red 500 */
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background: #4F46E5; /* Indigo 600 */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 12px;
}

.btn-submit:hover {
  background: #4338CA; /* Indigo 700 */
}

.btn-submit:disabled {
  background: #CBD5E1; /* Slate 300 */
  cursor: not-allowed;
}

/* 学生待办任务区域 */
.pending-section {
  margin-top: 48px;
}

.pending-section .section-header {
  margin-bottom: 24px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E2E8F0;
  transition: all 0.15s ease-in-out;
}

.task-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.task-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.task-card-header .task-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: #EEF2FF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.task-status-tag.created {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.task-status-tag.running {
  background: #EEF2FF;
  color: #4F46E5;
  border: 1px solid #C7D2FE;
}

.task-card-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-left: 52px;
}

.task-detail {
  font-size: 13px;
  color: #64748B;
}

.student-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  transition: all 0.15s ease-in-out;
  position: relative;
  overflow: hidden;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #CBD5E1;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  background: #EEF2FF; /* Indigo 50 */
  color: #4F46E5; /* Indigo 600 */
  border-radius: 6px; /* Squircle */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.student-info {
  flex: 1;
}

.student-info h4 {
  margin: 0 0 2px 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.student-class {
  font-size: 12px;
  color: #64748B;
  display: inline-block;
  background: #F8FAFC;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #E2E8F0;
}

.pending-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #F0FDF4; /* Green 50 */
  color: #16A34A; /* Green 600 */
  border: 1px solid #BBF7D0; /* Green 200 */
  transition: all 0.15s;
}

.pending-badge.warning {
  background: #FFFBEB; /* Amber 50 */
  color: #D97706; /* Amber 600 */
  border-color: #FDE68A; /* Amber 200 */
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: #F8FAFC;
  border-radius: 6px;
  transition: background 0.15s;
  border: 1px solid #E2E8F0;
}

.pending-item:hover {
  background: #fff;
  border-color: #CBD5E1;
}

.task-icon {
  font-size: 16px;
  background: #fff;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E2E8F0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.task-meta {
  font-size: 12px;
  color: #999;
}

.task-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.flag-tag {
  font-size: 11px;
  color: #D97706;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  padding: 1px 6px;
  border-radius: 4px;
}

.no-pending {
  text-align: center;
  padding: 32px 0;
  color: #999;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px dashed #e8e8e8;
}

.no-pending .emoji {
  font-size: 32px;
  margin-bottom: 4px;
}

@media (max-width: 600px) {
  .students-grid {
    grid-template-columns: 1fr;
  }
}
</style>
