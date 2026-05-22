<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import type { LinkField } from './draft-ops'
import {
  emptyEntry,
  isValidEntry,
  setDescription,
  setField,
  setInRing,
} from './draft-ops'
import LinkRow from './LinkRow.vue'
import LinksActions from './LinksActions.vue'

const props = defineProps<{
  readonly entries: readonly LinkEntry[]
  readonly groups: readonly string[]
  readonly languages: readonly LanguageEntry[]
  readonly saving?: boolean
}>()

const emit = defineEmits<{
  save: [entries: readonly LinkEntry[]]
}>()

const draft = ref<LinkEntry[]>([])

watch(
  () => props.entries,
  val => {
    draft.value = val.map(e => ({ ...e, descriptions: { ...e.descriptions } }))
  },
  { immediate: true }
)

const handleField = (i: number, field: LinkField, v: string) => {
  draft.value = setField(draft.value, i, field, v)
}

const handleRing = (i: number, v: boolean) => {
  draft.value = setInRing(draft.value, i, v)
}

const handleDescription = (i: number, lang: string, v: string) => {
  draft.value = setDescription(draft.value, i, lang, v)
}

const removeLink = (i: number) => {
  draft.value = draft.value.filter((_, idx) => idx !== i)
}

const addLink = () => {
  draft.value = [...draft.value, emptyEntry()]
}

const handleSave = () => {
  emit('save', draft.value.filter(isValidEntry))
}
</script>

<template>
  <ul class="link-list" data-testid="links-editor">
    <LinkRow
      v-for="(entry, i) in draft"
      :key="i"
      :entry="entry"
      :index="i"
      :groups="groups"
      :languages="languages"
      @field="handleField"
      @ring="handleRing"
      @description="handleDescription"
      @remove="removeLink"
    />
  </ul>
  <LinksActions
    :saving="saving"
    @add="addLink"
    @save="handleSave"
  />
</template>

<style scoped>
.link-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
