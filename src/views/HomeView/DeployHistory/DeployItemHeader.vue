<script setup lang="ts">
defineProps<{ readonly message: string }>()
</script>

<template>
  <header class="deploy-header">
    <span class="commit-msg">{{ message }}</span>
  </header>
</template>

<style scoped>
.deploy-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.commit-msg {
  font-weight: 600;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
