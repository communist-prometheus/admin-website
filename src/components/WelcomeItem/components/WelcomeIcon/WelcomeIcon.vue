<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  ariaLabel?: string
}>()
</script>

<template>
  <div class="welcome-icon">
    <component
      :is="icon"
      :aria-label="ariaLabel"
      role="img"
    />
  </div>
</template>

<style scoped>
.welcome-icon {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
}
</style>
