<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LanguageEntry } from '@/stores/settings'

const props = defineProps<{
  readonly languages: readonly LanguageEntry[]
  readonly saving?: boolean
}>()

const emit = defineEmits<{
  save: [entries: readonly LanguageEntry[]]
}>()

const draft = ref<LanguageEntry[]>([])

watch(
  () => props.languages,
  (val) => {
    draft.value = val.map((l) => ({ ...l }))
  },
  { immediate: true }
)

const addLanguage = () => {
  draft.value = [...draft.value, { code: '', label: '' }]
}

const removeLanguage = (index: number) => {
  draft.value = draft.value.filter((_, i) => i !== index)
}

const updateField = (index: number, field: 'code' | 'label', value: string) => {
  draft.value = draft.value.map((entry, i) =>
    i === index ? { ...entry, [field]: value } : entry
  )
}

const handleSave = () => {
  const valid = draft.value.filter((l) => l.code.trim() && l.label.trim())
  emit('save', valid)
}
</script>

<template>
  <div class="languages-editor" data-testid="languages-editor">
    <table class="lang-table" data-testid="languages-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Label</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, index) in draft"
          :key="index"
          data-testid="language-row"
        >
          <td>
            <input
              :value="entry.code"
              type="text"
              placeholder="en"
              maxlength="5"
              class="code-input"
              data-testid="language-code"
              @input="updateField(index, 'code', ($event.target as HTMLInputElement).value)"
            />
          </td>
          <td>
            <input
              :value="entry.label"
              type="text"
              placeholder="English"
              class="label-input"
              data-testid="language-label"
              @input="updateField(index, 'label', ($event.target as HTMLInputElement).value)"
            />
          </td>
          <td>
            <button
              type="button"
              class="remove-btn"
              data-testid="remove-language"
              @click="removeLanguage(index)"
            >
              &times;
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="actions">
      <button
        type="button"
        class="add-btn"
        data-testid="add-language"
        @click="addLanguage"
      >
        + Add Language
      </button>
      <button
        type="button"
        class="save-btn"
        data-testid="save-languages"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.languages-editor {
  max-width: 500px;
}

.lang-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

td {
  padding: 0.25rem 0.5rem;
}

.code-input {
  width: 4rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono, monospace);
  background: var(--color-bg);
  color: var(--color-text);
}

.label-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);

  &:hover {
    color: var(--color-danger, #e53e3e);
    background: var(--color-surface);
  }
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);

  &:hover {
    background: var(--color-surface-hover, var(--color-border));
  }
}

.save-btn {
  padding: 0.5rem 1.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent, white);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
