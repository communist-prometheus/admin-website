<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem, Language } from '@/types/content'
import ContentListEmpty from './ContentListEmpty.vue'
import ContentListHeader from './ContentListHeader.vue'
import ContentListItem from './ContentListItem.vue'
import { sortByDateNewestFirst } from './sort-by-date'

const props = defineProps<{
  readonly items: readonly ContentItem[]
  readonly selectedLang: Language
  readonly selectedPath: string | null
  readonly loading?: boolean
  readonly hideCreate?: boolean
  readonly hideDelete?: boolean
  readonly deletingSlugs?: ReadonlySet<string>
  readonly selectMode?: boolean
  readonly selectedSlugs?: ReadonlySet<string>
}>()

const emit = defineEmits<{
  select: [item: ContentItem]
  create: []
  delete: [item: ContentItem]
  enterSelect: []
  exitSelect: []
  bulkDelete: []
  toggleSelect: [slug: string]
}>()

const filteredItems = computed(() =>
  sortByDateNewestFirst(
    props.items.filter(item => item.lang === props.selectedLang)
  )
)

const selectedCount = computed(() => props.selectedSlugs?.size ?? 0)
</script>

<template>
  <section class="content-list" data-testid="content-list">
    <ContentListHeader
      v-if="!hideCreate"
      :select-mode="selectMode"
      :selected-count="selectedCount"
      @create="emit('create')"
      @enter-select="emit('enterSelect')"
      @exit-select="emit('exitSelect')"
      @bulk-delete="emit('bulkDelete')"
    />
    <output v-if="loading" class="loading">Loading content...</output>
    <ContentListEmpty
      v-else-if="filteredItems.length === 0"
      :lang="selectedLang"
    />
    <ContentListItem
      v-for="item in filteredItems"
      v-else
      :key="item.path"
      :item="item"
      :selected="selectedPath === item.path"
      :hide-delete="hideDelete"
      :deleting="deletingSlugs?.has(item.slug) ?? false"
      :select-mode="selectMode ?? false"
      :checked="selectedSlugs?.has(item.slug) ?? false"
      @click="
        selectMode ? emit('toggleSelect', item.slug) : emit('select', item)
      "
      @delete="emit('delete', item)"
    />
  </section>
</template>

<style scoped>
.content-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
  height: 100%;
  overflow-y: auto;
}

.loading {
  padding: clamp(1rem, 3vw, 2rem);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
