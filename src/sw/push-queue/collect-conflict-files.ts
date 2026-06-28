import { filesFromError, filesFromStatus } from './merge-conflict-files'

/**
 * Resolve the conflicting file list, preferring the paths carried
 * on the error and falling back to a working-tree scan.
 * @param error Raw merge-conflict error.
 * @returns Paths of files in conflict.
 */
export const collectConflictFiles = async (
  error: unknown
): Promise<ReadonlyArray<string>> => {
  const fromError = filesFromError(error)
  return fromError.length > 0 ? fromError : await filesFromStatus()
}
