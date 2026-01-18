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
                    <button class="save-btn" @click="saveScore(record, result)">💾</button>
                    <button class="cancel-btn" @click="cancelEdit">❌</button>
                  </div>
                  <div v-else class="view-box" @click.stop="startEdit(record, result)">
                    <span class="ex-result">{{ result.score }} / {{ result.target }}</span>
                    <span class="ex-percent">{{ Math.min(100, Math.round(result.score / result.target * 100)) }}分</span>
                    <span class="edit-icon">✏️</span>
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
import axios from 'axios'

const students = ref([])
const loading = ref(true)
const showModal = ref(false)
const selectedStudent = ref(null)

const editingKey = ref(null)  // 格式: "recordId-exerciseType"
const tempScore = ref(0)

onMounted(async () => {
  await fetchStudents()
})

const fetchStudents = async () => {
  try {
    const res = await axios.get('/api/teacher/students')
    if (res.data.code === 200) {
      students.value = res.data.data
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
}

const saveScore = async (record, result) => {
  try {
    const res = await axios.post('/api/teacher/update_score', {
      recordId: record.id,
      exerciseType: result.type,
      newScore: tempScore.value
    })
    
    if (res.data.code === 200) {
      // 更新本地数据
      result.score = tempScore.value
      record.totalScore = res.data.data.totalScore
      
      // 重新计算学生平均分
      const student = selectedStudent.value
      if (student.taskRecords && student.taskRecords.length > 0) {
        student.avgScore = Math.round(
          student.taskRecords.reduce((acc, r) => acc + r.totalScore, 0) / student.taskRecords.length
        )
      }
      
      cancelEdit()
    }
  } catch (e) {
    alert('修改失败')
  }
}
</script>

<style scoped>
.section-header { margin-bottom: 24px; }
.section-header h2 { color: #2c3e50; margin-bottom: 8px; }
.section-header p { color: #7f8c8d; }

.student-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  border: 1px solid #eaedf0;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
}

.student-card .avatar {
  width: 48px;
  height: 48px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0;
}

.student-card .info { flex: 1; min-width: 0; }
.student-card h3 { margin: 0 0 4px 0; color: #2c3e50; }
.student-card .meta { margin: 0; color: #999; font-size: 12px; }

.score-badge { text-align: right; flex-shrink: 0; }
.score-badge .label { display: block; font-size: 12px; color: #999; }
.score-badge .val { font-size: 24px; font-weight: bold; color: #1890ff; }

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
  max-width: 600px;
  border-radius: 16px;
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none; border: none; font-size: 28px; cursor: pointer; color: #999;
}

.empty-text {
  color: #999;
  text-align: center;
  padding: 40px;
}

/* 任务记录样式 */
.task-record {
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-title {
  font-weight: 600;
  color: #2c3e50;
}

.task-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.task-score {
  text-align: right;
}

.score-num {
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
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
  padding: 12px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.exercise-row:last-child {
  border-bottom: none;
}

.ex-type {
  font-weight: 500;
  color: #34495e;
}

.ex-score-area {
  display: flex;
  align-items: center;
}

.view-box {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.ex-result {
  color: #666;
}

.ex-percent {
  color: #1890ff;
  font-weight: bold;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px;
}

.view-box:hover .edit-icon {
  opacity: 1;
}

.edit-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input {
  width: 80px;
  padding: 6px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  font-size: 14px;
}

.save-btn, .cancel-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
</style>
