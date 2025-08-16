<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-muted-foreground">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
  label: {
    type: String,
    required: true
  }
});
</script>