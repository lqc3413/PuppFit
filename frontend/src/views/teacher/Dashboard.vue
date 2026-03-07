<template>
  <div class="dashboard-container">
    <!-- PC Sidebar -->
    <aside class="pc-sidebar">
      <div class="sidebar-header">
        <div class="logo">🐶 PuppyFit <span class="badge">教师端</span></div>
      </div>
      <nav class="sidebar-nav">
        <div 
          :class="['nav-item', { active: currentView === 'overview' }]"
          @click="currentView = 'overview'"
        >
          <span class="icon">🏠</span>
          <span class="label">控制台</span>
        </div>
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
        :class="['nav-item', { active: currentView === 'overview' }]"
        @click="currentView = 'overview'"
      >
        <span class="icon">🏠</span>
        <span class="label">首页</span>
      </div>
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
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

// Async components to avoid circular dependencies and load on demand
const TaskAssign = defineAsyncComponent(() => import('./TaskAssign.vue'))
const StudentGrades = defineAsyncComponent(() => import('./StudentGrades.vue'))
const Overview = defineAsyncComponent(() => import('./Overview.vue'))
// Reusing Profile from parent view or creating a teacher specific one? 
// For now, let's assume we reuse or create a simple placeholder.
// Ideally, we should refactor shared components.
// For Chat, we will integrate later.
const Profile = defineAsyncComponent(() => import('./Profile.vue')) 

const router = useRouter()
const currentView = ref('overview')
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const currentComponent = computed(() => {
  switch (currentView.value) {
    case 'overview': return Overview
    case 'assign': return TaskAssign
    case 'grades': return StudentGrades
    case 'chat': return null // Placeholder
    case 'profile': return Profile
    default: return Overview
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
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0; /* Slate 200 */
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A; /* Slate 900 */
  gap: 8px;
  display: flex;
  align-items: center;
}

.badge {
  font-size: 11px;
  background: #4F46E5; /* Indigo 600 */
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 0 12px;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  color: #475569; /* Slate 600 */
  font-size: 14px;
  transition: all 0.15s ease-in-out;
}

.sidebar-nav .nav-item:hover {
  background-color: #F8FAFC; /* Slate 50 */
  color: #0F172A; /* Slate 900 */
}

.sidebar-nav .nav-item.active {
  background-color: #EEF2FF; /* Indigo 50 */
  color: #4F46E5; /* Indigo 600 */
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
  width: 28px;
  height: 28px;
  background: #4F46E5; /* Indigo 600 */
  color: white;
  border-radius: 6px; /* Squircle */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
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
  max-width: 1100px; /* Slightly wider for data tables */
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
    color: #4F46E5;
  }
  
  .mobile-nav .icon {
    font-size: 22px;
    margin-bottom: 4px;
  }
}
</style>
