<script setup lang="ts">
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import LabelKeyInput from './LabelKeyInput.vue'
import LabelRemoveButton from './LabelRemoveButton.vue'
import LabelTranslationInput from './LabelTranslationInput.vue'

const props = defineProps<{
  readonly entry: LabelEntry
  readonly languages: readonly LanguageEntry[]
}>()

const emit = defineEmits<{
  'update-key': [value: string]
  'update-translation': [lang: string, value: string]
  remove: []
}>()
</script>

<template>
  <tr data-testid="label-row">
    <LabelKeyInput
      :value="props.entry.key"
      @input="emit('update-key', $event)"
    />
    <LabelTranslationInput
      v-for="lang in props.languages"
      :key="lang.code"
      :value="props.entry.translations[lang.code] ?? ''"
      :lang-code="lang.code"
      :lang-label="lang.label"
      @input="emit('update-translation', lang.code, $event)"
    />
    <LabelRemoveButton @click="emit('remove')" />
  </tr>
</template>
