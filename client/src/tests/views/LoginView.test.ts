import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import LoginView from '@/views/LoginView.vue'
import useTokenApi from '@/composables/useTokenApi'


vi.mock('@/composables/useTokenApi')

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

describe('LoginView', () => {
  let wrapper: VueWrapper
  let mockSignIn: MockedFunction<any>
  let mockUseTokenApi: MockedFunction<any>

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      { path: '/test-plans', name: 'test-plan-list', component: { template: '<div>Test Plans</div>' } },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    mockSignIn = vi.fn()
    mockUseTokenApi = vi.mocked(useTokenApi)
    mockUseTokenApi.mockReturnValue({
      signIn: mockSignIn,
      isSigningIn: { value: false },
      errorMessage: { value: null },
    })

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          LogoComponent: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('submits form with valid credentials', async () => {
    mockSignIn.mockResolvedValue(undefined)
    
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('password123')
    
    await usernameInput.trigger('input')
    await passwordInput.trigger('input')
    await nextTick()
    
    const componentInstance = wrapper.vm as any
    if (componentInstance.onSubmit) {
      await componentInstance.onSubmit({ username: 'testuser', password: 'password123' })
    }
    
    expect(mockSignIn).toHaveBeenCalledWith('testuser', 'password123')
    expect(mockPush).toHaveBeenCalledWith({ name: 'test-plan-list' })
  })

  it('shows loading state during sign in', async () => {
    mockUseTokenApi.mockReturnValue({
      signIn: mockSignIn,
      isSigningIn: { value: true },
      errorMessage: { value: null },
    })

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          LogoComponent: true,
        },
      },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    
    expect(submitButton.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('displays error message when sign in fails', async () => {
    mockUseTokenApi.mockReturnValue({
      signIn: mockSignIn,
      isSigningIn: { value: false },
      errorMessage: { value: 'Failed to sign in. Please check your credentials.' },
    })

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          LogoComponent: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Failed to sign in. Please check your credentials.')
    expect(wrapper.find('.text-destructive').exists()).toBe(true)
  })

  it('handles sign in error gracefully', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))
    
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('password123')
    
    await usernameInput.trigger('input')
    await passwordInput.trigger('input')
    await nextTick()
    
    const componentInstance = wrapper.vm as any
    if (componentInstance.onSubmit) {
      await componentInstance.onSubmit({ username: 'testuser', password: 'password123' })
    }
    
    expect(mockSignIn).toHaveBeenCalledWith('testuser', 'password123')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('prevents form submission when signing in', async () => {
    mockUseTokenApi.mockReturnValue({
      signIn: mockSignIn,
      isSigningIn: { value: true },
      errorMessage: { value: null },
    })

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          LogoComponent: true,
        },
      },
    })

    const submitButton = wrapper.find('button[type="submit"]')

    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})