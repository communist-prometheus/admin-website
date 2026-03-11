<script setup lang="ts">
defineProps<{
  readonly activeTab: 'logs' | 'metrics'
}>()

defineEmits<{
  readonly select: [tab: 'logs' | 'metrics']
}>()
</script>

<template>
  <nav class="sw-tab-bar" data-testid="sw-tab-bar">
    <button
      type="button"
      :class="{ active: activeTab === 'logs' }"
      @click="$emit('select', 'logs')"
    >
      Logs
    </button>
    <button
      type="button"
      :class="{ active: activeTab === 'metrics' }"
      @click="$emit('select', 'metrics')"
    >
      Metrics
    </button>
  </nav>
</template>

<style scoped>
.sw-tab-bar {
  display: flex;
  gap: 0;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
}

.sw-tab-bar button {
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.3em 1em;
  font-size: 0.75rem;
  font-family: monospace;
  cursor: pointer;
}

.sw-tab-bar .active {
  color: #4fc3f7;
  border-bottom-color: #4fc3f7;
}

.sw-tab-bar button:hover {
  color: #e0e0e0;
}
</style>
