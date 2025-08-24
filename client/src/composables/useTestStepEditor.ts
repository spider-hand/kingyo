import { nextTick, ref } from 'vue'
import type { TestCaseStatusEnum, TestStep } from '@/services'
import type { AcceptableValue } from 'reka-ui'

export const useTestStepEditor = () => {
  const testCaseTitle = ref('New Test Case')
  const testCaseDescription = ref('')
  const testCaseStatus = ref<TestCaseStatusEnum>('design')

  const selectedStepIndex = ref<number | null>(null)
  const testSteps = ref<Omit<TestStep, 'id' | '_case' | 'order'>[]>([
    {
      action: '',
      expectedResult: '',
    },
  ])
  const testStepsAttachments = ref<File[][]>([[]])

  const showFileUploadDialog = ref(false)

  const onTestCaseStatusChange = (status: AcceptableValue) => {
    testCaseStatus.value = status as TestCaseStatusEnum
  }

  const selectStep = async (index: number) => {
    selectedStepIndex.value = index

    // Focus on the textarea after it's rendered
    await nextTick()
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  }

  const onFocusOutTableRow = (event: FocusEvent) => {
    // Check if the new focus target is still within the same row
    const currentRow = event.currentTarget as HTMLElement
    const newFocusTarget = event.relatedTarget as HTMLElement

    if (!newFocusTarget || !currentRow.contains(newFocusTarget)) {
      selectedStepIndex.value = null
    }
  }

  const insertStep = (index: number) => {
    testSteps.value.splice(index + 1, 0, {
      action: '',
      expectedResult: '',
    })
    testStepsAttachments.value.splice(index + 1, 0, [])
  }

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const step = testSteps.value.splice(index, 1)[0]
      const attachments = testStepsAttachments.value.splice(index, 1)[0]
      testSteps.value.splice(index - 1, 0, step)
      testStepsAttachments.value.splice(index - 1, 0, attachments)

      // Update selected index if the selected step was moved
      if (selectedStepIndex.value === index) {
        selectedStepIndex.value = index - 1
      } else if (selectedStepIndex.value === index - 1) {
        selectedStepIndex.value = index
      }
    }
  }

  const moveStepDown = (index: number) => {
    if (index < testSteps.value.length - 1) {
      const step = testSteps.value.splice(index, 1)[0]
      const attachments = testStepsAttachments.value.splice(index, 1)[0]
      testSteps.value.splice(index + 1, 0, step)
      testStepsAttachments.value.splice(index + 1, 0, attachments)

      // Update selected index if the selected step was moved
      if (selectedStepIndex.value === index) {
        selectedStepIndex.value = index + 1
      } else if (selectedStepIndex.value === index + 1) {
        selectedStepIndex.value = index
      }
    }
  }

  const deleteStep = (index: number) => {
    if (testSteps.value.length > 1) {
      testSteps.value.splice(index, 1)
      testStepsAttachments.value.splice(index, 1)

      // Update selected index if necessary
      if (selectedStepIndex.value === index) {
        selectedStepIndex.value = null
      } else if (selectedStepIndex.value && selectedStepIndex.value > index) {
        selectedStepIndex.value = selectedStepIndex.value - 1
      }
    }
  }

  const openFileUploadDialog = (index: number) => {
    selectedStepIndex.value = index
    showFileUploadDialog.value = true
  }

  const uploadFiles = (files: File[]) => {
    if (selectedStepIndex.value !== null) {
      if (testStepsAttachments.value[selectedStepIndex.value] === undefined) {
        testStepsAttachments.value[selectedStepIndex.value] = [...files]
      } else {
        testStepsAttachments.value[selectedStepIndex.value].push(...files)
      }
    }
    selectedStepIndex.value = null
  }

  const removeAttachment = (stepIndex: number, attachmentIndex: number) => {
    if (testStepsAttachments.value[stepIndex]) {
      testStepsAttachments.value[stepIndex].splice(attachmentIndex, 1)
    }
  }

  return {
    testCaseTitle,
    testCaseDescription,
    testCaseStatus,
    selectedStepIndex,
    testSteps,
    testStepsAttachments,
    showFileUploadDialog,
    onTestCaseStatusChange,
    selectStep,
    onFocusOutTableRow,
    insertStep,
    moveStepUp,
    moveStepDown,
    deleteStep,
    openFileUploadDialog,
    uploadFiles,
    removeAttachment,
  }
}

export default useTestStepEditor
