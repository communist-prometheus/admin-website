<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import type { NotificationEntry } from '@/stores/notifications'
import { scheduleAutoDismiss } from './auto-dismiss'
import { isStickyKind } from './is-sticky-kind'
import { TOAST_TEST_IDS } from './test-ids'

const props = defineProps<{ readonly entry: NotificationEntry }>()
const { dismiss } = useNotifications()

const onDismiss = (): void => {
  dismiss(props.entry.id)
}

const onCta = (): void => {
  props.entry.cta?.action()
  dismiss(props.entry.id)
}

let cancel: (() => void) | undefined
onMounted(() => {
  cancel = scheduleAutoDismiss(props.entry.kind, onDismiss)
})
onUnmounted(() => {
  cancel?.()
})
</script>

<template>
  <article
    :data-testid="TOAST_TEST_IDS.toast"
    :data-kind="entry.kind"
    :data-sticky="String(isStickyKind(entry.kind))"
    :class="['toast', `toast-kind-${entry.kind}`]"
    :role="isStickyKind(entry.kind) ? 'alert' : 'status'"
  >
    <strong :data-testid="TOAST_TEST_IDS.title" class="toast-title">
      {{ entry.title }}
    </strong>
    <span
      v-if="entry.message"
      :data-testid="TOAST_TEST_IDS.message"
      class="toast-message"
    >{{ entry.message }}</span>
    <button
      v-if="entry.cta"
      type="button"
      class="toast-cta"
      :data-testid="TOAST_TEST_IDS.cta"
      @click="onCta"
    >
      {{ entry.cta.label }}
    </button>
    <button
      type="button"
      class="toast-dismiss"
      :aria-label="`dismiss ${entry.kind} notification`"
      :data-testid="TOAST_TEST_IDS.dismiss"
      @click="onDismiss"
    >
      ×
    </button>
  </article>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #ddd);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  min-width: 240px;
  max-width: 360px;
}

.toast-kind-info { border-left: 3px solid #4fc3f7; }
.toast-kind-warn { border-left: 3px solid #ffb74d; }
.toast-kind-error { border-left: 3px solid #e57373; }
.toast-kind-conflict { border-left: 3px solid #ba68c8; }
.toast-kind-network { border-left: 3px solid #aed581; }

.toast-title {
  font-weight: 700;
  font-size: 0.875rem;
}

.toast-message {
  font-size: 0.8125rem;
  color: var(--color-text, #444);
}

.toast-cta {
  margin-left: auto;
  background: var(--color-accent, #4fc3f7);
  color: #fff;
  border: 0;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  min-height: 28px;
}

.toast-cta:hover,
.toast-cta:focus-visible {
  filter: brightness(110%);
  outline: none;
}

.toast-dismiss {
  background: transparent;
  border: 0;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
  min-width: 32px;
  min-height: 32px;
  border-radius: 4px;
  margin-left: auto;
}

.toast-cta + .toast-dismiss {
  margin-left: 0;
}

.toast-dismiss:hover,
.toast-dismiss:focus-visible {
  background: rgb(0 0 0 / 6%);
  outline: none;
}
</style>
