import type { Ref } from 'vue'
import type { TopicEntry } from '@/validation/schemas/topics'
import { fetchTopicsFile, parseTopics } from './topics-api'

/**
 * Create loader that fetches and parses topics.
 * @param topics - Reactive topics ref
 * @param fileSha - Reactive file SHA ref
 * @param loading - Reactive loading ref
 * @param loaded - Reactive loaded ref
 * @returns Async function that loads topics
 */
export const createLoadTopics =
  (
    topics: Ref<readonly TopicEntry[]>,
    fileSha: Ref<string>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>
  ) =>
  async (): Promise<void> => {
    loading.value = true
    try {
      const file = await fetchTopicsFile()
      topics.value = file ? parseTopics(file.content) : topics.value
      fileSha.value = file ? file.sha : fileSha.value
      loaded.value = true
    } finally {
      loading.value = false
    }
  }
