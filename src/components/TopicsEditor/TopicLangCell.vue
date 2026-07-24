<script setup lang="ts">
const props = defineProps<{
  readonly name: string
  readonly subtitle: string
  readonly description: string
  readonly langCode: string
  readonly langLabel: string
}>()

const emit = defineEmits<{
  'update-name': [value: string]
  'update-subtitle': [value: string]
  'update-description': [value: string]
}>()

const readValue = (event: Event): string | undefined =>
  event.target instanceof HTMLInputElement ||
  event.target instanceof HTMLTextAreaElement
    ? event.target.value
    : undefined

const onName = (e: Event) => {
  const v = readValue(e)
  if (v !== undefined) emit('update-name', v)
}

const onSubtitle = (e: Event) => {
  const v = readValue(e)
  if (v !== undefined) emit('update-subtitle', v)
}

const onDescription = (e: Event) => {
  const v = readValue(e)
  if (v !== undefined) emit('update-description', v)
}

const cellLabel = `${props.langLabel} (${props.langCode})`
</script>

<template>
  <td :data-label="cellLabel" class="lang-cell">
    <input
      :value="name"
      type="text"
      :placeholder="`${langCode} — name`"
      class="lang-input"
      data-testid="topic-name"
      @input="onName"
    />
    <input
      :value="subtitle"
      type="text"
      :placeholder="`${langCode} — tag (short)`"
      class="lang-input"
      data-testid="topic-subtitle"
      @input="onSubtitle"
    />
    <textarea
      :value="description"
      :placeholder="`${langCode} — banner disclaimer (long)`"
      class="lang-input lang-textarea"
      data-testid="topic-description"
      rows="2"
      @input="onDescription"
    />
  </td>
</template>

<style scoped>
.lang-cell {
  min-inline-size: 14rem;
}

.lang-input {
  width: 100%;
  margin-block-end: 0.25rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
}

.lang-textarea {
  resize: vertical;
  font: inherit;
}
</style>
