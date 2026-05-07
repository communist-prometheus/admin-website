/*
 * Polyfill for the TC39 "Map upserts" proposal (Stage 4 in 2026).
 * pdfjs 5.6.205 calls `this[#fr].getOrInsertComputed(...)` on its
 * internal font registry; on engines that haven't shipped it yet
 * (Chrome <138 / V8 <13.4 etc.) cover extraction crashes with
 * "this[#fr].getOrInsertComputed is not a function" before the
 * first page even renders. We install minimal implementations on
 * Map and WeakMap prototypes.
 *
 * Note: pdfjs never stores `undefined` as a value, so we treat
 * "get() === undefined" as "key absent" and skip the spec-exact
 * `has()` branch — it would force a cast (project forbids `as`).
 */

declare global {
  interface Map<K, V> {
    /**
     * Get the value at `key`, or insert and return `fn(key)` if absent.
     * @param key - lookup key
     * @param fn - factory invoked only when `key` is absent
     * @returns existing or freshly inserted value
     */
    getOrInsertComputed(key: K, fn: (k: K) => V): V
  }
  interface WeakMap<K extends WeakKey, V> {
    /**
     * Get the value at `key`, or insert and return `fn(key)` if absent.
     * @param key - lookup key
     * @param fn - factory invoked only when `key` is absent
     * @returns existing or freshly inserted value
     */
    getOrInsertComputed(key: K, fn: (k: K) => V): V
  }
}

const upsertMap = function <K, V>(
  this: Map<K, V>,
  key: K,
  fn: (k: K) => V
): V {
  const cached = this.get(key)
  if (cached !== undefined) return cached
  const fresh = fn(key)
  this.set(key, fresh)
  return fresh
}

const upsertWeakMap = function <K extends WeakKey, V>(
  this: WeakMap<K, V>,
  key: K,
  fn: (k: K) => V
): V {
  const cached = this.get(key)
  if (cached !== undefined) return cached
  const fresh = fn(key)
  this.set(key, fresh)
  return fresh
}

let installed = false

/**
 * Install the polyfill on Map.prototype + WeakMap.prototype if the
 * runtime is missing the methods. Idempotent and cheap to call.
 */
export const ensureMapUpsertPolyfill = (): void => {
  if (installed) return
  installed = true
  if (typeof Map.prototype.getOrInsertComputed !== 'function') {
    Map.prototype.getOrInsertComputed = upsertMap
  }
  if (typeof WeakMap.prototype.getOrInsertComputed !== 'function') {
    WeakMap.prototype.getOrInsertComputed = upsertWeakMap
  }
}
