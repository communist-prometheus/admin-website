<script setup lang="ts">
defineProps<{
  date?: string
  category?: string
  order?: number
}>()
</script>

<template>
  <div class="item-meta">
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
    <span
      v-if="order !== undefined"
      class="meta-order"
    >
      Order: {{ order }}
    </span>
  </div>
</template>

<style scoped>
.item-meta {
  display: flex;
  gap: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  color: var(--color-text-secondary);
}

.meta-date,
.meta-category,
.meta-order {
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
