<template>
  <div class="profile-container">
    <header class="section-header">
      <h2>个人中心 👤</h2>
      <p>管理孩子信息与账号安全</p>
    </header>

    <div class="profile-content">
      <!-- Child Info Card -->
      <div class="info-card">
        <div class="card-header">
          <h3>孩子信息</h3>
          <button class="edit-btn" @click="isEditing = !isEditing">
            {{ isEditing ? '取消编辑' : '编辑资料' }}
          </button>
        </div>
        
        <div class="info-body">
          <div class="avatar-section">
            <img :src="userInfo.avatar" alt="Avatar" class="avatar-img" />
            <button v-if="isEditing" class="change-avatar-btn">更换头像</button>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>学生姓名</label>
              <input v-if="isEditing" v-model="editForm.name" type="text" />
              <div v-else class="static-val">{{ userInfo.name }}</div>
            </div>
            
            <div class="form-group">
              <label>班级 <span class="readonly-hint" v-if="isEditing">（管理员设置）</span></label>
              <div class="static-val">{{ userInfo.classNum || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label>学号</label>
              <div class="static-val">{{ userInfo.studentId || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label>家长姓名</label>
              <input v-if="isEditing" v-model="editForm.parentName" type="text" />
              <div v-else class="static-val">{{ userInfo.parentName || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label>手机号</label>
              <input v-if="isEditing" v-model="editForm.phone" type="tel" placeholder="请输入手机号" />
              <div v-else class="static-val">{{ userInfo.phone || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label>邮箱</label>
              <input v-if="isEditing" v-model="editForm.email" type="email" placeholder="请输入邮箱" />
              <div v-else class="static-val">{{ userInfo.email || '未设置' }}</div>
            </div>
          </div>
        </div>

        <div class="card-footer" v-if="isEditing">
          <button class="save-btn" @click="saveProfile" :disabled="loading">
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>

      <!-- Device Management (Embedded) -->
      <div class="info-card device-card">
        <DeviceBind @done="hasBoundDevice = true" />
      </div>

      <!-- Account Management -->
      <div class="info-card account-card">
        <div class="card-header">
          <h3>账号管理</h3>
        </div>
        <div class="account-actions">
          <button class="action-btn outline" type="button">修改登录密码</button>
          <button class="action-btn danger" type="button" @click="showLogoutModal = true">退出登录</button>
        </div>
      </div>
    </div>

    <!-- 退出确认模态框 -->
    <div v-if="showLogoutModal" class="logout-modal-overlay" @click.self="showLogoutModal = false">
      <div class="logout-modal">
        <h3>确认退出</h3>
        <p>你确定要退出登录吗？</p>
        <div class="logout-modal-actions">
          <button class="modal-btn cancel" @click="showLogoutModal = false">取消</button>
          <button class="modal-btn confirm" @click="confirmLogout">确认退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'
import { useRouter } from 'vue-router'
import DeviceBind from './DeviceBind.vue'

const router = useRouter()
const userInfo = ref({})
const isEditing = ref(false)
const loading = ref(false)
const showLogoutModal = ref(false)
const hasBoundDevice = ref(false)

const editForm = reactive({
  name: '',
  parentName: '',
  phone: '',
  email: ''
})

onMounted(async () => {
  // 先从 localStorage 快速显示
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  userInfo.value = {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    ...storedUser
  }
  Object.assign(editForm, userInfo.value)

  // 再从后端获取最新资料
  try {
    const res = await apiGet('/api/parent/profile')
    if (res.code === 200 && res.data) {
      userInfo.value = { ...userInfo.value, ...res.data }
      Object.assign(editForm, userInfo.value)
      // 同步到 localStorage
      localStorage.setItem('user', JSON.stringify(userInfo.value))
    }
  } catch (e) {
    console.warn('获取最新资料失败，使用本地缓存', e)
  }
})

const saveProfile = async () => {
  loading.value = true
  try {
    const uid = userInfo.value.user_id || userInfo.value.studentId || userInfo.value.username || ''
    const payload = {
      user_id: uid,
      name: editForm.name,
      parentName: editForm.parentName,
      phone: editForm.phone || undefined,
      email: editForm.email || undefined
    }
    const res = await apiPost('/api/parent/update', payload)
    if (res.code === 200) {
      userInfo.value = { ...userInfo.value, name: editForm.name, parentName: editForm.parentName, phone: editForm.phone, email: editForm.email }
      localStorage.setItem('user', JSON.stringify(userInfo.value))
      isEditing.value = false
      alert('保存成功！')
    } else {
      alert(res.message || '保存失败')
    }
  } catch (err) {
    console.error(err)
    alert('保存失败：' + (err.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const confirmLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.device-card {
  padding: 0;
  overflow: hidden;
}

.section-header {
  margin-bottom: 30px;
  text-align: center;
}

.section-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-header p {
  color: #7f8c8d;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  color: #34495e;
  font-size: 18px;
}

.edit-btn {
  color: #3498db;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.info-body {
  display: flex;
  gap: 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
}

.readonly-hint {
  font-size: 11px;
  color: #94A3B8;
  font-weight: 400;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #f0f2f5;
  margin-bottom: 12px;
}

.change-avatar-btn {
  font-size: 12px;
  color: #666;
  background: #f0f2f5;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.form-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 6px;
}

.static-val {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 500;
  padding: 8px 0;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.card-footer {
  margin-top: 24px;
  text-align: right;
}

.save-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.save-btn:disabled {
  opacity: 0.7;
}

.account-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.outline {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.action-btn.danger {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.action-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .info-body {
    flex-direction: column;
    align-items: center;
  }
  
  .form-grid {
    width: 100%;
    grid-template-columns: 1fr;
  }
  
  .account-actions {
    flex-direction: column;
  }
}

/* 退出确认模态框 */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.logout-modal {
  background: white;
  border-radius: 12px;
  padding: 28px 32px;
  text-align: center;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.logout-modal h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.logout-modal p {
  color: #7f8c8d;
  margin: 0 0 24px 0;
}

.logout-modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.cancel:hover {
  background: #eee;
}

.modal-btn.confirm {
  background: #dc2626;
  color: white;
}

.modal-btn.confirm:hover {
  background: #b91c1c;
}
</style>
