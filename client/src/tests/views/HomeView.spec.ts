import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('renders a button', () => {
    const wrapper = mount(HomeView)
    const button = wrapper.findComponent({ name: 'ButtonComponent' })
    expect(button.exists()).toBe(true)
  })

  it('button has correct text', () => {
    const wrapper = mount(HomeView)
    const button = wrapper.findComponent({ name: 'ButtonComponent' })
    expect(button.text()).toBe('Click me')
  })
})
