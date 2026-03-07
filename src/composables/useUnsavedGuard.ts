import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const UNSAVED_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave?'

const createBeforeUnloadHandler =
  () =>
  (event: BeforeUnloadEvent): void => {
    event.preventDefault()
  }

/**
 * Guards against losing unsaved changes on navigation or tab close
 * @param isDirty - Reactive flag indicating unsaved changes
 */
export const useUnsavedGuard = (isDirty: Ref<boolean>): void => {
  const handler = createBeforeUnloadHandler()

  onBeforeRouteLeave(() => {
    if (isDirty.value) {
      return globalThis.confirm(UNSAVED_MESSAGE)
    }
    return true
  })

  onMounted(() => {
    watch(
      isDirty,
      dirty => {
        if (dirty) {
          globalThis.addEventListener('beforeunload', handler)
        } else {
          globalThis.removeEventListener('beforeunload', handler)
        }
      },
      { immediate: true }
    )
  })

  onBeforeUnmount(() => {
    globalThis.removeEventListener('beforeunload', handler)
  })
}
