import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          redirect: '/test-plans',
        },
        {
          path: '/test-plans',
          name: 'test-plan-list',
          component: () => import('@/views/TestPlanListView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans' }],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/add',
          name: 'test-plan-add',
          component: () => import('@/views/TestPlanAddView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans', path: '/test-plans' }, { name: 'Add Test Plan' }],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:id/edit',
          name: 'test-plan-edit',
          component: () => import('@/views/TestPlanEditView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans', path: '/test-plans' }, { name: 'Edit Test Plan' }],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:testPlanId/test-cases',
          name: 'test-case-list',
          component: () => import('@/views/TestCaseListView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-plans/:testPlanId/test-cases' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:testPlanId/test-cases/add',
          name: 'test-case-add',
          component: () => import('@/views/TestCaseAddView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-plans/:testPlanId/test-cases' },
              { name: 'Test Case' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:testPlanId/test-cases/:testCaseId/edit',
          name: 'test-case-edit',
          component: () => import('@/views/TestCaseEditView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-plans/:testPlanId/test-cases' },
              { name: 'Test Case' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:testPlanId/test-cases/:testCaseId/execute',
          name: 'test-case-execute',
          component: () => import('@/views/TestCaseExecuteView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-plans/:testPlanId/test-cases' },
              { name: 'Test Case' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: '/test-plans/:testPlanId/test-cases/:testCaseId/test-case-results/:testResultId',
          name: 'test-case-result',
          component: () => import('@/views/TestCaseResultView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-plans/:testPlanId/test-cases' },
              { name: 'Test Case' },
            ],
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('kingyo_access_token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
