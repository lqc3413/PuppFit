<template>
  <div class="voice-page">
    <!-- 顶部设备选择 -->
    <header class="voice-top">
      <div class="voice-title">
        <h2>🐶 PuppyFit 语音助手</h2>
        <p>和机器狗说说话，它会回应你哦！</p>
      </div>
      <div class="device-selector" v-if="devices.length > 0">
        <label>当前设备</label>
        <select v-model="selectedDeviceId">
          <option v-for="d in devices" :key="d.device_id" :value="d.device_id">
            {{ d.device_name || d.device_id }}（{{ d.status === 'online' ? '✅在线' : '⚪离线' }}）
          </option>
        </select>
      </div>
      <div v-else-if="!loadingDevices" class="no-device-tip">
        ⚠️ 暂未绑定设备，请先在个人中心绑定
      </div>
    </header>

    <!-- 对话区域 -->
    <div class="chat-area" ref="chatAreaRef">
      <div v-if="chatHistory.length === 0" class="chat-empty">
        <div class="empty-icon">🎙️</div>
        <p>按住下方按钮开始对话，或使用快捷操作</p>
      </div>
      <div
        v-for="(msg, idx) in chatHistory"
        :key="idx"
        :class="['chat-bubble', msg.role]"
      >
        <div class="bubble-avatar">{{ msg.role === 'user' ? '🧑' : '🐶' }}</div>
        <div class="bubble-content">
          <div class="bubble-text">{{ msg.text }}</div>
          <div class="bubble-time">{{ msg.time }}</div>
        </div>
      </div>
      <div v-if="thinking" class="chat-bubble bot">
        <div class="bubble-avatar">🐶</div>
        <div class="bubble-content">
          <div class="bubble-text typing">思考中<span class="dots">...</span></div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="voice-actions">
      <!-- 快捷操作栏 -->
      <div class="quick-actions">
        <button class="quick-btn greet" @click="sendGreeting" :disabled="!selectedDeviceId">
          👋 问候
        </button>
        <button class="quick-btn encourage" @click="showEncourageModal = true" :disabled="!selectedDeviceId">
          💪 鼓励
        </button>
        <button class="quick-btn test" @click="testVoice">
          🔧 测试
        </button>
      </div>

      <!-- 文字输入区 -->
      <div class="text-input-row">
        <input
          v-model="textInput"
          type="text"
          placeholder="输入文字让机器狗播报..."
          @keyup.enter="sendTextSpeak"
          :disabled="!selectedDeviceId"
        />
        <button class="send-btn" @click="sendTextSpeak" :disabled="!textInput.trim() || !selectedDeviceId">
          📤
        </button>
      </div>

      <!-- 录音按钮 -->
      <div :class="['mic-area', { recording: isRecording }]">
        <div class="recording-hint" v-if="isRecording">{{ recognizedText || '正在聆听...' }}</div>
        <button
          class="mic-btn"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          :disabled="!selectedDeviceId"
        >
          <span class="mic-icon">{{ isRecording ? '🔴' : '🎤' }}</span>
        </button>
        <div class="mic-label">{{ isRecording ? '松开发送' : '按住说话' }}</div>
        <div v-if="isRecording" class="pulse-ring"></div>
      </div>
    </div>

    <!-- 鼓励弹窗 -->
    <div v-if="showEncourageModal" class="modal-overlay" @click.self="showEncourageModal = false">
      <div class="modal-card">
        <h3>💪 发送鼓励</h3>
        <p>填写当前运动进度，机器狗会为孩子加油！</p>
        <div class="modal-form">
          <div class="modal-field">
            <label>当前完成数</label>
            <input v-model.number="encourageForm.count" type="number" min="0" placeholder="15" />
          </div>
          <div class="modal-field">
            <label>目标数</label>
            <input v-model.number="encourageForm.target" type="number" min="1" placeholder="30" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-cancel" @click="showEncourageModal = false">取消</button>
          <button class="modal-confirm" @click="sendEncourage">发送鼓励</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { apiGet, apiPost } from '../../api/realApi'

// --- 状态 ---
const devices = ref([])
const loadingDevices = ref(true)
const selectedDeviceId = ref('')
const chatHistory = ref([])
const thinking = ref(false)
const isRecording = ref(false)
const recognizedText = ref('')
const textInput = ref('')
const chatAreaRef = ref(null)
const showEncourageModal = ref(false)
const encourageForm = ref({ count: 0, target: 30 })

let recognition = null
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user.username || user.studentId || user.id || ''

// --- 工具函数 ---
const now = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const addMessage = (role, text) => {
  chatHistory.value.push({ role, text, time: now() })
  if (chatHistory.value.length > 50) chatHistory.value.shift()
  nextTick(() => {
    if (chatAreaRef.value) chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
  })
}

// --- 设备加载 ---
onMounted(async () => {
  if (userId) {
    try {
      const res = await apiGet(`/api/devices/list/${userId}`)
      if (res.code === 200 && res.data?.length > 0) {
        devices.value = res.data
        selectedDeviceId.value = res.data[0].device_id
      }
    } catch (e) {
      console.error('获取设备失败', e)
    }
  }
  loadingDevices.value = false
  initSpeechRecognition()
})

// --- 语音识别 ---
const initSpeechRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return

  recognition = new SR()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event) => {
    recognizedText.value = Array.from(event.results).map(r => r[0].transcript).join('')
  }

  recognition.onend = () => {
    isRecording.value = false
    if (recognizedText.value.trim()) {
      sendVoiceCommand(recognizedText.value.trim())
    }
    recognizedText.value = ''
  }

  recognition.onerror = (e) => {
    console.error('语音识别错误:', e.error)
    isRecording.value = false
    recognizedText.value = ''
  }
}

const startRecording = () => {
  if (!recognition || isRecording.value) return
  try {
    recognizedText.value = ''
    recognition.start()
    isRecording.value = true
  } catch (e) { console.error(e) }
}

const stopRecording = () => {
  if (recognition && isRecording.value) recognition.stop()
}

onBeforeUnmount(() => { if (recognition) recognition.abort() })

// --- API 调用 ---

// 1. 核心：语音命令
const sendVoiceCommand = async (text) => {
  addMessage('user', text)
  thinking.value = true
  try {
    const res = await apiPost('/api/voice/command', {
      text,
      device_id: selectedDeviceId.value,
      user_id: userId,
      language: 'zh'
    })
    thinking.value = false
    if (res.success || res.code === 200) {
      addMessage('bot', res.response || res.message || '收到！')
    } else {
      addMessage('bot', `⚠️ ${res.message || '处理失败'}`)
    }
  } catch (e) {
    thinking.value = false
    addMessage('bot', '⚠️ 网络错误，请稍后重试')
  }
}

// 2. 文本播报
const sendTextSpeak = async () => {
  const text = textInput.value.trim()
  if (!text) return
  addMessage('user', `📢 播报：${text}`)
  textInput.value = ''
  thinking.value = true
  try {
    const res = await apiPost(`/api/voice/speak?text=${encodeURIComponent(text)}&device_id=${selectedDeviceId.value}`)
    thinking.value = false
    addMessage('bot', '✅ 已播报：' + text)
  } catch (e) {
    thinking.value = false
    addMessage('bot', '⚠️ 播报失败')
  }
}

// 3. 问候
const sendGreeting = async () => {
  const userName = user.name || user.parentName || '同学'
  addMessage('user', '👋 发送问候')
  thinking.value = true
  try {
    const res = await apiPost(`/api/voice/greet/${userId}?user_name=${encodeURIComponent(userName)}&device_id=${selectedDeviceId.value}`)
    thinking.value = false
    addMessage('bot', res.message || res.response || `你好呀，${userName}！`)
  } catch (e) {
    thinking.value = false
    addMessage('bot', '⚠️ 问候发送失败')
  }
}

// 4. 鼓励
const sendEncourage = async () => {
  showEncourageModal.value = false
  const { count, target } = encourageForm.value
  addMessage('user', `💪 发送鼓励（${count}/${target}）`)
  thinking.value = true
  try {
    const res = await apiPost(`/api/voice/encourage?device_id=${selectedDeviceId.value}&count=${count}&target=${target}`)
    thinking.value = false
    addMessage('bot', res.message || res.response || `加油！你已经完成了 ${count}/${target}！`)
  } catch (e) {
    thinking.value = false
    addMessage('bot', '⚠️ 鼓励发送失败')
  }
}

// 5. 测试
const testVoice = async () => {
  addMessage('user', '🔧 测试语音服务')
  thinking.value = true
  try {
    const res = await apiGet('/api/voice/test')
    thinking.value = false
    addMessage('bot', `✅ 语音服务正常：${JSON.stringify(res)}`)
  } catch (e) {
    thinking.value = false
    addMessage('bot', '❌ 语音服务不可用')
  }
}
</script>

<style scoped>
.voice-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  max-width: 720px;
  margin: 0 auto;
}

/* --- 顶部 --- */
.voice-top {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.voice-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px 0;
}

.voice-title p {
  font-size: 13px;
  color: #64748B;
  margin: 0;
}

.device-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-selector label {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
  white-space: nowrap;
}

.device-selector select {
  padding: 6px 10px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #0F172A;
}

.no-device-tip {
  font-size: 13px;
  color: #D97706;
  background: #FFFBEB;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #FDE68A;
}

/* --- 对话区域 --- */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #94A3B8;
}

.empty-icon {
  font-size: 52px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.chat-empty p {
  font-size: 14px;
}

/* 气泡 */
.chat-bubble {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: fadeIn 0.25s ease;
}

.chat-bubble.user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  font-size: 24px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F1F5F9;
}

.chat-bubble.user .bubble-avatar {
  background: #EEF2FF;
}

.bubble-content {
  max-width: 75%;
}

.bubble-text {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.chat-bubble.bot .bubble-text {
  background: #F1F5F9;
  color: #0F172A;
  border-bottom-left-radius: 4px;
}

.chat-bubble.user .bubble-text {
  background: #4F46E5;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble-time {
  font-size: 11px;
  color: #94A3B8;
  margin-top: 4px;
  padding: 0 6px;
}

.chat-bubble.user .bubble-time {
  text-align: right;
}

.typing .dots {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- 底部操作区 --- */
.voice-actions {
  border-top: 1px solid #E2E8F0;
  padding: 12px 24px 16px;
  background: #fff;
}

/* 快捷按钮 */
.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.quick-btn {
  flex: 1;
  padding: 7px 0;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #F8FAFC;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
  color: #334155;
}

.quick-btn:hover:not(:disabled) {
  background: #EEF2FF;
  border-color: #C7D2FE;
  color: #4F46E5;
}

.quick-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 文本输入 */
.text-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.text-input-row input {
  flex: 1;
  padding: 9px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 14px;
  color: #0F172A;
  background: #fff;
  transition: border-color 0.15s;
}

.text-input-row input:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}

.send-btn {
  padding: 0 14px;
  background: #4F46E5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s;
}

.send-btn:hover:not(:disabled) {
  background: #4338CA;
}

.send-btn:disabled {
  background: #CBD5E1;
  cursor: not-allowed;
}

/* 录音按钮 */
.mic-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 4px;
}

.recording-hint {
  font-size: 13px;
  color: #4F46E5;
  margin-bottom: 8px;
  max-width: 280px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mic-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  z-index: 2;
  position: relative;
  transition: transform 0.1s;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
}

.mic-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.mic-btn:disabled {
  background: #CBD5E1;
  box-shadow: none;
  cursor: not-allowed;
}

.mic-label {
  margin-top: 8px;
  font-size: 12px;
  color: #64748B;
}

.mic-area.recording .mic-btn {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

.mic-area.recording .pulse-ring {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  animation: pulseRing 1.2s infinite;
  z-index: 1;
}

@keyframes pulseRing {
  0% { transform: translateX(-50%) scale(1); opacity: 0.7; }
  100% { transform: translateX(-50%) scale(2.2); opacity: 0; }
}

/* --- 鼓励弹窗 --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 340px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: fadeIn 0.2s ease;
}

.modal-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 6px 0;
}

.modal-card p {
  font-size: 13px;
  color: #64748B;
  margin: 0 0 20px 0;
}

.modal-form {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-field {
  flex: 1;
}

.modal-field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.modal-field input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-cancel {
  padding: 8px 16px;
  background: #F1F5F9;
  border: none;
  border-radius: 6px;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
}

.modal-confirm {
  padding: 8px 16px;
  background: #4F46E5;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
}

.modal-confirm:hover {
  background: #4338CA;
}

/* 响应式 */
@media (max-width: 768px) {
  .voice-page {
    height: calc(100vh - 80px);
  }

  .voice-top {
    padding: 14px 16px 12px;
  }

  .chat-area {
    padding: 14px 16px;
  }

  .voice-actions {
    padding: 10px 16px 14px;
  }
}
</style>
