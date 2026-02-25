<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { GitHubTreeItem } from '@/composables/useGitHubApi'
import { useGitHubApi } from '@/composables/useGitHubApi'
import FileTreeItem from './FileTreeItem.vue'

const props = withDefaults(
  defineProps<{
    readonly rootPath?: string
  }>(),
  {
    rootPath: 'src/content',
  }
)

const emit = defineEmits<{
  select: [item: GitHubTreeItem]
}>()

const { getTree, loading, error } = useGitHubApi()
const items = ref<readonly GitHubTreeItem[]>([])
const selectedPath = ref<string | null>(null)

const message = computed(() => {
  if (loading.value) return 'Loading...'
  if (error.value) return `Error: ${error.value}`
  if (items.value.length === 0) return 'No files found'
  return null
})

const loadTree = async () => {
  try {
    const result = await getTree(props.rootPath)
    items.value = result.tree.filter(item => item.type === 'blob')
  } catch {
    // Error already captured in error ref from useGitHubApi
  }
}

const handleSelect = (path: string) => {
  selectedPath.value = path
  const item = items.value.find(i => i.path === path)
  if (item) {
    emit('select', item)
  }
}

onMounted(loadTree)
</script>

<template>
  <p v-if="message">{{ message }}</p>
  <FileTreeItem
    v-for="item in items"
    v-else
    :key="item.path"
    :item="item"
    :is-selected="selectedPath === item.path"
    @select="handleSelect"
  />
</template>

<style scoped>
:host {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  padding: clamp(0.5rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  max-height: 70vh;
  overflow-y: auto;
}

p {
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
  margin: 0;
}
</style>
