import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { TestplansApi, type TestStepAttachment } from '@/services'
import useApi from './useApi'

const useTestStepAttachmentQuery = (testPlanId: number, testCaseId?: number) => {
  const { apiConfig } = useApi()
  const testplansApi = new TestplansApi(apiConfig)
  const queryClient = useQueryClient()

  // Query for test step attachments under a test case
  const { data: testStepAttachments, isFetching: isFetchingTestStepAttachments } = useQuery({
    queryKey: ['teststepattachments', testPlanId, testCaseId],
    queryFn: async (): Promise<TestStepAttachment[]> => {
      return await testplansApi.listTestplansTestcasesTeststepattachments({
        testPlanId: testPlanId!,
        testCaseId: testCaseId!,
      })
    },
    staleTime: Infinity, // Keep the old data while staying on the page
    refetchOnMount: 'always', // Refetch the data when navigating to the page
    enabled: !!(testPlanId && testCaseId),
  })

  const { mutate: mutateOnCreateTestStepAttachments, isPending: isCreatingTestStepAttachments } =
    useMutation({
      mutationFn: async (payload: {
        testCaseId: number
        attachments: Array<{ step: number; file: File }>
      }) => {
        const formData = new FormData()

        payload.attachments.forEach((attachment, index) => {
          formData.append(`${index}_step`, String(attachment.step))
          formData.append(`${index}_file`, attachment.file)
        })

        // Manually call fetch because OpenAPI generator does't support array of files in multipart/form-data
        const url = `${apiConfig.basePath}/api/v1/testplans/${testPlanId}/testcases/${payload.testCaseId}/teststepattachments/`
        const response = await apiConfig.fetchApi!(url, {
          method: 'POST',
          body: formData,
          // Browsers will automatically set the correct Content-Type
        })
        return await response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['teststepattachments', testPlanId, testCaseId],
        })
      },
    })

  return {
    testStepAttachments,
    isFetchingTestStepAttachments,
    mutateOnCreateTestStepAttachments,
    isCreatingTestStepAttachments,
  }
}

export default useTestStepAttachmentQuery
