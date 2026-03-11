<script setup lang="ts">
defineProps<{
  readonly uptime: string
  readonly cacheRatio: string
}>()
</script>

<template>
  <dl class="sw-metrics-summary">
    <dt>Uptime</dt>
    <dd>{{ uptime }}</dd>
    <dt>Cache</dt>
    <dd>{{ cacheRatio }}</dd>
  </dl>
</template>

<style scoped>
.sw-metrics-summary {
  display: flex;
  gap: 0.5em;
  margin: 0 0 0.5em;
  font-family: monospace;
  font-size: 0.75rem;
}

.sw-metrics-summary dt {
  color: #888;
}

.sw-metrics-summary dd {
  margin: 0 1em 0 0;
  color: #4fc3f7;
}
</style>
