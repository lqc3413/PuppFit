<template>
  <button 
    :class="['action-btn', variant]" 
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '按钮'
  },
  variant: {
    type: String,
    default: 'primary', // primary, outline, danger
    validator: (val) => ['primary', 'outline', 'danger', 'success'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #40a9ff;
}

.action-btn.success {
  background: #52c41a;
  border: 1px solid #52c41a;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #73d13d;
}

.action-btn.outline {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.action-btn.outline:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn.danger {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.action-btn.danger:hover:not(:disabled) {
  background: #fecaca;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
