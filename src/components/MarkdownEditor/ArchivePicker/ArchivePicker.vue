<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useContentStore } from '@/stores/content'
import { archiveOptions } from './archive-options'

const props = defineProps<{
  readonly value: string | undefined
}>()

const emit = defineEmits<{
  update: [value: string | undefined]
}>()

const store = useContentStore()
const archive = store.itemsByType('archive')

// Deep links to an edit page reach this picker before any list view
// has populated the content store; ensure the catalogue is loaded so
// the options aren't empty.
onMounted(() => {
  void store.ensureLoaded()
})

const options = computed(() => archiveOptions(archive.value))

const onChange = (e: Event): void => {
  const raw = (e.target as HTMLSelectElement).value
  emit('update', raw === '' ? undefined : raw)
}
</script>

<template>
  <select
    class="archive-select"
    :value="props.value ?? ''"
    data-testid="archive-picker"
    @change="onChange"
  >
    <option value="">— no archive attached —</option>
    <option v-for="opt in options" :key="opt.slug" :value="opt.slug">
      {{ opt.title }}
    </option>
  </select>
</template>

<style scoped>
.archive-select {
  width: 100%;
  padding: clamp(0.375rem, 1vw, 0.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.archive-select:focus {
  outline: none;
  border-color: var(--color-heading);
}
</style>
