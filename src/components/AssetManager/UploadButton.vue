<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  readonly label: string
  readonly accept: string
  readonly testId: string
  readonly multiple?: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const inputRef = ref<HTMLInputElement>()

const handleClick = () => {
  inputRef.value?.click()
}

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  // Emit one `upload` per picked file so a multi-select in the OS
  // dialog adds every file, not just the first.
  for (const file of Array.from(event.target.files ?? [])) {
    emit('upload', file)
  }
  event.target.value = ''
}
</script>

<template>
  <button type="button" :data-testid="testId" @click="handleClick">
    {{ label }}
  </button>
  <input
    ref="inputRef"
    type="file"
    :accept="accept"
    :multiple="multiple"
    hidden
    @change="handleChange"
  />
</template>

<style scoped>
button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
}

button:hover {
  background: var(--color-background-soft);
}
</style>
