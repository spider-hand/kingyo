import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TitleComponent from '@/components/TitleComponent.vue'

describe('TitleComponent', () => {
  it('renders the title prop correctly', () => {
    const title = 'Test Title'
    const wrapper = mount(TitleComponent, {
      props: { title }
    })

    expect(wrapper.text()).toBe(title)
  })
})
