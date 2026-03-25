<script setup lang="ts">
import type { FieldDefinition } from './frontmatter-fields'
import { formatDateValue, parseFieldValue } from './frontmatter-values'

const props = defineProps<{
  readonly field: FieldDefinition
  readonly value: unknown
}>()

const emit = defineEmits<{
  update: [value: unknown]
}>()

const displayValue = (): string => {
  if (props.field.type === 'date') return formatDateValue(props.value)
  return String(props.value ?? '')
}

const handleInput = (event: Event) => {
  const target = event.target
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLTextAreaElement)
  )
    return
  emit('update', parseFieldValue(props.field.type, target.value))
}
</script>

<template>
  <label :for="`fm-${field.key}`" class="field-label">
    {{ field.label }}{{ field.required ? ' *' : '' }}
  </label>
  <textarea
    v-if="field.type === 'textarea'"
    :id="`fm-${field.key}`"
    :value="displayValue()"
    rows="2"
    class="field-input"
    @input="handleInput"
  />
  <input
    v-else
    :id="`fm-${field.key}`"
    :type="field.type"
    :value="displayValue()"
    class="field-input"
    @input="handleInput"
  />
</template>

<style scoped>
.field-label {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.field-input {
  padding: clamp(0.375rem, 1vw, 0.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-heading);
}

.field-input[rows] {
  resize: vertical;
  min-height: 48px;
}
</style>
