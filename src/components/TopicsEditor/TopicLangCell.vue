<script setup lang="ts">
const props = defineProps<{
  readonly name: string
  readonly subtitle: string
  readonly langCode: string
  readonly langLabel: string
}>()

const emit = defineEmits<{
  'update-name': [value: string]
  'update-subtitle': [value: string]
}>()

const onName = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLInputElement) emit('update-name', target.value)
}

const onSubtitle = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLInputElement) emit('update-subtitle', target.value)
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
      :placeholder="`${langCode} — subtitle`"
      class="lang-input"
      data-testid="topic-subtitle"
      @input="onSubtitle"
    />
  </td>
</template>

<style scoped>
.lang-cell {
  min-inline-size: 12rem;
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
</style>
