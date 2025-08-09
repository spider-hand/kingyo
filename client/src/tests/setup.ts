import { beforeEach } from 'vitest'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { config } from '@vue/test-utils'

beforeEach(() => {
  const queryClient = new QueryClient()

  config.global.plugins = [[VueQueryPlugin, { queryClient }]]
})
