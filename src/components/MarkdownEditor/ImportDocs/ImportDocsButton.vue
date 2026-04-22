<script setup lang="ts">
import { ref } from 'vue'
import { importFile } from './import-file'

const emit = defineEmits<{
  imported: [markdown: string, images: readonly File[]]
  error: [message: string]
}>()

const busy = ref(false)
const input = ref<HTMLInputElement>()

const handleChange = async (event: Event) => {
  const el = event.target instanceof HTMLInputElement ? event.target : undefined
  const file = el?.files?.[0]
  if (!file) return
  busy.value = true
  try {
    const result = await importFile(file)
    emit('imported', result.markdown, result.images)
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Import failed')
  } finally {
    busy.value = false
    if (el) el.value = ''
  }
}
</script>

<template>
  <label class="import-docs">
    <input
      ref="input"
      type="file"
      accept=".docx,.html,.htm,.md"
      data-testid="import-docs-input"
      :disabled="busy"
      @change="handleChange"
    >
    <span data-testid="import-docs-button">
      {{ busy ? 'Importing…' : 'Import from Docs' }}
    </span>
  </label>
</template>

<style scoped>
.import-docs {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: clamp(0.8125rem, 1.8vw, 0.9375rem);
  user-select: none;
}

.import-docs:has(input:disabled) {
  opacity: 50%;
  cursor: wait;
}

input {
  display: none;
}
</style>
