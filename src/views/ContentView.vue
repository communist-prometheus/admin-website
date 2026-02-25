<script setup lang="ts">
import { ref } from 'vue'
import FileTree from '@/components/FileTree/FileTree.vue'
import type { GitHubTreeItem } from '@/composables/useGitHubApi'

const props = defineProps<{
  readonly contentType: 'blog' | 'pages' | 'positions'
}>()

const rootPath = `src/content/${props.contentType}`
const selectedItem = ref<GitHubTreeItem | null>(null)

const handleSelect = (item: GitHubTreeItem) => {
  selectedItem.value = item
}
</script>

<template>
  <h1>{{ contentType }}</h1>
  <FileTree :root-path="rootPath" @select="handleSelect" />
  <p v-if="selectedItem">Selected: {{ selectedItem.path }}</p>
</template>

<style scoped>
:host {
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
