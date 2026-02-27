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
}>()

const emit = defineEmits<{
  select: [item: ContentItem]
  create: []
}>()

const filteredItems = computed(() =>
  props.items.filter(item => item.lang === props.selectedLang)
)
</script>

<template>
  <div class="content-list" data-testid="content-list">
    <ContentListHeader @create="emit('create')" />
    <ContentListEmpty
      v-if="filteredItems.length === 0"
      :lang="selectedLang"
    />
    <ContentListItem
      v-for="item in filteredItems"
      v-else
      :key="item.path"
      :item="item"
      :selected="selectedPath === item.path"
      @click="emit('select', item)"
    />
  </div>
</template>

<style scoped>
.content-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
  height: 100%;
  overflow-y: auto;
}
</style>
