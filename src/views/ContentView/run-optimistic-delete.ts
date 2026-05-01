import type { Ref } from 'vue'
import type { ContentItem } from '@/types/content'
import type { DeletingState } from './deleting-state'

interface RunOpts {
  readonly target: Ref<ContentItem | undefined>
  readonly deleting: DeletingState
  readonly clear: () => void
}

/**
 * Wrap a delete operation with the optimistic UX: close the dialog,
 * mark the slug as deleting (drives the fade), then await the
 * network call. Whether it succeeds (the reload drops the row) or
 * fails (the row stays for retry), the deleting flag is cleared so
 * the animation either completes against the removed row or
 * releases the row back to its normal state.
 * @param opts - Target ref + deleting set + dialog clear callback.
 * @param run - Async work; errors are surfaced upstream by Vue.
 * @returns void
 */
/**
 * Execute the delete network call for a known target with the
 * optimistic UX choreography (close dialog, mark slug as deleting,
 * unmark when settled).
 * @param opts - Target ref + deleting set + dialog clear callback.
 * @param item - The resolved target item.
 * @param run - Async work to await.
 * @returns void
 */
const exec = async (
  opts: RunOpts,
  item: ContentItem,
  run: (item: ContentItem) => Promise<void>
): Promise<void> => {
  opts.clear()
  opts.deleting.mark(item.slug)
  try {
    await run(item)
  } finally {
    opts.deleting.unmark(item.slug)
  }
}

/**
 * Wrap a delete operation with the optimistic UX. Resolves a no-op
 * promise when there is no target to delete; otherwise delegates to
 * exec.
 * @param opts - Target ref + deleting set + dialog clear callback.
 * @param run - Async work; errors are surfaced upstream by Vue.
 * @returns void
 */
export const runOptimisticDelete = (
  opts: RunOpts,
  run: (item: ContentItem) => Promise<void>
): Promise<void> => {
  const item = opts.target.value
  return item ? exec(opts, item, run) : Promise.resolve()
}
