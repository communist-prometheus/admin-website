<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  readonly deployDate: string
  readonly isLatest: boolean
}>()

const status = ref<'idle' | 'building' | 'done'>('idle')
let timer: ReturnType<typeof setInterval> | undefined

const poll = async () => {
  const r = await fetch('/api/deploy')
  if (!r.ok) return
  const d: { createdOn: string } = await r.json()
  const latestTs = new Date(d.createdOn).getTime()
  const deployTs = new Date(props.deployDate).getTime()
  if (latestTs >= deployTs) {
    status.value = 'done'
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  } else {
    status.value = 'building'
  }
}

onMounted(() => {
  if (!props.isLatest) {
    status.value = 'done'
    return
  }
  status.value = 'building'
  poll()
  timer = setInterval(poll, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <aside class="progress-wrap">
    <span class="label">{{ status }}</span>
    <span class="bar" :class="status" />
  </aside>
</template>

<style scoped>
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.25rem;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 4rem;
}

.bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background 0.3s ease;
}

.bar.building {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-light, hsl(14deg 90% 65%)),
    var(--color-primary)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.bar.done {
  background: hsl(140deg 60% 45%);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
