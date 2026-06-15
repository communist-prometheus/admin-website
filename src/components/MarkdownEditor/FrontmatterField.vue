<script setup lang="ts">
import type { Language } from '@/types/language'
import ArchivePicker from './ArchivePicker/ArchivePicker.vue'
import ArticlesPicker from './ArticlesPicker/ArticlesPicker.vue'
import FrontmatterSelect from './FrontmatterSelect.vue'
import type { FieldDefinition } from './field-types'
import { formatDateValue, parseFieldValue } from './frontmatter-values'
import IssuePicker from './IssuePicker/IssuePicker.vue'

const props = defineProps<{
  readonly field: FieldDefinition
  readonly value: unknown
  readonly lang: Language
}>()

const emit = defineEmits<{ update: [value: unknown] }>()

const stringValue = (): string => String(props.value ?? '')

const displayValue = (): string =>
  props.field.type === 'date'
    ? formatDateValue(props.value)
    : stringValue()

const isChecked = (): boolean =>
  props.value === true || props.value === 'true'

const articlesValue = (): readonly string[] | undefined =>
  Array.isArray(props.value)
    ? props.value.filter((s): s is string => typeof s === 'string')
    : undefined

const optionalStringValue = (): string | undefined =>
  typeof props.value === 'string' && props.value !== ''
    ? props.value
    : undefined

const handleInput = (event: Event) => {
  const t = event.target
  if (t instanceof HTMLInputElement && props.field.type === 'checkbox') {
    emit('update', t.checked)
    return
  }
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)
    emit('update', parseFieldValue(props.field.type, t.value))
}

const onSelect = (v: string): void => {
  emit('update', parseFieldValue('select', v))
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
  <label
    v-else-if="field.type === 'checkbox'"
    class="checkbox-wrap"
  >
    <input
      :id="`fm-${field.key}`"
      type="checkbox"
      :checked="isChecked()"
      @change="handleInput"
    />
    <span class="checkbox-label">{{ field.label }}</span>
  </label>
  <ArticlesPicker
    v-else-if="field.type === 'articles'"
    :value="articlesValue()"
    :lang="lang"
    @update="emit('update', $event)"
  />
  <IssuePicker
    v-else-if="field.type === 'issue'"
    :value="optionalStringValue()"
    @update="emit('update', $event)"
  />
  <ArchivePicker
    v-else-if="field.type === 'archive-ref'"
    :value="optionalStringValue()"
    @update="emit('update', $event)"
  />
  <FrontmatterSelect
    v-else-if="field.type === 'select'"
    :field="field"
    :value="stringValue()"
    :lang="lang"
    @change="onSelect"
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
  width: 100%;
  box-sizing: border-box;
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

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-wrap input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--color-heading);
  cursor: pointer;
}

.checkbox-label {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: var(--color-text);
}
</style>
