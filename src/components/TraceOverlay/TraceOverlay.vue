<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { listAllSpans } from '@/composables/useTracing'
import { groupByTrace } from './group-by-trace'
import OverlayHeader from './OverlayHeader.vue'
import TraceList from './TraceList.vue'
import TraceWaterfall from './TraceWaterfall.vue'
import { TRACE_OVERLAY_TEST_IDS } from './test-ids'

const visible = ref(false)
const tick = ref(0)
const activeTraceId = ref<string | undefined>(undefined)

const groups = computed(() => {
  void tick.value
  return groupByTrace(listAllSpans())
})
const activeSpans = computed(
  () =>
    groups.value.find(g => g.traceId === activeTraceId.value)?.spans ??
    groups.value[0]?.spans ??
    []
)

const onKey = (e: KeyboardEvent): void => {
  const match = e.ctrlKey && e.shiftKey && e.key === 'T'
  const fire = match
    ? () => {
        e.preventDefault()
        visible.value = !visible.value
        tick.value += 1
      }
    : (): void => undefined
  fire()
}

const onSelect = (id: string): void => {
  activeTraceId.value = id
}
const close = (): void => {
  visible.value = false
}

onMounted(() => {
  globalThis.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  globalThis.removeEventListener('keydown', onKey)
})
</script>

<template>
  <aside
    v-if="visible"
    class="overlay"
    :data-testid="TRACE_OVERLAY_TEST_IDS.root"
    role="dialog"
    aria-modal="false"
    aria-label="Local trace overlay"
  >
    <OverlayHeader @close="close" />
    <p
      v-if="groups.length === 0"
      class="empty"
      :data-testid="TRACE_OVERLAY_TEST_IDS.empty"
    >
      No traces recorded yet.
    </p>
    <TraceList
      v-else
      :groups="groups"
      :active-id="activeTraceId"
      @select="onSelect"
    />
    <TraceWaterfall v-if="groups.length > 0" :spans="activeSpans" />
  </aside>
</template>

<style scoped>
.overlay {
  position: fixed;
  bottom: 0;
  right: 0;
  width: min(520px, 100vw);
  height: 320px;
  z-index: 9997;
  background: #0d1520;
  color: #ddd;
  border-top: 2px solid #4fc3f7;
  border-left: 2px solid #4fc3f7;
  border-top-left-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  overflow-y: auto;
}

.empty {
  color: #888;
  font-size: 12px;
  padding: 12px;
  text-align: center;
}
</style>
