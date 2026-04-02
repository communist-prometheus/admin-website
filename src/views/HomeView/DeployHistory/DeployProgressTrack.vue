<script setup lang="ts">
const props = defineProps<{
  readonly status: string
  readonly conclusion: string | undefined
  readonly progress: number
}>()

const fillStyle = () => {
  const bg =
    props.status === 'completed'
      ? props.conclusion === 'success'
        ? 'hsl(140deg 60% 45%)'
        : 'hsl(0deg 60% 50%)'
      : 'var(--color-primary)'
  return { width: `${props.progress}%`, background: bg }
}
</script>

<template>
  <aside class="deploy-track" role="progressbar" :aria-valuenow="progress">
    <span class="deploy-fill" :style="fillStyle()" />
  </aside>
</template>

<style scoped>
.deploy-track {
  height: 6px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.deploy-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 1s linear;
}
</style>
