<script setup lang="ts">
import PublishDialogCard from './PublishDialogCard.vue'
import { onKeyStroke } from './use-keystroke'

const props = defineProps<{
  readonly show: boolean
  readonly title: string
  readonly autoPublic: boolean
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

onKeyStroke('Escape', () => {
  if (props.show) emit('cancel')
})
</script>

<template>
  <section
    v-if="show"
    class="dialog-overlay"
    data-testid="publish-dialog"
    role="alertdialog"
    aria-labelledby="publish-dialog-title"
    @click.self="emit('cancel')"
  >
    <PublishDialogCard
      :title="title"
      :auto-public="autoPublic"
      @confirm="emit('confirm')"
      @cancel="emit('cancel')"
    />
  </section>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
  padding: 2rem;
}
</style>
