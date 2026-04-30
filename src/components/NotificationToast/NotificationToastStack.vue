<script setup lang="ts">
import { computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import NotificationToast from './NotificationToast.vue'
import { TOAST_TEST_IDS } from './test-ids'

const MAX_VISIBLE = 3

const { entries } = useNotifications()
const visible = computed(() => entries.value.slice(-MAX_VISIBLE).reverse())
</script>

<template>
  <output
    :data-testid="TOAST_TEST_IDS.stack"
    class="toast-stack"
    aria-live="polite"
    aria-atomic="false"
  >
    <NotificationToast
      v-for="entry in visible"
      :key="entry.id"
      :entry="entry"
    />
  </output>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: var(--z-toast, 9990);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: max-content;
}

@media (width <= 600px) {
  .toast-stack {
    left: 16px;
    right: 16px;
  }
}
</style>
