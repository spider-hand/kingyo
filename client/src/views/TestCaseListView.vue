<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent :title="testPlan?.title ?? ''" />
      <Button v-show="selectedTab === 'define'" @click="$router.push({ name: 'test-case-define' })">
        <Plus class="mr-2" />
        New test case
      </Button>
    </div>
    <Tabs :default-value="selectedTab" v-model="selectedTab" class="w-full">
      <TabsList>
        <TabsTrigger value="define">Define</TabsTrigger>
        <TabsTrigger value="execute">History</TabsTrigger>
      </TabsList>
      <TabsContent class="flex flex-col items-center justify-center w-full gap-4 py-8" value="define">
        <div class="flex flex-row items-center justify-between w-full">
          <div class="relative w-full mr-4">
            <div class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
              <ListFilter class="size-6 text-muted-foreground" />
            </div>
            <Input class="pl-10" placeholder="Filter by title.." @update:model-value="onTestCaseTitleChange" />
          </div>
          <Select :default-value="status" @update:model-value="onStatusChange">
            <SelectTrigger class="w-[180px] mr-2">
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
          <Select :default-value="latestResult" @update:model-value="onLatestOutcomeChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Latest Outcome"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in latestResultOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
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
                  Title
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Outcome</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Last Executed</TableHead>
                <TableHead class="text-right">
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ContextMenu v-for="testCase in testCases" :key="testCase.title">
                <ContextMenuTrigger as-child>
                  <TableRow class="cursor-pointer" @click="$router.push({ name: 'test-case-define' })">
                    <TableCell class="w-[400px] truncate">
                      {{ testCase.title }}
                    </TableCell>
                    <TableCell>
                      <Badge :class="getBadgeStyle(testCase.status!)">{{ snakeToTitle(testCase.status!)
                      }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span class="inline-block w-2 h-2 mr-1 rounded-full border-2"
                        :class="getResultBadge(testCase.latestResult! as ListTestplansTestcasesLatestResultEnum)"></span>{{
                          snakeToTitle(testCase.latestResult!)
                        }}
                    </TableCell>
                    <TableCell>
                      {{ new Date(testCase.updatedAt).toLocaleString() }}
                    </TableCell>
                    <TableCell>
                      {{ new Date(testCase.executedAt!).toLocaleString() }}
                    </TableCell>
                    <TableCell class="text-right">
                      <Button size="icon" variant="ghost" @click.stop="$router.push({ name: 'test-case-execute' })">
                        <Play class="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>
                    <Pencil class="mr-2" />
                    Edit
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Copy class="mr-2" />
                    Clone
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem class="text-red-600">
                    <Trash class="mr-2 text-red-600" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </TableBody>
          </Table>
        </div>
        <Pagination class="!justify-end !mx-0 !ml-auto" v-slot="{ page }" :items-per-page="10" :total="testCasesCount"
          :page="testCasesPage" @update:page="(newVal) => testCasesPage = newVal" :default-page="1">
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
      </TabsContent>
      <TabsContent class="flex flex-col items-center justify-center w-full gap-4 py-8" value="execute">
        <div class="flex flex-row items-center justify-between w-full">
          <div class="relative w-full mr-4">
            <div class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
              <ListFilter class="size-6 text-muted-foreground" />
            </div>
            <Input class="pl-10" placeholder="Filter by title.." @update:model-value="onTestResultTitleChange" />
          </div>
          <Select :default-value="result" @update:model-value="onTestResultOutcomeChange">
            <SelectTrigger class="w-[180px] mr-2">
              <SelectValue placeholder="Outcome"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in latestResultOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select :default-value="tester" @update:model-value="onTestResultTesterChange">
            <SelectTrigger class="w-[180px] mr-2">
              <SelectValue placeholder="Tester"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in testerOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select :default-value="configuration" @update:model-value="onTestResultConfigurationChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Configuration"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in configurationOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
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
                  Title
                </TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>
                  Tester
                </TableHead>
                <TableHead>
                  Configuration
                </TableHead>
                <TableHead>
                  Timestamp
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow class="cursor-pointer h-[53px]" v-for="testResult in testResults" :key="testResult.id"
                @click="$router.push({ name: 'test-case-result', params: { id: testResult.id } })">
                <TableCell class="w-[400px] truncate">
                  {{ testResult.caseTitle }}
                </TableCell>
                <TableCell>
                  <span class="inline-block w-2 h-2 mr-1 rounded-full border-2"
                    :class="getResultBadge(testResult.result!)"></span>
                  {{ snakeToTitle(testResult.result!) }}
                </TableCell>
                <TableCell>
                  {{ testResult.testerUsername }}
                </TableCell>
                <TableCell>
                  {{ formatConfiguration(testResult._configuration) }}
                </TableCell>
                <TableCell>
                  {{ new Date(testResult.executedAt).toLocaleString() }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Pagination class="!justify-end !mx-0 !ml-auto" v-slot="{ page }" :page="testResultsPage" :items-per-page="10"
          :total="testResultsCount" :default-page="1" @update:page="(newVal) => testResultsPage = newVal">
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
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import ContextMenu from '@/components/ui/context-menu/ContextMenu.vue';
import ContextMenuContent from '@/components/ui/context-menu/ContextMenuContent.vue';
import ContextMenuItem from '@/components/ui/context-menu/ContextMenuItem.vue';
import ContextMenuSeparator from '@/components/ui/context-menu/ContextMenuSeparator.vue';
import ContextMenuTrigger from '@/components/ui/context-menu/ContextMenuTrigger.vue';
import Input from '@/components/ui/input/Input.vue';
import Pagination from '@/components/ui/pagination/Pagination.vue';
import PaginationContent from '@/components/ui/pagination/PaginationContent.vue';
import PaginationEllipsis from '@/components/ui/pagination/PaginationEllipsis.vue';
import PaginationItem from '@/components/ui/pagination/PaginationItem.vue';
import PaginationNext from '@/components/ui/pagination/PaginationNext.vue';
import PaginationPrevious from '@/components/ui/pagination/PaginationPrevious.vue';
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
import Tabs from '@/components/ui/tabs/Tabs.vue';
import TabsContent from '@/components/ui/tabs/TabsContent.vue';
import TabsList from '@/components/ui/tabs/TabsList.vue';
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue';
import useTestCaseQuery from '@/composables/useTestCaseQuery';
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import useTestResultQuery from '@/composables/useTestResultQuery';
import useUserQuery from '@/composables/useUserQuery';
import { TEST_CASE_LATEST_RESULT_OPTIONS, TEST_CASE_RESULT_CONFIGURATION_OPTIONS, TEST_CASE_STATUS_OPTIONS } from '@/consts';
import { ListTestplansTestcasesLatestResultEnum, ListTestplansTestcasesStatusEnum } from '@/services';
import { formatConfiguration, snakeToTitle } from '@/utils';
import { Copy, ListFilter, Pencil, Play, Plus, Trash } from 'lucide-vue-next';
import type { AcceptableValue } from 'reka-ui';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';


const selectedTab = ref<"define" | "execute">('define');

const router = useRoute();
const testPlanId = Number(router.params.testPlanId);

const { testPlan } = useTestPlanQuery(testPlanId);
const { testCases, count: testCasesCount, page: testCasesPage, title: testCasesTitle, status, latestResult } = useTestCaseQuery(testPlanId);
const { testResults, count: testResultsCount, page: testResultsPage, title: testResultsTitle, result, tester, configuration } = useTestResultQuery(testPlanId);

const { users, isFetchingUsers } = useUserQuery();

const statusOptions = [
  { value: 'all', label: 'All' },
  ...TEST_CASE_STATUS_OPTIONS
];

const latestResultOptions = [
  { value: 'all', label: 'All' },
  ...TEST_CASE_LATEST_RESULT_OPTIONS
];

const configurationOptions = [
  { value: 'all', label: 'All' },
  ...TEST_CASE_RESULT_CONFIGURATION_OPTIONS
]

const testerOptions = computed(() => {
  if (isFetchingUsers.value || !users.value) {
    return [{
      value: 'all',
      label: 'All'
    }];
  } else {
    return [
      { value: 'all', label: 'All' },
      ...users.value.map(user => ({
        value: user.username,
        label: user.username
      }))
    ];
  }
})

let timer: NodeJS.Timeout | null = null;

const onTestCaseTitleChange = (value: string | number) => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    testCasesTitle.value = value as string;
    testCasesPage.value = 1;
  }, 500);
};

const onStatusChange = (value: AcceptableValue) => {
  status.value = value as ListTestplansTestcasesStatusEnum | 'all';
  testCasesPage.value = 1;
};

const onLatestOutcomeChange = (value: AcceptableValue) => {
  latestResult.value = value as ListTestplansTestcasesLatestResultEnum | 'all';
  testCasesPage.value = 1;
};

const onTestResultTitleChange = (value: string | number) => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    testResultsTitle.value = value as string;
    testResultsPage.value = 1;
  }, 500);
};

const onTestResultTesterChange = (value: AcceptableValue) => {
  tester.value = value as string;
  testResultsPage.value = 1;
};

const onTestResultOutcomeChange = (value: AcceptableValue) => {
  result.value = value as ListTestplansTestcasesLatestResultEnum | 'all';
  testResultsPage.value = 1;
};

const onTestResultConfigurationChange = (value: AcceptableValue) => {
  configuration.value = value as string | 'all';
  testResultsPage.value = 1;
};

const getBadgeStyle = (status: ListTestplansTestcasesStatusEnum) => {
  switch (status) {
    case ListTestplansTestcasesStatusEnum.Design:
      return "bg-amber-200 text-amber-950 border-amber-500 border-2";
    case ListTestplansTestcasesStatusEnum.Ready:
      return "bg-emerald-200 text-emerald-950 border-emerald-500 border-2";
    case ListTestplansTestcasesStatusEnum.Closed:
      return "bg-slate-200 text-slate-950 border-slate-500 border-2";
    default:
      return "";
  }
}

const getResultBadge = (result: ListTestplansTestcasesLatestResultEnum) => {
  switch (result) {
    case ListTestplansTestcasesLatestResultEnum.Pass:
      return "bg-emerald-500 border-emerald-200";
    case ListTestplansTestcasesLatestResultEnum.Fail:
      return "bg-rose-500 border-rose-200";
    case ListTestplansTestcasesLatestResultEnum.InProgress:
      return "bg-amber-500 border-amber-200";
    default:
      return "";
  }
}
</script>
