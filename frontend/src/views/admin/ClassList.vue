<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">班级管理</h2>
        <span class="count-badge">共 {{ classes.length }} 个班级</span>
      </div>
      <button class="primary-btn" @click="showAddModal = true">
        <span>➕</span> 新建班级
      </button>
    </div>

    <div class="cards-grid">
      <div v-for="cls in classes" :key="cls.id" class="class-card">
        <div class="card-header">
          <span class="class-name">{{ cls.name }}</span>
          <span class="grade-tag">{{ cls.grade }}年级</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">班主任</span>
            <span :class="['info-value', { 'not-assigned': !cls.headTeacherId }]">
              {{ cls.headTeacherName }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">学生人数</span>
            <span class="info-value">{{ cls.studentCount }} 人</span>
          </div>
          <div class="info-row">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ cls.createdAt }}</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="link-btn" @click="editClass(cls)">编辑</button>
          <button class="link-btn" @click="bindTeacher(cls)">绑定班主任</button>
        </div>
      </div>

      <div v-if="classes.length === 0" class="empty-card">
        暂无班级数据
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <h3 class="modal-title">{{ showEditModal ? '编辑班级' : '新建班级' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>班级名称 *</label>
            <input v-model="form.name" type="text" placeholder="如: 三年级一班" required />
          </div>
          <div class="form-group">
            <label>年级 *</label>
            <select v-model="form.grade" required>
              <option v-for="g in 6" :key="g" :value="g">{{ g }}年级</option>
            </select>
          </div>
          <div class="form-group">
            <label>班主任</label>
            <select v-model="form.headTeacherId">
              <option :value="null">暂不分配</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModals">取消</button>
            <button type="submit" class="submit-btn">{{ showEditModal ? '保存' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bind Teacher Modal -->
    <div v-if="showBindModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box small">
        <h3 class="modal-title">绑定班主任</h3>
        <p class="bind-info">为 <strong>{{ bindClass?.name }}</strong> 选择班主任：</p>
        <select v-model="selectedTeacherId" class="full-select">
          <option :value="null">暂不分配</option>
          <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModals">取消</button>
          <button type="button" class="submit-btn" @click="submitBind">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const classes = ref([])
const teachers = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBindModal = ref(false)
const form = ref({ name: '', grade: 1, headTeacherId: null })
const bindClass = ref(null)
const selectedTeacherId = ref(null)

const fetchData = async () => {
  const [classRes, teacherRes] = await Promise.all([
    axios.get('/api/admin/classes'),
    axios.get('/api/admin/teachers')
  ])
  if (classRes.data.code === 200) classes.value = classRes.data.data
  if (teacherRes.data.code === 200) teachers.value = teacherRes.data.data.filter(t => t.status === 'active')
}

const editClass = (cls) => {
  form.value = { ...cls }
  showEditModal.value = true
}

const bindTeacher = (cls) => {
  bindClass.value = cls
  selectedTeacherId.value = cls.headTeacherId
  showBindModal.value = true
}

const submitForm = async () => {
  const url = showEditModal.value ? '/api/admin/class/update' : '/api/admin/class/add'
  await axios.post(url, form.value)
  closeModals()
  fetchData()
}

const submitBind = async () => {
  await axios.post('/api/admin/class/update', {
    id: bindClass.value.id,
    headTeacherId: selectedTeacherId.value
  })
  closeModals()
  fetchData()
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showBindModal.value = false
  form.value = { name: '', grade: 1, headTeacherId: null }
  bindClass.value = null
}

onMounted(fetchData)
</script>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.count-badge {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.class-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.grade-tag {
  font-size: 12px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 12px;
}

.card-body {
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  color: #1f2937;
  font-weight: 500;
}

.info-value.not-assigned {
  color: #f59e0b;
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 16px;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.empty-card {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #9ca3af;
  background: #fff;
  border-radius: 12px;
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
  width: 420px;
  max-width: 90%;
}

.modal-box.small {
  width: 360px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
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

.form-group input, .form-group select, .full-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.bind-info {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
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
