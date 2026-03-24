<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem } from '@/types/content'
import ItemHeader from './ItemHeader.vue'
import ItemMeta from './ItemMeta.vue'

const props = defineProps<{
  readonly item: ContentItem
  readonly selected: boolean
  readonly hideDelete?: boolean
}>()

const emit = defineEmits<{ click: []; delete: [] }>()

const fm = computed(() => props.item.frontmatter)

const formattedDate = computed(() => {
  const date = fm.value.pubDate
  if (!date) return undefined
  const d = date instanceof Date ? date : new Date(String(date))
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
})

const category = computed(() => {
  const v = fm.value.category
  return typeof v === 'string' ? v : undefined
})

const order = computed(() => {
  const v = fm.value.order
  return typeof v === 'number' ? v : undefined
})

const description = computed(() => {
  const v = fm.value.description
  return typeof v === 'string' ? v : undefined
})
</script>

<template>
  <div
    class="content-item"
    :class="{ selected }"
    data-testid="content-item"
    @click="emit('click')"
  >
    <ItemHeader
      :title="String(item.frontmatter.title ?? '')"
      :lang="item.lang"
      :show-delete="!hideDelete"
      @delete="emit('delete')"
    />
    <p
      v-if="description"
      class="item-description"
    >
      {{ description }}
    </p>
    <ItemMeta
      :date="formattedDate"
      :category="category"
      :order="order"
    />
  </div>
</template>

<style scoped>
.content-item {
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.2s ease;
}

.content-item.selected {
  background: var(--color-background-mute);
  border-color: var(--color-heading);
}

.content-item:hover {
  background: var(--color-background-soft);
  border-color: var(--color-heading);

  :deep(.delete-btn) {
    visibility: visible;
  }
}

.item-description {
  margin: 0 0 clamp(0.5rem, 1.5vw, 0.75rem);
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

</style>
