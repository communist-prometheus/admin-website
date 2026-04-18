<script setup lang="ts">
import { log } from '@/composables/useSWBridge/sw-log'

defineEmits<{
  readonly refresh: []
  readonly close: []
}>()

const DB_NAME = 'sw-git'

const resetData = async (): Promise<void> => {
  log('info', 'Resetting all SW data...')

  // Wipe IndexedDB
  await new Promise<void>(resolve => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })

  // Unregister SW
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(regs.map(r => r.unregister()))

  log('info', 'SW data reset complete — reloading')
  globalThis.location.reload()
}

const forceUpdate = async (): Promise<void> => {
  const reg = await navigator.serviceWorker.getRegistration()
  if (reg) {
    log('info', 'Forcing SW update check...')
    await reg.update()
    log('info', 'SW update check done')
  }
}
</script>

<template>
  <nav class="sw-actions" data-testid="sw-actions">
    <button type="button" @click="$emit('refresh')">
      Refresh
    </button>
    <button type="button" class="danger" @click="resetData">
      Reset Data
    </button>
    <button type="button" @click="forceUpdate">
      Force Update
    </button>
    <button type="button" @click="$emit('close')">
      Close
    </button>
  </nav>
</template>

<style scoped>
.sw-actions {
  display: flex;
  gap: 0.5em;
  padding: 0.25em 1em;
  background: #1a1a2e;
}

.sw-actions button {
  background: #333;
  color: #e0e0e0;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 0.2em 0.75em;
  font-size: 0.75rem;
  cursor: pointer;
}

.sw-actions button:hover {
  background: #444;
}

.sw-actions button.danger {
  border-color: hsl(0deg 60% 40%);
  color: hsl(0deg 80% 70%);
}

.sw-actions button.danger:hover {
  background: hsl(0deg 40% 25%);
}
</style>
