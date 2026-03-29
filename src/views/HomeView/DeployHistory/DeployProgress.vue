<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  readonly deployDate: string
  readonly isLatest: boolean
}>()

const status = ref<'checking' | 'building' | 'done'>('done')
let timer: ReturnType<typeof setInterval> | undefined

const poll = async () => {
  const r = await fetch('/api/deploy')
  if (!r.ok) return
  const d: { createdOn: string } = await r.json()
  const deployTs = new Date(props.deployDate).getTime()
  const latestTs = new Date(d.createdOn).getTime()
  status.value = latestTs >= deployTs ? 'done' : 'building'
  if (status.value === 'done' && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(() => {
  if (!props.isLatest) return
  status.value = 'checking'
  poll()
  timer = setInterval(poll, 8000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <aside v-if="status !== 'done'" class="progress" :class="status" />
</template>

<style scoped>
.progress {
  height: 3px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.checking {
  background: var(--color-border);
}

.building {
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-primary-light, hsl(14deg 90% 65%)) 50%,
    var(--color-primary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
