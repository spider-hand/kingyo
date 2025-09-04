<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row justify-between w-full">
      <div class="flex flex-col w-full gap-4">
        <div class="flex flex-row items-center gap-2">
          <CircleCheck v-if="testResult?.result === ResultEnum.Pass" class="size-4 text-green-600"></CircleCheck>
          <CircleX v-else-if="testResult?.result === ResultEnum.Fail" class="size-4 text-red-600"></CircleX>
          <CircleMinus v-else class="size-4 text-muted-foreground"></CircleMinus>
          <TitleComponent :title="testCase?.title ?? ''" />
        </div>
        <div class="flex flex-col w-full gap-2">
          <p class="text-sm"><span class="text-muted-foreground">Test Plan</span> <span>{{ testPlan?.title }}</span></p>
          <p class="text-sm"><span class="text-muted-foreground">Tester</span> <span>{{ testResult?.testerUsername
              }}</span></p>
          <p class="text-sm"><span class="text-muted-foreground">Configuration</span> <span>{{
            formatConfiguration(testResult?._configuration ?? '') }}</span>
          </p>
          <p class="text-sm"><span class="text-muted-foreground">Timestamp</span> <span>{{ new
            Date(testResult?.executedAt ?? '').toLocaleString() }}</span></p>
        </div>
      </div>
      <DoughnutChart :data="chartData" :size="200" />
    </div>
    <div class="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>
              Step
            </TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Expected Result</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>
              Attachments
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow class="h-[53px]" v-for="result in testResultSteps" :key="result.order">
            <TableCell>
              <CircleCheck class="size-4 text-green-600" v-if="result.status === TestResultStepStatusEnum.Pass" />
              <CircleX class="size-4 text-red-600" v-else-if="result.status === TestResultStepStatusEnum.Fail" />
              <CircleMinus class="size-4 text-muted-foreground" v-else />
            </TableCell>
            <TableCell>
              {{ result.order }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.action }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.expectedResult }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.comment }}
            </TableCell>
            <TableCell>
              <ul v-if="attachmentsByResultStep[result.id]?.length">
                <li v-for="attachment in attachmentsByResultStep[result.id]" :key="attachment.id">
                  <button
                    class="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                    @click="downloadTestResultStepAttachment(attachment.id, getAttachmentFileName(attachment.file))">
                    {{ getAttachmentFileName(attachment.file) }}
                  </button>
                </li>
              </ul>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import DoughnutChart from '@/components/DoughnutChart.vue';
import Table from '@/components/ui/table/Table.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import useTestResultQuery from '@/composables/useTestResultQuery';
import useTestResultStepQuery from '@/composables/useTestResultStepQuery';
import useTestResultStepAttachmentQuery from '@/composables/useTestResultStepAttachmentQuery';
import useApi from '@/composables/useApi';
import { formatConfiguration, getAttachmentFileName } from '@/utils';
import { CircleCheck, CircleMinus, CircleX } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { TestResultStepStatusEnum, ResultEnum, type TestResultStepAttachment, TestplansApi } from '@/services';


const router = useRoute();
const testPlanId = Number(router.params.testPlanId);
const testCaseId = Number(router.params.testCaseId);
const testResultId = Number(router.params.testResultId);

const { apiConfig } = useApi()
const testplansApi = new TestplansApi(apiConfig)
const { testPlan } = useTestPlanQuery(testPlanId);
const { testCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testResult } = useTestResultQuery(testPlanId, testCaseId, testResultId);
const { testResultSteps } = useTestResultStepQuery(testPlanId, testCaseId, testResultId);
const { testResultStepAttachments } = useTestResultStepAttachmentQuery(testPlanId, testCaseId, testResultId);

// Group attachments by result step
const attachmentsByResultStep = computed(() => {
  if (!testResultStepAttachments.value) return {};

  const attachmentMap: Record<number, TestResultStepAttachment[]> = {};
  testResultStepAttachments.value.forEach(attachment => {
    if (!attachmentMap[attachment.resultStep]) {
      attachmentMap[attachment.resultStep] = [];
    }
    attachmentMap[attachment.resultStep].push(attachment);
  });

  return attachmentMap;
});

const stepCounts = computed(() => {
  if (!testResultSteps.value) {
    return {
      pass: 0,
      fail: 0,
      skip: 0,
      total: 0,
    };
  }

  const counts = {
    pass: 0,
    fail: 0,
    skip: 0,
    total: testResultSteps.value.length,
  };

  testResultSteps.value.forEach(step => {
    if (step.status === TestResultStepStatusEnum.Pass) {
      counts.pass++;
    } else if (step.status === TestResultStepStatusEnum.Fail) {
      counts.fail++;
    } else if (step.status === TestResultStepStatusEnum.Skip) {
      counts.skip++;
    }
  });

  return counts;
});

const chartData = computed(() => [
  {
    label: 'Passed',
    value: stepCounts.value.pass,
    color: 'oklch(72.3% 0.219 149.579)', // green-500
  },
  {
    label: 'Failed',
    value: stepCounts.value.fail,
    color: 'oklch(63.7% 0.237 25.331)', // red-500
  },
  {
    label: 'Skipped',
    value: stepCounts.value.skip,
    color: 'oklch(70.4% 0.04 256.788)', // slate-400
  },
]);

const downloadTestResultStepAttachment = async (attachmentId: number, fileName: string) => {
  try {
    const blob = await testplansApi.retrieveTestplansTestcasesTestresultsTestresultstepattachmentsDownload({
      testPlanId: testPlanId,
      testCaseId: testCaseId,
      testResultId: testResultId,
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
</script>
