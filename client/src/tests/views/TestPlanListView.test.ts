import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import TestPlanListView from '@/views/TestPlanListView.vue'
import useTestPlanQuery from '@/composables/useTestPlanQuery'
import { TestPlanStatusEnum } from '@/services'


vi.mock('@/composables/useTestPlanQuery')

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

describe('TestPlanListView', () => {
  let wrapper: VueWrapper
  let mockMutateOnDeleteTestPlan: MockedFunction<any>
  let mockUseTestPlanQuery: MockedFunction<any>
  let mockQueryReturn: any

  const mockTestPlans = [
    {
      id: 1,
      title: 'Test Plan 1',
      status: TestPlanStatusEnum.NotStarted,
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Test Plan 2',
      status: TestPlanStatusEnum.InProgress,
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/test-plans',
        name: 'test-plan-list',
        component: { template: '<div>Test Plans</div>' },
      },
      {
        path: '/test-plans/add',
        name: 'test-plan-add',
        component: { template: '<div>Add Test Plan</div>' },
      },
      {
        path: '/test-plans/:id/edit',
        name: 'test-plan-edit',
        component: { template: '<div>Edit Test Plan</div>' },
      },
      {
        path: '/test-plans/:testPlanId/test-cases',
        name: 'test-case-list',
        component: { template: '<div>Test Cases</div>' },
      },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    mockMutateOnDeleteTestPlan = vi.fn()
    mockUseTestPlanQuery = vi.mocked(useTestPlanQuery)

    // Create proper reactive refs for the mocked composable return
    mockQueryReturn = {
      testPlans: ref(mockTestPlans),
      count: ref(2),
      page: ref(1),
      title: ref(''),
      status: ref('all'),
      mutateOnDeleteTestPlan: mockMutateOnDeleteTestPlan,
    }

    mockUseTestPlanQuery.mockReturnValue(mockQueryReturn)

    wrapper = mount(TestPlanListView, {
      global: {
        plugins: [router],
        stubs: {
          // Stub components with simple text instead of complex templates
          TitleComponent: {
            template: '<div>Test Plans</div>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
          Input: {
            template: '<input placeholder="Filter by title.." />',
          },
          Select: {
            template: '<div>Status Filter</div>',
          },
          SelectContent: true,
          SelectGroup: true,
          SelectItem: true,
          SelectTrigger: true,
          SelectValue: true,
          Table: { template: '<div><slot /></div>' },
          TableBody: { template: '<div><slot /></div>' },
          TableCell: { template: '<div><slot /></div>' },
          TableHead: { template: '<div><slot /></div>' },
          TableHeader: { template: '<div><slot /></div>' },
          TableRow: { template: '<div><slot /></div>' },
          Badge: { template: '<span><slot /></span>' },
          DropdownMenu: true,
          DropdownMenuTrigger: true,
          DropdownMenuContent: true,
          DropdownMenuItem: true,
          Pagination: { template: '<div>Pagination</div>' },
          PaginationContent: true,
          PaginationEllipsis: true,
          PaginationItem: true,
          PaginationNext: true,
          PaginationPrevious: true,
          AlertDialog: {
            template: '<div v-if="open"><slot /></div>',
            props: ['open'],
          },
          AlertDialogContent: { template: '<div><slot /></div>' },
          AlertDialogTitle: { template: '<div><slot /></div>' },
          AlertDialogDescription: { template: '<div><slot /></div>' },
          AlertDialogFooter: { template: '<div><slot /></div>' },
          AlertDialogCancel: { template: '<button>Cancel</button>' },
          SelectWrapperComponent: {
            template: '<div><slot /></div>',
          },
          // Icon stubs
          Plus: true,
          EllipsisVertical: true,
          Pencil: true,
          Trash: true,
          ListFilter: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders test plan list with correct title', () => {
    expect(wrapper.text()).toContain('Test Plans')
  })

  it('renders test plan data', () => {
    expect(wrapper.text()).toContain('Test Plan 1')
    expect(wrapper.text()).toContain('Test Plan 2')
  })

  it('displays new test plan button', () => {
    expect(wrapper.text()).toContain('New test plan')
  })

  it('renders table headers', () => {
    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Last Updated')
  })

  it('displays status badges with correct text', () => {
    expect(wrapper.text()).toContain('Not Started')
    expect(wrapper.text()).toContain('In Progress')
  })

  it('shows formatted dates', () => {
    const date1 = new Date('2023-01-01T00:00:00Z').toLocaleString()
    const date2 = new Date('2023-01-02T00:00:00Z').toLocaleString()
    expect(wrapper.text()).toContain(date1)
    expect(wrapper.text()).toContain(date2)
  })

  it('calls title filter with debounce when input changes', async () => {
    const componentInstance = wrapper.vm as any

    componentInstance.onTitleChange('Test Search')

    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.title.value).toBe('Test Search')
    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('updates status filter when changed', () => {
    const componentInstance = wrapper.vm as any

    componentInstance.onStatusChange('in_progress')

    expect(mockQueryReturn.status.value).toBe('in_progress')
    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('opens delete confirmation dialog', () => {
    const componentInstance = wrapper.vm as any

    componentInstance.onConfirmDeletion(1)

    expect(componentInstance.openDeleteDialog).toBe(true)
    expect(componentInstance.selectedTestPlanId).toBe(1)
  })

  it('shows correct test plan in delete dialog', () => {
    const componentInstance = wrapper!.vm as any

    componentInstance.onConfirmDeletion(1)

    expect(componentInstance.selectedTestPlan?.title).toBe('Test Plan 1')
  })

  it('cancels deletion correctly', () => {
    const componentInstance = wrapper.vm as any

    componentInstance.onConfirmDeletion(1)
    componentInstance.onCancelDeletion()

    expect(componentInstance.openDeleteDialog).toBe(false)
    expect(componentInstance.selectedTestPlanId).toBe(null)
  })

  it('calls delete mutation when confirmed', () => {
    const componentInstance = wrapper!.vm as any

    componentInstance.onConfirmDeletion(1)
    componentInstance.onDeleteTestPlan()

    expect(mockMutateOnDeleteTestPlan).toHaveBeenCalledWith(1)
    expect(componentInstance.openDeleteDialog).toBe(false)
    expect(componentInstance.selectedTestPlanId).toBe(null)
  })

  it('handles delete error gracefully', () => {
    mockMutateOnDeleteTestPlan.mockImplementation(() => {
      throw new Error('Delete failed')
    })

    const componentInstance = wrapper!.vm as any

    componentInstance.onConfirmDeletion(1)
    componentInstance.onDeleteTestPlan()

    expect(componentInstance.openDeleteDialog).toBe(false)
    expect(componentInstance.selectedTestPlanId).toBe(null)
  })

  it('does not call delete when no test plan selected', () => {
    const componentInstance = wrapper!.vm as any
    componentInstance.selectedTestPlanId = null

    componentInstance.onDeleteTestPlan()

    expect(mockMutateOnDeleteTestPlan).not.toHaveBeenCalled()
  })

  it('returns correct badge style for not started status', () => {
    const componentInstance = wrapper!.vm as any
    const style = componentInstance.getBadgeStyle(TestPlanStatusEnum.NotStarted)
    expect(style).toContain('bg-rose-100')
  })

  it('returns correct badge style for in progress status', () => {
    const componentInstance = wrapper!.vm as any
    const style = componentInstance.getBadgeStyle(TestPlanStatusEnum.InProgress)
    expect(style).toContain('bg-amber-100')
  })

  it('returns correct badge style for completed status', () => {
    const componentInstance = wrapper!.vm as any
    const style = componentInstance.getBadgeStyle(TestPlanStatusEnum.Completed)
    expect(style).toContain('bg-emerald-100')
  })

  it('resets page when title filter changes', async () => {
    const componentInstance = wrapper!.vm as any
    mockQueryReturn.page.value = 3

    componentInstance.onTitleChange('New Title')
    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('resets page when status filter changes', () => {
    const componentInstance = wrapper!.vm as any
    mockQueryReturn.page.value = 3

    componentInstance.onStatusChange('completed')

    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('clears timer when title changes multiple times', async () => {
    const componentInstance = wrapper!.vm as any

    componentInstance.onTitleChange('First')
    componentInstance.onTitleChange('Second')

    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.title.value).toBe('Second')
  })
})
