<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  readonly disabled: boolean
}>()

const emit = defineEmits<{
  save: [message: string]
}>()

const commitMessage = ref('')

const handleSave = () => {
  if (!commitMessage.value.trim()) return
  emit('save', commitMessage.value)
  commitMessage.value = ''
}
</script>

<template>
  <input
    v-model="commitMessage"
    type="text"
    placeholder="Commit message"
  />
  <button type="button" :disabled="disabled || !commitMessage.trim()" @click="handleSave">
    Save
  </button>
</template>

<style scoped>
:host {
  display: flex;
  gap: clamp(0.5rem, 2vw, 1rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  border-top: 1px solid var(--color-border);
}

input {
  flex: 1;
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

button {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-border-hover);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

button:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: var(--color-border);
}
</style>
