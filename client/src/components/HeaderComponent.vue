<template>
  <header class="w-full h-[64px] flex flex-row items-center justify-between px-[16px] py-0 gap-8">
    <LogoComponent />
    <Breadcrumb class="mr-auto">
      <BreadcrumbList v-if="breadcrumb.length">
        <template v-for="(item, index) in breadcrumb" :key="index">
          <BreadcrumbItem>
            <BreadcrumbLink v-if="index < breadcrumb.length - 1 && item.path">
              <RouterLink :to="item.path">{{ item.name }}</RouterLink>
            </BreadcrumbLink>
            <BreadcrumbPage v-else>{{ item.name }}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="index < breadcrumb.length - 1" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>
    <DropdownMenu v-if="currentUser && !isFetchingCurrentUser">
      <DropdownMenuTrigger class="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="" alt="User Avatar" />
          <AvatarFallback>{{ currentUser.username[0] }}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem class="flex flex-col items-start" @select="(e: Event) => e.preventDefault()">
          <span>{{ currentUser.username }}</span>
          <span class="text-muted-foreground">{{ currentUser.email }}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="signOut">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import LogoComponent from './LogoComponent.vue';
import Avatar from './ui/avatar/Avatar.vue';
import AvatarFallback from './ui/avatar/AvatarFallback.vue';
import AvatarImage from './ui/avatar/AvatarImage.vue';
import DropdownMenu from './ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuContent from './ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuItem from './ui/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenuSeparator from './ui/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuTrigger from './ui/dropdown-menu/DropdownMenuTrigger.vue';
import Breadcrumb from './ui/breadcrumb/Breadcrumb.vue';
import BreadcrumbItem from './ui/breadcrumb/BreadcrumbItem.vue';
import BreadcrumbList from './ui/breadcrumb/BreadcrumbList.vue';
import BreadcrumbSeparator from './ui/breadcrumb/BreadcrumbSeparator.vue';
import BreadcrumbLink from './ui/breadcrumb/BreadcrumbLink.vue';
import { computed } from 'vue';
import BreadcrumbPage from './ui/breadcrumb/BreadcrumbPage.vue';
import useTokenApi from '@/composables/useTokenApi';
import useTestPlanQuery from '@/composables/useTestPlanQuery';
import useUserQuery from '@/composables/useUserQuery';


const route = useRoute()

const { signOut } = useTokenApi()
const { currentUser, isFetchingCurrentUser } = useUserQuery()

const testPlanId = computed(() => {
  const id = route.params.testPlanId
  return id ? Number(id) : undefined
})

const { testPlan } = useTestPlanQuery(testPlanId)

const breadcrumb = computed(() => {
  const breadcrumbItems = route.meta.breadcrumb || []

  // Resolve dynamic parameters in breadcrumb paths and enhance names
  return breadcrumbItems.map(item => {
    const enhancedItem = { ...item }

    // Resolve path parameters
    if (item.path) {
      enhancedItem.path = resolvePath(item.path, route.params)
    }

    // Enhance breadcrumb names with dynamic data
    if (item.name === 'Test Cases' && testPlan.value) {
      enhancedItem.name = `Test Cases - ${testPlan.value.title}`
    }

    return enhancedItem
  })
})

// Helper function to resolve path parameters
const resolvePath = (path: string, params: Record<string, string | string[]>) => {
  let resolvedPath = path

  // Replace :paramName or {paramName} with actual values
  Object.entries(params).forEach(([key, value]) => {
    const paramValue = Array.isArray(value) ? value[0] : value
    resolvedPath = resolvedPath
      .replace(`:${key}`, paramValue)
      .replace(`{${key}}`, paramValue)
  })

  return resolvedPath
}
</script>
