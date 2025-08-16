<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent :title="testCase?.title ?? ''" />
      <Button @click="saveTestResults">
        <LoaderCircle v-if="isCreatingTestResult || isCreatingTestResultSteps" class="mr-1 animate-spin" />
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
            <TableHead class="text-right">
            </TableHead>
            <TableHead class="text-right">
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="step in testSteps" :key="step.id">
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
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" class="hover:text-green-600"
                      :class="{ 'text-green-600 bg-green-50': stepResults[step.id]?.status === 'pass' }"
                      @click="updateStepStatus(step.id, 'pass')">
                      <CircleCheck class="size-4" color="currentColor" />
                    </Button>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" class="hover:text-red-600"
                      :class="{ 'text-red-600 bg-red-50': stepResults[step.id]?.status === 'fail' }"
                      @click="updateStepStatus(step.id, 'fail')">
                      <CircleX class="size-4" color="currentColor" />
                    </Button>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem @click="updateStepStatus(step.id, 'pass')">
                  <CircleCheck class="size-4 text-green-600" />
                  Pass
                </ContextMenuItem>
                <ContextMenuItem @click="updateStepStatus(step.id, 'fail')">
                  <CircleX class="size-4 text-red-600" />
                  Fail
                </ContextMenuItem>
                <ContextMenuItem @click="showCommentArea(step.id)">
                  <MessageSquare class="size-4" />
                  Add comment
                </ContextMenuItem>
                <ContextMenuItem>
                  <Paperclip class="size-4" />
                  Add attachment
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            <TableRow v-if="commentingStepId === step.id || stepResults[step.id]?.comment?.trim()">
              <TableCell colspan="5" class="py-4">
                <Textarea v-if="commentingStepId === step.id" v-model="stepResults[step.id].comment"
                  :placeholder="`Add your comment for step ${step.order}`" class="text-sm"
                  @blur="hideCommentArea(step.id)"></Textarea>
                <div v-else class="whitespace-pre-line align-top cursor-pointer" role="button"
                  @click="showCommentArea(step.id)">
                  {{ stepResults[step.id]?.comment }}
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
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
import useTestStepQuery from '@/composables/useTestStepQuery';
import useUserQuery from '@/composables/useUserQuery';
import { CircleCheck, CircleX, LoaderCircle, MessageSquare, Paperclip, Save } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, nextTick } from 'vue';
import type { BrowserEnum, OsEnum, ResultEnum, TestResultStepStatusEnum } from '@/services';
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

const route = useRoute();
const router = useRouter();
const testPlanId = Number(route.params.testPlanId);
const testCaseId = Number(route.params.testCaseId);
const { testCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testSteps } = useTestStepQuery(testPlanId, testCaseId);
const { mutateOnCreateTestResultAsync, isCreatingTestResult } = useTestResultQuery(testPlanId, testCaseId);
const { mutateOnCreateTestResultSteps, isCreatingTestResultSteps } = useTestResultStepQuery(testPlanId, testCaseId);
const { currentUser } = useUserQuery();

const stepResults = ref<Record<number, { status: TestResultStepStatusEnum; comment: string }>>({});
const configuration = ref<string>(TEST_CASE_RESULT_CONFIGURATION_OPTIONS[0].value);
const commentingStepId = ref<number | null>(null);

const overallResult = computed<ResultEnum>(() => {
  const totalSteps = testSteps.value?.length ?? 0;
  const results = Object.values(stepResults.value);
  if (results.length < totalSteps) return 'in_progress';
  else if (results.some(r => r.status === 'fail')) return 'fail';
  else return 'pass';
});

const updateStepStatus = (stepId: number, status: TestResultStepStatusEnum) => {
  if (!stepResults.value[stepId]) {
    stepResults.value[stepId] = { status, comment: '' };
  } else {
    stepResults.value[stepId].status = status;
  }

  if (status === 'fail') {
    showCommentArea(stepId);
  }
};

const showCommentArea = async (stepId: number) => {
  commentingStepId.value = stepId;

  if (!stepResults.value[stepId]) {
    stepResults.value[stepId] = { status: 'skip', comment: '' };
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

const onConfigurationChange = (value: AcceptableValue) => {
  configuration.value = value as string;
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
          status: stepResults.value[step.id]?.status ?? 'skip',
          comment: stepResults.value[step.id]?.comment ?? '',
        }));

      mutateOnCreateTestResultSteps({
        testResultId: testResult.id,
        steps: stepsToCreate,
      });
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
