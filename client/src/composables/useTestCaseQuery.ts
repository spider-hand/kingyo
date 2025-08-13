import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  TestplansApi,
  type TestCase,
  type TestCaseStatusEnum,
  type ListTestplansTestcasesStatusEnum,
  type ListTestplansTestcasesLatestResultEnum,
} from '@/services'
import useApi from './useApi'
import { ref } from 'vue'

const useTestCaseQuery = (testPlanId: number, testCaseId?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  const page = ref(1)
  const title = ref('')
  const status = ref<ListTestplansTestcasesStatusEnum | 'all'>('all')
  const latestResult = ref<ListTestplansTestcasesLatestResultEnum | 'all'>('all')
  const count = ref(0)

  const { data: testCases, isFetching: isFetchingTestCases } = useQuery({
    queryKey: ['testcases', testPlanId, page, title, status, latestResult],
    queryFn: async () => {
      const response = await testplansApi.listTestplansTestcases({
        testPlanId,
        page: page.value,
        title: title.value !== '' ? title.value : undefined,
        status: status.value === 'all' ? undefined : status.value,
        latestResult: latestResult.value === 'all' ? undefined : latestResult.value,
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
    enabled: !!testPlanId,
  })

  const { data: testCase, isFetching: isFetchingTestCase } = useQuery({
    queryKey: ['testcase', testPlanId, testCaseId],
    queryFn: async () => {
      return await testplansApi.retrieveTestplansTestcases({
        testPlanId,
        id: testCaseId!,
      })
    },
    enabled: !!(testPlanId && testCaseId),
  })

  const { mutate: mutateOnCreateTestCase } = useMutation({
    mutationFn: async (payload: {
      title: string
      description?: string
      status?: TestCaseStatusEnum
    }) => {
      return await testplansApi.createTestplansTestcases({
        testPlanId,
        testCase: {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          plan: testPlanId,
        } as Omit<TestCase, 'id' | 'created_at' | 'updated_at'>,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })
    },
  })

  const { mutate: mutateOnUpdateTestCase, isPending: isUpdatingTestCase } = useMutation({
    mutationFn: async (payload: {
      id: number
      title: string
      description?: string
      status?: TestCaseStatusEnum
      latestResult?: ListTestplansTestcasesLatestResultEnum
    }) => {
      return await testplansApi.partialUpdateTestplansTestcases({
        testPlanId,
        id: payload.id,
        patchedTestCase: {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          latestResult: payload.latestResult,
          plan: testPlanId,
        } as Omit<TestCase, 'id' | 'created_at' | 'updated_at'>,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })

      queryClient.setQueryData(['testcase', testPlanId, variables.id], data)
    },
  })

  const { mutate: mutateOnDeleteTestCase, isPending: isDeletingTestCase } = useMutation({
    mutationFn: async (id: number) => {
      return await testplansApi.destroyTestplansTestcases({ testPlanId, id })
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })

      queryClient.removeQueries({
        queryKey: ['testcase', testPlanId, deletedId],
        exact: true,
      })
    },
  })

  return {
    testCases,
    testCase,
    count,
    page,
    title,
    status,
    latestResult,
    isFetchingTestCases,
    isFetchingTestCase,
    isUpdatingTestCase,
    isDeletingTestCase,
    mutateOnCreateTestCase,
    mutateOnUpdateTestCase,
    mutateOnDeleteTestCase,
  }
}

export default useTestCaseQuery
