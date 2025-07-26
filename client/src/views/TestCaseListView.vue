<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full h-[36px]">
      <TitleComponent title="Test Plan 1" />
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
            <Input class="pl-10" placeholder="Filter by title.." />
          </div>
          <Select>
            <SelectTrigger class="w-[180px] mr-2">
              <SelectValue placeholder="Status"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Latest Outcome"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="passed">Pass</SelectItem>
                <SelectItem value="failed">Fail</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
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
                    <TableCell>
                      {{ testCase.title }}
                    </TableCell>
                    <TableCell>
                      <Badge :class="getBadgeStyle(testCase.status)">{{ testCase.status
                      }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span class="inline-block w-2 h-2 mr-1 rounded-full border-2"
                        :class="getOutcomeBadge('Passed')"></span>Passed
                    </TableCell>
                    <TableCell>
                      {{ new Date().toLocaleString() }}
                    </TableCell>
                    <TableCell>
                      {{ new Date().toLocaleString() }}
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
      </TabsContent>
      <TabsContent class="flex flex-col items-center justify-center w-full gap-4 py-8" value="execute">
        <div class="flex flex-row items-center justify-between w-full">
          <div class="relative w-full mr-4">
            <div class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
              <ListFilter class="size-6 text-muted-foreground" />
            </div>
            <Input class="pl-10" placeholder="Filter by title.." />
          </div>
          <Select>
            <SelectTrigger class="w-[180px] mr-2">
              <SelectValue placeholder="Outcome"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger class="w-[180px] mr-2">
              <SelectValue placeholder="Tester"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Me</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Configuration"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="chrome">Chrome</SelectItem>
                <SelectItem value="firefox">Firefox</SelectItem>
                <SelectItem value="safari">Safari</SelectItem>
                <SelectItem value="edge">Edge</SelectItem>
                <SelectItem value="opera">Opera</SelectItem>
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
              <TableRow class="cursor-pointer h-[53px]" v-for="testCase in testHistory" :key="testCase.title"
                @click="$router.push({ name: 'test-case-result', params: { id: testCase.id } })">
                <TableCell>
                  {{ testCase.title }}
                </TableCell>
                <TableCell>
                  <span class="inline-block w-2 h-2 mr-1 rounded-full border-2"
                    :class="getOutcomeBadge(testCase.outcome)"></span>
                  {{ testCase.outcome }}
                </TableCell>
                <TableCell>
                  {{ testCase.tester }}
                </TableCell>
                <TableCell>
                  {{ testCase.configuration }}
                </TableCell>
                <TableCell>
                  {{ new Date().toLocaleString() }}
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
import { Copy, ListFilter, Pencil, Play, Plus, Trash } from 'lucide-vue-next';
import { ref } from 'vue';

const selectedTab = ref<"define" | "execute">('define');

const testCases = [
  {
    id: 1,
    title: 'Test Case 1',
    status: 'Design',
  },
  {
    id: 2,
    title: 'Test Case 2',
    status: 'Ready',
  },
  {
    id: 3,
    title: 'Test Case 3',
    status: 'Closed',
  },
  {
    id: 4,
    title: 'Test Case 4',
    status: 'Design',
  },
  {
    id: 5,
    title: 'Test Case 5',
    status: 'Ready',
  },
  {
    id: 6,
    title: 'Test Case 6',
    status: 'Closed',
  },
]

const testHistory = [
  {
    id: 1,
    title: 'Test Case 1',
    outcome: 'Passed',
    status: 'Design',
    tester: 'User A',
    configuration: 'Chrome on Window 10'
  },
  {
    id: 2,
    title: 'Test Case 2',
    outcome: 'Failed',
    status: 'Ready',
    tester: 'User B',
    configuration: 'Firefox on Mac'
  },
  {
    id: 3,
    title: 'Test Case 3',
    outcome: 'Passed',
    status: 'Closed',
    tester: 'User C',
    configuration: 'Safari on Mac'
  },
  {
    id: 4,
    title: 'Test Case 4',
    outcome: 'Passed',
    status: 'Design',
    tester: 'User D',
    configuration: 'Edge on Windows 11'
  },
  {
    id: 5,
    title: 'Test Case 5',
    outcome: 'Passed',
    status: 'Ready',
    tester: 'User E',
    configuration: 'Chrome on Linux'
  },
  {
    id: 6,
    title: 'Test Case 6',
    outcome: 'In Progress',
    status: 'Closed',
    tester: 'User F',
    configuration: 'Firefox on Windows 10'
  },
]

const getBadgeStyle = (status: string) => {
  switch (status) {
    case "Design":
      return "bg-amber-200 text-amber-950";
    case "Ready":
      return "bg-emerald-200 text-emerald-950";
    case "Closed":
      return "bg-slate-200 text-slate-950";
    default:
      return "";
  }
}

const getOutcomeBadge = (outcome: string) => {
  switch (outcome) {
    case "Passed":
      return "bg-emerald-500 border-emerald-200";
    case "Failed":
      return "bg-rose-500 border-rose-200";
    case "In Progress":
      return "bg-amber-500 border-amber-200";
    default:
      return "";
  }
}
</script>
