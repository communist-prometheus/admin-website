<script setup lang="ts">
const props = defineProps<{
  readonly label: string
  readonly modelValue: string
  readonly required?: boolean
  readonly placeholder?: string
  readonly rows?: number
}>()

defineEmits<{ 'update:modelValue': [v: string] }>()

const labelText = props.required ? `${props.label} *` : props.label
</script>

<template>
  <label class="template-field">
    <span class="label">{{ labelText }}</span>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 3"
      class="input"
      @input="
        $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
    />
  </label>
</template>

<style scoped>
.template-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  box-sizing: border-box;
}
</style>
