import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LogoComponent from '@/components/LogoComponent.vue'

describe('LogoComponent', () => {
  it('renders with custom height', () => {
    const height = '48'
    const wrapper = mount(LogoComponent, {
      props: { height },
      global: {
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('height')).toBe(height)
  })
})
