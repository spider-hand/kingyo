<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent :title="testCase?.title ?? ''" />
      <Button @click="saveTestResults">
        <LoaderCircle v-if="isCreatingTestResult || isCreatingTestResultSteps || isCreatingTestResultStepAttachments" class="mr-2 animate-spin" />
        <Save v-else class="mr-2" />
        Save
      </Button>
    </div>
    <div class="flex flex-row items-center w-full">
      <SelectWrapperComponent label="Configuration">
        <Select :default-value="configuration" @update:model-value="onConfigurationChange">
          <SelectTrigger class="w-[240px] mr-2">
            <SelectValue placeholder="Configuration"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="config in TEST_CASE_RESULT_CONFIGURATION_OPTIONS" :key="config.value"
                :value="config.value">
                {{ config.label }}
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
            <TableHead>
              Attachments
            </TableHead>
            <TableHead class="text-right">
            </TableHead>
            <TableHead class="text-right">
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="(step, index) in testSteps" :key="step.id">
            <ContextMenu>
              <ContextMenuTrigger as-child>
                <TableRow class="cursor-pointer" :data-step-id="step.id">
                  <TableCell>
                    {{ step.order }}
                  </TableCell>
                  <TableCell class="whitespace-pre-line align-top">
                    {{ step.action }}
                  </TableCell>
                  <TableCell class="whitespace-pre-line align-top">
                    {{ step.expectedResult }}
                  </TableCell>
                  <TableCell>
                    <ul v-if="attachmentsByStep[step.id]?.length">
                      <li v-for="attachment in attachmentsByStep[step.id]" :key="attachment.id">
                        <button 
                          class="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                          @click="downloadTestStepAttachment(attachment.id, getAttachmentFileName(attachment.file))"
                        >
                          {{ getAttachmentFileName(attachment.file) }}
                        </button>
                      </li>
                    </ul>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" class="hover:text-green-600"
                      :class="{ 'text-green-600 bg-green-50': stepResults[step.id]?.status === TestResultStepStatusEnum.Pass }"
                      @click="updateStepStatus(step.id, TestResultStepStatusEnum.Pass)">
                      <CircleCheck class="size-4" color="currentColor" />
                    </Button>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" class="hover:text-red-600"
                      :class="{ 'text-red-600 bg-red-50': stepResults[step.id]?.status === TestResultStepStatusEnum.Fail }"
                      @click="updateStepStatus(step.id, TestResultStepStatusEnum.Fail)">
                      <CircleX class="size-4" color="currentColor" />
                    </Button>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem @click="updateStepStatus(step.id, TestResultStepStatusEnum.Pass)">
                  <CircleCheck class="size-4 text-green-600" />
                  Pass
                </ContextMenuItem>
                <ContextMenuItem @click="updateStepStatus(step.id, TestResultStepStatusEnum.Fail)">
                  <CircleX class="size-4 text-red-600" />
                  Fail
                </ContextMenuItem>
                <ContextMenuItem @click="showCommentArea(step.id)">
                  <MessageSquare class="size-4" />
                  Add comment
                </ContextMenuItem>
                <ContextMenuItem @click="openFileUploadDialog(index)">
                  <Paperclip class="size-4" />
                  Add attachment
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <TableRow
              v-if="commentingStepId === step.id || stepResults[step.id]?.comment?.trim() || stepResults[step.id]?.attachments?.length">
              <TableCell colspan="5" class="py-4">
                <div class="flex flex-col gap-2">
                  <div v-if="commentingStepId === step.id || stepResults[step.id]?.comment?.trim()">
                    <Textarea v-if="commentingStepId === step.id" v-model="stepResults[step.id].comment"
                      :placeholder="`Add your comment for step ${step.order}`" class="text-sm"
                      @blur="hideCommentArea(step.id)"></Textarea>
                    <div v-else class="whitespace-pre-line align-top cursor-pointer" role="button"
                      @click="showCommentArea(step.id)">
                      {{ stepResults[step.id]?.comment }}
                    </div>
                  </div>
                  <div v-if="stepResults[step.id]?.attachments?.length">
                    <div class="flex flex-row flex-wrap gap-2">
                      <div v-for="(attachment, attachmentIndex) in stepResults[step.id].attachments"
                        :key="attachmentIndex" class="flex items-center gap-2 p-2 bg-muted rounded border">
                        <Paperclip class="h-4 w-4 text-muted-foreground" />
                        <span class="text-sm truncate max-w-48">{{ attachment.name }}</span>
                        <span class="text-xs text-muted-foreground">
                          ({{ (attachment.size / 1024).toFixed(1) }}KB)
                        </span>
                        <Button variant="ghost" size="sm" @click="removeAttachment(step.id, attachmentIndex)"
                          class="h-6 w-6 p-0 text-muted-foreground">
                          <X class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
    <FileUploadDialog :open="showFileUploadDialog" :step-number="selectedStep! + 1"
      @open="showFileUploadDialog = $event" @upload-files="uploadFiles" />
  </div>
</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import ContextMenu from '@/components/ui/context-menu/ContextMenu.vue';
import ContextMenuContent from '@/components/ui/context-menu/ContextMenuContent.vue';
import ContextMenuItem from '@/components/ui/context-menu/ContextMenuItem.vue';
import ContextMenuTrigger from '@/components/ui/context-menu/ContextMenuTrigger.vue';
import Table from '@/components/ui/table/Table.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestResultQuery from '@/composables/useTestResultQuery';
import useTestResultStepQuery from '@/composables/useTestResultStepQuery';
import useTestResultStepAttachmentQuery from '@/composables/useTestResultStepAttachmentQuery';
import useTestStepAttachmentQuery from '@/composables/useTestStepAttachmentQuery';
import useTestStepQuery from '@/composables/useTestStepQuery';
import useUserQuery from '@/composables/useUserQuery';
import { CircleCheck, CircleX, LoaderCircle, MessageSquare, Paperclip, Save, X } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, nextTick } from 'vue';
import { ResultEnum, TestResultStepStatusEnum, type BrowserEnum, type OsEnum, type TestStepAttachment } from '@/services';
import Select from '@/components/ui/select/Select.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import { TEST_CASE_RESULT_CONFIGURATION_OPTIONS } from '@/consts';
import type { AcceptableValue } from 'reka-ui';
import { Textarea } from '@/components/ui/textarea';
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue';
import FileUploadDialog from '@/components/FileUploadDialog.vue';
import useApi from '@/composables/useApi';
import { TestplansApi } from '@/services';
import { getAttachmentFileName } from '@/utils';

const route = useRoute();
const router = useRouter();
const testPlanId = Number(route.params.testPlanId);
const testCaseId = Number(route.params.testCaseId);

const { apiConfig } = useApi()
const testplansApi = new TestplansApi(apiConfig)
const { testCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testSteps } = useTestStepQuery(testPlanId, testCaseId);
const { testStepAttachments } = useTestStepAttachmentQuery(testPlanId, testCaseId);
const { mutateOnCreateTestResultAsync, isCreatingTestResult } = useTestResultQuery(testPlanId, testCaseId);
const { mutateAsyncOnCreateTestResultSteps, isCreatingTestResultSteps } = useTestResultStepQuery(testPlanId, testCaseId);
const { mutateOnCreateTestResultStepAttachments, isCreatingTestResultStepAttachments } = useTestResultStepAttachmentQuery(testPlanId, testCaseId);
const { currentUser } = useUserQuery();

const stepResults = ref<Record<number, { status: TestResultStepStatusEnum; comment: string; attachments: File[] }>>({});
const configuration = ref<string>(TEST_CASE_RESULT_CONFIGURATION_OPTIONS[0].value);
const commentingStepId = ref<number | null>(null);
const showFileUploadDialog = ref(false);
const selectedStep = ref<number | null>(null);

const overallResult = computed<ResultEnum>(() => {
  const totalSteps = testSteps.value?.length ?? 0;
  const results = Object.values(stepResults.value);
  if (results.length < totalSteps) return ResultEnum.InProgress;
  else if (results.some(r => r.status === ResultEnum.Fail)) return ResultEnum.Fail;
  else return ResultEnum.Pass;
});

// Group attachments by step
const attachmentsByStep = computed(() => {
  if (!testStepAttachments.value) return {};

  const attachmentMap: Record<number, TestStepAttachment[]> = {};
  testStepAttachments.value.forEach(attachment => {
    if (!attachmentMap[attachment.step]) {
      attachmentMap[attachment.step] = [];
    }
    attachmentMap[attachment.step].push(attachment);
  });

  return attachmentMap;
});

const updateStepStatus = (stepId: number, status: TestResultStepStatusEnum) => {
  if (!stepResults.value[stepId]) {
    stepResults.value[stepId] = { status, comment: '', attachments: [] };
  } else {
    stepResults.value[stepId].status = status;
  }

  if (status === TestResultStepStatusEnum.Fail) {
    showCommentArea(stepId);
  }
};

const showCommentArea = async (stepId: number) => {
  commentingStepId.value = stepId;

  if (!stepResults.value[stepId]) {
    stepResults.value[stepId] = { status: TestResultStepStatusEnum.Skip, comment: '', attachments: [] };
  }

  // Focus on the textarea after it's rendered
  await nextTick();

  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.focus();
  }
};

const hideCommentArea = (stepId: number) => {
  if (commentingStepId.value === stepId) {
    commentingStepId.value = null
  }
};

const openFileUploadDialog = (index: number) => {
  const stepId = testSteps.value?.[index]?.id;
  if (stepId && !stepResults.value[stepId]) {
    stepResults.value[stepId] = { status: TestResultStepStatusEnum.Skip, comment: '', attachments: [] };
  }
  selectedStep.value = index
  showFileUploadDialog.value = true
}

const uploadFiles = (files: File[]) => {
  if (selectedStep.value !== null && testSteps.value) {
    const stepId = testSteps.value[selectedStep.value].id;
    if (!stepResults.value[stepId]) {
      stepResults.value[stepId] = { status: TestResultStepStatusEnum.Skip, comment: '', attachments: [] };
    }
    stepResults.value[stepId].attachments.push(...files);
  }
}

const removeAttachment = (stepId: number, attachmentIndex: number) => {
  if (stepResults.value[stepId]) {
    stepResults.value[stepId].attachments.splice(attachmentIndex, 1);
  }
}

const onConfigurationChange = (value: AcceptableValue) => {
  configuration.value = value as string;
};

const downloadTestStepAttachment = async (attachmentId: number, fileName: string) => {
  try {
    const blob = await testplansApi.retrieveTestplansTestcasesTeststepattachmentsDownload({
      testPlanId: testPlanId,
      testCaseId: testCaseId,
      id: attachmentId
    });

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download attachment:', error);
  }
};

const saveTestResults = async () => {
  if (!currentUser.value) {
    console.error('The current user is not authenticated.');
    return;
  }

  try {
    const [browser, , os] = configuration.value.split(' ')
    const testResult = await mutateOnCreateTestResultAsync({
      testCaseId: testCaseId,
      testerId: currentUser.value.id,
      result: overallResult.value,
      browser: browser as BrowserEnum,
      os: os as OsEnum,
    });

    if (Object.keys(stepResults.value).length > 0 && testSteps.value && testResult) {
      const stepsToCreate = testSteps.value
        .map(step => ({
          step: step.id,
          order: step.order,
          action: step.action,
          expectedResult: step.expectedResult,
          status: stepResults.value[step.id]?.status ?? TestResultStepStatusEnum.Skip,
          comment: stepResults.value[step.id]?.comment ?? '',
        }));

      await mutateAsyncOnCreateTestResultSteps({
        testResultId: testResult.id,
        steps: stepsToCreate,
      });

      // Create attachments if any exist
      const attachmentsToCreate = [];
      for (const [stepIdStr, stepResult] of Object.entries(stepResults.value)) {
        if (stepResult.attachments?.length > 0) {
          const step = testSteps.value.find(s => s.id === Number(stepIdStr));
          if (step) {
            for (const attachment of stepResult.attachments) {
              attachmentsToCreate.push({
                result_step: step.order,
                file: attachment,
              });
            }
          }
        }
      }

      if (attachmentsToCreate.length > 0) {
        mutateOnCreateTestResultStepAttachments({
          testCaseId: testCaseId,
          testResultId: testResult.id,
          attachments: attachmentsToCreate
        });
      }
    }

    router.push({
      name: 'test-case-list',
      params: { testPlanId: testPlanId },
      replace: true,
    })
  } catch (error) {
    console.error('Failed to save test results:', error);
  }
};</script>
