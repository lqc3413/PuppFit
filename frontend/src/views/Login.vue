<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="header">
        <h1 class="title">PuppyFit 家校互联</h1>
        <p class="subtitle">连接家庭与校园，共筑健康未来</p>
      </div>

      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'parent' }]"
          @click="activeTab = 'parent'"
        >
          我是家长
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'teacher' }]"
          @click="activeTab = 'teacher'"
        >
          我是老师
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>账号</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入账号"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />

        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
        
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('parent')
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const res = await axios.post('/api/auth/login', {
      username: form.username,
      password: form.password,
      type: activeTab.value
    })
    
    const { code, data, message } = res.data
    if (code === 200) {
      console.log('Login Success:', data)
      // 使用 Pinia Store 存储用户信息
      userStore.login(data.user, data.token)
      
      router.push('/dashboard')
    } else {
      errorMsg.value = message
    }
  } catch (err) {
    errorMsg.value = '登录请求失败，请检查网络'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  /* Warm/Educational Theme background */
  background-color: #fff1eb;
  background-image: linear-gradient(to top, #fff1eb 0%, #ace0f9 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 520px;
  transition: transform 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #7f8c8d;
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  background: #f0f2f5;
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  color: #666;
  transition: all 0.3s;
}

.tab-btn.active {
  background: white;
  color: #3498db; /* Blue for educational trust */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #34495e;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .login-wrapper {
    background: white; /* Simplified background for mobile to feel native */
    align-items: flex-start; /* Start from top */
  }

  .login-box {
    box-shadow: none;
    padding: 30px 20px;
    border-radius: 0;
    width: 100%;
    max-width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    margin-top: 40px;
    margin-bottom: 40px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 15px;
  }
  
  .login-form {
    flex: 1; /* Push footer if we had one, or just space out */
  }

  .submit-btn {
    margin-top: 20px;
    padding: 14px;
    font-size: 18px;
  }
}
</style>
