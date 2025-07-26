<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-col w-full gap-4">
      <div class="flex flex-row items-center gap-2">
        <CircleCheck class="size-4 text-green-600"></CircleCheck>
        <TitleComponent title="Test Case 1" />
      </div>
      <div class="flex flex-col w-full gap-2">
        <p class="text-sm"><span class="text-muted-foreground">Test Plan</span> <span>Test Plan 1</span></p>
        <p class="text-sm"><span class="text-muted-foreground">Tester</span> <span>User 1</span></p>
        <p class="text-sm"><span class="text-muted-foreground">Configuration</span> <span>Chrome on Windows 11</span>
        </p>
        <p class="text-sm"><span class="text-muted-foreground">Timestamp</span> <span>2023-10-01 12:00:00</span></p>
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
          <TableRow class="h-[53px]" v-for="result in results" :key="result.step">
            <TableCell>
              <CircleCheck class="size-4 text-green-600" v-if="result.status === 'Passed'" />
              <CircleX class="size-4 text-red-600" v-else-if="result.status === 'Failed'" />
              <CircleMinus class="size-4 text-muted-foreground" v-else />
            </TableCell>
            <TableCell>
              {{ result.step }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.action }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.result }}
            </TableCell>
            <TableCell class="whitespace-pre-line align-top">
              {{ result.comment }}
            </TableCell>
            <TableCell>
              <ul>
                <li v-for="attachment in result.attachments" :key="attachment.name">
                  <a class="text-blue-600 hover:underline" :href="attachment.url" target="_blank">{{ attachment.name
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
import { CircleCheck, CircleMinus, CircleX } from 'lucide-vue-next';

const results = [
  {

    step: 1,
    action: 'Click a button.',
    result: 'Open a modal.',
    status: 'Passed',
    attachments: [],
    comment: '',
  },
  {
    step: 2,
    action: 'Fill out a form.',
    result: 'Form is submitted successfully.',
    status: 'Failed',
    attachments: [
      {
        name: 'screenshot.png',
        url: 'https://example.com/screenshot.png',
      },
      {
        name: 'form-error.png',
        url: 'https://example.com/form-error.png',
      },
    ],
    comment: 'Form validation error.',
  },
  {
    step: 3,
    action: 'Click submit.',
    result: 'Confirmation message is displayed.',
    status: 'Passed',
    attachments: [],
    comment: '',
  },
  {
    step: 4,
    action: 'Navigate to the next page.',
    result: 'Next page loads correctly.',
    status: 'Passed',
    attachments: [],
    comment: '',
  },
  {
    step: 5,
    action: 'Verify the new page content.',
    result: 'New page content is correct.',
    status: 'Passed',
    attachments: [],
    comment: '',
  },
  {
    step: 6,
    action: 'Click a link.',
    result: 'Link opens in a new tab.',
    status: '',
    attachments: [],
    comment: '',
  },
];
</script>
