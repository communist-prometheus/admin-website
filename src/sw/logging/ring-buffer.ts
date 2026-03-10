import type { RingBuffer } from './ring-buffer-type'

export type { RingBuffer } from './ring-buffer-type'

/**
 * Create a ring buffer with the given capacity.
 * @param capacity - Maximum number of entries
 * @returns RingBuffer instance
 */
export const createRingBuffer = <T>(capacity: number): RingBuffer<T> => {
  const buf: T[] = Array.from({ length: capacity })
  let head = 0
  let count = 0

  return {
    push: (item: T) => {
      buf[head] = item
      head = (head + 1) % capacity
      if (count < capacity) count++
    },
    entries: () => {
      if (count < capacity) return buf.slice(0, count)
      return [...buf.slice(head, capacity), ...buf.slice(0, head)]
    },
    size: () => count,
    clear: () => {
      head = 0
      count = 0
    },
  }
}
