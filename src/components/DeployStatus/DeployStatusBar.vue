<script setup lang="ts">
import type { DeployInfo } from '@/composables/useDeployStatus'

defineProps<{ readonly info: DeployInfo }>()
</script>

<template>
  <aside
    v-if="info.stage !== 'idle'"
    class="deploy-bar"
    :class="info.stage"
  />
</template>

<style scoped>
.deploy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fab);
  height: 3px;
  transform: translateY(100%);
  animation: slide-in 0.3s ease-out forwards;
}

.building {
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-primary-light, hsl(14deg 90% 65%)) 50%,
    var(--color-primary) 100%
  );
  background-size: 200% 100%;
  animation:
    slide-in 0.3s ease-out forwards,
    shimmer 1.5s ease-in-out infinite;
}

.success {
  background: linear-gradient(
    90deg,
    hsl(140deg 60% 40%),
    hsl(140deg 70% 50%),
    hsl(140deg 60% 40%)
  );
}

.not-found {
  background: var(--color-border);
}

@keyframes slide-in {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
