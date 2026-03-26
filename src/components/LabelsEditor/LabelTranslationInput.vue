<script setup lang="ts">
defineProps<{
  readonly value: string
  readonly langCode: string
}>()
const emit = defineEmits<{ input: [value: string] }>()

const handleInput = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLInputElement) emit('input', target.value)
}
</script>

<template>
  <td>
    <input
      :value="value"
      type="text"
      :placeholder="langCode"
      class="translation-input"
      data-testid="label-translation"
      @input="handleInput"
    />
  </td>
</template>

<style scoped>
.translation-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
