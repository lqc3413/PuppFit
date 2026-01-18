<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">学期配置</h2>
      <button class="primary-btn" @click="showAddModal = true">
        <span>➕</span> 新增学期
      </button>
    </div>

    <!-- Current Semester -->
    <div v-if="currentSemester" class="current-box">
      <div class="current-label">📅 当前学期</div>
      <div class="current-name">{{ currentSemester.name }}</div>
      <div class="current-dates">
        {{ currentSemester.startDate }} ~ {{ currentSemester.endDate }}
      </div>
    </div>

    <!-- Semester List -->
    <div class="list-section">
      <h3 class="section-title">所有学期</h3>
      <div class="semester-list">
        <div 
          v-for="semester in semesters" 
          :key="semester.id" 
          :class="['semester-item', { current: semester.isCurrent }]"
        >
          <div class="semester-info">
            <span class="semester-name">{{ semester.name }}</span>
            <span class="semester-dates">{{ semester.startDate }} ~ {{ semester.endDate }}</span>
          </div>
          <div class="semester-actions">
            <span v-if="semester.isCurrent" class="current-tag">当前</span>
            <button 
              v-else 
              class="set-current-btn" 
              @click="setCurrent(semester)"
            >
              设为当前
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-box">
        <h3 class="modal-title">新增学期</h3>
        <form @submit.prevent="submitAdd">
          <div class="form-group">
            <label>学期名称 *</label>
            <input v-model="form.name" type="text" placeholder="如: 2025-2026学年第二学期" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期 *</label>
              <input v-model="form.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>结束日期 *</label>
              <input v-model="form.endDate" type="date" required />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">取消</button>
            <button type="submit" class="submit-btn">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const semesters = ref([])
const showAddModal = ref(false)
const form = ref({ name: '', startDate: '', endDate: '' })

const currentSemester = computed(() => semesters.value.find(s => s.isCurrent))

const fetchData = async () => {
  const res = await axios.get('/api/admin/semesters')
  if (res.data.code === 200) semesters.value = res.data.data
}

const setCurrent = async (semester) => {
  await axios.post('/api/admin/semester/set-current', { id: semester.id })
  fetchData()
}

const submitAdd = async () => {
  await axios.post('/api/admin/semester/add', form.value)
  showAddModal.value = false
  form.value = { name: '', startDate: '', endDate: '' }
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.page-container {
  max-width: 800px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.current-box {
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border-left: 4px solid #3b82f6;
}

.current-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.current-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.current-dates {
  font-size: 14px;
  color: #4b5563;
}

.list-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.semester-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.semester-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.semester-item.current {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.semester-name {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.semester-dates {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

.current-tag {
  font-size: 12px;
  background: #3b82f6;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
}

.set-current-btn {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.set-current-btn:hover {
  background: #3b82f6;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  width: 480px;
  max-width: 90%;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
</style>
