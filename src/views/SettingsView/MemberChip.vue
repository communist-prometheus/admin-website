<script setup lang="ts">
defineProps<{ readonly username: string }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <span class="member-chip">
    {{ username }}
    <button type="button" aria-label="Remove" @click="$emit('remove')">
      ×
    </button>
  </span>
</template>

<style scoped>
.member-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  margin: 0.125rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

button {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.125rem;
}

button:hover {
  color: var(--color-error, #e53935);
}
</style>
