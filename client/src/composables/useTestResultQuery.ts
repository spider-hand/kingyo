import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  TestplansApi,
  type TestResultCreate,
  type PatchedTestResult,
  type ResultEnum,
  type BrowserEnum,
  type OsEnum,
  ListTestplansTestcasesLatestResultEnum,
} from '@/services'
import useApi from './useApi'
import { ref } from 'vue'

const useTestResultQuery = (testPlanId: number, testCaseId?: number, testResultId?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  const page = ref(1)
  const count = ref(0)
  const title = ref('')
  const result = ref<ListTestplansTestcasesLatestResultEnum | 'all'>('all')
  const tester = ref('all')
  const configuration = ref('all')

  // Query for test results under a test plan
  const { data: testResults, isFetching: isFetchingTestResults } = useQuery({
    queryKey: ['testresults', testPlanId, page, title, result, tester, configuration],
    queryFn: async () => {
      const response = await testplansApi.listTestplansTestresults({
        testPlanId,
        page: page.value,
        _case: title.value !== '' ? title.value : undefined,
        result: result.value === 'all' ? undefined : result.value,
        tester: tester.value === 'all' ? undefined : tester.value,
        _configuration: configuration.value === 'all' ? undefined : configuration.value,
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

  // Query for a specific test result
  const { data: testResult, isFetching: isFetchingTestResult } = useQuery({
    queryKey: ['testresult', testPlanId, testCaseId, testResultId],
    queryFn: async () => {
      return await testplansApi.retrieveTestplansTestcasesTestresults({
        testPlanId,
        testCaseId: testCaseId!,
        id: testResultId!,
      })
    },
    enabled: !!(testPlanId && testCaseId && testResultId),
  })

  // Mutation for creating a new test result
  const {
    mutate: mutateOnCreateTestResult,
    mutateAsync: mutateOnCreateTestResultAsync,
    isPending: isCreatingTestResult,
  } = useMutation({
    mutationFn: async (payload: {
      testCaseId: number
      testerId: number
      result: ResultEnum
      browser: BrowserEnum
      os: OsEnum
    }) => {
      return await testplansApi.createTestplansTestcasesTestresults({
        testPlanId,
        testCaseId: payload.testCaseId,
        testResultCreate: {
          _case: payload.testCaseId,
          tester: payload.testerId,
          result: payload.result,
          browser: payload.browser,
          os: payload.os,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['testresults', testPlanId],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })
    },
  })

  const { mutate: mutateOnUpdateTestResult, isPending: isUpdatingTestResult } = useMutation({
    mutationFn: async (payload: {
      id: number
      testCaseId: number
      result?: ResultEnum
      comment?: string
    }) => {
      return await testplansApi.partialUpdateTestplansTestcasesTestresults({
        testPlanId,
        testCaseId: payload.testCaseId,
        id: payload.id,
        patchedTestResult: {
          result: payload.result,
          comment: payload.comment,
        } as PatchedTestResult,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testresults', testPlanId],
        exact: false,
      })
      queryClient.setQueryData(['testresult', testPlanId, variables.testCaseId, variables.id], data)
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })
    },
  })

  const { mutate: mutateOnDeleteTestResult, isPending: isDeletingTestResult } = useMutation({
    mutationFn: async (payload: { id: number; testCaseId: number }) => {
      return await testplansApi.destroyTestplansTestcasesTestresults({
        testPlanId,
        testCaseId: payload.testCaseId,
        id: payload.id,
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testresults', testPlanId],
        exact: false,
      })

      queryClient.removeQueries({
        queryKey: ['testresult', testPlanId, variables.testCaseId, variables.id],
        exact: true,
      })
      queryClient.invalidateQueries({
        queryKey: ['testcases', testPlanId],
        exact: false,
      })
    },
  })

  return {
    testResults,
    testResult,
    count,
    page,
    title,
    result,
    tester,
    configuration,
    isFetchingTestResults,
    isFetchingTestResult,
    isCreatingTestResult,
    isUpdatingTestResult,
    isDeletingTestResult,
    mutateOnCreateTestResult,
    mutateOnCreateTestResultAsync,
    mutateOnUpdateTestResult,
    mutateOnDeleteTestResult,
  }
}

export default useTestResultQuery
