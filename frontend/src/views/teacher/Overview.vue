<template>
  <div class="teacher-overview">
    <header class="page-header">
      <div class="header-titles">
        <h1>控制台 Dashboard</h1>
        <p>欢迎回到工作台，{{ user?.name || '李老师' }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="$router.push('/teacher/assign')">
          <span class="icon">✨</span> 发布新任务
        </button>
      </div>
    </header>

    <!-- 关键指标 KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">班级平均分</span>
          <span class="kpi-icon indigo">📈</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">85.4</span>
          <span class="kpi-trend positive">↑ 2.1% 较上周</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">本周达标率</span>
          <span class="kpi-icon emerald">🎯</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">78%</span>
          <span class="kpi-trend positive">↑ 5.0% 较上周</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">未完成任务学生</span>
          <span class="kpi-icon amber">⚠️</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">12<small>人</small></span>
          <span class="kpi-trend negative">需及时督促</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">本学期布置任务</span>
          <span class="kpi-icon slate">📚</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">24<small>次</small></span>
          <span class="kpi-trend neutral">按教学计划进行中</span>
        </div>
      </div>
    </div>

    <div class="dashboard-main">
      <!-- 图表区域 -->
      <section class="chart-panel">
        <div class="panel-header">
          <h2>班级综合运动能力分析</h2>
        </div>
        <div class="chart-container">
          <v-chart class="chart" :option="radarOption" autoresize />
        </div>
      </section>

      <!-- 待办与预警 -->
      <section class="action-panel">
        <div class="panel-header">
          <h2>待办提醒</h2>
        </div>
        <div class="action-list">
          <div v-for="(item, idx) in alerts" :key="idx" class="action-item">
            <div class="action-icon" :class="item.type">
              {{ item.type === 'warning' ? '⚠️' : 'ℹ️' }}
            </div>
            <div class="action-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
            <button class="btn-text">查看</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// 注册 ECharts 组件
use([CanvasRenderer, RadarChart, BarChart, TooltipComponent, LegendComponent])

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 待办提醒（静态展示数据，后续可对接后端）
const alerts = ref([
  { title: '成绩待审批', desc: '有 15 份引体向上测试成绩待复核', type: 'info' },
  { title: '活跃度预警', desc: '张三、李四等 5 名同学连续3天未打卡', type: 'warning' },
  { title: '期中考核提醒', desc: '本周五将进行男生 1000 米测试录入', type: 'info' }
])

// ECharts 雷达图配置
const radarOption = ref({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#E2E8F0',
    textStyle: { color: '#0F172A' }
  },
  legend: {
    bottom: 0,
    data: ['本班平均水平', '年级优秀水平'],
    textStyle: { color: '#64748B' }
  },
  radar: {
    indicator: [
      { name: '心肺耐力 (跑)', max: 100 },
      { name: '上肢力量 (引体向上)', max: 100 },
      { name: '核心力量 (仰卧起坐)', max: 100 },
      { name: '柔韧性 (坐位体前屈)', max: 100 },
      { name: '爆发力 (立定跳远)', max: 100 }
    ],
    axisName: {
      color: '#334155',
      fontWeight: 600,
      padding: [3, 5]
    },
    splitArea: {
      areaStyle: {
        color: ['#F8FAFC', '#F1F5F9', '#F8FAFC', '#F1F5F9']
      }
    },
    axisLine: { lineStyle: { color: '#CBD5E1' } },
    splitLine: { lineStyle: { color: '#E2E8F0' } }
  },
  series: [
    {
      name: '能力对比',
      type: 'radar',
      symbol: 'circle',
      symbolSize: 6,
      data: [
        {
          value: [75, 60, 85, 70, 80],
          name: '本班平均水平',
          itemStyle: { color: '#4F46E5' },
          areaStyle: { color: 'rgba(79, 70, 229, 0.2)' }
        },
        {
          value: [90, 85, 95, 80, 85],
          name: '年级优秀水平',
          itemStyle: { color: '#10B981' },
          lineStyle: { type: 'dashed' },
          areaStyle: { color: 'rgba(0,0,0,0)' } // 透明
        }
      ]
    }
  ]
})
</script>

<style scoped>
.teacher-overview {
  animation: fadeIn 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-titles h1 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A; /* Slate 900 */
  margin-bottom: 4px;
}

.header-titles p {
  font-size: 14px;
  color: #64748B; /* Slate 500 */
}

.btn-primary {
  background: #4F46E5; /* Indigo 600 */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease-in-out;
}

.btn-primary:hover {
  background: #4338CA; /* Indigo 700 */
  transform: translateY(-1px);
}

/* KPI 面板 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  border: 1px solid #E2E8F0; /* Slate 200 */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.15s;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #CBD5E1;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569; /* Slate 600 */
}

.kpi-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.kpi-icon.indigo { background: #EEF2FF; color: #4F46E5; }
.kpi-icon.emerald { background: #ECFDF5; color: #10B981; }
.kpi-icon.amber { background: #FFFBEB; color: #D97706; }
.kpi-icon.slate { background: #F1F5F9; color: #475569; }

.kpi-body {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.kpi-value small {
  font-size: 14px;
  font-weight: 500;
  color: #64748B;
  margin-left: 4px;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 500;
}

.kpi-trend.positive { color: #10B981; } /* Emerald 500 */
.kpi-trend.negative { color: #EF4444; } /* Red 500 */
.kpi-trend.neutral { color: #64748B; }

/* 主区域网格 */
.dashboard-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
}

.panel-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F1F5F9;
}

.panel-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

/* 图表面板 */
.chart-panel {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 20px;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 待办面板 */
.action-panel {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 20px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  transition: background 0.15s;
}

.action-item:hover {
  background: white;
  border-color: #CBD5E1;
}

.action-icon {
  font-size: 18px;
  margin-top: 2px;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 12px;
  color: #64748B;
  margin: 0;
  line-height: 1.4;
}

.btn-text {
  background: none;
  border: none;
  color: #4F46E5;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-text:hover {
  background: #EEF2FF;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
