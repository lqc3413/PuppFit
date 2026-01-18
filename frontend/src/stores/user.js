/**
 * 用户状态管理 Store
 * 使用 Pinia 管理用户登录状态和信息
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    // 状态
    const token = ref(localStorage.getItem('token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'))

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const userRole = computed(() => userInfo.value.role || '')
    const userName = computed(() => userInfo.value.name || '')

    // 登录
    function login(userData, userToken) {
        token.value = userToken
        userInfo.value = userData
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    // 登出
    function logout() {
        token.value = ''
        userInfo.value = {}
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    // 更新用户信息
    function updateUserInfo(newInfo) {
        userInfo.value = { ...userInfo.value, ...newInfo }
        localStorage.setItem('user', JSON.stringify(userInfo.value))
    }

    return {
        // 状态
        token,
        userInfo,
        // 计算属性
        isLoggedIn,
        userRole,
        userName,
        // 方法
        login,
        logout,
        updateUserInfo
    }
})
