import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import TestCaseListView from '@/views/TestCaseListView.vue'
import useTestCaseQuery from '@/composables/useTestCaseQuery'
import useTestPlanQuery from '@/composables/useTestPlanQuery'
import useTestResultQuery from '@/composables/useTestResultQuery'
import useUserQuery from '@/composables/useUserQuery'

vi.mock('@/composables/useTestCaseQuery')
vi.mock('@/composables/useTestPlanQuery')
vi.mock('@/composables/useTestResultQuery')
vi.mock('@/composables/useUserQuery')

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

describe('TestCaseListView', () => {
  let wrapper: VueWrapper
  let mockMutateOnDeleteTestCase: MockedFunction<any>
  let mockUseTestCaseQuery: MockedFunction<any>
  let mockUseTestPlanQuery: MockedFunction<any>
  let mockUseTestResultQuery: MockedFunction<any>
  let mockUseUserQuery: MockedFunction<any>
  let mockQueryReturn: any

  const mockTestPlan = {
    id: 1,
    title: 'Test Plan 1',
    description: 'Test Plan Description',
  }

  const mockTestCases = [
    {
      id: 1,
      title: 'Test Case 1',
      status: 'design',
      latestResult: 'pass',
      updatedAt: '2023-01-01T00:00:00Z',
      executedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: 2,
      title: 'Test Case 2',
      status: 'ready',
      latestResult: 'fail',
      updatedAt: '2023-01-03T00:00:00Z',
      executedAt: '2023-01-04T00:00:00Z',
    },
  ]

  const mockTestResults = [
    {
      id: 1,
      _case: 1,
      caseTitle: 'Test Case 1',
      result: 'pass',
      testerUsername: 'testuser1',
      _configuration: 1,
      executedAt: '2023-01-01T00:00:00Z',
    },
  ]

  const mockUsers = [
    { username: 'testuser1', id: 1 },
    { username: 'testuser2', id: 2 },
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/test-plans/:testPlanId/test-cases',
        name: 'test-case-list',
        component: { template: '<div>Test Cases</div>' },
      },
      {
        path: '/test-plans/:testPlanId/test-cases/add',
        name: 'test-case-add',
        component: { template: '<div>Add Test Case</div>' },
      },
      {
        path: '/test-plans/:testPlanId/test-cases/:testCaseId/edit',
        name: 'test-case-edit',
        component: { template: '<div>Edit Test Case</div>' },
      },
      {
        path: '/test-plans/:testPlanId/test-cases/:testCaseId/execute',
        name: 'test-case-execute',
        component: { template: '<div>Execute Test Case</div>' },
      },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    mockMutateOnDeleteTestCase = vi.fn()
    mockUseTestCaseQuery = vi.mocked(useTestCaseQuery)
    mockUseTestPlanQuery = vi.mocked(useTestPlanQuery)
    mockUseTestResultQuery = vi.mocked(useTestResultQuery)
    mockUseUserQuery = vi.mocked(useUserQuery)

    mockUseTestPlanQuery.mockReturnValue({
      testPlan: ref(mockTestPlan),
    } as any)

    // Create proper reactive refs for the mocked composable return
    mockQueryReturn = {
      testCases: ref(mockTestCases),
      count: ref(2),
      page: ref(1),
      title: ref(''),
      status: ref('all'),
      latestResult: ref('all'),
      mutateOnDeleteTestCase: mockMutateOnDeleteTestCase,
    }

    mockUseTestCaseQuery.mockReturnValue(mockQueryReturn)

    mockUseTestResultQuery.mockReturnValue({
      testResults: ref(mockTestResults),
      count: ref(1),
      page: ref(1),
      title: ref(''),
      result: ref('all'),
      tester: ref('all'),
      configuration: ref('all'),
    } as any)

    mockUseUserQuery.mockReturnValue({
      users: ref(mockUsers),
      isFetchingUsers: ref(false),
    } as any)

    wrapper = mount(TestCaseListView, {
      global: {
        plugins: [router],
        mocks: {
          $route: {
            params: { testPlanId: '1' },
          },
        },
        stubs: {
          TitleComponent: {
            template: '<div data-testid="test-plan-title">{{ title }}</div>',
            props: ['title'],
          },
          Button: {
            template:
              '<button data-testid="new-test-case-btn" @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
          },
          Tabs: {
            template: '<div data-testid="test-case-tabs"><slot /></div>',
          },
          TabsList: {
            template: '<div><slot /></div>',
          },
          TabsTrigger: {
            template:
              '<button data-testid="define-tab" v-if="value === \'define\'"><slot /></button><button data-testid="execute-tab" v-else><slot /></button>',
            props: ['value'],
          },
          TabsContent: {
            template:
              '<div data-testid="define-tab-content" v-if="value === \'define\'"><slot /></div>',
            props: ['value'],
          },
          Input: {
            template:
              '<input data-testid="test-case-title-filter" :placeholder="placeholder" @input="$emit(\'update:model-value\', $event.target.value)" />',
            props: ['placeholder'],
            emits: ['update:model-value'],
          },
          SelectWrapperComponent: {
            template:
              '<div data-testid="status-filter" v-if="label === \'Status\'" @click="$emit(\'click\')"><slot /></div><div data-testid="latest-outcome-filter" v-else @click="$emit(\'click\')"><slot /></div>',
            props: ['label'],
            emits: ['click'],
          },
          Select: { 
            template: '<div @update:model-value="$emit(\'update:model-value\', $event)"><slot /></div>',
            emits: ['update:model-value']
          },
          SelectTrigger: { template: '<div><slot /></div>' },
          SelectValue: { template: '<div><slot /></div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectGroup: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Table: {
            template: '<table data-testid="test-cases-table"><slot /></table>',
          },
          TableHeader: { template: '<thead><slot /></thead>' },
          TableBody: { template: '<tbody><slot /></tbody>' },
          TableHead: { template: '<th><slot /></th>' },
          TableRow: {
            template: '<tr data-testid="test-case-row" @click="$emit(\'click\')"><slot /></tr>',
            emits: ['click'],
          },
          TableCell: { template: '<td><slot /></td>' },
          Badge: { template: '<span><slot /></span>' },
          ContextMenu: { template: '<div><slot /></div>' },
          ContextMenuTrigger: { template: '<div><slot /></div>' },
          ContextMenuContent: { template: '<div><slot /></div>' },
          ContextMenuItem: {
            template:
              '<div data-testid="delete-test-case-menu" @click="$emit(\'click\')"><slot /></div>',
            emits: ['click'],
          },
          Pagination: { template: '<div>Pagination</div>' },
          PaginationContent: { template: '<div><slot /></div>' },
          PaginationEllipsis: { template: '<div><slot /></div>' },
          PaginationItem: { template: '<div><slot /></div>' },
          PaginationNext: { template: '<div><slot /></div>' },
          PaginationPrevious: { template: '<div><slot /></div>' },
          AlertDialog: {
            template: '<div data-testid="delete-dialog" v-if="open"><slot /></div>',
            props: ['open'],
          },
          AlertDialogContent: { template: '<div><slot /></div>' },
          AlertDialogTitle: { template: '<div><slot /></div>' },
          AlertDialogDescription: { template: '<div><slot /></div>' },
          AlertDialogFooter: { template: '<div><slot /></div>' },
          AlertDialogCancel: {
            template:
              '<button data-testid="cancel-delete-btn" @click="$emit(\'click\')">Cancel</button>',
            emits: ['click'],
          },
          AlertDialogAction: {
            template:
              '<button data-testid="confirm-delete-btn" @click="$emit(\'click\')">Confirm</button>',
            emits: ['click'],
          },
          Plus: true,
          ListFilter: true,
          Play: true,
          Pencil: true,
          Trash: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('accepts input changes in title filter', async () => {
    const titleInput = wrapper.find('[data-testid="test-case-title-filter"]')
    
    await titleInput.setValue('Search Term')
    
    expect((titleInput.element as HTMLInputElement).value).toBe('Search Term')
  })

  it('opens delete dialog when delete menu item is clicked', async () => {
    const deleteMenuItem = wrapper.find('[data-testid="delete-test-case-menu"]')
    await deleteMenuItem.trigger('click')

    const dialog = wrapper.find('[data-testid="delete-dialog"]')
    expect(dialog.exists()).toBe(true)
  })

  it('closes delete dialog when cancel is clicked', async () => {
    const deleteMenuItem = wrapper.find('[data-testid="delete-test-case-menu"]')
    await deleteMenuItem.trigger('click')

    const cancelButton = wrapper.find('[data-testid="cancel-delete-btn"]')
    await cancelButton.trigger('click')

    const dialog = wrapper.find('[data-testid="delete-dialog"]')
    expect(dialog.exists()).toBe(false)
  })
  
  it('calls delete mutation when confirmed', async () => {
    const deleteMenuItem = wrapper.find('[data-testid="delete-test-case-menu"]')
    await deleteMenuItem.trigger('click')
    
    const confirmButton = wrapper.find('[data-testid="confirm-delete-btn"]')
    await confirmButton.trigger('click')
    
    expect(mockMutateOnDeleteTestCase).toHaveBeenCalledWith(1)
  })
  
  it('handles delete error gracefully', async () => {
    mockMutateOnDeleteTestCase.mockImplementation(() => {
      throw new Error('Delete failed')
    })
    
    const deleteMenuItem = wrapper.find('[data-testid="delete-test-case-menu"]')
    await deleteMenuItem.trigger('click')
    
    const confirmButton = wrapper.find('[data-testid="confirm-delete-btn"]')
    await confirmButton.trigger('click')
    
    const dialog = wrapper.find('[data-testid="delete-dialog"]')
    expect(dialog.exists()).toBe(false)
  })
})
