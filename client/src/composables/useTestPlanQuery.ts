import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { ListTestplansStatusEnum, TestplansApi, type TestPlan } from '@/services'
import useApi from './useApi'
import { ref, type MaybeRefOrGetter, toValue } from 'vue'

const useTestPlanQuery = (id?: MaybeRefOrGetter<number | undefined>) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  const page = ref(1)
  const title = ref('')
  const status = ref<ListTestplansStatusEnum | 'all'>('all')
  const count = ref(0)

  const { data: testPlans, isFetching: isFetchingTestPlans } = useQuery({
    queryKey: ['testplans', page, title, status],
    queryFn: async () => {
      const response = await testplansApi.listTestplans({
        page: page.value,
        title: title.value !== '' ? title.value : undefined,
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
    queryKey: ['testplan', () => toValue(id)],
    queryFn: async () => {
      const idValue = toValue(id)
      return await testplansApi.retrieveTestplans({ id: idValue! })
    },
    enabled: () => !!toValue(id),
  })

  const { mutate: mutateOnCreateTestPlan } = useMutation({
    mutationFn: async (payload: { title: string }) => {
      return await testplansApi.createTestplans({
        testPlanCreate: {
          title: payload.title,
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

  const { mutate: mutateOnUpdateTestPlan, isPending: isUpdatingTestPlan } = useMutation({
    mutationFn: async (payload: { id: number; title: string; status: ListTestplansStatusEnum }) => {
      return await testplansApi.partialUpdateTestplans({
        id: payload.id,
        patchedTestPlan: {
          title: payload.title,
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
      const currentId = toValue(id)
      if (currentId) {
        queryClient.setQueryData(['testplan', currentId], (oldData: TestPlan) => {
          return {
            ...oldData,
            title: title.value,
            status: status.value,
          }
        })
      }
    },
  })

  const { mutate: mutateOnDeleteTestPlan, isPending: isDeletingTestPlan } = useMutation({
    mutationFn: async (deleteId: number) => {
      return await testplansApi.destroyTestplans({ id: deleteId })
    },
    onSuccess: (_, deleteId) => {
      // Refresh the queries for all conditions
      queryClient.invalidateQueries({
        queryKey: ['testplans'],
        exact: false,
      })

      // Remove the specific test plan from the cache
      queryClient.removeQueries({
        queryKey: ['testplan', deleteId],
        exact: true,
      })
    },
  })

  return {
    testPlans,
    testPlan,
    page,
    title,
    status,
    count,
    isFetchingTestPlan,
    isFetchingTestPlans,
    isUpdatingTestPlan,
    isDeletingTestPlan,
    mutateOnCreateTestPlan,
    mutateOnUpdateTestPlan,
    mutateOnDeleteTestPlan,
  }
}

export default useTestPlanQuery
