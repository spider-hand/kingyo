import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { ListTestplansStatusEnum, TestplansApi } from '@/services'
import useApi from './useApi'
import { ref, type Ref } from 'vue'

const useTestPlanQuery = (
  page: Ref<number>,
  title: Ref<string>,
  status: Ref<ListTestplansStatusEnum | 'all'>,
) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)

  const count = ref(0)

  const { data: testPlans } = useQuery({
    queryKey: ['testplans', page, title, status],
    queryFn: async () => {
      const response = await testplansApi.listTestplans({
        page: page.value,
        name: title.value !== '' ? title.value : undefined,
        status: status.value === 'all' ? undefined : status.value,
      })

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
