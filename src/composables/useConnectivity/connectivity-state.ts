import { ref } from 'vue'

const initialOnline =
  typeof navigator === 'undefined' ? true : navigator.onLine

/** Module-shared connectivity ref. True when the app considers
 * itself reachable; flipped by both `navigator.onLine` events and
 * the periodic heartbeat probe. */
export const isOnline = ref<boolean>(initialOnline)
