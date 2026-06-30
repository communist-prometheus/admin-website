/**
 * Minimal slice of the Cloudflare KV namespace this feature uses, hand-
 * rolled so the SPA typecheck needn't pull in the full
 * `@cloudflare/workers-types` globals — mirrors how `worker.ts` types
 * its `ASSETS` binding.
 */
export interface RolesKv {
  readonly get: <T>(key: string, type: 'json') => Promise<T | null>
  readonly put: (key: string, value: string) => Promise<void>
}
