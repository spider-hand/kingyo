import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TestPlanAddView from '@/views/TestPlanAddView.vue'
import useTestPlanQuery from '@/composables/useTestPlanQuery'

// Mock the composable
vi.mock('@/composables/useTestPlanQuery')

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

// Mock vee-validate with proper form handling
const mockHandleSubmit = vi.fn()
vi.mock('vee-validate', () => ({
  useForm: () => ({
    handleSubmit: mockHandleSubmit,
  }),
}))

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn(),
}))

describe('TestPlanAddView', () => {
  let wrapper: VueWrapper | null = null
  let mockMutateOnCreateTestPlan: MockedFunction<any>
  let mockUseTestPlanQuery: MockedFunction<any>

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/test-plans',
        name: 'test-plan-list',
        component: { template: '<div>Test Plans</div>' },
      },
      { path: '/test-plans/add', name: 'test-plan-add', component: TestPlanAddView },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockHandleSubmit.mockImplementation((fn) => fn)

    mockMutateOnCreateTestPlan = vi.fn()
    mockUseTestPlanQuery = vi.mocked(useTestPlanQuery)
    
    mockUseTestPlanQuery.mockReturnValue({
      mutateOnCreateTestPlan: mockMutateOnCreateTestPlan,
    })

    wrapper = mount(TestPlanAddView, {
      global: {
        plugins: [router],
        stubs: {
          // Simplified stubs to prevent mounting issues
          TitleComponent: true,
          Button: true,
          Input: true,
          FormField: true,
          FormItem: true,
          FormLabel: true,
          FormControl: true,
          FormMessage: true,
        },
      },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  it('calls createTestPlan when form is submitted', async () => {
    const componentInstance = wrapper!.vm as any

    await componentInstance.createTestPlan('New Test Plan')

    expect(mockMutateOnCreateTestPlan).toHaveBeenCalledWith({
      title: 'New Test Plan',
    })
  })

  it('navigates to test plan list after successful creation', async () => {
    mockMutateOnCreateTestPlan.mockResolvedValue({})
    const componentInstance = wrapper!.vm as any

    await componentInstance.createTestPlan('New Test Plan')

    expect(mockPush).toHaveBeenCalledWith({ name: 'test-plan-list' })
  })

  it('handles creation error gracefully', async () => {
    mockMutateOnCreateTestPlan.mockRejectedValue(new Error('Creation failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const componentInstance = wrapper!.vm as any
    await componentInstance.createTestPlan('New Test Plan')

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating test plan:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('handles async creation operations', async () => {
    const componentInstance = wrapper!.vm as any
    
    mockMutateOnCreateTestPlan.mockResolvedValue({ success: true })
    await componentInstance.createTestPlan('Async Test Plan')
    
    expect(mockMutateOnCreateTestPlan).toHaveBeenLastCalledWith({
      title: 'Async Test Plan',
    })
    expect(mockPush).toHaveBeenCalledWith({ name: 'test-plan-list' })
  })

  it('validates error handling without navigation', async () => {
    mockMutateOnCreateTestPlan.mockRejectedValue(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const componentInstance = wrapper!.vm as any
    await componentInstance.createTestPlan('Error Test')
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating test plan:', expect.any(Error))
    expect(mockPush).not.toHaveBeenCalledWith({ name: 'test-plan-list' })
    
    consoleErrorSpy.mockRestore()
  })
})
