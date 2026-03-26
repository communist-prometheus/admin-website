<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import {
  emptyLabel,
  isValidEntry,
  updateKey,
  updateTranslation,
} from './draft-ops'
import LabelsActions from './LabelsActions.vue'
import LabelsTable from './LabelsTable.vue'

const props = defineProps<{
  readonly labels: readonly LabelEntry[]
  readonly languages: readonly LanguageEntry[]
  readonly saving?: boolean
}>()

const emit = defineEmits<{
  save: [entries: readonly LabelEntry[]]
}>()

const draft = ref<LabelEntry[]>([])

watch(
  () => props.labels,
  val => {
    draft.value = val.map(l => ({
      ...l,
      translations: { ...l.translations },
    }))
  },
  { immediate: true }
)

const handleUpdateKey = (i: number, v: string) => {
  draft.value = updateKey(draft.value, i, v)
}

const handleUpdateTranslation = (
  i: number,
  lang: string,
  v: string
) => {
  draft.value = updateTranslation(draft.value, i, lang, v)
}

const removeLabel = (index: number) => {
  draft.value = draft.value.filter((_, i) => i !== index)
}

const addLabel = () => {
  draft.value = [...draft.value, emptyLabel()]
}

const handleSave = () => {
  emit('save', draft.value.filter(isValidEntry))
}
</script>

<template>
  <LabelsTable
    :labels="draft"
    :languages="languages"
    data-testid="labels-editor"
    @update-key="handleUpdateKey"
    @update-translation="handleUpdateTranslation"
    @remove="removeLabel"
  />
  <LabelsActions
    :saving="saving"
    @add="addLabel"
    @save="handleSave"
  />
</template>
