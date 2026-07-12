<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import { issueOptions } from './issue-options'

const props = defineProps<{
  readonly value: string | undefined
}>()

const emit = defineEmits<{
  update: [value: string | undefined]
}>()

const store = useContentStore()
const magazine = store.itemsByType('magazine')

const options = computed(() => issueOptions(magazine.value))

const onChange = (e: Event): void => {
  const raw = (e.target as HTMLSelectElement).value
  emit('update', raw === '' ? undefined : raw)
}
</script>

<template>
  <select
    class="issue-select"
    :value="props.value ?? ''"
    data-testid="issue-picker"
    @change="onChange"
  >
    <option value="">— not in any issue —</option>
    <option v-for="opt in options" :key="opt.slug" :value="opt.slug">
      {{ opt.title }}
    </option>
  </select>
</template>

<style scoped>
.issue-select {
  width: 100%;
  padding: clamp(0.375rem, 1vw, 0.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.issue-select:focus {
  outline: none;
  border-color: var(--color-heading);
}
</style>
