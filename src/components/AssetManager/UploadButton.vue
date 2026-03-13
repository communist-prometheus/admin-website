<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  readonly label: string
  readonly accept: string
  readonly testId: string
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
  const file = event.target.files?.[0]
  if (file) emit('upload', file)
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
