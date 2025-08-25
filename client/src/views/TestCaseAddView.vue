<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-end w-full">
      <Button @click="saveTestCase"
        :disabled="isCreatingTestCase || isCreatingTestSteps || isCreatingTestStepAttachments">
        <LoaderCircle v-if="isCreatingTestCase || isCreatingTestSteps || isCreatingTestStepAttachments"
          class="animate-spin" />
        <Save v-else />
        Save Changes
      </Button>
    </div>
    <div class="flex flex-row items-end gap-4 w-full">
      <div class="flex flex-col w-full gap-1">
        <label class="text-xs text-muted-foreground">Title</label>
        <Input v-model="testCaseTitle" placeholder="Test Case Title" max="100" />
      </div>
      <SelectWrapperComponent label="Status">
        <Select :default-value="testCaseStatus" @update:model-value="onTestCaseStatusChange">
          <SelectTrigger class="w-[180px] mr-2">
            <SelectValue placeholder="Status"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="status in TEST_CASE_STATUS_OPTIONS" :key="status.value" :value="status.value">
                {{ status.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SelectWrapperComponent>
    </div>
    <div class="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Steps
            </TableHead>
            <TableHead>Action</TableHead>
            <TableHead>
              Expected Result
            </TableHead>
            <TableHead class="text-right">
              Attachments
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="(step, index) in testSteps" :key="index">
            <ContextMenu>
              <ContextMenuTrigger as-child>
                <TableRow v-if="selectedStepIndex !== index" class="cursor-pointer" @click="selectStep(index)">
                  <TableCell>
                    {{ index + 1 }}
                  </TableCell>
                  <TableCell class="whitespace-pre-line align-top">
                    {{ step.action }}
                  </TableCell>
                  <TableCell class="whitespace-pre-line align-top">
                    {{ step.expectedResult }}
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" @click.stop="openFileUploadDialog(index)">
                      <Paperclip class="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-else @focusout="onFocusOutTableRow">
                  <TableCell>
                    {{ index + 1 }}
                  </TableCell>
                  <TableCell>
                    <Textarea v-model="step.action" class="w-full" placeholder="Action" />
                  </TableCell>
                  <TableCell>
                    <Textarea v-model="step.expectedResult" class="w-full" placeholder="Expected Result" />
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" @click="openFileUploadDialog(index)">
                      <Paperclip class="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem @click="insertStep(index)">
                  <CornerDownRight class="size-4" />
                  Insert step
                </ContextMenuItem>
                <ContextMenuItem @click="moveStepUp(index)">
                  <MoveUp class="size-4" />
                  Move current step up
                </ContextMenuItem>
                <ContextMenuItem @click="moveStepDown(index)">
                  <MoveDown class="size-4" />
                  Move current step down
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem class="text-red-600" @click="deleteStep(index)" :disabled="testSteps.length <= 1">
                  <Trash class="size-4 text-red-600" />
                  Delete step
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <TableRow v-if="testStepsAttachments[index]?.attachments?.length">
              <TableCell colspan="4" class="py-2">
                <div class="flex flex-wrap gap-2">
                  <div v-for="(attachment, attachmentIndex) in testStepsAttachments[index].attachments"
                    :key="attachmentIndex" class="flex items-center gap-2 p-2 bg-muted rounded border">
                    <Paperclip class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm truncate max-w-48">{{ attachment.name }}</span>
                    <span class="text-xs text-muted-foreground">
                      ({{ (attachment.size / 1024).toFixed(1) }}KB)
                    </span>
                    <Button variant="ghost" size="sm" @click="removeAttachment(index, attachmentIndex)"
                      class="h-6 w-6 p-0 text-muted-foreground hover:text-red-600">
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
    <FileUploadDialog :open="showFileUploadDialog" :step-number="selectedStepIndex! + 1"
      @open="showFileUploadDialog = $event" @upload-files="uploadFiles" />
  </div>
</template>

<script setup lang="ts">
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue';
import FileUploadDialog from '@/components/FileUploadDialog.vue';
import Input from '@/components/ui/input/Input.vue';
import Button from '@/components/ui/button/Button.vue';
import ContextMenu from '@/components/ui/context-menu/ContextMenu.vue';
import ContextMenuContent from '@/components/ui/context-menu/ContextMenuContent.vue';
import ContextMenuItem from '@/components/ui/context-menu/ContextMenuItem.vue';
import ContextMenuSeparator from '@/components/ui/context-menu/ContextMenuSeparator.vue';
import ContextMenuTrigger from '@/components/ui/context-menu/ContextMenuTrigger.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import Table from '@/components/ui/table/Table.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import { Textarea } from '@/components/ui/textarea';
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestStepQuery from '@/composables/useTestStepQuery';
import useTestStepAttachmentQuery from '@/composables/useTestStepAttachmentQuery';
import useTestStepEditor from '@/composables/useTestStepEditor';
import { TEST_CASE_STATUS_OPTIONS } from '@/consts';
import { CornerDownRight, LoaderCircle, MoveDown, MoveUp, Paperclip, Save, Trash, X } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const testPlanId = Number(route.params.testPlanId);
const { mutateAsyncOnCreateTestCase, isCreatingTestCase } = useTestCaseQuery(testPlanId)
const { mutateAsyncOnCreateTestSteps, isCreatingTestSteps } = useTestStepQuery(testPlanId)
const { mutateOnCreateTestStepAttachments, isCreatingTestStepAttachments } = useTestStepAttachmentQuery(testPlanId)

const {
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
  removeAttachment
} = useTestStepEditor()

const saveTestCase = async () => {
  try {
    const testCase = await mutateAsyncOnCreateTestCase({
      title: testCaseTitle.value,
      description: testCaseDescription.value,
      status: testCaseStatus.value,
    })

    if (testSteps.value.length > 0) {
      await mutateAsyncOnCreateTestSteps({
        testCaseId: testCase.id,
        steps: testSteps.value.map((step, index) => ({
          action: step.action ?? '',
          expectedResult: step.expectedResult ?? '',
          order: index + 1,
        }))
      });

      const attachmentsToCreate = [];
      for (const testStepAttachmentData of testStepsAttachments.value) {
        if (testStepAttachmentData?.attachments?.length > 0) {
          for (const attachment of testStepAttachmentData.attachments) {
            attachmentsToCreate.push({
              step: testStepAttachmentData.step,
              file: attachment,
            });
          }
        }
      }

      if (attachmentsToCreate.length > 0) {
        mutateOnCreateTestStepAttachments({
          testCaseId: testCase.id,
          attachments: attachmentsToCreate
        });
      }
    }

    router.push({
      name: 'test-case-list',
      params: { testPlanId },
      replace: true
    });
  } catch (error) {
    console.error('Error saving test case:', error);
  }
}
</script>
