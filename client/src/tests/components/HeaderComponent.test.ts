import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'


vi.mock('@/composables/useUserQuery', () => ({
  default: () => ({
    currentUser: ref({
      username: 'testuser',
      email: 'test@example.com'
    }),
    isFetchingCurrentUser: ref(false)
  })
}))

vi.mock('@/composables/useTokenApi', () => ({
  default: () => ({
    signOut: vi.fn()
  })
}))

vi.mock('@/composables/useTestPlanQuery', () => ({
  default: () => ({
    testPlan: ref(null)
  })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {},
    meta: { 
      breadcrumb: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Test Plans', path: '/test-plans' },
        { name: 'Current Plan' }
      ] 
    }
  })
}))

describe('HeaderComponent', () => {
  const defaultStubs = {
    LogoComponent: { template: '<div></div>' },
    Breadcrumb: { template: '<div><slot /></div>' },
    BreadcrumbList: { template: '<div><slot /></div>' },
    BreadcrumbItem: { template: '<div><slot /></div>' },
    BreadcrumbLink: { template: '<div><slot /></div>' },
    BreadcrumbPage: { template: '<div><slot /></div>' },
    BreadcrumbSeparator: { template: '<div></div>' },
    DropdownMenu: { template: '<div><slot /></div>' },
    DropdownMenuTrigger: { template: '<div><slot /></div>' },
    DropdownMenuContent: { template: '<div><slot /></div>' },
    DropdownMenuItem: { template: '<div><slot /></div>' },
    DropdownMenuSeparator: { template: '<div></div>' },
    Avatar: { template: '<div><slot /></div>' },
    AvatarImage: { template: '<div></div>' },
    AvatarFallback: { template: '<div><slot /></div>' },
    RouterLink: { template: '<a><slot /></a>' }
  }

  it('displays user avatar fallback with first letter of username', () => {
    const wrapper = mount(HeaderComponent, {
      global: {
        stubs: defaultStubs
      }
    })

    expect(wrapper.text()).toContain('t') // First letter of 'testuser'
  })

  it('displays username and email in dropdown', () => {
    const wrapper = mount(HeaderComponent, {
      global: {
        stubs: defaultStubs
      }
    })

    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('renders breadcrumb items when breadcrumb data exists', () => {
    const wrapper = mount(HeaderComponent, {
      global: {
        stubs: defaultStubs
      }
    })

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Test Plans')
    expect(wrapper.text()).toContain('Current Plan')
  })
})
