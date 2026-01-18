<template>
  <div class="dashboard-container">
    <!-- PC Sidebar Navigation -->
    <aside class="pc-sidebar">
      <div class="sidebar-header">
        <div class="logo">🐶 PuppyFit</div>
        <div v-if="currentSemester" class="semester-tag">📅 {{ currentSemester }}</div>
      </div>
      <nav class="sidebar-nav">
        <div 
          :class="['nav-item', { active: currentView === 'tasks' }]"
          @click="currentView = 'tasks'"
        >
          <span class="icon">📝</span>
          <span class="label">任务列表</span>
        </div>
        <div 
          :class="['nav-item', { active: currentView === 'voice' }]"
          @click="currentView = 'voice'"
        >
          <span class="icon">🎙️</span>
          <span class="label">语音</span>
        </div>
        <div 
          :class="['nav-item', { active: currentView === 'chat' }]"
          @click="currentView = 'chat'"
        >
          <span class="icon">💬</span>
          <span class="label">聊天室</span>
        </div>
        <div 
          :class="['nav-item', { active: currentView === 'profile' }]"
          @click="currentView = 'profile'"
        >
          <span class="icon">👤</span>
          <span class="label">个人中心</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">S</div>
          <span class="username">{{ user?.name || '同学' }}</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Voice View -->
        <Voice v-if="currentView === 'voice'" />
        
        <!-- Profile View -->
        <Profile v-else-if="currentView === 'profile'" />

        <!-- Tasks View (Default) -->
        <template v-else>
          <header class="page-header">
            <h1>你好，{{ user?.parentName || '家长' }} 👋</h1>
            <p>关注孩子健康，共筑美好未来！</p>
            <div v-if="currentSemester" class="semester-info">📅 当前学期：{{ currentSemester }}</div>
          </header>

          <!-- Pending Tasks Section -->
          <section class="tasks-section" v-if="pendingTasks.length > 0">
            <h2>📝 待办任务</h2>
            <div class="records-list">
              <div 
                v-for="task in pendingTasks" 
                :key="task.id" 
                class="record-card pending-card"
                @click="openModal(task, 'pending')"
              >
                <div class="record-icon pending-icon">
                  <span>📌</span>
                </div>
                <div class="record-info">
                  <h3>{{ task.title }}</h3>
                  <p class="date">截止日期: {{ task.deadline }}</p>
                </div>
                <div class="record-score">
                  <span class="score-value">{{ task.exercises?.length || 0 }}</span>
                  <span class="score-unit">
                    项运动<br>
                    <span class="sub-text">(点击查看)</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Completed Tasks Section -->
          <section class="records-section">
            <h2>✅ 已完成任务</h2>
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="completedTasks.length === 0" class="empty-text">暂无已完成任务</div>
            <div v-else class="records-list">
              <div 
                v-for="record in completedTasks" 
                :key="record.id" 
                class="record-card"
                @click="openModal(record, 'completed')"
              >
                <div class="record-icon">
                  <span>🏅</span>
                </div>
                <div class="record-info">
                  <h3>{{ record.taskTitle }}</h3>
                  <p class="date">完成时间: {{ record.completedAt }}</p>
                </div>
                <div class="record-score">
                  <span class="score-value">{{ record.totalScore }}</span>
                  <span class="score-unit">
                    分<br>
                    <span class="sub-text">({{ record.results?.length || 0 }}项运动)</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Task Detail Modal -->
          <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>{{ selectedType === 'pending' ? '任务详情' : '成绩详情' }}</h3>
                <button class="close-btn" @click="closeModal">×</button>
              </div>
              
              <div class="modal-body" v-if="selectedTask">
                <!-- Pending Task Details -->
                <template v-if="selectedType === 'pending'">
                  <div class="detail-row">
                    <span class="label">任务名称</span>
                    <span class="value">{{ selectedTask.title }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">截止日期</span>
                    <span class="value">{{ selectedTask.deadline }}</span>
                  </div>
                  
                  <div class="exercises-list">
                    <div class="exercises-title">运动项目 (共 {{ selectedTask.exercises?.length || 0 }} 项)</div>
                    <div v-for="(ex, idx) in selectedTask.exercises" :key="idx" class="exercise-item">
                      <span class="ex-name">{{ ex.type }}</span>
                      <span class="ex-target">{{ ex.target }}{{ ex.unit }}</span>
                      <span class="ex-weight">权重 {{ (ex.weight * 100).toFixed(0) }}%</span>
                    </div>
                  </div>
                  
                  <div class="modal-actions">
                    <button class="btn-primary" @click="closeModal">去完成</button>
                  </div>
                </template>

                <!-- Completed Task Details -->
                <template v-else>
                  <div class="detail-row">
                    <span class="label">任务名称</span>
                    <span class="value">{{ selectedTask.taskTitle }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">完成时间</span>
                    <span class="value">{{ selectedTask.completedAt }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">总成绩</span>
                    <span class="value highlight">{{ selectedTask.totalScore }} 分</span>
                  </div>
                  
                  <div class="exercises-list">
                    <div class="exercises-title">各项运动成绩</div>
                    <div v-for="(result, idx) in selectedTask.results" :key="idx" class="exercise-item">
                      <span class="ex-name">{{ result.type }}</span>
                      <span class="ex-target">{{ result.score }} / {{ result.target }}</span>
                      <span class="ex-score">{{ Math.min(100, Math.round(result.score / result.target * 100)) }}分</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-nav">
      <div 
        :class="['nav-item', { active: currentView === 'tasks' }]"
        @click="currentView = 'tasks'"
      >
        <span class="icon">📝</span>
        <span class="label">任务</span>
      </div>
      <div 
        :class="['nav-item', { active: currentView === 'voice' }]"
        @click="currentView = 'voice'"
      >
        <span class="icon">🎙️</span>
        <span class="label">语音</span>
      </div>
      <div 
        :class="['nav-item', { active: currentView === 'chat' }]"
        @click="currentView = 'chat'"
      >
        <span class="icon">💬</span>
        <span class="label">聊天室</span>
      </div>
      <div 
        :class="['nav-item', { active: currentView === 'profile' }]"
        @click="currentView = 'profile'"
      >
        <span class="icon">👤</span>
        <span class="label">我的</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import Voice from './Voice.vue'
import Profile from './Profile.vue'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const pendingTasks = ref([])
const completedTasks = ref([])
const loading = ref(true)
const currentView = ref('tasks') // 'tasks' | 'voice' | 'chat' | 'profile'
const currentSemester = ref('')

// Modal State
const showModal = ref(false)
const selectedTask = ref(null)
const selectedType = ref('') // 'pending' | 'completed'
let closeTimeoutId = null // 追踪关闭定时器

const openModal = (task, type) => {
  // 取消之前的延迟清除，防止新数据被清空
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId)
    closeTimeoutId = null
  }
  selectedTask.value = task
  selectedType.value = type
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  closeTimeoutId = setTimeout(() => {
    selectedTask.value = null
    selectedType.value = ''
    closeTimeoutId = null
  }, 300)
}

const calculateScore = (score, target) => {
  if (!target || target === 0) return 100 // Default to 100 if no target
  let percentage = Math.round((score / target) * 100)
  return percentage > 100 ? 100 : percentage // Cap at 100
} 

onMounted(async () => {
  // 获取任务（API已返回当前学期名称）
  try {
    const res = await axios.get('/api/parent/tasks')
    if (res.data.code === 200) {
      pendingTasks.value = res.data.data.pending
      completedTasks.value = res.data.data.completed
      // 从任务API直接获取当前学期（实时同步）
      if (res.data.data.currentSemester) {
        currentSemester.value = res.data.data.currentSemester
      }
    }
  } catch (error) {
    console.error('Failed to fetch tasks', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* PC Sidebar Styles */
.pc-sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #eaedf0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.sidebar-header {
  padding: 24px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #34495e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.semester-tag {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.semester-info {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  background: #e6f7ff;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.sidebar-nav {
  flex: 1;
  padding: 0 12px;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  color: #57606a;
  transition: all 0.2s;
}

.sidebar-nav .nav-item:hover {
  background-color: #f6f8fa;
  color: #24292f;
}

.sidebar-nav .nav-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
}

.sidebar-nav .icon {
  margin-right: 12px;
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eaedf0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.username {
  font-size: 14px;
  color: #24292f;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px; /* Offset for fixed sidebar */
  padding: 32px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.records-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.record-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  border: 1px solid #eaedf0;
  transition: all 0.3s;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  border-color: transparent;
}

.record-icon {
  width: 56px;
  height: 56px;
  background: #f0f7ff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 20px;
  color: #1890ff;
}

.record-info {
  flex: 1;
  min-width: 0; /* Critical for text truncation in flex items */
  margin-right: 12px;
}

.record-info h3 {
  margin: 0 0 6px 0;
  color: #24292f;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-score {
  margin-left: auto;
  margin-right: 30px;
  flex-shrink: 0;
  text-align: right;
}

.record-info .date {
  margin: 0;
  color: #57606a;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
}

/* Mobile Navigation (Hidden on Desktop) */
.mobile-nav {
  display: none;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .dashboard-container {
    display: block; /* Stack layout on mobile */
    padding-bottom: 80px;
  }

  .pc-sidebar {
    display: none; /* Hide sidebar on mobile */
  }

  .main-content {
    margin-left: 0; /* Reset margins */
    padding: 20px;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #eaedf0;
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .mobile-nav .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    color: #999;
    font-size: 11px;
  }

  .mobile-nav .nav-item.active {
    color: #1890ff;
  }

  .mobile-nav .icon {
    font-size: 22px;
    margin-bottom: 4px;
  }

  .records-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Extra Styles for Task Section */
.tasks-section {
  margin-bottom: 40px;
}

.tasks-section h2,
.records-section h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.pending-card {
  border-left: 4px solid #faad14;
}

.pending-icon {
  background: #fffbe6;
  color: #faad14;
}

.score-unit {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.sub-text {
  font-size: 12px;
  color: #b0bfc5;
}

/* Modal Styles */
.modal-overlay {
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
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-row .label {
  color: #7f8c8d;
}

.detail-row .value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.detail-row .value.highlight {
  color: #1890ff;
  font-weight: bold;
  font-size: 18px;
}

.modal-actions {
  margin-top: 24px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #40a9ff;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 运动项目列表样式 */
.exercises-list {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.exercises-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.exercise-item:last-child {
  border-bottom: none;
}

.ex-name {
  font-weight: 500;
  color: #34495e;
}

.ex-target {
  color: #666;
}

.ex-weight {
  color: #999;
  font-size: 12px;
}

.ex-score {
  color: #1890ff;
  font-weight: bold;
}

.empty-text {
  color: #999;
  text-align: center;
  padding: 40px;
}
</style>
