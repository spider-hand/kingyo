import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import TestCaseResultView from '@/views/TestCaseResultView.vue'
import useTestCaseQuery from '@/composables/useTestCaseQuery'
import useTestPlanQuery from '@/composables/useTestPlanQuery'
import useTestResultQuery from '@/composables/useTestResultQuery'
import useTestResultStepQuery from '@/composables/useTestResultStepQuery'
import useTestResultStepAttachmentQuery from '@/composables/useTestResultStepAttachmentQuery'
import useApi from '@/composables/useApi'
import { TestResultStepStatusEnum, ResultEnum } from '@/services'

vi.mock('@/composables/useTestCaseQuery')
vi.mock('@/composables/useTestPlanQuery')
vi.mock('@/composables/useTestResultQuery')
vi.mock('@/composables/useTestResultStepQuery')
vi.mock('@/composables/useTestResultStepAttachmentQuery')
vi.mock('@/composables/useApi')

vi.mock('vue-router', () => ({
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
  useRoute: vi.fn(() => ({
    params: {
      testPlanId: '1',
      testCaseId: '1',
      testResultId: '1',
    },
  })),
}))

vi.mock('@/utils', () => ({
  formatConfiguration: vi.fn((str) => `Mocked Config: ${str}`),
  getAttachmentFileName: vi.fn((filePath) => 'test-file.png'),
}))

const mockDownloadMethod = vi.fn().mockResolvedValue(new Blob())

vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services')
  return {
    ...actual,
    TestplansApi: vi.fn().mockImplementation(() => ({
      retrieveTestplansTestcasesTestresultsTestresultstepattachmentsDownload: mockDownloadMethod,
    })),
  }
})

describe('TestCaseResultView', () => {
  let wrapper: VueWrapper
  let mockUseTestCaseQuery: MockedFunction<any>
  let mockUseTestPlanQuery: MockedFunction<any>
  let mockUseTestResultQuery: MockedFunction<any>
  let mockUseTestResultStepQuery: MockedFunction<any>
  let mockUseTestResultStepAttachmentQuery: MockedFunction<any>
  let mockUseApi: MockedFunction<any>

  const mockTestPlan = {
    id: 1,
    title: 'Test Plan 1',
  }

  const mockTestCase = {
    id: 1,
    title: 'Test Case 1',
  }

  const mockTestResult = {
    id: 1,
    result: ResultEnum.Pass,
    testerUsername: 'testuser',
    _configuration: 'chrome browser windows',
    executedAt: '2023-01-01T00:00:00Z',
  }

  const mockTestResultSteps = [
    {
      id: 1,
      order: 1,
      action: 'Click login button',
      expectedResult: 'User should be logged in',
      comment: 'Worked as expected',
      status: TestResultStepStatusEnum.Pass,
    },
    {
      id: 2,
      order: 2,
      action: 'Navigate to dashboard',
      expectedResult: 'Dashboard should load',
      comment: 'Failed to load',
      status: TestResultStepStatusEnum.Fail,
    },
  ]

  const mockAttachments = [
    {
      id: 1,
      resultStep: 1,
      file: 'test-screenshot-1.png',
    },
    {
      id: 2,
      resultStep: 2,
      file: 'test-screenshot-2.png',
    },
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/test-plans/:testPlanId/test-cases/:testCaseId/results/:testResultId',
        name: 'test-case-result',
        component: TestCaseResultView,
      },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseTestPlanQuery = vi.mocked(useTestPlanQuery)
    mockUseTestCaseQuery = vi.mocked(useTestCaseQuery)
    mockUseTestResultQuery = vi.mocked(useTestResultQuery)
    mockUseTestResultStepQuery = vi.mocked(useTestResultStepQuery)
    mockUseTestResultStepAttachmentQuery = vi.mocked(useTestResultStepAttachmentQuery)
    mockUseApi = vi.mocked(useApi)

    mockUseTestPlanQuery.mockReturnValue({
      testPlan: ref(mockTestPlan),
    })

    mockUseTestCaseQuery.mockReturnValue({
      testCase: ref(mockTestCase),
    })

    mockUseTestResultQuery.mockReturnValue({
      testResult: ref(mockTestResult),
    })

    mockUseTestResultStepQuery.mockReturnValue({
      testResultSteps: ref(mockTestResultSteps),
    })

    mockUseTestResultStepAttachmentQuery.mockReturnValue({
      testResultStepAttachments: ref(mockAttachments),
    })

    mockUseApi.mockReturnValue({
      apiConfig: {},
    })

    wrapper = mount(TestCaseResultView, {
      global: {
        plugins: [router],
        stubs: {
          TitleComponent: {
            template: '<div data-testid="test-case-title">{{ title }}</div>',
            props: ['title'],
          },
          DoughnutChart: {
            template: '<div data-testid="result-chart"></div>',
            props: ['data', 'size'],
          },
          Table: {
            template: '<table data-testid="result-steps-table"><slot /></table>',
          },
          TableHeader: { template: '<thead><slot /></thead>' },
          TableBody: { template: '<tbody><slot /></tbody>' },
          TableHead: { template: '<th><slot /></th>' },
          TableRow: {
            template: '<tr data-testid="result-step-row"><slot /></tr>',
          },
          TableCell: { template: '<td><slot /></td>' },
          CircleCheck: {
            template: `
              <div 
                :data-testid="$attrs['data-testid'] || 'pass-icon'"
              ></div>
            `,
          },
          CircleX: {
            template: `
              <div 
                :data-testid="$attrs['data-testid'] || 'fail-icon'"
              ></div>
            `,
          },
          CircleMinus: {
            template: `
              <div 
                :data-testid="$attrs['data-testid'] || 'neutral-icon'"
              ></div>
            `,
          },
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders result header with correct status icon', () => {
    const passIcon = wrapper.find('[data-testid="pass-icon"]')
    const resultHeader = wrapper.find('[data-testid="result-header"]')

    expect(resultHeader.exists()).toBe(true)
    expect(passIcon.exists()).toBe(true)
  })

  it('displays test result details with correct values', () => {
    const testPlanName = wrapper.find('[data-testid="test-plan-name"]')
    const testerName = wrapper.find('[data-testid="tester-name"]')
    const timestamp = wrapper.find('[data-testid="timestamp"]')
    const configuration = wrapper.find('[data-testid="configuration"]')

    expect(testPlanName.text()).toBe('Test Plan 1')
    expect(testerName.text()).toBe('testuser')
    expect(timestamp.text()).toBe(new Date('2023-01-01T00:00:00Z').toLocaleString())
    expect(configuration.text()).toBe('Mocked Config: chrome browser windows')
  })

  it('renders result steps table with correct step data per row', () => {
    const table = wrapper.find('[data-testid="result-steps-table"]')
    const stepRows = wrapper.findAll('tbody [data-testid="result-step-row"]')

    expect(table.exists()).toBe(true)
    expect(stepRows.length).toBe(2)

    const firstRow = stepRows[0]
    expect(firstRow.text()).toContain('1')
    expect(firstRow.text()).toContain('Click login button')
    expect(firstRow.text()).toContain('User should be logged in')
    expect(firstRow.text()).toContain('Worked as expected')

    const secondRow = stepRows[1]
    expect(secondRow.text()).toContain('2')
    expect(secondRow.text()).toContain('Navigate to dashboard')
    expect(secondRow.text()).toContain('Dashboard should load')
    expect(secondRow.text()).toContain('Failed to load')
  })

  it('displays step status icons for correct rows', () => {
    const stepRows = wrapper.findAll('tbody [data-testid="result-step-row"]')

    const firstRowPassIcon = stepRows[0].find('[data-testid="step-pass-icon"]')
    expect(firstRowPassIcon.exists()).toBe(true)

    const secondRowFailIcon = stepRows[1].find('[data-testid="step-fail-icon"]')
    expect(secondRowFailIcon.exists()).toBe(true)
  })

  it('renders attachment download buttons with correct count and labels', () => {
    const attachments = wrapper.findAll('[data-testid="attachment-download-btn"]')
    expect(attachments.length).toBe(2)

    attachments.forEach((button) => {
      expect(button.text()).toBe('test-file.png')
    })
  })

  it('calls download API when attachment button is clicked', async () => {
    const downloadButton = wrapper.find('[data-testid="attachment-download-btn"]')

    expect(downloadButton.exists()).toBe(true)

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

    await downloadButton.trigger('click')

    expect(mockDownloadMethod).toHaveBeenCalledTimes(1)
    expect(mockDownloadMethod).toHaveBeenCalledWith({
      testPlanId: 1,
      testCaseId: 1,
      testResultId: 1,
      id: 1,
    })

    mockCreateElement.mockRestore()
    mockAppendChild.mockRestore()
    mockRemoveChild.mockRestore()
  })
})
