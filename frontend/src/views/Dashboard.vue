<template>
  <component :is="currentDashboard" />
</template>

<script setup>
import { computed } from 'vue'
import ParentDashboard from './parent/Dashboard.vue'
import TeacherDashboard from './teacher/Dashboard.vue'

const user = JSON.parse(localStorage.getItem('user') || '{}')

const currentDashboard = computed(() => {
  if (user.role === 'teacher' || user.role === 'admin') {
    return TeacherDashboard
  }
  return ParentDashboard
})
</script>
