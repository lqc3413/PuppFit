<template>
  <div class="admin-wrapper">
    <div class="admin-box">
      <h2>PuppyFit 管理后台</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input v-model="username" type="text" placeholder="管理员账号" required />
        </div>
        <div class="input-group">
          <input v-model="password" type="password" placeholder="密码" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '进入后台' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value,
      type: 'admin'
    })
    
    const { code, data, message } = res.data
    if (code === 200) {
      localStorage.setItem('admin-token', data.token)
      router.push('/admin/dashboard')
    } else {
      error.value = message
    }
  } catch (err) {
    error.value = '连接服务器失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
}

.admin-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 480px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.admin-box h2 {
  color: #333;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background: #34495e;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 13px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .admin-wrapper {
    background-color: white;
    align-items: flex-start;
  }

  .admin-box {
    box-shadow: none;
    padding: 30px 20px;
    border-radius: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .admin-box h2 {
    margin-top: 40px;
    margin-bottom: 40px;
    font-size: 24px;
  }

  form {
    flex: 1;
  }

  button {
    margin-top: 20px;
    padding: 14px;
    font-size: 16px;
  }
}
</style>
