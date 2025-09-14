import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import TestCaseExecuteView from '@/views/TestCaseExecuteView.vue'

vi.mock('@/composables/useTestCaseQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useTestStepQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useTestStepAttachmentQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useTestResultQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useTestResultStepQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useTestResultStepAttachmentQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useUserQuery', () => ({
  default: vi.fn(),
}))
vi.mock('@/composables/useApi', () => ({
  default: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      testPlanId: '1',
      testCaseId: '1',
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/utils', () => ({
  getAttachmentFileName: () => 'test-file.png',
}))

vi.mock('@/consts', () => ({
  TEST_CASE_RESULT_CONFIGURATION_OPTIONS: [
    { value: 'chrome browser windows', label: 'Chrome on Windows' },
  ],
}))

vi.mock('@/services', () => ({
  TestplansApi: vi.fn().mockImplementation(() => ({
    retrieveTestplansTestcasesTeststepattachmentsDownload: vi.fn().mockResolvedValue(new Blob()),
  })),
  TestResultStepStatusEnum: {
    Pass: 'pass',
    Fail: 'fail',
    Skip: 'skip',
  },
  ResultEnum: {
    Pass: 'pass',
    Fail: 'fail',
    InProgress: 'in_progress',
  },
}))

const mockTestCase = { id: 1, title: 'Test Login Functionality' }
const mockTestSteps = [
  {
    id: 1,
    order: 1,
    action: 'Enter username',
    expectedResult: 'Username field should accept input',
  },
  {
    id: 2,
    order: 2,
    action: 'Enter password',
    expectedResult: 'Password field should accept input',
  },
]
const mockTestStepAttachments = [{ id: 1, step: 1, file: 'screenshot1.png' }]
const mockCurrentUser = { id: 1, username: 'testuser' }

describe('TestCaseExecuteView', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const useTestCaseQuery = (await import('@/composables/useTestCaseQuery')).default
    const useTestStepQuery = (await import('@/composables/useTestStepQuery')).default
    const useTestStepAttachmentQuery = (await import('@/composables/useTestStepAttachmentQuery'))
      .default
    const useTestResultQuery = (await import('@/composables/useTestResultQuery')).default
    const useTestResultStepQuery = (await import('@/composables/useTestResultStepQuery')).default
    const useTestResultStepAttachmentQuery = (
      await import('@/composables/useTestResultStepAttachmentQuery')
    ).default
    const useUserQuery = (await import('@/composables/useUserQuery')).default
    const useApi = (await import('@/composables/useApi')).default

    vi.mocked(useTestCaseQuery).mockReturnValue({ testCase: ref(mockTestCase) } as any)
    vi.mocked(useTestStepQuery).mockReturnValue({ testSteps: ref(mockTestSteps) } as any)
    vi.mocked(useTestStepAttachmentQuery).mockReturnValue({
      testStepAttachments: ref(mockTestStepAttachments),
    } as any)
    vi.mocked(useTestResultQuery).mockReturnValue({
      mutateOnCreateTestResultAsync: vi.fn().mockResolvedValue({ id: 1 }),
      isCreatingTestResult: ref(false),
    } as any)
    vi.mocked(useTestResultStepQuery).mockReturnValue({
      mutateAsyncOnCreateTestResultSteps: vi.fn(),
      isCreatingTestResultSteps: ref(false),
    } as any)
    vi.mocked(useTestResultStepAttachmentQuery).mockReturnValue({
      mutateOnCreateTestResultStepAttachments: vi.fn(),
      isCreatingTestResultStepAttachments: ref(false),
    } as any)
    vi.mocked(useUserQuery).mockReturnValue({ currentUser: ref(mockCurrentUser) } as any)
    vi.mocked(useApi).mockReturnValue({ apiConfig: {} } as any)

    wrapper = mount(TestCaseExecuteView, {
      global: {
        stubs: {
          TitleComponent: {
            template: '<div data-testid="test-case-title">{{ title }}</div>',
            props: ['title'],
          },
          Button: {
            template:
              '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
          },
          SelectWrapperComponent: { template: '<div><slot /></div>' },
          Select: { template: '<div data-testid="configuration-select"><slot /></div>' },
          SelectTrigger: { template: '<div data-testid="configuration-trigger"><slot /></div>' },
          SelectValue: { template: '<div>Configuration</div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectGroup: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Table: { template: '<table data-testid="steps-table"><slot /></table>' },
          TableHeader: { template: '<thead><slot /></thead>' },
          TableBody: { template: '<tbody><slot /></tbody>' },
          TableHead: { template: '<th><slot /></th>' },
          TableRow: {
            template: '<tr :data-testid="$attrs[\'data-testid\']"><slot /></tr>',
          },
          TableCell: { template: '<td><slot /></td>' },
          ContextMenu: { template: '<div><slot /></div>' },
          ContextMenuTrigger: { template: '<div><slot /></div>' },
          ContextMenuContent: { template: '<div><slot /></div>' },
          ContextMenuItem: { template: '<div><slot /></div>' },
          Textarea: {
            template:
              '<textarea :data-testid="$attrs[\'data-testid\']" @blur="$emit(\'blur\')"></textarea>',
            emits: ['blur'],
          },
          FileUploadDialog: {
            template: '<div data-testid="file-upload-dialog" v-if="open">Upload Dialog</div>',
            props: ['open', 'stepNumber'],
          },
          CircleCheck: { template: '<div data-testid="check-icon"></div>' },
          CircleX: { template: '<div data-testid="x-icon"></div>' },
          Save: { template: '<div data-testid="save-icon"></div>' },
          LoaderCircle: { template: '<div data-testid="loading-icon"></div>' },
          MessageSquare: { template: '<div></div>' },
          Paperclip: { template: '<div></div>' },
          X: { template: '<div></div>' },
        },
      },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders dynamic test case title from data', () => {
    const title = wrapper.find('[data-testid="test-case-title"]')
    expect(title.text()).toBe(mockTestCase.title)
  })

  it('displays correct number of step rows based on data', () => {
    const stepRows = wrapper.findAll('[data-testid^="step-row-"]')
    expect(stepRows.length).toBe(mockTestSteps.length)
  })

  it('renders step data dynamically in table', () => {
    const table = wrapper.find('[data-testid="steps-table"]')
    const tableText = table.text()

    mockTestSteps.forEach((step) => {
      expect(tableText).toContain(step.order.toString())
      expect(tableText).toContain(step.action)
      expect(tableText).toContain(step.expectedResult)
    })
  })

  it('renders attachment download buttons with dynamic names', () => {
    const downloadBtn = wrapper.find('[data-testid="attachment-download-1"]')
    expect(downloadBtn.exists()).toBe(true)
    expect(downloadBtn.text()).toBe('test-file.png')
  })

  it('updates step status when pass button is clicked', async () => {
    const passBtn = wrapper.find('[data-testid="pass-btn-1"]')

    expect(passBtn.classes()).not.toContain('text-green-600')
    expect(passBtn.classes()).not.toContain('bg-green-50')

    await passBtn.trigger('click')

    expect(passBtn.classes()).toContain('text-green-600')
    expect(passBtn.classes()).toContain('bg-green-50')
  })

  it('updates step status when fail button is clicked', async () => {
    const failBtn = wrapper.find('[data-testid="fail-btn-1"]')

    expect(failBtn.classes()).not.toContain('text-red-600')
    expect(failBtn.classes()).not.toContain('bg-red-50')

    await failBtn.trigger('click')

    expect(failBtn.classes()).toContain('text-red-600')
    expect(failBtn.classes()).toContain('bg-red-50')
  })

  it('shows comment textarea when fail button is clicked', async () => {
    const initialCommentRow = wrapper.find('[data-testid="comment-row-1"]')
    expect(initialCommentRow.exists()).toBe(false)

    const failBtn = wrapper.find('[data-testid="fail-btn-1"]')
    await failBtn.trigger('click')
    await wrapper.vm.$nextTick()

    const commentRow = wrapper.find('[data-testid="comment-row-1"]')
    expect(commentRow.exists()).toBe(true)

    const commentTextarea = wrapper.find('[data-testid="comment-textarea-1"]')
    expect(commentTextarea.exists()).toBe(true)
  })

  it('hides comment textarea on blur', async () => {
    const failBtn = wrapper.find('[data-testid="fail-btn-1"]')
    await failBtn.trigger('click')
    await wrapper.vm.$nextTick()

    const commentTextarea = wrapper.find('[data-testid="comment-textarea-1"]')
    expect(commentTextarea.exists()).toBe(true)

    await commentTextarea.trigger('blur')
    await wrapper.vm.$nextTick()

    const hiddenTextarea = wrapper.find('[data-testid="comment-textarea-1"]')
    expect(hiddenTextarea.exists()).toBe(false)
  })

  it('shows loading state when creating test results', async () => {
    const useTestResultQuery = (await import('@/composables/useTestResultQuery')).default

    vi.mocked(useTestResultQuery).mockReturnValue({
      mutateOnCreateTestResultAsync: vi.fn().mockResolvedValue({ id: 1 }),
      isCreatingTestResult: ref(true),
    } as any)

    wrapper.unmount()
    wrapper = mount(TestCaseExecuteView, {
      global: {
        stubs: {
          TitleComponent: {
            template: '<div data-testid="test-case-title">{{ title }}</div>',
            props: ['title'],
          },
          Button: {
            template:
              '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
          },
          SelectWrapperComponent: { template: '<div><slot /></div>' },
          Select: { template: '<div data-testid="configuration-select"><slot /></div>' },
          SelectTrigger: { template: '<div><slot /></div>' },
          SelectValue: { template: '<div>Configuration</div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectGroup: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Table: { template: '<table data-testid="steps-table"><slot /></table>' },
          TableHeader: { template: '<thead><slot /></thead>' },
          TableBody: { template: '<tbody><slot /></tbody>' },
          TableHead: { template: '<th><slot /></th>' },
          TableRow: { template: '<tr :data-testid="$attrs[\'data-testid\']"><slot /></tr>' },
          TableCell: { template: '<td><slot /></td>' },
          ContextMenu: { template: '<div><slot /></div>' },
          ContextMenuTrigger: { template: '<div><slot /></div>' },
          ContextMenuContent: { template: '<div><slot /></div>' },
          ContextMenuItem: { template: '<div><slot /></div>' },
          Textarea: {
            template:
              '<textarea :data-testid="$attrs[\'data-testid\']" @blur="$emit(\'blur\')"></textarea>',
          },
          FileUploadDialog: { template: '<div data-testid="file-upload-dialog"></div>' },
          CircleCheck: { template: '<div data-testid="check-icon"></div>' },
          CircleX: { template: '<div data-testid="x-icon"></div>' },
          Save: { template: '<div data-testid="save-icon"></div>' },
          LoaderCircle: { template: '<div data-testid="loading-icon"></div>' },
          MessageSquare: { template: '<div></div>' },
          Paperclip: { template: '<div></div>' },
          X: { template: '<div></div>' },
        },
      },
    })

    const loadingIcon = wrapper.find('[data-testid="loading-icon"]')
    const saveIcon = wrapper.find('[data-testid="save-icon"]')

    expect(loadingIcon.exists()).toBe(true)
    expect(saveIcon.exists()).toBe(false)
  })

  it('renders attachment download buttons for existing attachments', () => {
    const downloadBtn = wrapper.find('[data-testid="attachment-download-1"]')
    expect(downloadBtn.exists()).toBe(true)
    expect(downloadBtn.text()).toBe('test-file.png')
  })

  it('toggles between pass and fail states correctly', async () => {
    const passBtn = wrapper.find('[data-testid="pass-btn-1"]')
    const failBtn = wrapper.find('[data-testid="fail-btn-1"]')

    expect(passBtn.classes()).not.toContain('text-green-600')
    expect(failBtn.classes()).not.toContain('text-red-600')

    await passBtn.trigger('click')
    expect(passBtn.classes()).toContain('text-green-600')
    expect(failBtn.classes()).not.toContain('text-red-600')

    await failBtn.trigger('click')
    expect(passBtn.classes()).not.toContain('text-green-600')
    expect(failBtn.classes()).toContain('text-red-600')
  })

  it('calls download API when attachment button is clicked', async () => {
    const mockDownloadMethod = vi.fn().mockResolvedValue(new Blob())

    const { TestplansApi } = await import('@/services')
    vi.mocked(TestplansApi).mockImplementation(
      () =>
        ({
          retrieveTestplansTestcasesTeststepattachmentsDownload: mockDownloadMethod,
        }) as any,
    )

    wrapper.unmount()
    wrapper = mount(TestCaseExecuteView, {
      global: {
        stubs: {
          TitleComponent: {
            template: '<div data-testid="test-case-title">{{ title }}</div>',
            props: ['title'],
          },
          Button: {
            template:
              '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
          },
          SelectWrapperComponent: { template: '<div><slot /></div>' },
          Select: { template: '<div data-testid="configuration-select"><slot /></div>' },
          SelectTrigger: { template: '<div><slot /></div>' },
          SelectValue: { template: '<div>Configuration</div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectGroup: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Table: { template: '<table data-testid="steps-table"><slot /></table>' },
          TableHeader: { template: '<thead><slot /></thead>' },
          TableBody: { template: '<tbody><slot /></tbody>' },
          TableHead: { template: '<th><slot /></th>' },
          TableRow: { template: '<tr :data-testid="$attrs[\'data-testid\']"><slot /></tr>' },
          TableCell: { template: '<td><slot /></td>' },
          ContextMenu: { template: '<div><slot /></div>' },
          ContextMenuTrigger: { template: '<div><slot /></div>' },
          ContextMenuContent: { template: '<div><slot /></div>' },
          ContextMenuItem: { template: '<div><slot /></div>' },
          Textarea: {
            template:
              '<textarea :data-testid="$attrs[\'data-testid\']" @blur="$emit(\'blur\')"></textarea>',
          },
          FileUploadDialog: { template: '<div data-testid="file-upload-dialog"></div>' },
          CircleCheck: { template: '<div data-testid="check-icon"></div>' },
          CircleX: { template: '<div data-testid="x-icon"></div>' },
          Save: { template: '<div data-testid="save-icon"></div>' },
          LoaderCircle: { template: '<div data-testid="loading-icon"></div>' },
          MessageSquare: { template: '<div></div>' },
          Paperclip: { template: '<div></div>' },
          X: { template: '<div></div>' },
        },
      },
    })

    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
    } as any)
    const mockAppendChild = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => ({}) as any)
    const mockRemoveChild = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => ({}) as any)

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: vi.fn().mockReturnValue('mock-url'),
        revokeObjectURL: vi.fn(),
      },
      writable: true,
    })

    const downloadBtn = wrapper.find('[data-testid="attachment-download-1"]')
    await downloadBtn.trigger('click')

    expect(mockDownloadMethod).toHaveBeenCalledTimes(1)
    expect(mockDownloadMethod).toHaveBeenCalledWith({
      testPlanId: 1,
      testCaseId: 1,
      id: 1,
    })

    mockCreateElement.mockRestore()
    mockAppendChild.mockRestore()
    mockRemoveChild.mockRestore()
  })
})
