import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Counter store with reactive count state and computed double value.
 * @returns Counter store instance with count, doubleCount, and increment
 */
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
