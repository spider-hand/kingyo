<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent :title="testCase?.title ?? ''" />
      <Button>
        <Save class="mr-2" />
        Save
      </Button>
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
                  <Button variant="ghost" size="icon" class="hover:text-green-600">
                    <CircleCheck class="size-4" color="currentColor" />
                  </Button>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="hover:text-red-600">
                    <CircleX class="size-4" color="currentColor" />
                  </Button>
                </TableCell>
              </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <CircleCheck class="size-4 text-green-600" />
                Pass
              </ContextMenuItem>
              <ContextMenuItem>
                <CircleX class="size-4 text-red-600" />
                Fail
              </ContextMenuItem>
              <ContextMenuItem>
                <MessageSquare class="size-4" />
                Add comment
              </ContextMenuItem>
              <ContextMenuItem>
                <Paperclip class="size-4" />
                Add attachment
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
import ContextMenuTrigger from '@/components/ui/context-menu/ContextMenuTrigger.vue';
import Table from '@/components/ui/table/Table.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestStepQuery from '@/composables/useTestStepQuery';
import { CircleCheck, CircleX, MessageSquare, Paperclip, Save } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();
const testPlanId = Number(route.params.testPlanId);
const testCaseId = Number(route.params.testCaseId);
const { testCase } = useTestCaseQuery(testPlanId, testCaseId);
const { testSteps } = useTestStepQuery(testPlanId, testCaseId);
</script>
