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
          <button class="link-btn" @click="viewDetail(cls)">查看详情</button>
          <button class="link-btn" @click="editClass(cls)">编辑</button>
          <button class="link-btn" @click="bindTeacher(cls)">绑定班主任</button>
          <button class="link-btn danger" @click="confirmDelete(cls)">删除</button>
        </div>
      </div>

      <div v-if="classes.length === 0" class="empty-card">
        暂无班级数据
      </div>
    </div>

    <!-- Class Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-box wide">
        <div class="detail-header">
          <h3 class="modal-title">📋 {{ detailClass?.name }} - 班级详情</h3>
          <button class="close-btn" @click="closeModals">✕</button>
        </div>

        <div class="detail-info-grid">
          <div class="detail-item">
            <span class="detail-label">班级名称</span>
            <span class="detail-val">{{ detailClass?.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">年级</span>
            <span class="detail-val">{{ detailClass?.grade }}年级</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">班主任</span>
            <span class="detail-val">{{ detailClass?.headTeacherName || '暂未分配' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">学生人数</span>
            <span class="detail-val">{{ detailClass?.studentCount }} 人</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-val">{{ detailClass?.createdAt }}</span>
          </div>
        </div>

        <!-- Student List -->
        <div class="student-section">
          <h4 class="section-subtitle">👨‍🎓 班级学生列表</h4>
          <div v-if="detailLoading" class="loading-text">加载中...</div>
          <div v-else-if="detailStudents.length === 0" class="empty-text">该班级暂无学生</div>
          <table v-else class="student-table">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>家长</th>
                <th>联系电话</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in detailStudents" :key="s.id || s.studentId">
                <td>{{ s.studentId || s.student_id || '-' }}</td>
                <td class="name-cell">{{ s.name }}</td>
                <td>{{ s.parentName || s.parent_name || '-' }}</td>
                <td>{{ s.parentPhone || s.phone || '-' }}</td>
                <td>
                  <span :class="['status-tag', s.status]">
                    {{ s.status === 'active' ? '正常' : s.status === 'banned' ? '封禁' : s.status || '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="student-count-info" v-if="detailStudents.length > 0">
            共 {{ detailStudents.length }} 名学生
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-box small">
        <h3 class="modal-title">⚠️ 确认删除</h3>
        <p class="delete-warning">
          确定要删除班级 <strong>{{ deleteTarget?.name }}</strong> 吗？<br>
          <span class="warning-sub">此操作不可恢复，班级内的学生将变为无班级状态。</span>
        </p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="showDeleteModal = false">取消</button>
          <button type="button" class="delete-btn" @click="doDelete" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
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
import { apiGet, apiPost, apiDelete } from '../../api/realApi'

const classes = ref([])
const teachers = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBindModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const form = ref({ name: '', grade: 1, headTeacherId: null })
const bindClass = ref(null)
const selectedTeacherId = ref(null)
const detailClass = ref(null)
const detailStudents = ref([])
const detailLoading = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const fetchData = async () => {
  const [classRes, teacherRes] = await Promise.all([
    apiGet('/api/admin/classes'),
    apiGet('/api/admin/teachers')
  ])
  // classes 后端返回 { data: { total, classes: [...] } }
  if (classRes.code === 200) {
    classes.value = classRes.data.classes || classRes.data
  }
  if (teacherRes.code === 200) {
    const list = teacherRes.data.teachers || teacherRes.data
    teachers.value = Array.isArray(list) ? list.filter(t => t.status === 'active') : []
  }
}

// 查看班级详情 + 学生列表
const viewDetail = async (cls) => {
  detailClass.value = cls
  detailStudents.value = []
  detailLoading.value = true
  showDetailModal.value = true

  try {
    // 并行获取班级详情和学生列表
    const [detailRes, studentsRes] = await Promise.all([
      apiGet(`/api/admin/classes/${cls.id}`),
      apiGet(`/api/admin/classes/${cls.id}/students`)
    ])
    
    // 更新详情（后端可能返回更完整的数据）
    if (detailRes.code === 200 && detailRes.data) {
      detailClass.value = detailRes.data
    }
    
    // 学生列表：后端返回 { data: { class_id, total, students: [...] } }
    if (studentsRes.code === 200 && studentsRes.data) {
      detailStudents.value = studentsRes.data.students || studentsRes.data || []
    }
  } catch (e) {
    console.error('获取班级详情失败:', e)
  } finally {
    detailLoading.value = false
  }
}

// 删除班级
const confirmDelete = (cls) => {
  deleteTarget.value = cls
  showDeleteModal.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiDelete(`/api/admin/class/${deleteTarget.value.id}`)
    if (res.code === 200) {
      alert('删除成功！')
      showDeleteModal.value = false
      deleteTarget.value = null
      fetchData()
    } else {
      alert(res.message || '删除失败')
    }
  } catch (e) {
    console.error(e)
    alert('删除失败：' + (e.message || '网络错误'))
  } finally {
    deleting.value = false
  }
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
  try {
    if (showEditModal.value) {
      // 编辑：后端接收 JSON Body
      await apiPost('/api/admin/class/update', form.value)
    } else {
      // 新增：后端已支持 JSON Body（2026-03-06 验证通过）
      const body = { name: form.value.name, grade: form.value.grade }
      if (form.value.headTeacherId) body.headTeacherId = form.value.headTeacherId
      await apiPost('/api/admin/class/add', body)
    }
    closeModals()
    fetchData()
  } catch (e) {
    alert('操作失败：' + (e.message || '网络错误'))
  }
}

const submitBind = async () => {
  await apiPost('/api/admin/class/update', {
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
  showDetailModal.value = false
  form.value = { name: '', grade: 1, headTeacherId: null }
  bindClass.value = null
  detailClass.value = null
  detailStudents.value = []
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
  transition: box-shadow 0.2s;
}

.class-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
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

.link-btn.danger {
  color: #ef4444;
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

.modal-box.wide {
  width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header .modal-title {
  margin-bottom: 0;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-val {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.student-section {
  margin-top: 4px;
}

.section-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.loading-text, .empty-text {
  text-align: center;
  color: #9ca3af;
  padding: 32px 0;
  font-size: 14px;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.student-table thead {
  background: #f1f5f9;
}

.student-table th {
  padding: 10px 12px;
  text-align: left;
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
}

.student-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.student-table tr:hover {
  background: #fafbfc;
}

.name-cell {
  font-weight: 500;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-tag.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag.banned {
  background: #fee2e2;
  color: #dc2626;
}

.student-count-info {
  text-align: right;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 12px;
}

/* Delete */
.delete-warning {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 0;
}

.warning-sub {
  color: #ef4444;
  font-size: 12px;
}

.delete-btn {
  padding: 10px 20px;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.delete-btn:hover {
  background: #dc2626;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
