<script setup lang="ts">
import SWOpLine from './SWOpLine.vue'

defineProps<{
  readonly ops: readonly {
    readonly name: string
    readonly count: number
    readonly avg: number
    readonly total: number
  }[]
}>()
</script>

<template>
  <ul class="sw-ops-list">
    <SWOpLine
      v-for="op in ops"
      :key="op.name"
      v-bind="op"
    />
  </ul>
</template>

<style scoped>
.sw-ops-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
