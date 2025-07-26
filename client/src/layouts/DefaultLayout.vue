<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue';

</script>

<template>
  <div>
    <HeaderComponent />
    <div class="w-full flex flex-col items-center justify-center">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>