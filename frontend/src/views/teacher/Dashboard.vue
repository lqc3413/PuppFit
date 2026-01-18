<template>
  <div class="dashboard-container">
    <!-- PC Sidebar -->
    <aside class="pc-sidebar">
      <div class="sidebar-header">
        <div class="logo">🐶 PuppyFit <span class="badge">教师端</span></div>
        <div v-if="currentSemester" class="semester-tag">📅 {{ currentSemester }}</div>
      </div>
      <nav class="sidebar-nav">
        <div 
          :class="['nav-item', { active: currentView === 'assign' }]"
          @click="currentView = 'assign'"
        >
          <span class="icon">📝</span>
          <span class="label">发布任务</span>
        </div>
        <div 
          :class="['nav-item', { active: currentView === 'grades' }]"
          @click="currentView = 'grades'"
        >
          <span class="icon">📊</span>
          <span class="label">学生成绩</span>
        </div>
        <div 
          :class="['nav-item', { active: currentView === 'chat' }]"
          @click="currentView = 'chat'"
        >
          <span class="icon">💬</span>
          <span class="label">班级群聊</span>
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
          <div class="avatar">T</div>
          <span class="username">{{ user?.name || '李老师' }}</span>
        </div>
        <div class="logout" @click="logout">退出</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <component :is="currentComponent" />
      </div>
    </main>

    <!-- Mobile Nav -->
    <nav class="mobile-nav">
      <div 
        :class="['nav-item', { active: currentView === 'assign' }]"
        @click="currentView = 'assign'"
      >
        <span class="icon">📝</span>
        <span class="label">任务</span>
      </div>
      <div 
        :class="['nav-item', { active: currentView === 'grades' }]"
        @click="currentView = 'grades'"
      >
        <span class="icon">📊</span>
        <span class="label">成绩</span>
      </div>
      <div 
        :class="['nav-item', { active: currentView === 'chat' }]"
        @click="currentView = 'chat'"
      >
        <span class="icon">💬</span>
        <span class="label">群前</span>
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
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Async components to avoid circular dependencies and load on demand
const TaskAssign = defineAsyncComponent(() => import('./TaskAssign.vue'))
const StudentGrades = defineAsyncComponent(() => import('./StudentGrades.vue'))
// Reusing Profile from parent view or creating a teacher specific one? 
// For now, let's assume we reuse or create a simple placeholder.
// Ideally, we should refactor shared components.
// For Chat, we will integrate later.
const Profile = defineAsyncComponent(() => import('./Profile.vue')) 

const router = useRouter()
const currentView = ref('grades')
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const currentSemester = ref('')

// 获取当前学期
const fetchCurrentSemester = async () => {
  try {
    const res = await axios.get('/api/admin/semesters')
    if (res.data.code === 200) {
      const current = res.data.data.find(s => s.isCurrent)
      if (current) currentSemester.value = current.name
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchCurrentSemester()
})

const currentComponent = computed(() => {
  switch (currentView.value) {
    case 'assign': return TaskAssign
    case 'grades': return StudentGrades
    case 'chat': return null // Placeholder
    case 'profile': return Profile
    default: return StudentGrades
  }
})

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/')
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* PC Sidebar Styles - Reusing from Parent Dashboard logic */
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
  gap: 8px;
  display: flex;
  align-items: center;
}

.badge {
  font-size: 12px;
  background: #faad14;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
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

.icon {
  margin-right: 12px;
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eaedf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #faad14;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.logout {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.logout:hover {
  color: #ff4d4f;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .dashboard-container {
    display: block;
    padding-bottom: 80px;
  }
  .pc-sidebar { display: none; }
  
  .main-content {
    margin-left: 0;
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
}
</style>
