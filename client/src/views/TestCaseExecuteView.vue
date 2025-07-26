<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent title="Test Case 1" />
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
          <ContextMenu v-for="step in testCase" :key="step.step">
            <ContextMenuTrigger as-child>
              <TableRow class="cursor-pointer">
                <TableCell>
                  {{ step.step }}
                </TableCell>
                <TableCell class="whitespace-pre-line align-top">
                  {{ step.action }}
                </TableCell>
                <TableCell class="whitespace-pre-line align-top">
                  {{ step.result }}
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
import { CircleCheck, CircleX, MessageSquare, Paperclip, Save } from 'lucide-vue-next';


const testCase = [
  {
    step: 1,
    action: 'Click a button.',
    result: 'Open a modal.'
  },
  {
    step: 2,
    action: 'Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button.',
    result: 'Open a modal.'
  },
  {
    step: 3,
    action: 'Click a button.\nClick a button.\nClick a button.\nClick a button.\nClick a button.',
    result: 'Open a modal.'
  },
  {
    step: 4,
    action: 'Click a button.',
    result: 'Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal.'
  },
  {
    step: 5,
    action: 'Click a button.',
    result: 'Open a modal.\nOpen a modal.\nOpen a modal.\nOpen a modal.\nOpen a modal.'
  },
  {
    step: 6,
    action: 'Click a button.',
    result: 'Open a modal.'
  },
  {
    step: 7,
    action: 'Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button. Click a button.',
    result: 'Open a modal.'
  },
  {
    step: 8,
    action: 'Click a button.\nClick a button.\nClick a button.\nClick a button.\nClick a button.',
    result: 'Open a modal.'
  },
  {
    step: 9,
    action: 'Click a button.',
    result: 'Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal. Open a modal.'
  },
  {
    step: 10,
    action: 'Click a button.',
    result: 'Open a modal.\nOpen a modal.\nOpen a modal.\nOpen a modal.\nOpen a modal.'
  }
]
</script>
