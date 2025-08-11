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
          },
        },
        {
          path: '/test-plans/add',
          name: 'test-plan-add',
          component: () => import('@/views/TestPlanAddView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans', path: '/test-plans' }, { name: 'Add Test Plan' }],
          },
        },
        {
          path: '/test-plans/:id/edit',
          name: 'test-plan-edit',
          component: () => import('@/views/TestPlanEditView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans', path: '/test-plans' }, { name: 'Edit Test Plan' }],
          },
        },
        {
          path: '/test-cases',
          name: 'test-case-list',
          component: () => import('@/views/TestCaseListView.vue'),
          meta: {
            breadcrumb: [{ name: 'Test Plans', path: '/test-plans' }, { name: 'Test Cases' }],
          },
        },
        {
          path: '/test-cases/define',
          name: 'test-case-define',
          component: () => import('@/views/TestCaseDefineView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-cases' },
              { name: 'Define Test Case' },
            ],
          },
        },
        {
          path: '/test-cases/execute',
          name: 'test-case-execute',
          component: () => import('@/views/TestCaseExecuteView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-cases' },
              { name: 'Execute Test Case' },
            ],
          },
        },
        {
          path: '/test-case-results/:id',
          name: 'test-case-result',
          component: () => import('@/views/TestCaseResultView.vue'),
          meta: {
            breadcrumb: [
              { name: 'Test Plans', path: '/test-plans' },
              { name: 'Test Cases', path: '/test-cases' },
              { name: 'Test Case Result' },
            ],
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

export default router
