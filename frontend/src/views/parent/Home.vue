<template>
  <div class="home-dashboard">
    <header class="page-header">
      <h1>成长档案 🌟</h1>
      <p>记录 {{ user?.parentName || '家长' }} 宝贝的每一步成长！</p>
    </header>

    <!-- 统计趋势卡片组 -->
    <div class="stats-grid">
      <div class="stat-card coral">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <span class="stat-label">本周运动总时长</span>
          <span class="stat-value">120 <small>分钟</small></span>
        </div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon">🏅</div>
        <div class="stat-info">
          <span class="stat-label">获得勋章总数</span>
          <span class="stat-value">5 <small>个</small></span>
        </div>
      </div>
      <div class="stat-card teal">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <span class="stat-label">任务完成率</span>
          <span class="stat-value">85 <small>%</small></span>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 活力趋势图区域 -->
      <section class="chart-section">
        <div class="section-header">
          <h2>📊 近期活力趋势</h2>
          <span class="subtitle">过去 7 天的运动表现</span>
        </div>
        <div class="chart-container">
          <v-chart class="chart" :option="chartOption" autoresize />
        </div>
      </section>

      <!-- 近期动态区域 -->
      <section class="activity-section">
        <div class="section-header">
          <h2>🌟 近期动态</h2>
        </div>
        <div class="timeline">
          <div v-for="(activity, index) in activities" :key="index" class="timeline-item">
            <div class="timeline-dot" :class="activity.type"></div>
            <div class="timeline-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.desc }}</p>
              <span class="time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// 注册 ECharts 核心组件
use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 近期动态（静态展示数据，后续可对接后端）
const activities = ref([
  { title: '完成任务', desc: '成功完成了【第一周体能测试】', time: '2 小时前', type: 'success' },
  { title: '达成荣誉', desc: '获得了【跳绳达人】勋章 🏅', time: '昨天 14:30', type: 'award' },
  { title: '系统提醒', desc: '老师发布了新的运动挑战待办', time: '2 天前', type: 'info' }
])

// ECharts 配置图表数据
const chartOption = ref({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#4ECDC4',
    textStyle: { color: '#2D3436' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#E2E8F0' } },
    axisLabel: { color: '#64748B', fontWeight: 600 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    axisLabel: { color: '#64748B' }
  },
  series: [
    {
      name: '活力值',
      type: 'line',
      smooth: true,
      lineStyle: { width: 4, color: '#4ECDC4' },
      itemStyle: { color: '#4ECDC4', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(78,205,196,0.3)' },
            { offset: 1, color: 'rgba(78,205,196,0)' }
          ]
        }
      },
      data: [30, 45, 80, 60, 90, 120, 100]
    }
  ]
})
</script>

<style scoped>
.home-dashboard {
  animation: fadeIn 0.4s ease;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #2D3436;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #64748B;
}

/* 快捷统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.stat-card.coral:hover { border-color: #FF6B6B; box-shadow: 0 12px 24px rgba(255,107,107,0.15); }
.stat-card.amber:hover { border-color: #FFD93D; box-shadow: 0 12px 24px rgba(255,217,61,0.15); }
.stat-card.teal:hover { border-color: #4ECDC4; box-shadow: 0 12px 24px rgba(78,205,196,0.15); }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.coral .stat-icon { background: #FFE5E5; color: #FF6B6B; }
.amber .stat-icon { background: #FFF9C4; color: #FFB347; }
.teal .stat-icon { background: #E8F8F5; color: #4ECDC4; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #2D3436;
}

.stat-value small {
  font-size: 14px;
  font-weight: 500;
  color: #94A3B8;
}

/* 主内容区 */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

.section-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #2D3436;
}

.subtitle {
  font-size: 13px;
  color: #94A3B8;
  background: #F1F5F9;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 图表区 */
.chart-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 时间轴 */
.activity-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.timeline {
  position: relative;
  padding-left: 14px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 0;
  width: 2px;
  background: #E2E8F0;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 1px #E2E8F0;
}

.timeline-dot.success { background: #4ECDC4; }
.timeline-dot.award { background: #FFD93D; }
.timeline-dot.info { background: #1890ff; }

.timeline-content h4 {
  font-size: 15px;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 4px 0;
}

.timeline-content p {
  font-size: 13px;
  color: #64748B;
  margin: 0 0 6px 0;
  line-height: 1.5;
}

.time {
  font-size: 11px;
  color: #94A3B8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
