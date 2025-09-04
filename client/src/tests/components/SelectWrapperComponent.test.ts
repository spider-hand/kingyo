import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue'

describe('SelectWrapperComponent', () => {
  it('renders the label prop correctly', () => {
    const label = 'Select Option'
    const wrapper = mount(SelectWrapperComponent, {
      props: { label }
    })

    expect(wrapper.text()).toContain(label)
  })
})
