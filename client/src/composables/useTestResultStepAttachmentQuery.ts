import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { TestplansApi, type TestResultStepAttachment } from '@/services'
import useApi from './useApi'

const useTestResultStepAttachmentQuery = (
  testPlanId: number,
  testCaseId?: number,
  testResultId?: number,
) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  // Query for test result step attachments under a test result
  const { data: testResultStepAttachments, isFetching: isFetchingTestResultStepAttachments } =
    useQuery({
      queryKey: ['testresultstepattachments', testPlanId, testCaseId, testResultId],
      queryFn: async (): Promise<TestResultStepAttachment[]> => {
        return await testplansApi.listTestplansTestcasesTestresultsTestresultstepattachments({
          testPlanId: testPlanId!,
          testCaseId: testCaseId!,
          testResultId: testResultId!,
        })
      },
      staleTime: Infinity, // Keep the old data while staying on the page
      refetchOnMount: 'always', // Refetch the data when navigating to the page
      enabled: !!(testPlanId && testCaseId && testResultId),
    })

  const {
    mutate: mutateOnCreateTestResultStepAttachments,
    isPending: isCreatingTestResultStepAttachments,
  } = useMutation({
    mutationFn: async (payload: {
      testCaseId: number
      testResultId: number
      attachments: Array<{ result_step: number; file: File }>
    }) => {
      const formData = new FormData()

      payload.attachments.forEach((attachment, index) => {
        formData.append(`${index}_result_step`, String(attachment.result_step))
        formData.append(`${index}_file`, attachment.file)
      })

      // Manually call fetch because OpenAPI generator doesn't support array of files in multipart/form-data
      const url = `${apiConfig.basePath}/api/v1/testplans/${testPlanId}/testcases/${payload.testCaseId}/testresults/${payload.testResultId}/testresultstepattachments/`
      const response = await apiConfig.fetchApi!(url, {
        method: 'POST',
        body: formData,
        // Browsers will automatically set the correct Content-Type
      })
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['testresultstepattachments', testPlanId, testCaseId, testResultId],
      })
    },
  })

  return {
    testResultStepAttachments,
    isFetchingTestResultStepAttachments,
    mutateOnCreateTestResultStepAttachments,
    isCreatingTestResultStepAttachments,
  }
}

export default useTestResultStepAttachmentQuery
