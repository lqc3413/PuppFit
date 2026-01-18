<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
      <div class="filter-group">
        <select v-model="filterAction" class="filter-select">
          <option value="">全部操作</option>
          <option value="新增教师">新增教师</option>
          <option value="创建班级">创建班级</option>
          <option value="批量导入学生">批量导入学生</option>
          <option value="封禁账号">封禁账号</option>
          <option value="解封账号">解封账号</option>
          <option value="重置密码">重置密码</option>
          <option value="学生调班">学生调班</option>
        </select>
      </div>
    </div>

    <div class="log-list">
      <div v-for="log in filteredLogs" :key="log.id" class="log-item">
        <div class="log-icon">{{ getActionIcon(log.action) }}</div>
        <div class="log-content">
          <div class="log-main">
            <span class="log-operator">{{ log.operator }}</span>
            <span class="log-action">{{ log.action }}</span>
            <span v-if="log.target" class="log-target">{{ log.target }}</span>
          </div>
          <div v-if="log.detail" class="log-detail">{{ log.detail }}</div>
        </div>
        <div class="log-time">{{ log.createdAt }}</div>
      </div>

      <div v-if="filteredLogs.length === 0" class="empty-state">
        暂无日志记录
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const logs = ref([])
const filterAction = ref('')

const filteredLogs = computed(() => {
  if (!filterAction.value) return logs.value
  return logs.value.filter(l => l.action === filterAction.value)
})

const getActionIcon = (action) => {
  const icons = {
    '新增教师': '👩‍🏫',
    '创建班级': '🏫',
    '绑定班主任': '🔗',
    '批量导入学生': '📥',
    '封禁账号': '🚫',
    '解封账号': '✅',
    '重置密码': '🔑',
    '学生调班': '🔄'
  }
  return icons[action] || '📝'
}

onMounted(async () => {
  const res = await axios.get('/api/admin/logs')
  if (res.data.code === 200) logs.value = res.data.data
})
</script>

<style scoped>
.page-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  min-width: 160px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.log-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.log-content {
  flex: 1;
}

.log-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-operator {
  font-weight: 600;
  color: #1f2937;
}

.log-action {
  color: #3b82f6;
  font-weight: 500;
}

.log-target {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.log-detail {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}
</style>
