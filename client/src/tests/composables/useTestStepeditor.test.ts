import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import useTestStepEditor from '@/composables/useTestStepEditor'
import type { TestCaseStatusEnum } from '@/services'

// Mock DOM methods
Object.defineProperty(document, 'querySelector', {
  value: vi.fn(),
  writable: true,
})

describe('useTestStepEditor', () => {
  let composable: ReturnType<typeof useTestStepEditor>

  beforeEach(() => {
    vi.clearAllMocks()

    composable = useTestStepEditor()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with correct default values', () => {
    expect(composable.testCaseTitle.value).toBe('New Test Case')
    expect(composable.testCaseDescription.value).toBe('')
    expect(composable.testCaseStatus.value).toBe('design')
    expect(composable.selectedStepIndex.value).toBeNull()
    expect(composable.showFileUploadDialog.value).toBe(false)
    expect(composable.testSteps.value).toHaveLength(1)
    expect(composable.testSteps.value[0]).toEqual({
      action: '',
      expectedResult: '',
    })
    expect(composable.testStepsAttachments.value).toHaveLength(1)
    expect(composable.testStepsAttachments.value[0]).toEqual({
      step: 1,
      attachments: [],
    })
  })

  it('should update test case status', () => {
    const newStatus: TestCaseStatusEnum = 'ready'
    composable.onTestCaseStatusChange(newStatus)
    expect(composable.testCaseStatus.value).toBe(newStatus)
  })

  it('should set selected step index', async () => {
    await composable.selectStep(0)
    expect(composable.selectedStepIndex.value).toBe(0)
  })

  it('should focus on textarea after step selection', async () => {
    const mockTextarea = { focus: vi.fn() }
    vi.mocked(document.querySelector).mockReturnValue(mockTextarea as any)

    await composable.selectStep(0)
    await nextTick()

    expect(document.querySelector).toHaveBeenCalledWith('textarea')
    expect(mockTextarea.focus).toHaveBeenCalled()
  })

  it('should clear selected step when focus moves outside row', () => {
    composable.selectedStepIndex.value = 0

    const mockEvent = {
      currentTarget: document.createElement('div'),
      relatedTarget: document.createElement('div'),
    } as unknown as FocusEvent

    composable.onFocusOutTableRow(mockEvent)
    expect(composable.selectedStepIndex.value).toBeNull()
  })

  it('should not clear selected step when focus stays within row', () => {
    composable.selectedStepIndex.value = 0

    const currentRow = document.createElement('div')
    const relatedTarget = document.createElement('input')
    currentRow.appendChild(relatedTarget)

    const mockEvent = {
      currentTarget: currentRow,
      relatedTarget: relatedTarget,
    } as unknown as FocusEvent

    vi.spyOn(currentRow, 'contains').mockReturnValue(true)

    composable.onFocusOutTableRow(mockEvent)
    expect(composable.selectedStepIndex.value).toBe(0)
  })

  it('should not clear selected step when file upload dialog is open', () => {
    composable.selectedStepIndex.value = 0
    composable.showFileUploadDialog.value = true

    const mockEvent = {
      currentTarget: document.createElement('div'),
      relatedTarget: document.createElement('div'),
    } as unknown as FocusEvent

    composable.onFocusOutTableRow(mockEvent)
    expect(composable.selectedStepIndex.value).toBe(0)
  })

  it('should insert a new step at the specified index', () => {
    composable.insertStep(0)

    expect(composable.testSteps.value).toHaveLength(2)
    expect(composable.testSteps.value[1]).toEqual({
      action: '',
      expectedResult: '',
    })
  })

  it('should insert attachments for the new step', () => {
    composable.insertStep(0)

    expect(composable.testStepsAttachments.value).toHaveLength(2)
    expect(composable.testStepsAttachments.value[1]).toEqual({
      step: 2,
      attachments: [],
    })
  })

  it('should update step numbers for attachments after insertion', () => {
    // Add another step first
    composable.insertStep(0)
    // Insert another step at index 0
    composable.insertStep(0)

    expect(composable.testStepsAttachments.value).toHaveLength(3)
    expect(composable.testStepsAttachments.value[0].step).toBe(1)
    expect(composable.testStepsAttachments.value[1].step).toBe(2)
    expect(composable.testStepsAttachments.value[2].step).toBe(3)
  })

  it('should move step up when not at first position', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    const originalStep = { ...composable.testSteps.value[1] }
    composable.moveStepUp(1)

    expect(composable.testSteps.value[0]).toEqual(originalStep)
    expect(composable.testStepsAttachments.value[0].step).toBe(1)
    expect(composable.testStepsAttachments.value[1].step).toBe(2)
  })

  it('should not move step up when at first position', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    const originalSteps = [...composable.testSteps.value]
    composable.moveStepUp(0)

    expect(composable.testSteps.value).toEqual(originalSteps)
  })

  it('should update selected index when moving selected step up', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 1
    composable.moveStepUp(1)

    expect(composable.selectedStepIndex.value).toBe(0)
  })

  it('should update selected index when moving step up past selected step', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 0
    composable.moveStepUp(1)

    expect(composable.selectedStepIndex.value).toBe(1)
  })

  it('should move step down when not at last position', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    const originalStep = { ...composable.testSteps.value[0] }
    composable.moveStepDown(0)

    expect(composable.testSteps.value[1]).toEqual(originalStep)
    expect(composable.testStepsAttachments.value[0].step).toBe(1)
    expect(composable.testStepsAttachments.value[1].step).toBe(2)
  })

  it('should not move step down when at last position', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    const lastIndex = composable.testSteps.value.length - 1
    const originalSteps = [...composable.testSteps.value]
    composable.moveStepDown(lastIndex)

    expect(composable.testSteps.value).toEqual(originalSteps)
  })

  it('should update selected index when moving selected step down', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 0
    composable.moveStepDown(0)

    expect(composable.selectedStepIndex.value).toBe(1)
  })

  it('should update selected index when moving step down past selected step', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 1
    composable.moveStepDown(0)

    expect(composable.selectedStepIndex.value).toBe(0)
  })

  it('should delete step when there are multiple steps', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    const initialLength = composable.testSteps.value.length
    composable.deleteStep(1)

    expect(composable.testSteps.value).toHaveLength(initialLength - 1)
    expect(composable.testStepsAttachments.value).toHaveLength(initialLength - 1)
    expect(composable.testStepsAttachments.value[0].step).toBe(1)
    expect(composable.testStepsAttachments.value[1].step).toBe(2)
  })

  it('should not delete step when only one step remains', () => {
    composable.deleteStep(0)

    expect(composable.testSteps.value).toHaveLength(1)
  })

  it('should clear selected index when deleting selected step', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 1
    composable.deleteStep(1)

    expect(composable.selectedStepIndex.value).toBeNull()
  })

  it('should update selected index when deleting step before selected step', () => {
    composable.insertStep(0)
    composable.insertStep(1)
    composable.selectedStepIndex.value = 2
    composable.deleteStep(0)

    expect(composable.selectedStepIndex.value).toBe(1)
  })

  it('should set selected step index and open dialog', () => {
    composable.openFileUploadDialog(0)

    expect(composable.selectedStepIndex.value).toBe(0)
    expect(composable.showFileUploadDialog.value).toBe(true)
  })

  it('should add files to the selected step attachments', () => {
    composable.selectedStepIndex.value = 0
    const mockFiles = [
      new File(['content'], 'test1.txt', { type: 'text/plain' }),
      new File(['content'], 'test2.txt', { type: 'text/plain' }),
    ]

    composable.uploadFiles(mockFiles)

    expect(composable.testStepsAttachments.value[0].attachments).toEqual(mockFiles)
    expect(composable.selectedStepIndex.value).toBeNull()
  })

  it('should append files to existing attachments', () => {
    composable.selectedStepIndex.value = 0
    const existingFile = new File(['existing'], 'existing.txt', { type: 'text/plain' })
    composable.testStepsAttachments.value[0].attachments = [existingFile]

    const newFiles = [new File(['new'], 'new.txt', { type: 'text/plain' })]

    composable.uploadFiles(newFiles)

    expect(composable.testStepsAttachments.value[0].attachments).toHaveLength(2)
    expect(composable.testStepsAttachments.value[0].attachments[0]).toBe(existingFile)
    expect(composable.testStepsAttachments.value[0].attachments[1]).toBe(newFiles[0])
    expect(composable.selectedStepIndex.value).toBeNull()
  })

  it('should handle no selected step gracefully', () => {
    composable.selectedStepIndex.value = null
    const mockFiles = [new File(['content'], 'test.txt', { type: 'text/plain' })]

    expect(() => composable.uploadFiles(mockFiles)).not.toThrow()
    expect(composable.selectedStepIndex.value).toBeNull()
  })

  it('should remove attachment at specified index', () => {
    const mockFiles = [
      new File(['content1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      new File(['content3'], 'test3.txt', { type: 'text/plain' }),
    ]
    composable.testStepsAttachments.value[0].attachments = mockFiles
    composable.removeAttachment(0, 1)

    expect(composable.testStepsAttachments.value[0].attachments).toHaveLength(2)
    expect(composable.testStepsAttachments.value[0].attachments[0].name).toBe('test1.txt')
    expect(composable.testStepsAttachments.value[0].attachments[1].name).toBe('test3.txt')
  })
})
