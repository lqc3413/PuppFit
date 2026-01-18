import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { title: 'PuppyFit - 登录' }
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('../views/admin/Login.vue'),
        meta: { title: 'PuppyFit - 管理员登录' }
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: 'PuppyFit - 管理后台', requiresAdminAuth: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'PuppyFit'
    }

    // 检查是否需要管理员认证
    if (to.meta.requiresAdminAuth) {
        const adminToken = localStorage.getItem('admin-token')
        if (!adminToken) {
            next({ path: '/admin/login', query: { redirect: to.fullPath } })
        } else {
            next()
        }
    }
    // 检查是否需要普通认证
    else if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (!token) {
            // 未登录，跳转到登录页
            next({ path: '/login', query: { redirect: to.fullPath } })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router

