<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  readonly frontmatter: Record<string, unknown>
  readonly coverUrl?: string
}>()

const text = (key: string) => {
  const v = props.frontmatter[key]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

const title = computed(() => text('title'))
const category = computed(() => text('category'))
const publishDate = computed(() => text('publishDate'))
</script>

<template>
  <header class="preview-header">
    <img
      v-if="coverUrl"
      class="cover"
      :src="coverUrl"
      alt=""
    >
    <p v-if="category" class="category">
      {{ category }}
    </p>
    <h1 v-if="title">
      {{ title }}
    </h1>
    <time v-if="publishDate" class="date">
      {{ publishDate }}
    </time>
  </header>
</template>

<style scoped>
.preview-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.cover {
  width: 100%;
  border-radius: var(--radius-md);
}

.category {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  margin: 0;
}

.date {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
