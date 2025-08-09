import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { TestplansApi } from '@/services'
import useApi from './useApi'
import { ref, type Ref } from 'vue'

const useTestPlanQuery = (page: Ref<number>) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)

  const count = ref(0)

  const { data: testPlans } = useQuery({
    queryKey: ['testplans', page],
    queryFn: async () => {
      const response = await testplansApi.listTestplans({ page: page.value })

      count.value = response.count

      return response.results
    },
    placeholderData: keepPreviousData,
  })

  return {
    testPlans,
    count,
  }
}

export default useTestPlanQuery
