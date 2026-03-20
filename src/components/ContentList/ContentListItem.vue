<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem } from '@/types/content'
import ItemHeader from './ItemHeader.vue'
import ItemMeta from './ItemMeta.vue'

const props = defineProps<{
  readonly item: ContentItem
  readonly selected: boolean
}>()

const emit = defineEmits<{ click: []; delete: [] }>()

const formattedDate = computed(() => {
  if (!('pubDate' in props.item.frontmatter)) return undefined
  const date = props.item.frontmatter.pubDate
  if (!date) return undefined
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
})

const category = computed(() =>
  'category' in props.item.frontmatter
    ? props.item.frontmatter.category
    : undefined
)

const order = computed(() =>
  'order' in props.item.frontmatter
    ? Number(props.item.frontmatter.order)
    : undefined
)

const description = computed(() =>
  'description' in props.item.frontmatter
    ? props.item.frontmatter.description
    : undefined
)
</script>

<template>
  <div
    class="content-item"
    :class="{ selected }"
    data-testid="content-item"
    @click="emit('click')"
  >
    <ItemHeader
      :title="item.frontmatter.title"
      :lang="item.lang"
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
    <button
      type="button"
      class="delete-btn"
      data-testid="delete-item-btn"
      @click.stop="emit('delete')"
    >
      Delete
    </button>
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
}

.item-description {
  margin: 0 0 clamp(0.5rem, 1.5vw, 0.75rem);
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

.delete-btn {
  display: none;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-error, #e53935);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-error, #e53935);
  font-size: clamp(0.75rem, 1.5vw, 0.8rem);
  cursor: pointer;
  align-self: flex-end;
}

.content-item:hover .delete-btn {
  display: block;
}
</style>
