<script setup lang="ts">
defineProps<{
  readonly status: string
  readonly conclusion: string | undefined
  readonly progress: number
  readonly elapsed: string
}>()

const label = (s: string, c: string | undefined) =>
  s === 'completed' ? (c ?? 'done') : s
</script>

<template>
  <DeployProgressInfo
    :label="label(status, conclusion)"
    :elapsed="elapsed"
  />
  <DeployProgressTrack :status="status" :progress="progress" />
</template>
