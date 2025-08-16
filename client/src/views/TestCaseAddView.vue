<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent :title="testCaseTitle" />
      <Button @click="saveTestCase" :disabled="isCreatingTestCase || isCreatingTestSteps">
        <LoaderCircle v-if="isCreatingTestCase || isCreatingTestSteps" class="mr-2 animate-spin" />
        <Save v-else class="mr-2" />
        Save Changes
      </Button>
    </div>
    <div class="flex flex-row items-center w-full">
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
          <ContextMenu v-for="(step, index) in testSteps" :key="index">
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
                  <Button variant="ghost" size="icon">
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
                  <Button variant="ghost" size="icon">
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
              <ContextMenuItem @click="moveCurrentStepUp(index)">
                <MoveUp class="size-4" />
                Move current step up
              </ContextMenuItem>
              <ContextMenuItem @click="moveCurrentStepDown(index)">
                <MoveDown class="size-4" />
                Move current step down
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem class="text-red-600" @click="deleteStep(index)">
                <Trash class="size-4 text-red-600" />
                Delete step
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue';
import TitleComponent from '@/components/TitleComponent.vue';
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
import { TEST_CASE_STATUS_OPTIONS } from '@/consts';
import type { TestCaseStatusEnum, TestStep } from '@/services';
import { CornerDownRight, LoaderCircle, MoveDown, MoveUp, Paperclip, Save, Trash } from 'lucide-vue-next';
import type { AcceptableValue } from 'reka-ui';
import { nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const testPlanId = Number(route.params.testPlanId);
const { mutateAsyncOnCreateTestCase, isCreatingTestCase } = useTestCaseQuery(testPlanId)
const { mutateOnCreateTestSteps, isCreatingTestSteps } = useTestStepQuery(testPlanId)

const testCaseTitle = ref('New Test Case')
const testCaseStatus = ref<TestCaseStatusEnum>('design')
const selectedStepIndex = ref<number | null>(null);
const testSteps = ref<Omit<TestStep, 'id' | '_case' | 'order'>[]>([
  {
    action: '',
    expectedResult: ''
  }
])

const onTestCaseStatusChange = (status: AcceptableValue) => {
  testCaseStatus.value = status as TestCaseStatusEnum;
}

const selectStep = async (index: number) => {
  selectedStepIndex.value = index;

  // Focus on the textarea after it's rendered
  await nextTick();

  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.focus();
  }
}

const onFocusOutTableRow = (event: FocusEvent) => {
  // Check if the new focus target is still within the same row
  const currentRow = (event.currentTarget as HTMLElement);
  const newFocusTarget = event.relatedTarget as HTMLElement;

  if (!newFocusTarget || !currentRow.contains(newFocusTarget)) {
    selectedStepIndex.value = null;
  }
}

const insertStep = (step: number) => {
  testSteps.value.splice(step + 1, 0, {
    action: '',
    expectedResult: ''
  });
}

const moveCurrentStepUp = (index: number) => {
  if (index > 0) {
    const step = testSteps.value.splice(index, 1)[0];
    testSteps.value.splice(index - 1, 0, step);
  }
}

const moveCurrentStepDown = (index: number) => {
  if (index < testSteps.value.length - 1) {
    const step = testSteps.value.splice(index, 1)[0];
    testSteps.value.splice(index + 1, 0, step);
  }
}

const deleteStep = (index: number) => {
  if (testSteps.value.length > 1) {
    testSteps.value.splice(index, 1);
  }
}

const saveTestCase = async () => {
  try {
    const testCase = await mutateAsyncOnCreateTestCase({
      title: testCaseTitle.value,
      description: '',
      status: testCaseStatus.value,
    })

    if (testSteps.value.length > 0) {
      mutateOnCreateTestSteps({
        testCaseId: testCase.id,
        steps: testSteps.value.map((step, index) => ({
          action: step.action,
          expectedResult: step.expectedResult,
          order: index + 1
        }))
      });
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
