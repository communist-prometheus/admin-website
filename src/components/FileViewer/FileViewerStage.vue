<script setup lang="ts">
import FileViewerUnsupported from './FileViewerUnsupported.vue'
import { VIEWER_IMAGE_ID } from './test-ids'
import type { ViewerFile } from './types'
import { isViewable } from './viewer-nav'

const props = defineProps<{
  readonly file: ViewerFile
}>()

const emit = defineEmits<{
  download: []
  swipe: [deltaX: number]
}>()

const viewable = (): boolean => isViewable(props.file.mimeType) && !!props.file.url

let startX = 0

const onPointerDown = (e: PointerEvent): void => {
  startX = e.clientX
}

const onPointerUp = (e: PointerEvent): void => {
  emit('swipe', e.clientX - startX)
}
</script>

<template>
  <div
    class="stage"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <img
      v-if="viewable()"
      :key="file.url"
      :data-testid="VIEWER_IMAGE_ID"
      :src="file.url"
      alt=""
      :aria-label="file.name"
      decoding="async"
      draggable="false"
    />
    <FileViewerUnsupported
      v-else
      :name="file.name"
      @download="$emit('download')"
    />
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  -webkit-user-drag: none;
}
</style>
