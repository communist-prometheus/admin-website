<script setup lang="ts">
defineProps<{
  readonly status: string
  readonly progress: number
}>()
</script>

<template>
  <aside class="track" role="progressbar" :aria-valuenow="progress">
    <span class="fill" :class="status" :style="{ width: `${progress}%` }" />
  </aside>
</template>

<style scoped>
.track {
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 1s linear;
}

.fill.in-progress {
  background: var(--color-primary);
}

.fill.completed {
  background: hsl(140deg 60% 45%);
}

.fill.queued,
.fill.pending {
  background: hsl(40deg 50% 40%);
}
</style>
