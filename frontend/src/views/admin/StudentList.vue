<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">学生列表</h2>
        <span class="count-badge">共 {{ students.length }} 人</span>
      </div>
      <div class="header-actions">
        <button class="secondary-btn" @click="showImportModal = true">
          <span>📥</span> Excel导入
        </button>
        <button class="primary-btn" @click="showAddModal = true">
          <span>➕</span> 新增学生
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input 
        v-model="searchKey" 
        type="text" 
        placeholder="搜索姓名、学号..." 
        class="search-input"
      />
      <select v-model="filterClass" class="filter-select">
        <option :value="''">全部班级</option>
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">全部状态</option>
        <option value="active">正常</option>
        <option value="banned">已封禁</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>学号</th>
            <th>班级</th>
            <th>家长姓名</th>
            <th>家长电话</th>
            <th>状态</th>
            <th>最后活跃</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id">
            <td class="name-cell">{{ student.name }}</td>
            <td>{{ student.studentId }}</td>
            <td>{{ student.className }}</td>
            <td>{{ student.parentName }}</td>
            <td>{{ student.parentPhone }}</td>
            <td>
              <span :class="['status-tag', student.status]">
                {{ student.status === 'active' ? '正常' : '已封禁' }}
              </span>
            </td>
            <td>{{ student.lastActive }}</td>
            <td class="action-cell">
              <button class="action-link" @click="showTransfer(student)">调班</button>
              <button 
                :class="['action-link', student.status === 'banned' ? 'success' : 'warn']"
                @click="toggleBan(student)"
              >
                {{ student.status === 'banned' ? '解封' : '封禁' }}
              </button>
            </td>
          </tr>
          <tr v-if="filteredStudents.length === 0">
            <td colspan="8" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <h3 class="modal-title">新增学生</h3>
        <form @submit.prevent="submitAdd">
          <div class="form-row">
            <div class="form-group">
              <label>姓名 *</label>
              <input v-model="addForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>学号 *</label>
              <input v-model="addForm.studentId" type="text" required />
            </div>
          </div>
          <div class="form-group">
            <label>班级 *</label>
            <select v-model="addForm.classId" required>
              <option value="">请选择班级</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>家长姓名</label>
              <input v-model="addForm.parentName" type="text" />
            </div>
            <div class="form-group">
              <label>家长电话</label>
              <input v-model="addForm.parentPhone" type="text" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModals">取消</button>
            <button type="submit" class="submit-btn">添加</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box">
        <h3 class="modal-title">📥 批量导入学生</h3>
        <div class="import-info">
          <p>请上传Excel文件（.xlsx），文件格式：</p>
          <table class="sample-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>学号</th>
                <th>班级ID</th>
                <th>家长姓名</th>
                <th>家长电话</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>张三</td>
                <td>20230301</td>
                <td>1</td>
                <td>张爸爸</td>
                <td>13800138000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="upload-area">
          <input type="file" accept=".xlsx,.xls" @change="handleFileUpload" />
        </div>
        <div v-if="importPreview.length > 0" class="import-preview">
          <p>预览（共 {{ importPreview.length }} 条）：</p>
          <div class="preview-list">
            <div v-for="(item, idx) in importPreview.slice(0, 5)" :key="idx" class="preview-item">
              {{ item.name }} - {{ item.studentId }}
            </div>
            <div v-if="importPreview.length > 5" class="preview-more">
              ...还有 {{ importPreview.length - 5 }} 条
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModals">取消</button>
          <button 
            type="button" 
            class="submit-btn" 
            :disabled="importPreview.length === 0"
            @click="submitImport"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransferModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box small">
        <h3 class="modal-title">调整班级</h3>
        <p class="transfer-info">将 <strong>{{ transferStudent?.name }}</strong> 调至：</p>
        <select v-model="newClassId" class="full-select">
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModals">取消</button>
          <button type="button" class="submit-btn" @click="submitTransfer">确认调班</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

const students = ref([])
const classes = ref([])
const searchKey = ref('')
const filterClass = ref('')
const filterStatus = ref('')

const showAddModal = ref(false)
const showImportModal = ref(false)
const showTransferModal = ref(false)

const addForm = ref({ name: '', studentId: '', classId: '', parentName: '', parentPhone: '' })
const importPreview = ref([])
const transferStudent = ref(null)
const newClassId = ref('')

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchSearch = !searchKey.value || 
      s.name.includes(searchKey.value) || 
      s.studentId.includes(searchKey.value)
    const matchClass = !filterClass.value || s.classId == filterClass.value
    const matchStatus = !filterStatus.value || s.status === filterStatus.value
    return matchSearch && matchClass && matchStatus
  })
})

const fetchData = async () => {
  try {
    const [studentsRes, classesRes] = await Promise.all([
      apiGet('/api/admin/students'),
      apiGet('/api/admin/classes')
    ])
    if (studentsRes.code === 200) students.value = studentsRes.data
    if (classesRes.code === 200) classes.value = classesRes.data.classes || classesRes.data
  } catch (e) {
    console.error(e)
  }
}

const submitAdd = async () => {
  try {
    // 确保 classId 是数字类型
    const payload = { ...addForm.value, classId: Number(addForm.value.classId) }
    const res = await apiPost('/api/admin/student/add', payload)
    if (res.code === 200) {
      closeModals()
      fetchData()
    } else {
      alert(res.message || '添加失败')
    }
  } catch (e) {
    alert('添加失败：' + (e.message || '网络错误'))
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // 模拟解析Excel（实际项目需使用xlsx库）
  // 这里用模拟数据演示
  importPreview.value = [
    { name: '测试学生1', studentId: '20260101', classId: 1, parentName: '家长1', parentPhone: '13800000001' },
    { name: '测试学生2', studentId: '20260102', classId: 1, parentName: '家长2', parentPhone: '13800000002' },
    { name: '测试学生3', studentId: '20260103', classId: 2, parentName: '家长3', parentPhone: '13800000003' }
  ]
}

const submitImport = async () => {
  try {
    const res = await apiPost('/api/admin/student/import', { students: importPreview.value })
    alert(res.message || '导入成功')
    closeModals()
    fetchData()
  } catch (e) {
    alert('导入失败')
  }
}

const showTransfer = (student) => {
  transferStudent.value = student
  newClassId.value = student.classId
  showTransferModal.value = true
}

const submitTransfer = async () => {
  try {
    await apiPost('/api/admin/student/transfer', {
      studentId: Number(transferStudent.value.id),
      newClassId: Number(newClassId.value)
    })
    closeModals()
    fetchData()
  } catch (e) {
    alert('调班失败')
  }
}

const toggleBan = async (student) => {
  const action = student.status === 'banned' ? '解封' : '封禁'
  if (!confirm(`确定要${action} ${student.name} 吗？`)) return
  try {
    await apiPost('/api/admin/student/toggle-ban', { studentId: student.id })
    fetchData()
  } catch (e) {
    alert('操作失败')
  }
}

const closeModals = () => {
  showAddModal.value = false
  showImportModal.value = false
  showTransferModal.value = false
  addForm.value = { name: '', studentId: '', classId: '', parentName: '', parentPhone: '' }
  importPreview.value = []
  transferStudent.value = null
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

.header-actions {
  display: flex;
  gap: 12px;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  width: 250px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  min-width: 140px;
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

.status-tag.banned {
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

.action-link.warn { color: #f59e0b; }
.action-link.success { color: #10b981; }

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
  width: 520px;
  max-width: 90%;
}

.modal-box.small {
  width: 380px;
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

.form-group input, .form-group select, .full-select {
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

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Import */
.import-info {
  margin-bottom: 20px;
}

.import-info p {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
}

.sample-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.sample-table th, .sample-table td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
}

.sample-table th {
  background: #f9fafb;
}

.upload-area {
  padding: 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.import-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.preview-item {
  font-size: 13px;
  color: #374151;
  padding: 4px 0;
}

.preview-more {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.transfer-info {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
}
</style>
