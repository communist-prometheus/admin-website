<script setup lang="ts">
import type { Language } from '@/types/content'

defineProps<{
  title: string
  lang: Language
}>()
</script>

<template>
  <div class="item-header">
    <h3>{{ title }}</h3>
    <span class="lang-badge">{{ lang }}</span>
  </div>
</template>

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.5rem, 1vw, 1rem);
  margin-bottom: clamp(0.375rem, 1vw, 0.5rem);
}

h3 {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  flex: 1;
}

.lang-badge {
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem);
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  text-transform: uppercase;
}
</style>
