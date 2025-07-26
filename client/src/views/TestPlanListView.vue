<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent title="Test Plans" />
      <Button @click="$router.push({ name: 'test-plan-add' })">
        <Plus class="mr-2" />
        New test plan
      </Button>
    </div>
    <div class="flex flex-row items-center justify-between w-full">
      <div class="relative w-full mr-4">
        <div class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
          <ListFilter class="size-6 text-muted-foreground" />
        </div>
        <Input class="pl-10" placeholder="Filter by title.." />
      </div>
      <Select>
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Status"></SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div class="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Title
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead class="text-right">
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow class="cursor-pointer" v-for="testPlan in testPlans" :key="testPlan.title"
            @click="$router.push({ name: 'test-case-list', params: { testPlanId: testPlan.id } })">
            <TableCell>
              {{ testPlan.title }}
            </TableCell>
            <TableCell>
              <Badge :class="getBadgeStyle(testPlan.status)">{{ testPlan.status }}
              </Badge>
            </TableCell>
            <TableCell>{{ testPlan.lastUpdated }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger @click.stop>
                  <Button size="icon" variant="ghost">
                    <EllipsisVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click="$router.push({ name: 'test-plan-edit', params: { id: testPlan.id } })">
                    <Pencil class="mr-2" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-red-600">
                    <Trash class="mr-2 text-red-600" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <Pagination class="!justify-end !mx-0 !ml-auto" v-slot="{ page }" :items-per-page="10" :total="50"
      :default-page="0">
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />

        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
        </template>

        <PaginationEllipsis />
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import { Plus, EllipsisVertical, Pencil, Trash, ListFilter } from "lucide-vue-next";
import Table from '@/components/ui/table/Table.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Badge from '@/components/ui/badge/Badge.vue';

const testPlans = [
  {
    id: 1,
    title: 'Test Plan 1',
    status: 'In Progress',
    lastUpdated: '2023-03-01',
  },
  {
    id: 2,
    title: 'Test Plan 2',
    status: 'Completed',
    lastUpdated: '2023-02-15',
  },
  {
    id: 3,
    title: 'Test Plan 3',
    status: 'Not Started',
    lastUpdated: '2023-01-10',
  },
  {
    id: 4,
    title: 'Test Plan 4',
    status: 'In Progress',
    lastUpdated: '2023-03-05',
  },
  {
    id: 5,
    title: 'Test Plan 5',
    status: 'Completed',
    lastUpdated: '2023-02-20',
  },
  {
    id: 6,
    title: 'Test Plan 6',
    status: 'In Progress',
    lastUpdated: '2023-03-10',
  },
  {
    id: 7,
    title: 'Test Plan 7',
    status: 'Not Started',
    lastUpdated: '2023-01-15',
  },
  {
    id: 8,
    title: 'Test Plan 8',
    status: 'In Progress',
    lastUpdated: '2023-03-12',
  },
  {
    id: 9,
    title: 'Test Plan 9',
    status: 'Completed',
    lastUpdated: '2023-02-25',
  },
  {
    id: 10,
    title: 'Test Plan 10',
    status: 'In Progress',
    lastUpdated: '2023-03-15',
  }
]

const getBadgeStyle = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-amber-200 text-amber-950";
    case "Completed":
      return "bg-emerald-200 text-emerald-950";
    case "Not Started":
      return "bg-rose-200 text-rose-950";
    default:
      return "";
  }
}
</script>
