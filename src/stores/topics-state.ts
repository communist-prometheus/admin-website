import { ref } from 'vue'
import type { TopicEntry } from '@/validation/schemas/topics'
import { createLoadTopics } from './topics-load'
import { createUpdateTopics } from './topics-update'

/**
 * Create the reactive state and actions for topics store.
 * @returns Store state, getters, and actions
 */
export const createTopicsState = () => {
  const topics = ref<readonly TopicEntry[]>([])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const loadTopics = createLoadTopics(topics, fileSha, loading, loaded)

  return {
    topics,
    fileSha,
    loading,
    loaded,
    loadTopics,
    updateTopics: createUpdateTopics(topics, fileSha),
  }
}
