import { useQuery } from '@tanstack/vue-query'
import { TestplansApi, type TestStep } from '@/services'
import useApi from './useApi'

const useTestStepQuery = (testPlanId: number, testCaseId: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)

  // Query for test steps under a test case
  const { data: testSteps, isFetching: isFetchingTestSteps } = useQuery({
    queryKey: ['teststeps', testPlanId, testCaseId],
    queryFn: async (): Promise<TestStep[]> => {
      return await testplansApi.listTestplansTestcasesTeststeps({
        testPlanId,
        testCaseId,
      })
    },
    staleTime: Infinity, // Keep the old data while staying on the page
    refetchOnMount: 'always', // Refetch the data when navigating to the page
    enabled: !!(testPlanId && testCaseId),
  })

  return {
    testSteps,
    isFetchingTestSteps,
  }
}

export default useTestStepQuery
