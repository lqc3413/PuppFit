<template>
  <div class="task-assign-page">
    <header class="section-header">
      <h2>发布新任务 📝</h2>
      <p>为班级同学布置新的运动挑战（可包含多项运动）</p>
    </header>

    <div class="form-card">
      <div class="form-group">
        <label>任务标题</label>
        <input v-model="form.title" type="text" placeholder="例如：第一周体能测试" />
      </div>

      <div class="form-group">
        <label>截止日期</label>
        <div class="date-selects">
          <select v-model="form.year">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="form.month">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
          </select>
          <select v-model="form.day">
            <option v-for="d in daysInMonth" :key="d" :value="d">{{ d }}日</option>
          </select>
        </div>
      </div>

      <!-- 多项运动列表 -->
      <div class="exercises-section">
        <div class="exercises-header">
          <label>运动项目</label>
          <button class="btn-add" @click="addExercise">+ 添加运动</button>
        </div>

        <div v-for="(exercise, index) in form.exercises" :key="index" class="exercise-row">
          <select v-model="exercise.type" @change="onExerciseTypeChange(exercise)">
            <option v-for="et in activeExerciseTypes" :key="et.id" :value="et.name">{{ et.name }}</option>
          </select>
          
          <div class="input-with-unit">
            <input v-model.number="exercise.target" type="number" placeholder="目标" />
            <span class="unit-label">{{ getExerciseUnit(exercise.type) }}</span>
          </div>
          
          <div class="input-with-unit weight-input">
            <input v-model.number="exercise.weight" type="number" step="0.1" min="0" max="1" placeholder="权重" />
            <span class="unit-label">权重</span>
          </div>
          
          <button class="btn-remove" @click="removeExercise(index)" v-if="form.exercises.length > 1">×</button>
        </div>

        <div class="weight-hint" :class="{ error: totalWeight !== 1 }">
          权重总和: {{ totalWeight.toFixed(1) }} {{ totalWeight === 1 ? '✓' : '(需要等于 1.0)' }}
        </div>
      </div>

      <div class="form-group">
        <label>分配对象</label>
        <select disabled>
          <option>三年级二班 (全体)</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="btn-submit" @click="publishTask" :disabled="submitting || totalWeight !== 1">
          {{ submitting ? '发布中...' : '确认发布' }}
        </button>
      </div>
    </div>

    <!-- 学生待办任务列表 -->
    <div class="pending-section">
      <header class="section-header">
        <h2>学生待办任务 📝</h2>
        <p>查看每位学生的未完成任务</p>
      </header>

      <div class="students-grid">
        <div v-for="student in studentsPending" :key="student.studentId" class="student-card">
          <div class="student-header">
            <div class="student-avatar">{{ student.studentName[0] }}</div>
            <div class="student-info">
              <h4>{{ student.studentName }}</h4>
              <span class="student-class">{{ student.class }}</span>
            </div>
            <div class="pending-badge" :class="{ warning: student.pendingCount > 0 }">
              {{ student.pendingCount }} 待办
            </div>
          </div>

          <div class="pending-list" v-if="student.pendingTasks.length > 0">
            <div v-for="task in student.pendingTasks" :key="task.id" class="pending-item">
              <div class="task-icon">🔥</div>
              <div class="task-content">
                <span class="task-title">{{ task.title }}</span>
                <span class="task-meta">
                  {{ task.exerciseCount }} 项运动 · 截止 {{ task.deadline }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="no-pending">
            <span class="emoji">🎉</span>
            <span>太棒了！所有任务已完成</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 运动项目类型列表（从管理员配置获取）
const exerciseTypes = ref([])

// 只显示启用的运动项目
const activeExerciseTypes = computed(() => 
  exerciseTypes.value.filter(et => et.status === 'active')
)

const form = ref({
  title: '',
  year: 2026,
  month: 1,
  day: 20,
  exercises: []
})

const submitting = ref(false)
const studentsPending = ref([])

// 获取运动项目库（从管理员配置）
const fetchExerciseTypes = async () => {
  try {
    const res = await axios.get('/api/admin/exercise-types')
    if (res.data.code === 200) {
      exerciseTypes.value = res.data.data
      // 初始化默认运动项目
      if (activeExerciseTypes.value.length > 0) {
        const firstType = activeExerciseTypes.value[0]
        form.value.exercises = [
          { type: firstType.name, target: 50, weight: 0.5 },
          { type: activeExerciseTypes.value[1]?.name || firstType.name, target: 100, weight: 0.5 }
        ]
      }
    }
  } catch (err) {
    console.error('获取运动项目失败:', err)
  }
}

// 获取运动项目单位
const getExerciseUnit = (typeName) => {
  const et = exerciseTypes.value.find(e => e.name === typeName)
  return et ? et.unit : '个'
}

// 运动类型变更时更新单位
const onExerciseTypeChange = (exercise) => {
  // 触发响应式更新
}

// 获取学生待办任务
const fetchPendingTasks = async () => {
  try {
    const res = await axios.get('/api/teacher/pending_tasks')
    if (res.data.code === 200) {
      studentsPending.value = res.data.data
    }
  } catch (err) {
    console.error('获取待办任务失败:', err)
  }
}

onMounted(() => {
  fetchExerciseTypes()
  fetchPendingTasks()
})

// 年份选项（2025-2030）
const yearOptions = [2025, 2026, 2027, 2028, 2029, 2030]

// 根据月份计算天数
const daysInMonth = computed(() => {
  const year = form.value.year
  const month = form.value.month
  return new Date(year, month, 0).getDate()
})

// 格式化截止日期
const formattedDeadline = computed(() => {
  const y = form.value.year
  const m = String(form.value.month).padStart(2, '0')
  const d = String(form.value.day).padStart(2, '0')
  return `${y}-${m}-${d}`
})

// 计算权重总和
const totalWeight = computed(() => {
  return form.value.exercises.reduce((sum, e) => sum + (e.weight || 0), 0)
})

// 添加运动项目
const addExercise = () => {
  const defaultType = activeExerciseTypes.value[0]?.name || '跳绳'
  form.value.exercises.push({ type: defaultType, target: 30, weight: 0 })
}

// 移除运动项目
const removeExercise = (index) => {
  form.value.exercises.splice(index, 1)
}

const publishTask = async () => {
  if (!form.value.title) {
    alert('请填写任务标题')
    return
  }
  
  if (form.value.exercises.length === 0) {
    alert('请至少添加一项运动')
    return
  }
  
  if (totalWeight.value !== 1) {
    alert('所有运动的权重总和必须等于 1.0')
    return
  }

  submitting.value = true
  try {
    // 构建运动数据（单位从运动项目库获取）
    const exercises = form.value.exercises.map(e => ({
      type: e.type,
      target: e.target,
      unit: getExerciseUnit(e.type),
      weight: e.weight
    }))

    const res = await axios.post('/api/teacher/publish_task', {
      title: form.value.title,
      deadline: formattedDeadline.value,
      exercises
    })
    
    if (res.data.code === 200) {
      alert('任务发布成功！')
      // 刷新学生待办任务列表
      await fetchPendingTasks()
      // 重置表单
      const firstType = activeExerciseTypes.value[0]
      form.value = {
        title: '',
        year: 2026,
        month: 1,
        day: 20,
        exercises: [
          { type: firstType?.name || '跳绳', target: 50, weight: 0.5 },
          { type: activeExerciseTypes.value[1]?.name || firstType?.name || '跳绳', target: 100, weight: 0.5 }
        ]
      }
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
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-header p {
  color: #7f8c8d;
}

.form-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  max-width: 700px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus, select:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
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
  background: #fafafa;
  border-radius: 8px;
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
  background: #52c41a;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-add:hover {
  background: #73d13d;
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
  background: #ff4d4f;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
}

.weight-hint {
  font-size: 12px;
  color: #52c41a;
  margin-top: 8px;
}

.weight-hint.error {
  color: #ff4d4f;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 12px;
}

.btn-submit:hover {
  background: #40a9ff;
}

.btn-submit:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

/* 学生待办任务区域 */
.pending-section {
  margin-top: 48px;
}

.pending-section .section-header {
  margin-bottom: 24px;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f2f5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.student-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3);
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
  font-size: 13px;
  color: #8c8c8c;
  display: inline-block;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.pending-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  transition: all 0.3s;
}

.pending-badge.warning {
  background: #fff7e6;
  color: #fa8c16;
  border-color: #ffd591;
  box-shadow: 0 2px 8px rgba(250, 140, 22, 0.1);
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
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.pending-item:hover {
  background: #fff;
  border-color: #e6f7ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.task-icon {
  font-size: 18px;
  background: #fff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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
