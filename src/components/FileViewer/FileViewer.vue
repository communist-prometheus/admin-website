<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { fireAndForward } from '@/utils/fire-and-forward'
import FileViewerStage from './FileViewerStage.vue'
import FileViewerToolbar from './FileViewerToolbar.vue'
import NavButton from './NavButton.vue'
import { VIEWER_ID, VIEWER_STATUS_ID } from './test-ids'
import type { ViewerFile } from './types'
import { moveIndex, swipeStep } from './viewer-nav'

const SWIPE_THRESHOLD_PX = 50

const props = defineProps<{
  readonly files: readonly ViewerFile[]
  readonly index: number
}>()

const emit = defineEmits<{
  close: []
  'update:index': [index: number]
  download: [index: number]
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const isFullscreen = ref(false)

const total = computed(() => props.files.length)
const current = computed((): ViewerFile | undefined => props.files[props.index])
const position = computed(() => `${props.index + 1} / ${total.value}`)
const statusText = computed(() =>
  current.value
    ? `File ${props.index + 1} of ${total.value}: ${current.value.name}`
    : ''
)
const atStart = computed(() => props.index <= 0)
const atEnd = computed(() => props.index >= total.value - 1)

const move = (step: number): void => {
  emit('update:index', moveIndex(props.index, step, total.value))
}

const onSwipe = (deltaX: number): void => {
  const step = swipeStep(deltaX, SWIPE_THRESHOLD_PX)
  if (step !== 0) move(step)
}

const syncFullscreen = (): void => {
  isFullscreen.value = document.fullscreenElement === dialog.value
}

const exitFullscreen = (): void => {
  if (document.fullscreenElement) fireAndForward(document.exitFullscreen())
}

const toggleFullscreen = (): void => {
  const el = dialog.value
  if (isFullscreen.value || !el) exitFullscreen()
  else fireAndForward(el.requestFullscreen())
}

const onKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'ArrowRight') move(1)
  else if (e.key === 'ArrowLeft') move(-1)
  else if (e.key === 'Escape') {
    e.preventDefault()
    if (isFullscreen.value) exitFullscreen()
    else emit('close')
  }
}

const onBackdrop = (e: MouseEvent): void => {
  if (e.target === dialog.value) emit('close')
}

onMounted(() => {
  dialog.value?.showModal()
  // Keydown on document, not the dialog: when a nav button disables at
  // an end it loses focus, and a dialog-scoped listener would then miss
  // the arrow keys. The viewer is the only thing up while mounted.
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', syncFullscreen)
  exitFullscreen()
})
</script>

<template>
  <dialog
    ref="dialog"
    :data-testid="VIEWER_ID"
    class="viewer"
    @cancel.prevent
    @click="onBackdrop"
  >
    <FileViewerToolbar
      :position="position"
      :fullscreen="isFullscreen"
      @close="$emit('close')"
      @toggle-fullscreen="toggleFullscreen"
    />
    <NavButton
      direction="prev"
      :disabled="atStart"
      @move="move(-1)"
    />
    <NavButton
      direction="next"
      :disabled="atEnd"
      @move="move(1)"
    />
    <FileViewerStage
      v-if="current"
      :file="current"
      @download="$emit('download', index)"
      @swipe="onSwipe"
    />
    <p
      :data-testid="VIEWER_STATUS_ID"
      class="sr-only"
      aria-live="polite"
    >
      {{ statusText }}
    </p>
  </dialog>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(0 0 0 / 88%);
  overflow: hidden;
}

.viewer::backdrop {
  background: rgb(0 0 0 / 88%);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
