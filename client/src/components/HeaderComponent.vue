<template>
  <header class="w-full h-[64px] flex flex-row items-center justify-between px-[16px] py-0 gap-8">
    <LogoComponent />
    <Breadcrumb class="mr-auto">
      <BreadcrumbList>
        <template v-if="breadcrumb.length" v-for="(item, index) in breadcrumb" :key="index">
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
    <DropdownMenu>
      <DropdownMenuTrigger class="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="" alt="User Avatar" />
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem class="flex flex-col items-start" @select="(e: Event) => e.preventDefault()">
          <span>User 1</span>
          <span class="text-muted-foreground">user1@example.com</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="$router.push({ name: 'login' })">Sign out</DropdownMenuItem>
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

const route = useRoute()
const breadcrumb = computed(() => {
  return route.meta.breadcrumb || []
})
</script>
