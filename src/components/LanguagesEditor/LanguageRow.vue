<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import LanguageCodeInput from './LanguageCodeInput.vue'
import LanguageLabelInput from './LanguageLabelInput.vue'
import RemoveButton from './RemoveButton.vue'

defineProps<{ readonly entry: LanguageEntry }>()

const emit = defineEmits<{
  'update:code': [value: string]
  'update:label': [value: string]
  remove: []
}>()
</script>

<template>
  <LanguageCodeInput
    :value="entry.code"
    @input="emit('update:code', $event)"
  />
  <LanguageLabelInput
    :value="entry.label"
    @input="emit('update:label', $event)"
  />
  <RemoveButton @click="emit('remove')" />
</template>
