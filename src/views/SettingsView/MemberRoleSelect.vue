<script setup lang="ts">
import type { Role } from '@/types/role'

const props = defineProps<{
  readonly value: Role | undefined
  readonly disabled: boolean
  readonly ariaLabel: string
  readonly testid: string
}>()

const emit = defineEmits<{ change: [role: Role | undefined] }>()

const onChange = (e: Event) => {
  const raw = (e.target as HTMLSelectElement).value
  emit('change', raw === '' ? undefined : (raw as Role))
}

const options: readonly { readonly v: string; readonly label: string }[] = [
  { v: '', label: '— no role —' },
  { v: 'editor', label: 'Editor' },
  { v: 'chief-editor', label: 'Chief Editor' },
  { v: 'admin', label: 'Admin' },
]

// Keep props referenced so template reads them via the runtime.
void props
void options
</script>

<template>
  <select
    class="role-select"
    :value="value ?? ''"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :data-testid="testid"
    @change="onChange"
  >
    <option v-for="o in options" :key="o.v" :value="o.v">{{ o.label }}</option>
  </select>
</template>

<style scoped>
.role-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}
</style>
