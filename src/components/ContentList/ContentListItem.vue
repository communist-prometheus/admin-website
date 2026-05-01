<script setup lang="ts">
import { computed } from 'vue'
import { useLabelsStore } from '@/stores/labels'
import { resolveLabel } from '@/stores/resolve-label'
import type { ContentItem } from '@/types/content'
import ItemHeader from './ItemHeader.vue'
import ItemMeta from './ItemMeta.vue'

const props = defineProps<{
  readonly item: ContentItem
  readonly selected: boolean
  readonly hideDelete?: boolean
  readonly deleting?: boolean
  readonly selectMode?: boolean
  readonly checked?: boolean
}>()

const emit = defineEmits<{ click: []; delete: [] }>()

const fm = computed(() => props.item.frontmatter)
const labelsStore = useLabelsStore()

const formattedDate = computed(() => {
  const date = fm.value.publishDate
  if (!date) return undefined
  const d = date instanceof Date ? date : new Date(String(date))
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
})

const category = computed(() => {
  const key = fm.value.category
  if (typeof key !== 'string') return undefined
  return resolveLabel(
    key,
    props.item.lang,
    labelsStore.labels
  )
})

const description = computed(() => {
  const v = fm.value.description
  return typeof v === 'string' ? v : undefined
})
</script>

<template>
  <article
    class="content-item"
    :class="{ selected, deleting, 'in-select': selectMode, checked }"
    :inert="deleting || undefined"
    data-testid="content-item"
    :data-selected="checked ? 'true' : undefined"
    @click="emit('click')"
  >
    <ItemHeader
      :title="String(item.frontmatter.title ?? '')"
      :lang="item.lang"
      :show-delete="!hideDelete && !selectMode"
      :show-checkbox="selectMode ?? false"
      :checked="checked ?? false"
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
    />
  </article>
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

/*
 * Optimistic-deletion fade. Mounted via :class="{ deleting }".
 * `inert` blocks pointer events so a half-faded row cannot
 * intercept clicks, but the surrounding list still scrolls and
 * other items remain fully interactive — that's what makes the
 * delete feel non-blocking.
 */
.content-item.deleting {
  pointer-events: none;
  animation: content-item-fade-out 320ms ease-out forwards;
}

@keyframes content-item-fade-out {
  0% {
    opacity: 100%;
    transform: translateX(0);
  }

  100% {
    opacity: 0%;
    transform: translateX(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-item.deleting {
    animation-duration: 0.01ms;
  }
}

.content-item.selected {
  background: var(--color-background-mute);
  border-color: var(--color-heading);
}

.content-item.in-select {
  cursor: default;
}

.content-item.checked {
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-background)
  );
  border-color: var(--color-accent);
}

@media (hover: none) {
  .content-item :deep(.delete-btn) {
    visibility: visible;
  }
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
