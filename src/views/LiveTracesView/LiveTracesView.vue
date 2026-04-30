<script setup lang="ts">
import { computed, ref } from 'vue'
import { groupByTrace } from '@/components/TraceOverlay/group-by-trace'
import { useTraceStream } from '@/composables/useTracing/use-trace-stream'
import PanelBody from './PanelBody.vue'
import PanelToolbar from './PanelToolbar.vue'
import { useLiveSpans } from './use-live-spans'

const stream = useTraceStream()
const { spans, paused, pause, resume, clear } = useLiveSpans(stream.spans)
const activeId = ref<string | undefined>(undefined)

const groups = computed(() => groupByTrace(spans.value))
const activeSpans = computed(
  () => groups.value.find(g => g.traceId === activeId.value)?.spans ?? []
)

const select = (id: string): void => {
  activeId.value = id
}
</script>

<template>
  <main class="live-traces">
    <PanelToolbar
      :status="stream.status.value"
      :paused="paused"
      :count="spans.length"
      @pause="pause"
      @resume="resume"
      @clear="clear"
    />
    <PanelBody
      :groups="groups"
      :active-id="activeId"
      :active-spans="activeSpans"
      @select="select"
    />
  </main>
</template>

<style scoped>
.live-traces {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}
</style>
