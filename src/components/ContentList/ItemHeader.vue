<script setup lang="ts">
import type { Language } from '@/types/content'
import DeleteButton from './DeleteButton.vue'

defineProps<{
  title: string
  lang: Language
  showDelete?: boolean
}>()

const emit = defineEmits<{ delete: [] }>()
</script>

<template>
  <h3>{{ title }}</h3>
  <DeleteButton
    v-if="showDelete"
    @click="emit('delete')"
  />
  <span class="lang-badge">{{ lang }}</span>
</template>

<style scoped>
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
