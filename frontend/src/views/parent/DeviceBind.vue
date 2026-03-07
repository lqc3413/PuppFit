<template>
  <div class="device-bind-page">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-pulse"></div>
      <p>正在获取您的设备状态...</p>
    </div>

    <!-- 绑定设备表单 -->
    <div v-else-if="!hasBoundDevice" class="bind-section">
      <div class="bind-card">
        <div class="bind-header">
          <div class="bind-icon">🐶</div>
          <h2>绑定你的 PuppyFit 设备</h2>
          <p>首次使用请先绑定机器狗设备，绑定后即可开始运动任务</p>
        </div>

        <div class="bind-form">
          <div class="form-group">
            <label>设备编号 *</label>
            <input 
              v-model="form.device_id" 
              type="text" 
              placeholder="例如：puppy_001（设备底部可查看）"
            />
          </div>
          <div class="form-group">
            <label>设备名称</label>
            <input 
              v-model="form.device_name" 
              type="text" 
              placeholder="给设备起个名字，例如：我的小狗"
            />
          </div>
          <div class="form-group">
            <label>设备IP（选填）</label>
            <input 
              v-model="form.ip" 
              type="text" 
              placeholder="例如：192.168.1.101"
            />
          </div>

          <button 
            class="btn-bind" 
            @click="bindDevice" 
            :disabled="binding || !form.device_id.trim()"
          >
            {{ binding ? '绑定中...' : '🔗 立即绑定' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 已绑定设备列表 -->
    <div v-else class="devices-section">
      <div class="section-header">
        <h2>🐶 我的设备</h2>
        <button class="btn-add-device" @click="showBindForm = true">+ 添加设备</button>
      </div>

      <div class="devices-grid">
        <div v-for="device in devices" :key="device.device_id" class="device-card">
          <div class="device-status" :class="device.status === 'online' ? 'online' : 'offline'">
            {{ device.status === 'online' ? '在线' : '离线' }}
          </div>
          <div class="device-icon">🐾</div>
          <h3>{{ device.device_name }}</h3>
          <div class="device-id">ID: {{ device.device_id }}</div>
          <div class="device-meta">
            <div class="meta-item" v-if="device.battery !== null">
              <span class="meta-icon">🔋</span>
              <span>{{ device.battery }}%</span>
            </div>
            <div class="meta-item" v-if="device.ip">
              <span class="meta-icon">🌐</span>
              <span>{{ device.ip }}</span>
            </div>
            <div class="meta-item" v-if="device.firmware_version">
              <span class="meta-icon">📦</span>
              <span>v{{ device.firmware_version }}</span>
            </div>
          </div>
          <div class="device-heartbeat" v-if="device.last_heartbeat">
            最近心跳：{{ formatTime(device.last_heartbeat) }}
          </div>
        </div>
      </div>

      <!-- 添加新设备弹窗 -->
      <div v-if="showBindForm" class="modal-overlay" @click="showBindForm = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>添加新设备</h3>
            <button class="close-btn" @click="showBindForm = false">×</button>
          </div>
          <div class="bind-form">
            <div class="form-group">
              <label>设备编号 *</label>
              <input v-model="form.device_id" type="text" placeholder="例如：puppy_002" />
            </div>
            <div class="form-group">
              <label>设备名称</label>
              <input v-model="form.device_name" type="text" placeholder="给设备起个名字" />
            </div>
            <div class="form-group">
              <label>设备IP（选填）</label>
              <input v-model="form.ip" type="text" placeholder="例如：192.168.1.102" />
            </div>
            <button 
              class="btn-bind" 
              @click="bindDevice" 
              :disabled="binding || !form.device_id.trim()"
            >
              {{ binding ? '绑定中...' : '🔗 绑定设备' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

const emit = defineEmits(['done'])

const devices = ref([])
const hasBoundDevice = ref(false)
const loading = ref(true)
const binding = ref(false)
const showBindForm = ref(false)

const form = ref({
  device_id: '',
  device_name: '',
  ip: ''
})

// 获取当前用户ID
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.username || user.studentId || user.id || ''
}

// 获取用户已绑定的设备
const fetchDevices = async () => {
  const userId = getUserId()
  if (!userId) { loading.value = false; return }
  
  try {
    const res = await apiGet(`/api/devices/list/${userId}`)
    if (res.code === 200) {
      devices.value = res.data || []
      hasBoundDevice.value = devices.value.length > 0
    }
  } catch (err) {
    console.error('获取设备列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 绑定设备
const bindDevice = async () => {
  if (!form.value.device_id.trim()) {
    alert('请输入设备编号')
    return
  }
  
  binding.value = true
  try {
    const userId = getUserId()
    const res = await apiPost('/api/devices/bind', {
      device_id: form.value.device_id.trim(),
      device_name: form.value.device_name.trim() || `PuppyFit-${form.value.device_id.trim()}`,
      usrid: userId,
      ip: form.value.ip.trim() || null
    })
    
    if (res.code === 200) {
      alert('🎉 设备绑定成功！')
      // 重置表单
      form.value = { device_id: '', device_name: '', ip: '' }
      showBindForm.value = false
      // 刷新设备列表
      await fetchDevices()
      // 存储绑定状态
      localStorage.setItem('deviceBound', 'true')
    } else {
      alert(res.message || '绑定失败')
    }
  } catch (err) {
    console.error('绑定设备失败:', err)
    alert('绑定失败，请检查设备编号是否正确')
  } finally {
    binding.value = false
  }
}

// 格式化时间
const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString('zh-CN')
}

onMounted(fetchDevices)
</script>

<style scoped>
.device-bind-page {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #64748B;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.spinner-pulse {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.1);
  animation: float 2s ease-in-out infinite;
}

.spinner-pulse::before {
  content: '🐾';
  font-size: 24px;
  animation: pulse-icon 1.5s ease-in-out infinite;
}

.spinner-pulse::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #4F46E5;
  border-right-color: #818CF8;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse-icon {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* 绑定引导页 */
.bind-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  border: 1px solid #E2E8F0;
}

.bind-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.bind-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
}

.bind-header p {
  color: #64748B;
  font-size: 14px;
  margin-bottom: 32px;
}

/* 表单 */
.bind-form {
  text-align: left;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 14px;
  color: #0F172A;
  transition: all 0.15s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #4F46E5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-bind {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}

.btn-bind:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
}

.btn-bind:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 设备列表页 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
}

.btn-add-device {
  padding: 6px 14px;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add-device:hover {
  background: #4338CA;
}

.devices-grid {
  display: grid;
  gap: 16px;
}

.device-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  position: relative;
  transition: all 0.15s;
}

.device-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.device-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.device-status.online {
  background: #DCFCE7;
  color: #16A34A;
}

.device-status.offline {
  background: #F1F5F9;
  color: #94A3B8;
}

.device-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.device-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.device-id {
  font-size: 12px;
  color: #94A3B8;
  font-family: monospace;
  margin-bottom: 12px;
}

.device-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748B;
}

.meta-icon {
  font-size: 14px;
}

.device-heartbeat {
  margin-top: 8px;
  font-size: 12px;
  color: #94A3B8;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #94A3B8;
  cursor: pointer;
}
</style>
