import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import TestPlanListView from '@/views/TestPlanListView.vue'

describe('TestPlanListView', () => {
  it('renders the component', () => {
    const wrapper = mount(TestPlanListView)
    expect(wrapper.exists()).toBe(true)
  })
})
