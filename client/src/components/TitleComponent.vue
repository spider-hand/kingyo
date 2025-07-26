<template>
  <h1 class="text-2xl font-extrabold self-start">{{ title }}
  </h1>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>