<script setup lang="ts">
import { ASSET_UPLOAD_ID } from './test-ids'
import UploadButton from './UploadButton.vue'

defineEmits<{
  upload: [file: File]
}>()
</script>

<template>
  <header class="panel-header">
    <h3>Assets</h3>
    <UploadButton
      label="Upload asset"
      accept="*/*"
      multiple
      :test-id="ASSET_UPLOAD_ID"
      @upload="$emit('upload', $event)"
    />
  </header>
</template>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

h3 {
  margin: 0;
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
