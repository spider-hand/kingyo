<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-col w-full gap-4">
      <div class="flex flex-row items-center gap-2">
        <CircleCheck v-if="testResult?.result === 'pass'" class="size-4 text-green-600"></CircleCheck>
        <CircleX v-else-if="testResult?.result === 'fail'" class="size-4 text-red-600"></CircleX>
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
              <CircleCheck class="size-4 text-green-600" v-if="result.status === 'pass'" />
              <CircleX class="size-4 text-red-600" v-else-if="result.status === 'fail'" />
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
              <!-- TODO: -->
              <ul>
                <li v-for="attachment in []">
                  <a class="text-blue-600 hover:underline" :href="''" target="_blank">{{ ''
                  }}</a>
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
import { formatConfiguration } from '@/utils';
import { CircleCheck, CircleMinus, CircleX } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const router = useRoute();
const testPlanId = Number(router.params.testPlanId);
const testCaseId = Number(router.params.testCaseId);
const testResultId = Number(router.params.testResultId);

const { testPlan } = useTestPlanQuery(testPlanId);
const { testCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testResult } = useTestResultQuery(testPlanId, testCaseId, testResultId);
const { testResultSteps } = useTestResultStepQuery(testPlanId, testCaseId, testResultId);
</script>
