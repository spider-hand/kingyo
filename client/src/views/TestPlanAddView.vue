<template>
  <div class="flex flex-col items-center justify-center max-w-5xl w-full gap-8 p-8">
    <div class="flex flex-row items-center justify-between w-full">
      <TitleComponent title="Add Test Plan" />
    </div>
    <div class="flex flex-col w-full">
      <Input placeholder="Name" />
    </div>
    <div class="flex flex-row items-center justify-end w-full gap-4">
      <Button @click="$router.push({ name: 'test-plan-list' })">
        Create
      </Button>
      <Button variant="outline" @click="$router.push({ name: 'test-plan-list' })">
        Cancel
      </Button>
    </div>
  </div>

</template>

<script setup lang="ts">
import TitleComponent from '@/components/TitleComponent.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';

</script>
