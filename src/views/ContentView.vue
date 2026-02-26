<script setup lang="ts">
import { ref, watch } from 'vue'
import FileTree from '@/components/FileTree/FileTree.vue'
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue'
import type { GitHubTreeItem } from '@/composables/useGitHubApi'
import { useGitHubApi } from '@/composables/useGitHubApi'

const props = defineProps<{
  readonly contentType: 'blog' | 'pages' | 'positions'
}>()

const rootPath = `src/content/${props.contentType}`
const { getFile, update, loading, error } = useGitHubApi()

const selectedItem = ref<GitHubTreeItem | null>(null)
const fileContent = ref('')
const fileSha = ref('')

const handleSelect = async (item: GitHubTreeItem) => {
  selectedItem.value = item
  try {
    const file = await getFile(item.path)
    fileContent.value = file.content
    fileSha.value = file.sha
  } catch {
    // Error handled by useGitHubApi
  }
}

const handleSave = async (message: string) => {
  if (!selectedItem.value) return
  try {
    await update(selectedItem.value.path, fileContent.value, message, fileSha.value)
  } catch {
    // Error handled by useGitHubApi
  }
}

watch(() => props.contentType, () => {
  selectedItem.value = null
  fileContent.value = ''
  fileSha.value = ''
})
</script>

<template>
  <div class="content-view">
    <h1>{{ contentType }}</h1>
    <FileTree :root-path="rootPath" @select="handleSelect" />
    <MarkdownEditor
      v-model="fileContent"
      :file-path="selectedItem?.path ?? null"
      @save="handleSave"
    />
    <p v-if="loading">Loading...</p>
    <p v-if="error">Error: {{ error }}</p>
  </div>
</template>

<style scoped>
.content-view {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
  height: 100vh;
}

h1 {
  grid-column: 1 / -1;
  margin: 0 0 clamp(1rem, 2vw, 1.5rem);
  font-size: clamp(1.5rem, 4vw, 2rem);
  text-transform: capitalize;
}

p {
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
