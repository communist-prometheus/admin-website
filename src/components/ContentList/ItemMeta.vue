<script setup lang="ts">
defineProps<{
  date?: string
  category?: string
}>()
</script>

<template>
  <footer class="item-meta">
    <span
      v-if="date"
      class="meta-date"
    >
      {{ date }}
    </span>
    <span
      v-if="category"
      class="meta-category"
    >
      {{ category }}
    </span>
  </footer>
</template>

<style scoped>
.item-meta {
  display: flex;
  gap: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  color: var(--color-text-secondary);
}

.meta-date,
.meta-category {
  &::before {
    content: '•';
    margin-right: clamp(0.375rem, 1vw, 0.5rem);
  }

  &:first-child::before {
    content: '';
    margin: 0;
  }
}
</style>
