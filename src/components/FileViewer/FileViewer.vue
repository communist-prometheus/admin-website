<script setup lang="ts">
import { useTemplateRef } from 'vue'
import FileViewerStage from './FileViewerStage.vue'
import FileViewerToolbar from './FileViewerToolbar.vue'
import { exitFullscreen } from './fullscreen'
import NavButton from './NavButton.vue'
import { VIEWER_ID, VIEWER_STATUS_ID } from './test-ids'
import type { ViewerFile } from './types'
import { useFullscreen } from './use-fullscreen'
import { useViewerEvents } from './use-viewer-events'
import { handleViewerKey, useViewerState } from './viewer-logic'
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
const {
  isFullscreen,
  sync: syncFullscreen,
  toggle: toggleFullscreen,
} = useFullscreen(dialog)

const { total, current, position, statusText, atStart, atEnd } =
  useViewerState(
    () => props.files,
    () => props.index
  )

const move = (step: number): void => {
  emit('update:index', moveIndex(props.index, step, total.value))
}

const onSwipe = (deltaX: number): void => {
  const step = swipeStep(deltaX, SWIPE_THRESHOLD_PX)
  if (step !== 0) move(step)
}

const onKeydown = (e: KeyboardEvent): void =>
  handleViewerKey(e, move, () => emit('close'), isFullscreen.value)

const onBackdrop = (e: MouseEvent): void => {
  if (e.target === dialog.value) emit('close')
}

useViewerEvents(dialog, {
  onKeydown,
  onFullscreenChange: syncFullscreen,
  onUnmount: exitFullscreen,
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
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
