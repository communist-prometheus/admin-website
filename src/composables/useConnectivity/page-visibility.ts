import { ref } from 'vue'

const initialVisible =
  typeof document === 'undefined' ? true : !document.hidden

/** Module-shared visibility ref. True when the tab is visible. */
export const isPageVisible = ref<boolean>(initialVisible)

const supported = typeof document !== 'undefined'

const wire = (): void => {
  document.addEventListener('visibilitychange', () => {
    isPageVisible.value = !document.hidden
  })
}

const noop = (): void => undefined
;(supported ? wire : noop)()
