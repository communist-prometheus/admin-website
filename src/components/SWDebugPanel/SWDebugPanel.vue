<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSWLogs } from '@/composables/useSWBridge/use-sw-logs'
import { useSWStatus } from '@/composables/useSWBridge/use-sw-status'
import SWActions from './SWActions.vue'
import SWLogList from './SWLogList.vue'
import SWStatusBar from './SWStatusBar.vue'

const visible = ref(false)
const { entries } = useSWLogs()
const { status, error, refresh } = useSWStatus()

const toggle = () => {
  visible.value = !visible.value
  if (visible.value) refresh()
}

onMounted(() => {
  globalThis.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      toggle()
    }
  })
})
</script>

<template>
  <aside
    v-if="visible"
    class="sw-debug-panel"
    data-testid="sw-debug-panel"
  >
    <SWStatusBar :status="status" :error="error" />
    <SWActions @refresh="refresh" @close="toggle" />
    <SWLogList :entries="entries" />
  </aside>
</template>

<style scoped>
.sw-debug-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  z-index: 9999;
  background: #111;
  color: #e0e0e0;
  border-top: 2px solid #4fc3f7;
  display: flex;
  flex-direction: column;
}
</style>
