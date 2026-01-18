<template>
  <header class="section-header">
    <h2>{{ title }} {{ icon }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 20px;
}

.section-header p {
  color: #7f8c8d;
  font-size: 14px;
}
</style>
