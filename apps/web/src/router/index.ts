import { createRouter, createWebHistory } from 'vue-router'
import { useContextStore } from '../stores/context'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/SetupView.vue'),
    },
    {
      path: '/',
      component: () => import('../components/AppShell.vue'),
      meta: { requiresContext: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RolesView.vue'),
        },
        {
          path: 'modules',
          name: 'modules',
          component: () => import('../views/ModulesView.vue'),
        },
        {
          path: 'tenant',
          name: 'tenant',
          component: () => import('../views/TenantView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const ctx = useContextStore()
  if (to.meta.requiresContext && !ctx.isReady) {
    return { name: 'setup' }
  }
  if (to.name === 'setup' && ctx.isReady) {
    return { name: 'dashboard' }
  }
})

export default router
