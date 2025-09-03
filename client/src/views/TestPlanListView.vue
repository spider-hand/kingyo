<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent title="Test Plans" />
      <Button @click="$router.push({ name: 'test-plan-add' })">
        <Plus />
        New test plan
      </Button>
    </div>
    <div class="flex flex-row items-end justify-between w-full">
      <div class="relative w-full mr-4">
        <div class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
          <ListFilter class="size-6 text-muted-foreground" />
        </div>
        <Input class="pl-10" placeholder="Filter by title.." @update:model-value="onTitleChange" />
      </div>
      <SelectWrapperComponent label="Status">
        <Select default-value="all" @update:model-value="onStatusChange">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Status"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
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
              Title
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead class="text-right">
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow class="cursor-pointer" v-for="testPlan in testPlans" :key="testPlan.id"
            @click="$router.push({ name: 'test-case-list', params: { testPlanId: testPlan.id } })">
            <TableCell class="w-[400px] truncate">
              {{ testPlan.title }}
            </TableCell>
            <TableCell>
              <Badge :class="getBadgeStyle(testPlan.status!)">{{ snakeToTitle(testPlan.status!) }}
              </Badge>
            </TableCell>
            <TableCell>{{ new Date(testPlan.updatedAt).toLocaleString() }}</TableCell>
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
                  <DropdownMenuItem class="text-red-600!" @click="onConfirmDeletion(testPlan.id)">
                    <Trash class="mr-2 text-red-600" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <Pagination class="!justify-end !mx-0 !ml-auto" v-slot="{ page }" :page="page" :items-per-page="10" :total="count"
      :default-page="1" @update:page="(newVal) => page = newVal">
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
    <AlertDialog :open="openDeleteDialog">
      <AlertDialogContent>
        <AlertDialogTitle>Are you sure you want to delete this test plan?</AlertDialogTitle>
        <AlertDialogDescription>
          This will delete <strong>{{ selectedTestPlan?.title }}</strong> and all associated test cases.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel @click="onCancelDeletion">Cancel</AlertDialogCancel>
          <Button variant="destructive" @click="onDeleteTestPlan">Delete</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import { snakeToTitle } from '@/utils';
import { ListTestplansStatusEnum } from '@/services';
import type { AcceptableValue } from 'reka-ui';
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue';
import AlertDialogContent from '@/components/ui/alert-dialog/AlertDialogContent.vue';
import AlertDialogTitle from '@/components/ui/alert-dialog/AlertDialogTitle.vue';
import AlertDialogDescription from '@/components/ui/alert-dialog/AlertDialogDescription.vue';
import AlertDialogFooter from '@/components/ui/alert-dialog/AlertDialogFooter.vue';
import AlertDialogCancel from '@/components/ui/alert-dialog/AlertDialogCancel.vue';
import { computed, ref } from 'vue';
import { TEST_PLAN_STATUS_OPTIONS } from '@/consts';
import SelectWrapperComponent from '@/components/SelectWrapperComponent.vue';


const selectedTestPlanId = ref<number | null>(null);
const selectedTestPlan = computed(() => {
  return selectedTestPlanId.value ? testPlans.value?.find(plan => plan.id === selectedTestPlanId.value) : null;
});
const openDeleteDialog = ref(false);

const { testPlans, count, page, title, status, mutateOnDeleteTestPlan } = useTestPlanQuery();

const statusOptions = [
  { value: 'all', label: 'All' },
  ...TEST_PLAN_STATUS_OPTIONS
];

let timer: NodeJS.Timeout | null = null;

const onTitleChange = (newTitle: string | number) => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    title.value = newTitle as string;
    page.value = 1;
  }, 500);
}

const onStatusChange = (newStatus: AcceptableValue) => {
  status.value = newStatus as ListTestplansStatusEnum | 'all';
  page.value = 1;
}

const onConfirmDeletion = (id: number) => {
  openDeleteDialog.value = true;
  selectedTestPlanId.value = id;
}

const onCancelDeletion = () => {
  openDeleteDialog.value = false;
  selectedTestPlanId.value = null;
}

const onDeleteTestPlan = () => {
  if (!selectedTestPlanId.value) return;
  try {
    mutateOnDeleteTestPlan(selectedTestPlanId.value);
  } catch (error) {
    console.error("Failed to delete test plan:", error);
  } finally {
    openDeleteDialog.value = false;
    selectedTestPlanId.value = null;
  }
}

const getBadgeStyle = (status: string) => {
  switch (status) {
    case "in_progress":
      return "bg-amber-100 text-amber-950 rounded-full border border-amber-300";
    case "completed":
      return "bg-emerald-100 text-emerald-950 rounded-full border border-emerald-300";
    case "not_started":
      return "bg-rose-100 text-rose-950 rounded-full border border-rose-300";
    default:
      return "";
  }
}
</script>
