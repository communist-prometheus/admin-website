import { validateAttachment } from '../api/attachment-validate'

/** Files that passed validation vs. their rejection reasons. */
export interface Partitioned {
  readonly accepted: readonly File[]
  readonly rejected: readonly string[]
}

const EMPTY: Partitioned = { accepted: [], rejected: [] }

const add = (
  p: Partitioned,
  file: File,
  reason: string | undefined
): Partitioned =>
  reason === undefined
    ? { accepted: [...p.accepted, file], rejected: p.rejected }
    : { accepted: p.accepted, rejected: [...p.rejected, reason] }

const reasonOf = (file: File): string | undefined => {
  const r = validateAttachment(file)
  return r.ok ? undefined : r.reason
}

/**
 * Split a batch into accepted files (passed validation) and the
 * human-readable rejection reasons for the rest.
 * @param files - Candidate attachments.
 * @returns The split — accepted Files plus rejection reasons.
 */
export const partition = (files: readonly File[]): Partitioned =>
  files.reduce<Partitioned>(
    (acc, file) => add(acc, file, reasonOf(file)),
    EMPTY
  )
