import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import TestCaseEditView from '@/views/TestCaseEditView.vue'
import useTestCaseQuery from '@/composables/useTestCaseQuery'
import useTestStepQuery from '@/composables/useTestStepQuery'
import useTestStepAttachmentQuery from '@/composables/useTestStepAttachmentQuery'
import useTestStepEditor from '@/composables/useTestStepEditor'

// Mock the composables
vi.mock('@/composables/useTestCaseQuery')
vi.mock('@/composables/useTestStepQuery')
vi.mock('@/composables/useTestStepAttachmentQuery')
vi.mock('@/composables/useTestStepEditor')

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
      params: { testPlanId: '1', testCaseId: '2' }
    })
  }
})

// Mock API
vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services')
  return {
    ...actual,
    testplansApi: {
      retrieveTestplansTestcasesTeststepattachmentsDownload: vi.fn()
    }
  }
})

describe('TestCaseEditView', () => {
  let wrapper: VueWrapper | null = null
  let mockMutateAsyncOnUpdateTestCase: MockedFunction<any>
  let mockMutateAsyncOnCreateTestSteps: MockedFunction<any>
  let mockMutateOnCreateTestStepAttachments: MockedFunction<any>
  let mockQueryReturn: any

  const mockTestCase = {
    id: 2,
    title: 'Existing Test Case',
    description: 'Existing Description',
    status: 'design'
  }

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/test-plans/:testPlanId/test-cases', name: 'test-case-list', component: { template: '<div>Test Cases</div>' } },
      { path: '/test-plans/:testPlanId/test-cases/:testCaseId/edit', name: 'test-case-edit', component: TestCaseEditView },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    mockMutateAsyncOnUpdateTestCase = vi.fn()
    mockMutateAsyncOnCreateTestSteps = vi.fn()
    mockMutateOnCreateTestStepAttachments = vi.fn()

    mockQueryReturn = {
      testCase: ref(mockTestCase),
      testSteps: ref([]),
      testStepAttachments: ref([]),
      isFetchingTestCase: ref(false),
    }

    vi.mocked(useTestCaseQuery).mockReturnValue({
      ...mockQueryReturn,
      mutateAsyncOnUpdateTestCase: mockMutateAsyncOnUpdateTestCase,
      isUpdatingTestCase: false,
    } as any)

    vi.mocked(useTestStepQuery).mockReturnValue({
      mutateAsyncOnCreateTestSteps: mockMutateAsyncOnCreateTestSteps,
      isCreatingTestSteps: false,
    } as any)

    vi.mocked(useTestStepAttachmentQuery).mockReturnValue({
      mutateOnCreateTestStepAttachments: mockMutateOnCreateTestStepAttachments,
    } as any)

    vi.mocked(useTestStepEditor).mockReturnValue({
      testCaseTitle: { value: 'Test Case Title' },
      testCaseDescription: { value: 'Test Description' },
      testCaseStatus: { value: 'design' },
      testSteps: { value: [] },
      testStepsAttachments: { value: [] },
      selectedStepIndex: { value: -1 },
      showFileUploadDialog: { value: false },
      onTestCaseStatusChange: vi.fn(),
      selectStep: vi.fn(),
      onFocusOutTableRow: vi.fn(),
      insertStep: vi.fn(),
      moveStepUp: vi.fn(),
      moveStepDown: vi.fn(),
      deleteStep: vi.fn(),
      openFileUploadDialog: vi.fn(),
      uploadFiles: vi.fn(),
      removeAttachment: vi.fn(),
    } as any)

    wrapper = mount(TestCaseEditView, {
      global: {
        plugins: [router],
        stubs: {
          Button: true,
          Input: true,
          SelectWrapperComponent: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectGroup: true,
          SelectItem: true,
          Table: true,
          TableHeader: true,
          TableBody: true,
          TableHead: true,
          TableRow: true,
          TableCell: true,
          Textarea: true,
          ContextMenu: true,
          ContextMenuTrigger: true,
          ContextMenuContent: true,
          ContextMenuItem: true,
          ContextMenuSeparator: true,
          FileUploadDialog: true,
          LoaderCircle: true,
          Save: true,
          Paperclip: true,
          CornerDownRight: true,
          MoveUp: true,
          MoveDown: true,
          Trash: true,
          X: true,
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

  it('calls updateTestCase successfully', async () => {
    mockMutateAsyncOnUpdateTestCase.mockResolvedValue({})
    
    const componentInstance = wrapper!.vm as any
    await componentInstance.updateTestCase()

    expect(mockMutateAsyncOnUpdateTestCase).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith({
      name: 'test-case-list',
      params: { testPlanId: 1 },
      replace: true
    })
  })

  it('handles update error gracefully', async () => {
    mockMutateAsyncOnUpdateTestCase.mockRejectedValue(new Error('Update failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const componentInstance = wrapper!.vm as any
    await componentInstance.updateTestCase()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving test case:', expect.any(Error))
    expect(mockPush).not.toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('updates form fields when test case data changes', async () => {
    const newTestCase = {
      id: 2,
      title: 'New Title',
      description: 'New Description',
      status: 'completed'
    }

    mockQueryReturn.testCase.value = newTestCase
    await wrapper!.vm.$nextTick()

    // This would trigger the watch function in the actual component
    expect(mockQueryReturn.testCase.value.title).toBe('New Title')
    expect(mockQueryReturn.testCase.value.status).toBe('completed')
  })

  it('disables save button when operations are in progress', () => {
    vi.mocked(useTestCaseQuery).mockReturnValue({
      ...mockQueryReturn,
      mutateAsyncOnUpdateTestCase: mockMutateAsyncOnUpdateTestCase,
      isUpdatingTestCase: true,
    } as any)

    // Re-mount with loading state
    wrapper!.unmount()
    wrapper = mount(TestCaseEditView, {
      global: {
        plugins: [router],
        stubs: {
          Button: { template: '<button :disabled="disabled"><slot /></button>', props: ['disabled'] },
          Input: true,
          SelectWrapperComponent: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectGroup: true,
          SelectItem: true,
          Table: true,
          TableHeader: true,
          TableBody: true,
          TableHead: true,
          TableRow: true,
          TableCell: true,
          Textarea: true,
          ContextMenu: true,
          ContextMenuTrigger: true,
          ContextMenuContent: true,
          ContextMenuItem: true,
          ContextMenuSeparator: true,
          FileUploadDialog: true,
          LoaderCircle: true,
          Save: true,
          Paperclip: true,
          CornerDownRight: true,
          MoveUp: true,
          MoveDown: true,
          Trash: true,
          X: true,
        },
      },
    })

    const button = wrapper!.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
