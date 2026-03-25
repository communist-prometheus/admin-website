<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem, Language } from '@/types/content'
import ContentListEmpty from './ContentListEmpty.vue'
import ContentListHeader from './ContentListHeader.vue'
import ContentListItem from './ContentListItem.vue'

const props = defineProps<{
  readonly items: readonly ContentItem[]
  readonly selectedLang: Language
  readonly selectedPath: string | null
  readonly loading?: boolean
  readonly hideCreate?: boolean
  readonly hideDelete?: boolean
}>()

const emit = defineEmits<{
  select: [item: ContentItem]
  create: []
  delete: [item: ContentItem]
}>()

const filteredItems = computed(() =>
  props.items.filter(item => item.lang === props.selectedLang)
)
</script>

<template>
  <section class="content-list" data-testid="content-list">
    <ContentListHeader v-if="!hideCreate" @create="emit('create')" />
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
      @click="emit('select', item)"
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
