<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🐶</span>
          <span class="logo-text">PuppyFit</span>
        </div>
        <span class="admin-badge">管理后台</span>
      </div>

      <nav class="sidebar-nav">
        <div 
          v-for="menu in menuList" 
          :key="menu.key"
          class="nav-group"
        >
          <div 
            v-if="!menu.children"
            :class="['nav-item', { active: currentView === menu.key }]"
            @click="currentView = menu.key"
          >
            <span class="nav-icon">{{ menu.icon }}</span>
            <span class="nav-label">{{ menu.title }}</span>
          </div>
          
          <template v-else>
            <div class="nav-group-title" @click="toggleMenu(menu.key)">
              <span class="nav-icon">{{ menu.icon }}</span>
              <span class="nav-label">{{ menu.title }}</span>
              <span class="arrow" :class="{ expanded: expandedMenus.includes(menu.key) }">▸</span>
            </div>
            <div v-show="expandedMenus.includes(menu.key)" class="nav-children">
              <div 
                v-for="child in menu.children" 
                :key="child.key"
                :class="['nav-item child', { active: currentView === child.key }]"
                @click="currentView = child.key"
              >
                <span class="nav-label">{{ child.title }}</span>
              </div>
            </div>
          </template>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">A</div>
          <span class="admin-name">系统管理员</span>
        </div>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="breadcrumb">
          <span class="breadcrumb-item">{{ currentMenuTitle }}</span>
        </div>
        <div class="header-right">
        </div>
      </header>

      <div class="admin-content">
        <component :is="currentComponent" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentView = ref('overview')
const expandedMenus = ref(['user', 'academic', 'system'])

// 异步加载组件
const OverviewPage = defineAsyncComponent(() => import('./Overview.vue'))
const TeacherListPage = defineAsyncComponent(() => import('./TeacherList.vue'))
const StudentListPage = defineAsyncComponent(() => import('./StudentList.vue'))
const ClassListPage = defineAsyncComponent(() => import('./ClassList.vue'))
const ExerciseDictPage = defineAsyncComponent(() => import('./ExerciseDict.vue'))
const SystemLogPage = defineAsyncComponent(() => import('./SystemLog.vue'))

const menuList = [
  { key: 'overview', title: '数据概览', icon: '📊' },
  { 
    key: 'user', 
    title: '人员管理', 
    icon: '👥',
    children: [
      { key: 'teacher', title: '教师列表' },
      { key: 'student', title: '学生列表' }
    ]
  },
  { 
    key: 'academic', 
    title: '教务管理', 
    icon: '🏫',
    children: [
      { key: 'class', title: '班级管理' }
    ]
  },
  { 
    key: 'system', 
    title: '系统设置', 
    icon: '⚙️',
    children: [
      { key: 'exercise', title: '运动项目库' },
      { key: 'log', title: '操作日志' }
    ]
  }
]

const currentComponent = computed(() => {
  const map = {
    overview: OverviewPage,
    teacher: TeacherListPage,
    student: StudentListPage,
    class: ClassListPage,
    exercise: ExerciseDictPage,
    log: SystemLogPage
  }
  return map[currentView.value] || OverviewPage
})

const currentMenuTitle = computed(() => {
  for (const menu of menuList) {
    if (menu.key === currentView.value) return menu.title
    if (menu.children) {
      const child = menu.children.find(c => c.key === currentView.value)
      if (child) return `${menu.title} / ${child.title}`
    }
  }
  return '数据概览'
})

const toggleMenu = (key) => {
  const idx = expandedMenus.value.indexOf(key)
  if (idx > -1) {
    expandedMenus.value.splice(idx, 1)
  } else {
    expandedMenus.value.push(key)
  }
}

const logout = () => {
  localStorage.removeItem('admin-token')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

/* Sidebar */
.admin-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.admin-badge {
  display: inline-block;
  font-size: 11px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  margin-left: 38px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group-title {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-group-title:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}

.nav-icon {
  margin-right: 12px;
  font-size: 16px;
}

.nav-label {
  flex: 1;
  font-size: 14px;
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.nav-children {
  background: rgba(0,0,0,0.2);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}

.nav-item.child {
  padding-left: 52px;
}

.nav-item.active {
  color: #fff;
  background: linear-gradient(90deg, rgba(59,130,246,0.3), transparent);
  border-left: 3px solid #3b82f6;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.admin-name {
  color: rgba(255,255,255,0.9);
  font-size: 13px;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.7);
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb-item {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.admin-content {
  flex: 1;
  padding: 24px;
}
</style>
