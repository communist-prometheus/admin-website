<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LanguageEntry } from '@/stores/settings'
import LanguagesActions from './LanguagesActions.vue'
import LanguagesTable from './LanguagesTable.vue'

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
  val => { draft.value = val.map(l => ({ ...l })) },
  { immediate: true }
)

/** @param index - Row index */
const removeLanguage = (index: number) => {
  draft.value = draft.value.filter((_, i) => i !== index)
}

/**
 * Update a field in a draft entry.
 * @param index - Row index
 * @param value - New value
 * @param field - Field name
 */
const updateCode = (index: number, value: string) => {
  draft.value = draft.value.map((e, i) =>
    i === index ? { ...e, code: value } : e
  )
}

/**
 * Update label field.
 * @param index - Row index
 * @param value - New value
 */
const updateLabel = (index: number, value: string) => {
  draft.value = draft.value.map((e, i) =>
    i === index ? { ...e, label: value } : e
  )
}

const addLanguage = () => {
  draft.value = [...draft.value, { code: '', label: '' }]
}

const handleSave = () => {
  emit(
    'save',
    draft.value.filter(l => l.code.trim() && l.label.trim())
  )
}
</script>

<template>
  <LanguagesTable
    :languages="draft"
    data-testid="languages-editor"
    @update:code="updateCode"
    @update:label="updateLabel"
    @remove="removeLanguage"
  />
  <LanguagesActions
    :saving="saving"
    @add="addLanguage"
    @save="handleSave"
  />
</template>
