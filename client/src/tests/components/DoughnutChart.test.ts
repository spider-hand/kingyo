import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DoughnutChart from '@/components/DoughnutChart.vue'

describe('DoughnutChart', () => {
  it('renders canvas element with chart data', () => {
    const chartData = [
      { label: 'Passed', value: 10, color: '#22c55e' },
      { label: 'Failed', value: 5, color: '#ef4444' }
    ]
    
    const wrapper = mount(DoughnutChart, {
      props: {
        data: chartData,
        size: 300
      }
    })

    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
