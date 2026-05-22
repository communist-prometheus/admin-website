<script setup lang="ts">
defineProps<{
  readonly code: string
  readonly value: string
}>()

const emit = defineEmits<{ input: [value: string] }>()

const onInput = (e: Event): void => {
  if (e.target instanceof HTMLInputElement) emit('input', e.target.value)
}
</script>

<template>
  <li class="desc-row">
    <span class="desc-lang">{{ code.toUpperCase() }}</span>
    <input
      type="text"
      class="desc-input"
      :value="value"
      :placeholder="`Description (${code})`"
      :data-testid="`link-desc-${code}`"
      @input="onInput"
    />
  </li>
</template>

<style scoped>
.desc-row {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.desc-lang {
  flex: 0 0 2.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.desc-input {
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.8125rem;
}
</style>
