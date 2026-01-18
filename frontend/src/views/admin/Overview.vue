<template>
  <div class="overview-page">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalStudents }}</div>
          <div class="stat-label">学生总数</div>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activeStudents }}</div>
          <div class="stat-label">活跃学生</div>
        </div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">👩‍🏫</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTeachers }}</div>
          <div class="stat-label">在职教师</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">🏫</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalClasses }}</div>
          <div class="stat-label">班级数量</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3 class="chart-title">📈 最近7天打卡趋势</h3>
        <div class="chart-container">
          <div class="bar-chart">
            <div 
              v-for="(item, index) in stats.checkInTrend" 
              :key="index"
              class="bar-item"
            >
              <div class="bar" :style="{ height: getBarHeight(item.count) + 'px' }">
                <span class="bar-value">{{ item.count }}</span>
              </div>
              <span class="bar-label">{{ formatDate(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3 class="chart-title">📌 今日概览</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">今日打卡人次</span>
            <span class="info-value">{{ stats.todayCheckIns }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">待处理任务</span>
            <span class="info-value">0</span>
          </div>
          <div class="info-item">
            <span class="info-label">系统运行状态</span>
            <span class="info-value status-ok">正常</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 class="section-title">⚡ 快捷操作</h3>
      <div class="action-grid">
        <button class="action-btn" @click="$parent.currentView = 'teacher'">
          <span class="action-icon">➕</span>
          <span>新增教师</span>
        </button>
        <button class="action-btn" @click="$parent.currentView = 'student'">
          <span class="action-icon">📥</span>
          <span>导入学生</span>
        </button>
        <button class="action-btn" @click="$parent.currentView = 'class'">
          <span class="action-icon">🏫</span>
          <span>创建班级</span>
        </button>
        <button class="action-btn" @click="$parent.currentView = 'exercise'">
          <span class="action-icon">🏃</span>
          <span>运动项目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
  totalStudents: 0,
  activeStudents: 0,
  totalTeachers: 0,
  totalClasses: 0,
  todayCheckIns: 0,
  checkInTrend: []
})

const getBarHeight = (count) => {
  const maxCount = Math.max(...stats.value.checkInTrend.map(i => i.count), 1)
  return Math.max(20, (count / maxCount) * 120)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/admin/dashboard')
    if (res.data.code === 200) {
      stats.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.overview-page {
  max-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-card.blue { border-left: 4px solid #3b82f6; }
.stat-card.green { border-left: 4px solid #10b981; }
.stat-card.orange { border-left: 4px solid #f59e0b; }
.stat-card.purple { border-left: 4px solid #8b5cf6; }

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card, .info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 20px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 160px;
  padding-top: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 40px;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 20px;
  transition: height 0.3s;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
}

.bar-label {
  font-size: 12px;
  color: #6b7280;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

.status-ok {
  color: #10b981;
}

.quick-actions {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #374151;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-icon {
  font-size: 24px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
