import type { Ref } from 'vue'
import type { TopicEntry } from '@/validation/schemas/topics'
import { saveTopicsFile } from './topics-api'

/**
 * Create updater that saves topics to the API.
 * @param topics - Reactive topics ref
 * @param fileSha - Reactive file SHA ref
 * @returns Async function that updates topics
 */
export const createUpdateTopics =
  (topics: Ref<readonly TopicEntry[]>, fileSha: Ref<string>) =>
  async (entries: readonly TopicEntry[]): Promise<boolean> => {
    const res = await saveTopicsFile(entries, fileSha.value)
    const commit = async (): Promise<void> => {
      topics.value = entries
      const data = await res.json()
      fileSha.value = data.content?.sha ?? fileSha.value
    }
    await (res.ok ? commit() : Promise.resolve())
    return res.ok
  }
