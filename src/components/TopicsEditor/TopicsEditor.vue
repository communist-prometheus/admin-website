<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LanguageEntry } from '@/stores/settings'
import type { TopicEntry } from '@/stores/topics'
import {
  cloneTopic,
  emptyTopic,
  isValidEntry,
  updateColor,
  updateDescription,
  updateKey,
  updateName,
  updateSubtitle,
} from './draft-ops'
import TopicsActions from './TopicsActions.vue'
import TopicsTable from './TopicsTable.vue'

const props = defineProps<{
  readonly topics: readonly TopicEntry[]
  readonly languages: readonly LanguageEntry[]
  readonly saving?: boolean
}>()

const emit = defineEmits<{
  save: [entries: readonly TopicEntry[]]
}>()

const draft = ref<TopicEntry[]>([])
const set = (next: TopicEntry[]) => {
  draft.value = next
}

watch(
  () => props.topics,
  val => set(val.map(cloneTopic)),
  { immediate: true }
)

const onKey = (i: number, v: string) => set(updateKey(draft.value, i, v))
const onColor = (i: number, v: string) => set(updateColor(draft.value, i, v))
const onName = (i: number, l: string, v: string) =>
  set(updateName(draft.value, i, l, v))
const onSubtitle = (i: number, l: string, v: string) =>
  set(updateSubtitle(draft.value, i, l, v))
const onDescription = (i: number, l: string, v: string) =>
  set(updateDescription(draft.value, i, l, v))
const removeTopic = (i: number) => set(draft.value.filter((_, j) => j !== i))
const addTopic = () => set([...draft.value, emptyTopic()])
const handleSave = () => emit('save', draft.value.filter(isValidEntry))
</script>

<template>
  <TopicsTable
    :topics="draft"
    :languages="languages"
    @update-key="onKey"
    @update-color="onColor"
    @update-name="onName"
    @update-subtitle="onSubtitle"
    @update-description="onDescription"
    @remove="removeTopic"
  />
  <TopicsActions
    :saving="saving"
    @add="addTopic"
    @save="handleSave"
  />
</template>
