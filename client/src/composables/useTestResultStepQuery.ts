import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { TestplansApi, TestResultStepStatusEnum, type TestResultStep } from '@/services'
import useApi from './useApi'

const useTestResultStepQuery = (testPlanId: number, testCaseId: number, testResultId?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  // Query for test result steps under a test result
  const { data: testResultSteps, isFetching: isFetchingTestResultSteps } = useQuery({
    queryKey: ['testresultsteps', testPlanId, testCaseId, testResultId],
    queryFn: async (): Promise<TestResultStep[]> => {
      if (!testResultId) return []
      return await testplansApi.listTestplansTestcasesTestresultsTestresultsteps({
        testPlanId,
        testCaseId,
        testResultId,
      })
    },
    staleTime: Infinity, // Keep the old data while staying on the page
    refetchOnMount: 'always', // Refetch the data when navigating to the page
    enabled: !!(testPlanId && testCaseId && testResultId),
  })

  // Mutation for creating test result steps (bulk create/replace)
  const { mutate: mutateOnCreateTestResultSteps, isPending: isCreatingTestResultSteps } =
    useMutation({
      mutationFn: async (payload: {
        testResultId: number
        steps: Array<{
          step?: number
          order: number
          action?: string
          expected_result?: string
          status?: TestResultStepStatusEnum
          comment?: string
        }>
      }) => {
        return await testplansApi.createTestplansTestcasesTestresultsTestresultsteps({
          testPlanId: testPlanId,
          testCaseId: testCaseId,
          testResultId: payload.testResultId,
          createTestplansTestcasesTestresultsTestresultstepsRequestInner: payload.steps,
        })
      },
      onSuccess: (_, variables) => {
        // Invalidate and refetch test result steps for the specific test result
        queryClient.invalidateQueries({
          queryKey: ['testresultsteps', testPlanId, testCaseId, variables.testResultId],
          exact: true,
        })

        // Also invalidate test results as the steps might affect the overall result
        queryClient.invalidateQueries({
          queryKey: ['testresults', testPlanId],
          exact: false,
        })

        // Invalidate test cases as the latest result might change
        queryClient.invalidateQueries({
          queryKey: ['testcases', testPlanId],
          exact: false,
        })
      },
    })

  return {
    testResultSteps,
    isFetchingTestResultSteps,
    mutateOnCreateTestResultSteps,
    isCreatingTestResultSteps,
  }
}

export default useTestResultStepQuery
