<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">教师列表</h2>
        <span class="count-badge">共 {{ teachers.length }} 人</span>
      </div>
      <button class="primary-btn" @click="showAddModal = true">
        <span>➕</span> 新增教师
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <input 
        v-model="searchKey" 
        type="text" 
        placeholder="搜索姓名、工号..." 
        class="search-input"
      />
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>工号</th>
            <th>联系电话</th>
            <th>执教班级</th>
            <th>状态</th>
            <th>入职时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in filteredTeachers" :key="teacher.id">
            <td class="name-cell">{{ teacher.name }}</td>
            <td>{{ teacher.employeeId }}</td>
            <td>{{ teacher.phone }}</td>
            <td>{{ teacher.classNames || '-' }}</td>
            <td>
              <span :class="['status-tag', teacher.status]">
                {{ teacher.status === 'active' ? '在职' : '离职' }}
              </span>
            </td>
            <td>{{ teacher.createdAt }}</td>
            <td class="action-cell">
              <button class="action-link" @click="editTeacher(teacher)">编辑</button>
              <button class="action-link warn" @click="resetPassword(teacher)">重置密码</button>
            </td>
          </tr>
          <tr v-if="filteredTeachers.length === 0">
            <td colspan="7" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <h3 class="modal-title">{{ showEditModal ? '编辑教师' : '新增教师' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>姓名 *</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>工号 *</label>
            <input v-model="form.employeeId" type="text" required />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="form.phone" type="text" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn">{{ showEditModal ? '保存' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const teachers = ref([])
const searchKey = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const form = ref({ name: '', employeeId: '', phone: '', status: 'active' })

const filteredTeachers = computed(() => {
  if (!searchKey.value) return teachers.value
  const key = searchKey.value.toLowerCase()
  return teachers.value.filter(t => 
    t.name.toLowerCase().includes(key) || 
    t.employeeId.toLowerCase().includes(key)
  )
})

const fetchTeachers = async () => {
  try {
    const res = await axios.get('/api/admin/teachers')
    if (res.data.code === 200) {
      teachers.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
}

const editTeacher = (teacher) => {
  form.value = { ...teacher }
  showEditModal.value = true
}

const resetPassword = async (teacher) => {
  if (!confirm(`确定要重置 ${teacher.name} 的密码吗？`)) return
  try {
    const res = await axios.post('/api/admin/teacher/reset-password', { id: teacher.id })
    alert(res.data.message)
  } catch (e) {
    alert('操作失败')
  }
}

const submitForm = async () => {
  try {
    if (showEditModal.value) {
      await axios.post('/api/admin/teacher/update', form.value)
    } else {
      await axios.post('/api/admin/teacher/add', form.value)
    }
    closeModal()
    fetchTeachers()
  } catch (e) {
    alert('操作失败')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  form.value = { name: '', employeeId: '', phone: '', status: 'active' }
}

onMounted(fetchTeachers)
</script>

<style scoped>
.page-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.data-table td {
  font-size: 14px;
  color: #4b5563;
}

.name-cell {
  font-weight: 500;
  color: #1f2937;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag.active {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-cell {
  display: flex;
  gap: 12px;
}

.action-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.action-link:hover {
  text-decoration: underline;
}

.action-link.warn {
  color: #f59e0b;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3b82f6;
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
