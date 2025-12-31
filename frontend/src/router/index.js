import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Delivery',
    component: () => import('@/views/Delivery.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'crab-cards',
        name: 'CrabCards',
        component: () => import('@/views/crab-cards/List.vue'),
        meta: { title: '蟹卡管理' }
      },
      {
        path: 'crab-cards/import',
        name: 'ImportCrabCard',
        component: () => import('@/views/crab-cards/Import.vue'),
        meta: { title: '导入蟹卡' }
      },
      {
        path: 'deliveries',
        name: 'Deliveries',
        component: () => import('@/views/deliveries/List.vue'),
        meta: { title: '提货记录' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/admin')
  } else {
    next()
  }
})

export default router

