<template>
  <h1 class="text-xl font-semibold self-start">{{ title }}
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