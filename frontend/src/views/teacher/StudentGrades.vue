<template>
  <div class="grades-page">
    <header class="section-header">
      <h2>学生成绩管理 📊</h2>
      <p>查看并管理班级学生的运动数据（按任务维度）</p>
    </header>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="student-list">
      <div v-for="student in students" :key="student.id" class="student-card" @click="openDetail(student)">
        <div class="avatar">{{ student.name[0] }}</div>
        <div class="info">
          <h3>{{ student.name }}</h3>
          <p class="meta">
            已完成 {{ student.taskRecords?.length || 0 }} 次任务
            <span v-if="student.lastActive"> · 上次活跃: {{ student.lastActive }}</span>
          </p>
        </div>
        <div class="score-badge">
          <span class="label">平均分</span>
          <span class="val">{{ student.avgScore || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Student Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedStudent.name }} - 任务成绩单</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="records-container">
          <p v-if="!selectedStudent.taskRecords || selectedStudent.taskRecords.length === 0" class="empty-text">
            暂无已完成的任务
          </p>
          
          <!-- 按任务显示 -->
          <div 
            v-for="record in selectedStudent.taskRecords" 
            :key="record.id" 
            class="task-record"
          >
            <div class="task-header">
              <div class="task-info">
                <span class="task-title">{{ record.taskTitle }}</span>
                <span class="task-date">完成于 {{ record.completedAt }}</span>
              </div>
              <div class="task-score">
                <span class="score-num">{{ record.totalScore }}</span>
                <span class="score-label">分</span>
              </div>
            </div>
            
            <!-- 各项运动详情 -->
            <div class="exercise-details">
              <div 
                v-for="(result, idx) in record.results" 
                :key="idx" 
                class="exercise-row"
              >
                <span class="ex-type">{{ result.type }}</span>
                <div class="ex-score-area">
                  <div v-if="editingKey === `${record.id}-${result.type}`" class="edit-box">
                    <input 
                      type="number" 
                      v-model.number="tempScore" 
                      class="score-input"
                    />
                    <input 
                      type="text" 
                      v-model="tempReason" 
                      class="reason-input"
                      placeholder="修改原因（必填）"
                    />
                    <button class="save-btn" @click="saveScore(record, result)" :disabled="!tempReason.trim()">💾</button>
                    <button class="cancel-btn" @click="cancelEdit">❌</button>
                  </div>
                  <div v-else class="view-box">
                    <span class="ex-result">{{ result.score }} / {{ result.target }}</span>
                    <span class="ex-percent">{{ Math.min(100, Math.round(result.score / result.target * 100)) }}分</span>
                    <button class="edit-btn" @click.stop="startEdit(record, result)">✏️ 修改</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

const students = ref([])
const loading = ref(true)
const showModal = ref(false)
const selectedStudent = ref(null)

const editingKey = ref(null)  // 格式: "recordId-exerciseType"
const tempScore = ref(0)
const tempReason = ref('')

onMounted(async () => {
  await fetchStudents()
})

const fetchStudents = async () => {
  try {
    const res = await apiGet('/api/teacher/students')
    if (res.code === 200) {
      students.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const openDetail = (student) => {
  selectedStudent.value = student
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  cancelEdit()
}

const startEdit = (record, result) => {
  editingKey.value = `${record.id}-${result.type}`
  tempScore.value = result.score
}

const cancelEdit = () => {
  editingKey.value = null
  tempScore.value = 0
  tempReason.value = ''
}

const saveScore = async (record, result) => {
  if (!tempReason.value.trim()) {
    alert('请填写修改原因')
    return
  }
  try {
    // 从 localStorage 取教师ID
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const res = await apiPost('/api/teacher/update_score', {
      record_id: record.id,
      new_count: tempScore.value,
      reason: tempReason.value.trim(),
      teacher_id: String(user.id || user.employeeId || '')
    })
    
    if (res.code === 200) {
      // 更新本地数据
      result.score = tempScore.value
      if (res.data?.totalScore !== undefined) {
        record.totalScore = res.data.totalScore
      }
      
      // 重新计算学生平均分
      const student = selectedStudent.value
      if (student.taskRecords && student.taskRecords.length > 0) {
        student.avgScore = Math.round(
          student.taskRecords.reduce((acc, r) => acc + r.totalScore, 0) / student.taskRecords.length
        )
      }
      
      cancelEdit()
    } else {
      alert(res.message || '修改失败')
    }
  } catch (e) {
    alert('修改失败')
  }
}
</script>

<style scoped>
.section-header { margin-bottom: 24px; }
.section-header h2 { 
  color: #0F172A; /* Slate 900 */
  margin-bottom: 8px; 
  font-weight: 700;
  font-size: 20px;
}
.section-header p { color: #64748B; /* Slate 500 */ font-size: 14px; }

.student-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  border: 1px solid #E2E8F0; /* Slate 200 */
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #CBD5E1;
}

.student-card .avatar {
  width: 40px;
  height: 40px;
  background: #EEF2FF; /* Indigo 50 */
  color: #4F46E5; /* Indigo 600 */
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-right: 16px;
  flex-shrink: 0;
}

.student-card .info { flex: 1; min-width: 0; }
.student-card h3 { margin: 0 0 2px 0; color: #0F172A; font-size: 16px; font-weight: 600; }
.student-card .meta { margin: 0; color: #64748B; font-size: 12px; }

.score-badge { text-align: right; flex-shrink: 0; }
.score-badge .label { display: block; font-size: 11px; color: #64748B; font-weight: 500; }
.score-badge .val { font-size: 20px; font-weight: 700; color: #4F46E5; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 640px;
  border-radius: 8px;
  padding: 24px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  color: #0F172A;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none; border: none; font-size: 28px; cursor: pointer; color: #999;
}

.empty-text {
  color: #999;
  text-align: center;
  padding: 40px;
}

.task-record {
  margin-bottom: 20px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-title {
  font-weight: 600;
  color: #0F172A;
  font-size: 14px;
}

.task-date {
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
}

.task-score {
  text-align: right;
}

.score-num {
  font-size: 24px;
  font-weight: 700;
  color: #4F46E5;
}

.score-label {
  font-size: 14px;
  color: #999;
  margin-left: 2px;
}

/* 各项运动详情 */
.exercise-details {
  padding: 0 16px;
}

.exercise-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F1F5F9;
}

.exercise-row:last-child {
  border-bottom: none;
}

.ex-type {
  font-weight: 500;
  color: #334155;
  font-size: 13px;
}

.ex-score-area {
  display: flex;
  align-items: center;
}

.view-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ex-result {
  color: #475569;
  font-size: 13px;
}

.ex-percent {
  color: #4F46E5;
  font-weight: 600;
  font-size: 13px;
}

.edit-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: #fff;
  color: #4F46E5;
  border: 1px solid #C7D2FE;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;
  margin-left: 4px;
}

.edit-btn:hover {
  background: #4F46E5;
  color: #fff;
  border-color: #4F46E5;
}

.edit-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #4F46E5;
  border-radius: 4px;
  font-size: 13px;
  color: #0F172A;
}

.score-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.save-btn, .cancel-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reason-input {
  width: 100px;
  padding: 4px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 4px;
  font-size: 12px;
  color: #0F172A;
}

.reason-input:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.edit-box {
  flex-wrap: wrap;
}
</style>
