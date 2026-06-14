<script setup lang="ts">
import { VIEWER_UNSUPPORTED_ID } from './test-ids'
import ViewerDownloadButton from './ViewerDownloadButton.vue'

defineProps<{
  readonly name: string
}>()

defineEmits<{
  download: []
}>()
</script>

<template>
  <div :data-testid="VIEWER_UNSUPPORTED_ID" class="unsupported">
    <span class="pictogram" aria-hidden="true">📄</span>
    <span class="filename">{{ name }}</span>
    <ViewerDownloadButton :name="name" @download="$emit('download')" />
  </div>
</template>

<style scoped>
.unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #fff;
  text-align: center;
}

.pictogram {
  font-size: 4rem;
  line-height: 1;
}

.filename {
  font-size: 1rem;
  word-break: break-all;
  max-width: 80vw;
}
</style>
