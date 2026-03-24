<script setup lang="ts">
import type { Language } from '@/types/content'

defineProps<{ lang: Language }>()
</script>

<template>
  <output class="empty-state">
    <p>No content found for {{ lang }}</p>
  </output>
</template>

<style scoped>
.empty-state {
  padding: clamp(2rem, 4vw, 3rem);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
