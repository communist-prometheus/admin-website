<script setup lang="ts">
import type { DeployInfo } from '@/composables/useDeployStatus'

defineProps<{ readonly info: DeployInfo }>()

const label: Record<string, string> = {
  idle: '',
  building: 'Building site...',
  success: 'Site deployed',
  'not-found': 'Checking deploy...',
}
</script>

<template>
  <aside
    v-if="info.stage !== 'idle'"
    class="deploy-bar"
    :class="info.stage"
  >
    <span class="dot" />
    {{ label[info.stage] }}
    <time v-if="info.createdOn" class="time">
      {{ new Date(info.createdOn).toLocaleTimeString() }}
    </time>
  </aside>
</template>

<style scoped>
.deploy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fab);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  transition: background var(--transition-base);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.not-found { background: var(--color-surface); }

.building { background: hsl(40deg 80% 20%); }

.success { background: hsl(140deg 50% 15%); }

.not-found .dot { background: hsl(0deg 0% 60%); }

.building .dot { background: hsl(40deg 90% 55%); }

.success .dot {
  background: hsl(140deg 70% 50%);
  animation: none;
}

.time {
  margin-left: auto;
  opacity: 70%;
}

@keyframes pulse {
  0%, 100% { opacity: 100%; }
  50% { opacity: 30%; }
}
</style>
