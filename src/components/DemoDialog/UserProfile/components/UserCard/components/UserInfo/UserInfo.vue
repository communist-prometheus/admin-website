<script setup lang="ts">
defineProps<{
  name: string | undefined
  username: string
}>()
</script>

<template>
  <strong class="user-name">{{ name || username }}</strong>
  <span class="user-handle">@{{ username }}</span>
</template>

<style scoped>
:host {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: var(--font-weight-semibold);
  display: block;
}

.user-handle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
