<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">运动项目库</h2>
        <span class="count-badge">共 {{ exerciseTypes.length }} 个项目</span>
      </div>
      <button class="primary-btn" @click="showAddModal = true">
        <span>➕</span> 新增项目
      </button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>项目名称</th>
            <th>计量单位</th>
            <th>说明</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in exerciseTypes" :key="item.id">
            <td class="name-cell">
              <span class="exercise-icon">{{ getIcon(item.name) }}</span>
              {{ item.name }}
            </td>
            <td>{{ item.unit }}</td>
            <td class="desc-cell">{{ item.description || '-' }}</td>
            <td>
              <span :class="['status-tag', item.status]">
                {{ item.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="action-link" @click="editItem(item)">编辑</button>
              <button 
                :class="['action-link', item.status === 'active' ? 'warn' : 'success']"
                @click="toggleStatus(item)"
              >
                {{ item.status === 'active' ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <h3 class="modal-title">{{ showEditModal ? '编辑项目' : '新增项目' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>项目名称 *</label>
            <input v-model="form.name" type="text" placeholder="如: 立定跳远" required />
          </div>
          <div class="form-group">
            <label>计量单位 *</label>
            <input v-model="form.unit" type="text" placeholder="如: 个、米、秒" required />
          </div>
          <div class="form-group">
            <label>说明</label>
            <textarea v-model="form.description" placeholder="项目说明（可选）" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModals">取消</button>
            <button type="submit" class="submit-btn">{{ showEditModal ? '保存' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

const exerciseTypes = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const form = ref({ name: '', unit: '', description: '' })

const fetchData = async () => {
  const res = await apiGet('/api/admin/exercise-types')
  if (res.code === 200) exerciseTypes.value = res.data.exercises || res.data
}

const getIcon = (name) => {
  const icons = { '跳绳': '🪢', '仰卧起坐': '🏋️', '跑步': '🏃', '立定跳远': '🦘', '50米跑': '⏱️', '引体向上': '💪' }
  return icons[name] || '🏅'
}

const editItem = (item) => {
  form.value = { ...item }
  showEditModal.value = true
}

const toggleStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'inactive' : 'active'
  await apiPost('/api/admin/exercise-type/update', { id: item.id, status: newStatus })
  fetchData()
}

const submitForm = async () => {
  try {
    if (showEditModal.value) {
      // 编辑：后端接收 JSON Body
      await apiPost('/api/admin/exercise-type/update', form.value)
    } else {
      // 新增：后端已支持 JSON Body（2026-03-06 验证通过）
      const body = { name: form.value.name, unit: form.value.unit }
      if (form.value.description) body.description = form.value.description
      await apiPost('/api/admin/exercise-type/add', body)
    }
    closeModals()
    fetchData()
  } catch (e) {
    alert('操作失败：' + (e.message || '网络错误'))
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  form.value = { name: '', unit: '', description: '' }
}

onMounted(fetchData)
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
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.exercise-icon {
  font-size: 18px;
}

.desc-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  background: #f3f4f6;
  color: #6b7280;
}

.action-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  margin-right: 12px;
}

.action-link.warn { color: #f59e0b; }
.action-link.success { color: #10b981; }

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

.form-group input, .form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
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
