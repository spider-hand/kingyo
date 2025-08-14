<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent :title="testCase?.title ?? ''" />
      <Button @click="$router.push({ name: 'test-case-list' })">
        <Save class="mr-2" />
        Save Changes
      </Button>
    </div>
    <div class="flex flex-row items-center w-full">
      <Select v-if="!isFetchingTestCase && testCase" :default-value="testCase.status">
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
          <ContextMenu v-for="step in testSteps" :key="step.id">
            <ContextMenuTrigger as-child>
              <TableRow class="cursor-pointer">
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
                  <Button variant="ghost" size="icon">
                    <Paperclip class="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <CornerDownRight class="size-4" />
                Insert step
              </ContextMenuItem>
              <ContextMenuItem>
                <MoveUp class="size-4" />
                Move current step up
              </ContextMenuItem>
              <ContextMenuItem>
                <MoveDown class="size-4" />
                Move current step down
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem class="text-red-600">
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
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestStepQuery from '@/composables/useTestStepQuery';
import { TEST_CASE_STATUS_OPTIONS } from '@/consts';
import { CornerDownRight, MoveDown, MoveUp, Paperclip, Save, Trash } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const router = useRoute();
const testPlanId = Number(router.params.testPlanId);
const testCaseId = Number(router.params.testCaseId);

const { testCase, isFetchingTestCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testSteps } = useTestStepQuery(testPlanId, testCaseId);
</script>
