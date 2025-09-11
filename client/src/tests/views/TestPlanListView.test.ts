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
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          Input: {
            template:
              '<input :placeholder="placeholder" @input="$emit(\'update:model-value\', $event.target.value)" />',
            props: ['placeholder'],
            emits: ['update:model-value'],
          },
          Select: {
            template:
              '<div data-testid="status-filter-select" @click="$emit(\'update:model-value\', \'in_progress\')"><slot /></div>',
            emits: ['update:model-value'],
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
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<div><slot /></div>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuItem: {
            template: '<div @click="$emit(\'click\')"><slot /></div>',
            emits: ['click'],
          },
          Pagination: { template: '<div>Pagination</div>' },
          PaginationContent: true,
          PaginationEllipsis: true,
          PaginationItem: true,
          PaginationNext: true,
          PaginationPrevious: true,
          AlertDialog: {
            template: '<div :open="open"><slot /></div>',
            props: ['open'],
          },
          AlertDialogContent: { template: '<div><slot /></div>' },
          AlertDialogTitle: { template: '<div><slot /></div>' },
          AlertDialogDescription: { template: '<div><slot /></div>' },
          AlertDialogFooter: { template: '<div><slot /></div>' },
          AlertDialogCancel: {
            template: '<button @click="$emit(\'click\')">Cancel</button>',
            emits: ['click'],
          },
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

  it('renders test plan data', () => {
    expect(wrapper.text()).toContain('Test Plan 1')
    expect(wrapper.text()).toContain('Test Plan 2')
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
    const titleInput = wrapper.find('[data-testid="title-filter-input"]')

    await titleInput.setValue('Test Search')
    await titleInput.trigger('input')

    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.title.value).toBe('Test Search')
    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('updates status filter when changed', async () => {
    const statusSelect = wrapper.find('[data-testid="status-filter-select"]')

    await statusSelect.trigger('click')

    expect(mockQueryReturn.status.value).toBe('in_progress')
    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('opens delete confirmation dialog', async () => {
    const deleteButton = wrapper.find('[data-testid="delete-test-plan-button"]')

    await deleteButton.trigger('click')

    const deleteDialog = wrapper.find('[data-testid="delete-confirmation-dialog"]')
    expect(deleteDialog.attributes('open')).toBe('true')
  })

  it('shows correct test plan in delete dialog', async () => {
    const deleteButton = wrapper.find('[data-testid="delete-test-plan-button"]')

    await deleteButton.trigger('click')

    const selectedTestPlanTitle = wrapper.find('[data-testid="selected-test-plan-title"]')
    expect(selectedTestPlanTitle.text()).toBe('Test Plan 1')
  })

  it('cancels deletion correctly', async () => {
    const deleteButton = wrapper.find('[data-testid="delete-test-plan-button"]')
    await deleteButton.trigger('click')

    const cancelButton = wrapper.find('[data-testid="cancel-delete-button"]')
    await cancelButton.trigger('click')

    const deleteDialog = wrapper.find('[data-testid="delete-confirmation-dialog"]')
    expect(deleteDialog.attributes('open')).toBe('false')
  })

  it('calls delete mutation when confirmed', async () => {
    const deleteButton = wrapper.find('[data-testid="delete-test-plan-button"]')
    await deleteButton.trigger('click')

    const confirmButton = wrapper.find('[data-testid="confirm-delete-button"]')
    await confirmButton.trigger('click')

    expect(mockMutateOnDeleteTestPlan).toHaveBeenCalledWith(1)

    const deleteDialog = wrapper.find('[data-testid="delete-confirmation-dialog"]')
    expect(deleteDialog.attributes('open')).toBe('false')
  })

  it('handles delete error gracefully', async () => {
    mockMutateOnDeleteTestPlan.mockImplementation(() => {
      throw new Error('Delete failed')
    })

    const deleteButton = wrapper.find('[data-testid="delete-test-plan-button"]')
    await deleteButton.trigger('click')

    const confirmButton = wrapper.find('[data-testid="confirm-delete-button"]')
    await confirmButton.trigger('click')

    const deleteDialog = wrapper.find('[data-testid="delete-confirmation-dialog"]')
    expect(deleteDialog.attributes('open')).toBe('false')
  })

  it('displays test plan data in table rows', () => {
    const testPlanRows = wrapper.findAll('[data-testid="test-plan-row"]')
    const testPlanTitles = wrapper.findAll('[data-testid="test-plan-title"]')
    const testPlanStatuses = wrapper.findAll('[data-testid="test-plan-status"]')
    const testPlanDates = wrapper.findAll('[data-testid="test-plan-updated-at"]')

    expect(testPlanRows).toHaveLength(2)
    expect(testPlanTitles[0].text()).toBe('Test Plan 1')
    expect(testPlanTitles[1].text()).toBe('Test Plan 2')

    expect(testPlanStatuses[0].text()).toContain('Not Started')
    expect(testPlanStatuses[1].text()).toContain('In Progress')

    const date1 = new Date('2023-01-01T00:00:00Z').toLocaleString()
    const date2 = new Date('2023-01-02T00:00:00Z').toLocaleString()
    expect(testPlanDates[0].text()).toBe(date1)
    expect(testPlanDates[1].text()).toBe(date2)
  })

  it('displays correct badge styles for different statuses', () => {
    const statusBadges = wrapper.findAll('[data-testid="status-badge"]')

    // Test Plan 1 has NotStarted status
    expect(statusBadges[0].classes()).toContain('bg-rose-100')
    expect(statusBadges[0].classes()).toContain('text-rose-950')

    // Test Plan 2 has InProgress status
    expect(statusBadges[1].classes()).toContain('bg-amber-100')
    expect(statusBadges[1].classes()).toContain('text-amber-950')
  })

  it('resets page when title filter changes', async () => {
    mockQueryReturn.page.value = 3

    const titleInput = wrapper.find('[data-testid="title-filter-input"]')
    await titleInput.setValue('New Title')
    await titleInput.trigger('input')

    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('resets page when status filter changes', async () => {
    mockQueryReturn.page.value = 3

    const statusSelect = wrapper.find('[data-testid="status-filter-select"]')
    await statusSelect.trigger('click')

    expect(mockQueryReturn.page.value).toBe(1)
  })

  it('clears timer when title changes multiple times', async () => {
    const titleInput = wrapper.find('[data-testid="title-filter-input"]')

    await titleInput.setValue('First')
    await titleInput.trigger('input')

    await titleInput.setValue('Second')
    await titleInput.trigger('input')

    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(mockQueryReturn.title.value).toBe('Second')
  })
})
