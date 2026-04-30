<script setup lang="ts">
import { DRAWER_TEST_IDS } from './test-ids'

defineEmits<{
  readonly markRead: []
  readonly clear: []
  readonly close: []
}>()
</script>

<template>
  <header class="drawer-header">
    <strong class="drawer-title">Notifications</strong>
    <button
      type="button"
      :data-testid="DRAWER_TEST_IDS.markAllRead"
      @click="$emit('markRead')"
    >
      Mark all read
    </button>
    <button
      type="button"
      :data-testid="DRAWER_TEST_IDS.clearAll"
      @click="$emit('clear')"
    >
      Clear all
    </button>
    <button
      type="button"
      aria-label="Close notifications drawer"
      :data-testid="DRAWER_TEST_IDS.close"
      @click="$emit('close')"
    >
      ×
    </button>
  </header>
</template>

<style scoped>
.drawer-header {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.drawer-title {
  font-size: 1rem;
  margin-right: auto;
}
</style>
