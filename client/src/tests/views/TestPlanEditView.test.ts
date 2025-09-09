import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import TestPlanEditView from '@/views/TestPlanEditView.vue'
import useTestPlanQuery from '@/composables/useTestPlanQuery'
import { ListTestplansStatusEnum } from '@/services'

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
    useRoute: () => ({
      params: { id: '1' },
    }),
  }
})

// Mock vee-validate with proper form handling
const mockHandleSubmit = vi.fn()
const mockResetForm = vi.fn()
vi.mock('vee-validate', () => ({
  useForm: () => ({
    handleSubmit: mockHandleSubmit,
    resetForm: mockResetForm,
  }),
}))

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn(),
}))

describe('TestPlanEditView', () => {
  let wrapper: VueWrapper | null = null
  let mockMutateOnUpdateTestPlan: MockedFunction<any>
  let mockUseTestPlanQuery: MockedFunction<any>
  let mockQueryReturn: any

  const mockTestPlan = {
    id: 1,
    title: 'Test Plan 1',
    status: ListTestplansStatusEnum.NotStarted,
    updatedAt: '2023-01-01T00:00:00Z',
  }

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/test-plans',
        name: 'test-plan-list',
        component: { template: '<div>Test Plans</div>' },
      },
      { path: '/test-plans/:id/edit', name: 'test-plan-edit', component: TestPlanEditView },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockHandleSubmit.mockImplementation((fn) => fn)
    mockResetForm.mockClear()

    mockMutateOnUpdateTestPlan = vi.fn()
    mockUseTestPlanQuery = vi.mocked(useTestPlanQuery)

    // Create proper reactive refs for the mocked composable return
    mockQueryReturn = {
      testPlan: ref(mockTestPlan),
      isFetchingTestPlan: ref(false),
      mutateOnUpdateTestPlan: mockMutateOnUpdateTestPlan,
    }

    mockUseTestPlanQuery.mockReturnValue(mockQueryReturn)

    wrapper = mount(TestPlanEditView, {
      global: {
        plugins: [router],
        stubs: {
          // Simplified stubs to prevent mounting issues
          TitleComponent: true,
          Button: true,
          Input: true,
          Select: true,
          SelectContent: true,
          SelectGroup: true,
          SelectItem: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectWrapperComponent: true,
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

  it('calls updateTestPlan when form is submitted', async () => {
    const componentInstance = wrapper!.vm as any

    await componentInstance.updateTestPlan('Updated Title', ListTestplansStatusEnum.InProgress)

    expect(mockMutateOnUpdateTestPlan).toHaveBeenCalledWith({
      id: 1,
      title: 'Updated Title',
      status: ListTestplansStatusEnum.InProgress,
    })
  })

  it('navigates to test plan list after successful update', async () => {
    mockMutateOnUpdateTestPlan.mockResolvedValue({})
    const componentInstance = wrapper!.vm as any

    await componentInstance.updateTestPlan('Updated Title', ListTestplansStatusEnum.InProgress)

    expect(mockPush).toHaveBeenCalledWith({ name: 'test-plan-list' })
  })

  it('handles update error gracefully', async () => {
    mockMutateOnUpdateTestPlan.mockRejectedValue(new Error('Update failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const componentInstance = wrapper!.vm as any
    await componentInstance.updateTestPlan('Updated Title', ListTestplansStatusEnum.InProgress)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update test plan:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('resets form when test plan data changes', async () => {
    const newTestPlan = {
      id: 1,
      title: 'Updated Test Plan',
      status: ListTestplansStatusEnum.InProgress,
    }
    
    mockQueryReturn.testPlan.value = newTestPlan
    await wrapper!.vm.$nextTick()
    
    expect(mockQueryReturn.testPlan.value.title).toBe('Updated Test Plan')
    expect(mockResetForm).toHaveBeenCalled()
  })

  it('handles different test plan statuses', async () => {
    const statuses = [
      ListTestplansStatusEnum.NotStarted,
      ListTestplansStatusEnum.InProgress, 
      ListTestplansStatusEnum.Completed
    ]
    
    const componentInstance = wrapper!.vm as any
    
    for (const status of statuses) {
      await componentInstance.updateTestPlan('Test Title', status)
      expect(mockMutateOnUpdateTestPlan).toHaveBeenCalledWith({
        id: 1,
        title: 'Test Title',
        status: status,
      })
    }
  })

  it('toggles form visibility based on loading state', async () => {
    // Initially not fetching, form should exist
    expect(wrapper!.find('form').exists()).toBe(true)
    
    // Set to fetching, form should not exist
    mockQueryReturn.isFetchingTestPlan.value = true
    await wrapper!.vm.$nextTick()
    expect(wrapper!.find('form').exists()).toBe(false)
    
    // Set back to not fetching, form should exist again
    mockQueryReturn.isFetchingTestPlan.value = false
    await wrapper!.vm.$nextTick()
    expect(wrapper!.find('form').exists()).toBe(true)
  })

  it('handles async update operations', async () => {
    const componentInstance = wrapper!.vm as any
    
    mockMutateOnUpdateTestPlan.mockResolvedValue({ success: true })
    await componentInstance.updateTestPlan('Async Test', ListTestplansStatusEnum.InProgress)
    
    expect(mockMutateOnUpdateTestPlan).toHaveBeenLastCalledWith({
      id: 1,
      title: 'Async Test',
      status: ListTestplansStatusEnum.InProgress,
    })
    expect(mockPush).toHaveBeenCalledWith({ name: 'test-plan-list' })
  })
})
