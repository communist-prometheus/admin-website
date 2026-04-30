<script setup lang="ts">
import { TRACE_OVERLAY_TEST_IDS } from './test-ids'

defineEmits<{ readonly close: [] }>()
</script>

<template>
  <header class="head">
    <strong>Traces</strong>
    <button
      type="button"
      :data-testid="TRACE_OVERLAY_TEST_IDS.close"
      aria-label="Close trace overlay"
      @click="$emit('close')"
    >
      ×
    </button>
  </header>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom: 1px solid #1a2230;
}

.head button {
  background: transparent;
  border: 0;
  color: #ddd;
  font-size: 16px;
  cursor: pointer;
}
</style>
