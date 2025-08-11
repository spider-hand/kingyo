import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { ListTestplansStatusEnum, TestplansApi, type TestPlan } from '@/services'
import useApi from './useApi'
import { ref } from 'vue'

const useTestPlanQuery = (id?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  const page = ref(1)
  const title = ref('')
  const status = ref<ListTestplansStatusEnum | 'all'>('all')
  const count = ref(0)

  const { data: testPlans } = useQuery({
    queryKey: ['testplans', page, title, status],
    queryFn: async () => {
      const response = await testplansApi.listTestplans({
        page: page.value,
        name: title.value !== '' ? title.value : undefined,
        status: status.value === 'all' ? undefined : status.value,
      })
      return response
    },
    select: (response) => {
      count.value = response.count
      return response.results
    },
    placeholderData: keepPreviousData, // Keep the previous data while the new data is being fetched
    staleTime: Infinity, // Keep the old data while staying on the page
    refetchOnMount: 'always', // Refetch the data when navigating to the page
  })

  const { data: testPlan, isFetching: isFetchingTestPlan } = useQuery({
    queryKey: ['testplan', id],
    queryFn: async () => {
      return await testplansApi.retrieveTestplans({ id: id! })
    },
    enabled: !!id,
  })

  const { mutate: mutateOnCreateTestPlan } = useMutation({
    mutationFn: async (payload: { name: string }) => {
      return await testplansApi.createTestplans({
        testPlanCreate: {
          name: payload.name,
        },
      })
    },
    onSuccess: () => {
      // Refresh the queries for all conditions
      queryClient.invalidateQueries({
        queryKey: ['testplans'],
        exact: false,
      })
    },
  })

  const { mutate: mutateOnUpdateTestPlan } = useMutation({
    mutationFn: async (payload: { id: number; name: string; status: ListTestplansStatusEnum }) => {
      return await testplansApi.partialUpdateTestplans({
        id: payload.id,
        patchedTestPlan: {
          name: payload.name,
          status: payload.status,
        },
      })
    },
    onSuccess: () => {
      // Refresh the queries for all conditions
      queryClient.invalidateQueries({
        queryKey: ['testplans'],
        exact: false,
      })
      // Assign the updated test plan to the specific query
      queryClient.setQueryData(['testplan', id], (oldData: TestPlan) => {
        return {
          ...oldData,
          name: title.value,
          status: status.value,
        }
      })
    },
  })

  const { mutate: mutateOnDeleteTestPlan } = useMutation({
    mutationFn: async (id: number) => {
      return await testplansApi.destroyTestplans({ id })
    },
    onSuccess: () => {
      // Refresh the queries for all conditions
      queryClient.invalidateQueries({
        queryKey: ['testplans'],
        exact: false,
      })

      // Remove the specific test plan from the cache
      queryClient.removeQueries({
        queryKey: ['testplan', id],
        exact: true,
      })
    },
  })

  return {
    testPlans,
    page,
    title,
    status,
    count,
    mutateOnCreateTestPlan,
    testPlan,
    isFetchingTestPlan,
    mutateOnUpdateTestPlan,
    mutateOnDeleteTestPlan,
  }
}

export default useTestPlanQuery
