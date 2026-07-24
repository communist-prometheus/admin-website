<script setup lang="ts">
defineProps<{ readonly value: string }>()
const emit = defineEmits<{ input: [value: string] }>()

const handleInput = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLInputElement) emit('input', target.value)
}
</script>

<template>
  <td data-label="Colour">
    <input
      :value="value"
      type="color"
      class="color-input"
      data-testid="topic-color"
      aria-label="Topic colour"
      @input="handleInput"
    />
  </td>
</template>

<style scoped>
.color-input {
  inline-size: 3rem;
  block-size: 2rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
}
</style>
