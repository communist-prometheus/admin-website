import { deleteAllVersions } from '@/composables/useGitHubApi/delete-content'
import type { ContentType } from '@/types/content'

interface BulkDeleteDeps {
  readonly contentType: ContentType
  readonly pushAndTrack: (message: string) => Promise<string>
  readonly reload: () => Promise<void>
}

const buildMessage = (type: string, list: ReadonlyArray<string>): string =>
  list.length === 1
    ? `Delete all versions of ${type}/${list[0]}`
    : `Bulk delete ${list.length} ${type} items`

/**
 * Stage every delete in parallel, commit them all under a single
 * push+track call, then reload. Pulled out of runBulkDelete so the
 * top-level helper can stay a one-liner ternary (no `if` allowed by
 * the no-restricted-syntax rule).
 * @param deps - Content type + push+track + reload.
 * @param list - Slugs to delete.
 * @returns void
 */
const execBulk = async (
  deps: BulkDeleteDeps,
  list: ReadonlyArray<string>
): Promise<void> => {
  await Promise.all(list.map(s => deleteAllVersions(deps.contentType, s)))
  await deps.pushAndTrack(buildMessage(deps.contentType, list))
  await deps.reload()
}

/**
 * Bulk-delete entry point. Skips work when nothing is selected.
 * Otherwise delegates to execBulk: a single commit per call instead
 * of N commits, so the deploy log stays readable.
 * @param deps - Content type, push+track, reload.
 * @param slugs - Set of slugs to delete.
 * @returns void
 */
export const runBulkDelete = (
  deps: BulkDeleteDeps,
  slugs: ReadonlySet<string>
): Promise<void> =>
  slugs.size === 0 ? Promise.resolve() : execBulk(deps, [...slugs])
