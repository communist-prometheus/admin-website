<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  ariaLabel?: string
}>()
</script>

<template>
  <component
    :is="icon"
    :aria-label="ariaLabel"
    role="img"
  />
</template>

<style scoped>
:host {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
}
</style>
