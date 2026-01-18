<template>
  <div class="voice-container">
    <header class="voice-header">
      <h2>语音交互 🎙️</h2>
      <p>对实体机器狗说点什么吧，它会复述你的话哦！</p>
    </header>

    <div class="voice-content">
      <div :class="['mic-wrapper', { recording: isRecording }]">
        <div class="status-text">{{ statusText }}</div>
        
        <button 
          class="mic-btn"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
        >
          <span class="mic-icon">🎤</span>
        </button>
        
        <div class="pulse-ring"></div>
      </div>

      <div class="result-area" v-if="messageContent">
        <div class="label">识别结果:</div>
        <div class="user-text">{{ messageContent }}</div>
      </div>

      <div class="history" v-if="lastMessage">
        <div class="message-card">
          <div class="label">机器狗回复:</div>
          <div class="text">"{{ lastMessage }}"</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isRecording = ref(false)
const statusText = ref('按住说话')
const lastMessage = ref('')
const messageContent = ref('') // 存储用户识别后的语音内容

let recognition = null

onMounted(() => {
  // 检查浏览器兼容性
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    statusText.value = '您的浏览器不支持语音识别'
    return
  }
  
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = true // 按住按钮时持续录音
  recognition.interimResults = true // 显示临时结果
  
  recognition.onstart = () => {
    isRecording.value = true
    statusText.value = '正在聆听...'
  }
  
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('')
    
    // 赋值给 messageContent
    messageContent.value = transcript
  }
  
  recognition.onend = () => {
    isRecording.value = false
    statusText.value = '按住说话'
    
    // 演示：复述用户说的话
    if (messageContent.value) {
      setTimeout(() => {
        lastMessage.value = `我听到了：${messageContent.value}`
      }, 500)
    }
  }
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error)
    isRecording.value = false
    statusText.value = '识别出错，请重试'
  }
})

onBeforeUnmount(() => {
  if (recognition) {
    recognition.abort()
  }
})

const startRecording = () => {
  if (recognition && !isRecording.value) {
    try {
      messageContent.value = '' // 清除之前的输入
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition', e)
    }
  }
}

const stopRecording = () => {
  if (recognition && isRecording.value) {
    recognition.stop()
  }
}
</script>

<style scoped>
.voice-container {
  text-align: center;
  padding: 20px;
}

.voice-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.voice-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.voice-content {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mic-wrapper {
  position: relative;
  margin-bottom: 40px;
}

.mic-btn {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 48px;
  cursor: pointer;
  z-index: 2;
  position: relative;
  transition: transform 0.1s;
  box-shadow: 0 10px 25px rgba(118, 75, 162, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Prevent text selection on mobile hold */
  user-select: none; 
  -webkit-user-select: none;
}

.mic-btn:active {
  transform: scale(0.95);
}

.status-text {
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: bold;
  color: #555;
  min-height: 27px;
}

/* Animation for recording state */
.mic-wrapper.recording .pulse-ring {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(118, 75, 162, 0.3);
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.history {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.message-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  animation: slideUp 0.3s ease;
}

.label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  text-align: left;
}

.text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-area {
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  text-align: left;
}

.user-text {
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
  line-height: 1.4;
}
</style>
