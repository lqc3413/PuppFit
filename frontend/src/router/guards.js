/**
 * 路由守卫配置
 * 统一管理路由导航守卫逻辑
 */

/**
 * 设置路由守卫
 * @param {Router} router - Vue Router 实例
 */
export function setupRouterGuards(router) {
    // 前置守卫 - 权限检查
    router.beforeEach((to, from, next) => {
        // 设置页面标题
        setDocumentTitle(to)

        // 权限检查
        if (to.meta.requiresAdminAuth) {
            // 需要管理员认证
            if (!isAdminAuthenticated()) {
                next({ path: '/admin/login', query: { redirect: to.fullPath } })
                return
            }
        } else if (to.meta.requiresAuth) {
            // 需要普通用户认证
            if (!isAuthenticated()) {
                next({ path: '/login', query: { redirect: to.fullPath } })
                return
            }
        }

        next()
    })

    // 后置守卫 - 可用于页面加载完成后的操作
    router.afterEach((to, from) => {
        // 可以在这里添加页面访问统计、滚动行为等
        // console.log(`Navigated from ${from.fullPath} to ${to.fullPath}`)
    })

    // 错误处理
    router.onError((error) => {
        console.error('路由错误:', error)
    })
}

/**
 * 设置文档标题
 * @param {RouteLocationNormalized} to - 目标路由
 */
function setDocumentTitle(to) {
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'PuppyFit'
    }
}

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
function isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
}

/**
 * 检查管理员是否已登录
 * @returns {boolean}
 */
function isAdminAuthenticated() {
    const adminToken = localStorage.getItem('admin-token')
    return !!adminToken
}

/**
 * 获取当前用户信息
 * @returns {Object|null}
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
        try {
            return JSON.parse(userStr)
        } catch {
            return null
        }
    }
    return null
}

/**
 * 获取用户类型
 * @returns {string|null} 'parent' | 'teacher' | 'admin' | null
 */
export function getUserType() {
    const user = getCurrentUser()
    return user?.type || null
}
