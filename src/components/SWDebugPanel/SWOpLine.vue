<script setup lang="ts">
defineProps<{
  readonly name: string
  readonly count: number
  readonly avg: number
  readonly total: number
}>()
</script>

<template>
  <li class="sw-op-line">
    <span class="op-name">{{ name }}</span>
    <span class="op-stat">{{ count }}x</span>
    <span class="op-stat">avg {{ avg }}ms</span>
    <span class="op-stat accent">{{ total }}ms</span>
  </li>
</template>

<style scoped>
.sw-op-line {
  display: flex;
  gap: 1em;
  padding: 0.15em 0;
  font-family: monospace;
  font-size: 0.75rem;
}

.op-name {
  min-width: 10em;
  color: #e0e0e0;
}

.op-stat {
  color: #888;
  min-width: 6em;
  text-align: right;
}

.op-stat.accent {
  color: #a5d6a7;
}
</style>
