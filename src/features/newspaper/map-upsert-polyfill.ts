/*
 * Polyfill for the TC39 "Map upserts" proposal (Stage 4 in 2026).
 * pdfjs 5.6.205 calls `this[#fr].getOrInsertComputed(...)` on its
 * internal font registry; on engines that haven't shipped it yet
 * (Chrome <138 / V8 <13.4 etc.) cover extraction crashes with
 * "this[#fr].getOrInsertComputed is not a function" before the
 * first page even renders. We install a single implementation on
 * both Map and WeakMap prototypes — they share the get/set shape.
 *
 * Note: pdfjs never stores `undefined` as a value, so we treat
 * "get() === undefined" as "key absent" — fully spec-compliant for
 * the shapes pdfjs actually uses, and avoids casts the project
 * style forbids.
 */

interface UpsertTarget<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): unknown
}

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

const insertFresh = <K, V>(
  target: UpsertTarget<K, V>,
  key: K,
  fn: (k: K) => V
): V => {
  const fresh = fn(key)
  target.set(key, fresh)
  return fresh
}

const upsert = function <K, V>(
  this: UpsertTarget<K, V>,
  key: K,
  fn: (k: K) => V
): V {
  return this.get(key) ?? insertFresh(this, key, fn)
}

const installIfAbsent = (proto: object, value: object): boolean =>
  Reflect.has(proto, 'getOrInsertComputed') ||
  Reflect.defineProperty(proto, 'getOrInsertComputed', {
    value,
    writable: true,
    configurable: true,
  })

/**
 * Install the polyfill on Map.prototype + WeakMap.prototype if the
 * runtime is missing the methods. Idempotent and cheap to call.
 */
export const ensureMapUpsertPolyfill = (): void => {
  installIfAbsent(Map.prototype, upsert)
  installIfAbsent(WeakMap.prototype, upsert)
}
