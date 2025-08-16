import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  TestplansApi,
  type TestStep,
  type CreateTestplansTestcasesTeststepsRequestInner,
} from '@/services'
import useApi from './useApi'

const useTestStepQuery = (testPlanId: number, testCaseId?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  // Query for test steps under a test case
  const { data: testSteps, isFetching: isFetchingTestSteps } = useQuery({
    queryKey: ['teststeps', testPlanId, testCaseId],
    queryFn: async (): Promise<TestStep[]> => {
      return await testplansApi.listTestplansTestcasesTeststeps({
        testPlanId: testPlanId!,
        testCaseId: testCaseId!,
      })
    },
    staleTime: Infinity, // Keep the old data while staying on the page
    refetchOnMount: 'always', // Refetch the data when navigating to the page
    enabled: !!(testPlanId && testCaseId),
  })

  const { mutate: mutateOnCreateTestSteps, isPending: isCreatingTestSteps } = useMutation({
    mutationFn: async (payload: {
      testCaseId: number
      steps: CreateTestplansTestcasesTeststepsRequestInner[]
    }) => {
      return await testplansApi.createTestplansTestcasesTeststeps({
        testPlanId,
        testCaseId: payload.testCaseId,
        createTestplansTestcasesTeststepsRequestInner: payload.steps,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teststeps', testPlanId, testCaseId],
      })
    },
  })

  return {
    testSteps,
    isFetchingTestSteps,
    mutateOnCreateTestSteps,
    isCreatingTestSteps,
  }
}

export default useTestStepQuery
