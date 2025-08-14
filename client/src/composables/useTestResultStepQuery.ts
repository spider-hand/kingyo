import { useQuery } from '@tanstack/vue-query'
import { TestplansApi, type TestResultStep } from '@/services'
import useApi from './useApi'

const useTestResultStepQuery = (testPlanId: number, testCaseId: number, testResultId: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)

  // Query for test result steps under a test result
  const { data: testResultSteps, isFetching: isFetchingTestResultSteps } = useQuery({
    queryKey: ['testresultsteps', testPlanId, testCaseId, testResultId],
    queryFn: async (): Promise<TestResultStep[]> => {
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

  return {
    testResultSteps,
    isFetchingTestResultSteps,
  }
}

export default useTestResultStepQuery
