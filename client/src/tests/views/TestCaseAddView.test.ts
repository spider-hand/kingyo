import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TestCaseAddView from '@/views/TestCaseAddView.vue'
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
      params: { testPlanId: '1' }
    })
  }
})

describe('TestCaseAddView', () => {
  let wrapper: VueWrapper | null = null
  let mockMutateAsyncOnCreateTestCase: MockedFunction<any>
  let mockMutateAsyncOnCreateTestSteps: MockedFunction<any>
  let mockMutateOnCreateTestStepAttachments: MockedFunction<any>

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/test-plans/:testPlanId/test-cases', name: 'test-case-list', component: { template: '<div>Test Cases</div>' } },
      { path: '/test-plans/:testPlanId/test-cases/add', name: 'test-case-add', component: TestCaseAddView },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    mockMutateAsyncOnCreateTestCase = vi.fn()
    mockMutateAsyncOnCreateTestSteps = vi.fn()
    mockMutateOnCreateTestStepAttachments = vi.fn()

    vi.mocked(useTestCaseQuery).mockReturnValue({
      mutateAsyncOnCreateTestCase: mockMutateAsyncOnCreateTestCase,
      isCreatingTestCase: false,
    } as any)

    vi.mocked(useTestStepQuery).mockReturnValue({
      mutateAsyncOnCreateTestSteps: mockMutateAsyncOnCreateTestSteps,
      isCreatingTestSteps: false,
    } as any)

    vi.mocked(useTestStepAttachmentQuery).mockReturnValue({
      mutateOnCreateTestStepAttachments: mockMutateOnCreateTestStepAttachments,
      isCreatingTestStepAttachments: false,
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

    wrapper = mount(TestCaseAddView, {
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

  it('saves test case successfully with steps and attachments', async () => {
    const mockTestCase = { id: 1 }
    const mockSteps = [{ action: 'Action 1', expectedResult: 'Result 1' }]
    const mockAttachments = [{ step: 0, attachments: [new File([''], 'test.png')] }]

    mockMutateAsyncOnCreateTestCase.mockResolvedValue(mockTestCase)
    mockMutateAsyncOnCreateTestSteps.mockResolvedValue({})
    mockMutateOnCreateTestStepAttachments.mockResolvedValue({})

    const stepEditor = vi.mocked(useTestStepEditor)()
    stepEditor.testSteps.value = mockSteps
    stepEditor.testStepsAttachments.value = mockAttachments

    const componentInstance = wrapper!.vm as any
    await componentInstance.saveTestCase()

    expect(mockMutateAsyncOnCreateTestCase).toHaveBeenCalledWith({
      title: 'Test Case Title',
      description: 'Test Description',
      status: 'design',
    })
    expect(mockMutateAsyncOnCreateTestSteps).toHaveBeenCalledWith({
      testCaseId: 1,
      steps: [{ action: 'Action 1', expectedResult: 'Result 1', order: 1 }]
    })
    expect(mockMutateOnCreateTestStepAttachments).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith({
      name: 'test-case-list',
      params: { testPlanId: 1 },
      replace: true
    })
  })

  it('saves test case without steps when none exist', async () => {
    const mockTestCase = { id: 1 }
    mockMutateAsyncOnCreateTestCase.mockResolvedValue(mockTestCase)

    const stepEditor = vi.mocked(useTestStepEditor)()
    stepEditor.testSteps.value = []

    const componentInstance = wrapper!.vm as any
    await componentInstance.saveTestCase()

    expect(mockMutateAsyncOnCreateTestCase).toHaveBeenCalled()
    expect(mockMutateAsyncOnCreateTestSteps).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith({
      name: 'test-case-list',
      params: { testPlanId: 1 },
      replace: true
    })
  })

  it('handles save error gracefully', async () => {
    mockMutateAsyncOnCreateTestCase.mockRejectedValue(new Error('Save failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const componentInstance = wrapper!.vm as any
    await componentInstance.saveTestCase()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving test case:', expect.any(Error))
    expect(mockPush).not.toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('disables save button when operations are in progress', () => {
    vi.mocked(useTestCaseQuery).mockReturnValue({
      mutateAsyncOnCreateTestCase: mockMutateAsyncOnCreateTestCase,
      isCreatingTestCase: true,
    } as any)

    // Re-mount with loading state
    wrapper!.unmount()
    wrapper = mount(TestCaseAddView, {
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
